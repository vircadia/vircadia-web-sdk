//
//  Vec3.unit.test.js
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Vec3 from "../../../src/domain/shared/Vec3";


describe("Vec3 - unit tests", () => {

    test("Vec3 static can be accessed", () => {
        expect(Vec3.ZERO).toStrictEqual({ x: 0, y: 0, z: 0 });
    });

    test("Vec3.valid() checks that values are valid", () => {
        expect(Vec3.valid()).toBe(false);
        expect(Vec3.valid(undefined)).toBe(false);
        expect(Vec3.valid(null)).toBe(false);
        expect(Vec3.valid("")).toBe(false);
        expect(Vec3.valid(1)).toBe(false);
        expect(Vec3.valid({})).toBe(false);
        expect(Vec3.valid({ x: null, y: null, z: null })).toBe(false);
        expect(Vec3.valid({ x: undefined, y: undefined, z: undefined })).toBe(false);
        expect(Vec3.valid({ x: {}, y: {}, z: {} })).toBe(false);
        expect(Vec3.valid({ x: 0, y: 1, z: null })).toBe(false);
        expect(Vec3.valid({ x: "0", y: "1", z: "2" })).toBe(false);
        expect(Vec3.valid({ x: 0, y: 1, z: 2, w: 3 })).toBe(false);
        expect(Vec3.valid({ x: 0, y: 1 })).toBe(false);
        expect(Vec3.valid({ x: 0, y: 1, z: 2 })).toBe(true);
    });

    test("Vec3.equal() tests equality", () => {
        const v1 = { x: 1, y: 2, z: 3 };
        const v2 = { x: 1, y: 2, z: 3 };
        const v3 = { x: 10, y: 2, z: 3 };

        expect(Vec3.equal(v1, v1)).toBe(true);
        expect(Vec3.equal(v1, v2)).toBe(true);
        expect(Vec3.equal(v2, v3)).toBe(false);
    });

});
