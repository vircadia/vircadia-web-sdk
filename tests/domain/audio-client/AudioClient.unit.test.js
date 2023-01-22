//
//  AudioClient.unit.test.js
//
//  Created by David Rowe on 15 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();

import AudioOutput from "../../../src/domain/audio/AudioOutput";
import AudioClient from "../../../src/domain/audio-client/AudioClient";
import AccountManager from "../../../src/domain/networking/AccountManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import ContextManager from "../../../src/domain/shared/ContextManager";

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;


describe("AudioClient - unit tests", () => {

    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

    test("The AudioClient can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, AudioOutput);
        ContextManager.set(contextID, AudioClient, contextID);
        const audioClient = ContextManager.get(contextID, AudioClient);
        expect(audioClient instanceof AudioClient).toBe(true);
    });

    log.mockReset();
});
