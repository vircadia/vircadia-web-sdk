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

import { HostType } from "../../entities/EntityItem";
import { EntityPropertyFlags } from "../../entities/EntityPropertyFlags";
import { EntityType } from "../../entities/EntityTypes";
import GizmoEntityItem, { GizmoEntityProperties, GizmoEntitySubclassData } from "../../entities/GizmoEntityItem";
import GridEntityItem, { GridEntityProperties, GridEntitySubclassData } from "../../entities/GridEntityItem";
import ImageEntityItem, { ImageEntityProperties, ImageEntitySubclassData } from "../../entities/ImageEntityItem";
import LightEntityItem, { LightEntityProperties, LightEntitySubclassData } from "../../entities/LightEntityItem";
import LineEntityItem, { LineEntityProperties, LineEntitySubclassData } from "../../entities/LineEntityItem";
import MaterialEntityItem, { MaterialEntityProperties, MaterialEntitySubclassData } from "../../entities/MaterialEntityItem";
import ModelEntityItem, { ModelEntityProperties, ModelEntitySubclassData } from "../../entities/ModelEntityItem";
import ParticleEffectEntityItem,
{ ParticleEffectEntityProperties, ParticleEffectEntitySubclassData } from "../../entities/ParticleEffectEntityItem";
import PolyLineEntityItem, { PolyLineEntityProperties, PolyLineEntitySubclassData } from "../../entities/PolyLineEntityItem";
import PolyVoxEntityItem, { PolyVoxEntityProperties, PolyVoxEntitySubclassData } from "../../entities/PolyVoxEntityItem";
import ShapeEntityItem, { ShapeEntityProperties, ShapeEntitySubclassData } from "../../entities/ShapeEntityItem";
import TextEntityItem, { TextEntityProperties, TextEntitySubclassData } from "../../entities/TextEntityItem";
import WebEntityItem, { WebEntityProperties, WebEntitySubclassData } from "../../entities/WebEntityItem";
import ZoneEntityItem, { ZoneEntityProperties, ZoneEntitySubclassData } from "../../entities/ZoneEntityItem";
import AACube from "../../shared/AACube";
import assert from "../../shared/assert";
import ByteCountCoded from "../../shared/ByteCountCoded";
import "../../shared/DataViewExtensions";
import GLMHelpers from "../../shared/GLMHelpers";
import PropertyFlags from "../../shared/PropertyFlags";
import { quat } from "../../shared/Quat";
import Uuid from "../../shared/Uuid";
import { vec3 } from "../../shared/Vec3";
import UDT from "../udt/UDT";

import { ungzip } from "pako";


type CommonEntityProperties = {
    entityItemID: Uuid,
    entityType: EntityType,
    createdFromBuffer: bigint,
    lastEdited: bigint,
    updateDelta: number,
    simulatedDelta: number,
    simOwnerData: ArrayBuffer | undefined;
    parentID: Uuid | null | undefined;
    parentJointIndex: number | undefined;
    visible: boolean | undefined;
    name: string | undefined;
    locked: boolean | undefined;
    userData: string | undefined;
    privateUserData: string | undefined;
    href: string | undefined;
    description: string | undefined;
    position: vec3 | undefined;
    dimensions: vec3 | undefined;
    rotation: quat | undefined;
    registrationPoint: vec3 | undefined;
    created: bigint | undefined;
    lastEditedBy: Uuid | undefined;
    entityHostType: HostType | undefined;  // Not sent over the wire.
    queryAACube: AACube | undefined;
    canCastShadow: boolean | undefined;
    renderLayer: number | undefined;
    primitiveMode: number | undefined;
    ignorePickIntersection: boolean | undefined;
    renderWithZones: Uuid[] | undefined;
    billboardMode: number | undefined;
    grabbable: boolean | undefined;
    grabKinematic: boolean | undefined;
    grabFollowsController: boolean | undefined;
    triggerable: boolean | undefined;
    grabEquippable: boolean | undefined;
    delegateToParent: boolean | undefined;
    equippableLeftPositionOffset: vec3 | undefined;
    equippableLeftRotationOffset: quat | undefined;
    equippableRightPositionOffset: vec3 | undefined;
    equippableRightRotationOffset: quat | undefined;
    equippableIndicatorURL: string | undefined;
    equippableIndicatorScale: vec3 | undefined;
    equippableIndicatorOffset: vec3 | undefined;
    density: number | undefined;
    velocity: vec3 | undefined;
    angularVelocity: vec3 | undefined;
    gravity: vec3 | undefined;
    acceleration: vec3 | undefined;
    damping: number | undefined;
    angularDamping: number | undefined;
    restitution: number | undefined;
    friction: number | undefined;
    lifetime: number | undefined;
    collisionless: boolean | undefined;
    collisionMask: number | undefined;
    dynamic: boolean | undefined;
    collisionSoundURL: string | undefined;
    actionData: ArrayBuffer | undefined;
    cloneable: boolean | undefined;
    cloneLifetime: number | undefined;
    cloneLimit: number | undefined;
    cloneDynamic: boolean | undefined;
    cloneAvatarIdentity: boolean | undefined;
    cloneOriginID: Uuid | undefined;
    script: string | undefined;
    scriptTimestamp: bigint | undefined;
    serverScripts: string | undefined;
    itemName: string | undefined;
    itemDescription: string | undefined;
    itemCategories: string | undefined;
    itemArtist: string | undefined;
    itemLicense: string | undefined;
    limitedRun: number | undefined;
    marketplaceID: string | undefined;
    editionNumber: number | undefined;
    entityInstanceNumber: number | undefined;
    certificateID: string | undefined;
    certificateType: string | undefined;
    staticCertificateVersion: number | undefined;
};

type EntityProperties = ModelEntityProperties
| ShapeEntityProperties
| TextEntityProperties
| ImageEntityProperties
| WebEntityProperties
| ParticleEffectEntityProperties
| LineEntityProperties
| PolyLineEntityProperties
| PolyVoxEntityProperties
| GridEntityProperties
| GizmoEntityProperties
| LightEntityProperties
| ZoneEntityProperties
| MaterialEntityProperties;

type EntityDataDetails = EntityProperties[];

type EntitySubclassData = ModelEntitySubclassData
| ShapeEntitySubclassData
| TextEntitySubclassData
| ImageEntitySubclassData
| WebEntitySubclassData
| ParticleEffectEntitySubclassData
| LineEntitySubclassData
| PolyLineEntitySubclassData
| PolyVoxEntitySubclassData
| GridEntitySubclassData
| GizmoEntitySubclassData
| LightEntitySubclassData
| ZoneEntitySubclassData
| MaterialEntitySubclassData;

type ParsedData = {
    bytesRead: number;
    entitiesDataDetails: EntityDataDetails;
};


const EntityData = new class {
    // C++  N/A

    // C++  OctreePacketData.h
    readonly #_PACKET_IS_COMPRESSED_BIT = 1;
    // C++  OctalCode.h
    readonly #_OVERFLOWED_OCTCODE_BUFFER = -1;
    readonly #_UNKNOWN_OCTCODE_LENGTH = -2;
    // Header bytes
    //    object ID [16 bytes]
    //    ByteCountCoded(type code) [~1 byte]
    //    last edited [8 bytes]
    //    ByteCountCoded(last_edited to last_updated delta) [~1-8 bytes]
    //    PropertyFlags<>( everything ) [1-2 bytes]
    // ~27-35 bytes...
    readonly #_MINIMUM_HEADER_BYTES = 27;

    /*@sdkdoc
     *  Different entity types have different properties: some common to all entities (listed in the table) and some specific to
     *  each {@link EntityType} (linked to below).
     *  <p>A property value may be undefined if it couldn't fit in the data packet sent by the server.</p>
     *  @typedef {object} EntityProperties
     *
     *  @property {Uuid} entityItemID - The ID of the entity.
     *  @property {EntityType} entityType - The entity's type. It cannot be changed after an entity is created.
     *  @property {bigint} createdFromBuffer - Timestamp for when the entity was created. Expressed in number of microseconds
     *      since Unix epoch.
     *  @property {bigint} lastEdited - Timestamp for when the entity was last edited. Expressed in number of microseconds since
     *      Unix epoch.
     *  @property {number} updateDelta - The delta between {@link EntityDataDetails|lastEdited} and the last time the entity was
     *      updated.
     *  @property {number} simulatedDelta - The delta between {@link EntityDataDetails|lastEdited} and the last time the entity
     *      was simulated.
     *  @property {ArrayBuffer|undefined} simOwnerData - The simulation owner data.
     *  @property {Uuid|null|undefined} parentID - The ID of the entity that the entity is parented to. <code>null</code>
     *      if the entity is not parented.
     *  @property {number|undefined} parentJointIndex - The joint of the entity that the entity is parented to.
     *  @property {boolean|undefined} visible - <code>true</code> if the entity is rendered, <code>false</code> if it
     *      isn't.
     *  @property {string|undefined} name - The entity's name. Doesn't have to be unique.
     *  @property {boolean|undefined} locked - <code>true</code> if properties other than locked cannot be changed and the
     *      entity cannot be deleted, <code>false</code> if all properties can be changed and the entity can be deleted.
     *  @property {string|undefined} userData - Used to store extra data about the entity in JSON format.
     *  @property {string|undefined} privateUserData - Like userData, but only accessible by server entity scripts, assignment
     *      client scripts, and users who have "Can Get and Set Private User Data" permissions in the domain.
     *  @property {string|undefined} href - A "hifi://" metaverse address that a user is teleported to when they click on the
     *      entity.
     *  @property {string|undefined} description - A description of the href property value.
     *  @property {vec3|undefined} position - The position of the entity in world coordinates.
     *  @property {vec3|undefined} dimensions - The dimensions of the entity. When adding an entity, if no dimensions value is
     *      specified then the model is automatically sized to its natural dimensions.
     *  @property {quat|undefined} rotation - The orientation of the entity in world coordinates.
     *  @property {vec3|undefined} registrationPoint - The point in the entity that is set to the entity's position and is
     *      rotated about.
     *  @property {bigint|undefined} created - Timestamp for when the entity was created. Expressed in number of microseconds
     *      since Unix
     *  @property {Uuid|undefined} lastEditedBy - The session ID of the avatar or agent that most recently created or edited
     *      the entity.
     *  @property {HostType|undefined} entityHostType - How the entity is hosted and sent to others for display. The value can
     *      only be set at entity creation by {@link EntityServer#addEntity|EntityServer.addEntity}. <em>Read-only.</em>
     *  @property {AACube|undefined} queryAACube - The axis-aligned cube that determines where the entity lives in the entity
     *      server's octree. The cube may be considerably larger than the entity in some situations, e.g., when the entity is
     *      grabbed by an avatar: the position of the entity is determined through avatar mixer updates and so the AA cube is
     *      expanded in order to reduce unnecessary entity server updates. Scripts should not change this property's value.
     *  @property {boolean|undefined} canCastShadow - <code>true</code> if the entity can cast a shadow, <code>false</code>
     *      if it can't.
     *  @property {number|undefined} renderLayer - The layer that the entity renders in.
     *  @property {number|undefined} primitiveMode - How the entity's geometry is rendered.
     *  @property {boolean|undefined} ignorePickIntersection - <code>true</code> if Picks and RayPick ignore the entity,
     *      <code>false</code> if they don't.
     *  @property {Uuid[]|undefined} renderWithZones - A list of entity IDs representing with which zones this entity should
     *      render. If it is empty, this entity will render normally. Otherwise, this entity will only render if your avatar is
     *      within one of the zones in this list.
     *  @property {number|undefined} billboardMode - Whether the entity is billboarded to face the camera. Use the rotation
     *      property to control which axis is facing you.
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
     *  @property {number|undefined} density - The density of the entity in <code>kg/m3</code>, range
     *      <code>100 – 10000</code>.
     *      Examples: <code>100</code> for balsa wood, <code>10000</code> for silver. The density is used in conjunction with
     *      the entity's bounding box volume to work out its mass in the application of physics.
     *  @property {vec3|undefined} velocity - The linear velocity of the entity in m/s with respect to world coordinates.
     *  @property {vec3|undefined} angularVelocity - The angular velocity of the entity in <code>rad/s</code> with respect to
     *      its axes, about its registration point.
     *  @property {vec3|undefined} gravity - The acceleration due to gravity in <code>m/s2</code> that the entity should move
     *      with, in world coordinates. Use a value of <code>{ x: 0, y: -9.8, z: 0 }</code> to simulate Earth's gravity. Gravity
     *      is applied to an entity's motion only if its dynamic property is true. If changing an entity's gravity from
     *      {@link Vec3|ZERO}, you need to give it a small velocity in order to kick off physics simulation.
     *  @property {vec3|undefined} acceleration - The current, measured acceleration of the entity, in <code>m/s2</code>.
     *  @property {number|undefined} damping - How much the linear velocity of an entity slows down over time, range
     *      <code>0.0</code> – <code>1.0</code>. A higher damping value slows down the entity more quickly. The default value is
     *      for an exponential decay timescale of <code>2.0s</code>, where it takes <code>2.0s</code> for the movement to slow
     *      to <code>1/e = 0.368</code> of its initial value.
     *  @property {number|undefined} angularDamping - How much the angular velocity of an entity slows down over time, range
     *      <code>0.0 – 1.0</code>. A higher damping value slows down the entity more quickly. The default value is for an
     *      exponential decay timescale of <code>2.0s</code>, where it takes <code>2.0s</code> for the movement to slow to
     *      <code>1/e = 0.368</code> of its initial value.
     *  @property {number|undefined} restitution - The "bounciness" of an entity when it collides, range
     *      <code>0.0 – 0.99</code>. The higher the value, the more bouncy.
     *  @property {number|undefined} friction - How much an entity slows down when it's moving against another, range
     *      <code>0.0 – 10.0</code>. The higher the value, the more quickly it slows down. Examples: <code>0.1</code> for ice,
     *      <code>0.9</code> for sandpaper.
     *  @property {number|undefined} lifetime - How long an entity lives for, in seconds, before being automatically deleted.
     *      A value of -1 means that the entity lives for ever.
     *  @property {boolean|undefined} collisionless - <code>true</code> if the entity shouldn't collide, <code>false</code>
     *      if it collides with items per its {@link EntityData|collisionMask} property.
     *  @property {number|undefined} collisionMask - What types of items the entity should collide with.
     *  @property {boolean|undefined} dynamic - <code>true</code> if the entity's movement is affected by collisions,
     *      <code>false</code> if it isn't.
     *  @property {string|undefined} collisionSoundURL - The sound that's played when the entity experiences a collision.
     *  @property {ArrayBuffer|undefined} actionData - Base-64 encoded compressed dump of the actions associated with the
     *      entity. This property is typically not used in scripts directly; rather, functions that manipulate an entity's
     *      actions update it. The size of this property increases with the number of actions. Because this property value has
     *      to fit within a Vircadia datagram packet, there is a limit to the number of actions that an entity can have; edits
     *      which would result in overflow are rejected.
     *  @property {boolean|undefined} cloneable - <code>true</code> if the domain or avatar entity can be cloned,
     *      <code>false</code> if it can't be.
     *  @property {number|undefined} cloneLifetime - The entity lifetime for clones created from this entity.
     *  @property {number|undefined} cloneLimit - The total number of clones of this entity that can exist in the domain at
     *      any given time.
     *  @property {boolean|undefined} cloneDynamic - <code>true</code> if clones created from this entity will have their
     *      dynamic property set to true, <code>false</code> if they won't.
     *  @property {boolean|undefined} cloneAvatarIdentity - <code>true</code> if clones created from this entity will be
     *      created as avatar entities, <code>false</code> if they won't be.
     *  @property {Uuid|undefined} cloneOriginID - The ID of the entity that this entity was cloned from.
     *  @property {string|undefined} script - The URL of the client entity script, if any, that is attached to the entity.
     *  @property {bigint|undefined} scriptTimestamp - Used to indicate when the client entity script was loaded. Should be an
     *      integer number of milliseconds since Unix epoch. If you update the property's value, the script is re-downloaded and
     *      reloaded.
     *  @property {string|undefined} serverScripts - The URL of the server entity script, if any, that is attached to the
     *      entity.
     *  @property {string|undefined} itemName - Certifiable name of the Marketplace item.
     *  @property {string|undefined} itemDescription - Certifiable description of the Marketplace item.
     *  @property {string|undefined} itemCategories - Certifiable category of the Marketplace item.
     *  @property {string|undefined} itemArtist - Certifiable artist that created the Marketplace item.
     *  @property {string|undefined} itemLicense - Certifiable license URL for the Marketplace item.
     *  @property {number|undefined} limitedRun - Certifiable maximum integer number of editions (copies) of the Marketplace
     *      item allowed to be sold.
     *  @property {string|undefined} marketplaceID - Certifiable UUID for the Marketplace item, as used in the URL of the
     *      item's download and its Marketplace Web page.
     *  @property {number|undefined} editionNumber - Certifiable integer edition (copy) number or the Marketplace item. Each
     *      copy sold in the Marketplace is numbered sequentially, starting at <code>1</code>.
     *  @property {number|undefined} entityInstanceNumber - Certifiable integer instance number for identical entities in a
     *      Marketplace item. A Marketplace item may have multiple, identical parts. If so, then each is numbered sequentially
     *      with an instance number.
     *  @property {string|undefined} certificateID - Hash of the entity's static certificate JSON, signed by the artist's
     *      private key.
     *  @property {string|undefined} certificateType - Type of the certificate.
     *  @property {number|undefined} staticCertificateVersion - The version of the method used to generate the certificateID.
     *
     *  @see {@link ImageEntityProperties}
     *  @see {@link LightEntityProperties}
     *  @see {@link ModelEntityProperties}
     *  @see {@link ShapeEntityProperties}
     *  @see {@link TextEntityProperties}
     *  @see {@link WebEntityProperties}
     *  @see {@link ParticleEffectEntityProperties}
     *  @see {@link ZoneEntityProperties}
     *  @see {@link MaterialEntityProperties}
     */

    /*@sdkdoc
     *  Entity properties returned for an entity {@link PacketScribe|read} from an {@link PacketType(1)|EntityData} packet.
     *  @typedef {EntityProperties[]} PacketScribe.EntityDataDetails
     */

    /*@devdoc
     *  Reads an {@link PacketType(1)|EntityData} packet containing the details of one or more entities.
     *  @function PacketScribe.EntityData&period;read
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @returns {PacketScribe.EntityDataDetails} The entity data for one or more entities.
     */
    read(data: DataView): EntityDataDetails {
        // C++  void OctreeProcessor::processDatagram(ReceivedMessage& message, SharedNodePointer sourceNode)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const flags = data.getUint8(dataPosition);
        dataPosition += 1;

        // Skip over the sequence value which is used for safe landing.
        dataPosition += 2;

        // WEBRTC TODO: Read and use the variable sentAt as in the C++ method OctreeProcessor::processDatagram
        dataPosition += 8;

        /* eslint-enable @typescript-eslint/no-unused-vars */

        const packetIsCompressed = flags >> 7 - this.#_PACKET_IS_COMPRESSED_BIT & 1;

        let error = false;

        let entityDataDetails: EntityDataDetails = [];

        while (data.byteLength - dataPosition > 0 && !error) {
            const entityMessage = new DataView(data.buffer.slice(data.byteOffset + dataPosition));
            let entityMessagePosition = 0;

            // eslint-disable-next-line @typescript-eslint/init-declarations
            let sectionLength;
            if (packetIsCompressed) {
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
                    const compressedData = entityMessage.buffer.slice(entityMessage.byteOffset + entityMessagePosition + 4);
                    entityData = new DataView(ungzip(compressedData).buffer);
                } else {
                    entityData = new DataView(entityMessage.buffer.slice(entityMessage.byteOffset + entityMessagePosition));
                }

                let bytesRead = 0;
                // WEBRTC TODO: This won't throw once all entity types are supported.
                try {
                    const parsedData = this.#readBitstreamToTree(entityData);
                    bytesRead = parsedData.bytesRead;
                    entityDataDetails = [...entityDataDetails, ...parsedData.entitiesDataDetails];
                } catch (err) {
                    // Discard the whole packet.
                    return [];
                }

                assert(sectionLength !== bytesRead);
                dataPosition += sectionLength;
            }
            dataPosition += entityMessagePosition;
        }

        // WEBRTC TODO: Address further C++ code.

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return entityDataDetails;
    }

    #readBitstreamToTree(data: DataView): ParsedData {
        // C++  void Octree::readBitstreamToTree(const unsigned char * bitstream, uint64_t bufferSizeBytes,
        //      ReadBitstreamToTreeParams& args)

        let dataPosition = 0;

        let entitiesDataDetails: EntityDataDetails = [];

        while (dataPosition < data.byteLength) {
            const numberOfThreeBitSectionsInStream = this.#numberOfThreeBitSectionsInCode(data, dataPosition, data.byteLength);

            const octalCodeBytes = this.#bytesRequiredForCodeLength(numberOfThreeBitSectionsInStream);
            dataPosition += octalCodeBytes;

            const parsedData = this.#readElementData(data, dataPosition);
            dataPosition += parsedData.bytesRead;

            entitiesDataDetails = [...entitiesDataDetails, ...parsedData.entitiesDataDetails];
        }
        return {
            bytesRead: dataPosition,
            entitiesDataDetails
        };
    }

    #readElementData(data: DataView, position: number): ParsedData {
        // C++  int Octree::readElementData(const OctreeElementPointer& destinationElement, const unsigned char* nodeData,
        //      int bytesAvailable, ReadBitstreamToTreeParams& args) {

        let dataPosition = position;

        // Check space for mask bytes.
        if (data.byteLength - dataPosition < 3) {  // eslint-disable-line @typescript-eslint/no-magic-numbers
            console.error("Not enough meaningful data.");
            return {
                bytesRead: data.byteLength - dataPosition,  // Assume we read the entire buffer.
                entitiesDataDetails: []
            };
        }

        // Skip over reading colorInPacketMask byte and subsequent processing. This byte is always set to 0x00 in
        // EntityTreeSendThread:: traverseTreeAndBuildNextPacketPayload().
        dataPosition += 1;

        // Skip over childrenInTreeMask byte and subsequent processing. This byte is always sent because of the params value
        // passed into EntityTreeSendThread::traverseTreeAndBuildNextPacketPayload(). This value is used in the client for
        // octree management but it is not applicable the Web SDK.
        dataPosition += 1;

        // Skip over childInBufferMask byte and subsequent processing. This byte is always set to 0x00 in
        // EntityTreeSendThread:: traverseTreeAndBuildNextPacketPayload().
        dataPosition += 1;

        const parsedData = this.#readEntityDataFromBuffer(data, dataPosition);
        dataPosition += parsedData.bytesRead;

        return {
            bytesRead: dataPosition - position,
            entitiesDataDetails: parsedData.entitiesDataDetails
        };
    }

    #readEntityDataFromBuffer(data: DataView, pos: number): ParsedData {
        // C++  int EntityTree::readEntityDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //     ReadBitstreamToTreeParams& args)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = pos;

        const textDecoder = new TextDecoder();

        // 2 represents sizeof(numberOfEntities) in the C++ code.
        if (data.byteLength - dataPosition < 2) {
            console.error("Not enough meaningful data");
            return {
                bytesRead: dataPosition - pos,
                entitiesDataDetails: []
            };
        }

        const numberOfEntities = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        if (data.byteLength < numberOfEntities * this.#_MINIMUM_HEADER_BYTES) {
            console.error("Not enough meaningful data");
            return {
                bytesRead: dataPosition - pos,
                entitiesDataDetails: []
            };
        }

        const entitiesDataDetails: EntityDataDetails = [];
        const codec = new ByteCountCoded();

        for (let i = 0; i < numberOfEntities; i++) {
            const entityItemID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 16;

            let encodedData = new DataView(data.buffer, data.byteOffset + dataPosition);
            dataPosition += codec.decode(encodedData, encodedData.byteLength);
            const entityType = codec.data;

            const createdFromBuffer = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 8;

            const lastEdited = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 8;

            encodedData = new DataView(data.buffer, data.byteOffset + dataPosition);
            dataPosition += codec.decode(encodedData, encodedData.byteLength);
            const updateDelta = codec.data;

            encodedData = new DataView(data.buffer, data.byteOffset + dataPosition);
            dataPosition += codec.decode(encodedData, encodedData.byteLength);
            const simulatedDelta = codec.data;

            const propertyFlags = new PropertyFlags();
            const encodedFlags = new DataView(data.buffer, data.byteOffset + dataPosition);
            dataPosition += propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

            let simOwnerData: ArrayBuffer | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SIMULATION_OWNER)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    const buffer = new Uint8Array(length);
                    const view = new DataView(buffer.buffer);

                    for (let j = 0; j < length; j++) {
                        view.setUint8(j, data.getUint8(dataPosition));
                        dataPosition += 1;
                    }
                    simOwnerData = buffer;
                }
            }

            let parentID: Uuid | null | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARENT_ID)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    parentID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                    dataPosition += 16;
                } else {
                    parentID = null;
                }
            }

            let parentJointIndex: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARENT_JOINT_INDEX)) {
                parentJointIndex = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
            }

            let visible: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VISIBLE)) {
                visible = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let name: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_NAME)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    name = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let locked: boolean | undefined = false;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LOCKED)) {
                locked = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let userData: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USER_DATA)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    userData = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let privateUserData: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PRIVATE_USER_DATA)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    privateUserData = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let href: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HREF)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    href = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let description: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DESCRIPTION)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    description = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let position: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_POSITION)) {
                position = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let dimensions: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DIMENSIONS)) {
                dimensions = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let rotation: quat | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ROTATION)) {
                rotation = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
                dataPosition += 8;
            }

            let registrationPoint: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_REGISTRATION_POINT)) {
                registrationPoint = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let created: bigint | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CREATED)) {
                created = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 8;
            }

            let lastEditedBy: Uuid | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LAST_EDITED_BY)) {
                const lastEditedLength = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (lastEditedLength > 0) {
                    lastEditedBy = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                    dataPosition += 16;
                }
            }

            const entityHostType = HostType.DOMAIN;  // Not sent over the wire.

            let queryAACube: AACube | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_QUERY_AA_CUBE)) {
                const corner = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;

                const scale = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;

                queryAACube = new AACube(corner, scale);
            }

            let canCastShadow: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CAN_CAST_SHADOW)) {
                canCastShadow = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let renderLayer: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RENDER_LAYER)) {
                renderLayer = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let primitiveMode: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PRIMITIVE_MODE)) {
                primitiveMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let ignorePickIntersection: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_IGNORE_PICK_INTERSECTION)) {
                ignorePickIntersection = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let renderWithZones: Uuid[] | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RENDER_WITH_ZONES)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    renderWithZones = [];
                    for (let j = 0; j < length; j++) {
                        renderWithZones.push(
                            new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN))
                        );
                        dataPosition += 16;
                    }
                }
            }

            let billboardMode: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BILLBOARD_MODE)) {
                billboardMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let grabbable: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_GRABBABLE)) {
                grabbable = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let grabKinematic: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_KINEMATIC)) {
                grabKinematic = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let grabFollowsController: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_FOLLOWS_CONTROLLER)) {
                grabFollowsController = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let triggerable: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_TRIGGERABLE)) {
                triggerable = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let grabEquippable: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE)) {
                grabEquippable = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let delegateToParent: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_DELEGATE_TO_PARENT)) {
                delegateToParent = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let equippableLeftPositionOffset: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET)) {
                equippableLeftPositionOffset = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let equippableLeftRotationOffset: quat | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET)) {
                equippableLeftRotationOffset
                        = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
                dataPosition += 8;
            }

            let equippableRightPositionOffset: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET)) {
                equippableRightPositionOffset = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let equippableRightRotationOffset: quat | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET)) {
                equippableRightRotationOffset
                        = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
                dataPosition += 8;
            }

            let equippableIndicatorURL: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_URL)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    equippableIndicatorURL = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let equippableIndicatorScale: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE)) {
                equippableIndicatorScale = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let equippableIndicatorOffset: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET)) {
                equippableIndicatorOffset = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let density: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DENSITY)) {
                density = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let velocity: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VELOCITY)) {
                velocity = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let angularVelocity: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANGULAR_VELOCITY)) {
                angularVelocity = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let gravity: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAVITY)) {
                gravity = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let acceleration: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACCELERATION)) {
                acceleration = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let damping: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DAMPING)) {
                damping = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let angularDamping: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANGULAR_DAMPING)) {
                angularDamping = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let restitution: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RESTITUTION)) {
                restitution = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let friction: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FRICTION)) {
                friction = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let lifetime: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIFETIME)) {
                lifetime = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let collisionless: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISIONLESS)) {
                collisionless = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let collisionMask: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISION_MASK)) {
                collisionMask = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
            }

            let dynamic: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DYNAMIC)) {
                dynamic = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let collisionSoundURL: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISION_SOUND_URL)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    collisionSoundURL = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let actionData: ArrayBuffer | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACTION_DATA)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    const buffer = new Uint8Array(length);
                    const view = new DataView(buffer.buffer);
                    for (let j = 0; j < length; j++) {
                        view.setUint8(j, data.getUint8(dataPosition));
                        dataPosition += 1;
                    }
                    actionData = buffer;
                }
            }

            let cloneable: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONEABLE)) {
                cloneable = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let cloneLifetime: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_LIFETIME)) {
                cloneLifetime = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let cloneLimit: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_LIMIT)) {
                cloneLimit = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let cloneDynamic: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_DYNAMIC)) {
                cloneDynamic = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let cloneAvatarIdentity: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_AVATAR_ENTITY)) {
                cloneAvatarIdentity = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let cloneOriginID: Uuid | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_ORIGIN_ID)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    cloneOriginID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                    dataPosition += 16;
                }
            }

            let script: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    script = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let scriptTimestamp: bigint | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT_TIMESTAMP)) {
                scriptTimestamp = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 8;
            }

            let serverScripts: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SERVER_SCRIPTS)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    serverScripts = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemName: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_NAME)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemName = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemDescription: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_DESCRIPTION)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemDescription = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemCategories: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_CATEGORIES)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemCategories = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemArtist: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_ARTIST)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemArtist = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemLicense: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_LICENSE)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemLicense = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let limitedRun: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIMITED_RUN)) {
                limitedRun = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let marketplaceID: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MARKETPLACE_ID)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    marketplaceID = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let editionNumber: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EDITION_NUMBER)) {
                editionNumber = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let entityInstanceNumber: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ENTITY_INSTANCE_NUMBER)) {
                entityInstanceNumber = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let certificateID: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_ID)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    certificateID = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let certificateType: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_TYPE)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    certificateType = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let staticCertificateVersion: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_STATIC_CERTIFICATE_VERSION)) {
                staticCertificateVersion = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }


            // The C++ code uses polymorphism to call the right method. Here we use a switch statement instead.
            // eslint-disable-next-line @typescript-eslint/init-declarations
            let subclassData: EntitySubclassData;
            switch (entityType) {
                case EntityType.Box:
                case EntityType.Sphere:
                case EntityType.Shape:
                    subclassData = ShapeEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Model:
                    subclassData = ModelEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Text:
                    subclassData = TextEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Image:
                    subclassData = ImageEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Web:
                    subclassData = WebEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.ParticleEffect:
                    subclassData = ParticleEffectEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Line:
                    subclassData = LineEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.PolyLine:
                    subclassData = PolyLineEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.PolyVox:
                    subclassData = PolyVoxEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Grid:
                    subclassData = GridEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Gizmo:
                    subclassData = GizmoEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Light:
                    subclassData = LightEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Zone:
                    subclassData = ZoneEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                case EntityType.Material:
                    subclassData = MaterialEntityItem.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                default:
                    // WEBRTC TODO: This line will be unreachable once all entity types are supported.
                    console.error("Entity type not supported: ", entityType);
                    return {
                        bytesRead: dataPosition - pos,
                        entitiesDataDetails: []
                    };
            }

            dataPosition += subclassData.bytesRead;

            // WEBRTC TODO: Unnecessary check once all entity types are supported.
            if (entityType === EntityType.Box
                || entityType === EntityType.Sphere
                || entityType === EntityType.Shape
                || entityType === EntityType.Model
                || entityType === EntityType.Text
                || entityType === EntityType.Image
                || entityType === EntityType.Web
                || entityType === EntityType.ParticleEffect
                || entityType === EntityType.Light
                || entityType === EntityType.Zone
                || entityType === EntityType.Material
            ) {
                entitiesDataDetails.push({
                    entityItemID,
                    entityType,
                    createdFromBuffer,
                    lastEdited,
                    updateDelta,
                    simulatedDelta,
                    simOwnerData,
                    parentID,
                    parentJointIndex,
                    visible,
                    name,
                    locked,
                    userData,
                    privateUserData,
                    href,
                    description,
                    position,
                    dimensions,
                    rotation,
                    registrationPoint,
                    created,
                    lastEditedBy,
                    entityHostType,
                    queryAACube,
                    canCastShadow,
                    renderLayer,
                    primitiveMode,
                    ignorePickIntersection,
                    renderWithZones,
                    billboardMode,
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
                    equippableIndicatorOffset,
                    density,
                    velocity,
                    angularVelocity,
                    gravity,
                    acceleration,
                    damping,
                    angularDamping,
                    restitution,
                    friction,
                    lifetime,
                    collisionless,
                    collisionMask,
                    dynamic,
                    collisionSoundURL,
                    actionData,
                    cloneable,
                    cloneLifetime,
                    cloneLimit,
                    cloneDynamic,
                    cloneAvatarIdentity,
                    cloneOriginID,
                    script,
                    scriptTimestamp,
                    serverScripts,
                    itemName,
                    itemDescription,
                    itemCategories,
                    itemArtist,
                    itemLicense,
                    limitedRun,
                    marketplaceID,
                    editionNumber,
                    entityInstanceNumber,
                    certificateID,
                    certificateType,
                    staticCertificateVersion,
                    ...subclassData.properties
                });
            } else {
                console.log("Entity type not supported:", entityType);
            }
        }

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        return {
            bytesRead: dataPosition - pos,
            entitiesDataDetails
        };
    }

    // Implemented recursively in the C++ code, numberOfThreeBitSectionsInCode is here implemented iteratively.
    #numberOfThreeBitSectionsInCode(data: DataView, dataPosition: number, maxBytes: number): number {
        // C++  int OctalCode::numberOfThreeBitSectionsInCode(const unsigned char* octalCode, int maxBytes)

        if (maxBytes === this.#_OVERFLOWED_OCTCODE_BUFFER) {
            return this.#_OVERFLOWED_OCTCODE_BUFFER;
        }

        let dataPos = dataPosition;

        let curOctalCode = data.getUint8(dataPosition);
        let result = curOctalCode;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        while (curOctalCode === 255) {
            result += curOctalCode;
            dataPos += 1;
            curOctalCode = data.getUint8(dataPos);

            const newMaxBytes = maxBytes === this.#_UNKNOWN_OCTCODE_LENGTH
                ? this.#_UNKNOWN_OCTCODE_LENGTH
                : maxBytes - 1;

            if (newMaxBytes === this.#_OVERFLOWED_OCTCODE_BUFFER) {
                result += this.#_OVERFLOWED_OCTCODE_BUFFER;
                break;
            }
        }
        return result;
    }

    #bytesRequiredForCodeLength(threeBitCodes: number): number { // eslint-disable-line class-methods-use-this
        // C++  size_t OctalCode::bytesRequiredForCodeLength(unsigned char threeBitCodes)

        if (threeBitCodes === 0) {
            return 1;
        }
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 1 + Math.ceil(threeBitCodes * 3 / 8.0);
    }


}();

export default EntityData;
export type { EntityProperties, CommonEntityProperties, EntityDataDetails };
