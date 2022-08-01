//
//  MessagesUnsubscribe.ts
//
//  Created by David Rowe on 4 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import NLPacketList from "../NLPacketList";


type MessagesUnsubscribeDetails = {
    channel: string
};


const MessagesUnsubscribe = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|MessagesUnsubscribe} packet list.
     *  @typedef {object} PacketScribe.MessagesUnsubscribeDetails
     *  @property {string} channel - The message channel to unsubscribe from.
     */

    /*@devdoc
     *  Writes a {@link PacketType(1)|MessagesUnsubscribe} packet list, ready for sending.
     *  @function PacketScribe.MessagesUnsubscribe&period;write
     *  @param {PacketScribe.MessagesUnsubscribeDetails} info - The information needed for writing the packet list.
     *  @returns {NLPacketList} The packet list, ready for sending.
     */
    write(info: MessagesUnsubscribeDetails): NLPacketList {  /* eslint-disable-line class-methods-use-this */
        // C++  void MessagesClient::unsubscribe(QString channel)

        const packetList = NLPacketList.create(PacketType.MessagesUnsubscribe, null, true, true);

        const textEncoder = new TextEncoder();
        packetList.write(textEncoder.encode(info.channel));

        return packetList;
    }

}();

export default MessagesUnsubscribe;
export type { MessagesUnsubscribeDetails };
