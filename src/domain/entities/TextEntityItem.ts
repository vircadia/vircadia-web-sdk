//
//  TextEntityItem.ts
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
import PulsePropertyGroup from "./PulsePropertyGroup";


// WEBRTC TODO: Replace Record<string, never> with TextEntityItem's special properties.
type TextEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with TextEntitySubclassProperties.
type TextEntityProperties = CommonEntityProperties;

type TextEntitySubclassData = {
    bytesRead: number;
    properties: TextEntitySubclassProperties;
};


class TextEntityItem {
    // C++  class TextEntityItem : public EntityItem

    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): TextEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int TextEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const pulseProperties = PulsePropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += pulseProperties.bytesRead;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read text property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LINE_HEIGHT)) {
            // WEBRTC TODO: Read lineHeight property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_COLOR)) {
            // WEBRTC TODO: Read textColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_ALPHA)) {
            // WEBRTC TODO: Read textAlpha property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BACKGROUND_COLOR)) {
            // WEBRTC TODO: Read backgroundColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BACKGROUND_ALPHA)) {
            // WEBRTC TODO: Read backgroundAlpha property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LEFT_MARGIN)) {
            // WEBRTC TODO: Read leftMargin property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RIGHT_MARGIN)) {
            // WEBRTC TODO: Read rightMargin property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TOP_MARGIN)) {
            // WEBRTC TODO: Read topMargin property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BOTTOM_MARGIN)) {
            // WEBRTC TODO: Read bottomMargin property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_UNLIT)) {
            // WEBRTC TODO: Read unlit property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FONT)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read font property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_EFFECT)) {
            // WEBRTC TODO: Read textEffect property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_EFFECT_COLOR)) {
            // WEBRTC TODO: Read textEffectColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_EFFECT_THICKNESS)) {
            // WEBRTC TODO: Read textEffectThickness property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_ALIGNMENT)) {
            // WEBRTC TODO: Read textAlignment property.
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default TextEntityItem;
export type { TextEntitySubclassData, TextEntityProperties };
