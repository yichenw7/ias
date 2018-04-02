angular.module('ias.components')
    .factory('messageBox', function($rootScope, $timeout, errorLog, loginInfo) {
        var messageBox = {};
        var msgType = {
            SUCCESS: {
                title: '提示',
                value: 0,
                icon: 'ias-success-alert-icon'
            },
            CONFIRM: {
                title: '提示',
                value: 1,
                icon: 'ias-confirm-alert-icon'
            },
            WARN: {
                title: '警告',
                value: 2,
                icon: 'ias-warn-alert-icon'
            },
            ERROR: {
                title: 'ERROR',
                value: 3,
                icon: 'ias-error-alert-icon'
            },
            INFO: {
                title: '提示',
                value: 4,
                icon: null
            }
        };

        var msgShow = function(title, content, hiddenFunc) {
            $rootScope.messageObj.title = title || $rootScope.messageObj.type.title;
            $rootScope.messageObj.contents = content.split('\n');
            $rootScope.messageLabelHeight = {height: $rootScope.messageObj.contents.length * 25 + 'px'};
            $rootScope.messageObj.hiddenFunc = hiddenFunc;
            $('#iasAlert').modal('toggle');
        };

        $rootScope.messageObj = {
            title: '',
            type: null,
            content: '',
            hiddenFunc: null,
            confirmFunc: function () {
                this.closeFunc();
                var callback = this.hiddenFunc;
                if (callback) {
                    var timer = $timeout(function() {callback(); $timeout.cancel(timer);}, 500);
                }
            },
            closeFunc: function() {
                $('#iasAlert').modal('hide');
            },
        };

        $rootScope.messageLabelHeight = {height: '25px'};
        $rootScope.CONFIRM_TYPE = msgType.CONFIRM.value;

        messageBox.confirm = function (content, title, hiddenFunc) {
            $rootScope.messageObj.type = msgType.CONFIRM;
            msgShow(title, content, hiddenFunc);
        };

        messageBox.warn = function(content, title) {
            $rootScope.messageObj.type = msgType.WARN;
            msgShow(title, content);
        };

        messageBox.error = function(content, title) {
            $rootScope.messageObj.type = msgType.ERROR;
            msgShow(title, content);

            errorLog.add({
                account_name: loginInfo.name,
                page: loginInfo.path,
                error_type: 'http',
                error: {msg: content}
            });
        };

        messageBox.success = function(content, title) {
            $rootScope.messageObj.type = msgType.SUCCESS;
            msgShow(title, content);
        };

        messageBox.info = function(content, title) {
            $rootScope.messageObj.type = msgType.INFO;
            msgShow(title, content);
        };

        return messageBox;
    });