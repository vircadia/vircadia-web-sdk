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
import Uuid from "../../shared/Uuid";


type MessagesDataDetails = {
    channel: string,
    message: string | ArrayBuffer,
    senderID: Uuid
};


const MessagesData = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|MessagesData} packet list.
     *  @typedef {object} PacketScribe.MessagesDataDetails
     *  @property {string} channel - The message channel to send on.
     *  @property {string|ArrayBuffer} message - The message data to send.
     *  @property {Uuid} senderID - The ID of the sender.
     */

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
            packetList.writePrimitive(info.message.length);
            packetList.write(textEncoder.encode(info.message));
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
