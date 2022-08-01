//
//  NetworkPeer.unit.test.ts
//
//  Created by David Rowe on 11 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


import NetworkPeer from "../../../src/domain/networking/NetworkPeer";
import Node from "../../../src/domain/networking/Node";
import SockAddr from "../../../src/domain/networking/SockAddr";
import Uuid from "../../../src/domain/shared/Uuid";


describe("NetworkPeer - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });


    const TEST_UUID = new Uuid(2468n);
    const IP_127_0_0_1 = 127 * 2 ** 24 + 1;  // 127.0.0.1
    const TEST_PORT = 40102;
    const TEST_PORT_2 = 40103;
    const TEST_SOCK_ADDR = new SockAddr();
    TEST_SOCK_ADDR.setAddress(IP_127_0_0_1);
    TEST_SOCK_ADDR.setPort(TEST_PORT);
    const TEST_SOCK_ADDR_2 = new SockAddr();
    TEST_SOCK_ADDR_2.setAddress(IP_127_0_0_1);
    TEST_SOCK_ADDR_2.setPort(TEST_PORT_2);

    test("Can constructor with parameters", () => {
        const networkPeer = new NetworkPeer(TEST_UUID, TEST_SOCK_ADDR, TEST_SOCK_ADDR_2);
        expect(networkPeer.getUUID()).toBe(TEST_UUID);
        expect(networkPeer.getPublicSocket().isEqualTo(TEST_SOCK_ADDR)).toBe(true);
        expect(networkPeer.getLocalSocket().isEqualTo(TEST_SOCK_ADDR_2)).toBe(true);
    });

    test("Can get and set the UUID", () => {
        const networkPeer = new NetworkPeer();
        expect(networkPeer.getUUID().valueOf()).toEqual(Uuid.NULL);
        networkPeer.setUUID(13);
        expect(networkPeer.getUUID().valueOf()).toEqual(13);
    });

    test("Can get and set the local ID", () => {
        const networkPeer = new NetworkPeer();
        expect(networkPeer.getLocalID()).toEqual(Node.NULL_LOCAL_ID);
        networkPeer.setLocalID(15);
        expect(networkPeer.getLocalID()).toEqual(15);
    });

    test("Can get and set the public socket", () => {
        const networkPeer = new NetworkPeer();
        expect(networkPeer.getPublicSocket().isNull()).toBe(true);
        let sockAddr = new SockAddr();
        networkPeer.setPublicSocket(TEST_SOCK_ADDR);
        sockAddr = networkPeer.getPublicSocket();
        expect(sockAddr.getAddress()).toBe(IP_127_0_0_1);
        expect(sockAddr.getPort()).toBe(TEST_PORT);
    });

    test("Signal emitted when non-null public socket is updated", (done) => {
        expect.assertions(2);
        const networkPeer = new NetworkPeer();
        networkPeer.socketUpdated.connect((previousAddr, currentAddr) => {
            expect(previousAddr.isEqualTo(TEST_SOCK_ADDR)).toEqual(true);  // eslint-disable-line
            expect(currentAddr.isEqualTo(TEST_SOCK_ADDR_2)).toEqual(true);  // eslint-disable-line
            done();
        });
        networkPeer.setPublicSocket(TEST_SOCK_ADDR);  // Shouldn't trigger socketUpdated();
        networkPeer.setPublicSocket(TEST_SOCK_ADDR_2);  // Should trigger socketUpdated();
    });

    test("Can get and set the local socket", () => {
        const networkPeer = new NetworkPeer();
        expect(networkPeer.getLocalSocket().isNull()).toBe(true);
        let sockAddr = new SockAddr();
        networkPeer.setLocalSocket(TEST_SOCK_ADDR);
        sockAddr = networkPeer.getLocalSocket();
        expect(sockAddr.getAddress()).toBe(IP_127_0_0_1);
        expect(sockAddr.getPort()).toBe(TEST_PORT);
    });

    test("Signal emitted when non-null local socket is updated", (done) => {
        const networkPeer = new NetworkPeer();
        networkPeer.socketUpdated.connect((previousAddr, currentAddr) => {
            expect(previousAddr.isEqualTo(TEST_SOCK_ADDR)).toEqual(true);  // eslint-disable-line
            expect(currentAddr.isEqualTo(TEST_SOCK_ADDR_2)).toEqual(true);  // eslint-disable-line
            done();
        });
        networkPeer.setLocalSocket(TEST_SOCK_ADDR);  // Shouldn't trigger socketUpdated();
        networkPeer.setLocalSocket(TEST_SOCK_ADDR_2);  // Should trigger socketUpdated();
    });

    test("Can get and set the active socket", (done) => {
        const networkPeer = new NetworkPeer();
        networkPeer.socketActivated.connect((activeSocket) => {
            expect(activeSocket).toBe(TEST_SOCK_ADDR);
            expect(networkPeer.getActiveSocket()).toBe(TEST_SOCK_ADDR);
            done();
        });
        expect(networkPeer.getActiveSocket()).toBeNull();
        networkPeer.setPublicSocket(TEST_SOCK_ADDR);
        networkPeer.activatePublicSocket();
    });


    test("The active socket is reset to null if the public or local socket is changed", (done) => {
        const networkPeer = new NetworkPeer();
        networkPeer.setPublicSocket(TEST_SOCK_ADDR);
        networkPeer.setLocalSocket(TEST_SOCK_ADDR);
        let haveSetPublicSocket = false;
        let haveSetLocalSocket = false;
        networkPeer.socketActivated.connect((activeSocket) => {
            expect(activeSocket).toBe(TEST_SOCK_ADDR);
            expect(networkPeer.getActiveSocket()).toBe(TEST_SOCK_ADDR);
            if (!haveSetPublicSocket) {
                networkPeer.setPublicSocket(TEST_SOCK_ADDR_2);
                haveSetPublicSocket = true;
            } else {
                networkPeer.setLocalSocket(TEST_SOCK_ADDR_2);
                haveSetLocalSocket = true;
            }
        });
        networkPeer.socketUpdated.connect(() => {
            expect(networkPeer.getActiveSocket()).toBeNull();
            if (haveSetLocalSocket) {
                done();
            } else {
                networkPeer.activateLocalSocket();
            }
        });
        expect(networkPeer.getActiveSocket()).toBeNull();
        networkPeer.activatePublicSocket();
    });


    log.mockReset();
});
