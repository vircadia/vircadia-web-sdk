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
    static readonly ERROR_UNKNOWN = "Unknown error";
    static readonly ERROR_NO_RESPONSE = "No response received from server.";


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
            if (response.data && Array.isArray(response.data.iceServers) && response.data.iceServers.length > 0) {
                console.log("[DEBUG] TurnCredentials fetched:", JSON.stringify(response.data.iceServers, null, 2));
                return response.data.iceServers as IceServerList;
            }
            throw new Error(`Response from ${url} contained no iceServers.`);
        } catch (error) {
            let reason = TurnCredentials.ERROR_UNKNOWN;
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const data = error.response.data as any;
                    if (data && data.message) {
                        reason = data.message;
                    } else {
                        reason = `Status: ${error.response.status} ${error.response.statusText}.`;
                        if (data) {
                            reason += ` Data: ${JSON.stringify(data)}`;
                        }
                    }
                } else if (error.request) {
                    reason = TurnCredentials.ERROR_NO_RESPONSE;
                } else {
                    reason = error.message;
                }
            } else if (error instanceof Error) {
                reason = error.message;
            }

            throw new Error(reason);
        }
    }
}

export default TurnCredentials;
