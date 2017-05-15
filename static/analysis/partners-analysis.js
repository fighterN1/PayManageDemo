define(['angular', 'uiBootstrap', 'uiRouter', 'angularEcharts'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('partnersAnalysis', ['ui.bootstrap', 'ui.router', 'ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('partners_analysis', {
            url: '/analysis/partners',
            templateUrl: '/static/analysis/templates/partners_analysis.html',
            controller: 'partnersAnalysisCtrl'
        })
    }]);
    app.controller('partnersAnalysisCtrl', ['$scope', '$http', '$filter', '$timeout', 'commonDialog', 'chartParser',
        function ($scope, $http, $filter, $timeout, commonDialog, chartParser) {
            $scope.params = {};
            $scope.today = new Date();
            $scope.chooseToday = function () {
                $scope.params.begin = $scope.params.end = new Date();
                $scope.doAnalysis(1);
            };
            $scope.chooseYesterday = function () {
                var yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                $scope.params.begin = $scope.params.end = yesterday;
                $scope.doAnalysis(1);
            };
            $scope.chooseLast7Days = function () {
                $scope.params.end = new Date();
                var day = new Date();
                day.setDate(day.getDate() - 7);
                $scope.params.begin = day;
                $scope.doAnalysis(1);
            };
            $scope.thisMonth = function () {
                $scope.params.end = new Date();
                var monthBegin = new Date();
                monthBegin.setDate(1);
                $scope.params.begin = monthBegin;
                $scope.doAnalysis(1);
            };
            $scope.lastMonth = function () {
                var monthFinish = new Date();
                monthFinish.setDate(0);
                $scope.params.end = monthFinish;
                var monthBegin = new Date();
                monthBegin.setDate(0);
                monthBegin.setDate(1);
                $scope.params.begin = monthBegin;
                $scope.doAnalysis(1);
            };
            $scope.thisYear = function () {
                var yearFinish = new Date();
                $scope.params.end = yearFinish;
                var currentYearFirstDate = new Date(new Date().getFullYear(), 0, 1);
                $scope.params.begin = currentYearFirstDate;
                $scope.doAnalysis(1);
            };
            $scope.doAnalysis = function () {

                var params = angular.copy($scope.params);
                if (params.begin) {
                    params.begin = $filter('date')(params.begin, 'yyyyMMdd');
                } else {
                    params.begin = $filter('date')(new Date(), 'yyyyMMdd');
                }
                if (params.end) {
                    params.end = $filter('date')(params.end, 'yyyyMMdd');
                } else {
                    params.end = $filter('date')(new Date(), 'yyyyMMdd');
                }
                $http.get('/analysis/partners/new', {params: params}).then(function (resp) {
                    $scope.newPartnersHistory = chartParser.parse(newPartnersHistoryConfig, resp.data);
                });
                $http.get('/analysis/partners/trade', {params: params}).then(function (resp) {
                    $scope.tradePartnersHistory = chartParser.parse(tradePartnersHistoryConfig, resp.data);
                });
            };
            $scope.chooseLast7Days();

            var newPartnersHistoryConfig = {
                chart: {
                    tooltip: {
                        trigger: 'axis',
                        formatter: '{b}:{c}'
                    },
                    toolbox: {
                        show: true,
                    },
                    yAxis: {
                        type: 'value',
                        name: '新增商户数',
                        min: 'auto'
                    },
                    color: colors
                },
                xAxis: {
                    basic: {
                        type: 'category',
                        boundaryGap: false
                    },
                    key: 'datelist'
                },
                series: [
                    {
                        basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true, showSymbol: true},
                        column: {key: 'num'}
                    }
                ]
            };

         
            var tradePartnersHistoryConfig = {
                chart: {
                    tooltip: {
                        trigger: 'axis',
                        formatter: '{b}:{c}'
                    },
                    toolbox: {
                        show: true,
                    },
                    yAxis: {
                        type: 'value',
                        name: '交易商户数',
                        min: 'auto'
                    },
                    color: colors
                },
                xAxis: {
                    basic: {
                        type: 'category',
                        boundaryGap: false
                    },
                    key: 'datelist'
                },
                series: [
                    {
                        basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true, showSymbol: true},
                        column: {key: 'num'}
                    }
                ]
            };


        }]);

    return app;
});