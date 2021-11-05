//
//  MessagesClient.ts
//
//  Created by David Rowe on 2 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Node from "./Node";
import NodeList from "./NodeList";
import NodeType from "./NodeType";
import PacketReceiver from "./PacketReceiver";
import ReceivedMessage from "./ReceivedMessage";
import PacketScribe from "./packets/PacketScribe";
import PacketType from "./udt/PacketHeaders";
import ContextManager from "../shared/ContextManager";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";


/*@devdoc
 *  The <code>MessagesClient</code> class manages sending and receiving messages via the message mixer.
 *  <p>C++: <code>MessagesClient : public QObject, public Dependency</code></p>
 *  @class MessagesClient
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @property {Signal<MessagesClient~MessageReceivedCallback>} messageReceived - Triggered when a text message is received.
 *  @property {Signal<MessagesClient~DataReceivedCallback>} dataReceived - Triggered when a data message is received.
 */
class MessagesClient {
    // C++  MessagesClient : public QObject, public Dependency

    // Context
    #_nodeList;
    #_packetReceiver;
    // The MessagesClient is not created as a context item because this has not been needed, to date.

    #_subscribedChannels: Set<string> = new Set();

    #_messageReceivedSignal = new SignalEmitter();
    #_dataReceivedSignal = new SignalEmitter();


    constructor(contextID: number) {
        // C++  MessagesClient()

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
        this.#_packetReceiver = this.#_nodeList.getPacketReceiver();

        this.#_packetReceiver.registerListener(PacketType.MessagesData,
            PacketReceiver.makeSourcedListenerReference(this.handleMessagesPacket));
        this.#_nodeList.nodeActivated.connect(this.handleNodeActivated);
    }

    /*@devdoc
     *  Sends a text message on a channel.
     *  <p>Note: The sender will also receive the message if subscribed to the channel.</p>
     *  @function MessagesClient.sendMessage
     *  @param {string} channel - The channel to send the message on.
     *  @param {string} message - The message to send.
     *  @param {boolean} [localOnly=false] - If <code>false</code> then the message is sent to all user client, client entity,
     *      server entity, and assignment client scripts in the domain.
     *      <p>If <code>true</code> then the message is sent to all user client scripts that are running in the domain
     *      context.</p>
     */
    sendMessage(channel: string, message: string, localOnly: boolean): void {
        // C++  void sendMessage(QString channel, QString message, bool localOnly)
        const senderID = this.#_nodeList.getSessionUUID();
        if (localOnly) {
            this.#_messageReceivedSignal.emit(channel, message, senderID, true);
        } else {
            const messagesMixer = this.#_nodeList.soloNodeOfType(NodeType.MessagesMixer);
            if (messagesMixer) {
                const packetList = PacketScribe.MessagesData.write({
                    channel,
                    message,
                    senderID
                });
                this.#_nodeList.sendPacketList(packetList, messagesMixer);
            } else {
                this.#_messageReceivedSignal.emit(channel, message, senderID, true);
            }
        }
    }

    /*@devdoc
     *  Sends a data message on a channel.
     *  <p>Note: The sender will also receive the message if subscribed to the channel.</p>
     *  @function MessagesClient.sendData
     *  @param {string} channel - The channel to send the data on.
     *  @param {ArrayBuffer} data - The data to send.
     *  @param {boolean} [localOnly=false] - If <code>false</code> then the data are sent to all user client, client entity,
     *      server entity, and assignment client scripts in the domain.
     *      <p>If <code>true</code> then the data are sent to all user client scripts that are running in the domain
     *      context.</p>
     */
    sendData(channel: string, data: ArrayBuffer, localOnly: boolean): void {
        // C++  void sendData(QString channel, QByteArray data, bool localOnly)
        const senderID = this.#_nodeList.getSessionUUID();
        if (localOnly) {
            this.#_dataReceivedSignal.emit(channel, data, senderID, true);
        } else {
            const messagesMixer = this.#_nodeList.soloNodeOfType(NodeType.MessagesMixer);
            if (messagesMixer) {
                const packetList = PacketScribe.MessagesData.write({
                    channel,
                    message: data,
                    senderID
                });
                this.#_nodeList.sendPacketList(packetList, messagesMixer);
            } else {
                this.#_dataReceivedSignal.emit(channel, data, senderID, true);
            }
        }
    }

    /*@devdoc
     * Subscribes the script environment to receive messages on a particular channel. The channel is sent to the message mixer.
     * @function MessagesClient.subscribe
     * @param {string} channel - The channel to subscribe to.
     */
    subscribe(channel: string): void {
        // C++  void subscribe(QString channel);

        this.#_subscribedChannels.add(channel);

        const messageMixer = this.#_nodeList.soloNodeOfType(NodeType.MessagesMixer);
        if (messageMixer) {
            const packetList = PacketScribe.MessagesSubscribe.write({
                channel
            });
            this.#_nodeList.sendPacketList(packetList, messageMixer);
        }
    }

    /*@devdoc
     * Unsubscribes the script environment from receiving messages on a particular channel. The channel is sent to the message
     * mixer.
     * @function MessagesClient.unsubscribe
     * @param {string} channel - The channel to no longer be subscribed to.
     */
    unsubscribe(channel: string): void {
        // C++  void unsubscribe(QString channel)

        this.#_subscribedChannels.delete(channel);  // eslint-disable-line @typescript-eslint/dot-notation

        const messageMixer = this.#_nodeList.soloNodeOfType(NodeType.MessagesMixer);
        if (messageMixer) {
            const packetList = PacketScribe.MessagesUnsubscribe.write({
                channel
            });
            this.#_nodeList.sendPacketList(packetList, messageMixer);
        }
    }


    /*@devdoc
     *  Processes a {@link PacketType(1)|MessagesData} message that has been received.
     *  @function MessagesClient.handleMessagesPacket
     *  @type {Slot}
     *  @param {ReceivedMessage} receivedMessage - The received {@link PacketType(1)|MessagesData} message.
     *  @param {Node} sendingNode - The sending node.
     */
    // Listener
    handleMessagesPacket = (receivedMessage: ReceivedMessage /* , sendingNode: Node | null */): void => {
        // C++  void handleMessagesPacket(ReceivedMessage* receivedMessage, Node* senderNode)

        const info = PacketScribe.MessagesData.read(receivedMessage.getMessage());
        if (typeof info.message === "string") {
            this.#_messageReceivedSignal.emit(info.channel, info.message, info.senderID, false);
        } else {
            this.#_dataReceivedSignal.emit(info.channel, info.message, info.senderID, false);
        }
    };


    /*@devdoc
     *  Handles a network node being activated (network connection established). If it is a {@link MessageMixer} node then it is
     *  sent the message channels that have been subscribed to.
     *  @function MessagesClient.handleNodeActivated
     *  @type {Slot}
     *  @param {Node} node - The node that activated.
     */
    // Slot
    handleNodeActivated = (node: Node): void => {
        // C++  void handleNodeActivated(SharedNodePointer node)

        if (node.getType() === NodeType.MessagesMixer) {
            for (const channel of this.#_subscribedChannels) {
                this.subscribe(channel);
            }
        }
    };


    /*@devdoc
     *  Called when a text message is received.
     *  @callback MessagesClient~MessageReceivedCallback
     *  @param {string} channel - The channel that the message was sent on. This can be used to filter out irrelevant messages.
     *  @param {string} message - The message received.
     *  @param {Uuid} senderID - The UUID of the sender: the user's session UUID if sent by user client or client entity script,
     *      the UUID of the entity script server if sent by a server entity script, or the UUID of the assignment client
     *      instance if sent by an assignment client script.
     *  @param {boolean} localOnly - <code>true</code> if the message was sent with localOnly == true.
     */
    get messageReceived(): Signal {
        return this.#_messageReceivedSignal.signal();
    }

    /*@devdoc
     *  Called when a data message is received.
     *  @callback MessagesClient~DataReceivedCallback
     *  @param {string} channel - The channel that the message was sent on. This can be used to filter out irrelevant messages.
     *  @param {ArrayBuffer} data - The data received.
     *  @param {Uuid} senderID - The UUID of the sender: the user's session UUID if sent by user client or client entity script,
     *      the UUID of the entity script server if sent by a server entity script, or the UUID of the assignment client
     *      instance if sent by an assignment client script.
     *  @param {boolean} localOnly - <code>true</code> if the message was sent with localOnly == true.
     */
    get dataReceived(): Signal {
        return this.#_dataReceivedSignal.signal();
    }

}

export default MessagesClient;
