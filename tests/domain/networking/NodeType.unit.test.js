//
//  NodeType.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeType from "../../../src/domain/networking/NodeType";


describe("NodeType - unit tests", () => {

    test("NodeType values appear to be correct", () => {
        expect(NodeType.DomainServer).toBe("D");
        expect(NodeType.MessagesMixer).toBe("m");
        expect(NodeType.Unassigned).toBe(String.fromCharCode(1));
    });

    test("NodeType strings appear to be correct", () => {
        expect(NodeType.getNodeTypeName(NodeType.DomainServer)).toBe("Domain Server");
        expect(NodeType.getNodeTypeName(NodeType.MessagesMixer)).toBe("Messages Mixer");
        expect(NodeType.getNodeTypeName(NodeType.Unassigned)).toBe("Unassigned");
        expect(NodeType.getNodeTypeName("-")).toBe("Unknown");
    });

    test("Upstream node types are identified", () => {
        expect(NodeType.isUpstream(NodeType.AudioMixer)).toBe(false);
        expect(NodeType.isUpstream(NodeType.UpstreamAudioMixer)).toBe(true);
        expect(NodeType.isUpstream(NodeType.UpstreamAvatarMixer)).toBe(true);
        expect(NodeType.isUpstream(NodeType.DownstreamAudioMixer)).toBe(false);
        expect(NodeType.isUpstream(NodeType.Unassigned)).toBe(false);
    });
});
