angular.module('ias.account').controller('cashInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes, hcMarketData, Trades, dealPage,
    user, bond, accountTable, dataCenter, $timeout,
    accountUtils) {
    function clearPrice() {
        $scope.trade.bond_code = '';
        $scope.trade.short_name = '';
        $scope.trade.ttm = '';
        $scope.trade.issuer_rating_current = '';
        $scope.trade.val_yield = '';
        $scope.trade.val_clean_price = '';
        $scope.trade.val_duration = '';
        $scope.trade.internal_rating = '';
        $scope.trade.expiry_date = '';
        $scope.trade.option_date = '';
        $scope.trade.coupon_rate_current = '';
        $scope.trade.errorMsg = '';
    }
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.cash;
    };

    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: false,
        enableRowHeaderSelection: true,
        enableRowSelection: true,
        enableSelectAll: true,
        selectionRowHeaderWidth: 35,
        multiSelect: false,
        columnDefs: accountTable.bySellingColumnDef(),
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
    $scope.timePickerConfig = datetimePickerConfig;

    $scope.valuationTypeGroup = [
        { label: '中债估值', value: 'cdc' },
        { label: '成本法', value: 'cost' },
        { label: '中证估值', value: 'csi' }
        //{label: '上清估值', value: 'sch'},
        //{label: '市价', value: 'market'},
    ];
    $scope.costYieldTypeGroup = [
        { label: '到期', value: 'ytm' },
        { label: '行权', value: 'ytcp' },
    ];
    $scope.directionGroup = [
        { label: '买入', value: 1 },
        { label: '卖出', value: -1 }
    ];
    $scope.settleTypeGroup = [
        { label: 'T+0', value: 0 },
        { label: 'T+1', value: 1 }
    ];
    $scope.accountingTypeGroup = [
        { label: '持有到期', value: 'hold_to_maturity' },
        { label: '可供出售', value: 'available_for_sale' },
        { label: '交易出售', value: 'hold_for_trading' }
    ];

    function isBankBond(bklm) {
        return bklm.indexOf('SZE') > 0 || bklm.indexOf('SSE') > 0
    }

    // 平均成本法买入卖出
    function addAvgCostTrade() {
        $scope.$emit('deal trade add', {
            type: 'bond',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_list: [{
                trade_date: $scope.trade.trade_date,
                bond_key_listed_market: $scope.trade.bond_key_listed_market,
                direction: $scope.trade.direction,
                clean_price: parseFloat($scope.trade.clean_price),
                dirty_price: parseFloat($scope.trade.dirty_price),
                settlement_days: $scope.trade.settlement_days,
                volume: parseInt($scope.trade.volume),
                //   yield_type: $scope.trade.current_select,
                trader: $scope.trade.trader,
                counter_party_account: $scope.trade.counter_party_account,
                counter_party_trader: $scope.trade.counter_party_trader,
                comment: $scope.trade.comment,
                trade_mode: parseInt($scope.trade.trade_mode),
                valuation_method: $scope.trade.valuation_method,
                cost_yield_type: $scope.trade.cost_yield_type,
                accounting_type: $scope.trade.accounting_type,
                user: user.name,
                manager: user.id
            }]
        });
    };

    // 平均成本法买入卖出、逐笔卖出法买入的编辑
    function editAvgCostTrade() {
        $scope.$emit('deal trade update', {
            type: 'bond',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_id: $scope.trade.trade_id,
            trade: {
                trade_date: $scope.trade.trade_date,
                bond_key_listed_market: $scope.trade.bond_key_listed_market,
                direction: $scope.trade.direction,
                clean_price: parseFloat($scope.trade.clean_price),
                dirty_price: parseFloat($scope.trade.dirty_price),
                settlement_days: $scope.trade.settlement_days,
                volume: parseInt($scope.trade.volume),
                //      yield_type: $scope.trade.current_select,
                trader: $scope.trade.trader,
                counter_party_account: $scope.trade.counter_party_account,
                counter_party_trader: $scope.trade.counter_party_trader,
                comment: $scope.trade.comment,
                trade_mode: parseInt($scope.trade.trade_mode),
                valuation_method: $scope.trade.valuation_method,
                cost_yield_type: $scope.trade.cost_yield_type,
                accounting_type: $scope.trade.accounting_type,
                user: user.name,
                manager: user.id
            }
        });
    };

    function getErrorMsg (){
        if ($scope.trade.maturity_dates && $scope.trade.maturity_dates < $scope.trade.trade_date) return '债券已到期';
        if ($scope.trade.trade_date < $scope.trade.interest_start_date) return '债券未发行';
        return '';
    }


    // 获得逐笔卖出账户的量
    $scope.getSellVolumeOfSpecifyAccount = function () {
        var send_list = $scope.gridApi.selection.getSelectedRows();
        var buy_id = '';
        var sell_volume = 0;
        $.each(send_list, function (index, row) {
            buy_id = row.trade_id;
            sell_volume = row.sell_volume
        });
        return {
            sell_volume: sell_volume,
            buy_id: buy_id
        };
    };

    // 逐笔卖出法卖出
    var addSellSpecifyTrade = function () {
        var specify_sell = $scope.getSellVolumeOfSpecifyAccount();
        $scope.$emit('deal trade add', {
            type: 'bond',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_list: [{
                trade_date: $scope.trade.trade_date,
                bond_key_listed_market: $scope.trade.bond_key_listed_market,
                direction: $scope.trade.direction,
                clean_price: parseFloat($scope.trade.clean_price),
                dirty_price: parseFloat($scope.trade.dirty_price),
                settlement_days: $scope.trade.settlement_days,
                volume: specify_sell.sell_volume,
                //          yield_type: $scope.trade.current_select,
                trader: $scope.trade.trader,
                counter_party_account: $scope.trade.counter_party_account,
                counter_party_trader: $scope.trade.counter_party_trader,
                comment: $scope.trade.comment,
                trade_mode: parseInt($scope.trade.trade_mode),
                valuation_method: $scope.trade.valuation_method,
                cost_yield_type: $scope.trade.cost_yield_type,
                accounting_type: $scope.trade.accounting_type,
                user: user.name,
                manager: user.id,
                buy_id: specify_sell.buy_id
            }]
        });
    };

    // 逐笔卖出法卖出的编辑
    function editSellSpecifyTrade() {
        var specify_sell = $scope.getSellVolumeOfSpecifyAccount();
        $scope.$emit('deal trade update', {
            type: 'bond',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_id: $scope.trade.trade_id,
            trade: {
                trade_date: $scope.trade.trade_date,
                bond_key_listed_market: $scope.trade.bond_key_listed_market,
                direction: $scope.trade.direction,
                clean_price: parseFloat($scope.trade.clean_price),
                dirty_price: parseFloat($scope.trade.dirty_price),
                settlement_days: $scope.trade.settlement_days,
                volume: specify_sell.sell_volume,
                //        yield_type: $scope.trade.current_select,
                trader: $scope.trade.trader,
                counter_party_account: $scope.trade.counter_party_account,
                counter_party_trader: $scope.trade.counter_party_trader,
                comment: $scope.trade.comment,
                trade_mode: parseInt($scope.trade.trade_mode),
                valuation_method: $scope.trade.valuation_method,
                cost_yield_type: $scope.trade.cost_yield_type,
                accounting_type: $scope.trade.accounting_type,
                user: user.name,
                manager: user.id,
                buy_id: specify_sell.buy_id
            }
        });
    };

    function addNewTrade() {
        if ($scope.trade.sell_rule == 'specify') {
            if (!$scope.trade.cash_edit_mode) {
                if (1 == $scope.trade.direction) {
                    addAvgCostTrade();
                } else if (-1 == $scope.trade.direction) {
                    addSellSpecifyTrade();
                }
            } else {
                if (1 == $scope.trade.direction) {
                    editAvgCostTrade();
                } else if (-1 == $scope.trade.direction) {
                    editSellSpecifyTrade();
                }
            }
        } else if ($scope.trade.sell_rule == 'average_cost') {
            if (!$scope.trade.cash_edit_mode) {
                addAvgCostTrade();
            } else {
                editAvgCostTrade();
            }
        }
        $scope.trade.cash_edit_mode = false;

        $scope.init_data();
    };

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.cash != selectTypes.dealInput) {
            return;
        }
        if (!$scope.checkInput()) {
            return;
        }
        // 逐笔账户的量需要用另一种方式获得
        var sellVolume = ($scope.trade.sell_rule == 'specify' && -1 == $scope.trade.direction) ? $scope.getSellVolumeOfSpecifyAccount().sell_volume : parseInt($scope.trade.volume);
        // 风控检测
        $scope.priorRiskCheck({
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            type: 'bond',
            trade_trial: {
                trade_id: $scope.trade.trade_id,
                trade_date: $scope.trade.trade_date,
                bond_key_listed_market: $scope.trade.bond_key_listed_market,
                direction: $scope.trade.direction,
                clean_price: $scope.trade.clean_price,
                settlement_days: $scope.trade.settlement_days,
                volume: sellVolume,
                valuation_method: $scope.trade.valuation_method,
                cost_yield_type: $scope.trade.cost_yield_type,
                accounting_type: $scope.trade.accounting_type,
                dirty_price: parseFloat($scope.trade.dirty_price)
            }
        }, addNewTrade)
    });

    $scope.$on("dealInput-apply", function () {
        if (dealPage.cash != selectTypes.dealInput) {
            return;
        }

        if (!$scope.checkInput()) {
            return;
        }

        if ($scope.trade.sell_rule == 'specify' && -1 == $scope.trade.direction) {
            $scope.trade.volume = $scope.getSellVolumeOfSpecifyAccount().sell_volume;
        }

        $scope.trade.new_coupon_rate = null;
        $scope.trade.new_duration = null;
        $scope.trade.new_yield_rate = null;
        Trades.add({
            type: 'bond',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_trial: {
                trade_id: $scope.trade.trade_id,
                trade_date: $scope.trade.trade_date,
                bond_key_listed_market: $scope.trade.bond_key_listed_market,
                direction: $scope.trade.direction,
                clean_price:$scope.trade.clean_price,
                settlement_days: $scope.trade.settlement_days,
                volume: parseInt($scope.trade.volume),
                valuation_method: $scope.trade.valuation_method,
                cost_yield_type: $scope.trade.cost_yield_type,
                accounting_type: $scope.trade.accounting_type,
            }
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.trade.new_coupon_rate = data.coupon_rate;
                $scope.trade.new_duration = data.duration;
                $scope.trade.new_yield_rate = data.yield_rate;
            }
        });
    });

    $scope.checkInput = function () {
        $scope.trade.show_alert = true;
        $scope.trade.alert_content = '';
        if (accountUtils.isEmpty($scope.trade.bond_key_listed_market)) {
            $scope.trade.alert_content = '请选择债券!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            $scope.trade.alert_content = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.clean_price) && !$scope.trade.is_convert_bond) {
            $scope.trade.alert_content = '请输入净价!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.dirty_price) && $scope.trade.is_convert_bond) {
            $scope.trade.alert_content = '请输入全价!';
            return false;
        }
        if ((accountUtils.isEmpty($scope.trade.volume) && ($scope.trade.sell_rule == 'average_cost')) ||
            ($scope.trade.sell_rule == 'specify' && $scope.trade.direction == 1 && accountUtils.isEmpty($scope.trade.volume))) {
            $scope.trade.alert_content = '请输入量!';
            return false;
        }
        if ($scope.trade.trade_date > $scope.trade.maturity_dates) {
            $scope.trade.alert_content = '交易日录入晚于到期日!';
            return false;
        }
        if ($scope.trade.trade_date < $scope.trade.interest_start_date) {
            $scope.trade.alert_content = '交易日录入早于起息日!';
            return false;
        }
        $scope.trade.show_alert = false;
        return true;
    };

    $scope.internalAccountChecked = function (checked) {
        return checked ? 'checkbox-checked' : 'checkbox-normal';
    };

    $scope.init_data = function () {
        $scope.$broadcast('angucomplete-alt:clearInput', 'bondSearchBox');
        $scope.trade = {
            trade_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
            bond_key_listed_market: '',
            bond_code: '',
            short_name: '',
            coupon_rate_current: null,
            issuer_rating_current: '',
            ttm: '',
            val_clean_price: '',
            val_yield: '',
            val_duration: '',
            maturity_dates: '',
            direction: 1,
            yield: '',
            clean_price: '',
            dirty_price: '',
            volume: '',
            yield_type: 'ytm',
            settlement_days: 0,
            cash_t_0: hcMarketData.assetMarketData.cash_t_0,
            cash_t_1: hcMarketData.assetMarketData.cash_t_1,
            available_fund: hcMarketData.assetMarketData.cash_t_0,
            valuation_method: '',
            cost_yield_type: 'ytm',
            trade_mode: 0,
            account_id: filterParam.account_id,
            trader: '',
            counter_party_account: '',
            counter_party_trader: '',
            comment: '',
            accounting_type: '',
            duration: hcMarketData.assetMarketData.duration,
            yield_rate: hcMarketData.assetMarketData.yield_rate,
            coupon_rate: hcMarketData.assetMarketData.coupon_rate,
            sell_rule: hcMarketData.assetMarketData.sell_rule,
            bank_valuation_method: hcMarketData.assetMarketData.valuation_method,
            exchange_valuation_method: hcMarketData.assetMarketData.valuation_method_exchange,
            new_duration: '',
            new_yield_rate: '',
            new_coupon_rate: '',
            trade_id: '',
            denomination: '',
            has_option: '',
            option_date: '',
            internal_rating: '',
            expiry_date: '',
            show_alert: false,
            alert_content: '',
            cash_edit_mode: false,
            clean_price_deviation: '',
            ytm: '',
            ytcp: '',
            current_select: '',
            max_available: '',
            enable_internal_account: false,
            is_convert_bond: false,
            errorMsg: '',
        };
        accountUtils.updateSettleTypeStatus($scope);
        //是否显示市价估值
        if ($scope.settleTypeGroup.length == 1) {
            $scope.valuationTypeGroup.length = 3;
            $scope.valuationTypeGroup.push({ label: '市价', value: 'market' });
        }
        if ($scope.settleTypeGroup.length == 2) {
            $scope.valuationTypeGroup.length = 3;
        }

        if ($scope.gridApi) {
            $scope.gridApi.selection.clearSelectedRows();
            $scope.gridOptions.data = [];
        }
        $scope.maxLabel = "最大可买量";
    };

    // init data
    $scope.$on("init cash dlg", function () {
        $scope.init_data();
    });

    $scope.$on("show cashDlg", function () {
        var bond = hcMarketData.bond;
        $scope.trade.cash_edit_mode = true;
        hcMarketData.showBtnList = false;
        selectTypes.dealInput = dealPage.cash;

        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.trade.account_id = bond.account_id;
        $scope.trade.trade_date = bond.trade_date;//日期
        $scope.trade.buy_id = bond.buy_id;
        $scope.trade.bond_key_listed_market = bond.bond_key_listed_market;
        $scope.trade.bond_code = $filter('codeBond')(bond.bond_key_listed_market);
        $scope.trade.short_name = $filter('shortNameBond')(bond.bond_key_listed_market);
        $scope.trade.trade_mode = bond.trade_mode;//我方还是对方
        $scope.trade.clean_price = bond.clean_price;//价格
        $scope.trade.volume = bond.volume;//持仓量
        $scope.trade.denomination = ($scope.trade.volume * 100) / 10000;
        $scope.trade.direction = bond.direction;//方向
        if (1 == bond.direction) {
            $scope.maxLabel = '最大可买量';
        } else {
            $scope.maxLabel = '最大可卖量';
        }
        $scope.trade.valuation_method = bond.valuation_method;//估值法
        $scope.trade.cost_yield_type = bond.cost_yield_type;
        $scope.trade.counter_party_account = bond.counter_party_account;//对手账户
        $scope.trade.counter_party_trader = bond.counter_party_trader;//对手交易员
        $scope.trade.trader = $filter('userNameFilter')(bond.trader) == '' ? bond.trader : $filter('userNameFilter')(bond.trader);//本方交易员
        $scope.trade.settlement_days = bond.settlement_days;//结算方式
        $scope.trade.dirty_price = bond.dirty_price;
        $scope.trade.ytm = bond.ytm;
        $scope.trade.ytcp = bond.ytcp;
        $scope.trade.current_select = 'clean_price';  // 成交记录按净价保存
        $scope.trade.trade_id = bond.id;
        $scope.trade.comment = bond.comment;//备注
        $scope.trade.accounting_type = bond.accounting_type;//会计类型
        dealPage.isShowApply = true;           //试算
        $scope.trade.enable_internal_account = false;
        $scope.trade.new_coupon_rate = '';
        $scope.trade.new_duration = '';
        $scope.trade.new_yield_rate = '';
        $scope.trade.errorMsg = '';
        accountUtils.updateBondInfo($scope, function () {
            $scope.trade.is_convert_bond = $scope.trade.bond_type === "可转债";
            accountUtils.updateSettleTypeStatus($scope);
            if (isBankBond($scope.trade.bond_key_listed_market)) {
                $scope.valuationTypeGroup.length = 3;
                $scope.valuationTypeGroup.push({ label: '市价', value: 'market' });
            } else {
                $scope.valuationTypeGroup.length = 3;
            }

            accountUtils.updateBondAvailableVolume($scope, function () {
                $scope.trade.available_volume = $scope.trade.available_volume + $scope.trade.volume;
                accountUtils.updateMaxAvailable($scope);
            });
            accountUtils.updateCalcValue($scope);   // 支持换债券实时计算收益
        });
        $scope.accountChanged(bond.account_id);
        if (-1 == $scope.trade.direction && hcMarketData.assetMarketData.sell_rule == 'specify') {
            accountUtils.updateBySelling($scope, function (data) {
                $scope.gridOptions.data = data ? data.buy_list : [];
                var isOversell = true, buyItem = null;
                data.buy_list.forEach(function (item) {
                    if (bond.buy_id === item.trade_id) {
                        isOversell = false;
                        buyItem = item;
                    }
                });
                if (isOversell) {
                    // 编辑时，如果该笔已经卖空，则要把已经卖掉的这一笔加回去
                    data.trade_list.forEach(function (item) {
                        if (bond.buy_id === item.id) {
                            buyItem = {
                                trade_id: item.id,
                                trade_date: item.trade_date,
                                volume: bond.volume,
                                sell_volume: bond.volume,
                                ytm: item.ytm,
                                ytcp: item.ytcp,
                                clean_price: item.clean_price,
                                dirty_price: item.dirty_price,
                            };
                        }
                    });
                    if (buyItem) {
                        $scope.gridOptions.data.push(buyItem);
                    }
                } else {
                    buyItem.sell_volume = bond.volume;
                    buyItem.volume += bond.volume;
                }
                $timeout(function () {
                    if ($scope.gridApi) {
                        $scope.gridApi.selection.selectRow(buyItem);
                    }
                }, 100);
            });
        }
    });

    $scope.volumeChanged = function () {
        // 买入的风控暂时去掉，允许用户输入
        //if(-1 == $scope.trade.direction){
        //    if($scope.trade.volume > $scope.trade.max_available){
        //        $scope.trade.volume = $scope.trade.max_available;
        //    }
        //}
        //
        $scope.trade.denomination = $scope.trade.volume / 100;
    };

    $scope.noCalcDirtyPriceChanged = function () {
        accountUtils.updateMaxAvailable($scope);
    };

    $scope.parChanged = function () {
        // 风控暂时去掉，允许用户输入
        // 买入的风控暂时去掉，允许用户输入
        // 允许输入量大于已有量，不做限制
        // if (-1 == $scope.trade.direction) {
        //     if ($scope.trade.denomination * 100 > $scope.trade.max_available) {
        //         $scope.trade.denomination = $scope.trade.max_available / 100;
        //     }
        // }
        $scope.trade.volume = $scope.trade.denomination * 100;
    };

    $scope.specifyVolumeChanged = function (row) {
        if (row.sell_volume > row.volume) {
            row.sell_volume = row.volume;
        }
        $scope.gridApi.selection.selectRow(row);
        var selectedRows = $scope.gridApi.selection.getSelectedRows();
        var volume = 0;
        $.each(selectedRows, function (index, row) {
            volume = volume + row.sell_volume;
        });
        if (volume > $scope.trade.max_available) {
            row.sell_volume = $scope.trade.max_available - (volume - row.sell_volume);
            $scope.trade.volume = $scope.trade.max_available;
            $scope.trade.denomination = $scope.trade.volume / 100;
        } else {
            $scope.trade.volume = volume;
            $scope.trade.denomination = $scope.trade.volume / 100;
        }
    };

    $scope.bondSelectFun = function (selected) {
        if (selected) {
            $scope.trade.bond_code = selected.originalObject.bond_id;
            $scope.trade.short_name = selected.originalObject.short_name;
            $scope.trade.bond_key_listed_market = selected.originalObject.bond_key_listed_market;

            accountUtils.updateBySelling($scope, function (data) {
                $scope.gridOptions.data = data ? data.buy_list : [];
            });

            accountUtils.updateBondInfo($scope, function () {
                $scope.trade.errorMsg = getErrorMsg();
                $scope.trade.is_convert_bond = $scope.trade.bond_type === "可转债";
                if (isBankBond($scope.trade.bond_key_listed_market)) {
                    $scope.trade.valuation_method = $scope.trade.exchange_valuation_method;
                    $scope.valuationTypeGroup.length = 3;
                    $scope.valuationTypeGroup.push({ label: '市价', value: 'market' });
                } else {
                    $scope.valuationTypeGroup.length = 3;
                    $scope.trade.valuation_method = $scope.trade.bank_valuation_method;
                }
                accountUtils.updateSettleTypeStatus($scope);
                accountUtils.updateBondAvailableVolume($scope, function () {
                    accountUtils.updateMaxAvailable($scope)
                });
                accountUtils.updateCalcValue($scope);   // 支持换债券实时计算收益
            });
        }
        if (!selected) {
            clearPrice();
        }
    };

    $scope.tradeDateChanged = function () {
        $scope.trade.errorMsg = getErrorMsg();
        if ($scope.trade.bond_key_listed_market) {
            accountUtils.updateCalcValue($scope);
            accountUtils.updateValuation($scope);
            accountUtils.updateBondAvailableVolume($scope, function () {
                accountUtils.updateMaxAvailable($scope)
            });
        }
    };

    $scope.dateDiff = function (sDate1, sDate2) {
        return (new Date(sDate1) - new Date(sDate2)) / 1000 / 3600 / 24;    //把相差的毫秒数转换为天数
    }

    $scope.accountChanged = function (account_id) {
        accountUtils.updateAccountInfo($scope);
    };

    $scope.choiceBtn = function (value) {
        if (value == 1) {
            $scope.maxLabel = "最大可买量";
        } else {
            $scope.maxLabel = "最大可卖量";
        }
        accountUtils.updateMaxAvailable($scope);
    };

    $scope.settleTypeChange = function (value) {
        accountUtils.settleTypeChange($scope, value);
    };
    $scope.ytmChanged = function () {
        accountUtils.ytmChanged($scope);
    };
    $scope.ytcpChanged = function () {
        accountUtils.ytcpChanged($scope);
    };
    $scope.cleanPriceChanged = function () {
        accountUtils.cleanPriceChanged($scope);
    };
    $scope.dirtyPriceChanged = function () {
        accountUtils.dirtyPriceChanged($scope);
    };

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});