//
//  EntityItemProperties.ts
//
//  Created by David Rowe on 26 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityProperties } from "../networking/packets/EntityData";
import UDT from "../networking/udt/UDT";
import MessageData from "../networking/MessageData";
import { AppendState } from "../octree/OctreeElement";
import OctreePacketData, { OctreePacketContext } from "../octree/OctreePacketData";
import assert from "../shared/assert";
import ByteCountCoded from "../shared/ByteCountCoded";
import Uuid from "../shared/Uuid";
import EntityPropertyFlags, { EntityPropertyList } from "./EntityPropertyFlags";
import { EntityType } from "./EntityTypes";
import { ImageEntityProperties } from "./ImageEntityItem";
import { LightEntityProperties } from "./LightEntityItem";
import { MaterialEntityProperties } from "./MaterialEntityItem";
import { ParticleEffectEntityProperties } from "./ParticleEffectEntityItem";
import { ShapeEntityProperties } from "./ShapeEntityItem";
import { TextEntityProperties, TextAlignment, TextEffect } from "./TextEntityItem";
import { WebEntityProperties } from "./WebEntityItem";


/*@devdoc
 *  The <code>EntityItemProperties</code> class provides methods for working with entity item properties.
 *  <p>C++: <code>EntityItemProperties</code></p>
 *  @class EntityItemProperties
 */
class EntityItemProperties {
    // C++: class EntityItemProperties

    static readonly #_PROPERTY_MAP = new Map<string, number>([  // Maps property names to EntityPropertyList values.

        // Core
        ["simulationOwner", EntityPropertyList.PROP_SIMULATION_OWNER],
        ["parentID", EntityPropertyList.PROP_PARENT_ID],
        ["parentJointIndex", EntityPropertyList.PROP_PARENT_JOINT_INDEX],
        ["visible", EntityPropertyList.PROP_VISIBLE],
        ["name", EntityPropertyList.PROP_NAME],
        ["locked", EntityPropertyList.PROP_LOCKED],
        ["userData", EntityPropertyList.PROP_USER_DATA],
        ["privateUserData", EntityPropertyList.PROP_PRIVATE_USER_DATA],
        ["href", EntityPropertyList.PROP_HREF],
        ["description", EntityPropertyList.PROP_DESCRIPTION],
        ["position", EntityPropertyList.PROP_POSITION],
        ["dimensions", EntityPropertyList.PROP_DIMENSIONS],
        ["rotation", EntityPropertyList.PROP_ROTATION],
        ["registrationPoint", EntityPropertyList.PROP_REGISTRATION_POINT],
        ["created", EntityPropertyList.PROP_CREATED],
        ["lastEditedBy", EntityPropertyList.PROP_LAST_EDITED_BY],
        ["entityHostType", EntityPropertyList.PROP_ENTITY_HOST_TYPE],
        ["owningAvatarID", EntityPropertyList.PROP_OWNING_AVATAR_ID],
        ["queryAACube", EntityPropertyList.PROP_QUERY_AA_CUBE],
        ["canCastShadow", EntityPropertyList.PROP_CAN_CAST_SHADOW],
        ["isVisibleInSecondaryCamera", EntityPropertyList.PROP_VISIBLE_IN_SECONDARY_CAMERA],
        ["renderLayer", EntityPropertyList.PROP_RENDER_LAYER],
        ["primitiveMode", EntityPropertyList.PROP_PRIMITIVE_MODE],
        ["ignorePickIntersection", EntityPropertyList.PROP_IGNORE_PICK_INTERSECTION],
        ["renderWithZones", EntityPropertyList.PROP_RENDER_WITH_ZONES],
        ["billboardMode", EntityPropertyList.PROP_BILLBOARD_MODE],
        //changedProperties += _grab.getChangedProperties();

        // Physics
        ["density", EntityPropertyList.PROP_DENSITY],
        ["velocity", EntityPropertyList.PROP_VELOCITY],
        ["angularVelocity", EntityPropertyList.PROP_ANGULAR_VELOCITY],
        ["gravity", EntityPropertyList.PROP_GRAVITY],
        ["acceleration", EntityPropertyList.PROP_ACCELERATION],
        ["damping", EntityPropertyList.PROP_DAMPING],
        ["angularDamping", EntityPropertyList.PROP_ANGULAR_DAMPING],
        ["restitution", EntityPropertyList.PROP_RESTITUTION],
        ["friction", EntityPropertyList.PROP_FRICTION],
        ["lifetime", EntityPropertyList.PROP_LIFETIME],
        ["collisionless", EntityPropertyList.PROP_COLLISIONLESS],
        ["collisionMask", EntityPropertyList.PROP_COLLISION_MASK],
        ["dynamic", EntityPropertyList.PROP_DYNAMIC],
        ["collisionSoundURL", EntityPropertyList.PROP_COLLISION_SOUND_URL],
        ["actionData", EntityPropertyList.PROP_ACTION_DATA],

        // Cloning
        ["cloneable", EntityPropertyList.PROP_CLONEABLE],
        ["cloneLifetime", EntityPropertyList.PROP_CLONE_LIFETIME],
        ["cloneLimit", EntityPropertyList.PROP_CLONE_LIMIT],
        ["cloneDynamic", EntityPropertyList.PROP_CLONE_DYNAMIC],
        ["cloneAvatarEntity", EntityPropertyList.PROP_CLONE_AVATAR_ENTITY],
        ["cloneOriginID", EntityPropertyList.PROP_CLONE_ORIGIN_ID],

        // Scripts
        ["script", EntityPropertyList.PROP_SCRIPT],
        ["scriptTimestamp", EntityPropertyList.PROP_SCRIPT_TIMESTAMP],
        ["serverScripts", EntityPropertyList.PROP_SERVER_SCRIPTS],

        // Certifiable Properties
        ["itemName", EntityPropertyList.PROP_ITEM_NAME],
        ["itemDescription", EntityPropertyList.PROP_ITEM_DESCRIPTION],
        ["itemCategories", EntityPropertyList.PROP_ITEM_CATEGORIES],
        ["itemArtist", EntityPropertyList.PROP_ITEM_ARTIST],
        ["itemLicense", EntityPropertyList.PROP_ITEM_LICENSE],
        ["limitedRun", EntityPropertyList.PROP_LIMITED_RUN],
        ["marketplaceID", EntityPropertyList.PROP_MARKETPLACE_ID],
        ["editionNumber", EntityPropertyList.PROP_EDITION_NUMBER],
        ["entityInstanceNumber", EntityPropertyList.PROP_ENTITY_INSTANCE_NUMBER],
        ["certificateID", EntityPropertyList.PROP_CERTIFICATE_ID],
        ["certificateType", EntityPropertyList.PROP_CERTIFICATE_TYPE],
        ["staticCertificateVersion", EntityPropertyList.PROP_STATIC_CERTIFICATE_VERSION],

        // Location data for scripts
        ["localPosition", EntityPropertyList.PROP_LOCAL_POSITION],
        ["localRotation", EntityPropertyList.PROP_LOCAL_ROTATION],
        ["localVelocity", EntityPropertyList.PROP_LOCAL_VELOCITY],
        ["localAngularVelocity", EntityPropertyList.PROP_LOCAL_ANGULAR_VELOCITY],
        ["localDimensions", EntityPropertyList.PROP_LOCAL_DIMENSIONS],

        // Common
        ["shapeType", EntityPropertyList.PROP_SHAPE_TYPE],
        ["compoundShapeURL", EntityPropertyList.PROP_COMPOUND_SHAPE_URL],
        ["color", EntityPropertyList.PROP_COLOR],
        ["alpha", EntityPropertyList.PROP_ALPHA],
        // ...PulsePropertyGroup.PROPERTY_MAP,  // Pulse properties are deprecated and aren't implemented in the Web SDK.
        ["textures", EntityPropertyList.PROP_TEXTURES],

        // Particles
        ["maxParticles", EntityPropertyList.PROP_MAX_PARTICLES],
        ["lifespan", EntityPropertyList.PROP_LIFESPAN],
        ["isEmitting", EntityPropertyList.PROP_EMITTING_PARTICLES],
        ["emitRate", EntityPropertyList.PROP_EMIT_RATE],
        ["emitSpeed", EntityPropertyList.PROP_EMIT_SPEED],
        ["speedSpread", EntityPropertyList.PROP_SPEED_SPREAD],
        ["emitOrientation", EntityPropertyList.PROP_EMIT_ORIENTATION],
        ["emitDimensions", EntityPropertyList.PROP_EMIT_DIMENSIONS],
        ["emitRadiusStart", EntityPropertyList.PROP_EMIT_RADIUS_START],
        ["polarStart", EntityPropertyList.PROP_POLAR_START],
        ["polarFinish", EntityPropertyList.PROP_POLAR_FINISH],
        ["azimuthStart", EntityPropertyList.PROP_AZIMUTH_START],
        ["azimuthFinish", EntityPropertyList.PROP_AZIMUTH_FINISH],
        ["emitAcceleration", EntityPropertyList.PROP_EMIT_ACCELERATION],
        ["accelerationSpread", EntityPropertyList.PROP_ACCELERATION_SPREAD],
        ["particleRadius", EntityPropertyList.PROP_PARTICLE_RADIUS],
        ["radiusSpread", EntityPropertyList.PROP_RADIUS_SPREAD],
        ["radiusStart", EntityPropertyList.PROP_RADIUS_START],
        ["radiusFinish", EntityPropertyList.PROP_RADIUS_FINISH],
        ["colorSpread", EntityPropertyList.PROP_COLOR_SPREAD],
        ["colorStart", EntityPropertyList.PROP_COLOR_START],
        ["colorFinish", EntityPropertyList.PROP_COLOR_FINISH],
        ["alphaSpread", EntityPropertyList.PROP_ALPHA_SPREAD],
        ["alphaStart", EntityPropertyList.PROP_ALPHA_START],
        ["alphaFinish", EntityPropertyList.PROP_ALPHA_FINISH],
        ["emitterShouldTrail", EntityPropertyList.PROP_EMITTER_SHOULD_TRAIL],
        ["particleSpin", EntityPropertyList.PROP_PARTICLE_SPIN],
        ["spinSpread", EntityPropertyList.PROP_SPIN_SPREAD],
        ["spinStart", EntityPropertyList.PROP_SPIN_START],
        ["spinFinish", EntityPropertyList.PROP_SPIN_FINISH],
        ["rotateWithEntity", EntityPropertyList.PROP_PARTICLE_ROTATE_WITH_ENTITY],

        // Model
        ["modelURL", EntityPropertyList.PROP_MODEL_URL],
        ["modelScale", EntityPropertyList.PROP_MODEL_SCALE],
        ["jointRotationsSet", EntityPropertyList.PROP_JOINT_ROTATIONS_SET],
        ["jointRotations", EntityPropertyList.PROP_JOINT_ROTATIONS],
        ["jointTranslationsSet", EntityPropertyList.PROP_JOINT_TRANSLATIONS_SET],
        ["jointTranslations", EntityPropertyList.PROP_JOINT_TRANSLATIONS],
        ["relayParentJoints", EntityPropertyList.PROP_RELAY_PARENT_JOINTS],
        ["groupCulled", EntityPropertyList.PROP_GROUP_CULLED],
        ["blendshapeCoefficiengts", EntityPropertyList.PROP_BLENDSHAPE_COEFFICIENTS],
        ["useOriginalPivot", EntityPropertyList.PROP_USE_ORIGINAL_PIVOT],
        //changedProperties += _animation.getChangedProperties();

        // Light
        ["isSpotlight", EntityPropertyList.PROP_IS_SPOTLIGHT],
        ["intensity", EntityPropertyList.PROP_INTENSITY],
        ["exponent", EntityPropertyList.PROP_EXPONENT],
        ["cutoff", EntityPropertyList.PROP_CUTOFF],
        ["falloffRadius", EntityPropertyList.PROP_FALLOFF_RADIUS],

        // Text
        ["text", EntityPropertyList.PROP_TEXT],
        ["lineHeight", EntityPropertyList.PROP_LINE_HEIGHT],
        ["textColor", EntityPropertyList.PROP_TEXT_COLOR],
        ["textAlpha", EntityPropertyList.PROP_TEXT_ALPHA],
        ["backgroundColor", EntityPropertyList.PROP_BACKGROUND_COLOR],
        ["backgroundAlpha", EntityPropertyList.PROP_BACKGROUND_ALPHA],
        ["leftMargin", EntityPropertyList.PROP_LEFT_MARGIN],
        ["rightMargin", EntityPropertyList.PROP_RIGHT_MARGIN],
        ["topMargin", EntityPropertyList.PROP_TOP_MARGIN],
        ["bottomMargin", EntityPropertyList.PROP_BOTTOM_MARGIN],
        ["unlit", EntityPropertyList.PROP_UNLIT],
        ["font", EntityPropertyList.PROP_FONT],
        ["textEffect", EntityPropertyList.PROP_TEXT_EFFECT],
        ["textEffectColor", EntityPropertyList.PROP_TEXT_EFFECT_COLOR],
        ["textEffectThickness", EntityPropertyList.PROP_TEXT_EFFECT_THICKNESS],
        ["alignment", EntityPropertyList.PROP_TEXT_ALIGNMENT],

        // Zone
        //changedProperties += _keyLight.getChangedProperties();
        //changedProperties += _ambientLight.getChangedProperties();
        //changedProperties += _skybox.getChangedProperties();
        //changedProperties += _haze.getChangedProperties();
        //changedProperties += _bloom.getChangedProperties();
        ["flyingAllowed", EntityPropertyList.PROP_FLYING_ALLOWED],
        ["ghostingAllowed", EntityPropertyList.PROP_GHOSTING_ALLOWED],
        ["filterURL", EntityPropertyList.PROP_FILTER_URL],
        ["keyLightMode", EntityPropertyList.PROP_KEY_LIGHT_MODE],
        ["amgientLightMode", EntityPropertyList.PROP_AMBIENT_LIGHT_MODE],
        ["skyboxMode", EntityPropertyList.PROP_SKYBOX_MODE],
        ["hazeMode", EntityPropertyList.PROP_HAZE_MODE],
        ["bloomMode", EntityPropertyList.PROP_BLOOM_MODE],
        ["avatarPriority", EntityPropertyList.PROP_AVATAR_PRIORITY],
        ["screenshare", EntityPropertyList.PROP_SCREENSHARE],

        // Polyvox
        ["voxelVolumeSize", EntityPropertyList.PROP_VOXEL_VOLUME_SIZE],
        ["voxelData", EntityPropertyList.PROP_VOXEL_DATA],
        ["voxelSurfaceStyle", EntityPropertyList.PROP_VOXEL_SURFACE_STYLE],
        ["xTextureURL", EntityPropertyList.PROP_X_TEXTURE_URL],
        ["yTextureURL", EntityPropertyList.PROP_Y_TEXTURE_URL],
        ["zTextureURL", EntityPropertyList.PROP_Z_TEXTURE_URL],
        ["xNNeighborID", EntityPropertyList.PROP_X_N_NEIGHBOR_ID],
        ["yNNeighborID", EntityPropertyList.PROP_Y_N_NEIGHBOR_ID],
        ["zNNeighborID", EntityPropertyList.PROP_Z_N_NEIGHBOR_ID],
        ["xPNeighborID", EntityPropertyList.PROP_X_P_NEIGHBOR_ID],
        ["yPNeighborID", EntityPropertyList.PROP_Y_P_NEIGHBOR_ID],
        ["zPNeighborID", EntityPropertyList.PROP_Z_P_NEIGHBOR_ID],

        // Web
        ["sourceUrl", EntityPropertyList.PROP_SOURCE_URL],
        ["dpi", EntityPropertyList.PROP_DPI],
        ["scriptURL", EntityPropertyList.PROP_SCRIPT_URL],
        ["maxFPS", EntityPropertyList.PROP_MAX_FPS],
        ["inputMode", EntityPropertyList.PROP_INPUT_MODE],
        ["showKeyboardFocusHighlight", EntityPropertyList.PROP_SHOW_KEYBOARD_FOCUS_HIGHLIGHT],
        ["useBackground", EntityPropertyList.PROP_WEB_USE_BACKGROUND],
        ["userAgent", EntityPropertyList.PROP_USER_AGENT],

        // Polyline
        ["linePoints", EntityPropertyList.PROP_LINE_POINTS],
        ["strokeWidths", EntityPropertyList.PROP_STROKE_WIDTHS],
        ["normals", EntityPropertyList.PROP_STROKE_NORMALS],
        ["strokeColors", EntityPropertyList.PROP_STROKE_COLORS],
        ["isUVModeStretch", EntityPropertyList.PROP_IS_UV_MODE_STRETCH],
        ["glow", EntityPropertyList.PROP_LINE_GLOW],
        ["faceCamera", EntityPropertyList.PROP_LINE_FACE_CAMERA],

        // Shape
        ["shape", EntityPropertyList.PROP_SHAPE],

        // Material
        ["materialURL", EntityPropertyList.PROP_MATERIAL_URL],
        ["materialMappingMode", EntityPropertyList.PROP_MATERIAL_MAPPING_MODE],
        ["priority", EntityPropertyList.PROP_MATERIAL_PRIORITY],
        ["parentMaterialName", EntityPropertyList.PROP_PARENT_MATERIAL_NAME],
        ["materialMappingPos", EntityPropertyList.PROP_MATERIAL_MAPPING_POS],
        ["materialMappingScale", EntityPropertyList.PROP_MATERIAL_MAPPING_SCALE],
        ["materialMappingRot", EntityPropertyList.PROP_MATERIAL_MAPPING_ROT],
        ["materialData", EntityPropertyList.PROP_MATERIAL_DATA],
        ["materialRepeat", EntityPropertyList.PROP_MATERIAL_REPEAT],

        // Image
        ["imageURL", EntityPropertyList.PROP_IMAGE_URL],
        ["emissive", EntityPropertyList.PROP_EMISSIVE],
        ["keepAspectRatio", EntityPropertyList.PROP_KEEP_ASPECT_RATIO],
        ["subImage", EntityPropertyList.PROP_SUB_IMAGE],

        // Grid
        ["followCamera", EntityPropertyList.PROP_GRID_FOLLOW_CAMERA],
        ["majorGridEvery", EntityPropertyList.PROP_MAJOR_GRID_EVERY],
        ["minorGridEvery", EntityPropertyList.PROP_MINOR_GRID_EVERY],

        // Gizmo
        ["gizmoType", EntityPropertyList.PROP_GIZMO_TYPE],
        //changedProperties += _ring.getChangedProperties();
    ]);

    /*@devdoc
     *  Gets property flags for all properties set in the entity properties object passed in, assuming that they may be changes.
     *  <p>Note: The SDK doesn't maintain its own entity tree so it doesn't calculate whether the property values have actually
     *  changed.</p>
     *  @param {EntityPropertyFlags} properties - A set of entity properties and values.
     *  @returns {EntityPropertyFlags} Flags for all the properties included in the entity properties object.
     */
    static getChangedProperties(properties: EntityProperties): EntityPropertyFlags {
        // C++  EntityPropertyFlags EntityItemProperties::getChangedProperties() const

        const changedProperties = new EntityPropertyFlags();
        const propertyNames = Object.keys(properties);
        for (const propertyName of propertyNames) {
            const propertyValue = EntityItemProperties.#_PROPERTY_MAP.get(propertyName);
            if (propertyValue !== undefined) {
                changedProperties.setHasProperty(propertyValue, true);
            }
            // WEBRTC TODO: Handle group properties.
        }
        return changedProperties;
    }

    /*@devdoc
        Writes as many entity properties as can fit in the buffer.
        @param {Uuid} id - The entity ID.
        @param {EntityProperties} properties - A set of entity properties and values.
        @param {MessageData} buffer - The buffer to write the entity properties to.
        @param {EntityPropertyFlags} requestedProperties - The properties that are requested to be written.
        @param {EntityPropertyFlags} didntFitProperties - The properties that couldn't be written to the buffer this call.
        @returns {AppendState} Whether all, some, or none of the requested properties were written. Any properties that weren't
            written are returned in the <code>didntFitProperties</code> parameter.
     */
    static encodeEntityEditPacket(/* command: PacketTypeValue, */ id: Uuid, properties: EntityProperties,
        buffer: MessageData, requestedProperties: EntityPropertyFlags, didntFitProperties: EntityPropertyFlags): AppendState {
        // C++  OctreeElement::AppendState encodeEntityEditPacket(PacketType command, EntityItemID id,
        //          const EntityItemProperties& properties, QByteArray& buffer, EntityPropertyFlags requestedProperties,
        //          EntityPropertyFlags & didntFitProperties)
        // The command parameter isn't used in the C++, either.

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        assert(didntFitProperties.isEmpty());

        const data = buffer.data;
        let dataPosition = buffer.dataPosition;

        const codec = new ByteCountCoded();

        let appendState = AppendState.COMPLETED;

        // Simplification: The server doesn't actually use octcode data (see EntityItemProperties::decodeEntityEditPacket()) and
        // we're not compressing data so we can write an empty octcode value.
        // WEBRTC TODO: Support compressing data?
        data.setUint8(dataPosition, 0);
        dataPosition += 1;

        const propertyFlags = new EntityPropertyFlags();
        propertyFlags.setHasProperty(EntityPropertyList.PROP_LAST_ITEM, true);
        didntFitProperties.copy(requestedProperties);

        data.setBigUint64(dataPosition, properties.lastEdited, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        data.setBigUint128(dataPosition, id.value(), UDT.BIG_ENDIAN);
        dataPosition += 16;

        codec.data = BigInt(properties.entityType);
        const bytesWritten = codec.encode(new DataView(data.buffer, data.byteOffset + dataPosition));
        dataPosition += bytesWritten;

        dataPosition += 1;  // 0x00 for endcodedUpdateDelta.

        const propertyFlagsOffset = dataPosition;
        const oldPropertyFlagsLength
            = propertyFlags.encode(new DataView(data.buffer, data.byteOffset + propertyFlagsOffset));
        dataPosition += oldPropertyFlagsLength;
        let propertyCount = 0;


        // Simplification: The header values will always fit because this method is always called for a new packet.

        propertyFlags.setHasProperty(EntityPropertyList.PROP_LAST_ITEM, false);

        const entityType = properties.entityType;

        const packetContext: OctreePacketContext = {
            propertiesToWrite: didntFitProperties,
            propertiesWritten: propertyFlags,
            propertyCount,
            appendState
        };


        /* eslint-disable @typescript-eslint/no-non-null-assertion */

        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SIMULATION_OWNER)) {
            dataPosition += OctreePacketData.appendArrayBufferValue(data, dataPosition,
                EntityPropertyList.PROP_SIMULATION_OWNER,
                properties.simOwnerData!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_PARENT_ID)) {
            dataPosition += OctreePacketData.appendUuidValue(data, dataPosition, EntityPropertyList.PROP_PARENT_ID,
                properties.parentID ?? new Uuid(), packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)) {
            dataPosition += OctreePacketData.appendUint16Value(data, dataPosition, EntityPropertyList.PROP_PARENT_JOINT_INDEX,
                properties.parentJointIndex!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_VISIBLE)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_VISIBLE,
                properties.visible!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_NAME)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_NAME,
                properties.name!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_LOCKED)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_LOCKED,
                properties.locked!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_USER_DATA)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_USER_DATA,
                properties.userData!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_PRIVATE_USER_DATA)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_PRIVATE_USER_DATA,
                properties.privateUserData!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_HREF)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_HREF,
                properties.href!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_DESCRIPTION)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_DESCRIPTION,
                properties.description!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_POSITION)) {
            dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_POSITION,
                properties.position!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_DIMENSIONS)) {
            dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_DIMENSIONS,
                properties.dimensions!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ROTATION)) {
            dataPosition += OctreePacketData.appendQuatValue(data, dataPosition, EntityPropertyList.PROP_ROTATION,
                properties.rotation!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_REGISTRATION_POINT)) {
            dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_REGISTRATION_POINT,
                properties.registrationPoint!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CREATED)) {
            dataPosition += OctreePacketData.appendUint64Value(data, dataPosition, EntityPropertyList.PROP_CREATED,
                properties.created!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)) {
            dataPosition += OctreePacketData.appendUuidValue(data, dataPosition, EntityPropertyList.PROP_LAST_EDITED_BY,
                properties.lastEditedBy!, packetContext);
        }
        // PROP_ENTITY_HOST_TYPE - not sent over the wire.
        // PROP_OWNING_AVATAR_ID - not sent over the wire.
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE)) {
            dataPosition += OctreePacketData.appendAACubeValue(data, dataPosition, EntityPropertyList.PROP_QUERY_AA_CUBE,
                properties.queryAACube!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CAN_CAST_SHADOW)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_CAN_CAST_SHADOW,
                properties.canCastShadow!, packetContext);

        }
        // PROP_VISIBLE_IN_SECONDARY_CAMERA - not sent over the wire.
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)) {
            dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_RENDER_LAYER,
                properties.renderLayer!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_PRIMITIVE_MODE)) {
            dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_PRIMITIVE_MODE,
                properties.primitiveMode!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_IGNORE_PICK_INTERSECTION)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition,
                EntityPropertyList.PROP_IGNORE_PICK_INTERSECTION, properties.ignorePickIntersection!, packetContext);

        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)) {
            dataPosition += OctreePacketData.appendUuidArray(data, dataPosition, EntityPropertyList.PROP_RENDER_WITH_ZONES,
                properties.renderWithZones!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_BILLBOARD_MODE)) {
            dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_BILLBOARD_MODE,
                properties.billboardMode!, UDT.LITTLE_ENDIAN, packetContext);
        }
        // WEBRTC TODO: Add grab properties.
        //_staticGrab.setProperties(properties);
        //_staticGrab.appendToEditPacket(packetData, requestedProperties, propertyFlags,
        //    propertiesDidntFit, propertyCount, appendState);

        // Physics
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_DENSITY)) {
            dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_DENSITY,
                properties.density!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_VELOCITY)) {
            dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_VELOCITY,
                properties.velocity!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANGULAR_VELOCITY)) {
            dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_ANGULAR_VELOCITY,
                properties.angularVelocity!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_GRAVITY)) {
            dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_GRAVITY,
                properties.gravity!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ACCELERATION)) {
            dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_ACCELERATION,
                properties.acceleration!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_DAMPING)) {
            dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_DAMPING,
                properties.damping!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ANGULAR_DAMPING)) {
            dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_ANGULAR_DAMPING,
                properties.angularDamping!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_RESTITUTION)) {
            dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_RESTITUTION,
                properties.restitution!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_FRICTION)) {
            dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_FRICTION,
                properties.friction!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_LIFETIME)) {
            dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_LIFETIME,
                properties.lifetime!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLLISIONLESS)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_COLLISIONLESS,
                properties.collisionless!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLLISION_MASK)) {
            dataPosition += OctreePacketData.appendUint16Value(data, dataPosition, EntityPropertyList.PROP_COLLISION_MASK,
                properties.collisionMask!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_DYNAMIC)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_DYNAMIC,
                properties.dynamic!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLLISION_SOUND_URL)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_COLLISION_SOUND_URL,
                properties.collisionSoundURL!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ACTION_DATA)) {
            dataPosition += OctreePacketData.appendArrayBufferValue(data, dataPosition, EntityPropertyList.PROP_ACTION_DATA,
                properties.actionData!, packetContext);
        }

        // Cloning
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CLONEABLE)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_CLONEABLE,
                properties.cloneable!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CLONE_LIFETIME)) {
            dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_CLONE_LIFETIME,
                properties.cloneLifetime!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CLONE_LIMIT)) {
            dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_CLONE_LIMIT,
                properties.cloneLimit!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CLONE_DYNAMIC)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_CLONE_DYNAMIC,
                properties.cloneDynamic!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CLONE_AVATAR_ENTITY)) {
            dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_CLONE_AVATAR_ENTITY,
                properties.cloneAvatarEntity!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CLONE_ORIGIN_ID)) {
            dataPosition += OctreePacketData.appendUuidValue(data, dataPosition, EntityPropertyList.PROP_CLONE_ORIGIN_ID,
                properties.cloneOriginID!, packetContext);
        }

        // Scripts
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SCRIPT)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_SCRIPT,
                properties.script!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SCRIPT_TIMESTAMP)) {
            dataPosition += OctreePacketData.appendUint64Value(data, dataPosition, EntityPropertyList.PROP_SCRIPT_TIMESTAMP,
                properties.scriptTimestamp!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SERVER_SCRIPTS)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_SERVER_SCRIPTS,
                properties.serverScripts!, packetContext);
        }

        // Certifiable Properties
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ITEM_NAME)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_ITEM_NAME,
                properties.itemName!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ITEM_DESCRIPTION)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_ITEM_DESCRIPTION,
                properties.itemDescription!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ITEM_CATEGORIES)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_ITEM_CATEGORIES,
                properties.itemCategories!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ITEM_ARTIST)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_ITEM_ARTIST,
                properties.itemArtist!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ITEM_LICENSE)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_ITEM_LICENSE,
                properties.itemLicense!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_LIMITED_RUN)) {
            dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_LIMITED_RUN,
                properties.limitedRun!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MARKETPLACE_ID)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_MARKETPLACE_ID,
                properties.marketplaceID!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EDITION_NUMBER)) {
            dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_EDITION_NUMBER,
                properties.editionNumber!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ENTITY_INSTANCE_NUMBER)) {
            dataPosition += OctreePacketData.appendUint32Value(data, dataPosition,
                EntityPropertyList.PROP_ENTITY_INSTANCE_NUMBER,
                properties.entityInstanceNumber!, UDT.LITTLE_ENDIAN, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CERTIFICATE_ID)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_CERTIFICATE_ID,
                properties.certificateID!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CERTIFICATE_TYPE)) {
            dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_CERTIFICATE_TYPE,
                properties.certificateType!, packetContext);
        }
        if (requestedProperties.getHasProperty(EntityPropertyList.PROP_STATIC_CERTIFICATE_VERSION)) {
            dataPosition += OctreePacketData.appendUint32Value(data, dataPosition,
                EntityPropertyList.PROP_STATIC_CERTIFICATE_VERSION,
                properties.staticCertificateVersion!, UDT.LITTLE_ENDIAN, packetContext);
        }


        if (entityType === EntityType.ParticleEffect) {
            const entityProperties = properties as ParticleEffectEntityProperties;
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SHAPE_TYPE)) {
                dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_SHAPE_TYPE,
                    entityProperties.shapeType!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COMPOUND_SHAPE_URL)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition,
                    EntityPropertyList.PROP_COMPOUND_SHAPE_URL,
                    entityProperties.compoundShapeURL!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLOR)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_COLOR,
                    entityProperties.color!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_ALPHA,
                    entityProperties.alpha!, UDT.LITTLE_ENDIAN, packetContext);
            }
            // ... Ignore deprecated pulse properties.
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TEXTURES)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_TEXTURES,
                    entityProperties.textures!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MAX_PARTICLES)) {
                dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_MAX_PARTICLES,
                    entityProperties.maxParticles!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_LIFESPAN)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_LIFESPAN,
                    entityProperties.lifespan!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMITTING_PARTICLES)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition,
                    EntityPropertyList.PROP_EMITTING_PARTICLES,
                    entityProperties.isEmitting!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMIT_RATE)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_EMIT_RATE,
                    entityProperties.emitRate!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMIT_SPEED)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_EMIT_SPEED,
                    entityProperties.emitSpeed!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SPEED_SPREAD)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_SPEED_SPREAD,
                    entityProperties.speedSpread!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMIT_ORIENTATION)) {
                dataPosition += OctreePacketData.appendQuatValue(data, dataPosition,
                    EntityPropertyList.PROP_EMIT_ORIENTATION,
                    entityProperties.emitOrientation!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMIT_DIMENSIONS)) {
                dataPosition += OctreePacketData.appendVec3Value(data, dataPosition,
                    EntityPropertyList.PROP_EMIT_DIMENSIONS,
                    entityProperties.emitDimensions!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMIT_RADIUS_START)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_EMIT_RADIUS_START,
                    entityProperties.emitRadiusStart!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_POLAR_START)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_POLAR_START,
                    entityProperties.polarStart!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_POLAR_FINISH)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_POLAR_FINISH,
                    entityProperties.polarFinish!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_AZIMUTH_START)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_AZIMUTH_START,
                    entityProperties.azimuthStart!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_AZIMUTH_FINISH)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_AZIMUTH_FINISH,
                    entityProperties.azimuthFinish!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMIT_ACCELERATION)) {
                dataPosition += OctreePacketData.appendVec3Value(data, dataPosition,
                    EntityPropertyList.PROP_EMIT_ACCELERATION,
                    entityProperties.emitAcceleration!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ACCELERATION_SPREAD)) {
                dataPosition += OctreePacketData.appendVec3Value(data, dataPosition,
                    EntityPropertyList.PROP_ACCELERATION_SPREAD,
                    entityProperties.accelerationSpread!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_PARTICLE_RADIUS)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_PARTICLE_RADIUS,
                    entityProperties.particleRadius!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_RADIUS_SPREAD)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_RADIUS_SPREAD,
                    entityProperties.radiusSpread!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_RADIUS_START)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_RADIUS_START,
                    entityProperties.radiusStart!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_RADIUS_FINISH)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_RADIUS_FINISH,
                    entityProperties.radiusFinish!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLOR_SPREAD)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_COLOR_SPREAD,
                    entityProperties.colorSpread!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLOR_START)) {
                dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_COLOR_START,
                    {
                        x: entityProperties.colorStart!.red,
                        y: entityProperties.colorStart!.green,
                        z: entityProperties.colorStart!.blue
                    }, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLOR_FINISH)) {
                dataPosition += OctreePacketData.appendVec3Value(data, dataPosition, EntityPropertyList.PROP_COLOR_FINISH,
                    {
                        x: entityProperties.colorFinish!.red,
                        y: entityProperties.colorFinish!.green,
                        z: entityProperties.colorFinish!.blue
                    }, packetContext);
            }

            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA_SPREAD)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_ALPHA_SPREAD,
                    entityProperties.alphaSpread!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA_START)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_ALPHA_START,
                    entityProperties.alphaStart!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA_FINISH)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_ALPHA_FINISH,
                    entityProperties.alphaFinish!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMITTER_SHOULD_TRAIL)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition,
                    EntityPropertyList.PROP_EMITTER_SHOULD_TRAIL,
                    entityProperties.emitterShouldTrail!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_PARTICLE_SPIN)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_PARTICLE_SPIN,
                    entityProperties.particleSpin!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SPIN_SPREAD)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_SPIN_SPREAD,
                    entityProperties.spinSpread!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SPIN_START)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_SPIN_START,
                    entityProperties.spinStart!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SPIN_FINISH)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_SPIN_FINISH,
                    entityProperties.spinFinish!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_PARTICLE_ROTATE_WITH_ENTITY)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition,
                    EntityPropertyList.PROP_PARTICLE_ROTATE_WITH_ENTITY,
                    entityProperties.rotateWithEntity!, packetContext);
            }
        }

        // WEBRTC TODO: Address further C++ code - other entity properties.

        if (entityType === EntityType.Light) {
            const entityProperties = properties as LightEntityProperties;
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLOR)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_COLOR,
                    entityProperties.color!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_IS_SPOTLIGHT)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_IS_SPOTLIGHT,
                    entityProperties.isSpotlight!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_INTENSITY)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_INTENSITY,
                    entityProperties.intensity!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EXPONENT)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_EXPONENT,
                    entityProperties.exponent!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_CUTOFF)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_CUTOFF,
                    entityProperties.cutoff!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_FALLOFF_RADIUS)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_FALLOFF_RADIUS,
                    entityProperties.falloffRadius!, UDT.LITTLE_ENDIAN, packetContext);
            }
        }

        if (entityType === EntityType.Text) {
            const entityProperties = properties as TextEntityProperties;
            // ... Ignore deprecated pulse properties.
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TEXT)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_TEXT,
                    entityProperties.text!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_LINE_HEIGHT)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_LINE_HEIGHT,
                    entityProperties.lineHeight!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TEXT_COLOR)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_TEXT_COLOR,
                    entityProperties.textColor!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TEXT_ALPHA)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_TEXT_ALPHA,
                    entityProperties.textAlpha!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_BACKGROUND_COLOR)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_BACKGROUND_COLOR,
                    entityProperties.backgroundColor!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_BACKGROUND_ALPHA)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_BACKGROUND_ALPHA,
                    entityProperties.backgroundAlpha!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_LEFT_MARGIN)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_LEFT_MARGIN,
                    entityProperties.leftMargin!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_RIGHT_MARGIN)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_RIGHT_MARGIN,
                    entityProperties.rightMargin!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TOP_MARGIN)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_TOP_MARGIN,
                    entityProperties.topMargin!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_BOTTOM_MARGIN)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_BOTTOM_MARGIN,
                    entityProperties.bottomMargin!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_UNLIT)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_UNLIT,
                    entityProperties.unlit!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_FONT)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_FONT,
                    entityProperties.font!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TEXT_EFFECT)) {
                const textEffectValue = Object.values(TextEffect).indexOf(entityProperties.textEffect!);
                dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_TEXT_EFFECT,
                    textEffectValue, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TEXT_EFFECT_COLOR)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_TEXT_EFFECT_COLOR,
                    entityProperties.textEffectColor!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TEXT_EFFECT_THICKNESS)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_TEXT_EFFECT_THICKNESS,
                    entityProperties.textEffectThickness!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_TEXT_ALIGNMENT)) {
                const textAlignmentValue = Object.values(TextAlignment).indexOf(entityProperties.textAlignment!);
                dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_TEXT_ALIGNMENT,
                    textAlignmentValue, UDT.LITTLE_ENDIAN, packetContext);
            }
        }

        // WEBRTC TODO: Address further C++ code - other entity properties.

        if (entityType === EntityType.Web) {
            const entityProperties = properties as WebEntityProperties;
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLOR)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_COLOR,
                    entityProperties.color!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_ALPHA,
                    entityProperties.alpha!, UDT.LITTLE_ENDIAN, packetContext);
            }
            // ... Ignore deprecated pulse properties.
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SOURCE_URL)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_SOURCE_URL,
                    entityProperties.sourceURL!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_DPI)) {
                dataPosition += OctreePacketData.appendUint16Value(data, dataPosition, EntityPropertyList.PROP_DPI,
                    entityProperties.dpi!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SCRIPT_URL)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_SCRIPT_URL,
                    entityProperties.scriptURL!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MAX_FPS)) {
                dataPosition += OctreePacketData.appendUint8Value(data, dataPosition, EntityPropertyList.PROP_MAX_FPS,
                    entityProperties.maxFPS!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_INPUT_MODE)) {
                dataPosition += OctreePacketData.appendUint32Value(data, dataPosition, EntityPropertyList.PROP_INPUT_MODE,
                    entityProperties.inputMode!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SHOW_KEYBOARD_FOCUS_HIGHLIGHT)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition,
                    EntityPropertyList.PROP_SHOW_KEYBOARD_FOCUS_HIGHLIGHT,
                    entityProperties.showKeyboardFocusHighlight!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_WEB_USE_BACKGROUND)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition,
                    EntityPropertyList.PROP_WEB_USE_BACKGROUND,
                    entityProperties.useBackground!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_USER_AGENT)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_USER_AGENT,
                    entityProperties.userAgent!, packetContext);
            }
        }

        // WEBRTC TODO: Address further C++ code - other entity properties.

        if (entityType === EntityType.Box || entityType === EntityType.Sphere || entityType === EntityType.Shape) {
            const entityProperties = properties as ShapeEntityProperties;
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLOR)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_COLOR,
                    entityProperties.color!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_ALPHA,
                    entityProperties.alpha!, UDT.LITTLE_ENDIAN, packetContext);
            }
            // ... Ignore deprecated pulse properties.
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SHAPE)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_SHAPE,
                    entityProperties.shape!, packetContext);
            }
        }

        // WEBRTC TODO: Address further C++ code - other entity properties.

        if (entityType === EntityType.Material) {
            const entityProperties = properties as MaterialEntityProperties;
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MATERIAL_URL)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_MATERIAL_URL,
                    entityProperties.materialURL!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MATERIAL_MAPPING_MODE)) {
                dataPosition += OctreePacketData.appendUint32Value(data, dataPosition,
                    EntityPropertyList.PROP_MATERIAL_MAPPING_MODE,
                    entityProperties.materialMappingMode!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MATERIAL_PRIORITY)) {
                dataPosition += OctreePacketData.appendUint16Value(data, dataPosition,
                    EntityPropertyList.PROP_MATERIAL_PRIORITY,
                    entityProperties.priority!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_PARENT_MATERIAL_NAME)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition,
                    EntityPropertyList.PROP_PARENT_MATERIAL_NAME,
                    entityProperties.parentMaterialName!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MATERIAL_MAPPING_POS)) {
                dataPosition += OctreePacketData.appendVec2Value(data, dataPosition,
                    EntityPropertyList.PROP_MATERIAL_MAPPING_POS,
                    entityProperties.materialMappingPos!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MATERIAL_MAPPING_SCALE)) {
                dataPosition += OctreePacketData.appendVec2Value(data, dataPosition,
                    EntityPropertyList.PROP_MATERIAL_MAPPING_SCALE,
                    entityProperties.materialMappingScale!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MATERIAL_MAPPING_ROT)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition,
                    EntityPropertyList.PROP_MATERIAL_MAPPING_ROT,
                    entityProperties.materialMappingRot!, UDT.LITTLE_ENDIAN, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MATERIAL_DATA)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_MATERIAL_DATA,
                    entityProperties.materialData!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_MATERIAL_REPEAT)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_MATERIAL_REPEAT,
                    entityProperties.materialRepeat!, packetContext);
            }
        }

        if (entityType === EntityType.Image) {
            const entityProperties = properties as ImageEntityProperties;
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_COLOR)) {
                dataPosition += OctreePacketData.appendColorValue(data, dataPosition, EntityPropertyList.PROP_COLOR,
                    entityProperties.color!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA)) {
                dataPosition += OctreePacketData.appendFloat32Value(data, dataPosition, EntityPropertyList.PROP_ALPHA,
                    entityProperties.alpha!, UDT.LITTLE_ENDIAN, packetContext);
            }
            // ... Ignore deprecated pulse properties.
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_IMAGE_URL)) {
                dataPosition += OctreePacketData.appendStringValue(data, dataPosition, EntityPropertyList.PROP_IMAGE_URL,
                    entityProperties.imageURL!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_EMISSIVE)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition, EntityPropertyList.PROP_EMISSIVE,
                    entityProperties.emissive!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_KEEP_ASPECT_RATIO)) {
                dataPosition += OctreePacketData.appendBooleanValue(data, dataPosition,
                    EntityPropertyList.PROP_KEEP_ASPECT_RATIO,
                    entityProperties.keepAspectRatio!, packetContext);
            }
            if (requestedProperties.getHasProperty(EntityPropertyList.PROP_SUB_IMAGE)) {
                dataPosition += OctreePacketData.appendRectValue(data, dataPosition, EntityPropertyList.PROP_SUB_IMAGE,
                    entityProperties.subImage!, packetContext);
            }
        }

        // WEBRTC TODO: Address further C++ code - other entity properties.

        /* eslint-enable @typescript-eslint/no-non-null-assertion */


        propertyCount = packetContext.propertyCount;
        appendState = packetContext.appendState;

        if (propertyCount > 0) {
            const newPropertyFlagsLength
                = propertyFlags.encode(new DataView(data.buffer, data.byteOffset + propertyFlagsOffset));

            // If the size of the PropertyFlags has shrunk then move property data.
            if (newPropertyFlagsLength < oldPropertyFlagsLength) {
                const numPropertyBytes = dataPosition - (propertyFlagsOffset + oldPropertyFlagsLength);
                for (let i = 0; i < numPropertyBytes; i++) {
                    data.setUint8(propertyFlagsOffset + newPropertyFlagsLength + i,
                        data.getUint8(propertyFlagsOffset + oldPropertyFlagsLength + i));
                }
                dataPosition = propertyFlagsOffset + newPropertyFlagsLength + numPropertyBytes;
            } else {
                assert(newPropertyFlagsLength === oldPropertyFlagsLength);  // Should not have grown.
            }
        } else {
            dataPosition = buffer.dataPosition;
            appendState = AppendState.NONE;
        }

        buffer.dataPosition = dataPosition;

        return appendState;
    }

}

export default EntityItemProperties;
