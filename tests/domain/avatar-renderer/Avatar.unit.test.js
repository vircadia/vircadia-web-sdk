//
//  Avatar.unit.test.js
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import Avatar from "../../../src/domain/avatar-renderer/Avatar";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import AvatarConstants from "../../../src/domain/shared/AvatarConstants";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("Avatar - unit tests", () => {

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);
    ContextManager.set(contextID, NodeList, contextID);

    test("Can mark the avatar as being initialized", () => {
        const avatar = new Avatar(contextID);
        expect(avatar.isInitialized()).toBe(false);
        avatar.init();
        expect(avatar.isInitialized()).toBe(true);
        expect(true).toBe(true);
    });

    test("Can set and get the target avatar scale", (done) => {
        const avatar = new Avatar(contextID);
        let scaleChangeCount = 0;
        let scaleChangeTotal = 0.0;
        avatar.targetScaleChanged.connect((scale) => {
            scaleChangeCount += 1;
            scaleChangeTotal += scale;
        });

        expect(avatar.getTargetScale()).toEqual(1.0);  // Default.
        avatar.setTargetScale(1.2);
        expect(avatar.getTargetScale()).toEqual(1.2);
        avatar.setTargetScale(2000.0);
        avatar.setTargetScale(2000.0);  // Call again to check that signal isn't triggered again.
        expect(avatar.getTargetScale()).toEqual(1000.0);  // MAX_AVATAR_SCALE
        avatar.setTargetScale(0.00001);
        expect(avatar.getTargetScale()).toEqual(0.005);  // MIN_AVATAR_SCALE

        setTimeout(() => {  // Let targetScaleChanged() events process.
            expect(scaleChangeCount).toEqual(3);
            expect(scaleChangeTotal).toEqual(1001.205);
            done();
        }, 10);
    });

    test("Can limit the avatar height per the domain", (done) => {
        const avatar = new Avatar(contextID);
        let scaleChangedCount = 0;
        avatar.targetScaleChanged.connect(() => {
            scaleChangedCount += 1;
        });

        expect(avatar.getTargetScale()).toEqual(1.0);
        expect(avatar.getDomainLimitedScale()).toBe(1.0);

        avatar.setDomainMaximumHeight(AvatarConstants.DEFAULT_AVATAR_HEIGHT / 2.0);
        expect(avatar.getDomainLimitedScale()).toBeCloseTo(0.5, 2);
        expect(avatar.getTargetScale()).toEqual(1.0);

        avatar.setDomainMaximumHeight(AvatarConstants.MAX_AVATAR_HEIGHT / 2);
        expect(avatar.getDomainLimitedScale()).toBe(1.0);
        expect(avatar.getTargetScale()).toEqual(1.0);

        avatar.setDomainMinimumHeight(AvatarConstants.DEFAULT_AVATAR_HEIGHT * 2.0);
        expect(avatar.getDomainLimitedScale()).toBeCloseTo(2.0, 1);
        expect(avatar.getTargetScale()).toEqual(1.0);

        avatar.setDomainMinimumHeight(AvatarConstants.MIN_AVATAR_HEIGHT * 2);
        expect(avatar.getDomainLimitedScale()).toBe(1.0);
        expect(avatar.getTargetScale()).toEqual(1.0);

        setTimeout(() => {
            expect(scaleChangedCount).toEqual(0);
            done();
        }, 10);
    });

});
