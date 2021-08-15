//
//  LimitedNodeList.ts
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { LocalID } from "./NetworkPeer";
import NLPacket from "./NLPacket";
import Node from "./Node";
import NodePermissions from "./NodePermissions";
import NodeType, { NodeTypeValue } from "./NodeType";
import PacketReceiver from "./PacketReceiver";
import SockAddr from "./SockAddr";
import PacketType from "./udt/PacketHeaders";
import Socket from "./udt/Socket";
import assert from "../shared/assert";
import Signal from "../shared/Signal";
import Uuid from "../shared/Uuid";


type NewNodeInfo = {
    // C++  NewNodeInfo
    type: NodeTypeValue,
    uuid: Uuid,
    publicSocket: SockAddr,
    localSocket: SockAddr,
    permissions: NodePermissions,
    isReplicated: boolean,
    sessionLocalID: LocalID,
    connectionSecretUUID: Uuid
};


/*@devdoc
 *  The <code>LimitedNodeList</code> class manages all the network nodes (assignment clients) that the client is connected to.
 *  This includes their presence and communications with them via the Vircadia protocol.
 *  <p>See also: {@link NodesList}.</p>
 *  <p>C++: <code>LimitedNodeList : public QObject, public Dependency</code>
 *  @class LimitedNodeList
 *
 *  @property {LimitedNodeList.ConnectReason} ConnectReason - Connect reason values.
 *  @property {number} INVALID_PORT=-1 - Invalid port.
 */
class LimitedNodeList {
    // C++  LimitedNodeList : public QObject, public Dependency

    /*@devdoc
     *  Assignment client node information received in {@link PacketScribe.DomainListDetails} packet data.
     *  @typedef {object} LimitedNodeList.NewNodeInfo
     *  @property {NodeType} type - The type of node.
     *  @property {Uuid} uuid - The UUID of the node.
     *  @property {SockAddr} publicSocket - The public socket address.
     *  @property {SockAddr} localSocket - The local socket address.
     *  @property {NodePermissions} permissions - The permissions granted to the user for the node.
     *  @property {boolean} isReplicated - <code>true</code> if the node is replicated, <code>false</code> if it isn't.
     *  @property {LocalID} sessionLocalID - The local ID of the node at the domain server.
     *  @property {Uuid} connectionSecretUUID - The secret for the client connection to the node.
     */


    /*@devdoc
     *  The reason for requesting a connection to a domain.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>Connect</td><td>0</td><td>The client wants to connect to the domain.</td></tr>
     *          <tr><td>SilentDomainDisconnect</td><td>1</td><td>Communications with the domain have been disrupted.</td></tr>
     *          <tr><td>Awake</td><td>2</td><td>The system is waking up from sleep or hibernation.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} LimitedNodeList.ConnectReason
     */
    static ConnectReason = {
        // C++  enum ConnectReason : quint32
        Connect: 0,
        SilentDomainDisconnect: 1,
        Awake: 2
    };

    static INVALID_PORT = -1;


    protected _nodeSocket = new Socket();
    protected _localSockAddr = new SockAddr();
    protected _publicSockAddr = new SockAddr();
    protected _packetReceiver = new PacketReceiver();


    private NULL_CONNECTION_ID = -1;
    private SOLO_NODE_TYPES = new Set([
        NodeType.AvatarMixer,
        NodeType.AudioMixer,
        NodeType.AssetServer,
        NodeType.EntityServer,
        NodeType.MessagesMixer,
        NodeType.EntityScriptServer
    ]);

    private _sessionUUID = new Uuid(Uuid.NULL);
    private _sessionLocalID: LocalID = 0;

    private _nodeHash: Map<bigint, Node> = new Map();

    private _nodeAdded = new Signal();
    private _nodeActivated = new Signal();
    private _nodeSocketUpdated = new Signal();


    constructor() {
        // C++  LimitedNodeList(char ownerType = NodeType::DomainServer, int socketListenPort = INVALID_PORT,
        //                      int dtlsListenPort = INVALID_PORT);

        // WEBRTC TODO: Address further C++ code.

        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._nodeSocket.setPacketHandler(this._packetReceiver.handleVerifiedPacket);  // handleVerifiedPacket is bound.

        // WEBRTC TODO: Address further C++ code.

        // Bind Slot methods.
        this.reset.bind(this);
    }


    /*@devdoc
     *  Sends a a solitary packet to an address, unreliably. The packet cannot be part of a multi-packet message.
     *  @param {NLPacket} packet - The packet to send.
     *  @param {SockAddr} sockAddr - The address to send it to.
     *  @param {HMACAuth} [hmacAuth=null] - Not currently used.
     *  @returns {number} The number of bytes sent.
     */
    sendUnreliablePacket(packet: NLPacket, sockAddr: SockAddr, hmacAuth = null): number {
        // C++  qint64 sendUnreliablePacket(const NLPacket& packet, const SockAddr& sockAddr, HMACAuth* hmacAuth = nullptr)

        assert(!packet.isPartOfMessage());
        assert(!packet.isReliable());

        // WEBRTC TODO: Address further C++ code.

        this.fillPacketHeader(packet, hmacAuth);

        return this._nodeSocket.writePacket(packet, sockAddr);
    }

    /*@devdoc
     *  Sends a solitary packet to an address, reliably or unreliably depending on the packet. The packet cannot be part of a
     *  multi-packet message.
     *  @param {NLPacket} packet - The packet to send.
     *  @param {SockAddr} sockAddr - The address to send it to.
     *  @param {HMACAuth} [hmacAuth=null] - Not currently used.
     *  @returns {number} The number of bytes sent.
     */
    sendPacket(packet: NLPacket, sockAddr: SockAddr, hmacAuth = null): number {
        // C++  qint64 sendPacket(NLPacket* packet, const SockAddr& sockAddr, HMACAuth* hmacAuth = nullptr)
        assert(!packet.isPartOfMessage());

        if (packet.isReliable()) {

            console.warn("sendPacket() : isReliable : Not implemented!");

            // WEBRTC TODO: Address further C++ code.

            return 0;

        }

        const size = this.sendUnreliablePacket(packet, sockAddr, hmacAuth);

        // WEBRTC TODO: Address further C++ code.

        return size;
    }

    /*@devdoc
     *  Gets the assignment client node of a specified type, if present.
     *  @param {NodeTypeValue} nodeType - The type of assignment client node to get.
     *  @returns {Node|null} The node of the requested type if there is one, <code>null</code> if there isn't one.
     */
    soloNodeOfType(nodeType: NodeTypeValue): Node | null {
        // C++  Node* soloNodeOfType(NodeType nodeType)
        for (const node of this._nodeHash.values()) {
            if (node.getType() === nodeType) {
                return node;
            }
        }
        return null;
    }

    /*@devdoc
     *  Searches for an existing node with a given address.
     *  @param {SodkAddr} address - The address searched for.
     *  @returns {Node|null} The node with the given address if found, <code>null</code> if none found.
     */
    findNodeWithAddr(addr: SockAddr): Node | null {
        // C++  Node* findNodeWithAddr(const SockAddr& addr)
        for (const node of this._nodeHash.values()) {
            if (node.getPublicSocket().isEqualTo(addr) || node.getLocalSocket().isEqualTo(addr)) {
                return node;
            }
        }
        return null;
    }

    /*@devdoc
     *  Adds new or updates existing assignment client node connections.
     *  @param {Uuid} uuid - The node's UUID.
     *  @param {NodeType} nodeType - The node's type.
     *  @param {SockAddr} publicSocket - The node's public socket.
     *  @param {SockAddr} localSocket - The node's local network socket.
     *  @param {LocalID} localID - The node's local ID.
     *  @param {boolean} isReplicated - Whether or not the node is replicated.
     *  @param {boolean} isUpstream - Whether or not the node is an upstream node.
     *  @param {Uuid} connectionSecret - The node connection secret.
     *  @param {NodePermissions} permissions - The node's permissions.
     *  @returns {Node} The node added or updated.
     */
    addOrUpdateNode(uuid: Uuid, nodeType: NodeTypeValue, publicSocket: SockAddr, localSocket: SockAddr, localID: LocalID,
        isReplicated: boolean, isUpstream: boolean, connectionSecret: Uuid, permissions: NodePermissions): Node {
        // C++  SharedNodePointer addOrUpdateNode(const QUuid& uuid, NodeType_t nodeType,
        //                                        const SockAddr& publicSocket, const SockAddr& localSocket,
        //                                        Node::LocalID localID = Node::NULL_LOCAL_ID, bool isReplicated = false,
        //                                        bool isUpstream = false, const QUuid& connectionSecret = QUuid(),
        //                                        const NodePermissions& permissions = DEFAULT_AGENT_PERMISSIONS);


        const matchingNode = this._nodeHash.get(uuid.value());
        if (matchingNode) {
            matchingNode.setPublicSocket(publicSocket);
            matchingNode.setLocalSocket(localSocket);
            matchingNode.setPermissions(permissions);
            matchingNode.setConnectionSecret(connectionSecret);
            matchingNode.setIsReplicated(isReplicated);
            matchingNode.setIsUpstream(isUpstream || NodeType.isUpstream(nodeType));
            matchingNode.setLocalID(localID);
            return matchingNode;
        }

        // If this is a solo node then the domain server has replaced it and any previous node of the type should be killed.
        if (this.SOLO_NODE_TYPES.has(nodeType)) {
            this.removeOldNode(this.soloNodeOfType(nodeType));
        }

        // If there is a new node with the same socket, this is a reconnection, kill the old node
        this.removeOldNode(this.findNodeWithAddr(publicSocket));
        this.removeOldNode(this.findNodeWithAddr(localSocket));

        // If there is an old Connection to the new node's address, kill it.
        this._nodeSocket.cleanupConnection(publicSocket);
        this._nodeSocket.cleanupConnection(localSocket);

        // WEBRTC TODO: Address further C++ code.

        // Add the new node.
        const newNode = new Node(uuid, nodeType, publicSocket, localSocket);
        newNode.setIsReplicated(isReplicated);
        newNode.setIsUpstream(isUpstream || NodeType.isUpstream(nodeType));
        newNode.setConnectionSecret(connectionSecret);
        newNode.setPermissions(permissions);
        newNode.setLocalID(localID);

        // WEBRTC TODO: Address further C++ code.

        this._nodeHash.set(newNode.getUUID().value(), newNode);

        // WEBRTC TODO: Address further C++ code.

        console.log("[networking] Added", NodeType.getNodeTypeName(newNode.getType()));

        // WEBRTC TODO: Address further C++ code.

        this._nodeAdded.emit(newNode);

        // Signal when the network connection to the new node is established.
        if (newNode.getActiveSocket()) {
            this._nodeActivated.emit(newNode);
        } else {
            const callback = () => {
                this._nodeActivated.emit(newNode);
                newNode.socketActivated.disconnect(callback);
            };
            newNode.socketActivated.connect(callback);
        }

        // Signal when the node's socket changes so that we can reconnect.
        newNode.socketUpdated.connect((previousAddress, currentAddress) => {
            this._nodeSocketUpdated.emit(newNode);
            this._nodeSocket.handleRemoteAddressChange(previousAddress, currentAddress);
        });

        return newNode;
    }

    /*@devdoc
     *  Gets the client's local socket network address.
     *  @returns {SockAddr} The local socket network address.
     */
    getLocalSockAddr(): SockAddr {
        // C++  SockAddr& getLocalSockAddr()

        // WEBRTC TODO: Set correct value.

        return this._localSockAddr;
    }

    /*@devdoc
     *  Gets the client's public socket network address.
     *  @returns {SockAddr} The local socket network address.
     */
    getPublicSockAddr(): SockAddr {
        // C++  SockAddr& getPublicSockAddr()

        // WEBRTC TODO: Set correct value.

        return this._publicSockAddr;
    }

    /*@devdoc
     *  Gets the packet receiver used for handling packets received from the assignment clients.
     *  @returns {PacketReceiver} The packet receiver.
     */
    getPacketReceiver(): PacketReceiver {
        // C++  PacketReceiver& getPacketReceiver()
        return this._packetReceiver;
    }


    /*@devdoc
     *  Gets the node's UUID as assigned by the domain server  for the connection session.
     *  @returns {LocalID} The node's session UUID.
     */
    getSessionUUID(): Uuid {
        // C++  LocalID getSessionUUID()
        return this._sessionUUID;
    }

    /*@devdoc
     *  Sets the node's UUID as assigned by the domain server  for the connection session.
     *  @param {LocalID} sessionUUID - The node's session UUID.
     */
    setSessionUUID(sessionUUID: Uuid): void {
        // C++  void setSessionUUID(const QUuid& sessionUUID);
        this._sessionUUID = sessionUUID;
    }

    /*@devdoc
     *  Gets the node's local ID as assigned by the domain server for the connection session.
     *  @returns {LocalID} The node's session local ID.
     */
    getSessionLocalID(): LocalID {
        // C++  LocalID getSessionLocalID()
        return this._sessionLocalID;
    }

    /*@devdoc
     *  Sets the node's local ID as assigned by the domain server for the connection session.
     *  @param {LocalID} sessionLocalID - The node's session local ID.
     */
    setSessionLocalID(sessionLocalID: LocalID): void {
        // C++  void setSessionLocalID(LocalID sessionLocalID);
        this._sessionLocalID = sessionLocalID;
    }


    /*@devdoc
     *  Resets the NodesList, closing all connections and deleting all node data.
     *  @param {string} reason - The reason for resetting.
     *  @returns {Slot}
     */
    // eslint-disable-next-line
    // @ts-ignore
    reset(reason: string): void {  // eslint-disable-line @typescript-eslint/no-unused-vars
        // C++  void reset(QString reason)
        // Cannot declare this Slot function as an arrow function because derived NodesList class calls this function.
        this.eraseAllNodes(reason);
        this._nodeSocket.clearConnections();

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Triggered when a new node is added.
     *  @function LimitedNodeList.nodeAdded
     *  @param {Node} node - The node added.
     *  @returns {Signal}
     */
    get nodeAdded(): Signal {
        // C++  void nodeAdded(SharedNodePointer node);
        return this._nodeAdded;
    }

    /*@devdoc
     *  Triggered when the network connection to the node is established.
     *  @function LimitedNodeList.nodeActivated
     *  @param {Node} node - The node that activated.
     *  @returns {Signal}
     */
    get nodeActivated(): Signal {
        // C++  void nodeActivated(SharedNodePointer node);
        return this._nodeActivated;
    }

    /*@devdoc
     *  Triggered when a node's public or local socket address is updated.
     *  @function LimitedNodeList.nodeSocketUpdated
     *  @param {Node} node - The node that had updated its public or local socket address.
     *  @returns {Signal}
     */
    get nodeSocketUpdated(): Signal {
        // C++  void nodeSocketUpdated(SharedNodePointer node);
        return this._nodeSocketUpdated;
    }


    protected addNewNode(info: NewNodeInfo): void {  // eslint-disable-line class-methods-use-this
        // C++  void addNewNode(NewNodeInfo info);

        // WEBRTC TODO: Address further C++ code.

        this.addOrUpdateNode(info.uuid, info.type, info.publicSocket, info.localSocket, info.sessionLocalID, info.isReplicated,
            false, info.connectionSecretUUID, info.permissions);

        // WEBRTC TODO: Address further C++ code.

    }

    // WEBRTC TOOD: JSDoc
    // eslint-disable-next-line
    // @ts-ignore
    protected handleNodeKill(node: Node, nextConnectionID = this.NULL_CONNECTION_ID): void {  // eslint-disable-line
        // C++  void handleNodeKill(const SharedNodePointer& node, ConnectionID nextConnectionID = NULL_CONNECTION_ID)

        console.warn("handleNodeKill() : Not implemented!");

        // WEBRTC TODO: Address C++ code.

        // Ping timer N/A.

    }


    private fillPacketHeader(packet: NLPacket, hmacAuth: null): void {
        // C++  void fillPacketHeader(const NLPacket& packet, HMACAuth* hmacAuth = nullptr) {
        if (!PacketType.getNonSourcedPackets().has(packet.getType())) {
            packet.writeSourceID(this.getSessionLocalID());
        }

        if (hmacAuth) {
            console.warn("fillPacketHeader() : hmacAuth : Not implemented!");

            // WEBRTC TODO: Address further C++ code.

        }
    }

    private removeOldNode(node: Node | null) {
        // C++  auto removeOldNode = [&](auto node)
        if (!node) {
            return;
        }

        // WEBRTC TODO: Address further C++ code.

        this._nodeHash.delete(node.getUUID().value());  // eslint-disable-line @typescript-eslint/dot-notation
        this.handleNodeKill(node);
    }

    private eraseAllNodes(reason: string): void {
        // C++  void eraseAllNodes(QString reason)
        if (this._nodeHash.size > 0) {
            console.log("[networking] Removing all nodes from nodes list:", reason);
            const killedNodes = this._nodeHash.values();

            // WEBRTC TODO: Address further C++ code.

            this._nodeHash.clear();

            for (const node of killedNodes) {
                this.handleNodeKill(node);
            }
        }

        // WEBRTC TODO: Address further C++ code.

    }

}

export default LimitedNodeList;
export type { NewNodeInfo };
