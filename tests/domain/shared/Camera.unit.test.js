//
//  Camera.unit.test.js
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ContextManager from "../../../src/domain/shared/ContextManager";
import Camera from "../../../src/domain/shared/Camera";


describe("Camera - unit tests", () => {

    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });


    test("The Camera can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, Camera);
        const camera = ContextManager.get(contextID, Camera);
        expect(camera instanceof Camera).toBe(true);
    });

    test("Default Camera property values", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, Camera);
        const camera = ContextManager.get(contextID, Camera);

        expect(camera.hasViewChanged).toBe(false);
    });


    log.mockReset();
});
