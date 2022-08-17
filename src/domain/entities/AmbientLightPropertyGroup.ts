//
//  AmbientLightPropertyGroup.ts
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


type AmbientLightProperties = {
    intensity: number | undefined,
    url: string | undefined
};

type AmbientLightPropertyGroupSubclassData = {
    bytesRead: number,
    properties: AmbientLightProperties
};


/*@devdoc
 *  The <code>AmbientLightPropertyGroup</code> class provides facilities for reading ambient light properties of a Zone entity
 *  from a packet.
 *  <p>C++: <code>class AmbientLightPropertyGroup : public PropertyGroup</code></p>
 *  @class AmbientLightPropertyGroup
 */
class AmbientLightPropertyGroup {
    // C++  class AmbientLightPropertyGroup : public PropertyGroup

    /*@sdkdoc
     *  Defines the ambient light in a zone.
     *  @typedef {object} AmbientLightProperties
     *  @property {number|undefined} intensity=0.5 - The intensity of the light.
     *  @property {string|undefined} url="" - A cube map image that defines the color of the light coming from each direction.
     *      If <code>""</code> then the entity's skybox <code>url</code> property value is used, unless that also is
     *      <code>""</code> in which case the entity's <code>ambientLightMode</code> property is set to <code>INHERIT</code>.
     */

    /*@devdoc
     *  A wrapper for providing {@link AmbientLightProperties} and the number of bytes read.
     *  @typedef {object} AmbientLightPropertyGroupSubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {AmbientLightProperties} properties - The ambient light properties.
     */

    /*@devdoc
     *  Reads, if present, a Zone entity's ambient light properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Zone entity's ambient light properties in the {@link Packets|EntityData}
     *      message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {AmbientLightPropertyGroupSubclassData} The Zone entity's ambient light properties and the number of bytes
     *      read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number,
        propertyFlags: PropertyFlags): AmbientLightPropertyGroupSubclassData {
        // C++  int AmbientLightPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        let intensity: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_INTENSITY)) {
            intensity = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let url: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_URL)) {
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
                intensity,
                url
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default AmbientLightPropertyGroup;
export type { AmbientLightPropertyGroupSubclassData, AmbientLightProperties };
