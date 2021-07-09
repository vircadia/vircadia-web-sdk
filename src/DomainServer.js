//
//  DomainServer.js
//
//  Vircadia Web SDK.
//
//  Created by David Rowe on 8 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* eslint-disable */
/*@sdkdoc
 *  The <code>DomainServer</code> API provides the interface for connecting to and interacting with a domain server.
 *
 *  @namespace DomainServer
 */
const DomainServer = new (class {
    helloWorld(message) {
        console.info("Hello", message);
    }
})();

export default DomainServer;
