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
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";
import PulsePropertyGroup from "./PulsePropertyGroup";


// WEBRTC TODO: Replace Record<string, never> with ParticleEffectEntityItem's special properties.
type ParticleEffectEntitySubclassProperties = Record<string, never>;

// WEBRTC TODO: Make a union with ParticleEffectEntitySubclassProperties.
type ParticleEffectEntityProperties = CommonEntityProperties;

// WEBRTC TODO: Replace Record<string, never> with ParticleEffectEntityProperties.
type ParticleEffectEntitySubclassData = {
    bytesRead: number;
    properties: ParticleEffectEntitySubclassProperties;
};


class ParticleEffectEntityItem {
    // C++  class ParticleEffectEntityItem : public EntityItem

    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ParticleEffectEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int ParticleEffectEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE)) {
            // WEBRTC TODO: Read shapeType property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                // WEBRTC TODO: Read compoundShapeURL property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
            // WEBRTC TODO: Read color property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA)) {
            // WEBRTC TODO: Read alpha property.
            dataPosition += 4;
        }

        const pulseProperties = PulsePropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += pulseProperties.bytesRead;

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXTURES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
            // WEBRTC TODO: Read textures property.
                dataPosition += length;
            }
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MAX_PARTICLES)) {
            // WEBRTC TODO: Read maxParticles property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIFESPAN)) {
            // WEBRTC TODO: Read lifespan property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMITTING_PARTICLES)) {
            // WEBRTC TODO: Read emittingParticles property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_RATE)) {
            // WEBRTC TODO: Read emitRate property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_SPEED)) {
            // WEBRTC TODO: Read emitSpeed property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SPEED_SPREAD)) {
            // WEBRTC TODO: Read speedSpread property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_ORIENTATION)) {
            // WEBRTC TODO: Read emitOrientation property.
            dataPosition += 8;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_DIMENSIONS)) {
            // WEBRTC TODO: Read emitDimensions property.
            dataPosition += 12;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_RADIUS_START)) {
            // WEBRTC TODO: Read emitRadiusStart property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_POLAR_START)) {
            // WEBRTC TODO: Read polarStart property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_POLAR_FINISH)) {
            // WEBRTC TODO: Read polarFinish property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AZIMUTH_START)) {
            // WEBRTC TODO: Read azimuthStart property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AZIMUTH_FINISH)) {
            // WEBRTC TODO: Read azimuthFinish property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMIT_ACCELERATION)) {
            // WEBRTC TODO: Read emitAcceleration property.
            dataPosition += 12;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACCELERATION_SPREAD)) {
            // WEBRTC TODO: Read accelerationSpread property.
            dataPosition += 12;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARTICLE_RADIUS)) {
            // WEBRTC TODO: Read particleRadius property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RADIUS_SPREAD)) {
            // WEBRTC TODO: Read radiusSpread property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RADIUS_START)) {
            // WEBRTC TODO: Read radiusStart property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RADIUS_FINISH)) {
            // WEBRTC TODO: Read radiusFinish property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR_SPREAD)) {
            // WEBRTC TODO: Read colorSpread property.
            dataPosition += 3;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR_START)) {
            // WEBRTC TODO: Read colorStart property.
            dataPosition += 12;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR_FINISH)) {
            // WEBRTC TODO: Read colorFinish property.
            dataPosition += 12;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA_SPREAD)) {
            // WEBRTC TODO: Read alphaSpread property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA_START)) {
            // WEBRTC TODO: Read alphaStart property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ALPHA_FINISH)) {
            // WEBRTC TODO: Read alphaFinish property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMITTER_SHOULD_TRAIL)) {
            // WEBRTC TODO: Read emitterShouldTrail property.
            dataPosition += 1;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARTICLE_SPIN)) {
            // WEBRTC TODO: Read particleSpin property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SPIN_SPREAD)) {
            // WEBRTC TODO: Read spinSpread property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SPIN_START)) {
            // WEBRTC TODO: Read spinStart property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SPIN_FINISH)) {
            // WEBRTC TODO: Read spinFinish property.
            dataPosition += 4;
        }

        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARTICLE_ROTATE_WITH_ENTITY)) {
            // WEBRTC TODO: Read particleRotateWithEntity property.
            dataPosition += 1;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {}
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default ParticleEffectEntityItem;
export type { ParticleEffectEntitySubclassData, ParticleEffectEntityProperties };
