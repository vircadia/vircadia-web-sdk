//
//  OctreeConstants.ts
//
//  Created by Julien Merzoug on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@sdkdoc
 *  The <code>OctreeConstants</code> namespace provides constants for working with octrees.
 *  @namespace OctreeConstants
 *
 *  @property {number} DEFAULT_MAX_OCTREE_PPS - <code>600</code> Default maximum octree packets per second value.
 *      <em>Read-only.</em>
 *  @property {number} TREE_SCALE - <code>32768</code> The number of meters of the 0.0 to 1.0 voxel universe.
 *      <em>Read-only.</em>
 *  @property {number} DEFAULT_VISIBILITY_DISTANCE_FOR_UNIT_ELEMENT - <code>400</code> Maximum distance where a 1x1x1 cube is
 *  visible for 20:20 vision.
 *      <em>Read-only.</em>
 *  @property {number} DEFAULT_OCTREE_SIZE_SCALE - <code>13,107,200</code> The product of TREE_SCALE and
 *  DEFAULT_VISIBILITY_DISTANCE_FOR_UNIT_ELEMENT.
 *      <em>Read-only.</em>
 */
const OctreeConstants = new class {
    // C++  OctreeConstants

    /* eslint-disable class-methods-use-this */

    get DEFAULT_MAX_OCTREE_PPS(): number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 600;
    }

    get TREE_SCALE(): number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 32768; // ~20 miles.
    }


    get DEFAULT_VISIBILITY_DISTANCE_FOR_UNIT_ELEMENT(): number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 400.0;
    }


    get DEFAULT_OCTREE_SIZE_SCALE(): number {
        return this.TREE_SCALE * this.DEFAULT_VISIBILITY_DISTANCE_FOR_UNIT_ELEMENT;
    }


    /* eslint-enable class-methods-use-this */

}();

export default OctreeConstants;
