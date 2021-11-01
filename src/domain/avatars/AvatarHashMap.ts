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
import ContextManager from "../shared/ContextManager";
import Uuid from "../shared/Uuid";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";


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


    protected _avatarHash = new Map<Uuid | null, AvatarData>();


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

        // WEBRTC TODO: Address further C++ code - packet handling.

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
     * <code>null</code> value.
     * @returns {Uuid[]} The IDs of all avatars in the domain.
     */
    getAvatarIdentifiers(): Array<Uuid | null> {
        // C++  QVector<QUuid> getAvatarIdentifiers()
        return [...this._avatarHash.keys()];
    }


    protected findAvatar(sessionUUID: Uuid): AvatarData | null {
        // C++  AvatarData* findAvatar(const QUuid& sessionUUID)
        const avatar = this._avatarHash.get(sessionUUID);
        return avatar ? avatar : null;
    }

    protected newSharedAvatar(sessionUUID: Uuid): AvatarData {
        // C++  AvatarData* newSharedAvatar(const QUuid& sessionUUID)
        const avatarData = new AvatarData(this.#_contextID);
        avatarData.setSessionUUID(sessionUUID);
        return avatarData;
    }

    protected addAvatar(sessionUUID: Uuid /* , mixerWeakPointer: Node */): AvatarData {
        // C++  Avatar* addAvatar(const QUuid& sessionUUID, const Node* mixerWeakPointer)
        console.log("[avatars] Adding avatar with sessionUUID", sessionUUID.stringify(), "to AvatarHashMap.");

        const avatar = this.newSharedAvatar(sessionUUID);
        // setOwningAvatarMixer() not called because it doesn't do anything.
        // WEBRTC TODO: Address further C++ code - remove owningAvatarMixer.

        this._avatarHash.set(sessionUUID, avatar);
        this.#_avatarAddedEvent.emit(sessionUUID);
        return avatar;
    }

    protected handleRemovedAvatar(removedAvatar: AvatarData, removalReason = KillAvatarReason.NoReason): void {
        // C++  void handleRemovedAvatar(const Avatar* removedAvatar,
        //          KillAvatarReason removalReason = KillAvatarReason:: NoReason);

        // WEBRTC TODO: Address further C++ code - avatar traits;

        console.log("[avatars] Removed avatar with UUID", removedAvatar.getSessionUUID().stringify(), "from AvatarHashMap",
            removalReason);

        this.#_avatarRemovedEvent.emit(removedAvatar.getSessionUUID());
    }

    protected removeAvatar(sessionUUID: Uuid, removalReason: KillAvatarReason): void {
        // C++  void removeAvatar(const QUuid& sessionUUID, KillAvatarReason removalReason)
        const removedAvatar = this._avatarHash.get(sessionUUID);
        if (removedAvatar) {
            this._avatarHash.delete(sessionUUID);  // eslint-disable-line @typescript-eslint/dot-notation
            this.handleRemovedAvatar(removedAvatar, removalReason);
        }
    }

}

export default AvatarHashMap;
