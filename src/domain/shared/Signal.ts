//
//  Signal.ts
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import assert from "./assert";


type Slot = (...args: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any


/*@sdkdoc
 *  The <code>Signal</code> class is a utility class for creating <code>Signal</code> objects. A <code>Signal</code> object can
 *  be connected to one or more "slot" <code>Slot</code> functions and "emitted" to asynchronously call those functions.
 *
 *  @class Signal
 */
// The Signal class emulate's QT's signals and slots mechanism.
class Signal {
    // C++  Qt's signals and slots mechanism.

    /*@sdkdoc
     *  A function that can be connected to a {@link Signal} or otherwise used as a callback. If the slot function uses
     *  <code>this</code> then the correct <code>this</code> must be bound to it, e.g., by declaring it using an arrow function
     *  or applying <code>.bind(this)</code> in the constructor of the class that implements the slot function.
     *  @typedef {function} Slot
     *  @param {any} ...args - Any arguments included when calling {@link Signal|Signal.emit} are passed through to the
     *      <code>Slot</code> function.
     */


    #_slots: Set<Slot> = new Set();


    /*@sdkdoc
     *  Connects the <code>Signal</code> to a <code>Slot</code> function. A <code>Signal</code> may have more than one
     *  <code>Slot</code> function connected to it.
     *  <p>Note: If the <code>Slot</code> function uses <code>this</code> then the correct <code>this</code> must be bound to
     *  it, e.g., by declaring it with an arrow function or applying <code>.bind(this)</code> in the constructor of the
     *  class that implements it.</p>
     *  @param {function} slot - Function to be called when <code>emit</code> is called.
     */
    connect(slot: Slot): void {
        assert(typeof slot === "function");
        this.#_slots.add(slot);
    }

    /*@sdkdoc
     *  Disconnects the signal from a <code>Slot</code> function.
     *  @param {Slot} slot - The Slot function to no longer be called when <code>emit</code> is called.
     */
    disconnect(slot: Slot): void {
        assert(typeof slot === "function");
        this.#_slots.delete(slot);  // eslint-disable-line @typescript-eslint/dot-notation
    }

    /*@sdkdoc
     *  "Emits the signal": asynchronously calls all connected <code>Slot</code> functions.
     *  @param {any} [params] - Parameter values to call connected slot functions with.
     */
    emit(...params: any[]): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        this.#_slots.forEach((slot) => {
            setTimeout(slot, 0, ...params);
        });
    }

}

export default Signal;
export type { Slot };
