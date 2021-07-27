//
//  DomainList.ts
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import Uuid from "../../shared/Uuid";
import { LocalID } from "../DomainHandler";

import "../../shared/DataViewExtensions";


type DomainListDetails = {
    domainUUID: Uuid,
    domainLocalID: LocalID,
    newUUID: Uuid,
    newLocalID: LocalID,
    newPermissions: number,
    isAuthenticated: boolean,
    connectRequestTimestamp: BigInt,
    domainServerPingSendTime: BigInt,
    domainServerCheckinProcessingTime: BigInt,
    newConnection: boolean
    // WEBRTC TODO: Address further C++ code.
};


const DomainList = new class {

    /*@devdoc
     *  Node information included in {@link PacketScribe.DomainListDetails} packet data.
     *  @typedef {object} PacketScribe.DomainListDetails-NodeInfo
     */
    // WEBRTC TODO: Address further C++ code.

    /*@devdoc
     *  Information returned by {@link Packets|reading} a {@link PacketType(1)|DomainList} packet.
     *  @typedef {object} PacketScribe.DomainListDetails
     *  @property {Uuid} domainUUID - The UUID of the domain server.
     *  @property {LocalID} domainLocalID - The local ID of the domain server.
     *  @property {Uuid} newUUID - The UUID assigned to the Interface client by the domain server.
     *  @property {LocalID} newLocalID - The local ID assigned to the Interface client by the domain server.
     *  @property {NodePermissions} newPermissions
     *  @property {boolean} isAuthenticated
     *  @property {bigint} connectRequestTimestamp
     *  @property {bigint} domainServerPingSendTime - The Unix time that the packet was sent, in usec.
     *  @property {bigint} domainServerCheckinProcessingTime - The duration from the time domain server received the packet
     *      requesting this response and the time that the response was sent, in usec.
     *  @property {boolean} newConnection - <code>true</code> if the Interface client has just connected to the domain,
     *      <code>false</code> if was already connected.
     *  @property {PacketScribe.DomainListDetails-NodeInfo[]} nodes
     */

    /*@devdoc
     *  Reads a {@link PacketType(1)|DomainList} packet.
     *  @function PacketScribe.DomainList&period;read
     *  @param {DataView} data - The {@link Packets|DomainList} message data to read.
     *  @returns {PacketScribe.DomainListDetails} The domain list information.
     */
    read(data: DataView): DomainListDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  NodeList::processDomainList(QSharedPointer<ReceivedMessage> message)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        // info["domainUUID"] = new Uuid(data.getBigUint128(dataPosition, UDT.LITTLE_ENDIAN));
        // dataPosition += 16;

        const domainUUID = new Uuid(data.getBigUint128(dataPosition, UDT.LITTLE_ENDIAN));
        dataPosition += 16;

        const domainLocalID = data.getUint16(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 2;

        const newUUID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        const newLocalID = data.getUint16(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 2;

        const newPermissions = data.getUint32(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 4;

        const isAuthenticated = data.getUint8(dataPosition) > 0;
        dataPosition += 1;

        const connectRequestTimestamp = data.getBigUint64(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 8;

        const domainServerPingSendTime = data.getBigUint64(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 8;

        const domainServerCheckinProcessingTime = data.getBigUint64(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 8;

        const newConnection = data.getUint8(dataPosition) > 0;
        dataPosition += 1;

        // WEBRTC TODO: Address further C++ code.

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return {
            domainUUID, domainLocalID, newUUID, newLocalID, newPermissions, isAuthenticated, connectRequestTimestamp,
            domainServerPingSendTime, domainServerCheckinProcessingTime, newConnection
        };
    }

}();

export default DomainList;
export type { DomainListDetails };
