//
//  MaterialEntityItem.ts
//
//  Created by Julien Merzoug on 15 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { CommonEntityProperties } from "../networking/packets/EntityData";
import UDT from "../networking/udt/UDT";
import PropertyFlags from "../shared/PropertyFlags";
import { vec2 } from "../shared/Vec2";
import { EntityPropertyList } from "./EntityPropertyFlags";


/*@sdkdoc
 *  Specifies how a {@link MateriualEntityProperties|Material entity} is mapped to the entity or avatar it is parented to.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>UV<td><code>0</code></td><td>The material is evaluated within the UV space of the mesh it is applied
 *              to.</td></tr>
 *          <tr><td>PROJECTED<td><code>1</code></td><td>The 3D transform (position, rotation, and dimensions) of the Material
 *              entity is used to evaluate the texture coordinates for the material.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} MaterialMappingMode
 */
enum MaterialMappingMode {
    // C++  enum MaterialMappingMode
    UV = 0,
    PROJECTED,
    // Put new mapping-modes before this line.
    UNSET_MATERIAL_MAPPING_MODE
}

type MaterialEntitySubclassProperties = {
    materialURL: string | undefined,
    materialData: string | undefined,
    priority: number | undefined,
    parentMaterialName: string | undefined,
    materialMappingMode: MaterialMappingMode | undefined,
    materialMappingPos: vec2 | undefined,
    materialMappingScale: vec2 | undefined,
    materialMappingRot: number | undefined,
    materialRepeat: boolean | undefined
};

type MaterialEntityProperties = CommonEntityProperties & MaterialEntitySubclassProperties;

type MaterialEntitySubclassData = {
    bytesRead: number;
    properties: MaterialEntitySubclassProperties;
};


/*@devdoc
 *  The <code>MaterialEntityItem</code> class provides facilities for reading Material entity properties from a packet.
 *  <p>C++: <code>class MaterialEntityItem : public EntityItem</code></p>
 *  @class MaterialEntityItem
 */
class MaterialEntityItem {
    // C++  class MaterialEntityItem : public EntityItem

    /*@sdkdoc
     *  <p>An RGB or sRGB color value.</p>
     *  <table>
     *      <thead>
     *          <tr><th>Index</th><th>Type</th><th>Attributes</th><th>Default</th><th>Value</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td><code>0</code></td><td>number</td><td></td><td></td>
     *              <td>Red component value. Number in the range <code>0.0</code> &ndash; <code>1.0</code>.</td></tr>
     *          <tr><td><code>1</code></td><td>number</td><td></td><td></td>
     *              <td>Green component value. Number in the range <code>0.0</code> &ndash; <code>1.0</code>.</td></tr>
     *          <tr><td><code>2</code></td><td>number</td><td></td><td></td>
     *              <td>Blue component value. Number in the range <code>0.0</code> &ndash; <code>1.0</code>.</td></tr>
     *          <tr><td><code>3</code></td><td>boolean</td><td>&lt;optional&gt;</td><td>false</td>
     *              <td>If <code>true</code> then the color is an sRGB color.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {Array} rgbs
     */

    /*@sdkdoc
     *  An object containing user-defined uniforms for communicating data to shaders.
     *  @typedef {object} ProceduralUniforms
     */

    /*@sdkdoc
     *  The data used to define a procedural shader material.
     *  @typedef {object} ProceduralData
     *  @property {number} version=1 - The version of the procedural shader.
     *  @property {string} vertexShaderURL - A link to a vertex shader. Currently, only GLSL shaders are supported. The shader
     *      must implement a different method depending on the version. If a procedural material contains a vertex shader, the
     *      bounding box of the material entity is used to cull the object to which the material is applied.
     *  @property {string} fragmentShaderURL - A link to a fragment shader. Currently, only GLSL shaders are supported. The
     *      shader must implement a different method depending on the version. <code>shaderUrl</code> is an alias.
     *  @property {string[]} channels=[]] - Input texture URLs or entity IDs. Currently, up to 4 are supported. An entity ID may
     *      be that of an Image or Web entity.
     *  @property {ProceduralUniforms} uniforms={} - The custom uniforms to be passed to the shader.
     */

    /*@sdkdoc
     *  A material used in a {@link MaterialResource}.
     *  @typedef {object} Material
     *  @property {string} [name=""] - A name for the material. Supported by all material models.
     *  @property {string} [model="hifi_pbr"] - Different material models support different properties and rendering modes.
     *      Supported models are: <code>"hifi_pbr"</code>, <code>"hifi_shader_simple"</code>.
     *  @property {color|rgbs|string} [emissive] - The emissive color, i.e., the color that the material emits. A {@link color}
     *      value is treated as sRGB and must have component values in the range <code>0.0</code> &ndash; <code>1.0</code>. A
     *      {@link rgbs} value can be either RGB or sRGB.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {number|string} [opacity=1.0] - The opacity, range <code>0.0</code> &ndash; <code>1.0</code>.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> and
     *      <code>"hifi_shader_simple"</code> models only.
     *  @property {boolean|string} [unlit=false] - <code>true</code> if the material is unaffected by lighting,
     *      <code>false</code> if it is lit by the key light and local lights.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {color|rgbs|string} [albedo] - The albedo color. A {@link ColorFloat} value is treated as sRGB and must have
     *      component values in the range <code>0.0</code> &ndash; <code>1.0</code>. A {@link RGBS} value can be either RGB or
     *      sRGB.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> and
     *      <code>"hifi_shader_simple"</code> models only.
     *  @property {number|string} [roughness=1.0] - The roughness, range <code>0.0</code> &ndash; <code>1.0</code>.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {number|string} [metallic=0.0] - The metallicness, range <code>0.0</code> &ndash; <code>1.0</code>.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.<br />
     *  @property {number|string} [scattering] - The scattering, range <code>0.0</code> &ndash; <code>1.0</code>.
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [emissiveMap] - The URL of the emissive texture image, or an entity ID. An entity ID may be that of
     *      an Image or Web entity.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [albedoMap] - The URL of the albedo texture image, or an entity ID. An entity ID may be that of an
     *      Image or Web entity.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [opacityMap] - The URL of the opacity texture image, or an entity ID. An entity ID may be that of an
     *      Image or Web entity.<br />
     *      Set the value the same as the <code>albedoMap</code> value for transparency. <code>"hifi_pbr"</code> model only.
     *  @property {string} [opacityMapMode] - The mode defining the interpretation of the opacity map. Values can be:
     *      <ul>
     *          <li><code>"OPACITY_MAP_OPAQUE"</code> for ignoring the opacity map information.</li>
     *          <li><code>"OPACITY_MAP_MASK"</code> for using the <code>opacityMap</code> as a mask, where only the texel
     *          greater than <code>opacityCutoff</code> are visible and rendered opaque.</li>
     *          <li><code>"OPACITY_MAP_BLEND"</code> for using the <code>opacityMap</code> for alpha blending the material
     *          surface with the background.</li>
     *      </ul>
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {number|string} [opacityCutoff] - The opacity cutoff threshold used to determine the opaque texels of the
     *      <code>opacityMap</code> when <code>opacityMapMode</code> is <code>"OPACITY_MAP_MASK"</code>. Range <code>0.0</code>
     *      &ndash; <code>1.0</code>.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [cullFaceMode="CULL_BACK"] - The mode defining which side of the geometry should be rendered. Values
     *      can be:
     *      <ul>
     *          <li><code>"CULL_NONE"</code> to render both sides of the geometry.</li>
     *          <li><code>"CULL_FRONT"</code> to cull the front faces of the geometry.</li>
     *          <li><code>"CULL_BACK"</code> (the default) to cull the back faces of the geometry.</li>
     *      </ul>
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [roughnessMap] - The URL of the roughness texture image. You can use this or <code>glossMap</code>,
     *      but not both.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [glossMap] - The URL of the gloss texture image. You can use this or <code>roughnessMap</code>, but
     *      not both.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [metallicMap] - The URL of the metallic texture image, or an entity ID. An entity ID may be that of
     *      an Image or Web entity. You can use this or <code>specularMap</code>, but not both.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [specularMap] - The URL of the specular texture image, or an entity ID. An entity ID may be that of
     *      an Image or Web entity. You can use this or <code>metallicMap</code>, but not both.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [normalMap] - The URL of the normal texture image, or an entity ID  An entity ID may be that of an
     *      Image or Web entity. You can use this or <code>bumpMap</code>, but not both.<br />
     *      Set to <code>"fallthrough"</code> to fall
     *      through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [bumpMap] - The URL of the bump texture image, or an entity ID. An entity ID may be that of an Image
     *      or Web entity. You can use this or <code>normalMap</code>, but not both
     *      <br />Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [occlusionMap] - The URL of the occlusion texture image, or an entity ID. An entity ID may be that of
     *      an Image or Web entity.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [scatteringMap] - The URL of the scattering texture image, or an entity ID. An entity ID may be that
     *      of an Image or Web entity. Only used if <code>normalMap</code> or <code>bumpMap</code> is specified.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [lightMap] - The URL of the light map texture image, or an entity ID. An entity ID may be that of an
     *      Image or Web entity.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {mat4|string} [texCoordTransform0] - The transform to use for all of the maps apart from
     *      <code>occlusionMap</code> and <code>lightMap</code>.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {mat4|string} [texCoordTransform1] - The transform to use for <code>occlusionMap</code> and
     *      <code>lightMap</code>.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *  @property {string} [lightmapParams] - Parameters for controlling how <code>lightMap</code> is used.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *      <p><em>Currently not used.</em></p>
     *  @property {string} [materialParams] - Parameters for controlling the material projection and repetition.<br />
     *      Set to <code>"fallthrough"</code> to fall through to the material below. <code>"hifi_pbr"</code> model only.
     *      <p><em>Currently not used.</em></p>
     *  @property {boolean} [defaultFallthrough=false] - <code>true</code> if all properties fall through to the material below
     *      unless they are set, <code>false</code> if properties respect their individual fall-through settings.<br />
     *      <code>"hifi_pbr"</code> and <code>"hifi_shader_simple"</code> models only.
     *  @property {ProceduralData} [procedural] - The definition of a procedural shader material.<br />
     *      <code>"hifi_shader_simple"</code> model only.
     */
    // C++  std::pair<std::string, std::shared_ptr<NetworkMaterial>>
    //          NetworkMaterialResource::parseJSONMaterial(const QJsonValue& materialJSONValue, const QUrl& baseUrl)

    /*@sdkdoc
     *  A material or set of materials used by a {@link EntityType|Material entity}.
     *  @typedef {object} MaterialResource
     *  @property {number} [materialVersion=1] - The version of the material. <em>Currently not used.</em>
     *  @property {Material|Material[]|string} materials - The details of the material or materials, or the ID of another
     *      Material entity.
     */

    /*@sdkdoc
     *  The <code>Material</code> {@link EntityType} modifies existing materials on entities and avatars.
     *  <p>To apply a material to an entity, set the material entity's <code>parentID</code> property to the entity ID. To apply
     *  a material to an avatar, set the material entity's <code>parentID</code> property to the avatar's session UUID. To apply
     *  a material to your avatar such that it persists across domains and log-ins, create the material as an avatar entity and
     *  set the entity's <code>parentID</code> property to {@link Uuid(1)|Uuid.AVATAR_SELF_ID}.</p>
     *  <p>It has properties in addition to the {@link EntityProperties|common EntityProperties}. A property value may be
     *  undefined if it couldn't fit in the data packet sent by the server.</p>
     *  @typedef {object} MaterialEntityProperties
     *  @property {string|undefined} materialURL="" - One of the following:
     *      <ul>
     *          <li>The URL to a {@link MaterialResource}. If you append <code>"#name"</code> to the URL, the material with that
     *              name will be applied to the entity.</li>
     *          <li>A value of <code>"materialData"</code> to use the <code>materialData</code> property as the
     *              {@link MaterialResource} values.</li>
     *          <li>The ID of another Material entity, in which case this material will act as a copy of that material, with its
     *              own unique material transform, priority, etc.</li>
     *      </ul>
     *  @property {string|undefined} materialData="" - {@link MaterialResource} data stored in a JSON string.
     *  @property {number|undefined} priority=0 - The priority for applying the material to its parent. Only the highest
     *      priority material is applied, with materials of the same priority randomly assigned. Materials that come with the
     *      model have a priority of <code>0</code>.
     *  @property {string|undefined} parentMaterialName="0" - Selects the mesh part or parts within the parent to which to
     *      apply the material. If in the format <code>"mat::string"</code>, all mesh parts with material name
     *      <code>"string"</code> are replaced. If <code>"all"</code>, then all mesh parts are replaced. Otherwise the property
     *      value is parsed as an unsigned integer, specifying the mesh part index to modify.
     *      <p>If the string represents an array (starts with <code>"["</code> and ends with <code>"]"</code>), the string is
     *      split at each <code>","</code> and each element parsed as either a number or a string if it starts with
     *      <code>"mat::"</code>. For example, <code>"[0,1,mat::string,mat::string2]"</code> will replace mesh parts 0 and 1,
     *      and any mesh parts with material <code>"string"</code> or <code>"string2"</code>. Do not put spaces around the
     *      commas. Invalid values are parsed to <code>"0"</code>.</p>
     *  @property {MaterialMappingMode|undefined} materialMappingMode=UV - How the material is mapped to the entity. If
     *      <code>UV</code> mode, the material is evaluated within the UV space of the mesh it is applied to. If
     *      <code>PROJECTED</code> mode, the 3D transform (position, rotation, and dimensions) of the Material entity is used to
     *      evaluate the texture coordinates for the material.
     *  @property {vec2|undefined} materialMappingPos=0.0,0.0 - Offset position in UV-space of the top left of the material,
     *      range <code>{ x: 0, y: 0 }</code> &ndash; <code>{ x: 1, y: 1 }</code>.
     *  @property {vec2|undefined} materialMappingScale=1.0,1.0 - How much to scale the material within the parent's UV-space.
     *  @property {number|undefined} materialMappingRot=UV - How much to rotate the material within the parent's UV-space, in
     *      degrees.
     *  @property {boolean|undefined} materialRepeat=true - <code>true</code> if the material repeats, <code>false</code> if
     *      it doesn't. If <code>false</code>, fragments outside of texCoord 0 &ndash; 1 will be discarded. Works in both
     *      <code>UV</code> and <code>PROJECTED</code> mapping modes.
     */

    /*@devdoc
     *  A wrapper for providing {@link MaterialEntityProperties} and the number of bytes read.
     *  @typedef {object} MaterialEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {MaterialEntityProperties} properties - The Material entity properties.
     */

    /*@devdoc
     *  Reads, if present, Material entity properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Material entity properties in the {@link Packets|EntityData} message
     *      data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {MaterialEntitySubclassData} The Material entity properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): MaterialEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int MaterialEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        let materialURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MATERIAL_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                materialURL = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                materialURL = "";
            }
        }

        let materialMappingMode: MaterialMappingMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MATERIAL_MAPPING_MODE)) {
            materialMappingMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let priority: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MATERIAL_PRIORITY)) {
            priority = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
        }

        let parentMaterialName: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_PARENT_MATERIAL_NAME)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                parentMaterialName = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                parentMaterialName = "";
            }
        }

        let materialMappingPos: vec2 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MATERIAL_MAPPING_POS)) {
            materialMappingPos = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 8;
        }

        let materialMappingScale: vec2 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MATERIAL_MAPPING_SCALE)) {
            materialMappingScale = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 8;
        }

        let materialMappingRot: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MATERIAL_MAPPING_ROT)) {
            materialMappingRot = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let materialData: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MATERIAL_DATA)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                materialData = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                materialData = "";
            }
        }

        let materialRepeat: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyList.PROP_MATERIAL_REPEAT)) {
            materialRepeat = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                materialURL,
                materialData,
                priority,
                parentMaterialName,
                materialMappingMode,
                materialMappingPos,
                materialMappingScale,
                materialMappingRot,
                materialRepeat
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default MaterialEntityItem;
export type { MaterialEntitySubclassData, MaterialEntityProperties };
