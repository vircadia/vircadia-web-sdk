//
//  InboundAudioStream.ts
//
//  Created by David Rowe on 16 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioOutput from "../audio/AudioOutput";
import ReceivedMessage from "../networking/ReceivedMessage";
import { MixedAudioDetails } from "../networking/packets/MixedAudio";
import PacketScribe from "../networking/packets/PacketScribe";
import { SilentAudioFrameDetails } from "../networking/packets/SilentAudioFrame";
import PacketType from "../networking/udt/PacketHeaders";
import UDT from "../networking/udt/UDT";
import ContextManager from "../shared/ContextManager";


/*@devdoc
 *  The <code>InboundAudioStream</code> class manages an inbound audio stream received from the audio mixer.
 *  <p>C++: <code>InboundAudioStream : public NodeData : QObject</code></p>
 *  @class InboundAudioStream
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *  @param {number} numChannels - The number of audio channels. <code>2</code> for stereo.
 *  @param {number} numFrames - The number of samples in a network packet per channel.
 *  @param {number} numBlocks - The number of network packets to handle in the audio ring buffer.
 *  @param {number} numStaticJitterBlocks - The number of network packets to handle in the jitter buffer. <code>-1</code> for
 *      a dynamic jitter buffer.
 */
class InboundAudioStream {
    // C++  InboundAudioStream : public NodeData : QObject

    // Context.
    #_audioOutput;

    #_selectedCodecName = "";
    #_decoder = null;

    // WEBRTC TODO: Remove when have logger with "once" function.
    #_haveWarnedWriteDroppableSilentFrames = false;;


    /* eslint-disable */
    // @ts-ignore
    constructor(contextID: number, numChannels: number, numFrames: number, numBlocks: number, numStaticJitterBlocks: number) {
        // C++  InboundAudioStream(int numChannels, int numFrames, int numBlocks, int numStaticJitterBlocks)

        // Context.
        this.#_audioOutput = ContextManager.get(contextID, AudioOutput) as AudioOutput;

        // WEBRTC TODO: Address further C++ code.

    }
    /* eslint-enable */


    /*@devdoc
     *  Reads and processes <code>MixedAudio</code> and <code>SilentAudioFrame</code> {@link PacketType(1)|messages} received
     *  from the audio mixer.
     *  @param {ReceivedMessage} message - The <code>MixedAudio</code> or <code>SilentAudioFrame</code> message to process.
     *  @returns {number} The number of bytes of the message processed.
     */
    parseData(message: ReceivedMessage): number {
        // C++  int parseData(ReceivedMessage& message)

        let info: MixedAudioDetails | SilentAudioFrameDetails | null = null;
        if (message.getType() === PacketType.MixedAudio) {
            info = PacketScribe.MixedAudio.read(message.getMessage());
        } else {
            info = PacketScribe.SilentAudioFrame.read(message.getMessage());
        }

        // WEBRTC TODO: Address further C++ code.
        // Assume that the packet arrived in order and on time, for now.

        if (message.getType() === PacketType.SilentAudioFrame) {
            // Possibly drop some of the samples in order to catch up to the desired jitter buffer size.
            this.#writeDroppableSilentFrames((info as SilentAudioFrameDetails).numSilentSamples);
        } else {
            const selectedPCM = this.#_selectedCodecName === "pcm" || this.#_selectedCodecName === "";
            const packetPCM = info.codecName === "pcm" || info.codecName === "";
            if (info.codecName === this.#_selectedCodecName || packetPCM && selectedPCM) {
                this.#parseAudioData((info as MixedAudioDetails).audioBuffer);

                // WEBRTC TODO: Address further C++ code.

            } else {

                // WEBRTC TODO: Address further C++ code.
                console.warn("Codec mismatch not handled.");

            }
        }

        return message.getMessage().byteLength;
    }

    /*@devdoc
     *  Sets the codec to use for processing the audio data received from the audio mixer.
     *  @param {string} codecName - The name of the codec to use, e.g., <code>"opus"</code>.
     */
    setupCodec(codecName: string): void {
        // C++  void setupCodec(CodecPlugin* codec, const QString& codecName, int numChannels)
        this.cleanupCodec();
        this.#_selectedCodecName = codecName;

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Removes any current codec, if any, currently being used for processing the audio date received from the audio mixer.
     */
    cleanupCodec(): void {
        // C++  void InboundAudioStream::cleanupCodec()

        // WEBRTC TODO: Address further C++ code.

        this.#_selectedCodecName = "";
    }


    // eslint-disable-next-line class-methods-use-this
    #writeDroppableSilentFrames(silentFrames: number): void {
        // C++  int writeDroppableSilentFrames(int silentFrames)

        // WEBRTC TODO: Address further C++ code.
        if (!this.#_haveWarnedWriteDroppableSilentFrames) {
            console.warn("InboundAudioStream.#writeDroppableSilentFrames() not implemented. Frames:", silentFrames);
            this.#_haveWarnedWriteDroppableSilentFrames = true;
        }

    }

    #parseAudioData(packetData: DataView): number {
        // C++  int parseAudioData(const QByteArray& packetAfterStreamProperties)

        let decodedBuffer: Int16Array;  // eslint-disable-line @typescript-eslint/init-declarations

        if (this.#_decoder) {

            // WEBRTC TODO: Address further C++ code.
            console.warn("Codec support not implemented.", this.#_selectedCodecName);
            decodedBuffer = new Int16Array();

        } else {

            // Extract PCM data.
            decodedBuffer = new Int16Array(packetData.byteLength / 2);
            for (let i = 0, length = decodedBuffer.length; i < length; i++) {
                decodedBuffer[i] = packetData.getInt16(i * 2, UDT.LITTLE_ENDIAN);
            }

        }

        // In place of C++'s _ringBuffer use the Web SDK's AudioOutput.
        this.#_audioOutput.writeData(decodedBuffer);

        return decodedBuffer.byteLength;
    }

}

export default InboundAudioStream;
