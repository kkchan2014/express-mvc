/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const extend = require('extend');
const path = require('path');
const actions = require('./actions');

function eventsClass(req, rsp, options, params) {
    var exportParams = extend({}, params);

    delete exportParams.areaPath;

    this.session = req.session;
    this.req = req;
    this.rsp = rsp;
    this.state = {
        title: '',
        debug: options.debug,
        resources: options.resources ? (options.resources.base || '/') : '/',
        params: exportParams
    };
    this.params = params;
    this.query = req.query;
    this.body = req.body;
    this.server = new(function (state) {
        this.session = req.session;
        this.params = params;
        this.state = state;
    })(this.state);
    this._render = (result) => {
        if (result && result.render) {
            if (result.isView) {
                return result.render(this.req, this.rsp, this.params, {
                    state: this.state,
                    server: this.server
                });
            } else {
                result.render(this.req, this.rsp, this.params);
            }
        }
    };
};

module.exports = {
    createParams: (req, options, route) => {
        var params = extend({}, route.defaults, req.params);

        if (!options.areas[params._area]) {
            var lastValue = null;

            if (params._controller === route.defaults._controller) {
                params._controller = undefined;
            }
            if (params._action === route.defaults._action) {
                params._action = undefined;
            }

            for (var key in params) {
                var curValue = params[key];

                if (lastValue !== null) {
                    params[key] = lastValue;
                }

                lastValue = curValue;
            }

            params._area = route.defaults._area;
            params._controller = params._controller || route.defaults._controller;
            params._action = params._action || route.defaults._action;
        }

        extend(params, {
            _defaultArea: route.defaults._area,
            _defaultController: route.defaults._controller,
            _defaultAction: route.defaults._action,

            areaPath: options.areas[params._area].path
        });

        return params;
    },
    createActionPath: (params) => {
        return path.resolve(params.areaPath, 'controllers', params._controller, params._action + '.js');
    },
    createEvents: (req, rsp, options, params) => {
        return extend(new eventsClass(req, rsp, options, params), actions);
    }
};