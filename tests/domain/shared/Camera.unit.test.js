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
    /* eslint-disable @typescript-eslint/no-unsafe-call */


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

    test("The camera's view is considered to have changed only if it has changed sufficiently", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, Camera);
        const camera = ContextManager.get(contextID, Camera);

        // Position.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.position = { x: 1, y: 0, z: 0 };
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.position = { x: 4.999, y: 0, z: 0 };
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.position = { x: 5.000, y: 0, z: 0 };
        camera.update();
        expect(camera.hasViewChanged).toBe(true);
        camera.position = { x: 6, y: 0, z: 0 };
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.position = Vec3.ZERO;  // Reset to default.
        camera.update();

        // Orientation.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        const QUAT_X_1_DEG = { x: 0.008726535364985466, y: 0, z: 0, w: 0.9999619126319885 };
        camera.orientation = QUAT_X_1_DEG;  // 1 degree around the x-axis.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        const QUAT_X_9_DEG = { x: 0.07845909893512726, y: 0, z: 0, w: 0.9969173073768616 };
        camera.orientation = QUAT_X_9_DEG;  // 9 degrees around the x-axis.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        const QUAT_X_9_9_DEG = { x: 0.08628636598587036, y: 0, z: 0, w: 0.9962703585624695 };
        camera.orientation = QUAT_X_9_9_DEG;  // 10 degrees around the x-axis.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        const QUAT_X_10_1_DEG = { x: 0.0880250558257103, y: 0, z: 0, w: 0.9961182475090027 };
        camera.orientation = QUAT_X_10_1_DEG;  // 10.1 degrees around the x-axis.
        camera.update();
        expect(camera.hasViewChanged).toBe(true);
        const QUAT_X_11_DEG = { x: 0.09584575146436691, y: 0, z: 0, w: 0.9953961968421936 };
        camera.orientation = QUAT_X_11_DEG;  // 11 degrees around the x-axis.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.orientation = Quat.IDENTITY;  // Reset to default.
        camera.update();

        // Field of view.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.fieldOfView = 1.009 * 45.0 * Math.PI / 180.0;  // 0.9%
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.fieldOfView = 1.011 * 45.0 * Math.PI / 180.0;  // 1.1%
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.fieldOfView = 45.0 * Math.PI / 180.0;  // Reset.
        camera.update();

        // Far clip.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.farClip = 1.009 * 16384.0;  // 0.9%
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.farClip = 1.011 * 16384.0;  // 1.1%
        camera.update();
        expect(camera.hasViewChanged).toBe(true);
        camera.farClip = 16384.0;  // Reset.
        camera.update();

        // Radius.
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.centerRadius = 1.009 * 3.0;  // 0.9%
        camera.update();
        expect(camera.hasViewChanged).toBe(false);
        camera.centerRadius = 1.011 * 3.0;  // 0.9%
        camera.update();
        expect(camera.hasViewChanged).toBe(true);
        camera.centerRadius = 3.0;  // Reset.
        camera.update();
    });


    /* eslint-enable @typescript-eslint/no-unsafe-call */
    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
