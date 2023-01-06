//
//  MyAvatar.unit.test.js
//
//  Created by David Rowe on 18 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();

import MyAvatar from "../../../src/domain/avatar/MyAvatar";
import AccountManager from "../../../src/domain/networking/AccountManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import AvatarConstants from "../../../src/domain/shared/AvatarConstants";
import ContextManager from "../../../src/domain/shared/ContextManager";

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;


describe("MyAvatar - unit tests", () => {

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AccountManager, contextID);
    ContextManager.set(contextID, AddressManager);
    ContextManager.set(contextID, NodeList, contextID);

    test("Can limit the avatar height per the domain", (done) => {
        const avatar = new MyAvatar(contextID);
        let targetScaleChangedCount = 0;
        avatar.targetScaleChanged.connect(() => {
            targetScaleChangedCount += 1;
        });
        // Note: It's not valid to test avatar.scaleChanged signals because it is not triggered when using
        // setDomainMaximumHeight() and setDomainMinimumHeight().

        expect(avatar.getTargetScale()).toEqual(1.0);

        avatar.setDomainMaximumHeight(AvatarConstants.DEFAULT_AVATAR_HEIGHT / 2.0);
        expect(avatar.getDomainLimitedScale()).toBeCloseTo(0.5, 2);
        expect(avatar.getTargetScale()).toEqual(1.0);

        avatar.setDomainMaximumHeight(AvatarConstants.MAX_AVATAR_HEIGHT / 2);
        expect(avatar.getDomainLimitedScale()).toBe(1.0);
        expect(avatar.getTargetScale()).toEqual(1.0);

        avatar.setDomainMinimumHeight(AvatarConstants.DEFAULT_AVATAR_HEIGHT * 2.0);
        expect(avatar.getDomainLimitedScale()).toBeCloseTo(2.0, 1);
        expect(avatar.getTargetScale()).toEqual(1.0);

        avatar.setDomainMinimumHeight(AvatarConstants.MIN_AVATAR_HEIGHT / 2);
        expect(avatar.getDomainLimitedScale()).toBe(1.0);
        expect(avatar.getTargetScale()).toEqual(1.0);

        setTimeout(() => {
            expect(targetScaleChangedCount).toEqual(0);
            done();
        }, 10);
    });

    test("The scale change is signaled when the scale is changed", (done) => {
        const avatar = new MyAvatar(contextID);
        let targetScaleChangedCount = 0;
        let scaleChangedCount = 0;
        avatar.targetScaleChanged.connect(() => {
            targetScaleChangedCount += 1;
        });
        avatar.scaleChanged.connect(() => {
            scaleChangedCount += 1;
        });

        expect(avatar.getDomainLimitedScale()).toEqual(1.0);
        avatar.setTargetScale(2.0);
        avatar.setTargetScale(2.0);  // Repeat to check that signal isn't fired twice.
        expect(avatar.getDomainLimitedScale()).toEqual(2.0);
        avatar.setTargetScale(0.5);
        avatar.setTargetScale(0.5);
        expect(avatar.getDomainLimitedScale()).toEqual(0.5);
        avatar.setTargetScale(1.0);
        avatar.setTargetScale(1.0);
        expect(avatar.getDomainLimitedScale()).toEqual(1.0);

        setTimeout(() => {
            expect(targetScaleChangedCount).toEqual(3);
            expect(scaleChangedCount).toEqual(3);
            done();
        }, 10);
    });

});
