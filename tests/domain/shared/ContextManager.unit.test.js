//
//  ContextManager.unit.test.ts
//
//  Created by David Rowe on 7 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ContextManager from "../../../src/domain/shared/ContextManager";


describe("ContextManager - unit tests", () => {

    class A {
        static contextItemType = "A";
        //
    }

    class B {
        static contextItemType = "B";
        cid;
        sov;
        constructor(contextID, someOtherValue) {
            this.cid = contextID;  // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            this.sov = someOtherValue;  // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }
    }

    class C {
        static contextItemType = "C";
        //
    }

    class NoName {
        // static contextItemType = "NoName";
    }

    class BlankName {
        static contextItemType = "";
    }

    test("The context item must include a \"contextItemName\" property", () => {
        const contextID = ContextManager.createContext();
        expect(() => {
            ContextManager.set(contextID, NoName);
        }).toThrow();
        expect(() => {
            ContextManager.get(contextID, NoName);
        }).toThrow();
        expect(() => {
            ContextManager.set(contextID, BlankName);
        }).toThrow();
        expect(() => {
            ContextManager.get(contextID, BlankName);
        }).toThrow();
        ContextManager.set(contextID, A);
        const objectA = ContextManager.get(contextID, A);
        expect(objectA instanceof A).toBe(true);
    });

    test("Can create and use a context", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, A);

        const objectA = ContextManager.get(contextID, A);
        expect(objectA instanceof A).toBe(true);

        const objectX = ContextManager.get(contextID, A);
        expect(objectX).toBe(objectA);
    });

    test("Can include parameters when adding a dependency", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, B, contextID, "hello");
        const objectB = ContextManager.get(contextID, B);
        expect(objectB.cid).toBe(contextID);
        expect(objectB.sov).toBe("hello");
    });

    test("Errors are thrown when trying to use an invalid context ID", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, A);
        expect(() => {
            ContextManager.get(contextID + 1, A);  // eslint-disable-line @typescript-eslint/restrict-plus-operands
        }).toThrow();
        expect(() => {
            ContextManager.set(contextID + 1, C);  // eslint-disable-line @typescript-eslint/restrict-plus-operands
        }).toThrow();
        expect(() => {
            ContextManager.get(contextID + 1, C);  // eslint-disable-line @typescript-eslint/restrict-plus-operands
        }).toThrow();
    });

    test("An error is thrown when trying to get an object not present in the context", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, A);
        expect(() => {
            ContextManager.get(contextID, B);
        }).toThrow();
    });

    test("Cannot add a second object of a type that's already in the context", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, A);
        expect(() => {
            ContextManager.set(contextID, A);
        }).toThrow();
    });

    test("Can have multiple contexts", () => {
        const contextID1 = ContextManager.createContext();
        ContextManager.set(contextID1, A);
        ContextManager.set(contextID1, B);
        expect(ContextManager.get(contextID1, A) instanceof A).toBe(true);
        expect(ContextManager.get(contextID1, B) instanceof B).toBe(true);
        expect(() => {
            ContextManager.get(contextID1, C);
        }).toThrow();

        const contextID2 = ContextManager.createContext();
        ContextManager.set(contextID2, A);
        ContextManager.set(contextID2, C);
        expect(ContextManager.get(contextID2, A) instanceof A).toBe(true);
        expect(ContextManager.get(contextID2, C) instanceof C).toBe(true);
        expect(() => {
            ContextManager.get(contextID2, B);
        }).toThrow();

        expect(ContextManager.get(contextID1, A)).not.toBe(ContextManager.get(contextID2, A));
    });

    test("Can get an existing object from the context when constructing a new object in the context", () => {

        class D {
            static contextItemType = "D";
            propertyD = "X";
        }

        class E {
            static contextItemType = "E";
            constructor(contextID) {
                const objectD = ContextManager.get(contextID, D);
                this.propertyE = objectD.propertyD;  // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            }

            propertyE = "";
        }

        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, D);
        ContextManager.set(contextID, E, contextID);

        expect(ContextManager.get(contextID, D).propertyD).toEqual("X");
        expect(ContextManager.get(contextID, E).propertyE).toEqual("X");
    });

});
