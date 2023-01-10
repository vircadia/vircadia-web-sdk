//
//  NetworkRequest.ts
//
//  Created by David Rowe on 7 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Url from "../shared/Url";


enum NetworkRequestAttributes {
    // C++  enum QNetworkRequest::Attribute
    FollowRedirects = 21
}


/*@devdoc
 *  The <code>NetworkRequest</code> class stores information for sending an Internet request using {@link NetworkAccessManager}.
 *  <p>C++ <code>class QNetworkRequest: public QIODevice</code></p>
 *  @class NetworkRequest
 *  @property {NetworkRequest.NetworkRequestAttributes} FollowRedirectsAttribute = 21 - Controls whether redirects should be
 *      followed.
 *      <em>Read-only.</em>
 */
class NetworkRequest {
    // C++  class QNetworkRequest: public QIODevice

    /*@devdoc
     *  The <code>NetworkRequestAttributes</code> type provides attribute codes used for <code>NetworkRequest</code> and
     *  {@link NetworkReply} that control the request and provide information about the reply.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>FollowRedirects</td><td><code><code>21</code></td><td>Set the value of this attribute to
     *              <code>true</code> to allow redirects. The default attribute value is <code>false</code>.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} NetworkRequest.NetworkRequestAttributes
     */


    static readonly FollowRedirectsAttribute: NetworkRequestAttributes = 21;


    #_attributes: Map<number, boolean> = new Map();
    #_rawHeaders: Map<string, string> = new Map();
    #_url = new Url();


    constructor() {
        this.#_attributes.set(NetworkRequestAttributes.FollowRedirects, false);
    }


    /*@devdoc
     *  Sets an attribute value for a network request. If the specified attribute has already been set then its value is
     *  over-written.
     *  @param {NetworkRequest.NetworkRequestAttributes} code - The attribute code.
     *  @param {boolean} value - The attribute value.
     */
    setAttribute(code: NetworkRequestAttributes, value: boolean): void {
        // C++  void QNetworkRequest::setAttribute(Attribute code, const QVariant &value)
        this.#_attributes.set(code, value);
    }

    /*@devdoc
     *  Gets the attribute values that have been set on the network request.
     *  @returns {Map<NetworkRequest.NetworkRequestAttributes, boolean>} The attribute values that have been set on the network
     *      request.
     */
    attributes(): Map<NetworkRequestAttributes, boolean> {
        // C++  N/A.
        return this.#_attributes;
    }

    /*@devdoc
     *  Sets a raw header to include in the network request. If the specified raw header has already been set then its value is
     *  over-written.
     *  @param {string} headerName - The name of the header.
     *  @param {string} value - The header value.
     */
    setRawHeader(headerName: string, value: string): void {
        // C++  void QNetworkRequest::setRawHeader(const QByteArray &headerName, const QByteArray &value)
        this.#_rawHeaders.set(headerName, value);
    }

    /*@devdoc
     *  Gets the raw headers that have been set on the network request.
     *  @returns {Map<string, string>} The raw headers that have been set on the network request.
     */
    rawHeaders(): Map<string, string> {
        // C++  QList<QByteArray> QNetworkRequest::rawHeaderList() const
        return this.#_rawHeaders;
    }


    /*@devdoc
     *  Sets the URL of the network request.
     *  @param {Url} url - The URL of the network request.
     */
    setUrl(url: Url): void {
        // C++  void QNetworkRequest::setUrl(const QUrl& url)
        this.#_url = url;
    }

    /*@devdoc
     *  Gets the URL of the network request.
     *  @returns {Url} The URL of the network request.
    */
    url(): Url {
        // C++  QUrl QNetworkRequest::url() const
        return this.#_url;
    }

}

export default NetworkRequest;
export type { NetworkRequestAttributes };
