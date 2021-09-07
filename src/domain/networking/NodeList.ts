//
//  NodeList.ts
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "./AddressManager";
import DomainHandler from "./DomainHandler";
import FingerprintUtils from "./FingerprintUtils";
import LimitedNodeList from "./LimitedNodeList";
import NodeType, { NodeTypeValue } from "./NodeType";
import PacketReceiver from "./PacketReceiver";
import ReceivedMessage from "./ReceivedMessage";
import NLPacket from "../networking/NLPacket";
import Node from "../networking/Node";
import PacketScribe from "./packets/PacketScribe";
import PacketType, { protocolVersionsSignature } from "./udt/PacketHeaders";
import ContextManager from "../shared/ContextManager";
import Uuid from "../shared/Uuid";
import Socket from "./udt/Socket";


/*@devdoc
 *  The <code>NodeList</code> class manages the domain server plus all the nodes (assignment clients) that the client is
 *  connected to. This includes their presence and communications with them via the Vircadia protocol.
 *  <p>C++: <code>NodeList : LimitedNodeList</code></p>
 *  @class NodeList
 *  @extends LimitedNodeList
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *  @param {NodeType} [ownerType=Agent] - The type of object that the NodeList is being used in.
 */
class NodeList extends LimitedNodeList {
    // C++  NodeList : public LimitedNodeList

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

        this.#_addressManager = <AddressManager>ContextManager.get(contextID, AddressManager);
        this.#_addressManager.possibleDomainChangeRequired.connect(this.#_domainHandler.setURLAndID);

        // WEBRTC TODO: Address further C++ code.

        // clear our NodeList when the domain changes
        this.#_domainHandler.disconnectedFromDomain.connect(() => {
            // C++  void resetFromDomainHandler()
            this.reset("Reset from Domain Handler", true);
        });

        // WEBRTC TODO: Address further C++ code.

        // Whenever there is a new node connect to it.
        this.nodeAdded.connect(this.#openWebRTCConnection);
        this.nodeSocketUpdated.connect(this.#openWebRTCConnection);

        // Whenever we get a new node we may need to re-send our set of ignored nodes to it.
        this.nodeActivated.connect(this.#maybeSendIgnoreSetToNode);

        // WEBRTC TODO: Address further C++ code.

        this._packetReceiver.registerListener(PacketType.DomainList,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainList));

        // WEBRTC TODO: Address further C++ code.

        this._packetReceiver.registerListener(PacketType.DomainConnectionDenied,
            PacketReceiver.makeUnsourcedListenerReference(this.#_domainHandler.processDomainServerConnectionDeniedPacket));

        // WEBRTC TODO: Address further C++ code.

        this._packetReceiver.registerListener(PacketType.DomainServerRemovedNode,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainServerRemovedNode));

        // WEBRTC TODO: Address further C++ code.

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


    /*@devdoc
     *  Resets the LimitedNodeList, closing all connections and deleting all node data.
     *  @function NodeList.reset
     *  @param {string} reason - The reason for resetting.
     *  @param {boolean} [skipDomainHandlerReset=false] - <code>true</code> if should skip clearing DomainHandler information,
     *      e.g., if the DomainHandler initiated the reset; <code>false</code> if should clear DomainHandler information.
     *  @returns {Slot}
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
     *  @returns {Slot}
     */
    sendDomainServerCheckIn = (): void => {
        // C++  void sendDomainServerCheckIn()

        // WEBRTC TODO: Address further C++ code.

        // The web client uses the domain URL rather than IP address.
        const domainURL = this.#_domainHandler.getURL();
        if (!domainURL || this.#_domainHandler.checkInPacketTimeout()) {
            return;
        }

        // We don't need to worry about getting our publicSockAddress because WebRTC handles this.
        // We don't need to worry about the domain handler requiring ICE because WebRTC handles this.
        // Instead, we open the WebRTC signaling and data channels if not already open.

        // Open a WebRTC data channel to the domain server if not already open.
        const domainServerSocketState = this._nodeSocket.getSocketState(domainURL, NodeType.DomainServer);
        if (domainServerSocketState !== Socket.CONNECTED) {
            console.log("[networking] Opening domain server connection. Will not send domain server check-in.");
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

            // WEBRTC TODO: Address further C++ code.

        }

        // WEBRTC TODO: Address further C++ code.

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

        // WEBRTC TODO: Address further C++ code.

        this.sendPacket(packet, domainSockAddr);
    };

    /*@devdoc
     *  Processes a {@link PacketType(1)|DomainList} message received from the domain server.
     *  @function NodeList.processDomainList
     *  @param {ReceivedMessage} message - The DomainList message.
     *  @returns {Slot}
     */
    processDomainList = (message: ReceivedMessage): void => {
        // C++  processDomainList(ReceivedMessage* message)

        // WEBRTC TODO: This should involve a NLPacketList, not just a single NLPacket.

        const info = PacketScribe.DomainList.read(message.getMessage());

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
     *  Processes a {@link PacketType(1)|DomainServerRemovedNode} message received from the domain server.
     *  @function NodeList.processDomainServerRemovedNode
     *  @param {ReceivedMessage} message - The DomainServerRemovedNode message.
     *  @returns {Slot}
     */
    processDomainServerRemovedNode = (message: ReceivedMessage): void => {
        // C++  void processDomainServerRemovedNode(ReceivedMessage* message)
        const info = PacketScribe.DomainServerRemovedNode.read(message.getMessage());
        const nodeUUID = info.nodeUUID;
        console.log("[networking] Received packet from domain-server to remove node with UUID", nodeUUID.stringify());
        this.killNodeWithUUID(nodeUUID);

        // WEBRTC TODO: Address further C++ code.

    };


    // eslint-disable-next-line
    // @ts-ignore
    #activateSocketFromNodeCommunication(socketID: number, sendingNode: Node) {  // eslint-disable-line
        // C++  void activateSocketFromNodeCommunication(ReceivedMessage& message, const Node* sendingNode)

        // Just use the node's public socket for WebRTC, for now.
        if (sendingNode.getActiveSocket() === null) {
            sendingNode.activatePublicSocket();
        }

        // WEBRTC TODO: Address public versus local sockets w.r.t. WebRTC and the Web SDK.

        // WEBRTC TODO: Address further C++ code.
    }


    // Slot.
    #openWebRTCConnection = (node: Node): void => {
        // C++  void startNodeHolePunch(const Node* node);
        // We don't need to do the hole punching in order to establish a connection to the node; we just need to open the
        // WebRTC connection. WebRTC does the hole punching for us.

        if (this._nodeSocket.getSocketState(this.#_domainHandler.getURL(), node.getType()) === Socket.UNCONNECTED) {

            if (!this.#_domainHandler.isConnected()) {
                // Cannot connect to an assignment client if the domain server isn't connected.
                return;
            }

            this._nodeSocket.openSocket(this.#_domainHandler.getURL(), node.getType(), (socketID) => {
                this.#activateSocketFromNodeCommunication(socketID, node);
            });

        } else {
            console.error("Unexpected socket state for", NodeType.getNodeTypeName(node.getType()));
        }

        // Vircadia clients can never have upstream nodes or downstream nodes so we don't need to cater for these.
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
