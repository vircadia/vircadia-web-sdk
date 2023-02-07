//
//  AudioMixer.unit.test.js
//
//  Created by Julien Merzoug on 08 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import AvatarData from "../../../src/domain/avatars/AvatarData";
import ClientTraitsHandler from "../../../src/domain/avatars/ClientTraitsHandler";
import AccountManager from "../../../src/domain/networking/AccountManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("ClientTraitsHandler - unit tests", () => {
    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AccountManager, contextID);
    ContextManager.set(contextID, AddressManager);
    ContextManager.set(contextID, NodeList, contextID);

    test("Can create a ClientTraitsHandler", () => {
        const avatarData = new AvatarData(contextID);
        const clientTraitHandler = new ClientTraitsHandler(avatarData, contextID);
        expect(clientTraitHandler instanceof ClientTraitsHandler).toBe(true);
    });
});
