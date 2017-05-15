define(['angular', 'static/commons/commons', 'uiBootstrap', 'uiRouter', 'ngBootSwitch', 'ngFileUpload','uiSelect'], function (angular) {
    'use strict';
    
    var app = angular.module('unregister_accounts', ['ui.bootstrap', 'ui.router', 'frapontillo.bootstrap-switch', 'ngFileUpload','ui.select']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('client_unregister', {
            url: '/unregister_accounts',
            templateUrl: '/static/application/templates/apply_unregisters.html',
            controller: 'unRegisterAccountsCtrl'
        })
    }]);
    app.controller('unRegisterAccountsCtrl', ['$scope','$state', '$http','$uibModal','commonDialog', function ($scope,$state, $http,$uibModal,commonDialog) {
        
        $scope.loadAccounts = function () {
            $http.get('/sys/partners/unregister').then(function (resp) {
                $scope.accounts = resp.data;
            });
        };
        
        $scope.loadAccounts();
    }]);
    return app;
});