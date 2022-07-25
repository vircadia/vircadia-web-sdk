//
//  ImageEntityItem.ts
//
//  Created by Julien Merzoug on 14 Jul 2022.
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


type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type ImageEntitySubclassProperties = {
    imageURL: string | undefined;
    emissive: boolean | undefined;
    keepAspectRatio: boolean | undefined;
    subImage: Rect | undefined;
    color: color | undefined;
    alpha: number | undefined;
};

type ImageEntityProperties = CommonEntityProperties & ImageEntitySubclassProperties;

type ImageEntitySubclassData = {
    bytesRead: number;
    properties: ImageEntitySubclassProperties;
};


/*@devdoc
 *  The <code>ImageEntityItem</code> class provides facilities for reading image entity properties from a packet.
 *  @class ImageEntityItem
 */
class ImageEntityItem {
    // C++  class ImageEntityItem : public EntityItem

    /*@sdkdoc
     *  Defines a rectangular portion of an image or screen, or similar.
     *  @typedef {object} Rect
     *  @property {number} x - Left, x-coordinate value.
     *  @property {number} y - Top, y-coordinate value.
     *  @property {number} width - Width of the rectangle.
     *  @property {number} height - Height of the rectangle.
     */

    /*@sdkdoc
     *  The <code>"Image"</code> {@link EntityType|entity type} displays an image on a 2D rectangle in the domain. It has
     *  properties in addition to the common {@link EntityProperties}.
     *  @typedef {object} ShapeEntityProperties
     *  @property {string} imageURL - The URL of the image to use.
     *  @property {boolean} emissive - <code>true</code> if the image should be emissive (unlit), <code>false</code> if it
     *      shouldn't.
     *  @property {boolean} keepAspectRatio - <code>true</code> if the image should maintain its aspect ratio,
     *      <code>false</code> if it shouldn't.
     *  @property {Rect} subImage - The portion of the image to display. If width or height are <code>0</code>, it defaults to
     *      the full image in that dimension.
     *  @property {color | undefined} color - The color of the entity.
     *  @property {number | undefined} alpha - The opacity of the image.
     */

    /*@devdoc
     *  A wrapper for providing {@link ImageEntityProperties} and the number of bytes read.
     *  @typedef {object} ImageEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {ImageEntityProperties} properties - The image entity properties.
     */

    /*@devdoc
     *  Reads, if present, image properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the image properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {ImageEntitySubclassData} The image properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): ImageEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int ImageEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

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

        let imageURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_IMAGE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                imageURL = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            }
        }

        let emissive: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EMISSIVE)) {
            emissive = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let keepAspectRatio: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_KEEP_ASPECT_RATIO)) {
            keepAspectRatio = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let subImage: Rect | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SUB_IMAGE)) {
            subImage = {
                x: data.getUint32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getUint32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                width: data.getUint32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                height: data.getUint32(dataPosition + 4, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 16;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                imageURL,
                emissive,
                keepAspectRatio,
                subImage,
                color,
                alpha
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default ImageEntityItem;
export type { ImageEntitySubclassData, ImageEntityProperties };
