//
//  GrabPropertyGroup.ts
//
//  Created by David Rowe on 13 Aug 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityProperties } from "../networking/packets/EntityData";
import UDT from "../networking/udt/UDT";
import OctreePacketData, { OctreePacketContext } from "../octree/OctreePacketData";
import GLMHelpers from "../shared/GLMHelpers";
import { quat } from "../shared/Quat";
import { vec3 } from "../shared/Vec3";
import EntityPropertyFlags, { EntityPropertyList } from "./EntityPropertyFlags";


type GrabProperties = {
    grabbable: boolean | undefined,
    grabKinematic: boolean | undefined,
    grabFollowsController: boolean | undefined,
    triggerable: boolean | undefined,
    grabEquippable: boolean | undefined,
    delegateToParent: boolean | undefined,
    equippableLeftPositionOffset: vec3 | undefined,
    equippableLeftRotationOffset: quat | undefined,
    equippableRightPositionOffset: vec3 | undefined,
    equippableRightRotationOffset: quat | undefined,
    equippableIndicatorURL: string | undefined,
    equippableIndicatorScale: vec3 | undefined,
    equippableIndicatorOffset: vec3 | undefined
};

type GrabPropertyGroupSubclassData = {
    bytesRead: number,
    properties: GrabProperties
};


/*@devdoc
 *  The <code>GrabPropertyGroup</code> class provides facilities for handling grab properties of an entity.
 *  <p>C++: <code>class GrabPropertyGroup : public PropertyGroup</code></p>
 *  @class GrabPropertyGroup
 */
class GrabPropertyGroup {
    // C++  class GrabPropertyGroup : public PropertyGroup

    static readonly #_PROPERTY_MAP = new Map<string, number>([  // Maps property names to EntityPropertyList values.
        // C++  class GrabPropertyGroup : public PropertyGroup
        ["grabbable", EntityPropertyList.PROP_GRAB_GRABBABLE],
        ["grabKinematic", EntityPropertyList.PROP_GRAB_KINEMATIC],
        ["grabFollowsController", EntityPropertyList.PROP_GRAB_FOLLOWS_CONTROLLER],
        ["triggerable", EntityPropertyList.PROP_GRAB_TRIGGERABLE],
        ["equippable", EntityPropertyList.PROP_GRAB_EQUIPPABLE],
        ["grabDelegateToParent", EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT],
        ["equippableLeftPosition", EntityPropertyList.PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET],
        ["equippableLeftRotation", EntityPropertyList.PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET],
        ["equippableRightPosition", EntityPropertyList.PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET],
        ["equippableRightRotation", EntityPropertyList.PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET],
        ["equippableIndicatorURL", EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_URL],
        ["equippableIndicatorScale", EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE],
        ["equippableIndicatorOffset", EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET]
    ]);


    /*@sdkdoc
     *  Defines an entity's grab properties.
     *  @typedef {object} GrabProperties
     *  @property {boolean|undefined} grabbable - <code>true</code> if the entity can be grabbed, <code>false</code> if it
     *      can't be.
     *  @property {boolean|undefined} grabKinematic - <code>true</code> if the entity will be updated in a kinematic manner
     *      when grabbed; <code>false</code> if it will be grabbed using a tractor action. A kinematic grab will make the item
     *      appear more tightly held but will cause it to behave poorly when interacting with dynamic entities.
     *  @property {boolean|undefined} grabFollowsController - <code>true</code> if the entity will follow the motions of
     *      the hand controller even if the avatar's hand can't get to the implied position, <code>false</code> if it will
     *      follow the motions of the avatar's hand. This should be set true for tools, pens, etc. and <code>false</code> for
     *      things meant to decorate the hand.
     *  @property {boolean|undefined} triggerable - <code>true</code> if the entity will receive calls to trigger
     *      Controller entity methods, <code>false</code> if it won't.
     *  @property {boolean|undefined} equippable - <code>true</code> if the entity can be equipped, <code>false</code> if
     *      it cannot.
     *  @property {boolean|undefined} delegateToParent - <code>true</code> if when the entity is grabbed, the grab will be
     *      transferred to its parent entity if there is one; <code>false</code> if the grab won't be transferred, so a child
     *      entity can be grabbed and moved relative to its parent.
     *  @property {vec3|undefined} equippableLeftPositionOffset - Positional offset from the left hand, when equipped.
     *  @property {quat|undefined} equippableLeftRotationOffset - Rotational offset from the left hand, when equipped.
     *  @property {vec3|undefined} equippableRightPositionOffset - Positional offset from the right hand, when equipped.
     *  @property {quat|undefined} equippableRightRotationOffset - Rotational offset from the right hand, when equipped.
     *  @property {string|undefined} equippableIndicatorURL - If non-empty, this model will be used to indicate that an entity
     *      is equippable, rather than the default.
     *  @property {vec3|undefined} equippableIndicatorScale - If equippableIndicatorURL is non-empty, this controls the scale
     *      of the displayed indicator.
     *  @property {vec3|undefined} equippableIndicatorOffset - If equippableIndicatorURL is non-empty, this controls the
     *      relative offset of the displayed object from the equippable entity.
     */

    /*@devdoc
     *  A wrapper for providing {@link GrabProperties} and the number of bytes read.
     *  @typedef {object} GrabPropertyGroupSubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {GrabProperties} properties - The grab properties.
     */

    /*@devdoc
     *  Reads, if present, an entity's grab properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the entity's grab properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {GrabPropertyGroupSubclassData} The entity's grab properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number,
        propertyFlags: EntityPropertyFlags): GrabPropertyGroupSubclassData {
        // C++  int GrabPropertyGroup::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        let grabbable: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_GRABBABLE)) {
            grabbable = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let grabKinematic: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_KINEMATIC)) {
            grabKinematic = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let grabFollowsController: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_FOLLOWS_CONTROLLER)) {
            grabFollowsController = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let triggerable: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_TRIGGERABLE)) {
            triggerable = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let grabEquippable: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE)) {
            grabEquippable = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let delegateToParent: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT)) {
            delegateToParent = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let equippableLeftPositionOffset: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET)) {
            equippableLeftPositionOffset = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let equippableLeftRotationOffset: quat | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET)) {
            equippableLeftRotationOffset
                = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
            dataPosition += 8;
        }

        let equippableRightPositionOffset: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET)) {
            equippableRightPositionOffset = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let equippableRightRotationOffset: quat | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET)) {
            equippableRightRotationOffset
                = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
            dataPosition += 8;
        }

        let equippableIndicatorURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                const textDecoder = new TextDecoder();
                equippableIndicatorURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let equippableIndicatorScale: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE)) {
            equippableIndicatorScale = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let equippableIndicatorOffset: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET)) {
            equippableIndicatorOffset = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                grabbable,
                grabKinematic,
                grabFollowsController,
                triggerable,
                grabEquippable,
                delegateToParent,
                equippableLeftPositionOffset,
                equippableLeftRotationOffset,
                equippableRightPositionOffset,
                equippableRightRotationOffset,
                equippableIndicatorURL,
                equippableIndicatorScale,
                equippableIndicatorOffset
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default GrabPropertyGroup;
export type { GrabPropertyGroupSubclassData, GrabProperties };
