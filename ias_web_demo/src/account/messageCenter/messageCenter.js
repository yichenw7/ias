angular.module('ias.components')
    .controller('messageCenterCtrl', function ($scope, messageList, user, socketServer, $filter){
        $scope.paneStyle = {
            right: '-320px'
        };
        $scope.isToday = 1;
        $scope.messageList = [];

        $scope.myMessage = (function () {
            var _todayStr = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 00:00';
            var _isToday = function(msg) {
                return msg.create_time >= _todayStr;
            };
            var _msgInCurrentPage = function (msg, $index) {
                var pageIndex =  $scope.isToday ? $scope.pagination.indexOfToday : $scope.pagination.indexOfHistory;
                var pageSize = $scope.pagination.pageSize;
                return $index > pageSize * pageIndex - 1 && $index < pageSize * (pageIndex + 1)
            };
            var _zeroToEmpty = function (num) {
                if (num === 0) {
                    num = null;
                }
                return num;
            };
            var _readMsg = function(msg_id, unReadNum) {
                var msg = _getMessageById(msg_id);
                if (msg && msg.is_read === 0) {
                    msg.is_read = 1;
                    //更新未读数量
                    unReadNum.total = _zeroToEmpty(unReadNum.total -1);
                    if (_isToday(msg)) {
                        unReadNum.today = _zeroToEmpty(unReadNum.today -1);
                    } else {
                        unReadNum.history = _zeroToEmpty(unReadNum.history -1);
                    }
                }
            };
            var _updateReadProperty = function (msg, unReadNum){
                messageList.update({
                    manager_id : user.id,
                    company_id: user.company_id,
                    msg_list:[msg.id]
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        _readMsg(msg.id, unReadNum);
                    }
                });
            };
            var _showCashFlowDlg = function(msg) {
                if (msg.detail && msg.detail.cash_flows) {
                    $('#cashFlowMsgDetailDlg').modal('show');
                    $scope.cashFlowMsg = msg;
                }
            };
            var _getMessageById = function (msg_id) {
                var find = null;
                $.each($scope.messageList, function(index, msg) {
                    if (msg.hasOwnProperty('id') && msg.id == msg_id) {
                        find = msg;
                        return false;
                    }
                });
                return find;
            };
            return {
                unReadNum: {
                    today: null,
                    history: null,
                    total: null
                },
                amount: {
                    today: null,
                    history: null
                },
                unReadCount: function () {
                    var unRead = {today : 0, history: 0};
                    var all = {today : 0, history: 0};
                    $.each($scope.messageList, function (i, msg) {
                        if (_isToday(msg)) {
                            all.today++;
                            if (msg.is_read == 0) {
                                unRead.today++;
                            }
                        } else {
                            all.history++;
                            if (msg.is_read == 0) {
                                unRead.history++;
                            }
                        }
                    });
                    this.unReadNum.total = _zeroToEmpty(unRead.today + unRead.history);
                    this.unReadNum.today = _zeroToEmpty(unRead.today);
                    this.unReadNum.history = _zeroToEmpty(unRead.history);

                    this.amount.history = _zeroToEmpty(all.history);
                    this.amount.today = _zeroToEmpty(all.today);
                },
                dateFilter: function(msg) {
                    return $scope.isToday ? _isToday(msg) : !_isToday(msg);
                },
                inCurrentPage: _msgInCurrentPage,
                splitBySemicolon: function (content) {
                    if (content && typeof content === 'string') {
                        return content.split(';');
                    }
                    return [];
                },
                onClick: function(msg) {
                    var self = this;
                    _showCashFlowDlg(msg);

                    //未读消息
                    if (msg.is_read ==0) {
                        _updateReadProperty(msg, self.unReadNum);
                    }
                }
            };
        })();

        $scope.pagination =(function () {
            var _pageSize = 9;
            var _inRangPage = function (index, total) {
                return (index + 1) * _pageSize < total;
            };
            var _indexOfEndPage = function (total) {
                return  Math.ceil(total / _pageSize) - 1;
            };
            return {
                indexOfToday: 0,
                indexOfHistory: 0,
                pageSize: _pageSize,
                homePage: function() {
                    if($scope.isToday == 1) {
                        this.indexOfToday = 0;
                    } else {
                        this.indexOfHistory = 0;
                    }
                },
                lastPage: function () {
                    if ($scope.isToday == 1) {
                        this.indexOfToday == 0 || this.indexOfToday--;
                    } else {
                        this.indexOfHistory == 0 || this.indexOfHistory--;
                    }
                },
                nextPage: function () {
                    if ($scope.isToday == 1) {
                        if(_inRangPage(this.indexOfToday, $scope.myMessage.amount.today)){
                            this.indexOfToday++;
                        }
                    } else {
                        if(_inRangPage(this.indexOfHistory, $scope.myMessage.amount.history)){
                            this.indexOfHistory++;
                        }
                    }
                },
                endPage: function() {
                    if ($scope.isToday == 1) {
                        this.indexOfToday = _indexOfEndPage($scope.myMessage.amount.today);
                    } else {
                        this.indexOfHistory = _indexOfEndPage($scope.myMessage.amount.history);
                    }
                }
            };
        })();

        $scope.cashFlowMsg = null;
        $scope.closeCashFlowDlg = function() {
            $('#cashFlowMsgDetailDlg').modal('hide');
        };

        $scope.openPanel = function () {
            $scope.paneStyle.right = $scope.paneStyle.right == '0px' ? '-320px' : '0px';
        };
        $scope.switchDateType = function (type){
            $scope.isToday = type;
        };

        $scope.getMsgList = function (){
            messageList.get({
                manager_id: user.id,
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $scope.messageList.length = 0;
                    $.each(data, function(index, value){
                        value.contents = $scope.myMessage.splitBySemicolon(value.content);
                        $scope.messageList.push(value);
                    });

                    $scope.myMessage.unReadCount();
                }
            });
        };
        $scope.getMsgList();
        $scope.$on('refresh message list', function(){
            $scope.getMsgList();
        });

        socketServer.join('/message_center', user.company_id);
        socketServer.on('/message_center', 'message center event', function (data) {
            if (data.manager_id == user.id) {
                if (data.action == 'update') {
                    $.each(data.msg_list, function (i, msg) {
                        $.each($scope.messageList, function (index, value) {
                            if (value.is_read == 0 && value.message_set_id == msg.message_set_id
                                && value.bond_id == msg.bond_id && value.type == msg.type) {
                                $scope.messageList.splice(index, 1);
                                return false;
                            }
                        });
                    });
                }

                if (data.action == 'update' || data.action == 'add') {
                    $.each(data.msg_list, function (index, value) {
                        value.contents = $scope.myMessage.splitBySemicolon(value.content);
                        $scope.messageList.unshift(value);
                    });
                }

                $scope.myMessage.unReadCount();
            }
        });
    })
    .controller('messageSettingCtrl', function ($scope, dataCenter, $window, accountFactory, messageSetQb, user, positionsQuery,
                                                authorityControl, accountService, messageList, messageBox){
        $window.jsfunc=function (arg){console.log(arg);};
        $scope.groups = accountFactory.groupSet;
        $scope.accounts = accountFactory.accountSet;
        $scope.inputGroup = [
            {label: '价格', value: '1'},
            {label: '日历事件', value: '2'},
            {label: '评级', value: '3'},
            /*{label: '新闻事件', value: '4'}*/
            {label: '现金流', value: '5'},
        ];
        $scope.changeBtn = function (value) {
            if (value === '5') {
                $scope.$broadcast('init cash flow tab');
            }
        }
        $scope.tabType = '1';
        $scope.calendarBondSelectList = []; //日历事件变量
        $scope.rateBondSelectList = []; //评级事件变量
        $scope.bondSelectList = {
            idList: [],
            modelMap: {}
        };//存储在数据库里的单只债券集合变量
        $scope.calendarQb ={
            beforeDays: [
                {label: '1天', value: 1},
                {label: '5天', value: 5},
                {label: '10天', value: 10},
                {label: '15天', value: 15},
                {label: '30天', value: 30}
            ],
            beforeDay : 1
        };
        $scope.saveBtnClick = function (){
            if ($scope.tabType == '1'){
                $scope.$broadcast('click price tab save btn');
            }
            if ($scope.tabType == '2'){
                $scope.$broadcast('click qb tab save btn');
            }
            if ($scope.tabType == '3'){
                $scope.$broadcast('click qb tab save btn');
            }
            if ($scope.tabType == '4'){
                $scope.$broadcast('click news tab save btn');
            }
            if ($scope.tabType == '5'){
                $scope.$broadcast('click cash flow tab save btn');
            }

        }

        $scope.cancelBtnClick = function (){
            $scope.$broadcast('click cancel btn');
        }
        $scope.closeBtnClick = function (){
            $("#remindSetDlg").modal('hide');
        }
        $scope.bondList = dataCenter.market.bondDetailList;

        $('#remindSetDlg').on('show.bs.modal', function (e) {
            $scope.tabType = '1';
            $scope.$broadcast('angucomplete-alt:clearInput', 'all');
        });
        $scope.onError = function (){
            messageBox.error("设置出错了！");
            $('#loadShadeDiv').modal('hide');
        }

        if ($window.cefQuery) {
            //测试qb版本是否支持
            $window.cefQuery({
                //50084 查询操作
                request: '["req_qbmsg",[{"funcid":50084,"callback":"","param":"--","req":{"UserId":"","UserAccount":"@sumscope.com","BeginTime":-1,"EndTime":-1}}]]',
                onSuccess: function (response) {
                    //console.log(response);
                },
                onFailure: function (error_code, error_message) {
                    //如果QB不支持，隐藏日历事件等tab
                    $scope.inputGroup.length = 1;
                }
            });
            //查询回调函数
            $window.jsfunc_1 = function (data){
                $.each(data.response.List, function (index, value){
                    //判断是否是单只债券
                    $scope.calendarQb.beforeDay = value.CalendarCondition.BeforeDays;
                    if (value.BondID && $scope.bondSelectList.idList.indexOf(value.BondID) > -1 ){
                        var model = $scope.bondSelectList.modelMap[value.BondID];
                        var tempObj = {};
                        tempObj.bond_id = value.BondID;
                        tempObj.bond_key_listed_market = value.Bond_Key + value.ListedMarket;
                        tempObj.short_name = value.Short_Name;
                        var calOption = value.CalendarCondition;
                        var rateOption = value.RatingCondition;
                        //日历事件
                        if (model.events && model.events.indexOf('Canlendar') > -1 && (calOption.Pay ||
                            calOption.Option || calOption.Maturity)) {
                            tempObj.fx_checked = calOption.Pay;
                            tempObj.xq_checked = calOption.Option;
                            tempObj.dx_checked = calOption.Maturity;

                            // 同时属于组合和单只债券时按存在ias数据库里的属性赋值
                            if (model.pay || model.option || model.maturity){
                                tempObj.fx_checked = model.pay;
                                tempObj.xq_checked = model.option;
                                tempObj.dx_checked = model.maturity;
                            }
                            $scope.calendarBondSelectList.push(tempObj);
                        }
                        //评级事件
                        if (model.events && model.events.indexOf('Rate') > -1 && ( rateOption.ProspectsChange
                            || rateOption.RatingChange || rateOption.RatingUpdate)) {
                            tempObj.gx_checked = rateOption.RatingUpdate;
                            tempObj.bd_checked = rateOption.RatingChange;
                            tempObj.zw_checked = rateOption.ProspectsChange;

                            // 同时属于组合和单只债券时按存在ias数据库里的属性赋值
                            if (model.prospects_change || model.rating_change || model.rating_update){
                                tempObj.gx_checked = model.rating_update;
                                tempObj.bd_checked = model.rating_change;
                                tempObj.zw_checked = model.prospects_change;
                            }
                            $scope.rateBondSelectList.push(tempObj);
                        }
                    }
                })
            };
            // 删除回调函数
            $window.jsfunc_3 = function (data){
                if(data.desc != 'success'){
                    $scope.onError();
                    return;
                }
                $scope.asyncNum++;
                //确保qb所有单次删除都成功了
                if ($scope.asyncNum + 1 > $scope.asyncLength) {
                    messageSetQb.delete({
                            manager_id: user.id,
                            company_id: user.company_id,
                            id: user.id
                        },
                        function success(response) {
                            if (response.code && response.code === '0000') {
                                iasCallBack();
                            }
                        }),
                        function error (){
                            $scope.onError();
                        }

                }
            };
            var qbCallBack = function(){
                $window.cefQuery({
                    request: '["req_cache", [{"data":"UserInfo"}]]', onSuccess: function (response) {
                        $scope.qbMessageObj = eval('(' + response + ')');
                        $window.cefQuery({
                            //50084 查询操作
                            request: '["req_qbmsg",[{"funcid":50084,"callback":"jsfunc_1","param":"--","req":{"UserId":"' + $scope.qbMessageObj.UserId + '","UserAccount":"' + $scope.qbMessageObj.UserAccount + '@sumscope.com","BeginTime":-1,"EndTime":-1}}]]',
                            onSuccess: function (response) {
                                console.log(response);
                            },
                            onFailure: function (error_code, error_message) {
                                console.log(error_message);
                                $scope.onError();
                            }
                        })
                    }
                });
            }
            var iasCallBack = function (){
                var modify_req={
                    "Bond_Key":"",
                    "ListedMarket":"",
                    "BondID":"",
                    "Short_Name":"",
                    "GroupID":"",
                    "UserId": $scope.qbMessageObj.UserId,
                    "UserAccount": $scope.qbMessageObj.UserAccount + "@sumscope.com",
                    "ReminderStatus":1,
                    "PopWindow":false,
                    "MessageCenter":false,
                    "QM":false,
                    "Email":false,
                    "Sound":false,
                    "PriceCondition":{
                        "PriceAppear":false,
                        "DealDone":false,
                        "PriceArea":false,
                        "BidPrice":0.000000,
                        "BidCondition":"",
                        "OfrPrice":0.000000,
                        "OfrCondition":"",
                        "Spread":0.000000,
                        "SpreadCondition":""
                    },
                    "CalendarCondition":{
                        "BeforeDays":$scope.calendarQb.beforeDay,
                        "BeOnce":false,
                        "Pay":false,
                        "Option":false,
                        "Maturity":false
                    },
                    "RatingCondition":{
                        "RatingUpdate":false,
                        "RatingChange":false,
                        "ProspectsChange":false
                    }
                };
                var qbMessageEntity = {};
                var count_1 = 0;
                var count_2 = 0;
                var bol = true;

                function saveIasQbFunc () {
                    $.each($scope.calendarBondSelectList, function (index, value) {
                        if (!(value.fx_checked || value.xq_checked || value.dx_checked ||
                            value.gx_checked || value.bd_checked || value.zw_checked)){
                            return true;
                        }
                        var obj = qbMessageEntity[value.bond_id];
                        if (!obj) {
                            obj = qbMessageEntity[value.bond_id] = {};
                            obj.bond_id = value.bond_id;
                            obj.short_name = value.short_name;
                            obj.bond_key = value.bond_key_listed_market.slice(0,-3);
                            obj.listed_market = value.bond_key_listed_market.substr(-3,3);
                        }
                        //  组合里已经有了，此时需要记录单债券的信息
                        if (obj.fx_checked || obj.xq_checked || obj.dx_checked){
                            obj.bothCanlendar = true;
                            obj.single_fx_checked = value.fx_checked;
                            obj.single_xq_checked = value.xq_checked;
                            obj.single_dx_checked = value.dx_checked;
                        }
                        obj.group_id = undefined;
                        obj.isCanlendar = true;
                        obj.fx_checked = obj.fx_checked || value.fx_checked || false;
                        obj.xq_checked = obj.xq_checked || value.xq_checked || false;
                        obj.dx_checked = obj.dx_checked || value.dx_checked || false;
                    });
                    $.each($scope.rateBondSelectList, function (index, value) {
                        var obj = qbMessageEntity[value.bond_id];
                        if (!obj){
                            obj = qbMessageEntity[value.bond_id] = {};
                            obj.bond_id = value.bond_id;
                            obj.short_name = value.short_name;
                            obj.bond_key = value.bond_key_listed_market.slice(0,-3);
                            obj.listed_market = value.bond_key_listed_market.substr(-3,3);
                        }
                        //  组合里已经有了，此时需要记录单债券的信息
                        if (obj.gx_checked || obj.bd_checked || obj.zw_checked){
                            obj.bothRate = true;
                            obj.single_gx_checked = value.gx_checked;
                            obj.single_bd_checked = value.bd_checked;
                            obj.single_zw_checked = value.zw_checked;
                        }
                        obj.group_id = undefined;
                        obj.isRate = true;
                        obj.gx_checked = obj.gx_checked || value.gx_checked || false;
                        obj.bd_checked = obj.bd_checked || value.bd_checked || false;
                        obj.zw_checked = obj.zw_checked || value.zw_checked || false;
                    });
                    var tag1 = 0;
                    var tag2 = 0;
                    var qb_msg_list = [];
                    $.each(qbMessageEntity, function(index, value){
                        tag1 ++;
                    });
                    $.each(qbMessageEntity, function(index, value){
                        modify_req.BondID = value.bond_id;
                        modify_req.Short_Name = value.short_name;
                        modify_req.Bond_Key = value.bond_key;
                        modify_req.ListedMarket = value.listed_market;
                        modify_req.CalendarCondition.Pay = value.fx_checked;
                        modify_req.CalendarCondition.Option = value.xq_checked;
                        modify_req.CalendarCondition.Maturity = value.dx_checked;
                        modify_req.RatingCondition.RatingUpdate = value.gx_checked;
                        modify_req.RatingCondition.RatingChange = value.bd_checked;
                        modify_req.RatingCondition.ProspectsChange = value.zw_checked;
                        var funIndex = 'jsfunc_' + index + 2;
                        $window[funIndex] = function (data){
                            tag2++;
                            if (data.desc == 'success') {
                                // 债券属于组合
                                if(value.group_id){
                                    $.each($scope.groups, function(i, v){
                                        if (value.group_id == v.id){
                                            value.fx_checked = v.fx_checked;
                                            value.xq_checked = v.xq_checked;
                                            value.dx_checked = v.dx_checked;
                                            value.gx_checked = v.gx_checked;
                                            value.bd_checked = v.bd_checked;
                                            value.zw_checked = v.zw_checked;
                                            return false;
                                        }
                                    });
                                    $.each($scope.accounts, function(i, v){
                                        if (value.group_id == v.id){
                                            value.fx_checked = v.fx_checked;
                                            value.xq_checked = v.xq_checked;
                                            value.dx_checked = v.dx_checked;
                                            value.gx_checked = v.gx_checked;
                                            value.bd_checked = v.bd_checked;
                                            value.zw_checked = v.zw_checked;
                                            return false;
                                        }
                                    })
                                    var qb_msg = {
                                        bond_id: value.bond_id,
                                        group_id: value.group_id,
                                        pay: value.fx_checked,
                                        option: value.xq_checked,
                                        maturity: value.dx_checked,
                                        rating_update: value.gx_checked,
                                        rating_change: value.bd_checked,
                                        prospects_change: value.zw_checked,
                                        qb_id: data.response.ReminderId
                                    };
                                }
                                // 单只债券
                                else {
                                    var qb_msg = {
                                        bond_id: value.bond_id,
                                        qb_id: data.response.ReminderId,
                                        events: ''
                                    };
                                    if (value.isCanlendar){
                                        qb_msg.events += 'Canlendar,'
                                    }
                                    if (value.isRate){
                                        qb_msg.events += 'Rate,'
                                    }
                                    // 如果同时属于组合和单只债券，也需要记录各个属性
                                    if (value.bothCanlendar){
                                        qb_msg.pay = value.single_fx_checked;
                                        qb_msg.option = value.single_xq_checked;
                                        qb_msg.maturity = value.single_dx_checked;
                                    }
                                    if (value.bothRate){
                                        qb_msg.rating_update = value.single_gx_checked;
                                        qb_msg.rating_change = value.single_bd_checked;
                                        qb_msg.prospects_change = value.single_zw_checked;
                                    }
                                }
                                qb_msg_list.push(qb_msg);

                                if (tag2 + 1 > tag1){
                                    messageSetQb.add({
                                        manager_id: user.id,
                                        company_id: user.company_id,
                                        msg_list: qb_msg_list
                                    }, function success(response) {
                                        if (response.code && response.code === '0000') {
                                            $('#loadShadeDiv').modal('hide');
                                        }
                                    }, function error(){
                                        $scope.onError();
                                    });
                                }
                            }
                            $window[funIndex] = null;
                        };

                        $window.cefQuery({
                            //50081 添加操作(添加的逻辑是QB添加完了所有，IAS再全部一起添加)
                            request: '["req_qbmsg",[{"funcid":50081,"callback":"'+ funIndex +'","param":"' + value.bond_id + '","req":' + JSON.stringify(modify_req) +'}]]',
                            onSuccess: function(response){
                                console.log(response);
                            },
                            onFailure: function (error_code, error_message) {
                                /*console.log(error_message);*/
                                tag2++;
                                $scope.onError();
                            }
                        })
                    })
                    //判断是否没有选任何债券
                    if (tag1 == 0){
                        $('#loadShadeDiv').modal('hide');
                    }
                }
                var groupsAndAccounts = $scope.groups.concat($scope.accounts);

                //获取估值表组合日期函数
                function getValuationDate(accounts){
                    var account_list = [];
                    var valuationDates = [];
                    $.each(accounts, function (index, accountId) {
                        var account = accountService.getAccountById(accountId);
                        if(account){
                            account_list.push(account);
                        }
                    })

                    if (account_list[0].valuation_dates && account_list[0].valuation_dates.length > 0) {
                        $.each(account_list, function (index, account) {
                            valuationDates = valuationDates.concat(account.valuation_dates);
                        })
                        //排序
                        valuationDates.sort(function compareFunction(param1, param2) {
                            return param2.localeCompare(param1);
                        });
                        return valuationDates[0];
                    } else {
                        return undefined;
                    }
                }

                $.each(groupsAndAccounts, function (index, value) {
                    if (value.fx_checked || value.xq_checked || value.dx_checked
                        || value.gx_checked || value.bd_checked || value.zw_checked) {
                        bol = false;
                        count_2 ++ ;
                        positionsQuery.post({
                            account_group_id: 'ffffffffffffffffffffffffffffffff',
                            company_id: user.company_id,
                            first_group_by: '',
                            second_group_by: '',
                            account_list: authorityControl.getAccountGroupMember(value.accounts || [value.id]),
                            show_type: "contrast",
                            // date: getValuationDate(value.accounts || [value.id])
                        }, function success(response) {
                            if (response.code && response.code === '0000') {
                                var data = response.data;
                                count_1++;
                                $.each(data, function (index, val) {
                                    if (val.bond_code) {
                                        var obj = qbMessageEntity[val.bond_code];
                                        if (!obj) {
                                            obj = qbMessageEntity[val.bond_code] = {};
                                            obj.group_id = value.id;
                                            obj.bond_id = val.bond_code;
                                            obj.short_name = val.short_name;
                                            obj.bond_key = val.bond_key_listed_market.slice(0, -3);
                                            obj.listed_market = val.bond_key_listed_market.substr(-3, 3);
                                        }
                                        obj.fx_checked = obj.fx_checked || value.fx_checked || false;
                                        obj.xq_checked = obj.xq_checked || value.xq_checked || false;
                                        obj.dx_checked = obj.dx_checked || value.dx_checked || false;
                                        obj.gx_checked = obj.gx_checked || value.gx_checked || false;
                                        obj.bd_checked = obj.bd_checked || value.bd_checked || false;
                                        obj.zw_checked = obj.zw_checked || value.zw_checked || false;
                                    }
                                })
                                if (count_1 + 1 > count_2) {
                                    saveIasQbFunc();
                                }
                            }
                        }, function error (){
                            $scope.onError();
                        })
                    }
                });
                //未选组合或账户
                if (bol){
                    saveIasQbFunc();
                }


            }
            //初始化界面
            $scope.init = function () {
                $scope.calendarBondSelectList.length = 0;
                $scope.rateBondSelectList.length = 0;
                $scope.bondSelectList.idList.length = 0;
                $scope.bondSelectList.modelMap = {};
                $.each($scope.groups, function (num, val){
                    val.cal_checked = undefined;
                    val.rate_checked = undefined;
                    val.fx_checked = undefined;
                    val.xq_checked = undefined;
                    val.dx_checked = undefined;
                    val.gx_checked = undefined;
                    val.bd_checked = undefined;
                    val.zw_checked = undefined;
                });
                $.each($scope.accounts, function (num, val){
                    val.cal_checked = undefined;
                    val.rate_checked = undefined;
                    val.fx_checked = undefined;
                    val.xq_checked = undefined;
                    val.dx_checked = undefined;
                    val.gx_checked = undefined;
                    val.bd_checked = undefined;
                    val.zw_checked = undefined;
                });
                messageSetQb.get({
                    manager_id: user.id,
                    company_id: user.company_id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        $.each(data, function (index, value){
                            //给组合赋值
                            $.each($scope.groups, function (num, val){
                                if (value.group_id == val.id){
                                    val.fx_checked = value.pay;
                                    val.xq_checked = value.option;
                                    val.dx_checked = value.maturity;
                                    val.gx_checked = value.rating_update;
                                    val.bd_checked = value.rating_change;
                                    val.zw_checked = value.prospects_change;
                                    val.cal_checked = val.fx_checked || val.xq_checked || val.dx_checked; /*val.hsq_checked || val.tqsh_checked*/
                                    val.rate_checked = val.gx_checked || val.bd_checked || val.zw_checked;
                                }
                            })
                            $.each($scope.accounts, function (num, val){
                                if (value.group_id == val.id){
                                    val.fx_checked = value.pay;
                                    val.xq_checked = value.option;
                                    val.dx_checked = value.maturity;
                                    val.gx_checked = value.rating_update;
                                    val.bd_checked = value.rating_change;
                                    val.zw_checked = value.prospects_change;
                                    val.cal_checked = val.fx_checked || val.xq_checked || val.dx_checked; /*val.hsq_checked || val.tqsh_checked*/
                                    val.rate_checked = val.gx_checked || val.bd_checked || val.zw_checked;
                                }
                            })

                            if (!value.group_id){
                                $scope.bondSelectList.idList.push(value.bond_id);
                                $scope.bondSelectList.modelMap[value.bond_id.toString()] = value;
                            }
                        });
                        qbCallBack();
                    }
                });
            };
            $('#remindSetDlg').on('hidden.bs.modal', function(){
                $scope.tabType = '1';
                $scope.init();
            });
            $scope.init();
        }
        $scope.$on('click qb tab save btn', function(){
            if (!$window.cefQuery){
                return false;
            }
            $('#loadShadeDiv').modal({backdrop: 'static', keyboard: false});

            messageSetQb.get({
                manager_id: user.id,
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    if (data.length == 0) {
                        iasCallBack();
                        return;
                    }
                    $scope.asyncLength = data.length;
                    $scope.asyncNum = 0;
                    $.each(data, function (index, value) {
                        if (value.bond_id) {
                            //50082 删除操作（删除的逻辑是qb全部删除了，ias再执行删除操作）
                            var str = '["req_qbmsg",[{"funcid":50082,"callback":"jsfunc_3","param":"--","req":{"ReminderId":"' + value.qb_id + '"}}]]';
                            window.cefQuery({
                                request: str,
                                onSuccess: function (response) {
                                    console.log(response);
                                },
                                onFailure: function (error_code, error_message) {
                                    //console.log(error_message);
                                    $scope.onError();
                                }
                            })
                        }
                    })
                }
            }, function error(){
                $scope.onError();
            });

        });

    })
    .controller('messagePriceCtrl', function($scope,messageSet, user, messageList, messageBox){
        $scope.model = {
            is_group: 0,
            group_type: 0,
            listed_market: '0',
            price_appear: false,
            deal: false,
            inquiry: false,
            option_price: 1,
            option_bid: 1,
            option_ofr: 1
        };
        $scope.options = [
            {label: '并且', value: 1},
            {label: '或', value: 0}
        ];
        $scope.operators = [
            {label: '加', value: 1},
            {label: '减', value: -1}
        ];
        $scope.groupTypes = [{label: '持仓',value: 1}/*, {label: '债券池',value: 2}, {label: '可投库',value: 3}*/];
        $scope.msgSetList = [];
        $scope.addMsgList = function (){
            messageList.add({
                manager_id : user.id,
                company_id: user.company_id,
                msg_list:[{
                    is_read: 0,
                    content: 'folk'
                }]
            })
        }
        $scope.deleteMsgList = function (msgId){
            messageList.delete({
                manager_id: user.id,
                company_id: user.company_id,
                id: msgId
            });
        }
        $scope.validate = function(){
            var option_1 = $scope.model.title && $scope.model.bond_id;
            var option_2 = $scope.model.title && $scope.model.is_group;
            var option_3 = $scope.model.is_deal && ($scope.model.clean_price || $scope.model.volume ||  $scope.model.option_price);
            var option_4 = $scope.model.is_inquiry &&
                ($scope.model.bid_minus_cdc_val ||
                    $scope.model.cdc_val_minus_ofr ||
                    $scope.model.bid_volume ||
                    $scope.model.ofr_volume
                );
            if (!((option_1 || option_2) && (option_3 || option_4))){
                messageBox.warn( '字段不全');
                return false;
            }

            if (!$scope.model.is_deal) {
                $scope.model.clean_price = null;
                $scope.model.volume = null;
                $scope.model.option_price = 1
            }
            if (!($scope.model.clean_price || $scope.model.volume)){
                $scope.model.is_deal = false;
            }
            if (!$scope.model.is_inquiry) {
                $scope.model.bid_minus_cdc_val = null;
                $scope.model.cdc_val_minus_ofr = null;
                $scope.model.bid_volume = null;
                $scope.model.ofr_volume = null;
                $scope.model.option_bid = 1;
                $scope.model.option_ofr = 1;
            }
            if (!($scope.model.bid_minus_cdc_val || $scope.model.cdc_val_minus_ofr
                || $scope.model.bid_volume || $scope.model.ofr_volume)){
                $scope.model.is_inquiry = false;
            }
            //单只债券情况
            if ($scope.model.is_group == 0) {
                $scope.model.group_type = 1;
            }
            //组合情况
            if ($scope.model.is_group == 1) {
                $scope.model.bond_id = undefined;
                $scope.model.short_name = undefined;
            }
            return true;
        }
        $scope.addMsgSet = function (){
            var isRepeatName = true;
            $.each($scope.msgSetList, function(index, value){
                if ($scope.model.title == value.title){
                    messageBox.warn('已有同名设置，请修改名称');
                    return isRepeatName=false;
                }
            })
            if (!isRepeatName){
                return false;
            }
            if (!$scope.validate()){
                return false;
            }
            messageSet.add({
                manager_id: user.id,
                company_id: user.company_id,
                msg_type: 'bond_price',
                condition: {
                    title: $scope.model.title,
                    is_group: $scope.model.is_group,
                    bond_id: $scope.model.bond_id,
                    short_name: $scope.model.short_name,
                    group_type: $scope.model.group_type,
                    listed_market: '1',
                    clean_price: ($scope.model.clean_price),
                    volume: ($scope.model.volume * 100),
                    bid_minus_cdc_val: ($scope.model.bid_minus_cdc_val) && ($scope.model.operator_bid * $scope.model.bid_minus_cdc_val/100),
                    cdc_val_minus_ofr: ($scope.model.cdc_val_minus_ofr) && ($scope.model.operator_ofr * $scope.model.cdc_val_minus_ofr/100),
                    bid_volume: ($scope.model.bid_volume * 100),
                    ofr_volume: ($scope.model.ofr_volume * 100),
                    option_price: ($scope.model.option_price),
                    option_bid: ($scope.model.option_bid),
                    option_ofr: ($scope.model.option_ofr),
                    is_deal: $scope.model.is_deal,
                    is_inquiry: $scope.model.is_inquiry
                },
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    $scope.getMsgSetList();
                }
            });
            $("#remindSetDlg").modal('hide');
        }
        $scope.getMsgSetList = function (){
            messageSet.get({
                manager_id: user.id,
                company_id: user.company_id,
                msg_type: 'bond_price'
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $scope.msgSetList = data;
                }
            });
        }

        $scope.updateMsgSet = function (){
            if (!$scope.validate()){
                return false;
            }
            messageSet.update({
                manager_id: user.id,
                company_id: user.company_id,
                msg_set_id: $scope.msgSet.id,
                condition: {
                    title: $scope.model.title,
                    is_group: $scope.model.is_group,
                    bond_id: $scope.model.bond_id,
                    short_name: $scope.model.short_name,
                    group_type: $scope.model.group_type,
                    listed_market: '1',
                    clean_price: ($scope.model.clean_price),
                    volume: ($scope.model.volume * 100),
                    bid_minus_cdc_val: ($scope.model.bid_minus_cdc_val) && ($scope.model.operator_bid * $scope.model.bid_minus_cdc_val/100),
                    cdc_val_minus_ofr: ($scope.model.cdc_val_minus_ofr) && ($scope.model.operator_ofr * $scope.model.cdc_val_minus_ofr/100),
                    bid_volume: ($scope.model.bid_volume * 100),
                    ofr_volume: ($scope.model.ofr_volume * 100),
                    option_price: $scope.model.option_price,
                    option_bid: $scope.model.option_bid,
                    option_ofr: $scope.model.option_ofr,
                    is_deal: $scope.model.is_deal,
                    is_inquiry: $scope.model.is_inquiry
                }
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    $scope.getMsgSetList();
                }
            });
            $("#remindSetDlg").modal('hide');
        }

        $scope.deleteMsgSet = function (){
            messageSet.delete({
                manager_id: user.id,
                company_id: user.company_id,
                id: $scope.msgSet.id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    $scope.getMsgSetList();
                    $scope.newMsgSet();
                    $scope.$emit('update message list');
                }
            });
        }

        $scope.obj = {};

        $scope.newMsgSet = function (){
            $scope.msgSet = null;
            $scope.model.title = undefined;
            $scope.model.is_group = 0;
            $scope.model.bond_id = undefined;
            $scope.model.short_name = undefined;
            $scope.model.group_type = 1;
            $scope.model.clean_price = undefined;
            $scope.model.volume = undefined;
            $scope.model.bid_minus_cdc_val = undefined;
            $scope.model.bid_volume = undefined;
            $scope.model.cdc_val_minus_ofr = undefined;
            $scope.model.ofr_volume = undefined;
            $scope.model.option_price = 1;
            $scope.model.option_bid = 1;
            $scope.model.option_ofr = 1;
            $scope.model.operator_bid = 1;
            $scope.model.operator_ofr = 1;
            $scope.model.is_deal = false;
            $scope.model.is_inquiry = false;
        }
        $scope.msgSetSelect = function (msg){
            if (!$scope.msgSet || !$scope.msgSet.condition) {
                return
            }
            var condition = $scope.msgSet.condition;
            $scope.model.title = condition.title;
            $scope.model.is_group = condition.is_group;
            $scope.model.group_type = condition.group_type;
            $scope.model.bond_id = condition.bond_id;
            $scope.model.short_name = condition.short_name;
            $scope.model.clean_price = condition.clean_price;
            $scope.model.volume = condition.volume && Number((condition.volume / 100).toFixed(4));
            $scope.model.bid_minus_cdc_val = condition.bid_minus_cdc_val && Number((condition.bid_minus_cdc_val*100).toFixed(4));
            $scope.model.bid_volume = condition.bid_volume && Number((condition.bid_volume / 100).toFixed(4));
            $scope.model.cdc_val_minus_ofr = condition.cdc_val_minus_ofr && Number((condition.cdc_val_minus_ofr*100).toFixed(4));
            $scope.model.ofr_volume = condition.ofr_volume && Number((condition.ofr_volume / 100).toFixed(4));
            $scope.model.option_price = condition.option_price;
            $scope.model.option_bid = condition.option_bid;
            $scope.model.option_ofr = condition.option_ofr;
            $scope.model.is_deal = condition.is_deal;
            $scope.model.is_inquiry = condition.is_inquiry;
            $scope.model.operator_bid = 1;
            $scope.model.operator_ofr =1;
            //判断正负号
            if ($scope.model.bid_minus_cdc_val){
                $scope.model.operator_bid = Math.abs($scope.model.bid_minus_cdc_val)/$scope.model.bid_minus_cdc_val;
                $scope.model.bid_minus_cdc_val = Math.abs($scope.model.bid_minus_cdc_val);
            }
            if ($scope.model.cdc_val_minus_ofr){
                $scope.model.operator_ofr = Math.abs($scope.model.cdc_val_minus_ofr)/$scope.model.cdc_val_minus_ofr;
                $scope.model.cdc_val_minus_ofr = Math.abs($scope.model.cdc_val_minus_ofr);
            }

        }
        $scope.getMsgSetList();

        $scope.bondSelectFun = function(selected) {
            if (selected) {
                $scope.model.bond_id = selected.originalObject.bond_id;
                $scope.model.short_name = selected.originalObject.short_name;
            }
        };
        $('#remindSetDlg').on('show.bs.modal', function (e) {
            $scope.newMsgSet();
            $scope.$apply();
        })
        $scope.$on('click price tab save btn', function(){
            if ($scope.msgSet){
                $scope.updateMsgSet();
            }
            else {
                $scope.addMsgSet();
            }

        })
        $scope.$on('click cancel btn', function(){
            $scope.newMsgSet();
        })
    })
    .controller('messageCalendarCtrl', function($scope, messageBox){
        $scope.firstCheckClick = function (group) {
            group.fx_checked = group.cal_checked;
            group.xq_checked = group.cal_checked;
            group.dx_checked = group.cal_checked;
            /*group.hsq_checked = group.cal_checked;
             group.tqsh_checked = group.cal_checked;*/
        };
        $scope.checkClick = function (group) {
            group.cal_checked = group.fx_checked || group.xq_checked || group.dx_checked; /*|| group.hsq_checked || group.tqsh_checked*/
        };

        $scope.bondSelectFun = function(selected) {
            if (selected) {
                var bol = true;
                $.each($scope.calendarBondSelectList, function (index, value){
                    if (value.bond_id == selected.originalObject.bond_id){
                        messageBox.warn("该债券已选")
                        return bol = false;
                    }
                })
                if (bol){
                    $scope.calendarBondSelectList.push(angular.copy(selected.originalObject));
                }
            }
        };
        $scope.bondDelete = function (bond) {
            for (var i = 0; i< $scope.calendarBondSelectList.length; i++){
                if($scope.calendarBondSelectList[i].bond_id == bond.bond_id){
                    $scope.calendarBondSelectList.splice(i,1);
                }
            }
        };

    })
    .controller('messageRateCtrl', function($scope, messageBox){

        $scope.firstCheckClick = function (group) {
            group.gx_checked = group.rate_checked;
            group.bd_checked = group.rate_checked;
            group.zw_checked = group.rate_checked;
        };
        $scope.checkClick = function (group) {
            group.rate_checked = group.gx_checked || group.bd_checked || group.zw_checked;
        };

        $scope.bondSelectFun = function(selected) {
            if (selected) {
                var bol = true;
                $.each($scope.rateBondSelectList, function (index, value){
                    if (value.bond_id == selected.originalObject.bond_id){
                        messageBox.warn("该债券已选")
                        return bol = false;
                    }
                })
                if (bol){
                    $scope.rateBondSelectList.push(selected.originalObject);
                }
            }
        };
        $scope.bondDelete = function (bond) {
            for (var i = 0; i< $scope.rateBondSelectList.length; i++){
                if($scope.rateBondSelectList[i].bond_id == bond.bond_id){
                    $scope.rateBondSelectList.splice(i,1);
                }
            }
        }
    })
    .controller('messageNewsCtrl', function($scope, messageBox){
        $scope.firstCheckClick = function (group) {
            group.fm_checked = group.news_checked;
            group.zm_checked = group.news_checked;
            group.qt_checked = group.news_checked;
        };
        $scope.checkClick = function (group) {
            group.checked = group.gx_checked || group.bd_checked || group.zw_checked;
        };
        $scope.bondSelectFun = function(selected) {
            if (selected) {
                var bol = true;
                $.each($scope.newsBondSelectList, function (index, value){
                    if (value.bond_id == selected.originalObject.bond_id){
                        messageBox.warn("该债券已选")
                        return bol = false;
                    }
                })
                if (bol){
                    $scope.newsBondSelectList.push(selected.originalObject);
                }
            }
        };
        $scope.bondDelete = function (bond) {
            for (var i = 0; i< $scope.newsBondSelectList.length; i++){
                if($scope.newsBondSelectList[i].bond_id == bond.bond_id){
                    $scope.newsBondSelectList.splice(i,1);
                }
            }
        }

    })
    .controller('messageCashFlowCtrl', function($scope, messageSet, user, messageBox) {
        $scope.valid_status = 1;
        $scope.msg_set_id = null;
        $scope.$on('init cash flow tab', function () {
            messageSet.get({
                manager_id: user.id,
                company_id: user.company_id,
                msg_type: 'cash_flow'
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    if (data && data[0]) {
                        var msg_set = data[0];
                        $scope.msg_set_id = msg_set.id;
                        $scope.valid_status = msg_set.condition.valid_status;
                    } else {
                        $scope.valid_status = 1;
                        $scope.msg_set_id = null;
                    }
                }
            });
        });

        $scope.$on('click cash flow tab save btn', function() {
            if ($scope.msg_set_id) {
                messageSet.update({
                    manager_id: user.id,
                    company_id: user.company_id,
                    msg_set_id: $scope.msg_set_id,
                    condition: {
                        valid_status: $scope.valid_status
                    }
                }, function success(data) {
                }, function failed() {
                    messageBox.error('设置现金流消息失败！')
                });
            } else {
                messageSet.add({
                    manager_id: user.id,
                    company_id: user.company_id,
                    msg_type: 'cash_flow',
                    condition: {
                        valid_status: $scope.valid_status
                    }
                }, function success(data) {
                }, function failed() {
                    messageBox.error('设置现金流消息失败！')
                });

                $("#remindSetDlg").modal('hide');
            }
        });
    });
