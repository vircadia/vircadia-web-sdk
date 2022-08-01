//
//  Vircadia.unit.test.js
//
//  Created by David Rowe on 11 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();


import Vircadia from "../src/Vircadia";


describe("Vircadia - unit tests", () => {

    test("Version number", () => {
        expect(typeof Vircadia.version).toBe("string");
        expect(Vircadia.version.length).toBeGreaterThan(0);
        const version = Vircadia.version;
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Vircadia.version = "0.0.0";  // Shouldn't succeed.
        } catch (e) {
            //
        }
        expect(Vircadia.version).toBe(version);
    });

});
