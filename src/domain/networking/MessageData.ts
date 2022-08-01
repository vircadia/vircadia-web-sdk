//
//  MessageData.ts
//
//  Created by David Rowe on 11 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Node from "./../networking/Node";
import SockAddr from "./../networking/SockAddr";
import { PacketTypeValue } from "./udt/PacketHeaders";


/*@devdoc
 *  The <code>MessageData</code> class collects together what would otherwise be private members used in {@link BasePacket},
 *  {@link Packet}, {@link NLPacket}, {@link Packets}, and {@link ReceivedMessage} classes.
 *  <p>TypeScript doesn't enable private members of a class to be accessed by "friend" classes. In particular,
 *  <code>ReceivedMessage</code> cannot access members of the packet classes. The solution adopted is to collect and expose the
 *  relevant private members in a <code>MessageData</code> object, which can be used by reference rather than copying the
 *  data.</p>
 *  <p>C++  N/A</p>
 *
 *  @class MessageData
 *  @param {MessageData} [other] - Another <code>MessageData</code> object to copy property values from.
 *
 *  @property <strong>BasePacket</strong>
 *  @property {Uint8Array} buffer - The raw packet or message data.
 *  @property {DataView} data - A DataView of the raw packet or message data.
 *      <em>Read-only.</em>
 *  @property {number} dataPosition - The current read/write position in the raw data. This is used to simplify the JavaScript
 *      instead of using <code>payloadStart</code>, <code>payloadCapacity</code>, and <code>payloadSize</code>.
 *  @property {number} packetSize - The size of the packet.
 *  @property {SockAddr} senderSockAddr - The IP address and port of the sender.
 *  @property {number} receiveTime - The time stamp at which the packet or start of message was received.
 *
 *  @property <strong>Packet</strong>
 *  @property {boolean} isReliable - <code>true</code> if the packet is sent reliably, <code>false</code> if it isn't.
 *  @property {boolean} isPartOfMessage - <code>true</code> if the packet is part of a multi-packet message, <code>false</code>
 *      if it isn't.
 *  @property {Packet.ObfuscationLevel} obfuscationLevel=NoObfuscation - The level of obfuscation used in encoding the packet
 *      data.
 *  @property {number} sequenceNumber=0 - The packet's {@link SequenceNumber} value, which identifies the order that the packet
 *      was sent in relative to other packets.
 *  @property {number} messageNumber=0 - The number of the message that a packet is part of in a multi-packet message.
 *  @property {Packet.PacketPosition} packetPosition=ONLY - The position of the packet in a multi-packet message.
 *  @property {number} messagePartNumber=0 - The order of the packet in a multi-packet message.
 *
 *  @property <strong>NLPacket</strong>
 *  @property {PacketType} type - The type of packet.
 *  @property {number} version - The version of the packet type.
 *  @property {number} sourceID - The local ID of the node that is the source of the packet if known (i.e., it is a sourced
 *      packet), {@link Node|Node.NULL_LOCAL_ID} if not known.
 *
 *  @property <strong>ReceivedMessage</strong>
 *  @property {DataView} headData - A DataView of the raw header data. This is an alias for <code>data</code>.
 *      <em>Read-only.</em>
 *  @property {PacketType} packetType - The type of packet. This is a copy of the <code>type</code> value.
 *  @property {number} numPackets=1 -  The number of packets used to form the message.
 *  @property {boolean} isComplete - <code>true</code> if the message is complete, <code>false</code> if it isn't.
 *  @property {number} firstPacketReceiveTime - The time stamp at which the first packet was received.
 */
class MessageData {
    // Property values are added by BasePacket, Packet, NLPacket, and ReceivedMessage.

    // C++  BasePacket
    // buffer: See setter and getter.
    // data: See getter.
    dataPosition = 0;
    packetSize = 0;
    senderSockAddr: SockAddr | undefined = undefined;  // We can avoid creating this object now.
    receiveTime = 0;

    // C++  Packet
    isReliable = false;
    isPartOfMessage = false;
    obfuscationLevel = 0;  // Packet.ObfuscationLevel.NoObfuscation;
    sequenceNumber = 0;
    messageNumber = 0;
    packetPosition = 0;  // Packet.PacketPosition.ONLY;
    messagePartNumber = 0;

    // C++  NLPacket
    type = PacketTypeValue.Unknown;
    version = 0;
    sourceID = Node.NULL_LOCAL_ID;

    // C++  ReceivedMessage
    // headData: See getter.
    packetType: PacketTypeValue = 0;
    numPackets = 1;
    isComplete = false;
    firstPacketReceiveTime = 0;


    #_buffer = new Uint8Array(0);
    #_data = new DataView(this.#_buffer.buffer);


    constructor(other: MessageData | undefined = undefined) {
        if (other) {
            const properties = Object.keys(this);

            // Primitive properties.
            properties.forEach((property) => {
                if (property !== "data" && property !== "headData" && property !== "senderSockAddr") {
                    // eslint-disable-next-line
                    // @ts-ignore
                    this[property] = other[property];  // eslint-disable-line
                }
            });

            // Object properties.
            this.buffer = new Uint8Array(other.buffer.buffer);
            if (other.senderSockAddr) {
                this.senderSockAddr = new SockAddr();
                this.senderSockAddr.setObjectName(other.senderSockAddr.objectName());
                this.senderSockAddr.setAddress(other.senderSockAddr.getAddress());
                this.senderSockAddr.setPort(other.senderSockAddr.getPort());
            } else {
                this.senderSockAddr = undefined;
            }
        }

        // WEBRTC TODO: Seal other objects.
        Object.seal(this);  // Prevent unintended use of invalid properties.
    }


    set buffer(buffer: Uint8Array) {
        this.#_buffer = buffer;
        this.#_data = new DataView(this.#_buffer.buffer);
    }

    get buffer(): Uint8Array {
        return this.#_buffer;
    }

    get data(): DataView {
        return this.#_data;
    }

    get headData(): DataView {
        return this.#_data;
    }

}

export default MessageData;
