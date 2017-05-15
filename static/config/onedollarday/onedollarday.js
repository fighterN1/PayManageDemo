/**
 * Created by yixian on 2017-03-27.
 */
define(['angular'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('onedollarday', ['ui.router','ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('one_dollar_day_analysis', {
            url: '/activities/one_dollar_day/analysis',
            templateUrl: '/static/config/onedollarday/templates/act_one_dollar_analysis.html',
            controller: 'ActOneDollarAnalysisCtrl',
            data: {label: '周二立减活动分析'}
        }).state('one_dollar_day_analysis.one_dollar_day', {
            url: '/activities/one_dollar_day',
            controller: 'oneDollarDayConfigCtrl',
            templateUrl: '/static/config/onedollarday/templates/one_dollar_day_config.html'
        });
    }]);

    app.controller('ActOneDollarAnalysisCtrl', ['$scope', '$http','chartParser', function ($scope, $http,chartParser) {
        $scope.search = {};
        $scope.doAnalysis = function () {
            var params = angular.copy($scope.search);
            if (params.city==""){
                delete params.city;
            }
            $http.get('/activities/one_dollar_day/analysis/merchant_list', {params: params}).then(function (resp) {
                $scope.merchantsAnalysis = chartParser.parse(merchantsAnalysisChartConfig, resp.data);
            });

            $http.get('/activities/one_dollar_day/analysis/transaction_analysis', {params: params}).then(function (resp) {

                var dates = [];
                var amounts = [];
                var counts = [];
                resp.data.forEach(function (e) {
                    dates.push(e.transaction_date);
                    amounts.push(e.amount);
                    counts.push(e.counts);
                });
                $scope.totalAmountAnalysis = transactionAnalysisChartConfig(dates,amounts,counts);
            });

            $http.get('/activities/one_dollar_day/analysis/subsidy', {params: params}).then(function (resp) {
                $scope.subsidyAnalysis = chartParser.parse(subsidyAnalysisChartConfig, resp.data);
            });


        };
        $scope.doAnalysis();
        var merchantsAnalysisChartConfig = {
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
                    name: 'Counts',
                    min: 'auto'
                },
                color: colors
            },
            xAxis: {
                basic: {
                    type: 'category',
                    boundaryGap: false
                },
                key: 'active_time'
            },
            series: [
                {
                    basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true, showSymbol: true},
                    column: {key: 'client_counts'}
                }
            ]
        };
        var transactionAnalysisChartConfig = function (date,amounts,counts) {
            return  {
                color:colors,
                tooltip : {
                    trigger: 'axis',
                    axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                        type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data:['Transaction Amount','Order Counts']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis : [
                    {
                        type : 'category',
                        data : date
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        name: 'Transaction Amount'
                    },{
                        type: 'value',
                        name: 'Order Counts'
                    }
                ],
                series : [
                    {
                        name:'Transaction Amount',
                        type:'line',
                        yAxisIndex: 0,
                        data:amounts
                    },
                    {
                        name:'Order Counts',
                        type:'line',
                        yAxisIndex: 1,
                        data:counts
                    }
                ]
            };
        };
        var subsidyAnalysisChartConfig = {
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
                    name: 'Amount(AUD)',
                    min: 'auto'
                },
                color: colors
            },
            xAxis: {
                basic: {
                    type: 'category',
                    boundaryGap: false
                },
                key: 'pay_date'
            },
            series: [
                {
                    basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true, showSymbol: true},
                    column: {key: 'amount'}
                }
            ]
        };


    }]);

    app.controller('oneDollarDayConfigCtrl', ['$scope', '$http', '$uibModal', 'commonDialog', function ($scope, $http, $uibModal, commonDialog) {
        $scope.search = {};
        $scope.loadMerchants = function () {
            $http.get('/manage/activities/one_dollar_day/merchants').then(function (resp) {
                $scope.merchants = resp.data.data;
            });
        };
        $scope.loadMerchants();

        $scope.modify = function (merchant) {
            $uibModal.open({
                templateUrl: '/static/config/onedollarday/templates/merchant_config.html',
                controller: 'merchantConfigDialogCtrl',
                resolve: {
                    merchant: function () {
                        return merchant;
                    }
                }
            }).result.then(function () {
                $scope.loadMerchants();
            });
        };

        $scope.addMerchant = function () {
            $uibModal.open({
                templateUrl: '/static/config/onedollarday/templates/merchant_config.html',
                controller: 'merchantConfigDialogCtrl',
                resolve: {
                    merchant: function () {
                        return {};
                    }
                }
            }).result.then(function () {
                $scope.loadMerchants();
            });
        };
    }]);

    app.controller('merchantConfigDialogCtrl', ['$scope', '$http', 'Upload', 'merchant', function ($scope, $http, Upload, merchant) {
        $scope.merchant = angular.copy(merchant);
        $scope.save = function () {
            $scope.errmsg = null;
            if (!$scope.merchant.client_moniker) {
                $scope.errmsg = 'Client Moniker Required!';
                return;
            }
            $http.put('/manage/activities/one_dollar_day/merchants/' + $scope.merchant.client_moniker, $scope.merchant).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        };

        $scope.uploadShopImg = function (file) {
            if(!file){
                return;
            }
            $scope.photoProgress = {value: 0};
            Upload.upload({
                url: '/attachment/files',
                data: {file: file}
            }).then(function (resp) {
                delete $scope.photoProgress;
                $scope.merchant.shop_img = resp.data.url;
                $scope.merchant.img_id = resp.data.fileid;
            }, function (resp) {
                delete $scope.photoProgress;
                $scope.errmsg = resp.data.message;
            }, function (evt) {
                $scope.photoProgress.value = parseInt(100 * evt.loaded / evt.total);
            })
        }
    }]);


    return app;
});