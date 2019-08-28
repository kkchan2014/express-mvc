/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const extend = require('extend');
const uuid = require('node-uuid');

var $ = {
    create: (html, opts) => {
        return require('html-pdf').create(html, opts);
    }
};

module.exports = function () {
    this.use('renderPdf', function (file, model, opts) {
        var options = extend({ format: 'A4' }, opts);

        return this.renderView(file, model, true).then(result => {
            return $.create(result, options).toBuffer((err, buffer) => {
                if (err) {
                    this.error(err);
                } else {
                    this.renderBuffer(buffer, `${this.state.title || uuid.v4()}.pdf`, 'pdf');
                }
            });
        });
    });
    this.use('renderPdfToFile', function (file, model, opts, fileName) {
        if (typeof opts === 'string') {
            fileName = opts;
            opts = model;
            model = null;
        } else if (typeof model === 'string') {
            fileName = model;
            opts = null;
            model = null;
        }

        var options = extend({ format: 'A4' }, opts);

        return this.renderView(file, model, true).then(result => {
            return new Promise((resolve, reject) => {
                $.create(result, options).toFile(fileName, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    });
}