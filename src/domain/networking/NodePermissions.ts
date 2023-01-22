//
//  NodePermissions.ts
//
//  Created by David Rowe on 11 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

type Permission = 0 | 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
type Permissions = number;


/*@devdoc
 *  The <code>NodePermissions</code> class handles a client's set of domain permissions.
 *  @class NodePermissions
 *
 *  @property {NodePermissions.Permission} Permission - Node permissions bit flag values.
 *      <p><em>Static.</em></p>
 *
 *  @property {NodePermissions.Permissions} permissions - Gets and sets the domain permissions.
 */
class NodePermissions {

    /*@devdoc
     *  A node's (client's) permissions in a domain is the sum of the applicable {@link NodePermissions.Permission} flag values.
     *  @typedef {number} NodePermissions.Permissions
     */

    /*@devdoc
     *  Node (client) permissions bit flags. A client's permissions is the sum of the applicable flag values.
     *  <p><em>Static, read-only.</em></p>
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>none</td><td>0</td><td>No permissions.</td></tr>
     *          <tr><td>canConnectToDomain</td><td>1</td><td>User can connect to the domain.</td></tr>
     *          <tr><td>canAdjustLocks</td><td>2</td><td>User change the "locked" property of an entity (either from on to off
     *              or off to on).</td></tr>
     *          <tr><td>canRezPermanentEntities</td><td>4</td><td>User can create new entities.</td></tr>
     *          <tr><td>canRezTemporaryEntities</td><td>8</td><td>User can create new entities with a finite lifetime.</td></tr>
     *          <tr><td>canWriteToAssetServer</td><td>16</td><td>User can make changes to the domain's asset-server
     *              assets.</td></tr>
     *          <tr><td>canConnectPastMaxCapacity</td><td>32</td><td>User can connect even if the domain has reached or exceeded
     *              its maximum allowed agents.</td></tr>
     *          <tr><td>canKick</td><td>64</td><td>User can kick (ban) users.</td></tr>
     *          <tr><td>canReplaceDomainContent</td><td>128</td><td>User can replace entire content sets by wiping existing
     *              domain content.</td></tr>
     *          <tr><td>canRezPermanentCertifiedEntities</td><td>256</td><td>User can create new certified entities.</td></tr>
     *          <tr><td>canRezTemporaryCertifiedEntities</td><td>512</td><td>User can create new certified entities with a
     *              finite lifetime.</td></tr>
     *          <tr><td>canGetAndSetPrivateUserData</td><td>1024</td><td>User can get and set the privateUserData entity
     *              property.</td></tr>
     *          <tr><td>canRezAvatarEntities</td><td>2048</td><td>User can use avatar entities on the domain.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} NodePermissions.Permission
     */
    static readonly Permission = {
        // C++  enum class Permission
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        none: 0 as Permission,
        canConnectToDomain: 1 as Permission,
        canAdjustLocks: 2 as Permission,
        canRezPermanentEntities: 4 as Permission,
        canRezTemporaryEntities: 8 as Permission,
        canWriteToAssetServer: 16 as Permission,
        canConnectPastMaxCapacity: 32 as Permission,
        canKick: 64 as Permission,
        canReplaceDomainContent: 128 as Permission,
        canRezPermanentCertifiedEntities: 256 as Permission,
        canRezTemporaryCertifiedEntities: 512 as Permission,
        canGetAndSetPrivateUserData: 1024 as Permission,
        canRezAvatarEntities: 2048 as Permission
        /* eslint-enable @typescript-eslint/no-magic-numbers */
    };


    #_permissions: Permissions = 0;


    get permissions(): Permissions {
        // C++  Permissions permissions
        return this.#_permissions;
    }

    set permissions(permissions: Permissions) {
        // C++  Permissions permissions
        this.#_permissions = permissions;
    }


    /*@devdoc
     *  Tests whether the domain permissions includes a particular permission.
     *  @param {NodePermissions.Permission} permission - The permission to test for.
     *  @returns {boolean} <code>true</code> if the domain permissions include the permission, <code>false</code> if they don't.
     */
    can(permission: Permission): boolean {
        // C++  bool can(Permission p) const
        return (this.#_permissions & permission) !== 0;
    }

}

export { NodePermissions as default };
export type { Permission, Permissions };
