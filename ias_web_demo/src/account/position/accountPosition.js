import {
    overviewAssetColumnDef
} from './position.helper';

angular.module('ias.account').controller('positionCtrl', function ($scope, winStatus) {
    $scope.STATUS = {
        IS_POSITION: true
    };

    $scope.overviewAssetTab = { label: '总览', isSelected: true, clickHandler: handleSubTabClick, refresh_msg: 'overviewAsset tab clicked' };
    $scope.bondTab = { label: '债券', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'bond tab clicked' };
    $scope.stockTab = { label: '股票', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'stock tab clicked' };
    $scope.fundTab = { label: '基金', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'fund tab clicked' };
    $scope.depositTab = { label: '存款', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'deposit tab clicked' };
    $scope.bankLendingTab = { label: '拆借', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'bankLending tab clicked' };
    $scope.financeTab = { label: '理财', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'finance tab clicked' };
    $scope.bankRepoTab = { label: '银行间回购', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'bank_repo tab clicked' };
    $scope.buyoutRepoTab = { label: '买断式回购', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'buyout_repo tab clicked' };
    $scope.exchangeRepoTab = { label: '交易所回购', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'exchange_repo tab clicked' };
    $scope.protocolRepoTab = { label: '协议式回购', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'protocol_repo tab clicked' };
    $scope.treasuryFuturesTab = { label: '国债期货', isSelected: false, clickHandler: handleSubTabClick, refresh_msg: 'treasury futures tab clicked' };
    $scope.repoAssetTab = { label: '回购', isSelected: false, isHide: true, clickHandler: handleSubTabClick, refresh_msg: 'repo asset tab clicked' };
    $scope.otherAssetTab = { label: '其他', isSelected: false, isHide: true, clickHandler: handleSubTabClick, refresh_msg: 'other asset tab clicked' };
    $scope.indexFuturesTab = { label: '股指期货', isSelected: false, isHide: true, clickHandler: handleSubTabClick, refresh_msg: 'index futures tab clicked' };
    $scope.failedTab = { label: '待校验', isSelected: false, isHide: true, clickHandler: handleSubTabClick, refresh_msg: 'failed positions tab clicked' };

    $scope.tabsGroup = [
        $scope.overviewAssetTab,
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
        $scope.repoAssetTab,
        $scope.otherAssetTab,
        $scope.indexFuturesTab,
        $scope.treasuryFuturesTab,
        $scope.failedTab,
    ];

    function handleSubTabClick() {
        $scope.tabsGroup.forEach(function(tab) {
            tab.isSelected = false;
        })
        this.isSelected = true;
        winStatus.cur_position_tab = $scope.tabsGroup.indexOf(this);

        $scope.$broadcast('angucomplete-alt:clearInput', 'all');
        $scope.$broadcast(this.refresh_msg);
    }

    function setTabStatusWithSourceType() {
        var isValuationTab = winStatus.cur_account.source_type_position === 'position';
        // 账户持仓为 交易流水数据源 显示的tab
        $scope.bankLendingTab.isHide = isValuationTab;
        $scope.financeTab.isHide = isValuationTab;
        $scope.bankRepoTab.isHide = isValuationTab;
        $scope.buyoutRepoTab.isHide = isValuationTab;
        $scope.exchangeRepoTab.isHide = isValuationTab;
        $scope.protocolRepoTab.isHide = isValuationTab;
        // 账户持仓为 估值数据源 显示的tab
        $scope.repoAssetTab.isHide = !isValuationTab;
        $scope.otherAssetTab.isHide = !isValuationTab;
        $scope.indexFuturesTab.isHide = !isValuationTab;
        $scope.failedTab.isHide = !isValuationTab;
    }

    function setAccountGroupsTabs() {
        $scope.tabsGroup.forEach(tab => tab.isHide = false);
        // 组合页面不显示 待检验
        $scope.failedTab.isHide = true;
    }

    function handlePositionTabClick() {
        if (!$scope.tabsGroup[winStatus.cur_position_tab] || $scope.tabsGroup[winStatus.cur_position_tab].isHide) {
            $scope.overviewAssetTab.clickHandler();
        } else {
            $scope.tabsGroup[winStatus.cur_position_tab].clickHandler();
        }
    }

    $scope.$on('position tab selected', function () {
        if (winStatus.cur_account_list.length === 1) {
            setTabStatusWithSourceType();
        } else {
            setAccountGroupsTabs();
        }
        handlePositionTabClick();
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
angular.module('ias.account').controller('overviewAssetCtrl', function ($scope, dataCenter, accountTable, filterParam, $filter, user, positionsOverview, accountService, winStatus, messageBox, accountConstant, authorityControl) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableSorting: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        showTreeRowHeader: false,
        columnDefs: overviewAssetColumnDef(),
        exporterFieldCallback:function(grid,row,col,value){
            if(col.name == 'code'){
                if (value) {
                    if(row.entity.bond_key_listed_market != undefined){
                        return value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
                    }else{
                        return '\t'+ value;
                    }
                }
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerDataChangeCallback(function () {
                $scope.gridApi.treeBase.expandAllRows();
            });
            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if (!row.isSelected) {
                    $scope.gridOptions.data = null;
                }
                $scope.gridApi.treeBase.toggleRowTreeState(row);
            });
        }
    };
    $scope.gridOptions.data = [];

    $scope.onExportData = function(){
        $scope.gridOptions.exporterCsvFilename =  $scope.getFileName('_总览_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };


    var assetTypeName = {
        bond: '债券', nstd: '非标', interbankRepo: '银行间回购', exchangeRepo: '交易所回购', protocolRepo: '协议式回购',
        buyoutRepo: '买断式回购', deposit: '存款', reserve: '备付金', margin: '保证金', stock: '股票', fund: '基金',
        fundExchange: '交易所基金', fundOtc: '场外基金', finance: '理财', bankLendingIn: '拆入', depositIn: '同业存放',cash:'现金',
        interbankReverseRepo: '银行间逆回购', exchangeReverseRepo: '交易所逆回购', protocolReverseRepo: '协议式逆回购',
        buyoutReverseRepo: '买断式逆回购', tfLong: '国债期货多头', tfShort: '国债期货空头', ifLong: '股指期货多头',
        ifShort: '股指期货空头', fail: '待校对', otherAsset: '其他资产', receivable: '应收利息', payable: '应付利息', fee: '费用',
        bankLendingOut: '拆出', depositOut: '存放同业', settlement: '证券清算款', assetLiquidation: '应收证券清算款', liabilityLiquidation: '应付证券清算款',otherLiability:'其他负债',
        other:'其他'
    };
    var assetTypes = {
        bond: 'is_asset',
        nstd: 'is_asset',
        deposit: 'is_asset',
        reserve: 'is_asset',
        margin: 'is_asset',
        stock: 'is_asset',
        fund: 'is_asset',
        fundExchange: 'is_asset',
        fundOtc: 'is_asset',
        finance: 'is_asset',
        interbankReverseRepo: 'is_asset',
        exchangeReverseRepo: 'is_asset',
        protocolReverseRepo: 'is_asset',
        buyoutReverseRepo: 'is_asset',
        otherAsset:'is_asset',
        receivable:'is_asset',
        bankLendingOut: 'is_asset',
        depositOut: 'is_asset',
        settlement:'is_asset',
        assetLiquidation:'is_asset',
        cash: 'is_asset',

        interbankRepo: 'is_debt',
        exchangeRepo: 'is_debt',
        protocolRepo: 'is_debt',
        buyoutRepo: 'is_debt',
        bankLendingIn: 'is_debt',
        payable:'is_debt',
        liabilityLiquidation:'is_debt',
        otherLiability: 'is_debt',
        depositIn: 'is_debt',
        fee:'is_debt',

        tfLong:'is_futures',
        tfShort:'is_futures',
        ifLong:'is_futures',
        ifShort:'is_futures',

        fail:'is_proof',
        other: 'is_other'
    };
    function setAssetListByType(fbData){
        $.each(fbData, function(index, value){
            if (Object.prototype.toString.call(value) === '[object Array]') {
                var percentage = null, amount = 0;
                $.each(value, function (i, v) {
                    if(v.proportion != null) {
                        percentage += v.proportion;
                    }
                    amount += v.amount;
                    v.level_name = '';
                    v.items_name = '';
                    if (i == value.length - 1) {
                        v.last_node_children = true;
                    }
                    if (!(v.name && v.code) && v.bond_key_listed_market) {
                        var bondDetail = dataCenter.market.bondDetailMap[v.bond_key_listed_market];
                        if (bondDetail != null) {
                            v.name = bondDetail.short_name;
                            v.code = bondDetail.bond_id;
                        }
                    }
                });
                value.unshift({
                    level_name: assetTypeName[index],
                    second_val: '',
                    items_name: '',
                    asset_types: assetTypes[index],
                    total_type_count: value.length,
                    proportion: percentage,
                    amount: amount
                });
            } else {
                value = [];
            }
        });
    }
    function getAssetList(assets){
        var totalAssetsType = {
            tempAssetsList : [],
            percentage: null,
            amount: 0
        };
        $.each(assets, function(index, value){
            if(value != undefined) totalAssetsType.tempAssetsList.push(value);
        });
        if (totalAssetsType.tempAssetsList.length > 1) {
            $.each(totalAssetsType.tempAssetsList, function(index, value){
                if(value.proportion != null) {
                    totalAssetsType.percentage += value.proportion;
                }
                totalAssetsType.amount += value.amount ? value.amount : 0
            });
            totalAssetsType.tempAssetsList[0].proportion = (totalAssetsType.percentage != null)? totalAssetsType.percentage / 2 : null;
            totalAssetsType.tempAssetsList[0].amount = totalAssetsType.amount / 2;
        }else{
            totalAssetsType.tempAssetsList = [];
        }
        return totalAssetsType;
    }
    $scope.formatOverviewData = function (fbData) {
        $scope.overviewData = fbData;
        setAssetListByType(fbData);
        $scope.asset = [{ items_name: '资产', first_val: '', is_asset_upper: true }];
        $scope.debt = [{ items_name: '负债', first_val: '', is_debt_upper: true }];
        $scope.proof = [{ items_name: '待校对', first_val: '', is_proof_upper: true }];
        $scope.futures = [{ items_name: '期货', first_val: '', is_futures_upper: true }];
        $scope.other = [{ items_name: '其他', first_val: '', is_other_upper: true }];
        $scope.asset = $scope.asset.concat($scope.overviewData.deposit, $scope.overviewData.reserve, $scope.overviewData.margin,
            $scope.overviewData.bond, $scope.overviewData.finance, $scope.overviewData.stock, $scope.overviewData.fund,
            $scope.overviewData.fundExchange, $scope.overviewData.fundOtc, $scope.overviewData.otherAsset, $scope.overviewData.interbankReverseRepo,
            $scope.overviewData.exchangeReverseRepo, $scope.overviewData.protocolReverseRepo, $scope.overviewData.buyoutReverseRepo,
            $scope.overviewData.bankLendingOut, $scope.overviewData.depositOut, $scope.overviewData.receivable, $scope.overviewData.settlement,
            $scope.overviewData.assetLiquidation, $scope.overviewData.nstd, $scope.overviewData.cash
        );
        $scope.debt = $scope.debt.concat($scope.overviewData.interbankRepo, $scope.overviewData.exchangeRepo, $scope.overviewData.protocolRepo,
            $scope.overviewData.buyoutRepo, $scope.overviewData.payable, $scope.overviewData.fee, $scope.overviewData.liabilityLiquidation,
            $scope.overviewData.bankLendingIn, $scope.overviewData.depositIn, $scope.overviewData.otherLiability);
        $scope.proof = $scope.proof.concat($scope.overviewData.fail);
        $scope.futures = $scope.futures.concat($scope.overviewData.tfLong, $scope.overviewData.tfShort,$scope.overviewData.ifLong, $scope.overviewData.ifShort);
        $scope.other = $scope.other.concat($scope.overviewData.other);
        var gridData = getAssetList($scope.asset).tempAssetsList.concat(
            getAssetList($scope.debt).tempAssetsList,
            getAssetList($scope.futures).tempAssetsList,
            getAssetList($scope.proof).tempAssetsList,
            getAssetList($scope.other).tempAssetsList
        );
        return gridData;
    };
    $scope.reviewData = function (grid) {
        var assetIndexArray = [], debtIndexArray = [], proofIndexArray = [], futuresIndexArray = [],otherIndexArray = [],
            isAssetUpper = 0, isDebtUpper = 0, isProofUpper = 0, isFuturesUpper = 0, isOtherUpper = [],
            isAssetMax = 0, isDebtMax = 0, isProofMax = 0, isFuturesMax = 0, isOtherMax = 0;
        $.each(grid, function (index, value) {
            if (value.asset_types == 'is_asset') {
                assetIndexArray.push(index);
            } else if (value.asset_types == 'is_debt') {
                debtIndexArray.push(index);
            } else if (value.asset_types == 'is_proof') {
                proofIndexArray.push(index);
            } else if (value.asset_types == 'is_futures') {
                futuresIndexArray.push(index);
            } else if(value.asset_types == 'is_other') {
                otherIndexArray.push(index);
            }else if (value.is_asset_upper) {
                isAssetUpper = index;
            } else if (value.is_debt_upper) {
                isDebtUpper = index;
            } else if (value.is_proof_upper) {
                isProofUpper = index;
            } else if (value.is_futures_upper) {
                isFuturesUpper = index;
            } else if (value.is_other_upper) {
                isOtherUpper = index;
            }
        });

        isAssetMax = assetIndexArray[assetIndexArray.length - 1];
        isDebtMax = debtIndexArray[debtIndexArray.length - 1];
        isProofMax = proofIndexArray[proofIndexArray.length - 1];
        isFuturesMax = futuresIndexArray[futuresIndexArray.length - 1];
        isOtherMax = otherIndexArray[otherIndexArray.length - 1];

        function setLastNode(row, index) {
            if (isAssetMax != undefined) {
                if (isDebtMax != undefined) {
                    if (isFuturesMax != undefined) {
                        if (isProofMax != undefined) {
                            if(isOtherMax != undefined) {
                                if (index > isAssetMax && index < isDebtUpper || (index > isDebtMax && index < isFuturesUpper) || (index > isFuturesMax && index < isProofUpper) || (index > isProofMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isAssetMax && index < isDebtUpper || (index > isDebtMax && index < isFuturesUpper) || (index > isFuturesMax && index < isProofUpper) || (index > isProofMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        } else if (isProofMax == undefined) {
                            if(isOtherMax != undefined){
                                if (index > isAssetMax && index < isDebtUpper || (index > isDebtMax && index < isFuturesUpper) || (index > isFuturesMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isAssetMax && index < isDebtUpper || (index > isDebtMax && index < isFuturesUpper) || (index > isFuturesMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        }
                    } else if (isFuturesMax == undefined) {
                        if (isProofMax != undefined) {
                            if(isOtherMax != undefined){
                                if (index > isAssetMax && index < isDebtUpper || (index > isDebtMax && index < isProofUpper) || (index > isProofMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isAssetMax && index < isDebtUpper || (index > isDebtMax && index < isProofUpper) || (index > isProofMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        } else if (isProofMax == undefined) {
                            if(isOtherMax != undefined){
                                if (index > isAssetMax && index < isDebtUpper || (index > isDebtMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isAssetMax && index < isDebtUpper || (index > isDebtMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        }
                    }
                } else if (isDebtMax == undefined) {
                    if (isFuturesMax != undefined) {
                        if (isProofMax != undefined) {
                            if(isOtherMax != undefined){
                                if (index > isAssetMax && index < isFuturesUpper || (index > isFuturesMax && index < isProofUpper) || (index > isProofMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isAssetMax && index < isFuturesUpper || (index > isFuturesMax && index < isProofUpper) || (index > isProofMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        } else if (isProofMax == undefined) {
                            if(isOtherMax != undefined){
                                if (index > isAssetMax && index < isFuturesUpper || (index > isFuturesMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isAssetMax && index < isFuturesUpper || (index > isFuturesMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        }
                    } else if (isFuturesMax == undefined) {
                        if (isProofMax != undefined) {
                            if(isOtherMax != undefined){
                                if (index > isAssetMax && index < isProofUpper || (index > isProofMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isAssetMax && index < isProofUpper || (index > isProofMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        } else if (isProofMax == undefined) {
                            if(isOtherMax != undefined){
                                if (index > isAssetMax && index < isOtherUpper || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isAssetMax) {
                                    row.after_last_node = true;
                                }
                            }
                        }
                    }
                }
            } else if (isAssetMax == undefined) {
                if (isDebtMax != undefined) {
                    if (isFuturesMax != undefined) {
                        if (isProofMax != undefined) {
                            if(isOtherMax != undefined){
                                if (index > isDebtMax && index < isFuturesUpper || (index > isFuturesMax && index < isProofUpper) || (index > isProofMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isDebtMax && index < isFuturesUpper || (index > isFuturesMax && index < isProofUpper) || (index > isProofMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        } else if (isProofMax == undefined) {
                            if(isOtherMax != undefined){
                                if (index > isDebtMax && index < isFuturesUpper || (index > isFuturesMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isDebtMax && index < isFuturesUpper || (index > isFuturesMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        }
                    } else if (isFuturesMax == undefined) {
                        if (isProofMax != undefined) {
                            if(isOtherMax != undefined){
                                if (index > isDebtMax && index < isProofUpper || (index > isProofMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isDebtMax && index < isProofUpper || (index > isProofMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        } else if (isProofMax == undefined) {
                            if(isOtherMax != undefined){
                                if (index > isDebtMax && index < isOtherUpper || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isDebtMax) {
                                    row.after_last_node = true;
                                }
                            }
                        }
                    }
                } else if (isDebtMax == undefined) {
                    if (isFuturesMax != undefined) {
                        if (isProofMax != undefined) {
                            if(isOtherMax != undefined){
                                if (index > isFuturesMax && index < isProofUpper || (index > isProofMax && index < isOtherUpper) || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isFuturesMax && index < isProofUpper || (index > isProofMax)) {
                                    row.after_last_node = true;
                                }
                            }
                        } else if (isProofMax == undefined) {
                            if(isOtherMax != undefined){
                                if (index > isFuturesMax && index < isAssetUpper || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isFuturesMax) {
                                    row.after_last_node = true;
                                }
                            }
                        }
                    } else if (isFuturesMax == undefined) {
                        if (isProofMax != undefined) {
                            if(isOtherMax != undefined){
                                if (index > isProofMax && index < isOtherUpper || (index > isOtherMax)) {
                                    row.after_last_node = true;
                                }
                            }else if(isOtherMax == undefined){
                                if (index > isProofMax) {
                                    row.after_last_node = true;
                                }
                            }
                        }else if(isProofMax == undefined){
                            if(isOtherMax != undefined){
                                if (index > isOtherMax) {
                                    row.after_last_node = true;
                                }
                            }
                        }
                    }
                }
            }
            if (index == isAssetMax || index == isDebtMax || index == isProofMax || index == isFuturesMax || index == isOtherMax) {
                row.last_node_parent = true;
            }
        }
        function setRowTreeLevel(row) {
            if (row.hasOwnProperty('first_val') && !row.hasOwnProperty('second_val')) {
                row.$$treeLevel = 0;
            } else if (!row.hasOwnProperty('first_val') && row.hasOwnProperty('second_val')) {
                row.$$treeLevel = 1;
            }else{
                row.$$treeLevel = 2;
            }
        }
        $.each(grid, function (index, row) {
            setRowTreeLevel(row);
            setLastNode(row, index);

            if (row.volume != undefined) {
                row.volume = parseFloat(row.volume.toFixed(2));
            }
        });
    };

    var hideLoad = function() {
        $('#loadShadeDiv').modal('hide');
    };
    var errorFunc = function() {
        hideLoad();
        messageBox.error('总览数据加载失败！')
    };

    $scope.init = function () {
        if (winStatus.cur_account_list.length === 0) return;
        $scope.gridOptions.data = [];

        $('#loadShadeDiv').modal({backdrop: 'static', keyboard: false});

        positionsOverview.post({
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: $scope.accountSelectedDate
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var fbData = response.data;
                if (fbData != null) {
                    $scope.gridOptions.data = $scope.formatOverviewData(fbData);
                    $scope.reviewData($scope.gridOptions.data);
                } else {
                    messageBox.warn('总览中暂无数据！')
                }
                hideLoad();
            } else {
                errorFunc();
            }
        }, function failed() {
            errorFunc();
        });
    };
    $scope.$on('overviewAsset tab clicked', function () {
        $scope.init();
    });

    $scope.init();

    $scope.itemsNameFunc = function(row){
        if(row.entity.items_name == ''){
            if(row.entity.last_node_parent){
                if(row.treeNode.state == 'expanded'){
                    return 'view-max-tree';
                }
                if(row.treeNode.state == 'collapsed'){
                    return 'view-less-last-tree';
                }
                return 'view-max-tree';
            }else if(row.entity.after_last_node){
                return '';
            }else if(row.entity.level_name != ''){
                if(row.treeNode.state == 'expanded'){
                    return 'view-less-tree';
                }
                return 'view-all-tree';
            }else{
                return 'view-middle-tree';
            }
        }
    };
    $scope.levelNameFunc = function(row){
        if(row.entity.level_name == ''){
            if(row.entity.hasOwnProperty('last_node_children')){
                return 'view-nonodemax-tree';
            }
            return 'view-nonode-tree';
        }
    };

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
angular.module('ias.account').controller('stockCtrl', function ($scope, accountTable, filterParam, winStatus, $filter,
    stockPositionsPos, stockClientFilter, marketFilter, user, accountConstant, authorityControl) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        enableColumnResizing: true,
        multiSelect: false,
        showTreeExpandNoChildren: false,
        exporterOlderExcelCompatibility: true,
        rowTemplate: accountTable.getRowTemplate('positionRowTemplate'),
        columnDefs: accountTable.stockPositionColumnDef(),
        exporterFieldCallback: function(grid, row, col, value){
            if( col.name === 'stock_code' ){
                return '\t' + value;
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(marketFilter.accountStockFilter, 200);
        }
    };

    $scope.stockSelectFun = function (selected) {
        if (selected) {
            stockClientFilter.searchKey = selected.originalObject.stock_code;
        } else {
            stockClientFilter.searchKey = '';
        }
        $scope.gridApi.grid.refresh();
    };

    $scope.initData = function () {


        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        stockPositionsPos.post({
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: $scope.accountSelectedDate,
            include_ref_account: winStatus.refAccount.get()
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.gridOptions.data = data;
                var stock_list = [];
                data.forEach(function (row) {
                    var position = {};
                    position['stock_code'] = row.stock_code;
                    position['stock_name'] = row.stock_name;
                    position['pinyin'] = row.pinyin;
                    stock_list.push(position);
                });
                $scope.stockList = stock_list;
            }
        });
    };
    $scope.onExportData = function(){
        $scope.gridOptions.exporterCsvFilename =  $scope.getFileName('_股票_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.$on('stock tab clicked', function () {
        $scope.initData();
    });

    $scope.initData();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
angular.module('ias.account').controller('fundCtrl', function ($scope, accountTable, filterParam, winStatus, $filter, accountConstant,user,
                                                fundPositionsPos, fundClientFilter, marketFilter, authorityControl) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        enableColumnResizing: true,
        multiSelect: false,
        showTreeExpandNoChildren: false,
        exporterOlderExcelCompatibility: true,
        columnDefs: accountTable.fundPositionColumnDef(),
        exporterOlderExcelCompatibility: true,
        exporterFieldCallback: function(grid, row, col, value){
            if (col.name == 'fund_code'){
                return '\t' + value;
            } else if (col.name == 'unit_net'){
                return $filter('thousandthNum')($filter('toFixed4')(value));
            } else if (col.name == 'accum_net'){
                return $filter('columnNullValue')($filter('toFixed4')(value));
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(marketFilter.accountFundFilter, 200);
            $scope.gridApi.selection.on.rowSelectionChanged($scope, (row,event) => {
                // 债券仓位追踪
                $scope.$broadcast("fundBroadcast", row.entity);
            })
        }
    };

    $scope.fundSelectFun = function (selected) {
        if (selected) {
            fundClientFilter.searchKey = selected.originalObject.fund_code;
        } else {
            fundClientFilter.searchKey = '';
        }
        $scope.gridApi.grid.refresh();
    };

    $scope.initData = function () {

        if (winStatus.cur_account_list.length === 0) {
            return ;
        }
        fundPositionsPos.post({
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: $scope.accountSelectedDate,
            include_ref_account: winStatus.refAccount.get()
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.gridOptions.data = data;
                var fund_list = [];
                data.forEach(function (row) {
                    var position = {};
                    position['fund_code'] = row.fund_code;
                    position['fund_name'] = row.fund_name;
                    position['pinyin'] = row.pinyin;
                    fund_list.push(position);
                });
                $scope.fundList = fund_list;
            }
        });
    };

    $scope.onExportData = function(){
        $scope.gridOptions.exporterCsvFilename =  $scope.getFileName('_基金_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.$on('fund tab clicked', function () {
        $scope.initData();
    });

    $scope.initData();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
angular.module('ias.account').controller('depositCtrl', function ($scope, accountTable, filterParam, Trades, Trade, $filter, authorityControl,
    messageBox, gridService, user, winStatus, accountConstant, TradesGroup) {
    if ($scope.STATUS.IS_POSITION) {
        var columnNames = ['存款日期', '存款产品名称', '存款方向', '金额', '市值',
            '平均利率(%)', '利润', '到期日', '总应计利息', '对手行', '计息基准', '备注'];
    } else {
        var columnNames = ['存款日期', '存款产品名称', '存款方向', '净资金额', '返回金额',
            '平均利率(%)', '利润', '到期日', '总应计利息', '对手行', '录入人', '编辑时间', '计息基准', '备注', '编辑'];
    }
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action'],
        columnDefs: gridService.chooseColumeFunc(accountTable.depositColumnDef(), columnNames),
        exporterFieldCallback: function (grid, row, col, value) {
            if ($scope.STATUS.IS_POSITION && col.name == 'initial_amount' || col.name == 'asset') {
                return $filter('commafyConvert')($filter('absoluteAmount')(value));
            } else if (!$scope.STATUS.IS_POSITION && col.name == 'initial_amount') {
                return $filter('commafyConvert')(value);
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.delDepositBtnClicked = function (bond) {
        function confirmFun() {
            Trade.delete({
                type: 'deposit',
                account_id: bond.account_id,
                trade_id: bond.id,
                company_id: $scope.getCompanyId(bond.account_id)
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.editDeposit = function (bond) {
        $scope.$emit("edit deposit Event", bond);
    };

    $scope.onExportData = function (isTrade) {
        if (isTrade) {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_存款_');
        } else {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_存款_', $scope.accountSelectedDate);
        }

        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function () {

        if (winStatus.cur_account_list.length === 0) return;
        var date = null;
        if ($scope.STATUS.IS_POSITION) {
            date = $scope.accountSelectedDate || $filter('date')(new Date(), 'yyyy-MM-dd');
        }
        TradesGroup.post({
            type: 'deposit',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    }
    $scope.$on('deposit tab clicked', function () {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
})
angular.module('ias.account').controller('bankLendingCtrl', function ($scope, accountTable, filterParam, Trades, Trade, hcMarketData, gridService,
    $filter, messageBox, TradesGroup, accountConstant, user, authorityControl, winStatus) {
    if ($scope.STATUS.IS_POSITION) {
        var columnNames = ['拆借日期', '基金名称', '所在组合', '拆借方向', '净资金额', '返回金额',
            '平均利率(%)', '利润', '到期日', '总应计利息', '对手', '备注', '计息基准'];
    } else {
        var columnNames = ['拆借日期', '基金名称', '所在组合', '拆借方向', '净资金额', '返回金额',
            '平均利率(%)', '利润', '到期日', '总应计利息', '对手', '录入人', '编辑时间', '备注', '计息基准', '编辑'];
    }
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action'],
        columnDefs: gridService.chooseColumeFunc(accountTable.bankLendingColumnDef(), columnNames),
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'account_name') {
                return value + '\t';
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
    $scope.delBankLendingBtnClicked = function (bond) {
        function confirmFun() {
            Trade.delete({
                type: 'bank_lending',
                account_id: bond.account_id,
                trade_id: bond.id,
                company_id: $scope.getCompanyId(bond.account_id)
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.editBankLending = function (bond) {
        hcMarketData.bond = bond;
        $scope.$emit("edit bankLending Event");
    };

    $scope.onExportData = function (isTrade) {
        if (isTrade) {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_拆借_');
        } else {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_拆借_', $scope.accountSelectedDate);
        }
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function () {

        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        var date = null;
        if ($scope.STATUS.IS_POSITION) {
            date = $scope.accountSelectedDate || $filter('date')(new Date(), 'yyyy-MM-dd');
        }
        TradesGroup.post({
            type: 'bank_lending',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    }
    $scope.$on('bankLending tab clicked', function () {
        $scope.init();
    });

    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
})
angular.module('ias.account').controller('financeCtrl', function ($scope, accountTable, filterParam, Trade, hcMarketData, TradesGroup,
                                                   $filter,user, accountConstant, authorityControl, messageBox, winStatus, gridService) {
    if ($scope.STATUS.IS_POSITION) {
        var columnNames = ['理财日期', '账户名称', '所在组合', '收益类型', '金额', '平均利率(%)',
                            '利润', '到期日', '总应计利息', '对手', '计息基准', '备注'];
    } else {
        var columnNames = ['理财日期', '账户名称', '所在组合', '收益类型', '净资金额', '返回金额','平均利率(%)',
                            '利润', '到期日', '总应计利息', '对手', '录入人', '编辑时间', '计息基准', '备注', '编辑'];
    }

    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action'],
        columnDefs: gridService.chooseColumeFunc(accountTable.financeColumnDef(), columnNames),
        exporterFieldCallback: function (grid, row, col, value) {
            if($scope.STATUS.IS_POSITION && col.name == 'initial_amount'){
                return $filter('commafyConvert')($filter('absoluteAmount')(value));
            } else if (!$scope.STATUS.IS_POSITION && col.name == 'initial_amount') {
                return $filter('commafyConvert')(value);
            } else if (col.name == 'account_name'){
                return value + '\t';
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.delFinanceBtnClicked = function (bond) {
        function confirmFun() {
            Trade.delete({
                type: 'finance',
                account_id: bond.account_id,
                trade_id: bond.id,
                company_id: $scope.getCompanyId(bond.account_id)
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };



    //存款监听量
    $scope.editFinance = function (bond) {
        hcMarketData.bond = bond;
        $scope.$emit("edit finance Event");
    };
    //原先组合账户CTRL中有$on('export portfolio finance event'),全局无broadcast,暂时删除。
    $scope.onExportData = function(isTrade){
        if (isTrade) {
            $scope.gridOptions.exporterCsvFilename =   $scope.getFileName('_成交记录_理财_');
        } else {
            $scope.gridOptions.exporterCsvFilename =   $scope.getFileName('_理财_', $scope.accountSelectedDate);
        }

        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function () {

        if (winStatus.cur_account_list.length === 0) {
            return ;
        }
        var date = null;
        if ($scope.STATUS.IS_POSITION) {
            date = $scope.accountSelectedDate || $filter('date')(new Date(), 'yyyy-MM-dd');
        }
        TradesGroup.post({
            type: 'finance',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    }
    $scope.$on('finance tab clicked', function () {
        $scope.init();
    });

    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
})
angular.module('ias.account').controller('otherAssetCtrl', function($scope, accountTable, group_positions, filterParam,
                                                     winStatus, user, $filter, accountConstant, authorityControl) {
    $scope.gridOptions = {
        showColumnFooter: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterSuppressColumns: [],
        exporterOlderExcelCompatibility: true,
        columnDefs: accountTable.otherAssetColumnDef(),
        exporterFieldCallback: function (grid, row, col, value) {
            if ( col.name === 'asset') {
                value = $filter('thousandthNum')($filter('toFixed2')(value));
            } else if (col.name === 'proportion') {
                value = $filter('thousandthNum')($filter('toFixed4')(value));
            } else if (col.name === 'duration') {
                value = $filter('toFixed4')(value);
            }
            return value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.onExportData = function(){
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_其他_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function () {
        if (!winStatus.cur_account_list.length === 0) return;
        group_positions.post({
            account_group_id: accountConstant.group_id,
            asset_type: "other",
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            company_id: user.company_id,
            date: $scope.accountSelectedDate
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.gridOptions.data = data;
            }
        })
    }
    $scope.$on('other asset tab clicked', function () {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
angular.module('ias.account').controller('indexFuturesCtrl', function($scope, accountTable, group_positions, filterParam,
                                                       winStatus, user, $filter, accountConstant, authorityControl) {
    $scope.gridOptions = {
        showColumnFooter: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterSuppressColumns: [],
        exporterOlderExcelCompatibility: true,
        columnDefs: accountTable.futures_ColumnDef(),
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'offset' || col.name == 'fair_value' || col.name == 'volume' || col.name == 'contract_value' ||
                col.name == 'proportion' || col.name == 'contract_value'){
                value = $filter('thousandthNum')($filter('toFixed4')(value));
            }
            return value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.onExportData = function(){
        $scope.gridOptions.exporterCsvFilename =  $scope.getFileName('_股指期货_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function () {
        if (!winStatus.cur_account_list.length === 0) return;
        group_positions.post({
            account_group_id: accountConstant.group_id,
            asset_type: "if",
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: $scope.accountSelectedDate,
            include_ref_account: winStatus.is_account_now ? winStatus.refAccount.get() : null
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        })
    }
    $scope.$on('index futures tab clicked', function () {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
angular.module('ias.account').controller('treasuryFuturesCtrl', function($scope, accountTable, TFPositions, accountConstant, authorityControl,
                                                          filterParam, winStatus, user, $filter, group_positions, dataCenter) {
    $scope.gridOptions = {
        showColumnFooter: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterSuppressColumns: [],
        exporterOlderExcelCompatibility: true,
        columnDefs: [
            { field: 'code', displayName: '期货代码' },
            { field: 'name', displayName: '名称' },
            { field: 'posi_direction', displayName: '持仓方向', cellFilter: 'ftDirection' },
            { field: 'volume', displayName: '持仓量', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
            { field: 'position_price', displayName: '成本价格', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
            { field: 'last_close', displayName: '上一日结算价', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
            { field: 'close', displayName: '当日结算价', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
            { field: 'market_value', displayName: '持仓市值', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
            { field: 'today_pnl', displayName: '当日盈亏', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
            { field: 'accumulated_pnl', displayName: '累计盈亏', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
            { field: 'duration', displayName: '久期', cellFilter: 'toFixed4', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
            { field: 'dv01', displayName: 'DV01', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
            // { field: 'margin_rate', displayName: '保证金率(%)', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
        ],
        exporterFieldCallback: function (grid, row, col, value) {
            return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.onExportData = function(){
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_国债期货_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function () {
        if (!winStatus.cur_account_list.length === 0) return;
        var account_list_t = [];
        var account_list_p = [];
        $.each(winStatus.cur_account_list, function(index, account_id) {
            $.each(dataCenter.account.accountsData, function(index, account) {
                if (account.hasOwnProperty('id') && account.id == account_id) {
                    (account.source_type_position == 'trade'? account_list_t: account_list_p).push({
                            account_id: account_id,
                            company_id: account.agent_company_id || user.company_id
                    })
                }
            });
        });

        $scope.gridOptions.data = []
        if (account_list_t.length > 0) {
            TFPositions.post({
                account_list: account_list_t,
                date: $scope.accountSelectedDate,
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    $scope.gridOptions.data = $scope.gridOptions.data.concat(response.data);
                }
            })
        }
        if (account_list_p.length > 0) {
            group_positions.post({
                account_group_id: accountConstant.group_id,
                asset_type: "tf",
                account_list: account_list_p,
                company_id: user.company_id,
                date: $scope.accountSelectedDate

            }, function success(response) {
                if (response.code && response.code === '0000') {
                    $scope.gridOptions.data = $scope.gridOptions.data.concat(response.data);
                }
            })
        }
    }

    $scope.$on('treasury futures tab clicked', function () {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
angular.module('ias.account').controller('failedPositionCtrl', function($scope, accountTable, checkAssetReq, filterParam, winStatus, user, bondInfo) {
    $scope.gridOptions = {
        showColumnFooter: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        showTreeExpandNoChildren: true,
        exporterSuppressColumns: [],
        exporterOlderExcelCompatibility: true,
        columnDefs: accountTable.failedColumnDef(),
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.init = function() {
        if (winStatus.cur_account_list.length === 0) {
            return ;
        }
        checkAssetReq.get({
            account_id: winStatus.cur_account_list[0],
            company_id: winStatus.cur_agent_company_id || user.company_id,
            date: $scope.accountSelectedDate
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.gridOptions.data = data;
            }
        });
    }
    $scope.$on('failed positions tab clicked', function () {
        $scope.init();
    });
    $scope.init();

    $scope.checkPosition = function(position) {
        $scope.check_position.course_code = position.course_code;
        $scope.check_position.course_name = position.course_name;
        $scope.check_position.asset_type = position.asset_type;
        $scope.check_position.byCode = bondInfo.getBondBasic(position.asset_code);
        $scope.check_position.byName = bondInfo.getBondBasic(position.asset_name);
        $scope.check_position.checkedType = '2';

        $('#checkPositionDlg').modal('show');
    };

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
