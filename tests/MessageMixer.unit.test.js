//
//  MessageMixer.unit.test.js
//
//  Created by David Rowe on 19 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServer from "../src/DomainServer";
import MessageMixer from "../src/MessageMixer";


describe("MessageMixer - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Error if try to create a MessageMixer without a DomainServer", () => {
        // This test must be first so that it runs before any DomainServer is created which creates a context.
        let messageMixer = null;
        let caughtError = false;
        try {
            messageMixer = new MessageMixer(0);  // Shouldn't succeed;
        } catch (e) {
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(messageMixer).toBeNull();
    });

    test("Can create a MessageMixer with a DomainServer", () => {
        const domainServer = new DomainServer();
        const messageMixer = new MessageMixer(domainServer.contextID);
        expect(messageMixer instanceof MessageMixer).toBe(true);
    });

    test("Can get but not set state values", () => {
        expect(MessageMixer.UNAVAILABLE).toBe(0);
        expect(MessageMixer.DISCONNECTED).toBe(1);
        expect(MessageMixer.CONNECTED).toBe(2);
        let caughtError = false;
        try {
            MessageMixer.CONNECTED = 1;  // Shouldn't succeed;
        } catch (e) {
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(MessageMixer.CONNECTED).toBe(2);
    });

    test("Unavailable state if not connected to a domain", () => {
        const domainServer = new DomainServer();
        const messageMixer = new MessageMixer(domainServer.contextID);
        expect(messageMixer.state).toBe(MessageMixer.UNAVAILABLE);
    });

    test("Can get string values for state values", () => {
        expect(MessageMixer.stateToString(MessageMixer.UNAVAILABLE)).toBe("UNAVAILABLE");
        expect(MessageMixer.stateToString(MessageMixer.DISCONNECTED)).toBe("DISCONNECTED");
        expect(MessageMixer.stateToString(MessageMixer.CONNECTED)).toBe("CONNECTED");
        expect(MessageMixer.stateToString(-1)).toBe("");
        expect(MessageMixer.stateToString(100)).toBe("");
    });

    test("Can set and clear the onStateChanged callback", () => {
        const domainServer = new DomainServer();
        const messageMixer = new MessageMixer(domainServer.contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        messageMixer.onStateChanged = () => { /* no-op */ };
        expect(error).toHaveBeenCalledTimes(0);
        messageMixer.onStateChanged = null;
        expect(error).toHaveBeenCalledTimes(0);
        messageMixer.onStateChanged = {};
        expect(error).toHaveBeenCalledTimes(1);
        error.mockReset();
    });

    test("Can connect to and disconnect from message signals", () => {
        const domainServer = new DomainServer();
        const messageMixer = new MessageMixer(domainServer.contextID);

        function messageFunction() { /* no-op */ }
        function dataFunction() { /* no-op */ }

        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        messageMixer.messageReceived.connect(messageFunction);
        messageMixer.messageReceived.disconnect(messageFunction);
        messageMixer.dataReceived.connect(dataFunction);
        messageMixer.dataReceived.disconnect(dataFunction);
        expect(error).toHaveBeenCalledTimes(0);
        error.mockReset();
    });

});
