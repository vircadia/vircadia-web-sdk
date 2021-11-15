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

    /*@sdkdoc
     *  Gets the NPM package version for the SDK.
     *  @returns {string} A string version of the NPM package version from the `package.json` file formatted "1.3.4".
     */
    get version() {
        return versionInfo["npm-package-version"];
    }
    /*@sdkdoc
     *  Gets a version build dependent version for the SDK.
     *  <p>
     *  The build version string is created from the NPM package version, build date, and the Git commit of this particular
     *  SDK build formatted as "PackageVersion-Date-Commit".
     *  For example: "1.2.3-20220214-ef4873bc" saying SDK NPM package version "1.2.3" was built on February 14, 2022 and
     *  was checked in as commit "ef4873bc">
     *  </p>
     *  @returns {string} Build version information.
     */
    get verboseVersion() {
        return versionInfo["version-tag"];
    }

}();

export default Vircadia;
export { Vircadia };

export { default as DomainServer } from "./DomainServer";
export type { ConnectionState } from "./DomainServer";

export { default as AudioMixer } from "./AudioMixer";
export type { AudioPositionGetter } from "./domain/audio-client/AudioClient";
export { default as AvatarMixer, MyAvatarInterface, AvatarListInterface } from "./AvatarMixer";
export { default as MessageMixer } from "./MessageMixer";
export type { AssignmentClientState } from "./domain/AssignmentClient";

export { default as SignalEmitter } from "./domain/shared/SignalEmitter";
export type { Signal, Slot } from "./domain/shared/SignalEmitter";

export { default as Uuid } from "./domain/shared/Uuid";

export { default as Vec3 } from "./domain/shared/Vec3";
export type { vec3 } from "./domain/shared/Vec3";

export { default as Quat } from "./domain/shared/Quat";
export type { quat } from "./domain/shared/Quat";
