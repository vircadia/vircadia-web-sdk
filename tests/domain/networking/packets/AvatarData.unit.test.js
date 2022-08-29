//
//  AvatarData.unit.test.js
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../../../../src/domain/networking/NLPacket";
import AvatarData from "../../../../src/domain/networking/packets/AvatarData";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";
import assert from "../../../../src/domain/shared/assert";

import { buffer2hex } from "../../../testUtils";


describe("AvatarData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can write an AvatarData packet - global position only", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "000000000636000000000000000000000000000000000000d4070100000060400000e040000080bf";
        const packet = AvatarData.write({
            sequenceNumber: 2004,
            dataDetail: 2,
            lastSentTime: Date.now(),
            globalPosition: { x: 3.5, y: 7.0, z: -1.0 }
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.AvatarData);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
    });

    test("Can write an AvatarData packet - global position and orientation", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "000000000636000000000000000000000000000000000000d4070500000020c10000c8420000a041bfff3fff6d40";
        const packet = AvatarData.write({
            sequenceNumber: 2004,
            dataDetail: 2,
            lastSentTime: Date.now(),
            globalPosition: { x: -10, y: 100, z: 20 },
            localOrientation: { x: 0, y: 0.866025, z: 0, w: -0.5 }
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.AvatarData);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
    });

    test("Can write an AvatarData packet - avatar scale", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "000000000636000000000000000000000000000000000000c1000d009a9999bfc3f5a83f33338b41bfff3fff10cb4e12";
        const packet = AvatarData.write({
            sequenceNumber: 193,
            dataDetail: 2,
            lastSentTime: Date.now(),
            globalPosition: { x: -1.2, y: 1.32, z: 17.4 },
            localOrientation: { x: 0, y: 0.85322, z: 0, w: 0.52156 },
            avatarScale: 1.43012
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.AvatarData);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
    });

    test("Can write an AvatarData packet - joint rotations and translations", () => {

        /* eslint-disable max-len */
        // Data from native client.
        const EXPECTED_PACKET = "000000000636000000000000000000000000000000000000760001309a9999bfc3f5a83f33338b415800f0ffffffffffffffffffa1ccc138411f3edfdd17381346b8e77f35bc4e5ed6f0324e47c7b1fb2d6547c7b1fb2d654416dbc947453668ec784a5f2efcce2849a93422a9304ffa3422a9304ffaa944c01c3ff8aaccbfe33fb1ac56bfa83f6bb617c07a41b9c41fc137409641ea8b623db141ea8b623db13f7b8b5e3ffc3f7b8b5e3ffcc12209a73d39c12209a73d39bf80099d4024bf80099d4024bffdc12b408abffdc12b408abffdc12b408abffdc12b408aecb068d25b9f0314d867432857640cb64733531b1d344e733b532c90534e3861300f55d845ee33b359e445ee33b359e450ed1b225af24d4b19c367d1494818a86f67494818a86f6753721ad45c864d1f17fc6884473916db762b473916db762b527b1b6f57744f17197e669d499f182270cc499f182270cc555d1d01528c52cb1b165cdc52f41b0e5dc152f41b0e5dc10e5f61c420632907737b4c0a2f3376514642318277f549fc46df6d6a4fe04ce170b14be743166eb2522643166eb2522634d9786b5cbb3ca978cd67ec7269bb730d1a7269bb730d1a3076793a5c6978d1c6781a1170c6be4b0dff70c6be4b0dff335378a258473bf4791767ad7362bbbe0fc47362bbbe0fc42e6477ed5055395179a9621c3c36795b678c3c36795b678c00b004000000000000000029edb8428dff00406ae311f8b5ff00000000b11d0000ef07b5ff000058ff0f000000000000000000ff4ffbffffffffffffffff";
        const sequenceNumber = 118;
        const globalPosition = { x: -1.2, y: 1.32, z: 17.4 };
        const rotations = [{ x: -0.212557, y: 0.904797, z: -0.0843894, w: 0.359222 }, { x: 0.169076, y: 0.75588, z: -0.272171, w: 0.570948 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 2.18557e-08, y: 0, z: 0, w: 1 }, { x: 0.333651, y: -0.0135036, z: -0.0124373, w: 0.942518 }, { x: 0.0124205, y: -0.321464, z: 0.942784, w: 0.0875459 }, { x: -0.0742853, y: -0.436433, z: 0.889465, w: 0.1134 }, { x: -0.158784, y: -0.253473, z: 0.942154, w: 0.151277 }, { x: -0.0859878, y: 0.154868, z: 0.962483, w: 0.205545 }, { x: -0.0859878, y: 0.154868, z: 0.962483, w: 0.205545 }, { x: -0.0451917, y: -0.307024, z: 0.947224, w: -0.0803764 }, { x: 0.105958, y: -0.491384, z: 0.856838, w: -0.114645 }, { x: 0.187964, y: -0.156442, z: 0.963739, w: -0.106788 }, { x: 0.131069, y: 0.252014, z: 0.942406, w: -0.176582 }, { x: 0.131069, y: 0.252014, z: 0.942406, w: -0.176582 }, { x: 0.251153, y: -0.00124949, z: 0.000319974, w: 0.967947 }, { x: 0.234228, y: 0.0012139, z: 0.00334584, w: 0.972175 }, { x: 0.217232, y: 0.00375918, z: 0.00639794, w: 0.976092 }, { x: 0.109458, y: -0.00529294, z: -0.0190719, w: 0.993794 }, { x: -0.0455622, y: -0.0134634, z: -0.00652583, w: 0.998849 }, { x: -0.0212016, y: 0.581302, z: 0.813014, w: 0.0254463 }, { x: -0.0212016, y: 0.581302, z: 0.813014, w: 0.0254463 }, { x: 0.00570721, y: 0.581491, z: 0.813533, w: 0.000146776 }, { x: 0.00570721, y: 0.581491, z: 0.813533, w: 0.000146781 }, { x: -0.0125596, y: 0.798983, z: 0.600441, w: 0.0306486 }, { x: -0.0125596, y: 0.798983, z: 0.600441, w: 0.0306486 }, { x: 0.00548436, y: 0.799319, z: 0.600879, w: -0.00158061 }, { x: 0.00548435, y: 0.799319, z: 0.60088, w: -0.00158062 }, { x: 7.73916e-05, y: -0.0129444, z: -0.00597803, w: 0.999899 }, { x: 7.73917e-05, y: -0.0129444, z: -0.00597803, w: 0.999898 }, { x: 7.73874e-05, y: -0.0129457, z: -0.00597791, w: 0.999898 }, { x: 7.73874e-05, y: -0.0129457, z: -0.00597791, w: 0.999898 }, { x: -0.493798, y: 0.677877, z: -0.451083, w: -0.305239 }, { x: 0.67307, y: -0.269663, z: 0.687777, w: -0.0349373 }, { x: 0.778308, y: -0.258467, z: 0.566656, w: -0.0795721 }, { x: 0.884385, y: -0.211129, z: 0.384425, w: -0.159701 }, { x: 0.951699, y: 0.0516061, z: 0.21471, w: -0.213321 }, { x: 0.950603, y: 0.0841723, z: 0.176093, w: -0.241372 }, { x: 0.946254, y: -0.0655518, z: 0.135871, w: -0.286086 }, { x: 0.946254, y: -0.0655519, z: 0.135871, w: -0.286086 }, { x: 0.842887, y: -0.187067, z: 0.407297, w: -0.297752 }, { x: 0.778716, y: -0.1469, z: 0.422441, w: -0.439961 }, { x: 0.725379, y: -0.102578, z: 0.434675, w: -0.523794 }, { x: 0.725379, y: -0.102578, z: 0.434675, w: -0.523794 }, { x: 0.828159, y: -0.214905, z: 0.410648, w: -0.315176 }, { x: 0.763588, y: -0.145035, z: 0.442104, w: -0.447707 }, { x: 0.654783, y: -0.0798258, z: 0.454563, w: -0.598548 }, { x: 0.654783, y: -0.0798258, z: 0.454563, w: -0.598548 }, { x: 0.853184, y: -0.204223, z: 0.403968, w: -0.259191 }, { x: 0.780479, y: -0.166786, z: 0.425435, w: -0.426661 }, { x: 0.709897, y: -0.106364, z: 0.440461, w: -0.539192 }, { x: 0.709897, y: -0.106364, z: 0.440462, w: -0.539191 }, { x: 0.867621, y: -0.236083, z: 0.386633, w: -0.204973 }, { x: 0.82996, y: -0.207674, z: 0.407829, w: -0.318924 }, { x: 0.825488, y: -0.209469, z: 0.408151, w: -0.328792 }, { x: 0.825489, y: -0.209469, z: 0.408151, w: -0.328792 }, { x: 0.661947, y: 0.548308, z: -0.373097, w: 0.349261 }, { x: 0.770904, y: 0.253778, z: -0.568853, w: -0.133082 }, { x: 0.774961, y: 0.185591, z: -0.60017, w: -0.069196 }, { x: 0.761522, y: 0.16006, z: -0.618295, w: -0.110347 }, { x: 0.843594, y: -0.075948, z: -0.501803, w: -0.17543 }, { x: 0.820353, y: -0.142323, z: -0.538013, w: -0.131555 }, { x: 0.832095, y: -0.0341551, z: -0.515969, w: -0.200567 }, { x: 0.832095, y: -0.0341552, z: -0.515969, w: -0.200567 }, { x: 0.70384, y: 0.123172, z: -0.623418, w: -0.31747 }, { x: 0.640426, y: 0.0368731, z: -0.627622, w: -0.441119 }, { x: -0.55702, y: 0.0502533, z: 0.60909, w: 0.562329 }, { x: -0.55702, y: 0.0502533, z: 0.60909, w: 0.562329 }, { x: 0.687131, y: 0.171641, z: -0.632322, w: -0.313941 }, { x: -0.62778, y: -0.0714941, z: 0.652036, w: 0.419082 }, { x: -0.538919, y: 0.0188162, z: 0.63563, w: 0.552437 }, { x: -0.538919, y: 0.0188162, z: 0.63563, w: 0.552437 }, { x: 0.718921, y: 0.140016, z: -0.625765, w: -0.268265 }, { x: 0.638658, y: 0.0446512, z: -0.630818, w: -0.438396 }, { x: -0.567761, y: 0.0469994, z: 0.625663, w: 0.532903 }, { x: -0.56776, y: 0.0469987, z: 0.625664, w: 0.532902 }, { x: 0.740075, y: 0.194529, z: -0.617957, w: -0.180491 }, { x: 0.668251, y: 0.0738165, z: -0.637122, w: -0.376918 }, { x: 0.636928, y: 0.0418388, z: -0.633736, w: -0.436979 }, { x: 0.636928, y: 0.0418389, z: -0.633736, w: -0.436979 }];
        const rotationsIsDefaultPoses = [true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
        const translations = [{ x: 748.113, y: 534.367, z: 650.764 }, { x: 407.625, y: 590.386, z: -100.545 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: -1.24237e-21, z: 2.84217e-14 }, { x: 0, y: 0, z: 0 }, { x: -0.654532, y: 92.4632, z: -41.3 }, { x: -11.463, y: -0.423648, z: 6.7208e-06 }, { x: 0.000192583, y: 42.9047, z: -3.64826e-08 }, { x: -2.14577e-05, y: 42.8981, z: -1.22419e-05 }, { x: 0.000268929, y: 15.3934, z: 0.000145435 }, { x: -9.53674e-07, y: 7.21441, z: 4.76837e-07 }, { x: 11.463, y: -0.423549, z: 7.14175e-06 }, { x: -0.000193536, y: 42.9047, z: 1.49168e-06 }, { x: 2.19345e-05, y: 42.8981, z: -7.91413e-06 }, { x: -0.00026797, y: 15.3933, z: 0.000101089 }, { x: 9.53674e-07, y: 7.21451, z: -4.76837e-07 }, { x: 0, y: 8.922, z: -6.84886e-08 }, { x: 7.45058e-09, y: 13.863, z: -6.84529e-07 }, { x: 7.45058e-09, y: 13.749, z: 2.21617e-07 }, { x: -2.98023e-08, y: 20.844, z: 4.45181e-07 }, { x: 1.19209e-07, y: 9.642, z: 1.34676e-06 }, { x: -2.9313, y: 3.88701, z: 12.3685 }, { x: 1.43051e-06, y: 3.91256, z: -1.52588e-05 }, { x: 2.9313, y: 3.88701, z: 12.3685 }, { x: -1.43051e-06, y: 3.91258, z: 1.52588e-05 }, { x: -2.9313, y: 3.88701, z: 12.3685 }, { x: 4.76837e-07, y: 3.77351, z: 4.57764e-05 }, { x: 2.9313, y: 3.88701, z: 12.3685 }, { x: 2.38419e-06, y: 3.77357, z: 1.52588e-05 }, { x: -2.9313, y: 3.88701, z: 12.3685 }, { x: 0, y: 500, z: -1.59882e-07 }, { x: 2.9313, y: 3.88701, z: 12.3685 }, { x: 0, y: 500, z: -2.37305e-07 }, { x: -2.303, y: 14.0293, z: 2 }, { x: -6.43106e-05, y: 16.2207, z: 0.000244141 }, { x: 1.19312e-05, y: 25.5625, z: 0.000122093 }, { x: 1.4434e-05, y: 26.56, z: -4.76837e-07 }, { x: 2.20854, y: 4.35023, z: 0.0502625 }, { x: -0.000179343, y: 3.36684, z: 0.000244156 }, { x: -3.016e-05, y: 3.94816, z: -0.000305191 }, { x: -7.62939e-06, y: 2.98897, z: -4.57764e-05 }, { x: -3.08269, y: 10.0438, z: -0.927795 }, { x: 7.20024e-05, y: 3.24364, z: -3.05176e-05 }, { x: -3.33786e-06, y: 2.67256, z: -0.000488341 }, { x: 1.04904e-05, y: 2.86232, z: 1.52588e-05 }, { x: -4.73447, y: 9.04918, z: -0.0750582 }, { x: 8.01091e-05, y: 2.27599, z: 0.000655711 }, { x: 5.73695e-06, y: 1.68882, z: 0.000244021 }, { x: 1.90735e-05, y: 2.1376, z: -1.52588e-05 }, { x: -1.06541, y: 10.9246, z: -1.12926 }, { x: -2.64943e-05, y: 3.70327, z: -0.000442386 }, { x: -1.74046e-05, y: 2.9242, z: 3.0458e-05 }, { x: -4.673e-05, y: 2.89203, z: -0.000213623 }, { x: 1.52249, y: 11.3542, z: -0.744842 }, { x: -3.74019e-06, y: 2.79543, z: 0.000366032 }, { x: -1.42977e-05, y: 2.53336, z: -0.000640884 }, { x: -2.57492e-05, y: 2.84633, z: -0.000137329 }, { x: 2.303, y: 14.0293, z: 2 }, { x: 6.41914e-05, y: 16.2207, z: 0.000243187 }, { x: -2.16365e-05, y: 25.5625, z: 0.000106856 }, { x: -1.7372e-05, y: 26.56, z: 2.38419e-07 }, { x: -2.20854, y: 4.35026, z: 0.0502775 }, { x: -0.000201881, y: 3.36616, z: -0.000106813 }, { x: 2.2769e-05, y: 3.94813, z: 0.000198364 }, { x: -1.90735e-05, y: 2.98907, z: 0 }, { x: 3.0826, y: 10.0439, z: -0.927795 }, { x: 3.14862e-05, y: 3.24371, z: -1.5378e-05 }, { x: -8.62777e-06, y: 2.67258, z: -0.000411987 }, { x: 4.29153e-06, y: 2.86232, z: 3.05176e-05 }, { x: 4.73448, y: 9.04922, z: -0.0750732 }, { x: -8.77399e-05, y: 2.27599, z: 0.000610352 }, { x: -5.70714e-06, y: 1.68887, z: 0.000213623 }, { x: -3.8147e-06, y: 2.13762, z: 1.52588e-05 }, { x: 1.06541, y: 10.9247, z: -1.12926 }, { x: -7.86781e-06, y: 3.70327, z: -0.000457883 }, { x: 9.54792e-06, y: 2.92424, z: 7.61747e-05 }, { x: 3.88622e-05, y: 2.89204, z: -0.000183105 }, { x: -1.52249, y: 11.3542, z: -0.744842 }, { x: -1.14292e-05, y: 2.79542, z: 0.00039649 }, { x: 3.8445e-06, y: 2.53342, z: -0.000564635 }, { x: -1.90735e-06, y: 2.84641, z: -4.57764e-05 }];
        const translationsIsDefaultPoses = [true, true, true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
        const lastSentJointRotations = [];
        const lastSentJointTranslations = [];
        /* eslint-enable max-len */

        assert(rotations.length === translations.length);
        for (let i = 0, length = rotations.length; i < length; i++) {
            // Replace default values with nulls.
            if (rotationsIsDefaultPoses[i]) {
                rotations[i] = null;
            }
            if (translationsIsDefaultPoses[i]) {
                translations[i] = null;
            }

            // No joint data sent last time.
            lastSentJointRotations[i] = null;
            lastSentJointTranslations[i] = null;
        }

        const packet = AvatarData.write({
            sequenceNumber,
            dataDetail: 3,
            lastSentTime: Date.now(),
            globalPosition,
            jointRotations: rotations,
            jointTranslations: translations,
            lastSentJointRotations,
            lastSentJointTranslations
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.AvatarData);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);

    });

    test("Can write an AvatarData packet - audio loudness", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "000000000636000000000000000000000000000000000000bd0021000000803f0000004000004040ba";
        const packet = AvatarData.write({
            sequenceNumber: 189,
            dataDetail: 2,
            lastSentTime: Date.now(),
            globalPosition: { x: 1, y: 2, z: 3 },
            audioLoudness: 618.481
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.AvatarData);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
    });

});
