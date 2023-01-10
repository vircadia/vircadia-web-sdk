//
//  NetworkReply.unit.test.js
//
//  Created by David Rowe on 7 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NetworkReply from "../../../src/domain/networking/NetworkReply";
import Url from "../../../src/domain/shared/Url";


describe("NetworkReply - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can access the reply response codes", () => {
        expect(NetworkReply.NoError).toBe(0);
        expect(NetworkReply.InternalServerError).toBe(401);
        expect(NetworkReply.PageNotFoundError).toBe(404);
        expect(NetworkReply.UnknownServerError).toBe(499);
    });

    test("Default network reply values are empty", () => {
        const networkReply = new NetworkReply();
        expect(networkReply.url().isEmpty()).toBe(true);
        expect(networkReply.url().toString()).toBe("");
        expect(networkReply.hasRawHeader()).toBe(false);
        expect(networkReply.rawHeader("something")).toBe("");
        expect(networkReply.error()).toBe(NetworkReply.NoError);
        expect(networkReply.errorString()).toBe("No error");
        expect(networkReply.readAll().byteLength).toBe(0);
        expect(networkReply.isFinished()).toBe(false);
    });

    test("Can set and get network reply values", () => {
        const networkReply = new NetworkReply();
        networkReply.setUrl(new Url("abc"));
        expect(networkReply.url().isEmpty()).toBe(false);
        expect(networkReply.url().toString()).toBe("abc");
        networkReply.setRawHeader("def", "ghi");
        expect(networkReply.hasRawHeader("def")).toBe(true);
        expect(networkReply.rawHeader("def")).toBe("ghi");
        networkReply.setError(NetworkReply.UnknownServerError, "jkl");
        expect(networkReply.error()).toBe(NetworkReply.UnknownServerError);
        expect(networkReply.errorString()).toBe("jkl");
        const data = new ArrayBuffer(10);
        networkReply.setData(data);
        expect(networkReply.readAll().byteLength).toBe(10);
        expect(networkReply.readAll()).toEqual(data);
    });

    test("Can use the \"finished\" signal", (done) => {
        const networkReply = new NetworkReply();
        networkReply.finished.connect(() => {
            expect(networkReply.isFinished()).toBe(true);
            done();
        });
        networkReply.setFinished();
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */

});
