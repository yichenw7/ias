(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("angular"));
	else if(typeof define === 'function' && define.amd)
		define(["angular"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("angular")) : factory(root["angular"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_34__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 35);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _angular = __webpack_require__(34);

var _angular2 = _interopRequireDefault(_angular);

__webpack_require__(19);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import 'ng-file-upload';

// Load Avalon.UI
// import 'avalon-ui';
// import 'avalon-ui.css';
// import 'avalon-ui-icon.css';

exports.default = _angular2.default.module('avalon.ui', ['ngMaterial']);

// import 'angular-ui-router';

// import 'angular-animate';
// import 'angular-aria';

// import 'ngMaterial';

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _avalonuiMain = __webpack_require__(0);

var _avalonuiMain2 = _interopRequireDefault(_avalonuiMain);

__webpack_require__(4);

__webpack_require__(3);

__webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import './style/less/app.less';
//import './style/less/grid.less';
//import './style/less/md-style.less';
//import './style/less/md-dialog.less';
//import './style/less/add_price_acceptinghouse_quotepricetype.less';
//import './style/less/panel_accordion.less';
//import './style/less/panel_title_container.less';
//import './style/less/drop_label.less';
//import './style/less/input_date_picker.less';
//import './style/less/input_label.less';
//import './style/less/input_label_drop.less';
//import './style/less/input_button_switcher.less';
//import './style/less/input_button_selector.less';
//import './style/less/input_dropdown_chips.less';
//import './style/less/label_html_content.less';
//import './style/less/date-picker.less';

//import './style/less/panel_search_criteria.less';
//import './style/less/input_selector_range.less';
//import './style/less/input_date_picker_range.less';
//import './style/less/panel_search_pricemng.less';
//import './style/less/input_auto_complete.less';
//import './style/less/add_account_associate.less';
//import './style/less/input_file_select.less';

var constMap = new Map([]);

//import './common/script/arrayutils';
//import './common/script/numberutils';
//import './common/script/dateutils';
//import './common/script/stringutils';

constMap.forEach(function (value, key, map) {
    _avalonuiMain2.default.constant(key, value.default);
});

_avalonuiMain2.default.config(['$mdThemingProvider', function ($mdThemingProvider) {
    $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('light-blue').warnPalette('deep-orange').backgroundPalette('grey');

    var setCustomColor = function () {
        $mdThemingProvider.definePalette('ss-color-bg', {
            '50': '575F62',
            '100': '575F62',
            '200': '4C5356',
            '300': '4C5356',
            '400': '41474A',
            '500': '323739', // ss_bg_extra
            '600': '323739',
            '700': '232628', // ss_bg_secondary
            '800': '222527',
            '900': '161819', // ss_bg_primary
            'A100': '151717',
            'A200': '151717',
            'A400': '151717',
            'A700': '151717',
            'contrastDefaultColor': 'light', // whether, by default, text (contrast)
            // on this palette should be dark or light

            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
            'contrastLightColors': undefined // could also specify this if default was 'dark'
        });

        $mdThemingProvider.definePalette('ss-color-pp', {
            '50': '11D3D3',
            '100': '11D3D3',
            '200': '15BBBB',
            '300': '15BBBB',
            '400': '11A7A8',
            '500': '11A7A8',
            '600': '119596',
            '700': '119596',
            '800': '097B7C',
            '900': '097B7C',
            'A100': '096060',
            'A200': '096060',
            'A400': '096060',
            'A700': '096060',
            'contrastDefaultColor': 'light', // whether, by default, text (contrast)
            // on this palette should be dark or light

            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
            'contrastLightColors': undefined // could also specify this if default was 'dark'
        });

        // #11DD69
        // #11C25B
        // #11A14C
        // #0C813C
        // #096C32
        // #094F26
        $mdThemingProvider.definePalette('ss-color-ap', {
            '50': '11DD69',
            '100': '11DD69',
            '200': '11C25B',
            '300': '11C25B',
            '400': '11A14C',
            '500': '11A14C',
            '600': '0C813C',
            '700': '0C813C',
            '800': '096C32',
            '900': '096C32',
            'A100': '094F26',
            'A200': '094F26',
            'A400': '094F26',
            'A700': '094F26',
            'contrastDefaultColor': 'light', // whether, by default, text (contrast)
            // on this palette should be dark or light

            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
            'contrastLightColors': undefined // could also specify this if default was 'dark'
        });

        // #FFBA4B
        // #FFAD1D
        // #F49C0F
        // #F48D0C
        // #CC7E09
        // #B67009
        $mdThemingProvider.definePalette('ss-color-wp', {
            '50': 'FFBA4B',
            '100': 'FFBA4B',
            '200': 'FFAD1D',
            '300': 'FFAD1D',
            '400': 'F49C0F',
            '500': 'F49C0F',
            '600': 'F48D0C',
            '700': 'F48D0C',
            '800': 'CC7E09',
            '900': 'CC7E09',
            'A100': 'B67009',
            'A200': 'B67009',
            'A400': 'B67009',
            'A700': 'B67009',
            'contrastDefaultColor': 'light', // whether, by default, text (contrast)
            // on this palette should be dark or light

            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'],
            'contrastLightColors': undefined // could also specify this if default was 'dark'
        });
    }();

    $mdThemingProvider.theme('ssAvalonUi').primaryPalette('ss-color-pp').accentPalette('ss-color-ap').warnPalette('ss-color-wp').backgroundPalette('ss-color-bg');

    $mdThemingProvider.alwaysWatchTheme(true);
}]);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _avalonuiMain = __webpack_require__(0);

var _avalonuiMain2 = _interopRequireDefault(_avalonuiMain);

__webpack_require__(20);

__webpack_require__(6);

__webpack_require__(7);

__webpack_require__(8);

__webpack_require__(9);

__webpack_require__(10);

__webpack_require__(11);

__webpack_require__(12);

__webpack_require__(13);

__webpack_require__(14);

__webpack_require__(15);

__webpack_require__(16);

__webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var componentMap = new Map([['testcomponent', __webpack_require__(5)]]);

componentMap.forEach(function (value, key, map) {
    _avalonuiMain2.default.component(key, value.default());
});

exports.default = _avalonuiMain2.default;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _avalonuiMain = __webpack_require__(0);

var _avalonuiMain2 = _interopRequireDefault(_avalonuiMain);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// let app = () => {
//     return {
//         template: require('./app.html'),
//         controller: appCtrl,
//         controllerAs: 'app'
//     }
// };

// class appCtrl {
//     constructor($scope) {
//         this.url = 'https://github.com/preboot/angular-webpack';
//     };
// };

// mainModule.directive('app', app).controller('appCtrl', ['$scope', appCtrl]);

exports.default = _avalonuiMain2.default;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _avalonuiMain = __webpack_require__(0);

var _avalonuiMain2 = _interopRequireDefault(_avalonuiMain);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import commonService from './common/service/commonService';
//import userService from './common/service/userService';
//import websocketService from './common/service/websocketService';
//import httpService from './common/service/httpService';
//import qbService from './common/service/qbService';
//import componentCommonService from './common/service/componentCommonService';
//import interoperateService from './common/service/interoperateService';

//mainModule.service('commonService', commonService)
//    .service('userService', userService)
//    .service('httpService', httpService)
//    .service('qbService', qbService)
//    .service('websocketService', websocketService)
//    .service('interoperateService', interoperateService)
//    .service('componentCommonService', componentCommonService);


exports.default = _avalonuiMain2.default;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var initView = Symbol('initView');

var testcomponentCtrl = function () {
    function testcomponentCtrl($scope) {
        _classCallCheck(this, testcomponentCtrl);

        this.$scope = $scope;

        this[initView]();
    }

    _createClass(testcomponentCtrl, [{
        key: initView,
        value: function value() {
            console.debug('testcomponentCtrl initView');
        }
    }]);

    return testcomponentCtrl;
}();

;

var testcomponent = function testcomponent() {
    return {
        template: __webpack_require__(33),
        bindings: {},
        controller: ['$scope', testcomponentCtrl]
    };
};

exports.default = testcomponent;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(22);

__webpack_require__(21);

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(23);

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(24);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(25);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(26);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(27);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(28);

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(29);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(30);

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(31);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(32);

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(18);

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function (amCharts) {

    // AmCharts Ϊ��ѡ����
    if (!amCharts) {
        console.warn('AvalonUI: Amcharts not loaded.');
        return;
    }

    amCharts.themes.ssChartStyle = {

        themeName: "ssChartStyle",

        AmChart: {
            color: "#e7e7e7",
            backgroundColor: "#161819",
            fontFamily: "Microsoft YaHei"
        },

        AmCoordinateChart: {
            colors: [
            // ��Ʒ�����ṩ��10����ѡ��ɫ
            "#ffc96c", "#dc4444", "#4876cf", "#58b96d", "#b26ed0", "#dc6b35", "#7adc4e", "#25ba93", "#f04971", "#fbff1e", "#724887", "#7256bc"]
        },

        AmStockChart: {
            colors: [
            // ��Ʒ�����ṩ��8����ѡ��ɫ
            "#dc4444", "#dc6b35", "#fbff1e", "#7adc4e", "#25ba93", "#4876cf", "#b26ed0", "#f04971", "#9d9888", "#916b8a", "#724887", "#7256bc"]
        },

        AmSlicedChart: {
            outlineAlpha: 1,
            outlineThickness: 2,
            outlineColor: "#161819",
            labelTickColor: "#FFFFFF",
            labelTickAlpha: 0.3,
            colors: [
            // ��Ʒ�����ṩ��8����ѡ��ɫ
            "#dc4444", "#dc6b35", "#fbff1e", "#7adc4e", "#25ba93", "#4876cf", "#b26ed0", "#f04971", "#9d9888", "#916b8a", "#724887", "#7256bc"]
        },

        AmRectangularChart: {
            zoomOutButtonColor: "#FFFFFF",
            zoomOutButtonRollOverAlpha: 0.15,
            zoomOutButtonImage: "lensWhite"
        },

        AxisBase: {
            axisColor: "#FFFFFF",
            axisAlpha: 0.3,
            gridAlpha: 0.1,
            gridColor: "#FFFFFF",
            dashLength: 3
        },

        ChartScrollbar: {
            backgroundColor: "#000000",
            backgroundAlpha: 0.2,
            graphFillAlpha: 0.2,
            graphLineAlpha: 0,
            graphFillColor: "#FFFFFF",
            selectedGraphFillColor: "#FFFFFF",
            selectedGraphFillAlpha: 0.4,
            selectedGraphLineColor: "#FFFFFF",
            selectedBackgroundColor: "#FFFFFF",
            selectedBackgroundAlpha: 0.09,
            gridAlpha: 0.15
        },

        ChartCursor: {
            cursorColor: "#FFFFFF",
            color: "#000000",
            cursorAlpha: 0.5
        },

        AmLegend: {
            color: "#e7e7e7"
        },

        AmGraph: {
            lineAlpha: 0.9
        },

        GaugeArrow: {
            color: "#FFFFFF",
            alpha: 0.8,
            nailAlpha: 0,
            innerRadius: "40%",
            nailRadius: 15,
            startWidth: 15,
            borderAlpha: 0.8,
            nailBorderAlpha: 0
        },

        GaugeAxis: {
            tickColor: "#FFFFFF",
            tickAlpha: 1,
            tickLength: 15,
            minorTickLength: 8,
            axisThickness: 3,
            axisColor: "#FFFFFF",
            axisAlpha: 1,
            bandAlpha: 0.8
        },

        TrendLine: {
            lineColor: "#c03246",
            lineAlpha: 0.8
        },

        // ammap
        AreasSettings: {
            alpha: 0.8,
            color: "#666666",
            colorSolid: "#000000",
            unlistedAreasAlpha: 0.4,
            unlistedAreasColor: "#555555",
            outlineColor: "#000000",
            outlineAlpha: 0.5,
            outlineThickness: 0.5,
            rollOverBrightness: 30,
            slectedBrightness: 50,
            rollOverOutlineColor: "#000000",
            selectedOutlineColor: "#000000",
            unlistedAreasOutlineColor: "#000000",
            unlistedAreasOutlineAlpha: 0.5
        },

        LinesSettings: {
            color: "#555555",
            alpha: 0.8
        },

        ImagesSettings: {
            alpha: 0.8,
            labelColor: "#FFFFFF",
            color: "#FFFFFF",
            labelRollOverColor: "#3c5bdc"
        },

        ZoomControl: {
            buttonFillAlpha: 0.4
        },

        SmallMap: {
            mapColor: "#444444",
            rectangleColor: "#666666",
            backgroundColor: "#000000",
            backgroundAlpha: 0.5,
            borderColor: "#555555",
            borderThickness: 1,
            borderAlpha: 0.8
        },

        // the defaults below are set using CSS syntax, you can use any existing css property
        // if you don't use Stock chart, you can delete lines below
        PeriodSelector: {
            color: "#e7e7e7"
        },

        PeriodButton: {
            color: "#e7e7e7",
            background: "transparent",
            opacity: 0.7,
            border: "1px solid rgba(255, 255, 255, .15)",
            MozBorderRadius: "5px",
            borderRadius: "5px",
            margin: "1px",
            outline: "none",
            boxSizing: "border-box"
        },

        PeriodButtonSelected: {
            color: "#e7e7e7",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, .3)",
            MozBorderRadius: "5px",
            borderRadius: "5px",
            margin: "1px",
            outline: "none",
            opacity: 1,
            boxSizing: "border-box"
        },

        PeriodInputField: {
            color: "#e7e7e7",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, .15)",
            outline: "none"
        },

        DataSetSelector: {
            color: "#e7e7e7",
            selectedBackgroundColor: "rgba(255, 255, 255, .25)",
            rollOverBackgroundColor: "rgba(255, 255, 255, .15)"
        },

        DataSetCompareList: {
            color: "#e7e7e7",
            lineHeight: "100%",
            boxSizing: "initial",
            webkitBoxSizing: "initial",
            border: "1px solid rgba(255, 255, 255, .15)"
        },

        DataSetSelect: {
            border: "1px solid rgba(255, 255, 255, .15)",
            outline: "none"
        }

    };
})(window.AmCharts);

/***/ }),
/* 19 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 20 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 21 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 22 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 23 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 24 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 25 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 26 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 27 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 28 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 29 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 30 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 31 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 32 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = "<h1>testcomponent</h1>"

/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_34__;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
});
//# sourceMappingURL=avalon-ui-2.js.map