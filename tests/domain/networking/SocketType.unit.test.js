//
//  SocketType.unit.test.js
//
//  Created by David Rowe on 1 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SocketType from "../../../src/domain/networking/SocketType";


describe("SocketType - unit tests", () => {

    test("SocketType values are correct", () => {
        expect(SocketType.Unknown).toBe(0);
        expect(SocketType.UDP).toBe(1);
        expect(SocketType.WebRTC).toBe(2);
    });

    test("SocketType strings are correct", () => {
        expect(SocketType.socketTypeToString(SocketType.Unknown - 1)).toBe("Unknown");
        expect(SocketType.socketTypeToString(SocketType.Unknown)).toBe("Unknown");
        expect(SocketType.socketTypeToString(SocketType.UDP)).toBe("UDP");
        expect(SocketType.socketTypeToString(SocketType.WebRTC)).toBe("WebRTC");
        expect(SocketType.socketTypeToString(SocketType.WebRTC + 1)).toBe("Unknown");
    });

});
