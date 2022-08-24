//
//  MyAvatarInterface.unit.test.js
//
//  Created by David Rowe on 31 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();


import AvatarManager from "../../../src/domain/AvatarManager";
import AvatarListInterface from "../../../src/domain/interfaces/AvatarListInterface";
import ContextManager from "../../../src/domain/shared/ContextManager";
import DomainServer from "../../../src/DomainServer";


describe("AvatarListInterface - unit tests", () => {

    test("Can access the signals", () => {
        const domainServer = new DomainServer();
        const contextID = domainServer.contextID;
        ContextManager.set(contextID, AvatarManager, contextID);
        const avatarListInterface = new AvatarListInterface(contextID);
        expect(typeof avatarListInterface.avatarAdded.connect).toBe("function");
        expect(typeof avatarListInterface.avatarAdded.disconnect).toBe("function");
        expect(typeof avatarListInterface.avatarRemoved.connect).toBe("function");
        expect(typeof avatarListInterface.avatarRemoved.disconnect).toBe("function");
    });

});
