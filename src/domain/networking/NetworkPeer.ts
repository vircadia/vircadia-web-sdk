//
//  NetworkPeer.ts
//
//  Created by David Rowe on 11 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


import SockAddr from "./SockAddr";
import Signal from "../shared/Signal";
import Uuid from "../shared/Uuid";


type LocalID = number;
// C++  using LocalID = NetworkLocalID
//      using NetworkLocalID = quint16


/*@devdoc
 *  The <code>NetworkPeer</code> class manages the network connection to an assignment client.
 *  @class NetworkPeer
 *  @param {Uuid} [uuid=Uuid.NULL] - The network connections's UUID.
 *  @param {SockAddr} [publicSocket=newSockAddr()] - The public socket address.
 *  @param {SockAddr} [localSocket=newSockAddr()] - The local socket address.
 */
class NetworkPeer {
    // C++  class NetworkPeer : public QObject

    /*@devdoc
     *  A local ID is an integer ID assigned to the domain server, an assignment client, or a web client by the domain server.
     *  @typedef {number} LocalID
     */


    protected _publicSocket;
    protected _localSocket;

    private _uuid;
    private _localID: LocalID = 0;
    private _activeSocket: SockAddr | null = null;  // References the active socket.
    private _socketUpdated = new Signal();
    private _socketActivated = new Signal();


    constructor(uuid = new Uuid(), publicSocket = new SockAddr(), localSocket = new SockAddr()) {
        // C++  NetworkPeer(const QUuid& uuid, const SockAddr& publicSocket, const SockAddr& localSocket, QObject* parent)
        //      NetworkPeer(QObject* parent)
        this._uuid = uuid;
        this._publicSocket = publicSocket;
        this._localSocket = localSocket;

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Gets the UUID.
     *  @returns {Uuid} The UUID.
     */
    getUUID(): Uuid {
        // C++  NetworkPeer::getUUID()
        return this._uuid;
    }

    /*@devdoc
     *  Sets the UUID.
     *  @param {Uuid} uuid - The UUID.
     */
    setUUID(uuid: Uuid): void {
        // C++  NetworkPeer::setUUID()
        this._uuid = uuid;
    }

    /*@devdoc
     *  Gets the local ID.
     *  @returns {LocalID} The local ID.
     */
    getLocalID(): LocalID {
        // C++  LocalID getLocalID()
        return this._localID;
    }

    /*@devdoc
     *  Sets the local ID.
     *  @param {Uuid} uuid - The UUID.
     */
    setLocalID(localID: LocalID): void {
        // C++  void setLocalID(LocalID localID)
        this._localID = localID;
    }

    /*@devdoc
     *  Gets the public socket address.
     *  @returns {SockAddr} The public socket address.
     */
    getPublicSocket(): SockAddr {
        // C++  const SockAddr& getPublicSocket()
        return this._publicSocket;
    }

    /*@devdoc
     *  Sets the public socket address.
     *  @param {SockAddr} publicSocket - The public socket address.
     */
    setPublicSocket(publicSocket: SockAddr): void {
        // C++  void setPublicSocket(const SockAddr& publicSocket)
        if (!publicSocket.isEqualTo(this._publicSocket)) {
            if (this._activeSocket === this._publicSocket) {
                this._activeSocket = null;
            }

            const wasOldSocketNull = this._publicSocket.isNull();

            const previousSocket = this._publicSocket;
            this._publicSocket = publicSocket;
            this._publicSocket.setObjectName(previousSocket.objectName());

            if (!wasOldSocketNull) {
                console.log("[networking] Public socket change for node", this.toString(),
                    "; previously", previousSocket.toString());
                this.socketUpdated.emit(previousSocket, this._publicSocket);
            }
        }
    }

    /*@devdoc
     *  Gets the local socket address.
     *  @returns {SockAddr} The local socket address.
     */
    getLocalSocket(): SockAddr {
        // C++  const SockAddr& getLocalSocket()
        return this._localSocket;
    }

    /*@devdoc
     *  Sets the local socket address.
     *  @param {SockAddr} localSocket - The local socket address.
     */
    setLocalSocket(localSocket: SockAddr): void {
        // C++  void setLocalSocket(const SockAddr& localSocket)

        if (!localSocket.isEqualTo(this._localSocket)) {
            if (this._activeSocket === this._localSocket) {
                // if the active socket was the local socket then reset it to NULL
                this._activeSocket = null;
            }

            const wasOldSocketNull = this._localSocket.isNull();

            const previousSocket = this._localSocket;
            this._localSocket = localSocket;
            this._localSocket.setObjectName(previousSocket.objectName());

            if (!wasOldSocketNull) {
                console.log("[networking] Local socket change for node", this.toString(),
                    "; previously", previousSocket.toString());
                this.socketUpdated.emit(previousSocket, this._localSocket);
            }
        }
    }

    /*@devdoc
     *  Gets the currently active socket.
     *  @returns {SockAddr|null} The currently active socket if one is active, <code>null</code> if none is active/
     */
    getActiveSocket(): SockAddr | null {
        // C++  const SockAddr* getActiveSocket() const { return _activeSocket; }
        return this._activeSocket;
    }


    /*@devdoc
     *  Triggered when the node's public or local socket address is updated.
     *  @function NetworkPeer.socketUpdated
     *  @param {SockAddr} previousAddress - The previous address.
     *  @param {SockAddr} currentAddress - The current address.
     *  @returns {Signal}
     */
    get socketUpdated(): Signal {
        // C++  void socketUpdated(SockAddr previousAddress, SockAddr currentAddress)
        return this._socketUpdated;
    }

    /*@devdoc
     *  Triggered when the public or local socket is activated, i.e., connection is established.
     *  @function NetworkPeer.socketActivated
     *  @param {SockAddr} sockAddr - The socket that has been activated.
     *  @returns {Signal}
     */
    get socketActivated(): Signal {
        // C++  void socketActivated(const SockAddr& sockAddr)
        return this._socketActivated;
    }


    /*@devdoc
     *  Sets the active socket.
     *  @param {SockAddr} discoveredSocket - The socket to make active.
     */
    protected setActiveSocket(discoveredSocket: SockAddr): void {
        // C++  void NetworkPeer::setActiveSocket(SockAddr* discoveredSocket)
        this._activeSocket = discoveredSocket;

        // WEBRTC TODO: Address further C++ code.

        if (this._activeSocket) {
            this.socketActivated.emit(this._activeSocket);
        }
    }


    private toString(): string {
        // C++  QDebug operator<<(QDebug debug, const NetworkPeer &peer)
        const BASE_16 = 16;
        return (<bigint>(this.getUUID().valueOf())).toString(BASE_16)
            + " - public:" + this._publicSocket.toString()
            + " - local:" + this._localSocket.toString();
    }

}

export default NetworkPeer;
export type { LocalID };
