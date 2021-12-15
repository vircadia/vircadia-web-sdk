//
//  SpatiallyNestable.ts
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Quat, { quat } from "./Quat";
import Uuid from "./Uuid";
import Vec3, { vec3 } from "./Vec3";


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

    // WEBRTC TODO: Address further C++ code - Nested transforms instead of world position and orientation.
    #_worldPosition = { x: 0, y: 0, z: 0 };
    #_worldOrientation = { x: 0, y: 0, z: 0, w: 1 };

    #_translationChanged = 0;
    #_rotationChanged = 0;


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

    /*@devdoc
     *  Gets the UUID of the entity or avatar that the entity or avatar is parented to.
     *  @returns {Uuid} The UUID of the entity or avatar that the entity or avatar is parented to. <code>Uuid.NULL</code> if not
     *      parented.
     */
    // eslint-disable-next-line class-methods-use-this
    getParentID(): Uuid {
        // C++  QUuid getParentID() {

        // WEBRTC TODO: Address further code - Parent ID.

        return new Uuid(Uuid.NULL);
    }


    /*@devdoc
     *  Gets the world position of the entity or avatar.
     *  @returns {vec3} The world position of the entity or avatar.
     */
    getWorldPosition(): vec3 {
        // C++  glm::vec3 getWorldPosition()

        // WEBRTC TODO: Address further C++ code - Nestable transforms.

        return this.#_worldPosition;
    }

    /*@devdoc
     *  Sets the world position of the entity or avatar.
     *  @param {vec3} The world position of the entity or avatar.
     */
    setWorldPosition(position: vec3): void {
        // C++  void setWorldPosition(const glm::vec3& position)

        // WEBRTC TODO: Address further C++ code - Nestable transforms.

        if (!Vec3.equal(position, this.#_worldPosition)) {
            this.#_worldPosition = position;
            this.#_translationChanged = Date.now();
        }
    }

    /*@devdoc
     *  Gets the world orientation of the entity or avatar.
     *  @returns {vec3} The world orientation of the entity or avatar.
     */
    getWorldOrientation(): quat {
        // C++  glm::vec3 getWorldPosition()

        // WEBRTC TODO: Address further C++ code - Nestable transforms.

        return this.#_worldOrientation;
    }

    /*@devdoc
     *  Sets the world orientation of the entity or avatar.
     *  @param {quaat} The world orientation of the entity or avatar.
     */
    setWorldOrientation(orientation: quat): void {
        // C++  void setWorldOrientation(const glm::quat& orientation)

        // WEBRTC TODO: Address further C++ code - Nestable transforms.

        if (!Quat.equal(orientation, this.#_worldOrientation)) {
            this.#_worldOrientation = orientation;
            this.#_rotationChanged = Date.now();
        }
    }


    /*@devdoc
     *  Sets the local position of the entity or avatar.
     *  @param {vec3} position - The local position of the entity or avatar.
     *  @param {boolean} [tellPhysics=true] - <code>true</code> if physics should be updated, <code>false</code> if it
     *      shouldn't.
     */
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setLocalPosition(position: vec3, tellPhysics = true): void {
        // C++  void setLocalPosition(const glm::vec3& position, bool tellPhysics = true)

        // WEBRTC TODO: Address further C++ code - Guard against NaN values.

        // WEBRTC TODO: Address further C++ code - Nestable transforms.

        if (!Vec3.equal(position, this.#_worldPosition)) {
            this.#_worldPosition = position;
            this.#_translationChanged = Date.now();
        }

        // WEBRTC TODO: Address further C++ code - Location changed notifications.

    }


    /*@devdoc
     *  Gets the local orientation of the entity or avatar.
     *  @returns {quat} The local orientation of the entity or avatar.
     */
    getLocalOrientation(): quat {
        // C++  glm::quat getLocalOrientation()

        // WEBRTC TODO: Address further C++ code - Nestable transforms.

        return this.#_worldOrientation;
    }

    setLocalOrientation(orientation: quat): void {
        // C++  void setLocalOrientation(const glm::quat& orientation)

        // WEBRTC TODO: Address further C++ code - Guard against NaN values.

        // WEBRTC TODO: Address further C++ code - Nestable transforms.

        if (!Quat.equal(orientation, this.#_worldOrientation)) {
            this.#_worldOrientation = orientation;
            this.#_rotationChanged = Date.now();
        }

        // WEBRTC TODO: Address further C++ code - Location changed notifications.

    }

    /*@devdoc
     *  Gets whether the entity or avatar's translation has changed since a given time.
     *  @param {number} time - The time in milliseconds elapsed since 1 Jan 1970 00:00:00 UTC.
     *  @returns {boolean} <code>true</code> if the translation has changed since the given time, <code>false</code> if it
     *      hasn't.
     */
    translationChangedSince(time: number): boolean {
        // C++  bool tranlationChangedSince(quint64 time)
        return this.#_translationChanged > time;
    }

    /*@devdoc
     *  Gets whether the entity or avatar's rotation has changed since a given time.
     *  @param {number} time - The time in milliseconds elapsed since 1 Jan 1970 00:00:00 UTC.
     *  @returns {boolean} <code>true</code> if the rotation has changed since the given time, <code>false</code> if it
     *      hasn't.
     */
    rotationChangedSince(time: number): boolean {
        // C++  bool rotationChangedSince(quint64 time)
        return this.#_rotationChanged > time;
    }

}

export default SpatiallyNestable;
export { NestableType };
