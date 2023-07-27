//
//  OctreePacketData.unit.test.js
//
//  Created by David Rowe on 17 Jul 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags, { EntityPropertyList } from "../../../src/domain/entities/EntityPropertyFlags";
import UDT from "../../../src/domain/networking/udt/UDT";
import { AppendState } from "../../../src/domain/octree/OctreeElement";
import OctreePacketData from "../../../src/domain/octree/OctreePacketData";
import Uuid from "../../../src/domain/shared/Uuid";

import "../../../src/domain/shared/DataViewExtensions";
import { buffer2hex } from "../../testUtils";


describe("OctreePacketData - unit tests", () => {
    /*
        eslint-disable
        @typescript-eslint/no-magic-numbers,
        @typescript-eslint/no-unsafe-member-access,
        @typescript-eslint/no-unsafe-call
    */

    let value = null;
    let errorMessage = null;
    let error = null;
    let data = null;
    let bytesWritten = null;
    let context = null;

    const MAX_FLOAT32 = 3.4028235e38;

    function setUp(bufferLength) {
        errorMessage = "";
        error = jest.spyOn(console, "error").mockImplementation((...message) => {
            errorMessage = message.join(" ");
        });

        data = new DataView(new ArrayBuffer(bufferLength));
        context = {
            propertiesToWrite: new EntityPropertyFlags(),
            propertiesWritten: new EntityPropertyFlags(),
            propertyCount: 0,
            appendState: AppendState.COMPLETED
        };
    }

    function tearDown() {
        error.mockRestore();
    }

    test("Error if try to write an invalid AACube value", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE, true);

        value = "aabbcc";
        bytesWritten = OctreePacketData.appendAACubeValue(data, 2, EntityPropertyList.PROP_QUERY_AA_CUBE, value, context);
        expect(bytesWritten).toBe(0);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid AACube value to packet!");

        value = { corner: { x: -4, y: -10.5, z: 1 }, scale: "" };
        bytesWritten = OctreePacketData.appendAACubeValue(data, 2, EntityPropertyList.PROP_QUERY_AA_CUBE, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid AACube value to packet!");

        tearDown();
    });

    test("Can write an AACube value", () => {
        // Successful write.
        setUp(20);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE, true);
        value = { corner: { x: -10.0, y: 6.4, z: 20.6 }, scale: 1.2 };
        bytesWritten = OctreePacketData.appendAACubeValue(data, 2, EntityPropertyList.PROP_QUERY_AA_CUBE, value, context);
        expect(bytesWritten).toBe(16);
        expect(buffer2hex(data.buffer)).toEqual("0000000020c1cdcccc40cdcca4419a99993f0000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(20);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE, true);
        value = { corner: { x: -10.0, y: 6.4, z: 20.6 }, scale: 1.2 };
        bytesWritten = OctreePacketData.appendAACubeValue(data, 8, EntityPropertyList.PROP_QUERY_AA_CUBE, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("0000000000000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_QUERY_AA_CUBE)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);
        tearDown();
    });

    test("Error if try to write an invalid ArrayBuffer value", () => {
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ACTION_DATA, true);

        value = 123;
        bytesWritten = OctreePacketData.appendArrayBufferValue(data, 2, EntityPropertyList.PROP_ACTION_DATA, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ACTION_DATA)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid ArrayBuffer value to packet!");

        tearDown();
    });

    test("Can write am ArrayBuffer value", () => {
        // Successful write of non-empty ArrayBuff4er.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ACTION_DATA, true);
        let array = new Uint8Array([128, 0, 1, 255]);
        value = array.buffer;
        bytesWritten = OctreePacketData.appendArrayBufferValue(data, 2, EntityPropertyList.PROP_ACTION_DATA, value, context);
        expect(bytesWritten).toBe(6);
        expect(buffer2hex(data.buffer)).toEqual("00000400800001ff0000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ACTION_DATA)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ACTION_DATA)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of empty ArrayBuffer.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ACTION_DATA, true);
        array = new Uint8Array(0);
        value = array.buffer;
        bytesWritten = OctreePacketData.appendArrayBufferValue(data, 2, EntityPropertyList.PROP_ACTION_DATA, value, context);
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ACTION_DATA)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ACTION_DATA)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ACTION_DATA, true);
        array = new Uint8Array([128, 0, 0, 0, 1, 255]);
        value = array.buffer;
        bytesWritten = OctreePacketData.appendArrayBufferValue(data, 5, EntityPropertyList.PROP_ACTION_DATA, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ACTION_DATA)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ACTION_DATA)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);
        tearDown();
    });

    test("Error if try to write an invalid boolean value", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_VISIBLE, true);

        value = "aabbcc";
        errorMessage = "";
        bytesWritten = OctreePacketData.appendBooleanValue(data, 2, EntityPropertyList.PROP_VISIBLE, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_VISIBLE)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid boolean value to packet!");

        tearDown();
    });

    test("Can write a boolean value", () => {
        // Successful write of true value.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_VISIBLE, true);
        value = true;
        bytesWritten = OctreePacketData.appendBooleanValue(data, 2, EntityPropertyList.PROP_VISIBLE, value, context);
        expect(bytesWritten).toBe(1);
        expect(buffer2hex(data.buffer)).toEqual("00000100000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_VISIBLE)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_VISIBLE)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of false value.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_VISIBLE, true);
        value = false;
        bytesWritten = OctreePacketData.appendBooleanValue(data, 2, EntityPropertyList.PROP_VISIBLE, value, context);
        expect(bytesWritten).toBe(1);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_VISIBLE)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_VISIBLE)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_VISIBLE, true);
        value = true;
        bytesWritten = OctreePacketData.appendBooleanValue(data, 10, EntityPropertyList.PROP_VISIBLE, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_VISIBLE)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_VISIBLE)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);

        tearDown();
    });

    test("Error if try to write an invalid color value", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);

        value = "aabbcc";
        bytesWritten = OctreePacketData.appendColorValue(data, 2, EntityPropertyList.PROP_COLOR, value, context);
        expect(bytesWritten).toBe(0);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid color value to packet!");

        value = { red: 100, green: 150, blue: "" };
        bytesWritten = OctreePacketData.appendColorValue(data, 2, EntityPropertyList.PROP_COLOR, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid color value to packet!");

        tearDown();
    });

    test("Can write a color value", () => {
        // Successful write.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);
        value = { red: 100, green: 150, blue: 200 };
        bytesWritten = OctreePacketData.appendColorValue(data, 2, EntityPropertyList.PROP_COLOR, value, context);
        expect(bytesWritten).toBe(3);
        expect(buffer2hex(data.buffer)).toEqual("00006496c80000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);
        value = { red: 100, green: 150, blue: 200 };
        bytesWritten = OctreePacketData.appendColorValue(data, 8, EntityPropertyList.PROP_COLOR, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);
        tearDown();
    });

    test("Error if try to write an invalid quat value", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ROTATION, true);

        value = { x: 1, y: 2, z: 3 };
        bytesWritten = OctreePacketData.appendQuatValue(data, 2, EntityPropertyList.PROP_ROTATION, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ROTATION)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid quat value to packet!");

        value = { x: 1, y: 2, z: 3, w: "" };
        bytesWritten = OctreePacketData.appendQuatValue(data, 2, EntityPropertyList.PROP_ROTATION, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ROTATION)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid quat value to packet!");

        tearDown();
    });

    test("Error if try to write an invalid float32 value", () => {
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_DENSITY, true);

        value = "aabbcc";
        errorMessage = "";
        bytesWritten = OctreePacketData.appendFloat32Value(data, 2, EntityPropertyList.PROP_DENSITY, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid float32 value to packet!");

        value = -1.1 * MAX_FLOAT32;
        errorMessage = "";
        bytesWritten = OctreePacketData.appendFloat32Value(data, 2, EntityPropertyList.PROP_DENSITY, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid float32 value to packet!");

        value = 1.1 * MAX_FLOAT32;
        errorMessage = "";
        bytesWritten = OctreePacketData.appendFloat32Value(data, 2, EntityPropertyList.PROP_DENSITY, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid float32 value to packet!");

        tearDown();
    });

    test("Can write a float32 value", () => {
        // Successful write of min value.
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_DENSITY, true);
        value = -MAX_FLOAT32;
        bytesWritten = OctreePacketData.appendFloat32Value(data, 2, EntityPropertyList.PROP_DENSITY, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(4);
        expect(buffer2hex(data.buffer)).toEqual("0000ffff7fff000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of intermediate value.
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_DENSITY, true);
        value = 1250;
        bytesWritten = OctreePacketData.appendFloat32Value(data, 2, EntityPropertyList.PROP_DENSITY, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(4);
        expect(buffer2hex(data.buffer)).toEqual("000000409c44000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of max value.
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_DENSITY, true);
        value = MAX_FLOAT32;
        bytesWritten = OctreePacketData.appendFloat32Value(data, 2, EntityPropertyList.PROP_DENSITY, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(4);
        expect(buffer2hex(data.buffer)).toEqual("0000ffff7f7f000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_DENSITY, true);
        value = 1250;
        bytesWritten = OctreePacketData.appendFloat32Value(data, 9, EntityPropertyList.PROP_DENSITY, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_DENSITY)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);

        tearDown();
    });

    test("Can write a quat value", () => {
        // Successful write.
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_POSITION, true);
        value = { x: -0.00913472, y: 0.104486, z: 0.0052514, w: 0.994471 };
        bytesWritten = OctreePacketData.appendQuatValue(data, 2, EntityPropertyList.PROP_POSITION, value, context);
        expect(bytesWritten).toBe(8);
        expect(buffer2hex(data.buffer)).toEqual("0000d47e5f8dab8049ff000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_POSITION, true);
        value = { x: -0.00913472, y: 0.104486, z: 0.0052514, w: 0.994471 };
        bytesWritten = OctreePacketData.appendQuatValue(data, 10, EntityPropertyList.PROP_POSITION, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);
        tearDown();

    });

    test("Error if try to write an invalid string value", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_NAME, true);

        value = 123;
        bytesWritten = OctreePacketData.appendStringValue(data, 2, EntityPropertyList.PROP_NAME, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_NAME)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid string value to packet!");

        tearDown();
    });

    test("Can write a string value", () => {
        // Successful write of non-empty string.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_NAME, true);
        value = "abcd";
        bytesWritten = OctreePacketData.appendStringValue(data, 2, EntityPropertyList.PROP_NAME, value, context);
        expect(bytesWritten).toBe(6);
        expect(buffer2hex(data.buffer)).toEqual("00000400616263640000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_NAME)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_NAME)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of empty string.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_NAME, true);
        value = "";
        bytesWritten = OctreePacketData.appendStringValue(data, 2, EntityPropertyList.PROP_NAME, value, context);
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_NAME)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_NAME)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_NAME, true);
        value = "abcd";
        bytesWritten = OctreePacketData.appendStringValue(data, 5, EntityPropertyList.PROP_NAME, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_NAME)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_NAME)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);
        tearDown();
    });

    test("Error if try to write an invalid Uint16 value", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX, true);

        value = "aabbcc";
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint16Value(data, 2, EntityPropertyList.PROP_PARENT_JOINT_INDEX, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint16 value to packet!");

        value = -1;
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint16Value(data, 2, EntityPropertyList.PROP_PARENT_JOINT_INDEX, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint16 value to packet!");

        value = 0x10000;
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint16Value(data, 2, EntityPropertyList.PROP_PARENT_JOINT_INDEX, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint16 value to packet!");

        tearDown();
    });

    test("Can write a uint16 value", () => {
        // Successful write of min value.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX, true);
        value = 0;
        bytesWritten = OctreePacketData.appendUint16Value(data, 2, EntityPropertyList.PROP_PARENT_JOINT_INDEX, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of intermediate value.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX, true);
        value = 0x1020;
        bytesWritten = OctreePacketData.appendUint16Value(data, 2, EntityPropertyList.PROP_PARENT_JOINT_INDEX, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(data.buffer)).toEqual("00002010000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of max value.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX, true);
        value = 0xffff;
        bytesWritten = OctreePacketData.appendUint16Value(data, 2, EntityPropertyList.PROP_PARENT_JOINT_INDEX, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(data.buffer)).toEqual("0000ffff000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX, true);
        value = 0;
        bytesWritten = OctreePacketData.appendUint16Value(data, 9, EntityPropertyList.PROP_PARENT_JOINT_INDEX, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_PARENT_JOINT_INDEX)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);

        tearDown();
    });

    test("Error if try to write an invalid Uint32 value", () => {
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_LAYER, true);

        value = "aabbcc";
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint32Value(data, 2, EntityPropertyList.PROP_RENDER_LAYER, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint32 value to packet!");

        value = -1;
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint32Value(data, 2, EntityPropertyList.PROP_RENDER_LAYER, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint32 value to packet!");

        value = 0x100000000;
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint32Value(data, 2, EntityPropertyList.PROP_RENDER_LAYER, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint32 value to packet!");

        tearDown();
    });

    test("Can write a uint32 value", () => {
        // Successful write of min value.
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_LAYER, true);
        value = 0;
        bytesWritten = OctreePacketData.appendUint32Value(data, 2, EntityPropertyList.PROP_RENDER_LAYER, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(4);
        expect(buffer2hex(data.buffer)).toEqual("000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of intermediate value.
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_LAYER, true);
        value = 0x71020;
        bytesWritten = OctreePacketData.appendUint32Value(data, 2, EntityPropertyList.PROP_RENDER_LAYER, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(4);
        expect(buffer2hex(data.buffer)).toEqual("000020100700000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of max value.
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_LAYER, true);
        value = 0xffffffff;
        bytesWritten = OctreePacketData.appendUint32Value(data, 2, EntityPropertyList.PROP_RENDER_LAYER, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(4);
        expect(buffer2hex(data.buffer)).toEqual("0000ffffffff000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(12);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_LAYER, true);
        value = 0;
        bytesWritten = OctreePacketData.appendUint32Value(data, 9, EntityPropertyList.PROP_RENDER_LAYER, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_RENDER_LAYER)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);

        tearDown();
    });

    test("Error if try to write an invalid Uint64 value", () => {
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_CREATED, true);

        value = "aabbcc";
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint64Value(data, 2, EntityPropertyList.PROP_CREATED, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint64 value to packet!");

        value = -1n;
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint64Value(data, 2, EntityPropertyList.PROP_CREATED, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint64 value to packet!");

        value = 0x10000000000000000n;
        errorMessage = "";
        bytesWritten = OctreePacketData.appendUint64Value(data, 2, EntityPropertyList.PROP_CREATED, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid uint64 value to packet!");

        tearDown();
    });

    test("Can write a uint64 value", () => {
        // Successful write of min value.
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_CREATED, true);
        value = 0n;
        bytesWritten = OctreePacketData.appendUint64Value(data, 2, EntityPropertyList.PROP_CREATED, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(8);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of intermediate value.
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_CREATED, true);
        value = 0x700001020n;
        bytesWritten = OctreePacketData.appendUint64Value(data, 2, EntityPropertyList.PROP_CREATED, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(8);
        expect(buffer2hex(data.buffer)).toEqual("00002010000007000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of max value.
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_CREATED, true);
        value = 0xffffffffffffffffn;
        bytesWritten = OctreePacketData.appendUint64Value(data, 2, EntityPropertyList.PROP_CREATED, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(8);
        expect(buffer2hex(data.buffer)).toEqual("0000ffffffffffffffff000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_CREATED, true);
        value = 0n;
        bytesWritten = OctreePacketData.appendUint64Value(data, 9, EntityPropertyList.PROP_CREATED, value,
            UDT.LITTLE_ENDIAN, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_CREATED)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);

        tearDown();
    });

    test("Error if try to write an invalid UUID array", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES, true);

        value = "aabbcc";
        bytesWritten = OctreePacketData.appendUuidArray(data, 2, EntityPropertyList.PROP_RENDER_WITH_ZONES, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid UUID array to packet!");

        value = ["aabbcc"];
        bytesWritten = OctreePacketData.appendUuidArray(data, 2, EntityPropertyList.PROP_RENDER_WITH_ZONES, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid UUID array to packet!");

        value = [new Uuid(), "aabbcc"];
        bytesWritten = OctreePacketData.appendUuidArray(data, 2, EntityPropertyList.PROP_RENDER_WITH_ZONES, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid UUID array to packet!");

        tearDown();
    });

    test("Can write a UUID array", () => {
        // Successful write of single null value.
        setUp(40);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES, true);
        value = [new Uuid()];
        bytesWritten = OctreePacketData.appendUuidArray(data, 2, EntityPropertyList.PROP_RENDER_WITH_ZONES, value, context);
        expect(bytesWritten).toBe(18);
        expect(buffer2hex(data.buffer))
            .toEqual("00000100000000000000000000000000000000000000000000000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of multiple non-null values.
        setUp(40);
        value = [new Uuid("a3eda01ec4de456dbf07858a26c5a648"), new Uuid("b4feb12fd5ef567ec018969b37d6b759")];
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES, true);
        bytesWritten = OctreePacketData.appendUuidArray(data, 2, EntityPropertyList.PROP_RENDER_WITH_ZONES, value, context);
        expect(bytesWritten).toBe(34);
        expect(buffer2hex(data.buffer))
            .toEqual("00000200a3eda01ec4de456dbf07858a26c5a648b4feb12fd5ef567ec018969b37d6b75900000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(40);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES, true);
        value = [new Uuid("a3eda01ec4de456dbf07858a26c5a648"), new Uuid("b4feb12fd5ef567ec018969b37d6b759")];
        bytesWritten = OctreePacketData.appendUuidArray(data, 8, EntityPropertyList.PROP_RENDER_WITH_ZONES, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer))
            .toEqual("00000000000000000000000000000000000000000000000000000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_RENDER_WITH_ZONES)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);

        tearDown();
    });

    test("Error if try to write an invalid UUID value", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY, true);

        value = "aabbcc";
        bytesWritten = OctreePacketData.appendUuidValue(data, 2, EntityPropertyList.PROP_LAST_EDITED_BY, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid UUID value to packet!");

        tearDown();
    });

    test("Can write a UUID value", () => {
        // Successful write of null value.
        setUp(24);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY, true);
        value = new Uuid();
        bytesWritten = OctreePacketData.appendUuidValue(data, 2, EntityPropertyList.PROP_LAST_EDITED_BY, value, context);
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(data.buffer)).toEqual("000000000000000000000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of non-null value.
        setUp(24);
        value = new Uuid("a3eda01ec4de456dbf07858a26c5a648");
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY, true);
        bytesWritten = OctreePacketData.appendUuidValue(data, 2, EntityPropertyList.PROP_LAST_EDITED_BY, value, context);
        expect(bytesWritten).toBe(18);
        expect(buffer2hex(data.buffer)).toEqual("00001000a3eda01ec4de456dbf07858a26c5a64800000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY, true);
        value = new Uuid("a3eda01ec4de456dbf07858a26c5a648");
        bytesWritten = OctreePacketData.appendUuidValue(data, 2, EntityPropertyList.PROP_LAST_EDITED_BY, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);

        tearDown();
    });

    test("Error if try to write an invalid vec3 value", () => {
        setUp(10);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_POSITION, true);

        value = "aabbcc";
        bytesWritten = OctreePacketData.appendVec3Value(data, 2, EntityPropertyList.PROP_POSITION, value, context);
        expect(bytesWritten).toBe(0);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid vec3 value to packet!");

        value = { x: -4, y: -10.5, z: "" };
        bytesWritten = OctreePacketData.appendVec3Value(data, 2, EntityPropertyList.PROP_POSITION, value, context);
        expect(bytesWritten).toBe(0);
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(true);
        expect(errorMessage).toBe("[EntityServer] Cannot write invalid vec3 value to packet!");

        tearDown();
    });

    test("Can write a vec3 value", () => {
        // Successful write.
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_POSITION, true);
        value = { x: -4, y: -10.5, z: 1.2 };
        bytesWritten = OctreePacketData.appendVec3Value(data, 2, EntityPropertyList.PROP_POSITION, value, context);
        expect(bytesWritten).toBe(12);
        expect(buffer2hex(data.buffer)).toEqual("0000000080c0000028c19a99993f0000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write if insufficient space.
        setUp(16);
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_POSITION, true);
        value = { x: -4, y: -10.5, z: 1.2 };
        bytesWritten = OctreePacketData.appendVec3Value(data, 8, EntityPropertyList.PROP_POSITION, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);
        tearDown();
    });

});
