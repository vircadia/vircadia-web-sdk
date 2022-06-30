//
//  DomainServerPathQuery.ts
//
//  Created by David Rowe on 29 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";


type DomainServerPathQueryDetails = {
    path: string
};


const DomainServerPathQuery = new class {

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|DomainServerPathQuery} packet.
     *  @typedef {object} PacketScribe.DomainServerPathQueryDetails
     *  @property {string} path - The path in the domain server. Must start with a <code>"/"</code>.
     */


    /*@devdoc
     *  Writes a {@link PacketType(1)|DomainServerPathQuery} packet, ready for sending. If the path is too long to fit into the
     *  packet then no payload data is written.
     *  @function PacketScribe.DomainServerPathQuery&period;write
     *  @param {PacketScribe.DomainServerPathQueryDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: DomainServerPathQueryDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::sendDSPathQuery(const QString& newPath)

        const packet = NLPacket.create(PacketType.DomainServerPathQuery, -1, true);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        const textEncoder = new TextEncoder();
        const pathQueryUTF8 = textEncoder.encode(info.path);

        // Only write data if there is room.
        if (2 + pathQueryUTF8.byteLength < packet.bytesAvailableForWrite()) {

            data.setUint16(dataPosition, info.path.length, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            for (let i = 0; i < pathQueryUTF8.length; i += 1) {
                data.setUint8(dataPosition, pathQueryUTF8.at(i) ?? 0);
                dataPosition += 1;
            }

        }

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default DomainServerPathQuery;
export type { DomainServerPathQueryDetails };
