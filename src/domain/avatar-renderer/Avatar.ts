//
//  Avatar.ts
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarData from "../avatars/AvatarData";
import AvatarConstants from "../shared/AvatarConstants";


/*@devdoc
 *  The <code>Avatar</code> class is concerned with the interaction of an avatar with the domain and other avatars.
 *  <p>C++: <code>class Avatar : public AvatarData, public ModelProvider, public MetaModelPayload</code></p>
 *  @class Avatar
 *  @extends AvatarData
 *  @extends SpatiallyNestable
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @comment Avatar properties.
 *  @comment None.
 *
 *  @comment AvatarData properties - copied from AvatarData; do NOT edit here.
 *  @property {Signal<AvatarData~displayNameChanged>} displayNameChanged - Triggered when the avatar's display name changes.
 *  @property {Signal<AvatarData~sessionDisplayNameChanged>} sessionDisplayNameChanged - Triggered when the avatar's session
 *      display name changes.
 *  @property {Signal<AvatarData~skeletonModelURLChanged>} skeletonModelURLChanged - Triggered when the avatar's skeleton model
 *      URL changes.
 *  @property {Signal<AvatarData~skeletonChanged>} skeletonChanged - Triggered when the avatar's skeleton changes.
 *  @property {Signal<AvatarData~targetScaleChanged>} targetScaleChanged - Triggered when the avatar's target scale changes.
 *
 *  @comment SpatiallyNestable properties - copied from SpatiallyNestable; do NOT edit here.
 *  @comment None.
 */
class Avatar extends AvatarData {
    // C++  class Avatar : public AvatarData, public ModelProvider, public MetaModelPayload

    #_initialized = false;

    // The targetScaleChanged signal is implemented in AvatarData because that is where the targetScale member is.
    // #_targetScaleChanged = new SignalEmitter();


    constructor(contextID: number) {  // eslint-disable-line @typescript-eslint/no-useless-constructor
        // C++  Avatar()
        super(contextID);

        // WEBRTC TODO: Address further C++ code.
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
        // C++  void setTargetScale(float targetScale) override
        const newValue = Math.max(AvatarConstants.MIN_AVATAR_SCALE, Math.min(targetScale, AvatarConstants.MAX_AVATAR_SCALE));
        if (this._targetScale !== newValue) {
            this._targetScale = newValue;
            this._scaleChanged = Date.now();
            this._avatarScaleChanged = this._scaleChanged;

            // The Web SDK isn't concerned with animating the avatar's scale changes.

            // WEBRTC TODO: Address further C++ - _multiSphereShapes.

            this._targetScaleChanged.emit(this._targetScale);
        }
    }

    /*@devdoc
     *  Possibly update the session display name from network data: do update in the <code>Avatar</code> class and derived.
     *  @param {string|null} sessionDisplayName The session display name.
     */
    // eslint-disable-next-line class-methods-use-this
    override maybeUpdateSessionDisplayNameFromTransport(sessionDisplayName: string | null): void {
        // C++  void maybeUpdateSessionDisplayNameFromTransport(const QString& sessionDisplayName)
        this._sessionDisplayName = sessionDisplayName;
        this._sessionDisplayNameChanged.emit();
    }

    /*@devdoc
     *  Gets whether the avatar's eye height is able to be measured.
     *  @returns {boolean} <code>true</code> in the <code>Avatar</code> class.
     */
    override canMeasureEyeHeight(): boolean {  // eslint-disable-line class-methods-use-this
        // C++  virtual bool canMeasureEyeHeight() const override
        return true;
    }

    /*@devdoc
     *  Gets the unscaled avatar eye height.
     *  @returns {number} The unscaled avatar eye height.
     */
    override getUnscaledEyeHeight(): number {
        // C++  float getUnscaledEyeHeight() const

        // WEBRTC TODO: Address further C++ - return _unscaledEyeHeightCache.get() instead of the super value.

        return super.getUnscaledEyeHeight();
    }

}

export default Avatar;
