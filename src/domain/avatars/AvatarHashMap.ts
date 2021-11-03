//
//  AvatarHashMap.ts
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarData, { KillAvatarReason } from "./AvatarData";
import Node from "../networking/Node";
import NodeList from "../networking/NodeList";
import { NodeTypeValue } from "../networking/NodeType";
import PacketReceiver from "../networking/PacketReceiver";
import ReceivedMessage from "../networking/ReceivedMessage";
import { PacketTypeValue } from "../networking/udt/PacketHeaders";
import ContextManager from "../shared/ContextManager";
import Uuid from "../shared/Uuid";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import PacketScribe from "../networking/packets/PacketScribe";


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

    #_avatarAddedEvent = new SignalEmitter();
    #_avatarRemovedEvent = new SignalEmitter();

    // AvatarReplicas per the C++ is not implemented because that is for load testing.


    constructor(contextID: number) {
        // C++  AvatarHashMap()

        // Context
        this.#_contextID = contextID;
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

        const packetReceiver = this.#_nodeList.getPacketReceiver();

        // WEBRTC TODO: Address further C++ code - BulkAvatarData packet.
        // WEBRTC TODO: Address further C++ code - KillAvatar packet.

        packetReceiver.registerListener(PacketTypeValue.AvatarIdentity,
            PacketReceiver.makeSourcedListenerReference(this.processAvatarIdentityPacket));

        // WEBRTC TODO: Address further C++ code - BulkAvatarTraits packet.

        // WEBRTC TODO: Address further C++ code - NodeList.uuidChanged().

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
        return this.#_avatarAddedEvent.signal();
    }

    /*@devdoc
     *  Triggered when an avatar is removed.
     *  @function AvatarHashMap.avatarRemoved
     *  @param {Uuid} sessionUUID - The UUID of the avatar that was removed.
     *  @returns {Signal}
     */
    get avatarRemoved(): Signal {
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
     *  Processes a {@link PacketType(1)|AvatarIdentity} message that has been received.
     *  @function AvatarHashMap.processAvatarIdentityPacket
     *  @type {Slot}
     *  @param {ReceivedMessage} receivedMessage - The received {@link PacketType(1)|AvatarIdentity} message.
     *  @param {Node} sendingNode - The sending node.
     */
    // Listener
    processAvatarIdentityPacket = (message: ReceivedMessage, sendingNode: Node | null): void => {
        // C++  void processAvatarIdentityPacket(ReceivedMessage* message, node* sendingNode)

        const avatarIdentityDetailsList = PacketScribe.AvatarIdentity.read(message.getMessage());
        for (const avatarIdentityDetails of avatarIdentityDetailsList) {
            let identityUUID = avatarIdentityDetails.sessionUUID;
            if (identityUUID.value() !== Uuid.NULL) {

                // Replace MyAvatar's UUID with null.
                const me = this._avatarHash.get(Uuid.NULL);
                if (me !== undefined && identityUUID.value() === me.getSessionUUID().value()) {
                    identityUUID = new Uuid(Uuid.NULL);
                }

                // Process if not an ignored avatar or have requested domain list data.
                if (identityUUID !== null && (!this.#_nodeList.isIgnoringNode(identityUUID)
                        || this.#_nodeList.getRequestsDomainListData())) {
                    const isNewAvatar = false;
                    const avatar: AvatarData = this.newOrExistingAvatar(identityUUID, sendingNode, { value: isNewAvatar });
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


    protected findAvatar(sessionUUID: Uuid): AvatarData | null {
        // C++  AvatarData* findAvatar(const QUuid& sessionUUID)
        const avatar = this._avatarHash.get(sessionUUID.value());
        return avatar ? avatar : null;
    }

    protected newSharedAvatar(sessionUUID: Uuid): AvatarData {
        // C++  AvatarData* newSharedAvatar(const QUuid& sessionUUID)
        console.debug("$$$$$$$ AvatarHashMap.newSharedAvatar()");
        const avatarData = new AvatarData(this.#_contextID);
        avatarData.setSessionUUID(sessionUUID);
        return avatarData;
    }

    // eslint-disable-next-line
    // @ts-ignore
    protected addAvatar(sessionUUID: Uuid, mixerWeakPointer: Node | null): AvatarData {    // eslint-disable-line
        // C++  Avatar* addAvatar(const QUuid& sessionUUID, const Node* mixerWeakPointer)
        console.debug("$$$$$$$ AvatarHashMap.addAvatar()");
        console.log("[avatars] Adding avatar with sessionUUID", sessionUUID.stringify(), "to AvatarHashMap.");

        const avatar = this.newSharedAvatar(sessionUUID);
        // setOwningAvatarMixer() not called because it doesn't do anything.
        // WEBRTC TODO: Address further C++ code - remove owningAvatarMixer.

        this._avatarHash.set(sessionUUID.value(), avatar);
        this.#_avatarAddedEvent.emit(sessionUUID);
        return avatar;
    }

    newOrExistingAvatar(sessionUUID: Uuid, mixerWeakPointer: Node | null, isNew: { value: boolean }): AvatarData {
        // C++  AvatarSharedPointer newOrExistingAvatar(const QUuid& sessionUUID, const Node* mixerWeakPointer, bool& isNew)
        console.debug("$$$$$$$ AvatarHashMap.newOrExistingAvatar() :", sessionUUID, sessionUUID.stringify());
        console.debug("$$$$... Num avatars in hash =", this._avatarHash.size);
        console.debug("$$$$... Avatar IDs in hash = ...");
        for (const key of this._avatarHash.keys()) {
            console.debug("$$.....", key);
        }
        let avatar = this.findAvatar(sessionUUID);
        console.debug("$$$$... avatar =", avatar);
        if (!avatar) {
            avatar = this.addAvatar(sessionUUID, mixerWeakPointer);
            console.debug("$$$$... new");
            isNew.value = true;
        } else {
            console.debug("$$$$... existing");
            isNew.value = false;
        }
        return avatar;
    }

    protected handleRemovedAvatar(removedAvatar: AvatarData, removalReason = KillAvatarReason.NoReason): void {
        // C++  void handleRemovedAvatar(const Avatar* removedAvatar,
        //          KillAvatarReason removalReason = KillAvatarReason:: NoReason);
        console.debug("$$$$$$$ AvatarHashMap.handleRemovedAvatar()");

        // WEBRTC TODO: Address further C++ code - avatar traits;

        console.log("[avatars] Removed avatar with UUID", removedAvatar.getSessionUUID().stringify(), "from AvatarHashMap",
            removalReason);

        this.#_avatarRemovedEvent.emit(removedAvatar.getSessionUUID());
    }

    protected removeAvatar(sessionUUID: Uuid, removalReason: KillAvatarReason): void {
        // C++  void removeAvatar(const QUuid& sessionUUID, KillAvatarReason removalReason)
        const removedAvatar = this._avatarHash.get(sessionUUID.value());
        if (removedAvatar) {
            this._avatarHash.delete(sessionUUID.value());  // eslint-disable-line @typescript-eslint/dot-notation
            this.handleRemovedAvatar(removedAvatar, removalReason);
        }
    }

}

export default AvatarHashMap;
