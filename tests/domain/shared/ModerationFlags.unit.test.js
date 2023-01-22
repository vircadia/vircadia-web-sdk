//
//  ModerationFlags.unit.test.js
//
//  Created by David Rowe on 22 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ModerationFlags from "../../../src/domain/shared/ModerationFlags";


describe("ModerationFlags - unit tests", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can access the ban flag values", () => {
        expect(ModerationFlags.BanFlags.NO_BAN).toBe(0);
        expect(ModerationFlags.BanFlags.BAN_BY_USERNAME).toBe(1);
        expect(ModerationFlags.BanFlags.BAN_BY_FINGERPRINT).toBe(2);
        expect(ModerationFlags.BanFlags.BAN_BY_IP).toBe(4);
    });

    test("Can get the default ban flags value", () => {
        expect(ModerationFlags.getDefaultBanFlags()).toBe(3);
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
