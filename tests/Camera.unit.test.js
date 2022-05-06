//
//  Camera.unit.test.js
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Quat from "../src/domain/shared/Quat";
import Vec3 from "../src/domain/shared/Vec3";
import DomainServer from "../src/DomainServer";
import Camera from "../src/Camera";


describe("Camera - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can create a Camera with a DomainServer", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);
        expect(camera instanceof Camera).toBe(true);
    });

    test("Default property values are as expected", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);

        expect(camera.position).toEqual(Vec3.ZERO);
        expect(camera.orientation).toEqual(Quat.IDENTITY);
        expect(camera.fieldOfView).toBe(45.0 * Math.PI / 180.0);
        expect(camera.aspectRatio).toBe(16.0 / 9.0);
        expect(camera.farClip).toBe(16384.0);
        expect(camera.centerRadius).toBe(3.0);
    });

    test("Can change property values", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);

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

    test("Trying to set properties to invalid values logs errors", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);

        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });

        camera.position = { x: 4, y: 5, z: 6 };
        camera.position = { x: 2 };
        expect(error).toHaveBeenCalledTimes(1);
        expect(camera.position).toEqual({ x: 4, y: 5, z: 6 });

        camera.orientation = { x: 0.1, y: 0.2, z: 0.3, w: 0.927 };
        camera.orientation = { x: 0.1, y: 0.2, z: 0.4 };
        expect(error).toHaveBeenCalledTimes(2);
        expect(camera.orientation).toEqual({ x: 0.1, y: 0.2, z: 0.3, w: 0.927 });

        camera.fieldOfView = 33.0 * Math.PI / 180.0;
        camera.fieldOfView = "33";
        camera.fieldOfView = -1;
        camera.fieldOfView = 181;
        expect(error).toHaveBeenCalledTimes(5);
        expect(camera.fieldOfView).toBe(33.0 * Math.PI / 180.0);

        camera.aspectRatio = 1.0;
        camera.aspectRatio = "1.0";
        camera.aspectRatio = 0.0;
        camera.aspectRatio = 1000.0;
        expect(error).toHaveBeenCalledTimes(8);
        expect(camera.aspectRatio).toBe(1.0);

        camera.farClip = 10.0;
        camera.farClip = "10.0";
        camera.farClip = -1;
        expect(error).toHaveBeenCalledTimes(10);
        expect(camera.farClip).toBe(10.0);

        camera.centerRadius = 5.0;
        camera.centerRadius = "5.0";
        camera.centerRadius = -1;
        expect(error).toHaveBeenCalledTimes(12);
        expect(camera.centerRadius).toBe(5.0);

        error.mockReset();
    });

    test("Can call update method", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);
        camera.update();
        expect(true).toBe(true);
    });


    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
