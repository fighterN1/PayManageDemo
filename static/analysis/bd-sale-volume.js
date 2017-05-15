define(['angular', 'uiBootstrap', 'uiRouter', 'angularEcharts'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('bdSaleAnalysis', ['ui.bootstrap', 'ui.router', 'ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('bdanalysis', {
            url: '/bdsale',
            templateUrl: '/static/analysis/templates/bd_sale_analysis.html',
            controller: 'bdSaleAnalysisCtrl'
        })
    }]);
    app.controller('bdSaleAnalysisCtrl', ['$scope', '$http', '$filter', '$timeout', 'commonDialog', 'chartParser',
        function ($scope, $http, $filter, $timeout, commonDialog, chartParser) {
            $scope.params = {};
            $scope.today = new Date();
            $scope.chooseToday = function () {
                $scope.params.begin = $scope.params.end = new Date();
                $scope.loadSale(1);
            };
            $scope.chooseYesterday = function () {
                var yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                $scope.params.begin = $scope.params.end = yesterday;
                $scope.loadSale(1);
            };
            $scope.chooseLast7Days = function () {
                $scope.params.end = new Date();
                var day = new Date();
                day.setDate(day.getDate() - 7);
                $scope.params.begin = day;
                $scope.loadSale(1);
            };
            $scope.thisMonth = function () {
                $scope.params.end = new Date();
                var monthBegin = new Date();
                monthBegin.setDate(1);
                $scope.params.begin = monthBegin;
                $scope.loadSale(1);
            };
            $scope.lastMonth = function () {
                var monthFinish = new Date();
                monthFinish.setDate(0);
                $scope.params.end = monthFinish;
                var monthBegin = new Date();
                monthBegin.setDate(0);
                monthBegin.setDate(1);
                $scope.params.begin = monthBegin;
                $scope.loadSale(1);
            };
            $scope.thisYear = function () {
                var yearFinish = new Date();
                $scope.params.end = yearFinish;
                var currentYearFirstDate = new Date(new Date().getFullYear(), 0, 1);
                $scope.params.begin = currentYearFirstDate;
                $scope.loadSale(1);
            };

            if (($scope.currentUser.role & parseInt('1000011', 2)) > 0 && !$scope.currentUser.org_id) {
                $scope.showOrg = 'Organization';
                $http.get('/sys/orgs.json', {params: {}}).then(function (resp) {
                    $scope.orgs = resp.data;
                });
            }

            $scope.chooseOrg = function (org) {
                if (org == 'all') {
                    delete $scope.params.org_id;
                    $scope.showOrg = 'All'
                } else {
                    $scope.params.org_id = org.org_id;
                    $scope.showOrg = org.name;
                }
                $scope.loadSale();
            };

            $scope.loadSale = function () {

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
                $http.get('/analysis/bd/sales', {params: params}).then(function (resp) {
                    $scope.sales = resp.data;
                    loadSaleChart();
                });
                $scope.partners = [];
            };

            $scope.chooseToday();

            function loadSaleChart() {
                var sales = angular.copy($scope.sales);
                var topBDSaleConfig = {
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
                            axisLabel: {inside: true, textStyle: {fontSize: 16, fontWeight: 'bold'}},
                            position: 'left',
                            z: 10
                        },
                        key: 'bd_name'
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
                            key: 'total',
                            color: function (idx) {
                                return colors[idx % colors.length]
                            }
                        }
                    }]
                };
                $scope.bdSaleChart = chartParser.parse(topBDSaleConfig, sales.reverse());
            }

            $scope.bdEchart = function (chart) {
                chart.on('click', function (params) {
                    var bdSales = angular.copy($scope.sales);
                    var bd_id = $scope.sales[bdSales.length - 1 - params.dataIndex].bd_id;
                    if (bd_id) {
                        var bd_name = $scope.sales[bdSales.length - 1 - params.dataIndex].bd_name;
                        $scope.loadPartnersChart(bd_id, bd_name);
                    }
                })
            };

            $scope.loadPartnersChart = function (bd_id, bd_name) {
                $scope.chooseBdName = bd_name;
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
                params.bd_id = bd_id;
                $http.get('/analysis/bd/sales/partners', {params: params}).then(function (resp) {
                    $scope.partners = resp.data;
                    $scope.partnerSales1 = [];
                    $scope.partnerSales2 = [];
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


                    // $scope.partnerSales1 = partnerSales.slice(0,10);
                    // if ($scope.partners.length>10){
                    //     $scope.partnerSales2 = partnerSales.slice(10,20)
                    // }
                });

            };

            $scope.exportMonthSale = function () {
                var params = angular.copy($scope.params);
                if (params.begin_month) {
                    params.begin_month = $filter('date')(params.begin_month, 'yyyy-MM');
                } else {
                    params.begin_month = $filter('date')('2016-01-01', 'yyyy-MM');
                }
                if (params.end_month) {
                    params.end_month = $filter('date')(params.end_month, 'yyyy-MM');
                } else {
                    params.end_month = $filter('date')(new Date(), 'yyyy-MM');
                }

                var url = '/analysis/bd/sales/partners/excel';
                var connectSymbol = '?';
                url += connectSymbol + 'begin_month=' + params.begin_month + '&' + 'end_month=' + params.end_month;
                if (params.org_id) {
                    url += '&' + 'org_id=' + params.org_id;
                }
                return url;
            }

        }]);

    return app;
});