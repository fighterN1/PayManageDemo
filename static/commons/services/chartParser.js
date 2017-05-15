/**
 * Created by davep on 2016-07-27.
 */
define(['../app', 'angular'], function (app, angular) {
    'use strict';
    app.factory('chartParser', function () {
        return {
            parse: function (config, data) {
                config = angular.copy(config);
                var chart = config.chart;
                chart.series = [];
                angular.forEach(config.series, function (seriesItem) {
                    var ser = angular.copy(seriesItem.basic);
                    ser.data = [];
                    if (angular.isArray(data)) {
                        angular.forEach(data, function (dataItem, index) {
                            resolveData(ser.data, seriesItem.column, dataItem, index)
                        })
                    } else {
                        resolveData(ser.data, seriesItem.column, data, 0);
                    }
                    chart.series.push(ser);
                });
                if (config.yAxis) {
                    chart.yAxis = angular.copy(config.yAxis.basic);
                    chart.yAxis.data = [];
                    if (angular.isArray(data)) {
                        angular.forEach(data, function (dataItem, index) {
                            resolveData(chart.yAxis.data, config.yAxis, dataItem, index)
                        })
                    } else {
                        resolveData(chart.yAxis.data, config.yAxis, data, 0);
                    }
                }
                if (config.xAxis) {
                    chart.xAxis = angular.copy(config.xAxis.basic);
                    chart.xAxis.data = [];
                    if (angular.isArray(data)) {
                        angular.forEach(data, function (dataItem, index) {
                            resolveData(chart.xAxis.data, config.xAxis, dataItem, index)
                        })
                    } else {
                        resolveData(chart.xAxis.data, config.xAxis, data, 0);
                    }
                }
                if (angular.isArray(data) && !data.length) {
                    chart.nodata = true;
                }
                return chart;
            }
        }
    });
    function resolveData(sourceArr, col, data, index) {
        var colItem = col.basic ? angular.copy(col.basic) : null;
        if (col.name) {
            if (!colItem) {
                colItem = {};
            }
            colItem.name = data[col.name];
        }
        if (col.color && angular.isFunction(col.color)) {
            if (!colItem) {
                colItem = {};
            }
            colItem.itemStyle = {normal: {color: col.color(index)}}
        }
        if (!colItem) {
            colItem = data[col.key];
        } else {
            colItem.value = data[col.key];
        }
        sourceArr.push(colItem)
    }
});