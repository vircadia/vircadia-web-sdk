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


/*@devdoc
 *  A color vector.
 *  @typedef {object} Color
 *  @property {number | undefined} red - Red component value. Integer in the range <code>0 - 255</code>.
 *  @property {number | undefined} green - Green component value. Integer in the range <code>0 - 255</code>.
 *  @property {number | undefined} blue - Blue component value. Integer in the range <code>0 - 255</code>.
 */
type Color = {
    red: number | undefined;
    green: number | undefined;
    blue: number | undefined;
};

export type { Color };
