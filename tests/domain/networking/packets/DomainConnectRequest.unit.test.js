//
//  DomainConnectRequest.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import LimitedNodeList from "../../../../src/domain/networking/LimitedNodeList";
import NLPacket from "../../../../src/domain/networking/NLPacket";
import NodeType from "../../../../src/domain/networking/NodeType";
import SockAddr from "../../../../src/domain/networking/SockAddr";
import DomainConnectRequest from "../../../../src/domain/networking/packets/DomainConnectRequest";
import PacketType, { protocolVersionsSignature } from "../../../../src/domain/networking/udt/PacketHeaders";
import Uuid from "../../../../src/domain/shared/Uuid";


describe("DomainConnectRequest - unit tests", () => {

    let connectedPacketSize = 0;
    let disconnectedPacketSize = 0;

    test("Can write a connected DomainConnectRequest packet", () => {
        const packet = DomainConnectRequest.write({
            connectUUID: new Uuid(),
            protocolVersionSig: protocolVersionsSignature(),
            hardwareAddress: "",
            machineFingerprint: new Uuid(),
            compressedSystemInfo: new Uint8Array(new ArrayBuffer(0)),
            connectReason: LimitedNodeList.ConnectReason.Connect,
            previousConnectionUptime: BigInt(0),
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
        expect(packet.getType()).toBe(PacketType.DomainConnectRequest);
        connectedPacketSize = packet.getMessageData().dataPosition;
        expect(connectedPacketSize).toBeGreaterThan(0);
    });

    test("Can write a disconnected DomainConnectRequest packet", () => {
        const packet = DomainConnectRequest.write({
            connectUUID: new Uuid(),
            protocolVersionSig: protocolVersionsSignature(),
            hardwareAddress: "",
            machineFingerprint: new Uuid(),
            compressedSystemInfo: new Uint8Array(new ArrayBuffer(0)),
            connectReason: LimitedNodeList.ConnectReason.Connect,
            previousConnectionUptime: BigInt(0),
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
            usernameSignature: new ArrayBuffer(0),
            domainUsername: "domainuser",
            domainTokens: "domaintokens"
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.DomainConnectRequest);
        disconnectedPacketSize = packet.getMessageData().dataPosition;
        expect(disconnectedPacketSize).toBeGreaterThan(0);
        expect(disconnectedPacketSize).toBeGreaterThan(connectedPacketSize);
    });

});
