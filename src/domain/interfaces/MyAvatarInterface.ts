//
//  MyAvatarInterface.ts
//
//  Created by David Rowe on 31 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarManager from "../AvatarManager";


/*@sdkdoc
 *  The <code>MyAvatarInterface</code> namespace provides facilities for using the user client's avatar. It is provided as the
 *  <code>myAvatar</code> property of the {@link AvatarMixer} class.
 *  @namespace MyAvatarInterface
 */
// Don't document the constructor because it shouldn't be used in the SDK.
class MyAvatarInterface {
    // C++  The user scripting interface for the MyAvatar class.

    #_avatarManager;


    constructor(contextID: number) {
        this.#_avatarManager = new AvatarManager(contextID);
    }


    /*@sdkdoc
     *  Updates the avatar mixer with the latest user client avatar data, if at least 20ms has elapsed since the last update.
     *  <p>Call this method periodically to keep the avatar mixer up to date.</p>
     */
    update(): void {
        this.#_avatarManager.updateMyAvatar();
    }

}

export default MyAvatarInterface;
