//
//  BulkAvatarData.unit,.test.js
//
//  Created by David Rowe on 9 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import BulkAvatarData from "../../../../src/domain/networking/packets/BulkAvatarData";


describe("BulkAvatarData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read a single-avatar BulkAvatarData message", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "000000000b360000000000000000000000000000000000002545b3509e064035a9f60708bb44adb91130c2e3e7bf89aa7a3f3e9c06413469e6c5836ad33f9f5ff9c6451cfbffffffffffff1fbefcc8203b644812c08742373805c01642884830becc39fa3d61c3693946c96401593814c96401593814c2f0c61b4169c42ec45d4084c2f9c2a43f710e27e87918c2478d04f13a92430114aa3a6b435c0d12421736c00e2f51f92fd810245d862c5114c369a9236f0f5a633238a80da24daa2fc00fbf5b432b34142d67ff26e6119a64fb3c510d3f433836450ea84ff330de0f19542032a10f9a555026981402416738c1198c43034b5914403c2c65cd15a34b953b420d394a49317d0e11544a2eb31296633f2e2e125062e516fc6e7c15a4379a7783397f3c6d6bd137103fcb7bc33cfe4df5799f4c2555f476d657155a8e719e630362f5760d5baf4ba87a60480955e5775154bd5b70721d61485f87743c5dd6470c7b1f3dec4e5e793a49f5541678454da1527077e94f035a4d72e039cf4a416e9a3a9239e5751a384820f974764b4548c27aff44f0539179434dd8579d743b5cbd581e74745c54bf48c2ba3f0fc0acbc8e3ee8bff5bca73eedbff5bca73eedc0acbc8e3ee80400000000000000001714ca421a040040520045030000000000000000fbffffffffffffff1f";
        const MESSAGE_START = 24;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarDetails = BulkAvatarData.read(dataView);
        expect(bulkAvatarDetails).toHaveLength(1);

        const bulkAvatarDetail = bulkAvatarDetails[0];
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("2545b350-9e06-4035-a9f6-0708bb44adb9");
        expect(bulkAvatarDetail.globalPosition.x).toBeCloseTo(-1.81164, 3);
        expect(bulkAvatarDetail.globalPosition.y).toBeCloseTo(0.979165, 3);
        expect(bulkAvatarDetail.globalPosition.z).toBeCloseTo(8.41315, 3);
    });

    test("Can read a dual-avatar BulkAvatarData message", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "000000000b360000000000000000000000000000000000008e3751e4adc942ada25d9091c1a531861130ec4a90c0aa49793f5d63ad408c8b96bf41c9d33f229d5a41451ce7ffffffffffff1fbffdbf5c3f4c3f55b93e42e73addc4d342df3f76bcfb38a04eb3c46b39d9501ca4593b79c246bf8c3f76c43ec0673f90c33ec1413fc4162eecdb16410085c715390c3d820c6a325a3e2606773e5e38ac08164ee02d650a735c0e233b10366b3b0bea9b94641d368a082e4c892deb0b785b1d268f0e6e643722820c2060d23d98064645ca36a3078d52363511085655bf36b608e257192ae01a0339b3287b1e443b0734ec1e3342305275210e4dc538d506ff499d2fbf0a3a5aac268f0e0d663126190dc165cd19de7041133736467b863b533eda772c34c73ef06e543b7c3c066f114fec44946f275d094b116c246c7d540271f565d740396d5850a446f26c205f354d2d68f46d8651896beb6aab3ba06f01435044566e37592946d16cf960fb45116c26621450d05e5d426657cd60c240084d0a6073444c2f2e5ceb4f553f916e2d4bef465d6cb45f094d906ac76aff4e156b1d6aa9be5bc334416ec259c47f4187bfe4cdeb40dfbfe1cd7340e6c259c47f418704000000000000000055bac94217040040c6ff45030000000000000000fbffffffffffffff1f5ea4674e121e47dd9016bcefecc9f31211308cf892bf7e2f7d3f61b65b41276f8dc03e14c73f0897ae4045000020000000f000002dc406ad57f67c20c89544fc7aedc0913b2c78c9b97634da78eebadc3327040000000000000000366ec94262ff0040c6ff45030000000000000000fbffffffffffffff1f";
        const MESSAGE_START = 24;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarDetails = BulkAvatarData.read(dataView);
        expect(bulkAvatarDetails).toHaveLength(2);

        let bulkAvatarDetail = bulkAvatarDetails[0];
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("8e3751e4-adc9-42ad-a25d-9091c1a53186");
        expect(bulkAvatarDetail.globalPosition.x).toBeCloseTo(-4.50915, 3);
        expect(bulkAvatarDetail.globalPosition.y).toBeCloseTo(0.97378, 3);
        expect(bulkAvatarDetail.globalPosition.z).toBeCloseTo(5.41838, 3);

        bulkAvatarDetail = bulkAvatarDetails[1];
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("5ea4674e-121e-47dd-9016-bcefecc9f312");
        expect(bulkAvatarDetail.globalPosition.x).toBeCloseTo(-1.14821, 3);
        expect(bulkAvatarDetail.globalPosition.y).toBeCloseTo(0.989006, 3);
        expect(bulkAvatarDetail.globalPosition.z).toBeCloseTo(13.732, 3);
    });

    test("Can read a BulkAvatarData message that has orientation data", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "000000000b36000000000000000000000000000000000000ba351668ba234dd9b45356207632381615304181d2c0948c823faf3ee140bfffb7c43fff531982c44eabd23fbdd1ffc62a00feffffff03c365baed40983b35a6e13c5a5234c11547554a039f433efdc91601023af5c91601023af53aaec23745863526eb48429531b6caae3bec30fba57c425130fba57c4251bc9bc5863effbe10c55c3e9cbe7fc6ca3e1d157af1e320550d45d9e23e570394c9ee335a023ac4dc2c2c37b100e435a2225505d44d9118160be05a1f18160be05a1f15246c6c16b939c86d222c6055ab642c23a85fd959431e80661353a928f768ef461f46ba67fe3ec555d467fe3ec555d4bea1c5fb3df0c219c2183f9ec219c2183f9e00020200000059c4c5422c0000405efe00004f1b00002aff0100000000fffdfdffff03";
        const MESSAGE_START = 24;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarDetails = BulkAvatarData.read(dataView);
        expect(bulkAvatarDetails).toHaveLength(1);

        const bulkAvatarDetail = bulkAvatarDetails[0];
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("ba351668-ba23-4dd9-b453-562076323816");
        expect(bulkAvatarDetail.globalPosition.x).toBeCloseTo(-6.57828, 3);
        expect(bulkAvatarDetail.globalPosition.y).toBeCloseTo(1.01992, 3);
        expect(bulkAvatarDetail.globalPosition.z).toBeCloseTo(7.03890, 3);

        expect(bulkAvatarDetail.localOrientation.x).toBeCloseTo(-0.00002157, 3);
        expect(bulkAvatarDetail.localOrientation.y).toBeCloseTo(-0.0909159, 3);
        expect(bulkAvatarDetail.localOrientation.z).toBeCloseTo(-0.00002157, 3);
        expect(bulkAvatarDetail.localOrientation.w).toBeCloseTo(-0.995859, 3);
    });

    test("Can read a BulkAvtarData message that has avatar scale data", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "5cd7b12c15bb44bb96048d7dcf3828e7ff317e250339c3bcb23f414a44bf8328933ec529873f8328933e40b6fb3bf0ced5bd402df03cbfff8c743fff091390ad61443438633f52e7ffc600bfff8c743fffe7057cfe0239e86549be424a44bff00400000000000000000000000000000000ffff5800f0ffffffffffffffffffa20fc11340a43ebddcd4387f4684e73836284e3ed6d83205478cb1e52d2f478cb1e52d2f43e1da7947a435d7ec604a6d2efbcd6c491733e4a8734f7533e4a8734f75a97dbfaf4044ab03bf6a4024ac8abf234003b70ec0314108c518c09d3fc741dd8a983eb541dd8a983eb53f678a9240f93f678a9240f9c1640a693e35c1640a693e35bfb90a68411bbfb90a68411bc479d4213e5bc479d4213e5bc479d4213e5bc479d4213e5bed3069785b630375d8f9431457f80c73473252b71c274fd13aa92b31543c37a32eac56b34515327c5af24515327c5af2505f1a345c3f4c9218f96900487917f4707a487917f4707a52e019f55dda4c6b173769b2465c16477727465c1647772751f91a7b58ca4e6418b667d548cf177771dd48cf177771dd54ea1c0653f052361a355e2e525d1a315f12525d1a315f120e4f62b220b627b474754b3e2c9176c046892f1b787f4a7a44976e9750834a8871e54c6140d46fd452c740d46fd452c732b879585d107879c54117f370dfbd150d3070dfbd150d302e587a095cbd774bc86e19fa6f2dbff40e226f2dbff40e22311f797358a6784ec5f6183271e1bd730fda71e1bd730fda2c17788150d037467ac0624e7827c5b618567827c5b6185600b00400000000000000006677b8423700004081e30cf8b5ff00000000c41d0000f407b5ff000058ff0f000000000000000000ff4ffbffffffffffffffff";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarDetails = BulkAvatarData.read(dataView);
        expect(bulkAvatarDetails).toHaveLength(1);

        const bulkAvatarDetail = bulkAvatarDetails[0];
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("5cd7b12c-15bb-44bb-9604-8d7dcf3828e7");
        expect(bulkAvatarDetail.avatarScale).toBeCloseTo(1.48717, 5);
    });

    test("Can read a BulkAvatarData message that has joint default flags", () => {

        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "7cd12a580e0d45b6a1e6aad6ab0c84bfff31e292abbf89a6ac3f967a15c06b9d8e3e7dfd823f6b9d8e3ec0f0f33b1035cfbdf0c2e83cbfff3fff2ccf7212d12951c6d38a0d4099a6e94600bfff3fff2ccfb805e392abbf80ba47be777a15c0f00400000000000000000000000000000000ffff5800f0ffffffffffffffffffa267c0ce40043e55db873899462ce6cc36544d5ed4ed337f475dafcb2ee5475dafcb2ee543b6d91648993631eaa44b1f2ed0c9c44a363431a4f950893431a4f95089a9bdbf2d408dab3dbedc409cacbfbe8940abb75dc0053f60c546c0433e5f42558a78401642558a7840163fde8a6b42583fde8a6b4258c2400a883f61c2400a883f61c0950a954246c0950a954246c546c0433e5fc546c0433e5fc546c0433e5fc546c0433e5fee5c6aa25aa8034cd77e445156220d7d489d510a1f0c524438972dde56dc358e315e5945430535985d0d430535985d0d4f2d1d645eb94bec1c636b7948341b6d72f948341b6d72f951c41d3960404bdf1a9f6c34468419cb799c468419cb799c50a71d9a5b3f4db61c206a4548a11af6745648a11af6745653641f13564d511a1d796096514a1d7b6177514a1d7b61770e02639d20df25b2763a4b9429e677a047a52ce97ac34c8b42d171f052144881754a4d9b3f20730954713f20730954717ad1ceae213874bcc62d16c46cf6bd710c926cf6bd710c927926d310216c737dc97b18bb6b2ac0660d7b6b2ac0660d7b2f837bca5a7a748dc6e616ff6dfdbdfa0f346dfdbdfa0f342a2e7aab52ed7767c9ec1c497465c6a917277465c6a9172702b0040000000000000000b8981344302c00401af52500f80991fbc2fef5ff00000000a60400003e01f5ff000058ff0f000000000000000000fd4ffbffffffffffffffff";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarDetails = BulkAvatarData.read(dataView);
        expect(bulkAvatarDetails).toHaveLength(1);

        const bulkAvatarDetail = bulkAvatarDetails[0];
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("7cd12a58-0e0d-45b6-a1e6-aad6ab0c84bf");

        const jointRotationsUseDefault = bulkAvatarDetail.jointRotationsUseDefault;
        expect(jointRotationsUseDefault).toHaveLength(88);
        expect(jointRotationsUseDefault[0]).toEqual(true);
        expect(jointRotationsUseDefault[1]).toEqual(true);
        expect(jointRotationsUseDefault[1]).toEqual(true);
        expect(jointRotationsUseDefault[11]).toEqual(true);
        expect(jointRotationsUseDefault[12]).toEqual(false);
        expect(jointRotationsUseDefault[13]).toEqual(false);
        expect(jointRotationsUseDefault[14]).toEqual(false);
        expect(jointRotationsUseDefault[15]).toEqual(false);
        expect(jointRotationsUseDefault[87]).toEqual(false);

        const jointTranslationsUseDefault = bulkAvatarDetail.jointTranslationsUseDefault;
        expect(jointTranslationsUseDefault).toHaveLength(88);
        expect(jointTranslationsUseDefault[0]).toEqual(true);
        expect(jointTranslationsUseDefault[1]).toEqual(false);
        expect(jointTranslationsUseDefault[2]).toEqual(true);
        expect(jointTranslationsUseDefault[11]).toEqual(true);
        expect(jointTranslationsUseDefault[12]).toEqual(false);
        expect(jointTranslationsUseDefault[13]).toEqual(false);
        expect(jointTranslationsUseDefault[14]).toEqual(true);
        expect(jointTranslationsUseDefault[15]).toEqual(false);
        expect(jointTranslationsUseDefault[87]).toEqual(true);
    });


    test("Can read a BulkAvataDataPacket that has joint data", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "0096c5e6cd164cb8a9477088c0a6040d113014ae91c0c079aa3fb3df3ac1cc0f8b4500c516403cb7fdc65800308cffffffffffffffffbf72bab93e8c3accbe703c5b3abfbcc845a83847c04a45bcc224ba1b3e0ac4c6b9e63d78c470b9993d19b9a7b87a3ae6c328b5c9359b3e458ccd4d203e458ccd4d203be38ccd4f683be38ccd4f68c24c095a4d09c24c095a4d09c0b709dc4feec0b709dc4feebefab6ef35f1befab6ef35f1befab6ef35f1befab6ef35f11842e9fd162f0309c40e38563dd90cbc3533014cba7a35bc21ec0cf22f7630560e96329b40dc0792321740dc079232172f8301d93f09259405834a9f1faf0a4755671faf0a4755672d9a027542b424f505c54cc41f4b0b3158981f4b0b315898325700ff3c4d280903ad453c22d20866524a22d20866524a00fbb52536372da402ca40da290603e34352290603e3435165c4eaf96b417adcc75c49ad3db47b6132c27abbbd864b5a59d5781a2fa84e0e76a030843fd77d36320b3fd77d36320b7c1bb20c406a7b43a73635645fb179bb56415fb179bb56417bf7b0a03d297ad9a79533c979aca187286179aca18728617bd6b4a043137b2ea93b3a1f7abaa3102ce87abaa3102ce87b59b7ae49a87c76ae303d9a7bd4a8c13a3c7bd4a8c13a3c00b0040000000000000000a5f5c1427f0000408ffb70f8b9ff000000004f1c00009007b9ff000058ff0f000000000000000000ff4ffbffffffffffffffff";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarDetails = BulkAvatarData.read(dataView);
        expect(bulkAvatarDetails).toHaveLength(1);

        const bulkAvatarDetail = bulkAvatarDetails[0];
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("0096c5e6-cd16-4cb8-a947-7088c0a6040d");

        const numJoints = 88;
        expect(bulkAvatarDetail.jointRotationsValid).toHaveLength(numJoints);
        expect(bulkAvatarDetail.jointRotations.length).toBeLessThan(numJoints);
        expect(bulkAvatarDetail.jointRotationsUseDefault).toHaveLength(numJoints);
        expect(bulkAvatarDetail.jointTranslationsValid).toHaveLength(numJoints);
        expect(bulkAvatarDetail.jointTranslations.length).toBeLessThan(numJoints);
        expect(bulkAvatarDetail.jointTranslationsUseDefault).toHaveLength(numJoints);

        /* eslint-disable max-len */

        expect(bulkAvatarDetail.jointRotationsValid).toEqual([false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, true, true, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]);
        const expectedJointRotations = [{ x: -0.00610709, y: -0.0582871, z: -0.0160338, w: -0.998152 }, { x: -0.0574672, y: -0.0172423, z: -0.997387, w: -0.0402464 }, { x: -0.0580282, y: -0.035542, z: -0.995721, w: 0.0625169 }, { x: -0.0853052, y: 0.00321537, z: -0.994332, w: 0.06338 }, { x: 0.0236731, y: -0.0651064, z: -0.0216446, w: -0.997363 }, { x: 0.0527627, y: -0.0673938, z: -0.0279459, w: -0.995938 }, { x: 0.049051, y: -0.0707172, z: -0.0320461, w: -0.995774 }, { x: -0.0701129, y: -0.083104, z: -0.056345, w: -0.992473 }, { x: 0.0348946, y: -0.112841, z: -0.114826, w: -0.986339 }, { x: -0.0190982, y: -0.565672, z: -0.81155, w: 0.145038 }, { x: -0.0190982, y: -0.565672, z: -0.81155, w: 0.145038 }, { x: -0.0454256, y: -0.565672, z: -0.805586, w: 0.170243 }, { x: -0.0454256, y: -0.565672, z: -0.805586, w: 0.170243 }, { x: 0.0253994, y: -0.783615, z: -0.603782, w: 0.144045 }, { x: 0.0253994, y: -0.783615, z: -0.603782, w: 0.144045 }, { x: 0.00791979, y: -0.781756, z: -0.598172, w: 0.176027 }, { x: 0.00791979, y: -0.781756, z: -0.598172, w: 0.176027 }, { x: -0.0112863, y: -0.100152, z: -0.111115, w: -0.988684 }, { x: -0.0112863, y: -0.100152, z: -0.111115, w: -0.988684 }, { x: -0.0112863, y: -0.100152, z: -0.111115, w: -0.988684 }, { x: -0.0112863, y: -0.100152, z: -0.111115, w: -0.988684 }, { x: -0.439085, y: 0.463945, z: -0.615234, w: -0.462003 }, { x: -0.673572, y: 0.0448213, z: -0.732888, w: -0.0846577 }, { x: -0.815097, y: -0.0237594, z: -0.566406, w: -0.119315 }, { x: -0.692778, y: -0.0610062, z: -0.709561, w: -0.113402 }, { x: -0.733488, y: -0.332308, z: -0.564076, w: -0.182717 }, { x: -0.806287, y: -0.173049, z: -0.545949, w: -0.147973 }, { x: -0.766543, y: 0.00951666, z: -0.623463, w: -0.15367 }, { x: -0.766543, y: 0.00951666, z: -0.623463, w: -0.15367 }, { x: -0.703676, y: -0.182155, z: -0.686692, w: -0.0106389 }, { x: -0.695289, y: -0.291911, z: -0.646208, w: 0.117373 }, { x: -0.681387, y: -0.357039, z: -0.593554, w: 0.236494 }, { x: -0.681387, y: -0.357039, z: -0.593554, w: 0.236494 }, { x: -0.70388, y: -0.203261, z: -0.679959, w: 0.0298881 }, { x: -0.690596, y: -0.298773, z: -0.64336, w: 0.141067 }, { x: -0.67465, y: -0.361355, z: -0.583454, w: 0.271755 }, { x: -0.67465, y: -0.361355, z: -0.583454, w: 0.271755 }, { x: -0.700715, y: -0.150908, z: -0.696101, w: -0.0408506 }, { x: -0.694507, y: -0.264763, z: -0.666493, w: 0.0578555 }, { x: -0.691265, y: -0.322381, z: -0.614313, w: 0.202095 }, { x: -0.691265, y: -0.322381, z: -0.614313, w: 0.202095 }, { x: -0.696274, y: -0.119919, z: -0.699384, w: -0.108093 }, { x: -0.708098, y: -0.202829, z: -0.676291, w: 0.00943035 }, { x: -0.702213, y: -0.253844, z: -0.664163, w: 0.0367073 }, { x: -0.702216, y: -0.253844, z: -0.664163, w: 0.0366641 }, { x: 0.417289, y: 0.474821, z: -0.609917, w: 0.477929 }, { x: 0.650352, y: 0.0813344, z: -0.747659, w: 0.106928 }, { x: -0.739932, y: -0.0253563, z: 0.656092, w: -0.14629 }, { x: 0.648928, y: -0.0273417, z: -0.74994, w: 0.125444 }, { x: -0.708288, y: 0.285437, z: 0.619881, w: -0.180559 }, { x: -0.763101, y: 0.15531, z: 0.603567, w: -0.171063 }, { x: -0.720275, y: -0.00174797, z: 0.676334, w: -0.154188 }, { x: -0.720275, y: -0.00174797, z: 0.676334, w: -0.154188 }, { x: 0.66412, y: -0.154145, z: -0.731549, w: 0.00459653 }, { x: 0.654797, y: -0.27387, z: -0.694622, w: -0.1172 }, { x: -0.640328, y: 0.350176, z: 0.637879, w: 0.245902 }, { x: -0.640328, y: 0.350176, z: 0.637879, w: 0.245902 }, { x: 0.662566, y: -0.169855, z: -0.728816, w: -0.0313555 }, { x: 0.650222, y: -0.26977, z: -0.6973, w: -0.134939 }, { x: 0.637231, y: -0.336667, z: -0.642253, w: -0.260965 }, { x: 0.637231, y: -0.336667, z: -0.642253, w: -0.260965 }, { x: 0.661142, y: -0.125659, z: -0.738882, w: 0.0339882 }, { x: 0.653891, y: -0.251556, z: -0.710584, w: -0.0649338 }, { x: 0.648884, y: -0.319705, z: -0.65745, w: -0.210943 }, { x: 0.648884, y: -0.319705, z: -0.65745, w: -0.210943 }, { x: 0.655747, y: -0.0919086, z: -0.741729, w: 0.106712 }, { x: 0.668047, y: -0.196787, z: -0.717138, w: -0.0264785 }, { x: 0.661055, y: -0.256822, z: -0.702135, w: -0.0636821 }, { x: 0.661055, y: -0.256822, z: -0.702135, w: -0.0636821 }];
        expect(bulkAvatarDetail.jointRotations).toHaveLength(expectedJointRotations.length);
        for (let i = 0, length = expectedJointRotations.length; i < length; i++) {
            const expected = expectedJointRotations[i];
            const received = bulkAvatarDetail.jointRotations[i];
            expect(received.x).toBeCloseTo(expected.x, 5);
            expect(received.y).toBeCloseTo(expected.y, 5);
            expect(received.z).toBeCloseTo(expected.z, 5);
        }
        expect(bulkAvatarDetail.jointRotationsUseDefault).toEqual([true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]);

        expect(bulkAvatarDetail.jointTranslationsValid).toEqual([false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, true, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]);
        const expectedJointTranslations = [{ x: 0.751735, y: 96.9798, z: -6.7301 }, { x: -11.4595, y: -0.420261, z: 0 }, { x: 0, y: 42.8963, z: 0 }, { x: 11.4595, y: -0.420261, z: 0 }];
        expect(bulkAvatarDetail.jointTranslations).toHaveLength(expectedJointTranslations.length);
        for (let i = 0, length = expectedJointTranslations.length; i < length; i++) {
            const expected = expectedJointTranslations[i];
            const received = bulkAvatarDetail.jointTranslations[i];
            expect(received.x).toBeCloseTo(expected.x, 3);
            expect(received.y).toBeCloseTo(expected.y, 3);
            expect(received.z).toBeCloseTo(expected.z, 3);
        }
        expect(bulkAvatarDetail.jointTranslationsUseDefault).toEqual([true, true, true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]);

        /* eslint-enable max-len */

    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
