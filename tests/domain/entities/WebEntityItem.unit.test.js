//
//  WebEntityItem.unit.test.js
//
//  Created by David Rowe on 2 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags from "../../../src/domain/entities/EntityPropertyFlags";
import WebEntityItem from "../../../src/domain/entities/WebEntityItem";

describe("WebEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read Web entity data", () => {
        const flagsBufferHex = "fffc7fff9bfffffffffffff01fdfe0";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new EntityPropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "9ea14d6666663f000000000000803f0000803f0000000000000000170068747470733a2f2f76697263616469612e636f6d2f3f611e001100687474703a2f2f736f6d657363726970740a01000000010172004d6f7a696c6c612f352e3020284c696e75783b20416e64726f696420362e303b204e657875732035204275696c642f4d524135384e29204170706c655765624b69742f3533372e333620284b48544d4c2c206c696b65204765636b6f29204368726f6d652f36392e302e333439372e313133e0424d96d3304a828722c71c247bfd67100000000868bf050063e8025149e505000006fffc7fff9bfffffffffffff040004011";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const webEntity = WebEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);
        expect(webEntity.bytesRead).toBe(196);

        expect(webEntity.properties.sourceURL).toBe("https://vircadia.com/?a");
        expect(webEntity.properties.color.red).toBe(158);
        expect(webEntity.properties.color.green).toBe(161);
        expect(webEntity.properties.color.blue).toBe(77);
        expect(webEntity.properties.alpha).toBeCloseTo(0.9, 5);
        expect(webEntity.properties.dpi).toBe(30);
        expect(webEntity.properties.scriptURL).toBe("http://somescript");
        expect(webEntity.properties.maxFPS).toBe(10);
        expect(webEntity.properties.inputMode).toBe(1);
        expect(webEntity.properties.showKeyboardFocusHighlight).toBe(true);
        expect(webEntity.properties.useBackground).toBe(true);
        // eslint-disable-next-line max-len
        expect(webEntity.properties.userAgent).toBe("Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.113");
    });

});
