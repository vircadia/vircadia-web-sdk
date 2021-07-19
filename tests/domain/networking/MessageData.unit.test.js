//
//  MessageData.unit.test.js
//
//  Created by David Rowe on 11 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import MessageData from "../../../src/domain/networking/MessageData";


describe("MessageData - unit tests", () => {

    test("Can set and get property values", () => {
        const messageData = new MessageData();
        messageData.packetSize = 7;
        messageData.isReliable = true;
        messageData.dataPosition = 12;
        expect(messageData.packetSize).toBe(7);
        expect(messageData.isReliable).toBe(true);
    });

    test("Can't set invalid property values", () => {
        const messageData = new MessageData();
        let failed = false;
        try {
            messageData.invalidProperty = true;
        } catch (err) {
            failed = true;
        }
        expect(failed).toBe(true);
    });

    test("Can construct from another MessageData object", () => {
        const firstMessageData = new MessageData();
        firstMessageData.dataPosition = 12;
        const secondMessageData = new MessageData(firstMessageData);
        expect(secondMessageData.dataPosition).toBe(12);
        firstMessageData.dataPosition = 34;
        expect(firstMessageData.dataPosition).toBe(34);
        expect(secondMessageData.dataPosition).toBe(12);
    });

});
