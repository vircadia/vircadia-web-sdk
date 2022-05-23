//
//  ReceivedMessage.ts
//
//  Created by David Rowe on 10 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import MessageData from "./MessageData";
import NLPacket from "./NLPacket";
import SockAddr from "./SockAddr";
import Packet from "./udt/Packet";
import { PacketTypeValue } from "./udt/PacketHeaders";
import assert from "../shared/assert";


/*@devdoc
 *  The <code>ReceivedMessage</code> class provides information on a Vircadia protocol message received via one or more Vircadia
 *  protocol packets.
 *  <p>The likes of C++'s <code>readPrimitive()</code> and <code>readString()</code> are not implemented because it's better to
 *  in-line such methods in the packet readers/writers for packet handling speed.</p>
 *  <p>C++: <code>ReceivedMessage : public QObject </code>
 *  @class ReceivedMessage
 *  @param {NLPacket} packet - The first (and possibly only) packet that forms the message.
 */
class ReceivedMessage {
    // C++  ReceivedMessage : public QObject

    #_messageData;


    constructor(packet: NLPacket) {
        // C++  ReceivedMessage(NLPacket& packet)
        this.#_messageData = packet.getMessageData();  // Reference the data already collected; no need to copy it.
        this.#_messageData.packetType = this.#_messageData.type;
        this.#_messageData.numPackets = 1;
        this.#_messageData.isComplete = this.#_messageData.packetPosition === Packet.PacketPosition.ONLY;
        this.#_messageData.firstPacketReceiveTime = this.#_messageData.receiveTime;

        // WEBRTC TODO: May need to add equivalent of C++ ReceivedMessage::_data that contains just the payload.
        //              And as part of this, implement the payload start etc. members and calculations.

    }


    /*@devdoc
     *  Gets a reference to the {@link MessageData} object used to accumulate and share private packet- and message-related data
     *  between the {@link BasePacket}, {@link Packet}, and {@link NLPacket} classes and the "friend" {@link ReceivedMessage}
     *  class plus the packet writing and reading classes provided in {@link Packets}.
     *  <p><strong>Warning:</strong> Do not use except in these friend classes.</p>
     *  @returns {MessageData} Private packet- and message-related data.
     */
    getMessageData(): MessageData {
        // C++  N/A
        return this.#_messageData;
    }

    /*@devdoc
     *  Gets the type of the message.
     *  @returns {PacketType} The type of the packet(s) used to form the message.
     */
    getType(): PacketTypeValue {
        // C++  PacketType getType()
        return this.#_messageData.packetType;
    }

    /*@devdoc
     *  Gets the sender's address.
     *  @returns {SockAddr} The sender's address if known, a null SockAddr if not known.
     */
    getSenderSockAddr(): SockAddr {
        // C++  SockAddr getSenderSockAddr()
        return this.#_messageData.senderSockAddr ? this.#_messageData.senderSockAddr : new SockAddr();
    }

    /*@devdoc
     *  Gets the local ID of the node that is the source of the message.
     *  @returns {number} The ID of the node that is the source of the packet if known (i.e., it is a sourced message),
     *      {@link Node|Node.NULL_LOCAL_ID} if not known.
     */
    getSourceID(): number {
        // C++  NLPacket::LocalID getSourceID()
        return this.#_messageData.sourceID;
    }

    /*@devdoc
     *  Appends the data from a packet to existing message data.
     *  @param {NLPacket} packet - The packet to append.
     */
    appendPacket(packet: NLPacket): void {
        // C++  void appendPacket(NLPacket& packet)
        assert(!this.#_messageData.isComplete, "ReceivedMessage.appendPacket() : Appending packet to a complete message");

        this.#_messageData.numPackets += 1;

        // Append the packet payload.
        // WEBRTC TODO: This isn't a very efficient approach in TypeScript because an ArrayBuffer cannot be lengthened. It
        //              would be better to accumulate individual packets in a list then merge them in one go once the final
        //              packet has been received.

        const packetMessageData = packet.getMessageData();
        const packetPayloadStart = NLPacket.totalNLHeaderSize(packet.getType(), true);

        const buffer = new Uint8Array(this.#_messageData.packetSize + packetMessageData.buffer.byteLength - packetPayloadStart);

        // Set the appended packet first then overwrite its header with the original data.
        buffer.set(packetMessageData.buffer, this.#_messageData.packetSize - packetPayloadStart);
        buffer.set(this.#_messageData.buffer, 0);
        this.#_messageData.buffer = buffer;
        this.#_messageData.packetSize = buffer.byteLength;

        // WEBRTC TODO: Address further C++ code. - Emit progress.

        // Don't need to set the firstPacketReceiveTime because that is set in the constructor.

        const packetPosition = packet.getPacketPosition();
        if (packetPosition === NLPacket.PacketPosition.LAST) {
            this.#_messageData.isComplete = true;

            // WEBRTC TODO: Address further C++ code. - Emit completed() for assert server API.

        }
    }

    /*@devdoc
     *  Records and notifies that receipt of the received message has failed.
     */
    setFailed(): void {
    // C++  void setFailed()

        // WEBRTC TODO: Address further C++ code. - Failure state for asset server API.

        this.#_messageData.isComplete = true;

        // WEBRTC TODO: Address further C++ code. - Completed signal state for asset server API.

    }

    /*@devdoc
     *  Gets the raw message data, excluding the Packet and NLPacket protocol headers.
     *  @returns {DataView} The raw message data.
     */
    getMessage(): DataView {
        // C++  QByteArray getMessage()
        return new DataView(this.#_messageData.data.buffer, this.#_messageData.dataPosition);
    }

}

export default ReceivedMessage;
