/**
 * Created by davep on 2016-07-27.
 */
define(['../app'], function (app) {
    'use strict';
    app.filter('limitToWithEllipsis', function () {
        return function (input, limitTo, ellipsisChar) {
            ellipsisChar = ellipsisChar || '…';
            limitTo = limitTo || 10;
            if (!input) {
                return '';
            } else {
                input = input + '';
                if (input.length <= limitTo) {
                    return input;
                }
                return input.substr(0, limitTo - 1) + ellipsisChar;
            }
        }
    });
});