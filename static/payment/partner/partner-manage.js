/**
 * Created by yixian on 2016-06-29.
 */
define(['angular', 'static/commons/commons', 'uiBootstrap', 'uiRouter', 'ngBootSwitch', 'ngFileUpload'], function (angular) {
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
    var app = angular.module('partnerManageApp', ['ui.bootstrap', 'ui.router', 'frapontillo.bootstrap-switch', 'ngFileUpload']);
    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('partners', {
            url: '/partners',
            templateUrl: '/static/payment/partner/templates/partners.html',
            controller: 'partnerListCtrl',
            data: {label: '商户列表'}
        }).state('partners.new', {
            url: '/new',
            templateUrl: '/static/payment/partner/templates/add_partner.html',
            controller: 'addPartnerCtrl'
        }).state('partners.detail', {
            url: '/{clientMoniker}/detail',
            templateUrl: '/static/payment/partner/templates/partner_detail.html',
            controller: 'partnerDetailCtrl',
            resolve: {
                partner: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/partners/' + $stateParams.clientMoniker);
                }]
            }
        }).state('partners.edit', {
            url: '/{clientMoniker}/edit',
            templateUrl: '/static/payment/partner/templates/partner_edit.html',
            controller: 'partnerEditCtrl',
            resolve: {
                partner: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/partners/' + $stateParams.clientMoniker);
                }]
            }
        }).state('partners.detail.payment_info', {
            url: '/payment',
            templateUrl: '/static/payment/partner/templates/partner_payment_info.html',
            controller: 'partnerPaymentInfoCtrl'
        }).state('partners.detail.subpartners', {
            url: '/sub_partners',
            templateUrl: '/static/payment/partner/templates/sub_partners.html',
            controller: 'partnerSubCtrl'
        }).state('partners.detail.accounts', {
            url: '/accounts',
            templateUrl: '/static/payment/partner/templates/partner_accounts.html',
            controller: 'partnerAccountsCtrl'
        }).state('partners.detail.paylogs', {
            url: '/pay_logs',
            templateUrl: '/static/payment/partner/templates/partner_pay_logs.html',
            controller: 'partnerPayLogCtrl'
        }).state('partners.detail.rates', {
            url: '/rates',
            templateUrl: '/static/payment/partner/templates/partner_bankaccounts.html',
            controller: 'partnerRatesCtrl'
        }).state('partners.detail.plugins', {
            url: '/plugins',
            templateUrl: '/static/payment/partner/templates/partner_plugins.html',
            controller: 'partnerPluginsCtrl'
        }).state('partners.detail.devices', {
            url: '/devices',
            templateUrl: '/static/payment/partner/templates/partner_devices.html',
            controller: 'partnerDeviceCtrl'
        }).state('partners.detail.files', {
            url: '/files',
            templateUrl: '/static/payment/partner/templates/partner_auth_files.html',
            controller: 'partnerAuthFileCtrl',
            resolve: {
                file: ['$http', '$stateParams', function ($http, $stateParams) {
                    return $http.get('/sys/partners/' + $stateParams.clientMoniker + '/file');
                }]
            }
        });
    }]);
    app.controller('partnerListCtrl', ['$scope', '$http', function ($scope, $http) {

        $scope.analysisClients = function () {
            $http.get('/sys/partners/analysis.json').then(function (resp) {
                $scope.analysis = resp.data;
            })
        };
        $scope.analysisClients();

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
            $http.get('/sys/partners.json', {params: params}).then(function (resp) {
                $scope.partners = resp.data.data;
                $scope.pagination = resp.data.pagination;
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

        $scope.loadPartners(1);
    }]);
    app.controller('addPartnerCtrl', ['$rootScope', '$scope', '$http', '$state', 'Upload', 'commonDialog', 'timezone', function ($rootScope, $scope, $http, $state, Upload, commonDialog, timezone) {
        if ($scope.partner_application) {
            $scope.partner = angular.copy($scope.partner_application);
            delete $rootScope.partner_application;
        } else {
            $scope.partner = {timezone: 'Australia/Melbourne'};
        }
        $scope.partner.company_phone_c = 61;
        $scope.partner.contact_phone_c = 61;


        $scope.listReferrers = function () {
            $http.get('/sys/orgs/referrer.json').then(function (resp) {
                $scope.referrers = resp.data;
            })
        };
        $scope.listReferrers();

        $scope.timezones = timezone.configs();
        $scope.save = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }

            if ($scope.partner.company_phone_a && ('' + $scope.partner.company_phone_a != '')) {
                if ($scope.partner.company_phone_a.indexOf('0') == 0) {
                    alert("Please remove the first character '0' of area code");
                    return;
                }
            }
            if ($scope.partner.contact_phone && ('' + $scope.partner.contact_phone != '')) {
                if ($scope.partner.contact_phone.indexOf('0') == 0) {
                    alert("Please remove the first character '0' of area code");
                    return;
                }
            }
            $scope.partner.company_phone = '+' + $scope.partner.company_phone_c + ($scope.partner.company_phone_a || '') + $scope.partner.company_phone_p;
            $scope.partner.contact_phone = '+' + $scope.partner.contact_phone_c + ($scope.partner.contact_phone_a || '') + $scope.partner.contact_phone_p;

            if ($scope.partner.company_phone.indexOf(' ') != -1) {
                alert('Company Phone can not contain space character');
                return;
            }
            if ($scope.partner.contact_phone.indexOf(' ') != -1) {
                alert('Contact Phone can not contain space character');
                return;
            }
            if ($scope.partner.contact_email.indexOf(' ') != -1) {
                alert('Contact email Phone can not contain space character');
                return;
            }
            if ($scope.partner.suburb.indexOf('  ') != -1) {
                alert('suburb can not contain two and more continuous space characters');
                return;
            }
            if ($scope.partner.acn != null) {
                if ($scope.partner.acn.length != 9) {
                    alert('Acn is not valid');
                    return;
                }
            }
            if ($scope.partner.referrer_id) {
                $scope.referrers.forEach(function (e) {
                    if ($scope.partner.referrer_id == e.manager_id) {
                        $scope.partner.referrer_name = e.display_name;
                        return;
                    }
                })
            }
            $http.post('/sys/partners', $scope.partner).then(function (resp) {
                commonDialog.alert({title: 'Success', content: 'Register new partner successfully', type: 'success'});
                $scope.loadPartners();
                $state.go('^.detail', {clientMoniker: resp.data.client_moniker})
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            });
        };
        $scope.uploadLogo = function (file) {
            if (file != null) {
                $scope.logoProgress = {value: 0};
                Upload.upload({
                    url: '/attachment/files',
                    data: {file: file}
                }).then(function (resp) {
                    delete $scope.logoProgress;
                    $scope.partner.logo_id = resp.data.fileid;
                    $scope.partner.logo_url = resp.data.url;
                }, function (resp) {
                    delete $scope.logoProgress;
                    commonDialog.alert({title: 'Upload Failed', content: resp.data.message, type: 'error'})
                }, function (evt) {
                    $scope.logoProgress.value = parseInt(100 * evt.loaded / evt.total);
                })
            }
        };

        $scope.uploadShopPhoto = function (file) {
            if (file != null) {
                $scope.photoProgress = {value: 0};
                Upload.upload({
                    url: '/attachment/files',
                    data: {file: file}
                }).then(function (resp) {
                    delete $scope.photoProgress;
                    $scope.partner.company_photo = resp.data.url;
                }, function (resp) {
                    delete $scope.photoProgress;
                    commonDialog.alert({title: 'Upload Failed', content: resp.data.message, type: 'error'})
                }, function (evt) {
                    $scope.photoProgress.value = parseInt(100 * evt.loaded / evt.total);
                })
            }
        };
    }]);
    app.controller('partnerDetailCtrl', ['$scope', '$http', '$state', '$uibModal', 'commonDialog', 'partner', function ($scope, $http, $state, $uibModal, commonDialog, partner) {
        $scope.partner = partner.data;
        $scope.showDBUsers = function () {
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/bd_user').then(function (resp) {
                $scope.partner.client_bds = resp.data;
            })
        };
        $scope.showDBUsers();
        $scope.audit = function () {
            commonDialog.confirm({
                title: 'Audit Partner',
                content: 'Are you sure to mark partner ' + $scope.partner.company_name + ' audited？',
                choises: [
                    {label: 'Pass', className: 'btn-success', key: 1},
                    {label: 'Not Pass', className: 'btn-danger', key: 0},
                    {label: 'Disable', className: 'btn-danger', key: 3},
                    {label: 'Cancel', className: 'btn-warning', key: 4, dismiss: true}
                ]
            }).then(function (choice) {
                if (choice == 1 || choice == 0) {
                    $http.put('/sys/partners/' + $scope.partner.client_moniker + '/audit', {pass: choice}).then(function () {
                        commonDialog.alert({
                            title: 'Success',
                            content: 'Comply Passed! Email will send to contact email address soon.',
                            type: 'success'
                        });
                        $state.reload();
                    }, function (resp) {
                        commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
                    })
                } else if (choice == 3) {
                    $http.delete('/sys/partners/' + $scope.partner.client_moniker).then(function () {
                        $state.go('^');
                        commonDialog.alert({title: 'Disabled', content: 'Customer Already Disabled', type: 'error'});
                    }, function (resp) {
                        commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
                    })
                }
            })
        };

        $scope.commitToCompliance = function () {
            commonDialog.confirm({
                title: 'Commit to Compliance',
                content: 'Are you sure to commit ' + $scope.partner.company_name + ' to compliance？',
                choises: [
                    {label: 'Submit', className: 'btn-success', key: 1},
                    {label: 'Cancel', className: 'btn-warning', key: 0, dismiss: true}
                ]
            }).then(function (choice) {
                if (choice == 1) {
                    $http.put('/sys/partners/' + $scope.partner.client_moniker + '/to_compliance', {}).then(function () {
                        commonDialog.alert({
                            title: 'Success',
                            content: 'Commit to Compliance successfully',
                            type: 'success'
                        });
                        $state.reload();
                    }, function (resp) {
                        commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
                    })
                }
            })
        };
        $scope.markAuditEmail = function () {
            commonDialog.confirm({
                title: 'Warning',
                content: 'Make sure you have send the email to client.'
            }).then(function () {
                $http.put('/sys/partners/' + $scope.partner.client_moniker + '/audit/email_sending_status').then(function () {
                    $state.reload();
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
                })
            })
        };
        $scope.resendApproveEmail = function () {
            commonDialog.confirm({
                title: 'Warning',
                content: 'This operation will reset the password of admin user. Are you sure this email is correct ? Or you may update this information first.'
            }).then(function () {
                $http.put('/sys/partners/' + $scope.partner.client_moniker + '/audit/send_email').then(function () {
                    $state.reload();
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
                })
            })
        };
        $scope.editBDUser = function () {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/bd_user_choose_dialog.html',
                controller: 'partnerChooseBDUserDialogCtrl',
                resolve: {
                    bdUsers: ['$http', function ($http) {
                        return $http.get('/sys/manager_accounts/roles/bd_user.json');
                    }],
                    partner: function () {
                        return $scope.partner;
                    },
                    type: function () {
                        return 'edit';
                    }
                }
            }).result.then(function () {
                $state.reload();
            })
        };
        $scope.bindBDUser = function () {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/bd_user_choose_dialog.html',
                controller: 'partnerChooseBDUserDialogCtrl',
                resolve: {
                    bdUsers: ['$http', function ($http) {
                        return $http.get('/sys/manager_accounts/roles/bd_user.json');
                    }],
                    partner: function () {
                        return $scope.partner;
                    },
                    type: function () {
                        return 'add';
                    }
                }
            }).result.then(function () {
                $state.reload();
            })
        }
    }]);
    app.controller('partnerEditCtrl', ['$scope', '$http', '$state', 'Upload', 'commonDialog', 'timezone', 'partner',
        function ($scope, $http, $state, Upload, commonDialog, timezone, partner) {
            $scope.timezones = timezone.configs();
            $scope.partner = partner.data;
            $scope.partner.partner_type = $scope.partner.website ? 'website' : 'photo';

            $scope.listReferrers = function () {
                $http.get('/sys/orgs/referrer').then(function (resp) {
                    $scope.referrers = resp.data;
                })
            };
            $scope.listReferrers();

            $scope.updatePartner = function (form) {
                if (form.$invalid) {
                    angular.forEach(form, function (item, key) {
                        if (key.indexOf('$') < 0) {
                            item.$dirty = true;
                        }
                    });
                    return;
                }

                if ($scope.partner.company_phone.indexOf(' ') != -1) {
                    alert('Company Phone can not contain space character');
                    return;
                }
                if ($scope.partner.contact_email.indexOf(' ') != -1) {
                    alert('Contact email Phone can not contain space character');
                    return;
                }
                if ($scope.partner.suburb.indexOf('  ') != -1) {
                    alert('suburb can not contain two and more continuous space characters');
                    return;
                }
                if ($scope.partner.acn != null) {
                    if ($scope.partner.acn.length != 9) {
                        alert('Acn is not valid');
                    }
                }
                if ($scope.partner.referrer_id) {
                    $scope.referrers.forEach(function (e) {
                        if ($scope.partner.referrer_id == e.manager_id) {
                            $scope.partner.referrer_name = e.display_name;
                            return;
                        }
                    })
                }

                $http.put('/sys/partners/' + $scope.partner.client_moniker, $scope.partner).then(function () {
                    commonDialog.alert({
                        title: 'Success',
                        content: 'Update partner information successfully',
                        type: 'success'
                    });
                    $scope.loadPartners();
                    $state.go('^.detail', {clientMoniker: $scope.partner.client_moniker}, {reload: true});
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                });
            };
            $scope.uploadLogo = function (file) {
                if (file != null) {
                    $scope.logoProgress = {value: 0};
                    Upload.upload({
                        url: '/attachment/files',
                        data: {file: file}
                    }).then(function (resp) {
                        delete $scope.logoProgress;
                        $scope.partner.logo_id = resp.data.fileid;
                        $scope.partner.logo_url = resp.data.url;
                    }, function (resp) {
                        delete $scope.logoProgress;
                        commonDialog.alert({title: 'Upload Failed', content: resp.data.message, type: 'error'})
                    }, function (evt) {
                        $scope.logoProgress.value = parseInt(100 * evt.loaded / evt.total);
                    })
                }
            };

            $scope.uploadShopPhoto = function (file) {
                if (file != null) {
                    $scope.photoProgress = {value: 0};
                    Upload.upload({
                        url: '/attachment/files',
                        data: {file: file}
                    }).then(function (resp) {
                        delete $scope.photoProgress;
                        $scope.partner.company_photo = resp.data.url;
                    }, function (resp) {
                        delete $scope.photoProgress;
                        commonDialog.alert({title: 'Upload Failed', content: resp.data.message, type: 'error'})
                    }, function (evt) {
                        $scope.photoProgress.value = parseInt(100 * evt.loaded / evt.total);
                    })
                }
            };
        }]);
    app.controller('partnerPaymentInfoCtrl', ['$scope', '$http', '$state', 'commonDialog', function ($scope, $http, $state, commonDialog) {
        $scope.loadPartnerPaymentInfo = function () {
            $http.get('/sys/partners/' + $scope.partner.client_moniker).then(function (resp) {
                $scope.paymentInfo = resp.data;
                $scope.ctrl.editSubMerchant = false;
                $scope.ctrl.editMaxOrderAmount = false;
            })
        };
        $scope.qrConfig = {currency: 'AUD'};
        $scope.reloadQRCode = function () {
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/qrcode', {params: $scope.qrConfig}).then(function (resp) {
                $scope.qrcode = resp.data;
            });
        };
        $scope.reloadQRCode();
        $scope.loadPartnerPaymentInfo();

        $scope.saveMaxOrderAmount = function (limit) {
            if (limit != null && isNaN(limit)) {
                commonDialog.alert({title: 'Error', content: 'Your input is not a number!', type: 'error'});
                return;
            }
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/max_order_amount', {limit: limit}).then(function (resp) {
                $scope.loadPartnerPaymentInfo();
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            })
        };
        $scope.ctrl = {};
        $scope.saveSubMerchantId = function () {
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/payment_config', {sub_merchant_id: $scope.paymentInfo.sub_merchant_id}).then(function (resp) {
                commonDialog.alert({
                    title: 'Success',
                    content: 'Modify Wechat Sub Merchant ID successfully',
                    type: 'success'
                });
                $scope.loadPartnerPaymentInfo();
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            });
        };
        $scope.refreshCredential = function () {
            commonDialog.confirm({
                title: 'Warning',
                content: 'Refresh Credential will expire the current one, which will cause the current payment service disabled. Are you sure going on?'
            }).then(function () {
                $http.put('/sys/partners/' + $scope.partner.client_moniker + '/credential_code').then(function () {
                    $state.reload();
                }, function (resp) {
                    commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
                })
            })
        };
        $scope.init = {jsapi: false, gateway: false, offline: false};
        $scope.toggleJsApi = function () {
            if (!$scope.paymentInfo) {
                return;
            }
            if (!$scope.init.jsapi) {
                $scope.init.jsapi = true;
                return;
            }
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/jsapi_permission', {allow: $scope.paymentInfo.enable_jsapi}).then(function () {
                $scope.loadPartnerPaymentInfo();
            }, function (resp) {
                commonDialog.alert({
                    title: 'failed to change JSApi permission status',
                    content: resp.data.message,
                    type: 'error'
                })
            })
        };
        $scope.toggleGateway = function () {
            if (!$scope.paymentInfo) {
                return;
            }
            if (!$scope.init.gateway) {
                $scope.init.gateway = true;
                return;
            }
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/gateway_permission', {allow: $scope.paymentInfo.enable_gateway}).then(function () {
                $scope.loadPartnerPaymentInfo();
            }, function (resp) {
                commonDialog.alert({
                    title: 'failed to change Gateway permission status',
                    content: resp.data.message,
                    type: 'error'
                })
            })
        };
        $scope.toggleOffline = function () {
            if (!$scope.paymentInfo) {
                return;
            }
            if (!$scope.init.offline) {
                $scope.init.offline = true;
                return;
            }
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/offline_permission', {allow: $scope.paymentInfo.enable_retail}).then(function () {
                $scope.loadPartnerPaymentInfo();
            }, function (resp) {
                commonDialog.alert({
                    title: 'failed to change Offline permission status',
                    content: resp.data.message,
                    type: 'error'
                })
            })
        };

        $scope.changePaymentPage = function () {
            if (!$scope.paymentInfo) {
                return;
            }
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/payment_page_version', {paypad_version: $scope.paymentInfo.paypad_version}).then(function () {
                $scope.loadPartnerPaymentInfo();
            }, function (resp) {
                commonDialog.alert({
                    title: 'failed to change Payment Page Version',
                    content: resp.data.message,
                    type: 'error'
                })
            })

        }
    }]);
    app.controller('partnerSubCtrl', ['$scope', '$http', '$uibModal', function ($scope, $http, $uibModal) {
        $scope.newSubClient = function () {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/add_sub_partner_dialog.html',
                controller: 'partnerNewSubPartnerDialogCtrl',
                size: 'lg',
                resolve: {
                    clientMoniker: function () {
                        return $scope.partner.client_moniker;
                    }
                }
            }).result.then(function () {
                $scope.loadSubClients();
            });
        };

        $scope.loadSubClients = function () {
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/sub_clients').then(function (resp) {
                $scope.subPartners = resp.data;
            });
        };
        $scope.loadSubClients();
    }]);
    app.controller('partnerRatesCtrl', ['$scope', '$http', '$uibModal', 'commonDialog', function ($scope, $http, $uibModal, commonDialog) {
        $scope.bankCtrl = {edit: true};
        $scope.getBankAccount = function () {
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/bank_account').then(function (resp) {
                $scope.bankaccount = resp.data;
                $scope.bankCtrl.edit = false;
            });
        };
        $scope.getBankAccount();
        $scope.getRates = function () {
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/rates').then(function (resp) {
                $scope.rates = resp.data;
                angular.forEach($scope.rates, function (rate) {
                    rate.active_time = new Date(rate.active_time.substr(0, 10).replace(/-/g, '/'));
                    rate.expiry_time = new Date(rate.expiry_time.substr(0, 10).replace(/-/g, '/'));
                })
            });
        };

        $scope.getBankInfo = function (bsb_no) {
            if (bsb_no != null && bsb_no != "") {
                $http.get('/sys/partners/' + $scope.partner.client_moniker + '/bank_account/bank_info/' + bsb_no).then(function (resp) {
                    $scope.bankInfo = resp.data;
                    $scope.bankaccount.bank = $scope.bankInfo.bank;
                    $scope.bankaccount.city = $scope.bankInfo.city;
                    $scope.bankaccount.address = $scope.bankInfo.address;
                    $scope.bankaccount.system = $scope.bankInfo.system;
                    $scope.bankaccount.postcode = $scope.bankInfo.postcode;
                    $scope.bankaccount.state = $scope.bankInfo.state;
                    $scope.bankaccount.branch = $scope.bankInfo.branch;

                });
            } else {
                commonDialog.alert({title: 'Error', content: "请先填写BSB No", type: 'error'})
            }

        };
        $scope.getRates();
        $scope.saveBankAccount = function () {
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/bank_account', $scope.bankaccount).then(function () {
                $scope.getBankAccount();
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        };
        $scope.newRate = function () {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/rate_config_dialog.html',
                controller: 'rateConfigDialogCtrl',
                resolve: {
                    rate: function () {
                        return {}
                    },
                    clientMoniker: function () {
                        return $scope.partner.client_moniker;
                    }
                }
            }).result.then(function () {
                $scope.getRates();
            });
        };
        $scope.editRate = function (rate) {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/rate_config_dialog.html',
                controller: 'rateConfigDialogCtrl',
                resolve: {
                    rate: function () {
                        return rate
                    },
                    clientMoniker: function () {
                        return $scope.partner.client_moniker;
                    }
                }
            }).result.then(function () {
                $scope.getRates();
            });
        }
    }]);
    app.controller('partnerAccountsCtrl', ['$scope', '$http', '$uibModal', 'commonDialog', function ($scope, $http, $uibModal, commonDialog) {
        $scope.partnerRoles = partnerRoles;
        $scope.loadPartnerAccounts = function () {
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/accounts').then(function (resp) {
                $scope.accounts = resp.data;
            })
        };
        $scope.loadPartnerAccounts();
        $scope.addAccount = function () {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/add_partner_account_dialog.html',
                controller: 'partnerAddAccountDialogCtrl',
                backdrop: false,
                resolve: {
                    partner: function () {
                        return $scope.partner;
                    }
                }
            }).result.then(function () {
                $scope.loadPartnerAccounts();
            })
        };
        $scope.updateAccountRole = function (account) {
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/accounts/' + account.account_id + '/role', {role: account.role}).then(function () {
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'})
            })
        };
        $scope.resetPwd = function (account) {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/partner_account_reset_pwd_dialog.html',
                controller: 'partnerResetPwdDialogCtrl',
                backdrop: false,
                size: 'sm',
                resolve: {
                    partner: function () {
                        return $scope.partner;
                    },
                    account: function () {
                        return account;
                    }
                }
            }).result.then(function () {
                commonDialog.alert({title: 'Success!', content: 'Password Changed Successfully', type: 'success'})
            })
        };
        $scope.disableAccount = function (account) {
            commonDialog.confirm({
                title: 'Confirm Operation',
                content: 'Are you sure to disable account ' + account.display_name + ' ?'
            }).then(function () {
                $http.delete('/sys/partners/' + $scope.partner.client_moniker + '/accounts/' + account.account_id).then(function () {
                    $scope.loadPartnerAccounts();
                }, function (resp) {
                    commonDialog.alert({title: 'Fail!', content: resp.data.message, type: 'error'})
                })
            })
        };
    }]);
    app.controller('partnerAddAccountDialogCtrl', ['$scope', '$http', 'partner', function ($scope, $http, partner) {
        $scope.account = {role: 1};
        $scope.partnerRoles = partnerRoles;
        $scope.saveAccount = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            $scope.errmsg = null;
            $http.post('/sys/partners/' + partner.client_moniker + '/accounts', $scope.account).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        }
    }]);
    app.controller('partnerResetPwdDialogCtrl', ['$scope', '$http', 'partner', 'account', function ($scope, $http, partner, account) {
        $scope.updatePwd = function () {
            $scope.errmsg = null;
            $http.put('/sys/partners/' + partner.client_moniker + '/accounts/' + account.account_id + '/pwd', {pwd: $scope.reset.pwd}).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        }
    }]);
    app.controller('partnerNewSubPartnerDialogCtrl', ['$scope', '$http', 'clientMoniker', function ($scope, $http, clientMoniker) {
        $scope.states = angular.copy(stateMap);
        $scope.countries = angular.copy(countryMap);
        $scope.saveSubPartner = function (form) {
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            $scope.errmsg = null;
            $http.post('/sys/partners/' + clientMoniker + '/sub_clients', $scope.partner).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        }
    }]);
    app.controller('partnerPayLogCtrl', ['$scope', '$http', '$filter', 'refunder', 'orderService', function ($scope, $http, $filter, refunder, orderService) {
        $scope.params = {status: 'PAID', textType: 'remark', datefrom: new Date(), dateto: new Date()};
        $scope.pagination = {};
        $scope.isAll = true;
        $scope.clients = [$scope.partner];

        $scope.today = new Date();
        $scope.chooseToday = function () {
            $scope.params.datefrom = $scope.params.dateto = new Date();
            $scope.loadTradeLogs(1);
        };
        $scope.chooseYesterday = function () {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            $scope.params.datefrom = $scope.params.dateto = yesterday;
            $scope.loadTradeLogs(1);
        };
        $scope.chooseLast7Days = function () {
            $scope.params.dateto = new Date();
            var day = new Date();
            day.setDate(day.getDate() - 7);
            $scope.params.datefrom = day;
            $scope.loadTradeLogs(1);
        };
        $scope.thisMonth = function () {
            $scope.params.dateto = new Date();
            var monthBegin = new Date();
            monthBegin.setDate(1);
            $scope.params.datefrom = monthBegin;
            $scope.loadTradeLogs(1);
        };
        $scope.lastMonth = function () {
            var monthFinish = new Date();
            monthFinish.setDate(0);
            $scope.params.dateto = monthFinish;
            var monthBegin = new Date();
            monthBegin.setDate(0);
            monthBegin.setDate(1);
            $scope.params.datefrom = monthBegin;
            $scope.loadTradeLogs(1);
        };
        $scope.loadTradeLogs = function (page) {
            var params = angular.copy($scope.params);
            if (params.datefrom) {
                params.datefrom = $filter('date')(params.datefrom, 'yyyyMMdd');
            }
            if (params.dateto) {
                params.dateto = $filter('date')(params.dateto, 'yyyyMMdd');
            }
            params.page = page || $scope.pagination.page || 1;
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/trade_logs', {params: params}).then(function (resp) {
                $scope.tradeLogs = resp.data.data;
                $scope.pagination = resp.data.pagination;
                $scope.analysis = resp.data.analysis;
            });
        };

        $scope.gatewaySelected = function (arr) {
            return $scope.params.gateway != null && $scope.params.gateway.filter(function (gateway) {
                    return arr.indexOf(gateway) >= 0
                }).length > 0
        };

        $scope.showRefundLog = function (orderId) {
            refunder.refunded(orderId);
        };
        $scope.newRefund = function (orderId) {
            refunder.refund(orderId);
        };
        $scope.showTradeDetail = function (order) {
            orderService.managerOrderDetail(order)
        };
        $scope.$on('order_refunded', function () {
            $scope.loadTradeLogs();
        });
        $scope.chooseClient = function (clientId) {
            if (clientId == 'all') {
                $scope.params.client_ids = angular.copy($scope.clientIds);
                $scope.isAll = true;
                $scope.chooseClientId = '';
            } else {
                $scope.chooseClientId = clientId;
                $scope.params.client_ids = [clientId];
                $scope.isAll = false;
            }
            $scope.loadTradeLogs();
        };
        if ($scope.partner.has_children) {
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/sub_clients').then(function (resp) {
                var clientList = resp.data;
                clientList.forEach(function (client) {
                    $scope.clients.push(client);
                });
                $scope.clientIds = [];
                $scope.clients.forEach(function (client) {
                    $scope.clientIds.push(client.client_id);
                });
                $scope.params.client_ids = angular.copy($scope.clientIds);
                //console.log($rootScope.currentUser.client.clientList);
                $scope.loadTradeLogs(1);
            })
        } else {
            $scope.loadTradeLogs(1);
        }
    }]);

    app.controller('partnerPluginsCtrl', ['$scope', '$uibModal', function ($scope, $uibModal) {
        $scope.configRedpack = function () {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/redpack_config.html',
                controller: 'partnerRedpackConfigDialogCtrl',
                size: 'lg',
                resolve: {
                    partner: function () {
                        return $scope.partner;
                    },
                    config: ['$http', function ($http) {
                        return $http.get('/sys/redpack/partners/' + $scope.partner.client_moniker);
                    }]
                }
            })
        };
        $scope.redpackLogs = function () {
            $uibModal.open({
                templateUrl: '/static/payment/partner/templates/redpack_logs.html',
                controller: 'partnerRedpackLogDialogCtrl',
                size: 'lg',
                resolve: {
                    partner: function () {
                        return $scope.partner;
                    }
                }
            })
        }
    }]);

    app.controller('partnerDeviceCtrl', ['$scope', '$http', 'orderService', 'commonDialog', 'refunder', function ($scope, $http, orderService, commonDialog, refunder) {
        $scope.pagination = {};
        $scope.listDevices = function (page) {
            var params = angular.copy($scope.devsearch) || {};
            params.page = page || $scope.pagination.page || 1;
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/devices', {params: params}).then(function (resp) {
                $scope.pagination = resp.data.pagination;
                $scope.devices = resp.data.data;
            })
        };
        $scope.listDevices(1);
        $scope.showDeviceOrders = function (dev) {
            $scope.params.dev_id = dev.dev_id;
            $scope.listOrders(1);
        };
        $scope.modifyRemark = function (dev) {
            commonDialog.inputText({title: 'Input New Remark of device'}).then(function (text) {
                $http.put('/sys/partners/' + $scope.partner.client_moniker + '/devices/' + dev.dev_id, {remark: text}).then(function () {
                    $scope.listDevices();
                }, function (resp) {
                    commonDialog.alert({title: 'Update remark failed', content: resp.data.message, type: 'error'});
                })
            })
        };
        $scope.disableDevice = function (dev) {
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/devices/' + dev.dev_id + '/enable', {enable: false}).then(function () {
                $scope.listDevices()
            }, function (resp) {
                commonDialog.alert({title: 'Failed to disable device', content: resp.data.message, type: 'error'});
            });
        };
        $scope.enableDevice = function (dev) {
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/devices/' + dev.dev_id + '/enable', {enable: true}).then(function () {
                $scope.listDevices()
            }, function (resp) {
                commonDialog.alert({title: 'Failed to enable device', content: resp.data.message, type: 'error'});
            });
        };
        $scope.orderPagination = {};
        $scope.today = new Date();
        $scope.chooseToday = function () {
            $scope.params.datefrom = $scope.params.dateto = new Date();
            $scope.loadTradeLogs(1);
        };
        $scope.chooseYesterday = function () {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            $scope.params.datefrom = $scope.params.dateto = yesterday;
            $scope.loadTradeLogs(1);
        };
        $scope.chooseLast7Days = function () {
            $scope.params.dateto = new Date();
            var day = new Date();
            day.setDate(day.getDate() - 7);
            $scope.params.datefrom = day;
            $scope.loadTradeLogs(1);
        };
        $scope.thisMonth = function () {
            $scope.params.dateto = new Date();
            var monthBegin = new Date();
            monthBegin.setDate(1);
            $scope.params.datefrom = monthBegin;
            $scope.loadTradeLogs(1);
        };
        $scope.lastMonth = function () {
            var monthFinish = new Date();
            monthFinish.setDate(0);
            $scope.params.dateto = monthFinish;
            var monthBegin = new Date();
            monthBegin.setDate(0);
            monthBegin.setDate(1);
            $scope.params.datefrom = monthBegin;
            $scope.loadTradeLogs(1);
        };
        $scope.listOrders = function (page) {
            var params = angular.copy($scope.params) || {};
            if (params.datefrom) {
                params.datefrom = $filter('date')(params.datefrom, 'yyyyMMdd');
            }
            if (params.dateto) {
                params.dateto = $filter('date')(params.dateto, 'yyyyMMdd');
            }
            params.gateway = [0, 1];
            params.page = page || $scope.orderPagination.page || 1;
            $http.get('/sys/partners/' + $scope.partner.client_moniker + '/trade_logs', {params: params}).then(function (resp) {
                $scope.orders = resp.data.data;
                $scope.orderPagination = resp.data.pagination;
                $scope.analysis = resp.data.analysis;
            });
        };
        $scope.listOrders(1);
        $scope.orderDetail = function (order) {
            orderService.managerOrderDetail(order)
        };
        $scope.refundOrder = function (order) {
            refunder.refunded(order.order_id)
        };
    }]);

    app.controller('partnerRedpackConfigDialogCtrl', ['$scope', '$http', 'partner', 'config', function ($scope, $http, partner, config) {
        $scope.config = config.data;
        if (!Object.keys($scope.config).length) {
            $scope.config = {min_payment: 0, min_amount: 1, max_amount: 1, daily_limit: 1, enabled: false};
        }
        $scope.saveRedpackConfig = function (form) {
            $scope.errmsg = null;
            if (form.$invalid) {
                angular.forEach(form, function (item, key) {
                    if (key.indexOf('$') < 0) {
                        item.$dirty = true;
                    }
                });
                return;
            }
            var config = angular.copy($scope.config);
            $http.put('/sys/redpack/partners/' + partner.client_moniker, config).then(function () {
                $scope.$close();
            }, function (resp) {
                $scope.errmsg = resp.data.message;
            })
        };
    }]);
    app.controller('rateConfigDialogCtrl', ['$scope', '$http', 'rate', 'clientMoniker', function ($scope, $http, rate, clientMoniker) {
        $scope.rate = angular.copy(rate);
        $scope.saveRate = function () {
            $scope.errmsg = null;
            if ($scope.rate.client_rate_id) {
                $http.put('/sys/partners/' + clientMoniker + '/rates/' + $scope.rate.client_rate_id, $scope.rate).then(function () {
                    $scope.$close();
                }, function (resp) {
                    $scope.errmsg = resp.data.message;
                })
            } else {
                $http.post('/sys/partners/' + clientMoniker + '/rates', $scope.rate).then(function () {
                    $scope.$close();
                }, function (resp) {
                    $scope.errmsg = resp.data.message;
                })
            }
        }
    }]);
    app.controller('partnerChooseBDUserDialogCtrl', ['$scope', '$http', '$filter', 'partner', 'bdUsers', 'type', function ($scope, $http, $filter, partner, bdUsers, type) {
        $scope.bdUsers = bdUsers.data;
        $scope.data = {};
        function initBD() {
            $http.get('/sys/partners/' + partner.client_moniker + '/bd_user/current').then(function (resp) {
                var choooseBD = resp.data;
                choooseBD.forEach(function (e) {
                    $scope.bdUsers.forEach(function (m) {
                        if (m.manager_id == e.bd_id) {
                            m.choose = true;
                            m.proportion = e.proportion;
                        }
                    });
                });
                $scope.data.start_date = new Date(choooseBD[0].start_date);
            })
        }

        if (type == 'edit') {
            initBD();
        }

        $scope.saveBD = function () {
            $scope.data.users = [];
            $scope.bdUsers.forEach(function (e) {
                if (e.choose) {
                    $scope.data.users.push(e);
                }
            });

            if ($scope.data.users.length == 0) {
                $scope.errmsg = "请选择至少一位BD";
            }
            else if ($scope.data.start_date == undefined) {
                $scope.errmsg = "执行开始日期不能为空";
            }
            else {
                var isValid = true;
                var total = 0;
                $scope.data.users.forEach(function (e) {
                    if (e.proportion == undefined) {
                        $scope.errmsg = "绩效比例不能为空";
                        isValid = false;
                        return;
                    } else if (e.proportion < 0.01 || e.proportion > 1) {
                        $scope.errmsg = "绩效比例无效";
                        isValid = false;
                        return;
                    }
                    total += e.proportion;
                    if (total > 1) {
                        $scope.errmsg = "Total proportion must be 1";
                        isValid = false;
                        return;
                    }
                });
                if (total != 1) {
                    $scope.errmsg = "Total proportion must be 1";
                    isValid = false;
                    return;
                }
                if (isValid) {
                    $scope.errmsg = null;
                    $scope.data.type = type;
                    var chooseUsers = angular.copy($scope.data);
                    chooseUsers.start_date = $scope.data.start_date;
                    if (chooseUsers.start_date) {
                        chooseUsers.start_date = $filter('date')(chooseUsers.start_date, 'yyyyMMdd');
                    }
                    $http.put('/sys/partners/' + partner.client_moniker + '/bd_user', $scope.data).then(function () {
                        $scope.$close();
                    }, function (resp) {
                        $scope.errmsg = resp.data.message;
                    })
                }

            }
        }
    }]);
    app.controller('partnerRedpackLogDialogCtrl', ['$scope', '$http', 'partner', function ($scope, $http, partner) {
        $scope.pagination = {};
        $scope.queryParams = {};
        $scope.listRedpackLogs = function (page) {
            var params = angular.copy($scope.queryParams);
            params.page = page || $scope.pagination.page || 1;
            $http.get('/sys/redpack/partners/' + partner.client_moniker + '/logs', {params: params}).then(function (resp) {
                $scope.logs = resp.data.data;
                $scope.pagination = resp.data.pagination;
            })
        };
        $scope.listRedpackLogs(1);
    }]);

    app.controller('partnerAuthFileCtrl', ['$scope', '$http', 'commonDialog', '$state', 'Upload', 'file', function ($scope, $http, commonDialog, $state, Upload, file) {

        $scope.file = file.data || {};
        //audit files
        $scope.uploadBankFile = function (file) {
            if (file != null) {
                $scope.bankFileProgress = {value: 0};
                Upload.upload({
                    url: '/attachment/files',
                    data: {file: file}
                }).then(function (resp) {
                    delete $scope.bankFileProgress;
                    $scope.file.file_bank_info = resp.data.url;
                }, function (resp) {
                    delete $scope.bankFileProgress;
                    commonDialog.alert({title: 'Upload Failed', content: resp.data.message, type: 'error'})
                }, function (evt) {
                    $scope.bankFileProgress.value = parseInt(100 * evt.loaded / evt.total);
                })
            }
        };

        $scope.uploadCompanyFile = function (file) {
            if (file != null) {
                $scope.companyFileProgress = {value: 0};
                Upload.upload({
                    url: '/attachment/files',
                    data: {file: file}
                }).then(function (resp) {
                    delete $scope.companyFileProgress;
                    $scope.file.file_company_info = resp.data.url;
                }, function (resp) {
                    delete $scope.companyFileProgress;
                    commonDialog.alert({title: 'Upload Failed', content: resp.data.message, type: 'error'})
                }, function (evt) {
                    $scope.companyFileProgress.value = parseInt(100 * evt.loaded / evt.total);
                })
            }
        };
        $scope.updateFile = function () {
            $http.put('/sys/partners/' + $scope.partner.client_moniker + '/file', $scope.file).then(function () {
                commonDialog.alert({
                    title: 'Success',
                    content: 'Update Successful',
                    type: 'success'
                });
                $state.reload();
            }, function (resp) {
                commonDialog.alert({title: 'Error', content: resp.data.message, type: 'error'});
            })
        }

        function commitError() {
            commonDialog.alert({
                title: 'Error',
                content: 'Missing file',
                type: 'error'
            });
        };

        $scope.commitPartner = function () {
            if ($scope.file) {
                if ($scope.file.file_bank_info != null && $scope.file.file_company_info) {
                    $scope.file.authStatus = 1;
                    $scope.updateFile();
                } else {
                    commitError();
                }
            } else {
                commitError();
            }
        };
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