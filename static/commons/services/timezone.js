/**
 * Created by yixian on 2016-10-08.
 */
define(['../app', 'angular'], function (app, angular) {
    'use strict';
    var timezoneConfigs = [
        {key: 'Australia/West', detail: 'Australia/Perth, Australia/West', label: 'AWST(UTC+08:00)'},
        {key: 'Australia/Eucla', detail: 'Australia/Eucla', label: 'ACWST(UTC+08:45)'},
        {key: 'Australia/North', detail: 'Australia/Darwin, Australia/North', label: 'ACST(UTC+09:30)'},
        {
            key: 'Australia/South',
            detail: 'Australia/Adelaide, Australia/Broken_Hill, Australia/South, Australia/Yancowinna',
            label: 'ACST/ACDT(UTC+09:30,DST)'
        },
        {
            key: 'Australia/Brisbane',
            detail: 'Australia/Brisbane, Australia/Lindeman, Australia/Queensland',
            label: 'AEST(UTC+10:00)'
        },
        {
            key: 'Australia/Melbourne',
            detail: 'Australia/Melbourne, Australia/NSW, Australia/Sydney, Australia/ACT, Australia/Canberra, Australia/Currie, Australia/Hobart, Australia/Tasmania, Australia/Victoria',
            label: 'AEST/AEDT(UTC+10:00,DST)'
        },
        {key: 'Australia/LHI', detail: 'Australia/LHI, Australia/Lord_Howe', label: 'LHDT(UTC+10:30,DST)'}
    ];
    app.factory('timezone', function () {
        return {
            configs: function () {
                return timezoneConfigs;
            },
            find: function (key) {
                var timezone = {};
                angular.forEach(timezoneConfigs, function (tz) {
                    if (tz.key == key) {
                        timezone = tz;
                    }
                });
                return timezone;
            }
        }
    });
});