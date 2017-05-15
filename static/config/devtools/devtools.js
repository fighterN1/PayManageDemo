/**
 * Created by yixian on 2016-07-06.
 */
define(['angular', 'uiRouter', 'uiBootstrap'], function (angular) {
    'use strict';
    var app = angular.module('devtoolsApp', ['ui.router', 'ui.bootstrap']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('devtools', {
            url: '/dev_tools',
            templateUrl: '/static/config/devtools/templates/root.html',
            controller: ['$scope', function ($scope) {

            }]
        }).state('devtools.manual_refund', {
            url: '/manual_refund',
            templateUrl: '/static/config/devtools/templates/manual_refund.html',
            controller: 'devManualRefundCtrl'
        }).state('devtools.wx_settlements', {
            url: '/wx_settlements',
            templateUrl: '/static/config/devtools/templates/wx_settlements.html',
            controller: 'devWxSettlementsCtrl'
        }).state('devtools.fix_transaction', {
            url: '/fix_transaction',
            templateUrl: '/static/config/devtools/templates/fix_transaction.html',
            controller: 'devFixTransactionCtrl'
        }).state('devtools.order_check', {
            url: '/order_check',
            templateUrl: '/static/config/devtools/templates/order_check.html',
            controller: 'devOrderCheckCtrl'
        }).state('devtools.generate_austrac', {
            url: '/austrac_generate',
            templateUrl: '/static/config/devtools/templates/generate_austrac_data.html',
            controller: 'devAustracDataCtrl'
        }).state('devtools.mail', {
            url: '/mail',
            templateUrl: '/static/config/devtools/templates/mail.html',
            controller: 'devMailCtrl'
        }).state('devtools.weekreport', {
            url: '/weekreport',
            templateUrl: '/static/config/devtools/templates/weekreport.html',
            controller: 'devWeekReportCtrl'
        }).state('devtools.auth_message', {
            url: '/auth_message',
            templateUrl: '/static/config/devtools/templates/auth_message.html',
            controller: 'devAuthMessageCtrl'
        });
    }]);
    app.controller('devManualRefundCtrl', ['$scope', '$http', 'commonDialog', function ($scope, $http, commonDialog) {
        $scope.sendRefund = function () {
            var refund = angular.copy($scope.refund);
            refund.amount = Math.floor(refund.amount * 100);
            $http.get('/dev/manual_refund', {params: refund}).then(function (resp) {
                $scope.refund = {};
                commonDialog.alert({title: 'SUCCESS', content: resp.data.xml, type: 'success'})
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        }
    }]);
    app.controller('devWxSettlementsCtrl', ['$scope', '$http', '$filter', 'commonDialog', function ($scope, $http, $filter, commonDialog) {
        $scope.params = {from: new Date(), to: new Date()};
        $scope.loadSettlements = function () {
            var params = {};
            params.from = $filter('date')($scope.params.from, 'yyyyMMdd');
            params.to = $filter('date')($scope.params.to, 'yyyyMMdd');
            $http.get('/dev/wx_settlements', {params: params}).then(function (resp) {
                $scope.settleLogs = resp.data;
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        }
    }]);
    app.controller('devFixTransactionCtrl', ['$scope', '$http', '$uibModal', 'commonDialog', function ($scope, $http, $uibModal, commonDialog) {
        $scope.fixTransactions = function () {
            $http.put('/dev/fix_transaction').then(function () {
                commonDialog.alert({title: 'Success', content: 'fixed', type: 'success'})
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        };
        $scope.resend = {};
        $scope.resendNotify = function () {
            if (!$scope.resend.date) {
                return;
            }
            $http.put('/dev/notify_resend', $scope.resend).then(function () {
                commonDialog.alert({title: 'Success', content: 'fixed', type: 'success'})
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        };
        $scope.resendLuckyMoney = function () {
            $http.put('/dev/activities/luckymoney/resend').then(function (resp) {
                $uibModal.open({
                    templateUrl: '/static/config/devtools/templates/luckymoney_result.html',
                    controller: ['$scope', 'redpacks', function ($scope, redpacks) {
                        $scope.redpacks = redpacks;
                    }],
                    size: 'lg',
                    resolve: {
                        redpacks: function () {
                            return resp.data;
                        }
                    }
                })
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            });
        };
    }]);
    app.controller('devOrderCheckCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.search = {};
        $scope.check = function () {
            $scope.errmsg = null;
            $scope.xmlStr = null;
            if (!$scope.search.order_id) {
                return;
            }
            $http.get('/dev/orders/' + $scope.search.order_id + '/detail').then(function (resp) {
                $scope.xmlStr = resp.data.xml;
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        };
        $scope.checkRefund = function () {
            $scope.errmsg = null;
            $scope.xmlStr = null;
            if (!$scope.search.order_id) {
                return;
            }
            $http.get('/dev/order_refunds/' + $scope.search.order_id + '/detail').then(function (resp) {
                $scope.xmlStr = resp.data.xml;
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        }
    }]);
    app.controller('devAustracDataCtrl', ['$scope', '$filter', '$http', 'commonDialog', function ($scope, $filter, $http, commonDialog) {
        $scope.params = {};
        $scope.generate = function () {
            var params = angular.copy($scope.params);
            if (params.datefrom) {
                params.datefrom = $filter('date')(params.datefrom, 'yyyyMMdd');
            } else {
                commonDialog.alert({title: 'Error', content: "开始时间不能为空", type: 'error'});
                return;
            }
            if (params.dateto) {
                params.dateto = $filter('date')(params.dateto, 'yyyyMMdd');
            } else {
                commonDialog.alert({title: 'Error', content: "结束时间不能为空", type: 'error'});
                return;
            }
            $http.get('/dev/austrac/generate', {params: params}).then(function () {
                commonDialog.alert({title: 'Success', content: 'Generate OK', type: 'success'})
            }, function (resp) {
                commonDialog.alert({title: 'Success', content: resp.data.message, type: 'error'})
            });
        };
    }]);
    app.controller('devSettlementCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.loadMonthLog = function (month) {
            var monthStr = $filter('date')(month, 'yyyyMM');
            $http.get('/dev/settlement/month/' + monthStr + '/settled_dates').then(function (resp) {
                $scope.settledDates = resp.data;
            });
        }
    }]);

    app.controller('devMailCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.sendTestMail = function () {
            $http.post('/dev/mail')
        }
    }]);
    app.controller('devWeekReportCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.reportconfig = {send_msg: false};
        $scope.generateWeekReport = function () {
            var data = angular.copy($scope.reportconfig);
            data.date = $filter('date')(data.date, 'yyyy-MM-dd');
            $http.post('/analysis/week_reports/generate', data).then(function () {
                alert('ok')
            }, function (resp) {
                alert(resp.data.message);
            })
        }
    }]);
    app.controller('devAuthMessageCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.sendAuthMessage = function () {
            $http.get('/simpleclient/auth_message').then(function (resp) {
                alert('ok')
            }, function (resp) {
                alert(resp.data.message);
            })
        }
    }]);
    return app;
});