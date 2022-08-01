//
//  DomainServerRemovedNode.ts
//
//  Created by David Rowe on 20 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import assert from "../../shared/assert";
import Uuid from "../../shared/Uuid";

import "../../shared/DataViewExtensions";


type DomainServerRemovedNodeDetails = {
    nodeUUID: Uuid
};


const DomainServerRemovedNode = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} a {@link PacketType(1)|DomainServerRemovedNode} packet.
     *  @typedef {object} PacketScribe.DomainServerRemovedNodeDetails
     *  @property {Uuid} nodeUUID - The UUID of the assignment client node that has been removed.
     */

    /*@devdoc
     *  Reads a {@link PacketType(1)|DomainServerRemovedNode} packet.
     *  @function PacketScribe.DomainServerRemovedNode&period;read
     *  @param {DataView} data - The {@link Packets|DomainServerRemovedNode} message data to read.
     *  @returns {PacketScribe.DomainServerRemovedNodeDetails} Information on the assignment client node removed.
     */
    read(data: DataView): DomainServerRemovedNodeDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::processDomainServerRemovedNode(QSharedPointer<ReceivedMessage> message)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const nodeUUID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength, "ERROR: Length mismatch reading DomainServerRemovedNode message!");

        return {
            nodeUUID
        };
    }

}();

export default DomainServerRemovedNode;
export type { DomainServerRemovedNodeDetails };
