/**
 * alert
 * Created by yixian on 2016-01-20.
 */
define(['../app', 'angular'], function (app, angular) {
    'use strict';
    var defaultCfg = {
        size: null,
        backdrop: true,
        type: 'default'
    };
    app.factory('commonDialog', ['$q', '$uibModal', function ($q, $uibModal) {
        return {
            alert: function (cfg) {
                var choises = [{label: 'OK', className: 'btn-default', key: '1'}];
                var config = {
                    title: cfg.title,
                    content: cfg.content,
                    contentHtml: cfg.contentHtml,
                    backdrop: cfg.backdrop,
                    size: cfg.size,
                    choises: choises,
                    type: cfg.type
                };
                var defer = $q.defer();
                showModalDialog(config).then(function () {
                    defer.resolve();
                }, function () {
                    defer.resolve()
                });
                return defer.promise;
            },
            confirm: function (cfg) {
                var choises = [{label: 'OK', className: 'btn-success', key: '1'},
                    {label: 'Cancel', className: 'btn-danger', key: '2', dismiss: true}];
                var config = {
                    title: cfg.title,
                    content: cfg.content,
                    backdrop: cfg.backdrop,
                    size: cfg.size,
                    choises: cfg.choises || choises
                };
                var deferred = $q.defer();
                showModalDialog(config).then(function (choice) {
                    if (choice.dismiss) {
                        deferred.reject();
                    } else {
                        deferred.resolve(choice.key);
                    }
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            inputNum: function (cfg) {
                return $uibModal.open({
                    templateUrl: '/static/commons/templates/num_input.html',
                    size: 'sm',
                    resolve: {
                        cfg: function () {
                            return cfg;
                        }
                    },
                    controller: ['$scope', 'cfg', function ($scope, cfg) {
                        $scope.title = cfg.title || 'Input Amount';
                        $scope.data = {};
                        $scope.submit = function () {
                            $scope.$close($scope.data.num);
                        };
                    }]
                }).result;
            },
            inputText:function (cfg) {
                return $uibModal.open({
                    templateUrl:'/static/commons/templates/text_input.html',
                    size:'sm',
                    resolve:{
                        cfg:function () {
                            return cfg;
                        }
                    },
                    controller:['$scope','cfg',function ($scope, cfg) {
                        $scope.title = cfg.title || 'Input Amount';
                        $scope.data = {};
                        $scope.submit = function () {
                            $scope.$close($scope.data.text);
                        };
                    }]
                }).result;
            }
        };

        function showModalDialog(cfg) {
            cfg = angular.extend({}, defaultCfg, cfg);
            return $uibModal.open({
                templateUrl: 'static/commons/templates/dialog.html',
                controller: 'commonModalCtrl',
                size: cfg.size,
                backdrop: cfg.backdrop,
                resolve: {
                    cfg: function () {
                        return cfg;
                    }
                }
            }).result;
        }
    }]);
    app.controller('commonModalCtrl', ['$scope', '$timeout', 'cfg', function ($scope, $timeout, cfg) {
        var bgClasses = {
            success: 'bg-success',
            error: 'bg-warning',
            info: 'bg-info'
        };
        var glyIcons = {
            success: 'glyphicon-ok-circle',
            error: 'glyphicon-remove-circle',
            info: 'glyphicon-info-sign'
        };
        $scope.title = cfg.title;
        $scope.content = cfg.content;
        $scope.bgClass = bgClasses[cfg.type];
        $scope.glyIcon = glyIcons[cfg.type];
        $scope.choises = cfg.choises;
        if(cfg.type=='success'){
            $timeout(function () {
                $scope.$dismiss();
            },2000)
        }

        $scope.btnClick = function (choice) {
            $scope.$close(choice);
        }
    }])
});