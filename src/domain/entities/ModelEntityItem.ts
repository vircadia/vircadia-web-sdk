//
//  ModelEntityItem.ts
//
//  Created by Julien Merzoug on 11 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { CommonEntityProperties } from "../networking/packets/EntityData";
import UDT from "../networking/udt/UDT";
import type { color } from "../shared/Color";
import GLMHelpers from "../shared/GLMHelpers";
import PropertyFlags from "../shared/PropertyFlags";
import type { quat } from "../shared/Quat";
import type { vec3 } from "../shared/Vec3";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


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

type ModelEntitySubclassProperties = {
    shapeType: number | undefined;
    compoundShapeURL: string | undefined;
    color: color | undefined;
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

type ModelEntityProperties = CommonEntityProperties & ModelEntitySubclassProperties;

type ModelEntitySubclassData = {
    bytesRead: number;
    properties: ModelEntitySubclassProperties;
};


/*@devdoc
 *  The <code>ModelEntityItem</code> class provides facilities for reading model entity properties from a packet.
 *  @class ModelEntityItem
 */
class ModelEntityItem {
    // C++  class ModelEntityItem : public EntityItem

    /*@sdkdoc
     *  An animation is configured by the following properties.
     *  @typedef {object} AnimationProperties
     *  @property {string | undefined} animationURL - The URL of the glTF or FBX file that has the animation. glTF files may be
     *      in JSON or binary format (".gltf" or ".glb" URLs respectively).
     *  @property {boolean | undefined} animationAllowTranslation - <code>true</code> to enable translations contained in the
     *      animation to be played, <code>false</code> to disable translations.
     *  @property {number | undefined} animationFPS - The speed in frames/s that the animation is played at.
     *  @property {number | undefined} animationFrameIndex - The current frame being played in the animation.
     *  @property {boolean | undefined} animationPlaying - <code>true</code> if the animation should play, <code>false</code>
     *      if it shouldn't.
     *  @property {boolean | undefined} animationLoop - <code>true</code> if the animation is continuously repeated in a
     *      loop, <code>false</code> if it isn't.
     *  @property {number | undefined} animationFirstFrame - The first frame to play in the animation.
     *  @property {number | undefined} animationLastFrame - The last frame to play in the animation.
     *  @property {boolean | undefined} animationHold - <code>true</code> if the rotations and translations of the last frame
     *     played are maintained when the animation stops playing, <code>false</code> if they aren't.
     */

    /*@sdkdoc
     *  The Model {@link EntityType|entity type} displays a glTF, FBX, or OBJ model. When adding an entity, if no
     *  <code>dimensions</code> value is specified then the model is automatically sized to its natural dimensions. It has
     *  properties in addition to the common {@link EntityProperties}. A property value may be undefined if it couldn't fit in
     *      the data packet sent by the server.
     *  @typedef {object} ModelEntityProperties
     *  @property {number | undefined} shapeType - The shape of the collision hull used if collisions are enabled.
     *  @property {string | undefined} compoundShapeURL - The model file to use for the compound shape if shapeType is
     *      "compound".
     *  @property {color | undefined} color - Currently not used.
     *  @property {string | undefined} textures - A JSON string of texture name, URL pairs used when rendering the model in
     *      place of the model's original textures. Use a texture name from the originalTextures property to override that
     *      texture.  Only the texture names and URLs to be overridden need be specified; original textures are used where there
     *      are no overrides. You can use JSON.stringify() to convert a JavaScript object of name, URL pairs into a JSON string.
     *  @property {string | undefined} modelURL - The URL of the glTF, FBX, or OBJ model. glTF models may be in JSON or binary
     *      format (".gltf" or ".glb" URLs respectively). Baked models' URLs have ".baked" before the file type. Model files may
     *      also be compressed in GZ format, in which case the URL ends in ".gz".
     *  @property {vec3 | undefined} modelScale - The scale factor applied to the model's dimensions.
     *  @property {boolean | undefined} jointRotationsSet - <code>true</code> values for joints that have had rotations
     *      applied, <code>false</code> otherwise; Empty if none are applied or the model hasn't loaded.
     *  @property {quat[] | undefined} jointRotations - Joint rotations applied to the model; Empty if none are applied or the
     *      model hasn't loaded.
     *  @property {boolean | undefined} jointTranslationsSet - <code>true</code> values for joints that have had translations
     *      applied, <code>false</code> otherwise; Empty if none are applied or the model hasn't loaded.
     *  @property {vec3[] | undefined} jointTranslations - Joint translations applied to the model; Empty if none are applied or
     *      the model hasn't loaded.
     *  @property {boolean | undefined} groupCulled - <code>true</code> if the mesh parts of the model are LOD culled as a
     *      group, <code>false</code> if separate mesh parts are LOD culled individually.
     *  @property {boolean | undefined} relayParentJoints - <code>true</code> if when the entity is parented to an avatar,
     *      the avatar's joint rotations are applied to the entity's joints; <code>false</code> if a parent avatar's joint
     *      rotations are not applied to the entity's joints.
     *  @property {string | undefined} blendShapeCoefficients - A JSON string of a map of blendshape names to values. Only
     *      stores set values. When editing this property, only coefficients that you are editing will change; it will not
     *      explicitly reset other coefficients.
     *  @property {boolean | undefined} useOriginalPivot - If <code>false</code>, the model will be centered based on its
     *      content, ignoring any offset in the model itself. If <code>true</code>, the model will respect its original offset.
     *      Currently, only pivots relative to <code>{x: 0, y: 0, z: 0}</code> are supported.
     *  @property {AnimationProperties | undefined} animation - An animation to play on the model.
     */

    /*@devdoc
     *  A wrapper for providing {@link ModelEntityProperties} and the number of bytes read.
     *  @typedef {object} ModelEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {ModelEntityProperties} properties - The model entity properties.
     */

    /*@devdoc
     *  Reads, if present, model properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the model properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {ModelEntitySubclassData} The model properties and the number of bytes read.
     */
    // eslint-disable-next-line max-len
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ModelEntitySubclassData { // eslint-disable-line class-methods-use-this
        // C++  int ModelEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

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

        let color: color | undefined = undefined;
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
                let bit = 0;
                let current = 0;
                for (let i = 0; i < length; i++) {
                    if (bit === 0) {
                        current = data.getUint8(dataPosition);
                        dataPosition += 1;
                    }
                    const value = Boolean(current & 1 << bit);
                    jointRotationsSet.push(value);
                    bit = (bit + 1) % 8;
                }
            }
        }

        let jointRotations: quat[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointRotations = [];
                for (let i = 0; i < length; i++) {
                    jointRotations.push(
                        GLMHelpers.unpackOrientationQuatFromBytes(
                            data, dataPosition
                        )
                    );
                    dataPosition += 8;
                }
            }
        }

        let jointTranslationsSet: boolean[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS_SET)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointTranslationsSet = [];
                let bit = 0;
                let current = 0;
                for (let i = 0; i < length; i++) {
                    if (bit === 0) {
                        current = data.getUint8(dataPosition);
                        dataPosition += 1;
                    }
                    const value = Boolean(current & 1 << bit);
                    jointTranslationsSet.push(value);
                    bit = (bit + 1) % 8;
                }
            }
        }

        let jointTranslations: vec3[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointTranslations = [];
                for (let i = 0; i < length; i++) {
                    jointTranslations.push(
                        {
                            x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                            y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                            z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                        }
                    );

                    dataPosition += 12;
                }
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

}

export default ModelEntityItem;
export type { ModelEntitySubclassData, ModelEntityProperties, AnimationProperties };
