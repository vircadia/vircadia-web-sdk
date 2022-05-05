//
//  Camera.ts
//
//  Created by David Rowe on 5 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The <code>Camera</code> internal class manages the client's camera view for the avatar mixer and entity server assignment
 *  client code to use.
 *  @class Camera
 *  @variation 0
 *  @property {string} contextItemType="Camera" - The type name for use with the {@link ContextManager}.
 *      <p><em>Static. Read-only.</em></p>
 */
class Camera {
    // C++  class Camera : public QObject

    static readonly contextItemType = "Camera";

}

export default Camera;
