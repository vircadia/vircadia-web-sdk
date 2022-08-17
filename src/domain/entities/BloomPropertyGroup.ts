//
//  BloomPropertyGroup.ts
//
//  Created by Julien Merzoug on 18 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../networking/udt/UDT";
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


type BloomProperties = {
    intensity: number | undefined,
    threshold: number | undefined,
    size: number | undefined
};

type BloomPropertyGroupSubclassData = {
    bytesRead: number,
    properties: BloomProperties
};


/*@devdoc
 *  The <code>BloomPropertyGroup</code> class provides facilities for reading bloom properties of a Zone entity from a packet.
 *  <p>C++: <code>class BloomPropertyGroup : public PropertyGroup</code></p>
 *  @class BloomPropertyGroup
 */
class BloomPropertyGroup {
    // C++  class BloomPropertyGroup : public PropertyGroup

    /*@sdkdoc
     *  Defines the bloom in a zone.
     *  @typedef {object} BloomProperties
     *  @property {number|undefined} intensity=0.25 - The intensity of the bloom effect.
     *  @property {number|undefined} threshold=0.7 - The threshold for the bloom effect.
     *  @property {number|undefined} size=0.9 - The size of the bloom effect.
     */

    /*@devdoc
     *  A wrapper for providing {@link BloomProperties} and the number of bytes read.
     *  @typedef {object} BloomPropertyGroupSubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {BloomProperties} properties - The bloom properties.
     */

    /*@devdoc
     *  Reads, if present, a Zone entity's bloom properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Zone entity's bloom properties in the {@link Packets|EntityData} message
     *      data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {BloomPropertyGroupSubclassData} The Zone entity's bloom properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number,
        propertyFlags: PropertyFlags): BloomPropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int BloomPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        let intensity: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLOOM_INTENSITY)) {
            intensity = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let threshold: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLOOM_THRESHOLD)) {
            threshold = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let size: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLOOM_SIZE)) {
            size = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                intensity,
                threshold,
                size
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default BloomPropertyGroup;
export type { BloomPropertyGroupSubclassData, BloomProperties };
