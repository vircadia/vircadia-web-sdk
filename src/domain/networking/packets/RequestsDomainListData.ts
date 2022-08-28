//
//  RequestsDomainListData.ts
//
//  Created by David Rowe on 28 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import NLPacket from "../NLPacket";

type RequestsDomainListDataDetails = {
    isRequesting: boolean
};


const RequestsDomainListData = new class {

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} an {@link PacketType(1)|RequestsDomainListData} packet.
     *  @typedef {object} PacketScribe.RequestsDomainListDataDetails
     *  @property {boolean} isRequesting - <code>true</code> to tell the audio and avatar mixers to continue sending data from
     *      ignored avatars or avatars that have ignored the client, <code>false</code> to tell them to stop sending.
     *      <p>Note: The audio mixer only continues to send audio from ignored or ignoring avatars if the client is an admin in
     *      the domain (can kick avatars).</p>
     */


    /*@devdoc
     *  Writes an {@link PacketType(1)|RequestsDomainListData} packet, ready for sending.
     *  @function PacketScribe.RequestsDomainListData&period;write
     *  @param {PacketScribe.RequestsDomainListDataDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: RequestsDomainListDataDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::setRequestsDomainListData(bool isRequesting)

        const packet = NLPacket.create(PacketType.RequestsDomainListData, 1, true);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setUint8(dataPosition, info.isRequesting ? 1 : 0);
        dataPosition += 1;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default RequestsDomainListData;
export type { RequestsDomainListDataDetails };
