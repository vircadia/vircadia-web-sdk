//
//  Connection.ts
//
//  Created by David Rowe on 4 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import CongestionControl from "./CongestionControl";
import ControlPacket from "./ControlPacket";
import LossList from "./LossList";
import Packet from "./Packet";
import PendingReceivedMessage from "./PendingReceivedMessage";
import SendQueue from "./SendQueue";
import SequenceNumber from "./SequenceNumber";
import Socket from "./Socket";
import NLPacketList from "../NLPacketList";
import SockAddr from "../SockAddr";
import assert from "../../shared/assert";
import SignalEmitter, { Signal } from "../../shared/SignalEmitter";


/*@devdoc
 *  The <code>Connection</code> class manages the reliable sending and receiving of packets over a network connection.
 *  <p>C++: <code>Connection : public QObject</code></p>
 *  @class Connection
 *  @param {Socket} parentSocket - The socket to use.
 *  @param {SockAddr} destination - The destination address to send packets to.
 *  @param {CongestionControl} congestionControl - The congestion control helper to use.
 */
class Connection {
    // C++  class Connection : public QObject

    #_hasReceivedHandshake = false;  // Flag for receipt of handshake from server.
    #_hasReceivedHandshakeACK = false;  // Flag for receipt of handshake ACK from client.
    #_didRequestHandshake = false;  // Flag for request of handshake from server.

    #_initialSequenceNumber;  // Identifies connection during re-connect requests.
    #_initialReceiveSequenceNumber = new SequenceNumber();  // Identifies connection during re-connect requests.

    #_lastMessageNumber = 0;

    #_lossList = new LossList();  // List of all missing packets.
    #_lastReceivedSequenceNumber = new SequenceNumber();  // The largest sequence number received from the peer.
    #_lastReceivedACK = new SequenceNumber();

    #_parentSocket;
    #_destination;

    #_congestionControl;
    #_sendQueue: SendQueue | null = null;
    #_pendingReceivedMessages: Map<number, PendingReceivedMessage> = new Map();

    // Re-used control packets.
    #_ackPacket;
    #_handshakeACK;


    #_destinationAddressChange = new SignalEmitter();
    // Not used at present.
    /*
    #_packetSent = new SignalEmitter();
    */


    constructor(parentSocket: Socket, destination: SockAddr, congestionControl: CongestionControl) {
        // C++  Connection(Socket* parentSocket, SockAddr destination, CongestionControl* congestionControl);

        this.#_parentSocket = parentSocket;
        this.#_destination = destination;
        this.#_congestionControl = congestionControl;

        this.#_congestionControl.init();

        // Set up re-used packets.
        const ACK_PACKET_PAYLOAD_BYTES = 4;
        const HANDSHAKE_ACK_PAYLOAD_BYTES = 4;
        this.#_ackPacket = ControlPacket.create(ControlPacket.ACK, ACK_PACKET_PAYLOAD_BYTES);
        this.#_handshakeACK = ControlPacket.create(ControlPacket.HandshakeACK, HANDSHAKE_ACK_PAYLOAD_BYTES);

        // Randomize the initial sequence number.
        this.#_initialSequenceNumber = new SequenceNumber(Math.floor(Math.random() * SequenceNumber.MAX));
    }


    /*@devdoc
     *  Sets the destination address to send packets to.
     *  @param {SockAddr} destination - The destination address.
     */
    setDestinationAddress(destination: SockAddr): void {
        // C++  void setDestinationAddress(const SockAddr& destination) {
        if (this.#_destination !== destination) {
            this.#_destination = destination;
            this.#_destinationAddressChange.emit(destination);
        }
    }

    /*@devdoc
     *  Gets the destination address that packets are being sent to.
     *  @returns {SockAddr} The destination address that packets are being sent to.
     */
    getDestination(): SockAddr {
        // C++  SockAddr getDestination()
        return this.#_destination;
    }

    /*@devdoc
     *  Queues a packet to be sent reliably.
     *  @param {Packet} packet - The packet to send reliably.
     */
    sendReliablePacket(packet: Packet): void {
        // C++  void sendReliablePacket(std::unique_ptr<Packet> packet)
        assert(packet.isReliable(), "Connection::send", "Trying to send an unreliable packet reliably.");
        this.#getSendQueue().queuePacket(packet);
    }

    /*@devdoc
     *  Queues a packet list to be sent reliably.
     *  @param {NLPacketList} packetList - The packet list to send reliably.
     */
    sendReliablePacketList(packetList: NLPacketList): void {
        // C++  void sendReliablePacketList(PacketList* packetList)
        assert(packetList.isReliable(), "Connection::send", "Trying to send an unreliable packet llist reliably.");
        this.#getSendQueue().queuePacketList(packetList);
    }

    /* Not used at present
    queueReceivedMessagePacket(packet: Packet): void {
        // C++  void queueReceivedMessagePacket(std::unique_ptr<Packet> packet)
        assert(packet.isPartOfMessage());

        const messageNumber = packet.getMessageNumber();
        const pendingMessage = this.#_pendingReceivedMessages.get(messageNumber);
        assert(pendingMessage !== undefined);

        pendingMessage.enqueuePacket(packet);

        let processedLastOrOnly = false;

        while (pendingMessage.hasAvailablePackets()) {
            const receivedPacket = pendingMessage.removeNextPacket();
            / eslint-disable @typescript-eslint/no-non-null-assertion /
            const packetPosition = receivedPacket!.getPacketPosition();
            this.#_parentSocket.messageReceived(receivedPacket!);
            / eslint-enable @typescript-eslint/no-non-null-assertion /

            // If this was the last or only packet, then we can remove the pending message from our hash.
            if (packetPosition === Packet.PacketPosition.LAST || packetPosition === Packet.PacketPosition.ONLY) {
                processedLastOrOnly = true;
            }
        }

        if (processedLastOrOnly) {
            this.#_pendingReceivedMessages.delete(messageNumber);  // eslint-disable-line @typescript-eslint/dot-notation
        }
    }
    */

    /*@devdoc
     *  Gets whether a handshake has been received.
     *  @returns {boolean} <code>true</code> if a handshake has been received, <code>false</code> if one hasn't.
     */
    hasReceivedHandshake(): boolean {
        // C++  bool hasReceivedHandshake()
        return this.#_hasReceivedHandshake;
    }

    processReceivedSequenceNumber(sequenceNumber: SequenceNumber /* , packetSize: number, payloadSize: number */): boolean {
        // C++  bool processReceivedSequenceNumber(SequenceNumber sequenceNumber, int packetSize, int payloadSize)

        if (!this.#_hasReceivedHandshake) {
            // Refuse to process any packets until we've received the handshake.
            // Send handshake request to re-request a handshake.
            if (Socket.UDT_CONNECTION_DEBUG) {
                console.log("[networking] Received packet before receiving handshake, sending HandshakeRequest.");
            }
            this.#sendHandshakeRequest();
            return false;
        }

        // If this is not the next sequence number, report loss
        const lastReceivedSequenceNumberPlusOne = this.#_lastReceivedSequenceNumber.copy().increment();
        const sequenceNumberMinusOne = sequenceNumber.copy().decrement();
        if (sequenceNumber.isGreaterThan(lastReceivedSequenceNumberPlusOne)) {
            if (lastReceivedSequenceNumberPlusOne === sequenceNumberMinusOne) {
                this.#_lossList.append(lastReceivedSequenceNumberPlusOne);
            } else {
                this.#_lossList.append(lastReceivedSequenceNumberPlusOne, sequenceNumberMinusOne);
            }
        }

        let wasDuplicate = false;

        if (sequenceNumber.isGreaterThan(this.#_lastReceivedSequenceNumber)) {
            // Update largest received sequence number.
            this.#_lastReceivedSequenceNumber = sequenceNumber;
        } else {
            // Otherwise, it could be a resend. Try and remove it from the loss list.
            wasDuplicate = !this.#_lossList.remove(sequenceNumber);
        }

        // Using a congestion control that ACKs every packet (like TCP Vegas).
        this.#sendACK();

        // WEBRTC TODO: Address further C++ code. - Connection stats.

        return !wasDuplicate;
    }

    /*@devdoc
     *  Process a {@link ControlPacket} that has been received.
     *  @param {ControlPacket} controlPacket - The control packet to process.
     */
    processControl(controlPacket: ControlPacket): void {
        // C++  void Connection::processControl(ControlPacket* controlPacket)

        // Processing of control packets (other than Handshake / Handshake ACK) is not performed if the handshake has not been
        // completed.

        switch (controlPacket.getType()) {
            case ControlPacket.ACK:
                if (this.#_hasReceivedHandshakeACK) {
                    this.#processACK(controlPacket);
                }
                break;
            case ControlPacket.Handshake:
                this.#processHandshake(controlPacket);
                break;
            case ControlPacket.HandshakeACK:
                this.#processHandshakeACK(controlPacket);
                break;
            case ControlPacket.HandshakeRequest:
                if (this.#_hasReceivedHandshakeACK) {
                    // We're already in a state where we've received a handshake ACK, so we are likely in a state where the
                    // other end expired our connection. Let's reset.

                    console.log("[networking] Got HandshakeRequest from", this.#_destination.toString(),
                        "while active. Stopping SendQueue");
                    this.#_hasReceivedHandshakeACK = false;
                    this.#stopSendQueue();
                }
                break;
            default:
                console.error("[networking] Invalid control packet type!");
        }
    }


    /*@devdoc
     *  Acts upon the send queue becoming inactive.
     *  @function Connection.queueInactive
     *  @type {Slot}
     */
    queueInactive = (): void => {
        // C++  void queueInactive();

        // tell our current send queue to go down and reset our ptr to it to null
        this.#stopSendQueue();

        if (Socket.UDT_CONNECTION_DEBUG) {
            console.log("[networking] Connection to", this.#_destination.toString(), "has stopped its SendQueue.");
        }
    };

    /*@devdoc
     *  Acts upon the send queue timing out.
     *  @function Connection.queueTimeout
     *  @type {Slot}
     */
    queueTimeout = (): void => {
        // C+   void queueTimeout();

        this.#updateCongestionControlAndSendQueue(null);
    };


    /*@devdoc
     *  Triggered when the destination address changes.
     *  @function Connection.destinationAddressChange
     *  @param {SockAddr} currentAddress - The new destination address.
     *  @returns {Signal}
     */
    get destinationAddressChange(): Signal {
        // C++  void destinationAddressChange(SockAddr currentAddress)
        return this.#_destinationAddressChange.signal();
    }

    /* Not used at present.
    get packetSent(): Signal {
        return this.#_packetSent.signal();
    }
    */


    #sendACK(): void {
        // C++  void Connection::sendACK()
        const nextACKNumber = this.#nextACK();

        // We have received new packets since the last sent ACK or our congestion control dictates that we always send ACKs.

        this.#_ackPacket.reset();  // We need to reset it every time.

        // pack in the ACK number
        this.#_ackPacket.writeSequenceNumber(nextACKNumber);

        // have the socket send off our packet
        this.#_parentSocket.writeBasePacket(this.#_ackPacket, this.#_destination);

        // WEBRTC TODO: Address further C++ code. - Connection stats.
    }

    #nextACK(): SequenceNumber {
        // C++  SequenceNumber Connection::nextACK() const
        if (this.#_lossList.getLength() > 0) {
            return this.#_lossList.getFirstSequenceNumber().copy().decrement();  // eslint-disable-line newline-per-chained-call
        }
        return this.#_lastReceivedSequenceNumber;  // Don't need to copy() because caller doesn't modify.
    }

    #processACK(controlPacket: ControlPacket): void {
        // C++  void processACK(ControlPacketPointer controlPacket)
        const ack = controlPacket.readSequenceNumber();

        // WEBRTC TODO: Address further C++ code. - Connection stats.

        // Validate that this isn't a BS ACK.
        if (ack.isGreaterThan(this.#getSendQueue().getCurrentSequenceNumber())) {
            // In UDT they specifically break the connection here - do we want to do anything?
            console.error("[networking] Connection.processACK()", "ACK received higher than largest sent sequence number.");
            return;
        }

        if (ack.isLessThan(this.#_lastReceivedACK)) {
            // This is an out of order ACK - bail.
            return;
        }

        if (ack.isGreaterThan(this.#_lastReceivedACK)) {
            // This is not a repeated ACK, so update our member and tell the send queue.
            this.#_lastReceivedACK = ack;

            // ACK the send queue so it knows what was received.
            this.#getSendQueue().ack(ack);
        }

        // Give this ACK to the congestion control and update the send queue parameters.
        /*
        // Default CongestionControl.onACK() always returns false.
        this.#updateCongestionControlAndSendQueue(() => {
            if (this.#_congestionControl.onACK(ack, controlPacket.getReceiveTime())) {
                // The congestion control has told us it needs a fast re-transmit of ack + 1 - add that now.
                this.#_sendQueue.fastRetransmit(ack.copy().increment());
            }
        });
        */

        // WEBRTC TODO: Address further C++ code. - Connection stats.

    }

    #sendHandshakeRequest(): void {
        // C++  void sendHandshakeRequest()
        const handshakeRequestPacket = ControlPacket.create(ControlPacket.HandshakeRequest, 0);
        this.#_parentSocket.writeBasePacket(handshakeRequestPacket, this.#_destination);

        this.#_didRequestHandshake = true;
    }

    #processHandshake(controlPacket: ControlPacket): void {
        // C++  void Connection::processHandshake(ControlPacketPointer controlPacket)

        const initialSequenceNumber = controlPacket.readSequenceNumber();

        if (!this.#_hasReceivedHandshake || initialSequenceNumber.isNotEqualTo(this.#_initialReceiveSequenceNumber)) {
            // server sent us a handshake - we need to assume this means state should be reset
            // as long as we haven't received a handshake yet or we have and we've received some data

            if (Socket.UDT_CONNECTION_DEBUG) {
                if (initialSequenceNumber.isNotEqualTo(this.#_initialReceiveSequenceNumber)) {
                    console.log("[networking] Resetting receive state, received a new initial sequence number in handshake.");
                }
            }

            this.#resetReceiveState();
            this.#_initialReceiveSequenceNumber = initialSequenceNumber;
            this.#_lastReceivedSequenceNumber = initialSequenceNumber.copy().decrement();
        }

        this.#_handshakeACK.reset();
        this.#_handshakeACK.writeSequenceNumber(initialSequenceNumber);
        this.#_parentSocket.writeBasePacket(this.#_handshakeACK, this.#_destination);

        // Indicate that handshake has been received.
        this.#_hasReceivedHandshake = true;

        if (this.#_didRequestHandshake) {
            // WEBRTC TODO: Address further C++ code.
            /* Not required at present: Is for AssetClient and EntityScriptClient.
            this.#_receiverHandshakeRequestComplete.emit(this.#_destination);
            */
            this.#_didRequestHandshake = false;
        }
    }

    #processHandshakeACK(controlPacket: ControlPacket): void {
        // C++  void Connection::processHandshakeACK(ControlPacketPointer controlPacket)

        // If we've decided to clean up the send queue then this handshake ACK should be ignored, it's useless.
        if (this.#_sendQueue) {
            const initialSequenceNumber = controlPacket.readSequenceNumber();

            if (initialSequenceNumber.isEqualTo(this.#_initialSequenceNumber)) {
                // Hand off this handshake ACK to the send queue so it knows it can start sending.
                this.#getSendQueue().handshakeACK();

                // indicate that handshake ACK was received
                this.#_hasReceivedHandshakeACK = true;
            }
        }
    }

    #resetReceiveState(): void {
        // C++  void Connection::resetReceiveState()

        // Reset all SequenceNumber member variables back to default.
        this.#_lastReceivedSequenceNumber = new SequenceNumber();

        // Clear the loss list.
        this.#_lossList.clear();

        // Clear any pending received messages.
        // Skip message failure handling because it's only used in UDTTest which isn't provided in the SDK.
        this.#_pendingReceivedMessages.clear();
    }

    #getSendQueue(): SendQueue {
        // C++  SendQueue& getSendQueue()

        if (this.#_sendQueue === null) {

            // We may have a sequence number from the previous inactive queue - re-use that so that the receiver is getting the
            // sequence numbers it expects(given that the connection must still be active).

            if (!this.#_hasReceivedHandshakeACK) {
                // First time creating a send queue for this connection.
                this.#_sendQueue = SendQueue.create(this.#_parentSocket, this.#_destination,
                    this.#_initialSequenceNumber.copy().decrement(), this.#_lastMessageNumber,
                    this.#_hasReceivedHandshakeACK);
                this.#_lastReceivedACK = this.#_sendQueue.getCurrentSequenceNumber();
            } else {
                // Connection already has a handshake from a previous send queue.
                this.#_sendQueue = SendQueue.create(this.#_parentSocket, this.#_destination, this.#_lastReceivedACK,
                    this.#_lastMessageNumber, this.#_hasReceivedHandshakeACK);
            }

            if (Socket.UDT_CONNECTION_DEBUG) {
                console.log("[networking] Created SendQueue for connection to", this.#_destination.toString());
            }

            // WEBRTC TODO: Address further C++ code. - Stats and congestion control.
            /* Not used at present.
            this.#_sendQueue.packetSent.connect(this.recordSentPackets);
            this.#_sendQueue.packetRetransmitted.connect(this.recordRetransmission);
            */

            this.#_sendQueue.queueInactive.connect(this.queueInactive);
            this.#_sendQueue.timeout.connect(this.queueTimeout);
            this.destinationAddressChange.connect(this.#_sendQueue.updateDestinationAddress);

            // Set defaults on the send queue from our congestion control object.
            this.#_sendQueue.setPacketSendPeriod(this.#_congestionControl.packetSendPeriod());
            this.#_sendQueue.setEstimatedTimeout(this.#_congestionControl.estimatedTimeout());
            this.#_sendQueue.setFlowWindowSize(this.#_congestionControl.congestionWindowSize());

            // WEBRTC TODO: Address further C++ code. - TCPVegasCC.
        }

        return this.#_sendQueue;
    }

    #stopSendQueue(): void {
        // C++  void stopSendQueue()

        if (this.#_sendQueue) {
            this.#_sendQueue.stop();
            this.#_lastMessageNumber = this.#_sendQueue.getCurrentMessageNumber();
            this.#_sendQueue = null;
        }
    }


    #updateCongestionControlAndSendQueue(congestionCallback: (() => void) | null): void {
        // C++  void updateCongestionControlAndSendQueue(std::function <void ()> congestionCallback)

        const sendQueue = this.#getSendQueue();

        // Not used at present.
        /*
        // Update the last sent sequence number in congestion control.
        this.#_congestionControl.setSendCurrentSequenceNumber(this.#getSendQueue().getCurrentSequenceNumber());
        */

        // Fire congestion control callback.
        if (congestionCallback) {
            congestionCallback();
        }

        // Now that we've updated the congestion control, update the packet send period and flow window size.
        sendQueue.setPacketSendPeriod(this.#_congestionControl.packetSendPeriod());
        sendQueue.setEstimatedTimeout(this.#_congestionControl.estimatedTimeout());
        sendQueue.setFlowWindowSize(this.#_congestionControl.congestionWindowSize());

        // WEBRTC TODO: Address further C++ code. - Stats.

    }

}

export default Connection;
