/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const extend = require('extend');
const svgCaptcha = require('svg-captcha');

module.exports = function () {
    this.use('captchaV4', function () {
        var a = 1000;
        var b = 9999;

        return Math.min(a, b) + Math.floor(Math.random() * Math.abs(a - b));
    });
    this.use('renderCaptcha', function (opts, sessionKey) {
        if (typeof opts === 'string') {
            sessionKey = opts;
            opts = {};
        }

        try {
            let captcha = svgCaptcha.create(extend({ fontSize: 50, width: 100 }, opts));

            if (sessionKey && this.session) {
                this.session[sessionKey] = captcha.text.toLowerCase();
            }

            this._render(mvc.actionResults.buffer(captcha.data, 'svg'));
        } catch (err) {
            if (this.log) this.log.error(err.stack);
        }
    });
}