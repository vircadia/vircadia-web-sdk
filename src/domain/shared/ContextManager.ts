//
//  ContextManager.ts
//
//  Created by David Rowe on 7 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


type DependencyType = {
    contextItemType: string,
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

    /*@devdoc
     *  In order to be added to a context, the class must include a static <code>contextItemType</code> property.
     *  <p>In theory, the <code>&lt;class&gt;.name</code> should be able to be used, however, upon minification and packaging
     *  this property can become unavailable. Hence the need for the <code>contextItemType</code> property.</p>
     *  @typedef {class} ContextManager.DependencyType
     *  @property {string} contextItemType - A static property containing the context item's type name. This should be the same
     *      as the class name.
     *      <p><em>Static.</em></p>
     */


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
     *  @param {ContextManager.DependencyType} dependencyType - The type of the object to get.
     *  @returns {object} The requested object.
     *  @throws Throws an error if the context ID or dependency type is invalid, or an object of the specified type cannot be
     *      found in the context.
     */
    // Errors are thrown because this is internal code and it is reasonable to expect that it is correctly used.
    get(contextID: number, dependencyType: DependencyType): DependencyObject {
        const context = this.#_contexts[contextID];
        if (!context) {
            throw Error(`ContextManager.get(): Cannot find context ${contextID}!`);
        }
        const contextItemType = dependencyType.contextItemType;
        if (typeof contextItemType !== "string" || contextItemType.length === 0) {
            throw Error(`ContextManager.set(): Cannot find an object without a valid contextItemType property!`);
        }
        const dependencyObject = context.get(contextItemType);
        if (!dependencyObject) {
            throw Error(`ContextManager.get(): Cannot find object of type ${contextItemType}!`);
        }
        return dependencyObject;
    }

    /*@devdoc
     *  Creates and adds a new object to a context.
     *  @function ContextManager.set
     *  @param {number} contextID - The ID of the context.
     *  @param {ContextManager.DependencyType} dependencyType - The type of the new object to create and add. The new object is
     *      created using <code>new()</code>.
     *  @param {...any} dependencyParams - Optional parameters to use when creating the new object.
     *  @throws Throws an error of the context ID or dependency type is invalid, or an object of the specified type already
     *      exists in the context.
     */
    // Errors are thrown because this is internal code and it is reasonable to expect that it is correctly used.
    set(contextID: number, dependencyType: DependencyType, ...args: unknown[]): void {
        const context = this.#_contexts[contextID];
        if (!context) {
            throw Error(`ContextManager.set(): Cannot find context ${contextID}!`);
        }
        const contextItemType = dependencyType.contextItemType;
        if (typeof contextItemType !== "string" || contextItemType.length === 0) {
            throw Error(`ContextManager.set(): Cannot add an object without a valid contextItemType property!`);
        }
        if (context.get(contextItemType) !== undefined) {
            throw Error(`ContextManager.set(): Cannot add another object of type ${contextItemType}!`);
        }
        const newDependency = new dependencyType(...args);  // eslint-disable-line new-cap
        context.set(contextItemType, newDependency);
    }

    /*@devdoc
     *  Creates and adds a new object to a context.
     *  @function ContextManager.set
     *  @param {number} contextID - The ID of the context.
     *  @param {ContextManager.DependencyType} dependencyType - The type of the new object to create and add. The new object is
     *      created using <code>new()</code>.
     *  @returns {boolean} <code>true</code> if an object of the dependency type exists in the context, <code>false</code> if it
     *      doesn't.
     *  @throws Throws an error of the context ID or dependency type is invalid.
     */
    has(contextID: number, dependencyType: DependencyType): boolean {
        const context = this.#_contexts[contextID];
        if (!context) {
            throw Error(`ContextManager.has(): Cannot find context ${contextID}!`);
        }
        const contextItemType = dependencyType.contextItemType;
        if (typeof contextItemType !== "string" || contextItemType.length === 0) {
            throw Error(`ContextManager.has(): Cannot find an object without a valid contextItemType property!`);
        }
        return context.get(contextItemType) !== undefined;
    }

}();

export default ContextManager;
