/**
 * Created by yixian on 2017-01-06.
 */
define(['../app', 'angular', 'css!../css/royal-calendar'], function (app, angular) {
    'use strict';
    app.directive('royalCalendar', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            scope: true,
            transclude: true,
            templateUrl: '/static/commons/templates/royal-calendar.html',
            link: function (scope, elem, attr) {
                scope.ctrl = {};
                //date mode
                scope.resetMonth = function (mon) {
                    mon = new Date(mon);
                    scope.ctrl.mode = 'date';
                    scope.ctrl.curMonth = mon;
                    if (attr.monthChange) {
                        scope.$eval(attr.monthChange, {$month: mon})
                    }
                    var dt = new Date(mon);
                    dt.setDate(1);
                    var day = dt.getDay();
                    dt.setDate(1 - day);
                    scope.weeks = [];
                    while (dt.getMonth() <= scope.ctrl.curMonth.getMonth() && dt.getFullYear() <= scope.ctrl.curMonth.getFullYear()) {
                        var week = [];
                        for (var t = 0; t < 7; t++) {
                            week.push(new Date(dt));
                            dt.setDate(dt.getDate() + 1);
                        }
                        scope.weeks.push(week);
                    }
                };
                scope.isMinMonth = function (mon) {
                    var minMonth = attr.minMonth;
                    minMonth = minMonth == null ? null : new Date(minMonth);
                    return minMonth != null && mon.getMonth() <= minMonth.getMonth() && mon.getFullYear() <= minMonth.getFullYear();
                };

                scope.prevMonth = function () {
                    var mon = new Date(scope.ctrl.curMonth);
                    if (scope.isMinMonth(mon)) {
                        return;
                    }
                    mon.setMonth(mon.getMonth() - 1);
                    scope.resetMonth(mon)
                };
                scope.isMaxMonth = function (mon) {
                    var maxMonth = attr.maxMonth;
                    maxMonth = maxMonth == null ? null : new Date(maxMonth);
                    return maxMonth != null && mon.getMonth() >= maxMonth.getMonth() && mon.getFullYear() >= maxMonth.getFullYear();
                };

                scope.nextMonth = function () {
                    var mon = new Date(scope.ctrl.curMonth);
                    if (scope.isMaxMonth(mon)) {
                        return;
                    }
                    mon.setMonth(mon.getMonth() + 1);
                    scope.resetMonth(mon);
                };
                scope.isSameMonth = function (dt) {
                    return dt.getMonth() == scope.ctrl.curMonth.getMonth() && dt.getFullYear() == scope.ctrl.curMonth.getFullYear();
                };

                //month mode
                scope.switchMonth = function (mon) {
                    scope.monthGroup = [];

                    for (var g = 0; g < 3; g++) {
                        var group = [];
                        for (var m = 0; m < 4; m++) {
                            group.push(new Date(mon.getFullYear(), g * 4 + m, 1))
                        }
                        scope.monthGroup.push(group);
                    }
                    scope.ctrl.mode = 'month';
                    scope.ctrl.curYear = mon.getFullYear();
                };
                scope.prevYear = function () {
                    scope.switchMonth(new Date(scope.ctrl.curYear - 1, 0, 1));
                };
                scope.nextYear = function () {
                    scope.switchMonth(new Date(scope.ctrl.curYear + 1, 0, 1));
                };

                //year mode
                scope.switchYear = function (year) {
                    scope.ctrl.curYearGroup = year / 16;
                    var yearIndex = 16 * scope.ctrl.curYearGroup;
                    scope.yearGroup = [];
                    for (var g = 0; g < 4; g++) {
                        var group = [];
                        for (var m = 0; m < 4; m++) {
                            group.push(new Date(yearIndex + g * 4 + m, 0, 1));
                        }
                        scope.yearGroup.push(group);
                    }
                    scope.ctrl.mode = 'year';
                };
                scope.prevYearGroup = function () {
                    scope.switchYear((scope.ctrl.curYearGroup - 1) * 16)
                };
                scope.nextYearGroup = function () {
                    scope.switchYear((scope.ctrl.curYearGroup + 1) * 16)
                };
                if (attr.initMonth) {
                    scope.$watch(attr.initMonth, function (mon) {
                        scope.resetMonth(new Date(mon || new Date().setDate(1)));
                    });
                } else {
                    scope.resetMonth(new Date().setDate(1))
                }
            }
        }
    }]);
    app.directive('rcInject', function () {
        return {
            link: function ($scope, $element, $attrs, controller, $transclude) {
                if (!$transclude) {
                    throw 'not transclude'
                }
                var innerScope = $scope.$new();
                $transclude(innerScope, function (clone) {
                    $element.empty();
                    $element.append(clone);
                    $element.on('$destroy', function () {
                        innerScope.$destroy();
                    });
                });
            }
        };
    });
});