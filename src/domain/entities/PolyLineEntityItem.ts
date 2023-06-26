//
//  PolyLineEntitytItem.ts
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
import { EntityPropertyList } from "./EntityPropertyFlags";


// WEBRTC TODO: Replace Record<string, never> with PolyLineEntityItem's special properties.
type PolyLineEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with PolyLineEntitySubclassProperties.
type PolyLineEntityProperties = CommonEntityProperties;

type PolyLineEntitySubclassData = {
    bytesRead: number;
    properties: PolyLineEntitySubclassProperties;
};


class PolyLineEntityItem {
    // C++  class PolyLineEntityItem : public EntityItem

    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): PolyLineEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int PolyLineEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_COLOR)) {
            // WEBRTC TODO: Read color property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_TEXTURES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read textures property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_LINE_POINTS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read linePoints property.
                dataPosition += length * 12;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_STROKE_WIDTHS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read strokeWidth property.
                dataPosition += length * 4;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_STROKE_NORMALS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read strokeNormals property.
                dataPosition += length * 12;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_STROKE_COLORS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read strokeColors property.
                dataPosition += length * 12;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_IS_UV_MODE_STRETCH)) {
            // WEBRTC TODO: Read isUVModeStretch property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_LINE_GLOW)) {
            // WEBRTC TODO: Read lineGlow property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_LINE_FACE_CAMERA)) {
            // WEBRTC TODO: Read lineFaceCamera property.
            dataPosition += 1;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default PolyLineEntityItem;
export type { PolyLineEntitySubclassData, PolyLineEntityProperties };
