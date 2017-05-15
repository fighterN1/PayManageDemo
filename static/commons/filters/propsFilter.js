/**
 * Created by yixian on 2016-05-13.
 */
define(['../app','angular'],function (app,angular) {
    'use strict';
    app.filter('propsFilter',function () {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        if(props[prop]==null){
                            itemMatches = true;
                            break;
                        }
                        var text = props[prop].toString().toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    })
});