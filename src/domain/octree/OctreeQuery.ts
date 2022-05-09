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
import OctreeConstants from "./OctreeConstants";

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

    #_connectionID = 0;
    #_conicalViews: Array<ConicalViewFrustrum> = [new ConicalViewFrustrum()];
    #_maxQueryPPS = OctreeConstants.DEFAULT_MAX_OCTREE_PPS;
    #_octreeElementSizeScale = OctreeConstants.DEFAULT_OCTREE_SIZE_SCALE;
    #_boundaryLevelAdjust = 0; // used for LOD calculations
    #_jsonParameters: Record<string, unknown> = {};
    #_reportInitialCompletion = false;

    constructor(randomizeConnectionID: boolean) {
        if (randomizeConnectionID) {
            // Randomize our initial octree query connection ID
            // The connection ID is 16 bits so we take a generated value between 0 and 65535 inclusive
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.#_connectionID = Math.floor(Math.random() * (65535 + 1));
        }
    }

    set maxQueryPacketsPerSecond(maxQueryPPS: number) {
        this.#_maxQueryPPS = maxQueryPPS;
    }

    set octreeSizeScale(octreeSizeScale: number) {
        this.#_octreeElementSizeScale = octreeSizeScale;
    }

    set boundaryLevelAdjust(boundaryLevelAdjust: number) {
        this.#_boundaryLevelAdjust = boundaryLevelAdjust;
    }

    set reportInitialCompletion(reportInitialCompletion: boolean) {
        this.#_reportInitialCompletion = reportInitialCompletion;
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
        const queryFlags = this.#_reportInitialCompletion ? OctreeQueryFlags.WantInitialCompletion : OctreeQueryFlags.NoFlags;

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

    /*@devdoc
     *  Increment the connection's ID.
     */
    incrementConnectionID(): void {
        // C++ void incrementConnectionID()
        this.#_connectionID += 1;
    }

}

export default OctreeQuery;
export type { OctreeQueryFlags };
