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
import OctreePacketData, { OctreePacketContext } from "../octree/OctreePacketData";
import EntityPropertyFlags, { EntityPropertyList } from "./EntityPropertyFlags";
import { ZoneEntityProperties } from "./ZoneEntityItem";


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

    static readonly #_PROPERTY_MAP = new Map<string, number>([  // Maps property names to EntityPropertyList values.
        // C++  EntityPropertyFlags BloomPropertyGroup::getChangedProperties() const
        ["intensity", EntityPropertyList.PROP_BLOOM_INTENSITY],
        ["threshold", EntityPropertyList.PROP_BLOOM_THRESHOLD],
        ["size", EntityPropertyList.PROP_BLOOM_SIZE]
    ]);


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
        propertyFlags: EntityPropertyFlags): BloomPropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int BloomPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        let intensity: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY)) {
            intensity = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let threshold: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_BLOOM_THRESHOLD)) {
            threshold = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let size: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_BLOOM_SIZE)) {
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

    /*@devdoc
     *  Gets property flags for Zone <code>bloom</code> properties set in the entity properties object passed in,
     *  assuming that there may be changes.
     *  <p>Note: The SDK doesn't maintain its own entity tree so it doesn't calculate whether the property values have actually
     *  changed.</p>
     *  @param {EntityPropertyFlags} properties - A set of entity properties and values.
     *  @returns {EntityPropertyFlags} Flags for all the Zone <code>bloom</code> properties included in the entity
     *      properties object.
     */
    static getChangedProperties(properties: ZoneEntityProperties): EntityPropertyFlags {
        //  C++ EntityPropertyFlags getChangedProperties() const
        const changedProperties = new EntityPropertyFlags();
        if (properties.bloom) {
            const propertyNames = Object.keys(properties.bloom);
            for (const propertyName of propertyNames) {
                const propertyValue = BloomPropertyGroup.#_PROPERTY_MAP.get(propertyName);
                if (propertyValue !== undefined) {
                    changedProperties.setHasProperty(propertyValue, true);
                }
            }
        }
        return changedProperties;
    }

    /*@devdoc
     *  Writes BloomPropertyGroup properties to a buffer as are able to fit.
     *  @param {DataView} data - The buffer to write to.
     *  @param {number} dataPosition - The position to start writing at.
     *  @param {EntityProperties} entityProperties - A set of entity properties and values.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendToEditPacket(data: DataView, dataPosition: number, entityProperties: ZoneEntityProperties,
        packetContext: OctreePacketContext): number {
        // C++  bool appendToEditPacket(OctreePacketData* packetData, EntityPropertyFlags& requestedProperties,
        //          EntityPropertyFlags & propertyFlags, EntityPropertyFlags& propertiesDidntFit, int& propertyCount,
        //          OctreeElement:: AppendState & appendState) const

        /* eslint-disable @typescript-eslint/no-non-null-assertion */

        let bytesWritten = 0;
        const requestedProperties = packetContext.propertiesToWrite;

        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_BLOOM_INTENSITY,
                entityProperties.bloom!.intensity!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_BLOOM_THRESHOLD)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_BLOOM_THRESHOLD,
                entityProperties.bloom!.threshold!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_BLOOM_SIZE)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_BLOOM_SIZE,
                entityProperties.bloom!.size!, UDT.LITTLE_ENDIAN, packetContext);
        }

        return bytesWritten;

        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

}

export default BloomPropertyGroup;
export type { BloomPropertyGroupSubclassData, BloomProperties };
