//
//  EntityServer.ts
//
//  Created by Julien Merzoug on 26 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AssignmentClient from "./domain/AssignmentClient";
import NodeType from "./domain/networking/NodeType";

/*@sdkdoc
 *  The <code>EntityServer</code> class provides the interface for working with entity server assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created in order to set up the domain context.</p>
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


    constructor(contextID: number) {
        super(contextID, NodeType.EntityServer);
    }
}

export default EntityServer;
