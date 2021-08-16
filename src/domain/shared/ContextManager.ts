//
//  ContextManager.ts
//
//  Created by David Rowe on 7 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


type DependencyType = {
    name: string,
    new(...args: any[]): object  // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
};

type DependencyObject = {
    //
};

// A context, mapping class names to class instances.
type Context = Map<string, DependencyObject>;

// All the contexts.
type ContextTable = Array<Context>;


/*@devdoc
 *  The <code>ContextManager</code> namespace manages sets of related objects. Such a set forms a "context" and may be accessed
 *  globally via its context ID.
 *  <p>A context is used to manage the "global" objects particular to a domain server connection, so that the context objects
 *  can be used in the different APIs while keeping those for different domain server connections separate.</p>
 *  <p>C++: N/A</p>
 *  @namespace ContextManager
 */
const ContextManager = new class {
    // C++  N/A but similar to DependencyManager - ContextManager manages sets of dependencies.

    #_contexts: ContextTable = [];

    /*@devdoc
     *  Creates a new context.
     *  @function ContextManager.createContext
     *  @returns {number} The ID of the context created.
     */
    createContext(): number {
        // C++  N/A
        this.#_contexts.push(new Map());
        return this.#_contexts.length - 1;
    }

    /*@devdoc
     *  Gets an object from a context.
     *  @function ContextManager.get
     *  @param {number} contextID - The ID of the context.
     *  @param {class} dependencyType - The type of the object to get.
     *  @returns {object} The requested object.
     *  @throws Throws an error if the context ID is invalid or an object of the specified type cannot be found in the context.
     */
    // Errors are thrown because this is internal code and it is reasonable to expect that it is correctly used.
    get(contextID: number, dependencyType: DependencyType): DependencyObject {
        const context = this.#_contexts[contextID];
        if (!context) {
            throw Error(`ContextManager.get(): Cannot find context ${contextID}!`);
        }
        const dependencyObject = context.get(dependencyType.name);
        if (!dependencyObject) {
            throw Error(`ContextManager.get(): Cannot find object of type ${dependencyType.name}!`);
        }
        return dependencyObject;
    }

    /*@devdoc
     *  Creates and adds a new object to a context.
     *  @function ContextManager.set
     *  @param {number} contextID - The ID of the context.
     *  @param {class} dependencyType - The type of the new object to create and add. The new object is created using
     *      using <code>new()</code>.
     *  @param {...any} dependencyParams - Optional parameters to use whcn creating the new object.
     *  @throws Throws an error of the context ID is invalid or an object of the specified type already exists in the context.
     */
    // Errors are thrown because this is internal code and it is reasonable to expect that it is correctly used.
    set(contextID: number, dependencyType: DependencyType, ...args: unknown[]): void {
        const context = this.#_contexts[contextID];
        if (!context) {
            throw Error(`ContextManager.set(): Cannot find context ${contextID}!`);
        }
        if (context.get(dependencyType.name) !== undefined) {
            throw Error(`ContextManager.set(): Cannot add another object of type ${dependencyType.name}!`);
        }
        const newDependency = new dependencyType(...args);  // eslint-disable-line new-cap
        context.set(dependencyType.name, newDependency);
    }

}();

export default ContextManager;
