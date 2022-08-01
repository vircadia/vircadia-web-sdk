//
//  AvatarMixer.unit.test.js
//
//  Created by David Rowe on 24 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarMixer from "../src/AvatarMixer";
import Camera from "../src/Camera";
import DomainServer from "../src/DomainServer";


describe("AvatarMixer - unit tests", () => {

    test("Can create an AvatarMixer with a DomainServer", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);  // eslint-disable-line @typescript-eslint/no-unused-vars
        const avatarMixer = new AvatarMixer(domainServer.contextID);
        expect(avatarMixer instanceof AvatarMixer).toBe(true);

        expect(avatarMixer.state).toBe(AvatarMixer.UNAVAILABLE);
    });

});
