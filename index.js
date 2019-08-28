/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

require('node-type-extensions');

const domain = require('domain');
const express = require('express');
const fs = require("fs");
const node_template = require('node-art-template');
const helper = require('./helper');
const plugins = require('./plugins');

class nodeExpressMVC {
    constructor(options, enableViewCache) {
        this.options = options;
        this.pages = {};
        this.handlers = [];
        this.extends = {};
        this.extends = {};
        this.app = express();
        this.engine('html', node_template(options.resources, enableViewCache === true));

        if (this.options.headers) {
            this.app.all('*', (req, rsp, next) => {
                Object.extract(this.options.headers, (k, v) => rsp.header(k, v));

                req.method === 'OPTIONS' ? rsp.send(200) : next();
            });
        }

        plugins.load().forEach(a => this.use(a));
    }

    setPages(pages) {
        this.pages = pages;
    }

    use(fn, _2) {
        if (typeof fn === 'function') {
            switch (fn.length) {
                case 3://(req, rsp, next)
                    this.app.use(fn);
                    break;
                case 2://(e, next)
                    this.handlers.push(fn);
                    break;
                default:
                    fn.apply(this);
                    break;
            }
        } else if (typeof fn === 'string') {
            if (typeof _2 === 'function') {
                try {
                    this.extends[fn] = _2;
                } catch {
                    this.extends[fn] = _2;
                }
            } else {
                this.app.all(fn, (req, rsp) => this.do(req, rsp, _2));
            }
        } else if (Object.isObject(fn)) {
            Object.extract(fn, (k, v) => v && v.url && this.use(v.url, v));
        } else if (Object.isArray(fn)) {
            fn.forEach(a => a && this.use(a));
        }
    }

    static(_1) {
        Object.extract(_1, (k, v) => {
            v && this.app.use(express.static(v));
        });
    }

    engine(n, fn) {
        this.app.engine(n, fn);
    }

    listen(port, cb) {
        this.app.listen(port, cb);
    }

    catch() {
        this.use((req, rsp, next) => {
            var d = domain.create();
            d.add(req);
            d.add(rsp);
            d.run(next);
            d.on('error', (err) => {
                this.status(500, err.stack);
            });
        });
    }

    do(req, rsp, route) {
        var params = helper.createParams(req, this.options, route);
        var actionPath = helper.createActionPath(params);

        fs.exists(actionPath, exists => {
            var e = helper.createEvents(req, rsp, this.options, params);

            if (exists) {
                var action = require(actionPath);
                var index = 0;
                var exec = () => {
                    var next = this.handlers[index++] || action;

                    next && next(e, next === action ? (() => { }) : exec);
                }

                this._extend(e, this.extends);

                exec();
            } else {
                e.status(404);
            }
        });
    }

    _extend(target, ex) {
        Object.extract(ex, (k, v) => {
            var arr = k.split('.');

            if (arr.length == 2) {
                target[arr[0]] && (target[arr[0]][arr[1]] = v);
            } else {
                target[k] = v;
            }
        });
    }
}

module.exports = nodeExpressMVC;