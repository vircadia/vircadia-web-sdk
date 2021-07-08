//
//  DomainList.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT.js";
import Uuid from "../../shared/Uuid.js";
import "../../../../src/libraries/shared/DataViewExtensions.js";


const DomainList = new (class {

    /*@devdoc
     *  Reads a {@link Packets|DomainList} packet.
     *  @function PacketData.DomainList&period;read
     *  @param {DataView} data - The {@link Packets|DomainList} message data to read.
     *  @returns {PacketData.DomainListData} The domain list information.
     */
    /*@devdoc
     *  Information returned by {@link Packets|reading} a {@link PacketType(1)|DomainList} packet.
     *  @typedef {object} PacketData.DomainListData
     *  @property {Uuid} domainUUID - The UUID of the domain server.
     *  @property {LocalID} domainLocalID - The local ID of the domain server.
     *  @property {Uuid} newUUID - The UUID assigned to the Interface client by the domain server.
     *  @property {LocalID} newLocalID - The local ID assigned to the Interface client by the domain server.
     *  @property {NodePermissions} newPermissions
     *  @property {boolean} isAuthenticated
     *  @property {BigInt} connectRequestTimestamp
     *  @property {BigInt} domainServerPingSendTime - The Unix time that the packet was sent, in usec.
     *  @property {BigInt} domainServerCheckinProcessingTime - The duration from the time domain server received the packet
     *      requesting this response and the time that the response was sent, in usec.
     *  @property {boolean} newConnection - <code>true</code> if the Interface client has just connected to the domain,
     *      <code>false</code> if was already connected.
     *  @property {PacketData.DomainListData-NodeInfo[]} nodes
     */
    /*@devdoc
     *  Node information included in {@link PacketData.DomainListData} packet data.
     *  @typedef {object} PacketData.DomainListData-NodeInfo
     */
    read(data) {  /* eslint-disable-line class-methods-use-this */
        // C++  NodeList::processDomainList(QSharedPointer<ReceivedMessage> message)

        const info = {};

        /* eslint-disable no-magic-numbers */

        let dataPosition = 0;

        info.domainUUID = new Uuid(data.getBigUint128(dataPosition, UDT.LITTLE_ENDIAN));
        dataPosition += 16;

        info.domainLocalID = data.getUint16(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 2;

        info.newUUID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        info.newLocalID = data.getUint16(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 2;

        info.newPermissions = data.getUint32(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 4;

        info.isAuthenticated = data.getUint8(dataPosition) > 0;
        dataPosition += 1;

        info.connectRequestTimestamp = data.getBigUint64(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 8;

        info.domainServerPingSendTime = data.getBigUint64(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 8;

        info.domainServerCheckinProcessingTime = data.getBigUint64(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 8;

        info.newConnection = data.getUint8(dataPosition) > 0;
        dataPosition += 1;

        // WEBRTC TODO: Address further C++ code.

        /* eslint-enable no-magic-numbers */

        return info;
    }

})();

export default DomainList;
