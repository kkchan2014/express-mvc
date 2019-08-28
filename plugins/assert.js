/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const extend = require('extend');

var $ = {
    create: (success, obj) => {
        if (typeof success === 'string') {
            obj = success;
            success = false;
        } else if (success instanceof Object) {
            obj = success;
            success = true;
        }

        var model = { success: success };

        if (obj instanceof Object) {
            extend(model, obj);
        } else if (typeof obj === 'string') {
            model['message'] = obj;
        }

        return model;
    }
};

module.exports = function () {
    this.use('renderResult', function (success, message) {
        this.renderJson($.create(success, message));
    });
    this.use('renderInvalid', function (message) {
        this.renderJson($.create(false, message || '非法操作'));
    });
    this.use('assert', function (when, field, message) {
        if (!when) {
            this.renderResult(false, {
                field: field,
                message: message
            });
        }

        return !when;
    });
    this.use('checkEmpty', function (field, message) {
        return this.assert((this.body[field] || '').trim() !== '', field, message || '必填项');
    });
    this.use('checkLength', function (field, min, max, message) {
        var length = (this.body[field] || '').trim().length;

        return this.assert(length >= min && length <= max, field, message || '填写信息有误');
    });
    this.use('checkEqual', function (field, value, message) {
        return this.assert(this.body[field] === value, field, message || '填写信息有误');
    });
    this.use('checkRegex', function (field, regex, message) {
        return this.assert(regex.test(this.body[field] || ''), field, message || '填写信息有误');
    });
    this.use('checked', function (field, message) {
        return this.assert(this.body[field] === 'on', field, message || '请勾选此项');
    });
}