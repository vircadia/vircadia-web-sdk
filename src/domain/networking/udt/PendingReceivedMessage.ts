//
//  PendingReceivedMessage.ts
//
//  Created by David Rowe on 9 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Packet from "./Packet";
import assert from "../../shared/assert";


/*@devdoc
 *  The <code>PendingReceivedMessage</code> class manages the ordering of the packets in a multi-packet message so that they can
 *  be processed in order.
 *  <p>C++: <code>PendingReceivedMessage</code></p>
 */
class PendingReceivedMessage {
    // C++  PendingReceivedMessage

    // WEBRTC TODO: Cache message part numbers by making the array an Array<Pair<messagePartNumber, Packet>>.
    #_packets: Array<Packet> = [];
    #_nextPartNumber = 0;

    /* eslint-disable @typescript-eslint/no-non-null-assertion */

    /*@devdoc
     *  Adds a packet to the list of packets forming the message.
     *  @param {Packet} packet - The packet to add to the list of packets.
     */
    enqueuePacket(packet: Packet): void {
        // C++  void enqueuePacket(Packet* packet)
        assert(packet.isPartOfMessage(), "PendingReceivedMessage.enqueuePacket()",
            "called with a packet that is not part of a message");

        // Insert into the packets list in sorted order. Because we generally expect to receive packets in order, begin
        // searching from the end of the list.
        const messagePartNumber = packet.getMessagePartNumber();
        let index = this.#_packets.length;
        do {
            index -= 1;
        } while (index > -1 && this.#_packets[index]!.getMessagePartNumber() >= messagePartNumber);
        index += 1;

        if (index < this.#_packets.length && this.#_packets[index]!.getMessagePartNumber() === messagePartNumber) {
            console.log("[networking] PendingReceivedMessage.enqueuePacket(): Duplicate packet.");
            return;
        }

        this.#_packets.splice(index, 0, packet);
    }

    /*@devdoc
     *  Gets whether all the packets in the multi-packet message are present.
     *  @returns {boolean} <code>true</code> if all the packets in the multi-packet message present, <code>false</code> if some
     *      have not yet been received/
     */
    hasAvailablePackets(): boolean {
        // C++  bool hasAvailablePackets() const
        return this.#_packets.length > 0 && this.#_nextPartNumber === this.#_packets[0]!.getMessagePartNumber();
    }

    /*@devdoc
     *  Gets the next packet from the front of the packet list, removing it from the list.
     *  @returns {Packet|null} The next packet from the front of the list if there is one, <code>null</code> if the list is
     *      empty.
     */
    removeNextPacket(): Packet | null {
        // C++  Packet* removeNextPacket()
        if (this.hasAvailablePackets()) {
            this.#_nextPartNumber += 1;
            return this.#_packets.shift()!;
        }
        return null;
    }

    /* eslint-enable @typescript-eslint/no-non-null-assertion */
}

export default PendingReceivedMessage;
