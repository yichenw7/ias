angular.module('ias.account').factory('settingValuation',function () {
    return {
        bankValuationMethod:[ "cdc","csi","cost","valuation"],
        exchangeValuationMethod:["cdc","csi","cost","market","valuation"]
    }
});
angular.module('ias.account').controller('createAccountCtrl', function ($scope, accounts, hcMarketData, datetimePickerConfig, user, $timeout, $filter,
                                                         dataCenter, account,settingValuation,winStatus) {
    $scope.STATUS = {
        is_show_data_source: true,
        is_disable : true,
    };
    $scope.hcMarketData = hcMarketData;
    $scope.order = {
        tradeType: 0,
        sellType: 0
    };
    $scope.regexp = new RegExp('[^(:*?\\/<>|")]*');
    $scope.validateFun = function () {
        $scope.account.name = $scope.regexp.exec($scope.account.name) ? $scope.regexp.exec($scope.account.name)[0] : '';
    };
    $scope.accountsDataGroup = dataCenter.account.accountsData.filter(function (account) {
        return !(account.valuation_dates && account.valuation_dates.length > 0);
    });
    $scope.accountTypes = [
        { type: '债券类', value: '1' },
        { type: '自营类', value: '2' },
        { type: '券商类', value: '3' },
        { type: '货币类', value: '4' },
        //{type: '理财类', value: '5'},
        { type: '农商行类', value: '6' }
    ];
    $scope.subjectSuitTypes = [
        { type: '估值表账套一', value: 'IAS-0' },
        { type: '估值表账套二', value: 'IAS-1' },
        { type: '估值表账套三', value: 'IAS-2' },
    ];
    $scope.salesChannels = [
        { label: '个人理财产品', value: 'PO' },
        { label: '私人银行专属理财产品', value: 'PB' },
        { label: '机构专属理财产品', value: 'IO' },
        { label: '银行同业专属理财产品', value: 'IB' }
    ];
    $scope.operationTypes = [
        { label: '封闭式净值型', value: 'CC' },
        { label: '封闭式非净值型', value: 'CN' },
        { label: '开放式净值型', value: 'OC' },
        { label: '开放式非净值型', value: 'ON' }
    ];
    $scope.optionValuationGroup = [
        { label: '中债推荐久期', value: 'recommend' },
        { label: '行权久期', value: 'option' },
        { label: '到期久期', value: 'maturity' }
    ];
    $scope.pnlTypes = [
        { label: '保证收益类产品', value: 'YG' },
        { label: '保本浮动收益类产品', value: 'PG' },
        { label: '非保本浮动收益类产品', value: 'NG' }
    ];
    $scope.timeToAccountGroup = [
        { label: 'T+0', value: 0 },
        { label: 'T+1', value: 1 },
        { label: 'T+2', value: 2 }
    ];
    $scope.sellGroup = [
        { label: '平均成本', value: 'average_cost' },
        { label: '逐笔卖出', value: 'specify' }
    ];
    $scope.autoReserveTypes = [
        { label: '是', value: 1 },
        { label: '否', value: 0 },
    ];
    $scope.netValueGroup = [
        { label: '是', value: 1 },
        // { label: '否', value: 0 },
    ];
    $scope.yieldCalculations = [
        { type: '份额法', value: 'share' },
        { type: '金额法', value: 'amount' }
    ];
    $scope.source_type_positions = [
        { label: '交易流水', value: 'trade' },
        { label: '估值表', value: 'position' }
    ];
    $scope.source_type_trades = [
        { label: '交易流水', value: 'trade' },
        { label: '估值表推算', value: 'position' }
    ];
    $scope.source_type_cashflows = [
        { label: '交易流水', value: 'trade' },
        { label: '估值表推算', value: 'position' },
        { label: '估值表推算+交易流水', value: 'mixed' }
    ];
    $scope.source_type_performances = [
        { label: '交易流水', value: 'trade' },
        { label: '估值表推算', value: 'position' }
    ];

    function Account(options) {
        this.name = '';
        this.cash = 10000;
        this.createDate = '';
        this.exitDate = '';
        this.enableExitDate = false;
        this.manager = user.id;

        this.sourcesOfFunds = [{ from: '', amount: '' }];

        this.auto_reserve = 0;                                       // 自动计算备付金
        this.has_net_value = 1;                                      // 是否有净值
        this.yield_calculation = $scope.yieldCalculations[0].value;  // 收益计算方式
        this.subject_suit_id = $scope.subjectSuitTypes[0].value;     // 估值表账套

        this.type = $scope.accountTypes[0].value;                    // 账户类型
        this.sellRule = $scope.sellGroup[0].value;                   // 卖出规则
        this.redemption = $scope.timeToAccountGroup[0].value;        // 申购资金到账时间
        this.purchase = $scope.timeToAccountGroup[0].value;          // 赎回资金到账时间

        this.targetCost = null;   // 目标收益(%)
        this.baseFee = null;      // 基础费(万)
        this.managementFee = null;// 管理费(%)
        this.trusteeFee = null;   // 托管费(%)
        this.channelFee = null;   // 渠道费(%)

        //四个数据源选项
        this.source_type_position = $scope.source_type_positions[0].value;
        this.source_type_trade = $scope.source_type_trades[0].value;
        this.source_type_cashflow = $scope.source_type_cashflows[0].value;
        this.source_type_performance = $scope.source_type_performances[0].value;

        this.salesChannel = $scope.salesChannels[0].value;
        this.pnlType = $scope.pnlTypes[0].value;
        this.operationType = $scope.operationTypes[0].value;
        this.assetAccountId = (dataCenter.account.accountsData && dataCenter.account.accountsData.length > 0) ? dataCenter.account.accountsData[0].id : '';
        this.optionValuation = $scope.optionValuationGroup[0].value;

        this.isEdit = false;
        this.title = '新建账户';
        this.isError = false;
        this.errorMsg = '';
        this.errorLeft = '160px';
    }
    Account.prototype = {
        getQueryString: function () {
            var query = {
                account_type: this.type,
                base_fee: this.baseFee,
                cash: this.cash,
                channel_fee: this.channelFee,
                create_date: this.createDate,
                exit_date: this.exitDate,
                management_fee: this.managementFee,
                manager: this.manager,
                name: this.name,
                purchase: this.purchase,
                redemption: this.purchase,
                sell_rule: this.sellRule,
                target_cost: this.targetCost,
                trustee_fee: this.trusteeFee,
                valuation_method_priority:settingValuation.bankValuationMethod,
                valuation_method_priority_exchange:settingValuation.exchangeValuationMethod,
                option_valuation: this.optionValuation,
                has_net_value: this.has_net_value,
                yield_calculation: this.yield_calculation,
                auto_reserve: this.auto_reserve,
                subject_suit_id: this.subject_suit_id,
                source_type_position: this.source_type_position,
                source_type_trade: this.source_type_trade,
                source_type_cashflow: this.source_type_cashflow,
                source_type_performance: this.source_type_performance
            };
            if (this.type === '5') {
                query.asset_account_id = this.assetAccountId;
                query.sales_channel = this.salesChannel;
                query.pnl_type = this.pnlType;
                query.operation_type = this.operationType;
            }
            return query;
        },
        generateNewAccount: function () {
            var query = this.getQueryString();

            accounts.add({
                company_id: user.company_id,
                account_list: [query]
            });
        },
        handleNetValueChanged: function() {
            $scope.yieldCalculations = (this.has_net_value === 1) ? [
                { type: '份额法', value: 'share' },
                { type: '金额法', value: 'amount' }
            ] : [
                { type: '七日年化收益', value: 'annualized_yield_7_day' },
            ];
            this.yield_calculation = $scope.yieldCalculations[0].value;
        },
        changeExitDate: function () {
            if (this.enableExitDate) {
                // 去一年之后的日期作为退出日期
                this.exitDate = $filter('date')(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd');
            } else {
                this.exitDate = '';
            }
        },
        deleteFundSource: function (index) {
            this.sourcesOfFunds.splice(index, 1);
        },
        addFundSource: function () {
            this.sourcesOfFunds.push({ from: '', amount: '' });
        },
        validateAccount: function () {
            var self = this;
            function showErr(msg, offset) {
                self.isError = true;
                self.errorMsg = msg;
                self.errorLeft = offset ? '489px' : '160px';
                $timeout(function () {
                    self.isError = false;
                }, 3000);
            }

            if (self.name === '' || self.name === null) {
                showErr('请填写账户名称');
                return false;
            }

            if (self.createDate === '' || self.createDate === undefined) {
                showErr('请填写发生日期', true);
                return false;
            }

            var isValidated = true;
            dataCenter.account.accountsData.forEach(function (account) {
                if (account.manager !== user.id) return;
                if ($scope.account.isEdit && account.name === self.name && self.name !== hcMarketData.account.name
                    || !$scope.account.isEdit && account.name === self.name) {
                    isValidated = false;
                }
            });
            !isValidated && showErr('该名称已被注册');
            return isValidated;
        }
    };
    $scope.checkeExitDate = function (account) {
        account.changeExitDate();
    };

    function focusOnAccountName() {
        $('#createAccountDlg input:eq(0)').focus();
    }
    var createAccountDlg = $('#createAccountDlg');
    createAccountDlg.on('shown.bs.modal', function () {
        focusOnAccountName();
    });

    $scope.toggle = function(){
        $scope.STATUS.is_show_data_source = !$scope.STATUS.is_show_data_source;
    };
    $scope.changeSourceTypePosition = function () {
        var bol = $scope.account.source_type_position == 'trade';
        $scope.STATUS.is_disable = bol;
        if (bol) {
            $scope.account.source_type_trade = $scope.source_type_trades[0].value;
            $scope.account.source_type_cashflow = $scope.source_type_cashflows[0].value;
            $scope.account.source_type_performance = $scope.source_type_performances[0].value;

        }
        if ($scope.account.source_type_position == 'position') {
            settingValuation.bankValuationMethod = ["cdc", "valuation"];
            settingValuation.exchangeValuationMethod = ["cdc", "valuation"];

        } else if ($scope.account.source_type_position == 'trade') {
            settingValuation.exchangeValuationMethod = ["cdc", "cost"];
            settingValuation.bankValuationMethod = ["cdc", "cost"];
        }
    };

    $scope.clickSaveBtn = function (flag) {
        if ($scope.account.isEdit && $scope.account.validateAccount()) {
            account.update({
                company_id: user.company_id,
                account_id: $scope.account.id,
                account: $scope.account.getQueryString()
            });
            if (flag === 'continue') {
                $scope.account = new Account();
                winStatus.isContinue = true;
            } else if (flag === 'confirm') {
                createAccountDlg.modal('hide');
                winStatus.isContinue = false;
            }
            return;
        } else if ($scope.account.validateAccount()) {
            $scope.account.generateNewAccount();
            if (flag === 'continue') {
                $scope.account = new Account();
                winStatus.isContinue = true;
            } else if (flag === 'confirm') {
                createAccountDlg.modal('hide');
                winStatus.isContinue = false;
            }
        }
    };

    $scope.closeBeforeFunc = function () {
        createAccountDlg.modal('hide');
    };

    $scope.valuationMethodSetting =function () {
        $('#valuationMethodSetting').modal('show')
    }

    $scope.startTimePickerConfig = datetimePickerConfig;
    $scope.endTimePickerConfig = datetimePickerConfig;

    $scope.$on("add account event", function () {
        $scope.account = new Account();
        settingValuation.exchangeValuationMethod=["cdc","cost"];//初始化交易所估值法设置参数
        settingValuation.bankValuationMethod=["cdc","cost"];//初始化银行间估值法
        focusOnAccountName();
        $scope.STATUS.is_disable = true;
    });

    $scope.$on("show accountDlg", function () {
        $scope.account = new Account();
        $scope.account.isEdit = true;
        $scope.account.title = "编辑账户";
        $scope.account.name = hcMarketData.account.name;
        $scope.account.createDate = hcMarketData.account.create_date;
        $scope.account.exitDate = hcMarketData.account.exit_date;
        $scope.account.enableExitDate = ($scope.account.exitDate != "");
        $scope.account.cash = hcMarketData.account.cash / 10000;
        $scope.account.purchase = hcMarketData.account.purchase;
        $scope.account.sellRule = hcMarketData.account.sell_rule;
        settingValuation.bankValuationMethod = hcMarketData.account.valuation_method_priority;
        settingValuation.exchangeValuationMethod  = hcMarketData.account.valuation_method_priority_exchange;
        $scope.account.baseFee = hcMarketData.account.base_fee;
        $scope.account.managementFee = hcMarketData.account.management_fee;
        $scope.account.trusteeFee = hcMarketData.account.trustee_fee;
        $scope.account.channelFee = hcMarketData.account.channel_fee;
        $scope.account.targetCost = hcMarketData.account.target_cost;
        $scope.account.optionValuation = hcMarketData.account.option_valuation;
        $scope.account.id = hcMarketData.account.id;
        $scope.account.has_net_value = hcMarketData.account.has_net_value;
        $scope.account.yield_calculation = hcMarketData.account.yield_calculation;
        $scope.account.auto_reserve = hcMarketData.account.auto_reserve;
        $scope.account.subject_suit_id = hcMarketData.account.subject_suit_id;
        $scope.account.source_type_position = hcMarketData.account.source_type_position;
        $scope.account.source_type_trade = hcMarketData.account.source_type_trade;
        $scope.account.source_type_cashflow = hcMarketData.account.source_type_cashflow;
        $scope.account.source_type_performance = hcMarketData.account.source_type_performance;

        $scope.account.type = hcMarketData.account.account_type;
        $scope.account.assetAccountId = hcMarketData.account.asset_account_id;
        $scope.account.operationType = hcMarketData.account.operation_type;
        $scope.account.salesChannel = hcMarketData.account.sales_channel;
        $scope.account.pnlType = hcMarketData.account.pnl_type;

        $scope.STATUS.is_disable = $scope.account.source_type_position == 'trade';
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
angular.module('ias.account').controller('portfolioPanelCtrl', function ($scope) {
    $scope.orderByStrs = ['name', 'name', 'name', 'name', 'name', 'name'];

    $scope.show = function (target) {
        jQuery('#' + target + '>div:eq(1)').show();
    };

    $scope.hide = function (target) {
        jQuery('#' + target + '>div:eq(1)').hide();
    };

    $scope.changeOrder = function ($event, str, index, elem) {
        angular.element($event.currentTarget).siblings().find('i').hide();
        angular.element($event.currentTarget).find('i').show()
            .toggleClass("ui-grid-icon-down-dir")
            .toggleClass("ui-grid-icon-up-dir");
        if (angular.element($event.currentTarget).find('i').hasClass('ui-grid-icon-down-dir')) {
            if ($scope.orderByStrs[index] instanceof Array) {
                $scope.orderByStrs[index][1] = str;
            }
            else {
                $scope.orderByStrs[index] = str;
            }
        }
        else {
            if ($scope.orderByStrs[index] instanceof Array) {
                $scope.orderByStrs[index][1] = '-' + str;
            }
            else {
                $scope.orderByStrs[index] = '-' + str;
            }
        }
        if (elem) {
            $scope.hide(elem);
        }
    };

    //模态框弹出、隐藏样式设置
    $('#loadEle').on('show.bs.modal', function () {
        $('#accountSetStyle').text(" .modal-backdrop {opacity:0!important} .modal.fade .modal-dialog{transform:translate(0,0)}");
    });
    $('#loadEle').on('hide.bs.modal', function () {
        $('.modal-backdrop').hide();
        $('#accountSetStyle').text("");
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
angular.module('ias.account').controller('portfolioSelectPanelCtrl', function ($scope, accountGroups, accountGroup, account, accounts, accountFactory,
    hcMarketData, user, winStatus, accountService, distinguishGroupName, authorityConstant,
    authorityControl, messageBox, accountPanelState, dataCenter, latestVisitableAccount) {


    $scope.tabGroup = [
        { label: '资产账户', value: 1 },
        { label: '组合', value: 0 },
    ];
    $scope.userMap = dataCenter.user.userMap
    $scope.accountPanelState = accountPanelState;
    $scope.tabIndex = 1;
    $scope.onSelect = [];
    $scope.newPortfolioObj = {};
    $scope.selectedAccounts = [];
    $scope.filterTexts = ['', '', '', ''];//搜索文本
    $scope.$on("portfolioPanel update", function () {
        $scope.onSelect.length = 0;
        $scope.hide('groupDlg1');
    });

    $scope.filterFun = function (text, index) {
        return text.indexOf($scope.filterTexts[index]) > -1;
    }

    $scope.accountFilter = function (item) {
        return $scope.selectedAccounts.indexOf(item.id) > -1;
    }

    //点击某条组合
    $scope.clickRow = function (target, index, bond) {
        accountPanelState.vars[1].confirm_po = true;
        accountFactory.groupOptions.length = 0;
        accountFactory.groupOptions.name = bond.name;
        accountFactory.groupOptions.id = bond.id;
        jQuery.each(bond.accounts, function (i, v) {
            accountFactory.groupOptions.push(v);
        })
        $scope.onSelect.length = 0;
        $scope.onSelect[index] = 'index';
        $scope.selectedAccounts = [];
        jQuery.each(bond.accounts, function (i, v) {
            $scope.selectedAccounts.push(v);
        });
        $scope.show(target);
    }

    //根据账户新建组合
    $scope.newGroup = function () {
        var bol = true;
        jQuery.each(accountFactory.groupSet, function (i, v) {
            if (v.name == $scope.newPortfolioObj.name) {
                messageBox.warn('已有该名称的组合了！');
                return bol = false;
            }
        });
        if (!bol) return;
        var accounts = [];
        var accountIds = [];
        jQuery.each(accountFactory.accountSet, function (i, v) {
            if ($scope.tabIndex == 1 && v.account_type != '5' && v.checked) {
                accounts.push({ account_id: v.id, company_id: v.agent_company_id });
                accountIds.push(v.id);
            }
        });
        if (!$scope.newPortfolioObj.name) {
            messageBox.warn('请输入组合名称');
            return;
        }
        accountGroups.add({
            account_group: {
                name: $scope.newPortfolioObj.name,
                accounts: accounts,
                manager: user.id
            },
            company_id: user.company_id
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.newPortfolioObj.name = "";
            }
        });
    }

    //点击全选
    $scope.allSelect = function (index, isAll) {
        accountPanelState.vars[1].accountStr = ''
        jQuery.each(accountFactory.accountSet, function (i, v) {
            if (index == 1 && v.account_type != '5') {
                v.checked = isAll;
                if (isAll) {
                    accountPanelState.vars[1].accountStr += (v.name + ' ; ');
                }
            }
        });
        accountPanelState.vars[index].confirm_ac = isAll;
        if (index == 1) {
            accountPanelState.vars[1].count = isAll ? accountFactory.accountSet.length : 0;
        }
    }



    $scope.is_confirm = false;

    //点击一行选中checkbook
    $scope.selectTr = function (index, obj) {
        if (obj) {
            obj.checked = !obj.checked;
        }
        var isAll = true;
        var confirm_ac = false;
        accountPanelState.vars[1].count = 0;
        accountPanelState.vars[1].accountStr = '';
        jQuery.each(accountFactory.accountSet, function (i, v) {
            if (index == 1 && v.account_type != '5') {
                if (v.checked) {
                    confirm_ac = true;
                    accountPanelState.vars[1].count++;
                    accountPanelState.vars[1].accountStr += (v.name + ' ; ');
                    $scope.is_confirm = true;
                }
                if (!v.checked) isAll = false;
            }
        })
        accountPanelState.vars[index].isAll = isAll;
        accountPanelState.vars[index].confirm_ac = confirm_ac;
    };

    $scope.accountSelect = function () {
        var account_list = [];
        var name = '';
        accountFactory.accountSet.forEach(function (v, i) {
            if ($scope.tabIndex == 1 && v.account_type != '5' && v.checked) {
                account_list.push(v.id);
                name = v.name;
            }
        });
        //根据首字母排序
        account_list.sort(
            function compareFunction(param1, param2) {
                return accountService.getAccountNameById(param1).localeCompare(accountService.getAccountNameById(param2));
            }
        );
        winStatus.cur_account_list = account_list;
        if (account_list.length == 1) {
            distinguishGroupName.isNotDefined = false;
            distinguishGroupName.isGroupPositionSheet = false;
            winStatus.cur_account = accountService.getAccountById(account_list[0]);
            winStatus.cur_account_id = account_list[0];
            winStatus.current_name = name;
            winStatus.account_filter_list.length = 0;
            var tempObj = {};
            tempObj.account_id = account_list[0];
            tempObj.account_name = name;
            winStatus.account_filter_list.push(tempObj);
            winStatus.is_account_now = true;
            winStatus.is_show_warn_panel = true; //显示到期面板
            var result = authorityControl.getAuthorityAndAgentCompany(account_list[0]);
            winStatus.cur_account_authority = result.option;
            winStatus.cur_account_trade_option = result.trade_option;
            winStatus.cur_agent_company_id = result.agent_company_id;
        } else if (account_list.length > 1) {
            winStatus.current_name = '未定义组合';
            winStatus.is_account_now = false;
            winStatus.account_filter_list.length = 0;
            winStatus.cur_account_authority = authorityConstant.ACCOUNT_WRITE;
            winStatus.cur_account_trade_option = authorityControl.getAccountGroupAuthority(account_list).trade_option;

            distinguishGroupName.isNotDefined = true;
            distinguishGroupName.isGroupPositionSheet = true;
            jQuery.each(account_list, function (i, v) {
                var tempObj = {};
                tempObj.account_id = v;
                tempObj.account_name = accountService.getAccountNameById(v);
                winStatus.account_filter_list.push(tempObj);
            });
        }
        $scope.$emit("account updated");
        $("#accountGroup").modal('hide');
    };
    //根据组合筛选
    $scope.groupSelect = function () {
        distinguishGroupName.isNotDefined = false;
        $("#accountGroup").modal('hide');
        winStatus.current_name = accountFactory.groupOptions.name;
        winStatus.is_account_now = false;
        winStatus.cur_account_authority = authorityConstant.ACCOUNT_WRITE;
        winStatus.cur_account_trade_option = authorityControl.getAccountGroupAuthority(accountFactory.groupOptions).trade_option;

        distinguishGroupName.isGroupPositionSheet = true;
        accountFactory.groupOptions.sort(
            function compareFunction(param1, param2) {
                return accountService.getAccountNameById(param1).localeCompare(accountService.getAccountNameById(param2));
            }
        );
        winStatus.cur_account_list = accountFactory.groupOptions;
        winStatus.account_filter_list.length = 0;
        jQuery.each(accountFactory.groupOptions, function (i, v) {
            var tempObj = {};
            tempObj.account_id = v;
            tempObj.account_name = accountService.getAccountNameById(v);
            winStatus.account_filter_list.push(tempObj);
        });
        // $scope.$emit("portfolio updated");
        $scope.$emit("account updated");
    }

    $scope.$on('$destroy', function () {
        $scope = null;
    });

    // 设置默认账户组合
    // 选出用户上一次选择的账户组合
    let accountId;

    let getLatestVisitableAccount = () => {
        return new Promise((resolve, reject) => {
            latestVisitableAccount.get({
                manager_id: user.id,
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                   if (response.data.account_id) {
                       accountId = response.data.account_id;
                   }
                    resolve();
                } else {
                    reject('默认账户获取失败！');
                }
            }, function failed() {
                reject('默认账户获取失败！');
            });
        }).catch(err => console.warn(err))
    }

    getLatestVisitableAccount().then((param) => {
        jQuery.each(accountFactory.accountSet, function (i, v) {
            if (v.account_type != '5' && v.id === accountId) {
                $scope.selectTr(1, v);
            }
        });
        $scope.accountSelect();
    });

});
angular.module('ias.account').controller('portfolioEditPanelCtrl', function ($scope, accountGroups, accountGroup, account, accounts, accountFactory,
    hcMarketData, user, winStatus, accountService, distinguishGroupName, authorityControl, messageBox) {
    $scope.tabGroup = [
        { label: '资产账户', value: 1 },
        { label: '组合', value: 0 },
    ];
    $scope.tabIndex = 1;
    $scope.isEditNow = true;
    $scope.editState = false;
    $scope.onSelect = [];
    $scope.onEdit = [];
    $scope.theIndexGroup = {};
    $scope.selectedAccounts = [];
    $scope.filterTexts = ['', '', '', ''];//搜索文本
    $scope.$on("portfolioPanel update", function () {
        $scope.onSelect.length = 0;
        $scope.hide('groupDlg1');
    });
    //组合名称特殊字符过滤
    $scope.regexp = new RegExp('[^(:*?\\/<>|")]*');
    $scope.validateFun = function () {
        $scope.theIndexGroup.name = $scope.regexp.exec($scope.theIndexGroup.name) ? $scope.regexp.exec($scope.theIndexGroup.name)[0] : '';
    }

    $scope.hide = function (target) {
        $scope.onEdit.length = 0;
        jQuery('#' + target + '>div:eq(1)').hide();
    }

    $scope.filterFun = function (text, index) {
        return text.indexOf($scope.filterTexts[index]) > -1;
    }

    $scope.myFilter = function (item) {
        return ($scope.selectedAccounts.indexOf(item.id) > -1);
    }

    //过滤可编辑的账户
    $scope.accountSelfFilter = function (account) {
        return account.manager == user.id
    }

    //点击编辑
    $scope.editOnThis = function () {
        $scope.isEditNow = false;
        $scope.editState = false;
        $scope.myFilter = function (item) {
            return item.manager == user.id;
        };
    }

    //点击某条组合
    $scope.selectRow = function (target, index, bond) {
        $scope.onSelect.length = 0;
        $scope.onSelect[index] = 'index';
        $scope.selectedAccounts = [];
        jQuery.each(bond.accounts, function (i, v) {
            $scope.selectedAccounts.push(v);
        });
        $scope.show(target);
        $scope.theIndexGroup.id = bond.id;
        $scope.onEdit.length = 0;
        if ($scope.editState) {
            $scope.isEditNow = true;
            $scope.myFilter = function (item) {
                return (item.manager == user.id) && ($scope.selectedAccounts.indexOf(item.id) > -1);
            }
        }
        if ($scope.editState == false) $scope.onEdit[index] = 'back-purple';
        $scope.editState = true;
        jQuery.each(accountFactory.accountSet, function (i, v) {
            if ($scope.selectedAccounts.indexOf(v.id) > -1) {
                v.selected = true;
            }
            else v.selected = false;
        });

        $scope.theIndexGroup.name = bond.name;

    }

    //删除账户
    $scope.deleteAccount = function (bond) {
        if (bond.account_groups && bond.account_groups.length > 0) {
            var msg = '以下情况，暂时不能删除账户<' + bond.name + '>：\n1.某些组合包含该账户\n2.该账户存在于某些镜像组合\n(请联系 IAS 管理人员)'
            messageBox.warn(msg);
            return true;
        }

        function confirmFun() {
            account.delete({
                account_id: bond.id,
                company_id: user.company_id,
                account_type: bond.account_type,
                current_account_id: winStatus.cur_account_id
            });
        }

        messageBox.confirm('确定删除账户：' + bond.name + '？', null, confirmFun);
    }

    $scope.editAccount = function (bond) {
        hcMarketData.accountEditAble = true;
        hcMarketData.account = angular.copy(bond);
        hcMarketData.account.cash = bond.init_amount;
        hcMarketData.account.valuation_method_priority = bond.valuation_method_priority;
        hcMarketData.account.valuation_method_priority_exchange = bond.valuation_method_priority_exchange;
        $scope.$emit("edit account Event");
    }

    $scope.deleteGroup = function (bond) {
        function confirmFun() {
            accountGroup.delete({ account_group_id: bond.id, company_id: user.company_id }, function success() {
                $scope.hide('groupDlg2');
            });
        }
        messageBox.confirm('确定要删除该组合吗', null, confirmFun);
    }

    $scope.openRightPanel = function () {
        $scope.show('groupDlg2');
        jQuery.each(accountFactory.accountSet, function (i, v) {
            v.checked = false;
        });
        $scope.selectedAccounts = [];
        $scope.onSelect.length = 0;
        $scope.onEdit.length = 0;
        $scope.isEditNow = false;
        $scope.theIndexGroup.name = "";
        $scope.myFilter = function (item) {
            return item.manager == user.id;
        };
        jQuery.each(accountFactory.accountSet, function (i, v) {
            v.selected = false;
        });
    }

    $scope.confirm = function () {
        if (!$scope.theIndexGroup.name) {
            messageBox.warn('请输入组合名称');
            return;
        }
        $scope.theIndexGroup.accounts = [];
        jQuery.each(accountFactory.accountSet, function (i, v) {
            if (v.selected) $scope.theIndexGroup.accounts.push(v.id);
        });
        if ($scope.onEdit.length > 0) {
            accountGroup.update({
                account_group_id: $scope.theIndexGroup.id,
                account_group: {
                    name: $scope.theIndexGroup.name,
                    accounts: authorityControl.getAccountGroupMember($scope.theIndexGroup.accounts),
                },
                company_id: user.company_id
            });
        } else {
            var bol = true;
            jQuery.each(accountFactory.groupSet, function (i, v) {
                if (v.name == $scope.theIndexGroup.name) {
                    messageBox.warn('已有该名称的组合了！');
                    return bol = false;
                }
            });

            if (!bol) return;
            accountGroups.add({
                account_group: {
                    name: $scope.theIndexGroup.name,
                    accounts: authorityControl.getAccountGroupMember($scope.theIndexGroup.accounts),
                    manager: user.id,
                },
                company_id: user.company_id
            });
        }
        $scope.hide('groupDlg2');
    }

    $scope.dismiss = function () {
        jQuery.each(accountFactory.accountSet, function (i, v) {
            if ($scope.selectedAccounts.indexOf(v.id) > -1) {
                v.selected = true;
            }
            else {
                v.selected = false;
            }
        });
        $scope.hide('groupDlg2');
    }

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
angular.module('ias.account').controller('valuationMethodSettingCtrl',function ($scope,settingValuation) {
    $scope.bankSettingValuationMethod = {
        enableSorting: true,
        enableRowSelection: true,
        enableColumnMenus: false,
        multiSelect: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        rowHeight: 25,
        showHeader: false,
        columnDefs: [{field: 'title'}],
        onRegisterApi: function (gridApi) {
            $scope.bankSettingApi = gridApi;
        }
    };
    $scope.exchangeSettingValuationMethod = {
        enableSorting: true,
        enableRowSelection: true,
        enableColumnMenus: false,
        multiSelect: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        rowHeight: 25,
        showHeader: false,
        columnDefs: [{field: 'title'}],
        onRegisterApi: function (gridApi) {
            $scope.exchangeSettingApi = gridApi;
        }
    };
    $("#valuationMethodSetting").on("show.bs.modal",function () {
        //银行间逻辑begin
        $scope.bankSettingValuationMethod.data = [];
        $scope.bankValuationTypes = [{
            title:"中债估值",
            methodKey:"cdc",
            isSelected:false
        },{
            title:"中证估值",
            methodKey:"csi",
            isSelected:false
        },{
            title:"摊余成本法",
            methodKey:"cost",
            isSelected:false
        },{
            title:"估值表净价(仅估值表账户有效)",
            methodKey:"valuation",
            isSelected:false
        }, {
            title:"成本法",
            methodKey:"fcost",
            isSelected:false
        }];
        $.each(settingValuation.bankValuationMethod,function (index, value) {
            $.each($scope.bankValuationTypes,function (i, val) {
                if(value == val.methodKey){
                    val.isSelected=true
                }
            })
        });
        $scope.bankIsSelectAll = {isSelectAll:true};
        $scope.bankIsSelectAllFun = function () {
            $.each($scope.bankValuationTypes,function (index, value) {
                if(!value.isSelected){
                    $scope.bankIsSelectAll.isSelectAll =false;
                }
            })
        }
        $scope.bankIsSelectAllFun();
        $scope.bankSettingValuationMethod.data = [];
        $.each(settingValuation.bankValuationMethod,function (index, value) {
            $.each($scope.bankValuationTypes,function (i,val) {
                if(value === val.methodKey){
                    $scope.bankSettingValuationMethod.data.push(val);
                }
            })
        });
        $scope.bankValuationTypeChanged = function (bankValuationType) {
            var temp =null;
            if(bankValuationType.isSelected){
                $scope.bankSettingValuationMethod.data.push(bankValuationType)
            }else {
                $.each($scope.bankSettingValuationMethod.data,function (index, value) {
                    if(value.title===bankValuationType.title){
                        temp = value;
                    }
                });
                var index = $scope.bankSettingValuationMethod.data.indexOf(temp);
                $scope.bankSettingValuationMethod.data.splice(index,1)
            }
            if($scope.bankValuationTypes[0].isSelected && $scope.bankValuationTypes[1].isSelected && $scope.bankValuationTypes[2].isSelected && $scope.bankValuationTypes[3].isSelected){
                $scope.bankIsSelectAll.isSelectAll = true;
            }else {
                $scope.bankIsSelectAll.isSelectAll = false;
            }
        };
        $scope.bankIsSelectAllMethods = function (bankIsSelectAll) {
            if(bankIsSelectAll){
                $scope.bankSettingValuationMethod.data.length = 0;
                $.each($scope.bankValuationTypes,function (index, value){
                    value.isSelected = true;
                    $scope.bankSettingValuationMethod.data.push(value)
                })
            }else{
                $.each($scope.bankValuationTypes,function (index, value) {
                    value.isSelected = false;
                    $scope.bankSettingValuationMethod.data.length = 0;
                })
            }
        };
        $scope.bankMoveUp = function () {
            var selectedRow =  $scope.bankSettingApi.selection.getSelectedRows();
            var index = $scope.bankSettingValuationMethod.data.indexOf(selectedRow[0]);
            if (index > 0) {
                var before = $scope.bankSettingValuationMethod.data[index -1];
                $scope.bankSettingValuationMethod.data.splice(index -1, 1,selectedRow[0]);
                $scope.bankSettingValuationMethod.data.splice(index, 1, before);
            }
        };
        $scope.bankMoveDown = function () {
            var selectedRow =  $scope.bankSettingApi.selection.getSelectedRows();
            var length = $scope.bankSettingValuationMethod.data.length;
            var index = $scope.bankSettingValuationMethod.data.indexOf(selectedRow[0]);
            if (index >=0 && index < length-1) {
                var after = $scope.bankSettingValuationMethod.data[index + 1];
                $scope.bankSettingValuationMethod.data.splice(index + 1, 1, selectedRow[0]);
                $scope.bankSettingValuationMethod.data.splice(index, 1, after);
            };
        };
        // 银行间end
        //交易所逻辑begin

        $scope.exchangeValuationTypes = [{
            title:"中债估值",
            methodKey:"cdc",
            isSelected:false
        },{
            title:"中证估值",
            methodKey:"csi",
            isSelected:false
        },{
            title:"摊余成本法",
            methodKey:"cost",
            isSelected:false
        },{
            title:"市价估值",
            methodKey:"market",
            isSelected:false
        },{
            title:"估值表净价(仅估值表账户有效)",
            methodKey:"valuation",
            isSelected:false
        }, {
            title:"成本法",
            methodKey:"fcost",
            isSelected:false
        }];
        $.each(settingValuation.exchangeValuationMethod,function (index, value) {
            $.each($scope.exchangeValuationTypes,function (i, val) {
                if(value == val.methodKey){
                    val.isSelected=true
                }
            })
        });
        $scope.exchangeIsSelectAll = {isSelectAll:true};
        $scope.bankIsSelectAllFun = function () {
            $.each($scope.exchangeValuationTypes,function (index, value) {
                if(!value.isSelected){
                    $scope.exchangeIsSelectAll.isSelectAll = false;
                }
            })
        };
        $scope.bankIsSelectAllFun();
        $scope.exchangeSettingValuationMethod.data = [];
        $.each(settingValuation.exchangeValuationMethod,function (index, value) {
            $.each($scope.exchangeValuationTypes,function (i,val) {
                if(value === val.methodKey){
                    $scope.exchangeSettingValuationMethod.data.push(val);
                }
            })
        });
        $scope.exchangeValuationTypeChanged = function (exchangeValuationType) {
            var temp =null;
            if(exchangeValuationType.isSelected){
                $scope.exchangeSettingValuationMethod.data.push(exchangeValuationType)
            }else {

                $.each($scope.exchangeSettingValuationMethod.data,function (index, value) {
                    if(value.title===exchangeValuationType.title){
                        temp = value;
                    }
                });
                var index = $scope.exchangeSettingValuationMethod.data.indexOf(temp);
                $scope.exchangeSettingValuationMethod.data.splice(index,1)
            }
            if($scope.exchangeValuationTypes[0].isSelected && $scope.exchangeValuationTypes[1].isSelected && $scope.exchangeValuationTypes[2].isSelected && $scope.exchangeValuationTypes[3].isSelected&&$scope.exchangeValuationTypes[4].isSelected){
                $scope.exchangeIsSelectAll.isSelectAll = true;
            }else {
                $scope.exchangeIsSelectAll.isSelectAll = false;
            }
        };
        $scope.exchangeIsSelectAllMethods = function (exchangeIsSelectAll) {
            if(exchangeIsSelectAll){
                $scope.exchangeSettingValuationMethod.data.length =0;
                $.each($scope.exchangeValuationTypes,function (index, value){
                    value.isSelected = true;
                    $scope.exchangeSettingValuationMethod.data.push(value)
                })
            }else{
                $.each($scope.exchangeValuationTypes,function (index, value) {
                    value.isSelected = false;
                    $scope.exchangeSettingValuationMethod.data.length = 0;
                })
            }
        };
        $scope.exchangeMoveUp = function () {
            var selectedRow =  $scope.exchangeSettingApi.selection.getSelectedRows();
            var index = $scope.exchangeSettingValuationMethod.data.indexOf(selectedRow[0]);
            if (index > 0) {
                var before = $scope.exchangeSettingValuationMethod.data[index -1];
                $scope.exchangeSettingValuationMethod.data.splice(index -1, 1,selectedRow[0]);
                $scope.exchangeSettingValuationMethod.data.splice(index, 1, before);
            }
        };
        $scope.exchangeMoveDown = function () {
            var selectedRow =  $scope.exchangeSettingApi.selection.getSelectedRows();
            var length = $scope.exchangeSettingValuationMethod.data.length;
            var index = $scope.exchangeSettingValuationMethod.data.indexOf(selectedRow[0]);
            if (index >=0 && index < length-1) {
                var after = $scope.exchangeSettingValuationMethod.data[index + 1];
                $scope.exchangeSettingValuationMethod.data.splice(index + 1, 1, selectedRow[0]);
                $scope.exchangeSettingValuationMethod.data.splice(index, 1, after);
            };
        };
        //交易所逻辑end

    });

    $scope.closeBeforeFunc =function () {
        $("#valuationMethodSetting").modal("hide")
    }
    $scope.clickSaveBtn = function () {
        var bankValuationMethod = [];
        var exchangeValuationMethod = [];
        $.each($scope.exchangeSettingValuationMethod.data,function (index,value) {
            exchangeValuationMethod.push(value.methodKey)
        });
        $.each($scope.bankSettingValuationMethod.data,function (index,value) {
            bankValuationMethod.push(value.methodKey)
        });
        console.log(bankValuationMethod);
        console.log(exchangeValuationMethod);
        settingValuation.bankValuationMethod=bankValuationMethod;
        settingValuation.exchangeValuationMethod=exchangeValuationMethod;
        $("#valuationMethodSetting").modal("hide")
    }
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
