//
//  SocketType.ts
//
//  Created by David Rowe on 1 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  A {@link SocketType(1)|socket type} is the type of network {@link Socket} used for Vircadia protocol communications:
 *  <code>WebRTC</code>, <code>UDP</code>, or <code>Unknown</code>. Socket type values are represented as 8-bit numbers
 *  in the protocol packets.
 *  @typedef {number} SocketType
 */
const enum SocketTypeValue {
    // C++  SocketType : uint8_t
    Unknown = 0,
    UDP = 1,
    WebRTC = 2
}


/*@devdoc
 *  The <code>SocketType</code> namespace provides information on a the types of network {@link Socket} used for Vircadia
 *  protocol communications. In this SDK, only <code>WebRTC</code> sockets are used.
 *  <p>C++: <code>SocketType</code></p>
 *
 *  @namespace SocketType
 *  @variation 1
 *
 *  @property {SocketType} Unknown - <code>0</code> - Unknown socket type.
 *  @property {SocketType} UDP - <code>1</code> - UDP socket. Not used in the Vircadia Web SDK.
 *  @property {SocketType} WebRTC - <code>2</code> - WebRTC socket. A WebRTC data channel presented as a UDP-style socket.
 */
const SocketType = new class {
    // C++  SocketType

    readonly Unknown = SocketTypeValue.Unknown;
    readonly UDP = SocketTypeValue.UDP;
    readonly WebRTC = SocketTypeValue.WebRTC;

    readonly #_UNKNOWN = "Unknown";
    readonly #_UDP = "UDP";
    readonly #_WEBRTC = "WebRTC";
    readonly #_SOCKET_TYPE_STRINGS = [this.#_UNKNOWN, this.#_UDP, this.#_WEBRTC];

    /*@devdoc
     *  Gets the name of a SocketType value, e.g., <code>"WebRTC"</code>.
     *  @function SocketType(1).socketTypeToString
     *  @param {SocketType} socketType - The socket type value.
     *  @returns {string} The name of the socket type value.
     */
    socketTypeToString(socketType: SocketTypeValue): string {
        // C++  QString socketTypeToString(SocketType socketType)
        //      Provided as a global function in C++ but as a method of the SocketType namespace in TypeScript.
        const value = this.#_SOCKET_TYPE_STRINGS[socketType];
        return value ? value : this.#_UNKNOWN;
    }

}();

export { SocketType as default, SocketTypeValue };
