/**
 * Created by yixian on 2016-11-10.
 */
define(['angular', 'uiRouter'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#39cccc', '#001f3f', '#ff851b', '#605ca8', '#d81b60', '#dd4b39', '#000000'];
    var app = angular.module('monitorApp', ['ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('monitor', {
            url: '/monitor',
            templateUrl: '/static/analysis/monitor/templates/monitor_root.html',
            controller: 'monitorRootCtrl'
        }).state('monitor.success_rate', {
            url: '/success_rate',
            templateUrl: '/static/analysis/monitor/templates/success_rate.html',
            controller: 'monitorSuccessRateCtrl'
        })
    }]);
    app.controller('monitorRootCtrl', ['$scope', '$state', function ($scope, $state) {
        if ($state.is('monitor')) {
            $state.go('.success_rate')
        }
    }]);
    app.controller('monitorSuccessRateCtrl', ['$scope', '$http', '$filter', '$log', function ($scope, $http, $filter, $log) {
        $scope.params = {};
        $scope.today = new Date();
        $scope.loadSuccessRate = function () {
            var params = angular.copy($scope.params);
            params.begin = $filter('date')(params.begin, 'yyyyMMdd');
            params.end = $filter('date')(params.end, 'yyyyMMdd');
            $http.get('/analysis/success_rates/chart_view', {params: params}).then(function (resp) {
                var series = [];
                var xAxisData = resp.data.dates;
                var legendData = ['Retail-In-Store(Scan)', 'Retail-In-Store(QRCode)', '商户二维码(JsApi)', '商户二维码(QRCode)', 'Gateway QR Code', 'Gateway JsApi', 'Gateway Retail Api(Scan)', 'Gateway Retail Api(QRCode)', 'All'];
                angular.forEach(legendData, function (label) {

                    var seriesItem = {
                        name: label,
                        type: 'line',
                        data: []
                    };
                    series.push(seriesItem);
                    var tradeTypes = resp.data.data.filter(function (type) {
                        return type.label == label;
                    });
                    if (!tradeTypes.length) {
                        return;
                    }
                    var tradeType = tradeTypes[0];
                    var dtHash = {};
                    angular.forEach(tradeType.dates, function (dateItem) {
                        dtHash[dateItem.date] = dateItem;
                    });
                    angular.forEach(xAxisData, function (dt) {
                        seriesItem.data.push(dtHash[dt] ? Number(dtHash[dt].percentage) : '-');
                    });

                });
                var template = {
                    tooltip: {
                        trigger: 'axis'
                        // formatter: function (params) {
                        //     var name = '';
                        //     var items = [];
                        //     angular.forEach(params, function (item) {
                        //         name = name || item.name;
                        //         items.push('<span style="color:' + item.color + '">' + item.seriesName + ':' + (!isNaN(item.data) ? item.data + '%' : '-') + '</span><br>')
                        //     });
                        //     items.unshift(name+'<br>');
                        //     return items.join('')
                        // }
                    },
                    legend: {
                        data: legendData,
                        top:0
                    },
                    grid:{
                        top:80
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: xAxisData
                    },
                    yAxis: {
                        type: 'value',
                        name: '成功率(%)',
                        min: 'auto'
                    },
                    color: colors,
                    series: series
                };
                $log.debug(template);
                $scope.successRateChart = template;
            })
        };

        $scope.selectLastDays = function (days) {
            $scope.params.end = new Date();
            var begin = new Date();
            begin.setDate(begin.getDate() - days);
            $scope.params.begin = begin;
            $scope.loadSuccessRate();
        };
        $scope.selectLastDays(30);
        $scope.chartReady = function (chart) {
            $scope.chartObj = chart;
            chart.on('click', function (evt) {
                var dateStr = evt.name;
                dateStr = dateStr.replace('-', '/');
                var date = new Date(dateStr);
                $scope.loadDateDetail(date);
            })
        };
        $scope.loadDateDetail = function (date) {
            var dtStr = $filter('date')(date, 'yyyyMMdd');
            $scope.detail = null;
            $http.get('/analysis/success_rates/dates/' + dtStr + '/detail').then(function (resp) {
                $scope.detail = resp.data;
            })
        };
        $scope.detailView = {
            retail_scan: true,
            retail_qr: true,
            qr_api: true,
            qr_qr: true,
            gateway_qr: true,
            gateway_api: true,
            retail_api_scan: true,
            retail_api_qr: true
        }
    }]);
    app.filter('royal_percentage', function () {
        return function (input) {
            if (!isNaN(input)) {
                return input + '%'
            } else {
                return input;
            }
        }
    });
    app.filter('clientRateFilter', function () {
        return function (clients, mask) {
            return clients == null ? clients : clients.filter(function (item) {
                var included = false;
                included = included || (mask.retail_scan && item.retail_scan_total > 0);
                included = included || (mask.retail_qr && item.retail_qr_total > 0);
                included = included || (mask.qr_api && item.qrcode_jsapi_total > 0);
                included = included || (mask.qr_qr && item.qrcode_code_total > 0);
                included = included || (mask.gateway_qr && item.gateway_code_total > 0);
                included = included || (mask.gateway_api && item.gateway_jsapi_total > 0);
                included = included || (mask.retail_api_scan && item.retail_api_scan_total > 0);
                included = included || (mask.retail_api_qr && item.retail_api_code_total > 0);
                return included;
            })
        }
    })
    return app;
});