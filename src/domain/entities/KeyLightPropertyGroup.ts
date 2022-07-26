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

import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


// WEBRTC TODO: Replace Record<string, never> with KeyLightPropertyGroupProperties.
type KeyLightPropertyGroupSubclassData = {
    bytesRead: number;
    properties: Record<string, never>;
};


class KeyLightPropertyGroup {
    // C++  class KeyLightPropertyGroup : public PropertyGroup

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): KeyLightPropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int KeyLightPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_COLOR)) {
            // WEBRTC TODO: Read keylightColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_INTENSITY)) {
            // WEBRTC TODO: Read keylightIntensity property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_DIRECTION)) {
            // WEBRTC TODO: Read keylightDirection property.
            dataPosition += 12;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_CAST_SHADOW)) {
            // WEBRTC TODO: Read keylightCastShadow property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_SHADOW_BIAS)) {
            // WEBRTC TODO: Read keylightShadowBias property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_SHADOW_MAX_DISTANCE)) {
            // WEBRTC TODO: Read keylightShadowMaxDistance property.
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default KeyLightPropertyGroup;
export type { KeyLightPropertyGroupSubclassData };
