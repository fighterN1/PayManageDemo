/**
 * Created by yixian on 2016-07-06.
 */
define(['angular', 'uiRouter', 'uiBootstrap'], function (angular) {
    'use strict';
    var app = angular.module('managerApp', ['ui.router', 'ui.bootstrap']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('managers', {
            url: '/managers',
            templateUrl: '/static/config/managers/templates/managers.html',
            controller: 'managerListCtrl'
        })
    }]);
    app.controller('managerListCtrl', ['$scope', '$http', '$filter','$uibModal', 'commonDialog', function ($scope, $http,$filter, $uibModal, commonDialog) {
        $scope.search = {role:'1111111'};
        $scope.listManagers = function () {
            $http.get('/sys/manager_accounts.json').then(function (resp) {
                $scope.managers = resp.data;
            })
        };
        if($filter('withRole')('1')){
            $scope.listOrgs = function () {
                $http.get('/sys/orgs.json',{params:{detail:true}}).then(function (resp) {
                    $scope.orgs = resp.data;
                })
            };
            $scope.listOrgs();
        }


        $scope.listManagers();
        $scope.modifyManager = function (manager) {
            $uibModal.open({
                templateUrl: '/static/config/managers/templates/modify.html',
                controller: 'modifyManagerDialogCtrl',
                resolve: {
                    manager: function () {
                        return angular.copy(manager);
                    }
                }
            }).result.then(function () {
                $scope.listManagers();
            })
        };
        $scope.disableManager = function (manager) {
            commonDialog.confirm({
                title: 'Confirm!',
                content: 'You are setting manager ' + manager.display_name + ' disabled.Are you sure?'
            }).then(function () {
                $http.delete('/sys/manager_accounts/' + manager.manager_id).then(function () {
                    $scope.listManagers();
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                })
            })
        };
        $scope.newManager = function () {
            $uibModal.open({
                templateUrl: '/static/config/managers/templates/new_manager.html',
                controller: 'newManagerDialogCtrl'
            }).result.then(function () {
                $scope.listManagers();
            })
        }
    }]);
    app.controller('modifyManagerDialogCtrl', ['$scope', '$http', 'manager', function ($scope, $http, manager) {
        $scope.manager = manager;
        $scope.modify = function () {
            $scope.errmsg = null;
            $http.put('/sys/manager_accounts/' + manager.manager_id, $scope.manager).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        };
        $scope.loadOrgs = function () {
            $http.get('/sys/orgs.json').then(function (resp) {
                $scope.orgs = resp.data;
            })
        };
        $scope.loadOrgs();
    }]);
    app.controller('newManagerDialogCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.save = function (form) {
            $scope.errmsg = null;
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            $http.post('/sys/manager_accounts.json', $scope.manager).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        };
        $scope.loadOrgs = function () {
            $http.get('/sys/orgs.json').then(function (resp) {
                $scope.orgs = resp.data;
            })
        };
        $scope.loadOrgs();
    }]);
    app.filter('managersFilter', [function () {
        return function (arr, filterObj) {
            if (arr == null || filterObj == null) {
                return arr;
            }
            return arr.filter(function (item) {
                return (filterObj.username==null || item.username.indexOf(filterObj.username) >= 0) && (item.role & parseInt(filterObj.role, 2)) > 0 && (!filterObj.org_id || item.org_id==filterObj.org_id)
            })
        }
    }]);
    return app;
});