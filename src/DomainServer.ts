//
//  DomainServer.ts
//
//  Vircadia Web SDK's Domain Server API.
//
//  Created by David Rowe on 8 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  The <code>DomainServer</code> API provides the interface for connecting to and interacting with a domain server.
 *
 *  @namespace DomainServer
 *  @property {boolean} isConnected - <code>true</code> if connected to the domain, <code>false</code> if not connected.
 */
const DomainServer = new (class {

    isConnected = false;

})();

export default DomainServer;
