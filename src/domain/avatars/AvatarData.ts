//
//  AvatarData.ts
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Node from "../networking/Node";
import NodeList from "../networking/NodeList";
import NodeType from "../networking/NodeType";
import { AvatarIdentityDetails } from "../networking/packets/AvatarIdentity";
import { BulkAvatarDataDetails } from "../networking/packets/BulkAvatarData";
import PacketScribe from "../networking/packets/PacketScribe";
import SequenceNumber from "../networking/udt/SequenceNumber";
import ContextManager from "../shared/ContextManager";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import SpatiallyNestable, { NestableType } from "../shared/SpatiallyNestable";
import Quat, { quat } from "../shared/Quat";
import Uuid from "../shared/Uuid";
import Vec3, { vec3 } from "../shared/Vec3";
import ClientTraitsHandler from "./ClientTraitsHandler";
import { TraitType } from "./AvatarTraits";

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


/*@devdoc
 *  The <code>AvatarData</code> class handles the avatar data that is written to and read from Vircadia protocol packets.
 *  <p>C++: <code>AvatarData : public QObject, public SpatiallyNestable</code></p>
 *  @class AvatarData
 *  @extends SpatiallyNestable
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @property {string|null} displayName - The avatar's display name.
 *  @property {Signal} displayNameChanged - Triggered when the avatar's display name changes.
 *  @property {string|null} sessionDisplayName - The avatar's session display name as assigned by the avatar mixer. It is based
 *      on the display name and is unique among all avatars present in the domain. <em>Read-only.</em>
 *  @property {Signal} sessionDisplayNameChanged - Triggered when the avatar's session display name changes.
 *  @property {vec3} position - The position of the avatar.
 *  @property {quat} orientation - The orientation of the avatar.
 *  @property {string} skeletonModelURL - The avatar's skeleton model url
 *  @property {Signal} skeletonModelURLChanged - Triggered when the avatar's skeleton model url changes.
 */
class AvatarData extends SpatiallyNestable {
    // C++  class AvatarData : public QObject, public SpatiallyNestable

    protected _sessionDisplayName: string | null = null;
    protected _sessionDisplayNameChanged = new SignalEmitter();

    protected _globalPosition = Vec3.ZERO;
    protected _clientTraitsHandler;

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

    #_sequenceNumber = 0;  // Avatar data sequence number is a uint16 value.
    readonly #SEQUENCE_NUMBER_MODULO = 65536;  // Sequence number is a uint16.

    readonly #AVATAR_MIXER_NODE_SET = new Set([NodeType.AvatarMixer]);


    constructor(contextID: number) {
        // C++  AvatarData()
        super(NestableType.Avatar, new Uuid());

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

        this._clientTraitsHandler = new ClientTraitsHandler(this, contextID);
    }


    get displayName(): string {
        return this.#_displayName !== null ? this.#_displayName : "";
    }

    set displayName(displayName: string) {
        this.setDisplayName(displayName);
    }

    get displayNameChanged(): Signal {
        return this.#_displayNameChanged.signal();
    }

    get sessionDisplayName(): string {
        return this._sessionDisplayName !== null ? this._sessionDisplayName : "";
    }

    get sessionDisplayNameChanged(): Signal {
        return this._sessionDisplayNameChanged.signal();
    }

    get position(): vec3 {
        return this.getWorldPosition();
    }

    set position(position: vec3) {
        this.setWorldPosition(position);
    }

    get orientation(): quat {
        return this.getWorldOrientation();
    }

    set orientation(orientation: quat) {
        this.setWorldOrientation(orientation);
    }

    get skeletonModelURL(): string {
        // WEBRTC TODO: return the default avatar url if null
        return this.#_skeletonModelURL !== null ? this.#_skeletonModelURL : "";
    }

    set skeletonModelURL(skeletonModelURL: string) {
        this.setSkeletonModelURL(skeletonModelURL);
    }

    get skeletonModelURLChanged(): Signal {
        return this.#_skeletonModelURLChanged.signal();
    }


    /*@devdoc
     *  Gets the avatar's session UUID.
     *  @returns {Uuid} The session UUID. {@link Uuid|Uuid.AVATAR_SELF_ID} if not connected.
     */
    getSessionUUID(): Uuid {
        // C++  QUuid getSessionUUID()
        return this.getID();
    }

    /*@devdoc
     *  Sets the user avatar's session UUID.
     *  @param {Uuid} sessionUUID - The session UUID. If {@link Uuid|Uuid.NULL} then the session UUID is set to
     *      {@link Uuid|Uuid.AVATAR_SELF_ID}.
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
     *  @returns {string|null} - The avatar's display name.
     */
    getDisplayName(): string | null {
        // C++  QString& getDisplayName()
        return this.#_displayName;
    }

    /*@devdoc
     *  Sets the avatar's display name.
     *  @param {string|null} - The avatar's display name.
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
     *  Gets the avatar's session display name.
     *  @returns {string|null} - The avatar's display name.
     */
    getSessionDisplayName(): string | null {
        // C++  QString& getSessionDisplayName()
        return this._sessionDisplayName;
    }

    /*@devdoc
     *  Sets the avatar's session display name.
     *  @returns {string|null} - The avatar's session display name.
     */
    setSessionDisplayName(sessionDisplayName: string | null): void {
        // C++  void setSessionDisplayName(const QString& sessionDisplayName)
        this._sessionDisplayName = sessionDisplayName;
        this._sessionDisplayNameChanged.emit();
        this.markIdentityDataChanged();
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

        // C++  QByteArray AvatarData::toByteArrayStateful(...)
        const lastSentTime = this.#_lastToByteArray;
        this.#_lastToByteArray = Date.now();
        // SendStatus - Not used in user client.


        // C++  QByteArray AvatarData::toByteArray(...)
        this.#lazyInitHeadData();


        const avatarDataDetails = {
            sequenceNumber: this.#_sequenceNumber,

            dataDetail,
            lastSentTime,
            // WEBRTC TODO: Address further C++ code - JointData.
            // sendStatus, - Not used in user client.
            dropFaceTracking: false,
            distanceAdjust: false,
            viewerPosition: { x: 0, y: 0, z: 0 },
            // sentJointDataOut: null, - Not used in user client.
            // maxDataSize: 0, - Not used in user client.
            // WEBRTC TODO: Address further C+ code - AvatarDataRate.

            globalPosition: this._globalPosition,
            localOrientation: this.rotationChangedSince(lastSentTime) ? this.getOrientationOutbound() : undefined
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
            avatarDataDetails.dropFaceTracking = true;
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

        this.#_nodeList.broadcastToNodes(avatarPacket, this.#AVATAR_MIXER_NODE_SET);

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

                // WEBRTC TODO: Address further C++ code - Joint data.

                this.setLocalOrientation(avatarData.localOrientation);
            }

            // WEBRTC TODO: Address further C++ code - avatar orientation update rate.

        }

        // WEBRTC TODO: Address further C++ code - further avatar properties.

    }

    /*@devdoc
     *  Gets the avatar's world orientation.
     *  @returns {quat} The avatar's world orientation.
     */
    getOrientationOutbound(): quat {
        // C++  glm::quat getOrientationOutbound()
        return this.getLocalOrientation();
    }

    /*@devdoc
     *  Sets the avatar's skeleton model URL.
     *  @param {string|null} skeletonModelURL - The avatar's FST file.
     */
    setSkeletonModelURL(skeletonModelURL: string | null): void {
        // C++  Q_INVOKABLE virtual void setSkeletonModelURL(const QUrl& skeletonModelURL);
        if (skeletonModelURL === null || skeletonModelURL.length < 1) {
            console.log("[avatars][setSkeletonModelURL] caller called with empty URL.");
        }

        // WEBRTC TODO: set #_skeletonModelURL to the default avatar url when skeletonModelURL is an empty url

        this.#_skeletonModelURL = skeletonModelURL;
        this.#_skeletonModelURLChanged.emit();

        console.log("[avatars] Changing skeleton model URL for avatar to", skeletonModelURL);
        this._clientTraitsHandler.markTraitUpdated(TraitType.SkeletonModelURL);
    }


    // eslint-disable-next-line
    // @ts-ignore
    protected maybeUpdateSessionDisplayNameFromTransport(sessionDisplayName: string | null): void {  // eslint-disable-line
        // C++  void maybeUpdateSessionDisplayNameFromTransport(const QString& sessionDisplayName)
        // No-op.
    }

    protected hasParent(): boolean {
        // C++  bool hasParent()
        return this.getParentID().value() !== Uuid.NULL;
    }


    // eslint-disable-next-line class-methods-use-this
    #lazyInitHeadData(): void {
        // C++  void AvatarData::lazyInitHeadData()
        // Lazily allocate memory for HeadData in case we're not an Avatar instance.

        // WEBRTC TODO: Address further C++ code - Head data.

    }

    // eslint-disable-next-line
    // @ts-ignore
    #doneEncoding(cullSmallChanges: boolean): void {  // eslint-disable-line
        // C++  void doneEncoding(bool cullSmallChanges)

        // WEBRTC TODO: Address further C++ code - Joint data.

    }

}

export default AvatarData;
export { KillAvatarReason, AvatarDataDetail };
