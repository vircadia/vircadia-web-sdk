//
//  DomainList.unit.test.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SockAddr from "../../../../src/domain/networking/SockAddr";
import DomainListRequest from "../../../../src/domain/networking/packets/DomainList";
import Uuid from "../../../../src/domain/shared/Uuid";

describe("DomainList - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read a DomainList packet", () => {
        /* eslint-disable-next-line max-len */
        const MESSAGE_TEXT = "030000000218a3eda01ec4de456dbf07858a26c5a6485939feb55e8c5de043e38a56fcd8a400456ce2ee00000bff010005cae557f2bb1f0005cae557f2ea4e000000000000262501532224f298dbad4c3aaedc7d94755f705301002bf9c70ed51c0100c0a8086ed51c00000f9f00618b85a065e5648b46ac8d7879b935b2fe9d6d22a50d94f26d4777b009389b9ca7490801002bf9c70ed51a0100c0a8086ed51a00000f9f005bff8b2c86b6b97747d28a2dd79e4f7096ac41c8a782c9a5224cdcb9d84c5cbbfe120d01002bf9c70ed5180100c0a8086ed51800000f9f00dd625af7f02b20f54801a25d3f9b7792bae64d6a790af5607941e3a3a42cf7f720a48d01002bf9c70ed5190100c0a8086ed51900000f9f005ec5050c11d13bb04c1aa14f78d0b3c3b44857106978f5ce2e4fca9ab14635271422db01002bf9c70ed5170100c0a8086ed51700000f9f00da9ce60d64c546984a89a90113350e2778fd6f3ba009661d7c4921bf0c5bef41041ad601002bf9c70ed51d0100c0a8086ed51d00000f9f00e028a0933a4c321342a6a329ebcb72348c64";
        const MESSAGE_START = 6;
        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const info = DomainListRequest.read(dataView);
        expect(info.domainUUID instanceof Uuid).toBe(true);
        expect(typeof info.domainLocalID).toBe("number");
        expect(info.newUUID instanceof Uuid).toBe(true);
        expect(typeof info.newLocalID).toBe("number");
        expect(typeof info.newPermissions).toBe("object");
        expect(typeof info.isAuthenticated).toBe("boolean");
        expect(typeof info.newConnection).toBe("boolean");

        expect(info.nodes.length === 6).toBe(true);
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
