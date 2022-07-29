//
//  InboundAudioStream.unit.test.js
//
//  Created by David Rowe on 16 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();


import AudioConstants from "../../../src/domain/audio/AudioConstants";
import AudioOutput from "../../../src/domain/audio/AudioOutput";
import InboundAudioStream from "../../../src/domain/audio/InboundAudioStream";
import NLPacket from "../../../src/domain/networking/NLPacket";
import ReceivedMessage from "../../../src/domain/networking/ReceivedMessage";
import SockAddr from "../../../src/domain/networking/SockAddr";
import Packet from "../../../src/domain/networking/udt/Packet";
import PacketType from "../../../src/domain/networking/udt/PacketHeaders";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("InboundAudioStream - unit tests", () => {

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AudioOutput);

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Suppress console messages from being displayed.
    const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });


    test("Can parse a silent audio packet", () => {
        const PACKET_HEX = "b90200000c188d32cdc72b0d8626d38a1f4943393e8f3a759602040000006f707573e0010000";
        const arrayBuffer = new ArrayBuffer(PACKET_HEX.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(PACKET_HEX.substr(i * 2, 2), 16);
        }

        const dataView = new DataView(arrayBuffer);
        const sockAddr = new SockAddr();
        sockAddr.setPort(7);
        const packet = new Packet(dataView, dataView.byteLength, sockAddr);
        const nlPacket = new NLPacket(packet);
        expect(nlPacket.getType()).toBe(PacketType.SilentAudioFrame);
        const receivedMessage = new ReceivedMessage(nlPacket);

        const inboundAudioStream = new InboundAudioStream(contextID, AudioConstants.STEREO,
            AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL, 100, -1);
        const bytesProcessed = inboundAudioStream.parseData(receivedMessage);
        expect(bytesProcessed).toBe(14);
    });

    test("Can set and clear the codec", () => {
        const inboundAudioStream = new InboundAudioStream(contextID, AudioConstants.STEREO,
            AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL, 100, -1);
        inboundAudioStream.setupCodec("pcm");
        inboundAudioStream.cleanupCodec();
        expect(true).toBe(true);
    });


    warn.mockReset();

});
