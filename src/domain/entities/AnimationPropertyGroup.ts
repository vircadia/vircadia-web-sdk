//
//  AnimationPropertyGroup.ts
//
//  Created by David Rowe on 27 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../networking/udt/UDT";
import OctreePacketData, { OctreePacketContext } from "../octree/OctreePacketData";
import EntityPropertyFlags, { EntityPropertyList } from "./EntityPropertyFlags";
import { ModelEntityProperties } from "./ModelEntityItem";


/*@devdoc
 *  The <code>AnimationPropertyGroup</code> class provides facilities for handling grab properties of an entity.
 *  <p>C++: <code>class AnimationPropertyGroup : public PropertyGroup</code></p>
 *  @class AnimationPropertyGroup
 *  @property Map<string, number> PROPERTY_MAP - Maps grab property group names to {@link EntityPropertyList} values.
 */
class AnimationPropertyGroup {
    // C++  class AnimationPropertyGroup : public PropertyGroup

    static readonly #_PROPERTY_MAP = new Map<string, number>([  // Maps property names to EntityPropertyList values.
        ["url", EntityPropertyList.PROP_ANIMATION_URL],
        ["allowTranslation", EntityPropertyList.PROP_ANIMATION_ALLOW_TRANSLATION],
        ["fps", EntityPropertyList.PROP_ANIMATION_FPS],
        ["currentFrame", EntityPropertyList.PROP_ANIMATION_FRAME_INDEX],
        ["running", EntityPropertyList.PROP_ANIMATION_PLAYING],
        ["loop", EntityPropertyList.PROP_ANIMATION_LOOP],
        ["firstFrame", EntityPropertyList.PROP_ANIMATION_FIRST_FRAME],
        ["lastFrame", EntityPropertyList.PROP_ANIMATION_LAST_FRAME],
        ["hold", EntityPropertyList.PROP_ANIMATION_HOLD]
    ]);

    /*@devdoc
     *  Gets property flags for Model <code>animation</code> properties set in the entity properties object passed in, assuming
     *  that they may be changes.
     *  <p>Note: The SDK doesn't maintain its own entity tree so it doesn't calculate whether the property values have actually
     *  changed.</p>
     *  @param {EntityPropertyFlags} properties - A set of entity properties and values.
     *  @returns {EntityPropertyFlags} Flags for all the Model <code>animation</code> properties included in the entity
     *      properties object.
     */
    static getChangedProperties(properties: ModelEntityProperties): EntityPropertyFlags { 
        //  C++ EntityPropertyFlags getChangedProperties() const
        const changedProperties = new EntityPropertyFlags();
        if (properties.animation) {
            const propertyNames = Object.keys(properties.animation);
            for (const propertyName of propertyNames) {
                const propertyValue = AnimationPropertyGroup.#_PROPERTY_MAP.get(propertyName);
                if (propertyValue !== undefined) {
                    changedProperties.setHasProperty(propertyValue, true);
                }
            }
        }
        return changedProperties;
    }

    /*@devdoc
     *  Writes AnimationPropertyGroup properties to a buffer as are able to fit.
     *  @param {DataView} data - The buffer to write to.
     *  @param {number} dataPosition - The position to start writing at.
     *  @param {EntityProperties} entityProperties - A set of entity properties and values.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendToEditPacket(data: DataView, dataPosition: number, entityProperties: ModelEntityProperties,
        packetContext: OctreePacketContext): number {
        // C++  bool AnimationPropertyGroup::appendToEditPacket(OctreePacketData* packetData,
        //          EntityPropertyFlags& requestedProperties,nEntityPropertyFlags& propertyFlags,
        //          EntityPropertyFlags& propertiesDidntFit, int& propertyCount, OctreeElement::AppendState& appendState) const

        /* eslint-disable @typescript-eslint/no-non-null-assertion */

        let bytesWritten = 0;
        const requestedProperties = packetContext.propertiesToWrite;

        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_URL)) {
            bytesWritten += OctreePacketData.appendStringValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_URL,
                entityProperties.animation!.url!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_ALLOW_TRANSLATION)) {
            bytesWritten += OctreePacketData.appendBooleanValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_ALLOW_TRANSLATION,
                entityProperties.animation!.allowTranslation!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_FPS)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_FPS,
                entityProperties.animation!.fps!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_FRAME_INDEX)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_FRAME_INDEX,
                entityProperties.animation!.currentFrame!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_PLAYING)) {
            bytesWritten += OctreePacketData.appendBooleanValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_PLAYING,
                entityProperties.animation!.running!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP)) {
            bytesWritten += OctreePacketData.appendBooleanValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_LOOP,
                entityProperties.animation!.loop!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_FIRST_FRAME)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_FIRST_FRAME,
                entityProperties.animation!.firstFrame!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_LAST_FRAME)) {
            bytesWritten += OctreePacketData.appendFloat32Value(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_LAST_FRAME,
                entityProperties.animation!.lastFrame!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD)) {
            bytesWritten += OctreePacketData.appendBooleanValue(data, dataPosition + bytesWritten,
                EntityPropertyList.PROP_ANIMATION_HOLD,
                entityProperties.animation!.hold!, packetContext);
        }

        return bytesWritten;

        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

}

export default AnimationPropertyGroup;
