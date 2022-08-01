//
//  Vec3.unit.test.js
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Vec3 from "../../../src/domain/shared/Vec3";


describe("Vec3 - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


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
        expect(Vec3.valid({ x: 0, y: 1, z: NaN })).toBe(false);
    });

    test("Vec3.length() calculates the length of a vector", () => {
        expect(Vec3.length({ x: 0, y: 0, z: 0 })).toBe(0);
        expect(Vec3.length({ x: 1, y: 0, z: 0 })).toBe(1);
        expect(Vec3.length({ x: 0, y: 1, z: 0 })).toBe(1);
        expect(Vec3.length({ x: 0, y: 0, z: 1 })).toBe(1);
        expect(Vec3.length({ x: -1, y: 0, z: 0 })).toBe(1);
        expect(Vec3.length({ x: 0, y: -1, z: 0 })).toBe(1);
        expect(Vec3.length({ x: 0, y: 0, z: -1 })).toBe(1);
        expect(Vec3.length({ x: 3, y: 4, z: 0 })).toBe(5);
        expect(Vec3.length({ x: 0, y: 3, z: -4 })).toBe(5);
        expect(Vec3.length({ x: -4, y: 0, z: -3 })).toBe(5);
    });

    test("Vec3.copy() copies a vector", () => {
        const v1 = { x: 1, y: 2, z: 3 };
        const v2 = Vec3.copy(v1);
        expect(v2 === v1).toBe(false);
        expect(v2).not.toBe(v1);
        expect(v2).toEqual(v1);

    });

    test("Vec3.multiply() scales a vector", () => {
        expect(Vec3.multiply(0, { x: 1, y: 2, z: 3 })).toEqual({ x: 0, y: 0, z: 0 });
        expect(Vec3.multiply(1, { x: 1, y: 2, z: 3 })).toEqual({ x: 1, y: 2, z: 3 });
        expect(Vec3.multiply(-1, { x: 1, y: 2, z: 3 })).toEqual({ x: -1, y: -2, z: -3 });
        expect(Vec3.multiply(-2, { x: 1, y: 2, z: 3 })).toEqual({ x: -2, y: -4, z: -6 });
    });

    test("Vec3.equal() tests equality", () => {
        const v1 = { x: 1, y: 2, z: 3 };
        const v2 = { x: 1, y: 2, z: 3 };
        const v3 = { x: 10, y: 2, z: 3 };

        expect(Vec3.equal(v1, v1)).toBe(true);
        expect(Vec3.equal(v1, v2)).toBe(true);
        expect(Vec3.equal(v2, v3)).toBe(false);
    });

    test("Vec3.sum() adds two vectors", () => {
        expect(Vec3.sum({ x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 3 })).toEqual({ x: 1, y: 2, z: 3 });
        expect(Vec3.sum({ x: -1, y: -2, z: -3 }, { x: 1, y: 2, z: 3 })).toEqual({ x: 0, y: 0, z: 0 });
        expect(Vec3.sum({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toEqual({ x: 2, y: 4, z: 6 });

    });

    test("Vec3.distance() calculates the distance between two points", () => {
        expect(Vec3.distance({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(0);
        expect(Vec3.distance({ x: 1, y: 2, z: 3 }, { x: 2, y: 2, z: 3 })).toBe(1);
        expect(Vec3.distance({ x: 1, y: 2, z: 3 }, { x: 1, y: 4, z: 3 })).toBe(2);
        expect(Vec3.distance({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 6 })).toBe(3);

        expect(Vec3.distance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5);
        expect(Vec3.distance({ x: 0, y: 0, z: 0 }, { x: 0, y: 3, z: 4 })).toBe(5);
        expect(Vec3.distance({ x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 3 })).toBe(5);
    });

    test("Vec3.distance2() calculates the square of the distance between two points", () => {
        expect(Vec3.distance2({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(0);

        expect(Vec3.distance2({ x: 1, y: 2, z: 3 }, { x: 2, y: 2, z: 3 })).toBe(1);
        expect(Vec3.distance2({ x: 1, y: 2, z: 3 }, { x: 1, y: 4, z: 3 })).toBe(4);
        expect(Vec3.distance2({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 6 })).toBe(9);

        expect(Vec3.distance2({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(25);
        expect(Vec3.distance2({ x: 0, y: 0, z: 0 }, { x: 0, y: 3, z: 4 })).toBe(25);
        expect(Vec3.distance2({ x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 3 })).toBe(25);
    });

    test("Vec3.angleBetween() calculates the angle between two vectors", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });
        expect(Vec3.angleBetween({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })).toBe(0);
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockReset();

        expect(Vec3.angleBetween({ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 })).toBe(0);
        expect(Vec3.angleBetween({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 0 })).toBe(0);
        expect(Vec3.angleBetween({ x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 1 })).toBe(0);
        expect(Vec3.angleBetween({ x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 })).toBe(0);

        expect(Vec3.angleBetween({ x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 })).toBe(Math.PI);
        expect(Vec3.angleBetween({ x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 })).toBe(Math.PI);
        expect(Vec3.angleBetween({ x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 })).toBe(Math.PI);

        expect(Vec3.angleBetween({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toBe(Math.PI / 2.0);
        expect(Vec3.angleBetween({ x: 1, y: 0, z: 0 }, { x: 0, y: -1, z: 0 })).toBe(Math.PI / 2.0);
        expect(Vec3.angleBetween({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 })).toBe(Math.PI / 2.0);
        expect(Vec3.angleBetween({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: -1 })).toBe(Math.PI / 2.0);
        expect(Vec3.angleBetween({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 })).toBe(Math.PI / 2.0);
        expect(Vec3.angleBetween({ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 })).toBe(Math.PI / 2.0);

        expect(Vec3.angleBetween({ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 })).toBeCloseTo(Math.PI / 4.0, 9);
        expect(Vec3.angleBetween({ x: 1, y: 0, z: 0 }, { x: 1, y: -1, z: 0 })).toBeCloseTo(Math.PI / 4.0, 9);
        expect(Vec3.angleBetween({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 })).toBeCloseTo(Math.PI / 4.0, 9);
        expect(Vec3.angleBetween({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: -1 })).toBeCloseTo(Math.PI / 4.0, 9);
        expect(Vec3.angleBetween({ x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 })).toBeCloseTo(Math.PI / 4.0, 9);
        expect(Vec3.angleBetween({ x: 0, y: 0, z: 1 }, { x: -1, y: 0, z: 1 })).toBeCloseTo(Math.PI / 4.0, 9);

    });

    test("Vec3.dot() calculates the dot product of two vectors", () => {
        expect(Vec3.dot({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })).toBe(0);
        expect(Vec3.dot({ x: 1, y: -1, z: 0 }, { x: 2, y: 2, z: 2 })).toBe(0);
        expect(Vec3.dot({ x: 0, y: 1, z: -1 }, { x: 2, y: 2, z: 2 })).toBe(0);
        expect(Vec3.dot({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(14);
        expect(Vec3.dot({ x: 1, y: 2, z: 3 }, { x: -1, y: -2, z: -3 })).toBe(-14);
    });

    test("Vec3.cross() calculates the cross product of two vectors", () => {
        expect(Vec3.cross({ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 })).toEqual({ x: 0, y: 0, z: 0 });
        expect(Vec3.cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toEqual({ x: 0, y: 0, z: 1 });
        expect(Vec3.cross({ x: 1, y: 0, z: 0 }, { x: 0, y: -2, z: 0 })).toEqual({ x: 0, y: 0, z: -2 });

        expect(Vec3.cross({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 0 })).toEqual({ x: 0, y: 0, z: 0 });
        expect(Vec3.cross({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 2 })).toEqual({ x: 2, y: 0, z: 0 });
        expect(Vec3.cross({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: -1 })).toEqual({ x: -1, y: 0, z: 0 });

        expect(Vec3.cross({ x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 1 })).toEqual({ x: 0, y: 0, z: 0 });
        expect(Vec3.cross({ x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 0 })).toEqual({ x: 0, y: 1, z: 0 });
        expect(Vec3.cross({ x: 0, y: 0, z: 1 }, { x: -2, y: 0, z: 0 })).toEqual({ x: 0, y: -2, z: 0 });
    });

    test("Vec3.multiplyQbyV() rotates a vector", () => {
        expect(Vec3.distance(Vec3.multiplyQbyV({ x: 0, y: 0.7071067690849304, z: 0, w: 0.7071067690849304 },
            { x: 1, y: 0, z: 0 }), { x: 0, y: 0, z: -1 })).toBeLessThan(0.000001);
        expect(Vec3.distance(Vec3.multiplyQbyV({ x: 0, y: -0.7071067690849304, z: 0, w: 0.7071067690849304 },
            { x: 1, y: 0, z: 0 }), { x: 0, y: 0, z: 1 })).toBeLessThan(0.000001);

        expect(Vec3.distance(Vec3.multiplyQbyV({ x: 0, y: 0, z: 0.7071067690849304, w: 0.7071067690849304 },
            { x: 0, y: 1, z: 0 }), { x: -1, y: 0, z: 0 })).toBeLessThan(0.000001);
        expect(Vec3.distance(Vec3.multiplyQbyV({ x: 0, y: 0, z: -0.7071067690849304, w: 0.7071067690849304 },
            { x: 0, y: 1, z: 0 }), { x: 1, y: 0, z: 0 })).toBeLessThan(0.000001);

        expect(Vec3.distance(Vec3.multiplyQbyV({ x: 0.7071067690849304, y: 0, z: 0, w: 0.7071067690849304 },
            { x: 0, y: 0, z: 1 }), { x: 0, y: -1, z: 0 })).toBeLessThan(0.000001);
        expect(Vec3.distance(Vec3.multiplyQbyV({ x: -0.7071067690849304, y: 0, z: 0, w: 0.7071067690849304 },
            { x: 0, y: 0, z: 1 }), { x: 0, y: 1, z: 0 })).toBeLessThan(0.000001);
    });


    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
