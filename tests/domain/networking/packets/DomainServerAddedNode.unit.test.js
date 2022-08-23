//
//  DomainServerAddedNode.unit.test.js
//
//  Created by David Rowe on 19 Aug 2022.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServerAddedNode from "../../../../src/domain/networking/packets/DomainServerAddedNode";
import NodeType from "../../../../src/domain/networking/NodeType";


describe("DomainServerAddedNode - unit tests", () => {

    test("Can read a DomainServerAddedNode packet", () => {
        /* eslint-disable @typescript-eslint/no-magic-numbers */

        /* eslint-disable-next-line max-len */
        const MESSAGE_TEXT = "4dfb651249d9114b589d7686ed4f6dfc0901006715af042ebd0100c0a8086ee71100000f9f0015af983e5546c17542d2b838aa04fa72e915";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = DomainServerAddedNode.read(dataView);
        expect(info.type).toBe(NodeType.AudioMixer);
        expect(info.uuid.stringify()).toBe("fb651249-d911-4b58-9d76-86ed4f6dfc09");
        expect(info.publicSocket.toString()).toBe("UDP 103.21.175.4:11965");
        expect(info.localSocket.toString()).toBe("UDP 192.168.8.110:59153");
        expect(info.permissions.permissions).toBe(3999);
        expect(info.isReplicated).toBe(false);
        expect(info.sessionLocalID).toBe(5551);
        expect(info.connectionSecretUUID.stringify()).toBe("983e5546-c175-42d2-b838-aa04fa72e915");
    });

});
