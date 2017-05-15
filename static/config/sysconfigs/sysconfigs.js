/**
 * Created by yixian on 2017-01-07.
 */
define(['angular', 'uiRouter'], function (angular) {
    'use strict';
    var app = angular.module('sysconfig', ['ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('sysconfig', {
            url: '/sysconfig',
            templateUrl: '/static/config/sysconfigs/templates/sysconfig.html',
            controller: 'sysConfigCtrl'
        }).state('sysconfig.basic_config', {
            url: '/basic',
            templateUrl: '/static/config/sysconfigs/templates/basic.html',
            controller: 'basicConfigCtrl'
        }).state('sysconfig.permission', {
            url: '/permission',
            templateUrl: '/static/config/sysconfigs/templates/permission_config.html',
            controller: 'permissionConfigRootCtrl'
        }).state('sysconfig.permission.functions', {
            url: '/functions',
            templateUrl: '/static/config/sysconfigs/templates/permission_functions.html',
            controller: 'permissionFuncCtrl',
            resolve: {
                functions: ['$http', function ($http) {
                    return $http.get('/sys/permission/functions')
                }],
                modules: ['$http', function ($http) {
                    return $http.get('/sys/permission/modules')
                }]
            }
        }).state('sysconfig.permission.modules', {
            url: '/modules',
            templateUrl: '/static/config/sysconfigs/templates/permission_modules.html',
            controller: 'permissionModuleCtrl',
            resolve: {
                modules: ['$http', function ($http) {
                    return $http.get('/sys/permission/modules')
                }]
            }
        })
    }]);
    app.controller('sysConfigCtrl', ['$scope', function ($scope) {

    }]);
    app.controller('basicConfigCtrl', ['$scope', '$http', 'commonDialog', function ($scope, $http, commonDialog) {
        $scope.loadSysConfigs = function () {
            $http.get('/sysconfig/base').then(function (resp) {
                $scope.sysconfig = resp.data;
            })
        };
        $scope.loadSysConfigs();
        $scope.saveProperties = function () {
            $http.put('/sysconfig/base', $scope.sysconfig).then(function () {
                commonDialog.alert({title: 'Success', content: 'Properties updated.', type: 'success'})
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        }
    }]);

    app.controller('permissionConfigRootCtrl', ['$scope', '$http', '$uibModal', function ($scope, $http, $uibModal) {
        $scope.authorizeRole = function (roleMask) {
            $uibModal.open({
                templateUrl: '/static/config/sysconfigs/templates/permission_authorize_dialog.html',
                controller: 'permissionAuthorizeDialogCtrl',
                size: 'lg',
                resolve: {
                    authorized: ['$http', function ($http) {
                        return $http.get('/sys/permission/roles/' + roleMask + '/functions');
                    }],
                    modules: ['$http', function ($http) {
                        return $http.get('/sys/permission/functions');
                    }],
                    role: function () {
                        return roleMask
                    }
                }
            });
        }
    }]);
    app.controller('permissionAuthorizeDialogCtrl', ['$scope', '$http', 'authorized', 'modules', 'role',
        function ($scope, $http, authorized, modules, role) {
            $scope.authorized = authorized.data;
            $scope.modules = modules.data;
            $scope.submitAuthorize = function () {
                $scope.errmsg = null;
                $http.put('/sys/permission/roles/' + role + '/functions', $scope.authorized).then(function () {
                    $scope.$close();
                }, function (resp) {
                    $scope.errmsg = resp.data.message;
                })
            };
            $scope.toggleAuthorize = function (func) {
                var idx = $scope.authorized.indexOf(func.func_id);
                if (idx >= 0) {
                    $scope.authorized.splice(idx, 1);
                } else {
                    $scope.authorized.push(func.func_id);
                }
            }
        }]
    );
    app.controller('permissionFuncCtrl', ['$scope', '$http', '$state', '$uibModal', 'commonDialog', 'functions', 'modules',
        function ($scope, $http, $state, $uibModal, commonDialog, functions, modules) {
            $scope.modFunctions = functions.data;
            $scope.modules = modules.data;
            $scope.syncFunctions = function () {
                $http.post('/sys/permission/synchronize').then(function () {
                    $state.reload();
                })
            };
            $scope.moveFunction = function (func) {
                $uibModal.open({
                    templateUrl: '/static/config/sysconfigs/templates/permission_choose_module.html',
                    controller: 'permissionChooseModuleDialogCtrl',
                    resolve: {
                        modules: function () {
                            return $scope.modules;
                        }
                    }
                }).result.then(function (modName) {
                    $http.put('/sys/permission/functions/' + func.func_id + '/modules', {module_name: modName}).then(function () {
                        $state.reload();
                    }, function (resp) {
                        commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                    })
                })
            };
            $scope.editFunctionInfo = function (func) {
                $uibModal.open({
                    templateUrl: '/static/config/sysconfigs/templates/func_info_edit.html',
                    controller: 'permissionFuncEditDialogCtrl',
                    resolve: {
                        func: function () {
                            return angular.copy(func);
                        }
                    }
                }).result.then(function () {
                    $state.reload();
                })
            }
        }]
    );
    app.controller('permissionChooseModuleDialogCtrl', ['$scope', '$http', 'modules', function ($scope, $http, modules) {
        $scope.modules = modules;
        $scope.chooseModule = function (mod) {
            $scope.$close(mod.module_name);
        }
    }]);
    app.controller('permissionFuncEditDialogCtrl', ['$scope', '$http', 'func', function ($scope, $http, func) {
        $scope.func = func;
        $scope.modifyFunction = function () {
            $scope.errmsg = null;
            $http.put('/sys/permission/functions/' + func.func_id + '.end', $scope.func).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        };
    }]);
    app.controller('permissionModuleCtrl', ['$scope', '$http', '$state', '$uibModal', 'commonDialog', 'modules',
        function ($scope, $http, $state, $uibModal, commonDialog, modules) {
            $scope.modules = modules.data;
            $scope.newModule = function () {
                $uibModal.open({
                    templateUrl: '/static/config/sysconfigs/templates/permission_module_dialog.html',
                    controller: 'moduleEditCtrl',
                    resolve: {
                        module: function () {
                            return {};
                        }
                    }
                }).result.then(function () {
                    $state.reload();
                })
            };
            $scope.editModule = function (mod) {
                $uibModal.open({
                    templateUrl: '/static/config/sysconfigs/templates/permission_module_dialog.html',
                    controller: 'moduleEditCtrl',
                    resolve: {
                        module: function () {
                            return mod;
                        }
                    }
                }).result.then(function () {
                    $state.reload();
                })
            };
            $scope.deleteModule = function (mod) {
                commonDialog.confirm({
                    title: 'Warning',
                    content: 'You are deleting an exists module. Confirm?'
                }).then(function () {
                    $http.delete('/sys/permission/modules/' + mod.module_name + '.end').then(function () {
                        $state.reload();
                    }, function (resp) {
                        commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                    })
                });
            }
        }]
    );
    app.controller('moduleEditCtrl', ['$scope', '$http', 'module', function ($scope, $http, module) {
        $scope.module = angular.copy(module);
        $scope.nameEditable = !module.module_name;
        $scope.save = function () {
            $scope.errmsg = null;
            $http.put('/sys/permission/modules/' + $scope.module.module_name + '.end', $scope.module).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        };
    }]);
    return app;
});