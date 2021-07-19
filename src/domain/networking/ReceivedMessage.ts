//
//  ReceivedMessage.ts
//
//  Created by David Rowe on 10 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "./NLPacket";
import Packet from "./udt/Packet";
import { PacketTypeValue } from "./udt/PacketHeaders";


/*@devdoc
 *  A Vircadia protocol message received via one or more Vircadia protocol packets.
 *  <p>C++: <code>ReceivedMessage : public QObject </code>
 *  @class ReceivedMessage
 *  @param {NLPacket} packet - The first (and possibly only) packet that forms the message.
 */
class ReceivedMessage {

    private _messageData;

    constructor(packet: NLPacket) {
        // C++  ReceivedMessage(NLPacket& packet)
        this._messageData = packet.getMessageData();  // Reference the data already collected; no need to copy it.
        this._messageData.headData = this._messageData.data;  // Just reference the same data; no need to copy it.
        this._messageData.packetType = this._messageData.type;  // Alias.
        this._messageData.numPackets = 1;
        this._messageData.isComplete = this._messageData.packetPosition === Packet.PacketPosition.ONLY;
        this._messageData.firstPacketReceiveTime = this._messageData.receiveTime;

        // WEBRTC TODO: May need to add equivalent of C++ ReceivedMessage::_data that contains just the payload.
        //              And as part of this, implement the payload start etc. members and calculations.
    }

    /*@devdoc
     *  Gets the type of the message.
     *  @returns {PacketType} The type of the packet(s) used to form the message.
     */
    getType(): PacketTypeValue {
        // C++  PacketType getType()
        return this._messageData.packetType;
    }

    /*@devdoc
     *  Gets the raw message data, excluding the Packet and NLPacket protocol headers.
     *  @returns {DataView} The raw message data.
     */
    getMessage(): DataView {
        // C++  QByteArray getMessage()
        return new DataView(this._messageData.data.buffer, this._messageData.dataPosition);
    }
}

export default ReceivedMessage;
