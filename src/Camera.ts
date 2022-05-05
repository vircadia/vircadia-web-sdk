//
//  Camera.ts
//
//  Vircadia Web SDK's Camera API.
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Camera from "./domain/shared/Camera";
import ContextManager from "./domain/shared/ContextManager";


/*@sdkdoc
 *  The <code>Camera</code> class provides the interface for managing the client's camera view that the {@link AvatarMixer} and
 *  {@link EntityServer} use.
 *  <p>Prerequisite: A {@link DomainServer} object must be created in order to set up the domain context.</p>
 *  @class Camera
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 */
class CameraAPI {
    // Named "CameraAPI" to avoid conflict with internal "Camera" class.

    constructor(contextID: number) {
        // Context
        ContextManager.set(contextID, Camera, contextID);
    }

}

export { CameraAPI as default };
