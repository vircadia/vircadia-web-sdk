//
//  MessageMixer.ts
//
//  Vircadia Web SDK's Avatar Mixer API.
//
//  Created by David Rowe on 23 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AssignmentClient from "./domain/AssignmentClient";
import MessagesClient from "./domain/networking/MessagesClient";
import NodeType from "./domain/networking/NodeType";
import SignalEmitter, { Signal } from "./domain/shared/SignalEmitter";


/*@sdkdoc
 *  The <code>MessageMixer</code> class provides the interface for working with message mixer assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created first in order to create the domain context.</p>
 *  @class MessageMixer
 *  @extends AssignmentClient
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *
 *  @property {MessageMixer.State} UNAVAILABLE - There is no message mixer available - you're not connected to a domain or the
 *      domain doesn't have a message mixer running.
 *      <em>Static. Read-only.</em>
 *  @property {MessageMixer.State} DISCONNECTED - Not connected to the message mixer.
 *      <em>Static. Read-only.</em>
 *  @property {MessageMixer.State} CONNECTED - Connected to the message mixer.
 *      <em>Static. Read-only.</em>
 *  @property {MessageMixer.State} state - The current state of the connection to the message mixer.
 *      <em>Read-only.</em>
 *  @property {MessageMixer~onStateChanged|null} onStateChanged - Sets a single function to be called when the state of the
 *      message mixer changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 *
 *  @property {Signal} messageReceived - Triggered when a text message is received.
 *  @property {Signal} dataReceived - Triggered when a data message is received.
 */
class MessageMixer extends AssignmentClient {
    // C++  Application.cpp

    // Base class developer documentation is copied here and updated for the SDK documentation.

    /*@sdkdoc
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>UNAVAILABLE</td><td><code>0</code></td><td>There is no message mixer available - you're not connected to
     *              a domain or the domain doesn't have a message mixer running.</td></tr>
     *          <tr><td>DISCONNECTED</td><td><code>1</code></td><td>Not connected to the message mixer.</td></tr>
     *          <tr><td>CONNECTED</td><td><code>2</code></td><td>Connected to the message mixer.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} MessageMixer.State
     */

    /*@sdkdoc
     *  Called when the state of the message mixer changes.
     *  @callback MessageMixer~onStateChanged
     *  @param {MessageMixer.State} state - The state of the message mixer.
     */

    /*@sdkdoc
     *  Gets the string representing a message mixer state.
     *  <p><em>Static</em></p>
     *  @function MessageMixer.stateToString
     *  @param {MessageMixer.State} state - The state to get the string representation of.
     *  @returns {string} The string representing the message mixer state if a valid state, <code>""</code> if not a valid
     *      state.
     */


    #_messageReceivedSignal = new SignalEmitter();
    #_dataReceivedSignal = new SignalEmitter();

    #_messagesClient;


    constructor(contextID: number) {
        super(contextID, NodeType.MessagesMixer);

        this.#_messagesClient = new MessagesClient(contextID);
    }


    get messageReceived(): Signal {
        return this.#_messageReceivedSignal.signal();
    }

    get dataReceived(): Signal {
        return this.#_dataReceivedSignal.signal();
    }


    /*@sdkdoc
     * Subscribes the script environment to receive messages on a particular channel.
     * @function MessageMixer.subscribe
     * @param {string} channel - The channel to subscribe to.
     */
    subscribe(channel: string): void {
        if (typeof channel !== "string" || channel.length === 0) {
            console.error("[MessageMixer] subscribe() called with invalid channel value!");
            return;
        }

        this.#_messagesClient.subscribe(channel);
    }

    /*@sdkdoc
     * Unsubscribes the script environment from receiving messages on a particular channel.
     * @function MessageMixer.unsubscribe
     * @param {string} channel - The channel to no longer subscribe to.
     */
    unsubscribe(channel: string): void {
        if (typeof channel !== "string" || channel.length === 0) {
            console.error("[MessageMixer] unsubscribe() called with invalid channel value!");
            return;
        }

        this.#_messagesClient.unsubscribe(channel);
    }

    /*@sdkdoc
     * Sends a text message on a channel.
     * <p>Note: The sender will also receive the message if subscribed to the channel.</p>
     * @function MessageMixer.sendMessage
     * @param {string} channel - The channel to send the message on.
     * @param {string} message - The message to send.
     * @param {boolean} [localOnly=false] - If <code>false</code> then the message is sent to all user client, client entity,
     *     server entity, and assignment client scripts in the domain.
     *     <p>If <code>true</code> then the message is sent to all user client scripts that are using the MessageMixer's domain
     *     context. <em>Not implemented yet.</em></p>
     */
    // eslint-disable-next-line
    // @ts-ignore
    sendMessage(channel: string, message: string, localOnly = false): void {  // eslint-disable-line

        // WEBRTC TODO

    }

    /*@sdkdoc
     * Sends a data message on a channel.
     * <p>Note: The sender will also receive the message if subscribed to the channel.</p>
     * @function MessageMixer.sendData
     * @param {string} channel - The channel to send the data on.
     * @param {ArrayBuffer} data - The data to send.
     * @param {boolean} [localOnly=false] - If <code>false</code> then the data are sent to all user client, client entity,
     *     server entity, and assignment client scripts in the domain.
     *     <p>If <code>true</code> then the data are sent to all user client scripts and client entity scripts that are using
     *     the MessageMixer's domain context. <em>Not implemented yet.</em></p>
     */
    // eslint-disable-next-line
    // @ts-ignore
    sendData(channel: string, data: ArrayBuffer, localOnly = false): void {  // eslint-disable-line

        // WEBRTC TODO

    }

}

export default MessageMixer;
