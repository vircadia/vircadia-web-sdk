//
//  PingType.ts
//
//  Created by David Rowe on 6 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  A {@link PingType(1)|ping type}, <code>Agnostic ... Symmetric</code> is the type of a network {@link Ping} packet. PingType
 *  values are represented as 8-bit numbers in protocol packets.
 *  @typedef {number} PingType
 */
const enum PingTypeValue {
    // C++  typedef quint8 PingType_t;
    Agnostic = 0,
    Local = 1,
    Public = 2,
    Symmetric = 3
}


/*@devdoc
 *  The <code>PingType</code> namespace provides the types of network {@link PacketType(1)|Ping} used in Vircadia protocol
 *  communications.
 *  <p>C++: <code>PingType</code></p>
 *
 *  @namespace PingType
 *  @variation 1
 *
 *  @property {PingType} Agnostic - <code>0</code> - Ping to local, public, or symmetric socket.
 *  @property {PingType} Local - <code>1</code> - Ping to a local socket.
 *  @property {PingType} Public - <code>2</code> - Ping to a public socket.
 *  @property {PingType} Symmetric - <code>3</code> - Ping to a symmetric socket.
 */
const PingType = new class {
    // C++  PingType

    readonly Agnostic = PingTypeValue.Agnostic;
    readonly Local = PingTypeValue.Local;
    readonly Public = PingTypeValue.Public;
    readonly Symmetric = PingTypeValue.Symmetric;

}();

export { PingType as default, PingTypeValue };
