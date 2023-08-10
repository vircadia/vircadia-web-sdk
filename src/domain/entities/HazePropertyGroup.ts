//
//  HazePropertyGroup.ts
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


type HazeProperties = {
    range: number | undefined,
    color: color | undefined,
    enableGlare: boolean | undefined,
    glareColor: color | undefined,
    glareAngle: number | undefined,
    altitudeEffect: boolean | undefined,
    base: number | undefined,
    ceiling: number | undefined,
    backgroundBlend: number | undefined,
    attenuateKeyLight: boolean | undefined,
    keyLightRange: number | undefined,
    keyLightAltitude: number | undefined
};

type HazePropertyGroupSubclassData = {
    bytesRead: number,
    properties: HazeProperties
};


/*@devdoc
 *  The <code>HazePropertyGroup</code> class provides facilities for reading haze properties of a Zone entity from a packet.
 *  <p>C++: <code>class HazePropertyGroup : public PropertyGroup</code></p>
 *  @class HazePropertyGroup
 */
class HazePropertyGroup {
    // C++  class HazePropertyGroup : public PropertyGroup

    static readonly #_PROPERTY_MAP = new Map<string, number>([  // Maps property names to EntityPropertyList values.
        // C++  EntityPropertyFlags HazePropertyGroup::getChangedProperties() const
        ["range", EntityPropertyList.PROP_HAZE_RANGE],
        ["color", EntityPropertyList.PROP_HAZE_COLOR],
        ["glareColor", EntityPropertyList.PROP_HAZE_GLARE_COLOR],
        ["enableGlare", EntityPropertyList.PROP_HAZE_ENABLE_GLARE],
        ["glareAngle", EntityPropertyList.PROP_HAZE_GLARE_ANGLE],
        ["altitudeEffect", EntityPropertyList.PROP_HAZE_ALTITUDE_EFFECT],
        ["ceiling", EntityPropertyList.PROP_HAZE_CEILING],
        ["caseRef", EntityPropertyList.PROP_HAZE_BASE_REF],
        ["cackgroundBlend", EntityPropertyList.PROP_HAZE_BACKGROUND_BLEND],
        ["attenuateKeyLight", EntityPropertyList.PROP_HAZE_ATTENUATE_KEYLIGHT],
        ["keyLightRange", EntityPropertyList.PROP_HAZE_KEYLIGHT_RANGE],
        ["keyLightAltitude", EntityPropertyList.PROP_HAZE_KEYLIGHT_ALTITUDE]
    ]);


    /*@sdkdoc
     *  Defines the haze in a zone.
     *  @typedef {object} HazeProperties
     *  @property {number|undefined} range=1000 - The horizontal distance at which visibility is reduced to 95%; i.e., 95% of
     *      each pixel's color is haze.
     *  @property {color|undefined} color=128,154,179 - The color of the haze when looking away from the key light.
     *  @property {boolean|undefined} enableGlare=false - <code>true</code> if the haze is colored with glare from the key
     *      light, <code>false</code> if it isn't. If <code>true</code>, then <code>glareColor</code> and
     *      <code>glareAngle</code> are used.
     *  @property {color|undefined} glareColor=255,229,179 - The color of the haze when looking towards the key light.
     *  @property {number|undefined} glareAngle=20 - The angle in degrees across the circle around the key light that the
     *      glare color and haze color are blended 50/50.
     *  @property {boolean|undefined} altitudeEffect=false - <code>true</code> if haze decreases with altitude as defined by
     *      the entity's local coordinate system, <code>false</code> if it doesn't. If <code>true</code>, then <code>base</code>
     *      and <code>ceiling</code> are used.
     *  @property {number|undefined} base=0 - The y-axis value in the entity's local coordinate system at which the haze
     *      density starts reducing with altitude.
     *  @property {number|undefined} ceiling=200 - The y-axis value in the entity's local coordinate system at which the haze
     *      density has reduced to 5%.
     *  @property {number|undefined} backgroundBlend=0 - The proportion of the skybox image to show through the haze:
     *      <code>0.0</code> displays no skybox image; <code>1.0</code> displays no haze.
     *  @property {boolean|undefined} attenuateKeyLight=false - <code>true</code> if the haze attenuates the key light,
     *      <code>false</code> if it doesn't. If <code>true</code>, then <code>keyLightRange</code> and
     *      <code>keyLightAltitude</code> are used.
     *  @property {number|undefined} keyLightRange=1000 - The distance at which the haze attenuates the key light by 95%.
     *  @property {number|undefined} keyLightAltitude=200 - The altitude at which the haze starts attenuating the key light
     *      (i.e., the altitude at which the distance starts being calculated).
     */

    /*@devdoc
     *  A wrapper for providing {@link HazeProperties} and the number of bytes read.
     *  @typedef {object} HazePropertyGroupSubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {HazeProperties} properties - The haze properties.
     */

    /*@devdoc
     *  Reads, if present, a Zone entity's haze properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Zone entity's haze properties in the {@link Packets|EntityData} message
     *      data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {HazePropertyGroupSubclassData} The Zone entity's haze properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number,
        propertyFlags: EntityPropertyFlags): HazePropertyGroupSubclassData {
        // C++  int HazePropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        let range: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_RANGE)) {
            range = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let color: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_COLOR)) {
            color = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let glareColor: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_GLARE_COLOR)) {
            glareColor = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let enableGlare: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_ENABLE_GLARE)) {
            enableGlare = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let glareAngle: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_GLARE_ANGLE)) {
            glareAngle = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let altitudeEffect: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_ALTITUDE_EFFECT)) {
            altitudeEffect = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let ceiling: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_CEILING)) {
            ceiling = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let base: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_BASE_REF)) {
            base = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let backgroundBlend: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_BACKGROUND_BLEND)) {
            backgroundBlend = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let attenuateKeyLight: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_ATTENUATE_KEYLIGHT)) {
            attenuateKeyLight = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let keyLightRange: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_KEYLIGHT_RANGE)) {
            keyLightRange = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let keyLightAltitude: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_HAZE_KEYLIGHT_ALTITUDE)) {
            keyLightAltitude = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                range,
                color,
                enableGlare,
                glareColor,
                glareAngle,
                altitudeEffect,
                ceiling,
                base,
                backgroundBlend,
                attenuateKeyLight,
                keyLightRange,
                keyLightAltitude
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    /*@devdoc
     *  Gets property flags for Zone <code>haze</code> properties set in the entity properties object passed in,
     *  assuming that there may be changes.
     *  <p>Note: The SDK doesn't maintain its own entity tree so it doesn't calculate whether the property values have actually
     *  changed.</p>
     *  @param {EntityPropertyFlags} properties - A set of entity properties and values.
     *  @returns {EntityPropertyFlags} Flags for all the Zone <code>haze</code> properties included in the entity
     *      properties object.
     */
    static getChangedProperties(properties: ZoneEntityProperties): EntityPropertyFlags {
        //  C++ EntityPropertyFlags getChangedProperties() const
        const changedProperties = new EntityPropertyFlags();
        if (properties.haze) {
            const propertyNames = Object.keys(properties.haze);
            for (const propertyName of propertyNames) {
                const propertyValue = HazePropertyGroup.#_PROPERTY_MAP.get(propertyName);
                if (propertyValue !== undefined) {
                    changedProperties.setHasProperty(propertyValue, true);
                }
            }
        }
        return changedProperties;
    }

    /*@devdoc
     *  Writes HazePropertyGroup properties to a buffer as are able to fit.
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

        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_RANGE)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_RANGE,
                entityProperties.haze!.range!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_COLOR)) {
            bytesWritten += OctreePacketData.appendColorValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_COLOR,
                entityProperties.haze!.color!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_GLARE_COLOR)) {
            bytesWritten += OctreePacketData.appendColorValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_GLARE_COLOR,
                entityProperties.haze!.glareColor!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_ENABLE_GLARE)) {
            bytesWritten += OctreePacketData.appendBooleanValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_ENABLE_GLARE,
                entityProperties.haze!.enableGlare!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_GLARE_ANGLE)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_GLARE_ANGLE,
                entityProperties.haze!.glareAngle!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_ALTITUDE_EFFECT)) {
            bytesWritten += OctreePacketData.appendBooleanValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_ALTITUDE_EFFECT,
                entityProperties.haze!.altitudeEffect!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_CEILING)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_CEILING,
                entityProperties.haze!.ceiling!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_BASE_REF)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_BASE_REF,
                entityProperties.haze!.base!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_BACKGROUND_BLEND)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_BACKGROUND_BLEND,
                entityProperties.haze!.backgroundBlend!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_ATTENUATE_KEYLIGHT)) {
            bytesWritten += OctreePacketData.appendBooleanValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_ATTENUATE_KEYLIGHT,
                entityProperties.haze!.attenuateKeyLight!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_KEYLIGHT_RANGE)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_KEYLIGHT_RANGE,
                entityProperties.haze!.keyLightRange!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HAZE_KEYLIGHT_ALTITUDE)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_HAZE_KEYLIGHT_ALTITUDE,
                entityProperties.haze!.keyLightAltitude!, UDT.LITTLE_ENDIAN, packetContext);
        }

        return bytesWritten;

        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

}

export default HazePropertyGroup;
export type { HazePropertyGroupSubclassData, HazeProperties };
