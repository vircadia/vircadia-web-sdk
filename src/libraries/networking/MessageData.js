//
//  MessageData.js
//
//  Created by David Rowe on 11 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  Collects together what would otherwise be private class fields used in {@link BasePacket}, {@link Packet}, {@link NLPacket},
 *  {@link Packets}, and {@link ReceivedMessage} classes.
 *  <p>JavaScript doesn't allow private member fields of base classes to be
 *  accessed by derived classes. The solution adopted is to share the "private" data among these classes in a MessageData object
 *  so that the data can be used without making copies in each class. Additionally, this object is shared with the Packets and
 *  ReceivedMessage classes so that the data can be used without copying.</p>
 *  <p>C++  N/A</p>
 *  @class MessageData
 *
 *  @property <strong>BasePacket</strong>
 *  @property {DataView} data - The raw packet or message data.
 *  @property {number} dataPosition - The current read/write position in processing the raw data. This is used to simplify the
 *      JavaScript instead of using <code>payloadStart</code>, <code>payloadCapacity</code>, and <code>payloadSize</code>.
 *  @property {number} packetSize - The size of the received packet.
 *  @property {HifiSockAddr} senderSockAddr - The IP address and port of the sender.
 *  @property {Date} receiveTime - The time that the packet or start of message was received.
 *
 *  @property <strong>Packet</strong>
 *  @property {boolean} isReliable <code>true</code> if the packet is sent reliably, <code>false</code> if it isn't.
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
 *  @property {Date} firstPacketReceiveTime - The time that the first packet was received.
 */
class MessageData {
    // Property values are added by BasePacket, Packet, NLPacket, and ReceivedMessage.
}

export default MessageData;
