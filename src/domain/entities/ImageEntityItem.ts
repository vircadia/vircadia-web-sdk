//
//  ImageEntityItem.ts
//
//  Created by Julien Merzoug on 14 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { CommonEntityProperties } from "../networking/packets/EntityData";
import UDT from "../networking/udt/UDT";
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


// WEBRTC TODO: Replace Record<string, never> with ImageEntityItem's special properties.
type ImageEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with ImageEntitySubclassProperties.
type ImageEntityProperties = CommonEntityProperties;

// WEBRTC TODO: Replace Record<string, never> with ImageEntityProperties.
type ImageEntitySubclassData = {
    bytesRead: number;
    properties: ImageEntitySubclassProperties;
};


class ImageEntityItem {
    // C++  class ImageEntityItem : public EntityItem

    // eslint-disable-next-line max-len
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ImageEntitySubclassData { // eslint-disable-line class-methods-use-this
        // C++  int ImageEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
            // WEBRTC TODO: Read color property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA)) {
            // WEBRTC TODO: Read alpha property.
            dataPosition += 4;
        }

        // Skip over pulseMode. It is deprecated.
        dataPosition += 20;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_IMAGE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read imageUrl property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMISSIVE)) {
            // WEBRTC TODO: Read emissive property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEEP_ASPECT_RATIO)) {
            // WEBRTC TODO: Read keepAspectRatio property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SUB_IMAGE)) {
            // WEBRTC TODO: Read keepAspectRatio property.
            dataPosition += 16;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default ImageEntityItem;
export type { ImageEntitySubclassData, ImageEntityProperties };
