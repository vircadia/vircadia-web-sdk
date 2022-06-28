//
//  AACube.ts
//
//  Created by Julien Merzoug on 28 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { vec3 } from "../shared/Vec3";


/*@devdoc
 *  The <code>AACube</code> class provides an axis-aligned cube, defined as the bottom right near (minimum axes values) corner
 *  of the cube plus the dimension of its sides.
 *  <p>C++: <code>class AACube</code></p>
 *  @class AACube
 *  @param {vec3} corner - The coordinate vector of the bottom right near corner of the cube.
 *  @param {number} scale - The dimensions of each side of the cube.
 *
 *  @property {vec3} corner - The coordinate vector of the bottom right near corner of the cube.
 *  @property {number} scale - The dimensions of each side of the cube.
 *
 */
class AACube {
    // C++ class AACube

    #_corner: vec3;
    #_scale: number;

    constructor(corner: vec3, scale: number) {
        this.#_corner = corner;
        this.#_scale = scale;
    }

    get corner(): vec3 {
        return this.#_corner;
    }

    get scale(): number {
        return this.#_scale;
    }
}

export default AACube;
