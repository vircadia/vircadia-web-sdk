//
//  MessagesSubscribe.ts
//
//  Created by David Rowe on 4 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import NLPacketList from "../NLPacketList";


type MessagesSubscribeDetails = {
    channel: string
};


const MessagesSubscribe = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|MessagesSubscribe} packet lsit.
     *  @typedef {object} PacketScribe.MessagesSubscribeDetails
     *  @property {string} channel - The message channel to subscribe to.
     */

    /*@devdoc
     *  Writes a {@link PacketType(1)|MessagesSubscribe} packet list, ready for sending.
     *  @function PacketScribe.MessagesSubscribe&period;write
     *  @param {PacketScribe.MessagesSubscribeDetails} info - The information needed for writing the packet list.
     *  @returns {NLPacketList}
     */
    write(info: MessagesSubscribeDetails): NLPacketList {  /* eslint-disable-line class-methods-use-this */
        // C++  void MessagesClient::subscribe(QString channel)

        const packetList = NLPacketList.create(PacketType.MessagesSubscribe, null, true, true);

        const textEncoder = new TextEncoder();
        packetList.write(textEncoder.encode(info.channel));

        return packetList;
    }

}();

export default MessagesSubscribe;
export type { MessagesSubscribeDetails };
