//
//  DomainConnectionDenied.ts
//
//  Created by David Rowe on 2 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import assert from "../../shared/assert";


type DomainConnectionDeniedDetails = {
    reasonCode: number,
    reasonMessage: string,
    extraInfo: string
};


const DomainConnectionDenied = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} a {@link PacketType(1)|DomainConnectionDenied} packet.
     *  @typedef {object} PacketScribe.DomainConnectionDeniedDetails
     *  @property {DomainHandler.ConnectionRefusedReason} reasonCode - The reason that the client was refused connection to the
     *      domain.
     *  @property {string} reasonMessage - A description of the reason.
     *  @property {string} etraInfo - Extra information about the reason.
     */

    /*@devdoc
     *  Reads a {@link PacketType(1)|DomainConnectionDenied} packet.
     *  @function PacketScribe.DomainConnectionDenied&period;read
     *  @param {DataView} data - The {@link Packets|DomainConnectionDenied} message data to read.
     *  @returns {PacketScribe.DomainConnectionDeniedDetails} Information on the domain connection denied condition.
     */
    read(data: DataView): DomainConnectionDeniedDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void DomainHandler::processDomainServerConnectionDeniedPacket(QSharedPointer<ReceivedMessage> message)

        const textDecoder = new TextDecoder();

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const reasonCode = data.getUint8(dataPosition);
        dataPosition += 1;

        const reasonSize = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;
        const reasonMessage = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, reasonSize));
        dataPosition += reasonSize;

        const extraInfoSize = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;
        const extraInfo = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, extraInfoSize));
        dataPosition += extraInfoSize;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength, "ERROR: Length mismatch reading DomainConnectionDenied message!");

        return {
            reasonCode,
            reasonMessage,
            extraInfo
        };
    }

}();

export default DomainConnectionDenied;
export type { DomainConnectionDeniedDetails };
