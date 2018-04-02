angular.module('ias.dataCenter')
    .factory('selectedTask', function () {
        return {
            bond: {
                bond_key_listed_market: null,
                similarKey: null,
                row: null
            },
            primary: {
                bond_key_listed_market: null,
                similarKey: null,
                row: null,
            },
            study: {
                row: null,
            },
            bondDeal: {
                row: null,
            },
            fundDeal: {
                row: null
            },
            fundOrder: {
                direction: null,
                row: null
            },
        }
    })
    .factory('managerTaskData', function () {
        return {
            primary: [],
            bond: [],
            study: [],
            money: [],
            bondDeal: [],
            fundDeal: []
        }
    })
    .factory('systemAdminData', function (accounts, accountAuthorityRequest, user) {
        return {
            users: [],
            accountList: [],
            accountAuthorityMap: null,
            userAccountAuthorityMap: null,
            managerList: [],
            managerIdMap: {},
            accountIdMap: {},
            bondList:[],
            investBondList:[],
            libList:[],
            cashPositionLog: [],
            createUserAuthority: function() {
                var self = this;
                if (self.accountAuthorityMap == null) return;

                self.userAccountAuthorityMap = {};
                const keys = Object.keys(self.accountAuthorityMap);
                keys.forEach(key => {
                    let authorities = self.accountAuthorityMap[key];

                    // TODO: NEED REFACTOR
                    $.each(authorities, function (index, authority) {
                        if (authority.hasOwnProperty('user_id') && !self.userAccountAuthorityMap.hasOwnProperty(authority.user_id)) {
                            self.userAccountAuthorityMap[authority.user_id] = [];
                        }

                        if (authority.hasOwnProperty('user_id')) {
                            self.userAccountAuthorityMap[authority.user_id].push(authority);
                        }
                    });
                })
            },
            getAuthorityMap: function() {
                var self = this;
                return new Promise((resolve, reject) => {
                    accountAuthorityRequest.get({
                        company_id: user.company_id
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            self.accountAuthorityMap = response.data;
                            self.createUserAuthority();
                            resolve();
                        } else {
                            reject('账户权限获取失败！');
                        }
                    }, function failed() {
                        messageBox.error('账户权限获取失败！');
                        reject('账户权限获取失败！');
                    })
                });
            },
            load: function() {
                var self = this;
                self.accountList.length = 0;
                self.accountAuthorityMap = null;

                return new Promise((resolve, reject) => {
                    accounts.get({
                        company_id: user.company_id
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            self.accountList.length = 0;
                            $.each(data, function (index, value) {
                                self.accountList.push(value);
                            });

                            $.each(self.accountList, function (index, account) {
                                if (account.hasOwnProperty('id')) {
                                    self.accountIdMap[account.id] = account;
                                }
                            });

                            resolve();
                        } else {
                            reject('账户获取失败！');
                        }
                    }, function failed(err) {
                        messageBox.error('账户获取失败！');
                        reject(err);
                    });
                })
            }
        }
    })
    .factory('dataCenter', function () {
        return {
            market: {
                primary: [],
                bond: [],
                fund: [],
                deal: [],
                exchangeDeal: [],
                repo: [],
                bondPoolMap: {},
                marketBondMap: {},
                investableBonds: [],
                primaryDataMap: null,
                bondDetailMap: {},
                bondDetailList: [],
                stockFundDetailList: [],
                fundOtcDetailList: [],
                fundExchangeDetailList: [],
                fundsContactMap: null,
                dealMarketMap: null,
                exchangeDealMarketMap: null,
                currentDealMap: null,
                investableBondMap: null,
                interestRateBondTypes: ['LGBLLB', 'LGBTLB', 'FINPSB', 'FINPBB', 'GOVBGB', 'GOVSGB', 'GOVEGB', 'CBBSCB'],
            },
            map: {},
            authority: {
                broker: [],
                primary: null,
                cdc: null,
                hasExchange: false
            },
            account: {
                accountsData: [],
                accountGroupsData: [],
                positionBondMap: {},
                accountPositionMap: {},
                accountAuthorityMap: {}
            },
            user: {
                users: [],
                userRoleMap: null,
                traderList: [],
                userMap: null
            },
            pledgeBondList: []
        }
    })
    .factory('accountCommon', function(){
        return {
            isEmpty: function(comment){
                if(comment == null || comment == ''){
                    return true;
                }
                var str = comment.replace(/^\s+|\s+$/g,"");
                if(str == ''){
                    return true;
                }else{
                    return false;
                }
            },
            getConstantIndex: function(list, type){
                var index=0;
                $.each(list, function(i, value){
                    if(type == value){
                        index = Math.pow(2,i);
                        return false;
                    }
                });
                return index;
            }
        }
    })
    .factory('tabConst', function() {
        return {
            // 一级tab
            position: 1,
            account_asset: 2,
            position_sheet: 3,
            trades: 4,
            cash_table: 5,
            performance_attribution: 6,
            combined_indicator: 7,
            sensitivity: 8,
            // 组合一级tab
            portfolio_position: 1,
            portfolio_account_asset: 2,
            portfolio_trades: 3,
            portfolio_cash_table: 4,
            portfolio_performance_attribution: 5,
            portfolio_combined_indicator: 6,
            portfolio_sensitivity: 7,
            // 账户资产二级tab
            table: 1,
            chart: 2,
            list: 3,
        }
    })
    .factory('winStatus', function(tabConst){
        var winStatus = {
            refAccount: {
                /*@author: wangyefan 目前判断条件和估值表日期控件是一样的，以后就不一定一样了*/
                model: 'false',
                isShow: function(){
                    var option1 = ['position', 'allocation'].indexOf(winStatus.cur_main_tab) > -1;
                    var option2 = winStatus.is_account_now;
                    var option3 = winStatus.cur_account.source_type_position === 'position';
                    return option1 && option2 && option3;
                },
                get: function (){
                    var bol = this.isShow() && (this.model === 'true');
                    return bol ? bol : undefined;
                }
            },
            cur_main_tab: "position",
            cur_position_tab: 0,
            cur_trades_tab: 0,
            portfolio_cur_main_tab: tabConst.portfolio_position,
            cur_asset_tab: tabConst.table,
            cur_performance_tab: tabConst.table,
            cur_account: {},    //当前账户基本信息
            cur_account_id: null,   // 当前账户ID
            cur_account_list: [],   // 当前组合的账户列表
            account_filter_list: [], //账户筛选列表
            current_name: '账户组合选择',
            is_account_now: true,  //当前是否在单账户界面
            is_summary_load:true, //是否加载组合界面summary的数据
            cur_account_authority: null,  // '1'-->只读, '2'--> 编辑
            cur_account_trade_option: null,  //'0' --> 禁止， '1' --> 查看
            cur_agent_company_id: null,
            cur_valuation_method: 'default', // 当前选中的账户估值法
            export_account_id:null, //选中要导出的账户
            export_account_group_id:null, //选中要导出的组合id
            cur_portfolio_id: null ,//当前组合id
            export_cur_account_list:[], //选中要导出的组合的账户列表
            protocol_repo_continue_flag: false,       // false: 编辑  true: 续做
            is_show_warn_panel: false , //到期面板是否显示控制变量
            show_include_ref_account: false, //是否显示子账户radio控制变量
            include_ref_account: 'false', //是否包含子账户控制变量
            isHideAccountSumPanel: true, //是否显示全部组合信息控制变量
            isContinue: false // 是否继续创建帐户
        };
        return winStatus;
    })
    .factory('hcMarketData', function() {
        return {
            assetMarketData: {},
            showBtnList: true,
            account: {},
            accountEditAble: false,
            bond: [],
            importDlgEvent: null
        }
    })
    .factory('filterParam', function() {
        return {
            account_id: '',
            first_filter: undefined,  // 不选中时值为undefined
            second_filter: undefined,
            typeOption1: undefined,
            typeOption2: undefined,
            account_type:null
        }
    })
    .factory('bondDealMarket', function() {
        return {
            type: 'interBank',
        };
    })
    .factory('marketSocketSwitch', function() {
        return {
            on: true,
        };
    })
    .factory('accountFactory', function(dataCenter, accountGroups, user) {
        return {
            groupSet: [],
            accountSet: [],
            groupOptions: [],
        };
    })
    .factory('distinguishGroupName', function() {
        return {
            isNotDefined: false,
            isGroupPositionSheet: false,
        };
    })
    .factory('dealPage', function(){
        return {
            cash: 0,
            deposit: 1,
            bank_lending: 2,
            finance: 3,
            bank_repo: 4,
            buyout_repo: 5,
            exchange_repo: 6,
            protocol_repo: 7,
            exchange_pledge: 8,
            stock_fund: 9,
            purchase_redemption: 10,
            dividend: 11,
            exess_reserve: 12,
            primary_deal:13,
            custody_transfer: 14,
            nonstd:15,
            fee: 16,
            fund_otc: 17,
            treasury_futures: 18,
            treasury_futures_margin: 19,
            isShowApply: true,
            isTrading: false,
            confirm_continue: false
        }
    })