//
//  DomainHandler.unit.test.js
//
//  Created by David Rowe on 27 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountManagerMock from "../../../mocks/domain/networking/AccountManager.mock.js";
AccountManagerMock.mock();

import Packet from "../../../src/domain/networking/udt/Packet";
import PacketType from "../../../src/domain/networking/udt/PacketHeaders";
import AccountManager from "../../../src/domain/networking/AccountManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import DomainHandler from "../../../src/domain/networking/DomainHandler";
import NLPacket from "../../../src/domain/networking/NLPacket";
import NodeList from "../../../src/domain/networking/NodeList";
import ReceivedMessage from "../../../src/domain/networking/ReceivedMessage";
import SockAddr from "../../../src/domain/networking/SockAddr";
import ContextManager from "../../../src/domain/shared/ContextManager";
import SignalEmitter from "../../../src/domain/shared/SignalEmitter";
import Url from "../../../src/domain/shared/Url";
import Uuid from "../../../src/domain/shared/Uuid";

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import TestConfig from "../../test.config.js";


describe("DomainHandler - integration tests", () => {

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call,
    @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-magic-numbers */

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AccountManager, contextID);  // Required by NodeList.
    ContextManager.set(contextID, AddressManager);  // Required by NodeList.
    ContextManager.set(contextID, NodeList, contextID);
    const domainHandler = ContextManager.get(contextID, NodeList).getDomainHandler();


    test("Can get ConnectionRefusedReason values", () => {
        expect(DomainHandler.ConnectionRefusedReason.Unknown).toBe(0);
        expect(DomainHandler.ConnectionRefusedReason.ProtocolMismatch).toBe(1);
        expect(DomainHandler.ConnectionRefusedReason.NotAuthorizedDomain).toBe(7);
    });

    test("Can set and get the URL", (done) => {
        expect.assertions(2);
        expect(domainHandler.getURL().toString()).toBe("");

        const signal = new SignalEmitter();
        signal.connect(domainHandler.setURLAndID);  // eslint-disable-line @typescript-eslint/unbound-method
        signal.emit(new Url(TestConfig.SERVER_SIGNALING_SOCKET_URL), null);
        setTimeout(function () {
            expect(domainHandler.getURL().toString()).toBe(TestConfig.SERVER_SIGNALING_SOCKET_URL);
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

    test("Can set, get, and clear domain server pending path", () => {
        expect(domainHandler.getPendingPath()).toBe("");
        domainHandler.setPendingPath("/somepath");
        expect(domainHandler.getPendingPath()).toBe("/somepath");
        domainHandler.setPendingPath("/");
        expect(domainHandler.getPendingPath()).toBe("/");
        domainHandler.clearPendingPath();
        expect(domainHandler.getPendingPath()).toBe("");
    });

    test("Reports is not in error state", () => {
        expect(domainHandler.isInErrorState()).toBe(false);
    });

    test("Setting connected and disconnected emits signals", (done) => {
        expect.assertions(4);
        expect(domainHandler.isConnected()).toBe(false);

        const signal = new SignalEmitter();
        signal.connect(domainHandler.setURLAndID);  // eslint-disable-line @typescript-eslint/unbound-method
        signal.emit(new Url(TestConfig.SERVER_SIGNALING_SOCKET_URL), null);

        domainHandler.connectedToDomain.connect((domainURL) => {
            expect(domainURL.toString()).toBe(TestConfig.SERVER_SIGNALING_SOCKET_URL);
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

    test("Can get and clear silent domain check-ins count", () => {
        // Start at 0.
        expect(domainHandler.getCheckInPacketsSinceLastReply()).toBe(0);

        // Increment by 1.
        expect(domainHandler.checkInPacketTimeout()).toBe(false);
        expect(domainHandler.getCheckInPacketsSinceLastReply()).toBe(1);

        // Clear.
        domainHandler.clearPendingCheckins();
        expect(domainHandler.getCheckInPacketsSinceLastReply()).toBe(0);
    });

    test("The limit of silent domain check-ins triggers a signal", (done) => {
        domainHandler.limitOfSilentDomainCheckInsReached.connect(() => {
            expect(domainHandler.getCheckInPacketsSinceLastReply()).toBe(6);
            domainHandler.clearPendingCheckins();
            done();
        });

        // Start at 0.
        domainHandler.clearPendingCheckins();

        // increment by N.
        expect(domainHandler.checkInPacketTimeout()).toBe(false);
        expect(domainHandler.checkInPacketTimeout()).toBe(false);
        expect(domainHandler.checkInPacketTimeout()).toBe(false);
        expect(domainHandler.checkInPacketTimeout()).toBe(false);
        expect(domainHandler.checkInPacketTimeout()).toBe(false);
        expect(domainHandler.checkInPacketTimeout()).toBe(true);
    });

    test("Can set and get the connection token", () => {
        expect(domainHandler.getConnectionToken().value()).toBe(Uuid.NULL);
        const connectionToken = Uuid.createUuid();
        domainHandler.setConnectionToken(connectionToken);
        expect(domainHandler.getConnectionToken().value()).toBe(connectionToken.value());
    });

    test("Can process a DomainConnectionDenied message", (done) => {
        // eslint-disable-next-line max-len
        const MESSAGE_TEXT = "070000001013034600596f75206c61636b20746865207265717569726564206d6574617665727365207065726d697373696f6e7320746f20636f6e6e65637420746f207468697320646f6d61696e2e0000";
        const arrayBuffer = new ArrayBuffer(MESSAGE_TEXT.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(MESSAGE_TEXT.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer);
        const sockAddr = new SockAddr();
        sockAddr.setPort(7);
        const packet = new Packet(dataView, dataView.byteLength, sockAddr);
        const nlPacket = new NLPacket(packet);
        expect(nlPacket.getType()).toBe(PacketType.DomainConnectionDenied);
        const receivedMessage = new ReceivedMessage(nlPacket);

        const warn = jest.spyOn(console, "warn").mockImplementation((message) => {
            const EXPECTED_MESSAGES = [
                "[networking] The domain-server denied a connection request: ",
                "[networking] Make sure you are logged in to the metaverse."
            ];
            expect(EXPECTED_MESSAGES.indexOf(message)).toBeGreaterThan(-1);
        });

        let hasDomainConnectionRefusedBeenCalled = false;
        domainHandler.domainConnectionRefused.connect((reasonMessage, reasonCode, extraInfo) => {
            hasDomainConnectionRefusedBeenCalled = true;
            expect(reasonMessage).toBe("You lack the required metaverse permissions to connect to this domain.");
            expect(reasonCode).toBe(DomainHandler.ConnectionRefusedReason.NotAuthorizedMetaverse);
            expect(extraInfo).toBe("");
        });

        const accountManager = ContextManager.get(contextID, AccountManager);
        accountManager.authRequired.connect(() => {
            expect(hasDomainConnectionRefusedBeenCalled).toBe(true);
            expect(accountManager.generateNewUserKeypair).toHaveBeenCalledTimes(0);
            warn.mockRestore();
            done();
        });

        domainHandler.processDomainServerConnectionDeniedPacket(receivedMessage);
    });

    log.mockReset();
});
