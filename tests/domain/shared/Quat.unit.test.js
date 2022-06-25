//
//  Quat.unit.test.js
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Quat from "../../../src/domain/shared/Quat";


describe("Quat - unit tests", () => {

    test("Quat static can be accessed", () => {
        expect(Quat.IDENTITY).toStrictEqual({ x: 0, y: 0, z: 0, w: 1 });
    });

    test("Quat.valid() checks that values are valid", () => {
        expect(Quat.valid()).toBe(false);
        expect(Quat.valid(undefined)).toBe(false);
        expect(Quat.valid(null)).toBe(false);
        expect(Quat.valid("")).toBe(false);
        expect(Quat.valid(1)).toBe(false);
        expect(Quat.valid({})).toBe(false);
        expect(Quat.valid({ x: null, y: null, z: null, w: null })).toBe(false);
        expect(Quat.valid({ x: undefined, y: undefined, z: undefined, w: undefined })).toBe(false);
        expect(Quat.valid({ x: {}, y: {}, z: {}, w: {} })).toBe(false);
        expect(Quat.valid({ x: 0, y: 1, z: 2, w: null })).toBe(false);
        expect(Quat.valid({ x: "0", y: "1", z: "2", w: "3" })).toBe(false);
        expect(Quat.valid({ x: 0, y: 1, z: 2, w: 3, v: 4 })).toBe(false);
        expect(Quat.valid({ x: 0, y: 1, z: 2 })).toBe(false);
        expect(Quat.valid({ x: 0, y: 1, z: 2, w: 3 })).toBe(true);
    });

    test("Quat.equal() tests equality", () => {
        const q1 = { x: 0.1, y: 0, z: 0, w: 0.949 };
        const q2 = { x: 0.1, y: 0, z: 0, w: 0.949 };
        const q3 = { x: 0, y: 0.1, z: 0, w: 0.949 };

        expect(Quat.equal(q1, q1)).toBe(true);
        expect(Quat.equal(q1, q2)).toBe(true);
        expect(Quat.equal(q2, q3)).toBe(false);
    });

    test("Quat.dot() returns the dot product", () => {
        const q1 = { x: 0.1, y: 0.2, z: 0.3, w: 0.4 };
        const q2 = { x: 0.11, y: 0.22, z: 0.33, w: 0.44 };
        expect(Quat.dot(q1, q2)).toBeCloseTo(0.33, 6);  // eslint-disable-line @typescript-eslint/no-magic-numbers
    });

});
