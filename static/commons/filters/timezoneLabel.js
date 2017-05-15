/**
 * Created by yixian on 2016-10-08.
 */
define(['../app'], function (app) {
    'use strict';
    app.filter('timezoneLabel', ['timezone', function (timezone) {
        return function (key) {
            var tz = timezone.find(key);
            return tz.label + " " + tz.detail;
        }
    }])
});