//
//  HazePropertyGroup.ts
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


// WEBRTC TODO: Replace Record<string, never> with HazePropertyGroupProperties.
type HazePropertyGroupSubclassData = {
    bytesRead: number;
    properties: Record<string, never>;
};


class HazePropertyGroup {
    // C++  class HazePropertyGroup : public PropertyGroup

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): HazePropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int HazePropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_RANGE)) {
            // WEBRTC TODO: Read hazeRange property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_COLOR)) {
            // WEBRTC TODO: Read hazeColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_GLARE_COLOR)) {
            // WEBRTC TODO: Read hazeGlareColor property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_ENABLE_GLARE)) {
            // WEBRTC TODO: Read hazeEnableGlare property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_GLARE_ANGLE)) {
            // WEBRTC TODO: Read hazeGlareAngle property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_ALTITUDE_EFFECT)) {
            // WEBRTC TODO: Read hazeAltitudeEffect property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_CEILING)) {
            // WEBRTC TODO: Read hazeCeiling property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_BASE_REF)) {
            // WEBRTC TODO: Read hazeBaseRef property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_BACKGROUND_BLEND)) {
            // WEBRTC TODO: Read hazeBackgroundBlend property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_ATTENUATE_KEYLIGHT)) {
            // WEBRTC TODO: Read hazeAttenuateKeylight property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_KEYLIGHT_RANGE)) {
            // WEBRTC TODO: Read hazeKeylightRange property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_KEYLIGHT_ALTITUDE)) {
            // WEBRTC TODO: Read hazeKeylightAltitude property.
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default HazePropertyGroup;
export type { HazePropertyGroupSubclassData };
