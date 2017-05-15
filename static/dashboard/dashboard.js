/**
 * Created by davep on 2016-07-27.
 */
define(['angular', 'uiRouter', 'uiBootstrap', 'angularEcharts'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('dashboardApp', ['ui.router', 'ui.bootstrap', 'ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/dashboard',
            templateUrl: '/static/dashboard/templates/dashboard.html',
            controller: 'dashboardCtrl'
        }).state('dashboard.gateway', {
            url: '/gateway',
            templateUrl: '/static/dashboard/templates/dashboard_gateway.html',
            controller: 'gatewayDashboardCtrl'
        })
    }]);
    app.controller('dashboardCtrl', ['$scope', '$http', '$filter', '$uibModal', 'chartParser', function ($scope, $http, $filter, $uibModal, chartParser) {
        $scope.scales = [
            {
                key: 'today',
                label: '今日',
                params: function () {
                    return {
                        begin: $filter('date')(new Date(), 'yyyyMMdd'),
                        end: $filter('date')(new Date(), 'yyyyMMdd')
                    }
                }
            },
            {
                key: 'yesterday',
                label: '昨日',
                params: function () {
                    var date = new Date();
                    date = date.setDate(date.getDate() - 1);
                    return {
                        begin: $filter('date')(date, 'yyyyMMdd'),
                        end: $filter('date')(date, 'yyyyMMdd')
                    }
                }
            },
            {
                key: 'seven',
                label: '近7日',
                params: function () {
                    var date = new Date();
                    var end = $filter('date')(date, 'yyyyMMdd');
                    date = date.setDate(date.getDate() - 6);
                    return {
                        begin: $filter('date')(date, 'yyyyMMdd'),
                        end: end
                    }
                }
            },
            {
                key: 'month',
                label: '本月',
                params: function () {
                    var date = new Date();
                    var end = $filter('date')(date, 'yyyyMMdd');
                    date = date.setDate(1);
                    return {
                        begin: $filter('date')(date, 'yyyyMMdd'),
                        end: end
                    }
                }
            }
        ];
        $scope.switchScale = function (scale) {
            $scope.currentScale = scale;
            $scope.loadDashboard();
        };

        $scope.chart_config = {};
        $scope.analysis = {};

        $scope.loadDashboard = function () {
            loadAnalysis();
            loadTradeAmountInTypes();
            loadTradePartnersInTypes();
            loadTopPartners();
            loadTradeTimeAnalysis();
        };

        $scope.switchScale($scope.scales[0]);
        loadExchangeRate();
        $scope.displayExchangeRateHistory = function () {
            $uibModal.open({
                templateUrl: '/static/dashboard/templates/exchange_rate_history_dialog.html',
                controller: 'exchangeRateHistoryDialogCtrl',
                size: 'lg'
            })
        };

        function loadExchangeRate() {
            var params = {begin: $filter('date')(new Date(), 'yyyyMMdd'), end: $filter('date')(new Date(), 'yyyyMMdd')};
            $http.get('/dashboard/system/exchange_rates', {params: params}).then(function (resp) {
                $scope.analysis.exchange_rate = resp.data[0].exchange_rate;
            })
        }

        function loadAnalysis() {
            $http.get('/dashboard/system/common_analysis_1.json', {params: $scope.currentScale.params()}).then(function (resp) {
                $scope.analysis.new_partners = resp.data.new_partners;
                $scope.analysis.total_partners = resp.data.total_partners;
                $scope.analysis.traded_partners = resp.data.traded_partners;
                $scope.analysis.trade_amount = resp.data.trade_amount;
                // $scope.analysis.top_amount_order = resp.data.top_amount_order;
                // $scope.analysis.trade_count = resp.data.trade_count;
                // $scope.analysis.total_customers = resp.data.total_customers;
                // $scope.analysis.new_customers = resp.data.total_customers-resp.data.old_customers;
                // $scope.analysis.old_customers = resp.data.old_customers;
            });
            $http.get('/dashboard/system/common_analysis_2.json', {params: $scope.currentScale.params()}).then(function (resp) {
                // $scope.analysis.new_partners = resp.data.new_partners;
                // $scope.analysis.total_partners = resp.data.total_partners;
                // $scope.analysis.traded_partners = resp.data.traded_partners;
                // $scope.analysis.trade_amount = resp.data.trade_amount;
                $scope.analysis.top_amount_order = resp.data.top_amount_order;
                $scope.analysis.trade_count = resp.data.trade_count;
                $scope.analysis.total_customers = resp.data.total_customers;
                $scope.analysis.new_customers = resp.data.total_customers - resp.data.old_customers;
                $scope.analysis.old_customers = resp.data.old_customers;
            });
        }

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
            $http.get('/dashboard/system/trade_in_types.json', {params: $scope.currentScale.params()}).then(function (resp) {
                $scope.analysis.trade_type_chart = chartParser.parse(tradeInTypeConfig, resp.data);
            });
        }

        function loadTradePartnersInTypes() {
            var tradePartnersInTypeConfig = {
                chart: {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    color: colors
                },
                series: [{
                    basic: {
                        name: '交易渠道', type: 'pie',
                        radius: ['40%', '70%'],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    },
                    column: {key: 'partner_count', name: 'gateway_label'}
                }]
            };
            $http.get('/dashboard/system/partners_in_types.json', {params: $scope.currentScale.params()}).then(function (resp) {
                $scope.analysis.partners_type_chart = chartParser.parse(tradePartnersInTypeConfig, resp.data);
            });
        }

        function loadTopPartners() {
            var params = $scope.currentScale.params();
            params.limit = 10;
            var topPartnerConfig = {
                chart: {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: '{b}:AUD {c}'
                    },
                    xAxis: {
                        type: 'value'
                    }
                },
                yAxis: {
                    basic: {
                        type: 'category',
                        axisLabel: {inside: true, textStyle: {fontSize: 18, fontWeight: 'bold'}},
                        position: 'left',
                        z: 10
                    },
                    key: 'short_name'
                },

                series: [{
                    basic: {
                        type: 'bar', label: {
                            normal: {
                                position: 'left', show: true, formatter: function (params) {
                                    return $filter('currency')(params.value, '')
                                }
                            }
                        }
                    },
                    column: {
                        key: 'aud_fee',
                        color: function (idx) {
                            return colors[idx % colors.length]
                        }
                    }
                }]
            };
            $http.get('/dashboard/system/top_trade_partners.json', {params: params}).then(function (resp) {
                $scope.analysis.top_partners = chartParser.parse(topPartnerConfig, resp.data.reverse());
            })
        }

        function loadTradeTimeAnalysis() {
            var timeAnalysis = function (legend, series) {
                return {
                    // title : {
                    //     text : '时间坐标交易分布情况'
                    // },
                    color: colors,
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            show: true,
                            type: 'cross',
                            lineStyle: {
                                type: 'dashed',
                                width: 1
                            }
                        }
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    dataZoom: {
                        show: true,
                        start: 70,
                        end: 100
                    },
                    legend: {
                        data: legend
                    },
                    // dataRange: {
                    //     min: 0,
                    //     max: 10000,
                    //     orient: 'horizontal',
                    //     y: 30,
                    //     x: 'center',
                    //     //text:['高','低'],           // 文本，默认为数值文本
                    //     color: ['green', 'orange'],
                    //     splitNumber: 5
                    // },
                    grid: {
                        y2: 80
                    },
                    xAxis: [
                        {
                            type: 'time',
                            splitNumber: 24
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    animation: false,
                    series: series
                }
            };


            $http.get('/dashboard/system/trade_in_time.json', {params: $scope.currentScale.params()}).then(function (resp) {
                var series = resp.data;
                var leg = [];
                series.forEach(function (e) {
                    leg.push(e.name);
                    e.type = 'scatter';
                    e.itemStyle = {
                        normal: {
                            opacity: 0.8,
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                            // label:{
                            //     show:true,
                            //     position:'top',
                            //     formatter: function (params) {
                            //         return params.value[2]
                            //     },
                            //     labelLine:{show:true}
                            // }
                        }
                    };
                    e.tooltip = {
                        trigger: 'axis',
                        formatter: function (params) {
                            var date = new Date(params.value[0]);
                            return params.seriesName + ' - '
                                + params.value[2]
                                + '<br/>'
                                + params.value[1]
                                + ' AUD'
                                + ' （'
                                + date.getFullYear() + '-'
                                + (date.getMonth() + 1) + '-'
                                + date.getDate() + ' '
                                + date.getHours() + ':'
                                + date.getMinutes() + ')'
                        },
                        axisPointer: {
                            type: 'cross',
                            lineStyle: {
                                type: 'dashed',
                                width: 1
                            }
                        }
                    };
                    e.symbolSize = function (value) {
                        return value[1] / 20;
                    };
                    var orders = angular.copy(e.data);
                    e.data = (function () {
                        var d = [];
                        var len = 0;
                        var now = new Date();
                        var value;
                        for (var i = 0; i < orders.length; i++) {
                            if (orders[i].create_time) {
                                d.push([new Date(orders[i].create_time.replace(/-/g, "/")), orders[i].order_total, orders[i].short_name])
                            }
                        }
                        return d;
                    })();

                });
                $scope.analysis.trade_time = timeAnalysis(leg, series);
            })
        }

        function loadFeeAnalysis(params) {
            var analysisConfig = {
                chart: {
                    tooltip: {
                        trigger: 'axis',
                        formatter: '{b}:AUD {c}'
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mySeven: {
                                title: '最近7天',
                                show: true,
                                icon: 'path://M3.59-4.07L32.38-4.07L32.38 0.04Q22.25 25.11 17.19 46.34L10.65 46.34Q16.14 26.94 26.19 1.41L3.59 1.41L3.59-4.07Z',
                                onclick: function () {
                                    loadFeeAnalysis($scope.scales[2].params())
                                }
                            },
                            myThirty: {
                                title: '最近30天',
                                show: true,
                                icon: 'path://M12.52 17.02L16.10 17.02Q20.71 17.02 22.43 15.72Q25.66 13.23 25.66 8.23Q25.66-0.63 17.61-0.63Q10.93-0.63 9.42 6.93L3.73 6.93Q4.50 2.19 7.03-0.91Q10.90-5.51 17.61-5.51Q23.24-5.51 26.89-2.28Q31.22 1.52 31.22 8.02Q31.22 16.78 23.38 19.48Q32.84 23.14 32.84 32.81Q32.84 39.00 29.32 42.97Q25.10 47.79 17.72 47.79Q10.79 47.79 6.68 43.04Q3.66 39.56 3.02 33.44L8.93 33.44Q9.67 42.83 17.72 42.83Q21.45 42.83 23.98 40.72Q27.14 38.01 27.14 32.81Q27.14 21.63 16.10 21.63L12.52 21.63L12.52 17.02ZM54-5.51Q67.99-5.51 67.99 21.14Q67.99 47.79 54 47.79Q40.04 47.79 40.04 21.14Q40.04-5.51 54-5.51M46.97 33.65L59.84 4.30Q57.80-0.55 53.93-0.55Q45.95-0.55 45.95 21.14Q45.95 28.52 46.97 33.65M48.16 37.91Q50.13 42.83 54 42.83Q62.09 42.83 62.09 21.07Q62.09 13.86 61.07 8.66L48.16 37.91Z',
                                onclick: function () {
                                    var params = {};
                                    var dt = new Date();
                                    params.end = $filter('date')(dt, 'yyyyMMdd');
                                    dt.setDate(dt.getDate() - 29);
                                    params.begin = $filter('date')(dt, 'yyyyMMdd');
                                    loadFeeAnalysis(params)
                                }
                            }
                        }
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
                    key: 'date_str'
                },
                series: [
                    {
                        basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true},
                        column: {key: 'aud_fee'}
                    }
                ]
            };
            $http.get('/dashboard/system/fee_analysis', {params: params}).then(function (resp) {
                $scope.analysis.trade_line = chartParser.parse(analysisConfig, resp.data);
            })
        }

        loadFeeAnalysis($scope.scales[2].params())

        function getMaxRecord() {
            if ($scope.currentUser.org_id == null) {
                $http.get('/dashboard/system/max_record.json').then(function (resp) {
                    $scope.max_amount = resp.data.max_amount.total;
                    $scope.max_orders = resp.data.max_orders.orders;
                    $scope.max_transaction_partners = resp.data.max_transaction_partners.partners;
                })
            }
        }
        getMaxRecord();

    }]);

    app.controller('gatewayDashboardCtrl', ['$scope', '$http', '$filter', 'chartParser', function ($scope, $http, $filter, chartParser) {
        $scope.params = {};
        $scope.today = new Date();
        $scope.chooseToday = function () {
            $scope.params.begin = $scope.params.end = new Date();
            $scope.loadTradePartnersInTypes();
        };
        $scope.chooseYesterday = function () {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            $scope.params.begin = $scope.params.end = yesterday;
            $scope.loadTradePartnersInTypes();
        };
        $scope.chooseLast7Days = function () {
            $scope.params.end = new Date();
            var day = new Date();
            day.setDate(day.getDate() - 7);
            $scope.params.begin = day;
            $scope.loadTradePartnersInTypes();
        };
        $scope.thisMonth = function () {
            $scope.params.end = new Date();
            var monthBegin = new Date();
            monthBegin.setDate(1);
            $scope.params.begin = monthBegin;
            $scope.loadTradePartnersInTypes();
        };
        $scope.lastMonth = function () {
            var monthFinish = new Date();
            monthFinish.setDate(0);
            $scope.params.end = monthFinish;
            var monthBegin = new Date();
            monthBegin.setDate(0);
            monthBegin.setDate(1);
            $scope.params.begin = monthBegin;
            $scope.loadTradePartnersInTypes();
        };
        $scope.thisYear = function () {
            var yearFinish = new Date();
            $scope.params.end = yearFinish;
            var currentYearFirstDate = new Date(new Date().getFullYear(), 0, 1);
            $scope.params.begin = currentYearFirstDate;
            $scope.loadTradePartnersInTypes();
        };
        //$scope.params={'begin':'20160101','end':$filter('date')(new Date(), 'yyyyMMdd')};
        $scope.loadTradePartnersInTypes = function () {

            var params = angular.copy($scope.params);
            if (params.begin) {
                params.begin = $filter('date')(params.begin, 'yyyyMMdd');
            } else {
                params.begin = $filter('date')('2016-01-01', 'yyyyMMdd');
            }
            if (params.end) {
                //var curDate = new Date();
                //params.end = $filter('date')(new Date(curDate.setDate(params.end.getDate()+1)), 'yyyyMMdd');
                params.end = $filter('date')(params.end, 'yyyyMMdd');
            } else {
                //var curDate = new Date();
                //params.end = $filter('date')(new Date(curDate.setDate(curDate.getDate()+1)), 'yyyyMMdd');
                params.end = $filter('date')(new Date(), 'yyyyMMdd');
            }

            $http.get('/dashboard/system/partners_in_types.json', {params: params}).then(function (resp) {
                $scope.gatewayPartners = resp.data;
                $scope.legends = [];
                for (var i = 0; i < resp.data.length; i++) {
                    $scope.legends[i] = resp.data[i].gateway_label;
                }
                var legend = $scope.legends;
                console.log($scope.legends);
                $scope.partners_type_chart = chartParser.parse(tradePartnersInTypeConfig(legend), $scope.gatewayPartners);
                $scope.chooseGateway = resp.data[0].gateway_label;
                loadPartnersByTradeType($scope.chooseGateway);
            });
            getTotalPartnersRank(params)
        };
        var tradePartnersInTypeConfig = function (legend) {
            return {
                chart: {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    color: colors,
                    legend: {
                        orient: 'vertical',
                        y: '450px',
                        left: 'right',
                        //data: ["Online API", "QR Code", "Retail API", "Retail In-Store", "WeChat HTML5"]
                        data: legend
                    }
                },
                series: [{
                    basic: {
                        name: '交易渠道', type: 'pie',
                        radius: '60%',
                        center: ['50%', '40%'],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    },
                    column: {key: 'partner_count', name: 'gateway_label'}
                }]
            }
        };
        // $scope.loadTradePartnersInTypes();
        $scope.chooseToday();

        $scope.gatewayEchart = function (chart) {
            chart.on('click', function (params) {
                var gateway = angular.copy($scope.gatewayPartners);
                var tradeType = $scope.gatewayPartners[params.dataIndex].gateway_label;
                $scope.chooseGateway = tradeType;
                if (tradeType) {
                    loadPartnersByTradeType(tradeType);
                }
            })
        };
        function loadPartnersByTradeType(tradeType) {
            var params = angular.copy($scope.params);
            if (params.begin) {
                params.begin = $filter('date')(params.begin, 'yyyyMMdd');
            } else {
                params.begin = $filter('date')('2016-01-01', 'yyyyMMdd');
            }
            if (params.end) {
                params.end = $filter('date')(params.end, 'yyyyMMdd');
            } else {
                params.end = $filter('date')(new Date(), 'yyyyMMdd');
            }
            $http.get('/dashboard/system/gateway/' + tradeType + '/partners', {params: params}).then(function (resp) {
                $scope.partners = resp.data;
                $scope.partners1 = [];
                $scope.partners2 = [];
                var partnerSales = angular.copy($scope.partners);
                $scope.partners1 = partnerSales.slice(0, 15);
                if ($scope.partners.length > 15) {
                    $scope.partners2 = partnerSales.slice(15, 30)
                }
            });
        }

        function getTotalPartnersRank(params) {
            $http.get('/dashboard/system/rank_trade_partners.json', {params: params}).then(function (resp) {
                $scope.partners = resp.data;
                $scope.partnerSalesList = [];
                var partnerSales = angular.copy($scope.partners);
                var partnerSalesSize = 0;
                if (partnerSales.length % 2 == 0) {
                    partnerSalesSize = partnerSales.length / 2;
                } else {
                    partnerSalesSize = (partnerSales.length + 1) / 2
                }
                for (var i = 0; i < partnerSalesSize; i++) {
                    var item = [];
                    item[0] = partnerSales[i * 2];
                    if (i * 2 - 1 < partnerSales.length) {
                        item[1] = partnerSales[i * 2 + 1];
                    }
                    $scope.partnerSalesList[i] = item;
                }
            })
        };

    }]);
    app.controller('exchangeRateHistoryDialogCtrl', ['$scope', '$http', '$filter', 'chartParser', function ($scope, $http, $filter, chartParser) {
        $scope.loadExchangeRateHistory = function (days) {
            var endDate = new Date();
            var startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            $http.get('/dashboard/system/exchange_rates.json', {
                params: {
                    begin: $filter('date')(startDate, 'yyyyMMdd'),
                    end: $filter('date')(endDate, 'yyyyMMdd')
                }
            }).then(function (resp) {
                handleRateHistoryChart(resp.data);
            })
        };
        $scope.loadExchangeRateHistory(7);
        var rateHistoryConfig = {
            chart: {
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}:1 AUD ={c} CNY'
                },
                toolbox: {
                    show: true,
                    feature: {
                        mySeven: {
                            title: '最近7天',
                            show: true,
                            icon: 'path://M3.59-4.07L32.38-4.07L32.38 0.04Q22.25 25.11 17.19 46.34L10.65 46.34Q16.14 26.94 26.19 1.41L3.59 1.41L3.59-4.07Z',
                            onclick: function () {
                                $scope.loadExchangeRateHistory(7)
                            }
                        },
                        myThirty: {
                            title: '最近30天',
                            show: true,
                            icon: 'path://M12.52 17.02L16.10 17.02Q20.71 17.02 22.43 15.72Q25.66 13.23 25.66 8.23Q25.66-0.63 17.61-0.63Q10.93-0.63 9.42 6.93L3.73 6.93Q4.50 2.19 7.03-0.91Q10.90-5.51 17.61-5.51Q23.24-5.51 26.89-2.28Q31.22 1.52 31.22 8.02Q31.22 16.78 23.38 19.48Q32.84 23.14 32.84 32.81Q32.84 39.00 29.32 42.97Q25.10 47.79 17.72 47.79Q10.79 47.79 6.68 43.04Q3.66 39.56 3.02 33.44L8.93 33.44Q9.67 42.83 17.72 42.83Q21.45 42.83 23.98 40.72Q27.14 38.01 27.14 32.81Q27.14 21.63 16.10 21.63L12.52 21.63L12.52 17.02ZM54-5.51Q67.99-5.51 67.99 21.14Q67.99 47.79 54 47.79Q40.04 47.79 40.04 21.14Q40.04-5.51 54-5.51M46.97 33.65L59.84 4.30Q57.80-0.55 53.93-0.55Q45.95-0.55 45.95 21.14Q45.95 28.52 46.97 33.65M48.16 37.91Q50.13 42.83 54 42.83Q62.09 42.83 62.09 21.07Q62.09 13.86 61.07 8.66L48.16 37.91Z',
                            onclick: function () {
                                $scope.loadExchangeRateHistory(30)
                            }
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '汇率',
                    min: 'auto'
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
                    basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true, showSymbol: true},
                    column: {key: 'exchange_rate'}
                }
            ]
        };

        function handleRateHistoryChart(exchangeRates) {
            $scope.rateHistory = chartParser.parse(rateHistoryConfig, exchangeRates.reverse());
        }
    }]);
    return app;
});