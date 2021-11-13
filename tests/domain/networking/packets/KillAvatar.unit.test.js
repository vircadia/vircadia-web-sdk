//
//  KillAvatar.unit.test.js
//
//  Created by David Rowe on 3 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import KillAvatar from "../../../../src/domain/networking/packets/KillAvatar";


describe("KillAvatar - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can read a KillAvatar packet", () => {
        /* eslint-disable-next-line max-len */

        const RECEIVED_MESSAGE = "000000400536000000000000000000000000000000000000ed7acf04adea40c5b32bf50a5f1eae3101";
        const MESSAGE_START = 24;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = KillAvatar.read(dataView);

        expect(info.sessionUUID.stringify()).toBe("ed7acf04-adea-40c5-b32b-f50a5f1eae31");
        expect(info.reason).toBe(1);
    });

});
