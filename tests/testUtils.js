//
//  testUtils.js
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

function buffer2hex(buffer) {
    return [...new Uint8Array(buffer)]
        .map((x) => {
            return x.toString(16).padStart(2, "0");  // eslint-disable-line @typescript-eslint/no-magic-numbers
        })
        .join("");
}

export { buffer2hex };
