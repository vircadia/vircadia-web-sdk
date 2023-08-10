//
//  SkyboxPropertyGroup.ts
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
import type { color } from "../shared/Color";
import EntityPropertyFlags, { EntityPropertyList } from "./EntityPropertyFlags";
import { ZoneEntityProperties } from "./ZoneEntityItem";


type SkyboxProperties = {
    color: color | undefined,
    url: string | undefined
};

type SkyboxPropertyGroupSubclassData = {
    bytesRead: number
    properties: SkyboxProperties
};


/*@devdoc
 *  The <code>SkyboxPropertyGroup</code> class provides facilities for reading skybox properties of a Zone entity from a packet.
 *  <p>C++: <code>class SkyboxPropertyGroup : public PropertyGroup</code></p>
 *  @class SkyboxPropertyGroup
 */
class SkyboxPropertyGroup {
    // C++  class SkyboxPropertyGroup : public PropertyGroup

    static readonly #_PROPERTY_MAP = new Map<string, number>([  // Maps property names to EntityPropertyList values.
        // C++  EntityPropertyFlags SkyboxPropertyGroup::getChangedProperties() const
        ["color", EntityPropertyList.PROP_SKYBOX_COLOR],
        ["url", EntityPropertyList.PROP_SKYBOX_URL]
    ]);

    /*@sdkdoc
     *  Defines the skybox of a zone.
     *  @typedef {object} SkyboxProperties
     *  @property {color|undefined} color=0,0,0 - Sets the color of the sky if <code>url</code? is <code>""</code>,
     *      otherwise modifies the color of the cube map image.
     *  @property {string|undefined} url="" - A cube map image that is used to render the sky.
     */

    /*@devdoc
     *  A wrapper for providing {@link SkyboxProperties} and the number of bytes read.
     *  @typedef {object} SkyboxPropertyGroupSubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {SkyboxProperties} properties - The skybox properties.
     */

    /*@devdoc
     *  Reads, if present, a Zone entity's skybox properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Zone entity's skybox properties in the {@link Packets|EntityData}
     *      message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {SkyboxPropertyGroupSubclassData} The Zone entity's skybox properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: EntityPropertyFlags): SkyboxPropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int SkyboxPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        let color: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_SKYBOX_COLOR)) {
            color = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let url: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_SKYBOX_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                url = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                url = "";
            }
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                color,
                url
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    /*@devdoc
     *  Gets property flags for Zone <code>skybox</code> properties set in the entity properties object passed in,
     *  assuming that there may be changes.
     *  <p>Note: The SDK doesn't maintain its own entity tree so it doesn't calculate whether the property values have actually
     *  changed.</p>
     *  @param {EntityPropertyFlags} properties - A set of entity properties and values.
     *  @returns {EntityPropertyFlags} Flags for all the Zone <code>skybox</code> properties included in the entity
     *      properties object.
     */
    static getChangedProperties(properties: ZoneEntityProperties): EntityPropertyFlags {
        //  C++ EntityPropertyFlags getChangedProperties() const
        const changedProperties = new EntityPropertyFlags();
        if (properties.skybox) {
            const propertyNames = Object.keys(properties.skybox);
            for (const propertyName of propertyNames) {
                const propertyValue = SkyboxPropertyGroup.#_PROPERTY_MAP.get(propertyName);
                if (propertyValue !== undefined) {
                    changedProperties.setHasProperty(propertyValue, true);
                }
            }
        }
        return changedProperties;
    }

    /*@devdoc
     *  Writes SkyboxPropertyGroup properties to a buffer as are able to fit.
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

        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SKYBOX_COLOR)) {
            bytesWritten += OctreePacketData.appendColorValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_SKYBOX_COLOR,
                entityProperties.skybox!.color!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SKYBOX_URL)) {
            bytesWritten += OctreePacketData.appendStringValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_SKYBOX_URL,
                entityProperties.skybox!.url!, packetContext);
        }

        return bytesWritten;

        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

}

export default SkyboxPropertyGroup;
export type { SkyboxPropertyGroupSubclassData, SkyboxProperties };
