//
//  LimitedNodeList.ts
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import HMACAuth from "./HMACAuth";
import { LocalID } from "./NetworkPeer";
import NLPacket from "./NLPacket";
import NLPacketList from "./NLPacketList";
import Node from "./Node";
import NodePermissions from "./NodePermissions";
import NodeType, { NodeTypeValue } from "./NodeType";
import PacketReceiver from "./PacketReceiver";
import SockAddr from "./SockAddr";
import SocketType from "./SocketType";
import Packet from "./udt/Packet";
import PacketType from "./udt/PacketHeaders";
import Socket from "./udt/Socket";
import assert from "../shared/assert";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
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

type NodePredicate = (node: Node) => boolean;
type NodeFunctor = (node: Node) => void;


/*@devdoc
 *  The <code>LimitedNodeList</code> class manages all the network nodes (assignment clients) that the client is connected to.
 *  This includes their presence and communications with them via the Vircadia protocol.
 *  <p>See also: {@link NodeList}.</p>
 *  <p>C++: <code>LimitedNodeList : public QObject, public Dependency</code></p>
 *  @class LimitedNodeList
 *  @param {number} contextID - The {@link ContextManager} context ID.
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
     *  A function that tests if a {@link Node} satisfies some condition.
     *  @callback NodePredicate
     *  @param {Node} node - The node to test.
     *  @returns {boolean} <code>true</code> if the node passes the test, <code>false</code> if it doesn't.
     */

    /*@devdoc
     *  A function that operates on a {@link Node}.
     *  @callback NodeFunctor
     *  @param {Node} node - The node to operate on.
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

    static readonly INVALID_PORT = -1;


    protected _nodeSocket = new Socket();
    protected _localSockAddr = new SockAddr();
    protected _publicSockAddr = new SockAddr();
    protected _packetReceiver;
    protected _useAuthentication = true;


    static readonly #ERROR_SENDING_PACKET_BYTES = -1;

    static #versionDebugSuppressMap: Set<string> = new Set();
    // C++  QMultiHash<SockAddr, PacketType>
    // In TypeScript, the set item is sockAddr.toString() + packetType.toString();

    static #sourcedVersionDebugSuppressMap: Set<string> = new Set();
    // C++  QMultiHash<QUuid, PacketType>
    // In TypeScript, the set item is uuid.toString() + packetType.toString().


    readonly #NULL_CONNECTION_ID = -1;
    readonly #SOLO_NODE_TYPES = new Set([
        NodeType.AvatarMixer,
        NodeType.AudioMixer,
        NodeType.AssetServer,
        NodeType.EntityServer,
        NodeType.MessagesMixer,
        NodeType.EntityScriptServer
    ]);

    #_sessionUUID = new Uuid(Uuid.NULL);
    #_sessionLocalID: LocalID = 0;

    #_nodeHash: Map<bigint, Node> = new Map();  // Map<Uuid, Node>

    #_dropOutgoingNodeTraffic = false;

    #_uuidChanged = new SignalEmitter();
    #_nodeAdded = new SignalEmitter();
    #_nodeActivated = new SignalEmitter();
    #_nodeSocketUpdated = new SignalEmitter();
    #_nodeKilled = new SignalEmitter();
    #_packetVersionMismatch = new SignalEmitter();


    constructor(contextID: number) {
        // C++  LimitedNodeList(int socketListenPort = INVALID_PORT, int dtlsListenPort = INVALID_PORT);

        this._packetReceiver = new PacketReceiver(contextID);

        // WEBRTC TODO: Address further C++ code.

        this._nodeSocket.setPacketHandler(this._packetReceiver.handleVerifiedPacket);
        this._nodeSocket.setMessageHandler(this._packetReceiver.handleVerifiedMessagePacket);
        this._nodeSocket.setMessageFailureHandler(this._packetReceiver.handleMessageFailure);

        // Skip message failure handling because it's only used in UDTTest which isn't provided in the SDK.

        // Set the isPacketVerified method as the verify operator for the Socket.
        this._nodeSocket.setPacketFilterOperator(this.#isPacketVerified);

        this._nodeSocket.setConnectionCreationFilterOperator(this.sockAddrBelongsToNode);

        // WEBRTC TODO: Address further C++ code.

        // Bind Slot methods.
        this.reset.bind(this);
    }


    /*@devdoc
     *  Gets whether the code is being used for the connection to a domain server.
     *  <p>For a <code>LimitedNodeList</code> this is always <code>true</code>, for a <code>NodeList</code> this is always
     *  <code>false</code>.
     *  @returns {boolean} <code>true</code> if the node list is for the connection to a domain server, <code>false</code> if
     *  it isn't.
     */
    isDomainServer(): boolean {  // eslint-disable-line class-methods-use-this
        // C++  bool isDomainServer()
        return true;
    }

    /*@devdoc
     *  Gets the domain server's local ID.
     *  <p>For a <code>LimitedNodeList</code> this throws an error because it shouldn't be called for a domain server node
     *  list.</p>
     *  @returns {number} The domain server's local ID.
     */
    getDomainLocalID(): number {  // eslint-disable-line class-methods-use-this
        // C++  LocalID getDomainLocalID()
        assert(false);  // This method should not be called for a domain server node list.
    }

    /*@devdoc
     *  Gets the domain server's network address.
     *  <p>For a <code>LimitedNodeList</code> this throws an error because it shouldn't be called for a domain server node
     *  list.</p>
     *  @returns {SockAddr} The domain server's network address.
     */
    getDomainSockAddr(): SockAddr {  // eslint-disable-line class-methods-use-this
        // C++  SockAddr getDomainSockAddr()
        assert(false);  // This method should not be called for on a domain server node list.
    }


    /*@devdoc
     *  Sends a solitary packet to an address, unreliably. The packet cannot be part of a multi-packet message.
     *  @param {NLPacket} packet - The packet to send.
     *  @param {SockAddr|Node} sockAddr - The address to send it to.
     *      <p>The node to send it to. Not sent if the node doesn't have an active socket.</p>
     *  @param {HMACAuth|undefined} [hmacAuth=null] - The hash-based message authentication code.
     *      <p>Not used.</p>
     *  @returns {number} The number of bytes sent.
     */
    sendUnreliablePacket(packet: NLPacket, param1: SockAddr | Node, hmacAuth: HMACAuth | null = null): number {
        // C++  qint64 sendUnreliablePacket(const NLPacket& packet, const SockAddr& sockAddr, HMACAuth* hmacAuth = nullptr)
        //      qint64 sendUnreliablePacket(const NLPacket& packet, const Node& destinationNode)

        assert(!packet.isPartOfMessage(), "Cannot send a part-message packet unreliably!");
        assert(!packet.isReliable(), "Cannot send a reliable packet unreliably!");

        if (param1 instanceof Node) {
            const destinationNode = param1;

            const destinationAddress = destinationNode.getActiveSocket();
            if (!destinationAddress) {
                return 0;
            }

            return this.sendUnreliablePacket(packet, destinationAddress, destinationNode.getAuthenticateHash());
        }

        const sockAddr = param1;
        assert(sockAddr.getType() === SocketType.WebRTC, "Destination is not a WebRTC socket!");

        if (this.#_dropOutgoingNodeTraffic) {
            const destinationNode = this.findNodeWithAddr(sockAddr);

            // findNodeWithAddr() returns null for the address of the domain server.
            if (destinationNode !== null) {
                // This only suppresses individual unreliable packets, not unreliable packet lists.
                return LimitedNodeList.#ERROR_SENDING_PACKET_BYTES;
            }
        }

        this.#fillPacketHeader(packet, hmacAuth);

        return this._nodeSocket.writePacket(packet, sockAddr);
    }

    /*@devdoc
     *  Sends a solitary packet to an address, reliably or unreliably depending on the packet. The packet cannot be part of a
     *  multi-packet message.
     *  @param {NLPacket} packet - The packet to send.
     *  @param {SockAddr|Node} sockAddr|destinationNode - The address to send the packet to.
     *      <p>The packet's destination node.</p>
     *  @param {HMACAuth|SockAddr} [hmacAuth|overridenSockAddr=null] - The message authentication object to use.
     *      <p>The address to send the packet to, over-riding that of the <code>node</code>.
     *  @returns {number} The number of bytes sent, or <code>-1</code> if none sent.
     */
    sendPacket(packet: NLPacket, param1: SockAddr | Node, param2: HMACAuth | SockAddr | null = null): number {
        // C++  qint64 sendPacket(NLPacket* packet, const SockAddr& sockAddr, HMACAuth* hmacAuth = nullptr)
        //      qint64 sendPacket(NLPacket* packet, const Node& destinationNode)
        //      qint64 sendPacket(NLPacket* packet, const Node& destinationNode, const SockAddr& overridenSockAddr);

        if (param1 instanceof SockAddr) {
            assert(param2 instanceof HMACAuth || param2 === null);
            const sockAddr = param1;
            const hmacAuth = param2 as HMACAuth | null;  // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion

            if (packet.isReliable()) {
                this.#fillPacketHeader(packet, hmacAuth);
                const size = packet.getDataSize();
                this._nodeSocket.writePacket(packet, sockAddr);
                return size;
            }

            const size = this.sendUnreliablePacket(packet, sockAddr, hmacAuth);

            // WEBRTC TODO: Address further C++ code.

            return size;
        }

        if (param1 instanceof Node && param2 === null) {
            const destinationNode = param1;

            const activeSocket = destinationNode.getActiveSocket();
            if (activeSocket) {
                return this.sendPacket(packet, activeSocket, destinationNode.getAuthenticateHash());
            }

            console.log("[networking] LimitedNodeList.sendPacket called without active socket for node",
                NodeType.getNodeTypeName(destinationNode.getType()), "- not sending");
            return LimitedNodeList.#ERROR_SENDING_PACKET_BYTES;
        }

        if (param1 instanceof Node && param2 instanceof SockAddr) {
            const destinationNode = param1;
            const overridenSockAddr = param2;

            if (overridenSockAddr.isNull() && !destinationNode.getActiveSocket()) {
                console.log("[networking] LimitedNodeList.sendPacket called without active socket for node",
                    destinationNode.getUUID(), ". Not sending.");
                return LimitedNodeList.#ERROR_SENDING_PACKET_BYTES;
            }

            // Use the node's active socket as the destination socket if there is no overridden socket address.
            let destinationSockAddr = overridenSockAddr.isNull() ? destinationNode.getActiveSocket() : overridenSockAddr;
            if (destinationSockAddr === null) {
                destinationSockAddr = new SockAddr();
            }

            return this.sendPacket(packet, destinationSockAddr, destinationNode.getAuthenticateHash());
        }

        console.error("Invalid parameters in LimiteNodeList.sendPacket()!", typeof packet, typeof param1, typeof param2);
        return LimitedNodeList.#ERROR_SENDING_PACKET_BYTES;
    }

    /*@devdoc
     *  Broadcasts a packet to all nodes of specified types.
     *  @param {NLPacket} packet - The packet to broadcast.
     *  @param {Set<NodeTypeValue>} destinationNodeTypes - The types of nodes to broadcast the packet to.
     *  @returns {number} The number of nodes broadcast to.
     */
    broadcastToNodes(packet: NLPacket, destinationNodeTypes: Set<NodeTypeValue>): number {
        // C++  unsigned int broadcastToNodes(NLPacket* packet, const NodeSet& destinationNodeTypes)
        let n = 0;

        for (const node of this.#_nodeHash.values()) {
            if (destinationNodeTypes.has(node.getType())) {
                if (packet.isReliable()) {
                    const packetCopy = NLPacket.createCopy(packet);
                    this.sendPacket(packetCopy as NLPacket, node);
                } else {
                    this.sendUnreliablePacket(packet, node);
                }
                n += 1;
            }
        }

        return n;
    }

    /*@devdoc
     *  Gets the assignment client node of a specified type, if present.
     *  @param {NodeTypeValue} nodeType - The type of assignment client node to get.
     *  @returns {Node|null} The node of the requested type if there is one, <code>null</code> if there isn't one.
     */
    soloNodeOfType(nodeType: NodeTypeValue): Node | null {
        // C++  Node* soloNodeOfType(NodeType nodeType)
        for (const node of this.#_nodeHash.values()) {
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
        for (const node of this.#_nodeHash.values()) {
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

        const matchingNode = this.#_nodeHash.get(uuid.value());
        if (matchingNode) {

            // WebRTC: Retain current public and local socket ports (data channel IDs).
            publicSocket.setPort(matchingNode.getPublicSocket().getPort());
            localSocket.setPort(matchingNode.getLocalSocket().getPort());

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
        if (this.#SOLO_NODE_TYPES.has(nodeType)) {
            const oldNode = this.soloNodeOfType(nodeType);
            if (oldNode) {

                // WebRTC: Clean up old node's connection here before removing the node, rather than below.
                this._nodeSocket.cleanupConnection(oldNode.getPublicSocket());
                this._nodeSocket.cleanupConnection(oldNode.getLocalSocket());

                this.#removeOldNode(this.soloNodeOfType(nodeType));
            }

        }

        // WebRTC: Further calls to #removeOldNode() are not needed because user clients are only told of solo nodes, which are
        // handled above.

        // WebRTC: Old connections are cleaned up before removing any old node, above.

        // WEBRTC TODO: Address further C++ code.

        // Add the new node.
        const newNode = new Node(uuid, nodeType, publicSocket, localSocket);
        newNode.setIsReplicated(isReplicated);
        newNode.setIsUpstream(isUpstream || NodeType.isUpstream(nodeType));
        newNode.setConnectionSecret(connectionSecret);
        newNode.setPermissions(permissions);
        newNode.setLocalID(localID);

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeHash.set(newNode.getUUID().value(), newNode);

        // WEBRTC TODO: Address further C++ code.

        console.log("[networking] Added", NodeType.getNodeTypeName(newNode.getType()));

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeAdded.emit(newNode);

        // Signal when the network connection to the new node is established.
        if (newNode.getActiveSocket()) {
            this.#_nodeActivated.emit(newNode);
        } else {
            const callback = () => {
                this.#_nodeActivated.emit(newNode);
                newNode.socketActivated.disconnect(callback);
            };
            newNode.socketActivated.connect(callback);
        }

        // Signal when the node's socket changes so that we can reconnect.
        newNode.socketUpdated.connect((previousAddress, currentAddress) => {
            this.#_nodeSocketUpdated.emit(newNode);
            this._nodeSocket.handleRemoteAddressChange(previousAddress, currentAddress);
        });

        return newNode;
    }

    /*@devdoc
     *  Gets the node with a specified UUID.
     *  @param {Uuid} uuid - The UUID of the node to get.
     *  @returns {Node|null} The node with the specified UUID if found, <code>null</code> if not found.
     */
    nodeWithUUID(nodeUUID: Uuid): Node | null {
        // C++  Node* nodeWithUUID(const QUuid& nodeUUID)
        const matchingNode = this.#_nodeHash.get(nodeUUID.value());
        if (!matchingNode) {
            return null;
        }
        return matchingNode;
    }

    /*@devdoc
     *  Gets the node with a specified local ID.
     *  @param {number} localID - The local ID of the node to get.
     *  @returns {Node|null} The node with the specified local ID if found, <code>null</code> if not found.
     */
    nodeWithLocalID(localID: number): Node | null {
        // C++  Node* nodeWithLocalID(Node::LocalID localID)
        for (const node of this.#_nodeHash.values()) {
            if (node.getLocalID() === localID) {
                return node;
            }
        }
        return null;
    }

    /*@devdoc
     *  Applies a function to each node that satisfies a predicate.
     *  @param {NodePredicate} predicate - The predicate to test each node with.
     *  @param {NodeFunctor} functor - The function to apply to each node that passes the test.
     */
    eachMatchingNode(predicate: NodePredicate, functor: NodeFunctor): void {
        // C++  void eachMatchingNode(PredLambda predicate, NodeLambda functor) {
        for (const node of this.#_nodeHash.values()) {
            if (predicate(node)) {
                functor(node);
            }
        }
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
     *  Gets the node's UUID as assigned by the domain server for the connection session. {@link Uuid(1)|Uuid.NULL} when not
     *      connected to a domain.
     *  @returns {Uuid} The node's session UUID.
     */
    getSessionUUID(): Uuid {
        // C++  LocalID getSessionUUID()
        return this.#_sessionUUID;
    }

    /*@devdoc
     *  Sets the node's UUID as assigned by the domain server for the connection session. Set to {@link Uuid(1)|Uuid.NULL} when
     *      not connected to a domain.
     *  @param {Uuid} sessionUUID - The user client's session UUID.
     */
    setSessionUUID(sessionUUID: Uuid): void {
        // C++  void setSessionUUID(const QUuid& sessionUUID);
        const oldUUID = this.#_sessionUUID;
        this.#_sessionUUID = sessionUUID;

        if (sessionUUID.value() !== oldUUID.value()) {
            console.log("[networking] NodeList UUID changed from", oldUUID.stringify(), "to", sessionUUID.stringify());
            this.#_uuidChanged.emit(sessionUUID, oldUUID);
        }
    }

    /*@devdoc
     *  Gets the node's local ID as assigned by the domain server for the connection session. <code>0</code> when not connected
     *      to a domain.
     *  @returns {LocalID} The node's session local ID.
     */
    getSessionLocalID(): LocalID {
        // C++  LocalID getSessionLocalID()
        return this.#_sessionLocalID;
    }

    /*@devdoc
     *  Sets the node's local ID as assigned by the domain server for the connection session. Set to <code>0</code> when not
     *      connected to a domain.
     *  @param {LocalID} sessionLocalID - The node's session local ID.
     */
    setSessionLocalID(sessionLocalID: LocalID): void {
        // C++  void setSessionLocalID(LocalID sessionLocalID);
        this.#_sessionLocalID = sessionLocalID;
    }


    /*@devdoc
     *  Gets whether packet content should be authenticated. The default value is <code>true</code>.
     *  @returns {boolean} <code>true</code> if packet content should be authenticated, <code>false</code> if it shouldn't be.
     */
    getAuthenticatePackets(): boolean {
        return this._useAuthentication;
    }

    /*@devdoc
     *  Sets whether packet content should be authenticated.
     *  @param {boolean} useAuthentication - <code>true</code> if packet content should be authenticated, <code>false</code> if
     *      it shouldn't be.
     */
    setAuthenticatePackets(useAuthentication: boolean): void {
        this._useAuthentication = useAuthentication;
    }


    /*@devdoc
     *  Sends an {@link NLPacketList} to a node.
     *  @param {NLPacketList} packetList - The packet list to send.
     *  @param {Node} destinationNode - The node to send the packet list to.
     *  @returns {number} The number of bytes known to have been sent &mdash; <code>0</code> if the packet list has been queued
     *      to send reliably.
     */
    sendPacketList(packetList: NLPacketList, destinationNode: Node): number {  // eslint-disable-line class-methods-use-this
        // C++  qint64 sendPacketList(NLPacketList* packetList, const Node& destinationNode)

        const activeSocket = destinationNode.getActiveSocket();
        if (activeSocket) {
            packetList.closeCurrentPacket();

            const packets = packetList.getPackets();
            for (let i = 0; i < packets.length; i++) {
                assert(packets[i] !== undefined);
                const nlPacket = new NLPacket(packets[i]!);  // eslint-disable-line @typescript-eslint/no-non-null-assertion
                this.#fillPacketHeader(nlPacket, destinationNode.getAuthenticateHash());
            }

            return this._nodeSocket.writePacketList(packetList, activeSocket);
        }

        console.log(`[networking] LimitedNodeList.sendPacketList called without active socket for node
            ${destinationNode.getUUID().stringify()}. Not sending.`);
        return LimitedNodeList.#ERROR_SENDING_PACKET_BYTES;
    }

    /*@devdoc
     *  Sets whether outgoing network traffic not destined for the domain server should be dropped.
     *  @param {boolean} squelchOutgoingNodeTraffic - <code>true</code> if outgoing packets not destined for the domain server
     *      should be dropped, <code>false</code> if they should be sent.
     */
    setDropOutgoingNodeTraffic(squelchOutgoingNodeTraffic: boolean): void {
        // C++  void setDropOutgoingNodeTraffic(bool squelchOutgoingNodeTraffic)
        this.#_dropOutgoingNodeTraffic = squelchOutgoingNodeTraffic;
    }


    /*@devdoc
     *  Checks whether an address is belongs to a node. Used as a {@link Socket~connectionCreationFilterOperator}.
     *  @function LimitedNodeList.sockAddrBelongsToNode
     *  @param {SockAddr} sockAddr - The address to check.
     *  @returns {boolean} <code>true</code> if the address belongs to a node, <code>false</code> if it doesn't.
     */
    sockAddrBelongsToNode = (sockAddr: SockAddr): boolean => {
        // C++  bool sockAddrBelongsToNode(const SockAddr& sockAddr)

        for (const node of this.#_nodeHash.values()) {
            // Compare just the port numbers / WebRTC data channels because the Socket where this method is used doesn't know
            // the actual IP address.
            if (node.getPublicSocket().getPort() === sockAddr.getPort()
                    || node.getLocalSocket().getPort() === sockAddr.getPort()) {
                return true;
            }
        }
        return false;
    };


    /*@devdoc
     *  Resets the NodeList, closing all connections and deleting all node data.
     *  @function LimitedNodeList.reset
     *  @type {Slot}
     *  @param {string} reason - The reason for resetting.
     */
    reset(reason: string): void {
        // C++  void reset(QString reason)
        // Cannot declare this Slot function as an arrow function because derived NodeList class calls this function.
        this.#eraseAllNodes(reason);
        this._nodeSocket.clearConnections();

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Triggered when the user client's session UUID changes.
     *  @function LimitedNodeList.uuidChanged
     *  @param {Uuid} newUUID - The new session UUID. {@link Uuid(1)|Uuid.NULL} if not connected to a domain.
     *  @param {Uuid} oldUUID - The old session UUID.
     *  @returns {Signal}
     */
    get uuidChanged(): Signal {
        // C++  void uuidChanged(const QUuid& ownerUUID, const QUuid& oldUUID)
        return this.#_uuidChanged.signal();
    }

    /*@devdoc
     *  Triggered when a new node is added.
     *  @function LimitedNodeList.nodeAdded
     *  @param {Node} node - The node added.
     *  @returns {Signal}
     */
    get nodeAdded(): Signal {
        // C++  void nodeAdded(Node* node);
        return this.#_nodeAdded.signal();
    }

    /*@devdoc
     *  Triggered when the network connection to a node is established.
     *  @function LimitedNodeList.nodeActivated
     *  @param {Node} node - The node that activated.
     *  @returns {Signal}
     */
    get nodeActivated(): Signal {
        // C++  void nodeActivated(Node* node);
        return this.#_nodeActivated.signal();
    }

    /*@devdoc
     *  Triggered when a node's public or local socket address is updated.
     *  @function LimitedNodeList.nodeSocketUpdated
     *  @param {Node} node - The node that had updated its public or local socket address.
     *  @returns {Signal}
     */
    get nodeSocketUpdated(): Signal {
        // C++  void nodeSocketUpdated(Node* node);
        return this.#_nodeSocketUpdated.signal();
    }

    /*@devdoc
     *  Triggered when a node is killed.
     *  @function LimitedNodeList.nodeKilled
     *  @param {Node} node - The node killed.
     *  @returns {Signal}
     */
    get nodeKilled(): Signal {
        // C++  void nodeKilled(Node* node);
        return this.#_nodeKilled.signal();
    }

    /*@devdoc
     *  Triggered when there's a packet version mismatch in a packet received.
     *  @function LimitedNodeList.packetVersionMismatch
     *  @param {PacketTypeValue} packetType - The type of packet received.
     *  @param {SockAddr} senderSockAddr - The address of the packet sender.
     *  @param {Uuid} senderUUID - The session ID of the sender.
     *  @returns {Signal}
     */
    get packetVersionMismatch(): Signal {
        // C++  void packetVersionMismatch(PacketType type, const SockAddr& senderSockAddr, const QUuid& senderUUID)
        return this.#_packetVersionMismatch.signal();
    }


    protected addNewNode(info: NewNodeInfo): void {  // eslint-disable-line class-methods-use-this
        // C++  void addNewNode(NewNodeInfo info);

        // WEBRTC TODO: Address further C++ code.

        // WebRTC: The public and local SockAddrs provided are the assignment clients' UDP SockAddrs. Use their IP addresses as
        // nominal WebRTC addresses but leave their ports to be filled in later - either when updating an existing node or when
        // the WebRTC connection is made (NodeList.#activateSocketFromNodeCommunication()).
        const publicSocket = new SockAddr(SocketType.WebRTC, info.publicSocket.getAddress(), 0);
        const localSocket = new SockAddr(SocketType.WebRTC, info.localSocket.getAddress(), 0);

        this.addOrUpdateNode(info.uuid, info.type, publicSocket, localSocket, info.sessionLocalID, info.isReplicated,
            false, info.connectionSecretUUID, info.permissions);

        // WEBRTC TODO: Address further C++ code.

    }

    // eslint-disable-next-line
    // @ts-ignore
    protected handleNodeKill(node: Node, nextConnectionID = this.#NULL_CONNECTION_ID): void {  // eslint-disable-line
        // C++  void handleNodeKill(const SharedNodePointer& node, ConnectionID nextConnectionID = NULL_CONNECTION_ID)

        // WEBRTC TODO: Address further C++ code.

        console.log("[networking] Killed", NodeType.getNodeTypeName(node.getType()), node.getUUID().stringify(),
            node.getPublicSocket().toString(), "/", node.getLocalSocket().toString());

        // Ping timer N/A.

        this.#_nodeKilled.emit(node);

        const activeSocket = node.getActiveSocket();
        if (activeSocket) {
            this._nodeSocket.cleanupConnection(activeSocket);
        }

        // WEBRTC TODO: Address further C++ code.

    }

    protected killNodeWithUUID(nodeUUID: Uuid, newConnectionID = this.#NULL_CONNECTION_ID): boolean {
        // C++  bool killNodeWithUUID(const QUuid& nodeUUID, ConnectionID newConnectionID  = NULL_CONNECTION_ID)
        const matchingNode = this.nodeWithUUID(nodeUUID);
        if (matchingNode) {

            // WEBRTC TODO: Address further C++ code.

            this.#_nodeHash.delete(matchingNode.getUUID().value());
            this.handleNodeKill(matchingNode, newConnectionID);
            return true;
        }
        return false;
    }


    #fillPacketHeader(packet: NLPacket, hmacAuth: HMACAuth | null): void {
        // C++  void fillPacketHeader(const NLPacket& packet, HMACAuth* hmacAuth = nullptr) {
        const packetType = packet.getType();

        if (!PacketType.getNonSourcedPackets().has(packetType)) {
            packet.writeSourceID(this.getSessionLocalID());
        }

        if (this._useAuthentication && hmacAuth
                && !PacketType.getNonSourcedPackets().has(packetType)
                && !PacketType.getNonVerifiedPackets().has(packetType)) {
            packet.writeVerificationHash(hmacAuth);
        }
    }

    #removeOldNode(node: Node | null): void {
        // C++  auto removeOldNode = [&](auto node)
        if (!node) {
            return;
        }

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeHash.delete(node.getUUID().value());
        this.handleNodeKill(node);
    }

    #eraseAllNodes(reason: string): void {
        // C++  void eraseAllNodes(QString reason)
        const killedNodes = [];

        if (this.#_nodeHash.size > 0) {
            console.log("[networking] Removing all nodes from nodes list:", reason);
            for (const node of this.#_nodeHash.values()) {
                killedNodes.push(node);
            }
        }

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeHash.clear();

        for (const node of killedNodes) {
            this.handleNodeKill(node);
        }

        // WEBRTC TODO: Address further C++ code.

    }

    #isPacketVerifiedWithSource(packet: Packet, sourceNode: Node | null = null): boolean {
        // C++  bool isPacketVerifiedWithSource(const Packet& packet, Node* sourceNode)
        // We track bandwidth when doing packet verification to avoid needing to do a node lookup later when we already do it in
        // packetSourceAndHashMatchAndTrackBandwidth.
        return this.#packetVersionMatch(packet) && this.#packetSourceAndHashMatchAndTrackBandwidth(packet, sourceNode);
    }

    #packetVersionMatch(packet: Packet): boolean {
        // C++  bool packetVersionMatch(const Packet& packet)
        const headerType = NLPacket.typeInHeader(packet);
        const headerVersion = NLPacket.versionInHeader(packet);

        if (headerVersion !== PacketType.versionForPacketType(headerType)) {
            let hasBeenOutput = false;
            let senderString = "";
            const senderSockAddr = packet.getMessageData().senderSockAddr ?? new SockAddr();
            let sourceID = new Uuid();

            if (PacketType.getNonSourcedPackets().has(headerType)) {
                const item = senderSockAddr.toString() + headerType.toString();
                hasBeenOutput = LimitedNodeList.#versionDebugSuppressMap.has(item);
                if (!hasBeenOutput) {
                    LimitedNodeList.#versionDebugSuppressMap.add(item);
                    senderString = senderSockAddr.toString();
                }
            } else {
                const sourceNode = this.nodeWithLocalID(NLPacket.sourceIDInHeader(packet));
                if (sourceNode) {
                    sourceID = sourceNode.getUUID();
                    const item = sourceID.toString() + headerType.toString();
                    hasBeenOutput = LimitedNodeList.#sourcedVersionDebugSuppressMap.has(item);
                    if (!hasBeenOutput) {
                        LimitedNodeList.#sourcedVersionDebugSuppressMap.add(item);
                        senderString = sourceID.stringify();
                    }
                }
            }

            if (!hasBeenOutput) {
                console.log("[networking]  Packet version mismatch on", headerType, "- Sender", senderString, "sent",
                    headerVersion, "but", PacketType.versionForPacketType(headerType), "expected.");
                this.#_packetVersionMismatch.emit(headerType, senderSockAddr, sourceID);
            }

            return false;
        }

        return true;
    }

    #packetSourceAndHashMatchAndTrackBandwidth(packet: Packet, sourceNodeIn: Node | null): boolean {
        // C++ bool packetSourceAndHashMatchAndTrackBandwidth(const Packet& packet, Node* sourceNode)

        // In the Web SDK, sourceNode is always null because it is operating as a client.
        let sourceNode = sourceNodeIn;
        assert(sourceNode === null);

        const headerType = NLPacket.typeInHeader(packet);

        if (PacketType.getNonSourcedPackets().has(headerType)) {
            if ([...PacketType.getReplicatedPacketMapping()].findIndex(([, value]) => {
                return value === headerType;
            }) !== -1) {
                // This is a replicated packet type - make sure the socket that sent it to us matches one from one of our
                // current upstream nodes

                let sendingNodeType = NodeType.Unassigned;
                const senderSockAddr = packet.getMessageData().senderSockAddr;
                if (senderSockAddr) {
                    this.#_nodeHash.forEach((key) => {
                        if (key.getPublicSocket().isEqualTo(senderSockAddr)) {
                            sendingNodeType = key.getType();
                        }
                    });
                }

                if (sendingNodeType !== NodeType.Unassigned) {
                    return true;
                }
                console.log("[networking] Replicated packet of type", headerType, "received from unknown upstream",
                    senderSockAddr?.toString());
                return false;

            }

            return true;
        }

        let sourceLocalID = Node.NULL_LOCAL_ID;

        // Check if we were passed a sourceNode hint or if we need to look it up.
        if (!sourceNode) {
            // Figure out which node this is from
            sourceLocalID = NLPacket.sourceIDInHeader(packet);

            sourceNode = this.nodeWithLocalID(sourceLocalID);
        }

        const sourceID = sourceNode?.getUUID();

        if (!sourceNode
            && !this.isDomainServer()
            && sourceLocalID === this.getDomainLocalID()
            && packet.getMessageData().senderSockAddr?.isEqualTo(this.getDomainSockAddr())
            && PacketType.getDomainSourcedPackets().has(headerType)) {
            // This is a packet sourced by the domain server.
            return true;
        }

        if (sourceNode) {

            // WEBRTC TODO: Address further C++ code. - Verify received packet.

            return true;
        }

        if (!this.#isDelayedNode(sourceID)) {
            console.log("[networking] Packet of type", headerType, "received from unknown node with Local ID",
                sourceLocalID);
        }

        return false;
    }

    // eslint-disable-next-line
    // @ts-ignore
    #isDelayedNode(sourceID: Uuid | undefined): boolean {  // eslint-disable-line

        // WEBRTC TODO: Address further C++ code.

        return false;
    }


    // Callback.
    #isPacketVerified = (packet: Packet): boolean => {
        // C++  bool isPacketVerified(const Packet& packet)
        return this.#isPacketVerifiedWithSource(packet);
    };

}

export default LimitedNodeList;
export type { NewNodeInfo, NodeFunctor, NodePredicate };
