//
//  MyAvatar.ts
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioClient from "../audio-client/AudioClient";
import Avatar from "../avatar-renderer/Avatar";
import ClientTraitsHandler from "../avatars/ClientTraitsHandler";
import NodeList from "../networking/NodeList";
import assert from "../shared/assert";
import AvatarConstants from "../shared/AvatarConstants";
import ContextManager from "../shared/ContextManager";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Uuid from "../shared/Uuid";


type DomainSettings = {
    avatars: {
        "min_avatar_height": number,
        "max_avatar_height": number
    }
};


/*@devdoc
 *  The <code>MyAvatar</code> class is concerned with the operation of the user client's avatar.
 *  <p>C++: <code>class MyAvatar : public Avatar</code></p>
 *  @class MyAvatar
 *  @extends Avatar
 *  @extends AvatarData
 *  @extends SpatiallyNestable
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @comment MyAvatar properties.
 *  @property {Signal<MyAvatar~scaleChanged>} scaleChanged - Triggered when the avatar's scale changes. This can be due to the
 *      user changing the scale of their avatar or the domain limiting the scale of their avatar.
 *
 *  @comment Avatar properties - copied from Avatar; do NOT edit here.
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
class MyAvatar extends Avatar {
    // C++  class MyAvatar : public Avatar

    /*@devdoc
     *  Domain server avatar settings.
     *  @typedef {object} MyAvatar.AvatarDomainSettings
     *  @property {number} min_avatar_height - The minimum avatar height permitted in the domain.
     *  @property {number} max_avatar_height - The maximum avatar height permitted in the domain.
     */

    /*@devdoc
     *  Domain server settings.
     *  @typedef {object} MyAvatar.DomainSettings
     *  @property {MyAvatar.AvatarDomainSettings} avatars
     */


    readonly #MAX_DATA_RATE_MBPS = 3;
    readonly #BYTES_PER_KILOBYTE = 1000;
    readonly #KILO_PER_MEGA = 1000;
    readonly #BITS_IN_BYTE = 8;
    readonly #MSECS_PER_SECOND = 1000;

    readonly #maxDataRateBytesPerSeconds = this.#MAX_DATA_RATE_MBPS * this.#BYTES_PER_KILOBYTE * this.#KILO_PER_MEGA
        / this.#BITS_IN_BYTE;

    readonly #maxDataRateBytesPerMilliseconds = this.#maxDataRateBytesPerSeconds / this.#MSECS_PER_SECOND;

    #_nextTraitsSendWindow = 0;

    #_scaleChanged = new SignalEmitter();

    #_audioClient: AudioClient | undefined = undefined;
    #_contextID;


    constructor(contextID: number) {
        // C++  Avatar()
        super(contextID);

        this.#_contextID = contextID;

        // WEBRTC TODO: Address further C++ code.

        this._clientTraitsHandler = new ClientTraitsHandler(this, contextID);

        // WEBRTC TODO: Address further C++ code.

        const nodeList = ContextManager.get(contextID, NodeList) as NodeList;
        const domainHandler = nodeList.getDomainHandler();
        domainHandler.disconnectedFromDomain.connect(this.leaveDomain);

        // WEBRTC TODO: Address further C++ code.
    }


    /*@sdkdoc
      *  Triggered when the avatar's scale changes.
      *  @callback MyAvatar~scaleChanged
      *  @param {number} scale - The new avatar scale.
      */
    get scaleChanged(): Signal {
        // C++  void scaleChanged();
        return this.#_scaleChanged.signal();
    }


    /*@devdoc
     *  Game loop update.
     */
    update(/* deltaTime: number */): void {
        // C++  void MyAvatar:: update(float deltaTime)

        // WEBRTC TODO: Address further C++ code.

        // Cache the AudioClient when and if it is available.
        if (!this.#_audioClient && ContextManager.has(this.#_contextID, AudioClient)) {
            this.#_audioClient = ContextManager.get(this.#_contextID, AudioClient) as AudioClient;
        }
        if (this.#_audioClient) {
            this.setAudioLoudness(this.#_audioClient.getLastInputLoudness());
        }

        // WEBRTC TODO: Address further C++ code.

    }


    // JSDoc is in AvatarData.
    override setSkeletonModelURL(skeletonModelURL: string | null): void {
        // C++  void MyAvatar::setSkeletonModelURL(const QUrl& skeletonModelURL)

        // WEBRTC TODO: Address further C++ code.

        super.setSkeletonModelURL(skeletonModelURL);

        // WEBRTC TODO: Address further C++ code.
    }

    /*@devdoc
     *  Sends the avatar data in an {@link PacketType(1)|AvatarData} packet to the avatar mixer. Also sends avatar traits in a
     *  {@link PacketType(1)|SetAvatarTraits} packet if it is time to.
     *  @param {boolean} sendAll - <code>true</code> to send a full update even if nothing has changed, <code>false</code> to
     *      exclude certain data that hasn't changed since the last send.
     */
    override sendAvatarDataPacket(sendAll = false): number {
        // C++  int sendAvatarDataPacket(bool sendAll)

        let bytesSent = 0;

        const now = Date.now();
        if (now > this.#_nextTraitsSendWindow) {
            if (this.getIdentityDataChanged()) {
                bytesSent += this.sendIdentityPacket();
            }

            assert(this._clientTraitsHandler !== null);
            bytesSent += this._clientTraitsHandler.sendChangedTraitsToMixer();

            // Compute the next send window based on how much data we sent and what
            // data rate we're trying to max at.
            const timeUntilNextSend = bytesSent / this.#maxDataRateBytesPerMilliseconds;
            this.#_nextTraitsSendWindow += timeUntilNextSend;

            // Don't let the next send window lag behind if we're not sending a lot of data.
            if (this.#_nextTraitsSendWindow < now) {
                this.#_nextTraitsSendWindow = now;
            }
        }

        bytesSent += super.sendAvatarDataPacket(sendAll);

        return bytesSent;
    }

    // JSDoc is in AvatarData.
    override setTargetScale(targetScale: number): void {
        // C++  N/A - The native scripting API accomplishes this in a more round-about manner involving the avatar Rig.
        const oldAvatarScale = this.getDomainLimitedScale();
        super.setTargetScale(targetScale);
        const newAvatarScale = this.getDomainLimitedScale();
        if (newAvatarScale !== oldAvatarScale) {
            this.#_scaleChanged.emit(newAvatarScale);
        }
    }

    /*@devdoc
     *  Restricts the avatar scale per settings received from the domain server.
     *  @param {MyAvatar.DomainSettings} domainSettings - The domain settings.
     */
    restrictScaleFromDomainSettings(domainSettingsObject: DomainSettings): void {
        // C++  void restrictScaleFromDomainSettings(const QJsonObject& domainSettingsObject)
        const oldDomainLimitedScale = this.getDomainLimitedScale();

        const settingMinHeight = domainSettingsObject.avatars.min_avatar_height;
        this.setDomainMinimumHeight(settingMinHeight);

        const settingMaxHeight = domainSettingsObject.avatars.max_avatar_height;
        this.setDomainMaximumHeight(settingMaxHeight);

        // Make sure that the domain owner didn't flip min and max.
        if (this._domainMinimumHeight > this._domainMaximumHeight) {
            const temp = this._domainMinimumHeight;
            this._domainMinimumHeight = this._domainMaximumHeight;
            this._domainMaximumHeight = temp;
        }

        // The Web SDK doesn't use settings to store the "real" target scale so don't overwrite it.

        // Animating scale is not part of the Web SDK's responsibility.

        console.log(`[MyAvatar] This domain requires a minimum avatar height of ${this._domainMinimumHeight}`,
            `and a maximum avatar height of ${this._domainMaximumHeight}.`);

        // The Web SDK doesn't use an internal modelScale because the (possibly animated) scaling of the actual avatar model
        // is the app's responsibility. Instead, we directly check whether the scale has changed here.
        const newDomainLimitedScale = this.getDomainLimitedScale();
        if (newDomainLimitedScale !== oldDomainLimitedScale) {
            this.#_scaleChanged.emit(newDomainLimitedScale);
        }

        // Handling collisions are not part of the Web SDK's responsibility.

        // WEBRTC TODO: Address further C++ code - physics.
    }

    /*@devdoc
     *  Clears avatar scale restrictions.
     *  @function MyAvatar.clearScaleRestriction
     */
    clearScaleRestriction(): void {
        // C++  void MyAvatar::clearScaleRestriction()
        this._domainMinimumHeight = AvatarConstants.MIN_AVATAR_HEIGHT;
        this._domainMaximumHeight = AvatarConstants.MAX_AVATAR_HEIGHT;

        // WEBRTC TODO: Address further C++ code - physics.
    }


    /*@devdoc
     *  Sets the user client's (avatar's) session UUID and updates avatar attachments' links to it.
     *  @function MyAvatar.setSessionUUID
     *  @type {Slot}
     *  @param {Uuid} sessionUUID - The session UUID. If {@link Uuid(1)|Uuid.NULL} then the session UUID is set to
     *      {@link Uuid(1)|Uuid.AVATAR_SELF_ID}.
     */
    // Slot
    override setSessionUUID = (sessionUUID: Uuid): void => {
        // C++  void setSessionUUID(const QUuid& sessionUUID)
        super.setSessionUUID(sessionUUID);

        // WEBRTC TODO: Address further C++ code - avatar entity updates.

    };


    /*@devdoc
     *  Performs actions that should be done when the user leaves the current domain.
     *  @function MyAvatar.leaveDomain
     *  @type {Slot}
     */
    // Slot
    leaveDomain = (): void => {
        // C++  void MyAvatar:: leaveDomain()
        this.clearScaleRestriction();

        // The Web SDK doesn't save settings.
        // saveAvatarScale();

        // WEBRTC TODO: Address further C++ code - reset instanced avatar traits.
    };


}

export default MyAvatar;
