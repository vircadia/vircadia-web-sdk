//
//  Camera.ts
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Quat, { quat } from "./Quat";
import Vec3, { vec3 } from "./Vec3";


/*@devdoc
 *  The <code>Camera</code> internal class manages the client's camera view for the avatar mixer and entity server assignment
 *  client code to use.
 *
 *  @class Camera
 *  @variation 0
 *  @property {string} contextItemType="Camera" - The type name for use with the {@link ContextManager}.
 *      <p><em>Static. Read-only.</em></p>
 *
 *  @property {vec3} position - The position of the camera.
 *  @property {quat} orientation - The orientation of the camera.
 *  @property {number} fieldOfView - The horizontal field of view, in radians.
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
    // C++  class Camera : public QObject

    static readonly contextItemType = "Camera";

    static readonly MIN_FIELD_OF_VIEW = 0;
    static readonly MAX_FIELD_OF_VIEW = Math.PI;  // 180 degrees.
    static readonly MIN_ASPECT_RATIO = 0.1;
    static readonly MAX_ASPECT_RATIO = 100.0;
    static readonly MIN_FAR_CLIP = 0.0;
    static readonly MIN_CENTER_RADIUS = 0.0;


    /* eslint-disable @typescript-eslint/no-magic-numbers */

    static readonly #_DEGREES_TO_RADIANS = Math.PI / 180.0;

    static readonly #_DEFAULT_FIELD_OF_VIEW = 45 * Camera.#_DEGREES_TO_RADIANS;
    static readonly #_DEFAULT_ASPECT_RATIO = 16.0 / 9.0;
    static readonly #_DEFAULT_FAR_CLIP = 16384.0;
    static readonly #_DEFAULT_CENTER_RADIUS = 3.0;

    /* eslint-enable @typescript-eslint/no-magic-numbers */


    // Property values.
    #_position = Vec3.ZERO;
    #_orientation = Quat.IDENTITY;
    #_fieldOfView = Camera.#_DEFAULT_FIELD_OF_VIEW;
    #_aspectRatio = Camera.#_DEFAULT_ASPECT_RATIO;
    #_farClip = Camera.#_DEFAULT_FAR_CLIP;
    #_centerRadius = Camera.#_DEFAULT_CENTER_RADIUS;
    #_hasViewChanged = false;


    get position(): vec3 {
        return this.#_position;
    }

    set position(position: vec3) {
        this.#_position = position;
    }

    get orientation(): quat {
        return this.#_orientation;
    }

    set orientation(orientation: quat) {
        this.#_orientation = orientation;
    }

    get fieldOfView(): number {
        return this.#_fieldOfView;
    }

    set fieldOfView(fieldOfView: number) {
        if (Camera.MIN_FIELD_OF_VIEW <= fieldOfView && fieldOfView <= Camera.MAX_FIELD_OF_VIEW) {
            this.#_fieldOfView = fieldOfView;
        }
    }

    get aspectRatio(): number {
        return this.#_aspectRatio;
    }

    set aspectRatio(aspectRatio: number) {
        if (Camera.MIN_ASPECT_RATIO <= aspectRatio && aspectRatio <= Camera.MAX_ASPECT_RATIO) {
            this.#_aspectRatio = aspectRatio;
        }
    }

    get farClip(): number {
        return this.#_farClip;
    }

    set farClip(farClip: number) {
        if (Camera.MIN_FAR_CLIP <= farClip) {
            this.#_farClip = farClip;
        }
    }

    get centerRadius(): number {
        return this.#_centerRadius;
    }

    set centerRadius(centerRadius: number) {
        if (Camera.MIN_CENTER_RADIUS <= centerRadius) {
            this.#_centerRadius = centerRadius;
        }
    }

    get hasViewChanged(): boolean {
        return this.#_hasViewChanged;
    }


    /*@devdoc
     *  Game loop update method that updates <code>hasViewChanged</code> ready for use by
     *  {@link AvatarMixer#update|AvatarMixer.update} and {@link EntityServer#update|EntityServer.update}.
     *  @method Camera(0).update
     */
    update(): void {

        // $$$$$$$ Update hasViewChanged.

    }

}

export default Camera;
