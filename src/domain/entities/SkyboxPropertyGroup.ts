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
import type { color } from "../shared/Color";
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


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
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): SkyboxPropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int SkyboxPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        let color: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SKYBOX_COLOR)) {
            color = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let url: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SKYBOX_URL)) {
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

}

export default SkyboxPropertyGroup;
export type { SkyboxPropertyGroupSubclassData, SkyboxProperties };
