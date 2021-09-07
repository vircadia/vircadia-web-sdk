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
import Packet from "./udt/Packet";
import { PacketTypeValue } from "./udt/PacketHeaders";
import ContextManager from "../shared/ContextManager";


type Listener = (message: ReceivedMessage, sendingNode?: Node) => void;

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
     *  @typedef {function} PacketReceiver.Listener
     *  @param {ReceivedMessage} message - The received message.
     *  @param {Node} [sendingNode] - The sending node if a sourced message.
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

    #_messageListenerMap: Map<PacketTypeValue, ListenerReference> = new Map();


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
     *  @param {Packet} packet - The packet. It is treated as an NLPacket.
     *  @returns {Slot}
     */
    handleVerifiedPacket = (packet: Packet): void => {
        // C++  void handleVerifiedPacket(Packet* packet);

        // WEBRTC TODO: This method is incorrectly named - it handles both verified and unverified packets?

        // WEBRTC TODO: Address further code.

        const nlPacket = NLPacket.fromBase(packet);
        const receivedMessage = new ReceivedMessage(nlPacket);
        this.#handleVerifiedMessage(receivedMessage, true);
    };


    // eslint-disable-next-line
    // @ts-ignore
    #handleVerifiedMessage(receivedMessage: ReceivedMessage, justReceived: boolean): void {  // eslint-disable-line
        // C++  void handleVerifiedMessage(ReceivedMessage* receivedMessage, bool justReceived)

        // WEBRTC TODO: This method is incorrectly named - it handles both verified and unverified packets?

        const messageListener = this.#_messageListenerMap.get(receivedMessage.getType());
        if (messageListener) {

            // WEBRTC TODO: Address further code.

            if (messageListener.sourced) {
                let matchingNode = null;
                if (receivedMessage.getSourceID() !== Node.NULL_LOCAL_ID) {
                    const nodeList = ContextManager.get(this.#_contextID, NodeList) as NodeList;
                    matchingNode = nodeList.nodeWithLocalID(receivedMessage.getSourceID());
                }
                if (matchingNode) {
                    messageListener.listener(receivedMessage, matchingNode);
                } else {
                    console.error("Could not find node for message type:", receivedMessage.getType());
                    // WEBRTC TODO: Add string name of packet type to message.
                }
            } else {
                messageListener.listener(receivedMessage);
            }

        } else {
            console.error("Could not find listener for message type:", receivedMessage.getType());
            // WEBRTC TODO: Add string name of packet type to message.

            // WEBRTC TODO: Address further code.

        }
    }

}

export default PacketReceiver;
