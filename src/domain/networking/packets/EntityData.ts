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
    PROP_ENTITY_HOST_TYPE, // Not sent over the wire.
    PROP_OWNING_AVATAR_ID, // Not sent over the wire.
    PROP_QUERY_AA_CUBE,
    PROP_CAN_CAST_SHADOW,
    PROP_VISIBLE_IN_SECONDARY_CAMERA, // Not sent over the wire.
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
    // These properties are used by multiple subtypes but aren't in the base EntityItem.
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
    // Add new shared EntityItem properties to the list above this line.
    // We need as many of these as the number of unique properties of a derived EntityItem class.
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
    // Do not add props here unless you intentionally mean to reuse PROP_DERIVED_X indexes.
    // These properties intentionally reuse the enum values for other properties which will never overlap with each other.
    // We do this so that we don't have to expand the size of the properties bitflags mask.
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
    entityItemID: Uuid,
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
    propLastEditedBy: Uuid | undefined;
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
};


type aaCubeData = {
    corner: vec3;
    scale: number;
};


const EntityData = new class {
    // C++ N/A

    // C++ OctreePacketData.h
    readonly PACKET_IS_COMPRESSED_BIT = 1;
    readonly OVERFLOWED_OCTCODE_BUFFER = -1;
    readonly UNKNOWN_OCTCODE_LENGTH = -2;
    // TODO: Add to doc
    // Header bytes
    //    object ID [16 bytes]
    //    ByteCountCoded(type code) [~1 byte]
    //    last edited [8 bytes]
    //    ByteCountCoded(last_edited to last_updated delta) [~1-8 bytes]
    //    PropertyFlags<>( everything ) [1-2 bytes]
    // ~27-35 bytes...
    readonly MINIMUM_HEADER_BYTES = 27;

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
    read(data: DataView): EntityDataDetails[] { /* eslint-disable-line class-methods-use-this */
        // C++ void OctreeProcessor::processDatagram(ReceivedMessage& message, SharedNodePointer sourceNode)
        //     int EntityItem::readEntityDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //     ReadBitstreamToTreeParams& args)

        const textDecoder = new TextDecoder();

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const flags = data.getUint8(dataPosition);
        dataPosition += 1;

        // TODO: not used?
        // eslint-disable-next-line
        // @ts-ignore
        const sequence = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        // TODO: not used?
        // eslint-disable-next-line
        // @ts-ignore
        const sentAt = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        const packetIsCompressed = flags >> 7 - this.PACKET_IS_COMPRESSED_BIT & 1;

        const entityDataDetails: EntityDataDetails[] = [];

        let error = false;

        while (data.byteLength - dataPosition > 0 && !error) {
            const entityMessage = new DataView(data.buffer.slice(dataPosition));
            let entityMessagePosition = 0;

            // eslint-disable-next-line @typescript-eslint/init-declarations
            let sectionLength;
            if (packetIsCompressed) {
                // TODO: explain that 2 is sizeof(OCTREE_PACKET_INTERNAL_SECTION_SIZE)
                if (entityMessage.byteLength > 2) {
                    sectionLength = entityMessage.getUint16(entityMessagePosition, UDT.LITTLE_ENDIAN);
                    entityMessagePosition += 2;
                } else {
                    sectionLength = 0;
                    error = true;
                }
            } else {
                sectionLength = entityMessage.byteLength;
            }

            if (sectionLength > 0) {
                // eslint-disable-next-line @typescript-eslint/init-declarations
                let entityData;

                if (packetIsCompressed) {
                    // Skip the next 4 bytes (QT qCompress header).
                    const compressedData = entityMessage.buffer.slice(entityMessagePosition + 4);
                    entityData = new DataView(ungzip(compressedData).buffer); // TODO: Check error returned by ungzip.
                } else {
                    entityData = new DataView(entityMessage.buffer.slice(entityMessagePosition));
                }

                let entityDataPosition = 0;

                // TODO?: Put this function in its own module?
                // Originally written recursively, numberOfThreeBitSectionsInCode is here rewritten iteratively
                // to be used as an anonymous function .
                // eslint-disable-next-line max-len
                const numberOfThreeBitSectionsInCode = (data: DataView, dataPosition: number, maxBytes: number): number => { // eslint-disable-line @typescript-eslint/no-shadow
                // C++ int numberOfThreeBitSectionsInCode(const unsigned char* octalCode, int maxBytes)

                    if (maxBytes === this.OVERFLOWED_OCTCODE_BUFFER) {
                        return this.OVERFLOWED_OCTCODE_BUFFER;
                    }

                    let dataPos = dataPosition;

                    let curOctalCode = data.getUint8(dataPosition);
                    let result = curOctalCode;
                    while (curOctalCode === 255) {
                        result += curOctalCode;
                        dataPos += 1;
                        curOctalCode = data.getUint8(dataPos);

                        const newMaxBytes = maxBytes === this.UNKNOWN_OCTCODE_LENGTH
                            ? this.UNKNOWN_OCTCODE_LENGTH
                            : maxBytes - 1;

                        if (newMaxBytes === this.OVERFLOWED_OCTCODE_BUFFER) {
                            result += this.OVERFLOWED_OCTCODE_BUFFER;
                            break;
                        }
                    }
                    return result;
                };

                // TODO?:
                // Add numberOfThreeBitSectionsInStream to entityDataDetails?
                // In the C++ they compare numberOfThreeBitSectionsInStream and numberOfThreeBitSectionsFromNode
                // and create a node if they're not equal
                const numberOfThreeBitSectionsInStream
                = numberOfThreeBitSectionsInCode(entityData, entityDataPosition, entityData.byteLength);

                // TODO?: Put in its own module?
                const bytesRequiredForCodeLength = (threeBitCodes: number): number => {
                // C++ size_t bytesRequiredForCodeLength(unsigned char threeBitCodes)

                    if (threeBitCodes === 0) {
                        return 1;
                    }
                    return 1 + Math.ceil(threeBitCodes * 3 / 8.0);
                };

                const octalCodeBytes = bytesRequiredForCodeLength(numberOfThreeBitSectionsInStream);
                entityDataPosition += octalCodeBytes;

                // TODO: Explain 1 is sizeof(unsigned char)
                if (entityData.byteLength - entityDataPosition < 1) {
                    break;
                }

                // WEBRTC TODO: Use colorInPacketMask as in C++ Octree::readElementData.
                // eslint-disable-next-line
                // @ts-ignore
                const colorInPacketMask = entityData.getUint8(entityDataPosition);
                entityDataPosition += 1;

                // WEBRTC TODO: Do not hardcode value.
                // eslint-disable-next-line
                // @ts-ignore
                const bytesForMask = 2;
                entityDataPosition += bytesForMask;

                // WEBRTC TODO: Address further C++ code.

                // TODO: Explain that 2 is the sizeof(numberOfEntities) in the C++ code.
                if (entityData.byteLength - entityDataPosition < 2) {
                    break;
                }

                // WEBRTC TODO: Use numberOfEntities as in EntityTree::readEntityDataFromBuffer.
                // eslint-disable-next-line
                // @ts-ignore
                const numberOfEntities = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                entityDataPosition += 2;

                if (entityData.byteLength < numberOfEntities * this.MINIMUM_HEADER_BYTES) {
                    break;
                }

                for (let i = 0; i < numberOfEntities; i++) {
                    const entityItemID = new Uuid(entityData.getBigUint128(entityDataPosition, UDT.BIG_ENDIAN));
                    entityDataPosition += 16;

                    const entityTypeCodec = new ByteCountCoded();
                    entityDataPosition
                    += entityTypeCodec.decode(entityData, entityData.byteLength - entityDataPosition, entityDataPosition);
                    const entityType = entityTypeCodec.data;

                    if (entityType !== EntityTypes.Model) {
                        console.error("Entity is not a Model entity");
                        return [];
                    }

                    const created = entityData.getBigUint64(entityDataPosition, UDT.LITTLE_ENDIAN);
                    entityDataPosition += 8;

                    const lastEdited = entityData.getBigUint64(entityDataPosition, UDT.LITTLE_ENDIAN);
                    entityDataPosition += 8;

                    const updateDeltaCodec = new ByteCountCoded();
                    entityDataPosition
                    += updateDeltaCodec.decode(entityData, entityData.byteLength - entityDataPosition, entityDataPosition);
                    const updateDelta = updateDeltaCodec.data;

                    const simulatedDeltaCodec = new ByteCountCoded();
                    entityDataPosition
                    += simulatedDeltaCodec.decode(entityData, entityData.byteLength - entityDataPosition, entityDataPosition);
                    const simulatedDelta = simulatedDeltaCodec.data;

                    const propertyFlags = new PropertyFlags();
                    entityDataPosition
                    += propertyFlags.decode(entityData, entityData.byteLength - entityDataPosition, entityDataPosition);

                    let propSimOwnerData: ArrayBuffer | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SIMULATION_OWNER)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            const buffer = new Uint8Array(length);
                            const view = new DataView(buffer.buffer);

                            for (let j = 0; j < length; j++) {
                                view.setUint8(j, entityData.getUint8(entityDataPosition));
                                entityDataPosition += 1;
                            }
                            propSimOwnerData = buffer;
                        }
                    }

                    let propParentID: Uuid | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SIMULATION_OWNER)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propParentID = new Uuid(entityData.getBigUint128(entityDataPosition, UDT.BIG_ENDIAN));
                            entityDataPosition += 16;
                        }
                    }

                    let propParentJointIndex: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARENT_JOINT_INDEX)) {
                        propParentJointIndex = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;
                    }

                    let propVisible: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VISIBLE)) {
                        propVisible = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propName: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_NAME)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;
                        if (length > 0) {
                            propName = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propLocked: boolean | undefined = false;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LOCKED)) {
                        propLocked = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propUserData: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USER_DATA)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;
                        if (length > 0) {
                            propUserData = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propPrivateUserData: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PRIVATE_USER_DATA)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;
                        if (length > 0) {
                            propPrivateUserData = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propHref: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HREF)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;
                        if (length > 0) {
                            propHref = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propDescription: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DESCRIPTION)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;
                        if (length > 0) {
                            propDescription = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propPosition: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_POSITION)) {
                        propPosition = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propDimension: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DIMENSIONS)) {
                        propDimension = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propRotation: quat | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ROTATION)) {
                        propRotation = GLMHelpers.unpackOrientationQuatFromBytes(entityData, entityDataPosition);
                        entityDataPosition += 8;
                    }

                    let propRegistrationPoint: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_REGISTRATION_POINT)) {
                        propRegistrationPoint = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propCreated: BigInt | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CREATED)) {
                        propCreated = entityData.getBigUint64(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 8;
                    }

                    let propLastEditedBy: Uuid | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LAST_EDITED_BY)) {
                        const propLastEditedLength = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (propLastEditedLength > 0) {
                            propLastEditedBy = new Uuid(entityData.getBigUint128(entityDataPosition, UDT.BIG_ENDIAN));
                            entityDataPosition += 16;
                        }
                    }

                    let propAaCubeData: aaCubeData | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_QUERY_AA_CUBE)) {
                        const corner = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;

                        const scale = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;

                        propAaCubeData = {
                            corner,
                            scale
                        };
                    }

                    let propCanCastShadow: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CAN_CAST_SHADOW)) {
                        propCanCastShadow = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propRenderLayer: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RENDER_LAYER)) {
                        propRenderLayer = entityData.getUint32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propPrimitiveMode: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PRIMITIVE_MODE)) {
                        propPrimitiveMode = entityData.getUint32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propIgnorePickIntersection: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_IGNORE_PICK_INTERSECTION)) {
                        propIgnorePickIntersection = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propRenderWithZones: Uuid[] | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RENDER_WITH_ZONES)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propRenderWithZones = [];
                            for (let j = 0; j < length; j++) {
                                propRenderWithZones.push(
                                    new Uuid(entityData.getBigUint128(entityDataPosition, UDT.BIG_ENDIAN))
                                );
                                entityDataPosition += 16;
                            }
                        }

                    }

                    let propBillboardMode: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BILLBOARD_MODE)) {
                        propBillboardMode = entityData.getUint32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propGrabbable: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_GRABBABLE)) {
                        propGrabbable = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propKinematic: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_KINEMATIC)) {
                        propKinematic = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propFollowsController: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_FOLLOWS_CONTROLLER)) {
                        propFollowsController = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propTriggerable: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_TRIGGERABLE)) {
                        propTriggerable = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propEquippable: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE)) {
                        propEquippable = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propDelegateToParent: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_DELEGATE_TO_PARENT)) {
                        propDelegateToParent = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propGrabLeftEquippablePositionOffset: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET)) {
                        propGrabLeftEquippablePositionOffset = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propGrabLeftEquippableRotationOffset: quat | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET)) {
                        propGrabLeftEquippableRotationOffset
                        = GLMHelpers.unpackOrientationQuatFromBytes(entityData, entityDataPosition);
                        entityDataPosition += 8;
                    }

                    let propGrabRightEquippablePositionOffset: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET)) {
                        propGrabRightEquippablePositionOffset = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propGrabRightEquippableRotationOffset: quat | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET)) {
                        propGrabRightEquippableRotationOffset
                        = GLMHelpers.unpackOrientationQuatFromBytes(entityData, entityDataPosition);
                        entityDataPosition += 8;
                    }

                    let propGrabEquippableIndicatorUrl: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_URL)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propGrabEquippableIndicatorUrl = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propGrabRightEquippableIndicatorScale: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE)) {
                        propGrabRightEquippableIndicatorScale = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propGrabRightEquippableIndicatorOffset: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET)) {
                        propGrabRightEquippableIndicatorOffset = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propDensity: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DENSITY)) {
                        propDensity = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propVelocity: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VELOCITY)) {
                        propVelocity = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propAngularVelocity: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANGULAR_VELOCITY)) {
                        propAngularVelocity = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propGravity: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAVITY)) {
                        propGravity = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propAcceleration: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACCELERATION)) {
                        propAcceleration = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propDamping: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DAMPING)) {
                        propDamping = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propAngularDampling: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANGULAR_DAMPING)) {
                        propAngularDampling = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propRestitution: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RESTITUTION)) {
                        propRestitution = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propFriction: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FRICTION)) {
                        propFriction = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propLifetime: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIFETIME)) {
                        propLifetime = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propCollisionless: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISIONLESS)) {
                        propCollisionless = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propCollisionMask: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISION_MASK)) {
                        propCollisionMask = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;
                    }

                    let propDynamic: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DYNAMIC)) {
                        propDynamic = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propCollisionSoundUrl: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISION_SOUND_URL)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propCollisionSoundUrl = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propActionData: ArrayBuffer | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACTION_DATA)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            const buffer = new Uint8Array(length);
                            const view = new DataView(buffer.buffer);
                            for (let j = 0; j < length; j++) {
                                view.setUint8(j, entityData.getUint8(entityDataPosition));
                                entityDataPosition += 1;
                            }
                            propActionData = buffer;

                        }
                    }

                    let propCloneable: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONEABLE)) {
                        propCloneable = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propCloneLifetime: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_LIFETIME)) {
                        propCloneLifetime = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propCloneLimit: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_LIMIT)) {
                        propCloneLimit = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propCloneDynamic: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_DYNAMIC)) {
                        propCloneDynamic = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propCloneAvatarIdentity: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_AVATAR_ENTITY)) {
                        propCloneAvatarIdentity = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propCloneOriginId: Uuid | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_ORIGIN_ID)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propCloneOriginId = new Uuid(entityData.getBigUint128(entityDataPosition, UDT.BIG_ENDIAN));
                            entityDataPosition += 16;
                        }
                    }

                    let propScript: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propScript = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propScriptTimestamp: BigInt | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT_TIMESTAMP)) {
                        propScriptTimestamp = entityData.getBigUint64(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 8;
                    }

                    let propServerScripts: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SERVER_SCRIPTS)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propServerScripts = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propItemName: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_NAME)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propItemName = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propItemDescription: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_DESCRIPTION)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propItemDescription = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propItemCategories: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_CATEGORIES)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propItemCategories = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propItemArtist: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_ARTIST)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propItemArtist = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propItemLicense: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_LICENSE)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propItemLicense = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propLimitedRun: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIMITED_RUN)) {
                        propLimitedRun = entityData.getUint32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propMarketplaceID: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MARKETPLACE_ID)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propMarketplaceID = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propEditionNumber: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EDITION_NUMBER)) {
                        propEditionNumber = entityData.getUint32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propEntityInstanceNumber: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ENTITY_INSTANCE_NUMBER)) {
                        propEntityInstanceNumber = entityData.getUint32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propCertificateID: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_ID)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propCertificateID = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propCertificateType: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_TYPE)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propCertificateType = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propStaticCertificateVersion: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_STATIC_CERTIFICATE_VERSION)) {
                        propStaticCertificateVersion = entityData.getUint32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propShapeType: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE)) {
                        propShapeType = entityData.getUint32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propCompoundShapeUrl: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propCompoundShapeUrl = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propColor: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
                    // The C++ stores the color property into a glm::u8vec3. It does not make a difference here
                    // because the type of x, y and z is number.
                        propColor = {
                            x: entityData.getUint8(entityDataPosition),
                            y: entityData.getUint8(entityDataPosition + 1),
                            z: entityData.getUint8(entityDataPosition + 2)
                        };
                        entityDataPosition += 3;
                    }

                    let propTextures: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXTURES)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propTextures = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propModelUrl: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MODEL_URL)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propModelUrl = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propModelScale: vec3 | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MODEL_SCALE)) {
                        propModelScale = {
                            x: entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN),
                            y: entityData.getFloat32(entityDataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: entityData.getFloat32(entityDataPosition + 8, UDT.LITTLE_ENDIAN)
                        };
                        entityDataPosition += 12;
                    }

                    let propJointRotationsSet: boolean[] | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS_SET)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propJointRotationsSet = [];
                            for (let j = 0; j < length; j++) {
                                propJointRotationsSet.push(Boolean(entityData.getUint8(entityDataPosition + j)));
                            }
                            entityDataPosition += length;
                        }
                    }

                    let propJointRotations: quat[] | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propJointRotations = [];
                            for (let j = 0; j < length; j++) {
                                propJointRotations.push(
                                    GLMHelpers.unpackOrientationQuatFromBytes(
                                        entityData, entityDataPosition + j * 8
                                    )
                                );
                            }
                            entityDataPosition += length;
                        }
                    }

                    let propJointTranslationsSet: boolean[] | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS_SET)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propJointTranslationsSet = [];
                            for (let j = 0; j < length; j++) {
                                propJointTranslationsSet.push(Boolean(entityData.getUint8(entityDataPosition + j)));
                            }
                            entityDataPosition += length;
                        }
                    }

                    let propJointTranslations: vec3[] | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propJointTranslations = [];
                            for (let j = 0; j < length; j++) {
                                propJointTranslations.push(
                                    {
                                        x: entityData.getFloat32(entityDataPosition + j * 12, UDT.LITTLE_ENDIAN),
                                        y: entityData.getFloat32(entityDataPosition + 4 + j * 12, UDT.LITTLE_ENDIAN),
                                        z: entityData.getFloat32(entityDataPosition + 8 + j * 12, UDT.LITTLE_ENDIAN)
                                    }
                                );

                            }
                            entityDataPosition += length;
                        }
                    }

                    let propRelayParentJoints: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RELAY_PARENT_JOINTS)) {
                        propRelayParentJoints = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propGroupCulled: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GROUP_CULLED)) {
                        propGroupCulled = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propBlendShapeCoefficients: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLENDSHAPE_COEFFICIENTS)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propBlendShapeCoefficients = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propUseOriginalPivot: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USE_ORIGINAL_PIVOT)) {
                        propUseOriginalPivot = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propAnimationUrl: string | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_URL)) {
                        const length = entityData.getUint16(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 2;

                        if (length > 0) {
                            propAnimationUrl = textDecoder.decode(
                                new Uint8Array(entityData.buffer, entityData.byteOffset + entityDataPosition, length)
                            );
                            entityDataPosition += length;
                        }
                    }

                    let propAnimationAllowTranslation: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_ALLOW_TRANSLATION)) {
                        propAnimationAllowTranslation = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propAnimationFPS: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FPS)) {
                        propAnimationFPS = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propAnimationFrameIndex: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FRAME_INDEX)) {
                        propAnimationFrameIndex = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propAnimationPlaying: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_PLAYING)) {
                        propAnimationPlaying = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propAnimationLoop: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_LOOP)) {
                        propAnimationLoop = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    let propAnimationFirstFrame: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FIRST_FRAME)) {
                        propAnimationFirstFrame = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propAnimationLastFrame: number | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_LAST_FRAME)) {
                        propAnimationLastFrame = entityData.getFloat32(entityDataPosition, UDT.LITTLE_ENDIAN);
                        entityDataPosition += 4;
                    }

                    let propAnimationHold: boolean | undefined = undefined;
                    if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_HOLD)) {
                        propAnimationHold = Boolean(entityData.getUint8(entityDataPosition));
                        entityDataPosition += 1;
                    }

                    entityDataDetails.push(
                        {
                            entityItemID,
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
                            propLastEditedBy,
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
                        });
                }
                dataPosition += sectionLength;
            }
            dataPosition += entityMessagePosition;
        }

        // WEBRTC TODO: Address further C++ code.

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return entityDataDetails;
    }

}();

export default EntityData;
export type { EntityDataDetails };
