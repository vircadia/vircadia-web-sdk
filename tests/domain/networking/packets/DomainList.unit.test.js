//
//  DomainList.unit.test.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SockAddr from "../../../../src/domain/networking/SockAddr";
import DomainList from "../../../../src/domain/networking/packets/DomainList";
import Uuid from "../../../../src/domain/shared/Uuid";

describe("DomainList - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read a DomainList packet", () => {
        /* eslint-disable-next-line max-len */
        const MESSAGE_TEXT = "030000000218a3eda01ec4de456dbf07858a26c5a648d918a0bf3247e1dd4f2293d2090edd56e385209500000bff010005cb1c31c626330005cb1c31c633ec000000000000025f00530ea4097df21e49f69c91691cbce65b7301002bf9c737fceb0100c0a8086efceb00000f9f0079df8d77ceed1bb84d4a9d7c1a6b6b0ccad9574d3a734f75be4c5d8ee7677fb3e2f70c01002bf9c737fce50100c0a8086efce500000f9f007fcec992d04d7b484d29b329a18339c94d9f4de50cb739a5504e74a951f706fd284abd01002bf9c737fce60100c0a8086efce600000f9f002684ea136d7b4ea344048639a16a45d5d0166f421045d34640437685f00e5bd8e9251601002bf9c737fce90100c0a8086efce900000f9f00cd3a958f5bafe09d49219e2588d27a787476418d1c008f837f4cb480e569f180a7cdd001002bf9c737fce70100c0a8086efce700000f9f00d32985acbc1570154664b33c3702ebede2716dd794d6149d95412ba476bc6dd160c6b701002bf9c737fce80100c0a8086efce800000f9f002c7375d1b8ed522f4fada1f047cd1b1194bc";
        const MESSAGE_START = 6;
        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = DomainList.read(dataView);
        expect(info.domainUUID instanceof Uuid).toBe(true);
        expect(typeof info.domainLocalID).toBe("number");
        expect(info.newUUID instanceof Uuid).toBe(true);
        expect(typeof info.newLocalID).toBe("number");
        expect(typeof info.newPermissions).toBe("object");
        expect(typeof info.isAuthenticated).toBe("boolean");
        expect(typeof info.newConnection).toBe("boolean");
        expect(info.nodes).toHaveLength(6);
        const node = info.nodes[5];
        expect(typeof node.type).toBe("string");
        expect(node.publicSocket instanceof SockAddr).toBe(true);
        expect(node.localSocket instanceof SockAddr).toBe(true);
        expect(typeof node.permissions).toBe("object");
        expect(typeof node.isReplicated).toBe("boolean");
        expect(typeof node.sessionLocalID).toBe("number");
        expect(node.connectionSecretUUID instanceof Uuid).toBe(true);
    });

    test("Can obtain assignment client details from a DomainList packet", () => {
        expect(true).toBe(true);
    });

});
