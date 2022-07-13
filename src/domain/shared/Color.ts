//
//  Color.ts
//
//  Created by Julien Merzoug on 11 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@sdkdoc
 *  A color vector.
 *  @typedef {object} color
 *  @property {number} red - Red component value. Integer in the range <code>0 - 255</code>.
 *  @property {number} green - Green component value. Integer in the range <code>0 - 255</code>.
 *  @property {number} blue - Blue component value. Integer in the range <code>0 - 255</code>.
 */
type color = {
    red: number;
    green: number;
    blue: number;
};

export type { color };
