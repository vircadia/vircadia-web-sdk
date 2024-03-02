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
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Uuid from "../shared/Uuid";
import PacketScribe from "./packets/PacketScribe";
import PacketType, { protocolVersionsSignature } from "./udt/PacketHeaders";
import Socket from "./udt/Socket";
import AccountManager from "./AccountManager";
import AddressManager from "./AddressManager";
import DomainHandler from "./DomainHandler";
import FingerprintUtils from "./FingerprintUtils";
import LimitedNodeList from "./LimitedNodeList";
import NLPacket from "./NLPacket";
import NLPacketList from "./NLPacketList";
import Node from "./Node";
import NodeType, { NodeTypeValue } from "./NodeType";
import PacketReceiver from "./PacketReceiver";
import ReceivedMessage from "./ReceivedMessage";
import SockAddr from "./SockAddr";
import ModerationFlags, { BanFlagsValue } from "../shared/ModerationFlags";
import { IceServerList } from "./webrtc/WebRTCDataChannel";


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
 *  @param {IceServerList} iceServers - The list of WebRTC ICE servers used to initiate connections.
 *  @param {NodeType} [ownerType=Agent] - The type of object that the NodeList is being used in.
 */
class NodeList extends LimitedNodeList {
    // C++  NodeList : public LimitedNodeList

    static readonly contextItemType = "NodeList";


    #_ownerType = NodeType.Agent;
    #_connectReason = LimitedNodeList.ConnectReason.Connect;
    #_nodeTypesOfInterest: Set<NodeTypeValue> = new Set();

    #_domainHandler: DomainHandler;

    #_requestsDomainListData = false;

    #_ignoredNodeIDs: Set<bigint> = new Set();
    #_personalMutedNodeIDs: Set<bigint> = new Set();
    #_avatarGainMap: Map<bigint, number> = new Map();
    #_avatarGain = 0.0;  // dB

    #_ignoredNode = new SignalEmitter();

    // Context objects.
    #_accountManager;
    #_addressManager;


    constructor(contextID: number, iceServers: IceServerList = []) {
        // C++  NodeList(int socketListenPort = INVALID_PORT, int dtlsListenPort = INVALID_PORT);

        super(contextID, iceServers);

        // WEBRTC TODO: Address further C++ code.

        this.#_domainHandler = new DomainHandler(contextID, this);

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

        // Clear our NodeList when the domain changes.
        this.#_domainHandler.disconnectedFromDomain.connect(this.#resetFromDomainHandler);

        // WEBRTC TODO: Address further C++ code.

        this.#_accountManager = ContextManager.get(contextID, AccountManager) as AccountManager;

        // Assume that we may need to send a new DS check in anytime a new keypair is generated.
        this.#_accountManager.newKeypair.connect(() => {
            void this.sendDomainServerCheckIn();
        });

        // Clear out NodeList when login is finished and we know our new username.
        this.#_accountManager.usernameChanged.connect(() => {
            this.reset("Username changed");
        });

        // Clear our NodeList when logout is requested.
        this.#_accountManager.logoutComplete.connect(() => {
            this.reset("Logged out");
        });

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
        this._packetReceiver.registerListener(PacketType.DomainServerConnectionToken,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainServerConnectionTokenPacket));
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

    /**
     *  Gets whether the audio mixer and avatar mixer have been told to continue to send data from ignored avatars or avatars
     *  that have ignored the client.
     *  <p>Note: Audio mixer only continues to send audio from ignored or ignoring avatars if the client is an admin in the
     *  domain (can kick avatars).</p>
     *  @returns {boolean} <code>true</code> if the audio and avatar mixers have been told to continue sending data from ignored
     *      or ignoring avatars, <code>false</code> if they haven't or have been told not to.
     */
    getRequestsDomainListData(): boolean {
        // C++  bool getRequestsDomainListData()

        return this.#_requestsDomainListData;
    }

    /**
     *  Tells the audio mixer to continue to send audio from avatars that have been ignored or that have ignored the client,
     *  provided that the client is an admin in the domain (can kick avatars).
     *  <p>Tells the avatar mixer to continue to send data from avatars that have been ignored or that have ignored the
     *  client.</p>
     *  @param {boolean} isRequesting - <code>true</code> to tell the audio and avatar mixers to continue sending data from
     *      ignored or ignoring avatars, <code>false</code> to tell them to stop sending.
     */
    setRequestsDomainListData(isRequesting: boolean): void {
        // C++  void setRequestsDomainListData(bool isRequesting)

        if (this.#_requestsDomainListData === isRequesting) {
            return;
        }

        this.eachMatchingNode(
            (node: Node) => {
                const nodeType = node.getType();
                return nodeType === NodeType.AvatarMixer || nodeType === NodeType.AudioMixer;
            },
            (node: Node) => {
                const packet = PacketScribe.RequestsDomainListData.write({
                    isRequesting
                });
                this.sendPacket(packet, node);
            }
        );

        /*
        // Tell the avatar mixer and audio mixer whether I want to receive any additional data to which I might be entitled
        */

        this.#_requestsDomainListData = isRequesting;
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

        if (this.#_domainHandler.getSockAddr().isNull()) {
            console.warn("[networking] Ignoring DomainList packet while not connected to a domain server");
            // WEBRTC TODO: Address further C++ code - extra console info.
            return;
        }

        // WEBRTC TODO: Address further C++ code - ping lag console warning.

        // This is a packet from the domain server; resume normal connection.
        this.#_domainHandler.clearPendingCheckins();
        this.setDropOutgoingNodeTraffic(false);

        // WEBRTC TODO: Address further C++ code.

        if (this.#_domainHandler.isConnected() && this.#_domainHandler.getUUID().value() !== info.domainUUID.value()) {
            console.warn("[networking] Ignoring DomainList packet from", info.domainUUID.stringify(), "while connected to",
                this.#_domainHandler.getUUID().stringify());
            // WEBRTC TODO: Address further C++ code - extra console info.
            return;
        }

        // FIXME: Connection is not re-established after resetting here.
        /*
        // When connected, if the session ID or local ID were not null and changed then we should reset.
        const currentLocalID = this.getSessionLocalID();
        const currentSessionID = this.getSessionUUID();
        if (this.#_domainHandler.isConnected()
            && (currentLocalID !== Node.NULL_LOCAL_ID && info.newLocalID !== currentLocalID
                || !currentSessionID.isNull() && info.newUUID.value() !== currentSessionID.value())) {
            // Reset the NodeList but don't do a domain handler reset since we're about to process a good domain list.
            this.reset("Local ID or Session ID changed while connected to domain - forcing NodeList reset", true);

            // Tell the domain handler that we're no longer connected so that it can re-perform actions as if just connected.
            this.#_domainHandler.setIsConnected(false);
            // Clear any reliable connections using old ID.
            this._nodeSocket.clearConnections();
        }
        */

        this.setSessionLocalID(info.newLocalID);
        this.setSessionUUID(info.newUUID);

        // WEBRTC TODO: Address further C++ code.

        if (!this.#_domainHandler.isConnected()) {
            this.#_domainHandler.setLocalID(info.domainLocalID);
            this.#_domainHandler.setUUID(info.domainUUID);
            this.#_domainHandler.setIsConnected(true);

            // WEBRTC TODO: Address further C++ code.

        }

        this.setPermissions(info.newPermissions);
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
     *  Processes a {@link PacketType(1)|DomainServerAddedNode} message received from the domain server.
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
     *  Processes a {@link PacketType(1)|DomainServerConnectionToken} message received from the domain server.
     *  @function NodeList.processDomainServerConnectionTokenPacket
     *  @type {Listener}
     *  @param {ReceivedMessage} message - The DomainServerConnectionToken message.
     */
    processDomainServerConnectionTokenPacket = (message: ReceivedMessage): void => {
        // C++  void processDomainServerConnectionTokenPacket(ReceivedMessage* message)

        // Don't process if not connected to the domain server.
        if (this.#_domainHandler.getSockAddr().isNull()) {
            return;
        }

        const info = PacketScribe.DomainServerConnectionToken.read(message.getMessage());
        this.#_domainHandler.setConnectionToken(info.connectionToken);

        this.#_domainHandler.clearPendingCheckins();
        void this.sendDomainServerCheckIn();
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

        // C++ calls super.reset() here but the Web SDK defers this call to below so that a DomainDisconnectRequest can be sent
        // by DomainHandler.softReset() before super.reset() clears all connections.
        // super.reset(reason);

        this.#_ignoredNodeIDs.clear();
        this.#_personalMutedNodeIDs.clear();
        this.#_avatarGainMap.clear();

        if (!skipDomainHandlerReset) {
            this.#_domainHandler.softReset(reason);
        }

        super.reset(reason);

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
    sendDomainServerCheckIn = async (): Promise<void> => {
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

        const connectionToken = this.#_domainHandler.getConnectionToken();
        const requiresUsernameSignature = !isDomainConnected && !connectionToken.isNull();
        if (requiresUsernameSignature && !this.#_accountManager.getAccountInfo().hasPrivateKey()) {
            console.log("[networking] A keypair is required to present a username signature to the domain-server",
                "but no keypair is present. Waiting for keypair generation to complete.");
            this.#_accountManager.generateNewUserKeypair();
            // Don't send the check in packet - wait for the new public key to be available to the domain server first.
            return;
        }

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

            // Metaverse account.
            const accountInfo = this.#_accountManager.getAccountInfo();
            username = accountInfo.getUsername();
            // If this is a connect request, and we can present a username signature, send it along.
            if (requiresUsernameSignature && accountInfo.hasPrivateKey()) {
                usernameSignature = await accountInfo.getUsernameSignature(connectionToken);
            }

            // Domain account.
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


    /*@devdoc
     *  Sets an avatar's gain (volume) or the master avatar gain, for the audio that's received from them.
     *  @param {Uuid} nodeID - The avatar's session ID, or <code>Uuid.NULL</code> to set the master gain.
     *  @param {number} gain - The gain to set, in dB.
     */
    setAvatarGain(nodeID: Uuid, gain: number): void {
        // C++  void NodeList::setAvatarGain(const QUuid& nodeID, float gain)

        if (nodeID.isNull()) {
            this.#_avatarGain = gain;
        }

        // Cannot set gain of yourself.
        if (this.getSessionUUID().value() !== nodeID.value()) {
            const audioMixer = this.soloNodeOfType(NodeType.AudioMixer);
            if (audioMixer) {

                const packet = PacketScribe.PerAvatarGainSet.write({
                    nodeID,
                    gain
                });
                this.sendPacket(packet, audioMixer);

                if (nodeID.isNull()) {
                    console.debug(`[networking] Setting master avatar gain to ${gain}.`);
                } else {
                    console.debug(`[networking] Setting avatar gain to ${gain} for ${nodeID.toString()}.`);
                    this.#_avatarGainMap.set(nodeID.value(), gain);
                }

            } else {
                console.warn("[networking] Couldn't find audio mixer to send a set avatar gain request to.");
            }
        } else {
            console.warn("[networking] Cannot set avatar gain for current session ID.");
        }
    }

    /*@devdoc
     *  Gets an avatar's gain (volume) or the master avatar gain, for the audio that's received from them.
     *  @param {Uuid} nodeID - The avatar's session ID, or <code>Uuid.NULL</code> to get the master gain.
     *  @returns {number} The avatar or master gain, in dB, or <code>0</code> if the avatar's session ID cannot be found.
     */
    getAvatarGain(nodeID: Uuid): number {
        // C++  float NodeList::getAvatarGain(const QUuid& nodeID)
        if (nodeID.isNull()) {
            return this.#_avatarGain;
        }
        const gain = this.#_avatarGainMap.get(nodeID.value());
        if (gain !== undefined) {
            return gain;
        }
        return 0.0;
    }

    /**
     *  Ignores or un-ignores another user. Ignoring makes you unable to see or hear them and them unable to see or hear you.
     *  @param {Uuid} nodeID - The user's session ID.
     *  @param {boolean} ignoreEnabled - <code>true</code> to ignore, <code>false</code> to un-ignore.
     */
    ignoreNodeBySessionID(nodeID: Uuid, ignoreEnabled: boolean): void {
        // C++  void ignoreNodeBySessionID(const QUuid& nodeID, bool ignoreEnabled) {

        // Cannot ignore yourself or nobody.
        if (!nodeID.isNull() && this.getSessionUUID().value() !== nodeID.value()) {

            // Send an ignore packet to each node type that uses it.
            this.eachMatchingNode(
                (node: Node) => {
                    const nodeType = node.getType();
                    return nodeType === NodeType.AvatarMixer || nodeType === NodeType.AudioMixer;
                },
                (node: Node) => {
                    console.log(`[networking] Sending request to ${ignoreEnabled ? "ignore" : "un-ignore"}`,
                        `${nodeID.stringify()}.`);
                    const ignorePacket = PacketScribe.NodeIgnoreRequest.write({
                        nodeID: nodeID.value(),
                        ignore: ignoreEnabled
                    }) as NLPacket;
                    this.sendPacket(ignorePacket, node);
                }
            );

            if (ignoreEnabled) {
                this.#_ignoredNodeIDs.add(nodeID.value());
                this.#_personalMutedNodeIDs.add(nodeID.value());
                this.#_ignoredNode.emit(nodeID, true);
            } else {
                this.#_ignoredNodeIDs.delete(nodeID.value());
                this.#_personalMutedNodeIDs.delete(nodeID.value());
                this.#_ignoredNode.emit(nodeID, false);
            }

        } else {
            console.warn("[networking] Cannot ignore a user with an invalid ID or an ID which matches the current session ID.");
        }
    }

    /**
     *  Removes a user from personal ignore and muted sets.
     *  @param {Uuid} nodeID - The user's session ID.
     */
    removeFromIgnoreMuteSets(nodeID: Uuid): void {
        // C++  void NodeList::removeFromIgnoreMuteSets(const QUuid& nodeID)

        // Don't remove yourself or nobody.
        const nodeIDValue = nodeID.value();
        if (nodeIDValue !== Uuid.NULL && this.getSessionUUID().value() !== nodeIDValue) {
            this.#_ignoredNodeIDs.delete(nodeIDValue);
            this.#_personalMutedNodeIDs.delete(nodeIDValue);
        }
    }

    /*@sdkdoc
      *  Gets whether or not you are ignoring another user. Ignoring makes you unable to see of hear them and them unable to see
      *  of hear you.
      *  @param {Uuid} nodeID - The user's session ID.
      *  @returns {boolean} <code>true</code> if the user is being ignored, <code>false</code> if they aren't.
      */
    isIgnoringNode(nodeID: Uuid): boolean {  // eslint-disable-line
        //  C++ bool isIgnoringNode(const QUuid& nodeID)

        return this.#_ignoredNodeIDs.has(nodeID.value());
    }

    /*@devdoc
     *  Mutes or un-mutes another user. Muting makes you unable to hear them and them unable to hear you. You can't mute or
     *  un-mute a user that is already being ignored.
     *  @param {Uuid} nodeID - The user's session ID.
     *  @param {boolean} muteEnabled - <code>true</code> to mute, <code>false</code> to un-mute.
     */
    personalMuteNodeBySessionID(nodeID: Uuid, muteEnabled: boolean): void {
        // C++  void NodeList::personalMuteNodeBySessionID(const QUuid& nodeID, bool muteEnabled)

        // Cannot personal mute yourself or nobody.
        if (!nodeID.isNull() && this.getSessionUUID().value() !== nodeID.value()) {
            const audioMixer = this.soloNodeOfType(NodeType.AudioMixer);
            if (audioMixer) {
                if (this.isIgnoringNode(nodeID)) {
                    console.log("[networking] You can't personally mute or unmute a user you're already ignoring.)");
                } else {
                    console.log(`[networking] Sending request to ${muteEnabled ? "mute" : "unmute"} ${nodeID.stringify()}.`);

                    const personalMutePacket = PacketScribe.NodeIgnoreRequest.write({
                        nodeID: nodeID.value(),
                        ignore: muteEnabled
                    }) as NLPacket;
                    this.sendPacket(personalMutePacket, audioMixer);

                    if (muteEnabled) {
                        this.#_personalMutedNodeIDs.add(nodeID.value());
                    } else {
                        this.#_personalMutedNodeIDs.delete(nodeID.value());
                    }
                }
            } else {
                console.warn("[networking] Couldn't find audio mixer to send personal mute request to.");
            }
        } else {
            console.warn("[networking] Cannot mute a user with an invalid ID or an ID which matches the current session ID.");
        }
    }

    /*@sdkdoc
      *  Gets whether or not you have muted another user. Muting makes you unable to hear them and them unable to hear you.
      *  @param {Uuid} nodeID - The user's session ID.
      *  @returns {boolean} <code>true</code> if the user is muted, <code>false</code> if they aren't.
      */
    isPersonalMutingNode(nodeID: Uuid): boolean {
        // C++  bool NodeList::isPersonalMutingNode(const QUuid& nodeID) const
        return this.#_personalMutedNodeIDs.has(nodeID.value());
    }

    /*@devdoc
     *  Mutes another node's microphone for everyone. The mute is not permanent: the node can unmute themselves.
     *  <p>This method only works if you're an administrator of the domain.</p>
     *  @param {Uuid} nodeID - The session ID of the node to mute.
     */
    muteNodeBySessionID(nodeID: Uuid): void {
        // C++  void muteNodeBySessionID(const QUuid& nodeID)
        if (!nodeID.isNull() && nodeID.value() !== Uuid.AVATAR_SELF_ID && this.getSessionUUID().value() !== nodeID.value()) {
            if (this.getThisNodeCanKick()) {
                const audioMixer = this.soloNodeOfType(NodeType.AudioMixer);
                if (audioMixer) {
                    const mutePacket = PacketScribe.NodeMuteRequest.write({
                        nodeID
                    });
                    console.log("[networking] Sending packet to mute node:", nodeID.stringify());
                    this.sendPacket(mutePacket, audioMixer);
                } else {
                    console.warn("[networking] Couldn't find audio mixer to send node mute request to.");
                }
            } else {
                console.warn("[networking] You do not have permissions to mute in this domain.");
            }
        } else {
            console.warn("[networking] muteNodeBySessionID called with an invalid ID or the current session's ID.");
        }
    }

    kickNodeBySessionID(nodeID: Uuid, banFlags: BanFlagsValue = ModerationFlags.getDefaultBanFlags()): void {
        // C++  void kickNodeBySessionID(const QUuid& nodeID, unsigned int banFlags)
        if (!nodeID.isNull() && nodeID.value() !== Uuid.AVATAR_SELF_ID && this.getSessionUUID().value() !== nodeID.value()) {
            if (this.getThisNodeCanKick()) {
                // setup the packet
                const kickPacket = PacketScribe.NodeKickRequest.write({
                    nodeID,
                    banFlags
                });
                console.log("[networking] Sending packet to kick node:", nodeID.stringify());
                this.sendPacket(kickPacket, this.#_domainHandler.getSockAddr());
            } else {
                console.warn("[networking] You do not have permissions to kick in this domain.");
            }
        } else {
            console.warn("[networking] kickNodeBySessionID called with an invalid ID or the current session's ID.");
        }
    }

    /*@devdoc
     *  Triggered when a user is ignored or un-ignored.
     *  @function NodeList.ignoredNode
     *  @param {Uuid} nodeID - The user's session ID.
     *  @param {boolean} ignored - <code>true</code> if ignored, <code>false</code> to un-ignored.
     *  @returns {Signal}
     */
    get ignoredNode(): Signal {
        // C++  void ignoredNode(const QUuid& nodeID, bool enabled);
        return this.#_ignoredNode.signal();
    }


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

        if (newNode.getType() === NodeType.AudioMixer) {

            // Send muted nodes.
            if (this.#_personalMutedNodeIDs.size > 0) {
                const nodeIDs: bigint[] = [];
                for (const nodeID of this.#_personalMutedNodeIDs) {
                    nodeIDs.push(nodeID);
                }

                const muteEnabled = true;

                const personalMutePacketList = PacketScribe.NodeIgnoreRequest.write({
                    nodeIDs,
                    ignore: muteEnabled
                }) as NLPacketList;
                this.sendPacketList(personalMutePacketList, newNode);
            }

            // WEBRTC TODO: Address further C++. Ignore radius.

            // Send avatar gain.
            if (this.#_avatarGain !== 0.0) {
                this.setAvatarGain(new Uuid(Uuid.NULL), this.#_avatarGain);
            }

            // WEBRTC TODO: Address further C++. Injector gain.

        }

        if (newNode.getType() === NodeType.AvatarMixer) {

            // Send ignored nodes.
            if (this.#_ignoredNodeIDs.size > 0) {
                const nodeIDs: bigint[] = [];
                for (const nodeID of this.#_ignoredNodeIDs) {
                    nodeIDs.push(nodeID);
                }

                const muteEnabled = true;

                const ignorePacketList = PacketScribe.NodeIgnoreRequest.write({
                    nodeIDs,
                    ignore: muteEnabled
                }) as NLPacketList;
                this.sendPacketList(ignorePacketList, newNode);
            }

            // WEBRTC TODO: Address further C++. Ignore radius.

        }

    };

}

export default NodeList;
