//
//  AvatarListInterface.ts
//
//  Created by David Rowe on 31 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarManager from "../AvatarManager";
import ScriptAvatar from "../avatar-renderer/ScriptAvatar";
import ContextManager from "../shared/ContextManager";
import { Signal } from "../shared/SignalEmitter";
import Uuid from "../shared/Uuid";


/*@sdkdoc
 *  The <code>AvatarListInterface</code> namespace provides facilities for working with avatars in the domain. It is
 *  provided as the <code>avatarList</code> property of the {@link AvatarMixer} class.
 *  @namespace AvatarListInterface
 *  @comment Don't document the constructor because it shouldn't be used in the SDK.
 *
 *  @property {number} count - The number of avatars the user client knows about in the domain, including the user client's.
 *  @property {Signal<AvatarListInterface~avatarAdded>} avatarAdded - Triggered when an avatar is added.
 *  @property {Signal<AvatarListInterface~avatarRemoved>} avatarRemoved - Triggered when an avatar is removed.
 */
class AvatarListInterface {
    // C++  The user scripting interface for the AvatarManager class.

    #_avatarManager;


    constructor(contextID: number) {
        this.#_avatarManager = ContextManager.get(contextID, AvatarManager) as AvatarManager;
    }


    get count(): number {
        // C++  N/A
        return this.#_avatarManager.getAvatarCount();
    }


    /*@sdkdoc
     *  Gets the session IDs of all avatars the use client knows about in the domain. The user client's avatar is included as
     *  the <code>Uuid.AVATAR_SELF_ID</code> value.
     *  @returns {Array<Uuid>} The IDs of all avatars in the domain.
     */
    getAvatarIDs(): Array<Uuid> {
        // C++  AvatarManager::getAvatarIdentifiers()
        return this.#_avatarManager.getAvatarIdentifiers();
    }

    /*@sdkdoc
     *  Gets an object for working with an avatar in the domain.
     *  @param {Uuid} id - The session ID of the avatar.
     *      <p>The user client's avatar may be retrieved using its session ID or {@link Uuid(1)|Uuid.AVATAR_SELF_ID} &mdash;
     *      this is an alternative to using the more capable {@link AvatarMixer|AvatarMixer.myAvatar} interface.</p>
     *  @returns {ScriptAvatar} A new object for working with the specified avatar.
     */
    getAvatar(id: Uuid): ScriptAvatar {
        // C++  ScriptAvatar* AvatarManager::getAvatar(QUuid avatarID)
        return this.#_avatarManager.getAvatar(id);
    }


    /*@sdkdoc
     *  Triggered when an avatar is added.
     *  <p>Not triggered for the user client's avatar.</p>
     *  @callback AvatarListInterface~avatarAdded
     *  @param {Uuid} sessionUUID - The UUID of the avatar that was added.
     */
    get avatarAdded(): Signal {
        // C++  void AvatarManager::avatarAddedEvent(const QUuid& sessionUUID)
        return this.#_avatarManager.avatarAdded;
    }

    /*@sdkdoc
     *  Triggered when an avatar is removed.
     *  <p>Not triggered for the user client's avatar.</p>
     *  @callback AvatarListInterface~avatarRemoved
     *  @param {Uuid} sessionUUID - The UUID of the avatar that was removed.
     */
    get avatarRemoved(): Signal {
        // C++  void AvatarManager::avatarRemovedEvent(const QUuid& sessionUUID)
        return this.#_avatarManager.avatarRemoved;
    }

}

export default AvatarListInterface;
