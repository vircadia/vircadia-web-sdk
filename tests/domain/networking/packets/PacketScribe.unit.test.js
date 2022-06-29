//
//  PacketScribe.unit.tests.js
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketScribe from "../../../../src/domain/networking/packets/PacketScribe";


describe("Packets - unit tests", () => {

    test("The Packets namespace provides packet reading/writing", () => {
        // In packet number order.
        expect(typeof PacketScribe.DomainList).toBe("object");
        expect(typeof PacketScribe.DomainList.read).toBe("function");
        expect(typeof PacketScribe.Ping).toBe("object");
        expect(typeof PacketScribe.Ping.read).toBe("function");
        expect(typeof PacketScribe.PingReply).toBe("object");
        expect(typeof PacketScribe.PingReply.write).toBe("function");
        expect(typeof PacketScribe.KillAvatar).toBe("object");
        expect(typeof PacketScribe.KillAvatar.read).toBe("function");
        expect(typeof PacketScribe.AvatarData).toBe("object");
        expect(typeof PacketScribe.AvatarData.write).toBe("function");
        expect(typeof PacketScribe.MixedAudio).toBe("object");
        expect(typeof PacketScribe.MixedAudio.read).toBe("function");
        expect(typeof PacketScribe.MicrophoneAudioNoEcho).toBe("object");
        expect(typeof PacketScribe.MicrophoneAudioNoEcho.write).toBe("function");
        expect(typeof PacketScribe.BulkAvatarData).toBe("object");
        expect(typeof PacketScribe.BulkAvatarData.read).toBe("function");
        expect(typeof PacketScribe.SilentAudioFrame).toBe("object");
        expect(typeof PacketScribe.SilentAudioFrame.read).toBe("function");
        expect(typeof PacketScribe.SilentAudioFrame.write).toBe("function");
        expect(typeof PacketScribe.DomainListRequest).toBe("object");
        expect(typeof PacketScribe.DomainListRequest.write).toBe("function");
        expect(typeof PacketScribe.DomainConnectionDenied).toBe("object");
        expect(typeof PacketScribe.DomainConnectionDenied.read).toBe("function");
        expect(typeof PacketScribe.DomainServerPathQuery).toBe("object");
        expect(typeof PacketScribe.DomainServerPathQuery.write).toBe("function");
        expect(typeof PacketScribe.SetAvatarTraits).toBe("object");
        expect(typeof PacketScribe.SetAvatarTraits.write).toBe("function");
        expect(typeof PacketScribe.AvatarIdentity).toBe("object");
        expect(typeof PacketScribe.AvatarIdentity.read).toBe("function");
        expect(typeof PacketScribe.AvatarIdentity.write).toBe("function");
        expect(typeof PacketScribe.DomainConnectRequest).toBe("object");
        expect(typeof PacketScribe.DomainConnectRequest.write).toBe("function");
        expect(typeof PacketScribe.DomainDisconnectRequest).toBe("object");
        expect(typeof PacketScribe.DomainDisconnectRequest.write).toBe("function");
        expect(typeof PacketScribe.DomainServerRemovedNode).toBe("object");
        expect(typeof PacketScribe.DomainServerRemovedNode.read).toBe("function");
        expect(typeof PacketScribe.MessagesData).toBe("object");
        expect(typeof PacketScribe.MessagesData.read).toBe("function");
        expect(typeof PacketScribe.MessagesData.write).toBe("function");
        expect(typeof PacketScribe.MessagesSubscribe).toBe("object");
        expect(typeof PacketScribe.MessagesSubscribe.write).toBe("function");
        expect(typeof PacketScribe.MessagesUnsubscribe).toBe("object");
        expect(typeof PacketScribe.MessagesUnsubscribe.write).toBe("function");
        expect(typeof PacketScribe.NegotiateAudioFormat).toBe("object");
        expect(typeof PacketScribe.NegotiateAudioFormat.write).toBe("function");
        expect(typeof PacketScribe.SelectedAudioFormat).toBe("object");
        expect(typeof PacketScribe.SelectedAudioFormat.read).toBe("function");
        expect(typeof PacketScribe.AvatarQuery).toBe("object");
        expect(typeof PacketScribe.AvatarQuery.write).toBe("function");
        expect(typeof PacketScribe.BulkAvatarTraits).toBe("object");
        expect(typeof PacketScribe.BulkAvatarTraits.read).toBe("function");
    });

});
