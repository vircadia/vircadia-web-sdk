//
//  Vec3.ts
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


type vec3 = {
    x: number,
    y: number,
    z: number
};


class Vec3 {

    /*@devdoc
     *  A 3-dimensional vector value.
     *  @typedef {object} vec3
     *  @property {number} x - X-axis value.
     *  @property {number} y - Y-axis value.
     *  @property {number} z - Z-axis value.
     */

    static ZERO = { x: 0, y: 0, z: 0 };

}

export default Vec3;
export type { vec3 };
