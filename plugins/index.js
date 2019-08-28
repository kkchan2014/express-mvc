/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const fs2 = require('node-fs2');

module.exports = {
    load: () => {
        var list = [];

        fs2.getFiles(__dirname, /\.js$/).forEach(function (item, index) {
            if (typeof item === 'string' && !/\index\.js$/.test(item)) {
                try {
                    list.push(require(item));
                } catch (err) {
                    console.log(item);
                    console.log(err.stack);
                }
            }
        });

        return list;
    }
};