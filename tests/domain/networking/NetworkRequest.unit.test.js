//
//  NetworkRequest.unit.test.js
//
//  Created by David Rowe on 7 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NetworkRequest from "../../../src/domain/networking/NetworkRequest";
import Url from "../../../src/domain/shared/Url";


describe("NetworkRequest - unit tests", () => {

    test("Can set and get attribute values", () => {
        const networkRequest = new NetworkRequest();
        expect(networkRequest.attributes().size).toBe(1);
        expect(networkRequest.attributes().get(NetworkRequest.FollowRedirectsAttribute)).toBe(false);
        networkRequest.setAttribute(NetworkRequest.FollowRedirectsAttribute, true);
        expect(networkRequest.attributes().get(NetworkRequest.FollowRedirectsAttribute)).toBe(true);
        networkRequest.setAttribute(NetworkRequest.FollowRedirectsAttribute, false);
        expect(networkRequest.attributes().get(NetworkRequest.FollowRedirectsAttribute)).toBe(false);
    });

    test("Can set and get raw header values", () => {
        const networkRequest = new NetworkRequest();
        expect(networkRequest.rawHeaders().size).toBe(0);
        networkRequest.setRawHeader("a", "x");
        expect(networkRequest.rawHeaders().size).toBe(1);
        expect(networkRequest.rawHeaders().get("a")).toBe("x");
        networkRequest.setRawHeader("a", "xx");
        expect(networkRequest.rawHeaders().size).toBe(1);
        expect(networkRequest.rawHeaders().get("a")).toBe("xx");
        networkRequest.setRawHeader("b", "y");
        expect(networkRequest.rawHeaders().size).toBe(2);
        expect(networkRequest.rawHeaders().get("a")).toBe("xx");
        expect(networkRequest.rawHeaders().get("b")).toBe("y");
    });

    test("Can set and get the URL", () => {
        const networkRequest = new NetworkRequest();
        expect(networkRequest.url().isEmpty()).toBe(true);
        networkRequest.setUrl(new Url("http://abc.xyz/ijk"));
        expect(networkRequest.url().isEmpty()).toBe(false);
        expect(networkRequest.url().toString()).toBe("http://abc.xyz/ijk");
    });

});
