//
//  Avatar.ts
//
//  Created by David Rowe on 28 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarData from "../avatars/AvatarData";


/*@devdoc
 *  The <code>Avatar</code> class is concerned with the interaction of an avatar with the domain and other avatars.
 *  <p>C++: <code>class Avatar : public AvatarData, public ModelProvider, public MetaModelPayload</code></p>
 *  @class Avatar
 *  @extends AvatarData
 *  @extends SpatiallyNestable
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
class Avatar extends AvatarData {
    // C++  class Avatar : public AvatarData, public ModelProvider, public MetaModelPayload

    #_initialized = false;


    /*@devdoc
     *  Marks the avatar as having been initialized.
     */
    init(): void {
        // C++  void init()
        // No call to getHead().init() because it is an empty method.
        this.#_initialized = true;
    }

    /*@devdoc
     *  Gets whether the avatar has been initialized.
     *  @returns {boolean} <code>true</code> if the avatar has been initialized, <code>false</code> if it hasn't.
     */
    isInitialized(): boolean {
        // C++  bool isInitialized()
        return this.#_initialized;
    }


    // eslint-disable-next-line class-methods-use-this
    protected override maybeUpdateSessionDisplayNameFromTransport(sessionDisplayName: string | null): void {
        // C++  void maybeUpdateSessionDisplayNameFromTransport(const QString& sessionDisplayName)
        this._sessionDisplayName = sessionDisplayName;
        this._sessionDisplayNameChanged.emit();
        // WEBRTC TODO: Address further C++ code - sessionDisplayNameChanged signal.
    }

}

export default Avatar;
