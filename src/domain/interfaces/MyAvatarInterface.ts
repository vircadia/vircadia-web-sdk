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
import Quat, { quat } from "../shared/Quat";
import { Signal } from "../shared/SignalEmitter";
import Vec3, { vec3 } from "../shared/Vec3";


/*@sdkdoc
 *  The <code>MyAvatarInterface</code> namespace provides facilities for using the user client's avatar. It is provided as the
 *  <code>myAvatar</code> property of the {@link AvatarMixer} class.
 *  @namespace MyAvatarInterface
 *
 *  @property {string} displayName - The user client's avatar display name.
 *  @property {Signal<MyAvatarInterface~displayNameChanged>} displayNameChanged - Triggered when the display name changes.
 *      <em>Read-only.</em>
 *  @property {string} sessionDisplayName - The user client's session display name, assigned by the domain server based on the
 *      avatar display name. It is unique among all avatars present in the domain. <em>Read-only.</em>
 *  @property {Signal<MyAvatarInterface~sessionDisplayNameChanged>} sessionDisplayNameChanged - Triggered when the session
 *      display name changes.
 *      <em>Read-only.</em>
 *  @property {vec3} position - The position of the avatar in the domain.
 *  @property {quat} orientation - The orientation of the avatar in the domain.
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
            console.error("[AvatarMixer] [MyAvatar] Tried to set invalid display name!", JSON.stringify(displayName));
            return;
        }
        this.#_avatarManager.getMyAvatar().displayName = displayName;
    }

    /*@sdkdoc
     *  Triggered when the avatar's display name changes.
     *  @callback MyAvatarInterface~displayNameChanged
     */
    get displayNameChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().displayNameChanged;
    }

    get sessionDisplayName(): string {
        const sessionDisplayName = this.#_avatarManager.getMyAvatar().sessionDisplayName;
        return sessionDisplayName !== null ? sessionDisplayName : "";
    }

    /*@sdkdoc
     *  Triggered when the avatar's session display name changes.
     *  @callback MyAvatarInterface~sessionDisplayNameChanged
     */
    get sessionDisplayNameChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().sessionDisplayNameChanged;
    }

    get position(): vec3 {
        return this.#_avatarManager.getMyAvatar().position;
    }

    set position(position: vec3) {
        if (!Vec3.valid(position)) {
            console.error("[AvatarMixer] [MyAvatar] Tried to set an invalid position value!", JSON.stringify(position));
            return;
        }
        this.#_avatarManager.getMyAvatar().position = position;
    }

    get orientation(): quat {
        return this.#_avatarManager.getMyAvatar().orientation;
    }

    set orientation(orientation: quat) {
        if (!Quat.valid(orientation)) {
            console.error("[AvatarMixer] [MyAvatar] Tried to set an invalid orientation value!", JSON.stringify(orientation));
            return;
        }
        this.#_avatarManager.getMyAvatar().orientation = orientation;
    }

    get skeletonModelURL(): string {
        const skeletonModelURL = this.#_avatarManager.getMyAvatar().skeletonModelURL;
        return skeletonModelURL !== null ? skeletonModelURL : "";
    }

    set skeletonModelURL(skeletonModelURL: string) {
        if (typeof skeletonModelURL !== "string") {
            console.error("[AvatarMixer] [MyAvatar] Tried to set invalid skeleton URL!", JSON.stringify(skeletonModelURL));
            return;
        }
        this.#_avatarManager.getMyAvatar().skeletonModelURL = skeletonModelURL;
    }


}

export default MyAvatarInterface;
