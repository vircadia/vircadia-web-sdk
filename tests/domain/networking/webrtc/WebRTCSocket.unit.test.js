//
//  WebRTCSocket.unit.test.js
//
//  Created by David Rowe on 28 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import WebRTCSocket from "../../../../src/domain/networking/webrtc/WebRTCSocket.js";


describe("WebRTCSocket - unit tests", () => {

    test("Check initial state", () => {
        const webrtcSocket = new WebRTCSocket();
        expect(webrtcSocket.hasPendingDatagrams()).toBe(false);
    });

});
