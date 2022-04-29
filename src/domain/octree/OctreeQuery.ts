//
//  OctreeQuery.ts
//
//  Created by Julien Merzoug on 28 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


import { EntityQueryDetails } from "../networking/packets/EntityQuery";
import ConicalViewFrustrum from "../shared/ConicalViewFrustrum";

// WEBRTC TODO: Doc.
enum OctreeQueryFlags {
    NoFlags,
    WantInitialCompletion
}


/*@devdoc
 *  The <code>OctreeQuery</code> class
 *  <p>C++: <code>class OctreeQuery : public NodeData</code></p>
 *  @class OctreeQuery
 *  @param {boolean} randomizeConnectionID - To assign, or not, a random number to the connectionID
 */
// WEBRTC TODO: Extend NodeData
class OctreeQuery {
    // C++ class OctreeQuery : public NodeData

    static readonly #DEFAULT_MAX_OCTREE_PPS = 600;
    // ~20 miles.. This is the number of meters of the 0.0 to 1.0 voxel universe
    static readonly #TREE_SCALE = 32768;
    // max distance where a 1x1x1 cube is visible for 20:20 vision
    static readonly #DEFAULT_VISIBILITY_DISTANCE_FOR_UNIT_ELEMENT = 400.0;
    // the default maximum PPS we think any octree based server should send to a client
    static readonly #DEFAULT_OCTREE_SIZE_SCALE = this.#TREE_SCALE * this.#DEFAULT_VISIBILITY_DISTANCE_FOR_UNIT_ELEMENT;

    #_connectionID = 0;
    #_conicalViews: Array<ConicalViewFrustrum> = [new ConicalViewFrustrum()];
    #_maxQueryPPS = OctreeQuery.#DEFAULT_MAX_OCTREE_PPS;
    #_octreeElementSizeScale = OctreeQuery.#DEFAULT_OCTREE_SIZE_SCALE;
    #_boundaryLevelAdjust = 0; // / used for LOD calculations
    #_jsonParameters: Record<string, unknown> = {};

    constructor(randomizeConnectionID: boolean) {
        if (randomizeConnectionID) {
            // Randomize our initial octree query connection ID
            // The connection ID is 16 bits so we take a generated value between 0 and 65535 inclusive
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.#_connectionID = Math.floor(Math.random() * (65535 + 1));
        }
    }

    /*@devdoc
     *  Fills in an EntityQueryDetails.
     *  @returns {EntityQueryDetails} An EntityQueryDetails.
     */
    getBroadcastData(): EntityQueryDetails {
        const connectionID = this.#_connectionID;

        const numFrustrums = this.#_conicalViews.length;
        const conicalViews = this.#_conicalViews;
        const maxQueryPPS = this.#_maxQueryPPS;
        const octreeElementSizeScale = this.#_octreeElementSizeScale;
        const boundaryLevelAdjust = this.#_boundaryLevelAdjust;
        const jsonParameters = this.#_jsonParameters;
        const queryFlags = OctreeQueryFlags.NoFlags;

        return {
            connectionID,
            numFrustrums,
            conicalViews,
            maxQueryPPS,
            octreeElementSizeScale,
            boundaryLevelAdjust,
            jsonParameters,
            queryFlags
        };
    }

}

export default OctreeQuery;
export type { OctreeQueryFlags };
