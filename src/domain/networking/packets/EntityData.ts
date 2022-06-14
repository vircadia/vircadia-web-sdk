//
//  EntityData.ts
//
//  Created by Julien Merzoug on 16 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityTypes } from "../../entities/EntityItem";
import "../../shared/DataViewExtensions";
import ByteCountCoded from "../../shared/ByteCountCoding";
import GLMHelpers from "../../shared/GLMHelpers";
import PropertyFlags from "../../shared/PropertyFlags";
import { quat } from "../../shared/Quat";
import Uuid from "../../shared/Uuid";
import { vec3 } from "../../shared/Vec3";
import UDT from "../udt/UDT";

import { ungzip } from "pako";


/*@sdkdoc
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          // TODO: doc
 *          <tr><td>DISCONNECTED</td><td>0</td><td>Disconnected from the domain server.</td></tr> // TODO: remove
 *      </tbody>
 *  </table>
 *  @typedef {number} DomainServer.State // TODO: do we need that?
 */
enum EntityPropertyFlags {
    PROP_PAGED_PROPERTY,
    PROP_CUSTOM_PROPERTIES_INCLUDED,

    // Core properties
    PROP_SIMULATION_OWNER,
    PROP_PARENT_ID,
    PROP_PARENT_JOINT_INDEX,
    PROP_VISIBLE,
    PROP_NAME,
    PROP_LOCKED,
    PROP_USER_DATA,
    PROP_PRIVATE_USER_DATA,
    PROP_HREF,
    PROP_DESCRIPTION,
    PROP_POSITION,
    PROP_DIMENSIONS,
    PROP_ROTATION,
    PROP_REGISTRATION_POINT,
    PROP_CREATED,
    PROP_LAST_EDITED_BY,
    PROP_ENTITY_HOST_TYPE,            // not sent over the wire
    PROP_OWNING_AVATAR_ID,            // not sent over the wire
    PROP_QUERY_AA_CUBE,
    PROP_CAN_CAST_SHADOW,
    PROP_VISIBLE_IN_SECONDARY_CAMERA, // not sent over the wire
    PROP_RENDER_LAYER,
    PROP_PRIMITIVE_MODE,
    PROP_IGNORE_PICK_INTERSECTION,
    PROP_RENDER_WITH_ZONES,
    PROP_BILLBOARD_MODE,
    // Grab
    PROP_GRAB_GRABBABLE,
    PROP_GRAB_KINEMATIC,
    PROP_GRAB_FOLLOWS_CONTROLLER,
    PROP_GRAB_TRIGGERABLE,
    PROP_GRAB_EQUIPPABLE,
    PROP_GRAB_DELEGATE_TO_PARENT,
    PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET,
    PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET,
    PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET,
    PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET,
    PROP_GRAB_EQUIPPABLE_INDICATOR_URL,
    PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE,
    PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET,

    // Physics
    PROP_DENSITY,
    PROP_VELOCITY,
    PROP_ANGULAR_VELOCITY,
    PROP_GRAVITY,
    PROP_ACCELERATION,
    PROP_DAMPING,
    PROP_ANGULAR_DAMPING,
    PROP_RESTITUTION,
    PROP_FRICTION,
    PROP_LIFETIME,
    PROP_COLLISIONLESS,
    PROP_COLLISION_MASK,
    PROP_DYNAMIC,
    PROP_COLLISION_SOUND_URL,
    PROP_ACTION_DATA,

    // Cloning
    PROP_CLONEABLE,
    PROP_CLONE_LIFETIME,
    PROP_CLONE_LIMIT,
    PROP_CLONE_DYNAMIC,
    PROP_CLONE_AVATAR_ENTITY,
    PROP_CLONE_ORIGIN_ID,

    // Scripts
    PROP_SCRIPT,
    PROP_SCRIPT_TIMESTAMP,
    PROP_SERVER_SCRIPTS,

    // Certifiable Properties
    PROP_ITEM_NAME,
    PROP_ITEM_DESCRIPTION,
    PROP_ITEM_CATEGORIES,
    PROP_ITEM_ARTIST,
    PROP_ITEM_LICENSE,
    PROP_LIMITED_RUN,
    PROP_MARKETPLACE_ID,
    PROP_EDITION_NUMBER,
    PROP_ENTITY_INSTANCE_NUMBER,
    PROP_CERTIFICATE_ID,
    PROP_CERTIFICATE_TYPE,
    PROP_STATIC_CERTIFICATE_VERSION,

    // Used to convert values to and from scripts
    PROP_LOCAL_POSITION,
    PROP_LOCAL_ROTATION,
    PROP_LOCAL_VELOCITY,
    PROP_LOCAL_ANGULAR_VELOCITY,
    PROP_LOCAL_DIMENSIONS,

    // These properties are used by multiple subtypes but aren't in the base EntityItem
    PROP_SHAPE_TYPE,
    PROP_COMPOUND_SHAPE_URL,
    PROP_COLOR,
    PROP_ALPHA,
    PROP_PULSE_MIN,
    PROP_PULSE_MAX,
    PROP_PULSE_PERIOD,
    PROP_PULSE_COLOR_MODE,
    PROP_PULSE_ALPHA_MODE,
    PROP_TEXTURES,

    // //////////////////////////////////////////////////////////////////////////////////////////////////
    // ATTENTION: add new shared EntityItem properties to the list ABOVE this line
    // //////////////////////////////////////////////////////////////////////////////////////////////////

    // We need as many of these as the number of unique properties of a derived EntityItem class
    PROP_DERIVED_0,
    PROP_DERIVED_1,
    PROP_DERIVED_2,
    PROP_DERIVED_3,
    PROP_DERIVED_4,
    PROP_DERIVED_5,
    PROP_DERIVED_6,
    PROP_DERIVED_7,
    PROP_DERIVED_8,
    PROP_DERIVED_9,
    PROP_DERIVED_10,
    PROP_DERIVED_11,
    PROP_DERIVED_12,
    PROP_DERIVED_13,
    PROP_DERIVED_14,
    PROP_DERIVED_15,
    PROP_DERIVED_16,
    PROP_DERIVED_17,
    PROP_DERIVED_18,
    PROP_DERIVED_19,
    PROP_DERIVED_20,
    PROP_DERIVED_21,
    PROP_DERIVED_22,
    PROP_DERIVED_23,
    PROP_DERIVED_24,
    PROP_DERIVED_25,
    PROP_DERIVED_26,
    PROP_DERIVED_27,
    PROP_DERIVED_28,
    PROP_DERIVED_29,
    PROP_DERIVED_30,
    PROP_DERIVED_31,
    PROP_DERIVED_32,
    PROP_DERIVED_33,
    PROP_DERIVED_34,

    PROP_AFTER_LAST_ITEM,

    // //////////////////////////////////////////////////////////////////////////////////////////////////
    // WARNING! Do not add props here unless you intentionally mean to reuse PROP_DERIVED_X indexes
    //
    // These properties intentionally reuse the enum values for other properties which will never overlap with each other. We do this so that we don't have to expand
    // the size of the properties bitflags mask
    //
    // Only add properties here that are only used by one subclass.  Otherwise, they should go above to prevent collisions

    // Particles
    PROP_MAX_PARTICLES = PROP_DERIVED_0,
    PROP_LIFESPAN = PROP_DERIVED_1,
    PROP_EMITTING_PARTICLES = PROP_DERIVED_2,
    PROP_EMIT_RATE = PROP_DERIVED_3,
    PROP_EMIT_SPEED = PROP_DERIVED_4,
    PROP_SPEED_SPREAD = PROP_DERIVED_5,
    PROP_EMIT_ORIENTATION = PROP_DERIVED_6,
    PROP_EMIT_DIMENSIONS = PROP_DERIVED_7,
    PROP_ACCELERATION_SPREAD = PROP_DERIVED_8,
    PROP_POLAR_START = PROP_DERIVED_9,
    PROP_POLAR_FINISH = PROP_DERIVED_10,
    PROP_AZIMUTH_START = PROP_DERIVED_11,
    PROP_AZIMUTH_FINISH = PROP_DERIVED_12,
    PROP_EMIT_RADIUS_START = PROP_DERIVED_13,
    PROP_EMIT_ACCELERATION = PROP_DERIVED_14,
    PROP_PARTICLE_RADIUS = PROP_DERIVED_15,
    PROP_RADIUS_SPREAD = PROP_DERIVED_16,
    PROP_RADIUS_START = PROP_DERIVED_17,
    PROP_RADIUS_FINISH = PROP_DERIVED_18,
    PROP_COLOR_SPREAD = PROP_DERIVED_19,
    PROP_COLOR_START = PROP_DERIVED_20,
    PROP_COLOR_FINISH = PROP_DERIVED_21,
    PROP_ALPHA_SPREAD = PROP_DERIVED_22,
    PROP_ALPHA_START = PROP_DERIVED_23,
    PROP_ALPHA_FINISH = PROP_DERIVED_24,
    PROP_EMITTER_SHOULD_TRAIL = PROP_DERIVED_25,
    PROP_PARTICLE_SPIN = PROP_DERIVED_26,
    PROP_SPIN_START = PROP_DERIVED_27,
    PROP_SPIN_FINISH = PROP_DERIVED_28,
    PROP_SPIN_SPREAD = PROP_DERIVED_29,
    PROP_PARTICLE_ROTATE_WITH_ENTITY = PROP_DERIVED_30,

    // Model
    PROP_MODEL_URL = PROP_DERIVED_0,
    PROP_MODEL_SCALE = PROP_DERIVED_1,
    PROP_JOINT_ROTATIONS_SET = PROP_DERIVED_2,
    PROP_JOINT_ROTATIONS = PROP_DERIVED_3,
    PROP_JOINT_TRANSLATIONS_SET = PROP_DERIVED_4,
    PROP_JOINT_TRANSLATIONS = PROP_DERIVED_5,
    PROP_RELAY_PARENT_JOINTS = PROP_DERIVED_6,
    PROP_GROUP_CULLED = PROP_DERIVED_7,
    PROP_BLENDSHAPE_COEFFICIENTS = PROP_DERIVED_8,
    PROP_USE_ORIGINAL_PIVOT = PROP_DERIVED_9,
    // Animation
    PROP_ANIMATION_URL = PROP_DERIVED_10,
    PROP_ANIMATION_ALLOW_TRANSLATION = PROP_DERIVED_11,
    PROP_ANIMATION_FPS = PROP_DERIVED_12,
    PROP_ANIMATION_FRAME_INDEX = PROP_DERIVED_13,
    PROP_ANIMATION_PLAYING = PROP_DERIVED_14,
    PROP_ANIMATION_LOOP = PROP_DERIVED_15,
    PROP_ANIMATION_FIRST_FRAME = PROP_DERIVED_16,
    PROP_ANIMATION_LAST_FRAME = PROP_DERIVED_17,
    PROP_ANIMATION_HOLD = PROP_DERIVED_18

    // WEBRTC TODO: Address further C++ code.
}

type EntityDataDetails = {
    id: Uuid,
    entityType: EntityTypes,
    created: BigInt,
    lastEdited: BigInt,
    updateDelta: number,
    simulatedDelta: number,
    propSimOwnerData: ArrayBuffer | undefined;
    propParentID: Uuid | undefined;
    propParentJointIndex: number | undefined;
    propVisible: boolean | undefined;
    propName: string | undefined;
    propLocked: boolean | undefined;
    propUserData: string | undefined;
    propPrivateUserData: string | undefined;
    propHref: string | undefined;
    propDescription: string | undefined;
    propPosition: vec3 | undefined;
    propDimension: vec3 | undefined;
    propRotation: quat | undefined;
    propRegistrationPoint: vec3 | undefined;
    propCreated: BigInt | undefined;
    propLastEdited: Uuid | undefined;
    propAaCubeData: aaCubeData | undefined;
    propCanCastShadow: boolean | undefined;
    propRenderLayer: number | undefined;
    propPrimitiveMode: number | undefined;
    propIgnorePickIntersection: boolean | undefined;
    propRenderWithZones: Uuid[] | undefined;
    propBillboardMode: number | undefined;
    propGrabbable: boolean | undefined;
    propKinematic: boolean | undefined;
    propFollowsController: boolean | undefined;
    propTriggerable: boolean | undefined;
    propEquippable: boolean | undefined;
    propDelegateToParent: boolean | undefined;
    propGrabLeftEquippablePositionOffset: vec3 | undefined;
    propGrabLeftEquippableRotationOffset: quat | undefined;
    propGrabRightEquippablePositionOffset: vec3 | undefined;
    propGrabRightEquippableRotationOffset: quat | undefined;
    propGrabEquippableIndicatorUrl: string | undefined;
    propGrabRightEquippableIndicatorScale: vec3 | undefined;
    propGrabRightEquippableIndicatorOffset: vec3 | undefined;
    propDensity: number | undefined;
    propVelocity: vec3 | undefined;
    propAngularVelocity: vec3 | undefined;
    propGravity: vec3 | undefined;
    propAcceleration: vec3 | undefined;
    propDamping: number | undefined;
    propAngularDampling: number | undefined;
    propRestitution: number | undefined;
    propFriction: number | undefined;
    propLifetime: number | undefined;
    propCollisionless: boolean | undefined;
    propCollisionMask: number | undefined;
    propDynamic: boolean | undefined;
    propCollisionSoundUrl: string | undefined;
    propActionData: ArrayBuffer | undefined;
    propCloneable: boolean | undefined;
    propCloneLifetime: number | undefined;
    propCloneLimit: number | undefined;
    propCloneDynamic: boolean | undefined;
    propCloneAvatarIdentity: boolean | undefined;
    propCloneOriginId: Uuid | undefined;
    propScript: string | undefined;
    propScriptTimestamp: BigInt | undefined;
    propServerScripts: string | undefined;
    propItemName: string | undefined;
    propItemDescription: string | undefined;
    propItemCategories: string | undefined;
    propItemArtist: string | undefined;
    propItemLicense: string | undefined;
    propLimitedRun: number | undefined;
    propMarketplaceID: string | undefined;
    propEditionNumber: number | undefined;
    propEntityInstanceNumber: number | undefined;
    propCertificateID: string | undefined;
    propCertificateType: string | undefined;
    propStaticCertificateVersion: number | undefined;
    propShapeType: number | undefined;
    propCompoundShapeUrl: string | undefined;
    propColor: vec3 | undefined;
    propTextures: string | undefined;
    propModelUrl: string | undefined;
    propModelScale: vec3 | undefined;
    propJointRotationsSet: boolean[] | undefined;
    propJointRotations: quat[] | undefined;
    propJointTranslationsSet: boolean[] | undefined;
    propJointTranslations: vec3[] | undefined;
    propGroupCulled: boolean | undefined;
    propRelayParentJoints: boolean | undefined;
    propBlendShapeCoefficients: string | undefined;
    propUseOriginalPivot: boolean | undefined;
    propAnimationUrl: string | undefined;
    propAnimationAllowTranslation: boolean | undefined;
    propAnimationFPS: number | undefined;
    propAnimationFrameIndex: number | undefined;
    propAnimationPlaying: boolean | undefined;
    propAnimationLoop: boolean | undefined;
    propAnimationFirstFrame: number | undefined;
    propAnimationLastFrame: number | undefined;
    propAnimationHold: boolean | undefined;
    // WEBRTC TODO: Address further C++ code.
};


type aaCubeData = {
    corner: vec3;
    scale: number;
};


const EntityData = new class {
    // C++ N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} an {@link PacketType(1)|EntityData} packet.
     *  @typedef {object} PacketScribe.EntityDataDetails
     */

    /*@devdoc
     *  Reads an {@link PacketType(1)|EntityData} packet.
     *  @function PacketScribe.EntityData&period;read
     *  @read {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @returns {PacketScribe.EntityDataDetails} The entity data information.
     */
    read(data: DataView): EntityDataDetails { /* eslint-disable-line class-methods-use-this */
        // C++ void OctreeProcessor::processDatagram(ReceivedMessage& message, SharedNodePointer sourceNode)
        //     int EntityItem::readEntityDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //     ReadBitstreamToTreeParams& args)

        // TODO:
        // 0. Strip first 4 bytes (qCompress header)
        // 1. Decompresss data
        // 2. Get total number of bytes to read.
        // 3. Loop until all bytes have been read.

        const textDecoder = new TextDecoder();

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const id = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        const entityTypeCodec = new ByteCountCoded();
        dataPosition += entityTypeCodec.decode(data, data.byteLength - dataPosition, dataPosition);
        const entityType = entityTypeCodec.data;
        // TODO: Check entityType. Return if it's not a modelEntity
        // (return default values for other fields in EntityDataDetails?)
        // if (entityType !== EntityTypes.Model) {
        //     return {};
        // }

        const created = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        const lastEdited = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        const updateDeltaCodec = new ByteCountCoded();
        dataPosition += updateDeltaCodec.decode(data, data.byteLength - dataPosition, dataPosition);
        const updateDelta = updateDeltaCodec.data;

        const simulatedDeltaCodec = new ByteCountCoded();
        dataPosition += simulatedDeltaCodec.decode(data, data.byteLength - dataPosition, dataPosition);
        const simulatedDelta = simulatedDeltaCodec.data;

        const propertyFlags = new PropertyFlags();
        dataPosition += propertyFlags.decode(data, data.byteLength - dataPosition, dataPosition);

        let propSimOwnerData: ArrayBuffer | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SIMULATION_OWNER)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                const buffer = new Uint8Array(length);
                const view = new DataView(buffer.buffer);

                for (let i = 0; i < length; i++) {
                    view.setUint8(i, data.getUint8(dataPosition));
                    dataPosition += 1;
                }
                propSimOwnerData = buffer;
            }
        }

        let propParentID: Uuid | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SIMULATION_OWNER)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propParentID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                dataPosition += 16;
            }
        }

        let propParentJointIndex: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARENT_JOINT_INDEX)) {
            propParentJointIndex = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
        }

        let propVisible: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VISIBLE)) {
            propVisible = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propName: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_NAME)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                propName = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            }
        }

        let propLocked: boolean | undefined = false;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LOCKED)) {
            propLocked = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propUserData: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USER_DATA)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                propUserData = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            }
        }

        let propPrivateUserData: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PRIVATE_USER_DATA)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                propPrivateUserData = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propHref: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HREF)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                propHref = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            }
        }

        let propDescription: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DESCRIPTION)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                propDescription = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propPosition: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_POSITION)) {
            propPosition = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propDimension: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DIMENSIONS)) {
            propDimension = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propRotation: quat | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ROTATION)) {
            propRotation = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
            dataPosition += 8;
        }

        let propRegistrationPoint: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_REGISTRATION_POINT)) {
            propRegistrationPoint = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propCreated: BigInt | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CREATED)) {
            propCreated = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 8;
        }

        let propLastEdited: Uuid | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LAST_EDITED_BY)) {
            const propLastEditedLength = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (propLastEditedLength > 0) {
                propLastEdited = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                dataPosition += 16;
            }
        }

        let propAaCubeData: aaCubeData | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_QUERY_AA_CUBE)) {
            const corner = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;

            const scale = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;

            propAaCubeData = {
                corner,
                scale
            };
        }

        let propCanCastShadow: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CAN_CAST_SHADOW)) {
            propCanCastShadow = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propRenderLayer: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RENDER_LAYER)) {
            propRenderLayer = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propPrimitiveMode: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PRIMITIVE_MODE)) {
            propPrimitiveMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propIgnorePickIntersection: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_IGNORE_PICK_INTERSECTION)) {
            propIgnorePickIntersection = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propRenderWithZones: Uuid[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RENDER_WITH_ZONES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propRenderWithZones = [];
                for (let i = 0; i < length; i++) {
                    propRenderWithZones.push(new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN)));
                    dataPosition += 16;
                }
            }

        }

        let propBillboardMode: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BILLBOARD_MODE)) {
            propBillboardMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propGrabbable: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_GRABBABLE)) {
            propGrabbable = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propKinematic: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_KINEMATIC)) {
            propKinematic = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propFollowsController: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_FOLLOWS_CONTROLLER)) {
            propFollowsController = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propTriggerable: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_TRIGGERABLE)) {
            propTriggerable = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propEquippable: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE)) {
            propEquippable = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propDelegateToParent: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_DELEGATE_TO_PARENT)) {
            propDelegateToParent = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propGrabLeftEquippablePositionOffset: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET)) {
            propGrabLeftEquippablePositionOffset = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propGrabLeftEquippableRotationOffset: quat | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET)) {
            propGrabLeftEquippableRotationOffset = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
            dataPosition += 8;
        }

        let propGrabRightEquippablePositionOffset: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET)) {
            propGrabRightEquippablePositionOffset = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propGrabRightEquippableRotationOffset: quat | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET)) {
            propGrabRightEquippableRotationOffset = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
            dataPosition += 8;
        }

        let propGrabEquippableIndicatorUrl: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propGrabEquippableIndicatorUrl = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propGrabRightEquippableIndicatorScale: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE)) {
            propGrabRightEquippableIndicatorScale = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propGrabRightEquippableIndicatorOffset: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET)) {
            propGrabRightEquippableIndicatorOffset = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propDensity: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DENSITY)) {
            propDensity = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propVelocity: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VELOCITY)) {
            propVelocity = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propAngularVelocity: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANGULAR_VELOCITY)) {
            propAngularVelocity = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propGravity: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAVITY)) {
            propGravity = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propAcceleration: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACCELERATION)) {
            propAcceleration = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propDamping: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DAMPING)) {
            propDamping = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propAngularDampling: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANGULAR_DAMPING)) {
            propAngularDampling = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propRestitution: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RESTITUTION)) {
            propRestitution = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propFriction: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FRICTION)) {
            propFriction = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propLifetime: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIFETIME)) {
            propLifetime = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propCollisionless: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISIONLESS)) {
            propCollisionless = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propCollisionMask: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISION_MASK)) {
            propCollisionMask = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
        }

        let propDynamic: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DYNAMIC)) {
            propDynamic = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propCollisionSoundUrl: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISION_SOUND_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propCollisionSoundUrl = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propActionData: ArrayBuffer | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACTION_DATA)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                const buffer = new Uint8Array(length);
                const view = new DataView(buffer.buffer);

                for (let i = 0; i < length; i++) {
                    view.setUint8(i, data.getUint8(dataPosition));
                    dataPosition += 1;
                }
                propActionData = buffer;

            }
        }

        let propCloneable: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONEABLE)) {
            propCloneable = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propCloneLifetime: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_LIFETIME)) {
            propCloneLifetime = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propCloneLimit: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_LIMIT)) {
            propCloneLimit = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propCloneDynamic: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_DYNAMIC)) {
            propCloneDynamic = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propCloneAvatarIdentity: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_AVATAR_ENTITY)) {
            propCloneAvatarIdentity = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propCloneOriginId: Uuid | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_ORIGIN_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propCloneOriginId = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                dataPosition += 16;
            }
        }

        let propScript: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propScript = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propScriptTimestamp: BigInt | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT_TIMESTAMP)) {
            propScriptTimestamp = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 8;
        }

        let propServerScripts: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SERVER_SCRIPTS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propServerScripts = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propItemName: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_NAME)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propItemName = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propItemDescription: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_DESCRIPTION)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propItemDescription = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propItemCategories: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_CATEGORIES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propItemCategories = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propItemArtist: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_ARTIST)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propItemArtist = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propItemLicense: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_LICENSE)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propItemLicense = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propLimitedRun: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIMITED_RUN)) {
            propLimitedRun = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propMarketplaceID: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MARKETPLACE_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propMarketplaceID = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propEditionNumber: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EDITION_NUMBER)) {
            propEditionNumber = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propEntityInstanceNumber: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ENTITY_INSTANCE_NUMBER)) {
            propEntityInstanceNumber = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propCertificateID: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_ID)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propCertificateID = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propCertificateType: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_TYPE)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propCertificateType = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propStaticCertificateVersion: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_STATIC_CERTIFICATE_VERSION)) {
            propStaticCertificateVersion = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propShapeType: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE)) {
            propShapeType = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propCompoundShapeUrl: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propCompoundShapeUrl = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propColor: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
            // The C++ stores the color property into a glm::u8vec3. It does not make a difference here
            // because the type of x, y and z is number.
            propColor = {
                x: data.getUint8(dataPosition),
                y: data.getUint8(dataPosition + 1),
                z: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let propTextures: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXTURES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propTextures = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propModelUrl: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MODEL_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propModelUrl = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propModelScale: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MODEL_SCALE)) {
            propModelScale = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let propJointRotationsSet: boolean[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS_SET)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propJointRotationsSet = [];
                for (let i = 0; i < length; i++) {
                    propJointRotationsSet.push(Boolean(data.getUint8(dataPosition + i)));
                }
                dataPosition += length;
            }
        }

        let propJointRotations: quat[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propJointRotations = [];
                for (let i = 0; i < length; i++) {
                    propJointRotations.push(GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition + i * 8));
                }
                dataPosition += length;
            }
        }

        let propJointTranslationsSet: boolean[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS_SET)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propJointTranslationsSet = [];
                for (let i = 0; i < length; i++) {
                    propJointTranslationsSet.push(Boolean(data.getUint8(dataPosition + i)));
                }
                dataPosition += length;
            }
        }

        let propJointTranslations: vec3[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propJointTranslations = [];
                for (let i = 0; i < length; i++) {
                    propJointTranslations.push(
                        {
                            x: data.getFloat32(dataPosition + i * 12, UDT.LITTLE_ENDIAN),
                            y: data.getFloat32(dataPosition + 4 + i * 12, UDT.LITTLE_ENDIAN),
                            z: data.getFloat32(dataPosition + 8 + i * 12, UDT.LITTLE_ENDIAN)
                        }
                    );

                }
                dataPosition += length;
            }
        }

        let propRelayParentJoints: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RELAY_PARENT_JOINTS)) {
            propRelayParentJoints = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propGroupCulled: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GROUP_CULLED)) {
            propGroupCulled = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propBlendShapeCoefficients: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLENDSHAPE_COEFFICIENTS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propBlendShapeCoefficients = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propUseOriginalPivot: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USE_ORIGINAL_PIVOT)) {
            propUseOriginalPivot = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propAnimationUrl: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                propAnimationUrl = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let propAnimationAllowTranslation: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_ALLOW_TRANSLATION)) {
            propAnimationAllowTranslation = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propAnimationFPS: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FPS)) {
            propAnimationFPS = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propAnimationFrameIndex: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FRAME_INDEX)) {
            propAnimationFrameIndex = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propAnimationPlaying: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_PLAYING)) {
            propAnimationPlaying = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propAnimationLoop: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_LOOP)) {
            propAnimationLoop = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let propAnimationFirstFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FIRST_FRAME)) {
            propAnimationFirstFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propAnimationLastFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_LAST_FRAME)) {
            propAnimationLastFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let propAnimationHold: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_HOLD)) {
            propAnimationHold = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        // WEBRTC TODO: Address further C++ code.

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return {
            id,
            entityType,
            created,
            lastEdited,
            updateDelta,
            simulatedDelta,
            propSimOwnerData,
            propParentID,
            propParentJointIndex,
            propVisible,
            propName,
            propLocked,
            propUserData,
            propPrivateUserData,
            propHref,
            propDescription,
            propPosition,
            propDimension,
            propRotation,
            propRegistrationPoint,
            propCreated,
            propLastEdited,
            propAaCubeData,
            propCanCastShadow,
            propRenderLayer,
            propPrimitiveMode,
            propIgnorePickIntersection,
            propRenderWithZones,
            propBillboardMode,
            propGrabbable,
            propKinematic,
            propFollowsController,
            propTriggerable,
            propEquippable,
            propDelegateToParent,
            propGrabLeftEquippablePositionOffset,
            propGrabLeftEquippableRotationOffset,
            propGrabRightEquippablePositionOffset,
            propGrabRightEquippableRotationOffset,
            propGrabEquippableIndicatorUrl,
            propGrabRightEquippableIndicatorScale,
            propGrabRightEquippableIndicatorOffset,
            propDensity,
            propVelocity,
            propAngularVelocity,
            propGravity,
            propAcceleration,
            propDamping,
            propAngularDampling,
            propRestitution,
            propFriction,
            propLifetime,
            propCollisionless,
            propCollisionMask,
            propDynamic,
            propCollisionSoundUrl,
            propActionData,
            propCloneable,
            propCloneLifetime,
            propCloneLimit,
            propCloneDynamic,
            propCloneAvatarIdentity,
            propCloneOriginId,
            propScript,
            propScriptTimestamp,
            propServerScripts,
            propItemName,
            propItemDescription,
            propItemCategories,
            propItemArtist,
            propItemLicense,
            propLimitedRun,
            propMarketplaceID,
            propEditionNumber,
            propEntityInstanceNumber,
            propCertificateID,
            propCertificateType,
            propStaticCertificateVersion,
            propShapeType,
            propCompoundShapeUrl,
            propColor,
            propTextures,
            propModelUrl,
            propModelScale,
            propJointRotationsSet,
            propJointRotations,
            propJointTranslationsSet,
            propJointTranslations,
            propGroupCulled,
            propRelayParentJoints,
            propBlendShapeCoefficients,
            propUseOriginalPivot,
            propAnimationUrl,
            propAnimationAllowTranslation,
            propAnimationFPS,
            propAnimationFrameIndex,
            propAnimationPlaying,
            propAnimationLoop,
            propAnimationFirstFrame,
            propAnimationLastFrame,
            propAnimationHold
        };
    }

}();

export default EntityData;
export type { EntityDataDetails };
