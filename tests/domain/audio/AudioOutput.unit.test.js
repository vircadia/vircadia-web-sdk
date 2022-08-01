//
//  AudioOutput.unit.test.js
//
//  Created by David Rowe on 26 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();


import AudioOutput from "../../../src/domain/audio/AudioOutput";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("AudioOutput - unit tests", () => {

    test("The AudioOutput can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AudioOutput);
        const audioOutput = ContextManager.get(contextID, AudioOutput);
        expect(audioOutput instanceof AudioOutput).toBe(true);
    });

});
