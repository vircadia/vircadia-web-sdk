//
//  MessagesData.ts
//
//  Created by David Rowe on 4 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacketList from "../NLPacketList";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import Uuid from "../../shared/Uuid";


type MessagesDataDetails = {
    channel: string,
    message: string | ArrayBuffer,
    senderID: Uuid
};


const MessagesData = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|reading} or {@link PacketScribe|writing} a
     *  {@link PacketType(1)|MessagesData} packet list.
     *  @typedef {object} PacketScribe.MessagesDataDetails
     *  @property {string} channel - The message channel to send on.
     *  @property {string|ArrayBuffer} message - The message data to send.
     *  @property {Uuid} senderID - The ID of the sender.
     */

    /*@devdoc
     *  Reads a {@link PacketType(1)|MessagesData} multi-packet message.
     *  returns {PacketScribe.MessagesDataDetails} The information obtained from reading the message.
     */
    read(data: DataView): MessagesDataDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void MessagesClient::decodeMessagesPacket(ReceivedMessage* receivedMessage, QString& channel, bool& isText,
        //      QString& message, QByteArray& data, QUuid& senderID)

        const textDecoder = new TextDecoder();

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const channelNameSize = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;
        const channel = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, channelNameSize));
        dataPosition += channelNameSize;

        const isString = data.getUint8(dataPosition) > 0;
        dataPosition += 1;
        let message: string | ArrayBuffer = "";
        const byteLength = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        if (isString) {
            message = textDecoder.decode(new DataView(data.buffer, data.byteOffset + dataPosition, byteLength));
        } else {
            message = new Uint8Array(data.buffer, data.byteOffset + dataPosition, byteLength).buffer;
        }
        dataPosition += byteLength;

        const senderID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        return {
            channel,
            message,
            senderID
        };
    }

    /*@devdoc
     *  Writes a {@link PacketType(1)|MessagesData} packet list, ready for sending.
     *  @function PacketScribe.MessagesData&period;write
     *  @param {PacketScribe.MessagesDataDetails} info - The information needed for writing the packet list.
     *  @returns {NLPacketList}
     */
    write(info: MessagesDataDetails): NLPacketList {  /* eslint-disable-line class-methods-use-this */
        // C++  NLPacketList* MessagesClient::encodeMessagesPacket(QString channel, QString message, QUuid senderID)
        //      NLPacketList* MessagesClient::encodeMessagesDataPacket(QString channel, QByteArray data, QUuid senderID)

        const textEncoder = new TextEncoder();

        const packetList = NLPacketList.create(PacketType.MessagesData, null, true, true);

        packetList.writePrimitive(info.channel.length, 2);
        packetList.write(textEncoder.encode(info.channel));

        if (typeof info.message === "string") {
            packetList.writePrimitive(true);
            const encodedMessage = textEncoder.encode(info.message);
            packetList.writePrimitive(encodedMessage.byteLength);
            packetList.write(encodedMessage);
        } else {
            packetList.writePrimitive(false);
            packetList.writePrimitive(info.message.byteLength);
            packetList.write(new Uint8Array(info.message));
        }

        packetList.writePrimitive(info.senderID);

        return packetList;
    }

}();

export default MessagesData;
export type { MessagesDataDetails };
