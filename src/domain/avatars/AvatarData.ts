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
import PacketScribe from "../networking/packets/PacketScribe";
import SequenceNumber from "../networking/udt/SequenceNumber";
import ContextManager from "../shared/ContextManager";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import SpatiallyNestable, { NestableType } from "../shared/SpatiallyNestable";
import Uuid from "../shared/Uuid";


/*@devdoc
 *  The <code>IdentifyFlag</code> namespace provides avatar identity data bit flags.
 *  @namespace IdentityFlag
 *  @property {number} none=0 - No flag bits are set. <em>Read-only.</em>
 *  @property {number} isReplicated=1 - Legacy. <em>Read-only.</em>
 *  @property {number} lookAtSnapping=2 - Enables the avatar's eyes to snap to look at another avatar's eyes when the other
 *      avatar is in line of sight. <em>Read-only.</em>
 *  @property {number} verificationFailed=4 - Legacy. <em>Read-only.</em>
 */
enum IdentityFlag {
    none = 0,
    isReplicated = 0x1,
    lookAtSnapping = 0x2,
    verificationFailed = 0x4
}

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
    NoReason = 0,
    AvatarDisconnected,
    AvatarIgnored,
    TheirAvatarEnteredYourBubble,
    YourAvatarEnteredTheirBubble
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
 */
class AvatarData extends SpatiallyNestable {
    // C++  class AvatarData : public QObject, public SpatiallyNestable

    protected _sessionDisplayName: string | null = null;
    protected _sessionDisplayNameChanged = new SignalEmitter();

    // Context
    #_nodeList;

    #_hasProcessedFirstIdentity = false;
    #_identitySequenceNumber = new SequenceNumber(0);  // Avatar identity sequence number.
    #_identityDataChanged = false;
    // @ts-ignore
    #_lastToByteArray = 0;

    #_displayName: string | null = null;
    #_displayNameChanged = new SignalEmitter();
    #_lookAtSnappingEnabled = true;
    #_verificationFailed = false;
    #_isReplicated = false;


    constructor(contextID: number) {
        // C++  AvatarData()
        super(NestableType.Avatar, new Uuid());

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
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
     *  @returns {string|null} - The avatar's display name.
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
     *  Sets a flag that avatar identity data has changed since the last time an AvatarIdentity packet was sent.
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
     *  Processes the information that has been read from an AvatarIdentity packet.
     *  @param {AvatarIdentityDetails} info - The information that has been ready from the AvatarIDentity packet.
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
     *  Resets the time that the last AvatarData packet was sent to <code>0</code>.
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
    // @ts-ignore
    sendAvatarDataPacket(sendAll = false): number {
        // C++  int sendAvatarDataPacket(bool sendAll) {

        // WEBRTC TODO: Address further C++ code.

        this.#_lastToByteArray = Date.now();
        return 0;
    }


    // eslint-disable-next-line
    // @ts-ignore
    protected maybeUpdateSessionDisplayNameFromTransport(sessionDisplayName: string | null): void {  // eslint-disable-line
        // C++  void maybeUpdateSessionDisplayNameFromTransport(const QString& sessionDisplayName)
        // No-op.
    }
}

export default AvatarData;
export { IdentityFlag, KillAvatarReason };
