//
//  WebRTCDataChannel.js
//
//  WebRTC connection and data channel to the domain server or an assignment client. (Each uses their own WebRTC connection.)
//
//  Created by David Rowe on 21 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals RTCPeerConnection */

import NodeType from "../NodeType.js";
import WebRTCSignalingChannel from "./WebRTCSignalingChannel.js";

// WebRTCDataChannel used for Vircadia protocol communications with a domain server or assignment client. Uses a
// WebRTCSignalingChannel in the process of establishing the WebRTC connection.
// The API is similar to the WebRTCSignalingChannel and WebSocket APIs.
class WebRTCDataChannel {

    /* eslint-disable no-magic-numbers */

    // ReadyState values.
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
        setTimeout(this.#connect.bind(this), 1);  // Delay connecting so that event handlers can be hooked up.
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

    // Connect a single listener to the open event.
    set onopen(callback) {
        this.#_onopenCallback = callback;
    }

    // Connect a single listener to the message event.
    set onmessage(callback) {
        this.#_onmessageCallback = callback;
    }

    // Connect a single listener to the close event.
    set onclose(callback) {
        this.#_oncloseCallback = callback;
    }

    // Connect a single listener to the error event.
    set onerror(callback) {
        this.#_onerrorCallback = callback;
    }

    /* eslint-enable accessor-pairs */

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

    // Sends a message on the data channel.
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

    // Closes the data channel and connection.
    close() {
        this.#_readyState = WebRTCDataChannel.CLOSING;
        if (this.#_dataChannel) {
            this.#_dataChannel.close();
        }
        if (this.#_peerConnection) {
            this.#_peerConnection.close();
        } else {
            this.#_readyState = WebRTCDataChannel.CLOSED;
            this.#_dataChannel = null;
            this.#_peerConnection = null;
        }
    }

}

export default WebRTCDataChannel;
