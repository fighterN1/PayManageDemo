define(['angular', 'uiBootstrap', 'uiRouter', 'angularEcharts'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('transAnalysis', ['ui.bootstrap', 'ui.router', 'ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('transanalysis', {
            url: '/analysis/transaction',
            templateUrl: '/static/analysis/templates/trans_analysis.html',
            controller: 'transAnalysisCtrl'
        })
    }]);
    app.controller('transAnalysisCtrl', ['$scope', '$http', '$filter', '$timeout', 'commonDialog', 'chartParser',
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
                $http.get('/dashboard/system/trade_in_hours', {params: params}).then(function (resp) {
                    $scope.trans_hours_chart = chartParser.parse(trans_time_chart, resp.data);
                });
                $http.get('/analysis/customers/sys', {params: params}).then(function (resp) {
                    $scope.ordersHistory = chartParser.parse(ordersHistoryConfig, resp.data.reverse());
                    $scope.totalAmountHistory = chartParser.parse(totalAmountHistoryConfig, resp.data);
                });

            };
            $scope.chooseLast7Days();

            var trans_time_chart = {
                chart: {
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['合计交易金额', '合计交易量', '线下网关交易金额', '线下网关交易量',
                            '线下扫码交易金额', '线下扫码交易量', '商户静态码交易金额', '商户静态码交易量',
                            '线上网关交易金额', '线上网关交易量', 'JSAPI网关交易金额', 'JSAPI网关交易量'],
                        bottom: 0,
                        height: '15%',
                        width: '80%',
                        left: '10%'
                    },
                    grid: {
                        top: 10,
                        bottom: '15%',
                        containLabel: true
                    },
                    yAxis: [
                        {
                            name: '平均交易金额(AUD)',
                            type: 'value'
                        },
                        {
                            name: '平均交易量(笔)',
                            type: 'value'
                        }
                    ],
                    color: colors
                },
                xAxis: {
                    basic: {type: 'category', boundaryGap: false, formatter: '{value}:00'},
                    key: 'hour'
                },
                series: [
                    {
                        basic: {
                            name: '合计交易金额',
                            type: 'line',
                            symbol: 'triangle',
                            areaStyle: {normal: {}},
                            yAxisIndex: 0
                        },
                        column: {key: 'total_fee'}
                    },
                    {
                        basic: {
                            name: '合计交易量',
                            type: 'line',
                            yAxisIndex: 1
                        },
                        column: {key: 'total_count'}
                    },
                    {
                        basic: {
                            name: '线下网关交易金额',
                            type: 'line',
                            symbol: 'triangle',
                            areaStyle: {normal: {}},
                            yAxisIndex: 0
                        },
                        column: {key: 'offline_api_fee'}
                    },
                    {
                        basic: {
                            name: '线下网关交易量',
                            type: 'line',
                            yAxisIndex: 1
                        },
                        column: {key: 'offline_api_count'}
                    },
                    {
                        basic: {
                            name: '线下扫码交易金额',
                            type: 'line',
                            symbol: 'triangle',
                            areaStyle: {normal: {}},
                            yAxisIndex: 0
                        },
                        column: {key: 'offline_fee'}
                    },
                    {
                        basic: {
                            name: '线下扫码交易量',
                            type: 'line',
                            yAxisIndex: 1
                        },
                        column: {key: 'offline_count'}
                    },
                    {
                        basic: {
                            name: '商户静态码交易金额',
                            type: 'line',
                            symbol: 'triangle',
                            areaStyle: {normal: {}},
                            yAxisIndex: 0
                        },
                        column: {key: 'client_code_fee'}
                    },
                    {
                        basic: {
                            name: '商户静态码交易量',
                            type: 'line',
                            yAxisIndex: 1
                        },
                        column: {key: 'client_code_count'}
                    },
                    {
                        basic: {
                            name: '线上网关交易金额',
                            type: 'line',
                            symbol: 'triangle',
                            areaStyle: {normal: {}},
                            yAxisIndex: 0
                        },
                        column: {key: 'gateway_qrcode_fee'}
                    },
                    {
                        basic: {
                            name: '线上网关交易量',
                            type: 'line',
                            yAxisIndex: 1
                        },
                        column: {key: 'gateway_qrcode_count'}
                    },
                    {
                        basic: {
                            name: 'JSAPI网关交易金额',
                            type: 'line',
                            symbol: 'triangle',
                            areaStyle: {normal: {}},
                            yAxisIndex: 0
                        },
                        column: {key: 'gateway_jsapi_fee'}
                    },
                    {
                        basic: {
                            name: 'JSAPI网关交易量',
                            type: 'line',
                            yAxisIndex: 1
                        },
                        column: {key: 'gateway_jsapi_count'}
                    }
                ]
            };

            var ordersHistoryConfig = {
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
                        name: 'Orders',
                        min: 'auto'
                    },
                    color: colors
                },
                xAxis: {
                    basic: {
                        type: 'category',
                        boundaryGap: false
                    },
                    key: 'trade_date'
                },
                series: [
                    {
                        basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true, showSymbol: true},
                        column: {key: 'orders'}
                    }
                ]
            };

            var totalAmountHistoryConfig = {
                chart: {
                    tooltip: {
                        trigger: 'axis',
                        formatter: '{b}:{c} AUD'
                    },
                    toolbox: {
                        show: true,
                    },
                    yAxis: {
                        type: 'value',
                        name: 'Transaction Total Amount',
                        min: 'auto'
                    },
                    color: colors
                },
                xAxis: {
                    basic: {
                        type: 'category',
                        boundaryGap: false
                    },
                    key: 'trade_date'
                },
                series: [
                    {
                        basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true, showSymbol: true},
                        column: {key: 'total'}
                    }
                ]
            };
            
        }]);

    return app;
});