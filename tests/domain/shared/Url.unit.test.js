//
//  Url.unit.test.js
//
//  Created by David Rowe on 30 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import Url from "../../../src/domain/shared/Url";


describe("Uuid - unit tests", () => {

    test("Can create an empty URL", () => {
        const url = new Url();
        expect(url.isEmpty()).toBe(true);
        expect(url.isValid()).toBe(false);
        expect(url.scheme()).toBe("");
        expect(url.host()).toBe("");
        expect(url.port()).toBe(-1);
        expect(url.path()).toBe("");
        expect(url.toString()).toBe("");
    });

    test("Can create a URL from another", () => {
        // Empty URL.
        let urlA = new Url();
        expect(urlA.isEmpty()).toBe(true);
        expect(urlA.isValid()).toBe(false);
        let urlB = new Url(urlA);
        expect(urlB.isEmpty()).toBe(true);
        expect(urlB.isValid()).toBe(false);

        // Invalid URL.
        const INVALID_URL = "abc";
        urlA = new Url(INVALID_URL);
        expect(urlA.isValid()).toBe(false);
        expect(urlA.isEmpty()).toBe(false);
        expect(urlA.toString()).toBe(INVALID_URL);
        urlB = new Url(urlA);
        expect(urlB.isValid()).toBe(false);
        expect(urlB.isEmpty()).toBe(false);
        expect(urlB.toString()).toBe(INVALID_URL);

        // Valid URL.
        const VALID_URL = "xyz://a.b.com:123/upath/vpath";
        urlA = new Url(VALID_URL);
        expect(urlA.isValid()).toBe(true);
        expect(urlA.isEmpty()).toBe(false);
        expect(urlA.toString()).toBe(VALID_URL);
        urlB = new Url(urlA);
        expect(urlB.isValid()).toBe(true);
        expect(urlB.isEmpty()).toBe(false);
        expect(urlB.toString()).toBe(VALID_URL);
    });

    test("Can get the string representation of the URL", () => {
        const VALID_URL = "xyz://a.b.com:123/upath/vpath";
        const validURL = new Url(VALID_URL);
        expect(validURL.isValid()).toBe(true);
        expect(validURL.isEmpty()).toBe(false);
        expect(validURL.toString()).toBe(VALID_URL);
        const INVALID_URL = "abc";
        const invalidURL = new Url(INVALID_URL);
        expect(invalidURL.isValid()).toBe(false);
        expect(invalidURL.isEmpty()).toBe(false);
        expect(invalidURL.toString()).toBe(INVALID_URL);
        const SHORT_URL = "xyz://a.b.com";
        const shortURL = new Url(SHORT_URL);
        expect(shortURL.isValid()).toBe(true);
        expect(shortURL.isEmpty()).toBe(false);
        expect(shortURL.toString()).toBe(SHORT_URL);
    });

    test("Can obtain the parts of a URL", () => {
        const url = new Url("xyz://a.b.com:123/upath/vpath");
        expect(url.isEmpty()).toBe(false);
        expect(url.isValid()).toBe(true);
        expect(url.scheme()).toBe("xyz");
        expect(url.host()).toBe("a.b.com");
        expect(url.port()).toBe(123);
        expect(url.path()).toBe("/upath/vpath");
    });

    test("Can use IP addresses in a URL", () => {
        const url = new Url("xyz://1.2.3.4:56789/upath/vpath");
        expect(url.isEmpty()).toBe(false);
        expect(url.isValid()).toBe(true);
        expect(url.scheme()).toBe("xyz");
        expect(url.host()).toBe("1.2.3.4");
        expect(url.port()).toBe(56789);
        expect(url.path()).toBe("/upath/vpath");
    });

    test("Can use a default port if none specified", () => {
        const url = new Url("xyz://1.2.3.4/upath/vpath");
        expect(url.port()).toBe(-1);
        expect(url.port(56789)).toBe(56789);
    });

    test("Can get and set the scheme", () => {
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });

        // Test valid value.
        const VALID_URL = "xyz://a.b.com:123/upath/vpath";
        const validURL = new Url(VALID_URL);
        expect(validURL.isValid()).toBe(true);
        expect(validURL.isEmpty()).toBe(false);
        expect(validURL.scheme()).toBe("xyz");
        validURL.setScheme("abc");
        expect(validURL.scheme()).toBe("abc");
        expect(validURL.toString()).toBe(VALID_URL.replace("xyz", "abc"));
        expect(error).toHaveBeenCalledTimes(0);

        // Test invalid value.
        const INVALID_URL = "abc";
        const invalidURL = new Url(INVALID_URL);
        expect(invalidURL.isValid()).toBe(false);
        expect(invalidURL.isEmpty()).toBe(false);
        expect(invalidURL.scheme()).toBe("");
        invalidURL.setScheme("abc");
        expect(invalidURL.scheme()).toBe("");
        expect(error).toHaveBeenCalledTimes(1);

        error.mockReset();
    });

    test("Can get and set the path", () => {
        const URL_A = "xyz://a.b.com:123/upath/vpath";
        const URL_B = "xyz://a.b.com:123/";
        const URL_C = "xyz://a.b.com:123";
        const urlA = new Url(URL_A);
        const urlB = new Url(URL_B);
        const urlC = new Url(URL_C);
        expect(urlA.path()).toBe("/upath/vpath");
        expect(urlB.path()).toBe("/");
        expect(urlC.path()).toBe("");
        urlA.setPath("/wpath/xpath");
        expect(urlA.path()).toBe("/wpath/xpath");
        urlA.setPath("/");
        expect(urlA.path()).toBe("/");
        urlA.setPath("");
        expect(urlA.path()).toBe("");
        const urlEmpty = new Url();
        urlEmpty.setPath("/wpath/xpath");
        expect(urlEmpty.isEmpty()).toBe(true);
    });

    test("Can get and set the query", () => {
        const URL = "xyz://a.b.com:123/upath/vpath";
        const url = new Url(URL);
        expect(url.query()).toBe("");
        url.setQuery("?a=b");
        expect(url.query()).toBe("?a=b");
    });

});
