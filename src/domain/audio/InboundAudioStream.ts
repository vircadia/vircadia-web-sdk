//
//  InboundAudioStream.ts
//
//  Created by David Rowe on 16 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioConstants from "../audio/AudioConstants";
import AudioOutput from "../audio/AudioOutput";
import ReceivedMessage from "../networking/ReceivedMessage";
import { MixedAudioDetails } from "../networking/packets/MixedAudio";
import PacketScribe from "../networking/packets/PacketScribe";
import { SilentAudioFrameDetails } from "../networking/packets/SilentAudioFrame";
import PacketType, { PacketTypeValue } from "../networking/udt/PacketHeaders";
import UDT from "../networking/udt/UDT";
import assert from "../shared/assert";
import ContextManager from "../shared/ContextManager";


/*@devdoc
 *  The <code>InboundAudioStream</code> class manages an inbound audio stream received from the audio mixer.
 *  <p>C++: <code>InboundAudioStream : public NodeData : QObject</code></p>
 *  @class InboundAudioStream
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *  @param {number} numChannels - The number of audio channels. <code>2</code> for stereo.
 *  @param {number} numFrames - The number of samples in a network packet per channel. <code>240</code>.
 *  @param {number} numBlocks - The maximum number of audio blocks to handle in the audio ring buffer.
 *  @param {number} numStaticJitterBlocks - The target number of audio blocks to have in the jitter buffer. <code>-1</code> for
 *      a dynamic jitter buffer.
 */
class InboundAudioStream {
    // C++  InboundAudioStream : public NodeData : QObject

    // Context.
    #_audioOutput;

    #_numSamplesInMessage: number;
    #_lastSequenceNumber: number;
    #_previousMessage: {
        messageType: PacketTypeValue,
        info: MixedAudioDetails | SilentAudioFrameDetails,
        isMessageInSequence: boolean,
        isMessageEarly: boolean,
        numMessagesMissing: number
    } | null;

    #_staticJitterBufferSize: number;  // Number of audio blocks.
    #_jitterBufferSamplesPerBlock;

    #_selectedCodecName = "";
    #_decoder = null;


    /* eslint-disable */
    // @ts-ignore
    constructor(contextID: number, numChannels: number, numFrames: number, numBlocks: number, numStaticJitterBlocks: number) {
        // C++  InboundAudioStream(int numChannels, int numFrames, int numBlocks, int numStaticJitterBlocks)

        // Context.
        this.#_audioOutput = ContextManager.get(contextID, AudioOutput) as AudioOutput;

        this.#_numSamplesInMessage = numChannels * numFrames;
        this.#_lastSequenceNumber = -1;
        this.#_previousMessage = null;

        this.#_staticJitterBufferSize = numStaticJitterBlocks === -1 ? Math.floor(numBlocks / 2) : numStaticJitterBlocks;

        assert(numChannels === 2);
        this.#_jitterBufferSamplesPerBlock = numChannels * AudioConstants.AUDIO_WORKLET_BLOCK_SIZE;

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

        const messageType = message.getType();
        let info: MixedAudioDetails | SilentAudioFrameDetails | null = null;
        if (messageType === PacketType.MixedAudio) {
            info = PacketScribe.MixedAudio.read(message.getMessage());
        } else {
            info = PacketScribe.SilentAudioFrame.read(message.getMessage());
        }

        const messageLength = message.getMessage().byteLength;


        // The C++ SequenceNumberStats code is simplified here.

        const UINT16_RANGE = 65536;
        const isMessageInSequence = info.sequenceNumber === (this.#_lastSequenceNumber + 1) % UINT16_RANGE;

        // Message is early (i.e., messages are missing) if it's not in sequence within a reasonable gap.
        let isMessageEarly = false;
        let numMessagesMissing = 0;
        if (!isMessageInSequence) {
            numMessagesMissing = info.sequenceNumber - this.#_lastSequenceNumber;
            if (numMessagesMissing < 0) {
                numMessagesMissing += UINT16_RANGE;
            }
            numMessagesMissing -= 1;
            const MAX_REASONABLE_SEQUENCE_GAP = 1000;
            isMessageEarly = numMessagesMissing <= MAX_REASONABLE_SEQUENCE_GAP;
        }

        this.#_lastSequenceNumber = info.sequenceNumber;


        // Ignore late messages.
        if (!isMessageInSequence && !isMessageEarly) {

            // WEBRTC TODO: Address further C++ code. Handle late packets.
            // These aren't handled in the C++ either.
            // In practice they seem not to occur; more common is packets being dropped.
            // Could perhaps buffer a small number of packets here and insert late packets.

            return messageLength;
        }


        // The C++ relies on the audio codec to ramp down the volume if a packet has been lost.
        // We instead buffer the message and process the previous one.

        // Ramp up the volume of this message if it's early or the first message.
        const previousMessage = this.#_previousMessage;
        if ((isMessageEarly || previousMessage === null) && messageType === PacketType.MixedAudio) {
            const audioBuffer = (info as MixedAudioDetails).audioBuffer;
            for (let i = 0, length = audioBuffer.byteLength; i < length; i += 2) {
                const scale = i / length;
                audioBuffer.setInt16(i, audioBuffer.getInt16(i, UDT.LITTLE_ENDIAN) * scale, UDT.LITTLE_ENDIAN);
            }
        }

        // Buffer the current message and retrieve the previous.
        this.#_previousMessage = {
            messageType,
            info,
            isMessageInSequence,
            isMessageEarly,
            numMessagesMissing
        };

        // Nothing to output if no previous message.
        if (previousMessage === null) {
            return messageLength;
        }

        // Ramp down the volume of previous message if the current message is early.
        if (isMessageEarly && previousMessage.messageType === PacketType.MixedAudio) {
            const audioBuffer = (previousMessage.info as MixedAudioDetails).audioBuffer;
            for (let i = 0, length = audioBuffer.byteLength; i < length; i += 2) {
                const scale = 1 - i / length;
                audioBuffer.setInt16(i, audioBuffer.getInt16(i, UDT.LITTLE_ENDIAN) * scale, UDT.LITTLE_ENDIAN);
            }

        }


        // Insert silent samples for any missing.
        if (previousMessage.isMessageEarly) {
            this.#writeDroppableSilentSamples(previousMessage.numMessagesMissing * this.#_numSamplesInMessage);
        }

        // Process message.
        info = previousMessage.info;
        if (previousMessage.messageType === PacketType.SilentAudioFrame) {
            // Possibly drop some of the samples in order to catch up to the desired jitter buffer size.
            this.#writeDroppableSilentSamples((info as SilentAudioFrameDetails).numSilentSamples);
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

        // Could buffer a small number of packets here and insert late packets, before passing them to the jitter buffer.
        // WEBRTC TODO: Address further C++ code. Jitter buffer sizing.

        return messageLength;
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
        // C++  void cleanupCodec()

        // WEBRTC TODO: Address further C++ code.

        this.#_selectedCodecName = "";
    }

    /*@devdoc
     *  Resets audio output processing.
     */
    reset(): void {
        // C++  void reset()

        // WEBRTC TODO: Address further C++ code.

        // Web SDK specific.
        this.#_lastSequenceNumber = -1;
        this.#_previousMessage = null;
    }


    // eslint-disable-next-line class-methods-use-this
    #writeDroppableSilentSamples(silentSamples: number): void {
        // C++  int writeDroppableSilentFrames(int silentFrames)

        // WEBRTC TODO: Address further C++ code. Fade toward silence.

        // Write silent samples if jitter buffer size less than its desired size.
        if (this.#_audioOutput.bufferSize < this.#_staticJitterBufferSize) {
            const desiredSilentSamples = (this.#_staticJitterBufferSize - this.#_audioOutput.bufferSize)
                * this.#_jitterBufferSamplesPerBlock;
            const numSamplesToWrite = Math.min(silentSamples, desiredSilentSamples);

            const silentBuffer = new Int16Array(numSamplesToWrite);  // Is initialized to 0s.
            this.#_audioOutput.writeData(silentBuffer);
        }

        // WEBRTC TODO: Address further C++ code. Dynamic jitter buffer.

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
