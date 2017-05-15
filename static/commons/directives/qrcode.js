/**
 * qr code
 * Created by yixian on 2016-02-24.
 */
define(['../app', 'jquery', 'qrcode'], function (app, $) {
    'use strict';
    app.directive('qrcode', function () {
        return {
            restrict: 'A',
            scope: {
                qrcode: '='
            },
            link: function (scope, element, attr) {
                scope.$watch('qrcode', function (val) {
                    if (val) {
                        var w = $(element).width();
                        $(element).qrcode({width: w, height: w, text: val});
                    }
                });
            }
        }
    })
});