//
//  MessageData.ts
//
//  Created by David Rowe on 11 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

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
 *  @property {DataView} data - The raw packet or message data.
 *  @property {number} dataPosition - The current read/write position in processing the raw data. This is used to simplify the
 *      JavaScript instead of using <code>payloadStart</code>, <code>payloadCapacity</code>, and <code>payloadSize</code>.
 *  @property {number} packetSize - The size of the received packet.
 *  @property {SockAddr} senderSockAddr - The IP address and port of the sender.
 *  @property {number} receiveTime - The time stamp at which the packet or start of message was received.
 *
 *  @property <strong>Packet</strong>
 *  @property {boolean} isReliable - <code>true</code> if the packet is sent reliably, <code>false</code> if it isn't.
 *  @property {boolean} isPartOfMessage - <code>true</code> if the packet is part of a multi-packet message, <code>false</code>
 *      if it isn't.
 *  @property {Packet.ObfuscationLevel} obfuscationLevel=NoObfuscation - The level of obfuscation used in encoding the packet
 *      data.
 *  @property {number} sequenceNumber=0 - WEBRTC TODO
 *  @property {number} messageNumber=0 - WEBRTC TODO
 *  @property {Packet.PacketPosition} packetPosition=ONLY - The position of the packet in a multi-packet message.
 *  @property {number} messagePartNumber=0 - The order of the packet in a multi-packet message.
 *
 *  @property <strong>NLPacket</strong>
 *  @property {PacketType} type - The type of packet.
 *  @property {number} version - The version of the packet type.
 *  @property {number} sourceID - The ID of the node ID that is the source of the packet.
 *
 *  @property <strong>ReceivedMessage</strong>
 *  @property {DataView} headData - The raw header data. This is an alias for <code>data</code>.
 *  @property {PacketType} packetType - The type of packet. This is a copy of the <code>type</code> value.
 *  @property {number} numPackets=1 -  The number of packets used to form the message.
 *  @property {boolean} isComplete - <code>true</code> if the message is complete, <code>false</code> if it isn't.
 *  @property {number} firstPacketReceiveTime - The time stamp at which the first packet was received.
 */
class MessageData {
    // Property values are added by BasePacket, Packet, NLPacket, and ReceivedMessage.

    // C++  BasePacket
    data = new DataView(new ArrayBuffer(0));
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
    sourceID = 0;

    // C++  ReceivedMessage
    headData = this.data;
    packetType: PacketTypeValue = 0;
    numPackets = 1;
    isComplete = false;
    firstPacketReceiveTime = 0;


    constructor(other: MessageData | undefined = undefined) {
        if (other) {
            const properties = Object.keys(this);
            properties.forEach((property) => {
                // eslint-disable-next-line
                // @ts-ignore
                this[property] = other[property];  // eslint-disable-line
            });
        }

        // WEBRTC TODO: Seal other objects.
        Object.seal(this);  // Prevent unintended use of invalid properties.
    }

}

export default MessageData;
