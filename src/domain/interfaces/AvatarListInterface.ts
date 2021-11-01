//
//  AvatarListInterface.ts
//
//  Created by David Rowe on 31 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarManager from "../AvatarManager";
import ContextManager from "../shared/ContextManager";
import { Signal } from "../shared/SignalEmitter";
import Uuid from "../shared/Uuid";


/*@sdkdoc
 *  The <code>AvatarListInterface</code> namespace provides facilities for interacting with avatars in the domain. It is
 *  provided as the <code>avatarList</code> property of the {@link AvatarMixer} class.
 *  @namespace AvatarListInterface
 *  @property {number} count - The number of avatars the user client knows about in the domain, including the user client's.
 *  @property {Signal<AvatarListInterface~avatarAdded>} avatarAdded - Triggered when an avatar is added.
 *  @property {Signal<AvatarListInterface~avatarRemoved>} avatarRemoved - Triggered when an avatar is removed.
 */
// Don't document the constructor because it shouldn't be used in the SDK.
class AvatarListInterface {
    // C++  The user scripting interface for the AvatarManager class.

    #_avatarManager;


    constructor(contextID: number) {
        this.#_avatarManager = ContextManager.get(contextID, AvatarManager) as AvatarManager;
    }


    get count(): number {
        return this.#_avatarManager.getAvatarCount();
    }


    /*@sdkdoc
     * Gets the IDs of all avatars the use client knows about in the domain. The user client's avatar is included as a
     * <code>null</code> value.
     * @returns {Array<Uuid|null>} The IDs of all avatars in the domain.
     */
    getAvatarIDs(): Array<Uuid | null> {
        return this.#_avatarManager.getAvatarIdentifiers();
    }


    /*@sdkdoc
     *  Triggered when an avatar is added.
     *  <p>Not triggered for the user client's avatar.</p>
     *  @callback AvatarListInterface~avatarAdded
     *  @param {Uuid} sessionUUID - The UUID of the avatar that was added.
     */
    get avatarAdded(): Signal {
        return this.#_avatarManager.avatarAdded;
    }

    /*@sdkdoc
     *  Triggered when an avatar is removed.
     *  <p>Not triggered for the user client's avatar.</p>
     *  @callback AvatarListInterface~avatarRemoved
     *  @param {Uuid} sessionUUID - The UUID of the avatar that was removed.
     */
    get avatarRemoved(): Signal {
        return this.#_avatarManager.avatarRemoved;
    }

}

export default AvatarListInterface;
