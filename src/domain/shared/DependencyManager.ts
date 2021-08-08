//
//  DependencyManager.ts
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
 *  The <code>DependencyManager</code> namespace manages sets of unique object instances. Such a set forms a "dependency
 *  context" in which the objects jointly operate.
 *  <p>C++: <code>DependencyManager</code></p>
 *  @namespace DependencyManager
 */
const DependencyManager = new class {
    // C++  DependencyManager
    //      The TypeScript implementation of DependencyManaager supports multiple contexts whereas the C++ implementation
    //      supports just a single, global context. Hence the TypeScript implementation's use of context IDS.

    #_contexts: ContextTable = [];

    /*@devdoc
     *  Creates a new dependency context.
     *  @function DependencyManager.createContext
     *  @returns {number} The ID of the dependency context created/
     */
    createContext(): number {
        // C++  N/A
        this.#_contexts.push(new Map());
        return this.#_contexts.length - 1;
    }

    /*@devdoc
     *  Gets an object from a dependency context.
     *  @function DependencyManager.get
     *  @param {number} contextID - The ID of the dependency context.
     *  @param {class} dependencyType - The type of the object to get.
     *  @returns {object} The requested object.
     *  @throws Throws an error if the context ID is invalid or an object of the specified type cannot be found in the context.
     */
    // Errors are thrown because this is internal code and it is reasonable to expect that it is correctly used.
    get(contextID: number, dependencyType: DependencyType): DependencyObject {
        const context = this.#_contexts[contextID];
        if (!context) {
            throw Error(`DependencyManager.get(): Cannot find context ${contextID}!`);
        }
        const dependencyObject = context.get(dependencyType.name);
        if (!dependencyObject) {
            throw Error(`DependencyManager.get(): Cannot find object of type ${dependencyType.name}!`);
        }
        return dependencyObject;
    }

    /*@devdoc
     *  Creates and adds a new object to a dependency context.
     *  @function DependencyManager.set
     *  @param {number} contextID - The ID of the dependency context.
     *  @param {class} dependencyType - The type of the new object to create and add. The new object is created using
     *      using <code>new()</code>.
     *  @param {...any} dependencyParams - Optional parameters to use whcn creating the new object.
     *  @throws Throws an error of the context ID is invalid or an object of the specified type already exists in the context.
     */
    // Errors are thrown because this is internal code and it is reasonable to expect that it is correctly used.
    set(contextID: number, dependencyType: DependencyType, ...args: unknown[]): void {
        const context = this.#_contexts[contextID];
        if (!context) {
            throw Error(`DependencyManager.set(): Cannot find context ${contextID}!`);
        }
        if (context.get(dependencyType.name) !== undefined) {
            throw Error(`DependencyManager.set(): Cannot add another object of type ${dependencyType.name}!`);
        }
        const newDependency = new dependencyType(...args);  // eslint-disable-line new-cap
        context.set(dependencyType.name, newDependency);
    }

}();

export default DependencyManager;
