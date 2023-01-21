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
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Uuid from "../shared/Uuid";


/*@sdkdoc
 *  The <code>UsersInterface</code> namespace provides facilities for working with users in the domain. It is provided as the
 *  <code>users</code> property of the {@link DomainServer} class.
 *  @namespace UsersInterface
 *  @comment Don't document the constructor because it shouldn't be used in the SDK.
 *
 *  @property {boolean} canKick - <code>true</code> if the domain server allows the user to kick (ban) users, otherwise
 *      <code>false</code>.
 *      <p><em>Read-only.</em></p>
 *  @property {Signal<UsersInterface~canKickChanged>} canKickChanged - Triggered when the user's ability to kick (ban) users
 *      changes.
 *  @property {boolean} wantIgnored=false - <code>true</code> to make the audio and avatar mixers to continue sending data from
 *      ignored users or users that have ignored the client, <code>false</code> to have them not to send such data.
 *      <p>Note: The audio mixer only continues to send audio from ignored or ignoring users if the client is an admin in the
 *      domain (can kick avatars).</p>
 */
class UsersInterface {
    // C++  class UsersScriptingInterface : public QObject, public Dependency

    #_nodeList: NodeList;
    #_canKickChanged = new SignalEmitter();


    constructor(contextID: number) {
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
        this.#_nodeList.canKickChanged.connect(() => {
            this.#_canKickChanged.emit();
        });
    }


    get canKick(): boolean {
        // C++  bool UsersScriptingInterface::getCanKick()
        return this.#_nodeList.getThisNodeCanKick();
    }

    get wantIgnored(): boolean {
        // C++  bool UsersScriptingInterface::getRequestsDomainListData()
        return this.#_nodeList.getRequestsDomainListData();
    }

    set wantIgnored(wantIgnored: boolean) {
        // C++ void UsersScriptingInterface::setRequestsDomainListData(bool isRequesting)
        this.#_nodeList.setRequestsDomainListData(wantIgnored);
    }


    /*@sdkdoc
     *  Sets a user's gain (volume) for the audio received from them. Typical range: <code>-60</code>dB &ndash;
     *  <code>+20</code>dB.
     *  @param {Uuid} id - The user's session ID.
     *  @param {number} gain - The gain to set, in dB.
     */
    setAvatarGain(id: Uuid, gain: number): void {
        // C++  void UsersScriptingInterface::setAvatarGain(const QUuid& nodeID, float gain)

        if (!(id instanceof Uuid)) {
            console.error("[UsersInterface] Tried to set avatar gain for invalid user session ID value.");
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
        // C++  float UsersScriptingInterface::getAvatarGain(const QUuid& nodeID)

        if (!(id instanceof Uuid)) {
            console.error("[UsersInterface] Tried to get avatar gain for invalid user session ID value.");
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

    /*@sdkdoc
     *  Mutes or un-mutes another user. Muting makes you unable to hear them and them unable to hear you.
     *  <p>Note: You can't mute or un-mute a user you're ignoring using <code>setPersonalIgnore()</code>.</p>
     *  @param {Uuid} id - The user's session ID.
     *  @param {boolean} mute - <code>true</code> to mute, <code>false</code> to un-mute.
     */
    setPersonalMute(id: Uuid, mute: boolean): void {
        // C++  void UsersScriptingInterface::personalMute(const QUuid& nodeID, bool muteEnabled) {

        if (!(id instanceof Uuid)) {
            console.error("[UsersInterface] Tried to set personal mute for invalid user session ID value.");
            return;
        }
        if (typeof mute !== "boolean") {
            console.error("[UsersInterface] Tried to set personal mute with invalid mute value.");
            return;
        }

        this.#_nodeList.personalMuteNodeBySessionID(id, mute);
    }

    /*@sdkdoc
      *  Gets whether or not you have muted another user. Muting makes you unable to hear them and them unable to hear you.
      *  @param {Uuid} id - The user's session ID.
      *  @returns {boolean} <code>true</code> if the user is muted, <code>false</code> if they aren't.
      */
    getPersonalMute(id: Uuid): boolean {
        // C++  bool UsersScriptingInterface::getPersonalMuteStatus(const QUuid& nodeID)

        if (!(id instanceof Uuid)) {
            console.error("[UsersInterface] Tried to get personal mute for invalid user session ID value.");
            return false;
        }

        return this.#_nodeList.isPersonalMutingNode(id);
    }

    /*@sdkdoc
     *  Ignores or un-ignores another user (and mutes or un-mutes the other user). Ignoring makes you unable to see or hear them
     *  and them unable to see or hear you.
     *  @param {Uuid} id - The user's session ID.
     *  @param {boolean} mute - <code>true</code> to ignore, <code>false</code> to un-ignore.
     */
    setPersonalIgnore(id: Uuid, ignore: boolean): void {
        // C++  void UsersScriptingInterface::ignore(const QUuid& nodeID, bool ignoreEnabled)

        if (!(id instanceof Uuid)) {
            console.error("[UsersInterface] Tried to set personal ignore for invalid user session ID value.");
            return;
        }
        if (typeof ignore !== "boolean") {
            console.error("[UsersInterface] Tried to set personal ignore with invalid ignore value.");
            return;
        }

        this.#_nodeList.ignoreNodeBySessionID(id, ignore);
    }

    /*@sdkdoc
      *  Gets whether or not you are ignoring another user. Ignoring makes you unable to see or hear them and them unable to see
      *  or hear you.
      *  @param {Uuid} id - The user's session ID.
      *  @returns {boolean} <code>true</code> if the user is being ignored, <code>false</code> if they aren't.
      */
    getPersonalIgnore(id: Uuid): boolean {
        // C++  bool UsersScriptingInterface::getIgnoreStatus(const QUuid& nodeID)

        if (!(id instanceof Uuid)) {
            console.error("[UsersInterface] Tried to get personal ignore for invalid user session ID value.");
            return false;
        }

        return this.#_nodeList.isIgnoringNode(id);
    }

    /*@sdkdoc
     *  Mutes another user's microphone for everyone. The mute is not permanent: the user can unmute themselves.
     *  <p>This method only works if you're an administrator of the domain.</p>
     *  @param {Uuid} sessionID - The session ID of the user to mute.
     */
    mute(sessionID: Uuid): void {
        // C++  void UsersScriptingInterface::mute(const QUuid& nodeID);
        this.#_nodeList.muteNodeBySessionID(sessionID);
    }


    /*@sdkdoc
     *  Triggered when the user's ability to kick (ban) users changes.
     *  @callback UsersInterface~canKickChanged
     */
    get canKickChanged(): Signal {
        // C++  void AccountManager::authRequired()
        return this.#_canKickChanged.signal();
    }

}

export default UsersInterface;
