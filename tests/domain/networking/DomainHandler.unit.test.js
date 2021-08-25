//
//  DomainHandler.unit.test.js
//
//  Created by David Rowe on 27 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import ContextManager from "../../../src/domain/shared/ContextManager";
import Signal from "../../../src/domain/shared/Signal";
import Uuid from "../../../src/domain/shared/Uuid";

import TestConfig from "../../test.config.json";


describe("DomainHandler - integration tests", () => {

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call,
    @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-magic-numbers */

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);  // Required by NodeList.
    ContextManager.set(contextID, NodeList, contextID);
    const domainHandler = ContextManager.get(contextID, NodeList).getDomainHandler();


    test("Can set and get the URL", (done) => {
        expect.assertions(2);
        expect(domainHandler.getURL()).toBe("");

        const signal = new Signal();
        signal.connect(domainHandler.setURLAndID);  // eslint-disable-line @typescript-eslint/unbound-method
        signal.emit(TestConfig.SERVER_SIGNALING_SOCKET_URL, null);
        setTimeout(function () {
            expect(domainHandler.getURL()).toBe(TestConfig.SERVER_SIGNALING_SOCKET_URL);
            done();
        }, 10);
    });

    test("Can set and get the domain UUID", () => {
        expect(domainHandler.getUUID().valueOf()).toBe(Uuid.NULL);
        const uuid = new Uuid(12345);
        domainHandler.setUUID(uuid);
        expect(domainHandler.getUUID()).toBe(uuid);
    });

    test("Can set and get the domain local ID", () => {
        expect(domainHandler.getLocalID()).toBe(0);
        const localID = 7;
        domainHandler.setLocalID(localID);
        expect(domainHandler.getLocalID()).toBe(localID);
    });

    test("Can set and get the domain port", () => {
        expect(domainHandler.getPort()).toBe(0);
        expect(domainHandler.getSockAddr().getPort()).toBe(0);
        const port = 77;
        domainHandler.setPort(port);
        expect(domainHandler.getPort()).toBe(port);
        expect(domainHandler.getSockAddr().getPort()).toBe(port);
    });

    test("Setting connected and disconnected emits signals", (done) => {
        expect.assertions(4);
        expect(domainHandler.isConnected()).toBe(false);

        const signal = new Signal();
        signal.connect(domainHandler.setURLAndID);  // eslint-disable-line @typescript-eslint/unbound-method
        signal.emit(TestConfig.SERVER_SIGNALING_SOCKET_URL, null);

        domainHandler.connectedToDomain.connect((domainURL) => {
            expect(domainURL).toBe(TestConfig.SERVER_SIGNALING_SOCKET_URL);
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

    log.mockReset();
});
