//
//  DomainHandler.integration.test.js
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */

import DomainHandler from "../../../src/libraries/networking/DomainHandler.js";
import HifiSockAddr from "../../../src/libraries/networking/HifiSockAddr.js";
import Signal from "../../../src/libraries/shared/Signal.js";
import Uuid from "../../../src/libraries/shared/Uuid.js";


describe("DomainHandler - integration tests", () => {

    //  Test environment expected: Domain server running on localhost that allows anonymous logins.

    const LOCALHOST_WEBSOCKET = "ws://127.0.0.1:40102";

    /* eslint-disable no-magic-numbers */

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);


    test("Can set and get URL", (done) => {
        expect.assertions(2);

        const domainHandler = new DomainHandler();
        expect(domainHandler.getURL()).toBe(null);

        const signal = new Signal();
        signal.connect(domainHandler.setURLAndID);
        signal.emit(LOCALHOST_WEBSOCKET, null);
        setTimeout(function () {
            expect(domainHandler.getURL()).toBe(LOCALHOST_WEBSOCKET);
            done();
        }, 10);
    });

    test("Can set and get the domain UUID", () => {
        const domainHandler = new DomainHandler();
        expect(domainHandler.getUUID()).toBe(Uuid.NULL);
        const uuid = new Uuid(12345);
        domainHandler.setUUID(uuid);
        expect(domainHandler.getUUID()).toBe(uuid);
    });

    test("Can set and get the domain local ID", () => {
        const domainHandler = new DomainHandler();
        expect(domainHandler.getLocalID()).toBe(0);
        const localID = 7;
        domainHandler.setLocalID(localID);
        expect(domainHandler.getLocalID()).toBe(localID);
    });

    test("Can set and get the domain port", () => {
        const domainHandler = new DomainHandler();
        expect(domainHandler.getPort()).toBe(0);
        expect(domainHandler.getSockAddr().getPort()).toBe(0);
        const port = 77;
        domainHandler.setPort(port);
        expect(domainHandler.getPort()).toBe(port);
        expect(domainHandler.getSockAddr().getPort()).toBe(port);
    });

    test("Setting connected and disconnected emits signals", (done) => {
        expect.assertions(4);
        const domainHandler = new DomainHandler();
        expect(domainHandler.isConnected()).toBe(false);

        const signal = new Signal();
        signal.connect(domainHandler.setURLAndID);
        signal.emit(LOCALHOST_WEBSOCKET, null);

        domainHandler.connectedToDomain.connect((domainURL) => {
            expect(domainURL).toBe(LOCALHOST_WEBSOCKET);
            expect(domainHandler.isConnected()).toBe(true);
        });
        domainHandler.disconnectedFromDomain.connect(() => {
            expect(domainHandler.isConnected()).toBe(false);
            done();
        });

        setTimeout(function () {
            domainHandler.setIsConnected(true);
        }, 50);
        setTimeout(function () {
            domainHandler.setIsConnected(false);
        }, 100);
    });

});