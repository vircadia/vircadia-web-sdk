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

import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


// WEBRTC TODO: Replace Record<string, never> with BloomPropertyGroupProperties.
type BloomPropertyGroupSubclassData = {
    bytesRead: number;
    properties: Record<string, never>;
};


class BloomPropertyGroup {
    // C++  class BloomPropertyGroup : public PropertyGroup

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): BloomPropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int BloomPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLOOM_INTENSITY)) {
            // WEBRTC TODO: Read bloomIntensity property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLOOM_THRESHOLD)) {
            // WEBRTC TODO: Read bloomThreshold property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLOOM_SIZE)) {
            // WEBRTC TODO: Read bloomSize property.
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default BloomPropertyGroup;
export type { BloomPropertyGroupSubclassData };
