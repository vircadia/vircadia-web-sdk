//
//  ParticleEffectEntityItem.ts
//
//  Created by Julien Merzoug on 19 Jul 2022.
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
import { quat } from "../shared/Quat";
import ShapeType from "../shared/ShapeType";
import { vec3 } from "../shared/Vec3";
import { EntityPropertyFlags } from "./EntityPropertyFlags";
import PulsePropertyGroup from "./PulsePropertyGroup";


type ParticleEffectEntitySubclassProperties = {
    shapeType: ShapeType | undefined,
    compoundShapeURL: string | undefined,
    color: color | undefined,
    alpha: number | undefined,
    textures: string | undefined,
    maxParticles: number | undefined,
    lifespan: number | undefined,
    isEmitting: boolean | undefined,
    emitRate: number | undefined,
    emitSpeed: number | undefined,
    speedSpread: number | undefined,
    emitOrientation: quat | undefined,
    emitDimensions: vec3 | undefined,
    emitRadiusStart: number | undefined,
    polarStart: number | undefined,
    polarFinish: number | undefined,
    azimuthStart: number | undefined,
    azimuthFinish: number | undefined,
    emitAcceleration: vec3 | undefined,
    accelerationSpread: vec3 | undefined,
    particleRadius: number | undefined,
    radiusSpread: number | undefined,
    radiusStart: number | undefined,
    radiusFinish: number | undefined,
    colorSpread: color | undefined,
    colorStart: color | undefined,
    colorFinish: color | undefined,
    alphaSpread: number | undefined,
    alphaStart: number | undefined,
    alphaFinish: number | undefined,
    emitterShouldTrail: boolean | undefined,
    particleSpin: number | undefined,
    spinSpread: number | undefined,
    spinStart: number | undefined,
    spinFinish: number | undefined,
    rotateWithEntity: boolean | undefined
};

type ParticleEffectEntityProperties = CommonEntityProperties & ParticleEffectEntitySubclassProperties;

type ParticleEffectEntitySubclassData = {
    bytesRead: number,
    properties: ParticleEffectEntitySubclassProperties
};


/*@devdoc
 *  The <code>ParticleEffectEntityItem</code> class provides facilities for reading ParticleEffect entity properties from a
 *  packet.
 *  <p>C++: <code>class ParticleEffectEntityItem : public EntityItem</code></p>
 *  @class ParticleEffectEntityItem
 */
class ParticleEffectEntityItem {
    // C++  class ParticleEffectEntityItem : public EntityItem

    /*@sdkdoc
     *  The <code>ParticleEffect</code> {@link EntityType} displays a particle system that can be used to simulate things such
     *  as fire, smoke, snow, magic spells, etc. The particles emanate from a shape or part thereof.
     *  <p>It has properties in addition to the {@link EntityProperties|common EntityProperties}. A property value may be
     *  undefined if it couldn't fit in the data packet sent by the server.</p>
     *  @typedef {object} ParticleEffectEntityProperties
     *  @property {boolean} isEmitting=true - <code>true</code> if particles are being emitted, <code>false</code> if they
     *      aren't.
     *  @property {number} maxParticles=1000 - The maximum number of particles to render at one time. Older particles are
     *      deleted if necessary when new ones are created.
     *  @property {number} lifespan=3s - How long, in seconds, each particle lives.
     *  @property {number} emitRate=15 - The number of particles per second to emit.
     *  @property {number} emitSpeed=5 - The speed, in m/s, that each particle is emitted at.
     *  @property {number} speedSpread=1 - The spread in speeds at which particles are emitted at. For example, if
     *      <code>emitSpeed == 5</code> and <code>speedSpread == 1</code>, particles will be emitted with speeds in the range
     *      <code>4</code> &ndash; <code>6</code>m/s.
     *  @property {vec3} emitAcceleration=0,-9.8,0 - The acceleration that is applied to each particle during its lifetime. The
     *      default is Earth's gravity value.
     *  @property {vec3} accelerationSpread=0,0,0 - The spread in accelerations that each particle is given. For example, if
     *      <code>emitAccelerations == {x: 0, y: -9.8, z: 0}</code> and <code>accelerationSpread ==
     *      {x: 0, y: 1, z: 0}</code>, each particle will have an acceleration in the range <code>{x: 0, y: -10.8, z: 0}</code>
     *      &ndash; <code>{x: 0, y: -8.8, z: 0}</code>.
     *  @property {vec3} dimensions - The dimensions of the particle effect, i.e., a bounding box containing all the particles
     *      during their lifetimes, assuming that <code>emitterShouldTrail == false</code>. <em>Read-only.</em>
     *  @property {boolean} emitterShouldTrail=false - <code>true</code> if particles are "left behind" as the emitter moves,
     *      <code>false</code> if they stay within the entity's dimensions.
     *  @property {quat} emitOrientation=-0.707,0,0,0.707 - The orientation of particle emission relative to the entity's axes.
     *      By default, particles emit along the entity's local z-axis, and <code>azimuthStart</code> and
     *      <code>azimuthFinish</code> are relative to the entity's local x-axis. The default value is a rotation of -90 degrees
     *      about the local x-axis, i.e., the particles emit vertically.
     *  @property {ShapeType} shapeType=ELLIPSOID - The shape from which particles are emitted.
     *     <p>The following shapes aren't supported and are treated as <code>ELLIPSOID</code>:
     *         <code>NONE</code>,
     *         <code>CAPSULE-X</code>,
     *         <code>CAPSULE-Y</code>,
     *         <code>CAPSULE-Z</code>,
     *         <code>HULL</code>,
     *         <code>COMPOUND</code>,
     *         <code>SIMPLE-HULL</code>, and
     *         <code>STATIC-MESH</code>.
     *     </p>
     *  @property {string} compoundShapeURL="" - The model file to use for the compound shape if <code>shapeType</code> is
     *     </code>COMPOUND</code>.
     *  @property {vec3} emitDimensions=0,0,0 - The dimensions of the shape from which particles are emitted.
     *  @property {number} emitRadiusStart=1 - The starting radius within the shape at which particles start being emitted;
     *      range <code>0.0</code> &ndash; <code>1.0</code> for the center to the surface, respectively.
     *      Particles are emitted from the portion of the shape that lies between <code>emitRadiusStart</code> and the
     *      shape's surface.
     *  @property {number} polarStart=0 - The angle in radians from the entity's local z-axis at which particles start being
     *      emitted within the shape; range <code>0</code> &ndash; <code>Math.PI</code>. Particles are emitted from the portion
     *      of the shape that lies between <code>polarStart</code> and <code>polarFinish</code>.
     *      <p>Only used if <code>shapeType</code> is <code>ELLIPSOID</code> or <code>SPHERE</code>.</p>
     *  @property {number} polarFinish=0 - The angle in radians from the entity's local z-axis at which particles stop being
     *      emitted within the shape; range <code>0</code> &ndash; <code>Math.PI</code>. Particles are emitted from the portion
     *      of the shape that lies between <code>polarStart</code> and <code>polarFinish</code>.
     *      <p>Only used if <code>shapeType</code> is <code>ELLIPSOID</code> or <code>SPHERE</code>.</p>
     *  @property {number} azimuthStart=-Math.PI - The angle in radians from the entity's local x-axis about the entity's local
     *      z-axis at which particles start being emitted; range <code>-Math.PI</code> &ndash; <code>Math.PI</code>. Particles
     *      are emitted from the portion of the shape that lies between <code>azimuthStart</code> and
     *      <code>azimuthFinish</code>.
     *      <p>Only used if <code>shapeType</code> is <code>ELLIPSOID</code> or <code>SPHERE</code>.</p>
     *  @property {number} azimuthFinish=Math.PI - The angle in radians from the entity's local x-axis about the entity's local
     *      z-axis at which particles stop being emitted; range <code>-Math.PI</code> &ndash; <code>Math.PI</code>. Particles
     *      are emitted from the portion of the shape that lies between <code>azimuthStart</code> and
     *      <code>azimuthFinish</code>.
     *      <p>Only used if <code>shapeType</code> is <code>ELLIPSOID</code> or <code>SPHERE</code>.</p>
     *  @property {string} textures="" - The URL of a JPG or PNG image file to display for each particle. If you want
     *      transparency, use PNG format.
     *  @property {number} particleRadius=0.025 - The radius of each particle at the middle of its life.
     *  @property {number} radiusStart=NaN - The radius of each particle at the start of its life. If <code>NaN</code>, the
     *      <code>particleRadius</code> value is used.
     *  @property {number} radiusFinish=NaN - The radius of each particle at the end of its life. If <code>NaN</code>, the
     *      <code>particleRadius</code> value is used.
     *  @property {number} radiusSpread=0 - The spread in radius that each particle is given. For example, if
     *      <code>particleRadius == 0.5</code> and <code>radiusSpread == 0.25</code>, each particle will have a radius in the
     *      range <code>0.25</code> &ndash; <code>0.75</code>.
     *  @property {color} color=255,255,255 - The color of each particle at the middle of its life.
     *  @property {color} colorStart=NaN,NaN,NaN - The color of each particle at the start of its life. If any of the
     *      component values are undefined, the <code>color</code> value is used.
     *  @property {color} colorFinish=NaN,NaN,NaN - The color of each particle at the end of its life. If any of the
     *      component values are undefined, the <code>color</code> value is used.
     *  @property {color} colorSpread=0,0,0 - The spread in color that each particle is given. For example, if
     *      <code>color == {red: 100, green: 100, blue: 100}</code> and <code>colorSpread ==
     *      {red: 10, green: 25, blue: 50}</code>, each particle will have a color in the range
     *      <code>{red: 90, green: 75, blue: 50}</code> &ndash; <code>{red: 110, green: 125, blue: 150}</code>.
     *  @property {number} alpha=1 - The opacity of each particle at the middle of its life.
     *  @property {number} alphaStart=NaN - The opacity of each particle at the start of its life. If <code>NaN</code>, the
     *      <code>alpha</code> value is used.
     *  @property {number} alphaFinish=NaN - The opacity of each particle at the end of its life. If <code>NaN</code>, the
     *      <code>alpha</code> value is used.
     *  @property {number} alphaSpread=0 - The spread in alpha that each particle is given. For example, if
     *      <code>alpha == 0.5</code> and <code>alphaSpread == 0.25</code>, each particle will have an alpha in the range
     *      <code>0.25</code> &ndash; <code>0.75</code>.
     *  @property {number} particleSpin=0 - The rotation of each particle at the middle of its life, range
     *      <code>-2 * Math.PI</code> &ndash; <code>2 * Math.PI</code> radians.
     *  @property {number} spinStart=NaN - The rotation of each particle at the start of its life, range
     *      <code>-2 * Math.PI</code> &ndash; <code>2 * Math.PI</code> radians. If <code>NaN</code>, the
     *      <code>particleSpin</code> value is used.
     *  @property {number} spinFinish=NaN - The rotation of each particle at the end of its life, range
     *      <code>-2 * Math.PI</code> &ndash; <code>2 * Math.PI</code> radians. If <code>NaN</code>, the <
     *      code>particleSpin</code> value is used.
     *  @property {number} spinSpread=0 - The spread in spin that each particle is given, range <code>0</code> &ndash;
     *      <code>2 * Math.PI</code> radians. For example, if <code>particleSpin == Math.PI</code> and
     *      <code>spinSpread == Math.PI / 2</code>, each particle will have a rotation in the range
     *      <code>Math.PI / 2</code> &ndash; <code>3 * Math.PI / 2</code>.
     *  @property {boolean} rotateWithEntity=false - <code>true</code> if the particles' rotations are relative to the entity's
     *      instantaneous rotation, <code>false</code> if they're relative to world coordinates. If <code>true</code> with
     *      <code>particleSpin == 0</code>, the particles keep oriented per the entity's orientation.
     */

    /*@devdoc
     *  A wrapper for providing {@link ParticleEffectEntityProperties} and the number of bytes read.
     *  @typedef {object} PartifleEffectEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {ParticleEffectEntityProperties} properties - The ParticleEffect entity properties.
     */

    /*@devdoc
     *  Reads, if present, ParticleEffect entity properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the ParticleEffect entity properties in the
     *      {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {ParticleEffectEntitySubclassData} The ParticleEffect entity properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ParticleEffectEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int ParticleEffectEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        let shapeType: ShapeType | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE)) {
            shapeType = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let compoundShapeURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                compoundShapeURL = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                compoundShapeURL = "";
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

        let alpha: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA)) {
            alpha = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        const pulseProperties = PulsePropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        // Ignore deprecated pulse property.
        dataPosition += pulseProperties.bytesRead;

        let textures: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXTURES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                textures = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                textures = "";
            }
        }

        let maxParticles: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MAX_PARTICLES)) {
            maxParticles = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let lifespan: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIFESPAN)) {
            lifespan = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let isEmitting: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMITTING_PARTICLES)) {
            isEmitting = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let emitRate: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_RATE)) {
            emitRate = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let emitSpeed: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_SPEED)) {
            emitSpeed = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let speedSpread: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SPEED_SPREAD)) {
            speedSpread = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let emitOrientation: quat | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_ORIENTATION)) {
            emitOrientation = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
            dataPosition += 8;
        }

        let emitDimensions: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_DIMENSIONS)) {
            emitDimensions = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let emitRadiusStart: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_RADIUS_START)) {
            emitRadiusStart = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let polarStart: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_POLAR_START)) {
            polarStart = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let polarFinish: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_POLAR_FINISH)) {
            polarFinish = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let azimuthStart: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AZIMUTH_START)) {
            azimuthStart = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let azimuthFinish: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AZIMUTH_FINISH)) {
            azimuthFinish = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let emitAcceleration: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_ACCELERATION)) {
            emitAcceleration = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let accelerationSpread: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACCELERATION_SPREAD)) {
            accelerationSpread = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let particleRadius: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARTICLE_RADIUS)) {
            particleRadius = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let radiusSpread: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RADIUS_SPREAD)) {
            radiusSpread = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let radiusStart: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RADIUS_START)) {
            radiusStart = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let radiusFinish: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RADIUS_FINISH)) {
            radiusFinish = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let colorSpread: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR_SPREAD)) {
            colorSpread = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let colorStart: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR_START)) {
            colorStart = {
                red: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                green: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                blue: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let colorFinish: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR_FINISH)) {
            colorFinish = {
                red: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                green: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                blue: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let alphaSpread: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA_SPREAD)) {
            alphaSpread = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let alphaStart: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA_START)) {
            alphaStart = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let alphaFinish: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA_FINISH)) {
            alphaFinish = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let emitterShouldTrail: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMITTER_SHOULD_TRAIL)) {
            emitterShouldTrail = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let particleSpin: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARTICLE_SPIN)) {
            particleSpin = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let spinSpread: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SPIN_SPREAD)) {
            spinSpread = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let spinStart: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SPIN_START)) {
            spinStart = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let spinFinish: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SPIN_FINISH)) {
            spinFinish = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let rotateWithEntity: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARTICLE_ROTATE_WITH_ENTITY)) {
            rotateWithEntity = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                shapeType,
                compoundShapeURL,
                color,
                alpha,
                textures,
                maxParticles,
                lifespan,
                isEmitting,
                emitRate,
                emitSpeed,
                speedSpread,
                emitOrientation,
                emitDimensions,
                emitRadiusStart,
                polarStart,
                polarFinish,
                azimuthStart,
                azimuthFinish,
                emitAcceleration,
                accelerationSpread,
                particleRadius,
                radiusSpread,
                radiusStart,
                radiusFinish,
                colorSpread,
                colorStart,
                colorFinish,
                alphaSpread,
                alphaStart,
                alphaFinish,
                emitterShouldTrail,
                particleSpin,
                spinSpread,
                spinStart,
                spinFinish,
                rotateWithEntity
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default ParticleEffectEntityItem;
export type { ParticleEffectEntitySubclassData, ParticleEffectEntityProperties };
