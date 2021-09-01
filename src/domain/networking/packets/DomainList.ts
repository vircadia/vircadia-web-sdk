//
//  DomainList.ts
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { LocalID } from "../NetworkPeer";
import { NewNodeInfo } from "../LimitedNodeList";
import NodePermissions from "../NodePermissions";
import { NodeTypeValue } from "../NodeType";
import SockAddr from "../SockAddr";
import UDT from "../udt/UDT";
import assert from "../../shared/assert";
import Uuid from "../../shared/Uuid";

import "../../shared/DataViewExtensions";


type DomainListDetails = {
    domainUUID: Uuid,
    domainLocalID: LocalID,
    newUUID: Uuid,
    newLocalID: LocalID,
    newPermissions: NodePermissions,
    isAuthenticated: boolean,
    connectRequestTimestamp: BigInt,
    domainServerPingSendTime: BigInt,
    domainServerCheckinProcessingTime: BigInt,
    newConnection: boolean,
    nodes: NewNodeInfo[]
};


const DomainList = new class {

    /*@devdoc
     *  Information returned by {@link Packets|reading} a {@link PacketType(1)|DomainList} packet.
     *  @typedef {object} PacketScribe.DomainListDetails
     *  @property {Uuid} domainUUID - The UUID of the domain server.
     *  @property {LocalID} domainLocalID - The local ID of the domain server.
     *  @property {Uuid} newUUID - The UUID assigned to the web client by the domain server.
     *  @property {LocalID} newLocalID - The local ID assigned to the web client by the domain server.
     *  @property {NodePermissions} newPermissions - The permissions granted to the user.
     *  @property {boolean} isAuthenticated - <code>true</code> if the domain server requires verified packets to include
     *      authentication hash values, <code>false</code> if they're not needed.
     *  @property {bigint} connectRequestTimestamp
     *  @property {bigint} domainServerPingSendTime - The Unix time that the packet was sent, in usec.
     *  @property {bigint} domainServerCheckinProcessingTime - The duration from the time domain server received the packet
     *      requesting this response and the time that the response was sent, in usec.
     *  @property {boolean} newConnection - <code>true</code> if the web client has just connected to the domain,
     *      <code>false</code> if was already connected.
     *  @property {LimitedNodeList.NewNodeInfo[]} nodes - The details of the assignment clients available that are in the
     *      client's interest set and currently running.
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

        const domainUUID = new Uuid(data.getBigUint128(dataPosition, UDT.LITTLE_ENDIAN));
        dataPosition += 16;

        const domainLocalID = data.getUint16(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 2;

        const newUUID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        const newLocalID = data.getUint16(dataPosition, UDT.BIG_ENDIAN);
        dataPosition += 2;

        const newPermissions = new NodePermissions();
        newPermissions.permissions = data.getUint32(dataPosition, UDT.BIG_ENDIAN);
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

        const nodes: NewNodeInfo[] = [];
        while (dataPosition < data.byteLength) {
            // C++  void NodeList::parseNodeFromPacketStream(QDataStream& packetStream)

            const type = <NodeTypeValue>String.fromCharCode(data.getUint8(dataPosition));
            dataPosition += 1;

            const uuid = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 16;

            const publicSocket = new SockAddr();
            publicSocket.setType(data.getUint8(dataPosition));
            dataPosition += 2;  // Type and IP4
            publicSocket.setAddress(data.getUint32(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 4;
            publicSocket.setPort(data.getUint16(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 2;

            const localSocket = new SockAddr();
            localSocket.setType(data.getUint8(dataPosition));
            dataPosition += 2;  // Type and IP4
            localSocket.setAddress(data.getUint32(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 4;
            localSocket.setPort(data.getUint16(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 2;

            const permissions = new NodePermissions();
            permissions.permissions = data.getUint32(dataPosition, UDT.BIG_ENDIAN);
            dataPosition += 4;

            const isReplicated = data.getUint8(dataPosition) > 0;
            dataPosition += 1;

            const sessionLocalID = data.getUint16(dataPosition, UDT.BIG_ENDIAN);
            dataPosition += 2;

            const connectionSecretUUID = new Uuid(data.getBigUint128(dataPosition, UDT.LITTLE_ENDIAN));
            dataPosition += 16;

            nodes.push({
                type, uuid, publicSocket, localSocket, permissions, isReplicated, sessionLocalID, connectionSecretUUID
            });
        }

        assert(dataPosition === data.byteLength);

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return {
            domainUUID, domainLocalID, newUUID, newLocalID, newPermissions, isAuthenticated, connectRequestTimestamp,
            domainServerPingSendTime, domainServerCheckinProcessingTime, newConnection, nodes
        };
    }

}();

export default DomainList;
export type { DomainListDetails };
