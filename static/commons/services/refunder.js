/**
 * Created by yixian on 2016-07-04.
 */
define(['../app'], function (app) {
    'use strict';
    app.factory('refunder', ['$rootScope', '$uibModal', 'commonDialog', function ($rootScope, $uibModal, commonDialog) {
        return {
            refund: function (orderId) {
                $uibModal.open({
                    templateUrl: '/static/commons/templates/refund_dialog.html',
                    controller: 'refundDialogCtrl',
                    resolve: {
                        order: ['$http', function ($http) {
                            return $http.get('/api/payment/v1.0/refund/orders/' + orderId + '/refund_check');
                        }]
                    }
                }).result.then(function () {
                    commonDialog.alert({title: 'Success', content: 'refund success', type: 'success'});
                    $rootScope.$broadcast('order_refunded', orderId);
                })
            },
            refunded: function (orderId) {
                $uibModal.open({
                    templateUrl: '/static/commons/templates/refund_log_dialog.html',
                    controller: 'refundLogDialogCtrl',
                    size: 'lg',
                    resolve: {
                        logs: ['$http', function ($http) {
                            return $http.get('/sys/trade_logs/' + orderId + '/refunds');
                        }]
                    }
                })
            }
        };
    }]);
    app.controller('refundDialogCtrl', ['$scope', '$http', 'order', function ($scope, $http, order) {
        $scope.order = order.data;
        $scope.fee = {fee: 0};
        $scope.refundAll = function () {
            $scope.fee.fee = $scope.order.available;
            $scope.submitRefundOrder();
        };
        $scope.submitRefundOrder = function () {
            $scope.sending = true;
            $scope.errmsg = null;
            if ($scope.fee.fee <= 0 || $scope.fee.fee > $scope.order.available) {
                $scope.errmsg = 'refund amount must more than 0 and less than available amount';
                $scope.sending = remark;
                return;
            }

            $http.post('/api/payment/v1.0/refund/orders/' + $scope.order.order_id, {
                fee: $scope.fee.fee,
                original_number: true,
                remark: $scope.fee.remark
            }).then(function () {
                $scope.sending = false;
                $scope.$close();
            }, function (resp) {
                $scope.sending = false;
                $scope.errmsg = resp.data.message;
            })
        }
    }]);
    app.controller('refundLogDialogCtrl', ['$scope', 'logs', function ($scope, logs) {
        $scope.logs = logs.data;
    }])
});