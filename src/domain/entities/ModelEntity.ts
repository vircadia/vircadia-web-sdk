//
//  ModelEntity.ts
//
//  Created by Julien Merzoug on 11 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../networking/udt/UDT";
import type { Color } from "../shared/Color";
import GLMHelpers from "../shared/GLMHelpers";
import PropertyFlags from "../shared/PropertyFlags";
import type { quat } from "../shared/Quat";
import type { vec3 } from "../shared/Vec3";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


// TODO: Spacing with import?
type AnimationProperties = {
    animationURL: string | undefined;
    animationAllowTranslation: boolean | undefined;
    animationFPS: number | undefined;
    animationFrameIndex: number | undefined;
    animationPlaying: boolean | undefined;
    animationLoop: boolean | undefined;
    animationFirstFrame: number | undefined;
    animationLastFrame: number | undefined;
    animationHold: boolean | undefined;
};

type ModelEntityProperties = {
    shapeType: number | undefined;
    compoundShapeURL: string | undefined;
    color: Color | undefined;
    textures: string | undefined;
    modelURL: string | undefined;
    modelScale: vec3 | undefined;
    jointRotationsSet: boolean[] | undefined;
    jointRotations: quat[] | undefined;
    jointTranslationsSet: boolean[] | undefined;
    jointTranslations: vec3[] | undefined;
    groupCulled: boolean | undefined;
    relayParentJoints: boolean | undefined;
    blendShapeCoefficients: string | undefined;
    useOriginalPivot: boolean | undefined;
    animation: AnimationProperties | undefined;
};

type ModelEntitySubclassData = {
    bytesRead: number;
    properties: ModelEntityProperties;
};


// TODO: class doc
const ModelEntity = new class {
    // C++ ModelEntityItem.h, cpp

    // eslint-disable-next-line max-len
    readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ModelEntitySubclassData { // eslint-disable-line class-methods-use-this
        // C++ int ModelEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //     ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //     bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        let shapeType: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE)) {
            shapeType = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let compoundShapeURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                compoundShapeURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let color: Color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
            color = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let textures: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXTURES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                textures = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let modelURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MODEL_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                modelURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let modelScale: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MODEL_SCALE)) {
            modelScale = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let jointRotationsSet: boolean[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS_SET)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointRotationsSet = [];
                for (let j = 0; j < length; j++) {
                    jointRotationsSet.push(Boolean(data.getUint8(dataPosition + j)));
                }
                dataPosition += length;
            }
        }

        let jointRotations: quat[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointRotations = [];
                for (let j = 0; j < length; j++) {
                    jointRotations.push(
                        GLMHelpers.unpackOrientationQuatFromBytes(
                            data, dataPosition + j * 8
                        )
                    );
                }
                dataPosition += length;
            }
        }

        let jointTranslationsSet: boolean[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS_SET)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointTranslationsSet = [];
                for (let j = 0; j < length; j++) {
                    jointTranslationsSet.push(Boolean(data.getUint8(dataPosition + j)));
                }
                dataPosition += length;
            }
        }

        let jointTranslations: vec3[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointTranslations = [];
                for (let j = 0; j < length; j++) {
                    jointTranslations.push(
                        {
                            x: data.getFloat32(dataPosition + j * 12, UDT.LITTLE_ENDIAN),
                            y: data.getFloat32(dataPosition + 4 + j * 12, UDT.LITTLE_ENDIAN),
                            z: data.getFloat32(dataPosition + 8 + j * 12, UDT.LITTLE_ENDIAN)
                        }
                    );

                }
                dataPosition += length;
            }
        }

        let relayParentJoints: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RELAY_PARENT_JOINTS)) {
            relayParentJoints = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let groupCulled: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GROUP_CULLED)) {
            groupCulled = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let blendShapeCoefficients: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLENDSHAPE_COEFFICIENTS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                blendShapeCoefficients = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let useOriginalPivot: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USE_ORIGINAL_PIVOT)) {
            useOriginalPivot = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let animationURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                animationURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let animationAllowTranslation: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_ALLOW_TRANSLATION)) {
            animationAllowTranslation = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let animationFPS: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FPS)) {
            animationFPS = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let animationFrameIndex: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FRAME_INDEX)) {
            animationFrameIndex = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let animationPlaying: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_PLAYING)) {
            animationPlaying = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let animationLoop: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_LOOP)) {
            animationLoop = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let animationFirstFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FIRST_FRAME)) {
            animationFirstFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let animationLastFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_LAST_FRAME)) {
            animationLastFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let animationHold: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_HOLD)) {
            animationHold = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                shapeType,
                compoundShapeURL,
                color,
                textures,
                modelURL,
                modelScale,
                jointRotationsSet,
                jointRotations,
                jointTranslationsSet,
                jointTranslations,
                groupCulled,
                relayParentJoints,
                blendShapeCoefficients,
                useOriginalPivot,
                animation: {
                    animationURL,
                    animationAllowTranslation,
                    animationFPS,
                    animationFrameIndex,
                    animationPlaying,
                    animationLoop,
                    animationFirstFrame,
                    animationLastFrame,
                    animationHold
                }
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}();

export default ModelEntity;
export type { ModelEntitySubclassData, AnimationProperties };
