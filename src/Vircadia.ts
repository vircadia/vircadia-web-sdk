//
//  Vircadia.ts
//
//  Vircadia Web SDK.
//
//  Created by David Rowe on 9 May 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import versionInfo from "../VERSION.json";

/*@sdkdoc
 *  The <code>Vircadia</code> API provides information on the Vircadia SDK.
 *
 *  @namespace Vircadia
 *  @property {string} version - The version number of the SDK. For example, <code>"2021.2.3"</code>.
 *      <em>Read-only.</em>
 *  @property {string} verboseVersion - The verbose version number of the SDK. For example,
 *      <code>"2021.2.3-20210714-ef4873bc"</code> for an SDK built on 14 Feb 2021 as at Git commit "ef4873bc".
 *      <em>Read-only.</em>
 */
const Vircadia = new class {

    // eslint-disable-next-line class-methods-use-this
    get version() {
        return versionInfo["npm-package-version"];
    }

    // eslint-disable-next-line class-methods-use-this
    get verboseVersion() {
        return versionInfo["version-tag"];
    }

}();

export default Vircadia;
export { Vircadia };

export { default as DomainServer } from "./DomainServer";
export type { ConnectionState } from "./DomainServer";

export { default as Camera } from "./Camera";

export { default as AudioMixer } from "./AudioMixer";
export type { AudioPositionGetter, AudioOrientationGetter } from "./domain/audio-client/AudioClient";
export { default as AvatarMixer, MyAvatarInterface, AvatarListInterface } from "./AvatarMixer";
export { default as EntityServer } from "./EntityServer";
export { default as MessageMixer } from "./MessageMixer";
export type { AssignmentClientState } from "./domain/AssignmentClient";

export { EntityHostType } from "./domain/entities/EntityHostType";
export { EntityType } from "./domain/entities/EntityTypes";

export { default as ModerationFlags } from "./domain/shared/ModerationFlags";
export type { BanFlagsValue } from "./domain/shared/ModerationFlags";

export { default as Quat } from "./domain/shared/Quat";
export type { quat } from "./domain/shared/Quat";

export { default as SignalEmitter } from "./domain/shared/SignalEmitter";
export type { Signal, Slot } from "./domain/shared/SignalEmitter";

export { default as Uuid } from "./domain/shared/Uuid";

export { default as Vec3 } from "./domain/shared/Vec3";
export type { vec3 } from "./domain/shared/Vec3";
