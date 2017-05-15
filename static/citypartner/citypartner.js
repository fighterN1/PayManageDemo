/**
 * Created by yixian on 2017-02-05.
 */
define(['angular'], function (angular) {
    'use strict';
    var app = angular.module('citypartner', ['ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('citypartner_reg', {
            url: '/citypartner_registries',
            templateUrl: '/static/citypartner/templates/citypartner_registers.html',
            controller: 'citypartnerRegisterListCtrl'
        })
    }]);
    app.controller('citypartnerRegisterListCtrl', ['$scope', '$http', 'commonDialog', function ($scope, $http, commonDialog) {
        $scope.pagination = {};
        $scope.listRegisters = function (page) {
            // page = page || $scope.pagination.page || 1;
            $http.get('/sys/citypartners').then(function (resp) {
                $scope.cityPartners = resp.data;
                // $scope.cityPartners = resp.data.data;
                // $scope.pagination = resp.data.pagination;
            })
        };
        $scope.listRegisters(1);

        $scope.handleRegister = function (registry) {
            commonDialog.confirm({
                title: 'Confirm',
                content: '操作无法撤销，确认继续？'
            }).then(function () {
                $http.put('/sys/citypartners/' + registry.partner_id + '/handle').then(function () {
                    commonDialog.alert({title: 'Success', content: '处理成功', type: 'success'});
                    $scope.listRegisters();
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                })
            })
        };
    }]);
    return app;
});