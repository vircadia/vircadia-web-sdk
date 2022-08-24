//
//  AvatarData.ts
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { AvatarIdentityDetails } from "../networking/packets/AvatarIdentity";
import { BulkAvatarDataDetails } from "../networking/packets/BulkAvatarData";
import PacketScribe from "../networking/packets/PacketScribe";
import SequenceNumber from "../networking/udt/SequenceNumber";
import Node from "../networking/Node";
import NodeList from "../networking/NodeList";
import NodeType from "../networking/NodeType";
import assert from "../shared/assert";
import AvatarConstants from "../shared/AvatarConstants";
import ContextManager from "../shared/ContextManager";
import Quat, { quat } from "../shared/Quat";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import SpatiallyNestable, { NestableType } from "../shared/SpatiallyNestable";
import Uuid from "../shared/Uuid";
import Vec3, { vec3 } from "../shared/Vec3";
import AvatarTraits, { SkeletonJoint, TraitType, TraitValue } from "./AvatarTraits";
import ClientTraitsHandler from "./ClientTraitsHandler";


/*@devdoc
 *  The <code>KillAvatarReason</code> namespace provides reasons that an avatar is killed.
 *  @namespace KillAvatarReason
 *  @property {number} NoReason=0 - No reason. <em>Read-only.</em>
 *  @property {number} AvatarDisconnected=1 - Disconnected.<em>Read-only.</em>
 *  @property {number} AvatarIgnored=2 - Avatar is being ignored.<em>Read-only.</em>
 *  @property {number} TheirAvatarEnteredYourBubble=3 - Their avatar entered your bubble.<em>Read-only.</em>
 *  @property {number} YourAvatarEnteredTheirBubble=4 - Your avatar entered their bubble.<em>Read-only.</em>
 */
enum KillAvatarReason {
    // C++  KillAvatarReason
    NoReason = 0,
    AvatarDisconnected,
    AvatarIgnored,
    TheirAvatarEnteredYourBubble,
    YourAvatarEnteredTheirBubble
}

/*@devdoc
 *  The <code>AvatarDataDetail</code> namespace provides level of detail options for an {@link PacketTypeValue|AvatarData}
 *  packet.
 *  @namespace AvatarDataDetail
 *  @property {number} NoData=0 - No data.
 *  @property {number} PALMinimum=1 - Minimum data for "People" appL.
 *  @property {number} MinimumData=2 - Minimum data.
 *  @property {number} CullSmallData=3 - Cull small data.
 *  @property {number} IncludeSmallData=4 - Include small data.
 *  @property {number} SendAllData=5 - Send all data.
 */
enum AvatarDataDetail {
    // C++  AvatarDataDetail
    NoData = 0,
    PALMinimum,
    MinimumData,
    CullSmallData,
    IncludeSmallData,
    SendAllData
}

/*@sdkdoc
 *  The <code>BoneType</code> namespace provides types of bones.
 *  @namespace BoneType
 *  @property {number} SkeletonRoot=0 - Skeleton root.
 *  @property {number} SkeletonChild=1 - Skeleton child.
 *  @property {number} NonSkeletonRoot=2 - Non-skeleton root.
 *  @property {number} NonSkeletonChild=3 - Non-skeleton child.
 */
enum BoneType {
    // C++  BoneType
    SkeletonRoot = 0,
    SkeletonChild,
    NonSkeletonRoot,
    NonSkeletonChild
}


/*@devdoc
 *  The <code>AvatarData</code> class handles the avatar data that is written to and read from Vircadia protocol packets.
 *  <p>C++: <code>AvatarData : public QObject, public SpatiallyNestable</code></p>
 *  @class AvatarData
 *  @extends SpatiallyNestable
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @comment AvatarData properties.
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
class AvatarData extends SpatiallyNestable {
    // C++  class AvatarData : public QObject, public SpatiallyNestable

    protected _sessionDisplayName: string | null = null;
    protected _sessionDisplayNameChanged = new SignalEmitter();

    protected _targetScale = 1.0;
    protected _targetScaleChanged = new SignalEmitter();
    protected _avatarScaleChanged = 0;
    protected _domainMinimumHeight = AvatarConstants.MIN_AVATAR_HEIGHT;
    protected _domainMaximumHeight = AvatarConstants.MAX_AVATAR_HEIGHT;

    protected _globalPosition = Vec3.ZERO;
    protected _clientTraitsHandler: ClientTraitsHandler | null = null;

    // Context
    #_nodeList;

    #_hasProcessedFirstIdentity = false;
    #_identitySequenceNumber = new SequenceNumber(0);  // Avatar identity sequence number.
    #_identityDataChanged = false;
    #_lastToByteArray = 0;

    #_displayName: string | null = null;
    #_displayNameChanged = new SignalEmitter();
    #_lookAtSnappingEnabled = true;
    #_verificationFailed = false;
    #_isReplicated = false;
    #_skeletonModelURL: string | null = null;
    #_skeletonModelURLChanged = new SignalEmitter();
    #_avatarSkeletonData: SkeletonJoint[] = [];
    #_skeletonChanged = new SignalEmitter();  // No C++ equivalent.

    #_audioLoudness = 0;
    #_audioLoudnessChanged = 0;

    // C++  _jointData
    #_jointRotations: (quat | null)[] = [];
    #_jointTranslations: (vec3 | null)[] = [];

    // C++  _lastSentJointData
    #_lastSentJointRotations: (quat | null)[] = [];
    #_lastSentJointTranslations: (vec3 | null)[] = [];


    #_sequenceNumber = 0;  // Avatar data sequence number is a uint16 value.
    readonly #SEQUENCE_NUMBER_MODULO = 65536;  // Sequence number is a uint16.

    readonly #_AVATAR_MIXER_NODE_SET = new Set([NodeType.AvatarMixer]);


    constructor(contextID: number) {
        // C++  AvatarData()
        super(NestableType.Avatar, new Uuid());

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

        // WEBRTC TODO: Address further C++ code.
    }


    /*@sdkdoc
     *  Triggered when the avatar's display name changes.
     *  @callback AvatarData~displayNameChanged
     */
    get displayNameChanged(): Signal {
        return this.#_displayNameChanged.signal();
    }

    /*@sdkdoc
     *  Triggered when the avatar's session display name changes.
     *  @callback AvatarData~sessionDisplayNameChanged
     */
    get sessionDisplayNameChanged(): Signal {
        return this._sessionDisplayNameChanged.signal();
    }

    /*@sdkdoc
     *  Triggered when the avatar's skeleton model URL changes.
     *  @callback AvatarData~skeletonModelURLChanged
     */
    get skeletonModelURLChanged(): Signal {
        return this.#_skeletonModelURLChanged.signal();
    }

    /*@sdkdoc
     *  Triggered when the avatar's skeleton joints change.
     *  @callback AvatarData~skeletonChanged
     */
    get skeletonChanged(): Signal {
        return this.#_skeletonChanged.signal();
    }

    /*@sdkdoc
     *  Triggered when the avatar's target scale changes.
     *  @callback AvatarData~targetScaleChanged
     *  @param {number} targetScale - The new target avatar scale.
     */
    get targetScaleChanged(): Signal {
        return this._targetScaleChanged.signal();
    }


    /*@devdoc
     *  Gets the avatar's session UUID.
     *  @returns {Uuid} The session UUID. {@link Uuid(1)|Uuid.AVATAR_SELF_ID} if not connected.
     */
    getSessionUUID(): Uuid {
        // C++  QUuid getSessionUUID()
        return this.getID();
    }

    /*@devdoc
     *  Sets the user avatar's session UUID.
     *  @param {Uuid} sessionUUID - The session UUID. If {@link Uuid(1)|Uuid.NULL} then the session UUID is set to
     *      {@link Uuid(1)|Uuid.AVATAR_SELF_ID}.
     */
    setSessionUUID(sessionUUID: Uuid): void {
        // C++  void setSessionUUID(const QUuid& sessionUUID)
        if (sessionUUID.value() !== this.getID().value()) {
            if (sessionUUID.value() === Uuid.NULL) {
                this.setID(new Uuid(Uuid.AVATAR_SELF_ID));
            } else {
                this.setID(sessionUUID);
            }

            // WEBRTC TODO: Address further code - provide sessionUUIDChanged signal in SDK API.

        }
    }

    /*@devdoc
     *  Gets the avatar's display name.
     *  @returns {string|null} The avatar's display name.
     */
    getDisplayName(): string | null {
        // C++  QString& getDisplayName()
        return this.#_displayName;
    }

    /*@devdoc
     *  Sets the avatar's display name.
     *  @param {string|null} displayName - The avatar's display name.
     */
    setDisplayName(displayName: string | null): void {
        // C++  void setDisplayName(const QString& displayName)
        this.#_displayName = displayName;
        this.#_displayNameChanged.emit();
        this._sessionDisplayName = "";
        this._sessionDisplayNameChanged.emit();

        console.log("[avatars] Changing display name for avatar to", displayName);
        this.markIdentityDataChanged();
    }

    /*@devdoc
     *  Gets the avatar's session display name as assigned by the avatar mixer. It is based on the display name and is unique
     *  among all avatars present in the domain.
     *  @returns {string|null} The avatar's session display name.
     */
    getSessionDisplayName(): string | null {
        // C++  QString& getSessionDisplayName()
        return this._sessionDisplayName;
    }

    /*@devdoc
     *  Sets the avatar's session display name as assigned by the avatar mixer. It is based on the display name and is unique
     *  among all avatars present in the domain.
     *  @param {string|null} sessionDisplayName - The avatar's session display name.
     */
    setSessionDisplayName(sessionDisplayName: string | null): void {
        // C++  void setSessionDisplayName(const QString& sessionDisplayName)
        this._sessionDisplayName = sessionDisplayName;
        this._sessionDisplayNameChanged.emit();
        this.markIdentityDataChanged();
    }

    /*@devdoc
     *  Possibly update the session display name from network data: don't update in the <code>AvatarData</code> class.
     *  @param {string|null} sessionDisplayName The session display name.
     */
    // eslint-disable-next-line
    // @ts-ignore
    maybeUpdateSessionDisplayNameFromTransport(sessionDisplayName: string | null): void {  // eslint-disable-line
        // C++  void maybeUpdateSessionDisplayNameFromTransport(const QString& sessionDisplayName)
        // No-op.
    }

    /*@devdoc
     *  Gets the URL of the avatar's FST, glTF, or FBX model file.
     *  @returns {string|null} The URL of the avatar's FST, glTF, or FBX model file.
     */
    getSkeletonModelURL(): string | null {
        // WEBRTC TODO: return the default avatar URL if null.
        return this.#_skeletonModelURL;
    }

    /*@devdoc
     *  Gets the instantaneous loudness of the audio input that the avatar is injecting into the domain.
     *  @returns {number} The instantaneous loudness of the audio input that the avatar is injecting into the domain.
     */
    getAudioLoudness(): number {
        // C++  float getAudioLoudness()
        return this.#_audioLoudness;
    }

    /*@devdoc
     *  Sets the instantaneous loudness of the audio input that the avatar is injecting into the domain.
     *  @param {number} audioLoudness - The instantaneous loudness of the audio input that the avatar is injecting into the
     *      domain.
     */
    setAudioLoudness(audioLoudness: number): void {
        // C++  void setAudioLoudness(float audioLoudness)
        if (audioLoudness !== this.#_audioLoudness) {
            this.#_audioLoudnessChanged = Date.now();
        }
        this.#_audioLoudness = audioLoudness;
    }

    /*@devdoc
     *  Sets the avatar's skeleton model URL.
     *  @param {string|null} skeletonModelURL - The URL of the avatar's FST, glTF, or FBX model file.
     */
    setSkeletonModelURL(skeletonModelURL: string | null): void {
        // C++  void setSkeletonModelURL(const QUrl& skeletonModelURL)

        if (skeletonModelURL === null || skeletonModelURL.length === 0) {
            console.log("[avatars] setSkeletonModelURL() called with empty URL.");
        }

        // WEBRTC TODO: Set #_skeletonModelURL to the default avatar URL when skeletonModelURL is an empty URL.

        if (skeletonModelURL === this.#_skeletonModelURL) {
            return;
        }

        this.#_skeletonModelURL = skeletonModelURL;

        if (this._clientTraitsHandler) {
            this._clientTraitsHandler.markTraitUpdated(AvatarTraits.SkeletonModelURL);
        }

        this.#_skeletonModelURLChanged.emit();
    }

    /*@devdoc
     *  Gets the avatar's skeleton.
     *  @returns {SkeletonJoint[]|null} The avatar's skeleton. <code>[]</code> if there is no skeleton set.
     */
    getSkeletonData(): SkeletonJoint[] {
        // C++  std::vector<AvatarSkeletonTrait::UnpackedJointData> AvatarData::getSkeletonData() const
        return this.#_avatarSkeletonData;
    }

    /*@devdoc
     *  Sets the avatar's skeleton and resets the joints.
     *  @param {SkeletonJoint[]} skeletonData - The avatar's skeleton.
     */
    setSkeletonData(skeletonData: SkeletonJoint[]): void {
        // C++  void AvatarData::setSkeletonData(const std::vector<AvatarSkeletonTrait::UnpackedJointData>& skeletonData)

        if (skeletonData.length === 0) {
            console.log("[avatars] setSkeletonData() called with empty skeleton data.");
        }

        if (skeletonData === this.#_avatarSkeletonData) {
            return;
        }

        // Need to call markTraitUpdated() here because there is no equivalent of C++'s Rig and sendSkeletonData().
        if (this._clientTraitsHandler) {
            this._clientTraitsHandler.markTraitUpdated(AvatarTraits.SkeletonModelURL);
        }

        this.#_avatarSkeletonData = skeletonData;

        // Web SDK: The joints data are resized and set to "use default pose" to make the SDK easier to use and more robust.
        this.#resetJoints();

        this.#_skeletonChanged.emit();  // SDK-specific.
    }

    /*@devdoc
     *  Sets the target avatar scale. For your own avatar, the avatar scale actually used may be limited per domain settings.
     *  For other users' avatars, any domain limits will have already been applied so the target scale is the actual scale to
     *  use.
     *  @param {number} targetScale - The target avatar scale.
     */
    setTargetScale(targetScale: number): void {
        // C++  void setTargetScale(float targetScale)
        const newValue = Math.min(Math.max(targetScale, AvatarConstants.MIN_AVATAR_SCALE), AvatarConstants.MAX_AVATAR_SCALE);
        if (this._targetScale !== newValue) {
            this._targetScale = newValue;
            this._scaleChanged = Date.now();
            this._avatarScaleChanged = this._scaleChanged;

            // This signal has been moved from Avatar so that the SDK can emit it without requiring avatar Rig functionality.
            this._targetScaleChanged.emit(newValue);
        }
    }

    /*@devdoc
     *  Gets the target avatar scale. For your own avatar, the avatar scale actually used may be limited per domain settings.
     *  for other users' avatars, any domain limits will have already been applied so the target scale is the actual scale to
     *  use.
     *  @returns {number} The target avatar scale.
     */
    getTargetScale(): number {
        // C++  float getTargetScale()
        return this._targetScale;
    }

    /*@devdoc
     *  Gets the scale of the avatar, range <code>0.005</code> &mdash; <code>1000.0</code>, possibly temporarily limited by the
     *  current domain's settings. If the avatar's height is not available then domain limits are not applied.
     *  @returns {number}
     */
    getDomainLimitedScale(): number {
        // C++  float getDomainLimitedScale() const
        if (this.canMeasureEyeHeight()) {
            const minScale = this.getDomainMinScale();
            const maxScale = this.getDomainMaxScale();
            return Math.max(minScale, Math.min(this._targetScale, maxScale));
        }

        // We can't make a good estimate.
        return this._targetScale;
    }

    /*@devdoc
     *  Gets the avatar's joint rotations. The rotations are relative to avatar space (i.e., not relative to parent bones). If a
     *  rotation is <code>null</code> then the rotation of the avatar skeletons's default pose should be used.
     *  @returns {Array<quat|null>} The joint rotations.
     */
    getJointRotations(): (quat | null)[] {
        // C++  QVector<glm::quat> getJointRotations()
        return this.#_jointRotations;
    }

    /*@devdoc
     *  Sets the avatar's joint rotations. The rotations are relative to avatar space (i.e., not relative to parent bones). Set
     *  a rotation to <code>null</code> if the avatar skeleton's default pose rotation should be used.
     *  @param {Array<quat|null>} jointRotations - The avatar's joint rotations.
     */
    setJointRotations(jointRotations: (quat | null)[]): void {
        // C++  void AvatarData::setJointRotations(const QVector<glm::quat>& jointRotations)
        this.#_jointRotations = jointRotations;
    }

    /*@devdoc
     *  Gets the translations of the avatar's joints. The translations are relative to their parents, in model coordinates. If a
     *  translation is <code>null</code> then the translation of the avatar skeleton's default pose should be used.
     *  <p><strong>Warning:</strong> These coordinates are not necessarily in meters.</p>
     *  @returns {Array<vec3|null>} The joint translations.
     */
    getJointTranslations(): (vec3 | null)[] {
        // C++  QVector<glm::vec3> getJointTranslations()
        return this.#_jointTranslations;
    }

    /*@devdoc
     *  Sets the avatar's joint translations. The translations are relative to their parents, in model coordinates. Set a
     *  translation to <code>null</code> if the avatar skeleton's default pose translation should be used.
     *  <p><strong>Warning:</strong> These coordinates are not necessarily in meters.</p>
     *  @param {Array<vec3|null>} jointTranslations - The avatar's joint translations.
     */
    setJointTranslations(jointTranslations: (vec3 | null)[]): void {
        // C++  void AvatarData::setJointTranslations(const QVector<glm::vec3>& jointTranslations)
        this.#_jointTranslations = jointTranslations;
    }

    /*@devdoc
     *  Sets a flag that avatar identity data has changed since the last time an {@link PacketType(1)|AvatarIdentity} packet was
     *  sent.
     */
    markIdentityDataChanged(): void {
        // C++  void markIdentityDataChanged()
        this.#_identityDataChanged = true;
    }

    /*@devdoc
     *  Gets whether the avatar identity data has been flagged as having changed since the last time an AvatarIdentity packet
     *  was sent.
     *  @returns {boolean} <code>true</code> if the avatar identity data has been flagged as changed, <code>false</code> if it
     *      hasn't.
     */
    getIdentityDataChanged(): boolean {
        // C++  bool getIdentityDataChanged()
        return this.#_identityDataChanged;
    }


    /*@devdoc
     *  Sends an {@link PacketType(1)|AvatarIdentity} packet to the avatar mixer.
     */
    sendIdentityPacket(): number {
        // C++  int sendIdentityPacket()

        if (this.#_identityDataChanged) {
            // If the identity data has changed, increment the sequence number.
            this.#_identitySequenceNumber.increment();
        }

        const packetList = PacketScribe.AvatarIdentity.write({
            sessionUUID: this.getSessionUUID(),
            identitySequenceNumber: this.#_identitySequenceNumber,
            displayName: this.#_displayName,
            sessionDisplayName: this._sessionDisplayName,
            isReplicated: this.#_isReplicated,
            lookAtSnapping: this.#_lookAtSnappingEnabled,
            verificationFailed: this.#_verificationFailed
        });

        this.#_nodeList.eachMatchingNode(
            (node: Node) => {
                return node.getType() === NodeType.AvatarMixer && node.getActiveSocket() !== null;
            },
            (node: Node) => {
                this.#_nodeList.sendPacketList(packetList, node);
            }
        );

        this.#_identityDataChanged = false;
        return packetList.getDataSize();
    }

    /*@devdoc
     *  Processes the information that has been read from an {@link PacketType(1)|AvatarIdentity} packet.
     *  @param {PacketScribe.AvatarIdentityDetails} info - The information that has been read from the
     *      {@link PacketType(1)|AvatarIdentity} packet.
     *  @param {Object<boolean>} identifyChanged - Return value that is set to <code>true</code> if identity data has changed,
     *      <code>false</code> if it hasn't.
     *  @param {Object<boolean>} displayNameChanged - Return value that is set to <code>true</code> if the avatar's display name
     *      has changed, <code>false</code> if it hasn't.
     */
    processAvatarIdentity(info: AvatarIdentityDetails, identityChanged: { value: boolean },
            displayNameChanged: { value: boolean }): void {  // eslint-disable-line
        // C++  void processAvatarIdentity(QDataStream & packetStream, bool& identityChanged, bool& displayNameChanged)

        if (!this.#_hasProcessedFirstIdentity) {
            this.#_identitySequenceNumber.value = info.identitySequenceNumber.value;
            this.#_identitySequenceNumber.decrement();
            this.#_hasProcessedFirstIdentity = true;
            console.log("[avatars] Processing first identity packet for", info.sessionUUID.stringify(), "-",
                info.identitySequenceNumber.value);
        }

        if (info.identitySequenceNumber.isGreaterThan(this.#_identitySequenceNumber)) {
            this.#_identitySequenceNumber = info.identitySequenceNumber;

            if (info.displayName !== this.#_displayName) {
                this.#_displayName = info.displayName;
                this.#_displayNameChanged.emit();
                identityChanged.value = true;
                displayNameChanged.value = true;
            }
            this.maybeUpdateSessionDisplayNameFromTransport(info.sessionDisplayName);

            if (info.isReplicated !== this.#_isReplicated) {
                this.#_isReplicated = info.isReplicated;
                identityChanged.value = true;
            }

            if (info.lookAtSnapping !== this.#_lookAtSnappingEnabled) {
                this.#_lookAtSnappingEnabled = info.lookAtSnapping;
                // WEBRTC TODO: Address further C++ code - lookAtSnappingEnabledChanged signal.
                identityChanged.value = true;
            }

            if (info.verificationFailed !== this.#_verificationFailed) {
                this.#_verificationFailed = info.verificationFailed;
                identityChanged.value = true;

                // WEBRTC TODO: Address further C++ code - skeletonModelURL for verification failed.

                if (this.#_verificationFailed) {
                    console.log("[avatars] Avatar", this._sessionDisplayName, "marked as VERIFY-FAILED");
                }
            }

            // AttachmentData is deprecated, don't handle.

        }
    }

    /*@devdoc
     *  Resets the time that the last {@link PacketType(1)|AvatarData} packet was sent to <code>0</code>.
     */
    // eslint-disable-next-line class-methods-use-this
    resetLastSent(): void {
        // C++  void resetLastSent()
        this.#_lastToByteArray = 0;
    }

    /*@devdoc
     *  Sends the avatar data in an {@link PacketType(1)|AvatarData} packet to the avatar mixer.
     *  @param {boolean} sendAll - <code>true</code> to send a full update even if nothing has changed, <code>false</code> to
     *      exclude certain data that hasn't changed since the last send.
     */
    sendAvatarDataPacket(sendAll = false): number {
        // C++  int sendAvatarDataPacket(bool sendAll)
        //      QByteArray MyAvatar::toByteArrayStateful(AvatarDataDetail dataDetail, bool dropFaceTracking)
        //      QByteArray AvatarData::toByteArrayStateful(AvatarDataDetail dataDetail, bool dropFaceTracking)
        //      QByteArray AvatarData::toByteArray(AvatarDataDetail dataDetail, quint64 lastSentTime,
        //          const QVector<JointData>& lastSentJointData, AvatarDataPacket::SendStatus & sendStatus,
        //          bool dropFaceTracking, bool distanceAdjust, glm::vec3 viewerPosition, QVector<JointData>* sentJointDataOut,
        //          int maxDataSize, AvatarDataRate * outboundDataRateOut

        // About 2% of the time we send a full update (in particular, we transmit all the joint data) even if nothing has
        // changed. this is to guard against a joint moving once, the packet getting lost, and the joint never moving again.

        const AVATAR_SEND_FULL_UPDATE_RATIO = 0.02;
        const cullSmallData = !sendAll && Math.random() < AVATAR_SEND_FULL_UPDATE_RATIO;
        const dataDetail = cullSmallData ? AvatarDataDetail.SendAllData : AvatarDataDetail.CullSmallData;


        // C++  QByteArray MyAvatar::toByteArrayStateful(AvatarDataDetail dataDetail, bool dropFaceTracking)
        this._globalPosition = this.getWorldPosition();
        //
        // WEBRTC TODO: Address further C++ code - avatar bounding box.
        //
        // WEBRTC TODO: Address further C++ code - camera mode.
        //


        // C++  QByteArray AvatarData::toByteArrayStateful(AvatarDataDetail dataDetail, bool dropFaceTracking)
        const lastSentTime = this.#_lastToByteArray;
        this.#_lastToByteArray = Date.now();
        // SendStatus - Not used in user client.
        this.#getLastJointData();


        // C++  QByteArray AvatarData::toByteArray(AvatarDataDetail dataDetail, quint64 lastSentTime,
        //          const QVector<JointData>& lastSentJointData, AvatarDataPacket::SendStatus& sendStatus,
        //          bool dropFaceTracking, bool distanceAdjust, glm::vec3 viewerPosition, QVector<JointData>* sentJointDataOut,
        //          int maxDataSize, AvatarDataRate* outboundDataRateOut)

        this.#lazyInitHeadData();

        const avatarDataDetails = {
            sequenceNumber: this.#_sequenceNumber,

            dataDetail,
            lastSentTime,
            lastSentJointRotations: this.#_lastSentJointRotations,
            lastSentJointTranslations: this.#_lastSentJointTranslations,
            // sendStatus, - Not used in user client.
            // dropFaceTracking: value,
            // distanceAdjust: false, - Always false in user client.
            // viewerPosition: { x: 0, y: 0, z: 0 }, - Not used in user client.
            // sentJointDataOut: null, - Not used in user client.
            // maxDataSize: 0, - Not used in user client.
            // WEBRTC TODO: Address further C+ code - AvatarDataRate.

            // The C++ code is included here, commented out, so that the native client logic can be seen.
            //
            // hasAvatarOrientation = sendAll || rotationChangedSince(lastSentTime);
            // hasAvatarBoundingBox = sendAll || avatarBoundingBoxChangedSince(lastSentTime);
            // hasAvatarScale = sendAll || avatarScaleChangedSince(lastSentTime);
            // hasLookAtPosition = sendAll || lookAtPositionChangedSince(lastSentTime);
            // hasAudioLoudness = sendAll || audioLoudnessChangedSince(lastSentTime);
            // hasSensorToWorldMatrix = sendAll || sensorToWorldMatrixChangedSince(lastSentTime);
            // hasAdditionalFlags = sendAll || additionalFlagsChangedSince(lastSentTime);
            // hasParentInfo = sendAll || parentInfoChangedSince(lastSentTime);
            // hasAvatarLocalPosition = hasParent() && (sendAll ||
            //     tranlationChangedSince(lastSentTime) ||
            //     parentInfoChangedSince(lastSentTime));
            // hasHandControllers = _controllerLeftHandMatrixCache.isValid() || _controllerRightHandMatrixCache.isValid();
            // hasFaceTrackerInfo = !dropFaceTracking && (getHasScriptedBlendshapes() || _headData->_hasInputDrivenBlendshapes)
            //     && (sendAll || faceTrackerInfoChangedSince(lastSentTime));
            // hasJointData = !sendMinimum;
            // hasJointDefaultPoseFlags = hasJointData;

            globalPosition: this._globalPosition,
            localOrientation: sendAll || this.rotationChangedSince(lastSentTime) ? this.getOrientationOutbound() : undefined,
            avatarScale: sendAll || this.#avatarScaleChangedSince(lastSentTime) ? this.getDomainLimitedScale() : undefined,
            audioLoudness: sendAll || this.#audioLoudnessChangedSince(lastSentTime) ? this.getAudioLoudness() : undefined,
            jointRotations: this.#_jointRotations,  // sendMinimum is implemented in PacketScribe.AvatarData.write().
            jointTranslations: this.#_jointTranslations
        };


        // WEBRTC TODO: It appears that the following retries are not needed because the AvatarData writing code only writes
        // what fits. (Perhaps writing only what fits wasn't always the case, or perhaps it's only applicable on the server.)
        //
        // Not all avatar data can necessarily fit in a single packet so we try three times with a decreasing amount of data
        // each time. The packet writer returns a 0-sized packet if writing overflowed.
        let avatarPacket = PacketScribe.AvatarData.write(avatarDataDetails);

        if (avatarPacket.getDataSize() === 0) {
            // Try excluding face tracking.
            avatarDataDetails.lastSentTime = this.#_lastToByteArray;
            // avatarDataDetails.dropFaceTracking = true;
            this.#_lastToByteArray = Date.now();
            avatarPacket = PacketScribe.AvatarData.write(avatarDataDetails);
        }

        if (avatarPacket.getDataSize() === 0) {
            // Try minimum data detail.
            avatarDataDetails.lastSentTime = this.#_lastToByteArray;
            avatarDataDetails.dataDetail = AvatarDataDetail.MinimumData;
            this.#_lastToByteArray = Date.now();
            avatarPacket = PacketScribe.AvatarData.write(avatarDataDetails);
        }

        if (avatarPacket.getDataSize() === 0) {
            console.warn("[avatars] Data overflow in PacketScribe.AvatarDetail.write()!");
            return 0;
        }

        this.#_sequenceNumber = (this.#_sequenceNumber + 1) % this.#SEQUENCE_NUMBER_MODULO;

        this.#doneEncoding(cullSmallData);

        this.#_nodeList.broadcastToNodes(avatarPacket, this.#_AVATAR_MIXER_NODE_SET);

        return avatarPacket.getWireSize();
    }

    /*@devdoc
     *  Processes the data for an avatar that has been read from a {@link PacketType(1)|BulkAvatarData} packet.
     *  @param {PacketScribe.BulkAvatarDataDetails} avatarData - The data that has been read from the
     *      {@link PacketType(1)|BulkAvatarData} packet.
     */
    parseDataFromBuffer(avatarData: BulkAvatarDataDetails): void {
        // C++  int parseDataFromBuffer(const QByteArray& buffer)

        // The data have already been read by PacketScribe, we now just need to process them.

        if (avatarData.globalPosition) {
            // AvatarReplicas per the C++ is not implemented because that is for load testing.

            // WEBRTC TODO: Address further C++ code - avatar transits.

            // WEBRTC TODO: Address further C++ code - client vs non-client avatar.

            this._globalPosition = avatarData.globalPosition;
            if (!this.hasParent()) {
                this.setLocalPosition(avatarData.globalPosition);
            }
        }

        // WEBRTC TODO: Address further C++ code - further avatar properties.

        if (avatarData.localOrientation) {
            if (!Quat.equal(avatarData.localOrientation, this.getLocalOrientation())) {

                // WEBRTC TODO: Address further C++ code - _hasNewJointData.

                this.setLocalOrientation(avatarData.localOrientation);
            }

            // WEBRTC TODO: Address further C++ code - avatar orientation update rate.
        }

        if (avatarData.avatarScale) {
            if (!isNaN(avatarData.avatarScale)) {
                this.setTargetScale(avatarData.avatarScale);

                // WEBRTC TODO: Address further C++ code - avatar scale rate and update rate.
            }
        }

        // WEBRTC TODO: Address further C++ code - further avatar properties.

        if (avatarData.jointRotationsValid && avatarData.jointRotations) {
            const jointRotationsValid = avatarData.jointRotationsValid;
            const jointRotations = avatarData.jointRotations;
            const numJoints = jointRotationsValid.length;
            if (this.#_jointRotations.length !== numJoints) {
                this.#resizeJointRotations(numJoints);
            }
            let j = 0;
            for (let i = 0; i < numJoints; i++) {
                if (jointRotationsValid[i]) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.#_jointRotations[i] = jointRotations[j]!;
                    j += 1;
                }
            }

            // WEBRTC TODO: Address further C++ code - _hasNewJointData.
            // WEBRTC TODO: Address further C++ code - joint update rate.
        }

        if (avatarData.jointRotationsUseDefault) {
            const jointRotationsUseDefault = avatarData.jointRotationsUseDefault;
            const numJoints = jointRotationsUseDefault.length;
            if (this.#_jointRotations.length !== numJoints) {
                this.#resizeJointRotations(numJoints);
            }
            for (let i = 0; i < numJoints; i++) {
                if (jointRotationsUseDefault[i]) {
                    this.#_jointRotations[i] = null;
                }
            }

            // WEBRTC TODO: Address further C++ code - joint default pose update rate.
        }

        if (avatarData.jointTranslationsValid && avatarData.jointTranslations) {
            const jointTranslationsValid = avatarData.jointTranslationsValid;
            const jointTranslations = avatarData.jointTranslations;
            const numJoints = jointTranslationsValid.length;
            if (this.#_jointTranslations.length !== numJoints) {
                this.#resizeJointTranslations(numJoints);
            }
            this.#resizeJointTranslations(numJoints);
            let j = 0;
            for (let i = 0; i < numJoints; i++) {
                if (jointTranslationsValid[i]) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.#_jointTranslations[i] = jointTranslations[j]!;
                    j += 1;
                }
            }

            // WEBRTC TODO: Address further C++ code - joint update rate.
        }

        if (avatarData.jointTranslationsUseDefault) {
            const jointTranslationsUseDefault = avatarData.jointTranslationsUseDefault;
            const numJoints = jointTranslationsUseDefault.length;
            if (this.#_jointTranslations.length !== numJoints) {
                this.#resizeJointTranslations(numJoints);
            }
            for (let i = 0; i < numJoints; i++) {
                if (jointTranslationsUseDefault[i]) {
                    this.#_jointTranslations[i] = null;
                }
            }
        }

        // WEBRTC TODO: Address further C++ code - further avatar properties.

    }

    /*@devdoc
     *  Processes a simple trait value received in a packet.
     *  @param {AvatarTraits.TraitType} traitType - The trait type.
     *  @param {AvatarTraits.TraitValue} traitValue - The trait value.
     */
    processTrait(traitType: TraitType, traitValue: TraitValue): void {
        // C++  void processTrait(AvatarTraits:: TraitType traitType, QByteArray traitBinaryData)
        //      void AvatarData::unpackSkeletonData(const QByteArray& data)
        //      Reading the trait value is done in AvatarTraits.
        if (traitType === AvatarTraits.SkeletonModelURL) {
            assert(typeof traitValue === "string");
            this.setSkeletonModelURL(traitValue);
        } else {
            assert(traitType === AvatarTraits.SkeletonData);
            // The trait is marked as updated in setSkeletonData().
            this.setSkeletonData(traitValue as SkeletonJoint[]);
        }
    }


    /*@devdoc
     *  Gets whether the avatar is parented to something.
     *  @returns {boolean} <code>true</code> if the avatar is parented to something, <code>false</code> if it isn't.
     */
    protected hasParent(): boolean {
        // C++  bool hasParent()
        return this.getParentID().value() !== Uuid.NULL;
    }

    /*@devdoc
     *  Sets the minimum avatar height in the domain.
     *  @param {number} domainMinimumHeight - The minimum avatar height in the domain.
     */
    protected setDomainMinimumHeight(domainMinimumHeight: number): void {
        // c++  void setDomainMinimumHeight(float domainMinimumHeight)
        this._domainMinimumHeight
            = Math.max(AvatarConstants.MIN_AVATAR_HEIGHT, Math.min(domainMinimumHeight, AvatarConstants.MAX_AVATAR_HEIGHT));
    }

    /*@devdoc
     *  Sets the maximum avatar height in the domain.
     *  @param {number} domainMinimumHeight - The maximum avatar height in the domain.
     */
    protected setDomainMaximumHeight(domainMaximumHeight: number): void {
        // C++  void setDomainMaximumHeight(float domainMaximumHeight)
        this._domainMaximumHeight
            = Math.max(AvatarConstants.MIN_AVATAR_HEIGHT, Math.min(domainMaximumHeight, AvatarConstants.MAX_AVATAR_HEIGHT));
    }

    /*@devdoc
     *  Gets whether the avatar's eye height is able to be measured.
     *  @returns {boolean} <code>false</code> in the <code>AvatarData</code> class.
     */
    protected canMeasureEyeHeight(): boolean {  // eslint-disable-line class-methods-use-this
        // C++  virtual bool canMeasureEyeHeight() const
        return false;
    }

    /*@devdoc
     *  Gets the minimum avatar scale as set by the domain server.
     *  @returns {number} The minimum avatar scale as set by the domain server.
     */
    protected getDomainMinScale(): number {
        // C++  float AvatarData::getDomainMinScale() const
        let unscaledHeight = this.getUnscaledHeight();
        const EPSILON = 1.0e-4;
        if (unscaledHeight <= EPSILON) {
            unscaledHeight = AvatarConstants.DEFAULT_AVATAR_HEIGHT;
        }
        return this._domainMinimumHeight / unscaledHeight;
    }

    /*@devdoc
     *  Gets the maximum avatar scale as set by the domain server.
     *  @returns {number} The maximum avatar scale as set by the domain server.
     */
    protected getDomainMaxScale(): number {
        // C++  float AvatarData::getDomainMaxScale() const
        let unscaledHeight = this.getUnscaledHeight();
        const EPSILON = 1.0e-4;
        if (unscaledHeight <= EPSILON) {
            unscaledHeight = AvatarConstants.DEFAULT_AVATAR_HEIGHT;
        }
        return this._domainMaximumHeight / unscaledHeight;
    }

    /*@devdoc
     *  Gets the unscaled avatar height.
     *  @returns {number} The unscaled avatar height.
     */
    protected getUnscaledHeight(): number {
        // C++ float AvatarData::getUnscaledHeight() const
        const eyeHeight = this.getUnscaledEyeHeight();
        const ratio = eyeHeight / AvatarConstants.DEFAULT_AVATAR_HEIGHT;
        return eyeHeight + ratio * AvatarConstants.DEFAULT_AVATAR_EYE_TO_TOP_OF_HEAD;
    }

    /*@devdoc
     *  Gets the unscaled avatar eye height.
     *  @returns {number} The unscaled avatar eye height.
     */
    protected getUnscaledEyeHeight(): number {  // eslint-disable-line class-methods-use-this
        // C++  virtual float getUnscaledEyeHeight() const
        return AvatarConstants.DEFAULT_AVATAR_EYE_HEIGHT;
    }

    /*@devdoc
     *  Gets the avatar's world orientation.
     *  @returns {quat} The avatar's world orientation.
     */
    // A method intended to be overridden by MyAvatar for polling orientation for network transmission.
    protected getOrientationOutbound(): quat {
        // C++  glm::quat getOrientationOutbound()
        return this.getLocalOrientation();
    }


    #getLastJointData(): void {
        // C++  QVector<JointData> getLastSentJointData()
        // Resize in place without returning as result.
        this.#resizeLastSentJointData();
    }

    #lazyInitHeadData(): void {  // eslint-disable-line class-methods-use-this
        // C++  void AvatarData::lazyInitHeadData()
        // Lazily allocate memory for HeadData in case we're not an Avatar instance.

        // WEBRTC TODO: Address further C++ code - Head data.

    }

    #doneEncoding(cullSmallChanges: boolean): void {  // eslint-disable-line
        // C++  void doneEncoding(bool cullSmallChanges)
        // The server has finished sending this version of the joint-data to other nodes. Update #_lastSentJointRotations and
        // #_lastSentJointTranslations.
        // NOTE: This is never used in a "distanceAdjust" mode, so it's OK that it doesn't use a variable minimum
        // rotation / translation.

        const AVATAR_MIN_ROTATION_DOT = 0.9999999;
        const AVATAR_MIN_TRANSLATION = 0.0001;

        this.#resizeLastSentJointData();

        for (let i = 0, length = this.#_jointRotations.length; i < length; i++) {
            // The Web SDK uses null values for default rotations and translations so the logic is different but achieves the
            // same end.

            const jointRotation = this.#_jointRotations[i];
            const lastSentJointRotation = this.#_lastSentJointRotations[i];
            assert(jointRotation !== undefined && lastSentJointRotation !== undefined);
            if (jointRotation === null || lastSentJointRotation === null) {
                this.#_lastSentJointRotations[i] = jointRotation;
            } else if (!Quat.equal(lastSentJointRotation, jointRotation)) {
                if (!cullSmallChanges
                    || Math.abs(Quat.dot(jointRotation, lastSentJointRotation)) <= AVATAR_MIN_ROTATION_DOT) {
                    this.#_lastSentJointRotations[i] = jointRotation;
                }
            }

            const jointTranslation = this.#_jointTranslations[i];
            const lastSentJointTranslation = this.#_lastSentJointTranslations[i];
            assert(jointTranslation !== undefined && lastSentJointTranslation !== undefined);
            if (jointTranslation === null || lastSentJointTranslation === null) {
                this.#_lastSentJointTranslations[i] = jointTranslation;
            } else if (!Vec3.equal(lastSentJointTranslation, jointTranslation)) {
                if (!cullSmallChanges
                    || Vec3.distance(jointTranslation, lastSentJointTranslation) > AVATAR_MIN_TRANSLATION) {
                    this.#_lastSentJointTranslations[i] = jointTranslation;
                }
            }

        }
    }

    #resizeJointRotations(numJoints: number): void {
        if (this.#_jointRotations.length < numJoints) {
            for (let i = this.#_jointRotations.length; i < numJoints; i++) {
                this.#_jointRotations.push(null);
            }
        } else if (this.#_jointRotations.length > numJoints) {
            for (let i = this.#_jointRotations.length; i > numJoints; i--) {
                this.#_jointRotations.pop();
            }
        }
    }

    #resizeJointTranslations(numJoints: number): void {
        if (this.#_jointTranslations.length < numJoints) {
            for (let i = this.#_jointTranslations.length; i < numJoints; i++) {
                this.#_jointTranslations.push(null);
            }
        } else if (this.#_jointTranslations.length > numJoints) {
            for (let i = this.#_jointTranslations.length; i > numJoints; i--) {
                this.#_jointTranslations.pop();
            }
        }
    }

    #resizeLastSentJointData(): void {
        // C++  _lastSentJointData.resize(_jointData.size())
        assert(this.#_lastSentJointRotations.length === this.#_lastSentJointTranslations.length);
        if (this.#_lastSentJointRotations.length < this.#_jointRotations.length) {
            for (let i = this.#_lastSentJointRotations.length, length = this.#_jointRotations.length; i < length; i++) {
                this.#_lastSentJointRotations.push(null);
                this.#_lastSentJointTranslations.push(null);
            }
        } else if (this.#_lastSentJointRotations.length > this.#_jointRotations.length) {
            for (let i = this.#_jointRotations.length, length = this.#_lastSentJointRotations.length; i > length; i--) {
                this.#_lastSentJointRotations.pop();
                this.#_lastSentJointTranslations.pop();
            }
        }
    }

    #avatarScaleChangedSince(time: number): boolean {
        // C++  bool avatarScaleChangedSince(quint64 time)
        return this._avatarScaleChanged >= time;
    }

    #audioLoudnessChangedSince(time: number): boolean {
        // C++  bool audioLoudnessChangedSince(quint64 time)
        return this.#_audioLoudnessChanged >= time;
    }

    #resetJoints(): void {
        // C++  N/A
        this.#_jointRotations = new Array(this.#_avatarSkeletonData.length) as (quat | null)[];
        this.#_jointRotations.fill(null);
        this.#_jointTranslations = new Array(this.#_avatarSkeletonData.length) as (vec3 | null)[];
        this.#_jointTranslations.fill(null);
    }

}

export default AvatarData;
export { KillAvatarReason, AvatarDataDetail, BoneType };
