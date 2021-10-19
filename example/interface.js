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

    // Domain Server.
    (function () {
        const domainServer = new DomainServer();
        contextID = domainServer.contextID;

        const statusText = document.getElementById("domainStatus");
        const statusInfoText = document.getElementById("domainStatusInfo");
        const ipAddress = document.getElementById("domainIPAddress");
        ipAddress.value = DEFAULT_URL;
        const connectButton = document.getElementById("domainConnectButton");
        const disconnectButton = document.getElementById("domainDisconnectButton");

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

    }());

    // Audio Mixer.
    (function () {
        const audioMixer = new AudioMixer(contextID);

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
            console.log("####### ================ Interface onConnectButtonClick()");
            audioElement.srcObject = audioMixer.audioOuput;

            setInputStream();

            audioElement.play();
            audioMixer.play();
        }
        connectButton.addEventListener("click", onConnectButtonClick);

        function onDisconnectButtonClick() {
            console.log("####### ================ Interface onDisconnectButtonClick()");
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
        const avatarMixer = new AvatarMixer(contextID);

        const statusText = document.getElementById("avatarMixerStatus");

        function onStateChanged(state) {
            statusText.value = AvatarMixer.stateToString(state);
        }
        onStateChanged(avatarMixer.state);
        avatarMixer.onStateChanged = onStateChanged;

    }());

    // Message Mixer.
    (function () {
        const messageMixer = new MessageMixer(contextID);

        const statusText = document.getElementById("messageMixerStatus");
        const messagesChannel = document.getElementById("messagesChannel");
        messagesChannel.value = "example-message-channel";
        const messagesSubscribeButton = document.getElementById("messagesSubscribeButton");
        const messagesUnsubscribeButton = document.getElementById("messagesUnsubscribeButton");
        const messagesTextMessage = document.getElementById("messagesTextMessage");
        const messagesTextSendButton = document.getElementById("messagesTextSendButton");
        const messagesTextReceived = document.getElementById("messagesTextReceived");

        function onStateChanged(state) {
            statusText.value = MessageMixer.stateToString(state);
        }
        onStateChanged(messageMixer.state);
        messageMixer.onStateChanged = onStateChanged;

        function onMessagesSubscribeButtonClick() {
            console.log("####### ================ onMessagesSubscribeButtonClick() :", messagesChannel.value);
            messageMixer.subscribe(messagesChannel.value);
        }
        messagesSubscribeButton.addEventListener("click", onMessagesSubscribeButtonClick);

        function onMessagesUnsubscribeButtonClick() {
            console.log("####### ================ onMessagesUnsubscribeButtonClick() :", messagesChannel.value);
            messageMixer.unsubscribe(messagesChannel.value);
        }
        messagesUnsubscribeButton.addEventListener("click", onMessagesUnsubscribeButtonClick);

        function onMessagesTextSendButtonClick() {
            console.log("####### ================ onMessagesTextSendButtonClick() :", messagesChannel.value,
                messagesTextMessage.value);
            messageMixer.sendMessage(messagesChannel.value, messagesTextMessage.value);

            // eslint-disable-next-line
            // const LONG_MESSAGE = "AAASTART99888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000__________888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000999999999988888888887777777777666666666655555555554444444444333333333322222222221111111111000000000099999999998888888888777777777766666666665555555555444444444433333333332222222222111111111100000000009999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000ALMOST9999999999888888888877777777776666666666555555555544444444443333333333222222222211111111110000000000THEAAA";
            // console.log("$$$$... Send long message:", LONG_MESSAGE.length, LONG_MESSAGE);
            // messageMixer.sendMessage(messagesChannel.value, LONG_MESSAGE);

        }
        messagesTextSendButton.addEventListener("click", onMessagesTextSendButtonClick);

        function onMessageReceived(channel, message /* , senderID, localOnly */) {
            // console.log("$$$$$$$ Interface.onMessageReceived() :", channel, message);
            if (channel === messagesChannel.value) {
                messagesTextReceived.value = message;
            }
        }
        messageMixer.messageReceived.connect(onMessageReceived);

    }());

    document.getElementById("sdkVersion").innerText = Vircadia.version;

}());
