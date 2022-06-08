//
//  GLMHelpers.unit.test.js
//
//  Created by David Rowe on 7 Dec 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import GLMHelpers from "../../../src/domain/shared/GLMHelpers";
import { buffer2hex } from "../../testUtils";


describe("GLMHelpers - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read a quaternion from 6 bytes of packet data", () => {

        // 30 deg yaw.
        let bufferHex = "0000bfffa8923fff00000000";
        let bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        let data = new DataView(bufferArray.buffer);
        let quat = { x: 0, y: 0, z: 0, w: 0 };
        let numBytes = GLMHelpers.unpackOrientationQuatFromSixBytes(data, 2, quat);
        expect(numBytes).toBe(6);
        // Unpacked quat happens to come out negative of that originally packed but this represents that same rotation.
        expect(quat.x).toBeCloseTo(0, 4);
        expect(quat.y).toBeCloseTo(-0.258819, 4);
        expect(quat.z).toBeCloseTo(0, 4);
        expect(quat.w).toBeCloseTo(-0.965926, 4);

        // 10, 20, -30 deg pitch, yaw, roll.
        bufferHex = "0000b471b2e2584d00000000";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        quat = { x: 0, y: 0, z: 0, w: 0 };
        numBytes = GLMHelpers.unpackOrientationQuatFromSixBytes(data, 2, quat);
        expect(numBytes).toBe(6);
        // Unpacked quat happens to come out negative of that originally packed but this represents that same rotation.
        expect(quat.x).toBeCloseTo(-0.127679, 4);
        expect(quat.y).toBeCloseTo(-0.144878, 4);
        expect(quat.z).toBeCloseTo(0.268536, 4);
        expect(quat.w).toBeCloseTo(-0.943714, 4);

        // -100 deg yaw.
        bufferHex = "0000c511460a79f400000000";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        quat = { x: 0, y: 0, z: 0, w: 0 };
        numBytes = GLMHelpers.unpackOrientationQuatFromSixBytes(data, 2, quat);
        expect(numBytes).toBe(6);
        // Unpacked quat happens to come out negative of that originally packed but this represents that same rotation.
        expect(quat.x).toBeCloseTo(0.0560226, 4);
        expect(quat.y).toBeCloseTo(-0.763129, 4);
        expect(quat.z).toBeCloseTo(0.0667652, 4);
        expect(quat.w).toBeCloseTo(0.640342, 4);
    });

    test("Can write a quaternion into 6 bytes of packet data", () => {
        const buffer = new ArrayBuffer(12);
        const data = new DataView(buffer);

        // 30 deg yaw.
        let quat = { x: 0, y: 0.258819, z: 0, w: 0.965926 };
        let numBytes = GLMHelpers.packOrientationQuatToSixBytes(data, 2, quat);
        expect(numBytes).toBe(6);
        let bytes = buffer2hex(buffer);
        expect(bytes).toBe("0000bfffa8923fff00000000");

        // 10, 20, -30 deg pitch, yaw, roll.
        quat = { x: 0.127679, y: 0.144878, z: -0.268536, w: 0.943714 };
        numBytes = GLMHelpers.packOrientationQuatToSixBytes(data, 2, quat);
        expect(numBytes).toBe(6);
        bytes = buffer2hex(buffer);
        expect(bytes).toBe("0000b471b2e2584d00000000");

        // -100 deg yaw.
        quat = { x: 0.0560226, y: -0.763129, z: 0.0667652, w: 0.640342 };
        numBytes = GLMHelpers.packOrientationQuatToSixBytes(data, 2, quat);
        expect(numBytes).toBe(6);
        bytes = buffer2hex(buffer);
        expect(bytes).toBe("0000c511460a79f400000000");
    });

    test("Can write an angle into 2 bytes of packet data", () => {
        const buffer = new ArrayBuffer(4);
        const data = new DataView(buffer);

        let angle = 45.2;
        let numBytes = GLMHelpers.packFloatAngleToTwoByte(data, 2, angle);
        expect(numBytes).toBe(2);
        let bytes = buffer2hex(buffer);
        expect(bytes).toBe("000023a0");

        angle = -53.5;
        numBytes = GLMHelpers.packFloatAngleToTwoByte(data, 2, angle);
        expect(numBytes).toBe(2);
        bytes = buffer2hex(buffer);
        expect(bytes).toBe("0000f459");
    });

    test("Can write a clipping distance value into 2 bytes of packet data", () => {
        const buffer = new ArrayBuffer(4);
        const data = new DataView(buffer);

        // ClipValue under ClipLimit.SMALL_LIMIT
        let clipValue = 8;
        let numBytes = GLMHelpers.packClipValueToTwoByte(data, 2, clipValue);
        expect(numBytes).toBe(2);
        let bytes = buffer2hex(buffer);
        expect(bytes).toBe("00006566");

        // ClipValue greater than ClipLimit.SMALL_LIMIT
        clipValue = 14;
        numBytes = GLMHelpers.packClipValueToTwoByte(data, 2, clipValue);
        expect(numBytes).toBe(2);
        bytes = buffer2hex(buffer);
        expect(bytes).toBe("0000f2ff");
    });

    test("Can write a ratio value into 2 bytes of packet data", () => {
        const buffer = new ArrayBuffer(4);
        const data = new DataView(buffer);

        // Ratio < 10.
        let ratio = 0.33;
        GLMHelpers.packFloatRatioToTwoByte(data, 1, ratio);
        let bytes = buffer2hex(buffer);
        expect(bytes).toBe("00390400");

        // Ratio > 10.
        ratio = 33.0;
        GLMHelpers.packFloatRatioToTwoByte(data, 1, ratio);
        bytes = buffer2hex(buffer);
        expect(bytes).toBe("000efd00");
    });

    test("Can read a ratio value from 2 bytes of packet data", () => {
        let bufferHex = "00390400";
        let bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        let data = new DataView(bufferArray.buffer);
        let ratio = GLMHelpers.unpackFloatRatioFromTwoByte(data, 1);
        expect(ratio).toBeCloseTo(0.33, 3);

        bufferHex = "000efd00";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        ratio = GLMHelpers.unpackFloatRatioFromTwoByte(data, 1);
        expect(ratio).toBeCloseTo(33.0, 1);
    });

    test("Can write a fixed-point number into 2 bytes of packet data", () => {
        const buffer = new ArrayBuffer(4);
        const data = new DataView(buffer);
        const fixedPoint = 0.176026133;
        GLMHelpers.packFloatScalarToSignedTwoByteFixed(data, 1, fixedPoint, 14);
        const bytes = buffer2hex(buffer);
        expect(bytes).toBe("00440b00");
    });

    test("Can read a fixed-point number from 2 bytes of packet data", () => {
        const bufferHex = "00440b00";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);
        const fixedPoint = GLMHelpers.unpackFloatScalarFromSignedTwoByteFixed(data, 1, 14);
        expect(fixedPoint).toBeCloseTo(0.1760, 4);
    });

    test("Can write a fixed-point vector into 6 bytes of packet data", () => {
        const buffer = new ArrayBuffer(8);
        const data = new DataView(buffer);
        const vector = { x: 0.00263624, y: 1.78368, z: 0.264038 };
        GLMHelpers.packFloatVec3ToSignedTwoByteFixed(data, 1, vector, 14);
        const bytes = buffer2hex(buffer);
        expect(bytes).toBe("002b002772e51000");
    });

    test("Can read a fixed-point vector from 6 bytes of packet data", () => {
        const bufferHex = "002b002772e51000";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);
        const vector = GLMHelpers.unpackFloatVec3FromSignedTwoByteFixed(data, 1, 14);
        expect(vector.x).toBeCloseTo(0.0026, 4);
        expect(vector.y).toBeCloseTo(1.7836, 4);
        expect(vector.z).toBeCloseTo(0.2640, 4);
    });

    test("Can test that two values are close enough", () => {
        expect(GLMHelpers.closeEnough(0, 0, 0)).toBe(true);
        expect(GLMHelpers.closeEnough(0, 0, 0.001)).toBe(true);
        expect(GLMHelpers.closeEnough(1, 1, 0)).toBe(true);
        expect(GLMHelpers.closeEnough(1, 1, 1)).toBe(true);
        expect(GLMHelpers.closeEnough(10, 20, 0.5)).toBe(false);
        expect(GLMHelpers.closeEnough(10, 20, 0.667)).toBe(true);
        expect(GLMHelpers.closeEnough(10, 20, 1.0)).toBe(true);
        expect(GLMHelpers.closeEnough(10, 20, 2.0)).toBe(true);
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */

});
