//
//  ShapeType.ts
//
//  Created by David Rowe on 12 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  The <code>ShapeType</code> namespace enumerates types of shapes.
 *  @namespace ShapeType
 *  @property {number} NONE - <code>0</code> - No shape.
 *  @property {number} BOX - <code>1</code> - A cube.
 *  @property {number} SPHERE - <code>2</code> - A sphere.
 *  @property {number} CAPSULE_X - <code>3</code> - A capsule (cylinder with spherical ends) oriented along the x-axis.
 *  @property {number} CAPSULE_Y - <code>4</code> - A capsule (cylinder with spherical ends) oriented along the y-axis.
 *  @property {number} CAPSULE_Z - <code>5</code> - A capsule (cylinder with spherical ends) oriented along the z-axis.
 *  @property {number} CYLINDER_X - <code>6</code> - A cylinder oriented along the x-axis.
 *  @property {number} CYLINDER_Y - <code>7</code> - A cylinder oriented along the y-axis.
 *  @property {number} CYLINDER_Z - <code>8</code> - A cylinder oriented along the z-axis.
 *  @property {number} HULL - <code>9</code> - <em>Not used.</em>
 *  @property {number} PLANE - <code>10</code> - A plane.
 *  @property {number} COMPOUND - <code>11</code> - A compound convex hull specified in an OBJ file.
 *  @property {number} SIMPLE_HULL - <code>12</code> - A convex hull automatically generated from a model.
 *  @property {number} SIMPLE_COMPOUND - <code>13</code> - A compound convex hull automatically generated from the model, using
 *      sub-meshes.
 *  @property {number} STATIC_MESH - <code>14</code> - The exact shape of the model.
 *  @property {number} ELLIPSOID - <code>15</code> - An ellipsoid.
 *  @property {number} CIRCLE - <code>16</code> - A circle.
 *  @property {number} MULTISPHERE - <code>17</code> - A convex hull generated from a set of spheres.
 */
enum ShapeType {
    // C++  enum ShapeType
    NONE,
    BOX,
    SPHERE,
    CAPSULE_X,
    CAPSULE_Y,
    CAPSULE_Z,
    CYLINDER_X,
    CYLINDER_Y,
    CYLINDER_Z,
    HULL,
    PLANE,
    COMPOUND,
    SIMPLE_HULL,
    SIMPLE_COMPOUND,
    STATIC_MESH,
    ELLIPSOID,
    CIRCLE,
    MULTISPHERE
}

export default ShapeType;
