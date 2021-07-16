//
//  MessageData.unit.test.js
//
//  Created by David Rowe on 11 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable no-magic-numbers */

import MessageData from "../../../src/domain/networking/MessageData";


describe("MessageData - unit tests", () => {

    test("Can set and get property values", () => {
        const messageData = new MessageData();
        messageData.number = 7;
        messageData.string = "hello";
        expect(messageData.number).toBe(7);
        expect(messageData.string).toBe("hello");
    });

});
