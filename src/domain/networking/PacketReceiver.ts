//
//  PacketReceiver.ts
//
//  Created by David Rowe on 8 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "./NLPacket";
import Node from "./Node";
import NodeList from "./NodeList";
import ReceivedMessage from "./ReceivedMessage";
import SockAddr from "./SockAddr";
import Packet from "./udt/Packet";
import { PacketTypeValue } from "./udt/PacketHeaders";
import assert from "../shared/assert";
import ContextManager from "../shared/ContextManager";


type Listener = (message: ReceivedMessage, sendingNode: Node | null) => void;

type ListenerReference = {
    listener: Listener,
    sourced: boolean,
    deliverPending: boolean  // Augment the listener reference instead of encapsulating it per C++.
};


/*@devdoc
 *  The <code>PacketReceiver</code> class maps received packets 1 : 1 with "listener" methods, and invokes the appropriate
 *  listener when called upon to do so for a received packet.
 *  <p>C++: <code>PacketReceiver : public QObject</code>
 *  @class PacketReceiver
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
class PacketReceiver {
    // C++  PacketReceiver : public QObject

    /*@devdoc
     *  A method that processes a received message of a particular type.
     *  @typedef {Slot} Listener
     *  @param {ReceivedMessage} message - The received message.
     *  @param {Node} [sendingNode] - The sending node if a sourced message, <code>undefined</code> if an unsourced message.
     */

    /*@devdoc
     *  A reference to a packet listener method along with an indication of whether the listener is for sourced messages or
     *  unsourced messages. A sourced message is one which includes the ID of the node it was sent from.
     *  @typedef {object} PacketReceiver.ListenerReference
     *  @property {PacketReceiver.Listener} listener - The listener method.
     *  @property {boolean} sourced - <code>true</code> if the listener handles sourced messages, <code>false</code> if it
     *      handles unsourced messages.
     *  @property {boolean} deliverPending - <code>true</code> if packets should be delivered to the listener as soon as they
     *      are received, <code>false</code> if packets should be accumulated into a multi-packet message and the message
     *      be delivered to the listener when complete.
     */


    /*@devdoc
     *  Creates a reference to a listener method, marking the method as being for unsourced packets.
     *  <p>Note: If the listener uses <code>this</code> then the correct <code>this</code> must be bound to it, e.g., by
     *  declaring the function as an arrow function or applying <code>.bind(this)</code> in the constructor of the class that
     *  implements the listener function.</p>
     *  <p><em>Static</em></p>
     *  @static
     *  @param {Listener} listener - The listener method that will handle a particular type of packet.
     *  @returns {PacketReceiver.ListenerReference} A reference to the listener method.
     */
    static makeUnsourcedListenerReference(listener: Listener): ListenerReference {
        // C++  ListenerReference* makeUnsourcedListenerReference(QObject*, function*(ReceivedMessage*))
        // The proper deliverPending property value is set when the listener is registered.
        return { listener, sourced: false, deliverPending: false };
    }

    /*@devdoc
     *  Creates a reference to a listener method, marking the method as being for sourced packets.
     *  <p>Note: If the listener uses <code>this</code> then the correct <code>this</code> must be bound to it, e.g., by
     *  declaring the function as an arrow function or applying <code>.bind(this)</code> in the constructor of the class that
     *  implements the listener function.</p>
     *  <p><em>Static</em></p>
     *  @static
     *  @param {Listener} listener - The listener method that will handle a particular type of packet.
     *  @returns {PacketReceiver.ListenerReference} A reference to the listener method.
     */
    static makeSourcedListenerReference(listener: Listener): ListenerReference {
        // C++  ListenerReference* makeSourcedListenerReference(QObject*, function*(ReceivedMessage*, Node*))
        return { listener, sourced: true, deliverPending: false };
    }


    #_contextID;

    #_messageListenerMap: Map<PacketTypeValue, ListenerReference | null> = new Map();    // Use null for a dummy listener.

    #_pendingMessages: Map<string, ReceivedMessage> = new Map();
    // C++  std::unordered_map<std::pair<SockAddr, udt::Packet::MessageNumber>, QSharedPointer<ReceivedMessage>>
    //      _pendingMessages;
    //      In TypeScript, the key is SockAddr.toString() + Number.toString().

    constructor(contextID: number) {
        this.#_contextID = contextID;
    }


    /*@devdoc
     *  Registers a listener function to invoke for a particular {@link PacketType(1)|PacketType}.
     *  @param {PacketType} packetType - The type of packet.
     *  @param {PacketReceiver.ListenerReference} listener - The reference to the listener function.
     *  @param {boolean} deliverPending - <code>true</code> if packets should be delivered to the listener as soon as they
     *      are received, <code>false</code> if packets should be accumulated into a multi-packet message and the message
     *      be delivered to the listener when complete.
     *  @returns {boolean} <code>true</code> if the listener was successfully registered, <code>false</code> if it wasn't.
     */
    registerListener(packetType: PacketTypeValue, listener: ListenerReference, deliverPending = false): boolean {
        // C++  bool registerListener(PacketType type, const ListenerReferencePointer& listener, bool deliverPending = false);

        // WEBRTC TODO: Address further C++ code.

        listener.deliverPending = deliverPending;

        this.#_messageListenerMap.set(packetType, listener);

        return true;

        // WEBRTC TODO: Address further C++ code.
    }


    /*@devdoc
     *  Invokes the listener registered for an {@link NLPacket} per its PacketType.
     *  @function PacketReceiver.handleVerifiedPacket
     *  @type {Slot}
     *  @param {Packet} packet - The packet. It is treated as an NLPacket.
     */
    handleVerifiedPacket = (packet: Packet): void => {
        // C++  void handleVerifiedPacket(Packet* packet);

        // WEBRTC TODO: This method is incorrectly named - it handles both verified and unverified packets?

        // WEBRTC TODO: Address further code.

        const nlPacket = NLPacket.fromBase(packet);
        const receivedMessage = new ReceivedMessage(nlPacket);
        this.#handleVerifiedMessage(receivedMessage, true);
    };

    /*@devdoc
     *  Invokes the listener registered for an {@link NLPacket} per its PacketType.
     *  @function PacketReceiver.handleVerifiedMessagePacket
     *  @type {Slot}
     *  @param {Packet} packet - The packet. It is treated as an NLPacket.
     */
    handleVerifiedMessagePacket = (packet: Packet): void => {
        // C++  void handleVerifiedMessagePacket(Packet* packet)
        const nlPacket = NLPacket.fromBase(packet);
        const messageData = nlPacket.getMessageData();
        assert(messageData.senderSockAddr !== undefined);
        const key = messageData.senderSockAddr.toString() + messageData.messageNumber.toString();
        let message = this.#_pendingMessages.get(key);

        if (message === undefined) {
            // Create message
            message = new ReceivedMessage(nlPacket);

            if (!message.getMessageData().isComplete) {
                this.#_pendingMessages.set(key, message);
            }
            this.#handleVerifiedMessage(message, true);  // Handler may handle first message packet immediately when it arrives.
        } else {
            message.appendPacket(nlPacket);

            if (message.getMessageData().isComplete) {
                this.#_pendingMessages.delete(key);
                this.#handleVerifiedMessage(message, false);
            }
        }
    };

    /*@devdoc
     *  Handles the failure to completely receive a multi-packet message.
     *  @type {Slot}
     *  @param {SockAddr} from - The address which the message was being received from.
     *  @param {number} messgeNumber - The number of the message that was being received.
     */
    handleMessageFailure = (from: SockAddr, messageNumber: number): void => {
        // C++  void handleMessageFailure(SockAddr from, MessageNumber messageNumber)
        const key = from.toString() + messageNumber.toString();
        const message = this.#_pendingMessages.get(key);
        if (message !== undefined) {
            message.setFailed();
            this.#_pendingMessages.delete(key);
        }
    };


    #handleVerifiedMessage(receivedMessage: ReceivedMessage, justReceived: boolean): void {
        // C++  void handleVerifiedMessage(ReceivedMessage* receivedMessage, bool justReceived)

        const listener = this.#_messageListenerMap.get(receivedMessage.getType());
        if (listener) {
            if (listener.deliverPending && !justReceived
                || !listener.deliverPending && !receivedMessage.getMessageData().isComplete) {
                return;
            }

            let matchingNode: Node | null = null;
            if (receivedMessage.getSourceID() !== Node.NULL_LOCAL_ID) {
                const nodeList = ContextManager.get(this.#_contextID, NodeList) as NodeList;
                matchingNode = nodeList.nodeWithLocalID(receivedMessage.getSourceID());
            }
            listener.listener(receivedMessage, matchingNode);

        } else if (listener === undefined) {
            console.error("PacketReceiver.handleVerifiedMessage() : Could not find listener for message type:",
                receivedMessage.getType());

            // Insert a dummy listener so we don't log this again.
            this.#_messageListenerMap.set(receivedMessage.getType(), null);
        }
    }

}

export default PacketReceiver;
