//
//  AvatarConstants.ts
//
//  Created by David Rowe on 9 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  The <code>AvatarConstants</code> class defines avatar constants.
 *  <p>C++: <code>AvatarConstants.h</code></p>
 *  @class AvatarConstants
 *
 *  @property {number} DEFAULT_AVATAR_HEIGHT=1.755 - The default avatar height, in meters.
 *  @property {number} MAX_AVATAR_HEIGHT= 1755.0 - The absolute maximum avatar height.
 *  @property {number} MIN_AVATAR_HEIGHT=0.008775 - The absolute minimum avatar height.
 *
 *  @property {number} MAX_AVATAR_SCALE=1000.0 - The maximum avatar scale factor that may be applied to an avatar.
 *  @property {number} MIN_AVATAR_SCALE=0.005 - The minimum avatar scale factor that may be applied to an avatar.
 */
class AvatarConstants {
    // C++  AvatarConstants.h

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    static readonly DEFAULT_AVATAR_HEIGHT = 1.755;  // meters

    static readonly MAX_AVATAR_HEIGHT = 1000.0 * AvatarConstants.DEFAULT_AVATAR_HEIGHT;
    static readonly MIN_AVATAR_HEIGHT = 0.005 * AvatarConstants.DEFAULT_AVATAR_HEIGHT;

    static readonly MAX_AVATAR_SCALE = 1000.0;
    static readonly MIN_AVATAR_SCALE = 0.005;

    /* eslint-enable @typescript-eslint/no-magic-numbers */
}

export default AvatarConstants;
