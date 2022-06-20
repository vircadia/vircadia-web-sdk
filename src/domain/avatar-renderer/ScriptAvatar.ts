//
//  ScriptAvatar.ts
//
//  Created by David Rowe on 11 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarData from "../avatars/AvatarData";
import { SkeletonJoint } from "../avatars/AvatarTraits";
import assert from "../shared/assert";
import Quat, { quat } from "../shared/Quat";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Vec3, { vec3 } from "../shared/Vec3";


/*@sdkdoc
 *  The <code>ScriptAvatar</code> class provides facilities for working with an avatar in the domain.
 *  <p>Create on object of this class by using the {@link AvatarListInterface|AvatarListInterface.getAvatar} method.</p>
 *
 *  @class ScriptAvatar
 *  @hideconstructor
 *
 *  @property {boolean} isValid - <code>true</code> if the avatar is valid (i.e., was found when the object was created and is
 *      still present in the domain), <code>false</code> if it isn't.
 *      <em>Read-only.</em>
 *  @property {string} displayName - The avatar's display name. <code>""</code> if the avatar doesn't exist.
 *      <em>Read-only.</em>
 *  @property {Signal<ScriptAvatar~displayNameChanged>} displayNameChanged - Triggered when the display name changes.
 *      <em>Read-only.</em>
 *  @property {string} sessionDisplayName - The avatar's session display name, assigned by the domain server based on the
 *      avatar display name. It is unique among all avatars present in the domain. <code>""</code> if the avatar doesn't exist.
 *      <em>Read-only.</em>
 *  @property {Signal<ScriptAvatar~sessionDisplayNameChanged>} sessionDisplayNameChanged - Triggered when the session display
 *      name changes.
 *      <em>Read-only.</em>
 *  @property {string} skeletonModelURL - The URL of the avatar's FST, glTF, or FBX model file.
 *      <em>Read-only.</em>
 *  @property {Signal<ScriptAvatar~skeletonModelURLChanged>} skeletonModelURLChanged - Triggered when the skeleton model URL
 *      changes.
 *      <em>Read-only.</em>
 *  @property {SkeletonJoint[]} skeleton - Information on the avatar's skeleton. <code>[]</code> if the avatar doesn't exist.
 *      <em>Read-only.</em>
 *  @property {Signal<ScriptAvatar~skeletonChanged>} skeletonChanged - Triggered when the avatar's skeleton changes.
 *      <em>Read-only.</em>
 *  @property {number} scale - The scale of the avatar. This includes any limits on permissible values imposed by the domain.
 *      <code>0.0</code> if the avatar doesn't exist.
 *      <em>Read-only.</em>
 *  @property {Signal<ScriptAvatar~scaleChanged>} scaleChanged - Triggered when the avatar's scale changes. This can be
 *      due to the user changing the scale of their avatar or the domain limiting the scale of their avatar.
 *  @property {vec3} position - The position of the avatar in the domain. {@link Vec3|Vec3.ZERO} if the avatar doesn't exist.
 *      <em>Read-only.</em>
 *  @property {quat} orientation - The orientation of the avatar in the domain. {@link Quat|Quat.IDENTITY} if the avatar doesn't
 *      exist.
 *      <em>Read-only.</em>
 *  @property {Array<quat|null>} jointRotations - The joint rotations relative to avatar space (i.e., not relative to parent
 *      bones). If a rotation is <code>null</code> then the rotation of the avatar's default pose should be used.
 *      <code>[]</code> if the avatar doesn't exist.
 *  @property {Array<vec3|null>} jointTranslations - The bone translations relative to their parent joints. If a translation is
 *      <code>null</code> then the translation of the avatar's default pose should be used.
 *      <code>[]</code> if the avatar doesn't exist.<br />
 *      <strong>Warning:</strong> The coordinate system is not necessarily meters.
 *  @property {Array<boolean>} jointRotationsUseDefault - <code>true</code> if the skeleton's default joint rotation should be
 *      used instead of the value (if any) in <code>jointRotations</code>.<br />
 *      Note: Normally, a <code>true</code> value will match a <code>null</code> joint rotation value.
 *      <code>[]</code> if the avatar doesn't exist.
 *  @property {Array<boolean>} jointTranslationsUseDefault - <code>true</code> if the skeleton's default joint translation
 *      should be used instead of the value (if any) in <code>jointTranslations</code>.<br />
 *      Note: Normally, a <code>true</code> value will match a <code>null</code> joint translation value.
 *      <code>[]</code> if the avatar doesn't exist.
 */
// Don't document the constructor because it shouldn't be used in the SDK.
class ScriptAvatar {
    // C++  ScriptAvatar : public ScriptAvatarData

    #_avatarData: WeakRef<AvatarData> | null;


    constructor(avatar: AvatarData | null) {
        assert(avatar === null || avatar instanceof AvatarData);
        if (avatar === null) {
            this.#_avatarData = null;
        } else {
            this.#_avatarData = new WeakRef(avatar);
        }
    }


    get isValid(): boolean {
        // C++  N/A
        return this.#_avatarData !== null && this.#_avatarData.deref() !== undefined;
    }

    get displayName(): string {
        // C++  QString ScriptAvatarData::getDisplayName()
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.getDisplayName() ?? "";
            }
        }
        return "";
    }

    /*@sdkdoc
     *  Triggered when the avatar's display name changes.
     *  @callback ScriptAvatar~displayNameChanged
     */
    get displayNameChanged(): Signal {
        // C++  void ScriptAvatarData::displayNameChanged();
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.displayNameChanged;
            }
        }
        return new SignalEmitter().signal();
    }

    get sessionDisplayName(): string {
        // C++  QString ScriptAvatarData::getSessionDisplayName()
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.getSessionDisplayName() ?? "";
            }
        }
        return "";
    }

    /*@sdkdoc
     *  Triggered when the avatar's session display name changes.
     *  @callback ScriptAvatar~sessionDisplayNameChanged
     */
    get sessionDisplayNameChanged(): Signal {
        // C++  void ScriptAvatarData::sessionDisplayNameChanged();
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.sessionDisplayNameChanged;
            }
        }
        return new SignalEmitter().signal();
    }

    get skeletonModelURL(): string {
        // C++  QString ScriptAvatarData::getSkeletonModelURLFromScript()
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.getSkeletonModelURL() ?? "";
            }
        }
        return "";
    }

    /*@sdkdoc
     *  Triggered when the avatar's skeleton model URL changes.
     *  @callback ScriptAvatar~skeletonModelURLChanged
     */
    get skeletonModelURLChanged(): Signal {
        // C++  void ScriptAvatarData::skeletonModelURLChanged();
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.skeletonModelURLChanged;
            }
        }
        return new SignalEmitter().signal();
    }

    get skeleton(): SkeletonJoint[] | null {
        // C++  No direct equivalent.
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.getSkeletonData() ?? [];
            }
        }
        return [];
    }

    /*@sdkdoc
     *  Triggered when the avatar's skeleton changes.
     *  @callback ScriptAvatar~skeletonChanged
     */
    get skeletonChanged(): Signal {
        // C++  No direct equivalent.
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.skeletonChanged;
            }
        }
        return new SignalEmitter().signal();
    }

    get scale(): number {
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.getTargetScale();
            }
        }
        return 0;
    }

    /*@sdkdoc
     *  Triggered when the avatar's scale changes.
     *  @callback ScriptAvatar~scaleChanged
     *  @param {number} The new avatar scale.
     */
    get scaleChanged(): Signal {
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                return avatar.targetScaleChanged;
            }
        }
        return new SignalEmitter().signal();
    }

    get position(): vec3 {
        // C++  glm::vec3 ScriptAvatarData::getPosition()
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                // A reference to the internal value is returned but this is OK because the internal value will keep being
                // recreated.
                return avatar.getWorldPosition();
            }
        }
        return Vec3.ZERO;
    }

    get orientation(): quat {
        // C++  glm::quat ScriptAvatarData::getOrientation()
        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                // A reference to the internal value is returned but this is OK because the internal value will keep being
                // recreated.
                return avatar.getWorldOrientation();
            }
        }
        return Quat.IDENTITY;
    }

    get jointRotations(): (quat | null)[] {
        // C++  QVector<glm::quat> ScriptAvatarData::getJointRotations()

        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                // A reference to the internal value is returned but this is OK because the internal value will keep being
                // recreated.
                return avatar.getJointRotations();
            }
        }
        return [];
    }

    get jointTranslations(): (vec3 | null)[] {
        // C++  QVector<glm::vec3> ScriptAvatarData::getJointTranslations()

        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                // A reference to the internal value is returned but this is OK because the internal value will keep being
                // recreated.
                return avatar.getJointTranslations();
            }
        }
        return [];
    }

    get jointRotationsUseDefault(): boolean[] {
        // C++  N/A

        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                // A reference to the internal value is returned but this is OK because the internal value will keep being
                // recreated.
                return avatar.getJointRotationsUseDefault();
            }
        }
        return [];
    }

    get jointTranslationsUseDefault(): boolean[] {
        // C++  N/A

        if (this.#_avatarData) {
            const avatar = this.#_avatarData.deref();
            if (avatar) {
                // A reference to the internal value is returned but this is OK because the internal value will keep being
                // recreated.
                return avatar.getJointTranslationsUseDefault();
            }
        }
        return [];
    }

}

export default ScriptAvatar;
