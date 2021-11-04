//
//  MyAvatarInterface.ts
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


/*@sdkdoc
 *  The <code>MyAvatarInterface</code> namespace provides facilities for using the user client's avatar. It is provided as the
 *  <code>myAvatar</code> property of the {@link AvatarMixer} class.
 *  @namespace MyAvatarInterface
 *
 *  @property {string} displayName - The user client's avatar display name.
 *  @property {Signal} displayNameChanged - Triggered when the display name changes.
 *  @property {string} sessionDisplayName - The user client's session display name, assigned by the domain server based on the
 *      avatar display name. It is unique among all avatars present in the domain. <em>Read-only.</em>
 *  @property {Signal} sessionDisplayNameChanged - Triggered when the session display name changes.
 */
// Don't document the constructor because it shouldn't be used in the SDK.
class MyAvatarInterface {
    // C++  The user scripting interface for the MyAvatar class.

    #_avatarManager;


    constructor(contextID: number) {
        this.#_avatarManager = ContextManager.get(contextID, AvatarManager) as AvatarManager;
    }


    get displayName(): string {
        const displayName = this.#_avatarManager.getMyAvatar().displayName;
        return displayName !== null ? displayName : "";
    }

    set displayName(displayName: string) {
        if (typeof displayName !== "string") {
            console.error("[AvatarMixer] [MyAvatar] Tried to set invalid display name!");
            return;
        }
        this.#_avatarManager.getMyAvatar().displayName = displayName;
    }

    get displayNameChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().displayNameChanged;
    }

    get sessionDisplayName(): string {
        const sessionDisplayName = this.#_avatarManager.getMyAvatar().sessionDisplayName;
        return sessionDisplayName !== null ? sessionDisplayName : "";
    }

    get sessionDisplayNameChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().sessionDisplayNameChanged;
    }

}

export default MyAvatarInterface;
