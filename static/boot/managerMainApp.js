/**
 * Created by yixian on 2016-06-29.
 */
define(['angular', 'angularSanitize', 'angularAnimate', 'angularMessages', 'uiRouter', 'uiBootstrap', 'ngFileUpload', 'sockjs', 'stomp'], function (angular) {
    'use strict';
    var app = angular.module('managerMainApp', ['ngSanitize', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ngFileUpload']);
    app.config(['$urlRouterProvider', function ($urlRouterProvider) {
        $urlRouterProvider.otherwise(((window.currentUser.role & parseInt('100000', 2)) > 0) ? '/managers' : '/dashboard');
    }]);
    app.controller('managerIndexCtrl', ['$scope', '$rootScope', '$http', '$log', '$timeout', '$interval', '$uibModal', 'myLoginLogView', 'commonDialog',
        function ($scope, $rootScope, $http, $log, $timeout, $interval, $uibModal, myLoginLogView, commonDialog) {
            var stompClient = null;
            $scope.loadCurrentUser = function () {
                $http.get('/global/userstatus/current_manager.json').then(function (resp) {
                    $rootScope.currentUser = resp.data;
                    // connectWebSocket();
                    if ($rootScope.currentUser.role & parseInt('110', 2)) {
                        $scope.loadPartnerApplyNotice();
                    }
                    // if ($rootScope.currentUser.role ==2 || $rootScope.currentUser.role == 4){
                    //     $scope.loadPartnerApplyNotice();
                    // }
                }, function (resp) {
                    if (resp.status == 403) {
                        location.href = 'm_login.html?f='+encodeURIComponent(location.href);
                    }
                })
            };
            $scope.loadCurrentUser();

            $scope.getManagerTodoNotices = function () {
                $http.get('/global/userstatus/manager_todo_notices.json').then(function (resp) {
                    if (resp.data.length) {
                        $uibModal.open({
                            controller: 'managerTodoNoticeCtrl',
                            templateUrl: '/static/boot/templates/manager_todo.html',
                            resolve: {
                                notices: function () {
                                    return resp.data;
                                }
                            }
                        })
                    }
                })
            };
            $scope.getManagerTodoNotices();


            var connected;
            $interval($scope.loadCurrentUser, 300000);

            function connectWebSocket() {
                if (connected && stompClient) {
                    return;
                }
                var sock = new SockJS('/register');
                stompClient = window.Stomp.over(sock);
                stompClient.connect({}, function (frame) {
                    $log.debug('websocket connected:' + frame);
                    connected = true;
                    stompClient.subscribe('/app/manager/page_events', function (msg) {
                        $log.debug('new event notice:' + msg.body);
                        var msgBody = JSON.parse(msg.body);
                        $scope.$broadcast(msgBody.event, msgBody.data);
                    });
                }, function () {
                    $log.error('连接失败，3秒后尝试重连');
                    connected = false;
                    $timeout(connectWebSocket, 3000);
                })
            }

            $scope.showMyLoginLogs = function () {
                myLoginLogView.show();
            };

            $scope.toggleHideSideBar = function () {
                $scope.hideSideBar = !$scope.hideSideBar;
            };

            $scope.showQrCode = function (url) {
                return $uibModal.open({
                    template: '<div style="width: 100%;padding: 10px;">请使用微信扫描<br><div style="width:100%" qrcode="url"></div></div>',
                    controller: ['$scope', 'url', function ($scope, url) {
                        $scope.url = url;
                    }],
                    size: 'sm',
                    resolve: {
                        url: function () {
                            return url;
                        }
                    }
                })
            };
            $scope.logout = function () {
                $http.put('/global/userstatus/manager_signout').then(function () {
                    location.href = '/m_login.html';
                });
            };
            $scope.changePwd = function () {
                $uibModal.open({
                    templateUrl: '/static/boot/templates/change_pwd_dialog.html',
                    controller: 'changePwdCtrl',
                    size: 'sm'
                }).result.then(function () {
                    commonDialog.alert({title: '操作成功', content: '您成功修改了密码', type: 'success'})
                })
            };
            $scope.currentUserHasRole = function (role) {
                return ($scope.currentUser.role & role) > 0
            };
            $scope.loadPartnerApplyNotice = function () {
                var params = {};
                $http.get('/partners/application/notice.json', {params: params}).then(function (resp) {
                    $scope.partner_application_new = resp.data.counts;
                })
            };
            $scope.managerBindWechat = function () {
                $http.post('/system/manager_wechat_binds').then(function (resp) {
                    $scope.showQrCode(resp.data.url);
                })
            }

        }]);
    app.controller('changePwdCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.formData = {};
        $scope.submit = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') <= 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            if ($scope.formData.pwd != $scope.formData.repeatpwd) {
                $scope.errmsg = '两次输入密码不一致';
                return;
            }
            $scope.errmsg = null;
            $http.put('/global/userstatus/manager_password', $scope.formData).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        }
    }]);
    app.controller('managerTodoNoticeCtrl', ['$scope', 'notices', function ($scope, notices) {
        $scope.notices = notices;
    }]);
    app.factory('myLoginLogView', ['$uibModal', function ($uibModal) {
        return {
            show: function () {
                $uibModal.open({
                    templateUrl: '/static/boot/templates/user_login_logs.html',
                    controller: ['$scope', '$http', function ($scope, $http) {
                        $scope.pagination = {};
                        $scope.getMyLoginLogs = function (page) {
                            var params = {page: page || $scope.pagination.page || 1};
                            $http.get('/global/userstatus/current_manager/login_logs', {params: params}).then(function (resp) {
                                $scope.pagination = resp.data.pagination;
                                $scope.loginLogs = resp.data.data;
                            })
                        };
                        $scope.getMyLoginLogs();
                    }]
                })
            }
        }
    }]);
    app.filter('withRole', ['$rootScope', function ($rootScope) {
        return function (roleCode) {
            if (angular.isNumber(roleCode)) {
                var code = roleCode;
            } else {
                code = parseInt(roleCode, 2);
            }
            return ($rootScope.currentUser.role & code) > 0
        }
    }]);
    app.filter('withModule', ['$rootScope', function ($rootScope) {
        return function (moduleName) {
            return $rootScope.currentUser.module_names.indexOf(moduleName) >= 0;
        }
    }]);
    app.filter('withFunc', ['$rootScope', function ($rootScope) {
        return function (funcName) {
            return $rootScope.currentUser.available_func_names.indexOf(funcName) >= 0;
        }
    }]);

    app.filter('tradeStatus', function () {
        return function (status) {
            switch (status + '') {
                case '0':
                    return 'Creating';
                case '1':
                    return 'Failed Create Order';
                case '2':
                    return 'Wait For Payment';
                case '3':
                    return 'Closed';
                case '4':
                    return 'Payment Failed';
                case '5':
                    return 'Payment Successful';
                case '6':
                    return 'Partial Refund';
                case '7':
                    return 'Full Refund';
            }
        }
    });
    app.filter('refundStatus', function () {
        return function (status) {
            switch (status + '') {
                case '0':
                case'1':
                    return 'Submit Failed';
                case '2':
                    return 'Submit Success';
                case '3':
                    return 'Failed';
                case '4':
                    return 'Success';
                case '5':
                    return 'Change'
            }
        }
    });
    app.filter('tradeGateway', function () {
        return function (gateway) {
            switch (gateway + '') {
                case '0':
                    return '线下扫码';
                case '1':
                    return '线下扫码';
                case '2':
                    return '商户静态码';
                case '3':
                    return '线上网关';
                case '4':
                    return 'JSAPI网关';
                case '5':
                    return '线下网关';
                case '6':
                    return '线下网关';
                case '7':
                    return '商户静态码';
            }
        }
    });

    app.constant('uiDatetimePickerConfig', {
        dateFormat: 'yyyy-MM-dd HH:mm',
        defaultTime: '00:00:00',
        html5Types: {
            date: 'yyyy-MM-dd',
            'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
            'month': 'yyyy-MM'
        },
        initialPicker: 'date',
        reOpenDefault: false,
        enableDate: true,
        enableTime: true,
        buttonBar: {
            show: true,
            now: {
                show: true,
                text: '现在'
            },
            today: {
                show: true,
                text: '今天'
            },
            clear: {
                show: true,
                text: '清空'
            },
            date: {
                show: true,
                text: '日期'
            },
            time: {
                show: true,
                text: '时间'
            },
            close: {
                show: true,
                text: '关闭'
            }
        },
        closeOnDateSelection: true,
        appendToBody: false,
        altInputFormats: [],
        ngModelOptions: {}
    });
    return app;
});