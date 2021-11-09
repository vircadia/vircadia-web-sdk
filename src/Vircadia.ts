//
//  Vircadia.ts
//
//  Vircadia Web SDK.
//
//  Created by David Rowe on 9 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import versionInfo from "../VERSION.json";

/*@sdkdoc
 *  The <code>Vircadia</code> API provides information on the Vircadia SDK.
 *
 *  @namespace Vircadia
 *  @property {string} version - The version number of the SDK. <em>Read-only.</em>
 */
const Vircadia = new class {

    get version() {
        return versionInfo["npm-package-version"];
    }
    get verboseVersion() {
        return versionInfo["version-tag"];
    }

}();

export default Vircadia;
export { Vircadia };

export { default as DomainServer } from "./DomainServer";
export type { ConnectionState } from "./DomainServer";

export { default as AudioMixer } from "./AudioMixer";
export { default as AvatarMixer } from "./AvatarMixer";
export { default as MessageMixer } from "./MessageMixer";
export type { AssignmentClientState } from "./domain/AssignmentClient";

export { default as SignalEmitter } from "./domain/shared/SignalEmitter";
export type { Signal, Slot } from "./domain/shared/SignalEmitter";

export { default as Uuid } from "./domain/shared/Uuid";
