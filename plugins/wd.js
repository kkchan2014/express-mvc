/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

var $ = {
    verify: (value, field) => {
        if (field.Require === true && !value) {
            return false;
        }

        switch (field.Type) {
            case 'Number':
            case 'Decimal': return Number(value) !== NaN;
            case 'Checkbox': return !field.Require || value === 'on';
            case 'Text':
            case 'Passport':
            case 'TextArea':
            default: return true;
        }
    },

    convert: (value, type) => {
        switch (type) {
            case 'Checkbox': return value === 'on';
            case 'Number':
            case 'Decimal': return Number(value) || 0;
            default: return value;
        }
    }
};

module.exports = function () {
    this.use('wrapData', function (dict) {
        for (var key in dict) {
            dict[key] = $.convert(this.req.body[key], dict[key]);
        }

        return dict;
    });

    this.use('wrapDataWithVerify', function (list) {
        return new Promise((resolve, reject) => {
            var data = {};

            try {
                list.forEach((item) => {
                    var value = this.req.body[item.Name];

                    if (!$.verify(value, item)) {
                        reject({ success: false, field: item.Name, message: '数据验证失败' });

                        throw new Error();
                    }

                    data[item.Name] = $.convert(value, item.Type);
                });

                resolve(data);
            } catch (err) {
                if (err instanceof Error) {
                    reject(err);
                }
            }
        });
    });

    this.use('wrapListWithVerify', function (list) {
        return new Promise((resolve, reject) => {
            var datas = [];

            try {
                list.forEach((item) => {
                    var values = this.req.body[item.Name];

                    values = values instanceof Array ? values : [values];

                    values.forEach((value, index) => {
                        if (!$.verify(value, item)) {
                            reject({ success: false, field: item.Name, index: index, message: '数据验证失败' });

                            throw new Error();
                        }

                        datas[index] = datas[index] || {};

                        datas[index][item.Name] = $.convert(value, item.Type);
                    });
                });

                resolve(datas);
            } catch (err) {
                if (err instanceof Error) {
                    reject(err);
                }
            }
        });
    });
}