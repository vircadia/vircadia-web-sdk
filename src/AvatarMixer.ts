//
//  AvatarMixer.ts
//
//  Vircadia Web SDK's Avatar Mixer API.
//
//  Created by David Rowe on 24 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarListInterface from "./domain/interfaces/AvatarListInterface";
import MyAvatarInterface from "./domain/interfaces/MyAvatarInterface";
import PacketScribe from "./domain/networking/packets/PacketScribe";
import Node from "./domain/networking/Node";
import NodeList from "./domain/networking/NodeList";
import NodeType from "./domain/networking/NodeType";
import Camera from "./domain/shared/Camera";
import ContextManager from "./domain/shared/ContextManager";
import AssignmentClient from "./domain/AssignmentClient";
import AvatarManager from "./domain/AvatarManager";


/*@sdkdoc
 *  The <code>AvatarMixer</code> class provides the interface for working with avatar mixer assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created in order to set up the domain context.</p>
 *  <p>Prerequisite: A {@link Camera} object must be created for this class to use.</p>
 *
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
 *  @property {AvatarListInterface} avatarList - Properties and methods for working with all avatars in the domain.
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


    static readonly #_MIN_PERIOD_BETWEEN_QUERIES = 3000;  // 3s.
    static readonly #_AVATAR_MIXER_NODE_SET = new Set([NodeType.AvatarMixer]);


    // Context.
    #_camera: Camera;
    #_nodeList: NodeList;
    #_avatarManager: AvatarManager;

    #_myAvatarInterface: MyAvatarInterface;
    #_avatarListInterface: AvatarListInterface;

    #_queryExpiry = 0;


    constructor(contextID: number) {
        super(contextID, NodeType.AvatarMixer);

        // Context
        ContextManager.set(contextID, AvatarManager, contextID);
        this.#_camera = ContextManager.get(contextID, Camera) as Camera;
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
        this.#_avatarManager = ContextManager.get(contextID, AvatarManager) as AvatarManager;

        // C++  Application::Application()
        this.#_nodeList.nodeActivated.connect(this.#nodeActivated);

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
        // C++  void Application::update(float deltaTime)

        // Update the avatar mixer with user client avatar data.
        this.#_avatarManager.updateMyAvatar();

        // Get updated avatar data from other clients.
        const viewIsDifferentEnough = this.#_camera.hasViewChanged;
        const now = Date.now();
        if (now > this.#_queryExpiry || viewIsDifferentEnough) {
            this.#queryAvatars();
            this.#_queryExpiry = now + AvatarMixer.#_MIN_PERIOD_BETWEEN_QUERIES;
        }

    }


    #queryAvatars(): void {
        // C++  void Application::queryAvatars()

        // Interstitial mode isn't implemented.

        const avatarQueryDetails = {
            conicalViews: [this.#_camera.conicalView]
        };

        const avatarPacket = PacketScribe.AvatarQuery.write(avatarQueryDetails);

        this.#_nodeList.broadcastToNodes(avatarPacket, AvatarMixer.#_AVATAR_MIXER_NODE_SET);
    }


    // Slot
    #nodeActivated = (node: Node): void => {
        // C++  Various
        const nodeType = node.getType();
        if (nodeType !== NodeType.AvatarMixer) {
            return;
        }

        // C++  void Application::nodeActivated(Node* node)

        // WEBRTC TODO: Address further C++ code - server skeleton model URL override.

        const myAvatar = this.#_avatarManager.getMyAvatar();
        myAvatar.markIdentityDataChanged();
        myAvatar.resetLastSent();

        // WEBRTC TODO: Address further C++ code - interstitial mode.

        myAvatar.sendAvatarDataPacket(true);
    };

}

export default AvatarMixer;
export { default as MyAvatarInterface } from "./domain/interfaces/MyAvatarInterface";
export { default as AvatarListInterface } from "./domain/interfaces/AvatarListInterface";
