/**
 * Created by yixian on 2016-06-29.
 */
define(['angular','global', 'static/commons/commons', 'uiBootstrap', 'uiRouter', 'ngBootSwitch', 'ngFileUpload'], function (angular,g) {
    'use strict';
    var baseDomain=g.baseDomain;
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
    var business_structures_map = [
        {
            "label": "Association",
            "value": "Association"
        },
        {
            "label": "Company",
            "value": "Company"
        },
        {
            "label": "Government body",
            "value": "Government body"
        },
        {
            "label": "Partnership",
            "value": "Partnership"
        },
        {
            "label": "Registered body",
            "value": "Registered body"
        },
        {
            "label": "Trust",
            "value": "Trust"
        }];
    var partnerRoles = [
        {code: 1, label: 'Admin'},
        {code: 2, label: 'Manager'},
        {code: 3, label: 'Cashier'}
    ];
    var app = angular.module('actPartnersRedPacketApp', ['ui.bootstrap', 'ui.router', 'frapontillo.bootstrap-switch', 'ngFileUpload']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('act_partners', {
            url: baseDomain+'/act/partners',
            templateUrl: baseDomain+'/static/config/redpackets/templates/act_partners.html',
            controller: 'actPartnersListCtrl',
            data: {label: '商户列表'}
        })
    }]);
    app.controller('actPartnersListCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.pagination = {};
        $scope.industries = angular.copy(industryMap);
        $scope.states = angular.copy(stateMap);
        $scope.countries = angular.copy(countryMap);
        $scope.sectors = angular.copy(sectorMap);
        $scope.business_structures = angular.copy(business_structures_map);
        $scope.params = {textType: 'all'};

        $scope.loadPartners = function (page) {
            var params = angular.copy($scope.params);
            params.page = page || $scope.pagination.page || 1;
            $http.get(baseDomain+'/sys/lucky_money/partner/partners.json', {params: params}).then(function (resp) {
                $scope.partners = resp.data.data;
                $scope.pagination = resp.data.pagination;
            });
        };

        $scope.listBDUsers = function () {
            $http.get(baseDomain+'/sys/manager_accounts/roles/bd_user.json').then(function (resp) {
                $scope.bdUserSource = resp.data;
            })
        };
        $scope.listBDUsers();

        if (($scope.currentUser.role & parseInt('1000011', 2)) > 0 && !$scope.currentUser.org_id) {
            $scope.showOrg = 'Organization';
            $http.get(baseDomain+'/sys/orgs.json', {params: {}}).then(function (resp) {
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

        $scope.loadPartners(1);
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
    app.filter('business_structure', function () {
        return function (sectorValue) {
            var sectorLabel = '';
            angular.forEach(business_structures_map, function (sector) {
                if (sector.value == sectorValue) {
                    sectorLabel = sector.label;
                }
            });
            return sectorLabel;
        }
    });
    return app;
});