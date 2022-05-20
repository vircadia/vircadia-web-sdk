//
//  BulkAvatarTraits.ts
//
//  Created by David Rowe on 28 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarTraits, { TraitType, AvatarTraitValue, AvatarTraitsValues } from "../../avatars/AvatarTraits";
import assert from "../../shared/assert";
import Uuid from "../../shared/Uuid";
import UDT from "../udt/UDT";

import "../../shared/DataViewExtensions";


type BulkAvatarTraitsDetails = {
    traitsSequenceNumber: bigint
    avatarTraitsList: AvatarTraitsValues[]
};


const BulkAvatarTraits = new class {
    // C++  N/A

    /*@devdoc
     *  Avatar traits information {@link PacketScribe|read} from a {@link PacketType(1)|BulkAvatarTraits} message.
     *  @typedef {object} PacketScribe.BulkAvatarTraitsDetails
     *  @property {bigint} traitsSequenceNumber - The avatar traits message sequence number.
     *  @property {AvatarTraits.AvatarTraitsValues[]} avatarTraitsList - The traits of one or more avatars.
     */


    #_haveWarnedComplexTraits = false;


    /*@devdoc
     *  Reads a {@link PacketType(1)|BulkAvatarTraits} packet.
     *  @function PacketScribe.BulkAvatarTraits&period;read
     *  @param {DataView} data - The BulkAvatarTraits message data to read.
     *  @returns {PacketScribe.BulkAvatarTraitsDetails} The traits information obtained from reading the packet.
     */
    read(data: DataView): BulkAvatarTraitsDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void AvatarHashMap::processBulkAvatarTraits(ReceivedMessage* message, Node* sendingNode)

        let dataPosition = 0;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const traitsSequenceNumber = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        // WEBRTC TODO: Read further data.

        const avatarTraitsList: AvatarTraitsValues[] = [];

        while (dataPosition < data.byteLength) {
            // New avatar.

            const avatarID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 16;

            let traitType = data.getInt8(dataPosition);
            dataPosition += 1;

            const avatarTraits: AvatarTraitValue[] = [];

            while (traitType !== TraitType.NullTrait) {
                // New trait for avatar.

                const packetTraitVersion = data.getInt32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;

                if (AvatarTraits.isSimpleTrait(traitType)) {

                    const traitBinarySize = data.getInt16(dataPosition, UDT.LITTLE_ENDIAN);
                    dataPosition += 2;

                    const traitValue = AvatarTraits.processTrait(traitType, data, dataPosition, traitBinarySize);
                    avatarTraits.push({
                        type: traitType,
                        version: packetTraitVersion,
                        value: traitValue
                    });
                    dataPosition += traitBinarySize;

                } else {

                    // WERBRTC TODO: Use traitInstanceID below.
                    // const traitInstanceID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                    dataPosition += 16;

                    const traitBinarySize = data.getInt16(dataPosition, UDT.LITTLE_ENDIAN);
                    dataPosition += 2;

                    // WEBRTC TODO: Address further C++ - avatar entity and grab.
                    if (!this.#_haveWarnedComplexTraits) {
                        console.warn("BulkAvatarTraits: Complex avatar traits not handled.");
                        this.#_haveWarnedComplexTraits = true;
                    }

                    dataPosition += traitBinarySize;
                }

                // Read the next trait type, which is Null Trait if there are no more traits for this avatar.
                traitType = data.getInt8(dataPosition);
                dataPosition += 1;
            }

            if (avatarTraits.length > 0) {
                avatarTraitsList.push({
                    avatarID,
                    avatarTraits
                });
            }

        }

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength);

        return {
            traitsSequenceNumber,
            avatarTraitsList
        };
    }

}();

export default BulkAvatarTraits;
export type { BulkAvatarTraitsDetails };
