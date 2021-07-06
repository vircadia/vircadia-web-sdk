//
//  Vircadia.js
//
//  Vircadia Web SDK.
//
//  Created by David Rowe on 9 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@sdkdoc
 *  This is the Vircadia SDK.
 *  <p>C++: This abstracts out key components of the native Vircadia Interface app.</p>
 *  
 *  @namespace Vircadia
 */
const Vircadia = (function () {

    /**
     *  Says hello to the world.
     *  @function Vircadia.helloWorld
     */
    function helloWorld() {
        console.log("Hello world!");
    }

    return {
        helloWorld
    };

}());

export default Vircadia;
