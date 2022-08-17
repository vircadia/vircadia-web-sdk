//
//  KeyLightPropertyGroup.ts
//
//  Created by Julien Merzoug on 15 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../networking/udt/UDT";
import type { color } from "../shared/Color";
import PropertyFlags from "../shared/PropertyFlags";
import type { vec3 } from "../shared/Vec3";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


type KeyLightProperties = {
    color: color | undefined,
    intensity: number | undefined,
    direction: vec3 | undefined,
    castShadows: boolean | undefined,
    shadowBias: number | undefined,
    shadowMaxDistance: number | undefined
};

type KeyLightPropertyGroupSubclassData = {
    bytesRead: number,
    properties: KeyLightProperties
};


/*@devdoc
 *  The <code>KeyLightPropertyGroup</code> class provides facilities for reading key light properties of a Zone entity from a
 *  packet.
 *  <p>C++: <code>class KeyLightPropertyGroup : public PropertyGroup</code></p>
 *  @class KeyLightPropertyGroup
 */
class KeyLightPropertyGroup {
    // C++  class KeyLightPropertyGroup : public PropertyGroup

    /*@sdkdoc
     *  Defines the key light in a zone.
     *  @typedef {object} KeyLightProperties
     *  @property {color|undefined} color=255,255,255 - The color of the light.
     *  @property {number|undefined} intensity=1 - The intensity of the light.
     *  @property {vec3|undefined} direction=0,-1,0 - The direction the light is shining.
     *  @property {boolean|undefined} castShadows=false - <code>true</code> if shadows are cast, <code>false</code> if they
     *      aren't. Shadows are cast by avatars, plus Model and Shape entities that have their <code>canCastShadow</code>
     *      property set to true.
     *  @property {number|undefined} shadowBias=0.5 - The bias of the shadows cast by the light, range <code>0.0</code>
     *      &ndash; <code>1.0</code>. This fine-tunes shadows cast by the light, to prevent shadow acne and peter panning.
     *  @property {number|undefined} shadowMaxDistance=40.0 - The maximum distance from the camera position at which shadows
     *      will be computed, range <code>1.0</code> &ndash; <code>250.0</code>. Higher values cover more of the scene but with
     *      less precision.
     */

    /*@devdoc
     *  A wrapper for providing {@link KeyLightProperties} and the number of bytes read.
     *  @typedef {object} KeyLightPropertyGroupSubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {KeyLightProperties} properties - The key light properties.
     */

    /*@devdoc
     *  Reads, if present, a Zone entity's key light properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Zone entity's key light properties in the {@link Packets|EntityData}
     *      message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {KeyLightPropertyGroupSubclassData} The Zone entity's key light properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number,
        propertyFlags: PropertyFlags): KeyLightPropertyGroupSubclassData {
        // C++  int KeyLightPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        let color: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_COLOR)) {
            color = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let intensity: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_INTENSITY)) {
            intensity = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let direction: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_DIRECTION)) {
            direction = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let castShadows: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_CAST_SHADOW)) {
            castShadows = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let shadowBias: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_SHADOW_BIAS)) {
            shadowBias = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let shadowMaxDistance: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_SHADOW_MAX_DISTANCE)) {
            shadowMaxDistance = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                color,
                intensity,
                direction,
                castShadows,
                shadowBias,
                shadowMaxDistance
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default KeyLightPropertyGroup;
export type { KeyLightPropertyGroupSubclassData, KeyLightProperties };
