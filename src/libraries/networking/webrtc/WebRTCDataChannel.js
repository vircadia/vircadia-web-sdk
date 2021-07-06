//
//  WebRTCDataChannel.js
//
//  Created by David Rowe on 21 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeType from "../NodeType.js";
import WebRTCSignalingChannel from "./WebRTCSignalingChannel.js";

/*@devdoc
 *  A WebRTC data channel used for Vircadia protocol communications with a domain server or assignment client. Uses a
 *  {@link WebRTCSignalingChannel} in the process of establishing the WebRTC connection.
 *  <p>The API is similar to the WebRTCSignalingChannel and WebSocket APIs.</p>
 *  <p>C++: Akin to <code>WebRTCDataChannels</code> though significantly different.
 *
 *  @class WebRTCDataChannel
 *  @param {NodeType} nodeType - The node type to connect to.
 *  @param {WebRTCSignalingChannel} signalingChannel - The WebRTCSignalingChannel to use in establishing the WebRTC connection
 *      and data channel.
 *
 *  @property {WebRTCDataChannel.ReadyState} CONNECTING=0 - The connection is opening. <em>Static.</em> <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 *  @property {WebRTCDataChannel.ReadyState} OPEN=1 - The connection is open. <em>Static.</em> <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 *  @property {WebRTCDataChannel.ReadyState} CLOSING=2 - The connection is closing. <em>Static.</em> <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 *  @property {WebRTCDataChannel.ReadyState} CLOSED=3 - The connection is closed. <em>Static.</em> <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 *  @property {WebRTCDataChannel.ReadyState} readyState - The current state of the data channel connection. <em>Read-only.</em>
 *
 *  @property {WebRTCDataChannel~onOpenCallback} onopen - Sets a single function to be called when the data channel opens.
 *      <em>Write-only.</em>
 *  @property {WebRTCDataChannel~onMessageCallback} onmessage - Sets a single function to be called when a message is
 *      received. <em>Write-only.</em>
 *  @property {WebRTCDataChannel~onErrorCallback} onerror - Sets a single function to be called when an error occurs.
 *      <em>Write-only.</em>
 *  @property {WebRTCDataChannel~onCloseCallback} onclose - Set s a single function to be called when the data channel closes.
 *      <em>Write-only.</em>
 */
class WebRTCDataChannel {

    /* eslint-disable no-magic-numbers */

    /*@devdoc
     *  The state of a WebRTCDataChannel connection.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>CONNECTING</td><td>0</td><td>The connection is opening.</td></tr>
     *          <tr><td>OPEN</td><td>1</td><td>The connection is open.</td></tr>
     *          <tr><td>CLOSING</td><td>2</td><td>The connection is closing.</td></tr>
     *          <tr><td>CLOSED</td><td>3</td><td>The connection is closed.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} WebRTCDataChannel.ReadyState
     */
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    /* eslint-enable no-magic-numbers */

    static #CONFIGURATION = {
        iceServers: [{ urls: "stun:ice.vircadia.com:7337" }]
    };

    #_nodeType = NodeType.Unassigned;
    #_signalingChannel = null;

    #_peerConnection = null;
    #_dataChannel = null;
    #_readyState = WebRTCDataChannel.CLOSED;

    #_onopenCallback = null;
    #_onmessageCallback = null;
    #_oncloseCallback = null;
    #_onerrorCallback = null;


    constructor(nodeType, signalingChannel) {
        this.#_nodeType = nodeType;
        this.#_signalingChannel = signalingChannel;
        this.#_readyState = WebRTCDataChannel.CONNECTING;
        setTimeout(() => {
            // Defer connecting by scheduling it in the event queue, so that WebRTCDataChannel event handlers can be hooked up
            // immediately after the object is created.
            this.#connect();
        }, 0);
    }

    /* eslint-disable accessor-pairs */

    // Gets the type of node connected to.
    get nodeType() {
        return this.#_nodeType;
    }

    // Gets the state of the data channel connection.
    get readyState() {
        return this.#_readyState;
    }

    /*@devdoc
     *  Called when the data channel opens.
     *  @callback WebRTCDataChannel~onOpenCallback
     */
    set onopen(callback) {
        this.#_onopenCallback = callback;
    }

    /*@devdoc
     *  Called when a message is received.
     *  @callback WebRTCDataChannel~onMessageCallback
     *  @param {ArrayBuffer|ArrayBufferView|Blob|USVString} message - The message received.
     */
    set onmessage(callback) {
        this.#_onmessageCallback = callback;
    }

    /*@devdoc
     *  Called when the data channel closes.
     *  @callback WebRTCDataChannel~onCloseCallback
     */
    set onclose(callback) {
        this.#_oncloseCallback = callback;
    }

    /*@devdoc
     *  Called when there's an error in the data channel.
     *  @callback WebRTCDataChannel~onErrorCallback
     */
    set onerror(callback) {
        this.#_onerrorCallback = callback;
    }

    /* eslint-enable accessor-pairs */

    /*@devdoc
     *  <strong class="important">Not implemented.</strong>
     *  @param {string} eventName
     *  @param {function} callback
     */
    /* eslint-disable no-unused-vars, class-methods-use-this */
    addEventListener(event, handler) {
        const errorMessage = "WebRTCDataChannel.addEventListener(): Not implemented!";
        console.error(errorMessage);
        if (this.#_onerrorCallback) {
            this.#_onerrorCallback(errorMessage);
        }
    }
    /* eslint-enable no-unused-vars, class-methods-use-this */

    // Starts making a WebRTC connection.
    #start() {

        // Create new peer connection object.
        this.#_peerConnection = new RTCPeerConnection(WebRTCDataChannel.#CONFIGURATION);

        // Send ICE candidates to the domain server.
        this.#_peerConnection.onicecandidate = ({ candidate }) => {
            if (candidate  // The candidate is sometimes null for unknown reasons; don't send this.
                    && this.#_signalingChannel.readyState === WebRTCSignalingChannel.OPEN) {
                this.#_signalingChannel.send({ to: this.#_nodeType, data: candidate });
            }
        };

        // Generate an offer.
        this.#_peerConnection.onnegotiationneeded = async () => {
            if (this.#_signalingChannel.readyState !== WebRTCSignalingChannel.OPEN) {
                return;
            }
            try {
                // Create offer.
                const offer = await this.#_peerConnection.createOffer();
                await this.#_peerConnection.setLocalDescription(offer);

                // Send offer to domain server.
                this.#_signalingChannel.send({
                    to: this.#_nodeType,
                    data: { description: this.#_peerConnection.localDescription }
                });
            } catch (err) {
                const errorMessage = "WebRTCDataChannel: Error during offer negotiation: " + err;
                console.error(errorMessage);
                if (this.#_onerrorCallback) {
                    this.#_onerrorCallback(errorMessage);
                }
            }
        };

        // Observe connection state changes.
        this.#_peerConnection.onconnectionstatechange = () => {
            let errorMessage = "";
            switch (this.#_peerConnection.connectionState) {
                case "new":
                case "connecting":
                    // The connection is being established.
                    this.#_readyState = WebRTCDataChannel.CONNECTING;
                    break;
                case "connected":
                    // The connection has become fully connected.
                    // However, #_readyState isn't set to OPEN until the data channel has been connected.
                    break;
                case "disconnected":
                case "failed":
                case "closed":
                    // One or more transports has terminated or is in error.
                    this.#_readyState = WebRTCDataChannel.CLOSED;
                    this.#_peerConnection = null;
                    if (this.#_oncloseCallback) {
                        this.#_oncloseCallback();
                    }
                    break;
                default:
                    // Unexpected condition.
                    errorMessage = "WebRTCDataChannel: Unexpected connection state: "
                        + this.#_peerConnection.connectionState;
                    console.error(errorMessage);
                    if (this.#_onerrorCallback) {
                        this.#_onerrorCallback(errorMessage);
                    }
            }
        };

        // Create the data channel.
        // ordered = false and maxRetransmits = 0 creates an unreliable and unordered data channel, like UDP.
        this.#_dataChannel = this.#_peerConnection.createDataChannel("label", {
            protocol: "protocol",
            negotiated: false,
            ordered: false,
            maxRetransmits: 0
        });
        this.#_dataChannel.onopen = () => {
            this.#_readyState = WebRTCDataChannel.OPEN;
            if (this.#_onopenCallback) {
                this.#_onopenCallback();
            }
        };
        this.#_dataChannel.onmessage = ({ data }) => {
            if (this.#_onmessageCallback) {
                this.#_onmessageCallback(data);
            }
        };
        this.#_dataChannel.onclosing = () => {
            this.#_readyState = WebRTCDataChannel.CLOSING;
        };
        this.#_dataChannel.onclose = () => {
            this.#_readyState = WebRTCDataChannel.CLOSING;  // CLOSED state is deferred until the peer connection is closed.
            this.#_dataChannel = null;
            this.#_peerConnection.close();
        };

    }  // #start

    // Instigates the WebRTC connection process.
    #connect() {

        // Signaling channel must be open.
        if (this.#_signalingChannel.readyState !== WebRTCSignalingChannel.OPEN) {
            this.#_readyState = WebRTCDataChannel.CLOSED;
            const errorMessage = "WebRTCDataChannel: Signaling channel not open!";
            console.error(errorMessage);
            if (this.#_onerrorCallback) {
                this.#_onerrorCallback(errorMessage);
            }
            return;
        }

        // Respond to signaling channel messages.
        this.#_signalingChannel.addEventListener("message", async ({ from, data, echo }) => {
            const description = data ? data.description : null;
            const candidate = data ? data.candidate : null;

            // Ignore messages not directed at this data channel.
            if (from !== this.#_nodeType) {
                return;
            }

            // Start a new peer connection if necessary.
            if (!this.#_peerConnection && (description || candidate)) {
                this.#start();
            }

            try {
                if (description) {
                    // Add remote connection information to peer connection.
                    await this.#_peerConnection.setRemoteDescription(description);

                    // We got an offer; reply with an answer.
                    if (description.type === "offer") {
                        await this.#_peerConnection.setLocalDescription();
                        this.#_signalingChannel.send({
                            description: this.#_peerConnection.localDescription
                        });
                    }
                } else if (candidate) {
                    // Add ICE candidate to peer connection.
                    await this.#_peerConnection.addIceCandidate(candidate);
                } else if (echo) {
                    // Ignore signaling channel "echo" messages.
                    // Nothing to do.
                } else {
                    // Unexpected message.
                    const errorMessage = "WebRTCDataChannel: Unexpected signaling channel message!";
                    console.error(errorMessage);
                    if (this.#_onerrorCallback) {
                        this.#_onerrorCallback(errorMessage);
                    }
                }
            } catch (err) {
                const errorMessage = "WebRTCDataChannel: Error processing signaling channel message!";
                console.error(errorMessage);
                if (this.#_onerrorCallback) {
                    this.#_onerrorCallback(errorMessage);
                }
            }
        });

        // Start the WebRTC connection process.
        this.#start();

    }  // #connect

    /*@devdoc
     *  Sends a message to the domain server or an assignment client on the data channel.
     *  <p>Note: The domain server or assignment client bounces echo requests &mdash; a message starting with
     *  <code>"echo:"</code> &mdash; back for testing purposes.</p>
     *  @param {ArrayBuffer|ArrayBufferView|Blob|USVString} message - The message to send.
     *  @returns {boolean} <code>true</code> if the message was sent, <code>false</code) if the message wasn't sent (e.g.,
     *      because the signaling channel isn't open).
     */
    send(message) {
        if (this.#_readyState === WebRTCDataChannel.OPEN) {
            this.#_dataChannel.send(message);
            return true;
        }

        const errorMessage = "WebRTCDataChannel: Data channel not open for sending!";
        console.error(errorMessage);
        if (this.#_onerrorCallback) {
            this.#_onerrorCallback(errorMessage);
        }
        return false;
    }

    /*@devdoc
     *  Closes the data channel.
     */
    close() {
        this.#_readyState = WebRTCDataChannel.CLOSING;
        if (this.#_dataChannel) {
            this.#_dataChannel.close();  // Closes the peer connection.
        } else if (this.#_peerConnection) {
            this.#_peerConnection.close();
        } else {
            this.#_readyState = WebRTCDataChannel.CLOSED;
            this.#_dataChannel = null;
            this.#_peerConnection = null;
        }
    }

}

export default WebRTCDataChannel;
