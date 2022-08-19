//
//  DomainServerAddedNode.ts
//
//  Created by David Rowe on 19 Aug 2022.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import assert from "../../shared/assert";
import Uuid from "../../shared/Uuid";
import { NewNodeInfo } from "../LimitedNodeList";
import NodePermissions from "../NodePermissions";
import { NodeTypeValue } from "../NodeType";
import SockAddr from "../SockAddr";

import "../../shared/DataViewExtensions";


type DomainServerAddedNodeDetails = NewNodeInfo;


const DomainServerAddedNode = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} a {@link PacketType(1)|DomainServerAddedNode} packet.
     *  @typedef {LimitedNodeList.NewNodeInfo} PacketScribe.DomainServerAddedNodeDetails
     */

    /*@devdoc
     *  Reads a {@link PacketType(1)|DomainServerAddedNode} packet.
     *  @function PacketScribe.DomainServerAddedNode&period;read
     *  @param {DataView} data - The {@link Packets|DomainServerAddedNode} message data to read.
     *  @returns {PacketScribe.DomainServerAddedNodeDetails} Information on the assignment client node added.
     */
    read(data: DataView): DomainServerAddedNodeDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::processDomainServerAddedNode(QSharedPointer<ReceivedMessage> message)
        // C++  void NodeList::parseNodeFromPacketStream(QDataStream& packetStream)


        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const type = <NodeTypeValue>String.fromCharCode(data.getUint8(dataPosition));
        dataPosition += 1;

        const uuid = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        const publicSocket = new SockAddr();
        publicSocket.setType(data.getUint8(dataPosition));
        dataPosition += 2;  // Socket type and IP4.
        publicSocket.setAddress(data.getUint32(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 4;
        publicSocket.setPort(data.getUint16(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 2;

        const localSocket = new SockAddr();
        localSocket.setType(data.getUint8(dataPosition));
        dataPosition += 2;  // Socket type and IP4.
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

        const connectionSecretUUID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength, "ERROR: Length mismatch reading DomainServerAddedNode message!");

        return {
            type,
            uuid,
            publicSocket,
            localSocket,
            permissions,
            isReplicated,
            sessionLocalID,
            connectionSecretUUID
        };
    }

}();

export default DomainServerAddedNode;
export type { DomainServerAddedNodeDetails };
