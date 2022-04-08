import AvatarData from "./domain/avatars/AvatarData";

class ClientTraitsHandler {
    // c++ ClientTraitsHandler.cpp

    // @ts-ignore
    #_owningAvatar;
    #_hasChangedTraits;
    #_shouldPerformInitialSend;

    constructor(owningAvatar: AvatarData) {
        this.#_owningAvatar = owningAvatar;
        this.#_hasChangedTraits = false;
        this.#_shouldPerformInitialSend = false;
    }

    sendChangedTraitsToMixer(): number {
        const bytesWritten = 0;

        if (this.#_hasChangedTraits || this.#_shouldPerformInitialSend) {

            // TODO julien: create packet with PacketScribe.SetAvatarTraits.write()
            // TODO: get currentTraitVersion
            // const packet = PacketScribe.SetAvatarTraits.write({});
            // TODO julien: send packet
            // this.sendPacket(replyPacket, sendingNode, message.getSenderSockAddr());
        }

        return bytesWritten;
    }
}

export default ClientTraitsHandler;
