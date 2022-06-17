//
//  MyAvatarInterface.unit.test.js
//
//  Created by David Rowe on 31 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import AvatarManager from "../../../src/domain/AvatarManager";
import MyAvatarInterface from "../../../src/domain/interfaces/MyAvatarInterface";
import ContextManager from "../../../src/domain/shared/ContextManager";
import DomainServer from "../../../src/DomainServer";


describe("MyAvatarInterface - unit tests", () => {

    test("Can access the signals", () => {
        const domainServer = new DomainServer();
        const contextID = domainServer.contextID;
        ContextManager.set(contextID, AvatarManager, contextID);
        const myAvatarInterface = new MyAvatarInterface(contextID);
        expect(typeof myAvatarInterface.displayNameChanged.connect).toBe("function");
        expect(typeof myAvatarInterface.displayNameChanged.disconnect).toBe("function");
        expect(typeof myAvatarInterface.sessionDisplayNameChanged.connect).toBe("function");
        expect(typeof myAvatarInterface.sessionDisplayNameChanged.disconnect).toBe("function");
        expect(typeof myAvatarInterface.skeletonModelURLChanged.connect).toBe("function");
        expect(typeof myAvatarInterface.skeletonModelURLChanged.disconnect).toBe("function");
        expect(typeof myAvatarInterface.skeletonChanged.connect).toBe("function");
        expect(typeof myAvatarInterface.skeletonChanged.disconnect).toBe("function");
        expect(typeof myAvatarInterface.targetScaleChanged.connect).toBe("function");
        expect(typeof myAvatarInterface.targetScaleChanged.disconnect).toBe("function");
    });

    test("Target avatar scale is sanitized and clamped", (done) => {
        let errorCount = 0;
        const error = jest.spyOn(console, "error").mockImplementation(() => {
            errorCount += 1;
        });
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });  // Ignore out-of-range warnings.

        const domainServer = new DomainServer();
        const contextID = domainServer.contextID;
        ContextManager.set(contextID, AvatarManager, contextID);
        const myAvatarInterface = new MyAvatarInterface(contextID);
        let scaleChangeCount = 0;
        let scaleChangeTotal = 0.0;
        myAvatarInterface.targetScaleChanged.connect((scale) => {
            scaleChangeCount += 1;
            scaleChangeTotal += scale;
        });

        expect(myAvatarInterface.targetScale).toBe(1.0);  // Default value.
        expect(errorCount).toBe(0);
        myAvatarInterface.targetScale = "2.0";
        expect(errorCount).toBe(1);
        expect(myAvatarInterface.targetScale).toBe(1.0);

        expect(myAvatarInterface.targetScale).toBe(1.0);  // Default value.
        myAvatarInterface.targetScale = 1.2;
        expect(myAvatarInterface.targetScale).toBe(1.2);  // OK value.
        myAvatarInterface.targetScale = 2000.0;
        myAvatarInterface.targetScale = 2000.0;  // Call again to check that signal isn't triggered again.
        expect(myAvatarInterface.targetScale).toBe(1000.0);  // Clamped value.
        myAvatarInterface.targetScale = 0.001;
        expect(myAvatarInterface.targetScale).toBe(0.005);  // Clamped value.

        setTimeout(() => {  // Let targetScaleChanged() events process.
            expect(scaleChangeCount).toEqual(3);
            expect(scaleChangeTotal).toEqual(1001.205);
            done();
        }, 10);

        warn.mockReset();
        error.mockReset();
    });

});
