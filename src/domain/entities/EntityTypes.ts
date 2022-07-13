//
//  EntityTypes.ts
//
//  Created by Julien Merzoug on 26 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  The <code>EntityTypes</code> namespace provides types for entities.
 *  @namespace EntityTypes
 *  @property {number} Unknown - <code>0</code> - Default entity type.
 *  @property {number} Box - <code>1</code> - A rectangular prism. This is a synonym of <code>Shape</code> for the case where
 *      the entity's shape property value is <code>Cube</code>. If an entity is created with its type set to <code>Box</code> it
 *      will always be created with a shape property value of <code>Cube</code>. If an entity of type <code>Shape</code> or
 *      <code>Sphere</code> has its shape set to <code>Cube</code> then its type will be reported as <code>Box</code>.
 *  @property {number} Sphere - <code>2</code> - A sphere. This is a synonym of <code>Shape</code> for the case where the
 *      entity's shape property value is <code>Sphere</code>. If an entity is created with its type set to <code>Sphere</code>
 *      it will always be created with a shape property value of <code>Sphere</code>. If an entity of type <code>Box</code> or
 *      <code>Shape</code> has its shape set to <code>Sphere</code> then its type will be reported as <code>Sphere</code>.
 *  @property {number} Shape - <code>3</code> - A basic entity such as a cube. See also, the <code>Box</code> and
 *      <code>Sphere</code> entity types.<br />
 *      {@link ShapeEntityProperties}
 *  @property {number} Model - <code>4</code> - A mesh model from a glTF, FBX, or OBJ file.<br />
 *      {@link ModelEntityProperties}
 *  @property {number} Text - <code>5</code> - A pane of text oriented in space.
 *  @property {number} Image - <code>6</code> - An image oriented in space.
 *  @property {number} Web - <code>7</code> - A browsable web page.
 *  @property {number} ParticleEffect - <code>8</code> - A particle system that can be used to simulate things such as fire,
 *      smoke, snow, magic spells, etc.
 *  @property {number} Line - <code>9</code> - A sequence of one or more simple straight lines.
 *  @property {number} PolyLine - <code>10</code> - A sequence of one or more textured straight lines.
 *  @property {number} PolyVox - <code>11</code> - A set of textured voxels.
 *  @property {number} Grid - <code>12</code> - A grid of lines in a plane.
 *  @property {number} Gizmo - <code>13</code> - A gizmo intended for UI.
 *  @property {number} Light - <code>14</code> - A local lighting effect.
 *  @property {number} Zone - <code>15</code> - A volume of lighting effects and avatar permissions.
 *  @property {number} Material - <code>16</code> - Modifies the existing materials on entities and avatars.
 *  @property {number} NUM_TYPES - <code>17</code> - The number of entity types.
 */
enum EntityTypes {
    // C++ EntityTypes.EntityType_t

    Unknown = 0,
    Box,
    Sphere,
    Shape,
    Model,
    Text,
    Image,
    Web,
    ParticleEffect,
    Line,
    PolyLine,
    PolyVox,
    Grid,
    Gizmo,
    Light,
    Zone,
    Material,
    NUM_TYPES
}

export { EntityTypes };
