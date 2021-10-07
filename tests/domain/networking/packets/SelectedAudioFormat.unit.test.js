//
//  SelectedAudioFormat.unit.test.js
//
//  Created by David Rowe on 10 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SelectedAudioFormat from "../../../../src/domain/networking/packets/SelectedAudioFormat";


describe("SelectedAudioFormat - unit tests", () => {

    test("Can read a SelectedAudioFormat packet", () => {
        const MESSAGE_HEX = "030000004116762365a1595902bd988de6429deea29c0816040000006f707573";
        const MESSAGE_START = 24;

        const arrayBuffer = new ArrayBuffer(MESSAGE_HEX.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_HEX.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = SelectedAudioFormat.read(dataView);

        expect(info.selectedCodecName).toBe("opus");
    });

});
