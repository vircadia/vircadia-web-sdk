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
 *  @property {boolean} hasViewChanged - <code>true</code> if the camera view has changed significantly since the previous
 *      {@link update} call, <code>false</code> if it hasn't.
 */
class Camera {
    // C++  class Camera : public QObject

    static readonly contextItemType = "Camera";


    // Property values.
    #_hasViewChanged = false;


    get hasViewChanged(): boolean {
        return this.#_hasViewChanged;
    }


    /*@devdoc
     *  Game loop update method that updates <code>hasViewChanged</code> ready for use by
     *  {@link AvatarMixer#update|AvatarMixer.update} and {@link EntityServer#update|EntityServer.update}.
     *  @method Camera(0).update
     */
    update(): void {

        // $$$$$$$ Update hasViewChanged.

    }

}

export default Camera;
