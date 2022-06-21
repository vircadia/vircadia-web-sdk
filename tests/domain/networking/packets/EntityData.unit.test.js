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


    test("Can read an EntityData packet", () => {
        // eslint-disable-next-line max-len
        // const bufferHex = "758b96c9877644f3ad4be1547abd4d7f10518841cb6ee00500602043cb6ee005000000fffe3fffcdfffffffffffff8381ffffe110000000000000000000000000000000000000000ffff010000000000000000000000a485363f125a19c0a44259c0c2d7b63e02e5133eb29bb63eff7fff7fff7fffff0000003f0000003f0000003f518841cb6ee005001000520c174208e040c888a3dc32968b7b6b5cd127bf1d3b94bf7e1073be7f64063f01000000000000000000000000000000000101000001000000000000000000000000ff7fff7fff7fffff000000000000000000000000ff7fff7fff7fffff00000000803f0000803f0000803f00000000000000000000000000007a4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003f0000003f000080bf001f0000000000000000009643000000000000000000000000000000000000000000000000000000000000ffffffff000000000000000000000000000000000000000000000000ffffff0000600068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f4173736574732f4d6f64656c732f466f6f642f62697274686461795f63616b652f676c74662f62697274686461795f63616b652e676c620000803f0000803f0000803f0000000000000000000004007b0a7d0a010000000000f041000000000001000000000050c34700";
        // TODO: Prepend to bufferHex c030005f878ad79fe105001a0100000233
        // eslint-disable-next-line max-len
        const bufferHex = "c030005f878ad79fe105001a010000023378da636030666064c85cb6c2caff93d3df6969e6756d5c5ab7041666755d9fff909501462b28fcff67ffffec7f30f86121ffff9f200316f0ff3f324f6d8783bd898afbc18dab2d1cce9e39630bc3ffebc110a4d61e86611609303c58b88a79238b4bd94a758d152c2faf784de8d1b27fdbe671f08c82b1c39a18433b46744b198122288248e663156bb047606450e5c2403e80faa4613f833c5c6c9a337e3da0c0c423c7c090c090515252506ca5af9f9c92a76ba8579659949c989299a8979c9fab5f5aac9baa6ba8ef9458959858a4ef585c9c5a52acef9b9f929a53acef969f9fa29f94595492919258199f9c989daa9f9e5392862aa4979e93843d345818aab96ab92081fac11112ca6032e0b03b03002d4487fd";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info[0].id instanceof Uuid).toBe(true);
        expect(info[0].id.value().toString()).toBe("140434272900721979527483138588357044954");
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
        expect(info[0].propLastEdited instanceof Uuid).toBe(true);
        expect(info[0].propLastEdited.value().toString()).toBe("298586479152146376856893202358342374474");

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

});
