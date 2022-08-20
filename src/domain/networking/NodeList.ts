//
//  NodeList.ts
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import assert from "../shared/assert";
import ContextManager from "../shared/ContextManager";
import Uuid from "../shared/Uuid";
import PacketScribe from "./packets/PacketScribe";
import PacketType, { protocolVersionsSignature } from "./udt/PacketHeaders";
import Socket from "./udt/Socket";
import AddressManager from "./AddressManager";
import DomainHandler from "./DomainHandler";
import FingerprintUtils from "./FingerprintUtils";
import LimitedNodeList from "./LimitedNodeList";
import NLPacket from "./NLPacket";
import Node from "./Node";
import NodeType, { NodeTypeValue } from "./NodeType";
import PacketReceiver from "./PacketReceiver";
import ReceivedMessage from "./ReceivedMessage";
import SockAddr from "./SockAddr";


/*@devdoc
 *  The <code>NodeList</code> class manages the domain server plus all the nodes (assignment clients) that the client is
 *  connected to. This includes their presence and communications with them via the Vircadia protocol.
 *  <p>C++: <code>NodeList : LimitedNodeList</code></p>
 *
 *  @class NodeList
 *  @extends LimitedNodeList
 *  @property {string} contextItemType="NodeList" - The type name for use with the {@link ContextManager}.
 *      <p><em>Static. Read-only.</em></p>
 *
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *  @param {NodeType} [ownerType=Agent] - The type of object that the NodeList is being used in.
 */
class NodeList extends LimitedNodeList {
    // C++  NodeList : public LimitedNodeList

    static readonly contextItemType = "NodeList";


    #_ownerType = NodeType.Agent;
    #_connectReason = LimitedNodeList.ConnectReason.Connect;
    #_nodeTypesOfInterest: Set<NodeTypeValue> = new Set();

    #_domainHandler: DomainHandler;

    // Context objects.
    #_addressManager;


    constructor(contextID: number) {
        // C++  NodeList(int socketListenPort = INVALID_PORT, int dtlsListenPort = INVALID_PORT);

        super(contextID);

        // WEBRTC TODO: Address further C++ code.

        this.#_domainHandler = new DomainHandler(this);

        // WEBRTC TODO: Address further C++ code.

        this.#_addressManager = ContextManager.get(contextID, AddressManager) as AddressManager;
        this.#_addressManager.possibleDomainChangeRequired.connect(this.#_domainHandler.setURLAndID);

        // WEBRTC TODO: Address further C++ code.

        // Handle a request for a path change from the AddressManager.
        this.#_addressManager.pathChangeRequired.connect(this.#handleDSPathQuery);

        // We didn't have a connection to the domain server when a path change was requested; send the path change when we get
        // a connection.
        this.#_domainHandler.connectedToDomain.connect(this.#sendPendingDSPathQuery);


        // WEBRTC TODO: Address further C++ code.

        // clear our NodeList when the domain changes
        this.#_domainHandler.disconnectedFromDomain.connect(this.#resetFromDomainHandler);

        // WEBRTC TODO: Address further C++ code.

        // Whenever there is a new node connect to it.
        this.nodeAdded.connect(this.#startNodeHolePunch);
        this.nodeSocketUpdated.connect(this.#startNodeHolePunch);

        // Whenever we get a new node we may need to re-send our set of ignored nodes to it.
        this.nodeActivated.connect(this.#maybeSendIgnoreSetToNode);

        // WEBRTC TODO: Address further C++ code.

        this._nodeSocket.setConnectionCreationFilterOperator(this.sockAddrBelongsToDomainOrNode);

        // WEBRTC TODO: Address further C++ code.

        this.#_domainHandler.limitOfSilentDomainCheckInsReached.connect(() => {
            if (this.#_connectReason !== LimitedNodeList.ConnectReason.Awake) {
                this.#_connectReason = LimitedNodeList.ConnectReason.SilentDomainDisconnect;
            }
        });

        this._packetReceiver.registerListener(PacketType.DomainList,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainList));
        this._packetReceiver.registerListener(PacketType.Ping,
            PacketReceiver.makeSourcedListenerReference(this.processPingPacket));

        // WEBRTC TODO: Address further C++ code.

        this._packetReceiver.registerListener(PacketType.DomainServerAddedNode,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainServerAddedNode));
        this._packetReceiver.registerListener(PacketType.DomainConnectionDenied,
            PacketReceiver.makeUnsourcedListenerReference(this.#_domainHandler.processDomainServerConnectionDeniedPacket));

        // WEBRTC TODO: Address further C++ code.

        this._packetReceiver.registerListener(PacketType.DomainServerPathResponse,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainServerPathResponse));
        this._packetReceiver.registerListener(PacketType.DomainServerRemovedNode,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainServerRemovedNode));

        // WEBRTC TODO: Address further C++ code.

    }


    // JSDoc is in LimitedNodeList.
    override isDomainServer(): boolean {  // eslint-disable-line class-methods-use-this
        // C++  bool isDomainServer()
        return false;
    }

    // JSDoc is in LimitedNodeList.
    override getDomainLocalID(): number {
        // C++  LocalID getDomainLocalID()
        return this.#_domainHandler.getLocalID();
    }

    // JSDoc is in LimitedNodeList.
    override getDomainSockAddr(): SockAddr {
        // C++  SockAddr getDomainSockAddr()
        return this.#_domainHandler.getSockAddr();
    }

    /*@devdoc
     *  Gets the domain handler used by the NodeList.
     *  @function NodeList.getDomainHandler
     *  @returns {DomainHandler} The domain handler.
     */
    getDomainHandler(): DomainHandler {
        // C++  DomainHandler& getDomainHandler()
        return this.#_domainHandler;
    }

    /*@devdoc
     *  Adds node types to the set of those that the NodeList will connect to.
     *  @function NodeList.addSetOfNodeTypesToNodeInterestSet
     *  @param {Set<NodeType>} setOfNodeTypes - The node types to add to the interest set.
     */
    addSetOfNodeTypesToNodeInterestSet(setOfNodeTypes: Set<NodeTypeValue>): void {
        // C++  void addSetOfNodeTypesToNodeInterestSet(const NodeSet& setOfNodeTypes)
        for (const nodeType of setOfNodeTypes) {
            this.#_nodeTypesOfInterest.add(nodeType);
        }
    }

    /*@devdoc
     *  Gets the node types that the NodeList will connect to.
     *  @function NodeList.getNodeInterestSet
     *  @returns {Set<NodeType>} The node types in the interest set.
     */
    getNodeInterestSet(): Set<NodeTypeValue> {
        // C++  NodeSet& getNodeInterestSet() const { return _nodeTypesOfInterest; }
        return this.#_nodeTypesOfInterest;
    }

    // eslint-disable-next-line
    // @ts-ignore
    isIgnoringNode(nodeID: Uuid): boolean {  // eslint-disable-line
        //  C++ bool isIgnoringNode(const QUuid& nodeID)

        // WEBRTC TODO: Address further C++ code - ignore specified nodes.

        return false;
    }

    // eslint-disable-next-line
    // @ts-ignore
    getRequestsDomainListData(): boolean {  // eslint-disable-line
        // C++  bool getRequestsDomainListData()

        // WEBRTC TODO: Address further C++ code - request domain list data.

        return false;
    }


    /*@devdoc
     *  Processes a {@link PacketType(1)|DomainList} message received from the domain server.
     *  @function NodeList.processDomainList
     *  @param {ReceivedMessage} message - The DomainList message.
     *  @type {Listener}
     */
    processDomainList = (message: ReceivedMessage): void => {
        // C++  processDomainList(ReceivedMessage* message)

        // WEBRTC TODO: This should involve a NLPacketList, not just a single NLPacket.

        const info = PacketScribe.DomainList.read(message.getMessage());

        // WEBRTC TODO: Address further C++ code.

        if (info.newConnection) {

            // WEBRTC TODO: Address further C++ code.

            this.#_connectReason = LimitedNodeList.ConnectReason.Connect;
        }

        // WEBRTC TODO: Address further C++ code.

        // This is a packet from the domain server; resume normal connection.
        this.#_domainHandler.clearPendingCheckins();
        this.setDropOutgoingNodeTraffic(false);

        // WEBRTC TODO: Address further C++ code.

        this.setSessionLocalID(info.newLocalID);
        this.setSessionUUID(info.newUUID);

        // WEBRTC TODO: Address further C++ code.

        if (!this.#_domainHandler.isConnected()) {
            this.#_domainHandler.setLocalID(info.domainLocalID);
            this.#_domainHandler.setUUID(info.domainUUID);
            this.#_domainHandler.setIsConnected(true);

            // WEBRTC TODO: Address further C++ code.

        }

        // WEBRTC TODO: Address further C++ code.

        this.setAuthenticatePackets(info.isAuthenticated);

        for (const node of info.nodes) {
            // If the public socket address is 0 then it's reachable at the same IP as the domain server.
            if (node.publicSocket.getAddress() === 0) {
                node.publicSocket.setAddress(this.#_domainHandler.getSockAddr().getAddress());
            }

            this.addNewNode(node);
        }

    };

    /*@devdoc
     *  Processes a {@link PacketType(1)|DomainServerAddedNode} message received from the doman server.
     *  @function NodeList.processDomainServerAddedNode
     *  @type {Listener}
     *  @param {ReceivedMessage} message - The DomainServerAddedNode message.
     */
    processDomainServerAddedNode = (message: ReceivedMessage): void => {
        // C++  void processDomainServerAddedNode(QSharedPointer<ReceivedMessage> message)

        const info = PacketScribe.DomainServerAddedNode.read(message.getMessage());

        // If the public socket address is 0 then it's reachable at the same IP as the domain server.
        if (info.publicSocket.getAddress() === 0) {
            info.publicSocket.setAddress(this.#_domainHandler.getSockAddr().getAddress());
        }

        this.addNewNode(info);
    };

    /*@devdoc
     *  Processes a {@link PacketType(1)|DomainServerRemovedNode} message received from the domain server.
     *  @function NodeList.processDomainServerRemovedNode
     *  @type {Listener}
     *  @param {ReceivedMessage} message - The DomainServerRemovedNode message.
     */
    processDomainServerRemovedNode = (message: ReceivedMessage): void => {
        // C++  void processDomainServerRemovedNode(ReceivedMessage* message)
        const info = PacketScribe.DomainServerRemovedNode.read(message.getMessage());
        const nodeUUID = info.nodeUUID;
        console.log("[networking] Received packet from domain-server to remove node with UUID", nodeUUID.stringify());
        this.killNodeWithUUID(nodeUUID);

        // WEBRTC TODO: Address further C++ code.

    };

    /*@devdoc
     *  Processes a {@link PacketType(1)|Ping} packet received from an assignment client.
     *  @function NodeList.processPingPacket
     *  @type {Listener}
     *  @param {ReceivedMessage} message - The Ping message.
     *  @param {Node} sendingNode - The assignment client that sent the ping.
     */
    processPingPacket = (message: ReceivedMessage, sendingNode: Node | null): void => {
        // C++  void processPingPacket(ReceivedMessage* message, Node* sendingNode)
        assert(sendingNode !== null);

        const MS_TO_USEC = 1000n;

        const info = PacketScribe.Ping.read(message.getMessage());

        const replyPacket = PacketScribe.PingReply.write({
            pingType: info.pingType,
            timestampPing: info.timestamp,
            timestampReply: BigInt(Date.now()) * MS_TO_USEC
        });
        this.sendPacket(replyPacket, sendingNode, message.getSenderSockAddr());

        // WEBRTC TODO: Address further C++ code.

        /*
        int64_t connectionID;
        message -> readPrimitive(& connectionID);

        auto it = _connectionIDs.find(sendingNode -> getUUID());
        if (it != _connectionIDs.end()) {
            if (connectionID > it -> second) {
                qDebug() << "Received a ping packet with a larger connection id (" << connectionID << ">" << it -> second
                    << ") from " << sendingNode -> getUUID();
                killNodeWithUUID(sendingNode -> getUUID(), connectionID);
            }
        }
        */

        // WEBRTC TODO: Move this to processPingReplyPacket() when implement sending pings to the assignment client.
        this.#activateSocketFromNodeCommunication(message, sendingNode);

    };

    /*@devdoc
     *  Processes a {@link PacketType(1)|DomainServerPathResponse} packet received from the domain server in response to a
     *  {@link PacketType(1)|DomainServerPathQuery} packet sent. No response is received if there is no such path set on the
     *  domain.
     *  @function NodeList.processDomainServerPathResponse
     *  @type {Listener}
     *  @param {ReceivedMessage} message - The DomainServerPathResponse message.
     */
    processDomainServerPathResponse = (message: ReceivedMessage): void => {
        // C++  void NodeList::processDomainServerPathResponse(QSharedPointer<ReceivedMessage> message)

        // This is a response to a path query we theoretically made.
        // In the future we may want to check that this was actually from our DS and for a query we actually made.

        const info = PacketScribe.DomainServerPathResponse.read(message.getMessage());
        assert(info.pathQuery.length > 0 && info.viewpoint.length > 0);

        // Hand it off to the AddressManager to handle.
        if (this.#_addressManager.goToViewpointForPath(info.viewpoint, info.pathQuery)) {
            console.log(`Going to viewpoint ${info.viewpoint} as lookup result for path ${info.pathQuery}.`);
        } else {
            console.log(`Could not got to viewpoint ${info.viewpoint} as lookup result for path ${info.pathQuery}.`);
        }
    };


    /*@devdoc
     *  Checks whether an address is belongs to the domain or a node. Used as a {@link Socket~connectionCreationFilterOperator}.
     *  @function NodeList.sockAddrBelongsToNode
     *  @param {SockAddr} sockAddr - The address to check.
     *  @returns {boolean} <code>true</code> if the address belongs to the domain or a node, <code>false</code> if it doesn't.
     */
    sockAddrBelongsToDomainOrNode = (sockAddr: SockAddr): boolean => {
        // C++  bool sockAddrBelongsToDomainOrNode(const SockAddr& sockAddr)

        // Compare just the port numbers / WebRTC data channels because the Socket where this method is used doesn't know
        // the actual IP address.

        return this.#_domainHandler.getSockAddr().getPort() === sockAddr.getPort() || this.sockAddrBelongsToNode(sockAddr);
    };

    /*@devdoc
     *  Resets the LimitedNodeList, closing all connections and deleting all node data.
     *  @function NodeList.reset
     *  @type {Slot}
     *  @param {string} reason - The reason for resetting.
     *  @param {boolean} [skipDomainHandlerReset=false] - <code>true</code> if should skip clearing DomainHandler information,
     *      e.g., if the DomainHandler initiated the reset; <code>false</code> if should clear DomainHandler information.
     */
    override reset = (reason: string, skipDomainHandlerReset = false): void => {
        // C++  void reset(QString reason, bool skipDomainHandlerReset = false);

        super.reset(reason);

        // WEBRTC TODO: Address further C++ code.

        if (!skipDomainHandlerReset) {
            this.#_domainHandler.softReset(reason);
        }

        // WEBRTC TODO: Address further C++ code.

        this.setSessionUUID(new Uuid());
        this.setSessionLocalID(0);

        // WEBRTC TODO: Address further C++ code.

    };

    /*@devdoc
     *  Performs a check-in with the domain server to connect with a {@link PacketType(1)|DomainConnectRequest} packet or keep a
     *  connection alive with a {@link PacketType(1)|DomainListRequest} packet. This method should be called by the client once
     *  every second.
     *  @function NodeList.sendDomainServerCheckIn
     *  @type {Slot}
     */
    sendDomainServerCheckIn = (): void => {
        // C++  void sendDomainServerCheckIn()

        // C++ _sendDomainServerCheckInEnabled code is N/A because it's relevant only to Android.

        // WEBRTC TODO: Address further C++ code - shutting down.

        // The web client uses the domain URL rather than IP address.
        const domainURL = this.#_domainHandler.getURL();
        if (domainURL.isEmpty() || !domainURL.isValid() || this.#_domainHandler.checkInPacketTimeout()) {
            return;
        }

        // We don't need to worry about getting our publicSockAddress because WebRTC handles this.
        // We don't need to worry about the domain handler requiring ICE because WebRTC handles this.
        // Instead, we open the WebRTC signaling and data channels if not already open.

        // Open a WebRTC data channel to the domain server if not already open.
        const domainServerSocketState = this._nodeSocket.getSocketState(domainURL, NodeType.DomainServer);
        if (domainServerSocketState !== Socket.CONNECTED) {
            if (domainServerSocketState === Socket.UNCONNECTED) {
                this._nodeSocket.openSocket(domainURL, NodeType.DomainServer, (socketID: number) => {
                    this.#_domainHandler.setPort(socketID);
                });
            }
            return;
        }

        const isDomainConnected = this.#_domainHandler.isConnected();
        const domainPacketType = isDomainConnected ? PacketType.DomainListRequest : PacketType.DomainConnectRequest;
        const domainSockAddr = this.#_domainHandler.getSockAddr();

        if (!isDomainConnected) {
            const hostname = this.#_domainHandler.getURL().host();
            const connectReason = LimitedNodeList.connectReasonToString(this.#_connectReason);
            console.log("[networking] Sending connect request ( REASON:", connectReason, ") to domain-server at", hostname);

            // WEBRTC TODO: Address further C++ code - localhost port.

        }

        // WEBRTC TODO: Address further C++ code - user name signature.

        // Data common to DomainConnectRequest and DomainListRequest.
        const currentTime = BigInt(Date.now().valueOf());
        const ownerType = this.#_ownerType;
        const publicSockAddr = super.getPublicSockAddr();
        const localSockAddr = super.getLocalSockAddr();

        const nodeTypesOfInterest = this.#_nodeTypesOfInterest;
        const placeName = this.#_addressManager.getPlaceName();
        let username = undefined;
        let usernameSignature = undefined;
        const domainUsername = undefined;
        const domainTokens = undefined;
        if (!isDomainConnected) {
            username = "";
            usernameSignature = new Uint8Array(new ArrayBuffer(0));

            // WEBRTC TODO: Address further C++ code.

        }


        // Create and send packet.
        let packet: NLPacket | undefined = undefined;
        if (domainPacketType === PacketType.DomainConnectRequest) {

            // Data unique to DomainConnectRequest.
            const connectUUID = new Uuid(Uuid.NULL);  // Always Uuid.NULL for a web client.
            // Ignore ICE code because the Web client didn't use ICE to discover the domain server.
            const protocolVersionSig = protocolVersionsSignature();
            // WEBRTC TODO: Get MAC address.
            const hardwareAddress = "";
            const machineFingerprint = FingerprintUtils.getMachineFingerprint();
            // WEBRTC TODO: Get compressed system info.
            const compressedSystemInfo = new Uint8Array(new ArrayBuffer(0));
            const connectReason = this.#_connectReason;
            // WEBRTC TODO: Calculate previousConnectionUpdate value.
            const previousConnectionUptime = BigInt(0);

            // Write the packet.
            packet = PacketScribe.DomainConnectRequest.write({
                connectUUID,
                protocolVersionSig,
                hardwareAddress,
                machineFingerprint,
                compressedSystemInfo,
                connectReason,
                previousConnectionUptime,
                currentTime,
                ownerType,
                publicSockAddr,
                localSockAddr,
                nodeTypesOfInterest,
                placeName,
                isDomainConnected,
                username,
                usernameSignature,
                domainUsername,
                domainTokens
            });

        } else {

            packet = PacketScribe.DomainListRequest.write({
                currentTime,
                ownerType,
                publicSockAddr,
                localSockAddr,
                nodeTypesOfInterest,
                placeName,
                isDomainConnected,
                username,
                usernameSignature,
                domainUsername,
                domainTokens
            });

        }

        // Send duplicate check-ins in the exponentially increasing sequence 1, 1, 2, 4, ... for increased resilience.
        const MAX_CHECKINS_TOGETHER = 20;
        const outstandingCheckins = this.#_domainHandler.getCheckInPacketsSinceLastReply();

        let checkinCount = outstandingCheckins > 1 ? 2 ** (outstandingCheckins - 2) : 1;
        checkinCount = Math.min(checkinCount, MAX_CHECKINS_TOGETHER);
        for (let i = 1; i < checkinCount; i += 1) {
            this.sendPacket(packet, domainSockAddr);
        }
        this.sendPacket(packet, domainSockAddr);
    };


    // eslint-disable-next-line
    // @ts-ignore
    #activateSocketFromNodeCommunication(message: ReceivedMessage, sendingNode: Node) {  // eslint-disable-line
        // C++  void activateSocketFromNodeCommunication(ReceivedMessage& message, const Node* sendingNode)

        // WebRTC: Just use the node's public socket for WebRTC, for now.
        if (sendingNode.getActiveSocket() === null) {
            sendingNode.activatePublicSocket();
        }

        // WEBRTC TODO: Address public, local, and symmetric sockets w.r.t. WebRTC and the Web SDK.

        // WEBRTC TODO: Address further C++ code. Audio mixer.
    }

    #sendDSPathQuery(newPath: string): void {
        // C++  void NodeList::sendDSPathQuery(const QString& newPath) {

        // Only send a path query if we're connected to the domain server.
        if (this._nodeSocket.getSocketState(this.#_domainHandler.getURL(), NodeType.DomainServer) === Socket.CONNECTED) {

            const pathQueryPacket = PacketScribe.DomainServerPathQuery.write({
                path: newPath
            });

            // Only send packet if the path was written.
            if (pathQueryPacket.getMessageData().packetSize
                > NLPacket.totalNLHeaderSize(PacketType.DomainServerPathQuery, false)) {
                console.log("[networking] Sending a path query for", newPath, "to domain server at",
                    this.#_domainHandler.getSockAddr().toString());
                this.sendPacket(pathQueryPacket, this.#_domainHandler.getSockAddr());
            } else {
                console.log(`[Networking] Path too long for path query packet:`, newPath);
            }

        }
    }


    // Slot.
    #startNodeHolePunch = (node: Node): void => {
        // C++  void startNodeHolePunch(const Node* node);
        // While we don't need to do hole punching per se because WebRTC handles this, we initiate opening the WebRTC data
        // channel and adopt the native client's use of pings and replies to coordinate setting up communications with the
        // assignment client.

        // WebRTC: Initiate opening the WebRTC data channel.
        if (this._nodeSocket.getSocketState(this.#_domainHandler.getURL(), node.getType()) === Socket.UNCONNECTED) {

            if (!this.#_domainHandler.isConnected()) {
                // Cannot connect to an assignment client if the domain server isn't connected.
                return;
            }

            this._nodeSocket.openSocket(this.#_domainHandler.getURL(), node.getType(), (socketID) => {
                // We could in theory call #activateSocketFromNodeCommunication() here, however this is too soon for other
                // user client / assignment client interactions.

                // WebRTC: Fill in the public and local SockAddrs with the port just opened.
                node.getPublicSocket().setPort(socketID);
                node.getLocalSocket().setPort(socketID);
            });

        } else {
            console.error("Unexpected socket state for", NodeType.getNodeTypeName(node.getType()));
        }

        // Vircadia clients can never have upstream nodes or downstream nodes so we don't need to cater for these.

        // WEBRTC TODO: Implement the native client's ping timer and response handling to call
        // #activateSocketFromNodeCommunication().
        // In the interim we piggyback on the Ping packets received from the assignment client in processPingPacket(). However,
        // this is most likely makes setting up the connection less responsive.

        // Vircadia clients can never have upstream nodes or downstream nodes so we don't need to cater for these.
    };

    // Slot.
    #handleDSPathQuery = (newPath: string): void => {
        // C++  void handleDSPathQuery(const QString& newPath)

        // WEBRTC TODO: Address further C++ code. Serverless domains.

        if (this._nodeSocket.getSocketState(this.#_domainHandler.getURL(), NodeType.DomainServer) === Socket.CONNECTED) {
            // If we have an open domain server socket we send it off right away.
            this.#sendDSPathQuery(newPath);
        } else {
            // Otherwise send it once a connection is established.
            this.#_domainHandler.setPendingPath(newPath);
        }
    };

    // Slot.
    #sendPendingDSPathQuery = (): void => {
        // C++  void sendPendingDSPathQuery()

        const pendingPath = this.#_domainHandler.getPendingPath();

        if (pendingPath !== "") {

            // WEBRTC TODO: Address further C++ code. Serverless domains.

            console.log(`[networking] Attempting to send pending query to domain server for path ${pendingPath}.`);
            this.#sendDSPathQuery(pendingPath);

            this.#_domainHandler.clearPendingPath();
        }
    };

    // Slot.
    #resetFromDomainHandler = (): void => {
        // C++  void resetFromDomainHandler()
        this.reset("Reset from Domain Handler", true);
    };

    // Slot.
    // eslint-disable-next-line
    // @ts-ignore
    #maybeSendIgnoreSetToNode = (newNode: Node): void => {  // eslint-disable-line @typescript-eslint/no-unused-vars
        // C++  void NodeList::maybeSendIgnoreSetToNode(Node* newNode)

        // WEBRTC TODO: Address further C++.

    };

}

export default NodeList;
