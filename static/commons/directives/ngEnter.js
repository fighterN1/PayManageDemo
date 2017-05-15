/**
 * Created by davep on 2016-08-11.
 */
define(['../app', 'angular'], function (app, angular) {
    'use strict';
    app.directive('ngEnter', function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.keyup(function (evt) {
                    if (evt.which == 13) {
                        if (attr.ngEnter) {
                            scope.$eval(attr.ngEnter);
                        }
                    }
                })
            }
        }
    })
});