//
//  PulsePropertyPropertyGroup.ts
//
//  Created by Julien Merzoug on 20 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyList } from "./EntityPropertyFlags";


// WEBRTC TODO: Replace Record<string, never> with PulsePropertyGroupProperties.
type PulsePropertyGroupSubclassData = {
    bytesRead: number;
    properties: Record<string, never>;
};


class PulsePropertyGroup {
    // C++  class PulsePropertyGroup : public PropertyGroup

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): PulsePropertyGroupSubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int PulsePropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_PULSE_MIN)) {
            // WEBRTC TODO: Read pulseMin property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_PULSE_MAX)) {
            // WEBRTC TODO: Read pulseMax property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_PULSE_PERIOD)) {
            // WEBRTC TODO: Read pulsePeriod property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_PULSE_COLOR_MODE)) {
            // WEBRTC TODO: Read pulseColorMode property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_PULSE_ALPHA_MODE)) {
            // WEBRTC TODO: Read pulseAlphaMode property.
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default PulsePropertyGroup;
export type { PulsePropertyGroupSubclassData };
