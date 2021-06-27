//
//  Signal.js
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  Emulates Qt's signals and slots mechanism. In particular, a <code>Signal</code> object is implemented which can be connected
 *  to one or more "slot" functions, "emitted" to asynchronously call those functions, and disconnected.
 *  <p>C++: Qt's signals and slots mechanism.</p>
 *
 *  @class Signal
 */
class Signal {

    #_slots = new Set();

    /*@devdoc
     *  Connects the signal to a "slot" function.
     *  <p>Note: If the slot function uses <code>this</code> then the correct <code>this</code> must be bound to it, e.g., by
     *  applying <code>.bind(this)</code> on the slot function when it is created.</p>
     *  @param {function} slot Function to be called when <code>emit</code> is called.
     */
    connect(slot) {
        this.#_slots.add(slot);
    }

    /*@devdoc
     *  Disconnects the signal from a "slot" function.
     *  @param {function} slot Function to no longer be called when <code>emit</code> is called.
     */
    disconnect(slot) {
        this.#_slots.delete(slot);  // eslint-disable-line dot-notation
    }

    /*@devdoc
     *  "Emits the signal": asynchronously calls all connected "slot" functions.
     *  @param {any} [params] Parameter values to call connected "slot" functions with.
     */
    emit(...params) {
        this.#_slots.forEach((slot) => {
            setTimeout(slot, 0, ...params);
        });
    }

}

export default Signal;