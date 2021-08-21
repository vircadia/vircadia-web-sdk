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

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });


    test("Can get but not set the context ID", () => {
        const domainServer = new DomainServer();
        const contextID = domainServer.contextID;
        expect(typeof contextID).toBe("number");
        expect(contextID).toBeGreaterThanOrEqual(0);
        let caughtError = false;
        try {
            domainServer.contextID = 1;  // Shouldn't succeed;
        } catch (e) {
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(domainServer.contextID).toBe(contextID);

    });

    test("Can get but not set location property", () => {
        const domainServer = new DomainServer();
        expect(domainServer.location).toBe("");
        let caughtError = false;
        try {
            domainServer.location = "location";  // Shouldn't succeed;
        } catch (e) {
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
            caughtErrorCount += 1;
        }
        try {
            domainServer.errorInfo = "error";  // Shouldn't succeed;
        } catch (e) {
            caughtErrorCount += 1;
        }
        expect(caughtErrorCount).toBe(2);
        expect(domainServer.refusalInfo).toBe("");
        expect(domainServer.errorInfo).toBe("");
    });

    test("Can get string values for connection state values", () => {
        expect(DomainServer.stateToString(DomainServer.DISCONNECTED)).toBe("DISCONNECTED");
        expect(DomainServer.stateToString(DomainServer.CONNECTING)).toBe("CONNECTING");
        expect(DomainServer.stateToString(DomainServer.CONNECTED)).toBe("CONNECTED");
        expect(DomainServer.stateToString(DomainServer.REFUSED)).toBe("REFUSED");
        expect(DomainServer.stateToString(DomainServer.ERROR)).toBe("ERROR");
        expect(DomainServer.stateToString(-1)).toBe("");
        expect(DomainServer.stateToString(100)).toBe("");
    });

    test("Can set and clear the onStateChanged callback", () => {
        const domainServer = new DomainServer();
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        domainServer.onStateChanged = () => { /* no-op */ };
        expect(error).toHaveBeenCalledTimes(0);
        domainServer.onStateChanged = null;
        expect(error).toHaveBeenCalledTimes(0);
        domainServer.onStateChanged = {};
        expect(error).toHaveBeenCalledTimes(1);
        error.mockReset();
    });

    test("Error state and callback if invalid location parameter specified", () => {
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        const domainServer = new DomainServer();
        domainServer.onStateChanged = (state) => {
            expect(state).toBe(DomainServer.ERROR);
        };
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        expect(domainServer.errorInfo).toBe("");
        expect(domainServer.refusalInfo).toBe("");
        domainServer.connect();  // undefined
        expect(domainServer.state).toBe(DomainServer.ERROR);
        expect(domainServer.errorInfo).not.toBe("");
        expect(domainServer.refusalInfo).toBe("");
        expect(error).toHaveBeenCalledTimes(1);
        error.mockReset();
    });

    test("Error state and callback if no location specified to connect to", () => {
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        const domainServer = new DomainServer();
        domainServer.onStateChanged = (state) => {
            expect(state).toBe(DomainServer.ERROR);
        };
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        expect(domainServer.errorInfo).toBe("");
        expect(domainServer.refusalInfo).toBe("");
        domainServer.connect("");
        expect(domainServer.state).toBe(DomainServer.ERROR);
        expect(domainServer.errorInfo).not.toBe("");
        expect(domainServer.refusalInfo).toBe("");
        expect(error).toHaveBeenCalledTimes(0);
        error.mockReset();
    });


    log.mockReset();
});
