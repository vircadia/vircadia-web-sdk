//
//  interface.js
//
//  Created by David Rowe on 1 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Vircadia, DomainServer, Camera, AudioMixer, AvatarMixer, EntityServer, MessageMixer, Vec3, Uuid }
    from "../dist/Vircadia.js";

(function () {

    const DEFAULT_URL = "ws://127.0.0.1:40102";

    // Shared context.
    let contextID = -1;

    // API objects.
    let domainServer = null;
    let camera = null;
    let audioMixer = null;
    let avatarMixer = null;
    let avatarMixerGameLoop = null;
    let entityServer = null;
    let entityServerGameLoop = null;
    let messageMixer = null;
    let doppelganger = null;


    // Domain Server
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

    // Camera
    (function () {
        camera = new Camera(contextID);

        const cameraPosX = document.getElementById("cameraPosX");
        const cameraPosY = document.getElementById("cameraPosY");
        const cameraPosZ = document.getElementById("cameraPosZ");

        const cameraPosition = camera.position;
        cameraPosX.value = cameraPosition.x;
        cameraPosY.value = cameraPosition.y;
        cameraPosZ.value = cameraPosition.z;

        function onPositionChange() {
            camera.position = {
                x: parseFloat(cameraPosX.value),
                y: parseFloat(cameraPosY.value),
                z: parseFloat(cameraPosZ.value)
            };
        }
        cameraPosX.addEventListener("blur", onPositionChange);
        cameraPosY.addEventListener("blur", onPositionChange);
        cameraPosZ.addEventListener("blur", onPositionChange);
        cameraPosX.addEventListener("change", onPositionChange);
        cameraPosY.addEventListener("change", onPositionChange);
        cameraPosZ.addEventListener("change", onPositionChange);

        const cameraRotX = document.getElementById("cameraRotX");
        const cameraRotY = document.getElementById("cameraRotY");
        const cameraRotZ = document.getElementById("cameraRotZ");
        const cameraRotW = document.getElementById("cameraRotW");

        const cameraOrientation = camera.orientation;
        cameraRotX.value = cameraOrientation.x;
        cameraRotY.value = cameraOrientation.y;
        cameraRotZ.value = cameraOrientation.z;
        cameraRotW.value = cameraOrientation.w;

        function onOrientationChange() {
            camera.orientation = {
                x: parseFloat(cameraRotX.value),
                y: parseFloat(cameraRotY.value),
                z: parseFloat(cameraRotZ.value),
                w: parseFloat(cameraRotW.value)
            };
        }

        cameraRotX.addEventListener("blur", onOrientationChange);
        cameraRotY.addEventListener("blur", onOrientationChange);
        cameraRotZ.addEventListener("blur", onOrientationChange);
        cameraRotW.addEventListener("blur", onOrientationChange);
        cameraRotX.addEventListener("change", onOrientationChange);
        cameraRotY.addEventListener("change", onOrientationChange);
        cameraRotZ.addEventListener("change", onOrientationChange);
        cameraRotW.addEventListener("change", onOrientationChange);

        const fieldOfView = document.getElementById("fieldOfView");
        fieldOfView.value = camera.fieldOfView;
        function onFieldOfViewChange() {
            camera.fieldOfView = parseFloat(fieldOfView.value);
        }
        fieldOfView.addEventListener("blur", onFieldOfViewChange);
        fieldOfView.addEventListener("change", onFieldOfViewChange);

        const aspectRatio = document.getElementById("aspectRatio");
        aspectRatio.value = camera.aspectRatio;
        function onAspectRatioChange() {
            camera.aspectRatio = parseFloat(aspectRatio.value);
        }
        aspectRatio.addEventListener("blur", onAspectRatioChange);
        aspectRatio.addEventListener("change", onAspectRatioChange);

        const farClip = document.getElementById("farClip");
        farClip.value = camera.farClip;
        function onFarClipChange() {
            camera.farClip = parseFloat(farClip.value);
        }
        farClip.addEventListener("blur", onFarClipChange);
        farClip.addEventListener("change", onFarClipChange);

        const centerRadius = document.getElementById("centerRadius");
        centerRadius.value = camera.centerRadius;
        function onCenterRadiusChange() {
            camera.centerRadius = parseFloat(centerRadius.value);
        }
        centerRadius.addEventListener("blur", onCenterRadiusChange);
        centerRadius.addEventListener("change", onCenterRadiusChange);

    }());

    // Audio Mixer
    (function () {
        audioMixer = new AudioMixer(contextID);
        audioMixer.audioWorkletRelativePath = "../dist/";

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
        audioElement.srcObject = audioMixer.audioOutput;
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
            console.log("[interface] Connect");
            audioElement.srcObject = audioMixer.audioOutput;

            setInputStream();

            audioElement.play();
            audioMixer.play();
        }
        connectButton.addEventListener("click", onConnectButtonClick);

        function onDisconnectButtonClick() {
            console.log("[interface] Disconnect");
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

    // Avatar Mixer
    (function () {
        avatarMixer = new AvatarMixer(contextID);

        const POS_DECIMAL_PLACES = 3;
        const YAW_DECIMAL_PLACES = 1;
        const SESSION_DISPLAY_NAME_INDEX = 1;
        const X_INDEX = 2;
        const Y_INDEX = 3;
        const Z_INDEX = 4;
        const YAW_INDEX = 5;
        const SKELETON_MODEL_URL_INDEX = 6;
        const SKELETON_SCALE_INDEX = 7;
        const SKELETON_JOINTS_COUNT_INDEX = 8;
        const HEAD_PITCH_INDEX = 9;

        const RAD_TO_DEG = 180.0 / Math.PI;  // eslint-disable-line @typescript-eslint/no-magic-numbers

        function quatToYaw(orientation) {
            const x = orientation.x;
            const y = orientation.y;
            const z = orientation.z;
            const w = orientation.w;
            return RAD_TO_DEG * Math.atan2(2.0 * (w * y + x * z), 1.0 - 2.0 * (y * y + z * z));
        }

        function yawToQuat(yaw) {
            return {
                x: 0,
                y: Math.sin(yaw / RAD_TO_DEG / 2.0),
                z: 0,
                w: Math.cos(yaw / RAD_TO_DEG / 2.0)
            };
        }


        // Status

        const statusText = document.getElementById("avatarMixerStatus");

        function onStateChanged(state) {
            statusText.value = AvatarMixer.stateToString(state);
        }
        onStateChanged(avatarMixer.state);
        avatarMixer.onStateChanged = onStateChanged;


        // MyAvatar

        const myAvatarDisplayName = document.getElementById("myAvatarDisplayName");
        const myAvatarSessionDisplayName = document.getElementById("myAvatarSessionDisplayName");
        const myAvatarSkeletonModelURL = document.getElementById("myAvatarSkeletonModelURL");
        const myAvatarScale = document.getElementById("myAvatarScale");
        const myAvatarTargetScale = document.getElementById("myAvatarTargetScale");
        const myAvatarPosX = document.getElementById("myAvatarPosX");
        const myAvatarPosY = document.getElementById("myAvatarPosY");
        const myAvatarPosZ = document.getElementById("myAvatarPosZ");
        const myAvatarRotX = document.getElementById("myAvatarRotX");
        const myAvatarRotY = document.getElementById("myAvatarRotY");
        const myAvatarRotZ = document.getElementById("myAvatarRotZ");
        const myAvatarRotW = document.getElementById("myAvatarRotW");
        const myAvatarYaw = document.getElementById("myAvatarYaw");

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

        myAvatarSkeletonModelURL.value = avatarMixer.myAvatar.skeletonModelURL;
        avatarMixer.myAvatar.skeletonModelURLChanged.connect(() => {
            myAvatarSkeletonModelURL.value = avatarMixer.myAvatar.skeletonModelURL;
        });
        myAvatarSkeletonModelURL.addEventListener("blur", () => {
            avatarMixer.myAvatar.skeletonModelURL = myAvatarSkeletonModelURL.value;
        });

        myAvatarScale.value = avatarMixer.myAvatar.scale.toFixed(1);
        avatarMixer.myAvatar.scaleChanged.connect((scale) => {
            myAvatarScale.value = scale.toFixed(1);
        });
        myAvatarScale.addEventListener("blur", () => {
            avatarMixer.myAvatar.scale = parseFloat(myAvatarScale.value);
            const VERIFY_TIMEOUT = 500;
            setTimeout(() => {
                // In case the scale value was rejected. Or do in game loop.
                myAvatarScale.value = avatarMixer.myAvatar.scale.toFixed(1);
            }, VERIFY_TIMEOUT);
        });
        myAvatarTargetScale.value = avatarMixer.myAvatar.targetScale.toFixed(1);
        avatarMixer.myAvatar.targetScaleChanged.connect((scale) => {
            myAvatarTargetScale.value = scale.toFixed(1);
        });

        const avatarPosition = avatarMixer.myAvatar.position;
        myAvatarPosX.value = avatarPosition.x;
        myAvatarPosY.value = avatarPosition.y;
        myAvatarPosZ.value = avatarPosition.z;

        function onPositionChange() {
            avatarMixer.myAvatar.position = {
                x: parseFloat(myAvatarPosX.value),
                y: parseFloat(myAvatarPosY.value),
                z: parseFloat(myAvatarPosZ.value)
            };
        }
        myAvatarPosX.addEventListener("blur", onPositionChange);
        myAvatarPosY.addEventListener("blur", onPositionChange);
        myAvatarPosZ.addEventListener("blur", onPositionChange);
        myAvatarPosX.addEventListener("change", onPositionChange);
        myAvatarPosY.addEventListener("change", onPositionChange);
        myAvatarPosZ.addEventListener("change", onPositionChange);

        const avatarOrientation = avatarMixer.myAvatar.orientation;
        myAvatarRotX.value = avatarOrientation.x;
        myAvatarRotY.value = avatarOrientation.y;
        myAvatarRotZ.value = avatarOrientation.z;
        myAvatarRotW.value = avatarOrientation.w;

        const avatarYaw = quatToYaw(avatarMixer.myAvatar.orientation);
        myAvatarYaw.value = avatarYaw;

        function onYawChange() {
            const orientation = yawToQuat(parseFloat(myAvatarYaw.value));

            myAvatarRotX.value = orientation.x;
            myAvatarRotY.value = orientation.y;
            myAvatarRotZ.value = orientation.z;
            myAvatarRotW.value = orientation.w;

            avatarMixer.myAvatar.orientation = orientation;
        }
        myAvatarYaw.addEventListener("blur", onYawChange);
        myAvatarYaw.addEventListener("change", onYawChange);

        function onLocationChangeRequired(newPosition, hasNewOrientation, newOrientation /* , shouldFaceLocation */) {
            myAvatarPosX.value = newPosition.x;
            myAvatarPosY.value = newPosition.y;
            myAvatarPosZ.value = newPosition.z;
            onPositionChange();

            if (hasNewOrientation) {
                myAvatarRotX.value = newOrientation.x;
                myAvatarRotY.value = newOrientation.y;
                myAvatarRotZ.value = newOrientation.z;
                myAvatarRotW.value = newOrientation.w;

                myAvatarYaw.value = quatToYaw(newOrientation);
                onYawChange();
            }
        }
        avatarMixer.myAvatar.locationChangeRequired.connect(onLocationChangeRequired);


        // Avatar List

        const avatarsCount = document.getElementById("avatarsCount");
        avatarsCount.value = avatarMixer.avatarList.count;

        const avatarListBody = document.querySelector("#avatarList > tbody");

        const avatars = new Map();  // <sessionID, { avatar, tr, headJoint }>

        function onEchoClicked(checkbox, sessionID) {
            if (doppelganger !== null) {
                doppelganger.toggle(checkbox, sessionID);
            }
        }

        function onAvatarAdded(sessionID) {

            avatarsCount.value = avatarMixer.avatarList.count;

            const avatar = avatarMixer.avatarList.getAvatar(sessionID);

            const tr = document.createElement("tr");
            let td = document.createElement("td");
            td.innerHTML = sessionID.stringify();
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = avatar.sessionDisplayName;
            tr.appendChild(td);
            const position = avatar.position;
            td = document.createElement("td");
            td.className = "number";
            td.innerHTML = position.x.toFixed(POS_DECIMAL_PLACES);
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = "number";
            td.innerHTML = position.y.toFixed(POS_DECIMAL_PLACES);
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = "number";
            td.innerHTML = position.z.toFixed(POS_DECIMAL_PLACES);
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = "number";
            td.innerHTML = quatToYaw(avatar.orientation).toFixed(YAW_DECIMAL_PLACES);
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = "string";
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = "number";
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = "number";
            tr.appendChild(td);
            td = document.createElement("td");
            td.className = "number";
            tr.appendChild(td);
            td = document.createElement("td");
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.className = "checkbox";
            if (sessionID.value() === Uuid.AVATAR_SELF_ID) {
                cb.disabled = true;
            } else {
                cb.onclick = (event) => {
                    onEchoClicked(event.target, sessionID);
                };
            }
            td.appendChild(cb);
            tr.appendChild(td);
            avatarListBody.appendChild(tr);

            avatar.sessionDisplayNameChanged.connect(() => {
                tr.childNodes[SESSION_DISPLAY_NAME_INDEX].innerHTML = avatar.sessionDisplayName;
            });
            avatar.skeletonModelURLChanged.connect(() => {
                tr.childNodes[SKELETON_MODEL_URL_INDEX].innerHTML
                    = avatar.skeletonModelURL.slice(avatar.skeletonModelURL.lastIndexOf("/") + 1);
            });
            let headJoint = null;
            avatar.skeletonChanged.connect(() => {
                tr.childNodes[SKELETON_JOINTS_COUNT_INDEX].innerHTML = avatar.skeleton.length;
                const headJointData = avatar.skeleton.find((value) => {
                    return value.jointName === "Head";
                });
                headJoint = headJointData !== undefined ? headJointData.jointIndex : null;
                avatars.get(sessionID).headJoint = headJoint;
            });

            avatars.set(sessionID, { avatar, tr, headJoint });
        }
        avatarMixer.avatarList.avatarAdded.connect(onAvatarAdded);

        function onAvatarRemoved(sessionID) {
            avatarsCount.value = avatarMixer.avatarList.count;
            const avatarListItem = avatars.get(sessionID);
            avatarListBody.removeChild(avatarListItem.tr);
            avatars.delete(sessionID);
        }
        avatarMixer.avatarList.avatarRemoved.connect(onAvatarRemoved);

        // Special first entry for own avatar.
        // This uses AVATAR_SELF_ID instead of the NULL value returned by AvatarMixer.avatarList.getAvatarIDs() so that the
        // value can be used retrieve avatar details.
        onAvatarAdded(new Uuid(Uuid.AVATAR_SELF_ID));


        // Game Loop

        avatarMixerGameLoop = () => {
            avatarMixer.update();
            for (const value of avatars.values()) {
                const position = value.avatar.position;
                value.tr.childNodes[X_INDEX].innerHTML = position.x.toFixed(POS_DECIMAL_PLACES);
                value.tr.childNodes[Y_INDEX].innerHTML = position.y.toFixed(POS_DECIMAL_PLACES);
                value.tr.childNodes[Z_INDEX].innerHTML = position.z.toFixed(POS_DECIMAL_PLACES);
                value.tr.childNodes[YAW_INDEX].innerHTML = quatToYaw(value.avatar.orientation).toFixed(YAW_DECIMAL_PLACES);
                value.tr.childNodes[SKELETON_SCALE_INDEX].innerHTML = value.avatar.scale.toFixed(1);
                value.tr.childNodes[HEAD_PITCH_INDEX].innerHTML
                    = value.headJoint !== null && value.avatar.jointRotations[value.headJoint] !== null
                        ? (value.avatar.jointRotations[value.headJoint].x * RAD_TO_DEG).toFixed(1)
                        : "";
            }
        };

    }());

    // Entity Server
    (function () {
        entityServer = new EntityServer(contextID);

        const POS_DECIMAL_PLACES = 3;


        // Status

        const statusText = document.getElementById("entityServerStatus");

        function onStateChanged(state) {
            statusText.value = EntityServer.stateToString(state);
        }
        onStateChanged(entityServer.state);
        entityServer.onStateChanged = onStateChanged;


        // Entity List

        const entitiesCount = document.getElementById("entitiesCount");
        const entityListBody = document.querySelector("#entityList > tbody");

        const entityIDsList = [];

        function onEntityData(data) {

            data.forEach((e) => {
                if (entityIDsList.some((id) => {
                    return e.entityItemID.stringify() === id;
                })) {
                    const cols = document.getElementById(e.entityItemID.stringify()).children;
                    /* eslint-disable @typescript-eslint/no-magic-numbers */
                    cols.item(2).innerHTML = e.position.x.toFixed(POS_DECIMAL_PLACES);
                    cols.item(3).innerHTML = e.position.y.toFixed(POS_DECIMAL_PLACES);
                    cols.item(4).innerHTML = e.position.z.toFixed(POS_DECIMAL_PLACES);
                    /* eslint-enable @typescript-eslint/no-magic-numbers */
                } else {
                    entityIDsList.push(e.entityItemID.stringify());

                    const tr = document.createElement("tr");
                    tr.id = e.entityItemID.stringify();
                    let td = document.createElement("td");
                    td.innerHTML = e.entityItemID.stringify();
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.innerHTML = e.entityType;
                    tr.appendChild(td);
                    const position = e.position;
                    td = document.createElement("td");
                    td.className = "number";
                    td.innerHTML = position.x.toFixed(POS_DECIMAL_PLACES);
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.className = "number";
                    td.innerHTML = position.y.toFixed(POS_DECIMAL_PLACES);
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.className = "number";
                    td.innerHTML = position.z.toFixed(POS_DECIMAL_PLACES);
                    tr.appendChild(td);
                    entityListBody.appendChild(tr);
                }
            });

            entitiesCount.value = entityIDsList.length;
        }
        entityServer.entityData.connect(onEntityData);


        // Game Loop

        entityServerGameLoop = () => {
            entityServer.update();
        };
    }());

    // Message Mixer
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

    // Doppelganger
    (function () {
        let avatarCheckbox = null;
        let avatarSessionID = null;
        const myAvatar = avatarMixer.myAvatar;
        let avatar = null;
        const DOPPELGANGER_OFFSET = { x: 0, y: 0, z: 2 };

        function updateSkeletonModelURL() {
            myAvatar.skeletonModelURL = avatar.skeletonModelURL;
        }

        function updateSkeleton() {
            myAvatar.skeleton = avatar.skeleton;
        }

        function updateScale(scale) {
            myAvatar.scale = scale;
        }

        function updateAvatarPositionAndOrientation() {
            myAvatar.position = Vec3.sum(avatar.position, DOPPELGANGER_OFFSET);
            myAvatar.orientation = avatar.orientation;
        }

        function updateJoints() {
            myAvatar.jointRotations = JSON.parse(JSON.stringify(avatar.jointRotations));
            myAvatar.jointTranslations = JSON.parse(JSON.stringify(avatar.jointTranslations));
        }


        function startDoppelganger() {
            console.debug("Start doppelganger for", avatarSessionID.stringify());

            // Access avatar.
            avatar = avatarMixer.avatarList.getAvatar(avatarSessionID);
            if (!avatar.isValid) {
                console.error("Error getting avatar to echo.");
                avatar = null;
                return;
            }


            // Avatar.
            updateSkeletonModelURL();
            avatar.skeletonModelURLChanged.connect(updateSkeletonModelURL);
            updateSkeleton();
            avatar.skeletonChanged.connect(updateSkeleton);
            updateScale(avatar.scale);
            avatar.scaleChanged.connect(updateScale);

            // Position and orientation.
            // These are handled by gameLoop().

            // Joints.
            // These are handled by gameLoop().

        }

        function stopDoppelganger() {
            console.debug("Stop doppelganger for", avatarSessionID.stringify());

            // Retain current skeleton URL, scale, position, orientation, and skeleton data but stop updating with changes.

            // Avatar.
            avatar.skeletonModelURLChanged.disconnect(updateSkeletonModelURL);
            avatar.skeletonChanged.disconnect(updateSkeleton);
            avatar.scaleChanged.disconnect(updateScale);

            // Position and orientation.
            // These are handled by gameLoop().

            // Joints.
            // These are handled by gameLoop().

            // Finish with avatar.
            avatar = null;
        }


        function toggle(checkbox, sessionID) {

            if (avatarSessionID !== null) {
                // Stop the current doppelganger, if any.
                avatarCheckbox.checked = false;
                stopDoppelganger();
            }

            if (sessionID !== avatarSessionID) {
                avatarSessionID = sessionID;
                avatarCheckbox = checkbox;
                avatarCheckbox.checked = true;
                startDoppelganger();
            } else {
                // There is no current doppelganger.
                avatarSessionID = null;
                avatarCheckbox = null;
            }
        }

        function gameLoop() {
            if (avatar !== null) {
                updateAvatarPositionAndOrientation();
                updateJoints();
            }
        }

        doppelganger = {
            toggle,
            gameLoop
        };

    }());

    // Wire up mixers.
    audioMixer.positionGetter = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return avatarMixer.myAvatar.position;
    };

    // Game Loop
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

            // Update the camera ready for use by the avatar mixer update.
            camera.update();

            // Update the avatar mixer with latest user client data and get latest data from avatar mixer.
            avatarMixerGameLoop();
            doppelganger.gameLoop();

            // Update the entity server with latest user client data.
            entityServerGameLoop();

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
