define(['angular', 'static/commons/commons', 'uiBootstrap', 'uiRouter', 'ngBootSwitch', 'ngFileUpload'], function (angular) {
    'use strict';
    var colors = ['#00a65a', '#00c0ef', '#ff851b', '#f39c12', '#d81b60', '#605ca8', '#dd4b39', '#008080', '#8B008B', '#D2691E', '#708090'];
    var app = angular.module('actManage', ['ui.bootstrap', 'ui.router', 'frapontillo.bootstrap-switch', 'ngFileUpload']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('activity', {
            url: '/act',
            templateUrl: '/static/config/redpackets/templates/act_list.html',
            controller: 'actListCtrl',
            data: {label: '活动列表'}
        }).state('activity.new', {
            url: '/new',
            templateUrl: '/static/config/redpackets/templates/act_add.html',
            controller: 'addActCtrl'
        }).state('activity.edit', {
            url: '/{act_id}/edit',
            templateUrl: '/static/config/redpackets/templates/act_edit.html',
            controller: 'actEditCtrl',
            resolve: {
                act: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/lucky_money/partner/act/' + $stateParams.act_id);
                }]
            }
        }).state('activity.detail', {
            url: '/{act_id}/detail',
            templateUrl: '/static/config/redpackets/templates/act_detail.html',
            controller: 'actDetailCtrl',
            resolve: {
                act: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/lucky_money/partner/act/' + $stateParams.act_id);
                }]
            }
        }).state('activity.detail.send_logs', {
            url: '/send_logs',
            templateUrl: '/static/config/redpackets/templates/act_detail_send_logs.html',
            controller: 'actDetailSendLogsCtrl',
            resolve: {
                act: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/lucky_money/partner/act/' + $stateParams.act_id);
                }]
            }
        }).state('activity.detail.partners_binds', {
            url: '/partners_binds',
            templateUrl: '/static/config/redpackets/templates/act_detail_partners_binds.html',
            controller: 'actDetailPartnersBinds'
        })
    }]);
    app.controller('actListCtrl', ['$scope', '$http', 'commonDialog', function ($scope, $http, commonDialog) {
        $scope.pagination = {};
        $scope.params = {};

        $scope.loadActivities = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.pagination.page || 1;
            $http.get('/sys/lucky_money/partner/act', {params: params}).then(function (resp) {
                $scope.activities = resp.data.data;
                $scope.pagination = resp.data.pagination;
            });
        };
        $scope.loadActivities(1);

        $scope.generateInvitationCode = function (act_id) {
            $http.get('/sys/lucky_money/partner/' + act_id + '/invitation_code').then(function (resp) {
                commonDialog.alert({
                    title: 'Success',
                    content: 'Generate invitation code successfully',
                    type: 'success'
                });
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            });
        }
    }]);
    app.controller('addActCtrl', ['$scope', '$http', '$state', 'Upload', 'commonDialog', function ($scope, $http, $state, Upload, commonDialog) {
        $scope.save = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            $http.post('/sys/lucky_money/partner/act', $scope.act).then(function (resp) {
                commonDialog.alert({title: 'Success', content: 'Add new activity successfully', type: 'success'});
                $scope.loadActivities();
                $state.go('^.detail', {act_id: resp.data.act_id})
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            });
        };

        $scope.openActivity = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            var act = angular.copy($scope.act);
            act.status = 1;
            $http.post('/sys/lucky_money/partner/act', act).then(function (resp) {
                commonDialog.alert({
                    title: 'Success',
                    content: 'Add and Start a new activity successfully',
                    type: 'success'
                });
                $scope.loadActivities();
                $state.go('^.detail', {act_id: resp.data.act_id})
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            });
        };
        $scope.act = {};
    }]);
    app.controller('actDetailCtrl', ['$scope', '$http', '$state', '$uibModal', 'commonDialog', 'act', function ($scope, $http, $state, $uibModal, commonDialog, act) {
        $scope.act = act.data;
        $scope.showSendLMLogs = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.pagination.page || 1;
            $http.get('/sys/lucky_money/partner/act/' + $scope.act.act_id + '/logs', {params: params}).then(function (resp) {
                $scope.sendLogs = resp.data.data;
                $scope.pagination = resp.data.pagination;
            });
        };
        $scope.showSendLMLogs();

        $scope.luckyMoneyAnalysis = function (params) {
            $http.get('/sys/lucky_money/partner/act/' + $scope.act.act_id + '/analysis', {params: params}).then(function (resp) {
                $scope.luckyMoneyAnalysis = resp.data;
            });
        };
        $scope.luckyMoneyAnalysis({});

        $scope.bindsPagination = {};
        $scope.getPartnersBinds = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.bindsPagination.page || 1;
            $http.get('/sys/lucky_money/partner/' + $scope.act.act_id + '/binds', {params: params}).then(function (resp) {
                $scope.binds = resp.data.data;
                $scope.bindsPagination = resp.data.pagination;
            });
        };
        $scope.getPartnersBinds();

        $scope.getBindsError = function () {
            $http.get('/sys/lucky_money/partner/partners/bind_error').then(function (resp) {
                $scope.error_binds = resp.data;
            });
        };
        $scope.getBindsError();


    }]);
    app.controller('actEditCtrl', ['$scope', '$http', '$state', 'Upload', 'commonDialog', 'act',
        function ($scope, $http, $state, Upload, commonDialog, act) {
            $scope.act = angular.copy(act.data);
            $scope.updateActivity = function (form) {
                if (form.$invalid) {
                    angular.forEach(form, function (item, key) {
                        if (key.indexOf('$') < 0) {
                            item.$dirty = true;
                        }

                    });
                    return;
                }
                if ($scope.act.status != status && $scope.act.status == 1) {

                }
                $http.put('/sys/lucky_money/partner/act/' + $scope.act.act_id, $scope.act).then(function () {
                    commonDialog.alert({
                        title: 'Success',
                        content: 'Update activity successfully',
                        type: 'success'
                    });
                    $scope.loadActivities();
                    $state.go('^.detail', {act_id: $scope.act.act_id}, {reload: true});
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                });
            };

            $scope.clearRedPack = function (type_id) {
                $http.delete('/sys/redpack/config/' + $scope.act.act_id + '/prize_types/' + type_id + '/clear_unsend').then(function () {
                    commonDialog.alert({
                        title: 'Success',
                        content: 'Delete RedPack successfully',
                        type: 'success'
                    });
                    $scope.loadActivities();
                    $state.go('^.detail', {act_id: $scope.act.act_id}, {reload: true});
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                });
            }
        }]);

    app.controller('actDetailSendLogsCtrl', ['$scope', '$http', '$state', '$filter', 'commonDialog','orderService','act', function ($scope, $http, $state, $filter, commonDialog,orderService, act) {
        $scope.act = act.data;

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

        $scope.doAnalysis = function () {

            var params = angular.copy($scope.params);
            if (params.begin) {
                params.from = $filter('date')(params.begin, 'yyyyMMdd');
            } else {
                params.from = $filter('date')(new Date(), 'yyyyMMdd');
            }
            if (params.end) {
                params.to = $filter('date')(params.end, 'yyyyMMdd');
            } else {
                params.to = $filter('date')(new Date(), 'yyyyMMdd');
            }
            $http.get('sys/lucky_money/partner/2/sendLogs/analysis', {params: params}).then(function (resp) {
                $scope.redPackCounts = angular.copy(resp.data);
                var dates = [];
                var send_counts = [];
                var fail_counts = [];
                var receive_counts = [];
                var refund_counts = [];
                var amounts = [];
                var real_amounts = [];
                resp.data.forEach(function (e) {
                    dates.push(e.date);
                    send_counts.push(e.send_counts);
                    fail_counts.push(e.fail_counts);
                    receive_counts.push(e.receive_counts);
                    refund_counts.push(e.refund_counts);
                    amounts.push(e.amount);
                    real_amounts.push(e.real_amount);
                });
                var redPackSendLogsHistoryConfig = function (dates, send_counts, fail_counts, receive_counts, refund_counts, amounts, real_amounts) {
                    return {
                        color: colors,
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        legend: {
                            data: ['已领取', '发送未领取', '发送失败', '退回', '发送红包金额', '实际红包金额']
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
                                data: dates
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                name: 'RedPackets'
                            }, {
                                type: 'value',
                                name: 'Amount(¥)'
                            }
                        ],
                        series: [{
                            name: '已领取',
                            type: 'bar',
                            stack: 'repackets',
                            data: receive_counts
                        },
                            {
                                name: '发送未领取',
                                type: 'bar',
                                stack: 'repackets',
                                data: send_counts
                            },
                            {
                                name: '发送失败',
                                type: 'bar',
                                stack: 'repackets',
                                data: fail_counts
                            },

                            {
                                name: '退回',
                                type: 'bar',
                                stack: 'repackets',
                                data: refund_counts
                            },
                            {
                                name: '发送红包金额',
                                type: 'line',
                                yAxisIndex: 1,
                                data: amounts
                            },
                            {
                                name: '实际红包金额',
                                type: 'line',
                                yAxisIndex: 1,
                                data: real_amounts
                            }
                        ]
                    };
                };
                $scope.redPackSendLogsHistory = redPackSendLogsHistoryConfig(dates, send_counts, fail_counts, receive_counts, refund_counts, amounts, real_amounts);

            })
        };
        $scope.chooseLast7Days();
        $scope.getClientsCountsRanking = function (page) {
            var params = {};
            params.page = page||$scope.total_ranking_pagination.page || 1;
            params.limit = 20;
            $http.get('sys/lucky_money/partner/2/ranking/analysis', {params: params}).then(function (resp) {
                //$scope.clientsRanking = resp.data.slice(0,20);
                $scope.clientsRanking = resp.data.data;
                $scope.total_ranking_pagination = resp.data.pagination;
            });
        };
        $scope.getClientsCountsRanking(1);

        $scope.getClientsCountsRankingByDate = function (date,page) {
            var params = {};
            params.event_date = date;
            params.page = page||$scope.day_ranking_pagination.page || 1;
            params.limit = 20;
            $scope.event_date = date;
            $http.get('sys/lucky_money/partner/2/ranking/analysis', {params: params}).then(function (resp) {
              //  $scope.clientsRankingByDate = resp.data.slice(0, 20);
                $scope.clientsRankingByDate = resp.data.data;
                $scope.day_ranking_pagination = resp.data.pagination;
            });
        };
        $scope.getClientsCountsRankingByDate($filter('date')(new Date(), 'yyyy-MM-dd'),1);
        $scope.redPackEchart = function (chart) {
            chart.on('click', function (params) {
                //  var redPacksByDate = angular.copy($scope.redPackCounts);
                var event_date = $scope.redPackCounts[params.dataIndex].date;
                if (event_date) {
                    $scope.getClientsCountsRankingByDate(event_date,1);
                }
            })
        };

        /*==============================================Logs==================================================*/
        $scope.Logs_params = {};
        $scope.chooseTodayForLogs = function () {
            $scope.Logs_params.begin = $scope.Logs_params.end = new Date();
            $scope.showSendLMLogs(1);
        };
        $scope.chooseYesterdayForLogs = function () {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            $scope.Logs_params.begin = $scope.Logs_params.end = yesterday;
            $scope.showSendLMLogs(1);
        };
        $scope.chooseLast7DaysForLogs = function () {
            $scope.Logs_params.end = new Date();
            var day = new Date();
            day.setDate(day.getDate() - 7);
            $scope.Logs_params.begin = day;
            $scope.showSendLMLogs(1);
        };
        $scope.thisMonthForLogs = function () {
            $scope.Logs_params.end = new Date();
            var monthBegin = new Date();
            monthBegin.setDate(1);
            $scope.Logs_params.begin = monthBegin;
            $scope.showSendLMLogs(1);
        };


        $scope.showSendLMLogs = function (page) {
            var params = angular.copy($scope.Logs_params);
            params.page = page || $scope.pagination.page || 1;
            if (params.begin) {
                params.from = $filter('date')(params.begin, 'yyyyMMdd');
            } else {
                params.from = $filter('date')(new Date(), 'yyyyMMdd');
            }
            if (params.end) {
                params.to = $filter('date')(params.end, 'yyyyMMdd');
            } else {
                params.to = $filter('date')(new Date(), 'yyyyMMdd');
            }
            $http.get('/sys/lucky_money/partner/act/' + $scope.act.act_id + '/logs', {params: params}).then(function (resp) {
                $scope.sendLogs = resp.data.data;
                $scope.pagination = resp.data.pagination;
            });
        };
        $scope.showSendLMLogs();

        $scope.luckyMoneyAnalysis = function (params) {
            $http.get('/sys/lucky_money/partner/act/' + $scope.act.act_id + '/analysis', {params: params}).then(function (resp) {
                $scope.luckyMoneyAnalysis = resp.data;
            });
        };
        $scope.luckyMoneyAnalysis({});

        $scope.showTradeDetail = function (order) {
            orderService.managerOrderDetail(order)
        };

    }]);
    app.controller('actDetailPartnersBinds', ['$scope', '$http', '$state', '$filter', 'commonDialog', 'act', function ($scope, $http, $state, $filter, commonDialog, act) {
        $scope.act = act.data;
        $scope.params = {};
        $scope.bindsPagination = {};
        $scope.getPartnersBinds = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.bindsPagination.page || 1;
            $http.get('/sys/lucky_money/partner/' + $scope.act.act_id + '/binds', {params: params}).then(function (resp) {
                $scope.binds = resp.data.data;
                $scope.bindsPagination = resp.data.pagination;
            });
        };
        $scope.getPartnersBinds(1);

        $scope.getBindsError = function () {
            $http.get('/sys/lucky_money/partner/partners/bind_error').then(function (resp) {
                $scope.error_binds = resp.data;
            });
        };
        $scope.getBindsError();

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
            $scope.getPartnersBinds(1);
        };

    }]);
    return app;
});