//
//  WebRTCSignalingChannel.js
//
//  Created by David Rowe on 17 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// WebRTC signaling channel for establishing WebRTC data channels with the domain server and assignment clients - one signaling
// channel for all of them. All signaling messages are sent to the domain server which relays assignment client signaling
// messages as required.
// The API is similar to the WebSocket API.
class WebRTCSignalingChannel {

    /* eslint-disable no-magic-numbers */

    // ReadyState values.
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    /* eslint-enable no-magic-numbers */

    #websocket = null;

    constructor(websocketURL) {
        if (typeof websocketURL !== "string" || websocketURL === "") {
            console.error("WebRTCSignalingChannel: Invalid WebSocket URL!");
        }
        this.#websocket = new WebSocket(websocketURL);
    }

    /* eslint-disable accessor-pairs */

    get readyState() {
        return this.#websocket ? this.#websocket.readyState : WebRTCSignalingChannel.CLOSED;
    }

    // Connect a single listener to the open event.
    set onopen(callback) {
        this.#websocket.onopen = callback;
    }

    static #handleMessage(message, callback) {
        try {
            const json = JSON.parse(message);
            callback(json);
        } catch (e) {
            console.error("WbRTCSignalingChannel: Invalid message received!");
        }
    }

    // Connect a single listener to the message event.
    set onmessage(callback) {
        this.#websocket.onmessage = function (event) {
            WebRTCSignalingChannel.#handleMessage(event.data, callback);
        };
    }

    // Connect a single listener to the close event.
    set onclose(callback) {
        this.#websocket.onclose = callback;
    }

    // Connect a single listener to the error event.
    set onerror(callback) {
        this.#websocket.onerror = callback;
    }

    /* eslint-enable accessor-pairs */

    addEventListener(eventName, callback) {
        this.#websocket.addEventListener(eventName, function (event) {
            switch (event.type) {
                case "message":
                    WebRTCSignalingChannel.#handleMessage(event.data, callback);
                    break;
                case "open":
                case "error":
                case "close":
                default:
                    callback();
                    break;
            }
        });
    }

    send(message) {
        if (this.readyState === WebRTCSignalingChannel.OPEN) {
            this.#websocket.send(JSON.stringify(message));
        } else {
            console.error("WebRTCSignalingChannel: Channel not open for sending!");
            if (this.#websocket.onerror) {
                this.#websocket.onerror("Channel not open for sending!");
            }
        }
    }

    close() {
        this.#websocket.close();
        // WEBRTC FIXME: Set #websocket = null once the WebSocket has closed.
    }

}

export default WebRTCSignalingChannel;
