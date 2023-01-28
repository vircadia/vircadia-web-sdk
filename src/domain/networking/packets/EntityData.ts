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
    updateDelta: bigint,
    simulatedDelta: bigint,
    simOwnerData: ArrayBuffer | undefined;
    // TODO: null UUID as indicated by isNull method in native codebase is simply UUID with value 0n, we should have the same method and eliminate the extraneous null state here
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
    cloneAvatarEntity: boolean | undefined;
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
     *  @property {boolean|undefined} cloneAvatarEntity - <code>true</code> if clones created from this entity will be
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
            const entityType = Number(codec.data);

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

            let cloneAvatarEntity: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_AVATAR_ENTITY)) {
                cloneAvatarEntity = Boolean(data.getUint8(dataPosition));
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
                    cloneAvatarEntity,
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

    encodeEraseEntityMessage(id: Uuid, data: DataView): number {
        // C++  bool EntityItemProperties::encodeEraseEntityMessage(const EntityItemID& entityItemID, QByteArray& buffer)

        if (data.byteLength < 2 + Uuid.NUM_BYTES_RFC4122_UUID)
        {
        console.debug("ERROR - encodeEraseEntityMessage() called with buffer that is too small!");
            return 0;
        }


        let dataPosition = 0;
        data.setUint16(dataPosition, 1, UDT.LITTLE_ENDIAN); // only one id in this message
        dataPosition += 2;

        data.setBigUint128(dataPosition, id.value(), UDT.BIG_ENDIAN);
        dataPosition += Uuid.NUM_BYTES_RFC4122_UUID;

        return dataPosition;
    }

    encodeEntityEditPacket(properties: EntityProperties, data: DataView): number {
        // C++ OctreeElement::AppendState EntityItemProperties::encodeEntityEditPacket(PacketType command, EntityItemID id,
        // const EntityItemProperties& properties, QByteArray& buffer, EntityPropertyFlags requestedProperties,
        // EntityPropertyFlags& didntFitProperties)

        let dataPosition = 0;

        // write root/null octcode
        if (data.byteLength - dataPosition < 1) {
            console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for octcode!");
            return 0;
        }
        data.setUint8(dataPosition, 0);
        dataPosition += 1;

        // Last Edited quint64 always first, before any other details, which allows us easy access to adjusting this
        // timestamp for clock skew
        if (data.byteLength - dataPosition < 8) {
            console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for last edited timestamp!");
            return 0;
        }
        data.setBigUint64(dataPosition, properties.lastEdited, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        // write UUID
        if (data.byteLength - dataPosition < Uuid.NUM_BYTES_RFC4122_UUID) {
            console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity ID!");
            return 0;
        }
        data.setBigUint128(dataPosition, properties.entityItemID.value(), UDT.BIG_ENDIAN);
        dataPosition += Uuid.NUM_BYTES_RFC4122_UUID;

        // write byte count encoded type
        const codec = new ByteCountCoded();
        codec.data = BigInt(properties.entityType);
        let encodedTypeSize = codec.encode(new DataView(data.buffer, data.byteOffset + dataPosition));
        if (data.byteLength - dataPosition < encodedTypeSize) {
            console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for byte count encoded type!");
            return 0;
        }
        dataPosition += encodedTypeSize;

        // write byte count encoded update delta time
        codec.data = BigInt(properties.updateDelta);
        let encodedUpdateDeltaSize = codec.encode(new DataView(data.buffer, data.byteOffset + dataPosition));
        if (data.byteLength - dataPosition < encodedUpdateDeltaSize) {
            console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for byte count encoded update delta time!");
            return 0;
        }
        dataPosition += encodedUpdateDeltaSize;

        const propertyFlags = new PropertyFlags();

        let dataPositionAfterFlags = 0;
        const dataAfterFlags = new DataView(new ArrayBuffer(data.byteLength - dataPosition));

        // encode data after flags separately since flags size depends on the included properties (which also could be only some of the requested properties)
        if (properties.simOwnerData !== undefined) {
            const written = this.#_encodeArrayBuffer(dataPositionAfterFlags, dataAfterFlags, properties.simOwnerData);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for simulation owner data!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SIMULATION_OWNER, true);
            }
        }

        if (properties.parentID !== undefined) {
            const written = this.#_encodeUUID(dataPositionAfterFlags, dataAfterFlags, properties.parentID);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for parent ID!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_PARENT_ID, true);
            }
        }

        if (properties.parentJointIndex !== undefined) {
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < 2) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for parent joint index!");
                return 0;
            }
            dataAfterFlags.setUint16(dataPositionAfterFlags, properties.parentJointIndex, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += 2;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_PARENT_JOINT_INDEX, true);
        }

        if (properties.visible !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity visibility!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.visible ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_VISIBLE, true);
        }

        if (properties.name !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.name);
            dataPositionAfterFlags += written;
            if (written === 0) {
                // TODO: add to a didntFitProperties object and continue instead of reporting an error
                // similarly for other optional properties
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity name!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_NAME, true);
            }
        }

        if (properties.locked !== undefined) {
            const totalSize = 0;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity locked state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.locked ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_LOCKED, true);
        }

        if (properties.userData !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.userData);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for user data!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_USER_DATA, true);
            }
        }

        if (properties.privateUserData !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.privateUserData);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for private user data!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_PRIVATE_USER_DATA, true);
            }
        }

        if (properties.href !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.href);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for href!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HREF, true);
            }
        }

        if (properties.description !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.description);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity description!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_DESCRIPTION, true);
            }
        }

        if (properties.position !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.position);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity position!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_POSITION, true);
            }
        }

        if (properties.dimensions !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.dimensions);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity position!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_DIMENSIONS, true);
            }
        }

        if (properties.rotation) {
            const totalSize = 8;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity rotation!");
                return 0;
            }
            GLMHelpers.packOrientationQuatToBytes(dataAfterFlags, dataPositionAfterFlags, properties.rotation);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ROTATION, true);
        }

        if (properties.registrationPoint !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.registrationPoint);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity position!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_REGISTRATION_POINT, true);
            }
        }

        if (properties.created) {
            const totalSize = 8;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity created timestamp!");
                return 0;
            }
            dataAfterFlags.setBigUint64(dataPositionAfterFlags, properties.created, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CREATED, true);
        }

        if (properties.lastEditedBy) {
            const written = this.#_encodeUUID(dataPositionAfterFlags, dataAfterFlags, properties.lastEditedBy);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for last editor ID!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_LAST_EDITED_BY, true);
            }
        }

        if (properties.queryAACube) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.queryAACube.corner);
            dataPositionAfterFlags += written;

            const scaleSize = 4;
            if (written === 0 || dataAfterFlags.byteLength - dataPositionAfterFlags < scaleSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for query axis aligned cube!");
                return 0;
            } else {
                dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.queryAACube.scale, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += scaleSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_QUERY_AA_CUBE, true);
            }
        }

        if (properties.canCastShadow !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity shadow casting state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.canCastShadow ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CAN_CAST_SHADOW, true);
        }

        if (properties.renderLayer !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for render layer!");
                return 0;
            }
            dataAfterFlags.setUint32(dataPositionAfterFlags, properties.renderLayer, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_RENDER_LAYER, true);
        }

        if (properties.primitiveMode !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for primitive mode!");
                return 0;
            }
            dataAfterFlags.setUint32(dataPositionAfterFlags, properties.primitiveMode, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_PRIMITIVE_MODE, true);
        }

        if (properties.ignorePickIntersection !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity pick intersection ignore state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.ignorePickIntersection ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_IGNORE_PICK_INTERSECTION, true);
        }

        if (properties.renderWithZones !== undefined) {
            const lengthSize = 2;
            const totalSize = lengthSize + properties.renderWithZones.length * Uuid.NUM_BYTES_RFC4122_UUID;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for render zone IDs!");
                return 0;
            }

            dataAfterFlags.setUint16(dataPositionAfterFlags, properties.renderWithZones.length, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += lengthSize;

            for (var id of properties.renderWithZones) {
                dataPositionAfterFlags += this.#_encodeUUID(dataPositionAfterFlags, dataAfterFlags, id);
            }

            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_RENDER_WITH_ZONES, true);
        }

        if (properties.billboardMode !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for billboard mode!");
                return 0;
            }
            dataAfterFlags.setUint32(dataPositionAfterFlags, properties.billboardMode, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BILLBOARD_MODE, true);
        }

        if (properties.grabbable !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity grabbable state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.grabbable ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_GRABBABLE, true);
        }

        if (properties.grabKinematic !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity grab kinematic state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.grabKinematic ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_KINEMATIC, true);
        }

        if (properties.grabFollowsController !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity grab controller following state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.grabFollowsController ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_FOLLOWS_CONTROLLER, true);
        }

        if (properties.triggerable !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity triggerable state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.triggerable ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_TRIGGERABLE, true);
        }

        if (properties.grabEquippable !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity grab equippable state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.grabEquippable ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE, true);
        }

        if (properties.delegateToParent !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity grab equippable state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.delegateToParent ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_DELEGATE_TO_PARENT, true);
        }

        if (properties.equippableLeftPositionOffset !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.equippableLeftPositionOffset);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity equippable left position offset!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET, true);
            }
        }

        if (properties.equippableLeftRotationOffset) {
            const totalSize = 8;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity equippable left rotation offset!");
                return 0;
            }
            GLMHelpers.packOrientationQuatToBytes(dataAfterFlags, dataPositionAfterFlags, properties.equippableLeftRotationOffset);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET, true);
        }

        if (properties.equippableRightPositionOffset !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.equippableRightPositionOffset);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity equippable right position offset!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET, true);
            }
        }

        if (properties.equippableRightRotationOffset) {
            const totalSize = 8;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity equippable right rotation offset!");
                return 0;
            }
            GLMHelpers.packOrientationQuatToBytes(dataAfterFlags, dataPositionAfterFlags, properties.equippableRightRotationOffset);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET, true);
        }

        if (properties.equippableIndicatorURL !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.equippableIndicatorURL);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for equippable indicator URL!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_URL, true);
            }
        }

        if (properties.equippableIndicatorScale !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.equippableIndicatorScale);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity equippable indicator scale!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE, true);
            }
        }

        if (properties.equippableIndicatorOffset !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.equippableIndicatorOffset);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity equippable indicator offset!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET, true);
            }
        }

        if (properties.density !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for density!");
                return 0;
            }
            dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.density, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_DENSITY, true);
        }

        if (properties.angularVelocity !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.angularVelocity);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for angular velocity!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANGULAR_VELOCITY, true);
            }
        }

        if (properties.gravity !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.gravity);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for gravity!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GRAVITY, true);
            }
        }

        if (properties.acceleration !== undefined) {
            const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, properties.acceleration);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for acceleration!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ACCELERATION, true);
            }
        }

        if (properties.damping !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for damping!");
                return 0;
            }
            dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.damping, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_DAMPING, true);
        }

        if (properties.angularDamping !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for angular damping!");
                return 0;
            }
            dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.angularDamping, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANGULAR_DAMPING, true);
        }

        if (properties.restitution !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for restitution!");
                return 0;
            }
            dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.restitution, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_RESTITUTION, true);
        }

        if (properties.friction !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for friction!");
                return 0;
            }
            dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.friction, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_FRICTION, true);
        }

        if (properties.lifetime !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for lifetime!");
                return 0;
            }
            dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.lifetime, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_LIFETIME, true);
        }

        if (properties.collisionless !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for collisionless state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.collisionless ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLLISIONLESS, true);
        }

        if (properties.collisionMask !== undefined) {
            const totalSize = 2;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for collision mask!");
                return 0;
            }
            dataAfterFlags.setUint16(dataPositionAfterFlags, properties.collisionMask, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLLISION_MASK, true);
        }

        if (properties.dynamic !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for dynamic state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.dynamic ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_DYNAMIC, true);
        }

        if (properties.collisionSoundURL !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.collisionSoundURL);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for collision sound URL!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLLISION_SOUND_URL, true);
            }
        }

        if (properties.actionData !== undefined) {
            const written = this.#_encodeArrayBuffer(dataPositionAfterFlags, dataAfterFlags, properties.actionData);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for action data!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ACTION_DATA, true);
            }
        }

        if (properties.cloneable !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for cloneable state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.cloneable ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CLONEABLE, true);
        }

        if (properties.cloneLifetime !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for clone lifetime!");
                return 0;
            }
            dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.cloneLifetime, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CLONE_LIFETIME, true);
        }

        if (properties.cloneLimit !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for clone limit!");
                return 0;
            }
            dataAfterFlags.setFloat32(dataPositionAfterFlags, properties.cloneLimit, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CLONE_LIMIT, true);
        }

        if (properties.cloneDynamic !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for clone dynamic state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.cloneDynamic ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CLONE_DYNAMIC, true);
        }

        if (properties.cloneAvatarEntity !== undefined) {
            const totalSize = 1;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for clone avatar identity state!");
                return 0;
            }
            dataAfterFlags.setUint8(dataPositionAfterFlags, properties.cloneAvatarEntity ? 1 : 0);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CLONE_AVATAR_ENTITY, true);
        }

        if (properties.cloneOriginID !== undefined) {
            const written = this.#_encodeUUID(dataPositionAfterFlags, dataAfterFlags, properties.cloneOriginID);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for clone origin ID!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CLONE_ORIGIN_ID, true);
            }
        }

        if (properties.script !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.script);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity script!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SCRIPT, true);
            }
        }

        if (properties.scriptTimestamp) {
            const totalSize = 8;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity script timestamp!");
                return 0;
            }
            dataAfterFlags.setBigUint64(dataPositionAfterFlags, properties.scriptTimestamp, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SCRIPT_TIMESTAMP, true);
        }

        if (properties.serverScripts !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.serverScripts);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity server scripts!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SERVER_SCRIPTS, true);
            }
        }

        if (properties.itemName !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.itemName);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for item name!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ITEM_NAME, true);
            }
        }

        if (properties.itemDescription !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.itemDescription);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for item description!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ITEM_DESCRIPTION, true);
            }
        }

        if (properties.itemCategories !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.itemCategories);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for item categories!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ITEM_CATEGORIES, true);
            }
        }

        if (properties.itemArtist !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.itemArtist);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for item artist!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ITEM_ARTIST, true);
            }
        }

        if (properties.itemLicense !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.itemLicense);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for item license!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ITEM_LICENSE, true);
            }
        }

        if (properties.limitedRun !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for limited run number!");
                return 0;
            }
            dataAfterFlags.setUint32(dataPositionAfterFlags, properties.limitedRun, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_LIMITED_RUN, true);
        }

        if (properties.marketplaceID !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.marketplaceID);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for marketplaceID!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_MARKETPLACE_ID, true);
            }
        }

        if (properties.editionNumber !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for edition number!");
                return 0;
            }
            dataAfterFlags.setUint32(dataPositionAfterFlags, properties.editionNumber, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EDITION_NUMBER, true);
        }

        if (properties.entityInstanceNumber !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity instance number!");
                return 0;
            }
            dataAfterFlags.setUint32(dataPositionAfterFlags, properties.entityInstanceNumber, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ENTITY_INSTANCE_NUMBER, true);
        }

        if (properties.certificateID !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.certificateID);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for certificate ID!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_ID, true);
            }
        }

        if (properties.certificateType !== undefined) {
            const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, properties.certificateType);
            dataPositionAfterFlags += written;
            if (written === 0) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for certificate type!");
                return 0;
            } else {
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_TYPE, true);
            }
        }

        if (properties.staticCertificateVersion !== undefined) {
            const totalSize = 4;
            if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for static certificate version!");
                return 0;
            }
            dataAfterFlags.setUint32(dataPositionAfterFlags, properties.staticCertificateVersion, UDT.LITTLE_ENDIAN);
            dataPositionAfterFlags += totalSize;
            propertyFlags.setHasProperty(EntityPropertyFlags.PROP_STATIC_CERTIFICATE_VERSION, true);
        }

        // particle effect properties
        if (properties.entityType === EntityType.ParticleEffect)
        {
            const particleEffectProperties = properties as ParticleEffectEntityProperties;

            if (particleEffectProperties.shapeType !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect shape type!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, particleEffectProperties.shapeType, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE, true);
            }

            if (particleEffectProperties.compoundShapeURL !== undefined)
            {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, particleEffectProperties.compoundShapeURL);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect compound shape URL!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL, true);
                }
            }

            if (particleEffectProperties.color !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, particleEffectProperties.color.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, particleEffectProperties.color.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, particleEffectProperties.color.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLOR, true);
            }

            if (particleEffectProperties.alpha !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect alpha!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.alpha, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ALPHA, true);
            }

            if (particleEffectProperties.textures !== undefined) {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, particleEffectProperties.textures);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect textures!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_TEXTURES, true);
                }
            }

            if (particleEffectProperties.maxParticles !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect max particles!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, particleEffectProperties.maxParticles, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_MAX_PARTICLES, true);
            }

            if (particleEffectProperties.lifespan !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect lifespan!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.lifespan, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_LIFESPAN, true);
            }

            if (particleEffectProperties.isEmitting !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emitting state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, particleEffectProperties.isEmitting ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EMITTING_PARTICLES, true);
            }

            if (particleEffectProperties.emitRate !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emit rate!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.emitRate, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EMIT_RATE, true);
            }

            if (particleEffectProperties.emitSpeed !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emit speed!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.emitSpeed, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EMIT_SPEED, true);
            }

            if (particleEffectProperties.speedSpread !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emit speed spread!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.speedSpread, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SPEED_SPREAD, true);
            }

            if (particleEffectProperties.emitOrientation) {
                const totalSize = 8;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emit orientation!");
                    return 0;
                }
                GLMHelpers.packOrientationQuatToBytes(dataAfterFlags, dataPositionAfterFlags, particleEffectProperties.emitOrientation);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EMIT_ORIENTATION, true);
            }

            if (particleEffectProperties.emitDimensions !== undefined) {
                const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, particleEffectProperties.emitDimensions);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emit dimensions!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EMIT_DIMENSIONS, true);
                }
            }

            if (particleEffectProperties.emitRadiusStart !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emit radius start!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.emitRadiusStart, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EMIT_RADIUS_START, true);
            }

            if (particleEffectProperties.polarStart !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect polar start!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.polarStart, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_POLAR_START, true);
            }

            if (particleEffectProperties.polarFinish !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect polar finish!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.polarFinish, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_POLAR_FINISH, true);
            }

            if (particleEffectProperties.azimuthStart !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect azimuth start!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.azimuthStart, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_AZIMUTH_START, true);
            }

            if (particleEffectProperties.azimuthFinish !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect azimuth finish!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.azimuthFinish, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_AZIMUTH_FINISH, true);
            }

            if (particleEffectProperties.emitAcceleration !== undefined) {
                const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, particleEffectProperties.emitAcceleration);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emit acceleration!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EMIT_ACCELERATION, true);
                }
            }

            if (particleEffectProperties.accelerationSpread !== undefined) {
                const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, particleEffectProperties.accelerationSpread);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emit acceleration spread!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ACCELERATION_SPREAD, true);
                }
            }

            if (particleEffectProperties.particleRadius !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect particle radius!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.particleRadius, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_PARTICLE_RADIUS, true);
            }

            if (particleEffectProperties.radiusSpread !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect radius spread!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.radiusSpread, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_RADIUS_SPREAD, true);
            }

            if (particleEffectProperties.radiusStart !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect radius start!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.radiusStart, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_RADIUS_START, true);
            }

            if (particleEffectProperties.radiusFinish !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect radius finish!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.radiusFinish, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_RADIUS_FINISH, true);
            }

            if (particleEffectProperties.colorSpread !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect color spread!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, particleEffectProperties.colorSpread.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, particleEffectProperties.colorSpread.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, particleEffectProperties.colorSpread.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLOR_SPREAD, true);
            }

            if (particleEffectProperties.colorStart !== undefined) {
                const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, particleEffectProperties.colorStart);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect color start!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLOR_START, true);
                }
            }

            if (particleEffectProperties.colorFinish !== undefined) {
                const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, particleEffectProperties.colorFinish);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect color finish!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLOR_FINISH, true);
                }
            }

            if (particleEffectProperties.alphaSpread !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect alpha spread!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.alphaSpread, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ALPHA_SPREAD, true);
            }

            if (particleEffectProperties.alphaStart !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect alpha start!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.alphaStart, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ALPHA_START, true);
            }

            if (particleEffectProperties.alphaFinish !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect alpha finish!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.alphaFinish, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ALPHA_FINISH, true);
            }

            if (particleEffectProperties.emitterShouldTrail !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect emitter trailing state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, particleEffectProperties.emitterShouldTrail ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EMITTER_SHOULD_TRAIL, true);
            }

            if (particleEffectProperties.particleSpin !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect particle spin!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.particleSpin, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_PARTICLE_SPIN, true);
            }

            if (particleEffectProperties.spinSpread !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect spin spread!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.spinSpread, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SPIN_SPREAD, true);
            }

            if (particleEffectProperties.spinStart !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect spin start!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.spinStart, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SPIN_START, true);
            }

            if (particleEffectProperties.spinFinish !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect spin finish!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, particleEffectProperties.spinFinish, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SPIN_FINISH, true);
            }

            if (particleEffectProperties.rotateWithEntity !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for particle effect particle rotating with entity state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, particleEffectProperties.rotateWithEntity ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_PARTICLE_ROTATE_WITH_ENTITY, true);
            }
        }

        // model properties
        if (properties.entityType === EntityType.Model) {
            const modelProperties = properties as ModelEntityProperties;

            if (modelProperties.shapeType !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model shape type!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, modelProperties.shapeType, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE, true);
            }

            if (modelProperties.compoundShapeURL !== undefined)
            {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, modelProperties.compoundShapeURL);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model compound shape URL!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL, true);
                }
            }

            if (modelProperties.color !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, modelProperties.color.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, modelProperties.color.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, modelProperties.color.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLOR, true);
            }

            if (modelProperties.textures !== undefined) {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, modelProperties.textures);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model textures!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_TEXTURES, true);
                }
            }

            if (modelProperties.modelURL !== undefined) {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, modelProperties.modelURL);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model URL!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_MODEL_URL, true);
                }
            }

            if (modelProperties.modelScale !== undefined) {
                const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, modelProperties.modelScale);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model scale!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_MODEL_SCALE, true);
                }
            }

            if (modelProperties.jointRotationsSet !== undefined) {
                const written = this.#_encodeBits(dataPositionAfterFlags, dataAfterFlags, modelProperties.jointRotationsSet);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model joint rotation set!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS_SET, true);
                }
            }

            if (modelProperties.jointRotations !== undefined) {
                const written = this.#_encodeQuats(dataPositionAfterFlags, dataAfterFlags, modelProperties.jointRotations);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model joint rotations!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS, true);
                }
            }

            if (modelProperties.jointTranslationsSet !== undefined) {
                const written = this.#_encodeBits(dataPositionAfterFlags, dataAfterFlags, modelProperties.jointTranslationsSet);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model joint translation set!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS_SET, true);
                }
            }

            if (modelProperties.jointTranslations !== undefined) {
                const written = this.#_encodeVec3s(dataPositionAfterFlags, dataAfterFlags, modelProperties.jointTranslations);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model joint translations!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS, true);
                }
            }

            if (modelProperties.relayParentJoints !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model particle patent joint relaying state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, modelProperties.relayParentJoints ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_RELAY_PARENT_JOINTS, true);
            }

            if (modelProperties.groupCulled !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model group culling state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, modelProperties.groupCulled ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GROUP_CULLED, true);
            }

            if (modelProperties.blendShapeCoefficients !== undefined) {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, modelProperties.blendShapeCoefficients);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model blendShape coefficients!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BLENDSHAPE_COEFFICIENTS, true);
                }
            }

            if (modelProperties.useOriginalPivot !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model use original pivot state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, modelProperties.useOriginalPivot ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_USE_ORIGINAL_PIVOT, true);
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationURL !== undefined) {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, modelProperties.animation.animationURL);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation URL!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_URL, true);
                }
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationAllowTranslation !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation allow translation state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, modelProperties.animation.animationAllowTranslation ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_ALLOW_TRANSLATION, true);
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationFPS !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation FPS!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, modelProperties.animation.animationFPS, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_FPS, true);
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationFrameIndex !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation frame index!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, modelProperties.animation.animationFrameIndex, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_FRAME_INDEX, true);
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationPlaying !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation playing state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, modelProperties.animation.animationPlaying ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_PLAYING, true);
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationLoop !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation looping state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, modelProperties.animation.animationLoop ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_LOOP, true);
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationFirstFrame !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation first frame!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, modelProperties.animation.animationFirstFrame, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_FIRST_FRAME, true);
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationLastFrame !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation last frame!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, modelProperties.animation.animationLastFrame, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_LAST_FRAME, true);
            }

            if (modelProperties.animation !== undefined && modelProperties.animation.animationHold !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for model animation hold state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, modelProperties.animation.animationHold ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ANIMATION_HOLD, true);
            }

        }

        // light properties
        if (properties.entityType === EntityType.Light) {
            const lightProperties = properties as LightEntityProperties;

            if (lightProperties.color !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for light color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, lightProperties.color.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, lightProperties.color.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, lightProperties.color.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLOR, true);
            }

            if (lightProperties.isSpotlight !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for light spotlight state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, lightProperties.isSpotlight ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_IS_SPOTLIGHT, true);
            }

            if (lightProperties.intensity !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for light intensity!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, lightProperties.intensity, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_INTENSITY, true);
            }

            if (lightProperties.exponent !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for light exponent!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, lightProperties.exponent, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_EXPONENT, true);
            }

            if (lightProperties.cutoff !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for light cutoff!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, lightProperties.cutoff, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_CUTOFF, true);
            }

            if (lightProperties.falloffRadius !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for light falloff radius!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, lightProperties.falloffRadius, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_FALLOFF_RADIUS, true);
            }

        }

        // text properties
        if (properties.entityType === EntityType.Text) {
            const textProperties = properties as TextEntityProperties;

            if (textProperties.text !== undefined) {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, textProperties.text);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text string!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_TEXT, true);
                }
            }

            if (textProperties.lineHeight !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text line height!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, textProperties.lineHeight, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_LINE_HEIGHT, true);
            }

            if (textProperties.textColor !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, textProperties.textColor.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, textProperties.textColor.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, textProperties.textColor.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_TEXT_COLOR, true);
            }

            if (textProperties.textAlpha !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text alpha!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, textProperties.textAlpha, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_LINE_HEIGHT, true);
            }

            if (textProperties.backgroundColor !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text background color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, textProperties.backgroundColor.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, textProperties.backgroundColor.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, textProperties.backgroundColor.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BACKGROUND_COLOR, true);
            }

            if (textProperties.backgroundAlpha !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text background alpha!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, textProperties.backgroundAlpha, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BACKGROUND_ALPHA, true);
            }

            if (textProperties.leftMargin !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text left margin!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, textProperties.leftMargin, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_LEFT_MARGIN, true);
            }

            if (textProperties.rightMargin !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text right margin!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, textProperties.rightMargin, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_RIGHT_MARGIN, true);
            }

            if (textProperties.topMargin !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text top margin!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, textProperties.topMargin, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_TOP_MARGIN, true);
            }

            if (textProperties.bottomMargin !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text bottom margin!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, textProperties.bottomMargin, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BOTTOM_MARGIN, true);
            }

            if (textProperties.unlit !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text unlit state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, textProperties.unlit ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_UNLIT, true);
            }

            if (textProperties.font !== undefined) {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, textProperties.font);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text font!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_FONT, true);
                }
            }

            if (textProperties.textEffect !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text effect!");
                    return 0;
                }
                const value = textProperties.textEffect == "none" ? 0 :
                    textProperties.textEffect == "outline" ? 1 :
                    textProperties.textEffect == "outline fill" ? 2 :
                    textProperties.textEffect == "shadow" ? 3 :
                    0;
                dataAfterFlags.setUint32(dataPositionAfterFlags, value, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE, true);
            }

            if (textProperties.textEffectColor !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text effect color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, textProperties.textEffectColor.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, textProperties.textEffectColor.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, textProperties.textEffectColor.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_TEXT_EFFECT_COLOR, true);
            }

            if (textProperties.textEffectThickness !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text effect thickness!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, textProperties.textEffectThickness, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_TEXT_EFFECT_THICKNESS, true);
            }

            if (textProperties.textAlignment !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for text alignment!");
                    return 0;
                }
                const value = textProperties.textAlignment == "left" ? 0 :
                    textProperties.textAlignment == "center" ? 1 :
                    textProperties.textAlignment == "right" ? 2 :
                    0;
                dataAfterFlags.setUint32(dataPositionAfterFlags, value, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_TEXT_ALIGNMENT, true);
            }

        }

        // zone properties
        if (properties.entityType === EntityType.Zone) {
            const zoneProperties = properties as ZoneEntityProperties;

            if (zoneProperties.shapeType !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone shape type!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, zoneProperties.shapeType, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE, true);
            }

            if (zoneProperties.compoundShapeURL !== undefined)
            {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, zoneProperties.compoundShapeURL);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone compound shape URL!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL, true);
                }
            }

            if (zoneProperties.keyLight !== undefined && zoneProperties.keyLight.color !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone keylight color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.keyLight.color.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, zoneProperties.keyLight.color.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, zoneProperties.keyLight.color.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_COLOR, true);
            }

            if (zoneProperties.keyLight !== undefined && zoneProperties.keyLight.intensity !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone keylight intensity!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.keyLight.intensity, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_INTENSITY, true);
            }

            if (zoneProperties.keyLight !== undefined && zoneProperties.keyLight.direction !== undefined) {
                const written = this.#_encodeVec3(dataPositionAfterFlags, dataAfterFlags, zoneProperties.keyLight.direction);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone keylight direction!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_DIRECTION, true);
                }
            }

            if (zoneProperties.keyLight !== undefined && zoneProperties.keyLight.castShadows !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone keylight shadow casting state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.keyLight.castShadows ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_CAST_SHADOW, true);
            }

            if (zoneProperties.keyLight !== undefined && zoneProperties.keyLight.shadowBias !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone keylight shadow bias!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.keyLight.shadowBias, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_SHADOW_BIAS, true);
            }

            if (zoneProperties.keyLight !== undefined && zoneProperties.keyLight.shadowMaxDistance !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone keylight shadow max distance!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.keyLight.shadowMaxDistance, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_KEYLIGHT_SHADOW_MAX_DISTANCE, true);
            }

            if (zoneProperties.ambientLight !== undefined && zoneProperties.ambientLight.intensity !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone ambient light intensity!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.ambientLight.intensity, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_INTENSITY, true);
            }

            if (zoneProperties.ambientLight !== undefined && zoneProperties.ambientLight.url !== undefined)
            {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, zoneProperties.ambientLight.url);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone ambient light URL!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_URL, true);
                }
            }

            if (zoneProperties.skybox !== undefined && zoneProperties.skybox.color !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone skybox color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.skybox.color.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, zoneProperties.skybox.color.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, zoneProperties.skybox.color.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SKYBOX_COLOR, true);
            }

            if (zoneProperties.skybox !== undefined && zoneProperties.skybox.url !== undefined)
            {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, zoneProperties.skybox.url);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone skybox URL!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SKYBOX_URL, true);
                }
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.range !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze range!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.haze.range, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_RANGE, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.color !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.haze.color.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, zoneProperties.haze.color.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, zoneProperties.haze.color.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_COLOR, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.glareColor !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze glare color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.haze.glareColor.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, zoneProperties.haze.glareColor.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, zoneProperties.haze.glareColor.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_GLARE_COLOR, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.enableGlare !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze enable glare state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.haze.enableGlare ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_ENABLE_GLARE, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.glareAngle !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze glare angle!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.haze.glareAngle, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_GLARE_ANGLE, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.altitudeEffect !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze altitude effect state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.haze.altitudeEffect ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_ALTITUDE_EFFECT, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.ceiling !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze ceiling!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.haze.ceiling, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_CEILING, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.base !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze base!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.haze.base, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_BASE_REF, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.backgroundBlend !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze background blend!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.haze.backgroundBlend, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_BACKGROUND_BLEND, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.attenuateKeyLight !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze keylight attenuation state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.haze.attenuateKeyLight ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_ATTENUATE_KEYLIGHT, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.keyLightRange !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze keylight range!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.haze.keyLightRange, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_KEYLIGHT_RANGE, true);
            }

            if (zoneProperties.haze !== undefined && zoneProperties.haze.keyLightAltitude !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze keylight altitude!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.haze.keyLightAltitude, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_KEYLIGHT_ALTITUDE, true);
            }

            if (zoneProperties.bloom !== undefined && zoneProperties.bloom.intensity !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone bloom intensity!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.bloom.intensity, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BLOOM_INTENSITY, true);
            }

            if (zoneProperties.bloom !== undefined && zoneProperties.bloom.threshold !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone bloom threshold!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.bloom.threshold, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BLOOM_THRESHOLD, true);
            }

            if (zoneProperties.bloom !== undefined && zoneProperties.bloom.size !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone bloom size!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, zoneProperties.bloom.size, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BLOOM_SIZE, true);
            }

            if (zoneProperties.flyingAllowed !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone flying allowed state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.flyingAllowed ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_FLYING_ALLOWED, true);
            }

            if (zoneProperties.ghostingAllowed !== undefined) {
                const totalSize = 1;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone ghosting allowed state!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, zoneProperties.ghostingAllowed ? 1 : 0);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_GHOSTING_ALLOWED, true);
            }

            if (zoneProperties.filterURL !== undefined)
            {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, zoneProperties.filterURL);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone filter URL!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_FILTER_URL, true);
                }
            }

            if (zoneProperties.keyLightMode !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone keylight mode!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, zoneProperties.keyLightMode, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_KEY_LIGHT_MODE, true);
            }

            if (zoneProperties.ambientLightMode !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone ambient light mode!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, zoneProperties.ambientLightMode, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_MODE, true);
            }

            if (zoneProperties.skyboxMode !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone skybox mode!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, zoneProperties.skyboxMode, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SKYBOX_MODE, true);
            }

            if (zoneProperties.hazeMode !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone haze mode!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, zoneProperties.hazeMode, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_HAZE_MODE, true);
            }

            if (zoneProperties.bloomMode !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone bloom mode!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, zoneProperties.bloomMode, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_BLOOM_MODE, true);
            }

            if (zoneProperties.avatarPriority !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone avatar priority!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, zoneProperties.avatarPriority, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_AVATAR_PRIORITY, true);
            }

            if (zoneProperties.screenshare !== undefined)
            {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for zone screenshare!");
                    return 0;
                }
                dataAfterFlags.setUint32(dataPositionAfterFlags, zoneProperties.screenshare, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SCREENSHARE, true);
            }

        }

        // shape properties
        if (properties.entityType === EntityType.Box ||
           properties.entityType === EntityType.Sphere ||
           properties.entityType === EntityType.Shape)
        {
            const shapeProperties = properties as ShapeEntityProperties;

            if (shapeProperties.color !== undefined) {
                const totalSize = 3;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for shape color!");
                    return 0;
                }
                dataAfterFlags.setUint8(dataPositionAfterFlags, shapeProperties.color.red);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 1, shapeProperties.color.green);
                dataAfterFlags.setUint8(dataPositionAfterFlags + 2, shapeProperties.color.blue);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_COLOR, true);
            }

            if (shapeProperties.alpha !== undefined) {
                const totalSize = 4;
                if (dataAfterFlags.byteLength - dataPositionAfterFlags < totalSize) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for shape alpha!");
                    return 0;
                }
                dataAfterFlags.setFloat32(dataPositionAfterFlags, shapeProperties.alpha, UDT.LITTLE_ENDIAN);
                dataPositionAfterFlags += totalSize;
                propertyFlags.setHasProperty(EntityPropertyFlags.PROP_ALPHA, true);
            }

            if (shapeProperties.shape !== undefined) {
                const written = this.#_encodeString(dataPositionAfterFlags, dataAfterFlags, shapeProperties.shape);
                dataPositionAfterFlags += written;
                if (written === 0) {
                    console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for entity shape!");
                    return 0;
                } else {
                    propertyFlags.setHasProperty(EntityPropertyFlags.PROP_SHAPE, true);
                }
            }

        }

        // write property flags followed by the property data

        const propertyFlagsSize = propertyFlags.encode(new DataView(data.buffer, data.byteOffset + dataPosition));
        if (data.byteLength - (dataPosition + dataPositionAfterFlags) < propertyFlagsSize) {
            console.debug("ERROR - encodeEntityEditPacket() called with buffer that is too small for byte count encoded property flags!");
            return 0;
        }
        console.log(propertyFlags);
        dataPosition += propertyFlagsSize;

        const uint8Data = new Uint8Array(data.buffer, data.byteOffset + dataPosition);
        const uint8DataAfterFlags = new Uint8Array(dataAfterFlags.buffer, dataAfterFlags.byteOffset, dataPositionAfterFlags);
        uint8Data.set(uint8DataAfterFlags);
        dataPosition += dataPositionAfterFlags;

        return dataPosition;
    }

    #_encodeString(dataPosition: number, data: DataView, value: string): number {
        const textEncoder = new TextEncoder();
        const encoded = textEncoder.encode(value);
        const totalSize = 2 + encoded.byteLength;
        if (data.byteLength - dataPosition < totalSize) {
            return 0;
        }
        data.setUint16(dataPosition, encoded.byteLength, UDT.LITTLE_ENDIAN);
        const uint8Data = new Uint8Array(data.buffer, data.byteOffset + dataPosition + 2);
        uint8Data.set(encoded);
        return totalSize;
    }

    #_encodeVec3(dataPosition: number, data: DataView, value: vec3): number {
        const totalSize = 12;
        if (data.byteLength - dataPosition < totalSize) {
            return 0;
        }
        data.setFloat32(dataPosition, value.x, UDT.LITTLE_ENDIAN);
        data.setFloat32(dataPosition + 4, value.y, UDT.LITTLE_ENDIAN);
        data.setFloat32(dataPosition + 8, value.z, UDT.LITTLE_ENDIAN);
        return totalSize;
    }

    #_encodeUUID(dataPosition: number, data: DataView, id: Uuid | null): number {
        const isNull = id === null || id.value() == 0n;
        const idSize = isNull ? 0 : Uuid.NUM_BYTES_RFC4122_UUID;
        const totalSize = 2 + idSize;
        if (data.byteLength - dataPosition < totalSize) {
            return 0;
        }

        data.setUint16(dataPosition, idSize, UDT.LITTLE_ENDIAN);
        if (!isNull && id !== null) {
            data.setBigUint128(dataPosition + 2, id.value(), UDT.BIG_ENDIAN);
        }

        return totalSize;
    }

    #_encodeArrayBuffer(dataPosition: number, data: DataView, buffer: ArrayBuffer): number {
        const lengthSize = 2;
        const totalSize = lengthSize + buffer.byteLength;
        if (data.byteLength - dataPosition < totalSize) {
            return 0;
        }
        data.setUint16(dataPosition, buffer.byteLength, UDT.LITTLE_ENDIAN);
        const uint8Data = new Uint8Array(data.buffer, data.byteOffset + dataPosition + lengthSize);
        uint8Data.set(new Uint8Array(buffer));
        return totalSize;
    }

    #_encodeBits(dataPosition: number, data: DataView, bits: boolean[]): number {
        const BITS_PER_BYTE = 8;
        const byteSize = Math.ceil(bits.length / BITS_PER_BYTE);
        const lengthSize = 2;
        const totalSize = lengthSize + byteSize;
        if (data.byteLength - dataPosition < totalSize) {
            return 0;
        }
        data.setUint16(dataPosition, bits.length, UDT.LITTLE_ENDIAN);
        for (let i = 0; i < bits.length;  ++i) {
            const byteOffset = Math.floor(i / BITS_PER_BYTE) + dataPosition + lengthSize;
            const bitOffset = i % BITS_PER_BYTE;
            let byte = data.getUint8(byteOffset);
            if (bits[i]) {
                byte |= 1 << bitOffset;
            } else {
                byte &= ~(1 << bitOffset);
            }
            data.setUint8(byteOffset, byte);
        }
        return totalSize;
    }

    #_encodeQuats(dataPosition: number, data: DataView, quats: quat[]): number {
        const byteSize = quats.length * 8;
        const lengthSize = 2;
        const totalSize = lengthSize + byteSize;
        if (data.byteLength - dataPosition < totalSize) {
            return 0;
        }
        data.setUint16(dataPosition, quats.length, UDT.LITTLE_ENDIAN);
        for (let i = 0; i < quats.length;  ++i) {
            GLMHelpers.packOrientationQuatToBytes(data, dataPosition + lengthSize + (i * 8),
                quats[i] ?? {x: 0, y: 0, z: 0, w: 0});
        }
        return totalSize;
    }

    #_encodeVec3s(dataPosition: number, data: DataView, vec3s: vec3[]): number {
        const byteSize = vec3s.length * 12;
        const lengthSize = 2;
        const totalSize = lengthSize + byteSize;
        if (data.byteLength - dataPosition < totalSize) {
            return 0;
        }
        data.setUint16(dataPosition, vec3s.length, UDT.LITTLE_ENDIAN);
        for (let i = 0; i < vec3s.length;  ++i) {
            this.#_encodeVec3(dataPosition + lengthSize + (i * 12), data,
                vec3s[i] ?? {x: 0, y: 0, z: 0});
        }
        return totalSize;
    }

}();

export default EntityData;
export type { EntityProperties, CommonEntityProperties, EntityDataDetails };
