angular.module('ias.components')
    .factory('notification', function($timeout, $compile, $rootScope, $sce, $http,
                                      $templateCache, $templateRequest, messageBox) {
    var _defaultOptions = {
        duration: 5000,
        verticalOffset: 50,
        lineOffset: 10,
        positionX: 'right',
        positionY: 'bottom',
        templateUrl: 'src/templates/notification.html',
        onClose: undefined,
        closeOnClick: true,
        container: 'body',
    };

    var _getScope = function (args) {
        var scope = args.scope.$new();
        scope.notification = {
            content : $sce.trustAsHtml(args.content),
            title : $sce.trustAsHtml(args.title),
            duration: args.duration,
            onClose: args.onClose
        }

        return scope;
    };

    var _initTemplate = function (args, template, scope) {
        var templateElement = $compile(template)(scope);
        templateElement._positionY = args.positionY;
        templateElement._positionX = args.positionX;
        return templateElement;
    };


    var _setLocation = function (elment, args) {
        elment.css(elment._positionY, args.verticalOffset + "px");

        if(args.positionX === 'center'){
            var elWidth = parseInt(elment[0].offsetWidth);
            elment.css('left', parseInt(window.innerWidth / 2 - elWidth / 2) + 'px');
        } else {
            elment.css(elment._positionX, args.lineOffset + "px");
        }
    }

    var _showTemplate = function(args, template) {
        var scope = _getScope(args);
        var templateElement = _initTemplate(args, template, scope);

        var closeMsgEvent = function(e) {
            e = e.originalEvent || e;
            if (e.type === 'click' || (e.propertyName === 'opacity' && e.elapsedTime >= 1)){
                if (scope.notification.onClose) {
                    scope.$apply(scope.notification.onClose(templateElement));
                }

                templateElement.remove();
                scope.$destroy();
            }
        };

        // bind event
        templateElement.addClass('clickable');
        templateElement.bind('click', closeMsgEvent);
        templateElement.bind('transitionend', closeMsgEvent);

        //auto close window
        if (angular.isNumber(args.duration) && args.duration > 0) {
            $timeout(function() {
                templateElement.addClass('killed');
            }, args.duration);
        }

        var bodyHtml = angular.element(document.querySelector(args.container));
        bodyHtml.append(templateElement);
        _setLocation(templateElement, args);

    };

    var _loadTemplate =function (args) {
        var template=$templateCache.get(args.template);

        if(template){
            _showTemplate(args, template)
        }else{
            $templateRequest(args.template).then(function (html) {
                _showTemplate(args, html);
            }).catch(function(data){
                messageBox.error('Template ('+args.template+') could not be loaded. ' + data);
            });
        }
    };

    var _initParas = function (args) {
        if (typeof args !== 'object' || args === null) {
            args = {content:args};
        }
        args.scope = args.scope || $rootScope;
        args.template = args.templateUrl || _defaultOptions.templateUrl;
        args.duration = args.duration === undefined ? _defaultOptions.duration : args.duration;
        args.positionY = args.positionY || _defaultOptions.positionY;
        args.positionX = args.positionX || _defaultOptions.positionX;
        args.lineOffset = args.lineOffset || _defaultOptions.lineOffset;
        args.verticalOffset = args.verticalOffset || _defaultOptions.verticalOffset;
        args.container = args.container || _defaultOptions.container
    };

    return {
        /* params
         * duration:  number 类型;     默认值 5s;                 说明：单位毫秒。设为 0 则不会自动关闭
         * title:     string 类型;     默认值 --;                 说明：标题
         * content:   string 类型;     默认值 --;                 说明：消息内容
         * onClose:   function 类型;   默认值 --;                 说明：回调函数
         * positionX: string 类型;     值：left, right;           说明：左右位置
         * lineOffset: number 类型;    默认值：30;                 说明：左右偏移距离， 单位px
         * positionY: string 类型;     值：top, bottom;           说明：上下位置
         * verticalOffset: number 类型;    默认值：100;             说明：上下偏移距离， 单位px
         * templateUrl: string 类型;   默认值：notification.html;  说明：消息框模板
         * container:   string 类型；    默认值: body              说明：消息框的父元素
         * scope:     object 类型；    默认值: rootScope           说明：消息框模板作用域
         * */
        notify: function (args) {
            _initParas(args);
            _loadTemplate(args)
        }
    };
});