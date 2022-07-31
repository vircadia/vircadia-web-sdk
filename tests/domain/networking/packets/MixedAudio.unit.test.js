//
//  MixedAudio.unit.test.js
//
//  Created by David Rowe on 14 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import MixedAudio from "../../../../src/domain/networking/packets/MixedAudio";


describe("MixedAudio - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read a MixedAudio packet", () => {
        // eslint-disable-next-line max-len
        const MESSAGE_TEXT = "4c02000008184bd416e23467a9c1681d77d7529c606c16fd3202040000006f707573d478b652dce3a3c3fe0c05cc6334521330e044a29856fe649b4f1e3b422b7c85a8dbab2857656ff441f1668a18aa54d083a84e92d7d806a048e5a03ced1e9bd316ed920d9c07d02fadda6a07a6cabf6a66fb10f09736ce15c5dcd7093a2d887c9d2f3bc72c611ed66245c00a7e6cce0624a7a7465ccf8f8c076ab6ceaac71579da23d10ce16b8c8e8b087987224d934f5b717a5a3f94fa8b5134f86f32c85c52f20e6484dbed7e63cafc38d46ada337f";
        const MESSAGE_START = 24;
        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = MixedAudio.read(dataView);
        expect(info.sequenceNumber).toBeGreaterThanOrEqual(0);
        expect(info.codecName).toBe("opus");
        expect(info.numAudioSamples).toBe(240);
        expect(info.audioBuffer.byteLength).toBeGreaterThan(0);
    });

});
