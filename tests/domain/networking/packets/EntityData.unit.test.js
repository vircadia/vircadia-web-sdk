//
//  EntityData.unit.test.js
//
//  Created by Julien Merzoug on 31 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { HostType } from "../../../../src/domain/entities/EntityItem";
import EntityData from "../../../../src/domain/networking/packets/EntityData";
import AvatarPriorityMode from "../../../../src/domain/shared/AvatarPriorityMode";
import ComponentMode from "../../../../src/domain/shared/ComponentMode";
import ShapeType from "../../../../src/domain/shared/ShapeType";
import Uuid from "../../../../src/domain/shared/Uuid";


describe("EntityData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */

    test("Can read a Model entity in a packet", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "c030005f878ad79fe105001a010000023378da636030666064c85cb6c2caff93d3df6969e6756d5c5ab7041666755d9fff909501462b28fcff67ffffec7f30f86121ffff9f200316f0ff3f324f6d8783bd898afbc18dab2d1cce9e39630bc3ffebc110a4d61e86611609303c58b88a79238b4bd94a758d152c2faf784de8d1b27fdbe671f08c82b1c39a18433b46744b198122288248e663156bb047606450e5c2403e80faa4613f833c5c6c9a337e3da0c0c423c7c090c090515252506ca5af9f9c92a76ba8579659949c989299a8979c9fab5f5aac9baa6ba8ef9458959858a4ef585c9c5a52acef9b9f929a53acef969f9fa29f94595492919258199f9c989daa9f9e5392862aa4979e93843d345818aab96ab92081fac11112ca6032e0b03b03002d4487fd";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(1);
        expect(info[0].entityItemID instanceof Uuid).toBe(true);
        expect(info[0].entityItemID.stringify()).toBe("69a6a83a-4ff2-42fd-9666-377e860a2ada");
        expect(info[0].entityType).toBe(4);
        expect(info[0].createdFromBuffer).toBe(1655451515775649n);
        expect(info[0].lastEdited).toBe(1655451515775649n);
        expect(info[0].updateDelta).toBe(2);
        expect(info[0].simulatedDelta).toBe(2);
        expect(info[0].simOwnerData.byteLength).toBe(17);
        expect(info[0].simOwnerData).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        expect(info[0].parentID).toBeNull();
        expect(info[0].parentJointIndex).toBe(65535);
        expect(info[0].visible).toBe(false);
        expect(info[0].name).toBeUndefined();
        expect(info[0].locked).toBe(false);
        expect(info[0].userData).toBeUndefined();
        expect(info[0].privateUserData).toBeUndefined();
        expect(info[0].href).toBeUndefined();
        expect(info[0].description).toBeUndefined();
        expect(info[0].position.x).toBeCloseTo(0.752809, 3);
        expect(info[0].position.y).toBeCloseTo(-12.4463, 3);
        expect(info[0].position.z).toBeCloseTo(2.885479, 3);
        expect(info[0].dimensions.x).toBeCloseTo(0.100000, 3);
        expect(info[0].dimensions.y).toBeCloseTo(0.100000, 3);
        expect(info[0].dimensions.z).toBeCloseTo(0.100000, 3);
        expect(info[0].rotation.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].rotation.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].rotation.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].rotation.w).toBeCloseTo(1, 2);
        expect(info[0].registrationPoint.x).toBeCloseTo(0.5, 3);
        expect(info[0].registrationPoint.y).toBeCloseTo(0.5, 3);
        expect(info[0].registrationPoint.z).toBeCloseTo(0.5, 3);
        expect(info[0].created).toBe(1655451515775649n);
        expect(info[0].lastEditedBy instanceof Uuid).toBe(true);
        expect(info[0].lastEditedBy.stringify()).toBe("e0a1aa03-b104-4476-a927-28a804e9d44a");
        expect(info[0].entityHostType).toBe(HostType.DOMAIN);
        expect(info[0].queryAACube.corner.x).toBeCloseTo(0.6662073, 3);
        expect(info[0].queryAACube.corner.y).toBeCloseTo(-12.5329, 3);
        expect(info[0].queryAACube.corner.z).toBeCloseTo(2.7988767, 3);
        expect(info[0].queryAACube.scale).toBeCloseTo(0.173205, 3);
        expect(info[0].canCastShadow).toBe(true);
        expect(info[0].renderLayer).toBe(0);
        expect(info[0].primitiveMode).toBe(0);
        expect(info[0].ignorePickIntersection).toBe(false);
        expect(info[0].renderWithZones).toBeUndefined();
        expect(info[0].billboardMode).toBe(0);
        expect(info[0].grab.grabbable).toBe(false);
        expect(info[0].grab.grabKinematic).toBe(true);
        expect(info[0].grab.grabFollowsController).toBe(true);
        expect(info[0].grab.triggerable).toBe(false);
        expect(info[0].grab.equippable).toBe(false);
        expect(info[0].grab.grabDelegateToParent).toBe(true);
        expect(info[0].grab.equippableLeftPositionOffset.x).toBeCloseTo(0, 2);
        expect(info[0].grab.equippableLeftPositionOffset.y).toBeCloseTo(0, 2);
        expect(info[0].grab.equippableLeftPositionOffset.z).toBeCloseTo(0, 2);
        expect(info[0].grab.equippableLeftRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].grab.equippableLeftRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].grab.equippableLeftRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].grab.equippableLeftRotationOffset.w).toBeCloseTo(1, 2);
        expect(info[0].grab.equippableRightPositionOffset.x).toBeCloseTo(0, 2);
        expect(info[0].grab.equippableRightPositionOffset.y).toBeCloseTo(0, 2);
        expect(info[0].grab.equippableRightPositionOffset.z).toBeCloseTo(0, 2);
        expect(info[0].grab.equippableRightRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].grab.equippableRightRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].grab.equippableRightRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].grab.equippableRightRotationOffset.w).toBeCloseTo(1, 2);
        expect(info[0].grab.equippableIndicatorURL).toBeUndefined();
        expect(info[0].grab.equippableIndicatorScale.x).toBeCloseTo(1, 2);
        expect(info[0].grab.equippableIndicatorScale.y).toBeCloseTo(1, 2);
        expect(info[0].grab.equippableIndicatorScale.z).toBeCloseTo(1, 2);
        expect(info[0].grab.equippableIndicatorOffset.x).toBeCloseTo(0, 2);
        expect(info[0].grab.equippableIndicatorOffset.y).toBeCloseTo(0, 2);
        expect(info[0].grab.equippableIndicatorOffset.z).toBeCloseTo(0, 2);
        expect(info[0].density).toBeCloseTo(1000, 2);
        expect(info[0].velocity.x).toBeCloseTo(0, 2);
        expect(info[0].velocity.y).toBeCloseTo(0, 2);
        expect(info[0].velocity.z).toBeCloseTo(0, 2);
        expect(info[0].angularVelocity.x).toBeCloseTo(0, 2);
        expect(info[0].angularVelocity.y).toBeCloseTo(0, 2);
        expect(info[0].angularVelocity.z).toBeCloseTo(0, 2);
        expect(info[0].gravity.x).toBeCloseTo(0, 2);
        expect(info[0].gravity.y).toBeCloseTo(0, 2);
        expect(info[0].gravity.z).toBeCloseTo(0, 2);
        expect(info[0].acceleration.x).toBeCloseTo(0, 2);
        expect(info[0].acceleration.y).toBeCloseTo(0, 2);
        expect(info[0].acceleration.z).toBeCloseTo(0, 2);
        expect(info[0].damping).toBeCloseTo(0, 2);
        expect(info[0].angularDamping).toBeCloseTo(0, 2);
        expect(info[0].restitution).toBeCloseTo(0.5, 3);
        expect(info[0].friction).toBeCloseTo(0.5, 3);
        expect(info[0].lifetime).toBeCloseTo(-1, 2);
        expect(info[0].collisionless).toBe(false);
        expect(info[0].collisionMask).toBe(31);
        expect(info[0].dynamic).toBe(false);
        expect(info[0].collisionSoundURL).toBeUndefined();
        expect(info[0].actionData).toBeUndefined();
        expect(info[0].cloneable).toBe(false);
        expect(info[0].cloneLifetime).toBeCloseTo(300, 2);
        expect(info[0].cloneLimit).toBeCloseTo(0, 2);
        expect(info[0].cloneDynamic).toBe(false);
        expect(info[0].cloneAvatarEntity).toBe(false);
        expect(info[0].cloneOriginID).toBeUndefined();
        expect(info[0].script).toBeUndefined();
        expect(info[0].scriptTimestamp).toBe(0n);
        expect(info[0].serverScripts).toBeUndefined();
        expect(info[0].itemName).toBeUndefined();
        expect(info[0].itemDescription).toBeUndefined();
        expect(info[0].itemCategories).toBeUndefined();
        expect(info[0].itemArtist).toBeUndefined();
        expect(info[0].itemLicense).toBeUndefined();
        expect(info[0].limitedRun).toBe(4294967295);
        expect(info[0].marketplaceID).toBeUndefined();
        expect(info[0].editionNumber).toBe(0);
        expect(info[0].entityInstanceNumber).toBe(0);
        expect(info[0].certificateID).toBeUndefined();
        expect(info[0].certificateType).toBeUndefined();
        expect(info[0].staticCertificateVersion).toBe(0);
        expect(info[0].shapeType).toBe(0);
        expect(info[0].compoundShapeURL).toBe("");
        expect(info[0].color.red).toBe(255);
        expect(info[0].color.green).toBe(255);
        expect(info[0].color.blue).toBe(255);
        expect(info[0].textures).toBe("");
        expect(info[0].modelURL).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );
        expect(info[0].modelScale.x).toBeCloseTo(1, 2);
        expect(info[0].modelScale.y).toBeCloseTo(1, 2);
        expect(info[0].modelScale.z).toBeCloseTo(1, 2);
        expect(info[0].jointRotationsSet).toBeUndefined();
        expect(info[0].jointRotations).toBeUndefined();
        expect(info[0].jointTranslationsSet).toBeUndefined();
        expect(info[0].jointTranslations).toBeUndefined();
        expect(info[0].relayParentJoints).toBe(false);
        expect(info[0].groupCulled).toBe(false);
        expect(info[0].blendShapeCoefficients).toBe("{\n}\n");
        expect(info[0].useOriginalPivot).toBe(true);
        expect(info[0].animation.url).toBe("");
        expect(info[0].animation.allowTranslation).toBe(false);
        expect(info[0].animation.fps).toBeCloseTo(30, 2);
        expect(info[0].animation.currentFrame).toBeCloseTo(0, 2);
        expect(info[0].animation.running).toBe(false);
        expect(info[0].animation.loop).toBe(true);
        expect(info[0].animation.firstFrame).toBeCloseTo(0, 2);
        expect(info[0].animation.lastFrame).toBeCloseTo(100000, 2);
        expect(info[0].animation.hold).toBe(false);
    });

    test("Can read two Model entities in a packet", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "c001009ea50eda06e205005b010000036978da636050666062300eb0689394727c3225e04358aa439fbac09b844307d81eb1329cfb7f184c3330fcffc700023cafffffff61210fe56107f610dcb05f1e2632cd99012ff80f0478e418181218324a4a0a8aadf4f59353f2740df5ca328b9213533213f592f373f54b8b7553750df59d12ab12138bf41d8b8b534b8af57df35352738af5ddf2f353f493328b4a3252122be39313b353f5d3734ad25085f4d2739280eeb54760186061a8e6aae56204b33f3882290827e0b03b839eda2b8b83af3d16b708ec7bb87a65c40301979f61bb40a1953d2362172cd4ecff9ffd0f06e05013c4ee4346249ec88225fbd59c980f7c7052de7fe8fa363ba6a7c2769b666fb3fb5f0f86ff1101cc600fb35080c1f3e0aca34f845d2b1b5e2ce89ce2729ad1c4f2d8fe6d7c22070c4ad3f6d7a7b0d933a25bcac808f30acc1508f3b18a610b1e10a87261201fc0930a033cad0cd3c40200c4f1cf28";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(2);

        // First Model Entity.
        expect(info[0].entityItemID instanceof Uuid).toBe(true);
        expect(info[0].entityItemID.stringify()).toBe("33503886-191a-41e4-9450-f05665408e27");
        expect(info[0].entityType).toBe(4);
        expect(info[0].createdFromBuffer).toBe(1655893515198700n);
        expect(info[0].lastEdited).toBe(1655893515304910n);
        expect(info[0].updateDelta).toBe(0);
        expect(info[0].simulatedDelta).toBe(0);
        expect(info[0].simOwnerData).toBeUndefined();
        expect(info[0].parentID).toBeUndefined();
        expect(info[0].parentJointIndex).toBeUndefined();
        expect(info[0].visible).toBeUndefined();
        expect(info[0].name).toBeUndefined();
        expect(info[0].locked).toBe(false);
        expect(info[0].userData).toBeUndefined();
        expect(info[0].privateUserData).toBeUndefined();
        expect(info[0].href).toBeUndefined();
        expect(info[0].description).toBeUndefined();
        expect(info[0].position).toBeUndefined();
        expect(info[0].dimensions).toBeUndefined();
        expect(info[0].rotation).toBeUndefined();
        expect(info[0].registrationPoint).toBeUndefined();
        expect(info[0].created).toBeUndefined();
        expect(info[0].lastEditedBy).toBeUndefined();
        expect(info[0].entityHostType).toBe(HostType.DOMAIN);
        expect(info[0].queryAACube).toBeUndefined();
        expect(info[0].canCastShadow).toBeUndefined();
        expect(info[0].renderLayer).toBeUndefined();
        expect(info[0].primitiveMode).toBeUndefined();
        expect(info[0].ignorePickIntersection).toBeUndefined();
        expect(info[0].renderWithZones).toBeUndefined();
        expect(info[0].billboardMode).toBeUndefined();
        expect(info[0].grab).toBeUndefined();
        expect(info[0].density).toBeUndefined();
        expect(info[0].velocity).toBeUndefined();
        expect(info[0].angularVelocity).toBeUndefined();
        expect(info[0].gravity.x).toBeCloseTo(0, 2);
        expect(info[0].gravity.y).toBeCloseTo(0, 2);
        expect(info[0].gravity.z).toBeCloseTo(0, 2);
        expect(info[0].acceleration.x).toBeCloseTo(0, 2);
        expect(info[0].acceleration.y).toBeCloseTo(0, 2);
        expect(info[0].acceleration.z).toBeCloseTo(0, 2);
        expect(info[0].damping).toBeUndefined();
        expect(info[0].angularDamping).toBeUndefined();
        expect(info[0].restitution).toBeCloseTo(0.5, 3);
        expect(info[0].friction).toBeCloseTo(0.5, 3);
        expect(info[0].lifetime).toBeCloseTo(-1, 2);
        expect(info[0].collisionless).toBeUndefined();
        expect(info[0].collisionMask).toBe(31);
        expect(info[0].dynamic).toBeUndefined();
        expect(info[0].collisionSoundURL).toBeUndefined();
        expect(info[0].actionData).toBeUndefined();
        expect(info[0].cloneable).toBe(false);
        expect(info[0].cloneLifetime).toBeCloseTo(300, 2);
        expect(info[0].cloneLimit).toBeCloseTo(0, 2);
        expect(info[0].cloneDynamic).toBe(false);
        expect(info[0].cloneAvatarEntity).toBe(false);
        expect(info[0].cloneOriginID).toBeUndefined();
        expect(info[0].script).toBeUndefined();
        expect(info[0].scriptTimestamp).toBe(0n);
        expect(info[0].serverScripts).toBeUndefined();
        expect(info[0].itemName).toBeUndefined();
        expect(info[0].itemDescription).toBeUndefined();
        expect(info[0].itemCategories).toBeUndefined();
        expect(info[0].itemArtist).toBeUndefined();
        expect(info[0].itemLicense).toBeUndefined();
        expect(info[0].limitedRun).toBe(4294967295);
        expect(info[0].marketplaceID).toBeUndefined();
        expect(info[0].editionNumber).toBe(0);
        expect(info[0].entityInstanceNumber).toBe(0);
        expect(info[0].certificateID).toBeUndefined();
        expect(info[0].certificateType).toBeUndefined();
        expect(info[0].staticCertificateVersion).toBe(0);
        expect(info[0].shapeType).toBe(0);
        expect(info[0].compoundShapeURL).toBe("");
        expect(info[0].color.red).toBe(255);
        expect(info[0].color.green).toBe(255);
        expect(info[0].color.blue).toBe(255);
        expect(info[0].textures).toBe("");
        expect(info[0].modelURL).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );
        expect(info[0].modelScale.x).toBeCloseTo(1, 2);
        expect(info[0].modelScale.y).toBeCloseTo(1, 2);
        expect(info[0].modelScale.z).toBeCloseTo(1, 2);
        expect(info[0].jointRotationsSet).toBeUndefined();
        expect(info[0].jointRotations).toBeUndefined();
        expect(info[0].jointTranslationsSet).toBeUndefined();
        expect(info[0].jointTranslations).toBeUndefined();
        expect(info[0].relayParentJoints).toBe(false);
        expect(info[0].groupCulled).toBe(false);
        expect(info[0].blendShapeCoefficients).toBe("{\n}\n");
        expect(info[0].useOriginalPivot).toBe(true);
        expect(info[0].animation.url).toBe("");
        expect(info[0].animation.allowTranslation).toBe(false);
        expect(info[0].animation.fps).toBeCloseTo(30, 2);
        expect(info[0].animation.currentFrame).toBeCloseTo(0, 2);
        expect(info[0].animation.running).toBe(false);
        expect(info[0].animation.loop).toBe(true);
        expect(info[0].animation.firstFrame).toBeCloseTo(0, 2);
        expect(info[0].animation.lastFrame).toBeCloseTo(100000, 2);
        expect(info[0].animation.hold).toBe(false);

        // Second Model Entity.
        expect(info[1].entityItemID instanceof Uuid).toBe(true);
        expect(info[1].entityItemID.stringify().toString()).toBe("2e26ea38-c1eb-48a3-8410-bee1aba958e0");
        expect(info[1].entityType).toBe(4);
        expect(info[1].createdFromBuffer).toBe(1655893407496516n);
        expect(info[1].lastEdited).toBe(1655893407602795n);
        expect(info[1].updateDelta).toBe(0);
        expect(info[1].simulatedDelta).toBe(0);
        expect(info[1].simOwnerData.byteLength).toBe(17);
        expect(info[1].simOwnerData).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        expect(info[1].parentID).toBeNull();
        expect(info[1].parentJointIndex).toBe(65535);
        expect(info[1].visible).toBe(true);
        expect(info[1].name).toBeUndefined();
        expect(info[1].locked).toBe(false);
        expect(info[1].userData).toBeUndefined();
        expect(info[1].privateUserData).toBeUndefined();
        expect(info[1].href).toBeUndefined();
        expect(info[1].description).toBeUndefined();
        expect(info[1].position.x).toBeCloseTo(-1.28613, 4);
        expect(info[1].position.y).toBeCloseTo(-2.05091, 4);
        expect(info[1].position.z).toBeCloseTo(-0.63774, 4);
        expect(info[1].dimensions.x).toBeCloseTo(0.357114, 4);
        expect(info[1].dimensions.y).toBeCloseTo(0.144428, 3);
        expect(info[1].dimensions.z).toBeCloseTo(0.356657, 3);
        expect(info[1].rotation.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].rotation.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].rotation.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].rotation.w).toBeCloseTo(1, 2);
        expect(info[1].registrationPoint.x).toBeCloseTo(0.5, 3);
        expect(info[1].registrationPoint.y).toBeCloseTo(0.5, 3);
        expect(info[1].registrationPoint.z).toBeCloseTo(0.5, 3);
        expect(info[1].created).toBe(1655893407496516n);
        expect(info[1].lastEditedBy instanceof Uuid).toBe(true);
        expect(info[1].lastEditedBy.stringify()).toBe("49c19ac5-e413-4579-80e8-a0899444cb01");
        expect(info[1].entityHostType).toBe(HostType.DOMAIN);
        expect(info[1].queryAACube.corner.x).toBeCloseTo(-1.548620, 3);
        expect(info[1].queryAACube.corner.y).toBeCloseTo(-2.31339, 3);
        expect(info[1].queryAACube.corner.z).toBeCloseTo(-0.900225, 3);
        expect(info[1].queryAACube.scale).toBeCloseTo(0.524970, 3);
        expect(info[1].canCastShadow).toBe(true);
        expect(info[1].renderLayer).toBe(0);
        expect(info[1].primitiveMode).toBe(0);
        expect(info[1].ignorePickIntersection).toBe(false);
        expect(info[1].renderWithZones).toBeUndefined();
        expect(info[1].billboardMode).toBe(0);
        expect(info[1].grab.grabbable).toBe(false);
        expect(info[1].grab.grabKinematic).toBe(true);
        expect(info[1].grab.grabFollowsController).toBe(true);
        expect(info[1].grab.triggerable).toBe(false);
        expect(info[1].grab.equippable).toBe(false);
        expect(info[1].grab.grabDelegateToParent).toBe(true);
        expect(info[1].grab.equippableLeftPositionOffset.x).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableLeftPositionOffset.y).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableLeftPositionOffset.z).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableLeftRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableLeftRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableLeftRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableLeftRotationOffset.w).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableRightPositionOffset.x).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableRightPositionOffset.y).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableRightPositionOffset.z).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableRightRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableRightRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableRightRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableRightRotationOffset.w).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableIndicatorURL).toBeUndefined();
        expect(info[1].grab.equippableIndicatorScale.x).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableIndicatorScale.y).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableIndicatorScale.z).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableIndicatorOffset.x).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableIndicatorOffset.y).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableIndicatorOffset.z).toBeCloseTo(0, 2);
        expect(info[1].density).toBeCloseTo(1000, 2);
        expect(info[1].velocity.x).toBeCloseTo(0, 2);
        expect(info[1].velocity.y).toBeCloseTo(0, 2);
        expect(info[1].velocity.z).toBeCloseTo(0, 2);
        expect(info[1].angularVelocity.x).toBeCloseTo(0, 2);
        expect(info[1].angularVelocity.y).toBeCloseTo(0, 2);
        expect(info[1].angularVelocity.z).toBeCloseTo(0, 2);
        expect(info[1].gravity.x).toBeCloseTo(0, 2);
        expect(info[1].gravity.y).toBeCloseTo(0, 2);
        expect(info[1].gravity.z).toBeCloseTo(0, 2);
        expect(info[1].acceleration.x).toBeCloseTo(0, 2);
        expect(info[1].acceleration.y).toBeCloseTo(0, 2);
        expect(info[1].acceleration.z).toBeCloseTo(0, 2);
        expect(info[1].damping).toBeCloseTo(0, 2);
        expect(info[1].angularDamping).toBeCloseTo(0, 2);
        expect(info[1].restitution).toBeCloseTo(0.5, 3);
        expect(info[1].friction).toBeCloseTo(0.5, 3);
        expect(info[1].lifetime).toBeCloseTo(-1, 2);
        expect(info[1].collisionless).toBe(false);
        expect(info[1].collisionMask).toBe(31);
        expect(info[1].dynamic).toBe(false);
        expect(info[1].collisionSoundURL).toBeUndefined();
        expect(info[1].actionData).toBeUndefined();
        expect(info[1].cloneable).toBe(false);
        expect(info[1].cloneLifetime).toBeCloseTo(300, 2);
        expect(info[1].cloneLimit).toBeCloseTo(0, 2);
        expect(info[1].cloneDynamic).toBe(false);
        expect(info[1].cloneAvatarEntity).toBe(false);
        expect(info[1].cloneOriginID).toBeUndefined();
        expect(info[1].script).toBeUndefined();
        expect(info[1].scriptTimestamp).toBe(0n);
        expect(info[1].serverScripts).toBeUndefined();
        expect(info[1].itemName).toBeUndefined();
        expect(info[1].itemDescription).toBeUndefined();
        expect(info[1].itemCategories).toBeUndefined();
        expect(info[1].itemArtist).toBeUndefined();
        expect(info[1].itemLicense).toBeUndefined();
        expect(info[1].limitedRun).toBe(4294967295);
        expect(info[1].marketplaceID).toBeUndefined();
        expect(info[1].editionNumber).toBe(0);
        expect(info[1].entityInstanceNumber).toBe(0);
        expect(info[1].certificateID).toBeUndefined();
        expect(info[1].certificateType).toBeUndefined();
        expect(info[1].staticCertificateVersion).toBe(0);
        expect(info[1].shapeType).toBe(0);
        expect(info[1].compoundShapeURL).toBe("");
        expect(info[1].color.red).toBe(255);
        expect(info[1].color.green).toBe(255);
        expect(info[1].color.blue).toBe(255);
        expect(info[1].textures).toBe("");
        expect(info[1].modelURL).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );
        expect(info[1].modelScale.x).toBeCloseTo(1, 2);
        expect(info[1].modelScale.y).toBeCloseTo(1, 2);
        expect(info[1].modelScale.z).toBeCloseTo(1, 2);
        expect(info[1].jointRotationsSet).toBeUndefined();
        expect(info[1].jointRotations).toBeUndefined();
        expect(info[1].jointTranslationsSet).toBeUndefined();
        expect(info[1].jointTranslations).toBeUndefined();
        expect(info[1].relayParentJoints).toBe(false);
        expect(info[1].groupCulled).toBe(false);
        expect(info[1].blendShapeCoefficients).toBe("{\n}\n");
        expect(info[1].useOriginalPivot).toBe(true);
        expect(info[1].animation.url).toBe("");
        expect(info[1].animation.allowTranslation).toBe(false);
        expect(info[1].animation.fps).toBeCloseTo(30, 2);
        expect(info[1].animation.currentFrame).toBeCloseTo(0, 2);
        expect(info[1].animation.running).toBe(false);
        expect(info[1].animation.loop).toBe(true);
        expect(info[1].animation.firstFrame).toBeCloseTo(0, 2);
        expect(info[1].animation.lastFrame).toBeCloseTo(100000, 2);
        expect(info[1].animation.hold).toBe(false);
    });

    test("Can read a Model entity and a Shape entity in the same packet", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "c0000000c6026c9ae30500a401000003f578da63606002c22d6f12ee9beff07cd53d5b9281cbf2ce64812487db69b31eb33214b077a683680686ffffecff9ffd0f063f2ce4ffff1364c002feff67e460484ecc4ed5cdcf4b858bc61eb8becf28eff4fe13811ef687ae6fb3637a2a6cb769f636bbfff560f81fa8c41e8661160b3008a89dbe9b22e291b8bf63e622e9b7f697f284f4f707b1bfdddf21cf6a5f9fc266cf886e392350044510c97cac620df6088c0caa5c18c807509f34ec6790878b4d73c6af0714a878e418181218324a4a0a8aadf4f59353f2740df5ca328b9213533213f592f373f54b8b7553750df59d12ab12138bf41d8b8b534b8af57df35352738af5ddf2f353f493328b4a3252122be34131a39f9e5392862aa4979e93843d345818aab96ab92081fac11112ca6032e0b03b838fecb68e5dacdee15b0227bb7a6457e425ccddf51e9c58e2f802b2c089663ecfff1fffff9b4352cd03fb05b8d20c2743714662016aa231ef6cdcefad7365bfa0a296fdd9333e76308c2dd1c02cc64c3467b64cdfff20fcd5fe33937fdbad89d96837fc13cd96f708b7a1ba938321a42833312f3d27150032cbedbe";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(2);

        // First Model Entity.
        expect(info[0].entityItemID instanceof Uuid).toBe(true);
        expect(info[0].entityItemID.stringify()).toBe("b4ec60df-37b8-49ea-8b9b-19000a39dc93");
        expect(info[0].entityType).toBe(4);
        expect(info[0].createdFromBuffer).toBe(1657627173666914n);
        expect(info[0].lastEdited).toBe(1657627185055600n);
        expect(info[0].updateDelta).toBe(0);
        expect(info[0].simulatedDelta).toBe(0);
        expect(info[0].simOwnerData).toHaveLength(17);
        expect(info[0].simOwnerData).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        expect(info[0].parentID).toBeNull();
        expect(info[0].parentJointIndex).toBe(65535);
        expect(info[0].visible).toBe(true);
        expect(info[0].name).toBe("cake-one");
        expect(info[0].locked).toBe(false);
        expect(info[0].userData).toBeUndefined();
        expect(info[0].privateUserData).toBeUndefined();
        expect(info[0].href).toBeUndefined();
        expect(info[0].description).toBeUndefined();
        expect(info[0].position.x).toBeCloseTo(-0.4213, 3);
        expect(info[0].position.y).toBeCloseTo(-1.5893, 3);
        expect(info[0].position.z).toBeCloseTo(0.7824, 3);
        expect(info[0].dimensions.x).toBeCloseTo(0.3571, 3);
        expect(info[0].dimensions.y).toBeCloseTo(0.1444, 3);
        expect(info[0].dimensions.z).toBeCloseTo(0.3566, 3);
        expect(info[0].rotation.x).toBeCloseTo(-0.000015, 3);
        expect(info[0].rotation.y).toBeCloseTo(-0.000015, 3);
        expect(info[0].rotation.z).toBeCloseTo(-0.000015, 3);
        expect(info[0].registrationPoint.x).toBeCloseTo(0.5, 2);
        expect(info[0].registrationPoint.y).toBeCloseTo(0.5, 2);
        expect(info[0].registrationPoint.z).toBeCloseTo(0.5, 2);
        expect(info[0].created).toBe(1657627173666914n);
        expect(info[0].lastEditedBy instanceof Uuid).toBe(true);
        expect(info[0].lastEditedBy.stringify()).toBe("1026cbdd-6414-4861-bf88-99a21bed3fd2");
        expect(info[0].entityHostType).toBe(HostType.DOMAIN);
        expect(info[0].queryAACube.corner.x).toBeCloseTo(-0.68387, 4);
        expect(info[0].queryAACube.corner.y).toBeCloseTo(-1.85178, 4);
        expect(info[0].queryAACube.corner.z).toBeCloseTo(0.52001, 4);
        expect(info[0].queryAACube.scale).toBeCloseTo(0.524970, 3);
        expect(info[0].canCastShadow).toBe(true);
        expect(info[0].renderLayer).toBe(0);
        expect(info[0].primitiveMode).toBe(0);
        expect(info[0].ignorePickIntersection).toBe(false);
        expect(info[0].renderWithZones).toBeUndefined();
        expect(info[0].billboardMode).toBe(0);
        expect(info[0].grab.grabbable).toBe(false);
        expect(info[0].grab.grabKinematic).toBe(true);
        expect(info[0].grab.grabFollowsController).toBe(true);
        expect(info[0].grab.triggerable).toBe(false);
        expect(info[0].grab.equippable).toBe(false);
        expect(info[0].grab.grabDelegateToParent).toBe(true);
        expect(info[0].grab.equippableLeftPositionOffset.x).toBe(0);
        expect(info[0].grab.equippableLeftPositionOffset.y).toBe(0);
        expect(info[0].grab.equippableLeftPositionOffset.z).toBe(0);
        expect(info[0].grab.equippableLeftRotationOffset.x).toBeCloseTo(-0.000015, 6);
        expect(info[0].grab.equippableLeftRotationOffset.y).toBeCloseTo(-0.000015, 6);
        expect(info[0].grab.equippableLeftRotationOffset.z).toBeCloseTo(-0.000015, 6);
        expect(info[0].grab.equippableRightPositionOffset.x).toBe(0);
        expect(info[0].grab.equippableRightPositionOffset.y).toBe(0);
        expect(info[0].grab.equippableRightPositionOffset.z).toBe(0);
        expect(info[0].grab.equippableRightRotationOffset.x).toBeCloseTo(-0.000015, 6);
        expect(info[0].grab.equippableRightRotationOffset.y).toBeCloseTo(-0.000015, 6);
        expect(info[0].grab.equippableRightRotationOffset.z).toBeCloseTo(-0.000015, 6);
        expect(info[0].grab.equippableIndicatorURL).toBeUndefined();
        expect(info[0].grab.equippableIndicatorScale.x).toBe(1);
        expect(info[0].grab.equippableIndicatorScale.y).toBe(1);
        expect(info[0].grab.equippableIndicatorScale.z).toBe(1);
        expect(info[0].grab.equippableIndicatorOffset.x).toBe(0);
        expect(info[0].grab.equippableIndicatorOffset.y).toBe(0);
        expect(info[0].grab.equippableIndicatorOffset.z).toBe(0);
        expect(info[0].density).toBe(1000);
        expect(info[0].velocity.x).toBe(0);
        expect(info[0].velocity.y).toBe(0);
        expect(info[0].velocity.z).toBe(0);
        expect(info[0].angularVelocity.x).toBe(0);
        expect(info[0].angularVelocity.y).toBe(0);
        expect(info[0].angularVelocity.z).toBe(0);
        expect(info[0].gravity.x).toBeCloseTo(0, 2);
        expect(info[0].gravity.y).toBeCloseTo(0, 2);
        expect(info[0].gravity.z).toBeCloseTo(0, 2);
        expect(info[0].acceleration.x).toBeCloseTo(0, 2);
        expect(info[0].acceleration.y).toBeCloseTo(0, 2);
        expect(info[0].acceleration.z).toBeCloseTo(0, 2);
        expect(info[0].damping).toBe(0);
        expect(info[0].angularDamping).toBe(0);
        expect(info[0].restitution).toBeCloseTo(0.5, 3);
        expect(info[0].friction).toBeCloseTo(0.5, 3);
        expect(info[0].lifetime).toBeCloseTo(-1, 2);
        expect(info[0].collisionless).toBe(false);
        expect(info[0].collisionMask).toBe(31);
        expect(info[0].dynamic).toBe(false);
        expect(info[0].collisionSoundURL).toBeUndefined();
        expect(info[0].actionData).toBeUndefined();
        expect(info[0].cloneable).toBe(false);
        expect(info[0].cloneLifetime).toBeCloseTo(300, 2);
        expect(info[0].cloneLimit).toBeCloseTo(0, 2);
        expect(info[0].cloneDynamic).toBe(false);
        expect(info[0].cloneAvatarEntity).toBe(false);
        expect(info[0].cloneOriginID).toBeUndefined();
        expect(info[0].script).toBeUndefined();
        expect(info[0].scriptTimestamp).toBe(0n);
        expect(info[0].serverScripts).toBeUndefined();
        expect(info[0].itemName).toBeUndefined();
        expect(info[0].itemDescription).toBeUndefined();
        expect(info[0].itemCategories).toBeUndefined();
        expect(info[0].itemArtist).toBeUndefined();
        expect(info[0].itemLicense).toBeUndefined();
        expect(info[0].limitedRun).toBe(4294967295);
        expect(info[0].marketplaceID).toBeUndefined();
        expect(info[0].editionNumber).toBe(0);
        expect(info[0].entityInstanceNumber).toBe(0);
        expect(info[0].certificateID).toBeUndefined();
        expect(info[0].certificateType).toBeUndefined();
        expect(info[0].staticCertificateVersion).toBe(0);
        expect(info[0].shapeType).toBe(0);
        expect(info[0].compoundShapeURL).toBe("");
        expect(info[0].color.red).toBe(255);
        expect(info[0].color.green).toBe(255);
        expect(info[0].color.blue).toBe(255);
        expect(info[0].textures).toBe("");
        expect(info[0].modelURL).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );
        expect(info[0].modelScale.x).toBeCloseTo(1, 2);
        expect(info[0].modelScale.y).toBeCloseTo(1, 2);
        expect(info[0].modelScale.z).toBeCloseTo(1, 2);
        expect(info[0].jointRotationsSet).toBeUndefined();
        expect(info[0].jointRotations).toBeUndefined();
        expect(info[0].jointTranslationsSet).toBeUndefined();
        expect(info[0].jointTranslations).toBeUndefined();
        expect(info[0].relayParentJoints).toBe(false);
        expect(info[0].groupCulled).toBe(false);
        expect(info[0].blendShapeCoefficients).toBe("{\n}\n");
        expect(info[0].useOriginalPivot).toBe(true);
        expect(info[0].animation.url).toBe("");
        expect(info[0].animation.allowTranslation).toBe(false);
        expect(info[0].animation.fps).toBeCloseTo(30, 2);
        expect(info[0].animation.currentFrame).toBeCloseTo(0, 2);
        expect(info[0].animation.running).toBe(false);
        expect(info[0].animation.loop).toBe(true);
        expect(info[0].animation.firstFrame).toBeCloseTo(0, 2);
        expect(info[0].animation.lastFrame).toBeCloseTo(100000, 2);
        expect(info[0].animation.hold).toBe(false);

        // Shape Entity.
        expect(info[1].entityItemID instanceof Uuid).toBe(true);
        expect(info[1].entityItemID.stringify().toString()).toBe("4c1db688-ba05-4b57-b451-9345486b786e");
        expect(info[1].entityType).toBe(3);
        expect(info[1].createdFromBuffer).toBe(1657627191786141n);
        expect(info[1].lastEdited).toBe(1657627231653470n);
        expect(info[1].updateDelta).toBe(0);
        expect(info[1].simulatedDelta).toBe(3134);
        expect(info[1].simOwnerData.byteLength).toBe(17);
        expect(info[1].simOwnerData).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        expect(info[1].parentID).toBeNull();
        expect(info[1].parentJointIndex).toBe(65535);
        expect(info[1].visible).toBe(true);
        expect(info[1].name).toBe("shape-one");
        expect(info[1].locked).toBe(false);
        expect(info[1].userData).toBeUndefined();
        expect(info[1].privateUserData).toBeUndefined();
        expect(info[1].href).toBeUndefined();
        expect(info[1].description).toBeUndefined();
        expect(info[1].position.x).toBeCloseTo(-1.01199, 4);
        expect(info[1].position.y).toBeCloseTo(-1.65760, 4);
        expect(info[1].position.z).toBeCloseTo(0.664567, 4);
        expect(info[1].dimensions.x).toBeCloseTo(0.200000, 4);
        expect(info[1].dimensions.y).toBeCloseTo(0.200000, 4);
        expect(info[1].dimensions.z).toBeCloseTo(0.200000, 4);
        expect(info[1].rotation.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].rotation.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].rotation.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].rotation.w).toBeCloseTo(1, 2);
        expect(info[1].registrationPoint.x).toBeCloseTo(0.5, 3);
        expect(info[1].registrationPoint.y).toBeCloseTo(0.5, 3);
        expect(info[1].registrationPoint.z).toBeCloseTo(0.5, 3);
        expect(info[1].created).toBe(1657627191786141n);
        expect(info[1].lastEditedBy instanceof Uuid).toBe(true);
        expect(info[1].lastEditedBy.stringify()).toBe("1026cbdd-6414-4861-bf88-99a21bed3fd2");
        expect(info[1].entityHostType).toBe(HostType.DOMAIN);
        expect(info[1].queryAACube.corner.x).toBeCloseTo(-1.18520, 4);
        expect(info[1].queryAACube.corner.y).toBeCloseTo(-1.83080, 4);
        expect(info[1].queryAACube.corner.z).toBeCloseTo(0.49136, 4);
        expect(info[1].queryAACube.scale).toBeCloseTo(0.34641, 4);
        expect(info[1].canCastShadow).toBe(true);
        expect(info[1].renderLayer).toBe(0);
        expect(info[1].primitiveMode).toBe(0);
        expect(info[1].ignorePickIntersection).toBe(false);
        expect(info[1].renderWithZones).toBeUndefined();
        expect(info[1].billboardMode).toBe(0);
        expect(info[1].grab.grabbable).toBe(false);
        expect(info[1].grab.grabKinematic).toBe(true);
        expect(info[1].grab.grabFollowsController).toBe(true);
        expect(info[1].grab.triggerable).toBe(false);
        expect(info[1].grab.equippable).toBe(false);
        expect(info[1].grab.grabDelegateToParent).toBe(true);
        expect(info[1].grab.equippableLeftPositionOffset.x).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableLeftPositionOffset.y).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableLeftPositionOffset.z).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableLeftRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableLeftRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableLeftRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableLeftRotationOffset.w).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableRightPositionOffset.x).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableRightPositionOffset.y).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableRightPositionOffset.z).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableRightRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableRightRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableRightRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].grab.equippableRightRotationOffset.w).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableIndicatorURL).toBeUndefined();
        expect(info[1].grab.equippableIndicatorScale.x).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableIndicatorScale.y).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableIndicatorScale.z).toBeCloseTo(1, 2);
        expect(info[1].grab.equippableIndicatorOffset.x).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableIndicatorOffset.y).toBeCloseTo(0, 2);
        expect(info[1].grab.equippableIndicatorOffset.z).toBeCloseTo(0, 2);
        expect(info[1].density).toBeCloseTo(1000, 2);
        expect(info[1].velocity.x).toBeCloseTo(0, 2);
        expect(info[1].velocity.y).toBeCloseTo(0, 2);
        expect(info[1].velocity.z).toBeCloseTo(0, 2);
        expect(info[1].angularVelocity.x).toBeCloseTo(0, 2);
        expect(info[1].angularVelocity.y).toBeCloseTo(0, 2);
        expect(info[1].angularVelocity.z).toBeCloseTo(0, 2);
        expect(info[1].gravity.x).toBeCloseTo(0, 2);
        expect(info[1].gravity.y).toBeCloseTo(0, 2);
        expect(info[1].gravity.z).toBeCloseTo(0, 2);
        expect(info[1].acceleration.x).toBeCloseTo(0, 2);
        expect(info[1].acceleration.y).toBeCloseTo(0, 2);
        expect(info[1].acceleration.z).toBeCloseTo(0, 2);
        expect(info[1].damping).toBeCloseTo(0, 2);
        expect(info[1].angularDamping).toBeCloseTo(0, 2);
        expect(info[1].restitution).toBeCloseTo(0.5, 3);
        expect(info[1].friction).toBeCloseTo(0.5, 3);
        expect(info[1].lifetime).toBeCloseTo(-1, 2);
        expect(info[1].collisionless).toBe(false);
        expect(info[1].collisionMask).toBe(31);
        expect(info[1].dynamic).toBe(false);
        expect(info[1].collisionSoundURL).toBeUndefined();
        expect(info[1].actionData).toBeUndefined();
        expect(info[1].cloneable).toBe(false);
        expect(info[1].cloneLifetime).toBeCloseTo(300, 2);
        expect(info[1].cloneLimit).toBeCloseTo(0, 2);
        expect(info[1].cloneDynamic).toBe(false);
        expect(info[1].cloneAvatarEntity).toBe(false);
        expect(info[1].cloneOriginID).toBeUndefined();
        expect(info[1].script).toBeUndefined();
        expect(info[1].scriptTimestamp).toBe(0n);
        expect(info[1].serverScripts).toBeUndefined();
        expect(info[1].itemName).toBeUndefined();
        expect(info[1].itemDescription).toBeUndefined();
        expect(info[1].itemCategories).toBeUndefined();
        expect(info[1].itemArtist).toBeUndefined();
        expect(info[1].itemLicense).toBeUndefined();
        expect(info[1].limitedRun).toBe(4294967295);
        expect(info[1].marketplaceID).toBeUndefined();
        expect(info[1].editionNumber).toBe(0);
        expect(info[1].entityInstanceNumber).toBe(0);
        expect(info[1].certificateID).toBeUndefined();
        expect(info[1].certificateType).toBeUndefined();
        expect(info[1].staticCertificateVersion).toBe(0);
        expect(info[1].color.red).toBe(0);
        expect(info[1].color.green).toBe(180);
        expect(info[1].color.blue).toBe(239);
        expect(info[1].alpha).toBe(1);
        expect(info[1].shape).toBe("Triangle");
    });

    test("Can read a Web entity", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "c00100dc79c06b03e6050065010000025878da636038c9c0c8e0f566ba77ea3fd70dedae7fe72d79b0e150c1ee557c37989eb132f8f4d8653203690686ff7feaffcffe0f061fe4ef3f1064c002feff6744e21db1fee592abf0cb6597dc2f97b367ced8a7a5a5d9735d57b6f95f0f86ff814aec6118669f00c3dccec3754ac51eb326ac79df5030bdfb702a50371ff32f9768c65f2e9f7ebdb26744b7941128822288643e56b1067b044606552e0ce403a84f1af633c8c3c5a639e3d7030a4b4cd12bcbaf80420ac24175a7284346494941b195be7e59665172624a66a25e727eaebe1c508a9f111c14ed0cbef95599393989faa67a060a1a3e9979a515d60a8e792945f999290a667a06d60a7ea915a5c50aa60a4ea5993929fabe418ea6167e9a0a8e050539a9e1a949de9925faa6c6e67ac6660a1ade1e21be3e3a0a3999d9a90aeea9c9d9f99a0ace1945f9b9a9fa16c67a067a268606c67a8646460abef9499939a90ac1896989459950dd00545d922c";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(1);
        expect(info[0].entityItemID.stringify()).toBe("4aec974b-65fe-45b0-8745-fd9ea4e0b0c2");
        expect(info[0].entityType).toBe(7);
        expect(info[0].sourceURL).toBe("https://vircadia.com/");
        expect(info[0].color.red).toBe(212);
        expect(info[0].color.green).toBe(167);
        expect(info[0].color.blue).toBe(212);
        expect(info[0].alpha).toBeCloseTo(0.9, 5);
        expect(info[0].dpi).toBe(30);
        expect(info[0].scriptURL).toBe("");
        expect(info[0].maxFPS).toBe(15);
        expect(info[0].inputMode).toBe(1);
        expect(info[0].showKeyboardFocusHighlight).toBe(true);
        expect(info[0].useBackground).toBe(true);
        // eslint-disable-next-line max-len
        expect(info[0].userAgent).toBe("Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.122 Mobile Safari/537.36");
    });

    test("Can read a ParticleEffect entity", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "c00100c8a4560358e6050021010000017d78da636038c9c0c8a034495c6ffd5957ed953b6746a728dabfe46060607810f68c95812f8283210248334ce6f8ffbf810102e4fff1ff07821f0c7000e23260007630e96257c5c0d0600f1102d130360343024346494941b195be7e724a9eaea15e59665172624a66a25e727eae7e69b16eaaaea1be536255626291be6371716a49b17e486a454969516ab1be4b6a5a62690e50c433af24b5282d3139553f0522145f90585492999c93aa579097ce0fb1c8819181e18003c8eab3677cec7457e52e676cb4fa04928038c7c1e1ec9933b685b65ef687bf9eb0ef3fc47a202dad0de44c1006cb41b08f1d10db02f5d8218b89b0723130683b3330843841e877405a03480b39c394403dfcc0fe4de00edb6a113dbb1d72acf68c0014c87322";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(1);
        expect(info[0].entityItemID.stringify()).toBe("2292172e-afcd-452b-a9b9-995b64213fe9");
        expect(info[0].entityType).toBe(8);
        expect(info[0].shapeType).toBe(ShapeType.CYLINDER_Y);
        expect(info[0].compoundShapeURL).toBe("");
        expect(info[0].color).toStrictEqual({ red: 68, green: 62, blue: 122 });
        expect(info[0].alpha).toBe(1);
        expect(info[0].textures)
            .toBe("https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Textures/Defaults/Interface/default_particle.png");
        expect(info[0].maxParticles).toBe(15);
    });

    test("Can read a Light entity", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "c001004eb8bf9306e605005b000000006c78da636038c9c0c8902d1ed29cb3d5b57c09f3ba9a69ed1daa169bd2d912d99eb13274f0f74e04d10c4d02ff7f304000e3ff070a760c70f01f08183080deac798c67cfcc7188e96fb2676098eb74f64c8f3d0097c71e79";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(1);
        expect(info[0].entityItemID.stringify()).toBe("6b175483-6cb5-4577-a403-ae7c96878825");
        expect(info[0].entityType).toBe(14);
        expect(info[0].color.red).toBe(46);
        expect(info[0].color.green).toBe(154);
        expect(info[0].color.blue).toBe(158);
        expect(info[0].intensity).toBeCloseTo(4.9, 4);
        expect(info[0].falloffRadius).toBeCloseTo(1.1, 4);
        expect(info[0].isSpotlight).toBe(true);
        expect(info[0].exponent).toBeCloseTo(1.02, 4);
        expect(info[0].cutoff).toBeCloseTo(78.5, 4);
    });

    test("Can read a Material entity", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "c0010063b8d95f00e605002f010000026e78da636038c9c0c47031ede2d3ca692e47565b07ff56dabde69502030383c3bfa7ac0c1bf38f45313c636560e83cf3ff07030430ff7f60bf800109fc0702060cd0dfdfcfc0d0600fe18068189b81818d21b82023b52875ca533b39df7c97d6f57752fc78161933b2c0ac7db2785e34c45a83ff7feaffcffe0f061f18e43f08625a2480e1fcffff1991153854b9c0f0d933676c61f87f3d18829c6e8f84c10e1060d059b4618edb0907a64efeb4dd125f62b6edbf57e902c367d3aa5c18d19dc10814411144321fab182c4c10e102014097920fa0be68d8cf200f179be68c5f0ff6f8e361c84d2c492dca4ccc71492c4904893001fd6700093d1f3b20b64f4b4b03dae5e0a8c650ad04535cac6455ad949893949a92af64156da067a963a06701c486b1b5b58c00bfaf9a03";
        // Sphere and Material entity. The Material entity is parented to the Sphere entity.

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(2);

        // Sphere entity.
        expect(info[0].entityItemID.stringify()).toBe("d166d1e5-7996-44c4-ab3b-53fb22bbacea");
        expect(info[0].entityType).toBe(2);

        // Material entity.
        expect(info[1].entityItemID.stringify()).toBe("94e53e1e-4d6f-4485-afdc-644e0ca23301");
        expect(info[1].entityType).toBe(16);
        expect(info[1].parentID).toStrictEqual(info[0].entityItemID);
        expect(info[1].materialURL).toBe("materialData");
        expect(info[1].materialMappingMode).toBe(0);
        expect(info[1].priority).toBe(2);
        expect(info[1].parentMaterialName).toBe("0");
        expect(info[1].materialMappingPos.x).toBeCloseTo(0.1, 6);
        expect(info[1].materialMappingPos.y).toBeCloseTo(0.2, 6);
        expect(info[1].materialMappingScale.x).toBeCloseTo(0.8, 6);
        expect(info[1].materialMappingScale.y).toBeCloseTo(0.9, 6);
        expect(info[1].materialMappingRot).toBe(12);
        expect(info[1].materialData).toBe("{\"materials\":{\"albedo\":[0.9,0.8,0.1]}}");
        expect(info[1].materialRepeat).toBe(true);
    });

    test("Can read a Zone entity", () => {
        // eslint-disable-next-line max-len
        const bufferHex = "c0000088a9dc6128e605008e010000041d78da636038c9c0c490efda6374b2d17766d3ce95bb4f962ebe56c1c0c070427a052bc395dc706ef567ac0c0c5b36fcff7ffcffcffdffc1808d11441e1064c000020c9eda1cb70bd97cf4fab3f75e7cb03a73d3ffff8c6c0cc1d99549f9158c305535491db64ebb6aed0f4ddc7d609fbd8c1b830304c7d8ff7748b9b9b81fa8c41e09839d22c09077ddfa77918f4fe614458fed7e32ebbbd604b01fb3f0673f969ac17eec6340bb1b866318a1180efed783e17f5c620df6088c0caa5c18c807505f34ec6790878b4d73c6af0714bc0c58fd039683b9f0338be97e20b6678458a1e004c48eb20c89250556fa29f9b9899979fa79a949a53989bac5e008d02bc84b076a27a002e4df86599bff3fdd0c3476812390f070460b0c9040839db1b1b17d5a5a9a3d23349099a0183ddcd19384032c4e6f96409357d8ff1fffff9b4312d703fb0582d8c3848187c1bd28bf342f45a12027312f156ec53ad9e3db1f9ce2d9cfc020610109850670683cacff0782ffc94b4e8cc33d39316c798f701baa3b59189c4b935201a499e4ee";
        // Zone and box entity.

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(2);

        // Zone entity.
        expect(info[0].entityItemID.stringify()).toBe("6f458c32-c981-4d99-82b9-a9bbc975a3d6");
        expect(info[0].entityType).toBe(15);
        expect(info[0].shapeType).toBe(ShapeType.BOX);
        expect(info[0].compoundShapeURL).toBe("");
        expect(info[0].flyingAllowed).toBe(true);
        expect(info[0].ghostingAllowed).toBe(true);
        expect(info[0].filterURL).toBe("");
        expect(info[0].keyLightMode).toBe(ComponentMode.INHERIT);
        expect(info[0].skyboxMode).toBe(ComponentMode.ENABLED);
        expect(info[0].skybox.color).toStrictEqual({ red: 255, green: 255, blue: 255 });
        expect(info[0].skybox.url).toBe("atp:/domain/nebula-skybox.png");
        expect(info[0].ambientLightMode).toBe(ComponentMode.ENABLED);
        expect(info[0].ambientLight.intensity).toBeCloseTo(10.0, 4);
        expect(info[0].ambientLight.url).toBe("atp:/domain/nebula-skybox.png");
        expect(info[0].hazeMode).toBe(ComponentMode.DISABLED);
        expect(info[0].bloomMode).toBe(ComponentMode.DISABLED);
        expect(info[0].avatarPriority).toBe(AvatarPriorityMode.INHERIT);
        expect(info[0].screenshare).toBe(ComponentMode.INHERIT);

        // Box entity.
        expect(info[1].entityItemID.stringify()).toBe("492b08db-7106-4c2e-8f6b-bdd1e0ab69b2");
        expect(info[1].entityType).toBe(1);

    });

    test("Can skip over Line entity types", () => {
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        // Packet data containing an Line entity, a Material entity and a Shape entity.
        // eslint-disable-next-line max-len
        const bufferHex = "c00000aeef465048e4050008020000057f78da636060626066d8f6e8fb1cbd3ad737dbaac4764f71957de2e110c5ede7f1849501463330fcfff1ffbff97f3078a0a020c88005fcffcf88cc3dec60bf2034e9408051a03d90e700c10df6ffeb851ffdafb7bd04e4dbc330cc1a0106d6abb1eb98e7392deae05155487e72e32383adfdfe0b5a0b0f6c38abb71f688003239a9d8c8c401114c1fff560f81f9758833d0223832a170612c1b3929376208cf0c916670679b8f43467fcda414189459401181f40d7ed477521888fec7a06863bbd1b121e5aba77b4cc98d15e775f6e268bd09cb7eaa040646c5ee9048eb3a68eff7feaffcf8644da0706f90f58624d80c147765bc72e56eff02d81935d3db22bf280b1c8c3909b58925a949998a39b9f970a577bf68ccf3e04fb8c2d0c23852e3c46618e1160f855354fe06a8b7ff98e334fdaac75963d38d1676c1f30a9fa40c01f9e3d2fb25fdb0dee1805863ba5318a084d97c49244b01781d00064feac9992286e3761a85682290e4b2d2acecccf53b232d4818b152b59552b25e624a5a6e42b59451bea18ea18c4d6d632a2476102d0a88c598f5919f89816d88293c26413e4fc6bbf0057fee56428ce482c484589f6896f6bec5b6b0a0e3cefd1b003260138c616ed308b05181e7359551f79eafb6577defbd71fbb96cf3afbc70c1eed0ffa9f60443bc300463b12a05eb4336c798f701baa3b39184280b199979e930a005f7a3ffa";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(2);

        // Material entity.
        expect(info[0].entityItemID instanceof Uuid).toBe(true);
        expect(info[0].entityItemID.stringify()).toBe("dc8db060-e139-4788-8498-98877edf1e99");
        expect(info[0].entityType).toBe(16);

        // Shape entity.
        expect(info[1].entityItemID instanceof Uuid).toBe(true);
        expect(info[1].entityItemID.stringify()).toBe("4c1db688-ba05-4b57-b451-9345486b786e");
        expect(info[1].entityType).toBe(3);

        log.mockReset();
    });

    test("Can skip over PolyVox entity type", () => {
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        // Packet data containing a PolyVox entity and a Model entity.
        // eslint-disable-next-line max-len
        const bufferHex = "c001004968ee534ae4050021030000043c78da63606002c2df893b3ebdaef769dc57a155a13a2b592cc3c8543bc8eb092bc3f515109a81e1ff0f06041038cbc8a000860c8c8719187a122b6ebdbdeb3de9b001876be0fbfacb25f90b9a2f1d329a747eee33df475aeb18ffafe386e8abe8f9a1faf367b20ab78b4a276be3cffa89f21a09e75fc96b74ef5712f4540289ea327d3e9ee89214be4ae3019b2dcf9c8afc55ef3a543e4e3a20e4ce5bea68203b652bfbe6a7f2135596310b7a2639261cbcaf1318e03b39f99cd5fada1fcbe5979d9f6d1df25db291ebf0132e2d239e7333f4f3f2f997bd5652f2dca3726131f72ac31ecd9567eb3ebdfcf9e8e7a77e0fa168962a8d1567a7a45cde9dc170f31e7ffa94ff8a5c59c912ce0157db8a371daca8d997111009b646f8f09a9b8745b66a7cdbc26b26f157ba87ef697d47d3b7ccc09cc0552c976a9d2addff7f982697b65cb2dd216c8dc52f7f8d3f1b42bb830c1f474c12e06844461c021daaab54b50e472c8a5ab4ab67b56ba1e4f5d43b5bb924250aef786cdbd874c7e35b6cb3a18280f9a4d288493ba6fe9dd3107df3e3c3887b571655cc78f7c9e06e917d8f89c4978f7dba5dc77ffe9e52df289f63f021d7dc2253425f244bf88393a2cd86e55fbd9cd79bacf9ce5cbd20cbeb53d0d34d9bff7f9968129f70d877fd79ab90d072cf6a07fe8abb739e1e0e5ac60c8a8f03e17f18ccf22c7f6e799370df7c87e7abeed9920c5c9677260b00e532663d666558201bfac81314ff7b0efcff67ffffec7f30f86121ffff9f200316f0ff3f230743726276aa6e7e5e2a5c34f6c0f57d3db79b0e88ace37638747d9b1dd35361bb4db3b7d9fdaf07c3ff4025f648186cb30043da5ff9b7aae61e355b5b19181f3ed4e2cf13d2df7fc5b1fb00c7e1aff6f5296cf68ce896330245500491ccc72ad6608fc0c8a0ca85817c00f545c37e0679b8d83467fc7a40818a478e81218121a3a4a4a0d84a5f3f39254fd750af2cb32839312533512f393f57bfb4583755d750df29b12a31b148dfb1b838b5a458df373f2535a758df2d3f3f453f29b3a8242325b1321e1433fae9392569a8427ae93949d8438385a19aab960b12a81f1c21a10c26030ebb3300009ee2669a";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(1);

        // Model Entity.
        expect(info[0].entityItemID instanceof Uuid).toBe(true);
        expect(info[0].entityItemID.stringify()).toBe("b4ec60df-37b8-49ea-8b9b-19000a39dc93");
        expect(info[0].entityType).toBe(4);

        log.mockReset();
    });

    test("Can skip over PolyLine entity type", () => {
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        // Packet data containing a PolyLine entity and a Model entity.
        // eslint-disable-next-line max-len
        const bufferHex = "c00000b67cb7664ae4050013020000047678da6360600242fe8a1bad7fa43c27af7f10b8b6c6af6fa146f1a2bb295e4f5819603403c3ff3ff5ff67ff07830f02f6070419b080ffff1991787e82d6076e6d987de08682a8435a9a9ac3d93367ec4d8c8dedffd73f7cfbbf7ec941a0127b1886d923c0a0a5617ce2f16d3793c92f0fe7997607bddfbcb4ffc0b3b3670ffc9be56c6f58e2e1c08866272323500445f07f3d18fec725d6608fc0c8a0ca858144f0ace4a41d08237c32cd99411e2e0de4e005a0b0c422cac0e0c590515252506ca5af9f9c92a76ba8579659949c989299a8979c9fab5f5aac9baa6ba8ef929f9b9899e79c9f57929a57a21f925f99945fa19f96935fee585452ac5f5294989953ac579097ce0cf2f17ea80bd140032cfc19981980b1633b6be64cbbb3677cec98114afed5dbe36603837dcb9b84fbe63b3c5f75cf9664e0b2bc335900289731eb312bc302d9d0479ea094b3e7c0ff7ff6ffcf4292ce0f0bf9ffff70a51d0e86e4c4ec54ddfcbc54b868ec81ebfb7a6e371d1059c7ed70e8fa363ba6a7c2769b666fb3438a4f7b240cb6598021edaffc5b55738f9aadad0c8c0f1f6af1e709e9efbfe2d87d80e3f057fbfa14367bf434c43080690809407d018c2d4ad3105c8e81218188b4e49458959858a4ef585c9c0a4c3bbef929a939c5fa6ef9f929fa4999452519298995f1a098d14fcf29494315d24bcf49c21e1a2c0cd55cb55c9040fde0080965301970d89d01005b2410c7";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(1);

        // Model Entity.
        expect(info[0].entityItemID instanceof Uuid).toBe(true);
        expect(info[0].entityItemID.stringify()).toBe("b4ec60df-37b8-49ea-8b9b-19000a39dc93");
        expect(info[0].entityType).toBe(4);

        log.mockReset();
    });

    test("Can skip over Grid entity type", () => {
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        // Packet data containing a Grid entity and a Model entity.
        // eslint-disable-next-line max-len
        const bufferHex = "c0000022fcece84ae40500b801000003eb78da63606002c2580397e28b1afe9bf74e897970ebfb2b4d89ed52a1f7bc9eb032c0680686ff3ffeff37ff0f060fec7708326001ffff3322731f2bee6317fe7c40677a9a0303c3092710e6baae6cf3bf1e0cff0355d8c330cc1a01868c92a4a81337bd7317e4a43f8ecf72b5b8b0a7f710dfdc398754cddb0eddcbe6756644b393911128822288643e56b1067b044606552e0c2482672527ed4018e19369ce0cf2706920072f000525565184dbd0dcc902a1ecb7bc49b86fbec3f355f76c49062ecb3b9305808219b31eb3322c900d7de4098aae3d07feffb3ff7f16125f3f2ce4ffffc315631c0cc989d9a9baf979a970d1d803d7f7f5dc6e3a20b28edbe1d0f56d764c4f85ed36cdde66872de660360b30a4fd957fab6aee51b3b59581f1e1432dfe3c21fdfd571cbb0f701cfe6a5f9fc2668f1e730c0318734800ea8b86fd14c71c52fc2500d3714941b195be7e724a9eaea15e59665172624a66a25e727eae7e69b16eaaaea1be536255626291be6371716a49b1be6f7e4a6a4eb1be5b7e7e8a7e52665149464a62653c2866f4d3734ad25085f4d27392b087060b4335572d1724503f384242194c061c76670000a482e73d";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(1);

        // Model Entity.
        expect(info[0].entityItemID instanceof Uuid).toBe(true);
        expect(info[0].entityItemID.stringify()).toBe("b4ec60df-37b8-49ea-8b9b-19000a39dc93");
        expect(info[0].entityType).toBe(4);

        log.mockReset();
    });

    test("Can skip over Gizmo entity type", () => {
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        // Packet data containing a Gizmo entity and a Model entity.
        // eslint-disable-next-line max-len
        const bufferHex = "c00000eb0ae37e5be40500bb010000040b78da6360600242cd1b6247233fb8d5cf57319ec35f76d12a42c490373ffa092b038c6660f8ffcffeffd9ff60f08381ffff3f41062ce0ff7f4624de2769de031127180e9648b239323034d8e70b355b81e8fff560f81fa8c41e8661160930a89de673f7d8e9fb637371ce19f6fb45cb0d62ad0e2c97e039e839e9abc33796adf68c687632320245500491ccc72ad6608fc0c8a0ca858144f0ace4a41d08237c32cd99411e2e0de4e005a0c0c42567e2c4c0b005acff3f44e17f886a64c7a37b8001a6f297b7c88b33f2feb59b6bee5eba5ebcbc490028d3e10b0cdef250ad34707c8620c7a7853ceef8e460484ecc4ed5cdcf4b858b1eb40cde7f79cff503d2fab71d0e5ddf66c7f454d86ed3ec6d76d8e21566b10083f22b2b3b7e0107a7198bdecfca7be3f084c1ac7bbfb4f28303974f5c72a84f61c3885786018c572400f545c37e2ac52b582a8121a3a4a4a0d84a5f3f39254fd750af2cb32839312533512f393f57bfb4583755d750df29b12a31b148dfb1b838b5a458df373f2535a758df2d3f3f453f29b3a8242325b1321e1433fae9392569a8427ae93949d8438385a19aab960b12a81f1c21a10c26030ebb3300003de3f0d3";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info).toHaveLength(1);

        // Model Entity.
        expect(info[0].entityItemID instanceof Uuid).toBe(true);
        expect(info[0].entityItemID.stringify()).toBe("fa4b14e8-cc1f-4f7d-b37c-ddd2d773a782");
        expect(info[0].entityType).toBe(4);

        log.mockReset();
    });

});
