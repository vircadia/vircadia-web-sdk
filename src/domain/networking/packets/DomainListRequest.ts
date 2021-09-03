//
//  DomainListRequest.ts
//
//  Created by David Rowe on 28 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";
import SockAddr from "../SockAddr";
import { NodeTypeValue } from "../../networking/NodeType";
import assert from "../../shared/assert";
import "../../shared/DataViewExtensions";


type DomainListRequestDetails = {
    currentTime: bigint,
    ownerType: NodeTypeValue,
    publicSockAddr: SockAddr,
    localSockAddr: SockAddr,
    nodeTypesOfInterest: Set<NodeTypeValue>,
    placeName: string,
    isDomainConnected: boolean,
    username: string | undefined,
    usernameSignature: Uint8Array | undefined,
    domainUsername: string | undefined,
    domainTokens: string | undefined
};


const DomainListRequest = new class {

    /*@devdoc
     *  Information needed for {@link Packets|writing} a {@link PacketType(1)|DomainListRequest} packet.
     *  @typedef {object} PacketScribe.DomainListRequestDetails
     *  @property {bigint} currentTime - The current Unix time, in usec.
     *  @property {NodeType} ownerType - The type of this node, i.e., <code>NodeType.Agent</code> for a web client.
     *  @property {SockAddr} publicSockAddr - The web client's public Internet address.
     *  @property {SockAddr} localSockAddr - The web client's local network address.
     *  @property {Set<NodeType>} nodeTypesOfInterest - The types of domain server nodes that the web client wants to use.
     *  @property {string} placeName - The domain's place name from {@link AddressManager} if known, otherwise an empty string.
     *  @property {boolean} isDomainConnected - <code>true</code> if currently connected to the domain, <code>false</code> if
     *      not connected.
     *  @property {string} [username] - If not connected then the user's metaverse user name, otherwise <code>""</code>.
     *  @property {Uint8Array} [usernameSignature] - If not connected then the login signature of the domain requires login and
     *      the signature is known, otherwise an empty value.
     *  @property {string} [domainUsername] - If not connected and the domain has its own login, the domain login user name.
     *  @property {string} [domainTokens] - If not connected and the domain has its own login, the domain login OAuth2 token(s)
     *      as <code>&lt;access-token&gt;:&lt;refresh-token&gt;</code>.
     */

    /*@devdoc
     *  Writes a {@link PacketType(1)|DomainListRequest} packet, ready for sending.
     *  @function PacketScribe.DomainListRequest&period;write
     *  @param {PacketScribe.DomainListRequestDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket}
     */
    write(info: DomainListRequestDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  NodeList::sendDomainServerCheckIn()

        const packet = NLPacket.create(PacketType.DomainListRequest);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        // WEBRTC TODO: Address further C++ code.

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setBigUint64(dataPosition, info.currentTime, UDT.BIG_ENDIAN);
        dataPosition += 8;

        data.setUint8(dataPosition, info.ownerType.charCodeAt(0));
        dataPosition += 1;

        data.setUint8(dataPosition, info.publicSockAddr.getType());
        dataPosition += 1;
        data.setUint8(dataPosition, 0);  // IP4
        dataPosition += 1;
        data.setUint32(dataPosition, info.publicSockAddr.getAddress(), UDT.BIG_ENDIAN);
        dataPosition += 4;
        data.setUint16(dataPosition, info.publicSockAddr.getPort(), UDT.BIG_ENDIAN);
        dataPosition += 2;

        data.setUint8(dataPosition, info.localSockAddr.getType());
        dataPosition += 1;
        data.setUint8(dataPosition, 0);  // IP4
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

            if (info.username === undefined || info.usernameSignature === undefined) {
                assert(false, "DomainListRequest.write() missing info for connected case!");
                return packet;
            }

            data.setUint32(dataPosition, info.username.length, UDT.BIG_ENDIAN);
            dataPosition += 4;
            for (let i = 0; i < info.username.length; i += 1) {
                data.setUint16(dataPosition, info.username.charCodeAt(i), UDT.BIG_ENDIAN);
                dataPosition += 2;
            }

            data.setUint32(dataPosition, info.usernameSignature.byteLength, UDT.BIG_ENDIAN);
            dataPosition += 4;
            for (let i = 0; i < info.usernameSignature.byteLength; i++) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                data.setUint8(dataPosition, info.usernameSignature[i]!);
                dataPosition += 1;
            }

            if (info.domainUsername !== undefined && info.domainTokens !== undefined) {

                data.setUint32(dataPosition, info.domainUsername.length, UDT.BIG_ENDIAN);
                dataPosition += 4;
                for (let i = 0; i < info.domainUsername.length; i += 1) {
                    data.setUint16(dataPosition, info.domainUsername.charCodeAt(i), UDT.BIG_ENDIAN);
                    dataPosition += 2;
                }

                data.setUint32(dataPosition, info.domainTokens.length, UDT.BIG_ENDIAN);
                dataPosition += 4;
                for (let i = 0; i < info.domainTokens.length; i += 1) {
                    data.setUint16(dataPosition, info.domainTokens.charCodeAt(i), UDT.BIG_ENDIAN);
                    dataPosition += 2;
                }

            }

        }

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default DomainListRequest;
export type { DomainListRequestDetails };
