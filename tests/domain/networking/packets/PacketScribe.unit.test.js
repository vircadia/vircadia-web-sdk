//
//  PacketScribe.unit.tests.js
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketScribe from "../../../../src/domain/networking/packets/PacketScribe";


describe("Packets - unit tests", () => {

    test("The Packets namespace provides packet reading/writing", () => {
        expect(typeof PacketScribe.DomainList).toBe("object");
        expect(typeof PacketScribe.DomainList.read).toBe("function");
        expect(typeof PacketScribe.Ping).toBe("object");
        expect(typeof PacketScribe.Ping.read).toBe("function");
        expect(typeof PacketScribe.PingReply).toBe("object");
        expect(typeof PacketScribe.PingReply.write).toBe("function");
        expect(typeof PacketScribe.MixedAudio).toBe("object");
        expect(typeof PacketScribe.MixedAudio.read).toBe("function");
        expect(typeof PacketScribe.SilentAudioFrame).toBe("object");
        expect(typeof PacketScribe.SilentAudioFrame.write).toBe("function");
        expect(typeof PacketScribe.DomainListRequest).toBe("object");
        expect(typeof PacketScribe.DomainListRequest.write).toBe("function");
        expect(typeof PacketScribe.DomainConnectionDenied).toBe("object");
        expect(typeof PacketScribe.DomainConnectionDenied.read).toBe("function");
        expect(typeof PacketScribe.DomainConnectRequest).toBe("object");
        expect(typeof PacketScribe.DomainConnectRequest.write).toBe("function");
        expect(typeof PacketScribe.DomainDisconnectRequest).toBe("object");
        expect(typeof PacketScribe.DomainDisconnectRequest.write).toBe("function");
        expect(typeof PacketScribe.DomainServerRemovedNode).toBe("object");
        expect(typeof PacketScribe.DomainServerRemovedNode.read).toBe("function");
        expect(typeof PacketScribe.NegotiateAudioFormat).toBe("object");
        expect(typeof PacketScribe.NegotiateAudioFormat.write).toBe("function");
        expect(typeof PacketScribe.SelectedAudioFormat).toBe("object");
        expect(typeof PacketScribe.SelectedAudioFormat.read).toBe("function");
    });

});
