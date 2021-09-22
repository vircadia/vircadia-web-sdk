//
//  AudioClient.ts
//
//  Created by David Rowe on 15 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioConstants from "../audio/AudioConstants";
import InboundAudioStream from "../audio/InboundAudioStream";
import Node from "../networking/Node";
import NodeList from "../networking/NodeList";
import NodeType from "../networking/NodeType";
import PacketReceiver from "../networking/PacketReceiver";
import ReceivedMessage from "../networking/ReceivedMessage";
import SockAddr from "../networking/SockAddr";
import PacketScribe from "../networking/packets/PacketScribe";
import PacketType, { PacketTypeValue } from "../networking/udt/PacketHeaders";
import ContextManager from "../shared/ContextManager";


/*@devdoc
 *  The <code>AudioClient</code> class manages user client audio, sending and receiving audio packets and interfacing these
 *  with Web Audio streams.
 *  <p>C++: <code>AudioClient : public AbstractAudioInterface, public Dependency</code></p>
 *  @class AudioClient
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
class AudioClient {
    // C++  AudioClient : public AbstractAudioInterface, public Dependency
    //      AbstractAudioInterface : public QObject

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    static #RECEIVED_AUDIO_STREAM_CAPACITY_FRAMES = 100;


    // Context
    #_nodeList;
    #_packetReceiver;

    #_selectedCodecName = "";

    #_dummyAudioInputTimer: ReturnType<typeof setTimeout> | null = null;
    #_outgoingAvatarAudioSequenceNumber = 0;

    #_receivedAudioStream;

    // WEBRTC TODO: Set these via the API.
    #_isStereoInput = false;
    #_audioPosition = { x: 0, y: 1, z: 0 };
    #_audioOrientation = { x: 0, y: 0, z: 0, w: 1.0 };
    #_avatarBoundingBoxCorner = { x: -0.5, y: 0.0, z: -0.5 };
    #_avatarBoundingBoxScale = { x: 1, y: 2, z: 1 };


    constructor(contextID: number) {

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
        this.#_packetReceiver = this.#_nodeList.getPacketReceiver();

        // This field is not a MixedProcessedAudioStream in the Web SDK version of AudioClient because the features of
        // MixedProcessedAudioStream haven't been needed so far.
        this.#_receivedAudioStream = new InboundAudioStream(contextID, AudioConstants.STEREO,
            AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL, AudioClient.#RECEIVED_AUDIO_STREAM_CAPACITY_FRAMES, -1);

        // C++  AudioClient::AudioClient()
        this.#_packetReceiver.registerListener(PacketType.SelectedAudioFormat,
            PacketReceiver.makeUnsourcedListenerReference(this.#handleSelectedAudioFormat));
        this.#_packetReceiver.registerListener(PacketType.SilentAudioFrame,
            PacketReceiver.makeUnsourcedListenerReference(this.#handleAudioDataPacket));
        this.#_packetReceiver.registerListener(PacketType.MixedAudio,
            PacketReceiver.makeUnsourcedListenerReference(this.#handleAudioDataPacket));
        this.#_packetReceiver.registerListener(PacketType.AudioStreamStats,
            PacketReceiver.makeSourcedListenerReference(this.#processStreamStatsPacket));
        this.#_packetReceiver.registerListener(PacketType.AudioEnvironment,
            PacketReceiver.makeUnsourcedListenerReference(this.#handleAudioEnvironmentDataPacket));

        // C++  Application::Application()
        this.#_nodeList.nodeActivated.connect(this.#nodeActivated);
        this.#_nodeList.nodeKilled.connect(this.#nodeKilled);
    }


    #negotiateAudioFormat(): void {
        // C++  void negotiateAudioFormat()

        // WEBRTC TODO: Address further C++ code.
        const codecs = [
            // "opus",
            // "zlib",
            "pcm"
        ];

        const negotiateFormatPacket = PacketScribe.NegotiateAudioFormat.write({
            codecs
        });

        const audioMixer = this.#_nodeList.soloNodeOfType(NodeType.AudioMixer);
        if (audioMixer) {
            this.#_nodeList.sendPacket(negotiateFormatPacket, audioMixer);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    #audioMixerKilled(): void {
        // C++  void AudioClient::audioMixerKilled()

        this.#_outgoingAvatarAudioSequenceNumber = 0;

        // WEBRTC TODO: Address further C++ code.

    }

    #handleAudioInput(): void {
        // C++  void AudioClient::handleAudioInput(QByteArray& audioBuffer)

        // An audio gate is not the responsibility of the AudioMixer SDK class.

        // WEBRTC TODO: Address further C++ code.
        // - Audio encoding... TBD.

        const packetType = PacketType.SilentAudioFrame;

        // WEBRTC TODO: Address further C++ code.

        this.#emitAudioPacket(packetType);

        // WEBRTC TODO: Address further C++ code.

    }

    #handleDummyAudioInput(): void {
        // C++  void AudioClient::handleDummyAudioInput()

        this.#handleAudioInput();

        this.#_dummyAudioInputTimer = setTimeout(() => {
            this.#handleDummyAudioInput();
        }, AudioConstants.NETWORK_FRAME_MSECS);
    }

    #emitAudioPacket(packetType: PacketTypeValue): void {
        // C++  void AbstractAudioInterface::emitAudioPacket(const void* audioData, size_t bytes, quint16 & sequenceNumber,
        //          bool isStereo, const Transform& transform, glm::vec3 avatarBoundingBoxCorner,
        //          glm::vec3 avatarBoundingBoxScale, PacketType packetType, QString codecName)

        const audioMixer = this.#_nodeList.soloNodeOfType(NodeType.AudioMixer);
        if (!audioMixer || !audioMixer.getActiveSocket()) {
            return;
        }

        if (packetType !== PacketType.SilentAudioFrame) {
            console.error("AudioMixer.emitAudioPacket() not implemented for packet", packetType, "!");
            return;
        }

        this.#_outgoingAvatarAudioSequenceNumber += 1;

        // WEBRTC TODO: Address further C++ code.
        // - PacketType.MicrophoneAudioWithEcho
        // - PacketType.MicrophoneAudioNoEcho

        const audioPacket = PacketScribe.SilentAudioFrame.write({
            sequenceNumber: this.#_outgoingAvatarAudioSequenceNumber,
            codecName: this.#_selectedCodecName,
            numSilentSamples: this.#_isStereoInput
                ? AudioConstants.NETWORK_FRAME_SAMPLES_STEREO
                : AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL,
            audioPosition: this.#_audioPosition,
            audioOrientation: this.#_audioOrientation,
            avatarBoundingBoxCorner: this.#_avatarBoundingBoxCorner,
            avatarBoundingBoxScale: this.#_avatarBoundingBoxScale
        });

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeList.sendUnreliablePacket(audioPacket, audioMixer.getActiveSocket() as SockAddr,
            audioMixer.getAuthenticateHash());
    }

    #selectAudioFormat(selectedCodecName: string): void {
        // C++  void selectAudioFormat(const QString& selectedCodecName)

        this.#_selectedCodecName = selectedCodecName;

        console.log("[audioclient] Selected codec:", this.#_selectedCodecName, "; Is stereo input:", this.#_isStereoInput);

        // WEBRTC TODO: Address further C++ code.

        this.#_receivedAudioStream.cleanupCodec();
        this.#_receivedAudioStream.setupCodec(this.#_selectedCodecName);

        // WEBRTC TODO: Address further C++ code.

    }


    // Listener
    // eslint-disable-next-line class-methods-use-this
    #handleSelectedAudioFormat = (message: ReceivedMessage): void => {
        // C++  void handleSelectedAudioFormat(ReceivedMessage* message)

        const info = PacketScribe.SelectedAudioFormat.read(message.getMessage());
        this.#selectAudioFormat(info.selectedCodecName);
    };

    // Listener
    // eslint-disable-next-line class-methods-use-this
    #handleAudioDataPacket = (message: ReceivedMessage): void => {
        // C++  void handleAudioDataPacket(ReceivedMessage* message)

        // WEBRTC TODO: Address further C++ code.

        this.#_receivedAudioStream.parseData(message);
    };

    // Listener
    // eslint-disable-next-line
    // @ts-ignore
    #processStreamStatsPacket = (message: ReceivedMessage, sendingNode?: Node): void => {  // eslint-disable-line
        // C++  void AudioIOStats::processStreamStatsPacket(ReceivedMessage*, Node* sendingNode)

        console.warn("AudioClient: AudioStreamStats packet not processed.");

        // WEBRTC TODO: Address further C++ code.

    };

    // Listener
    // eslint-disable-next-line
    // @ts-ignore
    #handleAudioEnvironmentDataPacket = (message: ReceivedMessage): void => {  // eslint-disable-line
        // C++  void handleAudioEnvironmentDataPacket(ReceivedMessage* message)

        console.warn("AudioClient: AudioEnvironment packet not processed.");

        // WEBRTC TODO: Address further C++ code.

    };


    // Slot
    #nodeActivated = (node: Node): void => {
        const nodeType = node.getType();
        if (nodeType !== NodeType.AudioMixer) {
            return;
        }

        // C++  void Application::nodeActivated(Node* node)
        this.#negotiateAudioFormat();

        // C++  bool AudioClient::switchInputToAudioDevice(...)
        this.#_dummyAudioInputTimer = setTimeout(() => {
            this.#handleDummyAudioInput();
        }, AudioConstants.NETWORK_FRAME_MSECS);
    };

    // Slot
    #nodeKilled = (node: Node): void => {
        const nodeType = node.getType();
        if (nodeType !== NodeType.AudioMixer) {
            return;
        }

        // C++  bool AudioClient::switchInputToAudioDevice(...)
        if (this.#_dummyAudioInputTimer) {
            clearTimeout(this.#_dummyAudioInputTimer);
            this.#_dummyAudioInputTimer = null;
        }

        // C++  void Application::nodeKilled(Node* node)
        this.#audioMixerKilled();

    };

}

export default AudioClient;
