/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const fs = require('fs');
const extend = require('extend');
const uuid = require('node-uuid');

var $ = {
    create: (data, opts) => {
        var options = extend({}, opts);

        return new Promise((resolve, reject) => {
            try {
                var buffer = require('node-xlsx').build(data, options);

                resolve(buffer);
            } catch (err) {
                reject(err);
            }
        });
    }
};

module.exports = function () {
    this.use('renderExcel', function (model, opts) {
        $.create(model, opts).then(buffer => {
            this.renderBuffer(buffer, `${this.state.title || uuid.v4()}.xlsx`, 'xlsx');
        }).catch(err => {
            this.error(err);
        });
    });
    this.use('renderExcelToFile', function (model, opts, fileName) {
        if (typeof opts === 'string') {
            fileName = opts;
            opts = null;
        }

        return new Promise((resolve, reject) => {
            $.create(model, opts).then(buffer => {
                fs.writeFile(fileName, buffer, function (err) {
                    resolve(buffer);
                });
            }).catch(reject);
        });
    });
    this.use('buildExcelData', function (data, columns) {
        var output = [];

        var row = [];
        for (var key in columns) {
            row.push(columns[key] || key);
        }
        output.push(row);

        data.forEach(function (item, index) {
            var row = [];
            for (var key in columns) {
                row.push(item[key] || '');
            }
            output.push(row);
        });

        return output;
    });
}