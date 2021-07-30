//
//  DomainServer.unit.test.js
//
//  Created by David Rowe on 8 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServer from "../src/DomainServer";


describe("DomainServer - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can get but not set location property", () => {
        const domainServer = new DomainServer();
        expect(domainServer.location).toBe("");
        let caughtError = false;
        try {
            domainServer.location = "location";  // Shouldn't succeed;
        } catch (e) {
            //
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(domainServer.location).toBe("");
    });

    test("Can get but not set connection state values", () => {
        expect(DomainServer.DISCONNECTED).toBe(0);
        expect(DomainServer.ERROR).toBe(4);
        expect(DomainServer.CONNECTING).toBe(1);
        let caughtError = false;
        try {
            DomainServer.CONNECTING = 2;  // Shouldn't succeed;
        } catch (e) {
            //
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(DomainServer.CONNECTING).toBe(1);
    });

    test("Can get but not set current connection state", () => {
        const domainServer = new DomainServer();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        let caughtError = false;
        try {
            domainServer.state = DomainServer.CONNECTED;  // Shouldn't succeed;
        } catch (e) {
            //
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
    });

    test("Can get but not set refusal and error info", () => {
        const domainServer = new DomainServer();
        expect(domainServer.refusalInfo).toBe("");
        expect(domainServer.errorInfo).toBe("");
        let caughtErrorCount = 0;
        try {
            domainServer.refusalInfo = "refused";  // Shouldn't succeed;
        } catch (e) {
            //
            caughtErrorCount += 1;
        }
        try {
            domainServer.errorInfo = "error";  // Shouldn't succeed;
        } catch (e) {
            //
            caughtErrorCount += 1;
        }
        expect(caughtErrorCount).toBe(2);
        expect(domainServer.refusalInfo).toBe("");
        expect(domainServer.errorInfo).toBe("");
    });

    test("Error state if invalid location parameter specified", () => {
        const domainServer = new DomainServer();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        expect(domainServer.errorInfo).toBe("");
        expect(domainServer.refusalInfo).toBe("");
        domainServer.connect();  // undefined
        expect(domainServer.state).toBe(DomainServer.ERROR);
        expect(domainServer.errorInfo).not.toBe("");
        expect(domainServer.refusalInfo).toBe("");
    });

    test("Error state if no location specified to connect to", () => {
        const domainServer = new DomainServer();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        expect(domainServer.errorInfo).toBe("");
        expect(domainServer.refusalInfo).toBe("");
        domainServer.connect("  ");
        expect(domainServer.state).toBe(DomainServer.ERROR);
        expect(domainServer.errorInfo).not.toBe("");
        expect(domainServer.refusalInfo).toBe("");
    });




});
