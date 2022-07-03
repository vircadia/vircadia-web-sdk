//
//  DomainServerPathResponse.unit.test.js
//
//  Created by David Rowe on 3 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServerPathResponse from "../../../../src/domain/networking/packets/DomainServerPathResponse";


describe("DomainServerPathResponse - unit tests", () => {

    test("Can read a viewpoint with position only", () => {
        const MESSAGE_TEXT = "01002f09002f302e352c312c3130";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = DomainServerPathResponse.read(dataView);

        expect(info.pathQuery).toBe("/");
        expect(info.viewpoint).toBe("/0.5,1,10");
    });

    test("Can read a viewpoint with position and orientation", () => {
        // eslint-disable-next-line max-len
        const MESSAGE_TEXT = "0a002f736f6d65776865726530002f392e39363039352c2d302e303339353837312c362e303538312f302c302e3436313135382c302c302e383837333138";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = DomainServerPathResponse.read(dataView);

        expect(info.pathQuery).toBe("/somewhere");
        expect(info.viewpoint).toBe("/9.96095,-0.0395871,6.0581/0,0.461158,0,0.887318");
    });


});
