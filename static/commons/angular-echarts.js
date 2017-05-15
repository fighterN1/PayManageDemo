/**
 * Created by yixian on 2014/7/22.
 */
define(['angular', 'echarts'], function (angular, echarts) {
    var app = angular.module('ngEcharts', []);
    app.directive('echarts', ['$timeout', '$q', function ($timeout, $q) {
        return {
            restrict: 'AEC',
            scope: {
                echarts: '=',
                chartSetter: '&'
            },
            link: function (scope, element, attr) {
                var initDefer = $q.defer();
                var initPromise = initDefer.promise;

                function initChart() {
                    if (element.height() > 0 && element.width() > 0) {
                        scope.chartObj = echarts.init(element[0]);
                        initDefer.resolve();
                    } else {
                        $timeout(initChart, 100)
                    }
                }

                $timeout(initChart);

                scope.$watch('echarts', function (config) {
                    if (config != null) {
                        initPromise.then(function () {
                            scope.chartObj.clear();
                            scope.chartObj.setOption(config, true);
                            scope.chartObj.hideLoading();
                            scope.chartObj.resize();
                        })

                    }
                });
                initPromise.then(function () {
                    if (angular.isFunction(scope.chartSetter)) {
                        scope.chartSetter({
                            $chart: scope.chartObj
                        })
                    }
                });

                scope.$watch(function () {
                    return element.width() + 'x' + element.height();
                }, function () {
                    try {
                        if (scope.chartObj != null && !!scope.chartObj.getOption()) {
                            scope.chartObj.resize()
                        }
                    } catch (e) {
                    }
                });
                angular.element('window').resize(function () {
                    try {
                        if (scope.chartObj != null && !!scope.chartObj.getOption()) {
                            scope.chartObj.resize()
                        }
                    } catch (e) {
                    }
                })
            }
        }
    }]);
    return app;
});