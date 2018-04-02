'use strict';

angular.module('ias.common').service('commonService', ['$rootScope', '$location',

    function ($rootScope, $location) {

        var thisService = this;

        /**
             * Updated by weilai on 06/12/2016
             * @param {} scope 
             * @param {} vaildRule 
             * @returns {} 
             */
        this.checkViewModel = function (scope, vaildRule, errorCallback) {
            if (!vaildRule) return true;

            var onErrorFunction = errorCallback || function () {
                thisService.commonErrorDialog(scope, undefined, vaildRule.errorMessage);
                console.debug("Vaild failed on checkViewModel " + JSON.stringify(vaildRule));
            };

            if (vaildRule.length === 0 || !(vaildRule instanceof Array)) {
                var value = undefined;
                // debugger;
                switch (vaildRule.rule) {
                    case "required":
                        value = thisService.getPropertyX(scope, vaildRule.prop);
                        if (!value) {
                            onErrorFunction();
                            return false;
                        }
                        break;
                    case "requiredAny":
                        value = vaildRule.prop.map(function (e) { return thisService.getPropertyX(scope, e); });
                        if (!value || value.length === 0 || !(value instanceof Array)) break;
                        if (!value.findItem(function (e) { return e; })) {
                            onErrorFunction();
                            return false;
                        }
                        break;
                    case "regexp":
                        value = thisService.getPropertyX(scope, vaildRule.prop);
                        if (!value || !vaildRule.param || !vaildRule.param.pattern || vaildRule.param.pattern.constructor.name !== "RegExp") break;
                        if (!vaildRule.param.pattern.test(value)) {
                            onErrorFunction();
                            return false;
                        }
                        break;
                    case "range":
                    case "rangeOpen":
                        value = thisService.getPropertyX(scope, vaildRule.prop);
                        if (!value || !vaildRule.param || !vaildRule.param.pattern || !vaildRule.param.max || !vaildRule.param.min) break;
                        if ((+value) <= (+vaildRule.param.min) || (+value) >= (+vaildRule.param.max)) {
                            onErrorFunction();
                            return false;
                        }
                        break;
                    case "rangeClose":
                        value = thisService.getPropertyX(scope, vaildRule.prop);
                        if (!value || !vaildRule.param || !vaildRule.param.pattern || !vaildRule.param.max || !vaildRule.param.min) break;
                        if ((+value) < (+vaildRule.param.min) || (+value) > (+vaildRule.param.max)) {
                            onErrorFunction();
                            return false;
                        }
                        break;
                    case "maxLength":
                        value = thisService.getPropertyX(scope, vaildRule.prop);
                        if (!value || !vaildRule.param || !angular.isString(value)) break;
                        if (+(value.length) > (+vaildRule.param)) {
                            onErrorFunction();
                            return false;
                        }
                        break;
                    case "rangeValue":
                        if (!vaildRule.param) break;
                        if (!vaildRule.param.max || (!vaildRule.param.min && +vaildRule.param.min !== 0) || !angular.isNumber(+vaildRule.param.max) || !angular.isNumber(+vaildRule.param.min) || (+vaildRule.param.min > +vaildRule.param.max)) {
                            onErrorFunction();
                            return false;
                        }
                    default:
                        // Custom
                        value = thisService.getPropertyX(scope, vaildRule.prop);
                        if (!value || !vaildRule.param) break;
                        if (vaildRule.param && typeof vaildRule.param[0] === "function" && vaildRule.param[0](value) === false) {
                            onErrorFunction();
                            return false;
                        }
                        break;
                };

                return true;
            }

            var result = true;

            vaildRule.forEach(function (item, index) {

                if (!result) return;

                result = thisService.checkViewModel(scope, item);
            });

            return result;
        };

        /**
         * viewmodel -> dto
         * Updated on 08/31/2016
         * Updated on 01/09/2016 by weiLai
         * @param {} vm 
         * @param {} define 
         * @returns {} 
         */
        this.getDto = getDtoFunc;

        function getDtoFunc(vm, define, dateFormat) {
            var target = undefined;

            if (!define) return target;

            target = {};

            for (var prop in define) {
                if (!define.hasOwnProperty(prop)) continue;

                var vmProp = define[prop];

                if (typeof (vmProp) === "object") {
                    setPropertyXFunc(target, prop, getDtoFunc(vm, vmProp, dateFormat));
                } else {
                    var val = getPropertyXFunc(vm, vmProp);

                    if (val && val.constructor.name === "Date" && dateFormat) {

                        if (val.formatDate && typeof val.formatDate === 'function') {
                            setPropertyXFunc(target, prop, val.formatDate(dateFormat));
                        } else {
                            console.warn("commonService.getDto: DateUtils is required.")
                            setPropertyXFunc(target, prop, val);
                        }

                    } else if (val && val.constructor.name === "Date" && isNaN(dateFormat)) {
                        setPropertyXFunc(target, prop, val.getTime());
                    } else {
                        if (val !== undefined) {
                            setPropertyXFunc(target, prop, val);
                        }
                    }
                }
            }

            return target;
        };

        // 获取容器滚动条的宽度
        this.getScrollBarWidth = function (element) {
            var width = 0;
            if (element) {
                width = element.scrollWidth || element.scrollBarWidth;
            }

            return width;
        };

        // Convert Data to ViewModel
        /**
         * dto -> viewmodel
         * Created on 2017/06/23 By weilai
         */
        this.parseToViewModel = function (model, dataDefine) {

            if(!angular.isArray(dataDefine)) return;

            dataDefine.forEach(define=>{
                // define.prop
                // define.itemsource 这个定义应该做全局托管
            });

            if (convertor) e = convertor(e);

            return e;
        };

        /*
        * 获得时间差,时间格式为 年-月-日 小时:分钟:秒 或者 年/月/日 小时：分钟：秒
        * 其中，年月日为全格式，例如 ： 2010-10-12 01:00:00
        * 返回精度为：秒，分，小时，天
        */
        this.getDateDiff = function (startTime, endTime, diffType) {
            try {
                //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
                if (startTime && startTime.constructor.name !== 'Date') {
                    startTime = startTime.replace(/\-/g, "/");
                }

                if (endTime && endTime.constructor.name !== 'Date') {
                    endTime = endTime.replace(/\-/g, "/");
                }

                //将计算间隔类性字符转换为小写
                diffType = diffType.toLowerCase();

                var sTime = startTime.constructor.name === 'Date' ? startTime : new Date(startTime); //开始时间
                var eTime = endTime.constructor.name === 'Date' ? endTime : new Date(endTime); //结束时间
                //作为除数的数字
                var divNum = 1;
                switch (diffType) {
                    case "second":
                        divNum = 1000;
                        break;
                    case "minute":
                        divNum = 1000 * 60;
                        break;
                    case "hour":
                        divNum = 1000 * 3600;
                        break;
                    case "day":
                        divNum = 1000 * 3600 * 24;
                        break;
                    default:
                        break;
                }

                return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
            } catch (ex) {
                return "--";
            }
        };

        this.safeApply = function (scope, fn) {
            var phase = scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                try {
                    scope.$apply(fn);
                } catch (e) {

                }
            }
        };

        this.vaildateInputDom = function (element, value) {
            var pattern = target.attributes.getNamedItem("pattern");
            var max = target.attributes.getNamedItem("max");
            var min = target.attributes.getNamedItem("max");

            if (!pattern && !max && !min) return true;

            if (pattern && !new RegExp(pattern.nodeValue).match(value)) return false;

            if (max && (+max.nodeValue) < +value) return false;
            if (min && (+min.nodeValue) < +value) return false;

            return true;
        };

        /**
         * getPropertyX
         * Updated on 08/31/2016
         * @param {} obj 
         * @param {} prop 
         * @returns {} 
         */
        function getPropertyXFunc(obj, prop) {
            if (!obj || !prop) return undefined;

            if (typeof (prop) === "object") return undefined;

            if (prop.indexOf(".") < 0) return obj[prop];

            var arr = prop.split(".");
            var firstProp = arr.shift();

            if (!obj.hasOwnProperty(firstProp)) return undefined;

            return getPropertyXFuncArr(obj[firstProp], arr);
        };

        function getPropertyXFuncArr(obj, propArr) {
            if (!propArr || !obj) return obj;

            var firstProp = propArr.shift();

            if (propArr.length === 0) return obj[firstProp];

            return getPropertyXFuncArr(obj[firstProp], propArr);
        };

        this.getPropertyX = getPropertyXFunc;

        /**
         * setProppertyX
         * Updated on 08/31/2016
         * @param {} obj 
         * @param {} prop 
         * @param {} value 
         * @returns {} 
         */
        function setPropertyXFunc(obj, prop, value) {
            if (!obj) obj = {};

            if (!prop || typeof (prop) === "object") return undefined;

            if (prop.indexOf(".") < 0) return obj[prop] = value;

            var arr = prop.split(".");
            var firstProp = arr.shift();

            if (!obj[firstProp]) obj[firstProp] = {};

            setPropertyXFuncArr(obj[firstProp], arr, value);

            return obj;
        };

        function setPropertyXFuncArr(obj, propArr, value) {
            if (!propArr) return;

            var firstProp = propArr.shift();

            if (propArr.length === 0) obj[firstProp] = value;
            else {
                if (!obj[firstProp]) obj[firstProp] = {};
                setPropertyXFuncArr(obj[firstProp], propArr, value);
            }
        };

        this.setPropertyX = setPropertyXFunc;

        this.deleteEmptyProperty = function (obj) {
            for (var prop in obj) {
                if (!obj.hasOwnProperty(prop)) continue;

                if (prop === undefined) delete obj[prop];
            }
        };
    }
]);