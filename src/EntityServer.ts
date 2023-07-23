//
//  EntityServer.ts
//
//  Created by Julien Merzoug on 26 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { HostType } from "./domain/entities/EntityItem";
import { EntityType } from "./domain/entities/EntityTypes";
import { EntityProperties } from "./domain/networking/packets/EntityData";
import PacketScribe from "./domain/networking/packets/PacketScribe";
import PacketType, { PacketTypeValue } from "./domain/networking/udt/PacketHeaders";
import Node from "./domain/networking/Node";
import NodeList from "./domain/networking/NodeList";
import NodeType, { NodeTypeValue } from "./domain/networking/NodeType";
import EntityEditPacketSender from "./domain/entities/EntityEditPacketSender";
import OctreeConstants from "./domain/octree/OctreeConstants";
import OctreePacketProcessor from "./domain/octree/OctreePacketProcessor";
import OctreeQuery from "./domain/octree/OctreeQuery";
import Camera from "./domain/shared/Camera";
import ContextManager from "./domain/shared/ContextManager";
import SignalEmitter, { Signal } from "./domain/shared/SignalEmitter";
import Uuid from "./domain/shared/Uuid";
import AssignmentClient from "./domain/AssignmentClient";
import { bigintReplacer, bigintReviver } from "./domain/shared/JSONExtensions";


/*@sdkdoc
 *  The <code>EntityServer</code> class provides the interface for working with entity server assignment clients.
 *  <p>For a list of entity types, see {@link EntityType}.</p>
 *  <p>For entity properties, see {@link EntityProperties}.</p>
 *  <p>Prerequisites:<p>
 *  <ul>
 *      <li>A {@link DomainServer} object must be created in order to set up the domain context.</li>
 *      <li>Prerequisite: A {@link Camera} object must be created for this class to use.</li>
 *  </ul>
 *
 *  @class EntityServer
 *  @extends AssignmentClient
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *
 *  @property {EntityServer.State} UNAVAILABLE - There is no entity server available - you're not connected to a domain or the
 *      domain doesn't have an entity server running.
 *      <em>Static. Read-only.</em>
 *  @property {EntityServer.State} DISCONNECTED - Not connected to the entity server.
 *      <em>Static. Read-only.</em>
 *  @property {EntityServer.State} CONNECTED - Connected to the entity server.
 *      <em>Static. Read-only.</em>
 *  @property {EntityServer.State} state - The current state of the connection to the entity server.
 *      <em>Read-only.</em>
 *  @property {EntityServer~onStateChanged|null} onStateChanged - Sets a single function to be called when the state of the
 *      entity server changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 *
 *  @property {number} maxOctreePacketsPerSecond - The maximum number of octree packets per second that the user client is
 *      willing to handle.
 *  @property {Signal<EntityServer~entityData>} entityData - Triggered when new or changed entity data is received from the
 *      entity server.
 *  @property {boolean} canRez - Whether the user has permissions to rez (create) persistent entities in the domain.
 *  @property {Signal<EntityServer~canRezChanged>} canRezChanged - Triggered when whether the user's permissions to rez (create)
 *      persistent entities changes in the domain.
 *  @property {boolean} canRezTemp - Whether the user has permissions to rez (create) temporary entities in the domain.
 *  @property {Signal<EntityServer~canRezTempChanged>} canRezTempChanged - Triggered when whether the user's permissions to rez
 *      (create) temporary entities changes in the domain. Temporary entities are entities with a finite <code>lifetime</code>
 *      property value set.
 *  @property {boolean} canGetAndSetPrivateUserData - Whether the user has permissions to get and set entities'
 *     <code>privateUserData</code> properties in the domain.
 *  @property {Signal<EntityServer~canGetAndSetPrivateUserDataChanged>} canGetAndSetPrivateUserDataChanged - Triggered when the
 *      user's permissions to get and set entities' <code>privateUserData</code> properties changes in the domain.
 */
class EntityServer extends AssignmentClient {

    // Base class developer documentation is copied here and updated for the SDK documentation.

    /*@sdkdoc
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>UNAVAILABLE</td><td><code>0</code></td><td>There is no entity server available - you're not connected to
     *              a domain or the domain doesn't have an entity server running.</td></tr>
     *          <tr><td>DISCONNECTED</td><td><code>1</code></td><td>Not connected to the entity server.</td></tr>
     *          <tr><td>CONNECTED</td><td><code>2</code></td><td>Connected to the entity server.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} EntityServer.State
     */

    /*@sdkdoc
     *  Called when the state of the entity server changes.
     *  @callback EntityServer~onStateChanged
     *  @param {EntityServer.State} state - The state of the entity server.
     */

    /*@sdkdoc
     *  Gets the string representing an entity server state.
     *  <p><em>Static</em></p>
     *  @function EntityServer.stateToString
     *  @param {EntityServer.State} state - The state to get the string representation of.
     *  @returns {string} The string representing the entity server state if a valid state, <code>""</code> if not a valid
     *      state.
     */


    static readonly #MIN_PERIOD_BETWEEN_QUERIES = 3000;


    // Context
    #_camera: Camera;
    #_nodeList: NodeList;

    #_octreeQuery = new OctreeQuery(true);
    #_octreeProcessor;
    #_maxOctreePPS = OctreeConstants.DEFAULT_MAX_OCTREE_PPS;
    #_entityEditPacketSender;
    #_queryExpiry = 0;
    #_physicsEnabled = true;
    #_entityData = new SignalEmitter();
    #_canRezChanged = new SignalEmitter();
    #_canRezTempChanged = new SignalEmitter();
    #_canGetAndSetPrivateUserDataChanged = new SignalEmitter();


    constructor(contextID: number) {
        super(contextID, NodeType.EntityServer);

        // Context
        this.#_camera = ContextManager.get(contextID, Camera) as Camera;
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

        ContextManager.set(contextID, OctreePacketProcessor, contextID);
        this.#_octreeProcessor = ContextManager.get(contextID, OctreePacketProcessor) as OctreePacketProcessor;
        this.#_octreeProcessor.entityData.connect((data) => {
            this.#_entityData.emit(data);
        });

        ContextManager.set(contextID, EntityEditPacketSender, contextID);
        this.#_entityEditPacketSender = ContextManager.get(contextID, EntityEditPacketSender) as EntityEditPacketSender;

        // C++  EntityScriptingInterface::EntityScriptingInterface(bool bidOnSimulationOwnership)
        this.#_nodeList.canRezChanged.connect((canRez: boolean) => {
            this.#_canRezChanged.emit(canRez);
        });
        this.#_nodeList.canRezTmpChanged.connect((canRezTmp: boolean) => {
            this.#_canRezTempChanged.emit(canRezTmp);
        });
        this.#_nodeList.canGetAndSetPrivateUserDataChanged.connect((canGetAndSetPrivateUserData: boolean) => {
            this.#_canGetAndSetPrivateUserDataChanged.emit(canGetAndSetPrivateUserData);
        });

        // C++  Application::Application()
        this.#_nodeList.nodeActivated.connect(this.#nodeActivated);
        this.#_nodeList.nodeKilled.connect(this.#nodeKilled);

        this.#_queryExpiry = Date.now();
    }


    get maxOctreePacketsPerSecond(): number {
        return this.#_maxOctreePPS;
    }

    get canRez(): boolean {
        // C++  bool EntityScriptingInterface::canRez()
        return this.#_nodeList.getThisNodeCanRez();
    }

    get canRezTemp(): boolean {  // Intentionally renamed from canRezTmp() in order to be more user-friendly.
        // C++  bool EntityScriptingInterface::canRezTmp()
        return this.#_nodeList.getThisNodeCanRezTmp();
    }

    get canGetAndSetPrivateUserData(): boolean {
        // C++  bool EntityScriptingInterface::canGetAndSetPrivateUserData()
        return this.#_nodeList.getThisNodeCanGetAndSetPrivateUserData();
    }


    /*@sdkdoc
     *  Triggered when new or changed entity data is received from the entity server.
     *  @callback EntityServer~entityData
     *  @param {EntityProperties[]} entityData - The entity properties for one or more entities. Note that complete entity
     *      properties are provided for both new and changed entities.
     */
    get entityData(): Signal {
        // C++  N/A
        return this.#_entityData.signal();
    }

    /*@sdkdoc
     *  Triggered when the user's permissions to rez (create) persistent entities changes in the domain.
     *  @callback EntityServer~canRezChanged
     *  @param {boolean} canRez - <code>true</code> if the user has permissions to rez persistent entities in the domain,
     *      <code>false</code> if the user doesn't.
     */
    get canRezChanged(): Signal {
        // C++  void EntityScriptingInterface::canRezChanged(bool canRez)
        return this.#_canRezChanged.signal();
    }

    /*@sdkdoc
     *  Triggered when the user's permissions to rez (create) temporary entities changes in the domain. Temporary
     *  entities are entities with a finite <code>lifetime</code> property value set.
     *  @callback EntityServer~canRezTempChanged
     *  @param {boolean} canRezTemp - <code>true</code> if the user has permissions to rez temporary entities in the domain,
     *      <code>false</code> if the user doesn't.
     */
    get canRezTempChanged(): Signal {
        // C++  void EntityScriptingInterface::canRezTmpChanged(bool canRez)
        return this.#_canRezTempChanged.signal();
    }

    /*@sdkdoc
     *  Triggered when the user's permissions to get and set entities' <code>privateUserData</code> properties changes in the
     *  domain.
     *  @callback EntityServer~canGetAndSetPrivateUserDataChanged
     *  @param {boolean} canGetAndSetPrivateUserdata - <code>true</code> if the user has permissions to get and set entities'
     *  <code>privateUserData</code> properties in the domain, <code>false</code> if the user doesn't.
     */
    get canGetAndSetPrivateUserDataChanged(): Signal {
        // C++  void EntityScriptingInterface::canGetAndSetPrivateUserDataChanged(bool canGetAndSetPrivateUserData)
        return this.#_canGetAndSetPrivateUserDataChanged.signal();
    }


    /*@sdkdoc
     *  Game loop update method that should be called multiple times per second to keep the entity server up to date with user
     *  client entity state.
     */
    update(): void {
        // C++  void Application::update(float deltaTime)

        // Request updated entity data.
        const viewIsDifferentEnough = this.#_camera.hasViewChanged;
        const now = Date.now();
        if (now > this.#_queryExpiry || viewIsDifferentEnough) {
            this.#queryOctree(NodeType.EntityServer);
            this.#_queryExpiry = now + EntityServer.#MIN_PERIOD_BETWEEN_QUERIES;
        }
    }

    /*@sdkdoc
     *  Adds a new entity to the entity server.
     *  @param {EntityProperties} properties - The properties of the entity to add.
     *  @param {HostType} [hostType=HostType.DOMAIN] - Where to host the entity.
     *      <p>Note: Currently only <code>HostType.DOMAIN</code> is supported.</p>
     *  @returns {Uuid} The ID of the new entity if an add request was successfully sent to the server, or
     *      {@link Uuid(1)|Uuid.NULL} if no entity add request was made (invalid data or not connected).
     */
    addEntity(properties: EntityProperties, hostType?: HostType): Uuid {
        // C++  QUuid EntityScriptingInterface::addEntity(const EntityItemProperties& properties,
        //          const QString& entityHostTypeString)

        if (typeof properties !== "object") {
            console.error("[EntityServer] addEntity() called with invalid entity properties!");
            return new Uuid();
        }

        if (typeof properties.entityType !== "number" || properties.entityType <= EntityType.Unknown
                || properties.entityType >= EntityType.NUM_TYPES) {
            console.error("[EntityServer] addEntity() called with invalid entity type!");
            return new Uuid();
        }

        if (typeof hostType !== "undefined") {
            if (typeof hostType !== "number" || hostType < HostType.DOMAIN || hostType > HostType.LOCAL) {
                console.error("[EntityServer] addEntity() called with invalid entity hostType!");
                return new Uuid();
            }
            if (hostType === HostType.AVATAR) {
                console.error("[EntityServer] addEntity() for avatar entities not implemented!");
                return new Uuid();
            }
            if (hostType === HostType.LOCAL) {
                console.error("[EntityServer] addEntity() for local entities not implemented!");
                return new Uuid();
            }
        }

        if ([EntityType.Line, EntityType.PolyLine, EntityType.PolyVox, EntityType.Grid, EntityType.Gizmo]
            .includes(properties.entityType)) {
            console.error("[EntityServer] addEntity() called with unsupported entity type!", properties.entityType);
            return new Uuid();
        }

        return this.#addEntityInternal(properties, hostType ?? HostType.DOMAIN);
    }

    /*@sdkdoc
     *  Edits an entity, changing one or more of its property values.
     *  @param {Uuid} entityID - The ID of the entity to edit.
     *  @param {Entities.EntityProperties} properties - The new property values.
     *  @returns {Uuid} The ID of the entity if an edit request was successfully sent to the server, or
     *      {@link Uuid(1)|Uuid.NULL} if no entity edit request was sent (invalid data or not connected).
     */
    editEntity(entityID: Uuid, properties: EntityProperties): Uuid {
        // C++  QUuid EntityScriptingInterface::editEntity(const QUuid& entityID, const EntityItemProperties& properties)

        if (!(entityID instanceof Uuid)) {
            console.error("[EntityServer] editEntity() called with invalid entity ID!");
            return new Uuid();
        }

        if (typeof properties !== "object") {
            console.error("[EntityServer] editEntity() called with invalid entity properties!");
            return new Uuid();
        }

        // Required properties.
        // Required by EntityItemProperties.encodeEntityEditPacket() ...
        if (typeof properties.entityType !== "number" || properties.entityType <= EntityType.Unknown
            || properties.entityType >= EntityType.NUM_TYPES) {
            console.error("[EntityServer] editEntity() called with invalid entity type value!");
            return new Uuid();
        }
        if (typeof properties.lastEdited !== "bigint") {
            console.error("[EntityServer] editEntity() called with invalid lastEdited value!");
            return new Uuid();
        }

        // WEBRTC TODO: Queue edit requests if not connected.
        if (this.state !== EntityServer.CONNECTED) {
            console.warn("[EntityServer] Could not send edit message because not connected.");
            return new Uuid();
        }

        return this.#editEntityInternal(entityID, properties);
    }


    // Sends an EntityQuery packet to the entity server.
    #queryOctree(serverType: NodeTypeValue): void {
        // C++ Application::queryOctree(NodeType_t serverType, PacketType packetType)

        const isModifiedQuery = !this.#_physicsEnabled;
        if (isModifiedQuery) {

            // WEBRTC TODO: Address further C++ code.
            console.error("EntityServer octree query not implement for physics not enabled!");

        } else {
            this.#_octreeQuery.setConicalViews([this.#_camera.conicalView]);

            // WEBRTC TODO: Get values from LODManager.
            this.#_octreeQuery.setOctreeSizeScale(OctreeConstants.DEFAULT_OCTREE_SIZE_SCALE);
            this.#_octreeQuery.setBoundaryLevelAdjust(0);
        }
        this.#_octreeQuery.setReportInitialCompletion(isModifiedQuery);

        const node = this.#_nodeList.soloNodeOfType(serverType);
        if (node && node.getActiveSocket()) {
            this.#_octreeQuery.setMaxQueryPacketsPerSecond(this.maxOctreePacketsPerSecond);

            const entityQueryData = this.#_octreeQuery.getBroadcastData();
            const packet = PacketScribe.EntityQuery.write(entityQueryData);
            this.#_nodeList.sendUnreliablePacket(packet, node);
        }
    }

    #addEntityInternal(properties: EntityProperties, entityHostType: HostType): Uuid {
        // C++  QUuid EntityScriptingInterface::addEntityInternal(const EntityItemProperties& properties,
        //          entity::HostType entityHostType)

        // WEBRTC TODO: Address further C++ code - activity tracking.

        // WEBRTC TODO: Address further C++ code - avatar entities and local entities.
        if (entityHostType === HostType.AVATAR) {
            console.error("[EntityServer] addEntity() for avatar entities not implemented!");
            return new Uuid(Uuid.NULL);
        }
        if (entityHostType === HostType.LOCAL) {
            console.error("[EntityServer] addEntity() for local entities not implemented!");
            return new Uuid(Uuid.NULL);
        }

        // WEBRTC TODO: Address further C++ code - avatar entities.

        const propertiesWithSimID = JSON.parse(JSON.stringify(properties, bigintReplacer), bigintReviver) as EntityProperties;
        propertiesWithSimID.entityHostType = entityHostType;

        // WEBRTC TODO: Address further C++ code - avatar entities and local entities.

        propertiesWithSimID.created = BigInt(Date.now());

        const sessionID = this.#_nodeList.getSessionUUID();
        propertiesWithSimID.lastEditedBy = sessionID;

        // Don't use native client's "script semantics" for properties, use the server's.

        // Don't track whether the dimensions have been initialized, this is the client's responsibility.

        // WEBRTC TODO: Address synchronizing grab properties?

        // The SDK doesn't maintain a local entity tree so just create an entity ID.
        const id = Uuid.createUuid();

        this.#queueEntityMessage(PacketType.EntityAdd, id, propertiesWithSimID);
        return id;
    }

    #editEntityInternal(entityID: Uuid, properties: EntityProperties): Uuid {
        // C++  QUuid EntityScriptingInterface::editEntity(const QUuid& entityID, const EntityItemProperties& properties)

        // WEBRTC TODO: Address further C++ code - activity tracking.

        const sessionID = this.#_nodeList.getSessionUUID();
        const propertiesWithSessionID
            = JSON.parse(JSON.stringify(properties, bigintReplacer), bigintReviver) as EntityProperties;
        properties.lastEditedBy = sessionID;

        // The SDK doesn't maintain a local entity tree so skip entity tree-related code.

        // The SDK doesn't support local positions and such script-side semantics.

        // WEBRTC TODO: Address synchronizing grab properties?

        this.#queueEntityMessage(PacketType.EntityEdit, entityID, propertiesWithSessionID);
        return entityID;
    }

    #queueEntityMessage(packetType: PacketTypeValue, entityID: Uuid, properties: EntityProperties): void {
        // C++  void EntityScriptingInterface::queueEntityMessage(PacketType packetType, EntityItemID entityID,
        //          const EntityItemProperties& properties)

        this.#_entityEditPacketSender.queueEditEntityMessage(packetType, entityID, properties);
    }


    // Slot.
    #nodeActivated = (node: Node): void => {
        // C++  void Application::nodeActivated(SharedNodePointer node)
        const nodeType = node.getType();
        if (nodeType !== NodeType.EntityServer) {
            return;
        }

        this.#_queryExpiry = Date.now();
        this.#_octreeQuery.incrementConnectionID();

        // Safe landing code not implemented.
    };

    // Slot.
    #nodeKilled = (node: Node): void => {
        // C++  void Application::nodeKilled(SharedNodePointer node)
        const nodeType = node.getType();
        if (nodeType !== NodeType.EntityServer) {
            return;  // eslint-disable-line no-useless-return
        }

        // WEBRTC TODO: Address further code - clear octree.

    };

}

export default EntityServer;
