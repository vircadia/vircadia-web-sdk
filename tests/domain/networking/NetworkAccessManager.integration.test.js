//
//  NetworkAccessManager.integration.test.js
//
//  Created by David Rowe on 10 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import MetaverseAPI from "../../../src/domain/networking/MetaverseAPI";
import NetworkAccessManager from "../../../src/domain/networking/NetworkAccessManager";
import NetworkReply from "../../../src/domain/networking/NetworkReply";
import NetworkRequest from "../../../src/domain/networking/NetworkRequest";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("NetworkAccessManager - integration tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/restrict-plus-operands */

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, MetaverseAPI);
    const USER_PUBLIC_KEY_UPDATE_PATH = "/api/v1/user/public_key";

    const metaverseAPI = ContextManager.get(contextID, MetaverseAPI);

    test("PUT to a bad address fails with an error", (done) => {
        const metaverseServerURL = metaverseAPI.getCurrentMetaverseServerURL();
        metaverseServerURL.setPath(metaverseAPI.getCurrentMetaverseServerURLPath(false) + USER_PUBLIC_KEY_UPDATE_PATH + "x");

        const requestMultiPart = new Set();
        const networkAccessManager = NetworkAccessManager.getInstance();
        const networkRequest = new NetworkRequest();
        networkRequest.setUrl(metaverseServerURL);

        const networkReply = networkAccessManager.put(networkRequest, requestMultiPart);
        networkReply.finished.connect(() => {
            expect(networkReply.url().toString()).toBe(metaverseServerURL.toString());
            expect(networkReply.error()).toBe(NetworkReply.PageNotFoundError);
            expect(networkReply.errorString()).toBe("Page not found");
            done();
        });
    });

    test("PUT requiring authentication fails with an error when unauthenticated", (done) => {
        const metaverseServerURL = metaverseAPI.getCurrentMetaverseServerURL();
        metaverseServerURL.setPath(metaverseAPI.getCurrentMetaverseServerURLPath(false) + USER_PUBLIC_KEY_UPDATE_PATH);

        const requestMultiPart = new Set();
        const part = new Map();
        const pendingPublicKey = new Uint8Array("1234");
        part.set("public_key", Buffer.from(pendingPublicKey));
        requestMultiPart.add(part);

        const networkAccessManager = NetworkAccessManager.getInstance();
        const networkRequest = new NetworkRequest();
        networkRequest.setUrl(metaverseServerURL);

        const networkReply = networkAccessManager.put(networkRequest, requestMultiPart);
        networkReply.finished.connect(() => {
            expect(networkReply.url().toString()).toBe(metaverseServerURL.toString());
            expect(networkReply.error()).toBe(NetworkReply.InternalServerError);
            expect(networkReply.errorString()).toBe("Not authenticated");
            done();
        });
    });

    // TODO: "PUT not requiring authentication succeeds when unauthenticated"

});
