//
//  NetworkReply.ts
//
//  Created by David Rowe on 7 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Url from "../shared/Url";


enum NetworkError {
    // C++  enum QNetworkReply::NetworkError
    NoError = 0,
    InternalServerError = 401,
    PageNotFoundError = 404,
    UnknownServerError = 499
}


/*@devdoc
 *  The <code>NetworkReply</code> class provides information on an Internet reply provided in response to a
 *  {@link NetworkAccessManager} operation.
 *  <p>C++ <code>class QNetworkReply: public QIODevice</code></p>
 *  @class NetworkReply
 *  @property {NetworkReply.NetworkError} NoError=0 - Success &mdash; there is no error.
 *      <em>Read-only.</em>
 *  @property {NetworkReply.NetworkError} InternalServerError=401 - The server encountered an error processing the request.
 *      <em>Read-only.</em>
 *  @property {NetworkReply.NetworkError} PageNotFoundError=401 - The server did not recognize the requested URL.
 *      <em>Read-only.</em>
 *  @property {NetworkReply.NetworkError} UnknownServerError=499 - An unknown error occurred on the server.
 *      <em>Read-only.</em>
 *  @property {Signal<NetworkReply~finished>} finished - Triggered when the reply has finished processing.
 */
class NetworkReply {
    // C++  class QNetworkReply: public QIODevice

    /*@devdoc
     *  The <code>NetworkError</code> type provides <code>NetworkReply</code> error codes.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>NoError</td><td><code><code>0</code></td><td>No error has occurred.</td></tr>
     *          <tr><td>InternalServerError</td><td><code><code>401</code></td><td>The server encountered an error processing
     *              the request.</td></tr>
     *          <tr><td>PageNotFoundError</td><td><code><code>404</code></td><td>The server did not recognize the requested
     *              URL.</td></tr>
     *          <tr><td>UnknownServerError</td><td><code><code>499</code></td><td>An unknown error occurred on the
     *              server.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} NetworkReply.NetworkError
     */


    static readonly NoError = NetworkError.NoError;
    static readonly InternalServerError = NetworkError.InternalServerError;
    static readonly PageNotFoundError = NetworkError.PageNotFoundError;
    static readonly UnknownServerError = NetworkError.UnknownServerError;


    #_url = new Url();
    #_rawHeaders: Map<string, string> = new Map();
    #_error: NetworkError = NetworkError.NoError;
    #_errorString = "No error";
    #_data = new ArrayBuffer(0);
    #_isFinished = false;

    #_finished = new SignalEmitter();


    /*@sdkdoc
     *  Triggered when the network reply has finished processing.
     *  @callback NetworkReply~finished
     */
    get finished(): Signal {
        // C++  void QNetworkReply::finished()
        return this.#_finished.signal();
    }


    /*@devdoc
     *  Sets the URL that the network reply is from. This URL may differ from that of the network request if there have been
     *  redirects.
     *  @param {Url} url - The URL that the network reply is from.
     */
    setUrl(url: Url): void {
        // C++  void QNetworkReply::setUrl(const QUrl& url)
        this.#_url = url;
    }

    /*@devdoc
     *  Gets the URL that the network reply is from. This URL may differ from that of the network request if there have been
     *  redirects.
     *  @returns {Url} The URL that the network reply is from.
     */
    url(): Url {
        // C++  QUrl QNetworkReply::url() const
        return this.#_url;
    }

    /*@devdoc
     *  Sets a raw header value.
     *  @param {string} headerName - The name of the raw header.
     *  @param {string} value - The value of the raw header.
     */
    setRawHeader(headerName: string, value: string): void {
        // C++  void QNetworkReply::setRawHeader(const QByteArray &headerName, const QByteArray &value)
        this.#_rawHeaders.set(headerName, value);
    }

    /*@devdoc
     *  Gets whether the network reply has a raw header of a given name.
     *  @param {string} headerName - The name of the raw header.
     *  @returns {boolean} <code>true</code> if the network reply has a raw header of the given name, <code>false</code> if it
     *      doesn't.
     */
    hasRawHeader(headerName: string): boolean {
        // C++  bool QNetworkReply::hasRawHeader(const QByteArray &headerName) const
        return this.#_rawHeaders.has(headerName);
    }

    /*@devdoc
     *  Gets the value of a raw header in the network reply.
     *  @param {string} headerName - The name of the raw header.
     *  @returns {string} The value of the raw header in the network reply. An empty string if there is no such raw header.
     */
    rawHeader(headerName: string): string {
        // C++  QByteArray QNetworkReply::rawHeader(const QByteArray &headerName) const
        return this.#_rawHeaders.get(headerName) ?? "";
    }

    /*@devdoc
     *  Sets the error state of the network reply.
     *  @param {NetworkReply.NetworkError} errorCode - The error code.
     *  @param {string} errorString - A description of the error state.
     */
    setError(errorCode: NetworkError, errorString: string): void {
        // C++  void QNetworkReply::setError(NetworkError errorCode, const QString &errorString)
        this.#_error = errorCode;
        this.#_errorString = errorString;
    }

    /*@devdoc
     *  Gets the error state of the network reply.
     *  @returns {NetworkReply.NetworkError} The error state of the network reply.
     */
    error(): NetworkError {
        // C++  QNetworkReply::NetworkError error() const
        return this.#_error;
    }

    /*@devdoc
     *  Gets a description of the error state of the network reply.
     *  @returns {string} A description of the error state.
     */
    errorString(): string {
        // C++  QString QNetworkReply::errorString() const
        return this.#_errorString;
    }

    /*@devdoc
     *  Sets the data in the body of the network reply.
     *  @param {ArrayBuffer} data - The data in the body of the network reply.
     */
    setData(data: ArrayBuffer): void {
        // C++  N/A
        this.#_data = data;
    }

    /*@devdoc
     *  Reads all data in the body of the network reply.
     *  @returns {ArrayBuffer} The data in the body of the network reply.
     */
    readAll(): ArrayBuffer {
        // C++  QByteArray QNetworkReply::readAll()
        return this.#_data;
    }

    /*@devdoc
     *  Gets whether the network reply has finished.
     *  @returns {boolean} <code>true</code> if the network reply has finished, <code>false</code> if it hasn't.
     */
    isFinished(): boolean {
        // C++  bool QNetworkReply::isFinished() const
        return this.#_isFinished;
    }

    /*@devdoc
     *  Sets the reply has having finished and causes the <code>finished</code> signal to be emitted.
     */
    setFinished(): void {
        // C++  void QNetworkReply::setFinished(bool)
        this.#_isFinished = true;
        this.#_finished.emit();
    }

}

export default NetworkReply;
export type { NetworkError };
