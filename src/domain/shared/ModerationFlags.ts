//
//  ModerationFlags.ts
//
//  Created by David Rowe on 22 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

type BanFlagsValue = number;


/*@sdkdoc
 *  The <code>ModerationFlags</code> namespace provides values for different methods of kicking (banning) users from a domain.
 *  @namespace ModerationFlags
 *  @comment Don't document the constructor because it shouldn't be used in the SDK.
 *
 *  @property {ModerationFlags.BanFlags} BanFlags - Ban flag values. A {@link ModerationFlags.BanFlagsValue}  value is the sum
 *      of the relevant flag values.
 */
class ModerationFlags {
    // C++  class ModerationFlags

    /*@sdkdoc
     *  A ban value is the sum of relevant {@link ModerationFlags.BanFlags} values.
     *  @typedef {number} ModerationFlags.BanFlagsValue
     */

    /*@sdkdoc
     *  A set of flags for moderating ban actions. A {@link ModerationFlags.BanFlagsValue} value is the sum of the relevant flag
     *  values.
     *  @typedef {object} ModerationFlags.BanFlags
     *  @property {number} NO_BAN - Don't ban the user when kicking. <em>This does not currently have an effect.</em><br />
     *      <strong>Value:</strong> <code>0</code>
     *  @property {number} BAN_BY_USERNAME - Ban the person by their username.<br />
     *      <strong>Value:</strong> <code>1</code>
     *  @property {number} BAN_BY_FINGERPRINT - Ban the person by their machine fingerprint.<br />
     *      <strong>Value:</strong> <code>2</code>
     *  @property {number} BAN_BY_IP - Ban the person by their IP address.<br />
     *      <strong>Value:</strong> <code>4</code>
     */
    static readonly BanFlags = {
        NO_BAN: 0,
        BAN_BY_USERNAME: 1,
        BAN_BY_FINGERPRINT: 2,
        BAN_BY_IP: 4
    };

    /*@sdkdoc
     *  Gets the default ban methods, namely ban by username and machine fingerprint.
     *  @returns {ModerationFlags.BanFlagsValue} The default ban methods.
     */
    static getDefaultBanFlags(): number {
        return ModerationFlags.BanFlags.BAN_BY_USERNAME + ModerationFlags.BanFlags.BAN_BY_FINGERPRINT;
    }

}

export default ModerationFlags;
export type { BanFlagsValue };
