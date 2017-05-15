define(['angular', 'static/commons/commons', 'uiBootstrap', 'uiRouter', 'ngBootSwitch', 'ngFileUpload','uiSelect'], function (angular) {
    'use strict';
    var countryMap = [{
        "label": "AUS",
        "value": "AUS"
    }, {
        "label": "CHN",
        "value": "CHN"
    }];
    var stateMap = [
        /*label{
         "label": "西澳大利亚",
         "value": "Western Australia"
         },
         {
         "label": "昆士兰",
         "value": "Queensland"
         },
         {
         "label": "北部地区",
         "value": "Northern Territory"
         },
         {
         "label": "南澳大利亚",
         "value": "South Australia"
         },
         {
         "label": "新南威尔士",
         "value": "New South Wales"
         },
         {
         "label": "维多利亚",
         "value": "Victoria"
         },
         {
         "label": "塔斯马尼亚",
         "value": "Tasmania"
         },
         {
         "label": "首都直辖区",
         "value": "Australian Capital Territory"
         }*/
        {
            "label": "ACT",
            "value": "ACT"
        },
        {
            "label": "NSW",
            "value": "NSW"
        },
        {
            "label": "NT",
            "value": "NT"
        },
        {
            "label": "QLD",
            "value": "QLD"
        },
        {
            "label": "SA",
            "value": "SA"
        },
        {
            "label": "TAS",
            "value": "TAS"
        },
        {
            "label": "VIC",
            "value": "VIC"
        },
        {
            "label": "WA",
            "value": "WA"
        }
    ];
    var industryMap = [
        {
            "label": "综合商城",
            "value": 336
        },
        {
            "label": "食品",
            "value": 335
        },
        {
            "label": "化妆品",
            "value": 334
        },
        {
            "label": "鞋包服饰",
            "value": 327
        },
        {
            "label": "酒店行业",
            "value": 328
        },
        {
            "label": "数码电器",
            "value": 332
        },
        {
            "label": "母婴",
            "value": 333
        },
        {
            "label": "文具/办公用品",
            "value": 337
        },
        {
            "label": "机票行业",
            "value": 339
        },
        {
            "label": "国际物流",
            "value": 330
        },
        {
            "label": "教育行业",
            "value": 329
        },
        {
            "label": "其它服务行业",
            "value": 331
        },
        {
            "label": "其它货物贸易行业",
            "value": 338
        }
    ];

    var sectorMap = [
        {
            "label": "Australian Real Estate Investment Trusts (A-REITs)",
            "value": "Australian Real Estate Investment Trusts (A-REITs)"
        },
        {
            "label": "Consumer Discretionary",
            "value": "Consumer Discretionary"
        },
        {
            "label": "Consumer Staples",
            "value": "Consumer Staples"
        },
        {
            "label": "Energy",
            "value": "Energy"
        },
        {
            "label": "Financials",
            "value": "Financials"
        },
        {
            "label": "Financials excluding A-REITs",
            "value": "Financials excluding A-REITs"
        },
        {
            "label": "Health Care",
            "value": "Health Care"
        },
        {
            "label": "Industrials",
            "value": "Industrials"
        },
        {
            "label": "Information Technology",
            "value": "Information Technology"
        },
        {
            "label": "Materials",
            "value": "Materials"
        },
        {
            "label": "Metals and Mining",
            "value": "Metals and Mining"
        },
        {
            "label": "Telecommunication Services",
            "value": "Telecommunication Services"
        },
        {
            "label": "Utilities",
            "value": "Utilities"
        }

    ];
    var app = angular.module('partnerApplyApp', ['ui.bootstrap', 'ui.router', 'frapontillo.bootstrap-switch', 'ngFileUpload','ui.select']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('partner_application', {
            url: '/partner/applications',
            templateUrl: '/static/payment/partner/templates/partners_applications.html',
            controller: 'partnerApplicationListCtrl',
            data: {label: '商户申请列表'}
        }).state('partner_application.detail', {
            url: '/{client_apply_id}/detail',
            templateUrl: '/static/payment/partner/templates/partner_application_detail.html',
            controller: 'partnerApplicationDetailCtrl',
            resolve: {
                partner: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/partners/application/' + $stateParams.client_apply_id);
                }]
            }
        })
    }]);
    app.controller('partnerApplicationListCtrl', ['$scope','$state', '$http','$uibModal','commonDialog', function ($scope,$state, $http,$uibModal,commonDialog) {
        $scope.pagination = {};
        $scope.industries = angular.copy(industryMap);
        $scope.states = angular.copy(stateMap);
        $scope.countries = angular.copy(countryMap);
        $scope.params = {};

        $scope.loadPartners = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.pagination.page || 1;
            $http.get('/partners/application', {params: params}).then(function (resp) {
                $scope.partners = resp.data.data;
                $scope.pagination = resp.data.pagination;
            });
        };
        $scope.linkButton=function (obj) {
            var partner = angular.copy(obj);
            partner.link = true;
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/partner_application_pass.html',
                controller: 'passApplicationCtrl',
                resolve: {
                    partner: partner
                }
            }).result.then(function () {
                commonDialog.alert({title: 'Success', content: '关联成功！', type: 'success'});
                $state.reload();
                // $state.go('partner_application.detail', {client_apply_id: obj.client_apply_id}, {reload: true});
            })
        };

        $scope.loadPartners(1);


        $scope.loadAccounts = function () {
            $http.get('/sys/partners/unregister.json').then(function (resp) {
                $scope.accounts = resp.data;
            });
        };

        $scope.loadAccounts();

        $scope.remarkButton=function (account) {
            $uibModal.open({
                templateUrl: '/static/application/templates/apply_unregisters_remark.html',
                controller: 'updateAccountRemarkCtrl',
                resolve: {
                    account: account
                }
            }).result.then(function () {
                commonDialog.alert({title: 'Success', content: 'Update Successful', type: 'success'});
                $scope.loadAccounts();
            })
        };
    }]);
    app.controller('updateAccountRemarkCtrl', ['$rootScope','$scope', '$http','commonDialog','account', function ($rootScope,$scope, $http,commonDialog, account) {
        $scope.account = angular.copy(account);
        $scope.updateRemark = function () {
           $http.put('partners/application/unregister_accounts/'+$scope.account.account_id,$scope.account).then(function (resp) {
               $scope.$close();
           }, function (resp) {
               commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
           })
        }

    }]);

    app.controller('partnerApplicationDetailCtrl', ['$rootScope','$scope', '$http', '$state', '$uibModal', 'commonDialog', 'partner', function ($rootScope,$scope, $http, $state, $uibModal, commonDialog, partner) {
        $scope.partner = partner.data;
        
        //$rootScope.partner_application = angular.copy($scope.partner);

        
        if (($scope.currentUser.role & parseInt('10',2))){
            $http.get('/sys/manager_accounts/roles/bd_user.json').then(function (resp) {
                $scope.bds = resp.data;
            })
        }
        $scope.refuse=function () {
            var obj = angular.copy($scope.partner);
                if ($scope.currentUser.role & parseInt('10',2)){
                    obj.apply_approve_result = 3;
                }
                if ($scope.currentUser.role & parseInt('100',2)){
                    obj.apply_approve_result = 4;
                }
                commonDialog.confirm({
                    title: 'Refuse this application',
                    content: 'To refuse the application of this merchant . Are you sure?'
                }).then(function () {
                    updateApplication(obj);
                })

        };
        $scope.choosed = {};
        $scope.chooseBD=function (bd) {
            var obj = angular.copy($scope.partner);
            obj.apply_approve_result = 1;
            obj.bd_id = bd.manager_id;
            obj.bd_name = bd.display_name;
            commonDialog.confirm({
                title: 'Next step',
                content: 'Choose '+bd.display_name+' to follow this application. Are you sure?'
            }).then(function () {
                updateApplication(obj);
            })
        };
        var updateApplication = function (obj) {
            $http.put('/partners/application/' + obj.client_apply_id, obj).then(function () {
                $state.go('partner_application.detail', {client_apply_id: obj.client_apply_id}, {reload: true});
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            });
        };
        $scope.pass=function (obj) {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/partner_application_pass.html',
                controller: 'passApplicationCtrl',
                resolve: {
                    partner: obj
                }
            }).result.then(function () {
                commonDialog.alert({title: 'Success', content: 'Pass Successfully ! 您成功建立了新的商户,请及时完善信息。', type: 'success'});
               // $state.go('partner_application.detail', {client_apply_id: obj.client_apply_id}, {reload: true});
            })
        };
        $scope.updateRemark = function () {
            var obj = angular.copy($scope.partner);
            updateApplication(obj);
        }

    }]);
    app.controller('passApplicationCtrl', ['$scope', '$http','$state','partner', function ($scope, $http,$state, partner) {
        $scope.partner = angular.copy(partner);
        $scope.submit = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') <= 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }

            $scope.errmsg = null;
            $http.put('/partners/application/' + partner.client_apply_id+'/pass', $scope.partner).then(function (resp) {
                $scope.$close();
               // $scope.client = resp.data;
                $state.go('partners.edit',{clientMoniker: resp.data.client_moniker});

            }, function (resp) {
                $scope.errmsg = resp.data.message;
            });
            //$rootScope.partner_application = $scope.client;
        };
        $scope.link = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') <= 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }

            $scope.errmsg = null;
            $http.put('/partners/application/' + partner.client_apply_id+'/link', $scope.partner).then(function (resp) {
                $scope.$close();

            }, function (resp) {
                $scope.errmsg = resp.data.message;
            });
        }

    }]);
    app.filter('partner_state', function () {
        return function (stateValue) {
            var stateLabel = '';
            angular.forEach(stateMap, function (state) {
                if (state.value == stateValue) {
                    stateLabel = state.label;
                }
            });
            return stateLabel;
        }
    });
    app.filter('partner_country', function () {
        return function (countryValue) {
            var countryLabel = '';
            angular.forEach(countryMap, function (country) {
                if (country.value == countryValue) {
                    countryLabel = country.label;
                }
            });
            return countryLabel;
        }
    });

    app.filter('partner_industry', function () {
        return function (industryCode) {
            var industryLabel = '';
            angular.forEach(industryMap, function (industry) {
                if (industry.value == industryCode) {
                    industryLabel = industry.label;
                }
            });
            return industryLabel;
        }
    });
    app.filter('partner_sector', function () {
        return function (sectorValue) {
            var sectorLabel = '';
            angular.forEach(sectorMap, function (sector) {
                if (sector.value == sectorValue) {
                    sectorLabel = sector.label;
                }
            });
            return sectorLabel;
        }
    });
    return app;
});