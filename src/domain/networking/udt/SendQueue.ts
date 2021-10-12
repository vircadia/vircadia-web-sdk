//
//  SendQueue.ts
//
//  Created by David Rowe on 5 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ControlPacket from "./ControlPacket";
import LossList from "./LossList";
import Packet from "./Packet";
import PacketQueue from "./PacketQueue";
import SequenceNumber, { SequenceNumberValue } from "./SequenceNumber";
import Socket from "./Socket";
import NLPacketList from "../NLPacketList";
import SockAddr from "../SockAddr";
import assert from "../../shared/assert";
import ConditionVariable from "../../shared/ConditionVariable";
import HighResolutionClock from "../../shared/highResolutionClock";
import SignalEmitter, { Signal } from "../../shared/SignalEmitter";


type PacketResendPair = { first: number, second: Packet };  // Number of resends for a packet.


/*@devdoc
 *  The <code>SendQueue</code> class queues and sends packets reliably.
 *  <p>C++: <code>SendQueue : public QObject</code></p>
 *
 *  @class SendQueue
 *  @param {Socket} socket - The socket to send packets on.
 *  @param {SockAddr} sockAddr - The destination address to send packets to.
 *  @param {SequenceNumber} currentSequenceNumber - The sequence number to start with.
 *  @param {number} currentMessageNumber - The message number to start with.
 *  @param {boolean} hasReceivedHandshakeACK - <code>true</code> if a HandshakeACK {@link ControlPacket} has already been
 *      received, <code>false</code> if one hasn't.
 */
class SendQueue {
    // C++  SendQueue : public QObject

    static #State = {
        // C++  SendQueue::State
        NotStarted: 0,
        Running: 1,
        Stopped: 2
    };

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    static readonly #MAXIMUM_ESTIMATED_TIMEOUT_US = 5000000n;  // 5s
    static readonly #MINIMUM_ESTIMATED_TIMEOUT_US = 10000n;  // 10ms
    /* eslint-enable @typescript-eslint/no-magic-numbers */


    #_packets;
    #_socket;  // Socket to send packets on.
    #_destination;  // Destination address.

    #_currentSequenceNumber = new SequenceNumber(0);  // Last sequence number sent out.
    #_atomicCurrentSequenceNumber = 0;  // Atomic for last sequence number sent out.
    #_lastACKSequenceNumber = 0;  // Atomic for last ACKed sequence number.

    // #_sentPackets: Map<SequenceNumber, PacketResendPair> = new Map();  // Packets waiting for ACK.
    #_sentPackets: Map<SequenceNumberValue, PacketResendPair> = new Map();  // Packets waiting for ACK.

    #_hasReceivedHandshakeACK = false;  // Flag for receipt of handshake ACK from client.

    #_packetSendPeriod = BigInt(0);  // Interval between two packet send events in microseconds, set from congestion control.
    #_estimatedTimeout = BigInt(0);  // Estimated timeout in microseconds, set from congestion control.
    #_flowWindowSize = 0;  // Flow control window size (number of packets that can be on wire) - set from congestion control.

    #_naks = new LossList();

    #_handshakeACKCondition = new ConditionVariable();
    #_emptyCondition = new ConditionVariable();

    #_lastPacketSentAt = BigInt(0);

    // Not used at present.
    /*
    #_packetSent = new SignalEmitter();
    #_packetRetransmitted = new SignalEmitter();
    */
    #_queueInactive = new SignalEmitter();
    #_timeout = new SignalEmitter();

    #_state = SendQueue.#State.NotStarted;


    /*@devdoc
     *  Creates a new <code>SendQueue</code> - an alternative to using <code>new SendQueue(...)</code>.
     *  <p><em>Static</em></p>
     *  @function SendQueue.create
     *  @static
     *  @param {Socket} socket - The socket to send packets on.
     *  @param {SockAddr} sockAddr - The destination address to send packets to.
     *  @param {SequenceNumber} currentSequenceNumber - The sequence number to start with.
     *  @param {number} currentMessageNumber - The message number to start with.
     *  @param {boolean} hasReceivedHandshakeACK - <code>true</code> if a HandshakeACK {@link ControlPacket} has already been
     *      received, <code>false</code> if one hasn't.
     */
    static create(socket: Socket, destination: SockAddr, currentSequenceNumber: SequenceNumber,
        currentMessageNumber: number, hasReceivedHandshakeACK: boolean): SendQueue {
        // C++  static SendQueue* create(Socket* socket, SockAddr destination, SequenceNumber currentSequenceNumber,
        //          MessageNumber currentMessageNumber, bool hasReceivedHandshakeACK);

        const queue = new SendQueue(socket, destination, currentSequenceNumber, currentMessageNumber, hasReceivedHandshakeACK);

        // WEBRTC TODO: Address further C++ code. - Possibly run the SendQueue in a separate thread.

        setTimeout(() => {
            void queue.#run();
        }, 0);

        return queue;
    }


    constructor(socket: Socket, destination: SockAddr, currentSequenceNumber: SequenceNumber,
        currentMessageNumber: number, hasReceivedHandshakeACK: boolean) {

        this.#_packets = new PacketQueue(currentMessageNumber);
        this.#_socket = socket;
        this.#_destination = destination;

        this.#_currentSequenceNumber = currentSequenceNumber.copy();
        this.#_atomicCurrentSequenceNumber = this.#_currentSequenceNumber.value;
        this.#_lastACKSequenceNumber = this.#_currentSequenceNumber.value;

        this.#_hasReceivedHandshakeACK = hasReceivedHandshakeACK;
    }


    /*@devdoc
     *  Queues a {@link Packet} or {@link NLPacket} for sending.
     *  @param {Packet} packet - The packet to queue.
     */
    queuePacket(packet: Packet): void {
        // C++ void queuePacket(Packet* packet)
        this.#_packets.queuePacket(packet);

        // Call notifyOne on the ConditionVariabe in case the send thread is sleeping waiting for packets.
        this.#_emptyCondition.notifyOne();

        if (this.#_state === SendQueue.#State.NotStarted) {
            setTimeout(() => {
                void this.#run();
            }, 0);
        }

    }

    /*@devdoc
     *  Queues an {@link NLPacketList} for sending.
     *  @link {NLPacketList} packetList - The packet list to queue.
     */
    queuePacketList(packetList: NLPacketList): void {
        // C++ void queuePacketList(PacketList* packet)
        this.#_packets.queuePacketList(packetList);

        // Call notifyOne on the ConditionVariable in case the send thread is sleeping waiting for packets.
        this.#_emptyCondition.notifyOne();

        if (this.#_state === SendQueue.#State.NotStarted) {
            setTimeout(() => {
                void this.#run();
            }, 0);
        }

    }

    /*@devdoc
     *  Gets the current sequence number.
     *  @returns {SequenceNumber} The current sequence number.
     */
    getCurrentSequenceNumber(): SequenceNumber {
        // C++  SequenceNumber getCurrentSequenceNumber()
        return new SequenceNumber(this.#_atomicCurrentSequenceNumber);
    }

    /*@devdoc
     *  Gets the current message number.
     *  @returns {number} The current message number.
     */
    getCurrentMessageNumber(): number {
        // C++  MessageNumber getCurrentMessageNumber()
        return this.#_packets.getCurrentMessageNumber();
    }

    /*@devdoc
     *  Sets the period between sending packets packet.
     *  @param {bigint} newPeriod - The period between sending packets, in microseconds.
     */
    setPacketSendPeriod(newPeriod: bigint): void {
        // C++  void setPacketSendPeriod(int newPeriod)
        this.#_packetSendPeriod = newPeriod;
    }

    /*@devdoc
     *  Sets the estimated send timeout.
     *  @param {bigint} estimatedTimeout - The estimated timeout, in microseconds.
     */
    setEstimatedTimeout(estimatedTimeout: bigint): void {
        // C++  void setEstimatedTimeout(int estimatedTimeout)
        this.#_estimatedTimeout = estimatedTimeout;
    }

    /*@devdoc
     *  Sets the flow window size, i.e., how many packets are allowed to be in-flight (sent but not yet acknowledged).
     *  @param {number} flowWindowSize - The size of the flow window.
     */
    setFlowWindowSize(flowWindowSize: number): void {
        // C++  void setFlowWindowSize(int flowWindowSize)
        this.#_flowWindowSize = flowWindowSize;
    }

    /*@devdoc
     *  Handles acknowledgment from the destination that a packet has been received.
     *  @param {SequenceNumber} ack - The sequence number of the packet that has been acknowledged.
     */
    ack(ack: SequenceNumber): void {
        // C++  void ack(SequenceNumber ack)

        if (ack.value === this.#_lastACKSequenceNumber) {
            return;
        }

        // Remove any ACKed packets from the map of sent packets.
        const seq = new SequenceNumber(this.#_lastACKSequenceNumber);
        while (seq.isLessThanOrEqual(ack)) {
            this.#_sentPackets.delete(seq.value);  // eslint-disable-line @typescript-eslint/dot-notation
            seq.increment();
        }

        // Remove any sequence numbers equal to or lower than this ACK in the loss list.
        if (!this.#_naks.isEmpty() && this.#_naks.getFirstSequenceNumber().isLessThanOrEqual(ack)) {
            this.#_naks.remove2(this.#_naks.getFirstSequenceNumber(), ack);
        }

        this.#_lastACKSequenceNumber = ack.value;

        // Call notifyOne() in case the send thread is sleeping with a full congestion window.
        this.#_emptyCondition.notifyOne();
    }

    /*@devdoc
     *  Handles acknowledgment from the destination that a Handshake {@link ControlPacket} has been received.
     */
    handshakeACK(): void {
        // C++  void SendQueue::handshakeACK() {
        this.#_hasReceivedHandshakeACK = true;

        // Notify on the handshake ACK condition
        this.#_handshakeACKCondition.notifyOne();
    }

    /*@devdoc
     *  Stops the queue from sending.
     */
    stop(): void {
        // C++  void stop() {

        this.#_state = SendQueue.#State.Stopped;

        // Notify all conditions in case we're waiting somewhere.
        this.#_handshakeACKCondition.notifyOne();
        this.#_emptyCondition.notifyOne();
    }


    // Slot
    /*@devdoc
     *  Updates the destination address.
     *  @function SendQueue.updateDestinationAddress
     *  @type {Slot}
     *  @param {SockAddr} newAddress - The new destination address.
     */
    updateDestinationAddress = (newAddress: SockAddr): void => {
        // C++  void updateDestinationAddress(SockAddr newAddress);
        this.#_destination = newAddress;
    };


    // Not used at present.
    /*
    get packetSent(): Signal {
        return this.#_packetSent.signal();
    }

    get packetRetransmitted(): Signal {
        return this.#_packetRetransmitted.signal();
    }
    */

    /*@devdoc
     *  Triggered when the queue has been inactive to 5s.
     *  @function SendQueue.queueInactive
     *  @returns {Signal}
     */
    get queueInactive(): Signal {
        return this.#_queueInactive.signal();
    }

    /*@devdoc
     *  Triggered when sending on the queue has timed out.
     *  @function SendQueue.queueInactive
     *  @returns {Signal}
     */
    get timeout(): Signal {
        return this.#_timeout.signal();
    }


    async #sendHandshake(): Promise<void> {
        // C++  void sendHandshake() {
        if (!this.#_hasReceivedHandshakeACK) {
            // We haven't received a handshake ACK from the client, send another now.
            // If the handshake hasn't been completed then the initial sequence number should be the current sequence
            // number + 1.
            const initialSequenceNumber = this.#_currentSequenceNumber.copy().increment();
            const HANDSHAKE_PAYLOAD_BYTES = 4;
            const handshakePacket = ControlPacket.create(ControlPacket.Handshake, HANDSHAKE_PAYLOAD_BYTES);
            handshakePacket.writeSequenceNumber(initialSequenceNumber);
            this.#_socket.writeBasePacket(handshakePacket, this.#_destination);

            // We wait for the ACK or the re-send interval to expire.
            const HANDSHAKE_RESEND_INTERVAL_MS = 100;
            await this.#_handshakeACKCondition.waitFor(HANDSHAKE_RESEND_INTERVAL_MS);
        }
    }

    #maybeSendNewPacket(): number {
        // C++  int SendQueue::maybeSendNewPacket()
        if (!this.#isFlowWindowFull()) {
            // We didn't re-send a packet, so time to send a new one.

            if (!this.#_packets.isEmpty()) {
                const nextNumber = this.#getNextSequenceNumber();

                // Grab the first packet we will send.
                const packet = this.#_packets.takePacket();
                assert(packet !== null);

                // Attempt to send the packet.
                this.#sendNewPacketAndAddToSentList(packet, nextNumber);

                // We attempted to send a packet, return 1.
                return 1;
            }
        }

        // No packets were sent
        return 0;
    }

    #maybeResendPacket(): boolean {
        // C++  bool maybeResendPacket()

        // The following while makes sure that we find a packet to re-send, if there is one.
        while (true) {  // eslint-disable-line no-constant-condition

            if (!this.#_naks.isEmpty()) {
                // Pull the sequence number we need to re-send.
                const resendNumber = this.#_naks.popFirstSequenceNumber();

                // See if we can find the packet to re-send.
                const entry = this.#_sentPackets.get(resendNumber.value);

                if (entry !== undefined) {

                    // We found the packet - grab it.
                    const resendPacket = entry.second;
                    entry.first += 1;  // Add 1 resend.

                    // Packet obfuscation level.
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    const level = entry.first < 2 ? 0 : (entry.first - 2) % 4;

                    if (level !== Packet.ObfuscationLevel.NoObfuscation) {
                        if (Socket.UDT_CONNECTION_DEBUG) {
                            const messageData = resendPacket.getMessageData();
                            let debugString = `Obfuscating packet ${messageData.sequenceNumber} with level ${level}`;
                            if (resendPacket.isPartOfMessage()) {
                                debugString += `\n    Message Number: ${messageData.messageNumber} `;
                                debugString += `Part Number: ${messageData.messagePartNumber}.`;
                            }
                            console.log(debugString);
                        }

                        // Create copy of the packet
                        const packet = Packet.createCopy(resendPacket);

                        // Obfuscate the packet.
                        packet.obfuscate(level);

                        // Send it off.
                        this.#sendPacket(packet);
                    } else {
                        // send it off
                        this.#sendPacket(resendPacket);
                    }

                    // Not used at present.
                    /*
                    this.#_packetRetransmitted.emit(wireSize, payloadSize, sequenceNumber, HighResolutionClock.now());
                    */

                    // Signal that we did resend a packet
                    return true;

                }

                // We didn't find this packet in the sentPackets queue - assume this means it was ACKed.
                // We'll fire the loop again to see if there is another to re-send.
                continue;  // eslint-disable-line no-continue
            }

            // Break from the while - we didn't resend a packet.
            break;
        }

        // No packet was resent.
        return false;
    }

    #sendNewPacketAndAddToSentList(newPacket: Packet, sequenceNumber: SequenceNumber): boolean {
        // C++ bool sendNewPacketAndAddToSentList(Packet* newPacket, SequenceNumber sequenceNumber)

        // Write the sequence number and send the packet.
        newPacket.writeSequenceNumber(sequenceNumber);

        // Not used at present.
        /*
        // Save the packet and payload sizes.
        const packetSize = newPacket.getWireSize();
        const payloadSize = newPacket.getPayloadSize();
        */

        const bytesWritten = this.#sendPacket(newPacket);

        // Not used at present.
        /*
        this.#_packetSent.emit(packetSize, payloadSize, sequenceNumber, HighResolutionClock.now());
        */

        // Insert the packet we have just sent into the sent list.
        const sequenceNumberValue = sequenceNumber.value;
        let entry = this.#_sentPackets.get(sequenceNumberValue);
        assert(entry === undefined, "SendQueue.sendNewPacketAndAddToSentList()", "Over-ridden packet in sent list.");
        entry = {
            first: 0,  // Not a resend.
            second: newPacket
        };
        this.#_sentPackets.set(sequenceNumberValue, entry);

        if (bytesWritten < 0) {
            // This is a short-circuit loss - we failed to put this packet on the wire so immediately add it to the loss list.
            this.#_naks.append(sequenceNumber);
            return false;
        }

        return true;
    }

    #sendPacket(packet: Packet): number {
        // C++  int sendPacket(const Packet& packet)
        this.#_lastPacketSentAt = HighResolutionClock.now();
        return this.#_socket.writeDatagram(packet.getMessageData().buffer, packet.getDataSize(), this.#_destination);
    }

    #getNextSequenceNumber(): SequenceNumber {
        // C++  SequenceNumber getNextSequenceNumber() {
        this.#_atomicCurrentSequenceNumber = this.#_currentSequenceNumber.increment().value;
        return this.#_currentSequenceNumber;
    }

    async #isInactive(attemptedToSendPacket: boolean): Promise<boolean> {
        // C++  bool SendQueue::isInactive(bool attemptedToSendPacket) {

        if (!attemptedToSendPacket) {
            // During our processing so far we didn't send any packets.

            // If that is still the case we should sleep until we have data to handle.
            if ((this.#_packets.isEmpty() || this.#isFlowWindowFull()) && this.#_naks.isEmpty()) {
                // The packets queue and loss list are empty.

                if (this.#_lastACKSequenceNumber === this.#_currentSequenceNumber.value) {
                    // We've sent the client as much data as we have (and they've ACKed it).
                    // Either wait for new data to send or 5 seconds before cleaning up the queue.
                    const EMPTY_QUEUES_INACTIVE_TIMEOUT_MS = 5000;

                    // Use our ConditionVariable to wait.
                    const notified = await this.#_emptyCondition.waitFor(EMPTY_QUEUES_INACTIVE_TIMEOUT_MS);

                    if (!notified && (this.#_packets.isEmpty() || this.#isFlowWindowFull()) && this.#_naks.isEmpty()) {
                        if (Socket.UDT_CONNECTION_DEBUG) {
                            const S_TO_MS = 1000;
                            console.log("[networking] SendQueue to", this.#_destination.toString(), "has been empty for",
                                EMPTY_QUEUES_INACTIVE_TIMEOUT_MS / S_TO_MS, "seconds and receiver has ACKed all packets.",
                                "The queue is now inactive and will be stopped.");
                        }

                        // Deactivate the queue.
                        this.#deactivate();
                        return true;
                    }

                } else {
                    // We think the client is still waiting for data (based on the sequence number gap).
                    // Let's wait either for a response from the client or until the estimated timeout
                    // (plus the sync interval to allow the client to respond) has elapsed.

                    let estimatedTimeout = this.#_estimatedTimeout;

                    // Clamp timeout between 10ms and 5s.
                    if (estimatedTimeout < SendQueue.#MINIMUM_ESTIMATED_TIMEOUT_US) {
                        estimatedTimeout = SendQueue.#MINIMUM_ESTIMATED_TIMEOUT_US;
                    } else if (estimatedTimeout > SendQueue.#MAXIMUM_ESTIMATED_TIMEOUT_US) {
                        estimatedTimeout = SendQueue.#MAXIMUM_ESTIMATED_TIMEOUT_US;
                    }

                    // Use our ConditionVariable to wait.
                    const notified = await this.#_emptyCondition.waitFor(Number(estimatedTimeout));

                    // When we wake-up check if we're "stuck" either if we've slept for the estimated timeout or it has been
                    // that long since the last time we sent a packet.

                    // We are stuck if all of the following are true:
                    // - There are no new packets to send or the flow window is full and we can't send any new packets.
                    // - There are no packets to resend.
                    // - The client has yet to ACK some sent packets.
                    const now = HighResolutionClock.now();

                    if ((!notified || now - this.#_lastPacketSentAt > estimatedTimeout)
                        && (this.#_packets.isEmpty() || this.#isFlowWindowFull())
                        && this.#_naks.isEmpty()
                        // eslint-disable-next-line @typescript-eslint/dot-notation
                        && SequenceNumber.new(this.#_lastACKSequenceNumber).isLessThan(this.#_currentSequenceNumber)) {
                        // After a timeout if we still have sent packets that the client hasn't ACKed we add them to the loss
                        // list.

                        // eslint-disable-next-line @typescript-eslint/dot-notation
                        this.#_naks.append(SequenceNumber.new(this.#_lastACKSequenceNumber).increment(),
                            this.#_currentSequenceNumber);
                        this.#_timeout.emit();
                    }
                }
            }
        }

        return false;
    }

    #deactivate(): void {
        // C++  void SendQueue::deactivate()
        // This queue is inactive - emit signal and stop the while loop.
        this.#_queueInactive.emit();
        this.#_state = SendQueue.#State.Stopped;
    }

    #isFlowWindowFull(): boolean {
        // C++ bool isFlowWindowFull()
        // eslint-disable-next-line @typescript-eslint/dot-notation
        return SequenceNumber.seqlen(SequenceNumber.new(this.#_lastACKSequenceNumber), this.#_currentSequenceNumber)
            > this.#_flowWindowSize;
    }

    // Sleeps for an interval.
    // eslint-disable-next-line class-methods-use-this
    async #sleepFor(microseconds: bigint): Promise<void> {
        // C++  std::this_thread::sleep_for(chrono::duration timeToSleep)
        const MS_TO_USEC = 1000n;
        const milliseconds = Math.max(Number(microseconds / MS_TO_USEC), 0);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, milliseconds);
        });
    }


    // Callback
    #run = async (): Promise<void> => {
        // C++  SendQueue::run()

        if (this.#_state === SendQueue.#State.Stopped) {
            // We've already been asked to stop before we even got a chance to start; don't start now.
            if (Socket.UDT_CONNECTION_DEBUG) {
                console.log("[networking] SendQueue asked to run after being told to stop. Will not run.");
            }
            return;
        }
        if (this.#_state === SendQueue.#State.Running) {
            // We're already running; don't start another run.
            if (Socket.UDT_CONNECTION_DEBUG) {
                console.log("[networking] SendQueue asked to run but is already running. Will not re-run.");
            }
            return;
        }

        this.#_state = SendQueue.#State.Running;

        /* eslint-disable no-await-in-loop */

        // Wait for handshake to be complete.
        while (this.#_state === SendQueue.#State.Running && !this.#_hasReceivedHandshakeACK) {
            await this.#sendHandshake();

            // Once we're here we've either received the handshake ACK or it's going to be time to re-send a handshake.
            // Either way let's continue processing - no packets will be sent if no handshake ACK has been received.
        }

        // Keep an HRC to know when the next packet should have been
        const MS_TO_USEC = 1000n;
        let nextPacketTimestamp = BigInt(Date.now()) * MS_TO_USEC;

        while (this.#_state === SendQueue.#State.Running) {
            let attemptedToSendPacket = this.#maybeResendPacket();

            // If we didn't find a packet to re-send AND we think we can fit a new packet on the wire (this is according to the
            // current flow window size) then we send out a new packet.
            let newPacketCount = 0;
            if (!attemptedToSendPacket) {
                newPacketCount = this.#maybeSendNewPacket();
                attemptedToSendPacket = newPacketCount > 0;
            }

            // Since we're a while loop, give the thread a chance to process events.
            const ZERO_SLEEP = 0n;
            await this.#sleepFor(ZERO_SLEEP);

            // We just processed events so check now if we were just told to stop.
            // If the send queue has been inactive, skip the sleep for"
            // - Either _isRunning will have been set to false and we'll break.
            // - Or something happened and we'll keep going.
            if (this.#_state !== SendQueue.#State.Running || await this.#isInactive(attemptedToSendPacket)) {
                return;
            }

            if (this.#_packetSendPeriod > 0) {
                // Push the next packet timestamp forwards by the current packet send period
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                const nextPacketDelta = (newPacketCount === 2 ? 2n : 1n) * this.#_packetSendPeriod;
                nextPacketTimestamp += nextPacketDelta;

                // Sleep as long as we need for next packet send, if we can.
                const now = BigInt(Date.now()) * MS_TO_USEC;

                let timeToSleep = nextPacketTimestamp - now;
                await this.#sleepFor(timeToSleep);

                // We use nextPacketTimestamp so that we don't fall behind, not to force long sleeps. We'll never allow
                // nextPacketTimestamp to force us to sleep for more than nextPacketDelta so cap it to that value.
                if (timeToSleep > nextPacketDelta) {
                    // Reset the nextPacketTimestamp so that it is correct next time we come around.
                    nextPacketTimestamp = now + nextPacketDelta;
                    timeToSleep = nextPacketDelta;
                }

                // We're seeing SendQueues sleep for a long period of time here, which can lock the NodeList if it's attempting
                // to clear connections. For now we guard this by capping the time this thread can sleep for.

                const MAX_SEND_QUEUE_SLEEP_USECS = 2000000n;
                if (timeToSleep > MAX_SEND_QUEUE_SLEEP_USECS) {
                    console.warn("SendQueue wanted to sleep for", timeToSleep, "microseconds");
                    console.warn("Capping sleep to", MAX_SEND_QUEUE_SLEEP_USECS);
                    console.warn("PSP:", this.#_packetSendPeriod, "NPD:", nextPacketDelta, "NPT:", nextPacketTimestamp,
                        "NOW:", now);

                    // WEBRTC TODO: Address further C++ code. - UserActivityLogger.

                    timeToSleep = MAX_SEND_QUEUE_SLEEP_USECS;
                }

                await this.#sleepFor(timeToSleep);
            }
        }

        /* eslint-enable no-await-in-loop */

    };

}

export default SendQueue;
