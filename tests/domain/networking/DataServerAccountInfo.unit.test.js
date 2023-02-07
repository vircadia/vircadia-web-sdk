//
//  DataServerAccountInfo.unit.test.js
//
//  Created by David Rowe on 1 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import DataServerAccountInfo from "../../../src/domain/networking/DataServerAccountInfo";
import Uuid from "../../../src/domain/shared/Uuid";

import { buffer2hex } from "../../testUtils";


describe("DataServerAccountInfo - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can set and get the domain ID", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        const domainID = new Uuid(1234n);
        expect(dataServerAccountInfo.getDomainID().value()).toBe(Uuid.NULL);
        dataServerAccountInfo.setDomainID(domainID);
        expect(dataServerAccountInfo.getDomainID().value()).toBe(domainID.value());
    });

    test("Can set and get the username", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
        expect(dataServerAccountInfo.getUsername()).toBe("");
        dataServerAccountInfo.setUsername("something");
        expect(dataServerAccountInfo.getUsername()).toBe("something");
        log.mockRestore();
    });

    test("Can set and get the access token", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        let accessToken = dataServerAccountInfo.getAccessToken();
        expect(accessToken.token).toBe("");
        expect(accessToken.tokenType).toBe("");
        expect(accessToken.expiryTimestamp).toBe(-1);
        expect(accessToken.refreshToken).toBe("");

        dataServerAccountInfo.setAccessTokenFromJSON({
            /* eslint-disable camelcase */
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
            /* eslint-enable camelcase */
        });
        accessToken = dataServerAccountInfo.getAccessToken();
        expect(accessToken.token).toBe("abcd");
        expect(accessToken.tokenType).toBe("efgh");
        expect(accessToken.expiryTimestamp / 10).toBeCloseTo((Date.now() + 1234) / 10, 0);
        expect(accessToken.refreshToken).toBe("ijkl");
    });

    test("Can set and query the private key", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        expect(dataServerAccountInfo.hasPrivateKey()).toBe(false);
        dataServerAccountInfo.setPrivateKey(new Uint8Array([0, 1]));
        expect(dataServerAccountInfo.hasPrivateKey()).toBe(true);
        dataServerAccountInfo.setPrivateKey(new Uint8Array());
        expect(dataServerAccountInfo.hasPrivateKey()).toBe(false);
    });

    test("The temporary domain key is \"\"", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();
        expect(dataServerAccountInfo.getTemporaryDomainKey(new Uuid(1234n))).toBe("");
    });

    test("Signing plaintext without a private key returns an empty signature", async () => {
        const dataServerAccountInfo = new DataServerAccountInfo();
        const signature = await dataServerAccountInfo.signPlaintext("hello");
        expect(dataServerAccountInfo.hasPrivateKey()).toBe(false);
        expect(signature).toHaveLength(0);
    });

    test("Signing plaintext with a private key returns the expected signature", async () => {
        /* eslint-disable max-len */
        const USERNAME = "someone";
        const PRIVATE_KEY_HEADER = "308204be020100300d06092a864886f70d0101010500048204a8";  // ASN1 header for Web / Node.
        const PRIVATE_KEY_NATIVE = "308204a40201000282010100b4b97e633f51e351c57f910a1499510f3a2b8a79eff5c7bff3ddb463ce40294c07dc2b4ae048a7edbe2e179a730e394d0fde4b3a96db9399ce67da299a7aa75a182608fe2bc973c5f777d4bc6ccb5f7319cc3543a018cf1f0a33371486fb32f414685a17df1f39fc92b8f9a3124ec2d53d01b0490beab63197752e876b6ae9562fbcef73178e6bb10611f903453a4e9df9ab25aaa34f5c5f2febc8ee511d81633f349e1567220541acb1c186e546734f63e97b60fce3fc78899f353c5b27233a2ca9c3775e950dd8ef856a9c63acb92680e8857040af2e4cfa453eb6ac9359f9ca4a22c46113ed8e198ad678eb95eb50a0873adef89d4bc6bf96e56153c6f60302030100010282010100861470ae5555fd9eb7361377351d224477d5c1e101a48953e22b841fdfef3e344848925df4d432b271bc648a93fde38946d297619a76c1a504bb8be1fdd82dbcebd99c26667a0948c076c9001a7f300b8702382a39e6ee138b4fbff79cc555623c99c6ed9afde1d97f4978fc012329ed665b905c41591b5ee38d6ebdcd75fe3250d9715355d17d004833079bb4625c26f2ef2d616c2f420a69dcd14d677cf0c8165510046eafa26ef6ad1075511c43455a02669692be0725796b7fa0d2253a11d28398f7da4ae5f389204f5ba9eeb05bf668fc21d679145de70de65e3deef01d3b72d90a47f628f1592b7ca54182911b18595815f6c562caaacdf33a49d060f102818100ea4085a51b875ad88519087e43ed1b4bb84da8536c6b43184c2fa6d0b05ad5cd9201a1be57b8ba10ed26ec812a283e69d709185e7413ffd54a849e79b73d6c7c692986e014794af872a15398f0e2ec3864d691566b8af2c958c017dc0245b95764c26000ad4938ba3791aa7c8d6173bac683f529cb0d751fd517aa0af332b61d02818100c580c84c74f3c527dfccf4b238cba24823feea8679eeec30328ebdee1c8a90591f398b4fba3b685dd27c6bba918c0380613ae6bcdc0a42fb6c6bb7fb407c86618978d37de7b06a3b35e2f5eaca55a9482ba65d0d1be0f0a3a2a32a79ce880f3360fdca97ce9ed7dff32217dbd17ae937fa46691fdd969c9942ac7add6bf8229f02818051776f0324b7c61856f185caa3c4ea21434f7ea2c4a9e903a23b50407394a39682989eaf9bc25ab358469929b2879c6d22a3bf1dda30ba606b32040b4076d42bd046e8e9353599a51df88d223b642fd2ccfef23ca3da06e58f3fff0c3c9e12ff19c39faf9c94426e40b5201d80edcb59c18052dade0b281891fb50dfce046ce102818100c3310dc41269c15631271c46ef3ec1b9ce69675b5432bf16bb40bb911280173d1d50ffcfe1dc48bf41015a6ededda3b04367b516bdd91e6de1af6bfb52b63f11328e4966cb8e5ccefbe8bce638e60411a1a21fa08f06f68ca275e3cad24541d0a370efc2ac9febf6171280c5ecf82e79f64d9423bc19d7d6d8402285a6e96b3d0281802de3d969bd1a990ad5bedccb265a7bdc2f52eff6fc16ecfa7fa1f8961775e7bbccae56e8200cb58b4ed81637ac73aea2e5c8c43225bbf4bde73c0be5b180548f674c60c11abc0454c0a3584a2330db89577fb56bd7db497a69e98ded63066cf90a0cf87ce1ed716dd60f6d5bafd9805efbc84d9cb0f75119e3b1e45d68555224";
        const PRIVATE_KEY = PRIVATE_KEY_HEADER + PRIVATE_KEY_NATIVE;
        const PLAINTEXT = "736f6d656f6e658a156f3d91f445a6bf175d7b6f3f2884";
        const EXPECTED_SIGNATURE = "1d991c64fef0d67030530ba66b9948b14f10b5a6914bd23d6009f8559f9c0f580a4d5a3a8dae5affe0c2c4a08c363128b136a947832bc106fb71dd1fe7ea26ee5ae5de919d1bb19af8abe77572cdba04fc242abef956a0f4713dd61db98345f1f5e7166a0e52c9fadcffd9e2487a957f34a75004613ceba1812e4c59d6dae0cb5d6bc1f3a11c95982988c55ba1d7083141dd6e5dbd117780f944f4b48fc0912d6fd274b1baa605178559499537045c5402abd0d5dcf0ed26dc5db77784c58b83ffdeb07863091792ebe2f9cc2476f50073345addbecf304faeeb7aa7ccea374c4146974a5c2ddd3548ad4d1d378a469b7ec1dfe571a1f8c2bd31845f05b4642d";
        /* eslint-enable max-len */

        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        const dataServerAccountInfo = new DataServerAccountInfo();
        dataServerAccountInfo.setUsername(USERNAME);

        const privateKey = new Uint8Array(PRIVATE_KEY.length / 2);
        for (let i = 0, length = privateKey.byteLength; i < length; i++) {
            privateKey[i] = Number.parseInt(PRIVATE_KEY.substr(i * 2, 2), 16);
        }
        dataServerAccountInfo.setPrivateKey(privateKey);

        const plainText = new Uint8Array(PLAINTEXT.length / 2);
        for (let i = 0, length = plainText.byteLength; i < length; i++) {
            plainText[i] = Number.parseInt(PLAINTEXT.substr(i * 2, 2), 16);
        }

        const signature = await dataServerAccountInfo.signPlaintext(plainText);
        expect(signature).toHaveLength(EXPECTED_SIGNATURE.length / 2);
        expect(buffer2hex(signature.buffer)).toBe(EXPECTED_SIGNATURE);

        log.mockRestore();
    });

    test("Can get the username signature", async () => {
        /* eslint-disable max-len */
        const USERNAME = "someone";
        const PRIVATE_KEY_HEADER = "308204be020100300d06092a864886f70d0101010500048204a8";  // ASN1 header for Web / Node.
        const PRIVATE_KEY_NATIVE = "308204a40201000282010100d737268572f242958795fcc89ddf2bf531e0c64df024b4da4c341fddd832fd4cdf5f9793e2a2e41538e5c42a67902bbc2f6968dadb75a6e661dc737f7df17df06bc8eb99a83254b15b72d422952b1a77dfada9b6caf2590bc24b119ee63dc1da45af2bf2281c2be00b3024563d2a343707d749deac7d8b5c246f44fd7f17d4d00c0568e1413c473433c59c7c4a9fb5d0b001dc6409bdd1014a493ca6b147d5bb3209d099b34e180b61a1f5dc191755a28105e637ca04ee59bec1fc6c521aa97e009523ebd1d4d180ea884a217ad515514737841fc6925621eaaf977e068bb6a305903ffb49126e00bc9d5d36e644c25ba951b354790ce521bbae1501059d5bbd0203010001028201006e625d21a9595489796796a61743363aa70090f5bcac370e98734bbcef7d07aa7c0f7da15e6709f150a398bfdf2a75242a753850b8ab599564b03b9532b5c050a61801af68339878f75ca82dacb0d4fc92ff71c2cdc90b9f1a6282812bba95492ce0b1fb9c5306b5fd470dfc259715fcfbca929ae181eb0eb1a9588b64ba866dd64d2f2e72c36dcf8dd9320b99e18a1fcf2a75a36048a9114236f05cc2de8c5b304021620eb97c31daeaa1a8584246a2439eb7402d48980f0bfe9b5364f34ca8fe3f9bb894174fbedf87d111fced6dafd70a98496b41d49532e3af5998840997f822bed405004822c0d40ed2f09059c2e94b09e7f03f20572d26a82d5a17f00102818100ee3c8b7a5ccdff908fa9248807deacca5885f9def3f7f408e4129af1a605e739701a846cdc2a859c157c743903190d4aefd4a2532b640a94c84c3bf86263f90f630c5d1617ee9b745ec95ab54b58ab797e8d2c0186e8e89507742134a1a0e26686c6efec1ae7b3eabaad0eadc3985f3dd89bdf28ccfafd7aaeecd23e765c25bd02818100e7432e02d9c1172a1057a1266395c3064d2b8419792ccde439010abf646624b7fa5bbc3407696edbc117986e79e0dcfff3c3cda07fcb25c9595cc2fb3900e6b73fa80c36ccae4bef8509e2d7b8be64885840754d555f6eedb84988cc7acafa87644ee3489710cf1cf60d3fefa27154c9fca77c90bbcfbbd4180ee30b2ad26e01028181009ab9efcc74e1c58dd9fffc9dec9e8e928c93d7091a627bb81a888ae14ef69e8a0b68ed80d62d37c17ba2ecc8ea5e26e7f8839d396f00f66e52f8502aad9c4871d9de79c6939c80923fcd7e8028835a3afa1a2dee7ff45cba0db13aafb8198971152fb73b1cee4747b81e155e7d9e449d224579d641eaf11df0e616564300edf102818039d178f26b80b40ae735116c289fabb7aa9983985ecc4dd98e4aed65f672f7212c2dbd3b00d3624cfcd4aa5e8c882498b55831d3bbbf8d7deea29b78f5c27cec39b50900b661a94883e979d65730faaf7fe8f5aad4fa5c2080df999d0de22b8aa810751093fc36dbd5c47044b8473f5c94974734645046747b63556e58516e0102818100a6b5a9a65fbcce497ba562cbaa515b63e013f27d3d44b76ac9c6e104538a94213642ff5e9a10dacb02763b97be102361deeddb9707fc82628f48daa8befcf3b43575d9d20b36f5fa0b30d6abf78ceda323493f2824f9ef1b566f29ce64220ce51048047c2c26d5a8c1ef56233a7d21e4de543062777314dca0bc027650549fd1";
        const PRIVATE_KEY = PRIVATE_KEY_HEADER + PRIVATE_KEY_NATIVE;
        const CONNECTION_TOKEN = new Uuid(BigInt("0x7e8a55d9805f4ab881153c98137724ef"));
        const EXPECTED_USERNAME_SIGNATURE = "2521e68699de2f90807ea3928ab3b92244def6a549cacbae1584517dcb4efba850794ab5cd729012815d7cfead90578917513a340347ae1a30020cc0741b03d5a39e5661741ede4e5eaafdf09078acdc7295d2f180cca1a31f4a7930936bc65cf90daf369e6dd43117c439b0d728ea22b70d35d9f00b697a1e19e17e23b04f839c41888273c09137d7735869bc00f32ff75d4e9cd36baaf2cc321abe35c4181f15d7e965a067e95c51bd55131940bc5e1a787b493726db433321ef8a4f09f94a71b6f6b5ce310833d066c446455d2fded7e825c73f57c5dbf5f260c6b0918e89ffb2e88968494004e4bd4488e60ac4d91bb36e577add12a774206179754e7b6b";
        /* eslint-enable max-len */

        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        const dataServerAccountInfo = new DataServerAccountInfo();
        dataServerAccountInfo.setUsername(USERNAME);

        const privateKey = new Uint8Array(PRIVATE_KEY.length / 2);
        for (let i = 0, length = privateKey.byteLength; i < length; i++) {
            privateKey[i] = Number.parseInt(PRIVATE_KEY.substr(i * 2, 2), 16);
        }
        dataServerAccountInfo.setPrivateKey(privateKey);

        const usernameSignature = await dataServerAccountInfo.getUsernameSignature(CONNECTION_TOKEN);
        expect(buffer2hex(usernameSignature.buffer)).toBe(EXPECTED_USERNAME_SIGNATURE);

        log.mockRestore();
    });

});
