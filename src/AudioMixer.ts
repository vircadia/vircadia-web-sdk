//
//  AudioMixer.ts
//
//  Vircadia Web SDK's Audio Mixer API.
//
//  Created by David Rowe on 24 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AssignmentClient from "./domain/AssignmentClient";
import AudioConstants from "./domain/audio/AudioConstants";
import Node from "./domain/networking/Node";
import NodeList from "./domain/networking/NodeList";
import NodeType from "./domain/networking/NodeType";
import PacketReceiver from "./domain/networking/PacketReceiver";
import ReceivedMessage from "./domain/networking/ReceivedMessage";
import SockAddr from "./domain/networking/SockAddr";
import PacketScribe from "./domain/networking/packets/PacketScribe";
import PacketType, { PacketTypeValue } from "./domain/networking/udt/PacketHeaders";
import ContextManager from "./domain/shared/ContextManager";


/*@sdkdoc
 *  The <code>AudioMixer</code> class provides the interface for working with audio mixer assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created first in order to create the domain context.</p>
 *  @class AudioMixer
 *  @extends AssignmentClient
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *
 *  @property {AudioMixer.State} UNAVAILABLE - There is no audio mixer available - you're not connected to a domain or the
 *      domain doesn't have a audio mixer running.
 *      <em>Static. Read-only.</em>
 *  @property {AudioMixer.State} DISCONNECTED - Not connected to the audio mixer.
 *      <em>Static. Read-only.</em>
 *  @property {AudioMixer.State} CONNECTED - Connected to the audio mixer.
 *      <em>Static. Read-only.</em>
 *  @property {AudioMixer.State} state - The current state of the connection to the audio mixer.
 *      <em>Read-only.</em>
 *  @property {AudioMixer~onStateChanged|null} onStateChanged - Sets a single function to be called when the state of the
 *      audio mixer changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 */
class AudioMixer extends AssignmentClient {
    // C++  Application.cpp
    //      AudioClient.cpp

    // Base class developer documentation is copied here and updated for the SDK documentation.

    /*@sdkdoc
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>UNAVAILABLE</td><td><code><code>0</code></td><td>There is no audio mixer available - you're not
     *              connected to a domain or the domain doesn't have a audio mixer running.</td></tr>
     *          <tr><td>DISCONNECTED</td><td><code>1</code></td><td>Not connected to the audio mixer.</td></tr>
     *          <tr><td>CONNECTED</td><td><code>2</code></td><td>Connected to the audio mixer.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} AudioMixer.State
     */

    /*@sdkdoc
     *  Called when the state of the audio mixer changes.
     *  @callback AudioMixer~onStateChanged
     *  @param {AudioMixer.State} state - The state of the audio mixer.
     */

    /*@sdkdoc
     *  Gets the string representing a audio mixer state.
     *  <p><em>Static</em></p>
     *  @function AudioMixer.stateToString
     *  @param {AudioMixer.State} state - The state to get the string representation of.
     *  @returns {string} The string representing the audio mixer state if a valid state, <code>""</code> if not a valid
     *      state.
     */


    // Context.
    #_nodeList: NodeList;  // Need own reference rather than using AssignmentClient's because need to keep private from API.
    #_packetReceiver;

    #_selectedCodeName = "";
    #_dummyAudioInputTimer: ReturnType<typeof setTimeout> | null = null;
    #_outgoingAvatarAudioSequenceNumber = 0;

    // WEBRTC TODO: Set these via the API.
    #_isStereoInput = false;
    #_audioPosition = { x: 0, y: 1, z: 0 };
    #_audioOrientation = { x: 0, y: 0, z: 0, w: 1.0 };
    #_avatarBoundingBoxCorner = { x: -0.5, y: 0.0, z: -0.5 };
    #_avatarBoundingBoxScale = { x: 1, y: 2, z: 1 };


    constructor(contextID: number) {
        // C++  AudioClient::AudioClient()
        super(contextID, NodeType.AudioMixer);

        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;  // Throws error if invalid context.
        this.#_packetReceiver = this.#_nodeList.getPacketReceiver();

        // WEBRTC TODO: Address further C++ code.

        // C++  Application::Application()
        this.#_nodeList.nodeActivated.connect(this.#nodeActivated);
        this.#_nodeList.nodeKilled.connect(this.#nodeKilled);

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
    }


    #negotiateAudioFormat(): void {
        // C++  void AudioClient::negotiateAudioFormat()

        // WEBRTC TODO: Address further C++ code.
        const codecs = [
            "opus",
            "pcm",
            "zlib"
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
            codecName: this.#_selectedCodeName,
            isStereo: this.#_isStereoInput,
            audioPosition: this.#_audioPosition,
            audioOrientation: this.#_audioOrientation,
            avatarBoundingBoxCorner: this.#_avatarBoundingBoxCorner,
            avatarBoundingBoxScale: this.#_avatarBoundingBoxScale
        });

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeList.sendUnreliablePacket(audioPacket, audioMixer.getActiveSocket() as SockAddr,
            audioMixer.getAuthenticateHash());
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


    // Listener
    // eslint-disable-next-line class-methods-use-this
    #handleSelectedAudioFormat = (message: ReceivedMessage): void => {
        // C++  void AudioClient::handleSelectedAudioFormat(ReceivedMessage* message)
        const info = PacketScribe.SelectedAudioFormat.read(message.getMessage());

        console.warn("AudioMixer: SelectedAudioFormat packet not processed. Codec:", info.selectedCodecName);

        // WEBRTC TODO: Address further C++ code.

    };

    // Listener
    // eslint-disable-next-line class-methods-use-this
    #handleAudioDataPacket = (message: ReceivedMessage): void => {
        // C++  void AudioClient::handleAudioDataPacket(ReceivedMessage* message)

        if (message.getType() === PacketType.SilentAudioFrame) {
            console.warn("AudioMixer: SilentAudioFrame packet not processed.");
        } else {
            console.warn("AudioMixer: MixedAudio packet not processed.");
        }

        // WEBRTC TODO: Address further C++ code.

    };

    // Listener
    // eslint-disable-next-line
    // @ts-ignore
    #processStreamStatsPacket = (message: ReceivedMessage, sendingNode?: Node): void => {  // eslint-disable-line
        // C++  void AudioIOStats::processStreamStatsPacket(ReceivedMessage*, Node* sendingNode)

        console.warn("AudioMixer: AudioStreamStats packet not processed.");

        // WEBRTC TODO: Address further C++ code.

    };

    // Listener
    // eslint-disable-next-line
    // @ts-ignore
    #handleAudioEnvironmentDataPacket = (message: ReceivedMessage): void => {  // eslint-disable-line
        // C++  void AudioClient::handleAudioEnvironmentDataPacket(ReceivedMessage* message)

        console.warn("AudioMixer: AudioEnvironment packet not processed.");

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

        // C++  void Application::nodeKilled(Node* node)
        this.#audioMixerKilled();

        // C++  bool AudioClient::switchInputToAudioDevice(...)
        if (this.#_dummyAudioInputTimer) {
            clearTimeout(this.#_dummyAudioInputTimer);
            this.#_dummyAudioInputTimer = null;
        }
    };

}

export default AudioMixer;
