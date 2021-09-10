//
//  SockAddr.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import SockAddr from "../../../src/domain/networking/SockAddr";
import SocketType, { SocketTypeValue } from "../../../src/domain/networking/SocketType";


describe("SockAddr - unit tests", () => {

    const IP_127_0_0_1 = 127 * 2 ** 24 + 1;  // 127.0.0.1
    const IP_255_255_255_255 = 2 ** 32 - 1;  // 255.255.255.255

    test("Default address values are correct", () => {
        const sockAddr = new SockAddr();
        expect(sockAddr.objectName()).toBe("");
        expect(sockAddr.getType()).toBe(SocketType.WebRTC);
        expect(sockAddr.getAddress()).toBe(0);
        expect(sockAddr.getPort()).toBe(0);
        expect(sockAddr.isNull()).toBe(true);
    });

    test("Can create with specified type, address, and port", () => {
        const sockAddr = new SockAddr(SocketType.UDP, 1234, 5);
        expect(sockAddr.getType()).toBe(SocketType.UDP);
        expect(sockAddr.getAddress()).toBe(1234);
        expect(sockAddr.getPort()).toBe(5);
        expect(sockAddr.isNull()).toBe(false);
    });

    test("Can set and get the object name", () => {
        const sockAddr = new SockAddr();
        expect(sockAddr.objectName()).toBe("");
        sockAddr.setObjectName("X");
        expect(sockAddr.objectName()).toBe("X");
    });

    test("Can set and get the socket type", () => {
        const sockAddr = new SockAddr();
        expect(sockAddr.getType()).toBe(SocketTypeValue.WebRTC);
        sockAddr.setType(SocketTypeValue.Unknown);
        expect(sockAddr.getType()).toBe(SocketTypeValue.Unknown);
    });

    test("Can set and get the IPv4 address", () => {
        const sockAddr = new SockAddr();
        sockAddr.setAddress(IP_127_0_0_1);
        expect(sockAddr.getAddress()).toBe(IP_127_0_0_1);
        sockAddr.setAddress(IP_255_255_255_255);
        expect(sockAddr.getAddress()).toBe(IP_255_255_255_255);
    });

    test("Can set and get the port number", () => {
        const sockAddr = new SockAddr();
        sockAddr.setPort(3);
        expect(sockAddr.getPort()).toBe(3);
    });

    test("Can test equality of two values", () => {
        const sockAddrA = new SockAddr();
        sockAddrA.setAddress(IP_127_0_0_1);
        sockAddrA.setPort(1);
        const sockAddrB = new SockAddr();
        sockAddrB.setAddress(IP_127_0_0_1);
        sockAddrB.setPort(1);
        expect(sockAddrA.isEqualTo(sockAddrB)).toBe(true);
        sockAddrB.setType(SocketTypeValue.Unknown);
        expect(sockAddrA.isEqualTo(sockAddrB)).toBe(false);
        sockAddrB.setType(SocketTypeValue.WebRTC);
        expect(sockAddrA.isEqualTo(sockAddrB)).toBe(true);
        sockAddrB.setAddress(IP_255_255_255_255);
        expect(sockAddrA.isEqualTo(sockAddrB)).toBe(false);
        sockAddrB.setAddress(IP_127_0_0_1);
        expect(sockAddrA.isEqualTo(sockAddrB)).toBe(true);
        sockAddrB.setPort(2);
        expect(sockAddrA.isEqualTo(sockAddrB)).toBe(false);
        sockAddrB.setAddress(IP_255_255_255_255);
        expect(sockAddrA.isEqualTo(sockAddrB)).toBe(false);
    });

    test("Can format as a string", () => {
        const sockAddr = new SockAddr();
        sockAddr.setAddress(IP_127_0_0_1);
        sockAddr.setPort(103);
        expect(sockAddr.toString()).toBe("WebRTC 127.0.0.1:103");
    });

});
