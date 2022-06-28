//
//  EntityItem.ts
//
//  Created by Julien Merzoug on 26 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  The <code>EntityTypes</code> namespace provides types for entities.
 *  @namespace EntityTypes
 *  @property {number} Unknown=0 - Default entity type.
 *  @property {number} Model=4 - Model entity.
 */
enum EntityTypes {
    // C++ EntityTypes.EntityType_t

    Unknown,
    Model = 4
}

export { EntityTypes };
