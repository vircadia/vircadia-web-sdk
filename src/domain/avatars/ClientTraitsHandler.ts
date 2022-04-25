//
//  ClientTraitsHandler.ts
//
//  Created by Julien Merzoug on 8 Apr 2022.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarData from "./AvatarData";
import PacketScribe from "../networking/packets/PacketScribe";
import ContextManager from "../shared/ContextManager";
import NodeList from "../networking/NodeList";
import NodeType from "../networking/NodeType";
import { TraitVersion, ClientTraitStatus, NUM_SIMPLE_TRAITS, TraitType } from "./AvatarTraits";

// TODO julien: class description doc
/*@devdoc
 *  The <code>ClientTraitsHandler</code> class
 */
class ClientTraitsHandler {
    // C++ class ClientTraitsHandler : public QObject

    // Context
    #_nodeList;

    #_owningAvatar;
    #_hasChangedTraits;
    #_shouldPerformInitialSend;
    #_currentTraitVersion;
    // TODO julien: comment why we're using an array instead of AssociatedTraitValues as in the C++
    #_traitStatuses = new Array<ClientTraitStatus>(NUM_SIMPLE_TRAITS).fill(ClientTraitStatus.Unchanged);

    constructor(owningAvatar: AvatarData, contextID: number) {
        this.#_owningAvatar = owningAvatar;
        this.#_hasChangedTraits = false;
        this.#_shouldPerformInitialSend = false;
        this.#_currentTraitVersion = TraitVersion.DefaultTraitVersion;

        Object.seal(this.#_traitStatuses);

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

    }

    // TODO julien: doc
    markTraitUpdated(updatedTrait: TraitType): void {
        this.#_traitStatuses[updatedTrait] = ClientTraitStatus.Updated;
        this.#_hasChangedTraits = true;
    }

    // TODO julien: doc
    sendChangedTraitsToMixer(): number {
        const bytesWritten = 0;

        if (this.#_hasChangedTraits || this.#_shouldPerformInitialSend) {
            this.#_currentTraitVersion += 1;

            const traitStatusCopy = [...this.#_traitStatuses];
            // TODO julien: explain why we are not calling #_traitStatuses.reset()
            this.#_traitStatuses.fill(ClientTraitStatus.Unchanged);
            this.#_hasChangedTraits = false;

            const initialSend = this.#_shouldPerformInitialSend;
            this.#_shouldPerformInitialSend = false;

            const packetList = PacketScribe.SetAvatarTraits.write({
                currentTraitVersion: this.#_currentTraitVersion,
                skeletonModelURL: this.#_owningAvatar.skeletonModelURL,
                traitStatuses: traitStatusCopy,
                initialSend
            });

            // WEBRTC TODO: Update _currentSkeletonVersion

            const avatarMixer = this.#_nodeList.soloNodeOfType(NodeType.AvatarMixer);
            if (avatarMixer) {
                this.#_nodeList.sendPacketList(packetList, avatarMixer);
            }
        }

        return bytesWritten;
    }
}

export default ClientTraitsHandler;
