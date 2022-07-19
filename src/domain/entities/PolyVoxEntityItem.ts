//
//  PolyVoxEntityItem.ts
//
//  Created by Julien Merzoug on 19 Jul 2022.
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


// WEBRTC TODO: Replace Record<string, never> with PolyVoxEntityItem's special properties.
type PolyVoxEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with PolyVoxEntitySubclassProperties.
type PolyVoxEntityProperties = CommonEntityProperties;

// WEBRTC TODO: Replace Record<string, never> with PolyVoxEntityProperties.
type PolyVoxEntitySubclassData = {
    bytesRead: number;
    properties: PolyVoxEntitySubclassProperties;
};


class PolyVoxEntityItem {
    // C++  class PolyVoxEntityItem : public EntityItem

    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): PolyVoxEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int PolyVoxEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VOXEL_VOLUME_SIZE)) {
            // WEBRTC TODO: Read voxelVolumeSize property.
            dataPosition += 12;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VOXEL_DATA)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                for (let j = 0; j < length; j++) {
                    // WEBRTC TODO: Read voxelData property.
                    dataPosition += 1;
                }
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VOXEL_SURFACE_STYLE)) {
            // WEBRTC TODO: Read voxelSurfaceStyle property.
            dataPosition += 2;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_X_TEXTURE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read xTextureURL prop.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_Y_TEXTURE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read yTextureURL prop.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_Z_TEXTURE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read zTextureURL prop.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_X_N_NEIGHBOR_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read xNNeighborID property.
                dataPosition += 16;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_Y_N_NEIGHBOR_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read yNNeighborID property.
                dataPosition += 16;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_Z_N_NEIGHBOR_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read zNNeighborID property.
                dataPosition += 16;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_X_P_NEIGHBOR_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read xPNeighborID property.
                dataPosition += 16;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_Y_P_NEIGHBOR_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read yPNeighborID property.
                dataPosition += 16;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_Z_P_NEIGHBOR_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read zPNeighborID property.
                dataPosition += 16;
            }
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default PolyVoxEntityItem;
export type { PolyVoxEntitySubclassData, PolyVoxEntityProperties };
