//
//  Vircadia.integration.test.js
//
//  Created by David Rowe on 11 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();


import { Vircadia, DomainServer, Camera, AudioMixer, AvatarMixer, EntityServer, MessageMixer } from "../src/Vircadia";


describe("Vircadia - integration tests", () => {

    test("Multiple API import", () => {
        expect(Vircadia).toBeDefined();
        expect(DomainServer).toBeDefined();
        expect(Camera).toBeDefined();
        expect(AudioMixer).toBeDefined();
        expect(AvatarMixer).toBeDefined();
        expect(MessageMixer).toBeDefined();
        expect(EntityServer).toBeDefined();
    });

});
