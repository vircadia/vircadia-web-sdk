//
//  AvatarManager.ts
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import MyAvatar from "./avatar/MyAvatar";
import Avatar from "./avatar-renderer/Avatar";
import ScriptAvatar from "./avatar-renderer/ScriptAvatar";
import AvatarData, { KillAvatarReason } from "./avatars/AvatarData";
import AvatarHashMap from "./avatars/AvatarHashMap";
import Node from "./networking/Node";
import NodeList from "./networking/NodeList";
import NodeType from "./networking/NodeType";
import ContextManager from "./shared/ContextManager";
import Uuid from "./shared/Uuid";


/*@devdoc
 *  The <code>AvatarManager</code> class is concerned with operations on that the user client knows about in the domain (has
 *  been sent data on by the avatar mixer).
 *  <p>C++: <code>AvatarManager</code></p>
 *  @class AvatarManager
 *  @extends AvatarHashMap
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *  @property {string} contextItemType="AvatarManager" - The type name for use with the {@link ContextManager}.
 *      <p><em>Static. Read-only.</em></p>
 */
class AvatarManager extends AvatarHashMap {
    // C++  class AvatarManager : public AvatarHashMap

    static readonly contextItemType = "AvatarManager";


    // Context.
    #_contextID;
    #_nodeList;

    #_myAvatar;

    #_lastSendAvatarDataTime = 0;
    #_myAvatarDataPacketsPaused = false;


    constructor(contextID: number) {
        // C++  AvatarManager(QObject* parent = 0);
        super(contextID);
        this.#_contextID = contextID;

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

        this.#_nodeList.nodeActivated.connect(this.nodeActivated);

        this.#_myAvatar = new MyAvatar(contextID);
        this.#_nodeList.uuidChanged.connect(this.#_myAvatar.setSessionUUID);
    }


    /*@devdoc
     *  Initializes the <code>AvatarManager</code>.
     */
    init(): void {
        // void init()
        this.#_myAvatar.init();
        const MY_AVATAR_KEY = Uuid.NULL;
        this._avatarHash.set(MY_AVATAR_KEY, this.#_myAvatar);

        // C++ rendering code not relevant.
    }

    /*@devdoc
     *  Gets the user client's avatar.
     *  @returns {MyAvatar} The user client's avatar.
     */
    getMyAvatar(): MyAvatar {
        // C++  MyAvatar* getMyAvatar()
        return this.#_myAvatar;
    }

    /*@devdoc
     *  Updates the avatar mixer with the latest user client avatar data, if at least 20ms has elapsed since the last update.
     */
    updateMyAvatar(/* deltaTime: number */): void {
        // C++  void AvatarManager::updateMyAvatar(float deltaTime)

        const now = Date.now();
        const deltaTime = now - this.#_lastSendAvatarDataTime;

        if (deltaTime > AvatarHashMap.MIN_TIME_BETWEEN_MY_AVATAR_DATA_SENDS && !this.#_myAvatarDataPacketsPaused) {

            // WEBRTC TODO: Address further C++ code. - Performance timer.

            this.#_myAvatar.sendAvatarDataPacket();
            this.#_lastSendAvatarDataTime = now;

            // WEBRTC TODO: Address further C++ code. - Send rate.

        }
    }

    /*@devdoc
     *  Gets an object for working with a specified avatar.
     *  @param {Uuid} avatarID - The session ID of the avatar.
     *      <p>The user client's avatar may be retrieved using its session ID or {@link Uuid|Uuid.AVATAR_SELF_ID} &mdash; this
     *      is an alternative to using the more capable {@link AvatarMixer|AvatarMixer.myAvatar} interface.</p>
     *  @returns {ScriptAvatar} A new object for working with a specified avatar.
     */
    getAvatar(avatarID: Uuid): ScriptAvatar {
        // C++  ScriptAvatarData* getAvatar(QUuid avatarID)
        return new ScriptAvatar(this.getAvatarBySessionID(avatarID));
    }

    /*@devdoc
     *  Gets the avatar data for an avatar with a specified session ID.
     *  @param {Uuid} sessionID - The session ID of the avatar.
     *  @returns {AvatarData|null} The avatar data if there is an avatar with the session ID, <code>null</code> if there isn't.
     */
    getAvatarBySessionID(sessionID: Uuid): AvatarData | null {
        // C++  AvatarData* getAvatarBySessionID(const QUuid& sessionID)
        if (sessionID.value() === Uuid.AVATAR_SELF_ID || sessionID.value() === this.#_myAvatar.getSessionUUID().value()) {
            return this.#_myAvatar;
        }
        return this.findAvatar(sessionID);
    }


    /*@devdoc
     *  Acts upon an {@link NodeType(1)|AvatarMixer} node being activated.
     *  @function AvatarManager.nodeActivated
     *  @type {Slot}
     *  @param {Node} node - The node that has been activated.
     */
    nodeActivated = (node: Node): void => {
        // C++  Various
        const nodeType = node.getType();
        if (nodeType !== NodeType.AvatarMixer) {
            return;
        }

        // C++  void Application::nodeActivated(Node* node)

        // WEBRTC TODO: Address further C++ code. - Query octree and avatars.

        // New avatar mixer, send off our identity packet on next update loop,
        // Reset skeletonModelUrl if the last server modified our choice.
        // Override the avatar URL (but not model name) here too.

        // WEBRTC TODO: Address further C++ code. - Avatar override URL.

        // WEBRTC TODO: Address further C++ code. - Avatar URL.

        this.#_myAvatar.markIdentityDataChanged();
        this.#_myAvatar.resetLastSent();

        // Interstitial mode not implemented.

        // Transmit a "sendAll" packet to the AvatarMixer we just connected to.
        this.#_myAvatar.sendAvatarDataPacket(true);
    };

    /*@devdoc
     *  Clears out the data on avatars other than the user client's.
     */
    override clearOtherAvatars(): void {
        // C++  void clearOtherAvatars()

        // WEBRTC TODO: Address further C++ code - Clear look-at target avatar.

        for (const [key, value] of this._avatarHash.entries()) {
            if (value !== this.#_myAvatar) {
                this._avatarHash.delete(key);
                this.handleRemovedAvatar(value);
            }
        }
    }


    protected override newSharedAvatar(sessionUUID: Uuid): AvatarData {
        // C++  AvatarData* newSharedAvatar(const QUuid& sessionUUID)

        // WEBRTC TODO: Address further C++ code - use OtherAvatar instead of Avatar?

        const otherAvatar = new Avatar(this.#_contextID);
        otherAvatar.setSessionUUID(sessionUUID);

        // C++ rendering code not relevant.

        return otherAvatar;
    }

    protected override addAvatar(sessionUUID: Uuid, mixerWeakPointer: Node): AvatarData {
        // C++  Avatar* addAvatar(const QUuid& sessionUUID, const Node* mixerWeakPointer)
        const avatar = super.addAvatar(sessionUUID, mixerWeakPointer);

        // C++ rendering code not relevant.

        return avatar;
    }

    protected override handleRemovedAvatar(removedAvatar: AvatarData, removalReason = KillAvatarReason.NoReason): void {
        // C++  void handleRemovedAvatar(const Avatar* removedAvatar,
        //          KillAvatarReason removalReason = KillAvatarReason::NoReason);

        super.handleRemovedAvatar(removedAvatar, removalReason);

        // WEBRTC TODO: Address further C++ code - grabs, die, physics, orb.

        // WEBRTC TODO: Address further C++ code - remove avatar entities from tree and scene.

    }

}

export default AvatarManager;
