//
//  WebRTCDataChannel.ts
//
//  Created by David Rowe on 21 May 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeType, { NodeTypeValue } from "../NodeType";
import WebRTCSignalingChannel, { SignalingMessage } from "./WebRTCSignalingChannel";
import assert from "../../shared/assert";


type OnOpenCallback = () => void;
type OnMessageCallback = (data: ArrayBuffer) => void;
type OnCloseCallback = () => void;
type OnErrorCallback = (message: string) => void;


/*@devdoc
 *  The <code>WebRTCDataChannel</code> class provides a WebRTC data channel used for Vircadia protocol communications with a
 *  domain server or assignment client. It uses a {@link WebRTCSignalingChannel} in the process of establishing the WebRTC
 *  connection.
 *  <p>The API is similar to the WebRTCSignalingChannel and WebSocket APIs.</p>
 *  <p>C++: Akin to <code>WebRTCDataChannels</code> though significantly different.
 *
 *  @class WebRTCDataChannel
 *  @param {NodeType} nodeType - The node type to connect to.
 *  @param {WebRTCSignalingChannel} signalingChannel - The WebRTCSignalingChannel to use in establishing the WebRTC connection
 *      and data channel.
 *
 *  @property {WebRTCDataChannel.ReadyState} CONNECTING=0 - The connection is opening.
 *      <em>Static. Read-only.</em>
 *  @property {WebRTCDataChannel.ReadyState} OPEN=1 - The connection is open.
 *      <em>Static. Read-only.</em>
 *  @property {WebRTCDataChannel.ReadyState} CLOSING=2 - The connection is closing.
 *      <em>Static. Read-only.</em>
 *  @property {WebRTCDataChannel.ReadyState} CLOSED=3 - The connection is closed.
 *      <em>Static. Read-only.</em>
 *  @property {WebRTCDataChannel.ReadyState} readyState - The current state of the data channel connection.
 *      <em>Read-only.</em>
 *
 *  @property {number} id -  The data channel ID. The SDK assigns a unique number to each WebRTC data channel, starting at
 *      <code>1</code>.
 *
 *  @property {WebRTCDataChannel~onOpenCallback} onopen - Sets a single function to be called when the data channel opens.
 *      <em>Write-only.</em>
 *  @property {WebRTCDataChannel~onMessageCallback} onmessage - Sets a single function to be called when a message is
 *      received.
 *      <em>Write-only.</em>
 *  @property {WebRTCDataChannel~onErrorCallback} onerror - Sets a single function to be called when an error occurs.
 *      <em>Write-only.</em>
 *  @property {WebRTCDataChannel~onCloseCallback} onclose - Set s a single function to be called when the data channel closes.
 *      <em>Write-only.</em>
 */
class WebRTCDataChannel {
    // C++  Related to WebRTCDataChannels but significantly different.

    /*@devdoc
     *  Called when the data channel opens.
     *  @callback WebRTCDataChannel~onOpenCallback
     */

    /*@devdoc
     *  Called when a message is received.
     *  @callback WebRTCDataChannel~onMessageCallback
     *  @param {ArrayBuffer} message - The message received.
     */

    /*@devdoc
     *  Called when the data channel closes.
     *  @callback WebRTCDataChannel~onCloseCallback
     */

    /*@devdoc
     *  Called when there's an error in the data channel.
     *  @callback WebRTCDataChannel~onErrorCallback
     *  @param {string} message - The error message.
     */


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
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    static readonly #CONFIGURATION = {
        // WEBRTC TODO: Make configurable in the API.
        // FIXME: stun:ice.vircadia.com:7337 doesn't work for WebRTC.
        // Firefox warns: "WebRTC: Using more than two STUN/TURN servers slows down discovery"
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun4.l.google.com:19302"
                ]
            }
        ]
    };


    #_nodeType = NodeType.Unassigned;
    #_nodeTypeName = "";
    #_signalingChannel: WebRTCSignalingChannel | null = null;

    #_peerConnection: RTCPeerConnection | null = null;
    #_offer: RTCSessionDescriptionInit | null = null;
    #_haveSetRemoteDescription = false;
    #_dataChannel: RTCDataChannel | null = null;
    #_dataChannelID = 0;
    #_readyState = WebRTCDataChannel.CLOSED;

    #_onopenCallback: OnOpenCallback | null = null;
    #_onmessageCallback: OnMessageCallback | null = null;
    #_oncloseCallback: OnCloseCallback | null = null;
    #_onerrorCallback: OnErrorCallback | null = null;

    #_DEBUG = false;


    constructor(nodeType: NodeTypeValue, signalingChannel: WebRTCSignalingChannel) {
        this.#_nodeType = nodeType;
        this.#_nodeTypeName = NodeType.getNodeTypeName(nodeType);
        this.#_signalingChannel = signalingChannel;
        this.#_readyState = WebRTCDataChannel.CONNECTING;
        setTimeout(() => {
            // Defer connecting by scheduling it in the event queue, so that WebRTCDataChannel event handlers can be hooked up
            // immediately after the object is created.
            this.#connect();
        }, 0);
    }


    get nodeType(): NodeTypeValue {
        return this.#_nodeType;
    }

    get readyState(): number {
        return this.#_readyState;
    }

    set id(id: number) {
        this.#_dataChannelID = id;
    }

    get id(): number {
        return this.#_dataChannelID;
    }

    set onopen(callback: OnOpenCallback) {
        this.#_onopenCallback = callback;
    }

    set onmessage(callback: OnMessageCallback) {
        this.#_onmessageCallback = callback;
    }

    set onclose(callback: OnCloseCallback) {
        this.#_oncloseCallback = callback;
    }

    set onerror(callback: OnErrorCallback) {
        this.#_onerrorCallback = callback;
    }


    /*@devdoc
     *  <strong class="important">Not implemented.</strong>
     *  @param {string} eventName - <code>"open"</code>, <code>"message"</code>, <code>"error"</code>, or <code>"close"</code>.
     *  @param {WebRTCDataChannel~onOpenCallback|WebRTCDataChannel~onMessageCallback|WebRTCDataChannel~onCloseCallback
     *      |WebRTCDataChannel~onErrorCallback} callback
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line
    addEventListener(event: string, callback: OnOpenCallback | OnMessageCallback | OnCloseCallback | OnErrorCallback): void {
        const errorMessage = "WebRTCDataChannel.addEventListener(): Not implemented!";
        console.error(errorMessage);
        if (this.#_onerrorCallback) {
            this.#_onerrorCallback(errorMessage);
        }
    }

    /*@devdoc
     *  Sends a message to the domain server or an assignment client on the data channel.
     *  <p>Note: The domain server or assignment client bounces echo requests &mdash; a message starting with
     *  <code>"echo:"</code> &mdash; back for testing purposes.</p>
     *  @param {ArrayBuffer|ArrayBufferView|Blob|string} message - The message to send.
     *  @returns {boolean} <code>true</code> if the message was sent, <code>false</code) if the message wasn't sent (e.g.,
     *      because the signaling channel isn't open).
     */
    send(message: ArrayBuffer | ArrayBufferView | Blob | string): boolean {
        if (this.#_dataChannel && this.#_readyState === WebRTCDataChannel.OPEN) {
            this.#_dataChannel.send(<any>message);  // eslint-disable-line @typescript-eslint/no-explicit-any
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
    close(): void {
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


    // Starts making a WebRTC connection.
    async #start(): Promise<void> {

        assert(this.#_signalingChannel !== null);

        // Create new peer connection object.
        this.#_peerConnection = new RTCPeerConnection(WebRTCDataChannel.#CONFIGURATION);

        // Send ICE candidates to the domain server.
        this.#_peerConnection.onicecandidate = ({ candidate }) => {
            if (this.#_DEBUG) {
                console.debug(`[webrtc] [${this.#_nodeTypeName}] Obtained ICE candidate.`);
            }
            if (candidate  // The candidate is sometimes null; don't send this but do send empty string.
                && this.#_signalingChannel && this.#_signalingChannel.readyState === WebRTCSignalingChannel.OPEN) {
                if (this.#_DEBUG) {
                    console.debug(`[webrtc] [${this.#_nodeTypeName}] Send ICE candidate.`);
                }
                this.#_signalingChannel.send({ to: this.#_nodeType, data: { candidate } });
            }
        };

        // Observe connection state changes.
        this.#_peerConnection.onconnectionstatechange = () => {
            if (this.#_DEBUG) {
                console.debug(`[webrtc] [${this.#_nodeTypeName}] Connection state changed:`,
                    this.#_peerConnection?.connectionState);
            }
            let errorMessage = "";
            switch (this.#_peerConnection ? this.#_peerConnection.connectionState : "nopeer") {
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
                case "nopeer":
                    // There is no peer connection.
                    // The connection will already have been closed so ignore.
                    break;
                default:
                    // Unexpected condition.
                    errorMessage = "WebRTCDataChannel: Unexpected connection state: "
                        + (this.#_peerConnection ? this.#_peerConnection.connectionState : "undefined");
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
        this.#_dataChannel.binaryType = "arraybuffer";
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
        // FIXME: Enable the following code once RTCDataChannel.onclosing is defined in lib.dom.d.ts.
        /*
        this.#_dataChannel.onclosing = () => {
            this.#_readyState = WebRTCDataChannel.CLOSING;
        };
        */
        this.#_dataChannel.onclose = () => {
            this.#_readyState = WebRTCDataChannel.CLOSING;  // CLOSED state will happen when the peer connection is closed.
            this.#_dataChannel = null;
            if (this.#_peerConnection) {
                this.#_peerConnection.close();
            }
        };

        // Create offer.
        if (this.#_DEBUG) {
            console.debug(`[webrtc] [${this.#_nodeTypeName}] Create offer.`);
        }
        const rtcOfferOptions = {
            offerToReceiveAudio: false,
            offerToReceiveVideo: false
        };
        this.#_offer = await this.#_peerConnection.createOffer(rtcOfferOptions);
        // Don't set the local description until we have the remote answer because setting the local description triggers ICE
        // candidate gathering and the remote isn't ready to handle them yet.
        this.#_haveSetRemoteDescription = false;

        // Send offer to domain server.
        if (this.#_DEBUG) {
            console.debug(`[webrtc] [${this.#_nodeTypeName}] Send offer.`);
        }
        this.#_signalingChannel.send({
            to: this.#_nodeType,
            data: { description: this.#_offer }
        });

    }  // start

    // Instigates the WebRTC connection process.
    #connect(): void {

        // Signaling channel must be open.
        if (!this.#_signalingChannel || this.#_signalingChannel.readyState !== WebRTCSignalingChannel.OPEN) {
            this.#_readyState = WebRTCDataChannel.CLOSED;
            const errorMessage = "WebRTCDataChannel: Signaling channel not open!";
            console.error(errorMessage);
            if (this.#_onerrorCallback) {
                this.#_onerrorCallback(errorMessage);
            }
            return;
        }

        // Respond to signaling channel messages.
        this.#_signalingChannel.addEventListener("message", ({ from, data, echo }: SignalingMessage) => {
            (async () => {
                const description = data ? <RTCSessionDescriptionInit>data["description"] : null;
                const candidate = data ? <RTCIceCandidateInit>data["candidate"] : null;

                // Ignore messages not directed at this data channel.
                if (from !== this.#_nodeType) {
                    return;
                }

                try {
                    if (description) {
                        if (this.#_DEBUG) {
                            console.debug(`[webrtc] [${this.#_nodeTypeName}] Received description.`);
                        }

                        if (!this.#_peerConnection) {
                            const errorMessage = "WebRTCDataChannel: Peer connection is closed!";
                            console.error(errorMessage);
                            if (this.#_onerrorCallback) {
                                this.#_onerrorCallback(errorMessage);
                            }
                            return;
                        }

                        // We got an answer.
                        if (this.#_DEBUG) {
                            console.debug(`[webrtc] [${this.#_nodeTypeName}] Description is ${description.type}.`);
                        }
                        if (description.type === "answer" && this.#_signalingChannel) {
                            assert(this.#_offer !== null);

                            // The server is ready to handle ICE candidates so set we can set the local description now.
                            await this.#_peerConnection.setLocalDescription(this.#_offer);

                            await this.#_peerConnection.setRemoteDescription(description);
                            this.#_haveSetRemoteDescription = true;
                        } else {
                            const errorMessage = `WebRTCDataChannel: Unexpected answer! ${description.type}`;
                            console.error(errorMessage);
                            if (this.#_onerrorCallback) {
                                this.#_onerrorCallback(errorMessage);
                            }
                        }
                    } else if (candidate) {
                        // Add ICE candidate to the peer connection.
                        // Don't set unless the remote description has been set, otherwise an error is generated. The first ICE
                        // candidate from the server may arrive before the remote description has been set because of the delay
                        // introduced by setting the local description just before setting the remote description.
                        if (this.#_DEBUG) {
                            console.debug(`[webrtc] [${this.#_nodeTypeName}] Received ICE candidate.`);
                        }
                        if (this.#_peerConnection && this.#_haveSetRemoteDescription) {
                            await this.#_peerConnection.addIceCandidate(candidate);
                        } else if (this.#_DEBUG) {
                            console.debug(`[webrtc] [${this.#_nodeTypeName}] Skipped adding ICE candidate.`);
                        }
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
            })();
        });

        // Start the WebRTC connection process.
        void this.#start();

    }  // #connect

}

export default WebRTCDataChannel;
