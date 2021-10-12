//
//  SignalEmitter.ts
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import assert from "./assert";


type Slot = (...args: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

type Signal = {
    connect: (slot: Slot) => void,
    disconnect: (slot: Slot) => void
};


/*@devdoc
 *  The <code>SignalEmitter</code> class emulates Qt's signals and slots mechanism. In particular, a <code>SignalEmitter</code>
 *  object is implemented which can be connected to one or more <code>Slot</code> functions, "emitted" to asynchronously
 *  call those functions, and disconnected.
 *  <p>C++: Qt's signals and slots mechanism.</p>
 *
 *  @class SignalEmitter
 */
class SignalEmitter {
    // C++  Qt's signals and slots mechanism.

    /*@sdkdoc
     *  A function that can be connected to a {@link Signal} or otherwise used as a callback. If the slot function uses
     *  <code>this</code> then the correct <code>this</code> must be bound to it, e.g., by declaring it using an arrow function
     *  or applying <code>.bind(this)</code> in the constructor of the class that implements the slot function.
     *  @typedef {function} Slot
     *  @param {any} ...args - Any arguments included in the <code>Signal</code> are passed through to the <code>Slot</code>
     *      function.
     */

    /*@sdkdoc
     *  Connects or disconnects a {@link Signal} to or from a function.
     *  @typedef {function} SignalConnector
     *  @param {Slot} slot - The Slot function to connect to or disconnect from.
     */

    /*@sdkdoc
     *  A Signal can be connected to, or subsequently disconnected from, a {@link Slot} function that is called when the signal
     *  is triggered.
     *  @typedef {object} Signal
     *  @property {SignalConnector} connect - Connects the signal to a {@link Slot}.
     *  @property {SignalConnector} disconnect - Disconnects the signal from a {@link Slot}.
     */


    #_slots: Set<Slot> = new Set();


    /*@devdoc
     *  Connects the signal to a <code>Slot</code> function.
     *  <p>Note: If the slot function uses <code>this</code> then the correct <code>this</code> must be bound to it, e.g., by
     *  declaring the function as an arrow function or applying <code>.bind(this)</code> in the constructor of the class that
     *  implements the slot function.</p>
     *  @param {Slot} slot - Function to be called when <code>emit</code> is called.
     */
    connect(slot: Slot): void {
        assert(typeof slot === "function");
        this.#_slots.add(slot);
    }

    /*@devdoc
     *  Disconnects the signal from a <code>Slot</code> function.
     *  @param {Slot} slot - The Slot function to no longer be called when <code>emit</code> is called.
     */
    disconnect(slot: Slot): void {
        assert(typeof slot === "function");
        this.#_slots.delete(slot);  // eslint-disable-line @typescript-eslint/dot-notation
    }

    /*@devdoc
     *  "Emits the signal": asynchronously calls all connected <code>Slot</code> functions.
     *  @param {any} [params] - Parameter values to call connected slot functions with.
     */
    emit(...params: any[]): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        this.#_slots.forEach((slot) => {
            setTimeout(slot, 0, ...params);
        });
    }

    /*@devdoc
     *  Gets the Signal API of the SignalEmitter object.
     *  @returns {Signal} The Signal API of the SignalEmitter object.
     */
    signal(): Signal {
        return {
            connect: (fn: Slot): void => {
                this.connect(fn);
            },
            disconnect: (fn: Slot): void => {
                this.disconnect(fn);
            }
        };
    }

}

export default SignalEmitter;
export type { Signal };
