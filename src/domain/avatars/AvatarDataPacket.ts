//
//  AvatarDataPacket.ts
//
//  Created by David Rowe on 5 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../shared/Uuid";


/*@devdoc
 *  The <code>IdentifyFlag</code> namespace provides avatar identity data bit flags.
 *  @namespace IdentityFlag
 *  @property {number} none=0 - No flag bits are set. <em>Read-only.</em>
 *  @property {number} isReplicated=1 - Legacy. <em>Read-only.</em>
 *  @property {number} lookAtSnapping=2 - Enables the avatar's eyes to snap to look at another avatar's eyes when the other
 *      avatar is in line of sight. <em>Read-only.</em>
 *  @property {number} verificationFailed=4 - Legacy. <em>Read-only.</em>
 */
enum IdentityFlag {
    // C++  AvatarDataPacket::IdentityFlag
    none = 0,
    isReplicated = 0x1,
    lookAtSnapping = 0x2,
    verificationFailed = 0x4
}


/*@devdoc
 *  The <code>AvatarDataPacket</code> namespace provides constants used in reading and writing {@link PacketType|AvatarData}
 *  packets.
 *  @namespace AvatarDataPacket
 *  @property {number} PACKET_HAS_AVATAR_GLOBAL_POSITION=1 - Bit flag for the packet having global position data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_AVATAR_BOUNDING_BOX=2 - Bit flag for the packet having avatar bounding box data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_AVATAR_ORIENTATION=4 - Bit flag for the packet having avatar orientation data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_AVATAR_SCALE=8 - Bit flag for the packet having avatar scale data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_LOOK_AT_POSITION=16 - Bit flag for the packet having look-at position data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_AUDIO_LOUDNESS=32 - Bit flag for the packet having audio loudness data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_SENSOR_TO_WORLD_MATRIX=64 - Bit flag for the packet having sensor-to-world matrix data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_ADDITIONAL_FLAGS=128 - Bit flag for the packet having additional flags.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_PARENT_INFO=256 - Bit flag for the packet having parent info data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_AVATAR_LOCAL_POSITION=512 - Bit flag for the packet having avatar local position data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_HAND_CONTROLLERS=1024 - Bit flag for the packet having hand controller data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_FACE_TRACKER_INFO=2048 - Bit flag for the packet having face tracker data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_JOINT_DATA=4096 - Bit flag for the packet having joint data.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_JOINT_DEFAULT_POSE_FLAGS=8192 - Bit flag for the packet having joint default pose flags.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_HAS_GRAB_JOINTS=16384 - Bit flag for the packet having grab joints data.
 *      <em>Read-only.</em>
 *  @property {number} AVATAR_HAS_FLAGS_SIZE=2 - The number of bytes used for the avatar "has" flags.
 *      <em>Read-only.</em>
 *
 *  @property {number} HEADER_SIZE=2 - The number of bytes in the AvatarData packet data header (i.e., the "has" flags).
 *      <em>Read-only.</em>
 *
 *  @property {number} MIN_BULK_PACKET_SIZE=18 - The number of bytes in the UUID plus the AvatarData packet data header.
 *      <em>Read-only.</em>
 */
const AvatarDataPacket = new class {
    // C++  namespace AvatarDataPacket

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    readonly PACKET_HAS_AVATAR_GLOBAL_POSITION = 1 << 0;
    readonly PACKET_HAS_AVATAR_BOUNDING_BOX = 1 << 1;
    readonly PACKET_HAS_AVATAR_ORIENTATION = 1 << 2;
    readonly PACKET_HAS_AVATAR_SCALE = 1 << 3;
    readonly PACKET_HAS_LOOK_AT_POSITION = 1 << 4;
    readonly PACKET_HAS_AUDIO_LOUDNESS = 1 << 5;
    readonly PACKET_HAS_SENSOR_TO_WORLD_MATRIX = 1 << 6;
    readonly PACKET_HAS_ADDITIONAL_FLAGS = 1 << 7;
    readonly PACKET_HAS_PARENT_INFO = 1 << 8;
    readonly PACKET_HAS_AVATAR_LOCAL_POSITION = 1 << 9;
    readonly PACKET_HAS_HAND_CONTROLLERS = 1 << 10;
    readonly PACKET_HAS_FACE_TRACKER_INFO = 1 << 11;
    readonly PACKET_HAS_JOINT_DATA = 1 << 12;
    readonly PACKET_HAS_JOINT_DEFAULT_POSE_FLAGS = 1 << 13;
    readonly PACKET_HAS_GRAB_JOINTS = 1 << 14;
    readonly AVATAR_HAS_FLAGS_SIZE = 2;

    // ...

    readonly HEADER_SIZE = 2;

    // ...

    readonly MIN_BULK_PACKET_SIZE = Uuid.NUM_BYTES_RFC4122_UUID + this.HEADER_SIZE;

    // ...

    /* eslint-disable @typescript-eslint/no-magic-numbers */

}();

export default AvatarDataPacket;
export { IdentityFlag };
