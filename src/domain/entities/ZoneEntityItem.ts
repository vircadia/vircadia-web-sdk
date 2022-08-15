//
//  ZoneEntityItem.ts
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
import AvatarPriorityMode from "../shared/AvatarPriorityMode";
import ComponentMode from "../shared/ComponentMode";
import PropertyFlags from "../shared/PropertyFlags";
import ShapeType from "../shared/ShapeType";
import AmbientLightPropertyGroup, { AmbientLightProperties } from "./AmbientLightPropertyGroup";
import BloomPropertyGroup, { BloomProperties } from "./BloomPropertyGroup";
import { EntityPropertyFlags } from "./EntityPropertyFlags";
import HazePropertyGroup, { HazeProperties } from "./HazePropertyGroup";
import KeyLightPropertyGroup, { KeyLightProperties } from "./KeyLightPropertyGroup";
import SkyboxPropertyGroup, { SkyboxProperties } from "./SkyboxPropertyGroup";


type ZoneEntitySubclassProperties = {
    shapeType: ShapeType | undefined,
    compoundShapeURL: string | undefined,
    keyLightMode: ComponentMode | undefined,
    keyLight: KeyLightProperties | undefined,
    ambientLightMode: ComponentMode | undefined,
    ambientLight: AmbientLightProperties | undefined,
    skyboxMode: ComponentMode | undefined,
    skybox: SkyboxProperties | undefined,
    hazeMode: ComponentMode | undefined,
    haze: HazeProperties | undefined,
    bloomMode: ComponentMode | undefined,
    bloom: BloomProperties | undefined,
    flyingAllowed: boolean | undefined,
    ghostingAllowed: boolean | undefined,
    filterURL: string | undefined,
    avatarPriority: AvatarPriorityMode | undefined,
    screenshare: ComponentMode | undefined
};

type ZoneEntityProperties = CommonEntityProperties & ZoneEntitySubclassProperties;

type ZoneEntitySubclassData = {
    bytesRead: number;
    properties: ZoneEntitySubclassProperties;
};


/*@devdoc
 *  The <code>ZoneEntityItem</code> class provides facilities for reading Zone entity properties from a packet.
 *  <p>C++: <code>class ZoneEntityItem : public EntityItem</code></p>
 *  @class ZoneEntityItem
 */
class ZoneEntityItem {
    // C++  class ZoneEntityItem : public EntityItem

    /*@sdkdoc
     *  The <code>Zone</code> {@link EntityType} is a volume of lighting effects and avatar permissions.
     *  <p>It has properties in addition to the {@link EntityProperties|common EntityProperties}. A property value may be
     *  undefined if it couldn't fit in the data packet sent by the server.</p>
     *  @typedef {object} ZoneEntityProperties
     *  @property {ShapeType|undefined} [shapeType=BOX] - The shape of the volume in which the zone's lighting effects and
     *      avatar permissions have effect. Reverts to the default value if set to <code>NONE</code>, or set to
     *      <code>COMPOUND</code> and <code>compoundShapeURL</code> is <code>""</code>.
     *  @property {string|undefined} [compoundShapeURL=""] - The model file to use for the compound shape if
     *      <code>shapeType</code> is <code>COMPOUND</code>.
     *  @property {ComponentMode|undefined} [keyLightMode=INHERIT] - Configures the key light in the zone.
     *  @property {KeyLightProperties|undefined} [keyLight] - The key light properties of the zone.
     *  @property {ComponentMode|undefined} [ambientLightMode=INHERIT] - Configures the ambient light in the zone.
     *  @property {AmbientLightProperties|undefined} [ambientLight] - The ambient light properties of the zone.
     *  @property {ComponentMode|undefined} [skyboxMode=INHERIT] - Configures the skybox displayed in the zone.
     *  @property {SkyboxProperties|undefined} [skybox] - The skybox properties of the zone.
     *  @property {ComponentMode|undefined} [hazeMode=INHERIT] - Configures the haze in the zone.
     *  @property {HazeProperties|undefined} [haze] - The haze properties of the zone.
     *  @property {ComponentMode|undefined} [bloomMode=INHERIT] - Configures the bloom in the zone.
     *  @property {BloomProperties|undefined} [bloom] - The bloom properties of the zone.
     *  @property {boolean|undefined} [flyingAllowed=true] - <code>true</code> if visitors can fly in the zone;
     *      <code>false</code> if they cannot. Only works for domain entities.
     *  @property {boolean|undefined} [ghostingAllowed=true] - <code>true</code> if visitors with avatar collisions turned off
     *      will not collide with content in the zone; <code>false</code> if visitors will always collide with content in the
     *      zone. Only works for domain entities.
     *  @property {string|undefined} [filterURL=""] - The URL of a JavaScript file that filters changes to properties of
     *      entities within the zone. It is periodically executed for each entity in the zone. It can, for example, be used to
     *      not allow changes to certain properties:
     *      <pre>
     *      function filter(properties) {
     *          // Check and edit properties object values,
     *          // e.g., properties.modelURL, as required.
     *          return properties;
     *      }
     *      </pre>
     *  @property {AvatarPriorityMode|undefined} [avatarPriority=INHERIT] - Configures the priority of updates from avatars in
     *      the zone to other clients.
     *  @property {ComponentMode|undefined} [screenshare=INHERIT] - Configures screen-sharing in the zone.
     */
    // WEBRTC TODO: Add the following to the Zone entity description once implemented:
    //              Avatar interaction events such as {@link Entities.enterEntity} are also often used with a Zone entity.

    /*@devdoc
     *  A wrapper for providing {@link ZoneEntityProperties} and the number of bytes read.
     *  @typedef {object} ZoneEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {ZoneEntityProperties} properties - The Zone entity properties.
     */

    /*@devdoc
     *  Reads, if present, Zone entity properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Zone entity properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {ZoneEntitySubclassData} The Zone entity properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ZoneEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int ZoneEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
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

        const keyLightProperties = KeyLightPropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += keyLightProperties.bytesRead;

        const ambientLightProperties = AmbientLightPropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition,
            propertyFlags);
        dataPosition += ambientLightProperties.bytesRead;

        const skyboxProperties = SkyboxPropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += skyboxProperties.bytesRead;

        const hazeProperties = HazePropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += hazeProperties.bytesRead;

        const bloomProperties = BloomPropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        dataPosition += bloomProperties.bytesRead;

        let flyingAllowed: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FLYING_ALLOWED)) {
            flyingAllowed = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let ghostingAllowed: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GHOSTING_ALLOWED)) {
            ghostingAllowed = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let filterURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FILTER_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                filterURL = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                filterURL = "";
            }
        }

        let keyLightMode: ComponentMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEY_LIGHT_MODE)) {
            keyLightMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let ambientLightMode: ComponentMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AMBIENT_LIGHT_MODE)) {
            ambientLightMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let skyboxMode: ComponentMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SKYBOX_MODE)) {
            skyboxMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let hazeMode: ComponentMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HAZE_MODE)) {
            hazeMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let bloomMode: ComponentMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLOOM_MODE)) {
            bloomMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let avatarPriority: AvatarPriorityMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_AVATAR_PRIORITY)) {
            avatarPriority = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let screenshare: ComponentMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCREENSHARE)) {
            screenshare = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                shapeType,
                compoundShapeURL,
                keyLightMode,
                keyLight: keyLightProperties.bytesRead > 0 ? keyLightProperties.properties : undefined,
                ambientLightMode,
                ambientLight: ambientLightProperties.bytesRead > 0 ? ambientLightProperties.properties : undefined,
                skyboxMode,
                skybox: skyboxProperties.bytesRead > 0 ? skyboxProperties.properties : undefined,
                hazeMode,
                haze: hazeProperties.bytesRead > 0 ? hazeProperties.properties : undefined,
                bloomMode,
                bloom: bloomProperties.bytesRead > 0 ? bloomProperties.properties : undefined,
                flyingAllowed,
                ghostingAllowed,
                filterURL,
                avatarPriority,
                screenshare
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default ZoneEntityItem;
export type { ZoneEntitySubclassData, ZoneEntityProperties };
