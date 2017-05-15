/**
 * Created by davep on 2016-07-27.
 */
define(['angular', 'uiRouter', 'uiBootstrap', 'angularEcharts'], function (angular) {
    'use strict';
    var industryMap = [
        {
            "label": "综合商城",
            "value": 336
        },
        {
            "label": "食品",
            "value": 335
        },
        {
            "label": "化妆品",
            "value": 334
        },
        {
            "label": "鞋包服饰",
            "value": 327
        },
        {
            "label": "酒店行业",
            "value": 328
        },
        {
            "label": "数码电器",
            "value": 332
        },
        {
            "label": "母婴",
            "value": 333
        },
        {
            "label": "文具/办公用品",
            "value": 337
        },
        {
            "label": "机票行业",
            "value": 339
        },
        {
            "label": "国际物流",
            "value": 330
        },
        {
            "label": "教育行业",
            "value": 329
        },
        {
            "label": "其它服务行业",
            "value": 331
        },
        {
            "label": "其它货物贸易行业",
            "value": 338
        }
    ];
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('partnerCardApp', ['ui.router', 'ui.bootstrap', 'ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('partner_card', {
            url: '/partnercard/{clientMoniker}',
            templateUrl: '/static/analysis/templates/partner_card.html',
            controller: 'partnerCardCtrl',
            resolve: {
                clientMoniker: ['$stateParams', function ($stateParams) {
                    return $stateParams.clientMoniker;
                }]
            }
        })
    }]);
    app.controller('partnerCardCtrl', ['$scope', '$http', '$filter', '$uibModal', 'chartParser', 'clearingDetailService', 'clientMoniker',
        function ($scope, $http, $filter, $uibModal, chartParser, clearingDetailService, clientMoniker) {
            $scope.industries = angular.copy(industryMap);
            $scope.params = {};
            $scope.pagination = {};
            $scope.login_pagination = {};
            $scope.loadDashboard = function () {
                loadBasicInfo();
                loadTransCommon();
                getOrderCustomerChartAnalysis();
                loadTradeAmountInTypes();
                getAvgOrderAndCustomer();
                loadTrandeInTime();

            };
            $scope.loadDashboard();
            function loadBasicInfo() {
                $http.get('/analysis/partner_card/' + clientMoniker + '/basic_info').then(function (resp) {
                    $scope.basicinfo = resp.data;
                    if ($scope.basicinfo.logo_url == null) {
                        $scope.basicinfo.logo_url = "/static/images/logo640x640.jpg";
                    }
                });
            }

            function loadTransCommon() {
                $http.get('/analysis/partner_card/' + clientMoniker + '/trans_common').then(function (resp) {
                    $scope.transcommon = resp.data;
                });
            }

            function getOrderCustomerChartAnalysis() {
                $http.get('/analysis/partner_card/' + clientMoniker + '/order_customer_chart').then(function (resp) {
                    var dates = [];
                    var new_customers = [];
                    var old_customers = [];
                    var total_amounts = [];
                    var orders = [];
                    resp.data.forEach(function (e) {
                        dates.push(e.date);
                        new_customers.push(e.new_customers);
                        old_customers.push(e.old_customers);
                        orders.push(e.orders);
                        total_amounts.push(e.total);
                    });
                    // $scope.ordersHistory = ordersHistoryConfig(dates,total_amounts,orders);
                    $scope.ordersHistory = chartParser.parse(ordersHistoryConfig, resp.data);
                    $scope.customersHistory = customersHistoryConfig(dates, old_customers, new_customers, orders);
                });
            }

            function getAvgOrderAndCustomer() {
                $http.get('/analysis/partner_card/' + clientMoniker + '/avg_order_customer').then(function (resp) {
                    $scope.avgOrderAndCustomer = resp.data;
                });
            }

            var ordersHistoryConfig = {
                chart: {
                    tooltip: {
                        trigger: 'axis',
                        formatter: '{b}:AUD {c}'
                    },
                    yAxis: {
                        type: 'value',
                        name: '交易金额(AUD)'
                    },
                    color: colors
                },
                xAxis: {
                    basic: {
                        type: 'category',
                        boundaryGap: false
                    },
                    key: 'date'
                },
                series: [
                    {
                        basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true},
                        column: {key: 'total'}
                    }
                ]
            };
            var customersHistoryConfig = function (date, old_customers, new_customers, orders) {
                return {
                    color: colors,
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        data: ['Old Customers', 'New Customers', 'Order Counts']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: date
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: 'Customers'
                        }, {
                            type: 'value',
                            name: 'Orders'
                        }
                    ],
                    series: [
                        {
                            name: 'Old Customers',
                            type: 'bar',
                            stack: 'customers',
                            data: old_customers
                        },
                        {
                            name: 'New Customers',
                            type: 'bar',
                            stack: 'customers',
                            data: new_customers
                        },
                        {
                            name: 'Order Counts',
                            type: 'line',
                            yAxisIndex: 1,
                            data: orders
                        }
                    ]
                };
            };

            function loadTradeAmountInTypes() {
                var tradeInTypeConfig = {
                    chart: {
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        color: colors
                    },
                    series: [{
                        basic: {
                            name: '交易渠道', type: 'pie', itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        },
                        column: {key: 'aud_fee', name: 'gateway_label'}
                    }]
                };
                $http.get('/analysis/partner_card/' + clientMoniker + '/trans_type_analysis').then(function (resp) {
                    $scope.trade_type_chart = chartParser.parse(tradeInTypeConfig, resp.data);
                });
            }

            function loadTrandeInTime() {
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
                            // width: '80%',
                            left: '5%'
                        },
                        grid: {
                            top: 10,
                            bottom: '15%',
                            left: '0',
                            right: '0',
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
                $http.get('/analysis/partner_card/' + clientMoniker + '/trade_in_hours').then(function (resp) {
                    $scope.trans_hours_chart = chartParser.parse(trans_time_chart, resp.data);
                });

            }


            $scope.loadSettlementLogs = function (page) {
                var params = angular.copy($scope.params);
                // if (params.datefrom) {
                //     params.datefrom = $filter('date')(params.datefrom, 'yyyyMMdd');
                // }
                // if (params.dateto) {
                //     params.dateto = $filter('date')(params.dateto, 'yyyyMMdd');
                // }
                params.page = page || $scope.pagination.page || 1;
                params.limit = 8;
                $http.get('/analysis/partner_card/' + clientMoniker + '/settlement_logs', {params: params}).then(function (resp) {
                    $scope.settlementLogs = resp.data.data;
                    $scope.pagination = resp.data.pagination;
                });
            };
            $scope.getClearingTransactions = function (client_id, clearData) {
                clearingDetailService.clientClearingDetail(client_id, clearData, false)
            };

            $scope.loadLoginLogs = function (page) {
                var params = angular.copy($scope.params) || {};
                params.page = page || $scope.login_pagination.page || 1;
                params.limit = 8;
                if (params.begin != null) {
                    params.begin = $filter('date')(params.begin, 'yyyyMMdd');
                }
                if (params.end != null) {
                    params.end = $filter('date')(params.end, 'yyyyMMdd');
                }
                $http.get('/analysis/partner_card/' + clientMoniker + '/login_logs', {params: params}).then(function (resp) {
                    $scope.login_pagination = resp.data.pagination;
                    $scope.loginLogs = resp.data.data;
                });
            }
            $scope.loadSettlementLogs(1);
            $scope.loadLoginLogs(1);


        }]);
    app.filter('partner_industry', function () {
        return function (industryCode) {
            var industryLabel = '';
            angular.forEach(industryMap, function (industry) {
                if (industry.value == industryCode) {
                    industryLabel = industry.label;
                }
            });
            return industryLabel;
        }
    });
    return app;
});