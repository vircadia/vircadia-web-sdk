//
//  LightEntityItem.ts
//
//  Created by Julien Merzoug on 15 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { CommonEntityProperties } from "../networking/packets/EntityData";
import UDT from "../networking/udt/UDT";
import type { color } from "../shared/Color";
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


type LightEntitySubclassProperties = {
    color: color | undefined,
    isSpotlight: boolean | undefined,
    intensity: number | undefined,
    exponent: number | undefined,
    cutoff: number | undefined,
    falloffRadius: number | undefined
};

type LightEntityProperties = CommonEntityProperties & LightEntitySubclassProperties;

type LightEntitySubclassData = {
    bytesRead: number;
    properties: LightEntitySubclassProperties;
};


/*@devdoc
 *  The <code>LightEntityItem</code> class provides facilities for reading Light entity properties from a packet.
 *  <p>C++: <code>class LightEntityItem : public EntityItem</code></p>
 *  @class LightEntityItem
 */
class LightEntityItem {
    // C++  class LightEntityItem : public EntityItem

    /*@sdkdoc
     *  The <code>Light</code> {@link EntityType} provides a local lighting effect. Surfaces outside the entity's dimensions are
     *  not lit by the light.
     *  <p>It has properties in addition to the {@link EntityProperties|common EntityProperties}. A property value may be
     *  undefined if it couldn't fit in the data packet sent by the server.</p>
     *  @typedef {object} LightEntityProperties
     *  @property {color|undefined} color=255,255,255 - The color of the light emitted.
     *  @property {number|undefined} intensity=1.0 - The brightness of the light.
     *  @property {number|undefined} falloffRadius=0.1 - The distance from the light's center at which intensity is reduced by
     *      25%.
     *  @property {boolean|undefined} isSpotlight=false - <code>true</code> if the light is directional, emitting along the
     *      entity's local negative z-axis; <code>false</code> if the light is a point light which emanates in all directions.
     *  @property {number|undefined} exponent=0 - Affects the softness of the spotlight beam: the higher the value the softer
     *      the beam.
     *  @property {number|undefined} cutoff=1.57 - Affects the size of the spotlight beam: the higher the value the larger the
     *      beam.
     */

    /*@devdoc
     *  A wrapper for providing {@link LightEntityProperties} and the number of bytes read.
     *  @typedef {object} LightEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {LightEntityProperties} properties - The Light entity properties.
     */

    /*@devdoc
     *  Reads, if present, Light entity properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Light entity properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {LightEntitySubclassData} The Light entity properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number,
        propertyFlags: PropertyFlags): LightEntitySubclassData {
        // C++  int LightEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        let color: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
            color = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let isSpotlight: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_IS_SPOTLIGHT)) {
            isSpotlight = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let intensity: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_INTENSITY)) {
            intensity = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let exponent: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EXPONENT)) {
            exponent = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let cutoff: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CUTOFF)) {
            cutoff = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let falloffRadius: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FALLOFF_RADIUS)) {
            falloffRadius = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                color,
                isSpotlight,
                intensity,
                exponent,
                cutoff,
                falloffRadius
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default LightEntityItem;
export type { LightEntitySubclassData, LightEntityProperties };
