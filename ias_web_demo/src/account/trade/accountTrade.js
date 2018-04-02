angular.module('ias.account').controller('tradesCtrl', function($scope, winStatus, user, messageBox, socketServer, hcMarketData) {
    $scope.STATUS = {
        IS_POSITION: false,
    };
    $scope.isValuationInCurTab = function() {
        return $scope.hasValuationDate && winStatus.cur_account.source_type_trade === 'position';
    };

    $scope.overviewTradeTab = {
        label: '总览',
        isSelected: true,
        clickHandler: handleSubTabClick,
        refresh_msg: 'overviewTrade tab clicked',
    };
    $scope.bondTab = {
        label: '债券',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'bond_trades tab clicked',
    };
    $scope.stockTab = {
        label: '股票',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'stock_trades tab clicked',
    };
    $scope.fundTab = {
        label: '基金',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'fund_trades tab clicked',
    };
    $scope.depositTab = {
        label: '存款',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'deposit tab clicked',
    };
    $scope.bankLendingTab = {
        label: '拆借',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'bankLending tab clicked',
    };
    $scope.financeTab = {
        label: '理财',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'finance tab clicked',
    };
    $scope.bankRepoTab = {
        label: '银行间回购',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'bank_repo tab clicked',
    };
    $scope.buyoutRepoTab = {
        label: '买断式回购',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'buyout_repo tab clicked',
    };
    $scope.exchangeRepoTab = {
        label: '交易所回购',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'exchange_repo tab clicked',
    };
    $scope.protocolRepoTab = {
        label: '协议式回购',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'protocol_repo tab clicked',
    };
    $scope.purchaseTab = {
        label: '申购/赎回',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'purchase tab clicked',
    };
    $scope.dividendTab = {
        label: '产品分红',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'dividend tab clicked',
    };
    $scope.fundReservesTab = {
        label: '备付金',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'fund_reserves tab clicked',
    };
    $scope.feeTab = {
        label: '费用',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'fee_trades tab clicked',
    };
    $scope.treasuryFuturesTab = {
        label: '国债期货',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'treasury futures tab clicked',
    };
    $scope.tfMarginTab = {
        label: '国债期货保证金',
        isSelected: false,
        clickHandler: handleSubTabClick,
        refresh_msg: 'tf margin tab clicked',
    };
    $scope.tabsGroup = [
        $scope.overviewTradeTab,
        $scope.bondTab,
        $scope.stockTab,
        $scope.fundTab,
        $scope.depositTab,
        $scope.bankLendingTab,
        $scope.financeTab,
        $scope.bankRepoTab,
        $scope.buyoutRepoTab,
        $scope.exchangeRepoTab,
        $scope.protocolRepoTab,
        $scope.treasuryFuturesTab,
        $scope.tfMarginTab,
        $scope.purchaseTab,
        $scope.dividendTab,
        $scope.fundReservesTab,
        $scope.feeTab,
    ];

    function handleSubTabClick() {
        $scope.tabsGroup.forEach(function(tab) {
            tab.isSelected = false;
        });
        this.isSelected = true; //eslint-disable-line

        winStatus.cur_trades_tab = $scope.tabsGroup.indexOf(this); //eslint-disable-line

        if (hcMarketData.showBtnList) { // TODO：此变量控制着是否为编辑模式
            $scope.$broadcast('angucomplete-alt:clearInput', 'all');
        }
        $scope.$broadcast(this.refresh_msg); //eslint-disable-line
    }

    function handleTradeTabClick() {
        if (!$scope.tabsGroup[winStatus.cur_trades_tab]) {
            $scope.overviewTradeTab.clickHandler();
        } else {
            $scope.tabsGroup[winStatus.cur_trades_tab].clickHandler();
        }
    }

    $scope.$on('trade tab selected', function() {
        handleTradeTabClick();
    });

    socketServer.on('/account', 'account event', function(data) {
        if (data.action == 'generate_trades' && data.user == user.id) {
            if (data.status == 'succeed') {
                $scope.$emit('refresh account');

                if (data.msg_list.length > 0) {
                    let str = '运算偏差：如下证券在估值表中成本价为0\n';
                    for (let i = 0; i < data.msg_list.length; i++) {
                        str += data.msg_list[i];
                        str += '\n';
                    }
                    messageBox.error(str);
                } else {
                    messageBox.success('生成估值表资产变动成功！');
                }
            } else if (data.status == 'failed') {
                messageBox.error('生成估值表资产变动失败！');
            }
        }
    });

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('overviewTradeCtrl', function($scope, accountTable, filterParam, overviewTrade, excelExport, accountConstant,
    authorityControl, accountService, winStatus, messageBox, user) {
    $scope.gridOptions = {
        data: [],
        enableColumnMenus: false,
        enableSorting: true,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        columnDefs: accountTable.overviewTradeColumnDef(),
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        },
    };

    function exportOverviewTrades() {
        let fileName = winStatus.current_name + '_成交记录_总览_.xls';
        let param = {
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            company_id: user.company_id,
        };

        let errorFunc = function() {
            hideLoad();
            messageBox.error('成交记录总览导出失败！');
        };

        $('#loadShadeDiv').modal({
            backdrop: 'static',
            keyboard: false,
        });
        excelExport.request('trades_overview', param, fileName, hideLoad, errorFunc);
    }

    $scope.onExportData = function() {
        exportOverviewTrades();
    };

    let hideLoad = function() {
        $('#loadShadeDiv').modal('hide');
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        $scope.gridOptions.data = [];

        $('#loadShadeDiv').modal({
            backdrop: 'static',
            keyboard: false,
        });

        overviewTrade.post({
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            } else {
                messageBox.warn('总览中暂无数据！');
            }
            hideLoad();
        }, function failed() {
            hideLoad();
            messageBox.error('总览数据加载失败！');
        });
    };
    $scope.$on('overviewTrade tab clicked', function() {
        $scope.init();
    });

    $scope.init();

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('bondTradesCtrl', function($scope, accountTable, filterParam, hcMarketData, Trades, TradesGroup, accountConstant,
    marketFilter, Trade, user, $filter, winStatus, messageBox, generateTrades, authorityControl) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1', 'action2'],
        columnDefs: accountTable.bondTradesColumnDef(),
        rowTemplate: accountTable.getRowTemplate('positionRowTemplate'),
        exporterFieldCallback: function(grid, row, col, value) {
            if (col.name == 'direction') {
                value = $filter('directionBond')(row.entity, true);
            } else if (col.name == 'bond_code' && value) {
                value = value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
            } else if (col.name == 'short_name') {
                value = $filter('shortNameBond')(row.entity.bond_key_listed_market);
            } else if (col.name == 'account_name') {
                value = value + '\t';
            } else {
                value = (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
            return value;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(function(renderalbeRows) {
                renderalbeRows.forEach(function(row) {
                    // 搜索框筛选
                    if ($scope.searchKey) {
                        if ((row.entity.bond_code).indexOf($scope.searchKey) < 0) {
                            row.visible = false;
                            return true;
                        }
                    }
                });
                return renderalbeRows;
            }, 200);
        },
    };

    $scope.searchKey = '';
    $scope.bondSelectFun = function(selected) {
        $scope.searchKey = selected ? selected.originalObject.bond_code : '';
        $scope.gridApi.grid.refresh();
    };

    $scope.editTrades = function(bond) {
        hcMarketData.bond = bond;
        if (bond.trade_type == 1) {
            $scope.$emit('edit primaryDeal Event');
        } else {
            $scope.$emit('edit cash Event');
        }
    };

    $scope.delTrades = function(bond) {
        function confirmFun() {
            Trade.delete({
                type: 'bond',
                account_id: bond.account_id,
                trade_id: bond.id,
                company_id: $scope.getCompanyId(bond.account_id),
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.onExportData = function() {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_债券_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.isGeneratingTrade = false;
    $scope.onGenerateTrades = function() {
        $scope.isGeneratingTrade = true;
        generateTrades.generate({
            account_id: filterParam.account_id,
            company_id: $scope.getCompanyId(filterParam.account_id),
            user_id: user.id,
            generate_type: 'bond',
        });
    };

    function init() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        $scope.isGeneratingTrade = false;
        TradesGroup.post({
            type: 'bond',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                // 过滤掉没有权限的成交记录，原先单账户没有此操作
                authorityControl.filterByTradeOption(data);
                $scope.gridOptions.data = data;
            }
        });
    }
    $scope.$on('bond_trades tab clicked', function() {
        init();
    });
    init();

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('stockTradesCtrl', function($scope, accountTable, filterParam, hcMarketData, TradesGroup, accountConstant, authorityControl,
    marketFilter, Trade, winStatus, user, $filter, messageBox, stockClientFilter, generateTrades) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1', 'action2'],
        columnDefs: accountTable.stockTradesColumnDef(),
        exporterFieldCallback: function(grid, row, col, value) {
            if (col.name === 'direction') {
                value = $filter('directionBond')(row.entity, true);
            } else if (col.name === 'stock_code') {
                value = '\t' + value;
            } else if (col.name === 'account_name') {
                value = value + '\t';
            } else if (col.name === 'amount') {
                value = $filter('commafyConvert')($filter('absoluteAmount')(value));
            } else {
                value = (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
            return value;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(marketFilter.accountStockFilter, 200);
        },
    };

    $scope.stockSelectFun = function(selected) {
        if (selected) {
            stockClientFilter.searchKey = selected.originalObject.stock_code;
        } else {
            stockClientFilter.searchKey = '';
        }
        $scope.gridApi.grid.refresh();
    };

    $scope.editTrades = function(bond) {
        hcMarketData.bond = bond;

        $scope.$emit('edit stock_trades Event');
    };

    $scope.delTrades = function(bond) {
        function confirmFun() {
            Trade.delete({
                type: 'stock',
                account_id: bond.account_id,
                trade_id: bond.id,
                company_id: $scope.getCompanyId(bond.account_id),
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.onExportData = function() {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_股票_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.isGeneratingTrade = false;
    $scope.onGenerateTrades = function() {
        $scope.isGeneratingTrade = true;
        generateTrades.generate({
            account_id: filterParam.account_id,
            company_id: $scope.getCompanyId(filterParam.account_id),
            user_id: user.id,
            generate_type: 'stock',
        });
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        $scope.isGeneratingTrade = false;
        TradesGroup.post({
            type: 'stock',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                $scope.gridOptions.data = data;
                let stockList = [];
                $.each(data, function(index, row) {
                    for (let i = 0; i < stockList.length; i++) { // 组合账户没有这个for循环，暂时不删
                        if (row.stock_code == stockList[i].stock_code) {
                            return true;
                        }
                    }
                    let position = {};
                    position['stock_code'] = row.stock_code;
                    position['stock_name'] = row.stock_name;
                    position['pinyin'] = row.pinyin;
                    stockList.push(position);
                });
                $scope.stockList = stockList;
            }
        });
    };

    $scope.$on('stock_trades tab clicked', function() {
        $scope.init();
    });

    $scope.init();

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('fundTradesCtrl', function($scope, accountTable, filterParam, hcMarketData, TradesGroup, user, accountConstant,
    winStatus, marketFilter, Trade, $filter, messageBox, fundClientFilter, authorityControl) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1', 'action2'],
        columnDefs: accountTable.fundTradesColumnDef(),
        exporterFieldCallback: function(grid, row, col, value) {
            if (col.name == 'direction') {
                value = $filter('directionBond')(row.entity, true);
            } else if (col.name == 'fund_code') {
                return '\t' + value;
            } else if (col.name == 'account_name') {
                return value + '\t';
            } else if (col.name == 'amount' || col.name == 'cost_on_price' || col.name == 'fee') {
                value = $filter('commafyConvert')($filter('absoluteAmount')(value));
            } else {
                value = (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
            return value;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(marketFilter.accountFundFilter, 200);
        },
    };

    $scope.fundSelectFun = function(selected) {
        if (selected) {
            fundClientFilter.searchKey = selected.originalObject.fund_code;
        } else {
            fundClientFilter.searchKey = '';
        }
        $scope.gridApi.grid.refresh();
    };

    $scope.editTrades = function(bond) {
        hcMarketData.bond = bond;

        if (bond.market == 'otc') {
            $scope.$emit('edit fund_otc_trades Event');
        } else {
            $scope.$emit('edit fund_exchange_trades Event');
        }
    };

    $scope.delTrades = function(bond) {
        function confirmFun() {
            if (bond.market == 'otc') {
                Trade.delete({
                    type: 'fund_otc',
                    account_id: bond.account_id,
                    trade_id: bond.id,
                    company_id: $scope.getCompanyId(bond.account_id),
                    fund_type: bond.fund_type || 'not_money_funds', // 货币基金 || 非货币基金
                });
            } else {
                Trade.delete({
                    type: 'fund_exchange',
                    account_id: bond.account_id,
                    trade_id: bond.id,
                    company_id: $scope.getCompanyId(bond.account_id),
                });
            }
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.onExportData = function() {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_基金_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        TradesGroup.post({
            type: 'fund',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                $scope.gridOptions.data = data;
                let fundList = [];
                $.each(data, function(index, row) {
                    for (let i = 0; i < fundList.length; i++) { // 这个for循环组合账户原先的CTRL里没有，暂时不删
                        if (row.fund_code == fundList[i].fund_code) {
                            return true;
                        }
                    }
                    let position = {};
                    position['fund_code'] = row.fund_code;
                    position['fund_name'] = row.fund_name;
                    position['pinyin'] = row.pinyin;
                    fundList.push(position);
                });
                $scope.fundList = fundList;
            }
        });
    };
    $scope.$on('fund_trades tab clicked', function() {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('feeCtrl', function($scope, accountTable, user, TradesGroup, authorityControl, accountConstant, winStatus,
    $filter, hcMarketData, Trade, messageBox, filterParam) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterSuppressColumns: ['action1', 'action'],
        exporterOlderExcelCompatibility: true,
        columnDefs: accountTable.feeColumnDef(),
        exporterFieldCallback: function(grid, row, col, value) {
            if (col.name == 'account_id') {
                value = $filter('getAccountGroupName')(value);
            }
            if (col.name == 'amount') {
                value = $filter('commafyConvert')(value);
            }
            return value;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        },
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        TradesGroup.post({
            type: 'fee',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    };
    $scope.$on('fee_trades tab clicked', function() {
        $scope.init();
    });
    $scope.init();

    $scope.editFee = function(bond) {
        hcMarketData.bond = bond;
        $scope.$emit('edit fee Event');
    };

    $scope.delBtnClicked = function(bond) {
        function confirmFun() {
            Trade.delete({
                type: 'fee',
                account_id: bond.account_id,
                company_id: $scope.getCompanyId(bond.account_id),
                trade_id: bond.id,
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.onExportData = function() {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_费用_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('fundReservesCtrl', function($scope, accountTable, user, accountConstant, authorityControl, filterParam, TradesGroup, winStatus, Trades, Trade, hcMarketData, messageBox, $filter) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        exporterOlderExcelCompatibility: true,
        multiSelect: false,
        exporterSuppressColumns: ['action'],
        columnDefs: accountTable.fundReservesColumnDef(),
        rowTemplate: accountTable.getRowTemplate('positionRowTemplate'),
        exporterFieldCallback: function(grid, row, col, val) {
            if (col.name === 'direction') {
                return $scope.showDirection(val);
            } else if (col.name === 'settlement_days') {
                return 'T+' + val;
            }
            return (col.cellFilter) ? $filter(col.cellFilter)(val) : val;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        },
    };

    $scope.editFn = function(row) {
        hcMarketData.bond = row;
        $scope.$emit('edit fund_reserves Event');
    };

    $scope.deleteFn = function(bond) {
        function confirmFun() {
            Trade.delete({
                type: 'fund_reserve',
                account_id: bond.account_id,
                company_id: $scope.getCompanyId(bond.account_id),
                trade_id: bond.id,
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };
    $scope.showDirection = function(direction) {
        switch (direction) {
            case 1:
                return '增加';
            case -1:
                return '减少';
        }
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) return;

        TradesGroup.post({
            type: 'fund_reserve',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: $scope.accountSelectedDate,
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                $.each(data, function(index, value) {
                    value.amount = value.direction * value.amount;
                });
                $scope.gridOptions.data = data;
            }
        });
    };
    $scope.$on('fund_reserves tab clicked', function() {
        $scope.init();
    });
    $scope.init();

    $scope.onExportData = function(isTrade) {
        if (isTrade) {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_备付金_');
        } else {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_备付金_', $scope.accountSelectedDate);
        }

        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('dividendCtrl', function($scope, user, filterParam, accountTable, $filter, accountConstant, TradesGroup, Trade, messageBox, authorityControl, winStatus) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        columnDefs: accountTable.dividendColumnDef(),
        multiSelect: false,
        exporterSuppressColumns: ['action1', 'action'],
        exporterOlderExcelCompatibility: true,
        rowTemplate: accountTable.getRowTemplate('positionRowTemplate'),
        exporterFieldCallback: function(grid, row, col, val) {
            if (col.name === 'direction') {
                return $filter('dividendDirection')(val);
            } else if (col.name === 'settlement_days') {
                return $filter('settlementDayBond')(val);
            } else if (col.name === 'account_id') {
                return $filter('getAccountGroupName')(val) + '\t';
            } else if (col.name === 'amount') {
                return $filter('commafyConvert')(val);
            } else if (col.name === 'target_cost') {
                return $filter('thousandthNum')($filter('toFixed4')(val));
            } else if (col.name === 'account_name') {
                return val + '\t';
            } else if (col.name === 'is_rolling') {
                return val === '1' ? '是' : '否';
            }
            return val;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        },
    };

    $scope.tabType = 'cash_dividend';

    $scope.getCashDividendsData = function() {
        TradesGroup.post({
            type: 'cash_dividend',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                data.forEach(function(item) {
                    item.trade_date = item.dividend_date;
                });
                $scope.gridOptions.data = data;
            } else {
                $scope.gridOptions.data = [];
            }
        }, function error() {
            $scope.gridOptions.data = [];
        });
    };

    $scope.getDividendReinvestmentData = function() {
        TradesGroup.post({
            type: 'dividend_reinvestment',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            } else {
                $scope.gridOptions.data = [];
            }
        }, function error() {
            $scope.gridOptions.data = [];
        });
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        if ($scope.tabType === 'cash_dividend') {
            $scope.getCashDividendsData();
        } else {
            $scope.getDividendReinvestmentData();
        }
    };

    $scope.showCashDividend = function() {
        $scope.tabType = 'cash_dividend';
        $scope.getCashDividendsData();
    };

    $scope.showDividendReinvestment = function() {
        $scope.tabType = 'dividend_reinvestment';
        $scope.getDividendReinvestmentData();
    };

    $scope.$on('dividend tab clicked', function() {
        $scope.init();
    });

    $scope.editDividend = function(bond) {
        $scope.$emit('edit dividend Event', bond);
    };

    $scope.delDividendBtnClicked = function(trade) {
        function dividendConfirmFun() {
            Trade.delete({
                type: trade.type,
                account_id: trade.account_id,
                company_id: $scope.getCompanyId(trade.account_id),
                trade_id: trade.id,
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, dividendConfirmFun);
    };

    $scope.onExportData = function(isTrade) {
        // var name = $scope.tabType === 'cash_dividend' ? '_成交记录_现金分红_' : '_成交记录_红利再投资_';
        let name = '_成交记录_现金分红_';
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName(name);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('purchaseCtrl', function($scope, filterParam, accountTable,
    $filter, hcMarketData, messageBox, user, accountConstant, authorityControl, winStatus, Trade, TradesGroup) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        columnDefs: accountTable.purchaseColumnDef(),
        multiSelect: false,
        exporterSuppressColumns: ['action1', 'action'],
        exporterOlderExcelCompatibility: true,
        rowTemplate: accountTable.getRowTemplate('positionRowTemplate'),
        exporterFieldCallback: function(grid, row, col, val) {
            if (col.name === 'target_cost') {
                return $filter('thousandthNum')($filter('toFixed4')(val));
            } else if (col.name === 'account_name') {
                return val + '\t';
            } else if (col.name === 'is_rolling') {
                return val === '1' ? '是' : '否';
            } else if (col.name === 'account_id') {
                return $filter('getAccountGroupName')(val) + '\t';
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(val) : val;
            }
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        },
    };
    if ($scope.STATUS.IS_POSITION) {
        $scope.gridOptions.columnDefs.splice(-1, 1);
    }
    $scope.getData = function() {
        TradesGroup.post({
            type: 'fund_purchase',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: $scope.accountSelectedDate, // unused
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        }, function error() {
            $scope.gridOptions.data = [];
        });
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        $scope.getData();
    };
    $scope.$on('purchase tab clicked', function() {
        $scope.init();
    });
    $scope.init();
    $scope.editPurchase = function(bond) {
        hcMarketData.bond = bond;
        $scope.$emit('edit purchase Event');
    };
    $scope.delPurchaseBtnClicked = function(trade) {
        function purchaseConfirmFun() {
            Trade.delete({
                type: 'fund_purchase',
                account_id: trade.account_id,
                company_id: $scope.getCompanyId(trade.account_id),
                trade_id: trade.id,
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, purchaseConfirmFun);
    };
    $scope.onExportData = function() {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_申购/赎回_');
        $scope.exportExcel($scope.gridApi.exporter);
    };
    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('treasuryFuturesTradeCtrl', function($scope, accountTable, TradesGroup, accountConstant, authorityControl,
    filterParam, winStatus, user, $filter, Trade, messageBox) {
    $scope.gridOptions = {
        showColumnFooter: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterSuppressColumns: [],
        exporterOlderExcelCompatibility: true,
        columnDefs: accountTable.tfColumnDef(),
        exporterFieldCallback: function(grid, row, col, value) {
            return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        },
    };

    $scope.onExportData = function() {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_国债期货_');
        $scope.exportExcel($scope.gridApi.exporter);
    };

    const directionMap = {
        '-1': '卖',
        '1': '买',
    };
    const offsetMap = {
        '0': '开',
        '1': '平',
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        TradesGroup.post({
            type: 'tf',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                response.data.forEach((item) => {
                    item.trade_type = `${directionMap[item.direction]}(${offsetMap[item.offset]})`;
                });
                $scope.gridOptions.data = response.data;
            }
        });
    };

    $scope.editTrade = function(tradeInfo) {
        $scope.$emit('edit trade event', {
            type: 'tf',
            trade: tradeInfo,
        });
    };
    $scope.delTrade = function(trade) {
        messageBox.confirm('确定删除该条记录吗？', null, function() {
            Trade.delete({
                type: 'tf',
                account_id: trade.account_id,
                company_id: $scope.getCompanyId(trade.account_id),
                trade_id: trade.id,
            });
        });
    };

    $scope.$on('treasury futures tab clicked', function() {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.account').controller('tfMarginTradeCtrl', function($scope, accountTable, TradesGroup, accountConstant, authorityControl,
    filterParam, winStatus, user, $filter, Trade, messageBox) {
    $scope.gridOptions = {
        showColumnFooter: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterSuppressColumns: [],
        exporterOlderExcelCompatibility: true,
        columnDefs: accountTable.tfMarginColumnDef(),
        exporterFieldCallback: function(grid, row, col, value) {
            return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        },
    };

    $scope.onExportData = function() {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_国债期货保证金_');
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        TradesGroup.post({
            type: 'tf_margin',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    };

    $scope.editTrade = function(tradeInfo) {
        $scope.$emit('edit trade event', {
            type: 'tf_margin',
            trade: tradeInfo,
        });
    };
    $scope.delTrade = function(trade) {
        messageBox.confirm('确定删除该条记录吗？', null, function() {
            Trade.delete({
                type: 'tf_margin',
                account_id: trade.account_id,
                company_id: $scope.getCompanyId(trade.account_id),
                trade_id: trade.id,
            });
        });
    };

    $scope.$on('tf margin tab clicked', function() {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
