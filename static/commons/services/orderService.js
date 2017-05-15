/**
 * Created by davep on 2016-08-15.
 */
define(['../app'], function (app) {
    'use strict';
    app.factory('orderService', ['$uibModal', function ($uibModal) {
        function openDetail(url) {
            $uibModal.open({
                templateUrl: '/static/commons/templates/order_detail.html',
                controller: 'orderDetailDialogCtrl',
                resolve: {
                    order: ['$http', function ($http) {
                        return $http.get(url);
                    }]
                }
            })
        }
        function editDetail(url) {
            $uibModal.open({
                templateUrl: '/static/payment/tradelog/templates/partner_trade_detail_edit.html',
                controller: 'orderDetailEditCtrl',
                resolve: {
                    order: ['$http', function ($http) {
                        return $http.get(url);
                    }]
                }
            })
        }

        return {
            managerOrderDetail: function (order) {
                openDetail('/sys/partners/' + order.client_moniker + '/trade_logs/' + order.order_id)
            },
            clientOrderDetail: function (order) {
                editDetail('/client/partner_info/trade_logs/' + order.order_id);
            }
        }
    }]);
    app.controller('orderDetailDialogCtrl', ['$scope', 'order', function ($scope, order) {
        $scope.order = order.data;
    }]);
    app.controller('orderDetailEditCtrl', ['$scope', '$http', 'commonDialog', 'order', function ($scope, $http, commonDialog,order) {
        $scope.order = order.data;
        $scope.updateDetail = function (order) {
            $http.put('/client/partner_info/trade_logs/'+$scope.order.order_id, $scope.order).then(function () {
                commonDialog.alert({
                    title: 'Success',
                    content: 'Update Order Detail information successfully',
                    type: 'success'
                });
            })
        };
        
    }]);
});