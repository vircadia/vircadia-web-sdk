//
//  DomainServerPathResponse.ts
//
//  Created by David Rowe on 3 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import assert from "../../shared/assert";
import UDT from "../udt/UDT";


type DomainServerPathResponseDetails = {
    pathQuery: string,
    viewpoint: string
};


const DomainServerPathResponse = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} a {@link PacketType(1)|DomainServerPathResponse} packet.
     *  @typedef {object} PacketScribe.DomainServerPathResponseDetails
     *  @property {string} pathQuery - The path that the packet is in response to.
     *  @property {string} viewpoint - The viewpoint position and orientation set on the domain for the <code>pathQuery</code>.
     */

    /*@devdoc
     *  Reads a {@link PacketType(1)|DomainServerPathResponse} packet.
     *  @function PacketScribe.DomainServerPathResponse&period;read
     *  @param {DataView} data - The {@link Packets|DomainServerPathResponse} message data to read.
     *  @returns {PacketScribe.DomainServerPathResponseDetails} Information on the viewpoint position and orientation set for a
     *      path on the domain server.
     */
    read(data: DataView): DomainServerPathResponseDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::processDomainServerPathResponse(QSharedPointer<ReceivedMessage> message)

        const textDecoder = new TextDecoder();

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const numPathBytes = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        const pathQuery = textDecoder.decode(new DataView(data.buffer, data.byteOffset + dataPosition, numPathBytes));
        dataPosition += numPathBytes;

        const numViewpointBytes = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        const viewpoint = textDecoder.decode(new DataView(data.buffer, data.byteOffset + dataPosition, numViewpointBytes));
        dataPosition += numViewpointBytes;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength, "ERROR: Length mismatch reading DomainServerPathResponse message!");

        return {
            pathQuery,
            viewpoint
        };
    }

}();

export default DomainServerPathResponse;
export type { DomainServerPathResponseDetails };
