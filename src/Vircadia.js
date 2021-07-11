//
//  Vircadia.js
//
//  Vircadia Web SDK.
//
//  Created by David Rowe on 9 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  The <code>Vircadia</code> API provides information on the Vircadia SDK.
 *
 *  @namespace Vircadia
 *  @property {string} version - The version number of the SDK.
 */
const Vircadia = new (class {

    version = "0.0.1";

})();

export default Vircadia;
export { Vircadia };
export { default as DomainServer } from "./DomainServer.js";
