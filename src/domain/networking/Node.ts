//
//  Node.ts
//
//  Created by David Rowe on 11 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NetworkPeer, { LocalID } from "./NetworkPeer";
import NodePermissions from "./NodePermissions";
import Uuid from "../shared/Uuid";
import NodeType, { NodeTypeValue } from "./NodeType";
import SockAddr from "./SockAddr";


/*@devdoc
 *  The <code>Node</code> class handles the connection to and the features of an assignment client node.
 *  <p>C++: <code>Node : public NetworkPeer</code></p>
 *  @class Node
 *  @extends NetworkPeer
 *  @param {Uuid} uuid - The UUID of the node.
 *  @param {NodeType} type - The type of the node.
 *  @param {SockAddr} publicSocket - The node's public socket.
 *  @param {SockAddr} localSocket - The node's local socket.
 *
 *  @property {LocalID} NULL_LOCAL_ID - The null LocalID, <code>0</code>. <em>Read-only.</em>
 *      <p><em>Static.</em></p>
 */
class Node extends NetworkPeer {
    // C++  class Node : public NetworkPeer

    static readonly NULL_LOCAL_ID: LocalID = 0;

    private _type = NodeType.Unassigned;
    private _permissions = new NodePermissions();
    private _connectionSecret = new Uuid();
    private _isReplicated = false;
    private _isUpstream = false;


    constructor(uuid: Uuid, type: NodeTypeValue, publicSocket: SockAddr, localSocket: SockAddr) {
        // C++  Node(const QUuid& uuid, NodeType_t type, const SockAddr& publicSocket, const SockAddr& localSocket,
        //          QObject * parent)
        super(uuid, publicSocket, localSocket);

        this.setType(type);  // Sets object names.
    }


    /*@devdoc
     *  Gets the node's type.
     *  @returns {NodeType} The node's type.
     */
    getType(): NodeTypeValue {
        // C++  char getType() const { return _type; }
        return this._type;
    }

    /*@devdoc
     *  Sets the node's type and sets the object names of the node's public and local sockets to reflect the node's type.
     *  @param {NodeTypeValue} type - The node's type.
     */
    setType(type: NodeTypeValue): void {
        // C++  void setType(char type);
        this._type = type;

        const typeString = NodeType.getNodeTypeName(type);
        this._publicSocket.setObjectName(typeString);
        this._localSocket.setObjectName(typeString);

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Gets the node's permissions.
     *  @returns {NodePermissions} The node's permissions.
     */
    getPermissions(): NodePermissions {
        // C++  NodePermissions getPermissions() const
        return this._permissions;
    }

    /*@devdoc
     *  Sets the node's permissions.
     *  @param {NodePermissions} newPermissions - The node's new node permissions.
     */
    setPermissions(newPermissions: NodePermissions): void {
        // C++  void setPermissions(const NodePermissions& newPermissions)
        this._permissions = newPermissions;
    }

    /*@devdoc
     *  Gets the node's connection secret.
     *  @returns {Uuid} The node's connection secret.
     */
    getConnectionSecret(): Uuid {
        // C++  QUuid& getConnectionSecret() const
        return this._connectionSecret;
    }

    /*@devdoc
     *  Sets the node's connection secret.
     *  @param {Uuid} connectionSecret - The node's connection secret.
     */
    setConnectionSecret(connectionSecret: Uuid): void {
        // C++  void setConnectionSecret(const QUuid& connectionSecret);
        if (this._connectionSecret.valueOf() === connectionSecret.valueOf()) {
            return;
        }

        // WEBRTC TODO: Address further C++ code.

        this._connectionSecret = connectionSecret;

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Gets whether the node is replicated.
     *  @returns {boolean} <code>true</code> if the node is replicated, <code>false</code> if it isn't.
     */
    getIsReplicated(): boolean {
        // C++  bool isReplicated() const
        return this._isReplicated;
    }

    /*@devdoc
     *  Sets whether the node is replicated.
     *  @param {boolean} isReplicated - <code>true</code> if the node is replicated, <code>false</code> if it isn't.
     */
    setIsReplicated(isReplicated: boolean): void {
        // C++  void setIsReplicated(bool isReplicated)
        this._isReplicated = isReplicated;
    }

    /*@devdoc
     *  Gets whether the node is upstream.
     *  @returns {boolean} <code>true</code> if the node is upstream, <code>false</code> if it isn't.
     */
    getIsUpstream(): boolean {
        // C++  bool isUpstream() const
        return this._isUpstream;
    }

    /*@devdoc
     *  Sets whether the node is upstream.
     *  @param {boolean} isUpstream - <code>true</code> if the node is upstream, <code>false</code> if it isn't.
     */
    setIsUpstream(isUpstream: boolean): void {
        // c++  void setIsUpstream(bool isUpstream)
        this._isUpstream = isUpstream;
    }


}

export default Node;
