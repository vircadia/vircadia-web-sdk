//
//  ConnectionRefusedReason.unit.test.js
//
//  Created by David Rowe on 3 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ConnectionRefusedReason from "../../../src/domain/networking/ConnectionRefusedReason";


describe("ConnectionRefusedReason - unit tests", () => {

    // There are few unit tests because DomainHandler needs to be hosted by NodeList.
    // WEBRTC TODO: Fix this.

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can access ConnectionRefused reasons", () => {
        expect(ConnectionRefusedReason.Unknown).toBe(0);
        expect(ConnectionRefusedReason.NotAuthorizedDomain).toBe(7);
    });

});
