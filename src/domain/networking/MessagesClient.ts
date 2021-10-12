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
import PacketScribe from "./packets/PacketScribe";
import PacketType from "./udt/PacketHeaders";
import ContextManager from "../shared/ContextManager";


/*@devdoc
 *  The <code>MessagesClient</code> class manages sending and receiving messages via the message mixer.
 *  <p>C++: <code>MessagesClient : public QObject, public Dependency</code></p>
 *  @class MessagesClient
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
class MessagesClient {
    // C++  MessagesClient : public QObject, public Dependency

    // Context
    #_nodeList;
    #_packetReceiver;
    // The MessagesClient is not created as a context item because this has not been needed, to date.

    #_subscribedChannels: Set<string> = new Set();


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


    // Listener
    handleMessagesPacket = (/* receivedMessage: ReceivedMessage, sendingNode?: Node */): void => {
        // C++  void handleMessagesPacket(ReceivedMessage* receivedMessage, Node* senderNode)

        // WEBRTC TODO: Address further C++ code.

    };

    /*@devdoc
     *  Handles a network node being activated (network connection established). If it is a {@link MessageMixer} node then it is
     *  sent the message channels that have been subscribed to.
     *  @function MessagesClient.handleNodeActivated
     *  @param {Node} node - The node that activated.
     *  @returns {Slot}
     */
    handleNodeActivated = (node: Node): void => {
        // C++  void handleNodeActivated(SharedNodePointer node)

        if (node.getType() === NodeType.MessagesMixer) {
            for (const channel of this.#_subscribedChannels) {
                this.subscribe(channel);
            }
        }
    };

}

export default MessagesClient;
