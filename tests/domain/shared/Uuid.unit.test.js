//
//  Uuid.unit.test.js
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../../../src/domain/shared/Uuid";

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;  // eslint-disable-lin


describe("Uuid - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("The static values are provided", () => {
        expect(Uuid.NULL).toBe(0n);
        expect(Uuid.AVATAR_SELF_ID).toBe(1n);
    });

    test("The default UUID value is Uuid.NULL", () => {
        expect(new Uuid().valueOf()).toBe(Uuid.NULL);
    });

    test("Can initialize with a specified value", () => {
        /* eslint-disable newline-per-chained-call */
        expect(new Uuid(217897985291723272451165858623432009288n).valueOf().toString(16))
            .toBe("a3eda01ec4de456dbf07858a26c5a648");
        expect(new Uuid("a3eda01ec4de456dbf07858a26c5a648").valueOf().toString(16))
            .toBe("a3eda01ec4de456dbf07858a26c5a648");
        expect(new Uuid("a3eda01e-c4de-456d-bf07-858a26c5a648").valueOf().toString(16))
            .toBe("a3eda01ec4de456dbf07858a26c5a648");
        /* eslint-enable newline-per-chained-call */
    });

    test("Can get the underlying bigint primitive value", () => {
        const uuid = new Uuid(1234n);
        const value = uuid.value();
        expect(typeof value).toBe("bigint");
        expect(value).toBe(1234n);
    });

    test("Can stringify a Uuid", () => {
        const uuid = new Uuid(217897985291723272451165858623432009288n);
        expect(uuid.stringify()).toBe("a3eda01e-c4de-456d-bf07-858a26c5a648");
    });

    test("Can stringify a null Uuid", () => {
        const uuid = new Uuid(0n);
        expect(uuid.stringify()).toBe("00000000-0000-0000-0000-000000000000");
    });

    test("Can stringify a Uuid with leading 0s", () => {
        const uuid = new Uuid(1n);
        expect(uuid.stringify()).toBe("00000000-0000-0000-0000-000000000001");
    });

    test("Can generate random UUIDs", () => {
        const uuidA = Uuid.createUuid();
        expect((/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u).test(uuidA.stringify())).toBe(true);
        expect(uuidA.stringify().slice(0, 2)).not.toBe("00");
        const uuidB = Uuid.createUuid();
        expect((/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u).test(uuidB.stringify())).toBe(true);
        expect(uuidA.value()).not.toBe(uuidB.value());
    });

    test("Can check whether a UUID value is null", () => {
        let uuid = new Uuid();
        expect(uuid.isNull()).toBe(true);
        uuid = new Uuid(0n);
        expect(uuid.isNull()).toBe(true);
        uuid = new Uuid(1n);
        expect(uuid.isNull()).toBe(false);
        uuid = Uuid.createUuid();
        expect(uuid.isNull()).toBe(false);
    });

});
