//
//  AudioMixer.unit.test.js
//
//  Created by David Rowe on 24 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServer from "../src/DomainServer";
import AudioMixer from "../src/AudioMixer";


describe("AudioMixer - unit tests", () => {

    test("Can create an AudioMixer with a DomainServer", () => {
        const domainServer = new DomainServer();
        const audioMixer = new AudioMixer(domainServer.contextID);
        expect(audioMixer instanceof AudioMixer).toBe(true);

        expect(audioMixer.state).toBe(AudioMixer.UNAVAILABLE);
    });

});
