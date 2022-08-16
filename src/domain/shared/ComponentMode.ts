//
//  ComponentMode.ts
//
//  Created by David Rowe on 13 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  The <code>ComponentMode</code> namespace enumerates how an effect is applied in a {@link EntityType|Zone entity}.
 *  @namespace ComponentMode
 *  @property {number} INHERIT - <code>0</code> - The effect from any enclosing zone continues into this zone.
 *  @property {number} DISABLED - <code>1</code> - The effect &mdash; from any enclosing zone and this zone &mdash;  is disabled
 *      in this zone.
 *  @property {number} ENABLED - <code>2</code> - The effect from this zone is enabled, overriding the effect from any enclosing
 *      zone.
 *  @property {number} ITEM_COUNT - <code>3</code> - The number of modes.
 */
enum ComponentMode {
    // C++  enum ComponentMode
    INHERIT,
    DISABLED,
    ENABLED,

    ITEM_COUNT
}

export default ComponentMode;
