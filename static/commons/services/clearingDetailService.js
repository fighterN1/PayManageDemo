/**
 * Created by davep on 2016-08-15.
 */
define(['../app'], function (app) {
    'use strict';
    app.factory('clearingDetailService', ['$uibModal', function ($uibModal) {
        function openDetail(url,is_partner) {
            $uibModal.open({
                templateUrl: '/static/payment/tradelog/templates/partner_settlement_dialog.html',
                controller: 'clearingDetailCtrl',
                resolve: {
                    detail: ['$http', function ($http) {
                        return $http.get(url);
                    }],
                    is_partner:is_partner
                },
                size:'lg'
            })
        }
        return {
            clientClearingDetail: function (client_id,clearing_data,is_partner) {
                openDetail('/client/clean_logs/' + client_id+'/'+clearing_data,is_partner);
            }

        }
    }]);
    app.controller('clearingDetailCtrl', ['$scope','detail','is_partner', function ($scope,detail,is_partner) {
        $scope.report = detail.data;
        $scope.is_partner = is_partner;
    }]);
});