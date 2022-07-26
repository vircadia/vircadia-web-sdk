//
//  ZoneEntityItem.ts
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
import AmbientLightPropertyGroup from "./AmbientLightPropertyGroup";
import BloomPropertyGroup from "./BloomPropertyGroup";
import { EntityPropertyFlags } from "./EntityPropertyFlags";
import HazePropertyGroup from "./HazePropertyGroup";
import KeyLightPropertyGroup from "./KeyLightPropertyGroup";
import SkyboxPropertyGroup from "./SkyboxPropertyGroup";


// WEBRTC TODO: Replace Record<string, never> with ZoneEntityItem's special properties.
type ZoneEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with ZoneEntitySubclassProperties.
type ZoneEntityProperties = CommonEntityProperties;

type ZoneEntitySubclassData = {
    bytesRead: number;
    properties: ZoneEntitySubclassProperties;
};


class ZoneEntityItem {
    // C++  class ZoneEntityItem : public EntityItem

    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ZoneEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int ZoneEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE)) {
            // WEBRTC TODO: Read shapeType property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read compoundShapeURL property.
                dataPosition += length;
            }
        }

        const keylightProperties = KeyLightPropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += keylightProperties.bytesRead;

        const ambientLightProperties = AmbientLightPropertyGroup.readEntitySubclassDataFromBuffer(
            data, dataPosition, propertyFlags
        );
        dataPosition += ambientLightProperties.bytesRead;

        const skyboxProperties = SkyboxPropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += skyboxProperties.bytesRead;

        const hazeProperties = HazePropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += hazeProperties.bytesRead;

        const bloomProperties = BloomPropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += bloomProperties.bytesRead;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FLYING_ALLOWED)) {
            // WEBRTC TODO: Read flyingAllowed property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GHOSTING_ALLOWED)) {
            // WEBRTC TODO: Read ghostingAllowed property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FILTER_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read filterURL property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEY_LIGHT_MODE)) {
            // WEBRTC TODO: Read keyLightMode property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_MODE)) {
            // WEBRTC TODO: Read ambientLightMode property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SKYBOX_MODE)) {
            // WEBRTC TODO: Read skyboxMode property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_MODE)) {
            // WEBRTC TODO: Read hazeMode property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLOOM_MODE)) {
            // WEBRTC TODO: Read bloomMode property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AVATAR_PRIORITY)) {
            // WEBRTC TODO: Read avatarPriority property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCREENSHARE)) {
            // WEBRTC TODO: Read screenshare property.
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default ZoneEntityItem;
export type { ZoneEntitySubclassData, ZoneEntityProperties };
