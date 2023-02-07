//
//  AssignmentClient.unit.test.js
//
//  Created by David Rowe on 19 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountManagerMock from "../../mocks/domain/networking/AccountManager.mock.js";
AccountManagerMock.mock();

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import DomainServer from "../../src/DomainServer";
import AssignmentClient from "../../src/domain/AssignmentClient";
import NodeType from "../../src/domain/networking/NodeType";


describe("AssignmentClient - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Error if try to create a AssignmentClient without a DomainServer", () => {
        // This test must be first so that it runs before any DomainServer is created which creates a context.
        let assignmentClient = null;
        let caughtError = false;
        try {
            assignmentClient = new AssignmentClient(0);  // Shouldn't succeed;
        } catch (e) {
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(assignmentClient).toBeNull();
    });

    test("Can create a AssignmentClient with a DomainServer", () => {
        const domainServer = new DomainServer();
        const assignmentClient = new AssignmentClient(domainServer.contextID, NodeType.AudioMixer);
        expect(assignmentClient instanceof AssignmentClient).toBe(true);
    });

    test("Can get but not set state values", () => {
        expect(AssignmentClient.UNAVAILABLE).toBe(0);
        expect(AssignmentClient.DISCONNECTED).toBe(1);
        expect(AssignmentClient.CONNECTED).toBe(2);
        let caughtError = false;
        try {
            AssignmentClient.CONNECTED = 1;  // Shouldn't succeed;
        } catch (e) {
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(AssignmentClient.CONNECTED).toBe(2);
    });

    test("Unavailable state if not connected to a domain", () => {
        const domainServer = new DomainServer();
        const assignmentClient = new AssignmentClient(domainServer.contextID);
        expect(assignmentClient.state).toBe(AssignmentClient.UNAVAILABLE);
    });

    test("Can get string values for state values", () => {
        expect(AssignmentClient.stateToString(AssignmentClient.UNAVAILABLE)).toBe("UNAVAILABLE");
        expect(AssignmentClient.stateToString(AssignmentClient.DISCONNECTED)).toBe("DISCONNECTED");
        expect(AssignmentClient.stateToString(AssignmentClient.CONNECTED)).toBe("CONNECTED");
        expect(AssignmentClient.stateToString(-1)).toBe("");
        expect(AssignmentClient.stateToString(100)).toBe("");
    });

    test("Can set and clear the onStateChanged callback", () => {
        const domainServer = new DomainServer();
        const assignmentClient = new AssignmentClient(domainServer.contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        assignmentClient.onStateChanged = () => { /* no-op */ };
        expect(error).toHaveBeenCalledTimes(0);
        assignmentClient.onStateChanged = null;
        expect(error).toHaveBeenCalledTimes(0);
        assignmentClient.onStateChanged = {};
        expect(error).toHaveBeenCalledTimes(1);
        error.mockReset();
    });

});
