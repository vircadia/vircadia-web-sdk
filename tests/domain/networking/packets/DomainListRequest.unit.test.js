//
//  DomainListRequest.unit.test.js
//
//  Created by David Rowe on 28 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../../../../src/domain/networking/NLPacket";
import NodeType from "../../../../src/domain/networking/NodeType";
import SockAddr from "../../../../src/domain/networking/SockAddr";
import DomainListRequest from "../../../../src/domain/networking/packets/DomainListRequest";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";


describe("DomainListRequest - unit tests", () => {

    let connectedPacketSize = 0;
    let disconnectedPacketSize = 0;

    test("Can write a connected DomainListRequest packet", () => {
        const packet = DomainListRequest.write({
            currentTime: BigInt(Date.now().valueOf()),
            ownerType: NodeType.Agent,
            publicSockAddr: new SockAddr(),
            localSockAddr: new SockAddr(),
            nodeTypesOfInterest: new Set([
                NodeType.AudioMixer,
                NodeType.AvatarMixer,
                NodeType.EntityServer,
                NodeType.AssetServer,
                NodeType.MessagesMixer,
                NodeType.EntityScriptServer
            ]),
            placeName: "",
            isDomainConnected: true
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.DomainListRequest);
        connectedPacketSize = packet.getMessageData().dataPosition;
        expect(connectedPacketSize).toBeGreaterThan(0);
    });

    test("Can write a disconnected DomainListRequest packet", () => {
        const packet = DomainListRequest.write({
            currentTime: BigInt(Date.now().valueOf()),
            ownerType: NodeType.Agent,
            publicSockAddr: new SockAddr(),
            localSockAddr: new SockAddr(),
            nodeTypesOfInterest: new Set([
                NodeType.AudioMixer,
                NodeType.AvatarMixer,
                NodeType.EntityServer,
                NodeType.AssetServer,
                NodeType.MessagesMixer,
                NodeType.EntityScriptServer
            ]),
            placeName: "",
            isDomainConnected: false,
            username: "user",
            usernameSignature: new Uint8Array(new ArrayBuffer(0)),
            domainUsername: "domainuser",
            domainTokens: "domaintokens"
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.DomainListRequest);
        disconnectedPacketSize = packet.getMessageData().dataPosition;
        expect(disconnectedPacketSize).toBeGreaterThan(0);
        expect(disconnectedPacketSize).toBeGreaterThan(connectedPacketSize);

    });

});
