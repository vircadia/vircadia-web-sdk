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


// WEBRTC TODO: Replace Record<string, never> with AmbientLightPropertyGroupProperties.
type AmbientLightPropertyGroupSubclassData = {
    bytesRead: number;
    properties: Record<string, never>;
};


class AmbientLightPropertyGroup {
    // C++  class AmbientLightPropertyGroup : public PropertyGroup

    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): AmbientLightPropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int AmbientLightPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_INTENSITY)) {
            // WEBRTC TODO: Read ambientLightIntensity property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read ambientLightURL
                dataPosition += length;
            }
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default AmbientLightPropertyGroup;
export type { AmbientLightPropertyGroupSubclassData };
