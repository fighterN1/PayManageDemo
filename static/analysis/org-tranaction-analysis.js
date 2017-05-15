define(['angular', 'uiBootstrap', 'uiRouter', 'angularEcharts'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('orgSaleAnalysis', ['ui.bootstrap', 'ui.router', 'ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('organlasis', {
            url: '/orgsale',
            templateUrl: '/static/analysis/templates/org_sale_analysis.html',
            controller: 'orgAnalysisCtrl'
        })
    }]);
    app.controller('orgAnalysisCtrl', ['$scope', '$http', '$filter', 'chartParser', function ($scope, $http, $filter, chartParser) {
        $scope.params = {};
        $scope.today = new Date();
        $scope.chooseToday = function () {
            $scope.params.begin = $scope.params.end = new Date();
            $scope.loadTransactionAmountInOrg();
        };
        $scope.chooseYesterday = function () {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            $scope.params.begin = $scope.params.end = yesterday;
            $scope.loadTransactionAmountInOrg();
        };
        $scope.chooseLast7Days = function () {
            $scope.params.end = new Date();
            var day = new Date();
            day.setDate(day.getDate() - 7);
            $scope.params.begin = day;
            $scope.loadTransactionAmountInOrg();
        };
        $scope.thisMonth = function () {
            $scope.params.end = new Date();
            var monthBegin = new Date();
            monthBegin.setDate(1);
            $scope.params.begin = monthBegin;
            $scope.loadTransactionAmountInOrg();
        };
        $scope.lastMonth = function () {
            var monthFinish = new Date();
            monthFinish.setDate(0);
            $scope.params.end = monthFinish;
            var monthBegin = new Date();
            monthBegin.setDate(0);
            monthBegin.setDate(1);
            $scope.params.begin = monthBegin;
            $scope.loadTransactionAmountInOrg();
        };
        $scope.thisYear = function () {
            var yearFinish = new Date();
            $scope.params.end = yearFinish;
            var currentYearFirstDate = new Date(new Date().getFullYear(), 0, 1);
            $scope.params.begin = currentYearFirstDate;
            $scope.loadTransactionAmountInOrg();
        };
        //$scope.params={'begin':'20160101','end':$filter('date')(new Date(), 'yyyyMMdd')};
        $scope.loadTransactionAmountInOrg = function () {

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

            $http.get('/analysis/org/sales', {params: params}).then(function (resp) {
                $scope.orgAmounts = resp.data;
                $scope.legends = [];
                for (var i = 0; i < resp.data.length; i++) {
                    $scope.legends[i] = resp.data[i].org_name;
                }
                $scope.partners_type_chart = chartParser.parse(tradeAmountInOrgConfig($scope.legends), $scope.orgAmounts);
                $scope.chooseOrg = resp.data[0].org_name;
                loadPartnersByOrgId(resp.data[0].org_id);
            });
        };
        var tradeAmountInOrgConfig = function (legend) {
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
                        name: '组织机构', type: 'pie',
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
                    column: {key: 'amount', name: 'org_name'}
                }]
            }
        };
        $scope.loadTransactionAmountInOrg();

        $scope.orgEchart = function (chart) {
            chart.on('click', function (params) {
                var org_id = $scope.orgAmounts[params.dataIndex].org_id;
                $scope.chooseOrg = $scope.orgAmounts[params.dataIndex].org_name;
                if (org_id) {
                    loadPartnersByOrgId(org_id);
                }
            })
        };
        function loadPartnersByOrgId(org_id) {
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
            $http.get('/analysis/org/'+org_id+'/partners', {params: params}).then(function (resp) {
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
            });
        }

    }]);


    return app;
});