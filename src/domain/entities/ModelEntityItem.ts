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
import type { quat } from "../shared/Quat";
import ShapeType from "../shared/ShapeType";
import type { vec3 } from "../shared/Vec3";
import EntityPropertyFlags, { EntityPropertyList } from "./EntityPropertyFlags";


type AnimationProperties = {
    url: string | undefined;
    allowTranslation: boolean | undefined;
    fps: number | undefined;
    currentFrame: number | undefined;
    running: boolean | undefined;
    loop: boolean | undefined;
    firstFrame: number | undefined;
    lastFrame: number | undefined;
    hold: boolean | undefined;
};

type ModelEntitySubclassProperties = {
    shapeType: ShapeType | undefined;
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
 *  The <code>ModelEntityItem</code> class provides facilities for reading Model entity properties from a packet.
 *  <p>C++: <code>class MomdelEntityItem : public EntityItem</code></p>
 *  @class ModelEntityItem
 */
class ModelEntityItem {
    // C++  class ModelEntityItem : public EntityItem

    /*@sdkdoc
     *  An animation is configured by the following properties.
     *  @typedef {object} AnimationProperties
     *  @property {string|undefined} url="" - The URL of the glTF or FBX file that has the animation. glTF files may be
     *      in JSON or binary format (".gltf" or ".glb" URLs respectively).
     *  @property {boolean|undefined} allowTranslation=true - <code>true</code> to enable translations contained in the
     *      animation to be played, <code>false</code> to disable translations.
     *  @property {number|undefined} fps=30 - The speed in frames/s that the animation is played at.
     *  @property {number|undefined} firstFrame=0 - The first frame to play in the animation.
     *  @property {number|undefined} lastFrame=100000 - The last frame to play in the animation.
     *  @property {number|undefined} currentFrame=0 - The current frame being played in the animation.
     *  @property {boolean|undefined} running=false - <code>true</code> if the animation should run,
     *      <code>false</code> if it shouldn't.
     *  @property {boolean|undefined} loop=true - <code>true</code> if the animation is continuously repeated in a
     *      loop, <code>false</code> if it isn't.
     *  @property {boolean|undefined} hold=false - <code>true</code> if the rotations and translations of the last
     *      frame played are maintained when the animation stops running, <code>false</code> if they aren't.
     */

    /*@sdkdoc
     *  The <code>Model</code> {@link EntityType} displays a glTF, FBX, or OBJ model. When adding an entity, if no
     *  <code>dimensions</code> value is specified then the model is automatically sized to its natural dimensions.
     *  <p>It has properties in addition to the {@link EntityProperties|common EntityProperties}. A property value may be
     *  undefined if it couldn't fit in the data packet sent by the server.</p>
     *  @typedef {object} ModelEntityProperties
     *  @property {ShapeType|undefined} shapeType=NONE - The shape of the collision hull used if collisions are enabled.
     *  @property {string|undefined} compoundShapeURL="" - The model file to use for the compound shape if shapeType is
     *      <code>COMPOUND</code>.
     *  @property {color|undefined} color=255,255,255 - <em>Currently not used.</em>
     *  @property {string|undefined} textures="" - A JSON string of texture name, URL pairs used when rendering the model in
     *      place of the model's original textures. Use a texture name from the originalTextures property to override that
     *      texture.  Only the texture names and URLs to be overridden need be specified; original textures are used where there
     *      are no overrides. You can use JSON.stringify() to convert a JavaScript object of name, URL pairs into a JSON string.
     *  @property {string|undefined} modelURL="" - The URL of the glTF, FBX, or OBJ model. glTF models may be in JSON or binary
     *      format (".gltf" or ".glb" URLs respectively). Baked models' URLs have ".baked" before the file type. Model files may
     *      also be compressed in GZ format, in which case the URL ends in ".gz".
     *  @property {vec3|undefined} modelScale=1.0,1.0,1.0 - The scale factor applied to the model's dimensions.
     *      <p class="important">Deprecated: This property is deprecated and will be removed.</p>
     *  @property {boolean[]|undefined} jointRotationsSet=[]] - <code>true</code> values for joints that have had rotations
     *      applied, <code>false</code> otherwise; empty array if none are applied or the model hasn't loaded.
     *  @property {quat[]|undefined} jointRotations=[]] - Joint rotations applied to the model; empty array if none are applied
     *      or the model hasn't loaded.
     *  @property {boolean|undefined} jointTranslationsSet=[]] - <code>true</code> values for joints that have had translations
     *      applied, <code>false</code> otherwise; empty array if none are applied or the model hasn't loaded.
     *  @property {vec3[]|undefined} jointTranslations=[]] - Joint translations applied to the model; empty array if none are
     *      applied or the model hasn't loaded.
     *  @property {boolean|undefined} groupCulled=false - <code>true</code> if the mesh parts of the model are LOD culled as a
     *      group, <code>false</code> if separate mesh parts are LOD culled individually.
     *  @property {boolean|undefined} relayParentJoints=false - <code>true</code> if when the entity is parented to an avatar,
     *      the avatar's joint rotations are applied to the entity's joints; <code>false</code> if a parent avatar's joint
     *      rotations are not applied to the entity's joints.
     *  @property {string|undefined} blendShapeCoefficients="{\n}\n" - A JSON string of a map of blendshape names to values.
     *      Only stores set values. When editing this property, only coefficients that you are editing will change; it will not
     *      explicitly reset other coefficients.
     *  @property {boolean|undefined} useOriginalPivot=false - If <code>false</code>, the model will be centered based on its
     *      content, ignoring any offset in the model itself. If <code>true</code>, the model will respect its original offset.
     *      Currently, only pivots relative to <code>{ x: 0, y: 0, z: 0 }</code> are supported.
     *  @property {AnimationProperties|undefined} animation - An animation to play on the model.
     */

    /*@devdoc
     *  A wrapper for providing {@link ModelEntityProperties} and the number of bytes read.
     *  @typedef {object} ModelEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {ModelEntityProperties} properties - The Model entity properties.
     */

    /*@devdoc
     *  Reads, if present, Model entity properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Model entity properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {ModelEntitySubclassData} The Model entity properties and the number of bytes read.
     */
    // eslint-disable-next-line max-len
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: EntityPropertyFlags): ModelEntitySubclassData { // eslint-disable-line class-methods-use-this
        // C++  int ModelEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        let shapeType: ShapeType | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_SHAPE_TYPE)) {
            shapeType = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let compoundShapeURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_COMPOUND_SHAPE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                compoundShapeURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            } else {
                compoundShapeURL = "";
            }
        }

        let color: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_COLOR)) {
            color = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let textures: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_TEXTURES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                textures = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            } else {
                textures = "";
            }
        }

        let modelURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MODEL_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                modelURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            } else {
                modelURL = "";
            }
        }

        let modelScale: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MODEL_SCALE)) {
            modelScale = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let jointRotationsSet: boolean[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_JOINT_ROTATIONS_SET)) {
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
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_JOINT_ROTATIONS)) {
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
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_JOINT_TRANSLATIONS_SET)) {
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
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_JOINT_TRANSLATIONS)) {
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
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_RELAY_PARENT_JOINTS)) {
            relayParentJoints = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let groupCulled: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_GROUP_CULLED)) {
            groupCulled = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let blendShapeCoefficients: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_BLENDSHAPE_COEFFICIENTS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                blendShapeCoefficients = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            } else {
                blendShapeCoefficients = "";
            }
        }

        let useOriginalPivot: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_USE_ORIGINAL_PIVOT)) {
            useOriginalPivot = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let url: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                url = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            } else {
                url = "";
            }
        }

        let allowTranslation: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_ALLOW_TRANSLATION)) {
            allowTranslation = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let fps: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_FPS)) {
            fps = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let currentFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_FRAME_INDEX)) {
            currentFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let running: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_PLAYING)) {
            running = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let loop: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP)) {
            loop = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let firstFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_FIRST_FRAME)) {
            firstFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let lastFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_LAST_FRAME)) {
            lastFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let hold: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD)) {
            hold = Boolean(data.getUint8(dataPosition));
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
                    url,
                    allowTranslation,
                    fps,
                    currentFrame,
                    running,
                    loop,
                    firstFrame,
                    lastFrame,
                    hold
                }
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default ModelEntityItem;
export type { ModelEntitySubclassData, ModelEntityProperties, AnimationProperties };
