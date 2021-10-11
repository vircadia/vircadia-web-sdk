//
//  ConditionVariable.ts
//
//  Created by David Rowe on 6 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  The <code>ConditionVariable</code> class provides a synchronization object that waits for a notification that a condition
 *  has occurred, or times out.
 *  <p>C++: <code>std::condition_variable, std::condition_variable_any</code></p>
 *  @class ConditionVariable
 */
class ConditionVariable {
    // C++  std::condition_variable, std::condition_variable_any

    #_timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    #_promise: Promise<boolean> | null = null;
    #_resolve: ((value: boolean) => void) | null = null;


    /*@devdoc
     *  Waits for notification that a condition has occurred, with a timeout.
     *  @param {number} timeout - The timout, in milliseconds.
     *  @returns {Promise<boolean>} Resolves to <code>true</code> if notification was received, <code>false</code> if timed out.
     */
    async waitFor(timeout: number): Promise<boolean> {
        this.#_promise = new Promise((resolve) => {
            this.#_resolve = resolve;
            this.#_timeoutTimer = setTimeout(() => {
                if (this.#_resolve) {
                    this.#_resolve(false);
                }
                this.#_resolve = null;
                this.#_timeoutTimer = null;
            }, timeout);
        });
        return this.#_promise;
    }

    /*@devdoc
     *  Makes a notification that the condition being waited for has occurred.
     */
    notifyOne(): void {
        // C++  std::notify_one
        if (this.#_timeoutTimer) {
            clearTimeout(this.#_timeoutTimer);
            this.#_timeoutTimer = null;
        }
        if (this.#_resolve) {
            this.#_resolve(true);
            this.#_resolve = null;
        }
    }

}

export default ConditionVariable;
