//
//  EntityData.ts
//
//  Created by Julien Merzoug on 16 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


type EntityDataDetails = {
    // WEBRTC TODO: Address further code.
};


const EntityData = new class {
    // C++ N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} an {@link PacketType(1)|EntityData} packet.
     *  @typedef {object} PacketScribe.EntityDataDetails
     */

    /*@devdoc
     *  Reads an {@link PacketType(1)|EntityData} packet.
     *  @function PacketScribe.EntityData&period;read
     *  @returns {PacketScribe.EntityDataDetails} The entity data information.
     */
    /* eslint-disable-next-line */
    //@ts-ignore
    read(): EntityDataDetails { /* eslint-disable-line class-methods-use-this */
    // WEBRTC TODO: Address further C++ code.
    }

}();

export default EntityData;
export type { EntityDataDetails };
