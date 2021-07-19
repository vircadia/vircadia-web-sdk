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
import ReceivedMessage from "./ReceivedMessage";
import Packet from "./udt/Packet";
import { PacketTypeValue } from "./udt/PacketHeaders";


/*@devdoc
 *  A reference to a packet listener method along with an indication of whether the listener is for sourced messages or
 *  unsourced messages. A sourced message is one which includes the ID of the node it was sent from.
 *  @typedef {object} PacketReceiver.ListenerReference
 *  @property {Listener} listener - The listener method.
 *  @property {boolean} sourced - <code>true</code> if the listener handles sourced messages, <code>false</code> if it
 *      handles unsourced messages.
 *  @property {boolean} deliverPending - <code><true</code> if packets should be delivered to the listener as soon as they
 *      are received, <code>false</code> if packets should be accumulated into a multi-packet message and the message
 *      be delivered to the listener when complete.
 */
type ListenerReference = {
    listener: Listener,
    sourced: boolean,
    deliverPending: boolean  // Augment the listener reference instead of encapsulating it per C++.
};

/*@devdoc
 *  A method that processes a received messages of a particular type.
 *  @typedef {function} PacketReceiver.Listener
 *  @param {ReceivedMessage} The received message.
 */
type Listener = (message: ReceivedMessage) => void;


/*@devdoc
 *  Maps received packets 1 : 1 with "listener" methods, and invokes the appropriate listener when called upon to do so for a
 *  received packet.
 *  <p>C++: <code>PacketReceiver : public QObject</code>
 *  @class PacketReceiver
 */
class PacketReceiver {
    // C++  PacketReceiver : public QObject

    private _messageListenerMap: Map<PacketTypeValue, ListenerReference> = new Map();


    constructor() {
        // Set up slots.
        this.handleVerifiedPacket = this.handleVerifiedPacket.bind(this);
    }

    /*@devdoc
     *  Creates a reference to a listener method, marking the method as being for unsourced packets.
     *  <p>Note: If the listener uses <code>this</code> then the correct <code>this</code> must be bound to it, e.g., by
     *  applying <code>.bind(this)</code> on the listener when it is created.</p>
     *  <p><em>Static</em></p>
     *  @static
     *  @param {Listener} listener - The listener method that will handle a particular type of packet.
     *  @returns PacketReceiver.ListenerReference
     */
    static makeUnsourcedListenerReference(listener: Listener): ListenerReference {
        // C++  ListenerReferencePointer makeUnsourcedListenerReference(QObject*, function*)
        // The proper deliverPending property value is set when the listener is registered.
        return { listener, sourced: false, deliverPending: false };
    }

    /*@devdoc
     *  Registers a listener function to invoke for a PacketType.
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

        this._messageListenerMap.set(packetType, listener);
        return true;

        // WEBRTC TODO: Address further C++ code.
    }

    /*@devdoc
     *  Invokes the listener registered for an {@link NLPacket} per its PacketType.
     *  @param {Packet} packet - The packet. It is treated as an NLPacket.
     *  @returns {Slot}
     */
    handleVerifiedPacket(packet: Packet): void {
        // C++  void handleVerifiedPacket(Packet* packet);

        // WEBRTC TODO: This method is incorrectly named - it handles both verified and unverified packets?

        // WEBRTC TODO: Address further code.

        const nlPacket = NLPacket.fromBase(packet);
        const receivedMessage = new ReceivedMessage(nlPacket);
        this.handleVerifiedMessage(receivedMessage, true);
    }


    // eslint-disable-next-line
    // @ts-ignore
    private handleVerifiedMessage(message: ReceivedMessage, justReceived: boolean): void {  // eslint-disable-line
        // C++  void handleVerifiedMessage(ReceivedMessage* receivedMessage, bool justReceived)

        // WEBRTC TODO: This method is incorrectly named - it handles both verified and unverified packets?

        // WEBRTC TODO: Address further code.

        const messageListener = this._messageListenerMap.get(message.getType());
        if (messageListener) {

            // WEBRTC TODO: Address further code.

            messageListener.listener(message);
        } else {
            console.error("Could not find listener for message type:", message.getType());
            // WEBRTC TODO: Add string name of packet type to message.
        }

        // WEBRTC TODO: Address further code.
    }

}

export default PacketReceiver;
