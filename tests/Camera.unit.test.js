//
//  Camera.unit.test.js
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServer from "../src/DomainServer";
import Camera from "../src/Camera";


describe("Camera - unit tests", () => {

    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });


    test("Can create a Camera with a DomainServer", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);
        expect(camera instanceof Camera).toBe(true);
    });


    log.mockReset();
});
