//
//  BulkAvatarTraits.unit,.test.js
//
//  Created by David Rowe on 28 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { TraitType } from "../../../../src/domain/avatars/AvatarTraits";
import BulkAvatarTraits from "../../../../src/domain/networking/packets/BulkAvatarTraits";


describe("BulkAvatarTraits - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read a BulkAvatarTraits message with an empty skeletonModelURL", () => {
        // And has no SkeletonData.

        const RECEIVED_MESSAGE = "0200000000000000e2a1a56103734cce9000c9df970124f300010000000000ff";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarTraitsDetails = BulkAvatarTraits.read(dataView);
        expect(bulkAvatarTraitsDetails.traitsSequenceNumber).toBe(2n);

        const avatarTraitsList = bulkAvatarTraitsDetails.avatarTraitsList;
        expect(avatarTraitsList).toHaveLength(1);
        expect(avatarTraitsList[0].avatarID.stringify()).toBe("e2a1a561-0373-4cce-9000-c9df970124f3");
        expect(avatarTraitsList[0].avatarTraits).toHaveLength(1);
        expect(avatarTraitsList[0].avatarTraits[0].type).toEqual(TraitType.SkeletonModelURL);
        expect(avatarTraitsList[0].avatarTraits[0].version).toEqual(1);
        expect(avatarTraitsList[0].avatarTraits[0].value).toEqual("");
    });

    test("Can read a BulkAvatarTraits message with a non-empty skeletonModelURL", () => {
        // Also has SkeletonData.
        // SkeletonData causes an error because it's currently not handled.
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* No-op. */ });

        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "92588e6403000080000000006430a5bdf54c53dc55ec964bb289c7ae98d0a8530100000000000000fbb6e48f8e1e426d9f640a6497c99e630001000000420068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f417661746172732f5365616e2f6662782f5365616e2e66737401010000000c0c3e073b4402007a44587104000006020040b62dac37d33c47a21f7c47010000ffff06000402df22813267f7b0b258a10c5147010100ffff0a000402000000000000bfffbfff3fffcc0c0200ffff0e000b02000000000000bfffbfff3fffcc0c0300ffff19000d02000000000000bfffbfff3fffcc0c0400ffff26000e02000000000000bfffbfff3fffcc0c0500ffff34000f02000000000000bfffbfff3fffcc0c0600ffff43000e02000000000000bfffbfff3fffcc0c0700ffff51000c02000000000000bfffbfff3fffcc0c0800ffff5d001502000000000000bfffbfff3fffcc0c0900ffff72000b02000000000000bfffbfff3fffcc0c0a00ffff7d000402000000000000bfffbfff3fff03000b00ffff810004010000530878ffbfffbfff3fff03000c000b0085000a0105fff7ff00003fffbfff3fff03000d000c008f0008010000ab0300003fffbfff3fff03000e000d00970009010000ab03000040068de5400d03000f000e00a0000c01000051010000c00202304002030010000f00ac00100100009d000000c00202304002030011001000bc000901fb00f7ff00003fffbfff3fff030012000c00c50007010000ab0300003fffbfff3fff030013001200cc0008010000ab0300003ffb8e3c3ff6030014001300d4000b01000051010000bffd02263ffd030015001400df000f0100009e000000bffd02263ffd030016001500ee0005010000c3000000bfffbfff3fff030017000c00f300060100002f010000bfffbfff3fff030018001700f900060100002d010000bfffbfff3fff030019001800ff0004010000c8010000bfffbfff3fff03001a001900030104010000d3000000bfffbfff3fff03001b001a0007010f01c0ff55000e0141298ec63ecc03001c001b001601130100005500000041298ec63ecc03001d001c0029010f01400055000e013ed58ec6413203001e001b00380113010000550000003ed58ec6413203001f001e004b010f01c0ff55000e01c0bf06633e80030020001b005a011301000052000000c0bf06633e800300210020006d010f01400055000e01bf3f0663417e030022001b007c011301000052000000bf3f0663417e0300230022008f010801c0ff55000e01bfffbfff3fff030024001b0097010c010000c62a0000bfffbfff3fff030025002400a3010701400055000e01bfffbfff3fff030026001b00aa010b010000c62a0000bfffbfff3fff030027002600b5010d01cfff33012b006d3f12be12bf030028001900c20108010000620100006d3f12be12bf030029002800ca010c0100002f0200006d3f12be12bf03002a002900d60109010000450200006b2014dd10b703002b002a00df010f012f005f000100853fd95f269f03002c002b00ee010f0100004900000060541faa08c503002d002c00fd010f01000056000000852dd93526c903002e002d000c021301000041000000852dd93526c903002f002e001f020e01bdffdb00ecffeb666f076b66030030002b002d020e01000047000000eba96ec86ba90300310030003b020e0100003a000000eb616f0b6b610300320031004902120100003e000000eb616f0b6b610300330032005b020f0199ffc600ffffe7b9722c67b9030034002b006a020f0100003000000017d0f1cf17d003003500340079020f010000240000001830f21c18300300360035008802130100002e0000001830f21c18300300370036009b021001e9ffef00e9ff6c73138a11f6030038002b00ab0210010000510000006cbe1340123f030039003800bb02100100004000000091e9ec66139803003a003900cb02140100003f00000091e9ec66139803003b003a00df020f012100f800f0ff6a2c15d00fde03003c002b00ee020f0100003d0000008f88e9cb163303003d003c00fd020f010000370000006ae51519108203003e003d000c03130100003e0000006ae51519108203003f003e001f030c01310033012b0012be6d3f12bf0300400019002b03070100006201000012d46d2912a803004100400032030b0100002f02000012be6d3f12bf0300420041003d03080100004502000015016afd109703004300420045030e01d1ff5f00010026dc5922052503004400430053030e010000490000001fe2601c08a403004500440061030e01000056000000270c58f205100300460045006f031201000041000000270c58f2051003004700460081030d014300db00ecff947f6ef0147f0300480043008e030d010000470000006bc6eeae6bc60300490048009b030d0100003a0000006b7eeef16b7e03004a004900a803110100003e0000006b7eeef16b7e03004b004a00b9030e016700c600ffff67cff21b67cf03004c004300c7030e0100003000000097b871ba17b803004d004c00d5030e0100002400000067e9f20567e903004e004d00e303120100002e00000067e9f20567e903004f004e00f5030f011700ef00e9ff13aa6c5311d703005000430004040f0100005100000013606c9e121f03005100500013040f0100004000000091cb93b76c470300520051002204130100003f00000091cb93b76c4703005300520035040e01dffff800f0ff8fc495ed6a0103005400430043040e0100003d000000165a69a50f6803005500540051040e01000037000000153e6ac010600300560055005f04120100003e000000153e6ac0106003005700560043616d6572614c616d70426f647953686f727430322e6f626a486967682d706f6c792e6f626a45796562726f773031322e6f626a4579656c617368657330312e6f626a54656574685f626173652e6f626a546f6e67756530312e6f626a4d616c655f63617375616c7375697430312e6f626a53686f657330322e6f626a5365616e48697073526967687455704c656752696768744c65675269676874466f6f745269676874546f65426173655269676874546f65426173655f656e644c65667455704c65674c6566744c65674c656674466f6f744c656674546f65426173654c656674546f65426173655f656e645370696e655370696e65315370696e65324e65636b486561646f72626963756c6172697330342e526f72626963756c6172697330342e525f656e646f72626963756c6172697330342e4c6f72626963756c6172697330342e4c5f656e646f72626963756c6172697330332e526f72626963756c6172697330332e525f656e646f72626963756c6172697330332e4c6f72626963756c6172697330332e4c5f656e64526967687445796552696768744579655f656e644c6566744579654c6566744579655f656e64526967687453686f756c646572526967687441726d5269676874466f726541726d526967687448616e64526967687448616e645468756d6231526967687448616e645468756d6232526967687448616e645468756d6233526967687448616e645468756d62335f656e64526967687448616e6452696e6731526967687448616e6452696e6732526967687448616e6452696e6733526967687448616e6452696e67335f656e64526967687448616e6450696e6b7931526967687448616e6450696e6b7932526967687448616e6450696e6b7933526967687448616e6450696e6b79335f656e64526967687448616e644d6964646c6531526967687448616e644d6964646c6532526967687448616e644d6964646c6533526967687448616e644d6964646c65335f656e64526967687448616e64496e64657831526967687448616e64496e64657832526967687448616e64496e64657833526967687448616e64496e646578335f656e644c65667453686f756c6465724c65667441726d4c656674466f726541726d4c65667448616e644c65667448616e645468756d62314c65667448616e645468756d62324c65667448616e645468756d62334c65667448616e645468756d62335f656e644c65667448616e6452696e67314c65667448616e6452696e67324c65667448616e6452696e67334c65667448616e6452696e67335f656e644c65667448616e6450696e6b79314c65667448616e6450696e6b79324c65667448616e6450696e6b79334c65667448616e6450696e6b79335f656e644c65667448616e644d6964646c65314c65667448616e644d6964646c65324c65667448616e644d6964646c65334c65667448616e644d6964646c65335f656e644c65667448616e64496e646578314c65667448616e64496e646578324c65667448616e64496e646578334c65667448616e64496e646578335f656e64ff";
        const MESSAGE_START = 32;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarTraitsDetails = BulkAvatarTraits.read(dataView);
        expect(bulkAvatarTraitsDetails.traitsSequenceNumber).toBe(1n);

        const avatarTraitsList = bulkAvatarTraitsDetails.avatarTraitsList;
        expect(avatarTraitsList).toHaveLength(1);
        expect(avatarTraitsList[0].avatarID.stringify()).toBe("fbb6e48f-8e1e-426d-9f64-0a6497c99e63");
        expect(avatarTraitsList[0].avatarTraits).toHaveLength(2);
        expect(avatarTraitsList[0].avatarTraits[0].type).toEqual(TraitType.SkeletonModelURL);
        expect(avatarTraitsList[0].avatarTraits[0].version).toEqual(1);
        expect(avatarTraitsList[0].avatarTraits[0].value)
            .toEqual("https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Sean/fbx/Sean.fst");
        expect(avatarTraitsList[0].avatarTraits[1].type).toEqual(TraitType.SkeletonData);
        expect(avatarTraitsList[0].avatarTraits[1].version).toEqual(1);
        expect(avatarTraitsList[0].avatarTraits[1].value).toBeUndefined();

        expect(console.error).toHaveBeenCalledTimes(1);  // "Reading avatar skeleton data not handled."
        error.mockReset();
    });

    test("Can read a BulkAvatarTraits message for two avatars", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "0100000000000000b5995d39a74141f79caa54803bc4c0220001000000420068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f417661746172732f5365616e2f6662782f5365616e2e66737401010000000c0c3e073b4402007a44587104000006020040b62dac37d33c47a21f7c47010000ffff06000402df22813267f7b0b258a10c5147010100ffff0a000402000000000000bfffbfff3fffcc0c0200ffff0e000b02000000000000bfffbfff3fffcc0c0300ffff19000d02000000000000bfffbfff3fffcc0c0400ffff26000e02000000000000bfffbfff3fffcc0c0500ffff34000f02000000000000bfffbfff3fffcc0c0600ffff43000e02000000000000bfffbfff3fffcc0c0700ffff51000c02000000000000bfffbfff3fffcc0c0800ffff5d001502000000000000bfffbfff3fffcc0c0900ffff72000b02000000000000bfffbfff3fffcc0c0a00ffff7d000402000000000000bfffbfff3fff03000b00ffff810004010000530878ffbfffbfff3fff03000c000b0085000a0105fff7ff00003fffbfff3fff03000d000c008f0008010000ab0300003fffbfff3fff03000e000d00970009010000ab03000040068de5400d03000f000e00a0000c01000051010000c00202304002030010000f00ac00100100009d000000c00202304002030011001000bc000901fb00f7ff00003fffbfff3fff030012000c00c50007010000ab0300003fffbfff3fff030013001200cc0008010000ab0300003ffb8e3c3ff6030014001300d4000b01000051010000bffd02263ffd030015001400df000f0100009e000000bffd02263ffd030016001500ee0005010000c3000000bfffbfff3fff030017000c00f300060100002f010000bfffbfff3fff030018001700f900060100002d010000bfffbfff3fff030019001800ff0004010000c8010000bfffbfff3fff03001a001900030104010000d3000000bfffbfff3fff03001b001a0007010f01c0ff55000e0141298ec63ecc03001c001b001601130100005500000041298ec63ecc03001d001c0029010f01400055000e013ed58ec6413203001e001b00380113010000550000003ed58ec6413203001f001e004b010f01c0ff55000e01c0bf06633e80030020001b005a011301000052000000c0bf06633e800300210020006d010f01400055000e01bf3f0663417e030022001b007c011301000052000000bf3f0663417e0300230022008f010801c0ff55000e01bfffbfff3fff030024001b0097010c010000c62a0000bfffbfff3fff030025002400a3010701400055000e01bfffbfff3fff030026001b00aa010b010000c62a0000bfffbfff3fff030027002600b5010d01cfff33012b006d3f12be12bf030028001900c20108010000620100006d3f12be12bf030029002800ca010c0100002f0200006d3f12be12bf03002a002900d60109010000450200006b2014dd10b703002b002a00df010f012f005f000100853fd95f269f03002c002b00ee010f0100004900000060541faa08c503002d002c00fd010f01000056000000852dd93526c903002e002d000c021301000041000000852dd93526c903002f002e001f020e01bdffdb00ecffeb666f076b66030030002b002d020e01000047000000eba96ec86ba90300310030003b020e0100003a000000eb616f0b6b610300320031004902120100003e000000eb616f0b6b610300330032005b020f0199ffc600ffffe7b9722c67b9030034002b006a020f0100003000000017d0f1cf17d003003500340079020f010000240000001830f21c18300300360035008802130100002e0000001830f21c18300300370036009b021001e9ffef00e9ff6c73138a11f6030038002b00ab0210010000510000006cbe1340123f030039003800bb02100100004000000091e9ec66139803003a003900cb02140100003f00000091e9ec66139803003b003a00df020f012100f800f0ff6a2c15d00fde03003c002b00ee020f0100003d0000008f88e9cb163303003d003c00fd020f010000370000006ae51519108203003e003d000c03130100003e0000006ae51519108203003f003e001f030c01310033012b0012be6d3f12bf0300400019002b03070100006201000012d46d2912a803004100400032030b0100002f02000012be6d3f12bf0300420041003d03080100004502000015016afd109703004300420045030e01d1ff5f00010026dc5922052503004400430053030e010000490000001fe2601c08a403004500440061030e01000056000000270c58f205100300460045006f031201000041000000270c58f2051003004700460081030d014300db00ecff947f6ef0147f0300480043008e030d010000470000006bc6eeae6bc60300490048009b030d0100003a0000006b7eeef16b7e03004a004900a803110100003e0000006b7eeef16b7e03004b004a00b9030e016700c600ffff67cff21b67cf03004c004300c7030e0100003000000097b871ba17b803004d004c00d5030e0100002400000067e9f20567e903004e004d00e303120100002e00000067e9f20567e903004f004e00f5030f011700ef00e9ff13aa6c5311d703005000430004040f0100005100000013606c9e121f03005100500013040f0100004000000091cb93b76c470300520051002204130100003f00000091cb93b76c4703005300520035040e01dffff800f0ff8fc495ed6a0103005400430043040e0100003d000000165a69a50f6803005500540051040e01000037000000153e6ac010600300560055005f04120100003e000000153e6ac0106003005700560043616d6572614c616d70426f647953686f727430322e6f626a486967682d706f6c792e6f626a45796562726f773031322e6f626a4579656c617368657330312e6f626a54656574685f626173652e6f626a546f6e67756530312e6f626a4d616c655f63617375616c7375697430312e6f626a53686f657330322e6f626a5365616e48697073526967687455704c656752696768744c65675269676874466f6f745269676874546f65426173655269676874546f65426173655f656e644c65667455704c65674c6566744c65674c656674466f6f744c656674546f65426173654c656674546f65426173655f656e645370696e655370696e65315370696e65324e65636b486561646f72626963756c6172697330342e526f72626963756c6172697330342e525f656e646f72626963756c6172697330342e4c6f72626963756c6172697330342e4c5f656e646f72626963756c6172697330332e526f72626963756c6172697330332e525f656e646f72626963756c6172697330332e4c6f72626963756c6172697330332e4c5f656e64526967687445796552696768744579655f656e644c6566744579654c6566744579655f656e64526967687453686f756c646572526967687441726d5269676874466f726541726d526967687448616e64526967687448616e645468756d6231526967687448616e645468756d6232526967687448616e645468756d6233526967687448616e645468756d62335f656e64526967687448616e6452696e6731526967687448616e6452696e6732526967687448616e6452696e6733526967687448616e6452696e67335f656e64526967687448616e6450696e6b7931526967687448616e6450696e6b7932526967687448616e6450696e6b7933526967687448616e6450696e6b79335f656e64526967687448616e644d6964646c6531526967687448616e644d6964646c6532526967687448616e644d6964646c6533526967687448616e644d6964646c65335f656e64526967687448616e64496e64657831526967687448616e64496e64657832526967687448616e64496e64657833526967687448616e64496e646578335f656e644c65667453686f756c6465724c65667441726d4c656674466f726541726d4c65667448616e644c65667448616e645468756d62314c65667448616e645468756d62324c65667448616e645468756d62334c65667448616e645468756d62335f656e644c65667448616e6452696e67314c65667448616e6452696e67324c65667448616e6452696e67334c65667448616e6452696e67335f656e644c65667448616e6450696e6b79314c65667448616e6450696e6b79324c65667448616e6450696e6b79334c65667448616e6450696e6b79335f656e644c65667448616e644d6964646c65314c65667448616e644d6964646c65324c65667448616e644d6964646c65334c65667448616e644d6964646c65335f656e644c65667448616e64496e646578314c65667448616e64496e646578324c65667448616e64496e646578334c65667448616e64496e646578335f656e64fff8a09c2d45664458adba3b50e9e76dd500010000000000ff";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const bulkAvatarTraitsDetails = BulkAvatarTraits.read(dataView);
        expect(bulkAvatarTraitsDetails.traitsSequenceNumber).toBe(1n);

        const avatarTraitsList = bulkAvatarTraitsDetails.avatarTraitsList;
        expect(avatarTraitsList).toHaveLength(2);

        expect(avatarTraitsList[0].avatarID.stringify()).toBe("b5995d39-a741-41f7-9caa-54803bc4c022");
        expect(avatarTraitsList[0].avatarTraits).toHaveLength(2);
        expect(avatarTraitsList[0].avatarTraits[0].type).toEqual(TraitType.SkeletonModelURL);
        expect(avatarTraitsList[0].avatarTraits[0].version).toEqual(1);
        expect(avatarTraitsList[0].avatarTraits[0].value)
            .toEqual("https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Sean/fbx/Sean.fst");
        expect(avatarTraitsList[0].avatarTraits[1].type).toEqual(TraitType.SkeletonData);
        expect(avatarTraitsList[0].avatarTraits[1].version).toEqual(1);
        expect(avatarTraitsList[0].avatarTraits[1].value).toBeUndefined();

        expect(avatarTraitsList[1].avatarID.stringify()).toBe("f8a09c2d-4566-4458-adba-3b50e9e76dd5");
        expect(avatarTraitsList[1].avatarTraits).toHaveLength(1);
        expect(avatarTraitsList[1].avatarTraits[0].type).toEqual(TraitType.SkeletonModelURL);
        expect(avatarTraitsList[1].avatarTraits[0].version).toEqual(1);
        expect(avatarTraitsList[1].avatarTraits[0].value).toEqual("");
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */

});
