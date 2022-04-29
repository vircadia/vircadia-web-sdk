//
//  ConicalViewFrustrum.ts
//
//  Created by Julien Merzoug on 28 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


import { vec3 } from "./Vec3";


/*@devdoc
 *  The <code>ConicalViewFrustrum</code> class is an approximation of a ViewFrustum for fast calculation of sort priority.
 *  <p>C++: <code>class ConicalViewFrustum</code></p>
 *  @class ConicalViewFrustrum
 *
 *  @property {vec3} position - The position of the frustrum.
 *  @property {vec3} direction - The direction of the frustrum.
 *  @property {number} angle - The angle of the frustrum.
 *  @property {number} farClip - The far clipping distance of the frustrum.
 *  @property {number} radius - The radius of the frustrum.
 */
class ConicalViewFrustrum {
    // C++ class ConicalViewFrustum


    static readonly DEFAULT_VIEW_ANGLE = 1.0;
    static readonly DEFAULT_VIEW_RADIUS = 10.0;
    static readonly DEFAULT_VIEW_FAR_CLIP = 100.0;


    #_position: vec3 = { x: 0.0, y: 0.0, z: 0.0 };
    #_direction: vec3 = { x: 0.0, y: 0.0, z: 1.0 };
    #_angle = ConicalViewFrustrum.DEFAULT_VIEW_ANGLE;
    #_farClip = ConicalViewFrustrum.DEFAULT_VIEW_FAR_CLIP;
    #_radius = ConicalViewFrustrum.DEFAULT_VIEW_RADIUS;

    // WEBRTC TODO: Address further C++ code.

    get position(): vec3 {
        return this.#_position;
    }

    get direction(): vec3 {
        return this.#_direction;
    }

    get angle(): number {
        return this.#_angle;
    }

    get farClip(): number {
        return this.#_farClip;
    }

    get radius(): number {
        return this.#_radius;
    }

    // WEBRTC TODO: Address further C++ code.
}

export default ConicalViewFrustrum;
