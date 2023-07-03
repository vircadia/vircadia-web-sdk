//
//  JSONExtensions.ts
//
//  Created by David Rowe on 3 Jul 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "./Uuid";


/*@devdoc
 *  The <code>JSONExtensions</code> namespace provides "replacer" and "reviver" methods for use when stringifying and parsing
    JSON with <code>bigint</code> values.
 *  <p>C++: N/A</p>
 *  @namespace JSONExtensions
 */

/*@devdoc
 *  Replaces a <code>bigint</code> value in a JSON object being stringified. Use as the second parameter in the
 *  {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify|JSON.stringify()}
 *  call.
 *  @function JSONExtensions.bigintReplacer
 *  @param {string} key - The key of the property being processed.
 *  @param {unknown} value - The value of the property being processed.
 *  @returns {string|unknown} A numeric string ending with <code>"n"</code> if the value is a <code>bigint</code> or
 *      {@link Uuid}, otherwise the unaltered <code>value</code> passed in.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function bigintReplacer(key: string, value: unknown): unknown {
    if (typeof value === "bigint") {
        return value.toString() + "n";
    }
    if (value instanceof Uuid) {
        return value.value().toString() + "n";
    }
    return value;
}

/*@devdoc
 *  Revives a <code>bigint</code> value in a stringified JSON object. Use as the second parameter in the
 *  {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse|JSON.parse()} call.
 *  @function JSONExtensions.bigintReviver
 *  @param {string} key - The key of the property being processed.
 *  @param {unknown} value - The stringified value of the property being processed.
 *  @returns {bigint|unknown} The <code>bigint</code> value of the <code>value</code> if it's a numeric string ending with
 *      <code>"n"</code>, otherwise the unaltered <code>value</code> passed in.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function bigintReviver(key: string, value: unknown): unknown {
    if (typeof value === "string" && value.endsWith("n")) {  // $$$$$$: Match
        console.debug("$$$$... return", BigInt(value.slice(0, -1)));
        return BigInt(value.slice(0, -1));
    }
    return value;
}
