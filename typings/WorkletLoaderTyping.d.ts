//
//  WorkletLoaderTyping.d.ts
//
//  Typings required for NPM worklet-loader.
//  https://www.npmjs.com/package/worklet-loader

//  Created by David Rowe on 18 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

declare module "*.worklet.ts" {
    const exportString: string;
    export default exportString;
}
