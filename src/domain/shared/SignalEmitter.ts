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


/*@sdkdoc
 *  The <code>SignalEmitter</code> class provides a signals and slots mechanism. A <code>SignalEmitter</code> object can be
 *  connected to one or more "slot" functions and "emitted" to asynchronously call ("trigger") those functions.
 *
 *  @class SignalEmitter
 */
// The Signal class emulate's QT's signals and slots mechanism.
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


    /*@sdkdoc
     *  Connects the signal to a {@link Slot} function.
     *  <p>Note: If the slot function uses <code>this</code> then the correct <code>this</code> must be bound to it, e.g., by
     *  declaring the function as an arrow function or applying <code>.bind(this)</code> in the constructor of the class that
     *  implements the slot function.</p>
     *  @param {Slot} slot - The function to be called when the signal is emitted.
     */
    connect(slot: Slot): void {
        assert(typeof slot === "function");
        this.#_slots.add(slot);
    }

    /*@sdkdoc
     *  Disconnects the signal from a {@link Slot} function.
     *  @param {Slot} slot - The function to no longer be called when the signal is emitted.
     */
    disconnect(slot: Slot): void {
        assert(typeof slot === "function");
        this.#_slots.delete(slot);  // eslint-disable-line @typescript-eslint/dot-notation
    }

    /*@sdkdoc
     *  "Emits the signal": asynchronously calls all connected {@link Slot} functions.
     *  @param {any} [params] - Parameter values to call connected slot functions with.
     */
    emit(...params: any[]): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        this.#_slots.forEach((slot) => {
            setTimeout(slot, 0, ...params);
        });
    }

    /*@sdkdoc
     *  Gets the {@link Signal} API of the SignalEmitter object. This can be used when exposing the signal in an API.
     *  @returns {Signal} The Signal API of the <code>SignalEmitter</code> object.
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
export type { Signal, Slot };
