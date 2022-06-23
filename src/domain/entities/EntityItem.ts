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

/*@devdoc
 *  The types of entity items.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>Unknown<td><code>0</code></td><td>Default entity type.</td></tr>
 *          <tr><td>Model<td><code>4</code></td><td>Model entity type.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} AvatarTraits.TraitType
 */
enum EntityTypes {
    // C++ EntityTypes.EntityType_t

    Unknown,
    Model = 4
}

export { EntityTypes };
