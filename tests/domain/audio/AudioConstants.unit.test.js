//
//  AudioConstants.unit.test.js
//
//  Created by David Rowe on 11 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioConstants from "../../../src/domain/audio/AudioConstants";


describe("AudioConstants - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("AudioConstants values can be accessed", () => {
        expect(AudioConstants.NETWORK_FRAME_SAMPLES_STEREO).toBe(480);
        expect(AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL).toBe(240);
    });

});
