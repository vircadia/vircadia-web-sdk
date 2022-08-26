//
//  UsersInterface.ts
//
//  Created by David Rowe on 26 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeList from "../networking/NodeList";
import ContextManager from "../shared/ContextManager";
import Uuid from "../shared/Uuid";


/*@sdkdoc
 *  The <code>UsersInterface</code> namespace provides facilities for working with users in the domain. It is provided as the
 *  <code>users</code> property of the {@link DomainServer} class.
 *  @namespace UsersInterface
 *  @comment Don't document the constructor because it shouldn't be used in the SDK.
 *
 */
class UsersInterface {
    // C++  class UsersScriptingInterface : public QObject, public Dependency

    #_nodeList: NodeList;


    constructor(contextID: number) {
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
    }


    /*@sdkdoc
     *  Sets a user's gain (volume) for the audio received from them.
     *  @param {Uuid} id - The user's session ID.
     *  @param {number} gain - The gain to set, in dB.
     */
    setAvatarGain(id: Uuid, gain: number): void {
        // C++  void UsersScriptingInterface::setAvatarGain(const QUuid& nodeID, float gain)

        if (!(id instanceof Uuid)) {
            console.error("[UsersInterface] Tried to set avatar gain for invalid session ID value.");
            return;
        }
        if (typeof gain !== "number") {
            console.error("[UsersInterface] Tried to set avatar gain with invalid gain value.");
            return;
        }

        // Don't set the master gain if the session ID is NULL.
        // This differs from the C++ in order to keep UsersInterface related only to users. To set the master gain, the Audio
        // interface should be used.
        if (id.value() === Uuid.NULL) {
            console.error("[UsersInterface] Cannot set avatar gain for a null session ID.");
            return;
        }

        this.#_nodeList.setAvatarGain(id, gain);
    }

    /*@sdkdoc
     *  Gets a user's gain (volume) for the audio that's received from them.
     *  @param {Uuid} id - The user's session ID.
     *  @returns {number} The user's gain, in dB. <code>0</code> if an invalid session ID.
     */
    getAvatarGain(id: Uuid): number {
        // C++  float UsersScriptingInterface:: getAvatarGain(const QUuid& nodeID)

        if (!(id instanceof Uuid)) {
            console.error("[UsersInterface] Tried to get avatar gain for invalid session ID value.");
            return 0;
        }

        // Don't get the master gain if the session ID is NULL.
        // This differs from the C++ in order to keep UsersInterface related only to users. To get the master gain, the Audio
        // interface should be used.
        if (id.value() === Uuid.NULL) {
            console.error("[UsersInterface] Cannot get avatar gain for a null session ID.");
            return 0;
        }

        return this.#_nodeList.getAvatarGain(id);
    }
}

export default UsersInterface;
