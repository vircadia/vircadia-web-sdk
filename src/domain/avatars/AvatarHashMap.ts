//
//  AvatarHashMap.ts
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The <code>AvatarHashMap</code> class is concerned with the avatars that the user client knows about in the domain (has been
 *  sent data on by the avatar mixer).
 *  <p>C++: <code>AvatarHashMap</code></p>
 *  @class AvatarHashMap
 */
class AvatarHashMap {
    // C++  class AvatarHashMap : public QObject, public Dependency

    static readonly #CLIENT_TO_AVATAR_MIXER_BROADCAST_FRAMES_PER_SECOND = 50;
    static readonly #MSECS_PER_SECOND = 1000;

    protected static MIN_TIME_BETWEEN_MY_AVATAR_DATA_SENDS = AvatarHashMap.#MSECS_PER_SECOND
        / AvatarHashMap.#CLIENT_TO_AVATAR_MIXER_BROADCAST_FRAMES_PER_SECOND;


}

export default AvatarHashMap;
