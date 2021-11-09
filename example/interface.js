//
//  interface.js
//
//  Created by David Rowe on 1 Aug 2021.
//  Copyright 2020 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Vircadia, DomainServer, AudioMixer, AvatarMixer, MessageMixer } from "../dist/Vircadia.js";

(function () {

    const DEFAULT_URL = "ws://127.0.0.1:40102";

    // Shared context.
    let contextID = -1;

    // API objects.
    let domainServer = null;
    let audioMixer = null;
    let avatarMixer = null;
    let messageMixer = null;


    // Domain Server.
    (function () {
        domainServer = new DomainServer();
        contextID = domainServer.contextID;

        const statusText = document.getElementById("domainStatus");
        const statusInfoText = document.getElementById("domainStatusInfo");
        const ipAddress = document.getElementById("domainIPAddress");
        ipAddress.value = DEFAULT_URL;
        const connectButton = document.getElementById("domainConnectButton");
        const disconnectButton = document.getElementById("domainDisconnectButton");
        const domainSessionUUID = document.getElementById("domainSessionUUID");

        function onStateChanged(state, info) {
            statusText.value = DomainServer.stateToString(state);
            statusInfoText.value = info;
        }
        onStateChanged(domainServer.state, domainServer.refusalInfo + domainServer.errorInfo);
        domainServer.onStateChanged = onStateChanged;

        function onConnectButtonClick() {
            domainServer.connect(ipAddress.value);
        }
        connectButton.addEventListener("click", onConnectButtonClick);

        function onDisconnectButtonClick() {
            domainServer.disconnect();
        }
        disconnectButton.addEventListener("click", onDisconnectButtonClick);

        domainSessionUUID.value = domainServer.sessionUUID.stringify();
        domainServer.sessionUUIDChanged.connect((sessionUUID) => {
            domainSessionUUID.value = sessionUUID.stringify();
        });

    }());

    // Audio Mixer.
    (function () {
        audioMixer = new AudioMixer(contextID);

        const statusText = document.getElementById("audioMixerStatus");
        const audioElement = document.getElementById("audioElement");
        const connectButton = document.getElementById("domainConnectButton");
        const disconnectButton = document.getElementById("domainDisconnectButton");
        const micMutedCheckbox = document.getElementById("micMuted");

        function onStateChanged(state) {
            statusText.value = AudioMixer.stateToString(state);
        }
        onStateChanged(audioMixer.state);
        audioMixer.onStateChanged = onStateChanged;

        // Assigning the audio mixer stream here works but causes a "The AuxioContext was not allowed to start" warning in the
        // console.log because Web Audio requires user input on the page in order for audio to play.
        // https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
        /*
        audioElement.srcObject = audioMixer.audioOuput;
        */

        function setInputStream() {
            const constraints = {
                audio: true,
                video: false
            };
            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    audioMixer.audioInput = stream;
                })
                .catch(() => {  // eslint-disable-line
                    console.warn("User didn't allow app to use microphone.");
                });
        }

        function onConnectButtonClick() {
            // Assign (or reassign) the audio mixer stream now that we have user input on the page.
            audioElement.srcObject = audioMixer.audioOuput;

            setInputStream();

            audioElement.play();
            audioMixer.play();
        }
        connectButton.addEventListener("click", onConnectButtonClick);

        function onDisconnectButtonClick() {
            audioMixer.pause();
            audioElement.pause();
        }
        disconnectButton.addEventListener("click", onDisconnectButtonClick);

        audioMixer.inputMuted = micMutedCheckbox.checked;
        function onMicMutecCheckboxClick() {
            audioMixer.inputMuted = micMutedCheckbox.checked;
        }
        micMutedCheckbox.addEventListener("click", onMicMutecCheckboxClick);
    }());

    // Avatar Mixer.
    (function () {
        avatarMixer = new AvatarMixer(contextID);

        const statusText = document.getElementById("avatarMixerStatus");
        const myAvatarDisplayName = document.getElementById("myAvatarDisplayName");
        const myAvatarSessionDisplayName = document.getElementById("myAvatarSessionDisplayName");
        const posX = document.getElementById("avatarMixerPosX");
        const posY = document.getElementById("avatarMixerPosY");
        const posZ = document.getElementById("avatarMixerPosZ");

        myAvatarDisplayName.value = avatarMixer.myAvatar.displayName;
        avatarMixer.myAvatar.displayNameChanged.connect(() => {
            myAvatarDisplayName.value = avatarMixer.myAvatar.displayName;
        });
        myAvatarDisplayName.addEventListener("blur", () => {
            avatarMixer.myAvatar.displayName = myAvatarDisplayName.value;
        });

        myAvatarSessionDisplayName.value = avatarMixer.myAvatar.sessionDisplayName;
        avatarMixer.myAvatar.sessionDisplayNameChanged.connect(() => {
            myAvatarSessionDisplayName.value = avatarMixer.myAvatar.sessionDisplayName;
        });


        const avatarsCount = document.getElementById("avatarsCount");
        const avatarIDs = document.getElementById("avatarIDs");

        function onStateChanged(state) {
            statusText.value = AvatarMixer.stateToString(state);
        }
        onStateChanged(avatarMixer.state);
        avatarMixer.onStateChanged = onStateChanged;

        function onAvatarsChanged() {
            avatarsCount.value = avatarMixer.avatarList.count;
            avatarIDs.value = avatarMixer.avatarList.getAvatarIDs()
                .map((uuid) => {
                    return uuid.stringify();  // eslint-disable-line @typescript-eslint/no-unsafe-return
                })
                .join(" ");
        }
        onAvatarsChanged();  // Display initial data.
        avatarMixer.avatarList.avatarAdded.connect(onAvatarsChanged);
        avatarMixer.avatarList.avatarRemoved.connect(onAvatarsChanged);

        const avatarPosition = avatarMixer.myAvatar.position;
        posX.value = avatarPosition.x;
        posY.value = avatarPosition.y;
        posZ.value = avatarPosition.z;

        function onPositionChange() {
            avatarMixer.myAvatar.position = { x: parseFloat(posX.value), y: parseFloat(posY.value), z: parseFloat(posZ.value) };
        }
        posX.addEventListener("blur", onPositionChange);
        posY.addEventListener("blur", onPositionChange);
        posZ.addEventListener("blur", onPositionChange);
        posX.addEventListener("change", onPositionChange);
        posY.addEventListener("change", onPositionChange);
        posZ.addEventListener("change", onPositionChange);

    }());

    // Message Mixer.
    (function () {
        messageMixer = new MessageMixer(contextID);

        const statusText = document.getElementById("messageMixerStatus");
        const messagesChannel = document.getElementById("messagesChannel");
        messagesChannel.value = "example-message-channel";
        const messagesSubscribeButton = document.getElementById("messagesSubscribeButton");
        const messagesUnsubscribeButton = document.getElementById("messagesUnsubscribeButton");
        const messagesTextMessage = document.getElementById("messagesTextMessage");
        const messagesTextSendButton = document.getElementById("messagesTextSendButton");
        const messagesTextReceived = document.getElementById("messagesTextReceived");
        const messagesSender = document.getElementById("messagesSender");

        function onStateChanged(state) {
            statusText.value = MessageMixer.stateToString(state);
        }
        onStateChanged(messageMixer.state);
        messageMixer.onStateChanged = onStateChanged;

        function onMessagesSubscribeButtonClick() {
            messageMixer.subscribe(messagesChannel.value);
        }
        messagesSubscribeButton.addEventListener("click", onMessagesSubscribeButtonClick);

        function onMessagesUnsubscribeButtonClick() {
            messageMixer.unsubscribe(messagesChannel.value);
        }
        messagesUnsubscribeButton.addEventListener("click", onMessagesUnsubscribeButtonClick);

        function onMessagesTextSendButtonClick() {
            messageMixer.sendMessage(messagesChannel.value, messagesTextMessage.value);
        }
        messagesTextSendButton.addEventListener("click", onMessagesTextSendButtonClick);

        function onMessageReceived(channel, message, senderID /* , localOnly */) {
            if (channel === messagesChannel.value) {
                messagesTextReceived.value = message;
                messagesSender.value = senderID.stringify();
            }
        }
        messageMixer.messageReceived.connect(onMessageReceived);

    }());

    // Wire up mixers.
    audioMixer.positionGetter = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return avatarMixer.myAvatar.position;
    };

    // Game loop.
    (function () {
        const MS_PER_S = 1000;
        const TARGET_GAME_RATE = 10;  // FPS
        const TARGET_INTERVAL = MS_PER_S / TARGET_GAME_RATE;  // ms
        const MIN_TIMEOUT = 5;  // ms
        let gameRate = 0;  // FPS
        let gameLoopStart = Date.now();
        const gameRateValue = document.getElementById("gameRateValue");
        let gameLoopTimer = null;

        const gameLoop = () => {
            const now = Date.now();
            gameRate = MS_PER_S / (now - gameLoopStart);
            gameLoopStart = now;
            gameRateValue.value = gameRate.toFixed(1);

            // Update the audio mixer with latest user client avatar data.
            avatarMixer.update();

            const timeout = Math.max(TARGET_INTERVAL - (Date.now() - gameLoopStart), MIN_TIMEOUT);
            gameLoopTimer = setTimeout(gameLoop, timeout);
        };

        const connectButton = document.getElementById("domainConnectButton");
        connectButton.addEventListener("click", () => {
            if (gameLoopTimer === null) {
                gameLoopTimer = setTimeout(gameLoop, 0);
            }
        });

        const disconnectButton = document.getElementById("domainDisconnectButton");
        disconnectButton.addEventListener("click", () => {
            if (gameLoopTimer !== null) {
                clearTimeout(gameLoopTimer);
                gameLoopTimer = null;
                gameRateValue.value = "";
            }
        });

    }());

    document.getElementById("sdkVersion").innerText = Vircadia.version;

}());
