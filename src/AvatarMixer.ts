//
//  AvatarMixer.ts
//
//  Vircadia Web SDK's Avatar Mixer API.
//
//  Created by David Rowe on 24 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AssignmentClient from "./domain/AssignmentClient";
import AvatarManager from "./domain/AvatarManager";
import AvatarListInterface from "./domain/interfaces/AvatarListInterface";
import MyAvatarInterface from "./domain/interfaces/MyAvatarInterface";
import NodeType from "./domain/networking/NodeType";
import ContextManager from "./domain/shared/ContextManager";


/*@sdkdoc
 *  The <code>AvatarMixer</code> class provides the interface for working with avatar mixer assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created in order to set up the domain context.</p>
 *  @class AvatarMixer
 *  @extends AssignmentClient
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *
 *  @property {AvatarMixer.State} UNAVAILABLE - There is no avatar mixer available - you're not connected to a domain or the
 *      domain doesn't have an avatar mixer running.
 *      <em>Static. Read-only.</em>
 *  @property {AvatarMixer.State} DISCONNECTED - Not connected to the avatar mixer.
 *      <em>Static. Read-only.</em>
 *  @property {AvatarMixer.State} CONNECTED - Connected to the avatar mixer.
 *      <em>Static. Read-only.</em>
 *  @property {AvatarMixer.State} state - The current state of the connection to the avatar mixer.
 *      <em>Read-only.</em>
 *  @property {AvatarMixer~onStateChanged|null} onStateChanged - Sets a single function to be called when the state of the
 *      avatar mixer changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 *
 *  @property {MyAvatarInterface} myAvatar - Properties and methods for using the user client's avatar.
 *      <em>Read-only.</em>
 *  @property {AvatarListInterface} avatarList - Properties and methods for using the other of avatars in the domain (i.e.,
 *      avatars other than the user client's).
 *      <em>Read-only.</em>
 */
class AvatarMixer extends AssignmentClient {
    // C++  Application.cpp

    // Base class developer documentation is copied here and updated for the SDK documentation.

    /*@sdkdoc
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>UNAVAILABLE</td><td><code>0</code></td><td>There is no avatar mixer available - you're not connected to
     *              a domain or the domain doesn't have a avatar mixer running.</td></tr>
     *          <tr><td>DISCONNECTED</td><td><code>1</code></td><td>Not connected to the avatar mixer.</td></tr>
     *          <tr><td>CONNECTED</td><td><code>2</code></td><td>Connected to the avatar mixer.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} AvatarMixer.State
     */

    /*@sdkdoc
     *  Called when the state of the avatar mixer changes.
     *  @callback AvatarMixer~onStateChanged
     *  @param {AvatarMixer.State} state - The state of the avatar mixer.
     */

    /*@sdkdoc
     *  Gets the string representing a avatar mixer state.
     *  <p><em>Static</em></p>
     *  @function AvatarMixer.stateToString
     *  @param {AvatarMixer.State} state - The state to get the string representation of.
     *  @returns {string} The string representing the avatar mixer state if a valid state, <code>""</code> if not a valid
     *      state.
     */

    /*@sdkdoc
     *  Properties and methods for retrieving and updating the local avatar's data.
     *  @typedef {object} MessageMixer.MyAvatar
     */


    #_avatarManager;
    #_myAvatarInterface;
    #_avatarListInterface;


    constructor(contextID: number) {
        super(contextID, NodeType.AvatarMixer);

        // Context
        ContextManager.set(contextID, AvatarManager, contextID);
        this.#_avatarManager = ContextManager.get(contextID, AvatarManager) as AvatarManager;

        // C++  void Application::init()
        this.#_avatarManager.init();

        this.#_myAvatarInterface = new MyAvatarInterface(contextID);
        this.#_avatarListInterface = new AvatarListInterface(contextID);
    }


    get myAvatar(): MyAvatarInterface {
        return this.#_myAvatarInterface;
    }

    get avatarList(): AvatarListInterface {
        return this.#_avatarListInterface;
    }


    /*@sdkdoc
     *  Game loop update method that should be called multiple times per second to keep the avatar mixer up to date with user
     *  client avatar state.
     */
    update(): void {
        this.#_avatarManager.updateMyAvatar();
    }

}

export default AvatarMixer;
export { default as MyAvatarInterface } from "./domain/interfaces/MyAvatarInterface";
export { default as AvatarListInterface } from "./domain/interfaces/AvatarListInterface";
