/**
 * Created by yixian on 2017-03-08.
 */
define(['angular'], function (angular) {
    'use strict';
    var app = angular.module('orgcommission', ['ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('orgcommission', {
            url: '/org_commissions',
            templateUrl: '/static/config/orgcommission/templates/org_commission_root.html',
            controller: 'orgCommissionRootCtrl'
        }).state('orgcommission.month', {
            url: '/months/{monthStr}',
            templateUrl: '/static/config/orgcommission/templates/org_commission_month.html',
            controller: 'orgCommissionMonthViewCtrl',
            resolve: {
                monthData: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/citypartner_prizes/months/' + $stateParams.monthStr);
                }]
            }
        }).state('orgcommission.month.orgdetail', {
            url: '/citypartners/{orgId}',
            templateUrl: '/static/config/orgcommission/templates/org_commission_detail.html',
            controller: 'orgCommissionOrgDetailCtrl',
            resolve: {
                detail: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/citypartner_prizes/months/' + $stateParams.monthStr + '/orgs/' + $stateParams.orgId);
                }]
            }
        })
    }]);

    app.controller('orgCommissionRootCtrl', ['$scope', '$http', '$filter', '$state', 'commonDialog',
        function ($scope, $http, $filter, $state, commonDialog) {
            $scope.generate = {};
            $scope.generateOrgCommission = function () {
                if (!$scope.generate.month) {
                    commonDialog.alert({
                        type: 'error', title: 'Error', content: 'Select a month first!'
                    });
                    return;
                }
                commonDialog.confirm({
                    title: 'Confirm',
                    content: 'This operation will clear the data generated before, Are you sure?'
                }).then(function () {
                    var params = {month: $filter('date')($scope.generate.month, 'yyyy-MM')};
                    $http.post('/sys/citypartner_prizes/generate', params).then(function () {
                        $state.go('orgcommission.month', {monthStr: params.month})
                    }, function (resp) {
                        commonDialog.alert({type: 'error', title: 'Error', content: resp.data.message});
                    })
                })
            };
            $scope.params = {year: new Date()};
            $scope.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            $scope.loadAvailableMonths = function () {
                $http.get('/sys/citypartner_prizes/months', {params: {year: $scope.params.year.getFullYear()}}).then(function (resp) {
                    $scope.availableMonths = resp.data;
                });
            };

            $scope.loadAvailableMonths();
            $scope.hasReport = function (mon) {
                var has = false;
                angular.forEach($scope.availableMonths, function (m) {
                    if (mon == m.month) {
                        has = true;
                    }
                });
                return has;
            };
            $scope.gotoMonth = function (mon) {
                var monthStr = $scope.params.year.getFullYear() + '-' + (('0' + mon).substr(-2));
                $state.go('orgcommission.month', {monthStr: monthStr})
            };
        }]);
    app.controller('orgCommissionMonthViewCtrl', ['$scope', 'monthData', function ($scope, monthData) {
        $scope.monthData = monthData.data;
    }]);
    app.controller('orgCommissionOrgDetailCtrl', ['$scope', 'detail', function ($scope, detail) {
        $scope.detail = detail.data;
    }]);
    return app;
});