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
        const bufferHex = "758b96c9877644f3ad4be1547abd4d7f10518841cb6ee00500602043cb6ee005000000fffe3fffcdfffffffffffff8381ffffe110000000000000000000000000000000000000000ffff010000000000000000000000a485363f125a19c0a44259c0c2d7b63e02e5133eb29bb63eff7fff7fff7fffff0000003f0000003f0000003f518841cb6ee005001000520c174208e040c888a3dc32968b7b6b5cd127bf1d3b94bf7e1073be7f64063f01000000000000000000000000000000000101000001000000000000000000000000ff7fff7fff7fffff000000000000000000000000ff7fff7fff7fffff00000000803f0000803f0000803f00000000000000000000000000007a4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003f0000003f000080bf001f0000000000000000009643000000000000000000000000000000000000000000000000000000000000ffffffff000000000000000000000000000000000000000000000000ffffff0000600068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f4173736574732f4d6f64656c732f466f6f642f62697274686461795f63616b652f676c74662f62697274686461795f63616b652e676c620000803f0000803f0000803f0000000000000000000004007b0a7d0a010000000000f041000000000001000000000050c34700";

        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const info = EntityData.read(data);
        expect(info.id instanceof Uuid).toBe(true);
        expect(info.id.value().toString()).toBe("156244463098396166476369691145112735103");
        expect(info.entityType).toBe(4);
        expect(info.created).toBe(1654141344647249n);
        expect(info.lastEdited).toBe(1654141344751712n);
        expect(info.updateDelta).toBe(0);
        expect(info.simulatedDelta).toBe(0);
        expect(info.propSimOwnerData.byteLength).toBe(17);
        expect(info.propSimOwnerData).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        expect(info.propParentID).toBeUndefined();
        expect(info.propParentJointIndex).toBe(65535);
        expect(info.propVisible).toBe(true);
        expect(info.propName).toBeUndefined();
        expect(info.propLocked).toBe(false);
        expect(info.propUserData).toBeUndefined();
        expect(info.propPrivateUserData).toBeUndefined();
        expect(info.propHref).toBeUndefined();
        expect(info.propDescription).toBeUndefined();

        expect(info.propPosition.x).toBeCloseTo(0.712977, 3);
        expect(info.propPosition.y).toBeCloseTo(-2.39612, 3);
        expect(info.propPosition.z).toBeCloseTo(-3.39469, 3);

        expect(info.propDimension.x).toBeCloseTo(0.357115, 3);
        expect(info.propDimension.y).toBeCloseTo(0.144428, 3);
        expect(info.propDimension.z).toBeCloseTo(0.356657, 3);

        expect(info.propRotation.x).toBeCloseTo(-0.0000152588, 8);
        expect(info.propRotation.y).toBeCloseTo(-0.0000152588, 8);
        expect(info.propRotation.z).toBeCloseTo(-0.0000152588, 8);
        expect(info.propRotation.w).toBeCloseTo(1, 2);

        expect(info.propRegistrationPoint.x).toBeCloseTo(0.5, 3);
        expect(info.propRegistrationPoint.y).toBeCloseTo(0.5, 3);
        expect(info.propRegistrationPoint.z).toBeCloseTo(0.5, 3);

        expect(info.propCreated).toBe(1654141344647249n);
        expect(info.propLastEdited instanceof Uuid).toBe(true);
        expect(info.propLastEdited.value().toString()).toBe("109059474943892114832334688063949863787");

        expect(info.propAaCubeData.corner.x).toBeCloseTo(-0.655538, 3);
        expect(info.propAaCubeData.corner.y).toBeCloseTo(-1.15805, 3);
        expect(info.propAaCubeData.corner.z).toBeCloseTo(-0.237368, 3);
        expect(info.propAaCubeData.scale).toBeCloseTo(0.524971, 3);

        expect(info.propCanCastShadow).toBe(true);
        expect(info.propRenderLayer).toBe(0);
        expect(info.propPrimitiveMode).toBe(0);
        expect(info.propIgnorePickIntersection).toBe(false);

        expect(info.propRenderWithZones).toBeUndefined();
        expect(info.propBillboardMode).toBe(0);

        expect(info.propGrabbable).toBe(false);
        expect(info.propKinematic).toBe(true);
        expect(info.propFollowsController).toBe(true);
        expect(info.propTriggerable).toBe(false);
        expect(info.propEquippable).toBe(false);
        expect(info.propDelegateToParent).toBe(true);

        expect(info.propGrabLeftEquippablePositionOffset.x).toBeCloseTo(0, 2);
        expect(info.propGrabLeftEquippablePositionOffset.y).toBeCloseTo(0, 2);
        expect(info.propGrabLeftEquippablePositionOffset.z).toBeCloseTo(0, 2);

        expect(info.propGrabLeftEquippableRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info.propGrabLeftEquippableRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info.propGrabLeftEquippableRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info.propGrabLeftEquippableRotationOffset.w).toBeCloseTo(1, 2);

        expect(info.propGrabRightEquippablePositionOffset.x).toBeCloseTo(0, 2);
        expect(info.propGrabRightEquippablePositionOffset.y).toBeCloseTo(0, 2);
        expect(info.propGrabRightEquippablePositionOffset.z).toBeCloseTo(0, 2);

        expect(info.propGrabRightEquippableRotationOffset.x).toBeCloseTo(-0.0000152588, 8);
        expect(info.propGrabRightEquippableRotationOffset.y).toBeCloseTo(-0.0000152588, 8);
        expect(info.propGrabRightEquippableRotationOffset.z).toBeCloseTo(-0.0000152588, 8);
        expect(info.propGrabRightEquippableRotationOffset.w).toBeCloseTo(1, 2);

        expect(info.propGrabEquippableIndicatorUrl).toBeUndefined();

        expect(info.propGrabRightEquippableIndicatorScale.x).toBeCloseTo(1, 2);
        expect(info.propGrabRightEquippableIndicatorScale.y).toBeCloseTo(1, 2);
        expect(info.propGrabRightEquippableIndicatorScale.z).toBeCloseTo(1, 2);

        expect(info.propGrabRightEquippableIndicatorOffset.x).toBeCloseTo(0, 2);
        expect(info.propGrabRightEquippableIndicatorOffset.y).toBeCloseTo(0, 2);
        expect(info.propGrabRightEquippableIndicatorOffset.z).toBeCloseTo(0, 2);

        expect(info.propDensity).toBeCloseTo(1000, 2);

        expect(info.propVelocity.x).toBeCloseTo(0, 2);
        expect(info.propVelocity.y).toBeCloseTo(0, 2);
        expect(info.propVelocity.z).toBeCloseTo(0, 2);

        expect(info.propAngularVelocity.x).toBeCloseTo(0, 2);
        expect(info.propAngularVelocity.y).toBeCloseTo(0, 2);
        expect(info.propAngularVelocity.z).toBeCloseTo(0, 2);

        expect(info.propGravity.x).toBeCloseTo(0, 2);
        expect(info.propGravity.y).toBeCloseTo(0, 2);
        expect(info.propGravity.z).toBeCloseTo(0, 2);

        expect(info.propAcceleration.x).toBeCloseTo(0, 2);
        expect(info.propAcceleration.y).toBeCloseTo(0, 2);
        expect(info.propAcceleration.z).toBeCloseTo(0, 2);

        expect(info.propDamping).toBeCloseTo(0, 2);
        expect(info.propAngularDampling).toBeCloseTo(0, 2);
        expect(info.propRestitution).toBeCloseTo(0.5, 3);
        expect(info.propFriction).toBeCloseTo(0.5, 3);
        expect(info.propLifetime).toBeCloseTo(-1, 2);

        expect(info.propCollisionless).toBe(false);
        expect(info.propCollisionMask).toBe(31);
        expect(info.propDynamic).toBe(false);
        expect(info.propCollisionSoundUrl).toBeUndefined();

        expect(info.propActionData).toBeUndefined();

        expect(info.propCloneable).toBe(false);
        expect(info.propCloneLifetime).toBeCloseTo(300, 2);
        expect(info.propCloneLimit).toBeCloseTo(0, 2);
        expect(info.propCloneDynamic).toBe(false);
        expect(info.propCloneAvatarIdentity).toBe(false);

        expect(info.propCloneOriginId).toBeUndefined();
        expect(info.propScript).toBeUndefined();
        expect(info.propScriptTimestamp).toBe(0n);
        expect(info.propServerScripts).toBeUndefined();
        expect(info.propItemName).toBeUndefined();
        expect(info.propItemDescription).toBeUndefined();
        expect(info.propItemCategories).toBeUndefined();
        expect(info.propItemArtist).toBeUndefined();
        expect(info.propItemLicense).toBeUndefined();

        expect(info.propLimitedRun).toBe(4294967295);

        expect(info.propMarketplaceID).toBeUndefined();

        expect(info.propEditionNumber).toBe(0);
        expect(info.propEntityInstanceNumber).toBe(0);
        expect(info.propCertificateID).toBeUndefined();
        expect(info.propCertificateType).toBeUndefined();
        expect(info.propStaticCertificateVersion).toBe(0);

        expect(info.propShapeType).toBe(0);
        expect(info.propCompoundShapeUrl).toBeUndefined();

        expect(info.propColor.x).toBe(255);
        expect(info.propColor.y).toBe(255);
        expect(info.propColor.z).toBe(255);

        expect(info.propTextures).toBeUndefined();

        expect(info.propModelUrl).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );

        expect(info.propModelScale.x).toBeCloseTo(1, 2);
        expect(info.propModelScale.y).toBeCloseTo(1, 2);
        expect(info.propModelScale.z).toBeCloseTo(1, 2);

        expect(info.propJointRotationsSet).toBeUndefined();
        expect(info.propJointRotations).toBeUndefined();
        expect(info.propJointTranslationsSet).toBeUndefined();
        expect(info.propJointTranslations).toBeUndefined();

        expect(info.propRelayParentJoints).toBe(false);
        expect(info.propGroupCulled).toBe(false);

        expect(info.propBlendShapeCoefficients).toBe("{\n}\n");

        expect(info.propUseOriginalPivot).toBe(true);
        expect(info.propAnimationUrl).toBeUndefined();
        expect(info.propAnimationAllowTranslation).toBe(false);
        expect(info.propAnimationFPS).toBeCloseTo(30, 2);
        expect(info.propAnimationFrameIndex).toBeCloseTo(0, 2);

        expect(info.propAnimationPlaying).toBe(false);
        expect(info.propAnimationLoop).toBe(true);

        expect(info.propAnimationFirstFrame).toBeCloseTo(0, 2);
        expect(info.propAnimationLastFrame).toBeCloseTo(100000, 2);

        expect(info.propAnimationHold).toBe(false);
    });

});
