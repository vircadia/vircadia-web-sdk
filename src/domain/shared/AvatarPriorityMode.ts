//
//  AvatarPriorityMode.ts
//
//  Created by David Rowe on 13 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  The <code>AvatarPriorityMode</code> namespace enumerates how the priority of updates from avatars other clients is applied
 *  in a {@link EntityType|Zone entity}.
 *  @namespace AvatarPriorityMode
 *  @property {number} INHERIT - <code>0</code> - The update priority from any enclosing zone continues into this zone.
 *  @property {number} CROWD - <code>1</code> - The update priority in this zone is the normal priority.
 *  @property {number} HERO - <code>2</code> - Avatars in this zone have an increased update priority.
 *  @property {number} ITEM_COUNT - <code>3</code> - The number of modes.
 */
enum AvatarPriorityMode {
    // C++  enum AvatarPriorityMode
    INHERIT,
    CROWD,
    HERO,
    ITEM_COUNT
}

export default AvatarPriorityMode;
