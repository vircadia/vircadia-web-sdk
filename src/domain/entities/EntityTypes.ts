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
 *  @property {number} Unknown=0 - Default entity type.
 *  @property {number} Box=1 - A rectangular prism. This is a synonym of <code>Shape</code> for the case where the entity's
 *      shape property value is <code>Cube</code>. If an entity is created with its type set to <code>Box</code> it will always
 *      be created with a shape property value of <code>Cube</code>. If an entity of type <code>Shape</code> or
 *      <code>Sphere</code> has its shape set to <code>Cube</code> then its type will be reported as <code>Box</code>.
 *  @property {number} Sphere=2 - A sphere. This is a synonym of <code>Shape</code> for the case where the entity's shape
 *      property value is <code>Sphere</code>. If an entity is created with its type set to <code>Sphere</code> it will always
 *      be created with a shape property value of <code>Sphere</code>. If an entity of type <code>Box</code> or
 *      <code>Shape</code> has its shape set to <code>Sphere</code> then its type will be reported as <code>Sphere</code>.
 *  @property {number} Shape=3 - A basic entity such as a cube. See also, the <code>Box</code> and <code>Sphere</code> entity
 *      types.
 *  @property {number} Model=4 - A mesh model from a glTF, FBX, or OBJ file.
 *  @property {number} Text=5 - A pane of text oriented in space.
 *  @property {number} Image=6 - An image oriented in space.
 *  @property {number} Web=7 - A browsable web page.
 *  @property {number} ParticleEffect=8 - A particle system that can be used to simulate things such as fire, smoke, snow, magic
 *      spells, etc.
 *  @property {number} Line=9 - A sequence of one or more simple straight lines.
 *  @property {number} PolyLine=10 - A sequence of one or more textured straight lines.
 *  @property {number} PolyVox=11 - A set of textured voxels.
 *  @property {number} Grid=12 - A grid of lines in a plane.
 *  @property {number} Gizmo=13 - A gizmo intended for UI.
 *  @property {number} Light=14 - A local lighting effect.
 *  @property {number} Zone=15 - A volume of lighting effects and avatar permissions.
 *  @property {number} Material=16 - Modifies the existing materials on entities and avatars.
 *  @property {number} NUM_TYPES=17 - The number of entity types.
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
