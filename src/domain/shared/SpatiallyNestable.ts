//
//  SpatiallyNestable.ts
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "./Uuid";


/*@devdoc
 *  The types of {@link SpatiallyNestable|spatially nestable} object.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>Entity</td><td><code>0</code></td><td>Entity.</td></tr>
 *          <tr><td>Avatar</td><td><code>1</code></td><td>Avatar.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} NestableType
 */
enum NestableType {
    Entity = 0,
    Avatar
}


/*@devdoc
 *  The <code>SpatiallyNestable</code> class enables an entity or avatar to have parent-child relationships.
 *  <p>C++: <code>SpatiallyNestable</code></p>
 *  @class SpatiallyNestable
 *  @param {NestableType} nestableType - The type of nestable item.
 *  @param {Uuid} id - The UUID of the item.
 */
class SpatiallyNestable {
    // C++  class SpatiallyNestable

    #_nestableType;
    #_id;


    constructor(nestableType: NestableType, id: Uuid) {
        // C++  SpatiallyNestable(NestableType nestableType, QUuid id)
        this.#_nestableType = nestableType;
        this.#_id = id;
    }


    /*@devdoc
     *  Gets the object's nestable type.
     *  @returns {NestableType} The type of the nestable object.
     */
    getNestableType(): NestableType {
        // C++  NestableType getNestableType()
        return this.#_nestableType;
    }

    /*@devdoc
     *  Gets the UUID of the entity or avatar.
     *  @returns {Uuid} The UUID of the entity or avatar.
     */
    getID(): Uuid {
        // C++  QUuid SpatiallyNestable::getID()
        return this.#_id;
    }

    /*@devdoc
     *  Sets the UUID of the entity or avatar and updates its children's parent ID links to it.
     *  @returns {Uuid} The UUID of the entity or avatar.
     */
    setID(id: Uuid): void {
        // C++  void SpatiallyNestable::setID(const QUuid& id) {

        // WEBRTC TODO: Address further code. - Update children's parent ID links.

        this.#_id = id;
    }

}

export default SpatiallyNestable;
export { NestableType };
