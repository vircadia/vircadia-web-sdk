//
//  EntityItem.ts
//
//  Created by David Rowe on 19 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  The <code>HostType</code> namespace enumerates how an entity is hosted and sent to others for display.
 *  <p>C++: <code>HostType</code></p>
 *  @namespace HostType
 *  @property {number} DOMAIN - <code>0</code> - Domain entities are stored on the domain, are visible to everyone, and are sent
 *      to everyone by the entity server.
 *  @property {number} AVATAR - <code>1</code> - Local entities are ephemeral — they aren't stored anywhere — and are visible
 *      only to the client. They follow the client to each domain visited, displaying at the same domain coordinates unless
 *      parented to the client's avatar. Additionally, local entities are always collisionless.
 *  @property {number} LOCAL - <code>2</code> - Avatar entities are stored on an Interface client, are visible to everyone, and
 *      are sent to everyone by the avatar mixer. They follow the client to each domain visited, displaying at the same domain
 *      coordinates unless parented to the client's avatar.
 */
enum HostType {
    // C++  enum class HostType

    DOMAIN = 0,
    AVATAR,
    LOCAL
}

export { HostType };
