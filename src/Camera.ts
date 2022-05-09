//
//  Camera.ts
//
//  Vircadia Web SDK's Camera API.
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Camera from "./domain/shared/Camera";
import ContextManager from "./domain/shared/ContextManager";
import Quat, { quat } from "./domain/shared/Quat";
import Vec3, { vec3 } from "./domain/shared/Vec3";


/*@sdkdoc
 *  The <code>Camera</code> class provides the interface for managing the client's camera view that the {@link AvatarMixer} and
 *  {@link EntityServer} use.
 *  <p>Prerequisite: A {@link DomainServer} object must be created in order to set up the domain context.</p>
 *  @class Camera
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *
 *  @property {vec3} position - The position of the camera.
 *  @property {quat} orientation - The orientation of the camera.
 *  @property {number} fieldOfView - The horizontal field of view, in radians.
 *  @property {number} aspectRatio - The aspect ratio (horizontal / vertical) of the field of view, range <code>0.01 &ndash;
 *      <code>100.0</code>.
 *  @property {number} farClip - The far clipping distance.
 *  @property {number} centerRadius - The radius of the "keyhole" sphere at the camera position. Avatars and entities within
 *      this sphere are treated as being within the camera's view.
 */
class CameraAPI {
    // Named "CameraAPI" to avoid conflict with internal "Camera" class.

    // Context.
    #_camera: Camera;  // Internal camera object.


    constructor(contextID: number) {
        // Context
        ContextManager.set(contextID, Camera);
        this.#_camera = ContextManager.get(contextID, Camera) as Camera;
    }


    get position(): vec3 {
        return this.#_camera.position;
    }

    set position(position: vec3) {
        if (!Vec3.valid(position)) {
            console.error("[Camera] Tried to set an invalid position value!", JSON.stringify(position));
            return;
        }
        this.#_camera.position = position;
    }

    get orientation(): quat {
        return this.#_camera.orientation;
    }

    set orientation(orientation: quat) {
        if (!Quat.valid(orientation)) {
            console.error("[Camera] Tried to set an invalid orientation value!", JSON.stringify(orientation));
            return;
        }
        this.#_camera.orientation = orientation;
    }

    get fieldOfView(): number {
        return this.#_camera.fieldOfView;
    }

    set fieldOfView(fieldOfView: number) {
        if (typeof fieldOfView !== "number" || fieldOfView < Camera.MIN_FIELD_OF_VIEW
                || fieldOfView > Camera.MAX_FIELD_OF_VIEW) {
            console.error("[Camera] Tried to set an invalid fieldOfView value!", JSON.stringify(fieldOfView));
            return;
        }
        this.#_camera.fieldOfView = fieldOfView;
    }


    get aspectRatio(): number {
        return this.#_camera.aspectRatio;
    }

    set aspectRatio(aspectRatio: number) {
        if (typeof aspectRatio !== "number" || aspectRatio < Camera.MIN_ASPECT_RATIO || aspectRatio > Camera.MAX_ASPECT_RATIO) {
            console.error("[Camera] Tried to set an invalid aspectRatio value!", JSON.stringify(aspectRatio));
            return;
        }
        this.#_camera.aspectRatio = aspectRatio;
    }

    get farClip(): number {
        return this.#_camera.farClip;
    }

    set farClip(farClip: number) {
        if (typeof farClip !== "number" || farClip < Camera.MIN_FAR_CLIP) {
            console.error("[Camera] Tried to set an invalid farClip value!", JSON.stringify(farClip));
            return;
        }
        this.#_camera.farClip = farClip;
    }

    get centerRadius(): number {
        return this.#_camera.centerRadius;
    }

    set centerRadius(centerRadius: number) {
        if (typeof centerRadius !== "number" || centerRadius < Camera.MIN_CENTER_RADIUS) {
            console.error("[Camera] Tried to set an invalid centerRadius value!", JSON.stringify(centerRadius));
            return;
        }
        this.#_camera.centerRadius = centerRadius;
    }


    /*@sdkdoc
     *  Game loop update method that should be called immediately prior to calling {@link AvatarMixer#update|AvatarMixer.update}
     *  and {@link EntityServer#update|EntityServer.update} in order to update the camera information ready for these methods to
     *  use.
     *  @method Camera.update
     */
    update(): void {
        this.#_camera.update();
    }

}

export { CameraAPI as default };
