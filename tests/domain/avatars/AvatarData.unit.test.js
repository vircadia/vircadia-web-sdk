//
//  AvatarData.unit.test.js
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import AvatarData from "../../../src/domain/avatars/AvatarData";
import AccountManager from "../../../src/domain/networking/AccountManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import AvatarConstants from "../../../src/domain/shared/AvatarConstants";
import ContextManager from "../../../src/domain/shared/ContextManager";
import { Uuid } from "../../../src/Vircadia";


describe("AvatarData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AccountManager, contextID);
    ContextManager.set(contextID, AddressManager);
    ContextManager.set(contextID, NodeList, contextID);


    test("Can set and get the session UUID", () => {
        const avatarData = new AvatarData(contextID);
        expect(avatarData.getSessionUUID().value()).toBe(Uuid.NULL);
        const uuid = new Uuid(1234n);
        avatarData.setSessionUUID(uuid);
        expect(avatarData.getSessionUUID().value()).toBe(uuid.value());
        avatarData.setSessionUUID(new Uuid(Uuid.NULL));
        expect(avatarData.getSessionUUID().value()).toBe(Uuid.AVATAR_SELF_ID);
    });

    test("Can flag the avatar identity data as having changed", () => {
        const avatarData = new AvatarData(contextID);
        expect(avatarData.getIdentityDataChanged()).toBe(false);
        avatarData.markIdentityDataChanged();
        expect(avatarData.getIdentityDataChanged()).toBe(true);
    });

    test("Can set and get the target avatar scale", (done) => {
        const avatarData = new AvatarData(contextID);
        let scaleChangedCount = 0;
        avatarData.targetScaleChanged.connect(() => {
            scaleChangedCount += 1;
        });

        expect(avatarData.getTargetScale()).toEqual(1.0);
        avatarData.setTargetScale(1.2);
        expect(avatarData.getTargetScale()).toEqual(1.2);
        avatarData.setTargetScale(2000.0);
        expect(avatarData.getTargetScale()).toEqual(1000.0);  // MAX_AVATAR_SCALE
        avatarData.setTargetScale(1000.0);  // No "scale changed" signal.
        expect(avatarData.getTargetScale()).toEqual(1000.0);
        avatarData.setTargetScale(0.00001);
        expect(avatarData.getTargetScale()).toEqual(0.005);  // MIN_AVATAR_SCALE
        avatarData.setTargetScale(0.005);
        expect(avatarData.getTargetScale()).toEqual(0.005);  // No "scale changed" signal.

        setTimeout(() => {
            expect(scaleChangedCount).toEqual(3);
            done();
        }, 10);
    });

    test("Can set and get the audio loudness", () => {
        const avatarData = new AvatarData(contextID);
        expect(avatarData.getAudioLoudness()).toBe(0);
        avatarData.setAudioLoudness(12);
        expect(avatarData.getAudioLoudness()).toBe(12);
    });

    test("Cannot limit the avatar height per the domain", (done) => {
        // This because at the AvatarData class level the target scale cannot be changed.
        const avatarData = new AvatarData(contextID);
        let scaleChangedCount = 0;
        avatarData.targetScaleChanged.connect(() => {
            scaleChangedCount += 1;
        });

        expect(avatarData.getTargetScale()).toEqual(1.0);

        avatarData.setDomainMaximumHeight(AvatarConstants.DEFAULT_AVATAR_HEIGHT / 2.0);
        expect(avatarData.getDomainLimitedScale()).toBe(1.0);
        expect(avatarData.getTargetScale()).toEqual(1.0);

        avatarData.setDomainMaximumHeight(AvatarConstants.MAX_AVATAR_HEIGHT / 2);
        expect(avatarData.getDomainLimitedScale()).toBe(1.0);
        expect(avatarData.getTargetScale()).toEqual(1.0);

        avatarData.setDomainMinimumHeight(AvatarConstants.DEFAULT_AVATAR_HEIGHT * 2.0);
        expect(avatarData.getDomainLimitedScale()).toBe(1.0);
        expect(avatarData.getTargetScale()).toEqual(1.0);

        avatarData.setDomainMinimumHeight(AvatarConstants.MIN_AVATAR_HEIGHT / 2);
        expect(avatarData.getDomainLimitedScale()).toBe(1.0);
        expect(avatarData.getTargetScale()).toEqual(1.0);

        setTimeout(() => {
            expect(scaleChangedCount).toEqual(0);
            done();
        }, 10);
    });

});
