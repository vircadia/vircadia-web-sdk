//
//  Quat.unit.test.js
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Quat from "../../../src/domain/shared/Quat";


describe("Quat - unit tests", () => {

    test("Quat static can be accessed", () => {
        expect(Quat.IDENTITY).toStrictEqual({ x: 0, y: 0, z: 0, w: 1 });
    });

    test("Quat.isValid() checks that values are valid", () => {
        expect(Quat.isValid()).toBe(false);
        expect(Quat.isValid(undefined)).toBe(false);
        expect(Quat.isValid(null)).toBe(false);
        expect(Quat.isValid("")).toBe(false);
        expect(Quat.isValid(1)).toBe(false);
        expect(Quat.isValid({})).toBe(false);
        expect(Quat.isValid({ x: null, y: null, z: null, w: null })).toBe(false);
        expect(Quat.isValid({ x: undefined, y: undefined, z: undefined, w: undefined })).toBe(false);
        expect(Quat.isValid({ x: {}, y: {}, z: {}, w: {} })).toBe(false);
        expect(Quat.isValid({ x: 0, y: 1, z: 2, w: null })).toBe(false);
        expect(Quat.isValid({ x: "0", y: "1", z: "2", w: "3" })).toBe(false);
        expect(Quat.isValid({ x: 0, y: 1, z: 2, w: 3, v: 4 })).toBe(false);
        expect(Quat.isValid({ x: 0, y: 1, z: 2 })).toBe(false);
        expect(Quat.isValid({ x: 0, y: 1, z: 2, w: 3 })).toBe(true);
    });

    test("Quat.equal() tests equality", () => {
        const q1 = { x: 0.1, y: 0, z: 0, w: 0.949 };
        const q2 = { x: 0.1, y: 0, z: 0, w: 0.949 };
        const q3 = { x: 0, y: 0.1, z: 0, w: 0.949 };

        expect(Quat.equal(q1, q1)).toBe(true);
        expect(Quat.equal(q1, q2)).toBe(true);
        expect(Quat.equal(q2, q3)).toBe(false);
    });

});
