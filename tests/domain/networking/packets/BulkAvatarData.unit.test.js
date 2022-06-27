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

    test("Can read a BulkAvatarData message that has joint data", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "41571a4d7dd34fa1bf57922549e7b4b1117030e75ac0ffec9cc2ec9e10c0fc69cc46c4329cc2590f9a46b000000000000080808000300260000000000000000000ef45b69b6526ed93ae3767bcc90294c46b3ef03ab60e6369ea57ac2b6a21d0a58e796915ca8793c36a4fcc5c8d7269fd0c0000000000000000000000000000000000000000000dff213f1401ff3f34e71401004034e70000000000000000000000000000803f0000000000000000000000000000000000000000000000000000803f000000000000000000000000ee43b5434ac9b93f52531ec49c4a333f951956be8222293fa53a2f3eb0f3070000000000000000000000000000000000000000f3ffffffffffffffffffffffffffffffffffffffffff";
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
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("41571a4d-7dd3-4fa1-bf57-922549e7b4b1");
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

    test("Can read a BulkAvatarData message that has avatar scale data", () => {
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

    test("Can read a BulkAvatarData message that has avatar joint data", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "1c9ab1d95001404cb71d790135624b1311305a81f1be9212ac3fbdac98c04150be46f67b16409a41abc65800708cffffffffffffffffbe4bb90d41243917be423f8a3d29c6eb3e963911ba9c475b375cc2394746c303b9064034c3ccb75e3f45c221b5b23e83bea7bb9a4004bf70bb2540313cfa8f4041433cfa8f4041433aab8f6243ac3aab8f6243acbd7f0600421cbd7f0600421cbc050613451bbc050613451bc001bb1d4029c001bb1d4029c001bb1d4029c001bb1d40296260151f1492465d0f753a064264202c3a874351180941da26bc1eec452b3abc257344b64dee20913bd04dee20913bd039a5189e508b32231aa760cb2edd1f436f342edd1f436f3438601918550e328d1af662fb302b1fcf70a6302b1fcf70a63bbe18404cda32dd18ff59c231951df26a3731951df16a373bcd185145b936f11a0054d9319b1a865b5d319b1a865b5d6bb8eefe637e7dc5ca7c45223a9476ca37887a55c17d432958457caf35db46fa798c3a3535037e953b6d35037e953b6d7a45b2d2389e776fa5a42c4974339d4f1faf74339d4f1faf79e5aff234e57702a54129ff74069dea1de374069dea1de37a6eb6243b40782fa8ed32b2763aa1a7237d763aa1a7237d7acab8de41ee7a8aae9b35be78e5a740319c78e5a740319c02b0040000000000000000b8981344302c00401af5ceff780a57ffc2fef5ff00000000a60400003e01f5ff000058ff0f000000000000000000fd4ffbffffffffffffffff";
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
        expect(bulkAvatarDetail.sessionUUID.stringify()).toBe("1c9ab1d9-5001-404c-b71d-790135624b13");

        const jointRotations = bulkAvatarDetail.jointRotations;
        expect(jointRotations).toHaveLength(88);
        const jointTranslations = bulkAvatarDetail.jointTranslations;
        expect(jointTranslations).toHaveLength(88);

        expect(jointRotations[0]).toBeNull();
        expect(jointTranslations[0]).toBeNull();

        expect(jointRotations[1]).toBeNull();
        expect(jointTranslations[1].x).toBeCloseTo(407.620, 3);
        expect(jointTranslations[1].y).toBeCloseTo(590.386, 3);
        expect(jointTranslations[1].z).toBeCloseTo(-100.536, 3);

        expect(jointRotations[12].x).toBeCloseTo(-0.0188392, 6);
        expect(jointRotations[12].y).toBeCloseTo(-0.0767595, 6);
        expect(jointRotations[12].z).toBeCloseTo(0.0126243, 6);
        expect(jointRotations[12].w).toBeCloseTo(-0.996792, 6);
        expect(jointTranslations[12].x).toBeCloseTo(-1.80172, 3);
        expect(jointTranslations[12].y).toBeCloseTo(96.572, 3);
        expect(jointTranslations[12].z).toBeCloseTo(-6.0898, 3);

        expect(jointRotations[87].x).toBeCloseTo(0.628642, 6);
        expect(jointRotations[87].y).toBeCloseTo(-0.273438, 6);
        expect(jointRotations[87].z).toBeCloseTo(-0.710469, 6);
        expect(jointRotations[87].w).toBeCloseTo(-0.158979, 6);
        expect(jointTranslations[87]).toBeNull();
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

        const jointRotations = bulkAvatarDetail.jointRotations;
        expect(jointRotations).toHaveLength(88);

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

    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
