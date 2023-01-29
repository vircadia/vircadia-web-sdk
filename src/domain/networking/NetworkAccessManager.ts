//
//  NetworkAccessManager.ts
//
//  Created by David Rowe on 7 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import axios, { AxiosRequestConfig } from "axios";
import Url from "../shared/Url";
import NetworkReply from "./NetworkReply";
import NetworkRequest from "./NetworkRequest";

// Node polyfill.
import FormData from "form-data";


enum Operation {
    // C++  enum QNetworkAccessManager::Operation
    HeadOperation = 1,
    GetOperation,
    PutOperation,
    PostOperation,
    DeleteOperation,
    CustomOperation,

    UnknownOperation = 0
}


type HttpMultiPart = Set<Map<string, string | Blob>>;
// C++  class QHttpMultiPart : public QObject


/*@devdoc
 *  The <code>NetworkAccessManager</code> class handles Internet communications &mdash; with the metaverse server, for example.
 *  A single <code>NetworkAccessManager</code> is used for all Internet communications.
 *  <p>C++ <code>class NetworkAccessManager : public QNetworkAccessManager : public QObject</code></p>
 *  @class NetworkAccessManager
 *
 *  @property {NetworkAccessManager.Operation} UnknownOperation=0 - An unknown operation.
 *  @property {NetworkAccessManager.Operation} HeadOperation=1 - HTTP "HEAD" operation.
 *  @property {NetworkAccessManager.Operation} GetOperation=2 - HTTP "GET" operation.
 *  @property {NetworkAccessManager.Operation} PutOperation=3 - HTTP "PUT" operation.
 *  @property {NetworkAccessManager.Operation} PostOperation=4 - HTTP "POST" operation.
 *  @property {NetworkAccessManager.Operation} DeleteOperation=5 - HTTP "DELETE" operation.
 *  @property {NetworkAccessManager.Operation} CustomOperation=6 - A custom operation.
 *
 */
class NetworkAccessManager {
    // C++  class NetworkAccessManager : public QNetworkAccessManager : public QObject

    /*@devdoc
     *  The <code>Operation</code> type provides <code>NetworkAccessManager</code> operation types.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>NoError</td><td><code><code>0</code></td><td>An unknown operation.</td></tr>
     *          <tr><td>NoError</td><td><code><code>1</code></td><td>HTTP "HEAD" operation.</td></tr>
     *          <tr><td>NoError</td><td><code><code>2</code></td><td>HTTP "GET" operation.</td></tr>
     *          <tr><td>NoError</td><td><code><code>3</code></td><td>HTTP "PUT" operation.</td></tr>
     *          <tr><td>NoError</td><td><code><code>4</code></td><td>HTTP "POST" operation.</td></tr>
     *          <tr><td>NoError</td><td><code><code>5</code></td><td>HTTP "DELETE" operation.</td></tr>
     *          <tr><td>NoError</td><td><code><code>6</code></td><td>A custom operation.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} NetworkAccessManager.Operation
     */

    /*@devdoc
     *  HTTP multipart form data.
     *  @typedef {Set<Map<string, string | Blob>>} NetworkAccessManager.HttpMultiPart
     */


    static UnknownOperation = Operation.UnknownOperation;
    static HeadOperation = Operation.HeadOperation;
    static GetOperation = Operation.GetOperation;
    static PutOperation = Operation.PutOperation;
    static PostOperation = Operation.PostOperation;
    static DeleteOperation = Operation.DeleteOperation;
    static CustomOperation = Operation.CustomOperation;


    static #_networkAccessManager: NetworkAccessManager | null = null;
    static readonly #_UNKNOWN_ERROR = 99;  // QNetworkReply::UnknownNetworkError
    static readonly #_NETWORK_ERROR_MAP = new Map([
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        ["ERR_NETWORK", 99],        // QNetworkReply::UnknownNetworkError
        ["ERR_BAD_REQUEST", 401]    // QNetworkReply::InternalServerError
        /* eslint-enable @typescript-eslint/no-magic-numbers */
    ]);


    /*@devdoc
     *  Gets the <code>NetworkAccessManager</code> singleton, creating it if necessary.
     *  @returns {NetworkAccessManager} The <code>NetworkAccessManager</code> singleton.
     */
    static getInstance(): NetworkAccessManager {
        // C++  QNetworkAccessManager& NetworkAccessManager::getInstance()
        if (NetworkAccessManager.#_networkAccessManager === null) {
            NetworkAccessManager.#_networkAccessManager = new NetworkAccessManager();
        }
        return NetworkAccessManager.#_networkAccessManager;
    }


    /*@devdoc
     *  Sends multipart form data to the destination specified by the request via an HTTP PUT operation.
     *  @param {NetworkRequest} request - The destination and configuration of the PUT operation.
     *  @param {NetworkAccessManager.HttpMultiPart} multipart - The multipart form data to send.
     *  @returns {NetworkReply} An object for handling the reply.
     */
    // eslint-disable-next-line class-methods-use-this
    put(request: NetworkRequest, multipart: HttpMultiPart): NetworkReply {
        // C++  QNetworkReply* put(const QNetworkRequest& request, QHttpMultiPart* multiPart)
        const networkReply = new NetworkReply();

        const data = new FormData();
        if (multipart.size > 0) {
            for (const part of multipart) {
                for (const item of part) {
                    let isFile = false;
                    try {
                        // Browser.
                        isFile = item[1] instanceof Blob;
                    } catch (e) {
                        // Node.
                        isFile = item[1] instanceof Buffer;
                    }
                    if (isFile) {
                        // Set filename in form data.
                        data.append(item[0], item[1], item[0]);
                    } else {
                        // No filename.
                        data.append(item[0], item[1]);
                    }
                }
            }
        }

        const config: AxiosRequestConfig = { };
        config.headers = { };

        const attributes = request.attributes();
        if (attributes.size > 0) {
            for (const attribute of attributes) {
                switch (attribute[0]) {
                    case NetworkRequest.FollowRedirectsAttribute:
                        if (attribute[1]) {
                            config.maxRedirects = 21;  // Axios default.
                        } else {
                            config.maxRedirects = 0;
                        }
                        break;
                    default:
                        console.error("NetworkRequest attribute not implemented:", attribute[0]);
                }
            }
        }

        const rawHeaders = request.rawHeaders();
        if (rawHeaders.size > 0) {
            for (const header of rawHeaders) {
                config.headers[header[0]] = header[1];
            }
        }

        void axios.put(request.url().toString(), data, config)
            .then((response) => {
                networkReply.setUrl(new Url(response.config.url));
                if (response.headers) {
                    const hfmSessionID = response.headers["hfm-sessionid"];
                    if (hfmSessionID) {
                        networkReply.setRawHeader("HFM-SessionID", hfmSessionID);
                    }
                }
                networkReply.setError(NetworkReply.NoError, "");
            })
            .catch((error) => {
                /* eslint-disable @typescript-eslint/no-unsafe-member-access */
                /* eslint-disable @typescript-eslint/no-unsafe-assignment */

                networkReply.setUrl(new Url(error.config.url));

                let errorCode = 0;
                let errorMessage = "";
                if (error.response) {
                    // Server responded with an error.
                    // Example:
                    // - error.code: "ERR_BAD_REQUEST"
                    // - error.message: "Request failed with status code 401"
                    // - error.response.status 401
                    // - error.response.data: { status: "failure", message: "Not authenticated" }
                    if (error.response !== undefined) {
                        errorCode = error.response.status;
                        errorMessage = error.response.data.message;
                    } else {
                        errorCode
                            = NetworkAccessManager.#_NETWORK_ERROR_MAP.get(error.code) ?? NetworkAccessManager.#_UNKNOWN_ERROR;
                        errorMessage = error.message;
                    }
                } else {
                    // Networking error.
                    // Example:
                    // - error.code: "ERR_NETWORK"
                    // - error.message: "Network error"
                    errorCode
                        = NetworkAccessManager.#_NETWORK_ERROR_MAP.get(error.code) ?? NetworkAccessManager.#_UNKNOWN_ERROR;
                    errorMessage = error.message;
                }
                networkReply.setError(errorCode, errorMessage);

                /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                /* eslint-enable @typescript-eslint/no-unsafe-member-access */
            })
            .finally(() => {
                networkReply.setFinished();
            });

        return networkReply;
    }

}

export default NetworkAccessManager;
export type { HttpMultiPart, Operation };
