import angular from 'angular';

const IASAccountModule = angular.module('ias.account');
IASAccountModule.factory('accountPanelState', function (dataCenter) {
    return {
        vars: [
            //组合界面变量
            {
                confirm_po: false,
            },
            //资产账户界面变量
            {
                isAll: false,
                confirm_ac: false,
                count: 0,
                accountStr: '',

            },
            //理财账户界面变量
            {
                isAll: false,
                confirm_ac: false,
            }
        ]
    }
});
IASAccountModule.factory('LazyLoadUrl', function(){
    return {
        deal_input: '',
        inquiry_transaction: '',
        portfolio: '',
        exportExcel: '',
        importTemplate: '',
        accountGroupEdit: '',
        createAccount: '',
    }
});
IASAccountModule.factory('selectTypes', function() {
    return {
        inquiryTransaction: 0,
        dealInput: 0
    }
});

IASAccountModule.controller('accountAnalyticsCtrl', function ($location, $scope, filterParam, user, winStatus, messageBox, dateClass,
    accountFactory, accountService, dataCenter, hcMarketData, tabConst, socketServer, roleConstant,$rootScope,
    authorityConstant, authorityControl, $timeout, datetimePickerConfig, $filter, LazyLoadUrl, interactWithQB,
    accounts, uiGridExporterConstants, accountPanelState, accountCommon, accountTable, GridConfigService, selectTypes, dealPage,
    account,accountGroupSummary, accountConstant, pledgedBonds) {

    $scope.broadcast_message = '';
    $scope.GridConfigService = GridConfigService;
    $scope.LazyLoadUrl = LazyLoadUrl;
    $scope.accountFactory = accountFactory;
    $scope.filterParam = filterParam;
    $scope.winStatus = winStatus;
    $scope.bondList = dataCenter.market.bondDetailList;
    $scope.stockFundList = dataCenter.market.stockFundDetailList;
    $scope.fundOtcList = dataCenter.market.fundOtcDetailList;
    $scope.fundExchangeList = dataCenter.market.fundExchangeDetailList;
    $scope.isEmpty = accountCommon.isEmpty;
    $scope.ACCOUNT_WRITE = authorityConstant.ACCOUNT_WRITE;  // '2'--> 编辑
    $scope.ACCOUNT_TRADE_VIEW = authorityConstant.ACCOUNT_TRADE_VIEW;
    $scope.cur_account_authority = authorityControl.getDefaultAccountAuthority();
    $scope.cur_account_trade_option = $scope.ACCOUNT_TRADE_VIEW;
    $scope.oneLevelFilter = accountConstant;

    //账户当前选择的日期：default-->today
    $scope.accountSelectedDate = $filter('date')(new Date(), 'yyyy-MM-dd');

    $scope.change_include_ref_account = function () {
        $scope.$broadcast('refresh account');
    };

    $scope.showAccountAllSum = function () {
        winStatus.isHideAccountSumPanel = !winStatus.isHideAccountSumPanel;
    };

    $scope.getCompanyId = function (accountId) {
        return authorityControl.getAuthorityAndAgentCompany(accountId).agent_company_id || user.company_id;
    };

    function showDlg(id, time) {
        if (time) {
            var promise = $timeout(function () {
                $(id).modal('show');
                $timeout.cancel(promise)
            }, time);
        }
        $(id).modal('show');
    }

    $scope.show_version_info = function () {
        var title = '新版本';
        var content = `
            更新日期： 2018-02-05

            1. 交易录入，支持国债期货产品录入，保证金录入，实现业绩损益及现金流计算
            2. 交易录入，支持含权债的成本收益率计算方式的选择（行权/到期收益率）
            3. 交易录入，支持标注持仓债券的未来操作方向并展示于持仓中
            4. 债券持仓界面，新增票息调整权及票息变动
            5. 流动性管理及回购录入界面增加自动排券功能
            6. 业绩归因、指标组合，债券计息日逻辑优化
            7. 情景分析，新增支持按主体评级、剩余期限分组展示
            8. 敏感度分析，支持关键期限点久期展示，计算取值和逻辑优化完善
            9. VaR分析，支持股票基金赋权信息计算
            10. 估值表导入，优化对各类估值科目的支持
            11. IAS账户-周报报表，指标计算方式优化
            12. IAS-仪表盘，新增卡片展示方式
            13. IAS账户，支持新用户查看示例账户
            14. IAS介绍，申请试用界面增加试用意向调查表
            15. IAS计算性能调优
            16. 估值表生成现金流bug修正
        `

        messageBox.info(content, title);
    };

    $scope.onAccountGroupEdit = function () {
        if (LazyLoadUrl.accountGroupEdit === '') {
            LazyLoadUrl.accountGroupEdit = 'src/account/accountDlg/accountGroupEdit.html';
            showDlg('#accountGroupEdit', 150);
        } else {
            showDlg('#accountGroupEdit');
        }
    };

    $scope.onDealInputBtnClicked = function () {
        hcMarketData.showBtnList = true;
        selectTypes.dealInput = dealPage.cash;
        $scope.$emit("open DealInputDlg");
    };

    $scope.onExportExcelClicked = function () {
        if (LazyLoadUrl.exportExcel === '') {
            LazyLoadUrl.exportExcel = 'src/account/otherDlg/exportExcelDlg.html';
            showDlg('#exportExcelDlg', 150);
        } else {
            showDlg('#exportExcelDlg');
        }
    };

    $scope.onImportDlgClicked = function () {
        hcMarketData.importDlgEvent = new Date();
        if (LazyLoadUrl.importTemplate === '') {
            LazyLoadUrl.importTemplate = 'src/account/otherDlg/importTemplateDlg.html';
        }
        $('#hcImportDlg').modal('show');
    };

    $scope.onAddAccountClicked = function () {
        showDlg('#createAccountDlg');
        $scope.$broadcast("add account event");
    };

    $scope.showPledgeBonds = function (list) {
        $scope.isTrade = false;
        $scope.buy_tip = list;
        if (list.ytm != null) {
            $scope.buy_tip.yield = list.ytm;
        } else {
            $scope.buy_tip.yield = list.ytcp;
        }
    };

    $scope.showPledgeBondDetail = function (list) {
        $scope.pledgeBondDetails = list;
    };

    // 债券成交列表
    $scope.tradeGridOptions = {
        selectionRowHeaderWidth: 25,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        columnDefs: accountTable.bondTradeListColumnDef()
    };
    //显示成交列表
    $scope.showPositionTradeList = function (list) {
        $scope.isTrade = true;
        $scope.tradeGridOptions.data = list;
    };

    $scope.setRowStatus = function (bond) {
        if (bond.accounting_type === 'hold_for_trading' || bond.accounting_type === 'available_for_sale') {
            return { 'background-color': '#367337' };
        }
        var today = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
        if (today == bond.maturity_settlement_date) {
            return { 'background-color': '#B66B26' };
        } else if (today == bond.maturity_date) {
            return { 'background-color': '#367337' };
        }
    };

    $scope.sheetOnScroll = function (target1, target2) {
        $(target2).off('scroll').on('scroll', function (event) {
            $(target1)[0].scrollTop = $(target2)[0].scrollTop;
        });
    };

    $scope.onMousewheel = function (target1, target2) {
        $('#dataSection').on('mousewheel', target1, function (event) {
            event.preventDefault();
            var scrollTop = this.scrollTop;
            this.scrollTop = (scrollTop + ((event.deltaY * event.deltaFactor) * -1));
            $(target2)[0].scrollTop = (scrollTop + ((event.deltaY * event.deltaFactor) * -1));
        });
    };

    $scope.showPledgedBondsFilter = function () {
        pledgedBonds.fromFilter = false;
        $("#pledgedBondsFilterDlg").modal('show');
    };

    $scope.showDealDlg = function (data) {
        $("#dealInputWin").modal('show');
        $scope.$broadcast($scope.broadcast_message, data);
    };

    function openDealDlg(message, data) {
        $scope.broadcast_message = message;
        $scope.showDealDlg(data);
    };

    // 此估值表日期 $scope.valuationDates.selected 已被子模块共享
    $scope.hasValuationDate = false;
    $scope.valuationDates = {
        selected: undefined,
        options: [],
        select: function () {
            setAccountSelectedDate();
            $scope.$broadcast("refresh account");
        },
        reset: function () {
            this.options = winStatus.cur_account_list.length === 1 ? this._getAccountValuationDates() : this._getPortfolioValuationDates();
            $scope.hasValuationDate = this.options.length > 0;
            this.selected = $scope.hasValuationDate ? this.options[0] : undefined;
        },
        isShow: function () {
            if (winStatus.cur_account_list.length === 0) return false;
            return winStatus.cur_account_list.length === 1 ? this.isShowInAccount() : this.isShowInPortfolio();
        },
        isShowInAccount: function () {
            var option1 = ['position', 'allocation', 'liquidity'].indexOf(winStatus.cur_main_tab) > -1;
            var option2 = winStatus.cur_account.source_type_position === 'position';
            return option1 && option2;
        },
        isShowInPortfolio: function () {
            var isAllAccountsValuation = true;
            winStatus.cur_account_list.forEach(function (accountId) {
                isAllAccountsValuation = isAllAccountsValuation && (accountService.getAccountById(accountId).source_type_position === 'position');
            });
            var option4 = [tabConst.portfolio_position, tabConst.portfolio_account_asset].indexOf(winStatus.portfolio_cur_main_tab) > -1;
            return isAllAccountsValuation && option4;
        },
        _getAccountValuationDates: function () {
            // RISK: 后台传回的valuation_dates可能为null; 这里的返回值类型必须为数组
            return winStatus.cur_account.valuation_dates;
        },
        _getPortfolioValuationDates: function () {
            var dates = [];
            winStatus.cur_account_list.forEach(function (accountId) {
                dates = dates.concat(accountService.getAccountById(accountId).valuation_dates);
            });
            // RISK: 不知道是否支持ES6，用于去重排序
            dates.sort().reverse();
            return Array.from(new Set(dates));
        }
    };

    // 历史日期选择
    $scope.timePickerConfig = angular.merge({}, datetimePickerConfig, { endDate: dateClass.getFormatDate(dateClass.getLastDay(new Date()), 'yyyy-MM-dd') });
    $scope.historyDate = {
        canSelected: false,
        selectedDate: dateClass.getFormatDate(dateClass.getLastDay(new Date()), 'yyyy-MM-dd'),
        reset: function () {
            this.canSelected = false;
            this.selectedDate = dateClass.getFormatDate(dateClass.getLastDay(new Date()), 'yyyy-MM-dd');
        },
        getDate: function () {
            return this.canSelected ? this.selectedDate : undefined;
        },
        select: function () {
            setAccountSelectedDate();
            $scope.$broadcast("refresh account");
        },
        isShow: function () {
            if (winStatus.cur_account_list.length === 0) return false;
            // 历史日期控件，只在 持仓、资产分布 页面显示
            const inPosition = ['position', 'allocation'].indexOf(winStatus.cur_main_tab) > -1;
            if (winStatus.cur_account_list.length === 1) {
                const isValuation = (winStatus.cur_account.source_type_position !== 'position');
                return inPosition && isValuation;
            } else {
                const isShowInAccountGroups = !$scope.valuationDates.isShowInPortfolio();
                return inPosition && isShowInAccountGroups;
            }
        }
    };

    // 表头数据的估值方法
    $scope.valuationMethods = {
        MAP: {
            '账户估值': 'default',
            '成本法': 'fcost',
            '摊余成本法': 'cost',
            // '估值表法': 'valuation',
        },
        value: 'default',
        selected: '账户估值',
        options: ['账户估值', '成本法', '摊余成本法'],
        reset: function() {
            // 目前只支持 单账户页面，账户持仓属性为估值属性 的情况
            if (winStatus.is_account_now && winStatus.cur_account.source_type_position === 'trade') {
                this.options =  ['账户估值', '成本法', '摊余成本法'];
                this.selected = (this.selected === '估值表法') ? '账户估值' : this.selected;
            } else {
                this.options =  ['账户估值', '成本法'];
                this.selected = '账户估值';
            }
            this.select();
        },
        select: function () {
            this.value = this.MAP[this.selected];
            winStatus.cur_valuation_method = this.value;
        },
    }
    function setAccountSelectedDate() {
        if (winStatus.is_account_now) {
            $scope.accountSelectedDate = winStatus.cur_account.source_type_position === 'trade' ? $scope.historyDate.getDate() : $scope.valuationDates.selected;
        } else {
            var isAllAccountsValuation = true;
            winStatus.cur_account_list.forEach(function (accountId) {
                isAllAccountsValuation = isAllAccountsValuation && (accountService.getAccountById(accountId).source_type_position === 'position');
            });
            $scope.accountSelectedDate = isAllAccountsValuation ? $scope.valuationDates.selected : $scope.historyDate.getDate();
        }
        $scope.$broadcast("accountSelectedDate is changed");
    }
    function refreshAccountSelectedDate() {
        $scope.valuationDates.reset();
        $scope.historyDate.reset();
        $scope.valuationMethods.reset();
        setAccountSelectedDate();
    }

    $scope.$on("account updated", function () {
        $scope.cur_account_authority = winStatus.cur_account_authority;
        $scope.cur_account_trade_option = winStatus.cur_account_trade_option;
        refreshAccountSelectedDate();
        $scope.$broadcast("refresh account");
    });

    $scope.$on("account import", function () {
        refreshAccountSelectedDate();
        $scope.$broadcast("refresh account");
    });

    $scope.$on("open DealInputDlg", function () {
        openDealDlg('show DealInputDlg');
    });

    $scope.$on("edit bankRepo Event", function () {
        openDealDlg('show bankRepoDlg');
    });

    $scope.$on("edit buyoutRepo Event", function () {
        openDealDlg("show buyoutRepoDlg");
    });

    $scope.$on("edit exchangeRepo Event", function () {
        openDealDlg("show exchangeRepoDlg");
    });

    $scope.$on("edit protocolRepo Event", function () {
        openDealDlg("show protocolRepoDlg");
    });

    $scope.$on("edit deposit Event", function (event, data) {
        openDealDlg("show depositDlg", data);
    });

    $scope.$on("edit bankLending Event", function () {
        openDealDlg("show bankLendingDlg");
    });

    $scope.$on("edit finance Event", function () {
        openDealDlg("show financeDlg");
    });

    $scope.$on("edit cash Event", function () {
        openDealDlg('show cashDlg');
    });

    $scope.$on("edit primaryDeal Event", function () {
        openDealDlg('show primaryDealDlg');
    });

    $scope.$on("edit account Event", function () {
        $scope.$broadcast("show accountDlg");
    });

    $scope.$on("edit purchase Event", function () {
        openDealDlg("show purchaseDlg");
    });
    $scope.$on("edit dividend Event", function (event, data) {
        openDealDlg("show dividendDlg", data);
    });

    $scope.$on("edit trade event", function (event, data) {
        openDealDlg("show edit trade dealDlg", data);
    });

    $scope.$on("edit fund_reserves Event", function () {
        openDealDlg("show fundReservesDlg");
    });

    $scope.$on("edit stock_trades Event", function () {
        openDealDlg("show stockDlg");
    });

    $scope.$on("edit fund_otc_trades Event", function () {
        openDealDlg("show fundOtcDlg");
    });

    $scope.$on("edit fund_exchange_trades Event", function () {
        openDealDlg("show fundExchangeDlg");
    });

    $scope.$on("edit fee Event", function () {
        openDealDlg("show feeDlg");
    });

    $scope.$on('edit nostd Event', function () {
        openDealDlg("show nostdDlg");
    });
    $scope.$on('update message list', function () {
        $scope.$broadcast('refresh message list');
    });

    //资产校对
    $scope.check_position = {
        course_code: null,
        course_name: null,
        checkedObj: {},
        bondChecked: function (selected) {
            if (selected) {
                $scope.check_position.checkedObj.asset_code = selected.originalObject.bond_id;
                $scope.check_position.checkedObj.asset_name = selected.originalObject.short_name;
                $scope.check_position.checkedObj.asset_id = selected.originalObject.bond_key_listed_market;
                $scope.check_position.checkedType = '2'; //手工校对
            } else {
                $scope.check_position.checkedObj = {};
            }
        },
        stockFundChecked: function (selected) {
            if (selected) {
                $scope.check_position.checkedObj.asset_code = selected.originalObject.code;
                $scope.check_position.checkedObj.asset_name = selected.originalObject.name;
                $scope.check_position.checkedObj.asset_id = selected.originalObject.code;
                $scope.check_position.checkedType = '2'; //手工校对
            } else {
                $scope.check_position.checkedObj = {};
            }
        }
    };

    //导出Excel
    $scope.getFileName = function (assetType, date) {
        if (!date) {
            date = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd')
        }
        return winStatus.current_name + assetType + date.replace(/-/g, '') + '.csv';
    };

    $scope.exportExcel = function (exporter) {
        var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
        exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE, myElement);
    };

    $scope.formatCsvHeader = function (data) {
        var csvHeader = [];
        if (data != undefined) {
            $.each(data, function (index) {
                csvHeader.push(index);
            });
        }
        //csvHeader.splice(csvHeader.length - 6, 6);
        return csvHeader;
    };

    $scope.showTableSetting = function(gridName) {
        GridConfigService.initDialog(gridName);
        $('#chartSetting').modal('show');
    };
    $scope.resetTableSetting = function(gridName) {
        GridConfigService.reset(gridName);
    };

    $scope.showRepoPledgeBonds = function (list) {
        $scope.bank_repo_pledge_list = list;
    };

    function popupAcountDlg() {
        if (dataCenter.account.accountsData.length > 0) {
            // $('#accountGroup').modal('show');
        } else {
            $scope.onAddAccountClicked();
        }
    }

    socketServer.join('/account', user.company_id);
    socketServer.joinAgentCompany();
    socketServer.registerNotificationSocket(user.company_id, $scope);

    socketServer.on('/account', 'user account authority event', function (data) {
        if (data.hasOwnProperty('account_id') && authorityControl.notSelfAccount(data.account_id)) {
            authorityControl.updateAccountAndAuthority(data);
        }
    });
    socketServer.on('/account', 'agent account trade option event', function (data) {
        if (data.hasOwnProperty('user_id') && data.user_id == user.id) {
            authorityControl.updateAgentAccountTradeOption(data);
            $scope.cur_account_trade_option = authorityControl.getAuthorityAndAgentCompany(winStatus.cur_account_id).trade_option;
        }
    });
    socketServer.on('/account', 'agent account authority event', function (data) {
        if (data.hasOwnProperty('user_id') && data.user_id == user.id) {
            authorityControl.updateAgentAccountAuthority(data);
        }
    });
    socketServer.on('/account', 'account event', function (data) {
        if (data.account_group && data.account_group.manager == user.id) {
            $scope.$broadcast("portfolioPanel update");
            //更新账户的account_groups 字段
            accounts.get({
                manager_id: user.id,
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $.each(data, function (index, value) {
                        $.each(accountFactory.accountSet, function (num, val) {
                            if (value.manager == val.manager && value.id == val.id) {
                                val.account_groups = value.account_groups;
                                return false;
                            }
                        })
                    })
                }
            });

            var temp = [];
            jQuery.each(accountFactory.groupSet, function (i, v) {
                temp.push(v.id);
            });
            var index = temp.indexOf(data.account_group.id);
            switch (data.action) {
                case 'add':
                    var bol = true;
                    jQuery.each(accountFactory.groupSet, function (i, v) {
                        if (data.account_group == v) {
                            return bol = false;
                        }
                    });
                    if (bol) accountFactory.groupSet.push(data.account_group);
                    break;
                case 'delete':
                    if (index > -1) accountFactory.groupSet.splice(index, 1);
                    break;
                case 'update':
                    accountFactory.groupSet.splice(index, 1, data.account_group);
            }
            //点击组合的按钮是否disable
            if (accountFactory.groupSet.length == 0) {
                accountPanelState.vars[1].confirm_po = false;
            }
        }

        if (data.account_list) {
            var isBroadcast = false;
            var msgStr = '';
            $.each(data.account_list, function (index, row) {
                if (!authorityControl.hasAccountAuthority(row)) {
                    return true;
                }
                if (data.action == "add") {
                    row.option = authorityConstant.ACCOUNT_WRITE;
                    accountFactory.accountSet.push(row);
                    //新建账户展示到该账户信息以及该账户总览信息
                    if (!winStatus.isContinue) {
                        winStatus.cur_account_list = [data.account_list[0].id];
                        winStatus.is_account_now = true;
                        $.each(accountFactory.accountSet, function (index, value) {
                            value.checked = false;
                            if (value.id === data.account_list[0].id) {
                                value.checked = true;
                                accountPanelState.vars[1].accountStr = data.account_list[0].name;
                                winStatus.cur_main_tab = 'position';//tab一级窗口显示初始化
                                winStatus.cur_position_tab = 0;//tab二级窗口显示初始化
                                winStatus.cur_account = data.account_list[0];
                                winStatus.cur_account_id = data.account_list[0].id;
                                winStatus.current_name = data.account_list[0].name;
                                var result = authorityControl.getAuthorityAndAgentCompany(data.account_list[0].id);
                                winStatus.cur_account_authority = result.option;
                                winStatus.cur_account_trade_option = result.trade_option;
                                winStatus.cur_agent_company_id = result.agent_company_id;
                            }
                        });
                        $scope.$emit("account updated");
                        accountPanelState.vars[1].confirm_ac = true;
                        accountPanelState.vars[1].count = 1;
                    }
                } else {
                    if (winStatus.is_account_now && winStatus.cur_account_id == row.id) {
                        winStatus.cur_account = row;
                        winStatus.current_name = row.name;
                        isBroadcast = true;
                        msgStr = "refresh account";
                        refreshAccountSelectedDate();
                    }
                    if (!winStatus.is_account_now && winStatus.cur_account_list.indexOf(row.id) > -1) {
                        isBroadcast = true;
                        msgStr = "refresh account";
                    }
                    $.each(accountFactory.accountSet, function (i, account) {
                        if (row.id == account.id) {
                            //保存账户在当前界面的一些状态值
                            if (data.action == "update") {
                                row.checked = account.checked; //组合选择面板是否勾选变量
                                row.option = account.option;
                                row.agent_company_id = account.agent_company_id;
                                accountFactory.accountSet.splice(i, 1, row);
                            }
                            if (data.action == "delete") {
                                accountFactory.accountSet.splice(i, 1);
                            }
                            return false;
                        }
                    });
                }
            });

            if (isBroadcast) $scope.$broadcast(msgStr);
        }
    });

    $timeout(() => {
        popupAcountDlg();
        user.isLogin = true;
    }, 1000);

    $scope.tabTemplateScope = {};
    $scope.tabTemplateInitFun = function (theScope) {
        $scope.tabTemplateScope = theScope;
    };

    $scope.closePanel = function () {
        winStatus.is_show_warn_panel = false;
        $('.ias-date-warn-panel').hide();
    };

    $scope.assetData = {};
    function getAccountAssetInfo() {
        account.get({
            account_id: filterParam.account_id,
            company_id: $scope.getCompanyId(filterParam.account_id),
            date: $scope.accountSelectedDate,
            include_ref_account: winStatus.refAccount.get()
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var assetData = response.data;
                $scope.assetData = assetData;
                if (winStatus.is_show_warn_panel  && assetData.days_to_exit) {
                    $('.ias-date-warn-panel').show();
                } else {
                    $('.ias-date-warn-panel').hide();
                }
                hcMarketData.assetMarketData = assetData;
            }
        });
    }

    function getGroupAssetInfo() {
        accountGroupSummary.post({
            account_group_id: accountConstant.group_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            company_id: user.company_id,
            date: $scope.accountSelectedDate
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.assetData = response.data[0];
            }
        });
    }

    function updateCurrentWindow() {
        if (winStatus.cur_account_list.length < 1) return;
        if (winStatus.cur_account_list.length === 1) {
            getAccountAssetInfo();
        } else {
            getGroupAssetInfo();
        }

        $scope.handleMainTabSelected(winStatus.cur_main_tab);
    }

    $scope.handleMainTabSelected = function(tabname) {
        winStatus.cur_main_tab = tabname;
        // 使用拼接字符串会导致搜索不方便。因此此处做一个MAP。
        const TAB_MSG = {
            'position': 'position tab selected',
            'allocation': 'allocation tab selected',
            'liquidity': 'liquidity tab selected',
            'trade': 'trade tab selected',
            'performance': 'performance tab selected',
            'indices': 'indices tab selected',
            'market': 'market tab selected',
        }

        // TODO: 这样直接更改TAB选中不是太好，还不如在组件暴露一个 ngModel
        const TABS = ['position', 'allocation', 'liquidity', 'trade', 'performance', 'indices', 'market'];
        $scope.tabTemplateScope.panes.forEach(pane => pane.selected = false);
        $scope.tabTemplateScope.panes[TABS.indexOf(tabname)].selected = true;

        $scope.$broadcast(TAB_MSG[tabname]);
    }

    $scope.$on("refresh account", function () {
        filterParam.account_id = winStatus.cur_account_id;
        updateCurrentWindow();
    });
});
IASAccountModule.controller('errorDetailCtrl', function ($scope, clipboard, checkAsset) {
    $('#errorDetailDlg').on('show.bs.modal', function () {
        $scope.errorDetail = checkAsset.errorDetail;
        console.log($scope.errorDetail);
    });
    $scope.confirmFunc = function () {
        clipboard.copyText($scope.errorDetail);
        $('#errorDetailDlg').modal('hide');
    }
});
