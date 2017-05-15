/**
 * Created by yishuqian on 28/09/2016.
 */
define(['angular', 'static/commons/commons', 'static/commons/angular-ueditor', 'uiBootstrap', 'uiRouter', 'ngBootSwitch', 'ngFileUpload'], function (angular) {
    'use strict';

    var partnerRoles = [
        {code: 1, label: 'Admin'},
        {code: 2, label: 'Manager'},
        {code: 3, label: 'Cashier'}
    ];
    var app = angular.module('noticeApp', ['ui.bootstrap', 'ui.router', 'frapontillo.bootstrap-switch', 'ngFileUpload', 'ng.uditor']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('notice', {
            url: '/notices',
            templateUrl: '/static/config/notice/templates/notice.html',
            controller: 'noticeListCtrl',
            data: {label: '公告列表'}
        }).state('notice.new', {
            url: '/new',
            templateUrl: '/static/config/notice/templates/notice_add.html',
            controller: 'addNoticeCtrl'
        }).state('notice.detail', {
            url: '/{notice_id}/detail',
            templateUrl: '/static/config/notice/templates/notice_detail.html',
            controller: 'noticeDetailCtrl',
            resolve: {
                notice: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/notice/' + $stateParams.notice_id);
                }]
            }
        }).state('notice.edit', {
            url: '/{notice_id}/edit',
            templateUrl: '/static/config/notice/templates/notice_add.html',
            controller: 'noticeEditCtrl',
            resolve: {
                notice: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/notice/' + $stateParams.notice_id);
                }]
            }
        })
    }]);
    app.controller('noticeListCtrl', ['$scope', '$http', '$uibModal', 'commonDialog', function ($scope, $http, $uibModal, commonDialog) {
        $scope.pagination = {};
        $scope.params = {};

        $scope.loadNotices = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.pagination.page || 1;
            $http.get('/sys/notice', {params: params}).then(function (resp) {
                $scope.notices = resp.data.data;
                $scope.pagination = resp.data.pagination;
            });
        };
        $scope.loadNotices(1);

        $scope.showNotice = function (notice) {
            $uibModal.open({
                templateUrl: '/static/commons/templates/notice_detail.html',
                controller: 'noticePreviewCtrl',
                resolve: {
                    notice: notice
                },
                size: 'lg'
            }).result.then(function () {
            })
        };

        $scope.send = function (notice) {
            if (notice.end_time) {
                notice.status = '1';
                $http.put('/sys/notice/' + notice.notice_id, notice).then(function (resp) {
                    commonDialog.alert({title: 'Success', content: 'Send Successfully', type: 'success'});
                    $scope.loadNotices(1);
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
                });
            } else {
                commonDialog.alert({title: 'Error', content: 'Expiry Date can not be null', type: 'error'});
            }

        }
    }]);
    app.controller('addNoticeCtrl', ['$scope', '$http', '$filter', '$state', 'commonDialog', function ($scope, $http, $filter, $state, commonDialog) {
        $scope.saveNoticeResult = false;
        $scope.notice = {};
        $scope.today = new Date();
        $scope.save = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            var notice = angular.copy($scope.notice);
            if (notice.end_time) {
                notice.end_time = $filter('date')(notice.end_time, 'yyyyMMdd')
            } else {
                if (notice.status == '1') {
                    commonDialog.alert({title: 'Error', content: 'Expiry Date can not be null', type: 'error'});
                    $scope.notice.status = '0';
                    return;
                }
            }
            $scope.saveNoticeResult = true;
            $http.post('/sys/notice', notice).then(function (resp) {
                $scope.saveNoticeResult = false;
                commonDialog.alert({title: 'Success', content: 'Add a notice successfully', type: 'success'});
                $scope.loadNotices(1);
                $state.go('^.detail', {notice_id: resp.data.notice_id})
            }, function (resp) {
                $scope.saveNoticeResult = false;
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            });
        };
    }]);
    app.controller('noticeDetailCtrl', ['$scope', '$http', '$state', '$uibModal', 'commonDialog', 'notice', function ($scope, $http, $state, $uibModal, commonDialog, notice) {
        $scope.notice = notice.data;
        $scope.pagination = {};
        $scope.params = {};

        $scope.totalClients = function () {
            $http.get('/sys/notice/' + $scope.notice.notice_id + '/clients').then(function (resp) {
                $scope.total_clients = resp.data;
            });
        };
        $scope.listClients = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.pagination.page || 1;
            $http.get('/sys/notice/' + $scope.notice.notice_id + '/readclients', {params: params}).then(function (resp) {
                $scope.clients = resp.data.data;
                $scope.pagination = resp.data.pagination;
            });
        }
        if ($scope.notice.status == '1') {
            $scope.listClients();
            $scope.totalClients();
        }
    }]);
    app.controller('noticeEditCtrl', ['$scope', '$http', '$filter', '$timeout', '$state', '$uibModal', 'commonDialog', 'notice',
        function ($scope, $http, $filter, $timeout, $state, $uibModal, commonDialog, notice) {
            $scope.saveNoticeResult = false;
            $scope.notice = notice.data;

            if (notice.data.end_time != null) {
                $scope.notice.end_time = new Date(notice.data.end_time);
            }
            console.log($scope.notice);
            $scope.today = new Date();
            $scope.save = function (form) {
                if (form.$invalid) {
                    angular.forEach(form, function (item, key) {
                        if (key.indexOf('$') < 0) {
                            item.$dirty = true;
                        }
                    });
                    return;
                }
                var notice = angular.copy($scope.notice);
                if (notice.end_time) {
                    notice.end_time = $filter('date')(notice.end_time, 'yyyyMMdd')
                } else {
                    if (notice.status == '1') {
                        $scope.notice.status = '0';
                        commonDialog.alert({title: 'Error', content: 'Expiry Date can not be null', type: 'error'});

                        return;
                    }
                }
                $scope.saveNoticeResult = true;
                $http.put('/sys/notice/' + $scope.notice.notice_id, notice).then(function (resp) {
                    $scope.saveNoticeResult = false;
                    commonDialog.alert({title: 'Success', content: 'Update a notice successfully', type: 'success'});
                    $scope.loadNotices(1);
                    $state.go('^.detail', {notice_id: $scope.notice.notice_id})
                }, function (resp) {
                    $scope.saveNoticeResult = false;
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
                });
            };

            $scope.selectClients = function (notice) {
                $http.get('/sys/partners/list').then(function (resp) {
                    if (resp.data.length) {
                        return $uibModal.open({
                            controller: 'clientsSectorCtrl',
                            templateUrl: '/static/config/notice/templates/partners_select.html',
                            resolve: {
                                notice: function () {
                                    return notice;
                                },
                                clients: function () {
                                    return resp.data;
                                }
                            },
                            size: 'lg'
                        }).result.then(function () {

                        })
                    }
                })
            }
        }]);

    app.controller('clientsSectorCtrl', ['$scope', '$http', 'notice', 'clients', 'commonDialog','$state', function ($scope, $http, notice, clients, commonDialog,$state) {
        $scope.partners=angular.copy(clients)||{};
        // $scope.select={};
        $scope.selectedPartners = "";
        $scope.selectAll = function () {
            if ($scope.partners.select_all) {
                $scope.selectedPartners = "";
                $scope.partners.forEach(function (e) {
                    e.select = true;
                    $scope.selectedPartners = $scope.selectedPartners + e.client_moniker + ',';
                });
                $scope.selectedPartners = $scope.selectedPartners.substr(0, $scope.selectedPartners.length - 1)
            } else {
                $scope.selectedPartners = "";
                $scope.partners.forEach(function (e) {
                    e.select = false
                })

            }
        };
        $scope.selectPartners = function () {
            $scope.selectedPartners = "";
            $scope.partners.forEach(function (e) {
                if (e.select == 1) {
                    $scope.selectedPartners = $scope.selectedPartners + e.client_moniker + ',';
                }
            });
            $scope.selectedPartners = $scope.selectedPartners.substr(0, $scope.selectedPartners.length - 1);
        };

        $scope.params = {textType: 'all'};

        $scope.loadPartners = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.pagination.page || 1;
            $http.get('/sys/partners/list', {params: params}).then(function (resp) {
                $scope.partners = resp.data;
            });
        };

        $scope.listBDUsers = function () {
            $http.get('/sys/manager_accounts/roles/bd_user.json').then(function (resp) {
                $scope.bdUserSource = resp.data;
            })
        };
        $scope.listBDUsers();

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
            $scope.loadPartners(1);
        };

        //  $scope.loadPartners(1);

        $scope.saveSelectedPartners = function () {
            notice.send_clients = angular.copy($scope.selectedPartners);
            $http.put('/sys/notice/' + notice.notice_id, notice).then(function (resp) {
                $scope.saveNoticeResult = false;
                commonDialog.alert({title: 'Success', content: 'Add send partners successfully', type: 'success'});
                $scope.$close();
                $state.go('^.edit', {notice_id: notice.notice_id});
            }, function (resp) {
                $scope.saveNoticeResult = false;
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            });
        }
    }]);

    app.controller('noticePreviewCtrl', ['$scope', '$http', '$sce', 'notice', function ($scope, $http, $sce, notice) {
        $scope.previewStatus = true;
        $scope.notice = notice;
        $scope.getContentHtml = function () {
            return $sce.trustAsHtml(notice.content);
        };
    }]);

    return app;
});