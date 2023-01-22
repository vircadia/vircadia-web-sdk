//
//  AvatarHashMap.ts
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { BulkAvatarDataDetails } from "../networking/packets/BulkAvatarData";
import PacketScribe from "../networking/packets/PacketScribe";
import { PacketTypeValue } from "../networking/udt/PacketHeaders";
import Node from "../networking/Node";
import NodeList from "../networking/NodeList";
import NodeType, { NodeTypeValue } from "../networking/NodeType";
import PacketReceiver from "../networking/PacketReceiver";
import ReceivedMessage from "../networking/ReceivedMessage";
import assert from "../shared/assert";
import ContextManager from "../shared/ContextManager";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Uuid from "../shared/Uuid";
import AvatarData, { KillAvatarReason } from "./AvatarData";
import AvatarTraits, { TraitType } from "./AvatarTraits";


/*@devdoc
 *  The <code>AvatarHashMap</code> class is concerned with the avatars that the user client knows about in the domain (has been
 *  sent data on by the avatar mixer).
 *  <p>C++: <code>AvatarHashMap</code></p>
 *  @class AvatarHashMap
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
class AvatarHashMap {
    // C++  class AvatarHashMap : public QObject, public Dependency

    static readonly #CLIENT_TO_AVATAR_MIXER_BROADCAST_FRAMES_PER_SECOND = 50;
    static readonly #MSECS_PER_SECOND = 1000;

    protected static MIN_TIME_BETWEEN_MY_AVATAR_DATA_SENDS = AvatarHashMap.#MSECS_PER_SECOND
        / AvatarHashMap.#CLIENT_TO_AVATAR_MIXER_BROADCAST_FRAMES_PER_SECOND;


    protected _avatarHash = new Map<bigint, AvatarData>();  // Map<Uuid.value(), AvatarData>


    // Context.
    #_contextID;
    #_nodeList;

    #_lastOwnerSessionUUID = new Uuid();

    #_avatarAddedEvent = new SignalEmitter();
    #_avatarRemovedEvent = new SignalEmitter();

    #_processedTraitVersions: Map<Uuid, Map<TraitType, number>> = new Map();


    // AvatarReplicas per the C++ is not implemented because that is for load testing.


    constructor(contextID: number) {
        // C++  AvatarHashMap()

        // Context
        this.#_contextID = contextID;
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

        const packetReceiver = this.#_nodeList.getPacketReceiver();
        packetReceiver.registerListener(PacketTypeValue.BulkAvatarData,
            PacketReceiver.makeSourcedListenerReference(this.processAvatarDataPacket));
        packetReceiver.registerListener(PacketTypeValue.KillAvatar,
            PacketReceiver.makeSourcedListenerReference(this.processKillAvatar));
        packetReceiver.registerListener(PacketTypeValue.AvatarIdentity,
            PacketReceiver.makeSourcedListenerReference(this.processAvatarIdentityPacket));
        packetReceiver.registerListener(PacketTypeValue.BulkAvatarTraits,
            PacketReceiver.makeSourcedListenerReference(this.processBulkAvatarTraits));

        this.#_nodeList.uuidChanged.connect(this.sessionUUIDChanged);

        this.#_nodeList.nodeKilled.connect((node: Node) => {
            if (node.getType() === NodeTypeValue.AvatarMixer) {
                this.clearOtherAvatars();
            }
        });

    }


    /*@devdoc
     *  Triggered when an avatar is added.
     *  @function AvatarHashMap.avatarAdded
     *  @param {Uuid} sessionUUID - The UUID of the avatar that was added.
     *  @returns {Signal}
     */
    get avatarAdded(): Signal {
        // C++  void avatarAddedEvent(const QUuid& sessionUUID)
        return this.#_avatarAddedEvent.signal();
    }

    /*@devdoc
     *  Triggered when an avatar is removed.
     *  @function AvatarHashMap.avatarRemoved
     *  @param {Uuid} sessionUUID - The UUID of the avatar that was removed.
     *  @returns {Signal}
     */
    get avatarRemoved(): Signal {
        // C++  void avatarRemovedEvent(const QUuid& sessionUUID)
        return this.#_avatarRemovedEvent.signal();
    }


    /*@devdoc
     *  Clears out the data on avatars other than the user client's.
     */
    clearOtherAvatars(): void {  // eslint-disable-line class-methods-use-this
        // C++  void AvatarHashMap::clearOtherAvatars()
        // This method is overridden in AvatarManager and shouldn't be called for user clients.
        console.error("[avatars] AvatarHashMap.clearOtherAvatars() shouldn't be called!");
    }

    /*@devdoc
     *  Gets the number of avatars the user client knows about in the domain, including the user client's.
     *  @returns {number} The number of avatars the user client knows about in the domain.
     */
    getAvatarCount(): number {
        // C++  N/A
        return this._avatarHash.size;
    }

    /*@devdoc
     * Gets the IDs of all avatars the user client knows about in the domain. The user client's avatar is included as a
     * <code>Uuid.NULL</code> value.
     * @returns {Uuid[]} The IDs of all avatars in the domain.
     */
    getAvatarIdentifiers(): Array<Uuid> {
        // C++  QVector<QUuid> getAvatarIdentifiers()
        return [...this._avatarHash.keys()].map((uuid) => {
            return new Uuid(uuid);
        });
    }


    /*@devdoc
     *  Processes a {@link PacketType(1)|KillAvatar} message that has been received.
     *  @function AvatarHashMap.processKillAvatar
     *  @type {Slot}
     *  @param {ReceivedMessage} receivedMessage - The received {@link PacketType(1)|KillAvatar} message.
     *  @param {Node} sendingNode - The sending node.
     */
    // Listener
    processKillAvatar = (message: ReceivedMessage /* , sendingNode: Node | null */): void => {
        // C++  void processKillAvatar(ReceivedMessage* message, Node* sendingNode)

        const killAvatarDetals = PacketScribe.KillAvatar.read(message.getMessage());
        this.removeAvatar(killAvatarDetals.sessionUUID, killAvatarDetals.reason);
        // AvatarReplicas per the C++ is not implemented because that is for load testing.
    };

    /*@devdoc
     *  Processes a {@link PacketType(1)|AvatarIdentity} message that has been received.
     *  @function AvatarHashMap.processAvatarIdentityPacket
     *  @type {Slot}
     *  @param {ReceivedMessage} receivedMessage - The received {@link PacketType(1)|AvatarIdentity} message.
     *  @param {Node} sendingNode - The sending node.
     */
    // Listener
    processAvatarIdentityPacket = (message: ReceivedMessage, sendingNode: Node | null): void => {
        // C++  void processAvatarIdentityPacket(ReceivedMessage* message, Node* sendingNode)

        const avatarIdentityDetailsList = PacketScribe.AvatarIdentity.read(message.getMessage());
        for (const avatarIdentityDetails of avatarIdentityDetailsList) {
            let identityUUID = avatarIdentityDetails.sessionUUID;
            if (!identityUUID.isNull()) {

                // Replace MyAvatar's UUID with null.
                const me = this._avatarHash.get(Uuid.NULL);
                if (me !== undefined && identityUUID.value() === me.getSessionUUID().value()) {
                    identityUUID = new Uuid(Uuid.NULL);
                }

                // Process if not an ignored avatar or have requested domain list data.
                if (!this.#_nodeList.isIgnoringNode(identityUUID) || this.#_nodeList.getRequestsDomainListData()) {
                    const isNewAvatar = false;
                    const avatar: AvatarData = this.#newOrExistingAvatar(identityUUID, sendingNode, { value: isNewAvatar });
                    const identityChanged = false;
                    const displayNameChanged = false;
                    avatar.processAvatarIdentity(avatarIdentityDetails, { value: identityChanged },
                        { value: displayNameChanged });
                    // AvatarReplicas per the C++ is not implemented because that is for load testing.
                }

            } else {
                console.log("[avatars] Refusing to process identity packet with null avatar ID.");
            }
        }
    };

    /*@devdoc
     *  Processes a {@link PacketType(1)|BulkAvatarData} message that has been received.
     *  @function AvatarHashMap.processAvatarDataPacket
     *  @type {Slot}
     *  @param {ReceivedMessage} receivedMessage - The received {@link PacketType(1)|BuilkAvatarData} message.
     *  @param {Node} sendingNode - The sending node.
     */
    //  Listener
    processAvatarDataPacket = (message: ReceivedMessage, sendingNode: Node | null): void => {
        // C++  void processAvatarDataPacket(ReceivedMessage* message, Node* sendingNode)

        const avatarDataDetails = PacketScribe.BulkAvatarData.read(message.getMessage());
        for (const avatarData of avatarDataDetails) {
            this.#parseAvatarData(avatarData, sendingNode);
        }
    };

    /*@devdoc
     *  Processes a {@link PacketType(1)|BulkAvatarTraits} message that has been received.
     *  @function AvatarHashMap.processAvatarTraits
     *  @type {Slot}
     *  @param {ReceivedMessage} receivedMessage - The received {@link PacketType(1)|BuilkAvatarTraits} message.
     *  @param {Node} sendingNode - The sending node.
     */
    //  Listener
    // eslint-disable-next-line
    // @ts-ignore
    processBulkAvatarTraits = (message: ReceivedMessage, sendingNode: Node | null): void => {  // eslint-disable-line
        // C++  void processBulkAvatarTraits(ReceivedMessage* message, Node* sendingNode)

        const bulkAvatarTraitsDetails = PacketScribe.BulkAvatarTraits.read(message.getMessage());

        // Send ACK.
        const traitsAckPacket = PacketScribe.BulkAvatarTraitsAck.write({
            traitsSequenceNumber: bulkAvatarTraitsDetails.traitsSequenceNumber
        });
        const avatarMixer = this.#_nodeList.soloNodeOfType(NodeType.AvatarMixer);
        if (avatarMixer) {
            this.#_nodeList.sendPacket(traitsAckPacket, avatarMixer);
        }

        // Process the avatar traits data.
        for (const avatarTraits of bulkAvatarTraitsDetails.avatarTraitsList) {

            const isNewAvatar = false;
            const avatar = this.#newOrExistingAvatar(avatarTraits.avatarID, sendingNode, { value: isNewAvatar });

            let lastProcessedVersions = this.#_processedTraitVersions.get(avatarTraits.avatarID);

            for (const avatarTraitValue of avatarTraits.avatarTraits) {

                if (AvatarTraits.isSimpleTrait(avatarTraitValue.type)) {
                    let lastProcessedVersion = 0;
                    if (lastProcessedVersions !== undefined) {
                        lastProcessedVersion = lastProcessedVersions.get(avatarTraitValue.type) ?? 0;
                    }

                    if (avatarTraitValue.version > lastProcessedVersion) {
                        avatar.processTrait(avatarTraitValue.type, avatarTraitValue.value);
                        // AvatarReplicas per the C++ is not implemented because that is for load testing.

                        if (lastProcessedVersions === undefined) {
                            lastProcessedVersions = new Map();
                            this.#_processedTraitVersions.set(avatarTraits.avatarID, lastProcessedVersions);
                        }
                        lastProcessedVersions.set(avatarTraitValue.type, avatarTraitValue.version);
                    }


                } else {

                    // WEBRTC TODO: Address further C++ code - avatar entity and grab traits.

                }

            }

        }

    };


    /*@devdoc
     *  Handles the user client's session UUID changing.
     *  @function AvatarHashMap.sessionUUIDChanged
     *  @type {Slot}
     *  @param {Uuid} sessionUUID - The new session UUID.
     *  @param {Uuid} oldUUID - The old session UUID.
     */
    // eslint-disable-next-line
    // @ts-ignore
    sessionUUIDChanged = (sessionUUID: Uuid, oldUUID: Uuid): void => {
        // C++  void sessionUUIDChanged(const QUuid& sessionUUID, const QUuid& oldUUID)

        this.#_lastOwnerSessionUUID = oldUUID;

        // WEBRTC TODO: Address further C++ code - emit avatarSessionChangedEvent() for API.

    };


    protected findAvatar(sessionUUID: Uuid): AvatarData | null {
        // C++  AvatarData* findAvatar(const QUuid& sessionUUID)
        const avatar = this._avatarHash.get(sessionUUID.value());
        return avatar ? avatar : null;
    }

    protected newSharedAvatar(sessionUUID: Uuid): AvatarData {
        // C++  AvatarData* newSharedAvatar(const QUuid& sessionUUID)
        const avatarData = new AvatarData(this.#_contextID);
        avatarData.setSessionUUID(sessionUUID);
        return avatarData;
    }

    // eslint-disable-next-line
    // @ts-ignore
    protected addAvatar(sessionUUID: Uuid, mixerWeakPointer: Node | null): AvatarData {    // eslint-disable-line
        // C++  Avatar* addAvatar(const QUuid& sessionUUID, const Node* mixerWeakPointer)
        console.log("[avatars] Adding avatar with sessionUUID", sessionUUID.stringify(), "to AvatarHashMap.");

        const avatar = this.newSharedAvatar(sessionUUID);
        // setOwningAvatarMixer() not called because it doesn't do anything.
        // WEBRTC TODO: Address further C++ code - remove owningAvatarMixer.

        this._avatarHash.set(sessionUUID.value(), avatar);
        this.#_avatarAddedEvent.emit(sessionUUID);
        return avatar;
    }

    protected handleRemovedAvatar(removedAvatar: AvatarData, removalReason = KillAvatarReason.NoReason): void {
        // C++  void handleRemovedAvatar(const Avatar* removedAvatar,
        //          KillAvatarReason removalReason = KillAvatarReason::NoReason);

        this.#_processedTraitVersions.delete(removedAvatar.getID());

        console.log("[avatars] Removed avatar with UUID", removedAvatar.getSessionUUID().stringify(), "from AvatarHashMap",
            removalReason);

        this.#_avatarRemovedEvent.emit(removedAvatar.getSessionUUID());
    }

    protected removeAvatar(sessionUUID: Uuid, removalReason: KillAvatarReason): void {
        // C++  void removeAvatar(const QUuid& sessionUUID, KillAvatarReason removalReason)
        const removedAvatar = this._avatarHash.get(sessionUUID.value());
        if (removedAvatar) {
            this._avatarHash.delete(sessionUUID.value());
            this.handleRemovedAvatar(removedAvatar, removalReason);
        }
    }


    #newOrExistingAvatar(sessionUUID: Uuid, mixerWeakPointer: Node | null, isNew: { value: boolean }): AvatarData {
        // C++  AvatarSharedPointer newOrExistingAvatar(const QUuid& sessionUUID, const Node* mixerWeakPointer, bool& isNew)
        let avatar = this.findAvatar(sessionUUID);
        if (!avatar) {
            avatar = this.addAvatar(sessionUUID, mixerWeakPointer);
            isNew.value = true;
        } else {
            isNew.value = false;
        }
        return avatar;
    }

    #parseAvatarData(avatarData: BulkAvatarDataDetails, sendingNode: Node | null): void {
        // C++  AvatarData* parseAvatarData(ReceivedMessage* message, Node* sendingNode)
        //      int AvatarData::parseDataFromBuffer(const QByteArray& buffer)

        const sessionUUID = avatarData.sessionUUID;
        assert(sessionUUID !== undefined);

        if (sessionUUID.value() !== this.#_lastOwnerSessionUUID.value()
                && (!this.#_nodeList.isIgnoringNode(sessionUUID) || this.#_nodeList.getRequestsDomainListData())) {

            const isNewAvatar = { value: false };
            const avatar = this.#newOrExistingAvatar(sessionUUID, sendingNode, isNewAvatar);

            // WEBRTC TODO: Address further C++ code - use isNewAvatar value for avatar transits.

            // AvatarReplicas per the C++ is not implemented because that is for load testing.

            avatar.parseDataFromBuffer(avatarData);

        } else {
            // This shouldn't happen if the avatar mixer is functioning correctly.
            console.warn("[avatars] Discarding received avatar data", sessionUUID.stringify(),
                sessionUUID.value() === this.#_lastOwnerSessionUUID.value() ? "(is self)" : "",
                "isIgnoringNode =", this.#_nodeList.isIgnoringNode(sessionUUID));

            // Don't need to create a dummy AvatarData object per the C++ because we're not returning an avatar.
        }
    }

}

export default AvatarHashMap;
