//
//  DependencyManager.unit.test.ts
//
//  Created by David Rowe on 7 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DependencyManager from "../../../src/domain/shared/DependencyManager";


describe("DependencyManager - unit tests", () => {

    class A {
        //
    }

    class B {
        cid;
        sov;
        constructor(contextID, someOtherValue) {
            this.cid = contextID;  // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            this.sov = someOtherValue;  // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }
    }

    class C {
        //
    }

    test("Can create and use a context", () => {
        const contextID = DependencyManager.createContext();
        DependencyManager.set(contextID, A);

        const objectA = DependencyManager.get(contextID, A);
        expect(objectA instanceof A).toBe(true);

        const objectX = DependencyManager.get(contextID, A);
        expect(objectX).toBe(objectA);
    });

    test("Can include parameters when add a dependency", () => {
        const contextID = DependencyManager.createContext();
        DependencyManager.set(contextID, B, contextID, "hello");
        const objectB = DependencyManager.get(contextID, B);
        expect(objectB.cid).toBe(contextID);
        expect(objectB.sov).toBe("hello");
    });

    test("Errors are thrown when try to use an invalid context ID", () => {
        const contextID = DependencyManager.createContext();
        DependencyManager.set(contextID, A);
        expect(() => {
            DependencyManager.get(contextID + 1, A);  // eslint-disable-line @typescript-eslint/restrict-plus-operands
        }).toThrow();
        expect(() => {
            DependencyManager.set(contextID + 1, C);  // eslint-disable-line @typescript-eslint/restrict-plus-operands
        }).toThrow();
        expect(() => {
            DependencyManager.get(contextID + 1, C);  // eslint-disable-line @typescript-eslint/restrict-plus-operands
        }).toThrow();
    });

    test("An error is thrown when try to get an object not present in the context", () => {
        const contextID = DependencyManager.createContext();
        DependencyManager.set(contextID, A);
        expect(() => {
            DependencyManager.get(contextID, B);
        }).toThrow();
    });

    test("Cannot add a second object of a type that's already in the context", () => {
        const contextID = DependencyManager.createContext();
        DependencyManager.set(contextID, A);
        expect(() => {
            DependencyManager.set(contextID, A);
        }).toThrow();
    });

    test("Can have multiple contexts", () => {
        const contextID1 = DependencyManager.createContext();
        DependencyManager.set(contextID1, A);
        DependencyManager.set(contextID1, B);
        expect(DependencyManager.get(contextID1, A) instanceof A).toBe(true);
        expect(DependencyManager.get(contextID1, B) instanceof B).toBe(true);
        expect(() => {
            DependencyManager.get(contextID1, C);
        }).toThrow();

        const contextID2 = DependencyManager.createContext();
        DependencyManager.set(contextID2, A);
        DependencyManager.set(contextID2, C);
        expect(DependencyManager.get(contextID2, A) instanceof A).toBe(true);
        expect(DependencyManager.get(contextID2, C) instanceof C).toBe(true);
        expect(() => {
            DependencyManager.get(contextID2, B);
        }).toThrow();

        expect(DependencyManager.get(contextID1, A)).not.toBe(DependencyManager.get(contextID2, A));
    });

    test("Can get an existing object from the context when constructing a new object in the context", () => {

        class D {
            propertyD = "X";
        }

        class E {
            constructor(contextID) {
                const objectD = DependencyManager.get(contextID, D);
                this.propertyE = objectD.propertyD;  // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            }

            propertyE = "";
        }

        const contextID = DependencyManager.createContext();
        DependencyManager.set(contextID, D);
        DependencyManager.set(contextID, E, contextID);

        expect(DependencyManager.get(contextID, D).propertyD).toEqual("X");
        expect(DependencyManager.get(contextID, E).propertyE).toEqual("X");
    });

});
