/**
 * Created by yixian on 2017-02-08.
 */
define(['angular'], function (angular) {
    'use strict';
    var app = angular.module('bdprize', ['ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('bd_prizes', {
            url: '/bd_prizes',
            templateUrl: '/static/config/bdprize/templates/bd_prize_root.html',
            controller: 'bdPrizeRootCtrl'
        }).state('bd_prizes.month_report', {
            url: '/{month}',
            templateUrl: '/static/config/bdprize/templates/bd_prize_month_report.html',
            controller: 'bdPrizeMonthReportCtrl',
            resolve: {
                report: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/bd_prize/records/' + $stateParams.month);
                }]
            }
        }).state('bd_prizes.month_report.detail', {
            url: '/bd_user/{bdId}',
            templateUrl: '/static/config/bdprize/templates/bd_prize_detail.html',
            controller: 'bdPrizeDetailCtrl',
            resolve: {
                detail: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/bd_prize/records/' + $stateParams.month + '/bd_users/' + $stateParams.bdId);
                }]
            }
        }).state('bd_prizes.bd_detail', {
            url: '/{month}/my_report',
            templateUrl: '/static/config/bdprize/templates/bd_prize_detail.html',
            controller: 'bdPrizeDetailCtrl',
            resolve: {
                detail: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/bd_prize/records/' + $stateParams.month + '/bd_user_detail')
                }]
            }
        })
    }]);

    app.controller('bdPrizeRootCtrl', ['$scope', '$http', '$uibModal', 'commonDialog', function ($scope, $http, $uibModal, commonDialog) {
        $scope.params = {year: new Date().getFullYear()};
        $scope.initMonth = function (year) {
            $scope.months = [];
            for (var i = 1; i < 13; i++) {
                var mon = '00' + i;
                mon = mon.substr(mon.length - 2, 2);
                $scope.months.push(year + '-' + mon);
            }
        };
        $scope.hasReport = function (mon) {
            if ($scope.reportMonths != null) {
                var have = false;
                angular.forEach($scope.reportMonths, function (month) {
                    if (mon == month.month) {
                        have = true;
                    }
                });
                return have;
            } else {
                return false;
            }
        };
        $scope.getYearReports = function (year) {
            $scope.initMonth(year);
            $http.get('/sys/bd_prize/records', {params: {year: year}}).then(function (resp) {
                $scope.reportMonths = resp.data.data;
            })
        };
        $scope.getYearReports($scope.params.year);
        $scope.generateReport = function () {
            commonDialog.confirm({title:'Warning',content:'This operation will clear the result of last month generated before. Are you sure?'}).then(function () {
                $http.post('/sys/bd_prize/generate_record', null, {timeout: 60000}).then(function () {
                    commonDialog.alert({title: 'Success', content: 'Generate Finished', type: 'success'});
                    $scope.getYearReports($scope.params.year);
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                })
            })
        };
        $scope.loadRateConfigs = function () {
            $http.get('/sys/bd_prize/config/rates').then(function (resp) {
                $scope.bd_rate_configs = resp.data;
                $scope.bd_rate_ranges = [];
                var rangeStart = [];
                angular.forEach($scope.bd_rate_configs, function (cfg) {
                    if (rangeStart.indexOf(cfg.rate_from) < 0) {
                        rangeStart.push(cfg.rate_from);
                        $scope.bd_rate_ranges.push(cfg);
                    }
                })
            })
        };
        $scope.loadRateConfigs();
        $scope.editRateConfig = function () {
            $uibModal.open({
                templateUrl: '/static/config/bdprize/templates/rate_config_dialog.html',
                controller: 'bdRateConfigCtrl',
                resolve: {
                    rates: function () {
                        return angular.copy($scope.bd_rate_configs);
                    }
                }
            }).result.then(function () {
                $scope.loadRateConfigs();
            })
        };
        $scope.editBDLevels = function () {
            $uibModal.open({
                templateUrl:'/static/config/bdprize/templates/bd_level_config_dialog.html',
                controller:'bdLevelConfigCtrl'
            })
        }
    }]);
    app.controller('bdRateConfigCtrl', ['$scope', '$http', 'rates', function ($scope, $http, rates) {
        $scope.bdLevels = [{value: 1, label: 'Junior'}, {value: 2, label: 'Intermediate'}, {value: 3, label: 'Senior'}];
        $scope.months = [{value: 1, label: '1-3 Months'}, {value: 2, label: '4-6 Months'}, {
            value: 3,
            label: '>=7 Months'
        }];
        $scope.filter = {bd_level: 1, months: 1};
        $scope.rates = rates;
        $scope.submitRates = function () {
            var validation = null;
            $scope.errmsg = null;
            angular.forEach($scope.rates, function (rate) {
                if (isNaN(rate.prize_rate)) {
                    validation = {months: rate.time_range, bd_level: rate.bd_level};
                    $scope.errmsg = 'Rate Value is NaN';
                }
                if (rate.prize_rate > 1) {
                    validation = {months: rate.time_range, bd_level: rate.bd_level};
                    $scope.errmsg = 'Rate value shall no more than 1%';
                }
                if (rate.prize_rate < 0) {
                    validation = {months: rate.time_range, bd_level: rate.bd_level};
                    $scope.errmsg = 'Rate value shall be a positive value';
                }
            });
            if (!validation) {
                $http.put('/sys/bd_prize/config/rates', $scope.rates).then(function () {
                    $scope.$close();
                }, function (resp) {
                    $scope.errmsg = resp.data.message;
                })
            }
        }
    }]);
    app.controller('bdLevelConfigCtrl',['$scope','$http',function ($scope, $http) {
        $scope.getBDLevels = function () {
            $http.get('/sys/bd_prize/config/bd_levels').then(function (resp) {
                $scope.bds = resp.data;
            })
        };
        $scope.getBDLevels();
        $scope.bdLevels = [{value: 1, label: 'Junior'}, {value: 2, label: 'Intermediate'}, {value: 3, label: 'Senior'}];
        $scope.updateBDLevel = function (bdInfo) {
            $http.put('/sys/bd_prize/config/bd_levels/'+bdInfo.manager_id,bdInfo).then(function () {
                $scope.getBDLevels();
            },function (resp) {
                $scope.errmsg = resp.data.message;
            })
        };
    }]);
    app.controller('bdPrizeMonthReportCtrl', ['$scope', '$http', 'report', function ($scope, $http, report) {
        $scope.report = report.data;
    }]);
    app.controller('bdPrizeDetailCtrl', ['$scope', 'detail', function ($scope, detail) {
        $scope.detail = detail.data;
    }]);
    app.filter('financialBdLevel', function () {
        return function (level) {
            switch (level) {
                case 1:
                    return 'Junior';
                case 2:
                    return 'Intermediate';
                case 3:
                    return 'Senior';
                default:
                    return 'Unknown';
            }
        }
    });
    app.filter('financialClientSource', function () {
        return function (source) {
            switch (source) {
                case 1:
                    return 'BD';
                case 2:
                    return 'Apply';
                case 3:
                    return 'Distribute';
                default:
                    return 'Unknown';
            }
        }
    });
    return app;
});