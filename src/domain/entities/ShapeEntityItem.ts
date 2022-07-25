//
//  ShapeEntityItem.ts
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
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";
import PulsePropertyGroup from "./PulsePropertyGroup";


/*@sdkdoc
 *  <p>A "Shape" {@link EntityType} may display as one of the following geometrical shapes:</p>
 *  <table>
 *      <thead>
 *          <tr><th>Value</th><th>Dimensions</th><th>Notes</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>"Circle"</td><td>2D</td><td>A circle oriented in 3D.</td></tr>
 *          <tr><td>"Cone"</td><td>3D</td><td></td></tr>
 *          <tr><td>"Cube"</td><td>3D</td><td></td></tr>
 *          <tr><td>"Cylinder"</td><td>3D</td><td></td></tr>
 *          <tr><td>"Dodecahedron"</td><td>3D</td><td></td></tr>
 *          <tr><td>"Hexagon"</td><td>3D</td><td>A hexagonal prism.</td></tr>
 *          <tr><td>"Icosahedron"</td><td>3D</td><td></td></tr>
 *          <tr><td>"Octagon"</td><td>3D</td><td>An octagonal prism.</td></tr>
 *          <tr><td>"Octahedron"</td><td>3D</td><td></td></tr>
 *          <tr><td>"Quad"</td><td>2D</td><td>A square oriented in 3D.</td></tr>
 *          <tr><td>"Sphere"</td><td>3D</td><td></td></tr>
 *          <tr><td>"Tetrahedron"</td><td>3D</td><td></td></tr>
 *          <tr><td>"Torus"</td><td>3D</td><td>Not implemented.</td></tr>
 *          <tr><td>"Triangle"</td><td>3D</td><td>A triangular prism.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {string} Shape
 */
enum Shape {
    CIRCLE = "Circle",
    CONE = "Cone",
    CUBE = "Cube",
    CYLINDER = "Cylinder",
    DODECAHEDRON = "Dodecahedron",
    HEXAGON = "Hexagon",
    ICOSAHEDRON = "Icosahedron",
    OCTAGON = "Octagon",
    OCTAHEDRON = "Octahedron",
    QUAD = "Quad",
    SPHERE = "Sphere",
    TETRAHEDRON = "Tetrahedron",
    TORUS = "Torus",
    TRIANGLE = "Triangle"
}

type ShapeEntitySubclassProperties = {
    shape: Shape | undefined;
    color: color | undefined;
    alpha: number | undefined;
};

type ShapeEntityProperties = CommonEntityProperties & ShapeEntitySubclassProperties;

type ShapeEntitySubclassData = {
    bytesRead: number;
    properties: ShapeEntitySubclassProperties;
};


/*@devdoc
 *  The <code>ShapeEntityItem</code> class provides facilities for reading shape entity properties from a packet.
 *  @class ShapeEntityItem
 */
class ShapeEntityItem {
    // C++  class ShapeEntityItem : public EntityItem

    /*@sdkdoc
     *  A color value.
     *  @typedef {object} color
     *  @property {number} red - Red component value. Integer in the range <code>0 - 255</code>.
     *  @property {number} green - Green component value. Integer in the range <code>0 - 255</code>.
     *  @property {number} blue - Blue component value. Integer in the range <code>0 - 255</code>.
     */

    /*@sdkdoc
     *  The Shape {@link EntityType|entity type} displays an entity of a specified shape. It has properties in addition to the
     *  common {@link EntityProperties}. A property value may be undefined if it couldn't fit in the data packet sent by the
     *      server.
     *  @typedef {object} ShapeEntityProperties
     *  @property {Shape | undefined} shape - The shape of the entity.
     *  @property {color | undefined} color - The color of the entity.
     *  @property {number | undefined} alpha - The opacity of the entity, range <code>0.0 – 1.0</code>.
     */

    /*@devdoc
     *  A wrapper for providing {@link ShapeEntityProperties} and the number of bytes read.
     *  @typedef {object} ShapeEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {ShapeEntityProperties} properties - The shape entity properties.
     */

    /*@devdoc
     *  Reads, if present, shape properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the shape properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {ShapeEntitySubclassData} The shape properties and the number of bytes read.
     */
    // eslint-disable-next-line class-methods-use-this
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ShapeEntitySubclassData { // eslint-disable-line max-len
        // C++  int ShapeEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        let color: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
            color = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let alpha: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA)) {
            alpha = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        const pulseProperties = PulsePropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += pulseProperties.bytesRead;

        const textDecoder = new TextDecoder();

        let shape: Shape | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHAPE)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                shape = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                ) as Shape;
                dataPosition += length;
            }
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                color,
                alpha,
                shape
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default ShapeEntityItem;
export type { ShapeEntitySubclassData, ShapeEntityProperties, Shape };
