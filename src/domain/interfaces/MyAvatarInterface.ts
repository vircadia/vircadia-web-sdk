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
import AddressManager from "../networking/AddressManager";
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
 *  @comment Don't document the constructor because it shouldn't be used in the SDK.
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
 *      <em>Read-only.</em>
 *  @property {SkeletonJoint[]} skeleton - Information on the avatar's skeleton.
 *  @property {Signal<MyAvatarInterface~skeletonChanged>} skeletonChanged - Triggered when the avatar's skeleton changes.
 *      <em>Read-only.</em>
 *  @property {number} scale=1.0 - The scale of the avatar. The value can be set to a target value in the range
 *      <code>0.005</code> &mdash; <code>1000.0</code>, however when the scale value is fetched, it may temporarily be limited
 *      by the current domain's settings.
 *  @property {Signal<MyAvatarInterface~scaleChanged>} scaleChanged - Triggered when the avatar's scale changes. This can be
 *      due to the user changing the scale of their avatar or the domain limiting the scale of their avatar.
 *      <em>Read-only.</em>
 *  @property {number} targetScale=1.0 - The target scale of the avatar, <code>0.005</code> &mdash; <code>1000.0</code>. Unlike
 *      <code>scale</code>, this value is not limited by the domain's settings.
 *  @property {Signal<MyAvatarInterface~targetScaleChanged>} targetScaleChanged - Triggered when the avatar's target scale
 *      changes.
 *      <em>Read-only.</em>
 *  @property {vec3} position - The position of the avatar in the domain.
 *  @property {quat} orientation - The orientation of the avatar in the domain.
 *  @property {Signal<MyAvatarInterface~locationChangeRequired>} locationChangeRequired - Triggered when the avatar's location
 *      should change to that of a path looked up on the domain (set in the domain server's settings).
 *  @property {Array<quat|null>} jointRotations - The avatar's joint rotations.
 *      The rotations are relative to avatar space (i.e., not relative to parent bones).
 *      A rotation value of <code>null</code> means that the skeleton's default rotation for that joint should be used.
 *      <p><strong>Warning:</strong> Gets and sets the internal data structure used for joint rotations. This is done for speed
 *      of operation and convenience (you can update individual rotation values without setting the property value again).</p>
 *  @property {Array<vec3|null>} jointTranslations - The avatar's joint translations.
 *      The translations are relative to their parents, in model coordinates.
 *      A translation value of <code>null</code> means that the skeleton's default translation for that joint should be used.
 *      <p><strong>Warning:</strong> These coordinates are not necessarily in meters.</p>
 *      <p><strong>Warning:</strong> Gets and sets the internal data structure used for joint translations. This is done for
 *      speed of operation and convenience (you can update individual translation values without setting the property value
 *      again).</p>
 */
class MyAvatarInterface {
    // C++  The user scripting interface for the MyAvatar class.

    #_avatarManager;
    #_addressManager;


    constructor(contextID: number) {
        this.#_avatarManager = ContextManager.get(contextID, AvatarManager) as AvatarManager;
        this.#_addressManager = ContextManager.get(contextID, AddressManager) as AddressManager;
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

    get skeleton(): SkeletonJoint[] {
        return JSON.parse(JSON.stringify(  // Return a copy.
            this.#_avatarManager.getMyAvatar().getSkeletonData())
        ) as SkeletonJoint[];
    }

    set skeleton(skeleton: SkeletonJoint[]) {
        let isValidParam = skeleton instanceof Array && skeleton.length > 0;
        if (isValidParam) {
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

        this.#_avatarManager.getMyAvatar().setSkeletonData(
            JSON.parse(JSON.stringify(skeleton)) as SkeletonJoint[]  // Make a copy.
        );
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
        return Vec3.copy(this.#_avatarManager.getMyAvatar().getWorldPosition());
    }

    set position(position: vec3) {
        if (!Vec3.valid(position)) {
            console.error("[AvatarMixer] [MyAvatar] Tried to set an invalid position value!", JSON.stringify(position));
            return;
        }
        this.#_avatarManager.getMyAvatar().setWorldPosition(Vec3.copy(position));
    }

    get orientation(): quat {
        return Quat.copy(this.#_avatarManager.getMyAvatar().getWorldOrientation());
    }

    set orientation(orientation: quat) {
        if (!Quat.valid(orientation)) {
            console.error("[AvatarMixer] [MyAvatar] Tried to set an invalid orientation value!", JSON.stringify(orientation));
            return;
        }
        this.#_avatarManager.getMyAvatar().setWorldOrientation(Quat.copy(orientation));
    }

    /*@sdkdoc
     *  Triggered when the avatar's location should change to that of a path looked up on the domain (set in the domain
     *  server's settings).
     *  @callback MyAvatarInterface~locationChangeRequired
     *  @param {vec3} newPosition - The position that the avatar should go to.
     *  @param {boolean} hasNewOrientation - <code>true</code> if the avatar should also change orientation,
     *      <code>false</code> if it shouldn't.
     *  @param {quat} newOrientation - The new orientation to use if <code>hasNewOrientation == true</code>.
     *  @param {boolean} shouldFaceLocation - <code>true</code> if the avatar should be positioned a short distance away from
     *      the <code>newPosition</code> and be orientated to face the position.
     */
    get locationChangeRequired(): Signal {
        return this.#_addressManager.locationChangeRequired;
    }

    get jointRotations(): (quat | null)[] {
        // WARNING: Gets the internal data structure rather than returning a copy of it.
        // This is intentionally done for SDK usage convenience and speed.
        return this.#_avatarManager.getMyAvatar().getJointRotations();
    }

    set jointRotations(jointRotations: (quat | null)[]) {
        // WARNING: Sets the internal data structure rather than making a copy of the parameter.
        // This is intentionally done for SDK usage convenience and speed.
        this.#_avatarManager.getMyAvatar().setJointRotations(jointRotations);
    }

    get jointTranslations(): (vec3 | null)[] {
        // WARNING: Gets the internal data structure rather than returning a copy of it.
        // This is intentionally done for SDK usage convenience and speed.
        return this.#_avatarManager.getMyAvatar().getJointTranslations();

    }

    set jointTranslations(jointTranslations: (vec3 | null)[]) {
        // WARNING: Sets the internal data structure rather than making a copy of the parameter.
        // This is intentionally done for SDK usage convenience and speed.
        this.#_avatarManager.getMyAvatar().setJointTranslations(jointTranslations);
    }

}

export default MyAvatarInterface;
