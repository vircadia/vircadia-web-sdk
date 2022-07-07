//
//  ShapeEntity.ts
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
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";


// TODO: Move into its own module with PulsePropertyGroup?
// TODO: doc
enum PulseMode {
    NONE = "none",
    IN_PHASE = "in",
    OUT_PHASE = "out"
}

// TODO: Move into shape module?
// TODO: doc
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

// TODO: Move into its own module?
// TODO: doc
type PulsePropertyGroup = {
    min: number | undefined;
    max: number | undefined;
    period: number | undefined;
    colorMode: PulseMode | undefined;
    alphaMode: PulseMode | undefined;
};

// TODO: doc
type ShapeEntityProperties = {
    shape: Shape | undefined;
    color: Color | undefined;
    alpha: number | undefined;
    pulse: PulsePropertyGroup | undefined;
};

type ShapeEntitySubclassData = {
    bytesRead: number;
    properties: ShapeEntityProperties;
};

const ShapeEntity = new class {

    // eslint-disable-next-line max-len
    readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ShapeEntitySubclassData { // eslint-disable-line class-methods-use-this
        // C++  int ShapeEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        // TODO:
        // 1. First, inline all properties.
        // 2. Then separate properties into modules where needed.

        let color: Color | undefined = undefined;
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

        // TODO: read pulse - PulsePropertyGroup
        // TODO: Move into PulsePropertyGroup.readEntitySubclassDataFromBuffer().
        let min: number | undefined = undefined; // TODO: remove once Pulse...readEntitySubclassData... is implemented
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PULSE_MIN)) {
            min = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let max: number | undefined = undefined; // TODO: remove once Pulse...readEntitySubclassData... is implemented
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PULSE_MAX)) {
            max = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let period: number | undefined = undefined; // TODO: remove once Pulse...readEntitySubclassData... is implemented
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PULSE_MAX)) {
            period = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let colorMode: PulseMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PULSE_COLOR_MODE)) {
            const value = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            switch (value) {
                case 0:
                    colorMode = PulseMode.NONE;
                    break;
                case 1:
                    colorMode = PulseMode.IN_PHASE;
                    break;
                case 2:
                    colorMode = PulseMode.OUT_PHASE;
                    break;
                default:
                    console.error("Invalid color mode!");
            }
            dataPosition += 4;
        }

        let alphaMode: PulseMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PULSE_ALPHA_MODE)) {
            const value = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            switch (value) {
                case 0:
                    alphaMode = PulseMode.NONE;
                    break;
                case 1:
                    alphaMode = PulseMode.IN_PHASE;
                    break;
                case 2:
                    alphaMode = PulseMode.OUT_PHASE;
                    break;
                default:
                    console.error("Invalid alpha mode!");
            }
            dataPosition += 4;
        }

        // TODO: Remove undefined?
        const pulse: PulsePropertyGroup | undefined = {
            min,
            max,
            period,
            colorMode,
            alphaMode
        };

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
                pulse,
                shape
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}();

export default ShapeEntity;
export type { ShapeEntitySubclassData, Shape, PulsePropertyGroup };
