define(['angular', 'uiBootstrap', 'uiRouter', 'angularEcharts'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('customersAnalysisManage', ['ui.bootstrap', 'ui.router', 'ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('customers_analysis_manage', {
            url: '/analysis/customers',
            templateUrl: '/static/analysis/templates/manage_customers_orders.html',
            controller: 'customersAnalysisCtrl'
        })
    }]);
    app.controller('customersAnalysisCtrl', ['$scope', '$http', '$filter', '$timeout', 'commonDialog', 'chartParser',
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
                $http.get('/analysis/customers/sys', {params: params}).then(function (resp) {
                    var dates = [];
                    var new_customers = [];
                    var old_customers = [];
                    var orders = [];
                    resp.data.reverse().forEach(function (e) {
                        dates.push(e.trade_date);
                        new_customers.push(e.new_customers);
                        old_customers.push(e.old_customers);
                        orders.push(e.orders);
                    });

                    $scope.customersHistory = customersHistoryConfig(dates,old_customers,new_customers,orders);
                    $scope.perCustomerTransactionHistory = chartParser.parse(perCustomerTransactionHistoryConfig, resp.data);
                  
                })
            };
            $scope.chooseLast7Days();

            var customersHistoryConfig = function (date,old_customers,new_customers,orders) {
              return  {
                  color:colors,
                  tooltip : {
                      trigger: 'axis',
                      axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                          type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                      }
                  },
                  legend: {
                      data:['Old Customers','New Customers','Order Counts']
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
                          name: 'Customers'
                      },{
                          type: 'value',
                          name: 'Orders'
                      }
                  ],
                  series : [
                      {
                          name:'Old Customers',
                          type:'bar',
                          stack: 'customers',
                          data:old_customers
                      },
                      {
                          name:'New Customers',
                          type:'bar',
                          stack: 'customers',
                          data:new_customers
                      },
                      {
                          name:'Order Counts',
                          type:'line',
                          yAxisIndex: 1,
                          data:orders
                      }
                  ]
              };
            };


         
            var perCustomerTransactionHistoryConfig = {
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
                        name: 'Per Customer Transaction',
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
                        column: {key: 'single_amount'}
                    }
                ]
            };


        }]);

    return app;
});