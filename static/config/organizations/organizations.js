/**
 * Created by yixian on 2016-10-18.
 */
define(['angular', 'uiRouter', 'uiBootstrap'], function (angular) {
    'use strict';

    var types = [{
        "label": "城市合伙人",
        "value": 0
    }, {
        "label": "推荐人",
        "value": 1
    }];
    var app = angular.module('organizations', ['ui.router', 'ui.bootstrap']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('organizations', {
            url: '/organizations',
            templateUrl: '/static/config/organizations/templates/orgs.html',
            controller: 'orgsCtrl'
        }).state('organizations.detail', {
            url: '/{orgId}/detail',
            templateUrl: '/static/config/organizations/templates/org_detail.html',
            controller: 'orgDetailCtrl',
            resolve: {
                org: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/orgs/' + $stateParams.orgId);
                }]
            }
        }).state('organizations.new', {
            url: '/new_org',
            templateUrl: '/static/config/organizations/templates/new_org.html',
            controller: 'newOrgCtrl'
        })
    }]);
    app.controller('orgsCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.listOrgs = function () {
            $http.get('/sys/orgs.json',{params:{detail:true}}).then(function (resp) {
                $scope.orgs = resp.data;
            })
        };
        $scope.listOrgs();
    }]);
    app.controller('orgDetailCtrl', ['$scope', '$http', '$state', 'Upload', '$uibModal','commonDialog', 'org', function ($scope, $http, $state, Upload,$uibModal,commonDialog, org) {
        $scope.types = angular.copy(types);
        $scope.org = angular.copy(org.data);
        $scope.uploadLogo = function (file) {
            if (file == null) {
                return;
            }
            $scope.logoProgress = {value: 0};
            Upload.upload({
                url: '/attachment/files',
                data: {file: file}
            }).then(function (resp) {
                delete $scope.logoProgress;
                $scope.org.logo = resp.data.url;
            }, function (resp) {
                delete $scope.logoProgress;
                commonDialog.alert({title: 'Upload Failed', content: resp.data.message, type: 'error'})
            }, function (evt) {
                $scope.logoProgress.value = parseInt(100 * evt.loaded / evt.total);
            })
        };
        $scope.update = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            $http.put('/sys/orgs/' + $scope.org.org_id, $scope.org).then(function () {
                commonDialog.alert({title: 'Succeed', content: 'Organization update succeeded', type: 'success'});
                $state.reload();
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        };

        $scope.toggleRateEditable = function () {
            if($scope.org.rate_editable==org.data.rate_editable){
                return;
            }
            $http.put('/sys/orgs/'+$scope.org.org_id+'/enable_change_rate',{enabled:$scope.org.rate_editable}).then(function () {

            },function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            })
        };

        $scope.search = {role:'1111111'};
        $scope.listManagers = function () {
            $http.get('/sys/manager_accounts',{params:{org_id:$scope.org.org_id}}).then(function (resp) {
                $scope.managers = resp.data;
            })
        };

        $scope.listManagers();
        $scope.modifyManager = function (manager) {
            $uibModal.open({
                templateUrl: '/static/config/managers/templates/modify.html',
                controller: 'modifyManagerCtrl',
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
                controller: 'newManagerCtrl',
                resolve: {
                    org: angular.copy($scope.org)
                }
            }).result.then(function () {
                $scope.listManagers();
            })
        }
    }]);
    app.controller('newOrgCtrl', ['$scope', '$http', '$state', 'Upload', 'commonDialog', function ($scope, $http, $state, Upload, commonDialog) {
        $scope.types = angular.copy(types);
        $scope.uploadLogo = function (file) {
            if (file == null) {
                return;
            }
            $scope.logoProgress = {value: 0};
            Upload.upload({
                url: '/attachment/files',
                data: {file: file}
            }).then(function (resp) {
                delete $scope.logoProgress;
                $scope.org.logo = resp.data.url;
            }, function (resp) {
                delete $scope.logoProgress;
                commonDialog.alert({title: 'Upload Failed', content: resp.data.message, type: 'error'})
            }, function (evt) {
                $scope.logoProgress.value = parseInt(100 * evt.loaded / evt.total);
            })
        };
        $scope.saveOrg = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            $http.post('/sys/orgs.json', $scope.org).then(function (resp) {
                commonDialog.alert({
                    title: 'Succeed',
                    content: 'Creation of new organization succeeded',
                    type: 'success'
                });
                $state.go('^.detail',{orgId:resp.data.org_id},{reload:true});
            },function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            })
        };
    }]);

    app.controller('modifyManagerCtrl', ['$scope', '$http', 'manager', function ($scope, $http, manager) {
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
    app.controller('newManagerCtrl', ['$scope', '$http','org',function ($scope, $http,org) {

        $scope.save = function (form) {
            $scope.manager.org_id = org.org_id;
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
    app.filter('org_types', function () {
        return function (value) {
            var typeLabel = '';
            angular.forEach(types, function (type) {
                if (type.value == value) {
                    typeLabel = type.label;
                }
            });
            return typeLabel;
        }
    });
    return app;
});