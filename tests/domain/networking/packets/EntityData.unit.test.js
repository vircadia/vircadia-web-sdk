//
//  EntityData.unit.test.js
//
//  Created by Julien Merzoug on 31 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../../../../src/domain/shared/Uuid";
import EntityData from "../../../../src/domain/networking/packets/EntityData";


describe("EntityData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can read an EntityData packet", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "758b96c9877644f3ad4be1547abd4d7f10518841cb6ee00500602043cb6ee005000000fffe3fffcdfffffffffffff8381ffffe110000000000000000000000000000000000000000ffff0100000000000000000000007ac07fbf5edd9bc05eb42ebfc2d7b63e02e5133eb29bb63eff7fff7fff7fffff0000003f0000003f0000003f518841cb6ee005001000520c174208e040c888a3dc32968b7b6b5d79a1bfa643a4c09ee671bf7f64063f01000000000000000000000000000000000101000001000000000000000000000000ff7fff7fff7fffff000000000000000000000000ff7fff7fff7fffff00000000803f0000803f0000803f00000000000000000000000000007a4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003f0000003f000080bf001f0000000000000000009643000000000000000000000000000000000000000000000000000000000000ffffffff000000000000000000000000000000000000000000000000ffffff0000600068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f4173736574732f4d6f64656c732f466f6f642f62697274686461795f63616b652f676c74662f62697274686461795f63616b652e676c620000803f0000803f0000803f0000000000000000000004007b0a7d0a010000000000f041000000000001000000000050c34700";
        // current processed data
        // id 758b96c9877644f3ad4be1547abd4d7f
        // type 10
        // created 518841cb6ee00500
        // lastEdited 602043cb6ee00500
        // updateDelta 00
        // simulatedDelta 00

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info.id).toStrictEqual(new Uuid(156244463098396166476369691145112735103n));
        expect(info.entityType).toBe(4);
        expect(info.created).toBe(1654141344647249n);
        expect(info.lastEdited).toBe(1654141344751712n);
        expect(info.updateDelta).toBe(0);
        expect(info.simulatedDelta).toBe(0);

        // TODO: Check other properties.

    });

});
