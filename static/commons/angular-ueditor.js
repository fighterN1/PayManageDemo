/**
 * Created by yixian on 2015-02-08.
 */
define(['angular', 'jquery', 'ueditor'], function (angular, $) {
    var app = angular.module('ng.uditor', []);
    app.directive('ueditor', function ($rootScope, $q) {
        return {
            restrict: 'AE',
            require: 'ngModel',
            scope: {
                ueReady: '&',
                ueHeight: '@',
                ueWidth: '@'
            },
            link: function ($scope, $element, $attr, ngModel) {
                var id = 'ueditor_' + Date.now();
                $element[0].id = id;
                var ue = UE.getEditor(id, {
                    initialFrameWidth: $scope.ueWidth || $($element).width(),
                    initialFrameHeight: $scope.ueHeight || $($element).height()
                });

                var ueReadyDefer = $q.defer();
                var ueReadyPromise = ueReadyDefer.promise;

                ue.ready(function () {
                    if (ngModel.$viewValue != null) {
                        ue.setContent(ngModel.$viewValue);
                    }
                    ue.addListener('contentChange', function () {
                        var content = ue.getContent();
                        ngModel.$setViewValue(content);

                        try {
                            if (!$rootScope.$$parse) {
                                $rootScope.$digest();
                            }
                        } catch (err) {
                        }
                    });

                    ueReadyDefer.resolve();

                    if (angular.isFunction($scope.ueReady)) {
                        $scope.ueReady({
                            $editor: ue
                        })
                    }
                });

                ngModel.$formatters.unshift(function (val) {
                    ueReadyPromise.then(function () {
                        ue.setContent(val);
                    });
                    return val;
                });
            }
        }
    });
    return app;
});