//
//  TurnCredentials.ts
//
//  Created by Antigravity on 26 Nov 2025.
//  Copyright 2025 Vircadia contributors.
//  Copyright 2025 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import axios from "axios";
import { IceServerList } from "./webrtc/WebRTCDataChannel";

/*@devdoc
 *  The <code>TurnCredentials</code> class provides a service to fetch TURN credentials from the metaverse.
 *  @class TurnCredentials
 */
class TurnCredentials {

    /*@devdoc
     *  Fetches ICE servers (TURN credentials) from the metaverse.
     *  @param {string} metaverseUrl - The URL of the metaverse server.
     *  @param {string} accessToken - The access token for authentication.
     *  @returns {Promise<IceServerList>} A promise that resolves to the list of ICE servers.
     */
    static async fetchIceServers(metaverseUrl: string, accessToken: string): Promise<IceServerList> {
        // Ensure the URL ends with a slash to correctly resolve the relative path
        const baseUrl = metaverseUrl.endsWith("/") ? metaverseUrl : metaverseUrl + "/";
        const url = new URL("turn-credentials", baseUrl).href;

        try {
            const response = await axios.post(url, {}, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            if (response.data && response.data.iceServers) {
                return response.data.iceServers as IceServerList;
            }
            console.warn(`[networking] Response from ${url} did not contain iceServers.`);
            return [];
        } catch (error) {
            let reason = "Unknown error";
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    reason = `Status: ${error.response.status} ${error.response.statusText}.`;
                    if (error.response.data) {
                         reason += ` Data: ${JSON.stringify(error.response.data)}`;
                    }
                } else if (error.request) {
                    reason = "No response received from server.";
                } else {
                    reason = error.message;
                }
            } else if (error instanceof Error) {
                reason = error.message;
            }

            console.warn(`[networking] Failed to fetch TURN credentials from ${url}. Reason: ${reason}`);
            return [];
        }
    }
}

export default TurnCredentials;
