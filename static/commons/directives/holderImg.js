/**
 * Created by shine on 16/5/5.
 */
define(['../app', 'holder'], function (app, Holder) {
    'use strict';
    app.directive('holderImg', function () {
        return {
            restrict: 'AC',
            link: function (scope, element, attr) {
                Holder.run({
                    images:element[0]
                });

            }
        }
    })
});