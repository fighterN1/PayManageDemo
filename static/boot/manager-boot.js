/**
 * Created by yixian on 2016-06-29.
 */
require.config({
    baseUrl: './',
    waitSeconds: 30,
    urlArgs: 'bust=' + new Date().getTime(),
    paths: {
        jquery: 'static/lib/jquery/jquery-2.1.4.min',
        uiBootstrap: 'static/lib/angular-plugins/ui-bootstrap-tpls-1.2.4.min',
        uiRouter: 'static/lib/angular-plugins/angular-ui-router.min',
        angularChecklist: 'static/lib/angular-plugins/checklist-model',
        angular: 'static/lib/angularjs/angular.min',
        angularAnimate: 'static/lib/angularjs/angular-animate.min',
        angularMessages: 'static/lib/angularjs/angular-messages.min',
        angularSanitize: 'static/lib/angularjs/angular-sanitize.min',
        angularLocale: 'static/lib/angularjs/angular-locale_zh-cn',
        bootSwitch: 'static/lib/bootswitch/bootstrap-switch.min',
        ngBootSwitch: 'static/lib/angular-plugins/angular-bootstrap-switch.min',
        ngFileUpload: 'static/lib/ngfileupload/ng-file-upload.min',
        holder: 'static/lib/holder/holder.min',
        datetimePicker: 'static/lib/datetime-picker/datetime-picker.min',
        colorpicker: 'static/lib/colorpicker/js/bootstrap-colorpicker-module.min',
        qrcode: 'static/lib/jquery/jquery.qrcode.min',
        sockjs: 'static/lib/websocket/sockjs.min',
        stomp: 'static/lib/websocket/stomp.min',
        uiSelect: 'static/lib/angular-plugins/select.min',
        dragdrop: 'static/lib/angular-plugins/angular-drag-and-drop-lists.min',
        echarts: 'static/lib/echarts/echarts.min',
        ueditor: 'static/lib/ueditor/ueditor.all',
        ueditorConfig: 'static/lib/ueditor/ueditor.config',
        angularEcharts: 'static/commons/angular-echarts'
    },
    shim: {
        'angular': {deps: ['jquery'], exports: 'angular'},
        'angularLocale': ['angular'],
        'uiBootstrap': ['angular', 'angularLocale'],
        'uiRouter': ['angular'],
        'uiSelect': ['angular', 'css!static/lib/angular-plugins/select.min'],
        'angularAnimate': ['angular'],
        'angularMessages': ['angular'],
        'angularSanitize': ['angular'],
        'ngFileUpload': ['angular'],
        'angularChecklist': ['angular'],
        'datetimePicker': ['angular'],
        'ngBootSwitch': ['bootSwitch', 'angular'],
        'bootSwitch': ['jquery', 'css!static/lib/bootswitch/bootstrap-switch.min'],
        'qrcode': ['jquery'],
        'colorpicker': ['angular', 'css!static/lib/colorpicker/css/colorpicker.min'],
        'holder': ['jquery'],
        'dragdrop': ['angular'],
        'ueditor': ['ueditorConfig']
    },
    map: {
        '*': {
            'css': 'static/lib/css.min'
        }
    }
});

require(['angular', 'jquery'], function (angular, $) {
    $.ajax({
        url: 'data/current_manager.json?s',
        method: 'get',
        dataType: 'json',
        success: function (user) {
            boot(user);
        },
        error: function (jqXHR) {
            if (jqXHR.status == 403) {
                location.href = 'm_login.html?f='+encodeURIComponent(location.href);
            }
        }
    });
    function boot(user) {
        var paths = ['static/boot/managerMainApp'];
        var moduleNames = ['managerMainApp'];
        window.currentUser = user;
        angular.forEach(user.modules, function (mod) {
            paths.push(mod.js_path);
            moduleNames.push(mod.js_module);
        });
        require(paths, function () {
            angular.bootstrap(document.body, moduleNames)
        })
    }
});