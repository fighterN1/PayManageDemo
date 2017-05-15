/**
 * Created by yixian on 2017-04-19.
 */
define(['../app'],function (app) {
    'use strict';
    app.directive('loadingbar',function () {
        return {
            restrict:'AE',
            replace:true,
            templateUrl:'/static/commons/templates/loadingbar.html'
        }
    })
});