//
//  SockAddr.ts
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SocketType, { SocketTypeValue } from "./SocketType";


/*@devdoc
 *  The <code>SockAddr</code> class handles information on an IPv4 network address and port number. The port number may be a UDP
 *  port number or an internally-assigned WebRTC data channel ID. Internally, the IP address is handled as a 1-byte address type
 *  (UDP or WebRTC), 4-byte number value, and the port as a 2-byte number value.
 *  <p>For convenience, the socket type defaults to <code>WebRTC</code>.</p>
 *  <p>C++: <code>SockAddr : public QObject</code></p>
 *  @class SockAddr
 *  @param {SocketType} [type=WebRTC] - The type of network socket.
 *  @param {number} [address=0] - The IPv4 network address as a 4-byte number.
 *  @param {number} [port=0] - The port number.
 */
class SockAddr {
    // C++  SockAddr : public QObject

    #_name = "";
    #_type = SocketTypeValue.WebRTC;  // Default to WebRTC as a convenience in the SDK.
    #_address = 0;
    #_port = 0;


    constructor(type = SocketType.WebRTC, address = 0, port = 0) {
        // C++  SockAddr(SocketType socketType, const QHostAddress& address, quint16 port)
        this.#_type = type;
        this.#_address = address;
        this.#_port = port;
    }


    /*@devdoc
     *  Sets the name identifying the SockAddr.
     *  @param {string} name - The name of the SockAddr.
     */
    setObjectName(name: string): void {
        // C++  void QObject::setObjecctName(const QString& name)
        this.#_name = name;
    }

    /*@devdoc
     *  Gets the name identifying the SockAddr.
     *  @returns {string} The name of the SockAddr.
     */
    objectName(): string {
        // C++  QString QObject::objectName()
        return this.#_name;
    }

    /*@devdoc
     *  Sets the socket type.
     *  @param {SocketType} type - The type of network socket.
     */
    setType(type: SocketTypeValue): void {
        // C++  void setType(const SocketType socketType)
        this.#_type = type;
    }

    /*@devdoc
     *  Gets the network socket type.
     *  @returns {SocketType} The type of network socket.
     */
    getType(): SocketTypeValue {
        // C++  SocketType getType()
        return this.#_type;
    }

    /*@devdoc
     *  Sets the IP address.
     *  @param {number} address - The IPv4 network address as a 4-byte number.
     */
    setAddress(address: number): void {
        // C++  QHostAddress* getAddressPointer()
        this.#_address = address;
    }

    /*@devdoc
     *  Gets the IP address.
     *  @returns {number} The IPv4 network address as a 4-byte number. <strong>Default Value:</strong> <code>0</code>
     */
    getAddress(): number {
        // C++  QHostAddress& getAddress()
        return this.#_address;
    }

    /*@devdoc
     *  Sets the port number.
     *  @param {number} port The port number.
     */
    setPort(port: number): void {
        // C++  void setPort(quint16 port
        this.#_port = port;
    }

    /*@devdoc
     *  Gets the port number.
     *  @returns {number} The port number. <strong>Default Value:</strong> <code>0</code>
     */
    getPort(): number {
        // C++  quint16 getPort()
        return this.#_port;
    }

    /*@devdoc
     *  Checks whether the value is null.
     *  @returns {boolean} <code>true</code> if the network address is <code>0</code> and the port number is <code>0</code>.
     */
    isNull(): boolean {
        // C++  bool isNull()
        return this.#_address === 0 && this.#_port === 0;
    }

    /*@devdoc
     *  Tests whether the type, address, and port values are the same as those of another SockAddr.
     *  @param {SockAddr} otherAddr - The other address to test against.
     *  @returns {boolean} <code>true</code> if this SockAddr's type, address, and port are the same as those of the other
     *      address, <code>false</code> if they aren't.
     */
    isEqualTo(otherAddr: SockAddr): boolean {
        // C++  operator==
        return this.#_type === otherAddr.getType() && this.#_address === otherAddr.getAddress()
            && this.#_port === otherAddr.getPort();
    }


    /*@devdoc
     *  Returns a string representation of the SockAddr value, for example, <code>"WebRTC 127.0.0.1:11111"</code>.
     *  @returns {string} A string representation of the SockAddr value.
     */
    toString(): string {
        // C++  QDebug operator<<
        const BYTE_DIVISOR = 256;
        const ipNumbers = [];
        let address = this.#_address;
        for (let i = 3; i >= 0; i--) {
            ipNumbers[i] = address % BYTE_DIVISOR;
            address = Math.floor(address / BYTE_DIVISOR);
        }
        // Always include socket type because "Unknown" indicates an error in the Web SDK.
        return SocketType.socketTypeToString(this.#_type) + " " + ipNumbers.join(".") + ":" + this.getPort().toString();
    }

}

export default SockAddr;
