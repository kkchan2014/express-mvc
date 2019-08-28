/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const extend = require('extend');

const $ = {
    createPages: (cur_page, total_page) => {
        var pages = [], size = 7;

        if (cur_page < size) {
            var i = Math.min(size, total_page);

            while (i) {
                pages.unshift(i--);
            }
        } else {
            var middle = cur_page - Math.floor(size / 2), i = size;

            if (middle > total_page - size) {
                middle = total_page - size + 1;
            }
            while (i--) {
                pages.push(middle++);
            }
        }

        return pages;
    }
};

module.exports = function () {
    this.use('pageData', function (query, pageSize, exts) {
        if (pageSize instanceof Object) {
            exts = pageSize;
            pageSize = 20;
        }

        var page = Number(this.query.page) || 1;
        var pageSize = Number(this.query.size) || (pageSize || 20);

        return new Promise((resolve, reject) => {
            query.countDocuments((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    var totalCount = res;
                    var totalPage = Math.ceil(totalCount / pageSize);

                    if (totalPage < page) {
                        page = totalPage || 1;
                    }

                    query.find({}).skip((page - 1) * pageSize).limit(pageSize).exec((err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(extend({
                                page: page,
                                pageSize: pageSize,
                                totalPage: totalPage,
                                pages: $.createPages(page, totalPage),
                                total: totalCount,
                                datas: res
                            }, exts || {}));
                        }
                    });
                }
            });
        });
    });
}