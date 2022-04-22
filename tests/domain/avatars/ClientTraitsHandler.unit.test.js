//
//  AudioMixer.unit.test.js
//
//  Created by Julien Merzoug on 08 Apr 2022.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarData from "../../../src/domain/avatars/AvatarData";
import ClientTraitsHandler from "../../../src/domain/avatars/ClientTraitsHandler";
import ContextManager from "../../../src/domain/shared/ContextManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";

describe("ClientTraitsHandler - unit tests", () => {
    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);
    ContextManager.set(contextID, NodeList, contextID);

    test("Can create a ClientTraitsHandler", () => {
        const avatarData = new AvatarData(contextID);
        const clientTraitHandler = new ClientTraitsHandler(avatarData);
        expect(clientTraitHandler instanceof ClientTraitsHandler).toBe(true);
    });
});
