/**
 * Created by davep on 2016-09-01.
 */
define(['angular', 'uiRouter'], function () {
    'use strict';
    var app = angular.module('orderValidApp', ['ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('order_valid', {
            url: '/order_validation',
            templateUrl: '/static/payment/validation/templates/valid-calendar.html',
            controller: 'orderValidCalendarCtrl'
        }).state('order_valid.report', {
            url: '/{date}',
            templateUrl: '/static/payment/validation/templates/valid.html',
            controller: 'orderValidationCtrl'
        });
    }]);
    app.controller('orderValidCalendarCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.today = new Date();
        $scope.loadValidatedDates = function (month) {
            var monthStr = $filter('date')(month, 'yyyyMM');
            $http.get('/sys/financial/validated_dates/' + monthStr).then(function (resp) {
                $scope.validatedDates = resp.data;
            })
        }
    }]);
    app.controller('orderValidationCtrl', ['$scope', '$http', '$filter', '$stateParams', 'commonDialog',
        function ($scope, $http, $filter, $stateParams, commonDialog) {
            $scope.date = $stateParams.date;
            $scope.startValid = function (forceRebuild) {
                $scope.report = {loading: true};
                $http.get('/sys/financial/order_validations/' + $scope.date, {
                    params: {
                        use_cache: !forceRebuild
                    },
                    timeout: 300000
                }).then(function (resp) {
                    $scope.report = resp.data;
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
                    $scope.report = null;
                })
            };
            $scope.startValid(false);

            $scope.fixReport = function () {
                var datePattern = $filter('date')($scope.valid.date, 'yyyyMMdd');
                $http.get('/sys/financial/order_validations', {
                    params: {
                        date: datePattern,
                        fix: true
                    }
                }).then(function (resp) {
                    commonDialog.alert({title: 'Success', content: '修复完毕', type: 'success'})
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                })
            }
        }]);
    return app;
});