/**
 * Created by yixian on 2016-07-02.
 */
define(['angular', 'uiBootstrap', 'uiRouter'], function (angular) {
    'use strict';
    var app = angular.module('tradeLogManageApp', ['ui.bootstrap', 'ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('trade', {
            url: '/trade',
            templateUrl: '/static/payment/tradelog/templates/trade_logs.html',
            controller: 'globalTradeLogCtrl'
        })
    }]);
    app.controller('globalTradeLogCtrl', ['$scope', '$http', '$filter', 'commonDialog', 'refunder', 'orderService',
        function ($scope, $http, $filter, commonDialog, refunder, orderService) {
            $scope.params = {status: 'PAID', textType: 'all', datefrom: new Date(), dateto: new Date()};
            $scope.pagination = {};
            $scope.today = new Date();
            $scope.chooseToday = function () {
                $scope.params.datefrom = $scope.params.dateto = new Date();
                $scope.loadTradeLogs(1);
            };
            $scope.chooseYesterday = function () {
                var yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                $scope.params.datefrom = $scope.params.dateto = yesterday;
                $scope.loadTradeLogs(1);
            };
            $scope.chooseLast7Days = function () {
                $scope.params.dateto = new Date();
                var day = new Date();
                day.setDate(day.getDate() - 7);
                $scope.params.datefrom = day;
                $scope.loadTradeLogs(1);
            };
            $scope.thisMonth = function () {
                $scope.params.dateto = new Date();
                var monthBegin = new Date();
                monthBegin.setDate(1);
                $scope.params.datefrom = monthBegin;
                $scope.loadTradeLogs(1);
            };
            $scope.lastMonth = function () {
                var monthFinish = new Date();
                monthFinish.setDate(0);
                $scope.params.dateto = monthFinish;
                var monthBegin = new Date();
                monthBegin.setDate(0);
                monthBegin.setDate(1);
                $scope.params.datefrom = monthBegin;
                $scope.loadTradeLogs(1);
            };
            $scope.loadTradeLogs = function (page) {
                var params = angular.copy($scope.params);
                if (params.datefrom) {
                    params.datefrom = $filter('date')(params.datefrom, 'yyyyMMdd');
                }
                if (params.dateto) {
                    params.dateto = $filter('date')(params.dateto, 'yyyyMMdd');
                }
                params.page = page || $scope.pagination.page || 1;
                $http.get('/sys/trade_logs', {params: params}).then(function (resp) {
                    $scope.tradeLogs = resp.data.data;
                    $scope.pagination = resp.data.pagination;
                    $scope.analysis = resp.data.analysis;
                });
            };

            $scope.gatewaySelected = function (arr) {
                return $scope.params.gateway != null && $scope.params.gateway.filter(function (gateway) {
                        return arr.indexOf(gateway) >= 0
                    }).length > 0
            };
            $scope.showTradeDetail = function (order) {
                orderService.managerOrderDetail(order)
            };
            $scope.loadTradeLogs(1);
            $scope.showRefundLog = function (orderId) {
                refunder.refunded(orderId);
            };
            $scope.newRefund = function (orderId) {
                refunder.refund(orderId);
            };
            $scope.confirmOrders = function () {
                $http.put('/sys/trade_logs/confirm').then(function () {
                    $scope.loadTradeLogs();
                });
                commonDialog.alert({title: 'Success', content: 'Request Has bean send'})
            };
            $scope.$on('order_refunded', function () {
                $scope.loadTradeLogs();
            });
        }
    ]);
    return app;
});