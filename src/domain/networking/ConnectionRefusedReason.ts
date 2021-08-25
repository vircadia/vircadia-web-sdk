//
//  ConnectionRefusedReason.ts
//
//  Created by David Rowe on 3 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  <p>The reasons that a client may be refused connection to a domain.</p>
 *  <table>
 *      <thead>
 *          <tr><th>Reason</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *  <tbody>
 *      <tr><td>Unknown</td><td><code>0</code></td>
 *          <td>Some unknown reason.</td></tr>
 *      <tr><td>ProtocolMismatch</td><td><code>1</code></td>
 *          <td>The communications protocols of the domain and your client are not the same.</td></tr>
 *      <tr><td>LoginErrorMetaverse</td><td><code>2</code></td>
 *          <td>You could not be logged into the domain per your metaverse login.</td></tr>
 *      <tr><td>NotAuthorizedMetaverse</td><td><code>3</code></td>
 *          <td>You are not authorized to connect to the domain per your metaverse login.</td></tr>
 *      <tr><td>TooManyUsers</td><td><code>4</code></td>
 *          <td>The domain already has its maximum number of users.</td></tr>
 *      <tr><td>TimedOut</td><td><code>5</code></td>
 *          <td>Connecting to the domain timed out.</td></tr>
 *      <tr><td>LoginErrorDomain</td><td><code>6</code></td>
 *          <td>You could not be logged into the domain per your domain login.</td></tr>
 *      <tr><td>NotAuthorizedDomain</td><td><code>7</code></td>
 *          <td>You are not authorized to connect to the domain per your domain login.</td></tr>
 *   </tbody>
 * </table>
 * @typedef {number} ConnectionRefusedReason
 */
enum ConnectionRefusedReasonValue {
    // C++  enum class ConnectionRefusedReason : uint8_t
    Unknown,
    ProtocolMismatch,
    LoginErrorMetaverse,
    NotAuthorizedMetaverse,
    TooManyUsers,
    TimedOut,
    LoginErrorDomain,
    NotAuthorizedDomain
}

// WEBRTC TODO: Move to be a static readonly property on DomainHandler.
/*@devdoc
 *  The reasons that a client may be refused connection to a domain.
 *  @namespace ConnectionRefusedReason
 *  @variation 1
 *  @property {ConnectionRefusedReason} Unknown - <code>0</code>:
 *      Some unknown reason.
 *  @property {ConnectionRefusedReason} ProtocolMismatch - <code>1</code>:
 *      The communications protocols of the domain and your client are not the same.
 *  @property {ConnectionRefusedReason} ProtocolMismatch - <code>2</code>:
 *      You could not be logged into the domain per your metaverse login.
 *  @property {ConnectionRefusedReason} ProtocolMismatch - <code>3</code>:
 *      You are not authorized to connect to the domain per your metaverse login.
 *  @property {ConnectionRefusedReason} ProtocolMismatch - <code>4</code>:
 *      The domain already has its maximum number of users.
 *  @property {ConnectionRefusedReason} ProtocolMismatch - <code>5</code>:
 *      Connecting to the domain timed out.
 *  @property {ConnectionRefusedReason} ProtocolMismatch - <code>6</code>:
 *      You could not be logged into the domain per your domain login.
 *  @property {ConnectionRefusedReason} ProtocolMismatch - <code>7</code>:
 *      You are not authorized to connect to the domain per your domain login.
 */
const ConnectionRefusedReason = new class {
    readonly Unknown = ConnectionRefusedReasonValue.Unknown;
    readonly ProtocolMismatch = ConnectionRefusedReasonValue.ProtocolMismatch;
    readonly LoginErrorMetaverse = ConnectionRefusedReasonValue.LoginErrorMetaverse;
    readonly NotAuthorizedMetaverse = ConnectionRefusedReasonValue.NotAuthorizedMetaverse;
    readonly TooManyUsers = ConnectionRefusedReasonValue.TooManyUsers;
    readonly TimedOut = ConnectionRefusedReasonValue.TimedOut;
    readonly LoginErrorDomain = ConnectionRefusedReasonValue.LoginErrorDomain;
    readonly NotAuthorizedDomain = ConnectionRefusedReasonValue.NotAuthorizedDomain;
}();

export default ConnectionRefusedReason;
export type { ConnectionRefusedReasonValue };
