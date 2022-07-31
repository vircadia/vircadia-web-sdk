//
//  DomainServerRemovedNode.unit.test.js
//
//  Created by David Rowe on 20 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServerRemovedNode from "../../../../src/domain/networking/packets/DomainServerRemovedNode";


describe("DomainServerRemovedNode - unit tests", () => {

    test("Can read a DomainServerRemovedNode packet", () => {
        /* eslint-disable-next-line max-len */
        const MESSAGE_TEXT = "4a619e443816bcd3d2ad043a4338bca43d664b9e57f0";
        const MESSAGE_START = 6;

        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = DomainServerRemovedNode.read(dataView);

        expect(info.nodeUUID.stringify()).toBe("bcd3d2ad-043a-4338-bca4-3d664b9e57f0");
    });

});
