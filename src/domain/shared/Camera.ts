//
//  Camera.ts
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import GLMHelpers from "./GLMHelpers";
import Quat, { quat } from "./Quat";
import Vec3, { vec3 } from "./Vec3";


type ConicalViewFrustum = {
    position: vec3,
    direction: vec3,
    halfAngle: number,
    farClip: number,
    centerRadius: number
};


/*@devdoc
 *  The internal <code>Camera</code> class manages the client's camera view for the avatar mixer and entity server assignment
 *  client code to use.
 *
 *  @class Camera
 *  @variation 0
 *
 *  @property {string} contextItemType="Camera" - The type name for use with the {@link ContextManager}.
 *      <p><em>Static. Read-only.</em></p>
 *
 *  @property {vec3} position - The position of the camera.
 *  @property {quat} orientation - The orientation of the camera.
 *  @property {number} fieldOfView - The vertical field of view, in radians.
 *  @property {number} aspectRatio - The aspect ratio (horizontal / vertical) of the field of view, range <code>0.01 &ndash;
 *      <code>100.0</code>.
 *  @property {number} farClip - The far clipping distance.
 *  @property {number} centerRadius - The radius of the "keyhole" sphere at the camera position. Avatars and entities within
 *      this sphere are treated as being within the camera's view.
 *
 *  @property {boolean} hasViewChanged - <code>true</code> if the camera view has changed significantly since the previous
 *      {@link update} call, <code>false</code> if it hasn't.
 *      <p><em>Read-only.</em></p>
 *
 *  @property {number} MIN_FIELD_OF_VIEW=0.0 - The minimum field of view, in radians.
 *  @property {number} MAX_FIELD_OF_VIEW=Math.PI - The maximum field of view, in radians.
 *  @property {number} MIN_ASPECT_RATIO=0.1 - The minimum horizontal / vertical aspect ratio.
 *  @property {number} MAX_ASPECT_RATIO=100.0 - The maximum horizontal / vertical aspect ratio.
 *  @property {number} MIN_FAR_CLIP=0.0 - The minimum far clip distance.
 *  @property {number} MIN_CENTER_RADIUS=0.0 - The minimum keyhole center radius.
 */
class Camera {
    // C++  N/A - This is quite separate to the Interface-specific Camera C++

    /*@devdoc
     *  An approximation of a view frustum where the frustum is represented by a cone that encloses the frustum. The view
     *  frustum includes a central "keyhole" sphere.
     *  @typedef {object} ConicalViewFrustum
     *  @property {vec3} position - The position of the view frustum.
     *  @property {vec3} direction - The direction of the view frustum.
     *  @property {number} halfAngle - The half angle of the conical view that encloses the view frustum, i.e, the diagonal
     *      half angle, in radians.
     *  @property {number} farClip - The distance of the far clipping plane.
     *  @property {number} centerRadius - The radius of the center keyhole sphere.
     */
    // C++'s ConicalViewFrustum and ViewFrustum classes are not used because these are targeted at C++ Interface's camera and
    // operation and are unnecessarily complex for this SDK.


    // WEBRTC TODO: Handle multiple cameras.

    static readonly contextItemType = "Camera";

    static readonly MIN_FIELD_OF_VIEW = 0;
    static readonly MAX_FIELD_OF_VIEW = Math.PI;  // 180 degrees.
    static readonly MIN_ASPECT_RATIO = 0.1;
    static readonly MAX_ASPECT_RATIO = 100.0;
    static readonly MIN_FAR_CLIP = 0.0;
    static readonly MIN_CENTER_RADIUS = 0.0;


    /* eslint-disable @typescript-eslint/no-magic-numbers */

    static readonly #_DEGREES_TO_RADIANS = Math.PI / 180.0;

    static readonly #_DEFAULT_FIELD_OF_VIEW = 45.0 * Camera.#_DEGREES_TO_RADIANS;
    static readonly #_DEFAULT_ASPECT_RATIO = 16.0 / 9.0;
    static readonly #_DEFAULT_FAR_CLIP = 16384.0;
    static readonly #_DEFAULT_CENTER_RADIUS = 3.0;

    /* eslint-enable @typescript-eslint/no-magic-numbers */


    static #isVerySimilar(frustumA: ConicalViewFrustum, frustumB: ConicalViewFrustum): boolean {
        // C++  bool ConicalViewFrustum::isVerySimilar(const ConicalViewFrustum& other)

        // WEBRTC TODO: Move into ConicalViewFrustum class.

        const MIN_POSITION_SLOP_SQUARED = 25.0; // 5 meters squared
        const MIN_ANGLE_BETWEEN = 0.174533; // radian angle between 2 vectors 10 degrees apart
        const MIN_RELATIVE_ERROR = 0.01; // 1%

        return Vec3.distance2(frustumA.position, frustumB.position) < MIN_POSITION_SLOP_SQUARED
            && Vec3.angleBetween(frustumA.direction, frustumB.direction) < MIN_ANGLE_BETWEEN
            && GLMHelpers.closeEnough(frustumA.halfAngle, frustumB.halfAngle, MIN_RELATIVE_ERROR)
            && GLMHelpers.closeEnough(frustumA.farClip, frustumB.farClip, MIN_RELATIVE_ERROR)
            && GLMHelpers.closeEnough(frustumA.centerRadius, frustumB.centerRadius, MIN_RELATIVE_ERROR);
    }


    // Property values.
    #_position = Vec3.ZERO;
    #_orientation = Quat.IDENTITY;
    #_fieldOfView = Camera.#_DEFAULT_FIELD_OF_VIEW;
    #_aspectRatio = Camera.#_DEFAULT_ASPECT_RATIO;
    #_farClip = Camera.#_DEFAULT_FAR_CLIP;
    #_centerRadius = Camera.#_DEFAULT_CENTER_RADIUS;

    #_hasViewChanged = false;

    // Derived values.
    #_conicalView: ConicalViewFrustum;  // Application::_conicalViews
    #_lastQueriedView: ConicalViewFrustum;  // Application::_lastQueriedViews


    constructor() {
        this.#_conicalView = {
            // C++  ConicalViewFrustum
            position: this.#_position,
            direction: Vec3.multiplyQbyV(this.#_orientation, GLMHelpers.IDENTITY_FORWARD),
            halfAngle: this.#calculateConicalHalfAngle(),
            farClip: this.#_farClip,
            centerRadius: this.#_centerRadius
        };
        this.#_lastQueriedView = JSON.parse(JSON.stringify(this.#_conicalView)) as ConicalViewFrustum;
    }


    get position(): vec3 {
        return this.#_position;
    }

    set position(position: vec3) {
        this.#_position = position;
        this.#_conicalView.position = Vec3.copy(position);
    }

    get orientation(): quat {
        return this.#_orientation;
    }

    set orientation(orientation: quat) {
        this.#_orientation = orientation;
        this.#_conicalView.direction = Vec3.multiplyQbyV(this.#_orientation, GLMHelpers.IDENTITY_FORWARD);
    }

    get fieldOfView(): number {
        return this.#_fieldOfView;
    }

    set fieldOfView(fieldOfView: number) {
        if (Camera.MIN_FIELD_OF_VIEW <= fieldOfView && fieldOfView <= Camera.MAX_FIELD_OF_VIEW) {
            this.#_fieldOfView = fieldOfView;
            this.#_conicalView.halfAngle = this.#calculateConicalHalfAngle();
        }
    }

    get aspectRatio(): number {
        return this.#_aspectRatio;
    }

    set aspectRatio(aspectRatio: number) {
        if (Camera.MIN_ASPECT_RATIO <= aspectRatio && aspectRatio <= Camera.MAX_ASPECT_RATIO) {
            this.#_aspectRatio = aspectRatio;
            this.#_conicalView.halfAngle = this.#calculateConicalHalfAngle();
        }
    }

    get farClip(): number {
        return this.#_farClip;
    }

    set farClip(farClip: number) {
        if (Camera.MIN_FAR_CLIP <= farClip) {
            this.#_farClip = farClip;
            this.#_conicalView.farClip = farClip;
        }
    }

    get centerRadius(): number {
        return this.#_centerRadius;
    }

    set centerRadius(centerRadius: number) {
        if (Camera.MIN_CENTER_RADIUS <= centerRadius) {
            this.#_centerRadius = centerRadius;
            this.#_conicalView.centerRadius = centerRadius;
        }
    }

    get hasViewChanged(): boolean {
        return this.#_hasViewChanged;
    }

    get conicalView(): ConicalViewFrustum {
        return this.#_conicalView;
    }


    /*@devdoc
     *  Game loop update method that updates <code>hasViewChanged</code> ready for use by
     *  {@link AvatarMixer#update|AvatarMixer.update} and {@link EntityServer#update|EntityServer.update}.
     *  @method Camera(0).update
     */
    update(): void {
        // C++  void Application::update(float deltaTime)
        this.#_hasViewChanged = !Camera.#isVerySimilar(this.#_conicalView, this.#_lastQueriedView);
        if (this.#_hasViewChanged) {
            this.#_lastQueriedView = JSON.parse(JSON.stringify(this.#_conicalView)) as ConicalViewFrustum;
        }

    }


    #calculateConicalHalfAngle(): number {
        const halfAngleDistance = Math.tan(this.#_fieldOfView / 2.0);  // Vertical frustum half distance.
        return Vec3.angleBetween({ x: 0, y: 0, z: -1 }, {
            x: halfAngleDistance,
            y: halfAngleDistance * this.#_aspectRatio,
            z: -1
        });
    }

}

export default Camera;
export type { ConicalViewFrustum };
