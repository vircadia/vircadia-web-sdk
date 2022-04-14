import AvatarData from "./AvatarData";
import PacketScribe from "../networking/packets/PacketScribe";
import ContextManager from "../shared/ContextManager";
import NodeList from "../networking/NodeList";
import NodeType from "../networking/NodeType";
import { TraitVersion } from "./AvatarTraits";

class ClientTraitsHandler {
    // c++ ClientTraitsHandler.cpp

    // Context
    #_nodeList;

    #_owningAvatar;
    #_hasChangedTraits;
    #_shouldPerformInitialSend;
    #_currentTraitVersion;

    constructor(owningAvatar: AvatarData, contextID: number) {
        this.#_owningAvatar = owningAvatar;
        this.#_hasChangedTraits = false;
        this.#_shouldPerformInitialSend = false;
        this.#_currentTraitVersion = TraitVersion.DefaultTraitVersion;

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;

    }

    markTraitUpdated() {
        this.#_hasChangedTraits = true;
    }

    sendChangedTraitsToMixer(): number {
        const bytesWritten = 0;

        if (this.#_hasChangedTraits || this.#_shouldPerformInitialSend) {
            this.#_hasChangedTraits = false;
            console.log("PacketScribe.SetAvatarTraits.write called"); // TODO julien: remove

            this.#_currentTraitVersion += 1;

            const packetList = PacketScribe.SetAvatarTraits.write({
                currentTraitVersion: this.#_currentTraitVersion,
                skeletonModelURL: this.#_owningAvatar.skeletonModelURL
            });

            const avatarMixer = this.#_nodeList.soloNodeOfType(NodeType.AvatarMixer);
            if (avatarMixer) {
                this.#_nodeList.sendPacketList(packetList, avatarMixer);
            }

        }

        return bytesWritten;
    }
}

export default ClientTraitsHandler;
