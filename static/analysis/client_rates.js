/**
 * Created by yixian on 2016-11-08.
 */
define(['angular', 'echarts', 'jquery', 'uiRouter'], function (angular, echarts, $) {
    'use strict';
    var app = angular.module('clientRatesModule', ['ui.router']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('client_rates', {
            controller: 'clientRateRootCtrl',
            templateUrl: '/static/analysis/templates/client_rates.html',
            url: '/client_rates'
        }).state('client_rates.bduser', {
            url: '/bdusers/{userId}',
            templateUrl: '/static/analysis/templates/client_rates_analysis_bd_view.html',
            controller: 'clientRateBDViewCtrl'
        }).state('client_rates.org', {
            url: '/orgs/{orgId}',
            templateUrl: '/static/analysis/templates/client_rates_analysis.html',
            controller: 'clientRateOrgViewCtrl'
        })
    }]);
    app.controller('clientRateRootCtrl', ['$scope', '$http', '$state', '$filter', '$uibModal', function ($scope, $http, $state, $filter, $uibModal) {
        $scope.params = {days_range: 30};
        $scope.today = new Date();
        $scope.loadOrgs = function () {
            $http.get('/sys/orgs.json').then(function (resp) {
                $scope.orgs = resp.data;
            })
        };
        $scope.loadBDUsers = function () {
            var params = angular.copy($scope.params);
            params.begin = $filter('date')(params.begin, 'yyyyMMdd');
            params.end = $filter('date')(params.end, 'yyyyMMdd');
            if (!params.org_id) {
                params.org_id = null;
            }
            $scope.bd_loading = true;
            $http.get('/analysis/client_rates/bd_users.json', {params: params}).then(function (resp) {
                $scope.bd_loading = false;
                $scope.bdUsers = resp.data.bds;
                $scope.total = resp.data.total;
            },function () {
                $scope.bd_loading = false;
            })
        };
        $scope.chooseLastDays = function (days) {
            $scope.params.end = new Date();
            var begin = new Date();
            begin.setDate(begin.getDate() - days);
            $scope.params.begin = begin;
            $scope.dateRangeChanged();
        };

        $scope.dateRangeChanged = function () {
            $scope.$broadcast('days_range_changed');
            $scope.loadBDUsers();
        };
        if ($filter('withRole')('100')) {
            $scope.chooseLastDays(30);
            if($state.is('client_rates')) {
                $state.go('.bduser', {userId: $scope.currentUser.manager_id});
            }
        } else {
            $scope.chooseLastDays(30);
            if (!$scope.currentUser.org_id) {
                $scope.loadOrgs();
            } else {
                $scope.params.org_id = $scope.currentUser.org_id;
            }
        }

        $scope.openClientBoard = function (client) {
            $uibModal.open({
                templateUrl: '/static/analysis/templates/partner_card.html',
                controller: 'partnerCardCtrl',
                resolve: {
                    clientMoniker: function () {
                        return client.client_moniker
                    }
                },
                size: 'lg'
            })

        };

    }]);
    app.controller('clientRateBDViewCtrl', ['$scope', '$http', '$filter', '$state', '$stateParams', '$uibModal', 'commonDialog',
        function ($scope, $http, $filter, $state, $stateParams, $uibModal, commonDialog) {
            if ($filter('withRole')('100') && $scope.currentUser.manager_id != $stateParams.userId) {
                $state.go('^.bduser', {userId: $scope.currentUser.manager_id});
            }
            $scope.extParams = {
                noactive: {enable: false, range: '1', type: '1', external: {max: 100}},
                transaction: {enable: false, level: 'week', degree: 30}
            };
            $scope.analysis = {};
            $scope.$on('days_range_changed', function () {
                $scope.loadDaysAnalysis();
            });
            $scope.loadDaysAnalysis = function () {
                $scope.loading = true;
                var params = {};
                params.begin = $filter('date')($scope.params.begin, 'yyyyMMdd');
                params.end = $filter('date')($scope.params.end, 'yyyyMMdd');
                if ($scope.extParams.noactive.enable) {
                    params.noactive = $scope.extParams.noactive;
                }
                if ($scope.extParams.transaction.enable) {
                    params.transaction = $scope.extParams.transaction;
                }
                $http.get('/analysis/client_rates/bd_users/' + $stateParams.userId, {params: params}).then(function (resp) {
                    $scope.loading = false;
                    $scope.analysis = resp.data;
                }, function () {
                    $scope.loading = false;
                })
            };
            $scope.loadDaysAnalysis();

            $scope.addReviewDialog = function (client) {
                $uibModal.open({
                    templateUrl: '/static/analysis/templates/client_rate_review_dialog.html',
                    controller: 'clientRateReviewDialogCtrl',
                    resolve: {
                        client: function () {
                            return client;
                        }
                    }
                }).result.then(function () {
                    $scope.loadDaysAnalysis();
                })
            };
        }]);
    app.controller('clientRateReviewDialogCtrl', ['$scope', '$http', '$filter', 'client', function ($scope, $http, $filter, client) {
        $scope.client = client;
        $scope.review = {review_date: new Date()};
        $scope.submit = function () {
            $scope.errmsg = null;
            var review = angular.copy($scope.review);
            review.review_date = $filter('date')(review.review_date, 'yyyyMMdd');
            $http.post('/analysis/client_rates/clients/' + client.client_moniker + '/review_events', review).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        }
    }]);
    app.controller('clientRateOrgViewCtrl', ['$scope', '$http', '$filter', '$state', '$stateParams', '$uibModal',
        function ($scope, $http, $filter, $state, $stateParams, $uibModal) {
            if ($scope.currentUser.org_id && $scope.currentUser.org_id != $stateParams.orgId) {
                $state.go('^.org', {orgId: $scope.currentUser.org_id});
            }
            $scope.extParams = {
                noactive: {enable: false, range: '1', type: '1', external: {max: 100}},
                transaction: {enable: false, level: 'week', degree: 30}
            };
            $scope.$on('days_range_changed', function () {
                $scope.loadDaysAnalysis();
            });

            $scope.addReviewDialog = function (client) {
                $uibModal.open({
                    templateUrl: '/static/analysis/templates/client_rate_review_dialog.html',
                    controller: 'clientRateReviewDialogCtrl',
                    resolve: {
                        client: function () {
                            return client;
                        }
                    }
                }).result.then(function () {
                    $scope.loadDaysAnalysis();
                })
            };

            $scope.analysis = {};
            $scope.loadDaysAnalysis = function () {
                if (!$scope.extParams.noactive.enable && !$scope.extParams.transaction.enable) {
                    return;
                }
                var params = {};
                params.begin = $filter('date')($scope.params.begin, 'yyyyMMdd');
                params.end = $filter('date')($scope.params.end, 'yyyyMMdd');
                if ($scope.extParams.noactive.enable) {
                    params.noactive = $scope.extParams.noactive;
                }
                if ($scope.extParams.transaction.enable) {
                    params.transaction = $scope.extParams.transaction;
                }
                $scope.loading = true;
                $http.get('/analysis/client_rates/orgs/' + ($stateParams.orgId || 'all'), {params: params}).then(function (resp) {
                    $scope.loading = false;
                    $scope.analysis = resp.data;
                }, function () {
                    $scope.loading = false;
                })
            };
            // $scope.loadDaysAnalysis();
        }]);

    app.directive('clientActiveRateView', ['$filter', function ($filter) {
        return {
            restrict: 'AE',
            templateUrl: '/static/analysis/templates/client_active_rate_view.html',
            scope: {
                clientActiveRateView: '=',
                clientClick: '&',
                attachReview: '&'
            },
            link: function ($scope, $element, $attr) {
                $scope.ctrl = {};
                var resize = function () {
                    setTimeout(function () {
                        $('.analysis-box').width($('.active-rate-view').innerWidth() - $('.client-names').outerWidth() - 1)
                    },500);

                };
                $($element).resize(resize);
                $scope.handleClientClick = function (client) {
                    if (angular.isFunction($scope.attachReview)) {
                        $scope.attachReview({$client: client});
                    }
                };
                $scope.showClientBoard = function (client) {
                    if (angular.isFunction($scope.clientClick)) {
                        $scope.clientClick({$client: client});
                    }
                };
                $scope.$watch('clientActiveRateView', function (data) {
                    if (!data) {
                        return;
                    }
                    $scope.clients = [];
                    var maxRate = 0;
                    angular.forEach(data.clients, function (client) {
                        angular.forEach(client.trade_analysis, function (trade) {
                            maxRate = Math.max(maxRate, Math.log(Number(trade.total_amount)));
                        })
                    });

                    angular.forEach(data.clients, function (client) {
                        var cli = {client_moniker: client.client_moniker, trade_analysis: {}};
                        angular.forEach(client.trade_analysis, function (trade) {
                            trade = angular.copy(trade);
                            cli.trade_analysis[$filter('date')(new Date(trade.create_date), 'yyyyMMdd')] = trade;

                            var rate = Math.log(Number(trade.total_amount));
                            var h = 45 - parseInt(45 * rate / maxRate);
                            trade.style = {background: 'hsl(' + h + ',70%,60%)'};
                            trade.client = cli;
                        });
                        angular.forEach(client.events, function (evt) {
                            var date = new Date(evt.date);
                            var trade = cli.trade_analysis[$filter('date')(date, 'yyyyMMdd')];
                            if (!trade) {
                                trade = {
                                    create_date: $filter('date')(date, 'yyyy/MM/dd'),
                                    total_count: 0,
                                    total_amount: 0
                                };
                                cli.trade_analysis[$filter('date')(date, 'yyyyMMdd')] = trade;
                            }
                            trade.events = trade.events || [];
                            var evtItem = $filter('clientRateEventFilter')(evt);
                            if (evtItem) {
                                trade.events.push(evtItem);
                            }

                        });
                        $scope.clients.push(cli);
                        resize();
                    });
                    $scope.dates = [];
                    angular.forEach(data.days_range, function (dt) {
                        $scope.dates.push(new Date(dt))
                    })
                });
                $element.hover(function () {
                    $scope.ctrl.mouseInSide = true;
                }, function () {
                    $scope.ctrl.mouseInSide = false;
                });

                $element.on('mousemove', function (evt) {
                    var x = evt.pageX;
                    var y = evt.pageY;
                    x -= $element.offset().left;
                    y -= $element.offset().top;
                    var infobox = $('.trade-info-box');
                    var position = {left: x + 10, top: y + 10};
                    var size = {width: infobox.width(), height: infobox.height()};
                    if (position.left + size.width > $element.width() - 10) {
                        position.left -= (size.width + 25)
                    }
                    if (position.top + size.height > $element.height() - 20) {
                        position.top -= (size.height + 25);
                    }
                    infobox.css(position);

                });
                resize();
            }
        }
    }]);
    app.filter('clientRateEventFilter', ['$uibModal', function ($uibModal) {
        var hash = {
            'create': {display: 'text-green', label: '新增商户', symbol: 'text-success fa fa-plus'},
            'review': {
                display: '',
                label: '回访',
                symbol: 'text-info fa fa-calendar-o',
                click: function (evt, clientMoniker) {
                    $uibModal.open({
                        templateUrl: '/static/analysis/templates/client_rate_review_detail_dialog.html',
                        controller: 'clientRateReviewDetailDialogCtrl',
                        resolve: {
                            evtInfo: function () {
                                return evt;
                            },
                            clientMoniker: function () {
                                return clientMoniker;
                            }
                        }
                    })
                }
            }
        };
        return function (event) {
            if (hash[event.type]) {
                return angular.merge({}, event, hash[event.type]);
            }
            return null;
        }
    }]);
    app.controller('clientRateReviewDetailDialogCtrl', ['$scope', 'evtInfo', 'clientMoniker', function ($scope, evtInfo, clientMoniker) {
        $scope.evtInfo = evtInfo;
        $scope.clientMoniker = clientMoniker;
    }]);
    return app;
});