//
//  HMACAuth.ts
//
//  Created by David Rowe on 27 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../shared/Uuid";
import UDT from "./udt/UDT";
import "../shared/DataViewExtensions";

import CryptoJS from "crypto-js";


/*@devdoc
 *  HMAC hash algorithms.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>MD5</td><td><code>0</code></td><td>MD5 hash.</td></tr>
 *          <tr><td>SHA1</td><td><code>1</code></td><td>SHA1 hash.</td></tr>
 *          <tr><td>SHA224</td><td><code>2</code></td><td>SHA224 hash.</td></tr>
 *          <tr><td>SHA256</td><td><code>3</code></td><td>SHA256 hash.</td></tr>
 *          <tr><td>RIPEMD160</td><td><code>4</code></td><td>RIPEMD160 hash.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} HMACAuth.AuthMethod
 */
enum AuthMethod {
    MD5 = 0,
    SHA1,
    SHA224,
    SHA256,
    RIPEMD160
}


/*@devdoc
 *  The <code>HMACAuth</code> class provides hash-based message authentication for signing the content of protocol packets.
 *  <p>C++: <code>HMACAuth</code></p>
 *  @class HMACAuth
 *  @param {HMACAuth.AuthMethod} authMethod=MD5 - The hash algorithm to use.
 *      <p><em>Only MD5 is supported at present.</em></p>
 *
 *  @property {HMACAuth.AuthMethod} MD5 - MD5 hash. <em>Static.</em>
 *  @property {HMACAuth.AuthMethod} SHA1 - SHA1 hash. <em>Static.</em>
 *  @property {HMACAuth.AuthMethod} SHA224 - SHA224 hash. <em>Static.</em>
 *  @property {HMACAuth.AuthMethod} SHA256 - SHA256 hash. <em>Static.</em>
 *  @property {HMACAuth.AuthMethod} RIPEMD160 - RIPEMD160 hash. <em>Static.</em>
 */
class HMACAuth {
    // C++  class HMACAuth

    static get MD5(): AuthMethod {
        return AuthMethod.MD5;
    }

    static get SHA1(): AuthMethod {
        return AuthMethod.SHA1;
    }

    static get SHA224(): AuthMethod {
        return AuthMethod.SHA224;
    }

    static get SHA256(): AuthMethod {
        return AuthMethod.SHA256;
    }

    static get RIPEMD160(): AuthMethod {
        return AuthMethod.RIPEMD160;
    }


    #_keyWordArray;


    constructor(authMethod = HMACAuth.MD5) {
        // C++  explicit HMACAuth(AuthMethod authMethod = MD5)

        // Vircadia only uses MD5.
        if (authMethod !== HMACAuth.MD5) {
            console.error("HMACAuth method not supported:", authMethod);
        }

        this.#_keyWordArray = CryptoJS.lib.WordArray.create([]);
    }


    /*@devdoc
     *  Sets the key to use when calculating hashes.
     *  @param {Uuid} uuidKey - The key to use when calculating hashes.
     *  @returns {boolean} <code>true</code> if the key is valid and has been set, <code>false</code> if not set.
     */
    setKey(uuidKey: Uuid): boolean {
        // C++  bool setKey(const QUuid& uidKey)
        if (!uuidKey.isNull()) {
            const KEY_BYTES = 16;
            const keyBytes = new Uint8Array(KEY_BYTES);
            const dataView = new DataView(keyBytes.buffer);
            dataView.setBigUint128(0, uuidKey.value(), UDT.BIG_ENDIAN);
            // The @types/crypto-js definitions haven't caught up with CryptoJS working with ArrayBuffers.
            // eslint-disable-next-line
            // @ts-ignore
            this.#_keyWordArray = CryptoJS.lib.WordArray.create(keyBytes);
            return true;
        }
        return false;
    }

    /*@devdoc
     *  Calculates the hash of packet data.
     *  @param {Uint8Array} hashResult - The destination to write the calculated hash.
     *  @param {Uint8Array} data - The packet data to hash.
     *  @param {number} offset - The start index within the packet data to hash.
     *  @param {number} dataLength - The length of the data within the packet to hash.
     *  @returns {boolean} <code>true</code> if the hash was successfully calculated, <code>false</code> if it wasn't.
     */
    calculateHash(hashResult: Uint8Array, data: Uint8Array, offset: number, dataLen: number): boolean {
        // C++  bool calculateHash(HMACHash& hashResult, const char* data, int dataLen)

        // The key must be set.
        if (this.#_keyWordArray.words.length === 0) {
            return false;
        }

        // Prepare the data.
        const bytes = data.slice(offset, offset + dataLen);

        // The @types/crypto-js definitions haven't caught up with CryptoJS working with ArrayBuffers.
        // eslint-disable-next-line
        // @ts-ignore
        const wordArray = CryptoJS.lib.WordArray.create(bytes);

        // Calculate the hash.
        const hash = CryptoJS.HmacMD5(wordArray, this.#_keyWordArray);  // eslint-disable-line new-cap

        // Return the result.
        const dataView = new DataView(hashResult.buffer);
        const WORD_BYTES = 4;
        hash.words.forEach((word, i) => {
            dataView.setInt32(i * WORD_BYTES, word, UDT.BIG_ENDIAN);
        });

        return true;
    }

}

export default HMACAuth;
export type { AuthMethod };
