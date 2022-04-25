//
//  AvatarData.unit.test.js
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();


import AvatarData from "../../../src/domain/avatars/AvatarData";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import ContextManager from "../../../src/domain/shared/ContextManager";
import { Uuid } from "../../../src/Vircadia";


describe("AvatarData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);
    ContextManager.set(contextID, NodeList, contextID);


    test("Can set and get the session UUID", () => {
        const avatarData = new AvatarData(contextID);
        expect(avatarData.getSessionUUID().value()).toBe(Uuid.NULL);
        const uuid = new Uuid(1234n);
        avatarData.setSessionUUID(uuid);
        expect(avatarData.getSessionUUID().value()).toBe(uuid.value());
        avatarData.setSessionUUID(new Uuid(Uuid.NULL));
        expect(avatarData.getSessionUUID().value()).toBe(Uuid.AVATAR_SELF_ID);
    });

    test("Can flag the avatar identity data as having changed", () => {
        const avatarData = new AvatarData(contextID);
        expect(avatarData.getIdentityDataChanged()).toBe(false);
        avatarData.markIdentityDataChanged();
        expect(avatarData.getIdentityDataChanged()).toBe(true);
    });
});
