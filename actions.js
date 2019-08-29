/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const template = require('art-template');
const path = require('path');
const VIEW_EXT = '.html';

var _createViewFileName = (file, params) => {
    var segs = [params.areaPath, 'views'];

    if (!file) {
        segs.push(params._controller);
        segs.push(params._action + VIEW_EXT);
    } else {
        if (file.indexOf(VIEW_EXT) === -1) {
            segs.push(params._controller);
            segs.push(file + VIEW_EXT);
        } else {
            segs.push(file);
        }
    }

    return path.resolve(process.cwd(), segs.join('/'));
};
var s1 = {
    view: function (file, model, out2String) {
        if (Object.isObject(file)) {
            if (model === true || model === false) {
                out2String = model;
            }

            model = file;
            file = null;
        }

        return {
            isView: true,
            render: function (req, rsp, params, args) {
                model && (args.model = model);

                if (out2String === true) {
                    return new Promise((resolve, reject) => {
                        resolve(template(_createViewFileName(file, params), args));
                    });
                } else {
                    rsp.render(_createViewFileName(file, params), args);
                }
            }
        };
    },
    page: (context) => {
        return {
            render: function (req, rsp) {
                rsp.type('html').status(context.code);

                if (context.path !== '') {
                    var filePath = path.resolve(process.cwd(), context.path);

                    fs.exists(filePath, function (exists) {
                        if (exists) {
                            rsp.sendFile(filePath);
                        } else {
                            rsp.send(context.message).end();
                        }
                    });
                } else {
                    rsp.send(context.message).end();
                }
            }
        };
    },
    json: (model) => {
        return {
            render: function (req, rsp) {
                rsp.json(model || {});
            }
        };
    },
    content: (content, code) => {
        return {
            render: function (req, rsp) {
                rsp.type('txt').status(code || 200).send(content || '').end();
            }
        };
    },
    file: (filename) => {
        return {
            render: function (req, rsp) {
                rsp.sendFile(filename);
            }
        };
    },
    buffer: (buffer, filename, ext) => {
        if (!ext) {
            ext = filename;
            filename = null;
        }

        return {
            render: function (req, rsp) {
                if (filename) {
                    var userAgent = (req.headers['user-agent'] || '').toLowerCase(),
                        content = '';

                    if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
                        content = `attachment; filename=${encodeURIComponent(filename)}`;
                    } else if (userAgent.indexOf('firefox') >= 0) {
                        content = `attachment; filename*="utf8\'\'${encodeURIComponent(filename)}"`;
                    } else {
                        content = `attachment; filename=${new Buffer(filename).toString('binary')}`;
                    }

                    rsp.setHeader('Content-Disposition', content);
                }

                rsp.type(ext).status(200).send(buffer).end();
            }
        };
    }
};
var s2 = {
    redirect: function (url) {
        this.rsp.redirect(301, url);
    },
    /**
     * 输出View
     * @method renderView
     * @param {file} View文件(可选)
     * @param {model} Model
     */
    renderView: function (file, model, out2String) {
        return this._render(s1.view(file, model, out2String));
    },
    /**
     * 输出Json
     * @method renderJson
     * @param {model} Model
     */
    renderJson: function (model) {
        return this._render(s1.json(model));
    },
    /**
     * 输出Text内容
     * @method renderContent
     * @param {content} text
     */
    renderContent: function (content) {
        return this._render(s1.content(content));
    },
    /**
     * 输出文件
     * @method renderFile
     * @param {filename} 文件名
     */
    renderFile: function (filename) {
        return this._render(s1.file(filename));
    },
    renderBuffer: function (buffer, filename, ext) {
        return this._render(s1.buffer(buffer, filename, ext));
    },
    status: function (code, msg) {
        var page = this.pages && this.pages[code.toString()];

        page ? this._render(s1.page(page)) : this._render(s1.content(msg || `${code}`, code));
    }
};

module.exports = s2;