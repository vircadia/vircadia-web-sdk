//
//  UsersInterface.unit.test.js
//
//  Created by David Rowe on 26 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import Uuid from "../../../src/domain/shared/Uuid";
import DomainServer from "../../../src/DomainServer";


describe("UsersInterface - unit tests", () => {

    test("Can access the users interface", () => {
        const domainServer = new DomainServer();
        expect(typeof domainServer.users).toBe("object");
    });

    test("Error logged if try to set avatar gain for invalid session ID or gain values", () => {
        const domainServer = new DomainServer();
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });

        // OK
        domainServer.users.setAvatarGain(new Uuid(100), 3);
        expect(error).toHaveBeenCalledTimes(0);
        expect(warn).toHaveBeenCalledTimes(1);  // Unknown avatar ID.

        // Errors
        domainServer.users.setAvatarGain("", 3);
        expect(error).toHaveBeenCalledTimes(1);
        domainServer.users.setAvatarGain(Uuid.NULL, 3);
        expect(error).toHaveBeenCalledTimes(2);
        domainServer.users.setAvatarGain(new Uuid(100), "");
        expect(error).toHaveBeenCalledTimes(3);

        warn.mockReset();
        error.mockReset();
    });

    test("Error logged if try to get avatar gain for invalid session ID value", () => {
        const domainServer = new DomainServer();
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });

        // OK
        let gain = domainServer.users.getAvatarGain(new Uuid(100));
        expect(gain).toBe(0);
        expect(error).toHaveBeenCalledTimes(0);

        // Errors
        gain = domainServer.users.getAvatarGain(Uuid.NULL);
        expect(gain).toBe(0);
        expect(error).toHaveBeenCalledTimes(1);
        gain = domainServer.users.getAvatarGain("");
        expect(gain).toBe(0);
        expect(error).toHaveBeenCalledTimes(2);

        error.mockReset();
    });

    test("Error logged if try to set personal mute for invalid session ID or mute values", () => {
        const domainServer = new DomainServer();
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });

        // OK
        domainServer.users.setPersonalMute(new Uuid(100), true);
        domainServer.users.setPersonalMute(new Uuid(100), false);
        expect(error).toHaveBeenCalledTimes(0);
        expect(warn).toHaveBeenCalledTimes(2);  // No audio mixer.

        // Errors
        domainServer.users.setPersonalMute("", 3);
        expect(error).toHaveBeenCalledTimes(1);
        domainServer.users.setPersonalMute(Uuid.NULL, 3);
        expect(error).toHaveBeenCalledTimes(2);
        domainServer.users.setPersonalMute(new Uuid(100), 3);
        expect(error).toHaveBeenCalledTimes(3);

        warn.mockReset();
        error.mockReset();
    });

    test("Error logged if try to get personal mute for invalid session ID", () => {
        const domainServer = new DomainServer();
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });

        // OK
        let isMuted = domainServer.users.getPersonalMute(new Uuid(100));
        expect(isMuted).toBe(false);
        expect(error).toHaveBeenCalledTimes(0);

        // Errors
        isMuted = domainServer.users.getPersonalMute(Uuid.NULL);
        expect(isMuted).toBe(false);
        expect(error).toHaveBeenCalledTimes(1);
        isMuted = domainServer.users.getPersonalMute("");
        expect(isMuted).toBe(false);
        expect(error).toHaveBeenCalledTimes(2);

        error.mockReset();
    });

    test("Error logged if try to set personal ignore for invalid session ID or mute values", () => {
        const domainServer = new DomainServer();
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });

        // OK
        domainServer.users.setPersonalIgnore(new Uuid(100), true);
        domainServer.users.setPersonalIgnore(new Uuid(100), false);
        expect(error).toHaveBeenCalledTimes(0);
        expect(warn).toHaveBeenCalledTimes(0);

        // Errors
        domainServer.users.setPersonalIgnore("", 3);
        expect(error).toHaveBeenCalledTimes(1);
        domainServer.users.setPersonalIgnore(Uuid.NULL, 3);
        expect(error).toHaveBeenCalledTimes(2);
        domainServer.users.setPersonalIgnore(new Uuid(100), 3);
        expect(error).toHaveBeenCalledTimes(3);

        warn.mockReset();
        error.mockReset();
    });

    test("Error logged if try to get personal ignore for invalid session ID", () => {
        const domainServer = new DomainServer();
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });

        // OK
        let isMuted = domainServer.users.getPersonalIgnore(new Uuid(100));
        expect(isMuted).toBe(false);
        expect(error).toHaveBeenCalledTimes(0);

        // Errors
        isMuted = domainServer.users.getPersonalIgnore(Uuid.NULL);
        expect(isMuted).toBe(false);
        expect(error).toHaveBeenCalledTimes(1);
        isMuted = domainServer.users.getPersonalIgnore("");
        expect(isMuted).toBe(false);
        expect(error).toHaveBeenCalledTimes(2);

        error.mockReset();
    });

    test("Can toggle wantIgnored", () => {
        const domainServer = new DomainServer();
        expect(domainServer.users.wantIgnored).toBe(false);
        domainServer.users.wantIgnored = true;
        expect(domainServer.users.wantIgnored).toBe(true);
        domainServer.users.wantIgnored = false;
        expect(domainServer.users.wantIgnored).toBe(false);
    });

});
