/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

var URL = {
    buildArgs: function () {
        var args = [];

        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        return args;
    },
    create: function (area, controller, action, _more) {
        var array = [
            area || this.params._area,
            controller || this.params._controller,
            action || this.params._defaultAction,
        ];

        if (array[0] == this.params._defaultArea) {
            array.splice(0, 1);
        }

        if (_more) {
            for (var i = 3; i < arguments.length; i++) {
                if (arguments[i] !== null && arguments[i] !== undefined && arguments[i] !== '') {
                    array.push(arguments[i]);
                }
            }
        } else if (array[array.length - 1] == this.params._defaultAction) {
            array.splice(array.length - 1, 1);
        }

        return `/${array.join('/')}`;
    },
    build: function (args, removeCount) {
        args = URL.buildArgs.apply(this, args);

        if (typeof removeCount === 'number') {
            while (--removeCount >= 0) {
                args.splice(0, 0, null);
            }
        }

        return URL.create.apply(this, args);
    }
};

module.exports = function () {
    this.use('action', function () { return URL.build.call(this, arguments, 2); });
    this.use('controller', function () { return URL.build.call(this, arguments, 1); });
    this.use('area', function () { return URL.build.call(this, arguments, 0); });

    this.use('server.action', function () { return URL.build.call(this, arguments, 2); });
    this.use('server.controller', function () { return URL.build.call(this, arguments, 1); });
    this.use('server.area', function () { return URL.build.call(this, arguments, 0); });
    this.use('server.input', function (type, attrs, checked_val) {
        var _attrs = [];

        type = type.toLowerCase();

        if (type === 'decimal') {
            type = 'number';
            if (attrs.step === undefined) {
                attrs.step = '0.1';
            }
        }

        if (type !== 'textarea') {
            _attrs.push(`type="${type}"`);

            if (type === 'number') {
                if (attrs.min === undefined) {
                    attrs.min = 0;
                }
            }
        }

        if (!attrs.autocomplete && attrs.autocomplete !== null) {
            attrs.autocomplete = 'off';
        }

        for (var key in attrs) {
            if (key === 'required') {
                if (attrs[key]) {
                    _attrs.push(`${key}`);
                }
            } else if (attrs[key] !== null && attrs[key] !== undefined) {
                _attrs.push(`${key}="${attrs[key]}"`);
            }
        }

        if (type === 'checkbox' && (checked_val === true || checked_val === 1)) {
            _attrs.push(`checked="checked"`);
        } else if (checked_val && type !== 'textarea') {
            _attrs.push(`value="${checked_val}"`);
        }

        if (type !== 'textarea') {
            return `<input ${_attrs.join(' ')} />`;
        } else {
            return `<textarea ${_attrs.join(' ')}>${checked_val || ''}</textarea>`;
        }
    });
    this.use('server.option', function (text, value, selected_defval, attrs) {
        var _attrs = [];

        if (attrs) {
            for (var key in attrs) {
                _attrs.push(`${key}="${(attrs[key] || '')}"`);
            }
        }

        _attrs.push(`value="${(value || '')}"`);

        if (selected_defval === true || selected_defval === 1 || selected_defval === value) {
            _attrs.push(`selected="selected"`);
        }

        return `<option ${_attrs.join(' ')}>${text}</option>`;
    });
}