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
import { ConicalViewFrustum } from "../shared/Camera";
import OctreeConstants from "./OctreeConstants";

/*@devdoc
 *  The <code>OctreeQueryFlags</code> namespace provides flags modifying an octree query.
 *  @namespace OctreeQueryFlags
 *  @property {number} NoFlags=0 - No flag. <em>Read-only.</em>
 *  @property {number} WantInitialCompletion=1 - Notify that the initial query is complete. <em>Read-only.</em>
 *
 */
enum OctreeQueryFlags {
    // C++ OctreeQueryFlags : uint16_t
    NoFlags,
    WantInitialCompletion
}


/*@devdoc
 *  The <code>OctreeQuery</code> class
 *  <p>C++: <code>class OctreeQuery : public NodeData</code></p>
 *  @class OctreeQuery
 *  @param {boolean} randomizeConnectionID - <code>true</code> to use a random number for the initial connection ID,
 *  <code>false</code> to start at <code>0</code>.
 */
class OctreeQuery {
    // C++ class OctreeQuery : public NodeData

    #_connectionID = 0;
    #_conicalViews: Array<ConicalViewFrustum> = [];
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


    /*@devdoc
     *  Sets the maximum number of query packets per second.
     *  @param {number} maxQueryPPS - The maximum number of query packets per second.
     */
    setMaxQueryPacketsPerSecond(maxQueryPPS: number): void {
        // C++ void setMaxQueryPacketsPerSecond(int maxQueryPPS)
        this.#_maxQueryPPS = maxQueryPPS;
    }

    /*@devdoc
     *  Sets the size scale of the octree elements.
     *  @param {number} octreeSizeScale - The size scale of the octree elements.
     */
    setOctreeSizeScale(octreeSizeScale: number): void {
        // C++ void setOctreeSizeScale(float octreeSizeScale)
        this.#_octreeElementSizeScale = octreeSizeScale;
    }

    /*@devdoc
     *  Sets the boundary level adjust factor.
     *  @param {number} boundaryLevelAdjust - The boundary level adjust factor.
     */
    setBoundaryLevelAdjust(boundaryLevelAdjust: number): void {
        // C++ void setBoundaryLevelAdjust(int boundaryLevelAdjust)
        this.#_boundaryLevelAdjust = boundaryLevelAdjust;
    }

    /*@devdoc
     *  Sets the report initial completion flag.
     *  @param {boolean} reportInitialCompletion - The report initial completion flag.
     */
    setReportInitialCompletion(reportInitialCompletion: boolean): void {
        // C++ void setReportInitialCompletion(bool reportInitialCompletion)
        this.#_reportInitialCompletion = reportInitialCompletion;
    }

    /*@devdoc
     *  Sets the array of conical frustums.
     *  @param {Array<ConicalViewFrustum>} views - An array of conical frustums.
     */
    setConicalViews(views: Array<ConicalViewFrustum>): void {
        // C++ void setConicalViews(ConicalViewFrustums views)
        this.#_conicalViews = views;
    }

    /*@devdoc
     *  Gets entity query details.
     *  @returns {EntityQueryDetails} The information needed for writing an {@link PacketType(1)|EntityQuery} packet.
     */
    getBroadcastData(): EntityQueryDetails {
        // C++ int getBroadcastData(unsigned char* destinationBuffer);
        const connectionID = this.#_connectionID;

        const conicalViews = this.#_conicalViews;
        const maxQueryPPS = this.#_maxQueryPPS;
        const octreeElementSizeScale = this.#_octreeElementSizeScale;
        const boundaryLevelAdjust = this.#_boundaryLevelAdjust;
        const jsonParameters = this.#_jsonParameters;
        const queryFlags = this.#_reportInitialCompletion ? OctreeQueryFlags.WantInitialCompletion : OctreeQueryFlags.NoFlags;

        return {
            connectionID,
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
