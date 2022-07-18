//
//  MaterialEntityItem.ts
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
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


// WEBRTC TODO: Replace Record<string, never> with MaterialEntityItem's special properties.
type MaterialEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with MaterialEntitySubclassProperties.
type MaterialEntityProperties = CommonEntityProperties;

// WEBRTC TODO: Replace Record<string, never> with MaterialEntityProperties.
type MaterialEntitySubclassData = {
    bytesRead: number;
    properties: MaterialEntitySubclassProperties;
};


class MaterialEntityItem {
    // C++  class MaterialEntityItem : public EntityItem

    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): MaterialEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int TextEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MATERIAL_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read materialURL property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MATERIAL_MAPPING_MODE)) {
            // WEBRTC TODO: Read materialMappingMode property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MATERIAL_PRIORITY)) {
            // WEBRTC TODO: Read materialPriority property.
            dataPosition += 2;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARENT_MATERIAL_NAME)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read materialParentName property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MATERIAL_MAPPING_POS)) {
            // WEBRTC TODO: Read materialMappingPOS property.
            dataPosition += 8;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MATERIAL_MAPPING_SCALE)) {
            // WEBRTC TODO: Read materialMappingScale property.
            dataPosition += 8;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MATERIAL_MAPPING_ROT)) {
            // WEBRTC TODO: Read materialMappingROT property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MATERIAL_DATA)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read materialData property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MATERIAL_REPEAT)) {
            // WEBRTC TODO: Read materialRepeat property.
            dataPosition += 1;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default MaterialEntityItem;
export type { MaterialEntitySubclassData, MaterialEntityProperties };
