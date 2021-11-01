//
//  Avatar.unit.test.js
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import Avatar from "../../../src/domain/avatar-renderer/Avatar";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("Avatar - unit tests", () => {

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);
    ContextManager.set(contextID, NodeList, contextID);

    test("Can mark the avatar as being initialized", () => {
        const avatar = new Avatar(contextID);
        expect(avatar.isInitialized()).toBe(false);
        avatar.init();
        expect(avatar.isInitialized()).toBe(true);
        expect(true).toBe(true);
    });

});
