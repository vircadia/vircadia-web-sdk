//
//  NodesList.js
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "./AddressManager.js";
import DomainHandler from "./DomainHandler.js";
import FingerprintUtils from "./FingerprintUtils.js";
import LimitedNodeList from "./LimitedNodeList.js";
import NodeType from "./NodeType.js";
import PacketReceiver from "./PacketReceiver.js";
import PacketData from "./packets/PacketData.js";
import Packet from "./udt/Packet.js";
import PacketType, { protocolVersionsSignature } from "./udt/PacketHeaders.js";
import WebRTCDataChannel from "./webrtc/WebRTCDataChannel.js";
import WebRTCSignalingChannel from "./webrtc/WebRTCSignalingChannel.js";
import Uuid from "../shared/Uuid.js";


/*@devdoc
 * Manages the domain server plus all the nodes (assignment clients) that the client is connected to. This includes their
 * presence and communications with them via the Vircadia protocol.
 * <p>C++: <code>NodeList : LimitedNodeList</code></p>
 * <p>Note: This JavaScript object has a different name because <code>NodeList</code> is a JavaScript browser object.</p>
 * @namespace NodesList
 * @extends LimitedNodeList
 */
const NodesList = new (class extends LimitedNodeList {
    // C++  NodeList : public LimitedNodeList

    #_ownerType = null;
    #_connectReason = LimitedNodeList.ConnectReason.Connect;
    #_nodeTypesOfInterest = new Set();

    #_domainHandler = null;

    #_webrtcSignalingChannel = null;
    #_webrtcDataChannel = null;

    #_packetReceiver = null;


    constructor(newOwnerType, socketListenPort, dtlsListenPort) {
        // C++  NodeList(char newOwnerType, int socketListenPort, int dtlsListenPort)

        super(socketListenPort, dtlsListenPort);

        this.#_ownerType = newOwnerType;

        // WEBRTC TODO: Address further C++ code.

        this.#_domainHandler = new DomainHandler();

        // WEBRTC TODO: Address further C++ code.

        AddressManager.possibleDomainChangeRequired.connect(this.#_domainHandler.setURLAndID);

        // WEBRTC TODO: Address further C++ code.

        this.#_packetReceiver = super.getPacketReceiver();

        this.processDomainList = this.processDomainList.bind(this);
        this.#_packetReceiver.registerListener(PacketType.DomainList,
            PacketReceiver.makeUnsourcedListenerReference(this.processDomainList));

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Gets the domain handler used by the NodesList.
     *  @function NodesList.getDomainHandler
     *  @returns {DomainHandler} The domain handler.
     */
    getDomainHandler() {
        // C++  DomainHandler& getDomainHandler()
        return this.#_domainHandler;
    }

    /*@devdoc
     *  Adds node types to the set of those that the NodesList will connect to.
     *  @function NodesList.addSetOfNodeTypesToNodeInterestSet
     *  @param {Set<NodeType>} setOfNodeTypes - The node types to add to the interest set.
     */
    addSetOfNodeTypesToNodeInterestSet(setOfNodeTypes) {
        // C++  void addSetOfNodeTypesToNodeInterestSet(const NodeSet& setOfNodeTypes)
        for (const nodeType of setOfNodeTypes) {
            this.#_nodeTypesOfInterest.add(nodeType);
        }
    }

    /*@devdoc
     *  Gets the node types that the NodesList will connect to.
     *  @function NodesList.getNodeInterestSet
     *  @returns {Set<NodeType>} The node types in the interest set.
     */
    getNodeInterestSet() {
        // C++  NodeSet& getNodeInterestSet() const { return _nodeTypesOfInterest; }
        return this.#_nodeTypesOfInterest;
    }

    /*@devdoc
     * Performs a check-in with the domain server to connect with a {@link PacketType(1)|DomainConnectRequest} packet or keep a
     * connection alive with a {@link PacketType(1)|DomainListRequest} packet. This method should be called by the client once
     * every second.
     * @function NodesList.sendDomainServerCheckIn
     */
    sendDomainServerCheckIn() {
        // C++  void sendDomainServerCheckIn()

        // WEBRTC TODO: Address further C++ code.

        // The web app uses the domain URL rather than IP address.
        const domainURL = this.#_domainHandler.getURL();
        if (!domainURL || this.#_domainHandler.checkInPacketTimeout()) {
            return;
        }

        // We don't need to worry about getting our publicSockAddress because WebRTC handles this.
        // We don't need to worry about the domain handler requiring ICE because WebRTC handles this.
        // Instead, we open the WebRTC signaling and data channels.

        // Open the WebRTC signaling channel to the domain server if not already open.
        // WEBRTC TODO: Rework.
        if (!this.#_webrtcSignalingChannel) {
            this.#_webrtcSignalingChannel = new WebRTCSignalingChannel(domainURL);
            return;
        }
        if (!this.#_webrtcSignalingChannel.readyState === WebRTCSignalingChannel.OPEN) {
            return;
        }

        // Open the WebRTC data channel to the domain server if not already open.
        // WEBRTC TODO: Rework.
        if (!this.#_webrtcDataChannel) {
            this.#_webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, this.#_webrtcSignalingChannel);
            this.#_webrtcDataChannel.onopen = () => {
                this.#_domainHandler.setPort(1);
                this.#_webrtcDataChannel.onmessage = (buffer) => {
                    // C++  Socket::readPendingDatagrams()
                    const data = new DataView(buffer);
                    const packet = Packet.fromReceivedPacket(data, data.byteLength, this.#_domainHandler.getSockAddr());
                    packet.setReceiveTime(Date.now());
                    this.#_packetReceiver.handleVerifiedPacket(packet);
                };
            };
            return;
        }
        if (this.#_webrtcDataChannel.readyState !== WebRTCDataChannel.OPEN) {
            return;
        }

        const isDomainConnected = this.#_domainHandler.isConnected();
        const domainPacketType = isDomainConnected ? PacketType.DomainListRequest : PacketType.DomainConnectRequest;

        if (!isDomainConnected) {

            // WEBRTC TODO: Address further C++ code.

        }

        // WEBRTC TODO: Address further C++ code.

        // Create and send packet.
        let packet = null;
        if (domainPacketType === PacketType.DomainConnectRequest) {

            // Gather data needed for the packet.
            const connectUUID = Uuid.NULL;  // Always Uuid.NULL for Web Interface client.
            // Ignore ICE code because Interface didn't use ICE to discover the domain server.
            const protocolVersionSig = protocolVersionsSignature();

            const hardwareAddress = "";
            // WEBRTC TODO: Get MAC address.

            const machineFingerprint = FingerprintUtils.getMachineFingerprint();

            const compressedSystemInfo = new Uint8Array(new ArrayBuffer(0));
            // WEBRTC TODO: Get compressed system info.

            const connectReason = this.#_connectReason;

            const previousConnectionUptime = BigInt(0);
            // WEBRTC TODO: Calculate previousConnectionUpdate value.

            const currentTime = BigInt(Date.now().valueOf());

            const ownerType = this.#_ownerType;
            const publicSockAddr = super.getPublicSockAddr();
            const localSockAddr = super.getLocalSockAddr();
            const nodeTypesOfInterest = this.#_nodeTypesOfInterest;
            const placeName = AddressManager.getPlaceName();

            let usernameSignature = null;
            let username = null;
            const domainUsername = null;
            const domainTokens = null;
            if (!isDomainConnected) {
                username = "";
                usernameSignature = new ArrayBuffer(0);

                // WEBRTC TODO: Address further C++ code.

            }

            // Write the packet.
            packet = PacketData.DomainConnectRequest.write({
                connectUUID,                // UUID(128)
                protocolVersionSig,         // Uint8Array
                hardwareAddress,            // String
                machineFingerprint,         // UUID(128)
                compressedSystemInfo,       // Uint8Array
                connectReason,              // integer(32)
                previousConnectionUptime,   // integer(64)
                currentTime,                // integer(64)
                ownerType,                  // char
                publicSockAddr,             // HifiSockAddr
                localSockAddr,              // HifiSockAddr
                nodeTypesOfInterest,        // Set<NodeType>
                placeName,                  // String
                isDomainConnected,          // boolean(8)
                username,                   // String
                usernameSignature,          // ArrayBuffer() | null
                domainUsername,             // string | null
                domainTokens                // string | null
            });

        } else {

            // WEBRTC TODO: PacketType.DomainListRequest

        }

        // WEBRTC TODO: Address further C++ code.

        // Send the packet.
        const messageData = packet.getMessageData();
        this.#_webrtcDataChannel.send(messageData.data.buffer.slice(0, messageData.dataPosition));

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Processes a {@link PacketType(1)|DomainList} message received from the domain server.
     *  @function NodesList.processDomainList
     *  @param {ReceivedMessage} message - The DomainList message.
     */
    processDomainList(message) {
        // C++  processDomainList(ReceivedMessage* message)

        // WEBRTC TODO: This should involve a NLPacketList, not just a single NLPacket.

        // C++  NodeList::processDomainList()

        const info = PacketData.DomainList.read(message.getMessage());

        // WEBRTC TODO: Address further C++ code.

        if (!this.#_domainHandler.isConnected()) {

            this.#_domainHandler.setLocalID(info.domainLocalID);
            this.#_domainHandler.setUUID(info.domainUUID);

            this.#_domainHandler.setIsConnected(true);

            // WEBRTC TODO: Address further C++ code.
        }

        // WEBRTC TODO: Address further C++ code.
    }

    /*@devdoc
     *  Resets the NodesList.
     *  @function NodesList.reset
     *  @param {string} reason - A description of the reason for the reset.
     *  @param {boolean} skipDomainHandlerReset - <code>true</code> if the {@link DomainHandler} used by the NodesList shouldn't
     *      be fully reset, <code>false</code> if it should be.
     */
    reset() {
        // C++  void reset(QString reason, bool skipDomainHandlerReset)

        // WEBRTC TODO: Address further C++ code.

        if (this.#_webrtcDataChannel) {
            this.#_webrtcDataChannel.close();
            this.#_webrtcDataChannel = null;
        }
        if (this.#_webrtcSignalingChannel) {
            this.#_webrtcSignalingChannel.close();
            this.#_webrtcSignalingChannel = null;
        }
        this.#_domainHandler = null;
    }

})(NodeType.Agent);

export default NodesList;
