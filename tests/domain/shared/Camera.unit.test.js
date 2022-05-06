//
//  Camera.unit.test.js
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Quat from "../../../src/domain/shared/Quat";
import Vec3 from "../../../src/domain/shared/Vec3";
import ContextManager from "../../../src/domain/shared/ContextManager";
import Camera from "../../../src/domain/shared/Camera";


describe("Camera - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("The Camera can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, Camera);
        const camera = ContextManager.get(contextID, Camera);
        expect(camera instanceof Camera).toBe(true);
    });

    test("Default property values are as expected", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, Camera);
        const camera = ContextManager.get(contextID, Camera);

        expect(camera.position).toEqual(Vec3.ZERO);
        expect(camera.orientation).toEqual(Quat.IDENTITY);
        expect(camera.fieldOfView).toBe(45.0 * Math.PI / 180.0);
        expect(camera.aspectRatio).toBe(16.0 / 9.0);
        expect(camera.farClip).toBe(16384.0);
        expect(camera.centerRadius).toBe(3.0);

        expect(camera.hasViewChanged).toBe(false);
    });

    test("Can change property values", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, Camera);
        const camera = ContextManager.get(contextID, Camera);

        camera.position = { x: 1, y: 2, z: 3 };
        expect(camera.position).toEqual({ x: 1, y: 2, z: 3 });
        camera.orientation = { x: 0.1, y: 0.2, z: 0.3, w: 0.927 };
        expect(camera.orientation).toEqual({ x: 0.1, y: 0.2, z: 0.3, w: 0.927 });
        camera.fieldOfView = 33.0 * Math.PI / 180.0;
        expect(camera.fieldOfView).toBe(33.0 * Math.PI / 180.0);
        camera.aspectRatio = 1.0;
        expect(camera.aspectRatio).toBe(1.0);
        camera.farClip = 10.0;
        expect(camera.farClip).toBe(10.0);
        camera.centerRadius = 5.0;
        expect(camera.centerRadius).toBe(5.0);
    });

    // $$$$$$$ Test hasViewChanged changing.


    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
