/**
 * balance list on partner client
 * Created by yishuqian on 9/9/16.
 */
define(['angular','static/commons/commons','uiBootstrap', 'uiRouter'], function (angular) {
    'use strict';
    var app = angular.module('transReport', ['ui.bootstrap', 'ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('transreport', {
            url: '/report',
            templateUrl: '/static/payment/tradelog/templates/trans_report.html',
            controller: 'transReportCtrl'
        })
    }]);
    app.controller('transReportCtrl', ['$scope', '$http', '$filter', '$timeout', 'commonDialog', function ($scope, $http, $filter, $timeout, commonDialog) {
        $scope.params = {};
        $scope.today = new Date();
        $scope.chooseToday = function () {
            $scope.params.datefrom = $scope.params.dateto = new Date();
        };
        $scope.chooseYesterday = function () {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            $scope.params.datefrom = $scope.params.dateto = yesterday;
        };
        $scope.chooseLast7Days = function () {
            $scope.params.dateto = new Date();
            var day = new Date();
            day.setDate(day.getDate() - 7);
            $scope.params.datefrom = day;
        };
        $scope.thisMonth = function () {
            $scope.params.dateto = new Date();
            var monthBegin = new Date();
            monthBegin.setDate(1);
            $scope.params.datefrom = monthBegin;
        };
        $scope.lastMonth = function () {
            var monthFinish = new Date();
            monthFinish.setDate(0);
            $scope.params.dateto = monthFinish;
            var monthBegin = new Date();
            monthBegin.setDate(0);
            monthBegin.setDate(1);
            $scope.params.datefrom = monthBegin;
        };
        $scope.thisYear = function () {
            var yearFinish = new Date();
            $scope.params.dateto = yearFinish;
            var currentYearFirstDate = new Date(new Date().getFullYear(), 0, 1);
            $scope.params.datefrom = currentYearFirstDate;
        };
        $scope.chooseLast7Days();
        
        $scope.export = function () {
            var url='/sys/trade_logs/report/excel';
            var connectSymbol = '?';
            var params = angular.copy($scope.params);
            if (DateDiff(params.dateto,params.datefrom)>31){
                commonDialog.alert({title: 'Error', content: '日期区间不能超过31天', type: 'error'})
            }
            if (params.datefrom) {
                params.datefrom = $filter('date')(params.datefrom, 'yyyyMMdd');
                url += connectSymbol + 'datefrom=' + params.datefrom;
                connectSymbol = '&';
            }
            if (params.dateto) {
                params.dateto = $filter('date')(params.dateto, 'yyyyMMdd');
                url += connectSymbol + 'dateto=' + params.dateto;
            }
            return url;

        };

        function DateDiff(d1,d2){
            var day = 24 * 60 * 60 *1000;
            try{
                var dateArr = d1.split("-");
                var checkDate = new Date();
                checkDate.setFullYear(dateArr[0], dateArr[1]-1, dateArr[2]);
                var checkTime = checkDate.getTime();

                var dateArr2 = d2.split("-");
                var checkDate2 = new Date();
                checkDate2.setFullYear(dateArr2[0], dateArr2[1]-1, dateArr2[2]);
                var checkTime2 = checkDate2.getTime();

                var cha = (checkTime - checkTime2)/day;
                return cha;
            }catch(e){
                return false;
            }
        };
        
        $scope.showConfig = function () {
            $http.get('/sys/report_config.json').then(function (resp) {
                $scope.config = resp.data;
            });
        };
        $scope.showConfig();
        
        $scope.findOneConfig = function () {
            $http.get('/sys/report_config/'+$scope.config.pkid).then(function (resp) {
                $scope.config = resp.data;
            });
        };
        
        $scope.editConfig = function () {
            $http.put('/sys/report_config/' + $scope.config.pkid, $scope.config).then(function () {
                commonDialog.alert({
                    title: 'Success',
                    content: 'Update report config successfully',
                    type: 'success'
                });
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            });
        }
        
    }]);

    return app;
});