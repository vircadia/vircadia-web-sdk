//
//  Ping.ts
//
//  Created by David Rowe on 6 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import assert from "../../shared/assert";


type PingDetails = {
    pingType: number,
    timestamp: bigint,
    connectionID: bigint
};


const Ping = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link Packets|reading} a {@link PacketType(1)|Ping} packet.
     *  @typedef {object} PacketScribe.PingDetails
     *  @property {PingType} pingType - The type of ping.
     *  @property {bigint} timestamp - The time at which he ping was sent.
     *  @property {bigint} connectionID - The ID of the connection that the ping was sent on.
     */


    /*@devdoc
     *  Reads a {@link PacketType(1)|Ping} packet.
     *  @function PacketScribe.Ping&period;read
     *  @param {DataView} data - The {@link Packets|Ping} message data to read.
     *  @returns {PacketScribe.PingDetails} The ping details.
     */
    read(data: DataView): PingDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::processPingPacket(ReceivedMessage* message, Node* sendingNode)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const pingType = data.getUint8(dataPosition);
        dataPosition += 1;
        const timestamp = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;
        const connectionID = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength, "ERROR: Length mismatch reading Ping packet!");

        return {
            pingType,
            timestamp,
            connectionID
        };
    }

}();

export default Ping;
export type { PingDetails };
