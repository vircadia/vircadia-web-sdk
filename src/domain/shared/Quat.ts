//
//  Quat.ts
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


type quat = {
    x: number,
    y: number,
    z: number,
    w: number
};


class Quat {

    /*@devdoc
     *  A quaternion value.
     *  @typedef {object} quat
     *  @property {number} x - X-axis rotation value.
     *  @property {number} y - Y-axis rotation value.
     *  @property {number} z - Z-axis rotation value.
     *  @property {number} w - Scalar value.
     */

    static IDENTITY = { x: 0, y: 0, z: 0, w: 1 };

}

export default Quat;
export type { quat };
