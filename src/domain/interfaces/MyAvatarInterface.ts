//
//  MyAvatarInterface.ts
//
//  Created by David Rowe on 31 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { SkeletonJoint } from "../avatars/AvatarTraits";
import AvatarConstants from "../shared/AvatarConstants";
import ContextManager from "../shared/ContextManager";
import Quat, { quat } from "../shared/Quat";
import { Signal } from "../shared/SignalEmitter";
import Vec3, { vec3 } from "../shared/Vec3";
import AvatarManager from "../AvatarManager";


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
 *  @property {string} skeletonModelURL - The URL of the avatar's FST, glTF, or FBX model file.
 *  @property {Signal<MyAvatarInterface~skeletonModelURLChanged>} skeletonModelURLChanged - Triggered when the avatar's skeleton
 *      model URL changes.
 *  @property {number} scale=1.0 - The scale of the avatar. The value can be set to a target value in the range
 *      <code>0.005</code> &mdash; <code>1000.0</code>, however when the scale value is fetched, it may temporarily be limited
 *      by the current domain's settings.
 *  @property {Signal<MyAvatarInterface~scaleChanged>} scaleChanged - Triggered when the avatar's scale changes. This can be
 *      due to the user changing the scale of their avatar or the domain limiting the scale of their avatar.
 *  @property {number} targetScale=1.0 - The target scale of the avatar, <code>0.005</code> &mdash; <code>1000.0</code>. Unlike
 *      <code>scale</code>, this value is not limited by the domain's settings.
 *  @property {Signal<MyAvatarInterface~targetScaleChanged>} targetScaleChanged - Triggered when the avatar's target scale
 *      changes.
 *  @property {vec3} position - The position of the avatar in the domain.
 *  @property {quat} orientation - The orientation of the avatar in the domain.
 *  @property {SkeletonJoint[]|null} skeleton - Information on the avatar's skeleton. <code>null</code> if the avatar doesn't
 *      exist.
 *  @property {Signal<MyAvatarInterface~skeletonChanged>} skeletonChanged - Triggered when the avatar's skeleton changes.
 */
// Don't document the constructor because it shouldn't be used in the SDK.
class MyAvatarInterface {
    // C++  The user scripting interface for the MyAvatar class.

    #_avatarManager;


    constructor(contextID: number) {
        this.#_avatarManager = ContextManager.get(contextID, AvatarManager) as AvatarManager;
    }


    get displayName(): string {
        return this.#_avatarManager.getMyAvatar().getDisplayName() ?? "";
    }

    set displayName(displayName: string) {
        if (typeof displayName !== "string") {
            console.error("[AvatarMixer] [MyAvatar] Tried to set invalid display name!", JSON.stringify(displayName));
            return;
        }
        this.#_avatarManager.getMyAvatar().setDisplayName(displayName);
    }

    /*@sdkdoc
     *  Triggered when the avatar's display name changes.
     *  @callback MyAvatarInterface~displayNameChanged
     */
    get displayNameChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().displayNameChanged;
    }

    get sessionDisplayName(): string {
        return this.#_avatarManager.getMyAvatar().getSessionDisplayName() ?? "";
    }

    /*@sdkdoc
     *  Triggered when the avatar's session display name changes.
     *  @callback MyAvatarInterface~sessionDisplayNameChanged
     */
    get sessionDisplayNameChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().sessionDisplayNameChanged;
    }

    get skeletonModelURL(): string {
        return this.#_avatarManager.getMyAvatar().getSkeletonModelURL() ?? "";
    }

    set skeletonModelURL(skeletonModelURL: string) {
        if (typeof skeletonModelURL !== "string") {
            console.error("[AvatarMixer] [MyAvatar] Tried to set invalid skeleton model URL!",
                JSON.stringify(skeletonModelURL));
            return;
        }
        this.#_avatarManager.getMyAvatar().setSkeletonModelURL(skeletonModelURL);
    }

    /*@sdkdoc
     *  Triggered when the avatar's skeleton model URL changes.
     *  @callback MyAvatarInterface~skeletonModelURLChanged
     */
    get skeletonModelURLChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().skeletonModelURLChanged;
    }

    get skeleton(): SkeletonJoint[] | null {
        return this.#_avatarManager.getMyAvatar().getSkeletonData();
    }

    set skeleton(skeleton: SkeletonJoint[] | null) {
        let isValidParam = skeleton instanceof Array && skeleton.length > 0 || skeleton === null;
        if (isValidParam && skeleton !== null) {
            let i = 0;
            const length = skeleton.length;
            while (isValidParam && i < length) {
                const skeletonJoint = skeleton[i];
                isValidParam = skeletonJoint !== undefined
                    && skeletonJoint instanceof Object
                    && Object.keys(skeletonJoint).length === 7  // eslint-disable-line @typescript-eslint/no-magic-numbers
                    && typeof skeletonJoint.jointName === "string"
                    && typeof skeletonJoint.jointIndex === "number"
                    && typeof skeletonJoint.parentIndex === "number"
                    && typeof skeletonJoint.boneType === "number"
                    && Vec3.valid(skeletonJoint.defaultTranslation)
                    && Quat.valid(skeletonJoint.defaultRotation)
                    && typeof skeletonJoint.defaultScale === "number";
                i += 1;
            }
        }
        if (!isValidParam) {
            const skeletonString = JSON.stringify(skeleton);
            const MAX_STRING_LENGTH = 100;
            console.error("[AvatarMixer] [MyAvatar] Tried to set invalid skeleton!",
                skeletonString.slice(0, MAX_STRING_LENGTH) + (skeletonString.length > MAX_STRING_LENGTH ? "..." : ""));
            return;
        }
        this.#_avatarManager.getMyAvatar().setSkeletonData(skeleton !== null
            ? JSON.parse(JSON.stringify(skeleton)) as SkeletonJoint[]  // Make a copy.
            : null);
    }

    /*@sdkdoc
     *  Triggered when the avatar's skeleton changes.
     *  @callback MyAvatarInterface~skeletonChanged
     */
    get skeletonChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().skeletonChanged;
    }

    get scale(): number {
        // C++  MyAvatar::scale
        return this.#_avatarManager.getMyAvatar().getDomainLimitedScale();
    }

    set scale(scale: number) {
        // C++  MyAvatar::scale
        if (typeof scale !== "number") {
            console.error("[AvatarMixer] [MyAvatar] Tried to set invalid scale!", JSON.stringify(scale));
            return;
        }
        if (scale < AvatarConstants.MIN_AVATAR_SCALE || scale > AvatarConstants.MAX_AVATAR_SCALE) {
            console.warn("[AvatarMixer] [MyAvatar] Tried to set an out of range targetScale value.", scale);
        }
        this.#_avatarManager.getMyAvatar().setTargetScale(Math.max(AvatarConstants.MIN_AVATAR_SCALE,
            Math.min(scale, AvatarConstants.MAX_AVATAR_SCALE)));
    }

    /*@sdkdoc
     *  Triggered when the avatar's scale changes.
     *  @callback MyAvatarInterface~scaleChanged
     *  @param {number} scale - The avatar's scale.
     */
    get scaleChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().scaleChanged;
    }

    get targetScale(): number {
        return this.#_avatarManager.getMyAvatar().getTargetScale();
    }

    set targetScale(targetScale: number) {
        if (typeof targetScale !== "number") {
            console.error("[AvatarMixer] [MyAvatar] Tried to set invalid targetScale!", JSON.stringify(targetScale));
            return;
        }
        if (targetScale < AvatarConstants.MIN_AVATAR_SCALE || targetScale > AvatarConstants.MAX_AVATAR_SCALE) {
            console.warn("[AvatarMixer] [MyAvatar] Tried to set an out of range targetScale value.", targetScale);
        }
        this.#_avatarManager.getMyAvatar().setTargetScale(Math.max(AvatarConstants.MIN_AVATAR_SCALE,
            Math.min(targetScale, AvatarConstants.MAX_AVATAR_SCALE)));
    }

    /*@sdkdoc
     *  Triggered when the avatar's target scale changes.
     *  @callback MyAvatarInterface~targetScaleChanged
     *  @param {number} targetScale - The avatar's target scale.
     */
    get targetScaleChanged(): Signal {
        return this.#_avatarManager.getMyAvatar().targetScaleChanged;
    }

    get position(): vec3 {
        return this.#_avatarManager.getMyAvatar().getWorldPosition();
    }

    set position(position: vec3) {
        if (!Vec3.valid(position)) {
            console.error("[AvatarMixer] [MyAvatar] Tried to set an invalid position value!", JSON.stringify(position));
            return;
        }
        this.#_avatarManager.getMyAvatar().setWorldPosition(position);
    }

    get orientation(): quat {
        return this.#_avatarManager.getMyAvatar().getWorldOrientation();
    }

    set orientation(orientation: quat) {
        if (!Quat.valid(orientation)) {
            console.error("[AvatarMixer] [MyAvatar] Tried to set an invalid orientation value!", JSON.stringify(orientation));
            return;
        }
        this.#_avatarManager.getMyAvatar().setWorldOrientation(orientation);
    }

}

export default MyAvatarInterface;
