//
//  NetworkingConstants.unit.test.js
//
//  Created by David Rowe on 6 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NetworkingConstants from "../../../src/domain/networking/NetworkingConstants";


describe("NetworkingConstants - unit tests", () => {

    test("Can obtain networking constants", () => {
        expect(NetworkingConstants.METAVERSE_SERVER_URL_STABLE).toBe("https://metaverse.vircadia.com/live");
    });

});
