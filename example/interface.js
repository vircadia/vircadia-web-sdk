//
//  interface.js
//
//  Created by David Rowe on 1 Aug 2021.
//  Copyright 2020 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { DomainServer, AudioMixer, AvatarMixer, MessageMixer } from "../dist/Vircadia.js";

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
        connectButton.onclick = onConnectButtonClick;

        function onDisconnectButtonClick() {
            domainServer.disconnect();
        }
        disconnectButton.onclick = onDisconnectButtonClick;

    }());

    // Audio Mixer.
    (function () {
        const audioMixer = new AudioMixer(contextID);

        const statusText = document.getElementById("audioMixerStatus");

        function onStateChanged(state) {
            statusText.value = AudioMixer.stateToString(state);
        }
        onStateChanged(audioMixer.state);
        audioMixer.onStateChanged = onStateChanged;

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

        function onStateChanged(state) {
            statusText.value = MessageMixer.stateToString(state);
        }
        onStateChanged(messageMixer.state);
        messageMixer.onStateChanged = onStateChanged;

    }());

}());
