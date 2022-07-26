//
//  GizmoEntityItem.ts
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
import RingGizmoPropertyGroup from "./RingGizmoPropertyGroup";


// WEBRTC TODO: Replace Record<string, never> with GizmoEntityItem's special properties.
type GizmoEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with GizmoEntitySubclassProperties.
type GizmoEntityProperties = CommonEntityProperties;

type GizmoEntitySubclassData = {
    bytesRead: number;
    properties: GizmoEntitySubclassProperties;
};


class GizmoEntityItem {
    // C++  class GizmoEntityItem : public EntityItem

    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): GizmoEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int GizmoEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GIZMO_TYPE)) {
            // WEBRTC TODO: Read gizmoType property.
            dataPosition += 4;
        }

        const ringProperties = RingGizmoPropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += ringProperties.bytesRead;

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default GizmoEntityItem;
export type { GizmoEntitySubclassData, GizmoEntityProperties };
