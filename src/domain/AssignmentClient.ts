//
//  AssignmentClient.ts
//
//  Created by David Rowe on 19 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Node from "./networking/Node";
import { NodeTypeValue } from "./networking/NodeType";
import NodesList from "./networking/NodesList";
import ContextManager from "./shared/ContextManager";


/*@devdoc
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>UNAVAILABLE</td><td>0</td><td>There is no assignment client of the configured type available - you're not
 *              connected to a domain or the domain doesn't have an assignment client of the type running.</td></tr>
 *          <tr><td>DISCONNECTED</td><td>1</td><td>Not connected to the assignment client.</td></tr>
 *          <tr><td>CONNECTED</td><td>2</td><td>Connected to the assignment client.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} AssignmentClient.State
 */
enum AssignmentClientState {
    UNAVAILABLE = 0,
    DISCONNECTED,
    CONNECTED
}

type OnStateChanged = (state: AssignmentClientState) => void;


/*@devdoc
 *  The <code>AssignmentClient</code> class provides the base interface for working with assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created first in order to create the domain context.</p>
 *  @class AssignmentClient
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *  @param {NodeType} nodeType - The type of assignment client to work with.
 *
 *  @property {AssignmentClient.State} UNAVAILABLE - There is no assignment client of the type available - you're not connected
 *      to a domain or the domain doesn't have such an assignment client running.
 *      <em>Static. Read-only.</em>
 *  @property {AssignmentClient.State} DISCONNECTED - Not connected to the assignment client.
 *      <em>Static. Read-only.</em>
 *  @property {AssignmentClient.State} CONNECTED - Connected to the assignment client.
 *      <em>Static. Read-only.</em>
 *  @property {AssignmentClient.State} state - The current state of the connection to the assignment client.
 *      <em>Read-only.</em>
 *  @property {AssignmentClient~onStateChanged|null} onStateChanged - Sets a single function to be called when the state of the
 *      assignment client changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 */
class AssignmentClient {
    // C++  Application.cpp

    /*@devdoc
     *  Called when the state of the assignment client interface changes.
     *  @callback AssignmentClient~onStateChanged
     *  @param {AssignmentClient.State} state - The state of the assignment client interface.
     */


    static get UNAVAILABLE(): AssignmentClientState {
        return AssignmentClientState.UNAVAILABLE;
    }

    static get DISCONNECTED(): AssignmentClientState {
        return AssignmentClientState.DISCONNECTED;
    }

    static get CONNECTED(): AssignmentClientState {
        return AssignmentClientState.CONNECTED;
    }

    /*@devdoc
     *  Gets the string representing an assignment client interface state.
     *  <p><em>Static</em></p>
     *  @param {AssignmentClient.State} state - The state to get the string representation of.
     *  @returns {string} The string representing the assignment client interface state if a valid state, <code>""</code> if not
     *      a valid state.
     */
    static stateToString(state: AssignmentClientState): string {
        const text = AssignmentClientState[state];
        return text ? text : "";
    }


    // Context.
    #_nodesList: NodesList;

    #_nodeType;
    #_state;
    #_assignmentClientNode;
    #_onStateChanged: OnStateChanged | null = null;


    constructor(contextID: number, nodeType: NodeTypeValue) {

        this.#_nodesList = ContextManager.get(contextID, NodesList) as NodesList;  // Throws error if invalid context.
        this.#_nodeType = nodeType;

        // Initial state.
        this.#_assignmentClientNode = this.#_nodesList.soloNodeOfType(this.#_nodeType);
        if (this.#_assignmentClientNode === null) {
            this.#_state = AssignmentClient.UNAVAILABLE;
        } else if (this.#_assignmentClientNode.getActiveSocket() === null) {
            this.#_state = AssignmentClient.DISCONNECTED;
        } else {
            this.#_state = AssignmentClient.CONNECTED;
        }

        // Changes in state.
        this.#_nodesList.nodeAdded.connect((node: Node) => {
            if (node.getType() === this.#_nodeType) {
                this.#_assignmentClientNode = node;
                this.#setState(AssignmentClient.DISCONNECTED);
            }
        });
        this.#_nodesList.nodeKilled.connect((node: Node) => {
            if (node === this.#_assignmentClientNode) {
                this.#_assignmentClientNode = null;
                this.#setState(AssignmentClient.UNAVAILABLE);
            }
        });
        this.#_nodesList.nodeActivated.connect((node: Node) => {
            if (node === this.#_assignmentClientNode) {
                this.#setState(AssignmentClient.CONNECTED);
            }
        });
        this.#_nodesList.nodeSocketUpdated.connect((node: Node) => {
            if (node === this.#_assignmentClientNode) {
                this.#setState(AssignmentClient.DISCONNECTED);
            }
        });
    }


    // Gets the state property value.
    get state(): AssignmentClientState {
        return this.#_state;
    }

    // Sets the state-changed callback property value.
    set onStateChanged(callback: OnStateChanged) {
        if (typeof callback === "function" || callback === null) {
            this.#_onStateChanged = callback;
        } else {
            console.error("ERROR: AssignmentClient.onStateChanged callback not a function or null!");
            this.#_onStateChanged = null;
        }
    }


    // Sets the state and calls the state-changed callback.
    #setState(state: number): void {
        const previousState = this.#_state;
        this.#_state = state;
        if (state !== previousState && this.#_onStateChanged) {
            this.#_onStateChanged(this.#_state);
        }
    }

}

export default AssignmentClient;
