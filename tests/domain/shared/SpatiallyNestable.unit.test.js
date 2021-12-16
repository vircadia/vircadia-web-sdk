//
//  SpatiallyNestable.unit.test.js
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();


import SpatiallyNestable, { NestableType } from "../../../src/domain/shared/SpatiallyNestable";
import { Uuid } from "../../../src/Vircadia";


describe("SpatiallyNestable - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can create SpatiallyNestable objects of entity and avatar types", () => {
        const entityUuid = new Uuid(1234n);
        const nestableEntity = new SpatiallyNestable(NestableType.Entity, entityUuid);
        expect(nestableEntity instanceof SpatiallyNestable).toBe(true);
        expect(nestableEntity.getNestableType()).toBe(NestableType.Entity);
        expect(nestableEntity.getID().value()).toBe(entityUuid.value());

        const avatarUuid = new Uuid(5678n);
        const nestableAvatar = new SpatiallyNestable(NestableType.Avatar, avatarUuid);
        expect(nestableAvatar instanceof SpatiallyNestable).toBe(true);
        expect(nestableAvatar.getNestableType()).toBe(NestableType.Avatar);
        expect(nestableAvatar.getID().value()).toBe(avatarUuid.value());
    });

    test("Can set and get the UUID of a SpatiallyNestable object", () => {
        const initialUUID = new Uuid(1234n);
        const spatiallyNestable = new SpatiallyNestable(NestableType.Avatar, initialUUID);
        expect(spatiallyNestable.getID().value()).toBe(initialUUID.value());
        const newUUID = new Uuid(5678n);
        spatiallyNestable.setID(newUUID);
        expect(spatiallyNestable.getID().value()).toBe(newUUID.value());
    });

    test("Can get and set world position", (done) => {
        const initialUUID = new Uuid(1234n);
        const spatiallyNestable = new SpatiallyNestable(NestableType.Avatar, initialUUID);
        expect(spatiallyNestable.getWorldPosition()).toEqual({ x: 0, y: 0, z: 0 });
        const before = Date.now();
        expect(spatiallyNestable.translationChangedSince(before)).toBe(false);
        setTimeout(() => {
            spatiallyNestable.setWorldPosition({ x: 1, y: 2, z: 3 });
            expect(spatiallyNestable.getWorldPosition()).toEqual({ x: 1, y: 2, z: 3 });
            expect(spatiallyNestable.translationChangedSince(before)).toBe(true);
            expect(spatiallyNestable.translationChangedSince(Date.now())).toBe(false);
            done();
        }, 20);
    });

    test("Can get and set world orientation", (done) => {
        const initialUUID = new Uuid(1234n);
        const spatiallyNestable = new SpatiallyNestable(NestableType.Avatar, initialUUID);
        expect(spatiallyNestable.getWorldOrientation()).toEqual({ x: 0, y: 0, z: 0, w: 1 });
        expect(spatiallyNestable.getLocalOrientation()).toEqual({ x: 0, y: 0, z: 0, w: 1 });
        const before = Date.now();
        expect(spatiallyNestable.rotationChangedSince(before)).toBe(false);
        setTimeout(() => {
            spatiallyNestable.setWorldOrientation({ x: 0, y: 0.5, z: 0, w: 0.5 });
            expect(spatiallyNestable.getWorldOrientation()).toEqual({ x: 0, y: 0.5, z: 0, w: 0.5 });
            expect(spatiallyNestable.getLocalOrientation()).toEqual({ x: 0, y: 0.5, z: 0, w: 0.5 });
            expect(spatiallyNestable.rotationChangedSince(before)).toBe(true);
            expect(spatiallyNestable.rotationChangedSince(Date.now())).toBe(false);
            done();
        }, 20);
    });

});
