define(['angular', 'uiBootstrap', 'uiRouter', 'angularEcharts'], function (angular) {
    'use strict';
    var colors = ['#00c0ef', '#00a65a', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('clearingLogs', ['ui.bootstrap', 'ui.router', 'ngEcharts']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('clearingLogs', {
            url: '/analysis/clearing_logs',
            templateUrl: '/static/analysis/templates/clearing_logs.html',
            controller: 'clearingLogsCtrl'
        }).state('clearingLogs.rate_warnings', {
            url: '/rate_warnings',
            template: '<div></div>',
            onEnter: ['$uibModal', function ($uibModal) {
                $uibModal.open({
                    templateUrl: '/static/analysis/templates/settle_warnings.html',
                    controller: 'settleWarningsCtrl',
                    size: 'lg'
                })
            }],
            controller: ['$state', function ($state) {
                $state.go('^')
            }]
        }).state('clearingLogs.date_setting', {
            url: '/date_setting',
            template: '<div></div>',
            onEnter: ['$uibModal', function ($uibModal) {
                $uibModal.open({
                    templateUrl: '/static/analysis/templates/settle_date_config.html',
                    controller: 'settleDateConfigCtrl',
                    size: 'lg'
                })
            }],
            controller: ['$state', function ($state) {
                $state.go('^')
            }]
        }).state('clearingLogs.settlementDetail', {
            url: '/settles/{date}',
            templateUrl: '/static/analysis/templates/settlement_detail.html',
            controller: 'settlementDetailCtrl',
            resolve: {
                detail: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/settlement/reports/' + $stateParams.date);
                }]
            }
        }).state('clearingLogs.settlementDetail.transactions', {
            url: '/transactions/{detailId}',
            templateUrl: '/static/analysis/templates/settlement_transactions.html',
            controller: 'settlementTransactionsCtrl',
            resolve: {
                detail: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/settlement/details/' + $stateParams.detailId);
                }]
            }
        })
    }]);
    app.controller('clearingLogsCtrl', ['$scope', '$http', '$filter', '$timeout', '$uibModal', 'commonDialog', 'chartParser',
        function ($scope, $http, $filter, $timeout, $uibModal, commonDialog, chartParser) {
            $scope.loadMonthLog = function (month) {
                var monthStr = $filter('date')(month, 'yyyyMM');
                $http.get('/sys/settlement/month/' + monthStr + '/settled_dates').then(function (resp) {
                    $scope.settledDates = resp.data;
                });
            };

            $scope.params = {};
            $scope.pagination = {};
            $scope.today = new Date();
            $scope.chooseToday = function () {
                $scope.params.begin = $scope.params.end = new Date();
                $scope.loadClearingLogs(1);
            };
            $scope.chooseYesterday = function () {
                var yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                $scope.params.begin = $scope.params.end = yesterday;
                $scope.loadClearingLogs(1);
            };
            $scope.chooseLast7Days = function () {
                $scope.params.end = new Date();
                var day = new Date();
                day.setDate(day.getDate() - 7);
                $scope.params.begin = day;
                $scope.loadClearingLogs(1);
            };
            $scope.thisMonth = function () {
                $scope.params.end = new Date();
                var monthBegin = new Date();
                monthBegin.setDate(1);
                $scope.params.begin = monthBegin;
                $scope.loadClearingLogs(1);
            };
            $scope.lastMonth = function () {
                var monthFinish = new Date();
                monthFinish.setDate(0);
                $scope.params.end = monthFinish;
                var monthBegin = new Date();
                monthBegin.setDate(0);
                monthBegin.setDate(1);
                $scope.params.begin = monthBegin;
                $scope.loadClearingLogs(1);
            };
            $scope.thisYear = function () {
                var yearFinish = new Date();
                $scope.params.end = yearFinish;
                var currentYearFirstDate = new Date(new Date().getFullYear(), 0, 1);
                $scope.params.begin = currentYearFirstDate;
                $scope.loadClearingLogs(1);
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
                $scope.loadClearingLogs();
            };
            $scope.loadClearingLogs = function (page) {

                var params = angular.copy($scope.params);
                params.page = page || $scope.pagination.page || 1;
                if (params.begin) {
                    params.begin = $filter('date')(params.begin, 'yyyyMMdd');
                }
                if (params.end) {
                    params.end = $filter('date')(params.end, 'yyyyMMdd');
                }
                $http.get('/sys/clean_logs/clients', {params: params}).then(function (resp) {
                    $scope.clearing_logs = resp.data.data;
                    $scope.pagination = resp.data.pagination;
                });
                analysisLog(params);
            };
            var analysisLog = function (params) {
                $http.get('/sys/clean_logs/analysis', {params: params}).then(function (resp) {
                    $scope.analysis = resp.data;

                })
            };
            $scope.loadClearingLogs(1);

            $scope.loadClearingLogsHistory = function (days) {
                var endDate = new Date();
                var startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                $http.get('/sys/clean_logs/logs', {
                    params: {
                        begin: $filter('date')(startDate, 'yyyyMMdd'),
                        end: $filter('date')(endDate, 'yyyyMMdd')
                    }
                }).then(function (resp) {
                    handleLogsChart(resp.data);
                })
            };
            $scope.loadClearingLogsHistory(7);
            var clearingHistoryConfig = {
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
                                    $scope.loadClearingLogsHistory(7)
                                }
                            },
                            myThirty: {
                                title: '最近30天',
                                show: true,
                                icon: 'path://M12.52 17.02L16.10 17.02Q20.71 17.02 22.43 15.72Q25.66 13.23 25.66 8.23Q25.66-0.63 17.61-0.63Q10.93-0.63 9.42 6.93L3.73 6.93Q4.50 2.19 7.03-0.91Q10.90-5.51 17.61-5.51Q23.24-5.51 26.89-2.28Q31.22 1.52 31.22 8.02Q31.22 16.78 23.38 19.48Q32.84 23.14 32.84 32.81Q32.84 39.00 29.32 42.97Q25.10 47.79 17.72 47.79Q10.79 47.79 6.68 43.04Q3.66 39.56 3.02 33.44L8.93 33.44Q9.67 42.83 17.72 42.83Q21.45 42.83 23.98 40.72Q27.14 38.01 27.14 32.81Q27.14 21.63 16.10 21.63L12.52 21.63L12.52 17.02ZM54-5.51Q67.99-5.51 67.99 21.14Q67.99 47.79 54 47.79Q40.04 47.79 40.04 21.14Q40.04-5.51 54-5.51M46.97 33.65L59.84 4.30Q57.80-0.55 53.93-0.55Q45.95-0.55 45.95 21.14Q45.95 28.52 46.97 33.65M48.16 37.91Q50.13 42.83 54 42.83Q62.09 42.83 62.09 21.07Q62.09 13.86 61.07 8.66L48.16 37.91Z',
                                onclick: function () {
                                    $scope.loadClearingLogsHistory(30)
                                }
                            }
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: '清算金额（AUD）',
                        min: 'auto'
                    },
                    color: colors
                },
                xAxis: {
                    basic: {
                        type: 'category',
                        boundaryGap: false
                    },
                    key: 'clear_time'
                },
                series: [
                    {
                        basic: {type: 'line', label: {normal: {show: true}}, showAllSymbols: true, showSymbol: true},
                        column: {key: 'total'}
                    }
                ]
            };

            function handleLogsChart(logs) {
                $scope.clearingHistory = chartParser.parse(clearingHistoryConfig, logs.reverse());
            }


        }]);
    app.controller('settleWarningsCtrl', ['$scope', '$http', '$filter', 'commonDialog', function ($scope, $http, $filter, commonDialog) {
        $scope.loadWarnings = function () {
            $http.get('/manage/clearing/rate_warnings').then(function (resp) {
                $scope.warning = resp.data;
            })
        };
        $scope.loadWarnings();
        $scope.generateRate = function (client) {
            commonDialog.confirm({title: 'Confirm Required', content: '根据上季度总交易额自动计算下周期费率，确定执行？'}).then(function () {
                $http.put('/manage/clearing/clients/' + client.client_moniker + '/auto_rate').then(function (resp) {
                    var content = 'New Rate value=' + resp.data.rate_value + '; expiry_time=' + $filter('date')(resp.data.expiry_time, 'dd/MMM/yyyy');
                    commonDialog.alert({
                        type: 'success',
                        title: 'New Rate Generated',
                        content: content
                    }).then(function () {
                        $scope.loadWarnings();
                    });

                }, function (resp) {
                    commonDialog.alert({type: 'error', title: 'Error', content: resp.data.message});
                })
            })
        }
    }]);
    app.controller('settlementDetailCtrl', ['$scope', '$stateParams', 'detail', function ($scope, $stateParams, detail) {
        $scope.detail = detail.data;

        $scope.datePattern = $stateParams.date;
    }]);
    app.controller('settlementTransactionsCtrl', ['$scope', '$stateParams', 'detail', function ($scope, $stateParams, detail) {
        $scope.report = detail.data;
    }]);
    app.controller('settleDateConfigCtrl', ['$scope', '$http', '$filter', 'commonDialog', function ($scope, $http, $filter, commonDialog) {
        $scope.loadMonthPlan = function (mon) {
            $http.get('/sysconfig/clear_days/months/' + $filter('date')(mon, 'yyyyMM')).then(function (resp) {
                $scope.activeDates = resp.data;
            });
            $scope.currentMonth = mon;
        };
        $scope.triggerDate = function (date) {
            if (date.getFullYear() != $scope.currentMonth.getFullYear() || date.getMonth() != $scope.currentMonth.getMonth()) {
                return;
            }
            var str = $filter('date')(date, 'yyyy/MM/dd');
            var idx = $scope.activeDates.indexOf(str);
            if (idx < 0) {
                $scope.activeDates.push(str);
            } else {
                $scope.activeDates.splice(idx, 1);
            }
        };
        $scope.isDateOn = function (date) {
            if ($scope.activeDates != null) {
                return $scope.activeDates.indexOf($filter('date')(date, 'yyyy/MM/dd')) >= 0
            } else {
                return false;
            }
        };
        $scope.submitMonthPlan = function () {
            $http.put('/sysconfig/clear_days/months/' + $filter('date')($scope.currentMonth, 'yyyyMM'), $scope.activeDates).then(function () {
                $scope.loadMonthPlan($scope.currentMonth);
                commonDialog.alert({title: 'Success', content: 'Modified plan successful', type: 'success'})
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        }
    }]);
    return app;
});