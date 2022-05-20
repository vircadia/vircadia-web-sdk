//
//  EntityServer.ts
//
//  Created by Julien Merzoug on 26 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketScribe from "./domain/networking/packets/PacketScribe";
import Node from "./domain/networking/Node";
import NodeList from "./domain/networking/NodeList";
import NodeType, { NodeTypeValue } from "./domain/networking/NodeType";
import OctreeConstants from "./domain/octree/OctreeConstants";
import OctreePacketProcessor from "./domain/octree/OctreePacketProcessor";
import OctreeQuery from "./domain/octree/OctreeQuery";
import Camera from "./domain/shared/Camera";
import ContextManager from "./domain/shared/ContextManager";
import SignalEmitter, { Signal } from "./domain/shared/SignalEmitter";
import AssignmentClient from "./domain/AssignmentClient";


/*@sdkdoc
 *  The <code>EntityServer</code> class provides the interface for working with entity server assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created in order to set up the domain context.</p>
 *  <p>Prerequisite: A {@link Camera} object must be created for this class to use.</p>
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
 *  @property {Signal<EntityServer~AddedEntityCallback>} addedEntity - Triggered when an entity data packet is received.
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
    // eslint-disable-next-line
    // @ts-ignore
    #_octreeProcessor;
    #_maxOctreePPS = OctreeConstants.DEFAULT_MAX_OCTREE_PPS;
    #_queryExpiry = 0;
    #_physicsEnabled = true;
    #_addedEntity = new SignalEmitter();


    constructor(contextID: number) {
        super(contextID, NodeType.EntityServer);

        // Context
        this.#_camera = ContextManager.get(contextID, Camera) as Camera;
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

        ContextManager.set(contextID, OctreePacketProcessor, contextID);
        this.#_octreeProcessor = ContextManager.get(contextID, OctreePacketProcessor) as OctreePacketProcessor;
        this.#_octreeProcessor.addedEntity.connect(() => {
            this.#_addedEntity.emit();
        });

        // C++  Application::Application()
        this.#_nodeList.nodeActivated.connect(this.#nodeActivated);
        this.#_nodeList.nodeKilled.connect(this.#nodeKilled);

        this.#_queryExpiry = Date.now();
    }


    get maxOctreePacketsPerSecond(): number {
        return this.#_maxOctreePPS;
    }

    /*@devdoc
     *  Triggered when an entity data packet is received.
     *  @callback EntityServer~AddedEntityCallback
     */
    get addedEntity(): Signal {
        return this.#_addedEntity.signal();
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
