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
import { AppendState } from "../../../src/domain/octree/OctreeElement";
import OctreePacketData from "../../../src/domain/octree/OctreePacketData";
import Uuid from "../../../src/domain/shared/Uuid";

import "../../../src/domain/shared/DataViewExtensions";
import { buffer2hex } from "../../testUtils";


describe("OctreePacketData - unit tests", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can write a color value to a packet", () => {
        // Successful write.
        let data = new DataView(new ArrayBuffer(10));
        let value = { red: 100, green: 150, blue: 200 };
        let context = {
            propertiesToWrite: new EntityPropertyFlags(),
            propertiesWritten: new EntityPropertyFlags(),
            propertyCount: 0,
            appendState: AppendState.COMPLETED
        };
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);
        let bytesWritten = OctreePacketData.appendColorValue(data, 2, EntityPropertyList.PROP_COLOR, value, context);
        expect(bytesWritten).toBe(3);
        expect(buffer2hex(data.buffer)).toEqual("00006496c80000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write.
        data = new DataView(new ArrayBuffer(10));
        value = { red: 100, green: 150, blue: 200 };
        context = {
            propertiesToWrite: new EntityPropertyFlags(),
            propertiesWritten: new EntityPropertyFlags(),
            propertyCount: 0,
            appendState: AppendState.COMPLETED
        };
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);
        bytesWritten = OctreePacketData.appendColorValue(data, 8, EntityPropertyList.PROP_COLOR, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);
    });

    test("Can write a UUID value", () => {
        // Successful write of null value.
        let data = new DataView(new ArrayBuffer(24));
        let value = new Uuid();
        let context = {
            propertiesToWrite: new EntityPropertyFlags(),
            propertiesWritten: new EntityPropertyFlags(),
            propertyCount: 0,
            appendState: AppendState.COMPLETED
        };
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY, true);
        let bytesWritten = OctreePacketData.appendUUIDValue(data, 2, EntityPropertyList.PROP_LAST_EDITED_BY, value, context);
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(data.buffer)).toEqual("000000000000000000000000000000000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Successful write of non-null value.
        data = new DataView(new ArrayBuffer(24));
        value = new Uuid("a3eda01ec4de456dbf07858a26c5a648");
        context = {
            propertiesToWrite: new EntityPropertyFlags(),
            propertiesWritten: new EntityPropertyFlags(),
            propertyCount: 0,
            appendState: AppendState.COMPLETED
        };
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY, true);
        bytesWritten = OctreePacketData.appendUUIDValue(data, 2, EntityPropertyList.PROP_LAST_EDITED_BY, value, context);
        expect(bytesWritten).toBe(18);
        expect(buffer2hex(data.buffer)).toEqual("00001000a3eda01ec4de456dbf07858a26c5a64800000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(false);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(context.propertyCount).toBe(1);
        expect(context.appendState).toBe(AppendState.COMPLETED);

        // Unsuccessful write.
        data = new DataView(new ArrayBuffer(10));
        value = new Uuid("a3eda01ec4de456dbf07858a26c5a648");
        context = {
            propertiesToWrite: new EntityPropertyFlags(),
            propertiesWritten: new EntityPropertyFlags(),
            propertyCount: 0,
            appendState: AppendState.COMPLETED
        };
        context.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY, true);
        bytesWritten = OctreePacketData.appendUUIDValue(data, 2, EntityPropertyList.PROP_LAST_EDITED_BY, value, context);
        expect(bytesWritten).toBe(0);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000");
        expect(context.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(context.propertiesWritten.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(false);
        expect(context.propertyCount).toBe(0);
        expect(context.appendState).toBe(AppendState.PARTIAL);
    });

});
