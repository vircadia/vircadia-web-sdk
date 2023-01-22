//
//  DomainServerConnectionToken.unit.test.js
//
//  Created by David Rowe on 13 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServerConnectionToken from "../../../../src/domain/networking/packets/DomainServerConnectionToken";


describe("DomainServerConnectionToken - unit tests", () => {

    test("Can read a DomainServerConnectionToken packet", () => {
        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const MESSAGE_TEXT = "3ca423fd0f7a4d0582979d73d007773f";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = DomainServerConnectionToken.read(dataView);
        expect(info.connectionToken.stringify()).toBe("3ca423fd-0f7a-4d05-8297-9d73d007773f");
    });

});
