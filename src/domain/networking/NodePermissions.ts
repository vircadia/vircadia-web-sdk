//
//  NodePermissions.ts
//
//  Created by David Rowe on 11 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


type NodePermissionsValue = number;


/*@devdoc
 *  The <code>NodePermissions</code> class handles the client's permissions in the domain.
 *  @class NodePermissions
 *  @property {NodePermissionsValue} permissions - Gets and sets the permissions.
 */
class NodePermissions {

    /*@devdoc
     *  {@link NodePermissions} are represented by unsigned 4-byte numbers in the Vircadia protocol packets.
     *  @typedef {number} NodePermissionsValue
     */


    private _permissions: NodePermissionsValue = 0;


    get permissions(): NodePermissionsValue {
        // C++  Permissions permissions
        return this._permissions;
    }

    set permissions(permissions: NodePermissionsValue) {
        // C++  Permissions permissions
        this._permissions = permissions;
    }

}

export { NodePermissions as default };
export type { NodePermissionsValue };
