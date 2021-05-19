//
//  SignalingChannel.js
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
class SignalingChannel {

    /* eslint-disable no-magic-numbers */

    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    /* eslint-enable no-magic-numbers */

    #websocket;

    constructor(websocketURL) {
        if (typeof websocketURL !== "string" || websocketURL === "") {
            console.error("SignalingChannel: Invalid WebSocket URL!");
        }
        this.#websocket = new WebSocket(websocketURL);
    }

    /* eslint-disable accessor-pairs */

    get readyState() {
        return this.#websocket.readyState;
    }

    set onopen(callback) {
        this.#websocket.onopen = callback;
    }

    set onclose(callback) {
        this.#websocket.onclose = callback;
    }

    set onerror(callback) {
        this.#websocket.onerror = callback;
    }

    set onmessage(callback) {
        this.#websocket.onmessage = function (message) {
            try {
                const json = JSON.parse(message.data);
                callback(json);
            } catch (e) {
                console.error("SignalingChannel: Invalid reply received!");
                if (this.#websocket.onerror) {
                    this.#websocket.onerror("Invalid reply received!");
                }
            }
        };
    }

    /* eslint-enable accessor-pairs */

    send(message) {
        if (this.#websocket.readyState === SignalingChannel.OPEN) {
            this.#websocket.send(JSON.stringify(message));
        } else {
            console.error("SignalingChannel: Channel not open for sending!");
            if (this.#websocket.onerror) {
                this.#websocket.onerror("Channel not open for sending!");
            }
        }
    }

    close() {
        this.#websocket.close();
    }

}

export default SignalingChannel;
