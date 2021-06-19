//
//  DomainConnectRequest.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders.js";
import UDT from "../udt/UDT.js";
import NLPacket from "../NLPacket.js";


const DomainConnectRequest = new (class {
    // C++  NodeList::sendDomainServerCheckIn()

    /*@devdoc
     *  Writes a {@link PacketType(1)|DomainConnectRequest} packet, ready for sending.
     *  @function PacketData.DomainConnectRequest&period;write
     *  @param {PacketData.DomainConnectRequestData} info - The information needed for writing the packet.
     *  @returns {NLPacket}
     */
    /*@devdoc
     *  Information needed for {@link Packets|writing} a  {@link PacketType(1)|DomainConnectRequest} packet.
     *  @typedef {object} PacketData.DomainConnectRequestData
     *  @property {Uuid} connectUUID - If ICE was used to discover the domain server, the ICE client's UUID, otherwise
     *      <code>Uuid.NULL</code>. (For Web Interface, use <code>Uuid.NULL</code>.)
     *  @property {Uint8Array} protocolVersionSig - The protocol version signature from {@link protocolVersionsSignature}.
     *  @property {string} hardwareAddress - The client's MAC address if possible, otherwise <code>""</code>.
     *  @property {Uuid} machineFingerprint - The machine fingerprint from {@link FingerprintUtils}.
     *  @property {Uint8Array} compressedSystemInfo - Compressed information about the machine from {@link Platform} if it
     *     won't cause the packet to overflow, otherwise an empty value.
     *  @property {LimitedNodeList.ConnectReason} connectReason - The reason for sending this DomainConnectRequest.
     *  @property {BigInt} previousConnectionUptime - How long Interface was previously connected to the domain, in usec.
     *      <code>0</code> if not previously connected.
     *  @property {BigInt} currentTime - The current Unix time, in usec.
     *  @property {NodeType} ownerType - The type of this node, i.e., <code>NodeType.Agent</code> for Interface.
     *  @property {HifiSockAddr} publicSockAddr - The Interface client's public address.
     *  @property {HifiSockAddr} localSockAddr: The Interface client's local address.
     *  @property {Set<NodeType>} nodeTypesOfInterest - The types of domain server nodes that the Interface client wants to
     *      use.
     *  @property {string} placeName - The domain's place name from {@link AddressManager}.
     *  @property {boolean} isDomainConnected - <code>true</code> if currently connected to the domain, <code>false</code> if
     *      not connected.
     *  @property {string} [username] - If not connected, the user's metaverse user name.
     *  @property {ArrayBuffer} [usernameSignature] - If not connected then the login signature of the domain requires login
     *      and the signature is known, otherwise an empty value.
     *  @property {string} [domainUsername] - If not connected and the domain has its own login, the domain login user name.
     *  @property {string} [domainTokens] - If not connected and the domain has its own login, the domain login OAuth2 token(s)
     *      as <code>&lt;access-token&gt;:&lt;refresh-toklen&gt;</code>.
     */
    write(info) {  /* eslint-disable-line class-methods-use-this */
        const packet = NLPacket.create(PacketType.DomainConnectRequest);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        // WEBRTC TODO: Address further C++ code.

        /* eslint-disable no-magic-numbers */

        // WebRTC-connected domain handler doesn't use ICE so ignore ICE client ID code.
        data.setBigUint128(dataPosition, info.connectUUID, UDT.BIG_ENDIAN);
        dataPosition += 16;

        data.setUint32(dataPosition, info.protocolVersionSig.byteLength, UDT.BIG_ENDIAN);
        dataPosition += 4;
        for (let i = 0; i < info.protocolVersionSig.byteLength; i++) {
            data.setUint8(dataPosition + i, info.protocolVersionSig[i]);
        }
        dataPosition += info.protocolVersionSig.byteLength;

        data.setUint32(dataPosition, info.hardwareAddress.length, UDT.BIG_ENDIAN);
        dataPosition += 4;
        for (let i = 0; i < info.hardwareAddress.length; i++) {
            data.setUint16(dataPosition, info.hardwareAddress[i], UDT.BIG_ENDIAN);
            dataPosition += 2;
        }

        data.setBigUint128(dataPosition, info.machineFingerprint, UDT.BIG_ENDIAN);
        dataPosition += 16;

        data.setUint32(dataPosition, info.compressedSystemInfo.byteLength, UDT.BIG_ENDIAN);
        dataPosition += 4;
        for (let i = 0; i < info.compressedSystemInfo.byteLength; i++) {
            data.setUint8(dataPosition, info.compressedSystemInfo.getUint8(i));
            dataPosition += 1;
        }

        data.setUint32(dataPosition, info.connectReason, UDT.BIG_ENDIAN);
        dataPosition += 4;

        data.setBigUint64(dataPosition, info.previousConnectionUptime, UDT.BIG_ENDIAN);
        dataPosition += 8;

        data.setBigUint64(dataPosition, info.currentTime, UDT.BIG_ENDIAN);
        dataPosition += 8;

        data.setUint8(dataPosition, info.ownerType.charCodeAt(0));
        dataPosition += 1;

        data.setUint8(dataPosition, 0);  // IP4
        dataPosition += 1;
        data.setUint32(dataPosition, info.publicSockAddr.getAddress(), UDT.BIG_ENDIAN);
        dataPosition += 4;
        data.setUint16(dataPosition, info.publicSockAddr.getPort(), UDT.BIG_ENDIAN);
        dataPosition += 2;

        data.setUint8(dataPosition, 0);  // IP$
        dataPosition += 1;
        data.setUint32(dataPosition, info.localSockAddr.getAddress(), UDT.BIG_ENDIAN);
        dataPosition += 4;
        data.setUint16(dataPosition, info.localSockAddr.getPort(), UDT.BIG_ENDIAN);
        dataPosition += 2;

        data.setUint32(dataPosition, info.nodeTypesOfInterest.size, UDT.BIG_ENDIAN);
        dataPosition += 4;
        for (const nodeType of info.nodeTypesOfInterest.values()) {
            data.setUint8(dataPosition, nodeType.charCodeAt(0));
            dataPosition += 1;
        }

        data.setUint32(dataPosition, info.placeName.length * 2, UDT.BIG_ENDIAN);
        dataPosition += 4;
        for (let i = 0; i < info.placeName.length; i += 1) {
            data.setUint16(dataPosition, info.placeName.charCodeAt(i), UDT.BIG_ENDIAN);
            dataPosition += 2;
        }

        if (!info.isDomainConnected) {

            data.setUint32(dataPosition, info.username.length, UDT.BIG_ENDIAN);
            dataPosition += 4;
            for (let i = 0; i < info.username.length; i += 1) {
                data.setUint16(dataPosition, info.username[i], UDT.BIG_ENDIAN);
                dataPosition += 2;
            }

            data.setUint32(dataPosition, info.usernameSignature.byteLength, UDT.BIG_ENDIAN);
            dataPosition += 4;
            for (let i = 0; i < info.usernameSignature.byteLength; i++) {
                data.setUint8(dataPosition, info.usernameSignature.getUint8(i));
                dataPosition += 1;
            }

            if (info.domainUsername !== null) {

                data.setUint32(dataPosition, info.domainUsername.length, UDT.BIG_ENDIAN);
                dataPosition += 4;
                for (let i = 0; i < info.domainUsername.length; i += 1) {
                    data.setUint16(dataPosition, info.domainUsername[i], UDT.BIG_ENDIAN);
                    dataPosition += 2;
                }

                data.setUint32(dataPosition, info.domainTokens.length, UDT.BIG_ENDIAN);
                dataPosition += 4;
                for (let i = 0; i < info.domainTokens.length; i += 1) {
                    data.setUint16(dataPosition, info.domainTokens[i], UDT.BIG_ENDIAN);
                    dataPosition += 2;
                }

            }

        }

        /* eslint-enable no-magic-numbers */

        messageData.dataPosition = dataPosition;
        return packet;
    }

})();

export default DomainConnectRequest;
