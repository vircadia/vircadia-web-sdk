//
//  NetworkAccessManager.unit.test.js
//
//  Created by David Rowe on 7 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NetworkAccessManager from "../../../src/domain/networking/NetworkAccessManager";


describe("NetworkAccessManager - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can access the operation types", () => {
        expect(NetworkAccessManager.UnknownOperation).toBe(0);
        expect(NetworkAccessManager.HeadOperation).toBe(1);
        expect(NetworkAccessManager.GetOperation).toBe(2);
        expect(NetworkAccessManager.PutOperation).toBe(3);
        expect(NetworkAccessManager.PostOperation).toBe(4);
        expect(NetworkAccessManager.DeleteOperation).toBe(5);
        expect(NetworkAccessManager.CustomOperation).toBe(6);
    });

    test("Can retrieve the NetworkAccessManager singleton", () => {
        const networkAccessManager = NetworkAccessManager.getInstance();
        expect(typeof networkAccessManager.put).toBe("function");
        expect(NetworkAccessManager.getInstance()).toEqual(networkAccessManager);
    });

});
