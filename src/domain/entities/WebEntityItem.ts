//
//  WebEntityItem.ts
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


/*@sdkdoc
 *  Specifies how a {@link WebEntityProperties|Web entity} processes events.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>Touch<td><code>0</code></td><td>Events are processed as touch events.</td></tr>
 *          <tr><td>Mouse<td><code>1</code></td><td>Events are processed as mouse events.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} WebInputMode
 */
enum WebInputMode {
    // C++  enum class WebInputMode
    TOUCH = 0,
    MOUSE
}

type WebEntitySubclassProperties = {
    sourceURL: string | undefined,  // Renamed from native client's "sourceUrl".
    color: color | undefined,
    alpha: number | undefined,
    dpi: number | undefined,
    scriptURL: string | undefined,
    maxFPS: number | undefined,
    inputMode: WebInputMode | undefined,
    showKeyboardFocusHighlight: boolean | undefined,
    useBackground: boolean | undefined,
    userAgent: string | undefined
};

type WebEntityProperties = CommonEntityProperties & WebEntitySubclassProperties;

type WebEntitySubclassData = {
    bytesRead: number;
    properties: WebEntitySubclassProperties;
};


/*@devdoc
 *  The <code>WebEntityItem</code> class provides facilities for reading Web entity properties from a packet.
 *  <p>C++: <code>class WebEntityItem : public EntityItem</code></p>
 *  @class WebEntityItem
 */
class WebEntityItem {
    // C++  class WebEntityItem : public EntityItem

    /*@sdkdoc
     *  The <code>Web</code> {@link EntityType} displays a browsable web page. Each user views their own copy of the web page:
     *  if one user navigates to another page on the entity, other users do not see the change; if a video is being played,
     *  users don't see it in sync. Internally, a Web entity is treated as a non-repeating, upside down texture, so additional
     *  transformations may be necessary if you reference a Web entity texture by UUID.
     *  <p>It has properties in addition to the {@link EntityProperties|common EntityProperties}. A property value may be
     *  undefined if it couldn't fit in the data packet sent by the server.</p>
     *  @typedef {object} WebEntityProperties
     *  @property {string|undefined} sourceURL - The URL of the web page to display. This value does not change as you or others
     *      navigate on the Web entity.
     *  @property {color|undefined} color - The color of the web surface. This color tints the web page displayed: the pixel
     *      colors on the web page are multiplied by the property color. For example, a value of <code>{ red: 255, green: 0,
     *      blue: 0 }</code> lets only the red channel of pixels' colors through.
     *  @property {number|undefined} alpha - The opacity of the web surface.
     *  @property {number|undefined} dpi - The resolution to display the page at, in dots per inch. If you convert this to dots
     *      per meter (multiply by <code>1 / 0.0254 = 39.3701</code>) then multiply </code>dimensions.x</code> and
     *      <code>dimensions.y</code> by that value you get the resolution in pixels.
     *  @property {string|undefined} scriptURL - The URL of a JavaScript file to inject into the web page.
     *  @property {number|undefined} maxFPS - The maximum update rate for the web content, in frames/second.
     *  @property {WebInputMode|undefined} inputMode - The user input mode to use.
     *  @property {boolean|undefined} showKeyboardFocusHighlight - <code>true</code> if the entity is highlighted when it has
     *      keyboard focus, <code>false</code> if it isn't.
     *  @property {boolean|undefined} useBackground - <code>true</code> if the web entity should have a background,
     *      <code>false</code> if the web entity's background should be transparent. The web page must have CSS properties for
     *      transparency set on the <code>background-color</code> for this property to have an effect.
     *  @property {string|undefined} userAgent - The user agent for the web entity to use when visiting web pages. Default
     *      value: <code>Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko)
     *      Chrome/69.0.3497.113 Mobile Safari/537.36</code>.
     */

    /*@devdoc
     *  A wrapper for providing {@link WebEntityProperties} and the number of bytes read.
     *  @typedef {object} WebEntitySubclassData
     *  @property {number} bytesRead - The number of bytes read.
     *  @property {WebEntityProperties} properties - The Web entity properties.
     */

    /*@devdoc
     *  Reads, if present, Web entity properties in an {@link PacketType(1)|EntityData} packet.
     *  <p><em>Static</em></p>
     *  @param {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @param {number} position - The position of the Web entity properties in the {@link Packets|EntityData} message data.
     *  @param {PropertyFlags} propertyFlags - The property flags.
     *  @returns {WebEntitySubclassData} The Web entity properties and the number of bytes read.
     */
    static readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): WebEntitySubclassData { // eslint-disable-line class-methods-use-this, max-len
        // C++  int WebEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
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
        // Ignore deprecated pulse property.
        dataPosition += pulseProperties.bytesRead;

        let sourceURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SOURCE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                sourceURL = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                sourceURL = "";
            }
        }

        let dpi: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DPI)) {
            dpi = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
        }

        let scriptURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                scriptURL = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                scriptURL = "";
            }
        }

        let maxFPS: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MAX_FPS)) {
            maxFPS = data.getUint8(dataPosition);
            dataPosition += 1;
        }

        let inputMode: WebInputMode | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_INPUT_MODE)) {
            inputMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let showKeyboardFocusHighlight: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHOW_KEYBOARD_FOCUS_HIGHLIGHT)) {
            showKeyboardFocusHighlight = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let useBackground: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_WEB_USE_BACKGROUND)) {
            useBackground = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let userAgent: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USER_AGENT)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            if (length > 0) {
                userAgent = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, length));
                dataPosition += length;
            } else {
                userAgent = "";
            }
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                sourceURL,
                color,
                alpha,
                dpi,
                scriptURL,
                maxFPS,
                inputMode,
                showKeyboardFocusHighlight,
                useBackground,
                userAgent
            }
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default WebEntityItem;
export type { WebInputMode, WebEntitySubclassData, WebEntityProperties };
