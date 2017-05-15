/**
 * Created by yixian on 2016-10-18.
 */
define(['angular', 'uiRouter'], function (angular) {
    'use strict';
    var app = angular.module('logview', ['ui.router', 'ui.bootstrap']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('logview', {
            url: '/logs',
            templateUrl: '/static/config/logview/templates/root.html',
            controller: 'logviewRootCtrl'
        }).state('logview.login_history', {
            url: '/login',
            templateUrl: '/static/config/logview/templates/login_log_root.html',
            controller: 'loginLogRootCtrl'
        }).state('logview.login_history.managers', {
            url: '/managers',
            templateUrl: '/static/config/logview/templates/login_log_manager.html',
            controller: 'managerLoginLogCtrl'
        }).state('logview.login_history.client', {
            url: '/clients',
            templateUrl: '/static/config/logview/templates/login_log_clients.html',
            controller: 'clientLoginLogCtrl'
        }).state('logview.notify_logs', {
            url: '/notify',
            templateUrl: '/static/config/logview/templates/notify_log.html',
            controller: 'notifyLogCtrl'
        })
    }]);
    app.controller('logviewRootCtrl', ['$scope', function ($scope) {
    }]);
    app.controller('loginLogRootCtrl', ['$scope', '$state', function ($scope, $state) {
        if ($state.is('logview.login_history')) {
            $state.go('.managers')
        }
    }]);
    app.controller('managerLoginLogCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.pagination = {};
        $scope.listManagerLoginLogs = function (page) {
            var params = angular.copy($scope.params) || {};
            params.page = page || $scope.pagination.page || 1;
            if (params.begin != null) {
                params.begin = $filter('date')(params.begin, 'yyyyMMdd');
            }
            if (params.end != null) {
                params.end = $filter('date')(params.end, 'yyyyMMdd');
            }
            $http.get('/sys_logs/sign_in/managers', {params: params}).then(function (resp) {
                $scope.pagination = resp.data.pagination;
                $scope.logs = resp.data.data;
            });
        };
        $scope.today = new Date();
        $scope.listManagerLoginLogs();
    }]);
    app.controller('clientLoginLogCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.pagination = {};
        $scope.today = new Date();
        $scope.listClientLoginLogs = function (page) {
            var params = angular.copy($scope.params) || {};
            params.page = page || $scope.pagination.page || 1;
            if (params.begin != null) {
                params.begin = $filter('date')(params.begin, 'yyyyMMdd');
            }
            if (params.end != null) {
                params.end = $filter('date')(params.end, 'yyyyMMdd');
            }
            $http.get('/sys_logs/sign_in/clients', {params: params}).then(function (resp) {
                $scope.pagination = resp.data.pagination;
                $scope.logs = resp.data.data;
            });
        };
        $scope.listClientLoginLogs();
    }]);
    app.controller('notifyLogCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.pagination = {};
        $scope.params = {date: new Date()};
        $scope.listNotifyLogs = function (page) {
            var params = angular.copy($scope.params) || {};
            params.page = page || $scope.pagination.page || 1;
            params.date = $filter('date')(params.date, 'yyyyMMdd');
            $http.get('/sys_logs/notify', {params: params}).then(function (resp) {
                $scope.notifyLogs = resp.data.data;
                $scope.pagination = resp.data.pagination;
            });
        };
        $scope.listNotifyLogs();
    }]);
    return app;
});