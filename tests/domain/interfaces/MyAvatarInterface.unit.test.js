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

import MyAvatarInterface from "../../../src/domain/interfaces/MyAvatarInterface";
import AvatarConstants from "../../../src/domain/shared/AvatarConstants";
import ContextManager from "../../../src/domain/shared/ContextManager";
import AvatarManager from "../../../src/domain/AvatarManager";
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
        expect(typeof myAvatarInterface.scaleChanged.connect).toBe("function");
        expect(typeof myAvatarInterface.scaleChanged.disconnect).toBe("function");
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

    test("Avatar scale can be limited by the domain", (done) => {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

        let errorCount = 0;
        const error = jest.spyOn(console, "error").mockImplementation(() => {
            errorCount += 1;
        });
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });  // Ignore out-of-range warnings.
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });  // Ignore domain requirements info.

        const domainServer = new DomainServer();
        const contextID = domainServer.contextID;
        ContextManager.set(contextID, AvatarManager, contextID);
        const myAvatarInterface = new MyAvatarInterface(contextID);
        let targetScaleChangeCount = 0;
        let targetScaleChangeTotal = 0.0;
        let scaleChangeCount = 0;
        let scaleChangeTotal = 0.0;
        myAvatarInterface.targetScaleChanged.connect((scale) => {
            targetScaleChangeCount += 1;
            targetScaleChangeTotal += scale;
        });
        myAvatarInterface.scaleChanged.connect((scale) => {
            scaleChangeCount += 1;
            scaleChangeTotal += scale;
        });

        expect(myAvatarInterface.scale).toBe(1.0);  // Default value.
        expect(errorCount).toBe(0);
        myAvatarInterface.scale = "2.0";  // String value instead of number.
        expect(errorCount).toBe(1);
        expect(myAvatarInterface.scale).toBe(1.0);

        const avatarManager = ContextManager.get(contextID, AvatarManager);
        const myAvatar = avatarManager.getMyAvatar();

        myAvatar.restrictScaleFromDomainSettings({
            avatars: {
                "min_avatar_height": AvatarConstants.MIN_AVATAR_HEIGHT,
                "max_avatar_height": AvatarConstants.DEFAULT_AVATAR_HEIGHT / 2.0
            }
        });
        expect(myAvatarInterface.scale).toBeCloseTo(0.5, 2);
        expect(myAvatarInterface.targetScale).toEqual(1.0);

        myAvatar.restrictScaleFromDomainSettings({
            avatars: {
                "min_avatar_height": AvatarConstants.MIN_AVATAR_HEIGHT,
                "max_avatar_height": AvatarConstants.MAX_AVATAR_HEIGHT / 2.0
            }
        });
        expect(myAvatarInterface.scale).toBe(1.0);
        expect(myAvatarInterface.targetScale).toEqual(1.0);

        myAvatar.restrictScaleFromDomainSettings({
            avatars: {
                "min_avatar_height": AvatarConstants.DEFAULT_AVATAR_HEIGHT * 2.0,
                "max_avatar_height": AvatarConstants.MAX_AVATAR_HEIGHT
            }
        });
        expect(myAvatarInterface.scale).toBeCloseTo(2.0, 1);
        expect(myAvatarInterface.targetScale).toEqual(1.0);

        myAvatar.restrictScaleFromDomainSettings({
            avatars: {
                "min_avatar_height": AvatarConstants.MIN_AVATAR_HEIGHT * 2.0,
                "max_avatar_height": AvatarConstants.MAX_AVATAR_HEIGHT
            }
        });
        expect(myAvatarInterface.scale).toBe(1.0);
        expect(myAvatarInterface.targetScale).toEqual(1.0);

        expect(errorCount).toBe(1);

        setTimeout(() => {  // Let events process.
            expect(targetScaleChangeCount).toEqual(0);
            expect(targetScaleChangeTotal).toEqual(0);
            expect(scaleChangeCount).toBeCloseTo(4.0, 1);
            expect(scaleChangeTotal).toBeCloseTo(4.5, 1);
            done();
        }, 10);

        log.mockReset();
        warn.mockReset();
        error.mockReset();

        /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    });

});
