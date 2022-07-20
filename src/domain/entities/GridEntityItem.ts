//
//  GridEntityItem.ts
//
//  Created by Julien Merzoug on 19 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { CommonEntityProperties } from "../networking/packets/EntityData";
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";
import PulsePropertyGroup from "./PulsePropertyGroup";


// WEBRTC TODO: Replace Record<string, never> with GridEntityItem's special properties.
type GridEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with GridEntitySubclassProperties.
type GridEntityProperties = CommonEntityProperties;

// WEBRTC TODO: Replace Record<string, never> with GridEntityProperties.
type GridEntitySubclassData = {
    bytesRead: number;
    properties: GridEntitySubclassProperties;
};


class GridEntityItem {
    // C++  class GridEntityItem : public EntityItem

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): GridEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int GridEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
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

        const pulseProperties = PulsePropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += pulseProperties.bytesRead;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRID_FOLLOW_CAMERA)) {
            // WEBRTC TODO: Read gridFollowCamera property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MAJOR_GRID_EVERY)) {
            // WEBRTC TODO: Read majorGridEvery property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MINOR_GRID_EVERY)) {
            // WEBRTC TODO: Read minorGridEvery property.
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default GridEntityItem;
export type { GridEntitySubclassData, GridEntityProperties };
