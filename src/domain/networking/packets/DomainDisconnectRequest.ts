//
//  DomainDisonnectRequest.ts
//
//  Created by David Rowe on 26 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import NLPacket from "../NLPacket";


const DomainDisconnectRequest = new class {

    /*@devdoc
     *  Writes a {@link PacketType(1)|DomainDisconnectRequest} packet, ready for sending.
     *  @function PacketScribe.DomainDisconnectRequest&period;write
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  DomainHandler::sendDisconnectPacket()

        const packet = NLPacket.create(PacketType.DomainDisconnectRequest);
        const messageData = packet.getMessageData();
        messageData.packetSize = messageData.dataPosition;
        return packet;
    }

}();

export default DomainDisconnectRequest;
