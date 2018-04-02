angular.module('ias.services').factory('socketServer', function($rootScope, socketAddress, dataCenter) {
    var socketResource = {};
    return {
        socketResource: socketResource,
        join: function(namespace, id) {
            // @see: https://github.com/socketio/socket.io-client/blob/master/docs/API.md#initialization-examples
            // Note: reusing the same namespace will also create two connections
            var socket = io.connect(socketAddress + namespace);
            socket.emit('join', {companyid: id});
            socket.on('reconnect', function (data) {
                // BUG: 这里reconnect并不会重连接委外机构
                socket.emit('join', {companyid: id});
            });
            socketResource[namespace] = socket;
        },
        joinAgentCompany: function() {
            var roomMap = {};
            var socket = socketResource['/account'];
            var self = this;
            $.each(dataCenter.account.accountsData, function(index, account) {
                if (account.hasOwnProperty('id')
                    && account.hasOwnProperty('agent_company_id')
                    && account.agent_company_id
                    && !roomMap.hasOwnProperty('account.agent_company_id')) {

                    roomMap[account.agent_company_id] = true;
                    if (!socket) {
                        self.join('/account', account.agent_company_id);
                    } else {
                        socket.emit('join', {companyid: account.agent_company_id});
                    }
                }
            });
        },
        joinBrokerRoom: function(namespace, brokerQuote) {
            var socket = io.connect( socketAddress + namespace);
            socket.emit('join', {BrokerQuote: brokerQuote});
            socket.on('reconnect', function (data) {
                socket.emit('join', {BrokerQuote: brokerQuote});
            });
            socketResource[namespace] = socket;
        },
        registerNotificationSocket: function(companyID, scope) {
            this.join('/notification', companyID);
            this.on('/notification', 'system notify event', function(data) {
                if (data && data.message) {
                    notification.notify({
                        scope: scope, // TODO：用解构
                        duration: 0,
                        title: data.message.title,
                        content: data.message.content
                    });
                }
            });
        },
        on: function(namespace, eventName, callback) {
            var socket = socketResource[namespace];
            if (socket) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    })
                });
            }
        },
        close: function() {
            if (socketResource) {
                for(var key in socketResource) {
                    if (socketResource.hasOwnProperty(key) && socketResource[key]) {
                        socketResource[key].close();
                    }
                }
            }
        }
    }
})
