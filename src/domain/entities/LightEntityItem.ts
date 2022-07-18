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
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


// WEBRTC TODO: Replace Record<string, never> with LightEntityItem's special properties.
type LightEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with LightEntitySubclassProperties.
type LightEntityProperties = CommonEntityProperties;

// WEBRTC TODO: Replace Record<string, never> with LightEntityProperties.
type LightEntitySubclassData = {
    bytesRead: number;
    properties: LightEntitySubclassProperties;
};


class LightEntityItem {
    // C++  class LightEntityItem : public EntityItem

    // eslint-disable-next-line  @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): LightEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int LightEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
            // WEB TODO: Read color property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_IS_SPOTLIGHT)) {
            // WEB TODO: Read isSpotlight property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_INTENSITY)) {
            // WEB TODO: Read intensity property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EXPONENT)) {
            // WEB TODO: Read exponent property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CUTOFF)) {
            // WEB TODO: Read cutoff property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FALLOFF_RADIUS)) {
            // WEB TODO: Read falloffRadius property.
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default LightEntityItem;
export type { LightEntitySubclassData, LightEntityProperties };
