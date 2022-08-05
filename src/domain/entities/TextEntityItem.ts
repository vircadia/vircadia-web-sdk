//
//  TextEntityItem.ts
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
import { color } from "../shared/Color";
import PropertyFlags from "../shared/PropertyFlags";
import { EntityPropertyFlags } from "./EntityPropertyFlags";
import PulsePropertyGroup from "./PulsePropertyGroup";


/*@sdkdoc
 *  <p>A Text entity may use one of the following effects:</p>
 *  <table>
 *      <thead>
 *          <tr><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>"none"</td><td>No effect.</td></tr>
 *          <tr><td>"outline"</td><td>An outline effect.</td></tr>
 *          <tr><td>"outline fill"</td><td>An outline effect, with fill.</td></tr>
 *          <tr><td>"shadow"</td><td>A shadow effect.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {string} TextEffect
 */
enum TextEffect {
    NONE = "none",
    OUTLINE = "outline",
    OUTLINE_FILL = "outline fill",
    SHADOW = "shadow"
}

/*@sdkdoc
 *  <p>A Text entity may use one of the following alignments:</p>
 *  <table>
 *      <thead>
 *          <tr><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>"left"</td><td>Text is aligned to the left side.</td></tr>
 *          <tr><td>"center"</td><td>Text is centered.</td></tr>
 *          <tr><td>"right"</td><td>Text is aligned to the right side.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {string} TextAlignment
 */
enum TextAlignment {
    LEFT = "left",
    CENTER = "center",
    RIGHT = "right"
}

type TextEntitySubclassProperties = {
    text: string | undefined;
    lineHeight: number | undefined;
    textEffectColor: color | undefined;
    textAlpha: number | undefined;
    backgroundAlpha: number | undefined;
    backgroundColor: color | undefined;
    leftMargin: number | undefined;
    rightMargin: number | undefined;
    topMargin: number | undefined;
    bottomMargin: number | undefined;
    unlit: boolean | undefined;
    font: string | undefined;
    textEffect: TextEffect | undefined;
    textColor: color | undefined;
    textEffectThickness: number | undefined;
    textAlignment: TextAlignment | undefined;
};

type TextEntityProperties = CommonEntityProperties & TextEntitySubclassProperties;

type TextEntitySubclassData = {
    bytesRead: number;
    properties: TextEntitySubclassProperties;
};


/*@devdoc
 *  The <code>TextEntityItem</code> class provides facilities for reading Text entity properties from a packet.
 *  @class TextEntityItem
 */
class TextEntityItem {
    // C++  class TextEntityItem : public EntityItem

    /*@sdkdoc
     *  The <code>Text</code> {@link EntityType} displays a 2D rectangle of text in the domain.
     *  <p>It has properties in addition to the {@link EntityProperties|common EntityProperties}. A property value may be
     *  undefined if it couldn't fit in the data packet sent by the server.</p>
     *  @typedef {object} TextEntityProperties
     *  @property {string | undefined} text - The text to display on the face of the entity. Text wraps if necessary to fit. New
     *      lines can be created using \n. Overflowing lines are not displayed.
     *  @property {number | undefined} lineHeight - The height of each line of text (thus determining the font size).
     *  @property {color | undefined} textEffectColor - The color of the text.
     *  @property {number | undefined} textAlpha - The opacity of the text.
     *  @property {number | undefined} backgroundAlpha - The opacity of the background.
     *  @property {color | undefined} backgroundColor - The color of the background rectangle.
     *  @property {number | undefined} leftMargin - The left margin, in meters.
     *  @property {number | undefined} rightMargin - The right margin, in meters.
     *  @property {number | undefined} topMargin - The top margin, in meters.
     *  @property {number | undefined} bottomMargin - The bottom margin, in meters.
     *  @property {boolean | undefined} unlit - <code>true</code> if the entity is unaffected by lighting, <code>false</code> if
     *      it is lit by the key light and local lights.
     *  @property {string | undefined} font - The font to render the text with. It can be one of the following:
     *      "<code>Courier</code>", "<code>Inconsolata</code>", "<code>Roboto</code>", "<code>Timeless</code>", or a path to a
     *      .sdff file.
     *  @property {TextEffect | undefined} textEffect - The effect that is applied to the text.
     *  @property {color | undefined} textColor - The color of the effect.
     *  @property {number | undefined} textEffectThickness - The magnitude of the text effect, range 0.0 – 0.5.
     *  @property {TextAlignment | undefined} textAlignment - How the text is aligned against its background.
     */

    /*@devdoc
     *  A wrapper for providing {@link TextEntityProperties} and the number of bytes read.
     *  @typedef {object} TextEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {TextEntityProperties} properties - The Text entity properties.
     */

    /*@devdoc
     *  Reads, if present, Text entity properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Text entity properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {TextEntitySubclassData} The Text entity properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): TextEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int TextEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //      bool& somethingChanged)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        const pulseProperties = PulsePropertyGroup.readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
        // Ignore deprecated pulse property.
        dataPosition += pulseProperties.bytesRead;

        let text: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                text = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            }
        }

        let lineHeight: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LINE_HEIGHT)) {
            lineHeight = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let textColor: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_COLOR)) {
            textColor = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let textAlpha: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_ALPHA)) {
            textAlpha = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let backgroundColor: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BACKGROUND_COLOR)) {
            backgroundColor = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let backgroundAlpha: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BACKGROUND_ALPHA)) {
            backgroundAlpha = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let leftMargin: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LEFT_MARGIN)) {
            leftMargin = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let rightMargin: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RIGHT_MARGIN)) {
            rightMargin = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let topMargin: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TOP_MARGIN)) {
            topMargin = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let bottomMargin: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BOTTOM_MARGIN)) {
            bottomMargin = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let unlit: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_UNLIT)) {
            unlit = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let font: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FONT)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                font = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            }
        }

        let textEffect: TextEffect | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_EFFECT)) {
            const value = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            switch (value) {
                case 0:
                    textEffect = TextEffect.NONE;
                    break;
                case 1:
                    textEffect = TextEffect.OUTLINE;
                    break;
                case 2:
                    textEffect = TextEffect.OUTLINE_FILL;
                    break;
                case 3:
                    textEffect = TextEffect.SHADOW;
                    break;
                default:
                    textEffect = TextEffect.NONE;
                    break;
            }
            dataPosition += 4;
        }

        let textEffectColor: color | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_EFFECT_COLOR)) {
            textEffectColor = {
                red: data.getUint8(dataPosition),
                green: data.getUint8(dataPosition + 1),
                blue: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let textEffectThickness: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_EFFECT_THICKNESS)) {
            textEffectThickness = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let textAlignment: TextAlignment | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXT_ALIGNMENT)) {
            const value = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            switch (value) {
                case 0:
                    textAlignment = TextAlignment.LEFT;
                    break;
                case 1:
                    textAlignment = TextAlignment.CENTER;
                    break;
                case 2:
                    textAlignment = TextAlignment.RIGHT;
                    break;
                default:
                    textAlignment = TextAlignment.RIGHT;
                    break;
            }
            dataPosition += 4;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                text,
                lineHeight,
                textEffectColor,
                textAlpha,
                backgroundAlpha,
                backgroundColor,
                leftMargin,
                rightMargin,
                topMargin,
                bottomMargin,
                unlit,
                font,
                textEffect,
                textColor,
                textEffectThickness,
                textAlignment
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default TextEntityItem;
export type { TextEntitySubclassData, TextEntityProperties };
