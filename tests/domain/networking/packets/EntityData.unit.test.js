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

import Uuid from "../../../../src/domain/shared/Uuid";
import EntityData from "../../../../src/domain/networking/packets/EntityData";


describe("EntityData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can read one Model Entity in a packet", () => {
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
        expect(info[0].created).toBe(1655451515775649n);
        expect(info[0].lastEdited).toBe(1655451515775649n);
        expect(info[0].updateDelta).toBe(2);
        expect(info[0].simulatedDelta).toBe(2);
        expect(info[0].propSimOwnerData.byteLength).toBe(17);
        expect(info[0].propSimOwnerData).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        expect(info[0].propParentID).toBeUndefined();
        expect(info[0].propParentJointIndex).toBe(65535);
        expect(info[0].propVisible).toBe(false);
        expect(info[0].propName).toBeUndefined();
        expect(info[0].propLocked).toBe(false);
        expect(info[0].propUserData).toBeUndefined();
        expect(info[0].propPrivateUserData).toBeUndefined();
        expect(info[0].propHref).toBeUndefined();
        expect(info[0].propDescription).toBeUndefined();

        expect(info[0].propPosition.x).toBeCloseTo(0.752809, 3);
        expect(info[0].propPosition.y).toBeCloseTo(-12.4463, 3);
        expect(info[0].propPosition.z).toBeCloseTo(2.885479, 3);

        expect(info[0].propDimension.x).toBeCloseTo(0.100000, 3);
        expect(info[0].propDimension.y).toBeCloseTo(0.100000, 3);
        expect(info[0].propDimension.z).toBeCloseTo(0.100000, 3);

        expect(info[0].propRotation.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propRotation.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propRotation.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propRotation.w).toBeCloseTo(1, 2);

        expect(info[0].propRegistrationPoint.x).toBeCloseTo(0.5, 3);
        expect(info[0].propRegistrationPoint.y).toBeCloseTo(0.5, 3);
        expect(info[0].propRegistrationPoint.z).toBeCloseTo(0.5, 3);

        expect(info[0].propCreated).toBe(1655451515775649n);
        expect(info[0].propLastEditedBy instanceof Uuid).toBe(true);
        expect(info[0].propLastEditedBy.stringify()).toBe("e0a1aa03-b104-4476-a927-28a804e9d44a");

        expect(info[0].propAaCubeData.corner.x).toBeCloseTo(0.6662073, 3);
        expect(info[0].propAaCubeData.corner.y).toBeCloseTo(-12.5329, 3);
        expect(info[0].propAaCubeData.corner.z).toBeCloseTo(2.7988767, 3);
        expect(info[0].propAaCubeData.scale).toBeCloseTo(0.173205, 3);

        expect(info[0].propCanCastShadow).toBe(true);
        expect(info[0].propRenderLayer).toBe(0);
        expect(info[0].propPrimitiveMode).toBe(0);
        expect(info[0].propIgnorePickIntersection).toBe(false);

        expect(info[0].propRenderWithZones).toBeUndefined();
        expect(info[0].propBillboardMode).toBe(0);

        expect(info[0].propGrabbable).toBe(false);
        expect(info[0].propKinematic).toBe(true);
        expect(info[0].propFollowsController).toBe(true);
        expect(info[0].propTriggerable).toBe(false);
        expect(info[0].propEquippable).toBe(false);
        expect(info[0].propDelegateToParent).toBe(true);

        expect(info[0].propGrabLeftEquippablePositionOffset.x).toBeCloseTo(0, 2);
        expect(info[0].propGrabLeftEquippablePositionOffset.y).toBeCloseTo(0, 2);
        expect(info[0].propGrabLeftEquippablePositionOffset.z).toBeCloseTo(0, 2);

        expect(info[0].propGrabLeftEquippableRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propGrabLeftEquippableRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propGrabLeftEquippableRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propGrabLeftEquippableRotationOffset.w).toBeCloseTo(1, 2);

        expect(info[0].propGrabRightEquippablePositionOffset.x).toBeCloseTo(0, 2);
        expect(info[0].propGrabRightEquippablePositionOffset.y).toBeCloseTo(0, 2);
        expect(info[0].propGrabRightEquippablePositionOffset.z).toBeCloseTo(0, 2);

        expect(info[0].propGrabRightEquippableRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propGrabRightEquippableRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propGrabRightEquippableRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[0].propGrabRightEquippableRotationOffset.w).toBeCloseTo(1, 2);

        expect(info[0].propGrabEquippableIndicatorUrl).toBeUndefined();

        expect(info[0].propGrabRightEquippableIndicatorScale.x).toBeCloseTo(1, 2);
        expect(info[0].propGrabRightEquippableIndicatorScale.y).toBeCloseTo(1, 2);
        expect(info[0].propGrabRightEquippableIndicatorScale.z).toBeCloseTo(1, 2);

        expect(info[0].propGrabRightEquippableIndicatorOffset.x).toBeCloseTo(0, 2);
        expect(info[0].propGrabRightEquippableIndicatorOffset.y).toBeCloseTo(0, 2);
        expect(info[0].propGrabRightEquippableIndicatorOffset.z).toBeCloseTo(0, 2);

        expect(info[0].propDensity).toBeCloseTo(1000, 2);

        expect(info[0].propVelocity.x).toBeCloseTo(0, 2);
        expect(info[0].propVelocity.y).toBeCloseTo(0, 2);
        expect(info[0].propVelocity.z).toBeCloseTo(0, 2);

        expect(info[0].propAngularVelocity.x).toBeCloseTo(0, 2);
        expect(info[0].propAngularVelocity.y).toBeCloseTo(0, 2);
        expect(info[0].propAngularVelocity.z).toBeCloseTo(0, 2);

        expect(info[0].propGravity.x).toBeCloseTo(0, 2);
        expect(info[0].propGravity.y).toBeCloseTo(0, 2);
        expect(info[0].propGravity.z).toBeCloseTo(0, 2);

        expect(info[0].propAcceleration.x).toBeCloseTo(0, 2);
        expect(info[0].propAcceleration.y).toBeCloseTo(0, 2);
        expect(info[0].propAcceleration.z).toBeCloseTo(0, 2);

        expect(info[0].propDamping).toBeCloseTo(0, 2);
        expect(info[0].propAngularDampling).toBeCloseTo(0, 2);
        expect(info[0].propRestitution).toBeCloseTo(0.5, 3);
        expect(info[0].propFriction).toBeCloseTo(0.5, 3);
        expect(info[0].propLifetime).toBeCloseTo(-1, 2);

        expect(info[0].propCollisionless).toBe(false);
        expect(info[0].propCollisionMask).toBe(31);
        expect(info[0].propDynamic).toBe(false);
        expect(info[0].propCollisionSoundUrl).toBeUndefined();

        expect(info[0].propActionData).toBeUndefined();

        expect(info[0].propCloneable).toBe(false);
        expect(info[0].propCloneLifetime).toBeCloseTo(300, 2);
        expect(info[0].propCloneLimit).toBeCloseTo(0, 2);
        expect(info[0].propCloneDynamic).toBe(false);
        expect(info[0].propCloneAvatarIdentity).toBe(false);

        expect(info[0].propCloneOriginId).toBeUndefined();
        expect(info[0].propScript).toBeUndefined();
        expect(info[0].propScriptTimestamp).toBe(0n);
        expect(info[0].propServerScripts).toBeUndefined();
        expect(info[0].propItemName).toBeUndefined();
        expect(info[0].propItemDescription).toBeUndefined();
        expect(info[0].propItemCategories).toBeUndefined();
        expect(info[0].propItemArtist).toBeUndefined();
        expect(info[0].propItemLicense).toBeUndefined();

        expect(info[0].propLimitedRun).toBe(4294967295);

        expect(info[0].propMarketplaceID).toBeUndefined();

        expect(info[0].propEditionNumber).toBe(0);
        expect(info[0].propEntityInstanceNumber).toBe(0);
        expect(info[0].propCertificateID).toBeUndefined();
        expect(info[0].propCertificateType).toBeUndefined();
        expect(info[0].propStaticCertificateVersion).toBe(0);

        expect(info[0].propShapeType).toBe(0);
        expect(info[0].propCompoundShapeUrl).toBeUndefined();

        expect(info[0].propColor.x).toBe(255);
        expect(info[0].propColor.y).toBe(255);
        expect(info[0].propColor.z).toBe(255);

        expect(info[0].propTextures).toBeUndefined();

        expect(info[0].propModelUrl).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );

        expect(info[0].propModelScale.x).toBeCloseTo(1, 2);
        expect(info[0].propModelScale.y).toBeCloseTo(1, 2);
        expect(info[0].propModelScale.z).toBeCloseTo(1, 2);

        expect(info[0].propJointRotationsSet).toBeUndefined();
        expect(info[0].propJointRotations).toBeUndefined();
        expect(info[0].propJointTranslationsSet).toBeUndefined();
        expect(info[0].propJointTranslations).toBeUndefined();

        expect(info[0].propRelayParentJoints).toBe(false);
        expect(info[0].propGroupCulled).toBe(false);

        expect(info[0].propBlendShapeCoefficients).toBe("{\n}\n");

        expect(info[0].propUseOriginalPivot).toBe(true);
        expect(info[0].propAnimationUrl).toBeUndefined();
        expect(info[0].propAnimationAllowTranslation).toBe(false);
        expect(info[0].propAnimationFPS).toBeCloseTo(30, 2);
        expect(info[0].propAnimationFrameIndex).toBeCloseTo(0, 2);

        expect(info[0].propAnimationPlaying).toBe(false);
        expect(info[0].propAnimationLoop).toBe(true);

        expect(info[0].propAnimationFirstFrame).toBeCloseTo(0, 2);
        expect(info[0].propAnimationLastFrame).toBeCloseTo(100000, 2);

        expect(info[0].propAnimationHold).toBe(false);
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
        expect(info[0].created).toBe(1655893515198700n);
        expect(info[0].lastEdited).toBe(1655893515304910n);
        expect(info[0].updateDelta).toBe(0);
        expect(info[0].simulatedDelta).toBe(0);
        expect(info[0].propSimOwnerData).toBeUndefined();
        expect(info[0].propParentID).toBeUndefined();
        expect(info[0].propParentJointIndex).toBeUndefined();
        expect(info[0].propVisible).toBeUndefined();
        expect(info[0].propName).toBeUndefined();
        expect(info[0].propLocked).toBe(false);
        expect(info[0].propUserData).toBeUndefined();
        expect(info[0].propPrivateUserData).toBeUndefined();
        expect(info[0].propHref).toBeUndefined();
        expect(info[0].propDescription).toBeUndefined();
        expect(info[0].propPosition).toBeUndefined();
        expect(info[0].propDimension).toBeUndefined();
        expect(info[0].propRotation).toBeUndefined();
        expect(info[0].propRegistrationPoint).toBeUndefined();
        expect(info[0].propCreated).toBeUndefined();
        expect(info[0].propLastEditedBy).toBeUndefined();
        expect(info[0].propAaCubeData).toBeUndefined();
        expect(info[0].propCanCastShadow).toBeUndefined();
        expect(info[0].propRenderLayer).toBeUndefined();
        expect(info[0].propPrimitiveMode).toBeUndefined();
        expect(info[0].propIgnorePickIntersection).toBeUndefined();
        expect(info[0].propRenderWithZones).toBeUndefined();
        expect(info[0].propBillboardMode).toBeUndefined();
        expect(info[0].propGrabbable).toBeUndefined();
        expect(info[0].propKinematic).toBeUndefined();
        expect(info[0].propFollowsController).toBeUndefined();
        expect(info[0].propTriggerable).toBeUndefined();
        expect(info[0].propEquippable).toBeUndefined();
        expect(info[0].propDelegateToParent).toBeUndefined();
        expect(info[0].propGrabLeftEquippablePositionOffset).toBeUndefined();
        expect(info[0].propGrabLeftEquippableRotationOffset).toBeUndefined();
        expect(info[0].propGrabRightEquippablePositionOffset).toBeUndefined();
        expect(info[0].propGrabRightEquippableRotationOffset).toBeUndefined();
        expect(info[0].propGrabEquippableIndicatorUrl).toBeUndefined();
        expect(info[0].propGrabRightEquippableIndicatorScale).toBeUndefined();
        expect(info[0].propGrabRightEquippableIndicatorOffset).toBeUndefined();
        expect(info[0].propDensity).toBeUndefined();
        expect(info[0].propVelocity).toBeUndefined();
        expect(info[0].propAngularVelocity).toBeUndefined();
        expect(info[0].propGravity.x).toBeCloseTo(0, 2);
        expect(info[0].propGravity.y).toBeCloseTo(0, 2);
        expect(info[0].propGravity.z).toBeCloseTo(0, 2);
        expect(info[0].propAcceleration.x).toBeCloseTo(0, 2);
        expect(info[0].propAcceleration.y).toBeCloseTo(0, 2);
        expect(info[0].propAcceleration.z).toBeCloseTo(0, 2);
        expect(info[0].propDamping).toBeUndefined();
        expect(info[0].propAngularDampling).toBeUndefined();
        expect(info[0].propRestitution).toBeCloseTo(0.5, 3);
        expect(info[0].propFriction).toBeCloseTo(0.5, 3);
        expect(info[0].propLifetime).toBeCloseTo(-1, 2);
        expect(info[0].propCollisionless).toBeUndefined();
        expect(info[0].propCollisionMask).toBe(31);
        expect(info[0].propDynamic).toBeUndefined();
        expect(info[0].propCollisionSoundUrl).toBeUndefined();
        expect(info[0].propActionData).toBeUndefined();
        expect(info[0].propCloneable).toBe(false);
        expect(info[0].propCloneLifetime).toBeCloseTo(300, 2);
        expect(info[0].propCloneLimit).toBeCloseTo(0, 2);
        expect(info[0].propCloneDynamic).toBe(false);
        expect(info[0].propCloneAvatarIdentity).toBe(false);
        expect(info[0].propCloneOriginId).toBeUndefined();
        expect(info[0].propScript).toBeUndefined();
        expect(info[0].propScriptTimestamp).toBe(0n);
        expect(info[0].propServerScripts).toBeUndefined();
        expect(info[0].propItemName).toBeUndefined();
        expect(info[0].propItemDescription).toBeUndefined();
        expect(info[0].propItemCategories).toBeUndefined();
        expect(info[0].propItemArtist).toBeUndefined();
        expect(info[0].propItemLicense).toBeUndefined();
        expect(info[0].propLimitedRun).toBe(4294967295);
        expect(info[0].propMarketplaceID).toBeUndefined();
        expect(info[0].propEditionNumber).toBe(0);
        expect(info[0].propEntityInstanceNumber).toBe(0);
        expect(info[0].propCertificateID).toBeUndefined();
        expect(info[0].propCertificateType).toBeUndefined();
        expect(info[0].propStaticCertificateVersion).toBe(0);
        expect(info[0].propShapeType).toBe(0);
        expect(info[0].propCompoundShapeUrl).toBeUndefined();
        expect(info[0].propColor.x).toBe(255);
        expect(info[0].propColor.y).toBe(255);
        expect(info[0].propColor.z).toBe(255);
        expect(info[0].propTextures).toBeUndefined();
        expect(info[0].propModelUrl).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );
        expect(info[0].propModelScale.x).toBeCloseTo(1, 2);
        expect(info[0].propModelScale.y).toBeCloseTo(1, 2);
        expect(info[0].propModelScale.z).toBeCloseTo(1, 2);
        expect(info[0].propJointRotationsSet).toBeUndefined();
        expect(info[0].propJointRotations).toBeUndefined();
        expect(info[0].propJointTranslationsSet).toBeUndefined();
        expect(info[0].propJointTranslations).toBeUndefined();
        expect(info[0].propRelayParentJoints).toBe(false);
        expect(info[0].propGroupCulled).toBe(false);
        expect(info[0].propBlendShapeCoefficients).toBe("{\n}\n");
        expect(info[0].propUseOriginalPivot).toBe(true);
        expect(info[0].propAnimationUrl).toBeUndefined();
        expect(info[0].propAnimationAllowTranslation).toBe(false);
        expect(info[0].propAnimationFPS).toBeCloseTo(30, 2);
        expect(info[0].propAnimationFrameIndex).toBeCloseTo(0, 2);
        expect(info[0].propAnimationPlaying).toBe(false);
        expect(info[0].propAnimationLoop).toBe(true);
        expect(info[0].propAnimationFirstFrame).toBeCloseTo(0, 2);
        expect(info[0].propAnimationLastFrame).toBeCloseTo(100000, 2);
        expect(info[0].propAnimationHold).toBe(false);

        // Second Model Entity.
        expect(info[1].entityItemID instanceof Uuid).toBe(true);
        expect(info[1].entityItemID.stringify().toString()).toBe("2e26ea38-c1eb-48a3-8410-bee1aba958e0");
        expect(info[1].entityType).toBe(4);
        expect(info[1].created).toBe(1655893407496516n);
        expect(info[1].lastEdited).toBe(1655893407602795n);
        expect(info[1].updateDelta).toBe(0);
        expect(info[1].simulatedDelta).toBe(0);
        expect(info[1].propSimOwnerData.byteLength).toBe(17);
        expect(info[1].propSimOwnerData).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        expect(info[1].propParentID).toBeUndefined();
        expect(info[1].propParentJointIndex).toBe(65535);
        expect(info[1].propVisible).toBe(true);
        expect(info[1].propName).toBeUndefined();
        expect(info[1].propLocked).toBe(false);
        expect(info[1].propUserData).toBeUndefined();
        expect(info[1].propPrivateUserData).toBeUndefined();
        expect(info[1].propHref).toBeUndefined();
        expect(info[1].propDescription).toBeUndefined();
        expect(info[1].propPosition.x).toBeCloseTo(-1.28613, 4);
        expect(info[1].propPosition.y).toBeCloseTo(-2.05091, 4);
        expect(info[1].propPosition.z).toBeCloseTo(-0.63774, 4);
        expect(info[1].propDimension.x).toBeCloseTo(0.357114, 4);
        expect(info[1].propDimension.y).toBeCloseTo(0.144428, 3);
        expect(info[1].propDimension.z).toBeCloseTo(0.356657, 3);
        expect(info[1].propRotation.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propRotation.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propRotation.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propRotation.w).toBeCloseTo(1, 2);
        expect(info[1].propRegistrationPoint.x).toBeCloseTo(0.5, 3);
        expect(info[1].propRegistrationPoint.y).toBeCloseTo(0.5, 3);
        expect(info[1].propRegistrationPoint.z).toBeCloseTo(0.5, 3);
        expect(info[1].propCreated).toBe(1655893407496516n);
        expect(info[1].propLastEditedBy instanceof Uuid).toBe(true);
        expect(info[1].propLastEditedBy.stringify()).toBe("49c19ac5-e413-4579-80e8-a0899444cb01");
        expect(info[1].propAaCubeData.corner.x).toBeCloseTo(-1.548620, 3);
        expect(info[1].propAaCubeData.corner.y).toBeCloseTo(-2.31339, 3);
        expect(info[1].propAaCubeData.corner.z).toBeCloseTo(-0.900225, 3);
        expect(info[1].propAaCubeData.scale).toBeCloseTo(0.524970, 3);
        expect(info[1].propCanCastShadow).toBe(true);
        expect(info[1].propRenderLayer).toBe(0);
        expect(info[1].propPrimitiveMode).toBe(0);
        expect(info[1].propIgnorePickIntersection).toBe(false);
        expect(info[1].propRenderWithZones).toBeUndefined();
        expect(info[1].propBillboardMode).toBe(0);
        expect(info[1].propGrabbable).toBe(false);
        expect(info[1].propKinematic).toBe(true);
        expect(info[1].propFollowsController).toBe(true);
        expect(info[1].propTriggerable).toBe(false);
        expect(info[1].propEquippable).toBe(false);
        expect(info[1].propDelegateToParent).toBe(true);
        expect(info[1].propGrabLeftEquippablePositionOffset.x).toBeCloseTo(0, 2);
        expect(info[1].propGrabLeftEquippablePositionOffset.y).toBeCloseTo(0, 2);
        expect(info[1].propGrabLeftEquippablePositionOffset.z).toBeCloseTo(0, 2);
        expect(info[1].propGrabLeftEquippableRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propGrabLeftEquippableRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propGrabLeftEquippableRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propGrabLeftEquippableRotationOffset.w).toBeCloseTo(1, 2);
        expect(info[1].propGrabRightEquippablePositionOffset.x).toBeCloseTo(0, 2);
        expect(info[1].propGrabRightEquippablePositionOffset.y).toBeCloseTo(0, 2);
        expect(info[1].propGrabRightEquippablePositionOffset.z).toBeCloseTo(0, 2);
        expect(info[1].propGrabRightEquippableRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propGrabRightEquippableRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propGrabRightEquippableRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info[1].propGrabRightEquippableRotationOffset.w).toBeCloseTo(1, 2);
        expect(info[1].propGrabEquippableIndicatorUrl).toBeUndefined();
        expect(info[1].propGrabRightEquippableIndicatorScale.x).toBeCloseTo(1, 2);
        expect(info[1].propGrabRightEquippableIndicatorScale.y).toBeCloseTo(1, 2);
        expect(info[1].propGrabRightEquippableIndicatorScale.z).toBeCloseTo(1, 2);
        expect(info[1].propGrabRightEquippableIndicatorOffset.x).toBeCloseTo(0, 2);
        expect(info[1].propGrabRightEquippableIndicatorOffset.y).toBeCloseTo(0, 2);
        expect(info[1].propGrabRightEquippableIndicatorOffset.z).toBeCloseTo(0, 2);
        expect(info[1].propDensity).toBeCloseTo(1000, 2);
        expect(info[1].propVelocity.x).toBeCloseTo(0, 2);
        expect(info[1].propVelocity.y).toBeCloseTo(0, 2);
        expect(info[1].propVelocity.z).toBeCloseTo(0, 2);
        expect(info[1].propAngularVelocity.x).toBeCloseTo(0, 2);
        expect(info[1].propAngularVelocity.y).toBeCloseTo(0, 2);
        expect(info[1].propAngularVelocity.z).toBeCloseTo(0, 2);
        expect(info[1].propGravity.x).toBeCloseTo(0, 2);
        expect(info[1].propGravity.y).toBeCloseTo(0, 2);
        expect(info[1].propGravity.z).toBeCloseTo(0, 2);
        expect(info[1].propAcceleration.x).toBeCloseTo(0, 2);
        expect(info[1].propAcceleration.y).toBeCloseTo(0, 2);
        expect(info[1].propAcceleration.z).toBeCloseTo(0, 2);
        expect(info[1].propDamping).toBeCloseTo(0, 2);
        expect(info[1].propAngularDampling).toBeCloseTo(0, 2);
        expect(info[1].propRestitution).toBeCloseTo(0.5, 3);
        expect(info[1].propFriction).toBeCloseTo(0.5, 3);
        expect(info[1].propLifetime).toBeCloseTo(-1, 2);
        expect(info[1].propCollisionless).toBe(false);
        expect(info[1].propCollisionMask).toBe(31);
        expect(info[1].propDynamic).toBe(false);
        expect(info[1].propCollisionSoundUrl).toBeUndefined();
        expect(info[1].propActionData).toBeUndefined();
        expect(info[1].propCloneable).toBe(false);
        expect(info[1].propCloneLifetime).toBeCloseTo(300, 2);
        expect(info[1].propCloneLimit).toBeCloseTo(0, 2);
        expect(info[1].propCloneDynamic).toBe(false);
        expect(info[1].propCloneAvatarIdentity).toBe(false);
        expect(info[1].propCloneOriginId).toBeUndefined();
        expect(info[1].propScript).toBeUndefined();
        expect(info[1].propScriptTimestamp).toBe(0n);
        expect(info[1].propServerScripts).toBeUndefined();
        expect(info[1].propItemName).toBeUndefined();
        expect(info[1].propItemDescription).toBeUndefined();
        expect(info[1].propItemCategories).toBeUndefined();
        expect(info[1].propItemArtist).toBeUndefined();
        expect(info[1].propItemLicense).toBeUndefined();
        expect(info[1].propLimitedRun).toBe(4294967295);
        expect(info[1].propMarketplaceID).toBeUndefined();
        expect(info[1].propEditionNumber).toBe(0);
        expect(info[1].propEntityInstanceNumber).toBe(0);
        expect(info[1].propCertificateID).toBeUndefined();
        expect(info[1].propCertificateType).toBeUndefined();
        expect(info[1].propStaticCertificateVersion).toBe(0);
        expect(info[1].propShapeType).toBe(0);
        expect(info[1].propCompoundShapeUrl).toBeUndefined();
        expect(info[1].propColor.x).toBe(255);
        expect(info[1].propColor.y).toBe(255);
        expect(info[1].propColor.z).toBe(255);
        expect(info[1].propTextures).toBeUndefined();
        expect(info[1].propModelUrl).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );
        expect(info[1].propModelScale.x).toBeCloseTo(1, 2);
        expect(info[1].propModelScale.y).toBeCloseTo(1, 2);
        expect(info[1].propModelScale.z).toBeCloseTo(1, 2);
        expect(info[1].propJointRotationsSet).toBeUndefined();
        expect(info[1].propJointRotations).toBeUndefined();
        expect(info[1].propJointTranslationsSet).toBeUndefined();
        expect(info[1].propJointTranslations).toBeUndefined();
        expect(info[1].propRelayParentJoints).toBe(false);
        expect(info[1].propGroupCulled).toBe(false);
        expect(info[1].propBlendShapeCoefficients).toBe("{\n}\n");
        expect(info[1].propUseOriginalPivot).toBe(true);
        expect(info[1].propAnimationUrl).toBeUndefined();
        expect(info[1].propAnimationAllowTranslation).toBe(false);
        expect(info[1].propAnimationFPS).toBeCloseTo(30, 2);
        expect(info[1].propAnimationFrameIndex).toBeCloseTo(0, 2);
        expect(info[1].propAnimationPlaying).toBe(false);
        expect(info[1].propAnimationLoop).toBe(true);
        expect(info[1].propAnimationFirstFrame).toBeCloseTo(0, 2);
        expect(info[1].propAnimationLastFrame).toBeCloseTo(100000, 2);
        expect(info[1].propAnimationHold).toBe(false);
    });

});
