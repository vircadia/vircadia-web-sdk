//
//  DomainConnectionDenied.unit.test.js
//
//  Created by David Rowe on 3 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainConnectionDenied from "../../../../src/domain/networking/packets/DomainConnectionDenied";
import DomainHandler from "../../../../src/domain/networking/DomainHandler";


describe("DomainConnectionDenied - unit tests", () => {

    test("Can read a DomainConnectionDenied packet", () => {
        /* eslint-disable-next-line max-len */
        const MESSAGE_TEXT = "070000001013012f0050726f746f636f6c2076657273696f6e206d69736d61746368202d20446f6d61696e2076657273696f6e3a206465760000";
        const MESSAGE_START = 6;

        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = DomainConnectionDenied.read(dataView);

        expect(info.reasonCode).toBe(DomainHandler.ConnectionRefusedReason.ProtocolMismatch);
        expect(info.reasonMessage).toBe("Protocol version mismatch - Domain version: dev");
        expect(info.extraInfo).toBe("");
    });

});
