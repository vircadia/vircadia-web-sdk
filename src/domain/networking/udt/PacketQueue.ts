//
//  PacketQueue.ts
//
//  Created by David Rowe on 5 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Packet from "./Packet";
import UDT from "./UDT";
import NLPacketList from "../NLPacketList";
import assert from "../../shared/assert";


type Channel = Array<Packet>;
type Channels = Array<Channel>;


/*@devdoc
 *  The <code>PacketQueue</code> class provides a queue of {@link Packet}/{@link NLPacket} and {@link NLPacketList} packets to
 *  be sent reliably.
 *  <p>Each Packet/NLPacket or NLPacketList is given a new message number, used for packet / message ordering. Message numbers
 *  wrap around to <code>0</code> when the maximum protocol value is reached.</p>
 *  <p>Packets and NLPackets are queued in a main channel and NLPacketLists are each queued in their own channel. Individual
 *  packets are taken for sending from the different channels in a round robin sequence in up to the first 16 channels.</p>
 *  <p>C++: <code>PacketQueue</code></p>
 *  @class PacketQueue
 *  @param {number} messageNumber - The initial message number.
 */
class PacketQueue {
    // C++  PacketQueue

    #_currentMessageNumber;

    #_channels: Channels;  // Main single-packet channel plus one per packet list.

    #_currentChannelIndex;
    #_channelsVisitedCount = 0;


    constructor(messageNumber = 0) {
        // C++  PacketQueue(MessageNumber messageNumber) : _currentMessageNumber(messageNumber) {
        this.#_currentMessageNumber = messageNumber;
        this.#_channels = [[]];
        this.#_currentChannelIndex = 0;
    }

    /*@devdoc
     *  Gets whether the queue is empty.
     *  @returns {boolean} <code>true</code> if the queue is empty, <code>false</code> if it isn't.
     */
    isEmpty(): boolean {
        // Only the main channel and it is empty.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.#_channels.length === 1 && this.#_channels[0]!.length === 0;
    }

    /*@devdoc
     *  Takes and removes the next packet to be sent.
     *  @returns {Packet|null} The next packet to send if there is one, <code>null</code> if there isn't.
     */
    takePacket(): Packet | null {

        if (this.isEmpty()) {
            return null;
        }

        // Handle the case where we are looking at the first channel and it is empty.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (this.#_currentChannelIndex === 0 && this.#_channels[0]!.length === 0) {
            this.#_currentChannelIndex += 1;
        }

        // At this point the current channel should always not be past the end and should also not be empty.
        assert(this.#_currentChannelIndex !== this.#_channels.length);

        const channel = this.#_channels[this.#_currentChannelIndex];

        assert(channel !== undefined && channel.length !== 0);

        // Take front packet
        const packet = channel.shift() as Packet;

        // Remove now empty channel, except if it is the main channel.
        if (channel.length === 0 && this.#_currentChannelIndex !== 0) {
            // Erase the current channel and so continue with the next channel.
            this.#_channels.splice(this.#_currentChannelIndex, 1);
        } else {
            this.#_currentChannelIndex += 1;
        }

        // Push forward our number of channels taken from.
        this.#_channelsVisitedCount += 1;

        // Check if we need to restart back at the front channel (main) to respect our capped number of channels considered.
        const MAX_CHANNELS_SENT_CONCURRENTLY = 16;

        if (this.#_currentChannelIndex === this.#_channels.length
                || this.#_channelsVisitedCount >= MAX_CHANNELS_SENT_CONCURRENTLY) {
            this.#_channelsVisitedCount = 0;
            this.#_currentChannelIndex = 0;
        }

        return packet;
    }


    /*@devdoc
     *  Gets the current message number.
     *  @returns {number} The current message number.
     */
    getCurrentMessageNumber(): number {
        // C++  MessageNumber getCurrentMessageNumber()
        return this.#_currentMessageNumber;
    }

    /*@devdoc
     *  Queues a {@link Packet} or {@link NLPacket} in the main channel for sending.
     *  @param {Packet} packet - The packet to queue.
     */
    queuePacket(packet: Packet): void {
        assert(this.#_channels.length > 0);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#_channels[0]!.push(packet);
    }

    /*@devdoc
     *  Queues an {@link NLPacketList} in a new channel for sending.
     *  @link {NLPacketList} packetList - The packet list to queue.
     */
    queuePacketList(packetList: NLPacketList): void {
        if (packetList.isOrdered()) {
            packetList.preparePackets(this.#getNextMessageNumber());
        }

        this.#_channels.push(packetList.getPackets());
        packetList.resetPackets();
    }


    #getNextMessageNumber(): number {
        const MAX_MESSAGE_NUMBER = 1 << UDT.MESSAGE_NUMBER_SIZE;
        this.#_currentMessageNumber = (this.#_currentMessageNumber + 1) % MAX_MESSAGE_NUMBER;
        return this.#_currentMessageNumber;
    }

}

export default PacketQueue;
