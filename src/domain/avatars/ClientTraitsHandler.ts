//
//  ClientTraitsHandler.ts
//
//  Created by Julien Merzoug on 8 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketScribe from "../networking/packets/PacketScribe";
import Node from "../networking/Node";
import NodeList from "../networking/NodeList";
import NodeType from "../networking/NodeType";
import ContextManager from "../shared/ContextManager";
import AvatarData from "./AvatarData";
import AvatarTraits, { TraitType } from "./AvatarTraits";


/*@devdoc
 *  The status of a {@link ClientTraitsHandler|client avatar trait}.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>Unchanged</td><td><code>0</code></td><td>The trait is unchanged.</td></tr>
 *          <tr><td>Updated</td><td><code>1</code></td><td>The trait has been updated.</td></tr>
 *          <tr><td>Deleted</td><td><code>2</code></td><td>The trait has been deleted.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} ClientTraitStatus
 */
enum ClientTraitStatus {
    // C++  enum ClientTraitStatus
    Unchanged,
    Updated,
    Deleted
}


/*@devdoc
 *  The <code>ClientTraitsHandler</code> class manages the client's avatar traits that are sent to and overridden by the avatar
 *  mixer.
 *  <p>C++: <code>class ClientTraitsHandler : public QObject</code></p>
 *  @class ClientTraitsHandler
 *  @param {AvatarData} owningAvatar - The client avatar that the traits are for.
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
class ClientTraitsHandler {
    // C++ class ClientTraitsHandler : public QObject

    // Context
    #_nodeList: NodeList;

    #_owningAvatar: AvatarData;

    #_hasChangedTraits = false;
    #_shouldPerformInitialSend = false;

    #_currentTraitVersion = AvatarTraits.DEFAULT_TRAIT_VERSION;

    // WEBRTC TODO: Use AssociatedTraitValues
    // Because AssociatedTraitValues is a fairly complex class and that we need to hold only simple traits for now,
    // we use an array.
    // C++ AssociatedTraitValues<ClientTraitStatus, Unchanged> _traitStatuses
    #_traitStatuses = new Array<ClientTraitStatus>(AvatarTraits.NUM_SIMPLE_TRAITS).fill(ClientTraitStatus.Unchanged);


    constructor(owningAvatar: AvatarData, contextID: number) {
        // C++  ClientTraitsHandler(AvatarData* owningAvatar)

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

        this.#_owningAvatar = owningAvatar;

        this.#_nodeList.nodeAdded.connect((addedNode: Node) => {
            if (addedNode.getType() === NodeType.AvatarMixer) {
                this.resetForNewMixer();
            }
        });

        // WEBRTC TODO: Address further C++ code - receiving SetAvatarTraits packet from avatar mixer.

        Object.seal(this.#_traitStatuses);
    }


    /*@devdoc
     *  Marks a trait's status as updated.
     *  @param {AvatarTraits.TraitType} updatedTrait - The trait to mark as updated.
     */
    markTraitUpdated(updatedTrait: TraitType): void {
        // C++ void markTraitUpdated(AvatarTraits::TraitType updatedTrait)

        // WEBRTC TODO: Enable other trait types.
        if (updatedTrait !== AvatarTraits.SkeletonModelURL) {
            console.error("Trait not implemented for updating:", updatedTrait);
            return;
        }

        this.#_traitStatuses[updatedTrait] = ClientTraitStatus.Updated;
        this.#_hasChangedTraits = true;
    }

    /*@devdoc
     *  Resets client traits handling for a new avatar mixer.
     */
    resetForNewMixer(): void {
        // C++  void resetForNewMixer()

        // Reset the current trait version.
        this.#_currentTraitVersion = AvatarTraits.DEFAULT_TRAIT_VERSION;

        // Mark that all traits should be sent next time.
        this.#_shouldPerformInitialSend = true;

        // Reset the trait statuses.
        // WEBRTC TODO: Call #_traitStatuses.reset() once class AssociatedTraitValues is implemented.
        this.#_traitStatuses.fill(ClientTraitStatus.Unchanged);

        // WEBRTC TODO: Instanced trait handling.

    }

    /*@devdoc
     *  Sends the avatar traits that have been updated or deleted to the avatar mixer.
     *  @returns {number} The number of bytes sent.
     */
    sendChangedTraitsToMixer(): number {
        // C++ int sendChangedTraitsToMixer()

        const bytesWritten = 0;

        if (this.#_hasChangedTraits || this.#_shouldPerformInitialSend) {

            const avatarMixer = this.#_nodeList.soloNodeOfType(NodeType.AvatarMixer);
            if (!avatarMixer || !avatarMixer.getActiveSocket()) {
                return 0;
            }

            this.#_currentTraitVersion += 1;

            // Take a copy of the set of changed traits and clear the stored set.
            const traitStatusCopy = [...this.#_traitStatuses];
            // WEBRTC TODO: call #_traitStatuses.reset() once class AssociatedTraitValues is implemented
            this.#_traitStatuses.fill(ClientTraitStatus.Unchanged);
            this.#_hasChangedTraits = false;

            // If this was an initial send of all traits, consider it completed.
            const initialSend = this.#_shouldPerformInitialSend;
            this.#_shouldPerformInitialSend = false;

            // Send skeletonModelURL trait.
            // WEBRTC TODO: Send other trait types.
            const packetList = PacketScribe.SetAvatarTraits.write({
                currentTraitVersion: this.#_currentTraitVersion,
                skeletonModelURL: this.#_owningAvatar.skeletonModelURL !== null ? this.#_owningAvatar.skeletonModelURL : "",
                traitStatuses: traitStatusCopy,
                initialSend
            });

            // WEBRTC TODO: Update #_currentSkeletonVersion.

            this.#_nodeList.sendPacketList(packetList, avatarMixer);
        }

        return bytesWritten;
    }

}

export default ClientTraitsHandler;
export { ClientTraitStatus };
