//
//  DomainServerConnectionToken.ts
//
//  Created by David Rowe on 13 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import assert from "../../shared/assert";
import Uuid from "../../shared/Uuid";

import "../../shared/DataViewExtensions";


type DomainServerConnectionTokenDetails = {
    connectionToken: Uuid
};


const DomainServerConnectionToken = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} a {@link PacketType(1)|DomainServerConnectionToken} packet.
     *  @typedef {object} PacketScribe.DomainServerConnectionTokenDetails
     *  @property {Uuid} connectionToken - The domain server connection token.
     */

    /*@devdoc
     *  Reads a {@link PacketType(1)|DomainServerConnectionToken} packet.
     *  @function PacketScribe.DomainServerConnectionToken&period;read
     *  @param {DataView} data - The {@link Packets|DomainServerConnectionToken} message data to read.
     *  @returns {PacketScribe.DomainServerConnectionTokenDetails} Information on the domain server connection token.
     */
    read(data: DataView): DomainServerConnectionTokenDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::processDomainServerConnectionTokenPacket(QSharedPointer<ReceivedMessage> message)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const connectionToken = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength, "ERROR: Length mismatch reading DomainServerConnectionToken message!");

        return {
            connectionToken
        };
    }

}();

export default DomainServerConnectionToken;
export type { DomainServerConnectionTokenDetails };
