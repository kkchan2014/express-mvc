/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const path = require('path');
const uuid = require('node-uuid');
const fs2 = require('node-fs2');

var $ = {
    formatSize: (size) => {
        var x = ['K', 'M', 'G', 'T'];

        for (var i = 0; i < x.length; i++) {
            size /= 1024;

            if (size < 1024) {
                return `${size}${x[i]}`;
            }
        }
    }
};

module.exports = function () {
    this.use('checkFile', function (file, opts) {
        if (!file) {
            this.renderResult(false, `未上传任何文件`);

            return true;
        }

        if (opts.exts && opts.exts.indexOf(file.name.split('.').end()) === -1) {
            this.renderResult(false, `不允许上传${file.name.split('.').end()}格式的文件`);

            return true;
        }

        if (opts.limitSize && file.size > opts.limitSize) {
            this.renderResult(false, `上传的文件大小不能超过${$.formatSize(opts.limitSize)}`);

            return true;
        }
    });

    this.use('saveFile', function (file) {
        return new Promise((resolve, reject) => {
            var ext = file.name.split('.').end();
            var filepath = `uploads/${(new Date()).format("yyyy-MM-dd")}`;
            var filename = `${filepath}/${uuid.v4()}.${ext}`;
            var fullpath = path.resolve(process.cwd(), filename);

            io.mkdir(path.resolve(process.cwd(), filepath)).then((result) => {
                if (result) {
                    file.mv(fullpath, function () {
                        resolve({
                            filename: filename,
                            fullpath: fullpath
                        });
                    });
                } else {
                    resolve();
                }
            });
        });
    });
}