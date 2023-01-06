//
//  MetaverseAPI.unit.test.js
//
//  Created by David Rowe on 6 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import MetaverseAPI from "../../../src/domain/networking/MetaverseAPI";
import NetworkingConstants from "../../../src/domain/networking/NetworkingConstants";
import Url from "../../../src/domain/shared/Url";


describe("MetaverseAPI - unit tests", () => {

    test("The default metaverse server URL is Vircadia's", () => {
        const metaverseAPI = new MetaverseAPI();
        expect(metaverseAPI.getBaseUrl().toString()).toBe(NetworkingConstants.METAVERSE_SERVER_URL_STABLE);
        expect(metaverseAPI.getCurrentMetaverseServerURL().toString()).toBe(NetworkingConstants.METAVERSE_SERVER_URL_STABLE);
    });

    test("Can set and get the metaverse server URL", () => {
        const metaverseAPI = new MetaverseAPI();
        const SOME_URL = new Url("https://something.com/somewhere");
        metaverseAPI.setBaseUrl(SOME_URL);
        expect(metaverseAPI.getBaseUrl().toString()).toBe(SOME_URL.toString());
        expect(metaverseAPI.getCurrentMetaverseServerURL().toString()).toBe(SOME_URL.toString());
        const INVALID_URL = new Url("x");
        metaverseAPI.setBaseUrl(INVALID_URL);
        expect(metaverseAPI.getBaseUrl().isEmpty()).toBe(true);
        expect(metaverseAPI.getCurrentMetaverseServerURL().isEmpty()).toBe(true);
    });

    test("Can get the metaverse server URL's path", () => {
        const metaverseAPI = new MetaverseAPI();
        const SOME_URL = new Url("https://something.com/somewhere/else");
        metaverseAPI.setBaseUrl(SOME_URL);
        expect(metaverseAPI.getCurrentMetaverseServerURLPath()).toBe("/somewhere/else");
        expect(metaverseAPI.getCurrentMetaverseServerURLPath(false)).toBe("/somewhere/else");
        expect(metaverseAPI.getCurrentMetaverseServerURLPath(true)).toBe("/somewhere/else/");
    });

});
