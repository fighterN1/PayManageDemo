/**
 * Created by yixian on 2016-06-12.
 */
define(['../app'],function (app) {
    'use strict';
    app.filter('inverseColor',function () {
        return function (input) {
            if (input == null || !input.match(/^#[0-9a-fA-F]{6}$/g)) {
                return null;
            }
            var colorNumber = parseInt(input.substr(1), 16);
            var whiteColor = 0xffffff;
            var inverseColor = whiteColor - colorNumber;
            return '#' + (inverseColor.toString(16).toUpperCase())
        }
    })
});