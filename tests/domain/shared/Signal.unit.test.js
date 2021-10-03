//
//  Signal.unit.test.js
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Signal from "../../../src/domain/shared/Signal";


describe("Signal - unit tests", () => {

    let aCalled = null;
    let aParam1 = null;
    let aParam2 = null;
    let bCalled = null;
    let bParam1 = null;
    let bParam2 = null;

    function a(p1, p2) {
        aCalled += 1;
        aParam1 = p1;
        aParam2 = p2;
    }

    function b(p1, p2) {
        bCalled += 1;
        bParam1 = p1;
        bParam2 = p2;
    }

    test("Can connect, emit, and disconnect a signal", (done) => {
        expect.assertions(6);

        aCalled = 0;
        aParam1 = null;
        aParam2 = null;
        bCalled = 0;
        bParam1 = null;
        bParam2 = null;

        let signal = new Signal();
        signal.connect(a);
        signal.emit("a", "b");

        // Allow time for the signals to be emitted and processed.
        setTimeout(function () {
            expect(aCalled).toBe(1);
            expect(aParam1).toBe("a");
            expect(aParam2).toBe("b");
            expect(bCalled).toBe(0);
            expect(bParam1).toBeNull();
            expect(bParam2).toBeNull();
            signal = null;
            done();
        }, 100);
    });

    test("Can connect a signal to more than one function", (done) => {
        expect.assertions(6);

        aCalled = 0;
        aParam1 = null;
        aParam2 = null;
        bCalled = 0;
        bParam1 = null;
        bParam2 = null;

        let signal = new Signal();
        signal.connect(a);
        signal.connect(b);
        signal.emit("a", "b");

        // Allow time for the signals to be emitted and processed.
        setTimeout(function () {
            expect(aCalled).toBe(1);
            expect(aParam1).toBe("a");
            expect(aParam2).toBe("b");
            expect(bCalled).toBe(1);
            expect(bParam1).toBe("a");
            expect(bParam2).toBe("b");
            signal = null;
            done();
        }, 100);
    });

    test("Multiple signals are separate from one another", (done) => {
        expect.assertions(6);

        aCalled = 0;
        aParam1 = null;
        aParam2 = null;
        bCalled = 0;
        bParam1 = null;
        bParam2 = null;

        let signal1 = new Signal();
        let signal2 = new Signal();
        signal1.connect(a);
        signal2.connect(b);
        signal1.emit("a", "b");
        signal2.emit("c", "d");

        // Allow time for the signals to be emitted and processed.
        setTimeout(function () {
            expect(aCalled).toBe(1);
            expect(aParam1).toBe("a");
            expect(aParam2).toBe("b");
            expect(bCalled).toBe(1);
            expect(bParam1).toBe("c");
            expect(bParam2).toBe("d");
            signal1 = null;
            signal2 = null;
            done();
        }, 100);
    });

    test("Can obtain the public API object", () => {
        const signal = new Signal();
        const api = signal.value();
        expect(typeof api.connect).toBe("function");
        expect(typeof api.disconnect).toBe("function");
        expect(api.emit).toBeUndefined();
    });

});
