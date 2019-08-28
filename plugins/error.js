/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

module.exports = function () {
    this.use('error', function (err) {
        this.status(500, err.stack);
    });
    this.use('ajaxerror', function (err) {
        console.error(err.stack);

        this.renderResult(false);
    });
}