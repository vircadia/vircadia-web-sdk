//
//  OctreeElement.ts
//
//  Created by David Rowe on 29 Jun 20923.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The <code>AppendState</code> namespace provides status values for appending data to a network packet.
 *  @namespace AppendState
 *  @property {number} COMPLETED=0 - All data were appended.
 *  @property {number} PARTIAL=1 - Some data were appended.
 *  @property {number} NONE=2 - No data were appended,
 */
enum AppendState {
    // C++  typedef enum { COMPLETED, PARTIAL, NONE } AppendState;
    COMPLETED,
    PARTIAL,
    NONE
}

export { AppendState };
