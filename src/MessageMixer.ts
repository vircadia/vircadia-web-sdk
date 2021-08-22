//
//  MessageMixer.ts
//
//  Vircadia Web SDK's Avatar Mixer API.
//
//  Created by David Rowe on 19 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Node from "./domain/networking/Node";
import NodeType from "./domain/networking/NodeType";
import NodesList from "./domain/networking/NodesList";
import ContextManager from "./domain/shared/ContextManager";


/*@sdkdoc
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>UNAVAILABLE</td><td>0</td><td>There is no Message Mixer available - you're not connected to a domain or the
 *              domain doesn't have a Message Mixer running.</td></tr>
 *          <tr><td>DISCONNECTED</td><td>1</td><td>Not connected to the Message Mixer.</td></tr>
 *          <tr><td>CONNECTED</td><td>2</td><td>Connected to the Message Mixer.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} MessageMixer.State
 */
enum MessageMixerState {
    UNAVAILABLE = 0,
    DISCONNECTED,
    CONNECTED
}

type OnStateChanged = (state: MessageMixerState) => void;


/*@sdkdoc
 *  The <code>MessageMixer</code> class provides the interface for working with Message Mixer assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created first in order to create the domain context.</p>
 *  @class MessageMixer
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *
 *  @property {MessageMixer.State} UNAVAILABLE - There is no Message Mixer available - you're not connected to a domain or the
 *      domain doesn't have a message mixer running.
 *      <em>Static. Read-only.</em>
 *  @property {MessageMixer.State} DISCONNECTED - Not connected to the message mixer.
 *      <em>Static. Read-only.</em>
 *  @property {MessageMixer.State} CONNECTED - Connected to the message mixer.
 *      <em>Static. Read-only.</em>
 *  @property {MessageMixer.State} state - The current state of the connection to the message mixer.
 *      <em>Read-only.</em>
 *  @property {MessageMixer~onStateChanged|null} onStateChanged - Sets a single function to be called when the state of the
 *      message mixer changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 */
class MessageMixer {

    /*@sdkdoc
     *  Called when the state of the message mixer changes.
     *  @callback MessageMixer~onStateChanged
     *  @param {MessageMixer.State} state - The state of the message mixer.
     */


    static get UNAVAILABLE(): MessageMixerState {
        return MessageMixerState.UNAVAILABLE;
    }

    static get DISCONNECTED(): MessageMixerState {
        return MessageMixerState.DISCONNECTED;
    }

    static get CONNECTED(): MessageMixerState {
        return MessageMixerState.CONNECTED;
    }

    /*@sdkdoc
     *  Gets the string representing a message mixer state.
     *  <p><em>Static</em></p>
     *  @param {MessageMixer.State} state - The state to get the string representation of.
     *  @returns {string} The string representing the message mixer state if a valid state, otherwise <code>""</code>.
     */
    static stateToString(state: MessageMixerState): string {
        const text = MessageMixerState[state];
        return text ? text : "";
    }


    // Context.
    #_nodesList: NodesList;

    #_state;
    #_messageMixerNode;
    #_onStateChanged: OnStateChanged | null = null;


    constructor(contextID = 0) {

        this.#_nodesList = ContextManager.get(contextID, NodesList) as NodesList;  // Throws error if invalid context.

        // Initial state.
        this.#_messageMixerNode = this.#_nodesList.soloNodeOfType(NodeType.MessagesMixer);
        if (this.#_messageMixerNode === null) {
            this.#_state = MessageMixer.UNAVAILABLE;
        } else if (this.#_messageMixerNode.getActiveSocket() === null) {
            this.#_state = MessageMixer.DISCONNECTED;
        } else {
            this.#_state = MessageMixer.CONNECTED;
        }

        // Changes in state.
        this.#_nodesList.nodeAdded.connect((node: Node) => {
            if (node.getType() === NodeType.MessagesMixer) {
                this.#_messageMixerNode = node;
                this.#setState(MessageMixer.DISCONNECTED);
            }
        });
        this.#_nodesList.nodeKilled.connect((node: Node) => {
            if (node === this.#_messageMixerNode) {
                this.#_messageMixerNode = null;
                this.#setState(MessageMixer.UNAVAILABLE);
            }
        });
        this.#_nodesList.nodeActivated.connect((node: Node) => {
            if (node === this.#_messageMixerNode) {
                this.#setState(MessageMixer.CONNECTED);
            }
        });
        this.#_nodesList.nodeSocketUpdated.connect((node: Node) => {
            if (node === this.#_messageMixerNode) {
                this.#setState(MessageMixer.DISCONNECTED);
            }
        });
    }


    // Gets the state property value.
    get state(): MessageMixerState {
        return this.#_state;
    }

    // Sets the state-changed callback property value.
    set onStateChanged(callback: OnStateChanged) {
        if (typeof callback === "function" || callback === null) {
            this.#_onStateChanged = callback;
        } else {
            console.error("ERROR: MessageMixer.onStateChanged callback not a function or null!");
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

export default MessageMixer;
