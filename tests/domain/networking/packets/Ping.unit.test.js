//
//  Ping.unit.test.js
//
//  Created by David Rowe on 6 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Ping from "../../../../src/domain/networking/packets/Ping";


describe("Ping - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can read a Ping packet", () => {
        /* eslint-disable-next-line max-len */
        const MESSAGE_TEXT = "00000000031200000000000000000000000000000000000002769cc3694acb05000500000000000000";
        const MESSAGE_START = 24;

        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = Ping.read(dataView);

        expect(info.pingType).toBe(2);
        expect(info.timestamp).toBe(1630895345998966n);
        expect(info.connectionID).toBe(5n);
    });

});
