//
//  Avatar.ts
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarData from "../avatars/AvatarData";
import AvatarConstants from "../shared/AvatarConstants";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";


/*@devdoc
 *  The <code>Avatar</code> class is concerned with the interaction of an avatar with the domain and other avatars.
 *  <p>C++: <code>class Avatar : public AvatarData, public ModelProvider, public MetaModelPayload</code></p>
 *  @class Avatar
 *  @extends AvatarData
 *  @extends SpatiallyNestable
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @property {string|null} displayName - The avatar's display name.
 *  @property {Signal<AvatarData~displayNameChanged>} displayNameChanged - Triggered when the avatar's display name changes.
 *  @property {string|null} sessionDisplayName - The avatar's session display name as assigned by the avatar mixer. It is based
 *      on the display name and is unique among all avatars present in the domain. <em>Read-only.</em>
 *  @property {Signal<AvatarData~sessionDisplayNameChanged>} sessionDisplayNameChanged - Triggered when the avatar's session
 *      display name changes.
 *  @property {string|null} skeletonModelURL - The URL of the avatar's FST, glTF, or FBX model file.
 *  @property {Signal<AvatarData~skeletonModelURLChanged>} skeletonModelURLChanged - Triggered when the avatar's skeleton model
 *      URL changes.
 *  @property {vec3} position - The position of the avatar in the domain.
 *  @property {quat} orientation - The orientation of the avatar in the domain.
 *
 *  @property {Signal<Avatar~targetScaleChanged>} targetScaleChanged - Triggered when the avatar's target scale changes.
 */
class Avatar extends AvatarData {
    // C++  class Avatar : public AvatarData, public ModelProvider, public MetaModelPayload

    #_initialized = false;

    #_targetScaleChanged = new SignalEmitter();


    constructor(contextID: number) {  // eslint-disable-line @typescript-eslint/no-useless-constructor
        // C++  Avatar()
        super(contextID);

        // WEBRTC TODO: Address further C++ code.
    }


    /*@sdkdoc
     *  Triggered when the avatar's target scale changes.
     *  @callback Avatar~targetScaleChanged
     *  @param {number} targetScale - The new target avatar scale.
     */
    get targetScaleChanged(): Signal {
        return this.#_targetScaleChanged.signal();
    }


    /*@devdoc
     *  Marks the avatar as having been initialized.
     */
    init(): void {
        // C++  void init()
        // No call to getHead().init() because it is an empty method.
        this.#_initialized = true;
    }

    /*@devdoc
     *  Gets whether the avatar has been initialized.
     *  @returns {boolean} <code>true</code> if the avatar has been initialized, <code>false</code> if it hasn't.
     */
    isInitialized(): boolean {
        // C++  bool isInitialized()
        return this.#_initialized;
    }

    /*@devdoc
     *  Declines to set the avatar's session display name.
     *  @returns {string|null} - The avatar's session display name.
     */
    // eslint-disable-next-line
    // @ts-ignore
    override setSessionDisplayName(sessionDisplayName: string | null): void {  // eslint-disable-line
        // C++  virtual void setSessionDisplayName(const QString& sessionDisplayName) override
        // No-op.
    }

    // JSDoc is in AvatarData.
    override setSkeletonModelURL(skeletonModelURL: string | null): void {
        // C++  void Avatar::setSkeletonModelURL(const QUrl& skeletonModelURL)

        super.setSkeletonModelURL(skeletonModelURL);

        // WEBRTC TODO: Address further C++ code.
    }

    // JSDoc is in AvatarData.
    override setTargetScale(targetScale: number): void {
        const newValue = Math.max(AvatarConstants.MIN_AVATAR_SCALE, Math.min(targetScale, AvatarConstants.MAX_AVATAR_SCALE));
        if (this._targetScale !== newValue) {
            this._targetScale = newValue;
            this._scaleChanged = Date.now();
            this._avatarScaleChanged = this._scaleChanged;

            // WEBRTC TODO: Address further C++ - _isAnimatingScale.
            // WEBRTC TODO: Address further C++ - _multiSphereShapes.

            this.#_targetScaleChanged.emit(this._targetScale);
        }
    }


    // eslint-disable-next-line class-methods-use-this
    protected override maybeUpdateSessionDisplayNameFromTransport(sessionDisplayName: string | null): void {
        // C++  void maybeUpdateSessionDisplayNameFromTransport(const QString& sessionDisplayName)
        this._sessionDisplayName = sessionDisplayName;
        this._sessionDisplayNameChanged.emit();
        // WEBRTC TODO: Address further C++ code - sessionDisplayNameChanged signal.
    }

}

export default Avatar;
