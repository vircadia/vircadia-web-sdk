//
//  WebRTCSocket.unit.test.js
//
//  Created by David Rowe on 28 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeType from "../../../../src/domain/networking/NodeType";
import WebRTCSocket from "../../../../src/domain/networking/webrtc/WebRTCSocket";


describe("WebRTCSocket - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Check initial state", () => {
        expect(WebRTCSocket.UNCONNECTED).toBe(0);
        expect(WebRTCSocket.CONNECTED).toBe(3);
        const webrtcSocket = new WebRTCSocket();
        expect(webrtcSocket.hasPendingDatagrams()).toBe(false);
        expect(webrtcSocket.state("", NodeType.DomainServer)).toBe(WebRTCSocket.UNCONNECTED);
    });

    test("Reading a datagram when there aren't any to read fails", () => {
        const webrtcSocket = new WebRTCSocket();
        const datagram = { buffer: undefined, sender: undefined };
        expect(webrtcSocket.readDatagram(datagram)).toBe(-1);
    });

    test("Reading a datagram when not connected fails", () => {
        const webrtcSocket = new WebRTCSocket();
        const datagram = new ArrayBuffer(100);
        expect(webrtcSocket.writeDatagram(datagram, 0)).toBe(-1);
    });

});
