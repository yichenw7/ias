import { getBondTrust, isExchange } from '../../helper/Bond'
import {
    calculRepoBondsAmount,
    hasPledgeBond
} from './helper'

angular.module('ias').controller('protocolRepoInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes,
    account,bond, hcMarketData, Calculator, winStatus, dealPage, accountTable, $timeout, exchangeBonds, accountUtils, user) {
    $scope.singleAccountData = {
        interbank_repo_to_net: 0,
        exchange_repo_to_net: 0,
        asset_net: "",
        cash_t_0: ""
    };
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFiltering: false,
        enableFullRowSelection: false,
        enableRowHeaderSelection: true,
        enableRowSelection: true,
        enableSelectAll: true,
        selectionRowHeaderWidth: 35,
        multiSelect: true,
        columnDefs: accountTable.inputInterBankRepoColumnDef(),
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                updateTotal();
            });
            gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                updateTotal();
            });
        }
    };
    $scope.reverseGridOptions = {
        data: [],
        enableColumnMenus: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        enableColumnResizing: true,
        multiSelect: false,
        columnDefs: accountTable.reverseInterBankRepoColumnDef(false),
        onRegisterApi: function (gridApi) {
            $scope.reverseGridApi = gridApi;
        }
    };
    $scope.directionGroup = [
        { label: '收', value: 1 },
        { label: '出', value: -1 }
    ];
    $scope.timePickerConfig = datetimePickerConfig;
    $scope.settleType = [
        { label: 'T+0', value: 0 },
        // { label: 'T+1', value: 1 }
    ];

    $scope.protocolRepoTrade = {};
    $scope.protocolRepoTrade.init = function () {
        this.repoId = '';
        this.isContinue = false;
        this.isEditMode = false;
        this.ratio = 0;
        this.isAlert = false;
        this.alertContent = '';
        this.direction = 1;
        this.initial_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        this.maturity_date = '';
        this.counterpartyAccount = '';
        this.accountId = filterParam.account_id;
        this.repoAmount = 0;
        this.term = '';
        this.repoRate = '';
        this.settlement_days = 0;
    };
    $scope.protocolRepoTrade.clearDates = function() {
        this.maturity_date = '';
        // this.initial_date = '';
        this.real_days = '';
        this.initial_settlement_date = '';
        this.maturity_settlement_date = '';
    };
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.protocol_repo;
    };
    $scope.checkInput = function () {
        $scope.protocolRepoTrade.isAlert = true;
        $scope.protocolRepoTrade.alertContent = '';
        if (accountUtils.isEmpty($scope.protocolRepoTrade.accountId)) {
            $scope.protocolRepoTrade.alertContent = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty($scope.protocolRepoTrade.term)) {
            $scope.protocolRepoTrade.alertContent = '请输入期限!';
            return false;
        }
        if ($scope.protocolRepoTrade.term > 1000) {
            $scope.protocolRepoTrade.alertContent = '期限超出范围!';
            return false;
        }
        if ($scope.protocolRepoTrade.repoRate === 0) {
            $scope.protocolRepoTrade.alertContent = '回购利率不能为0!';
            return false;
        }
        if (accountUtils.isEmpty($scope.protocolRepoTrade.repoRate)) {
            $scope.protocolRepoTrade.alertContent = '请输入回购利率!';
            return false;
        }
        if (accountUtils.isEmpty($scope.protocolRepoTrade.repoAmount)) {
            $scope.protocolRepoTrade.alertContent = '请选择需要回购的债券!';
            return false;
        }
        $scope.protocolRepoTrade.isAlert = false;
        return true;
    };
    $scope.updateExchangeBonds = function () {
        if ($scope.protocolRepoTrade.direction == 1) {
            $scope.protocolRepoTrade.disable_direction = true;
            $scope.gridOptions.data = [];
            if ($scope.protocolRepoTrade.accountId) {
                exchangeBonds.get({
                    account_id: $scope.protocolRepoTrade.accountId,
                    company_id: $scope.getCompanyId($scope.protocolRepoTrade.accountId),
                    date: $scope.protocolRepoTrade.initial_date
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        $scope.gridOptions.data = data;
                        $scope.protocolRepoTrade.disable_direction = false;
                    }
                }, function failed() {
                    $scope.protocolRepoTrade.disable_direction = false;
                });
            }
        }
    };

    $scope.getUseVolume = function (useVolume, availableVolume) {
        if (!accountUtils.isEmpty(useVolume)) {
            return useVolume;
        }
        return availableVolume;
    };

    $scope.handleInitDateChanged = function () {
        $scope.updateExchangeBonds();
        $scope.handleDateChanged();
    };

    $scope.handleDateChanged = function () {
        if (!$scope.protocolRepoTrade.term) {
            $scope.protocolRepoTrade.clearDates();
            return;
        }
        if ($scope.protocolRepoTrade.term > 1000) {
            $scope.protocolRepoTrade.isAlert = true;
            $scope.protocolRepoTrade.alertContent = '期限超出范围!';
            return;
        }

        Calculator.date({
            term: $scope.protocolRepoTrade.term,
            initialDate: $scope.protocolRepoTrade.initial_date,
            settlementDays: $scope.protocolRepoTrade.settlement_days
        }).then((data) => {
            $scope.protocolRepoTrade.maturity_date = data.maturity_date;
            $scope.protocolRepoTrade.initial_date = data.initial_date;
            $scope.protocolRepoTrade.real_days = data.real_days;
            $scope.protocolRepoTrade.initial_settlement_date = data.initial_settlement_date;
            $scope.protocolRepoTrade.maturity_settlement_date = data.maturity_settlement_date;
            $scope.$apply();
        });
        $scope.protocolRepoTrade.isAlert = false;
    };

    $scope.changeBtn = function (value) {
        if ($scope.protocolRepoTrade.isEditMode) {
            return;
        }
        $scope.protocolRepoTrade.repoAmount = 0;
        $scope.protocolRepoTrade.faceAmount = 0;
        $scope.gridApi.selection.clearSelectedRows();
        $scope.gridOptions.data = [];
        $scope.reverseGridOptions.data = [];
        $scope.updateExchangeBonds();
    };

    $scope.accountChanged = function (accountId) {
        account.get({
            account_id: accountId,
            company_id: $scope.getCompanyId(accountId)
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.singleAccountData = response.data;
            }
        });
        $scope.updateExchangeBonds();
    };

    function initData() {
        $scope.singleAccountData.interbank_repo_to_net = hcMarketData.assetMarketData.interbank_repo_to_net;
        $scope.singleAccountData.exchange_repo_to_net = hcMarketData.assetMarketData.exchange_repo_to_net;
        $scope.singleAccountData.asset_net = hcMarketData.assetMarketData.asset_net;
        $scope.protocolRepoTrade.init();
        if ($scope.gridApi) {
            $scope.gridApi.selection.clearSelectedRows();
        }
        $scope.updateExchangeBonds();
    }
    function updateSelectMode(bond) {
        var amount = bond.use_volume * bond.price;
        if (0 == amount) {
            $scope.gridApi.selection.unSelectRow(bond);
        } else {
            $scope.gridApi.selection.selectRow(bond);
        }
    }
    function updateTotal() {
        var pledge_bond_list = new Array();
        var select_list = $scope.gridApi ? $scope.gridApi.selection.getSelectedRows() : [];
        setAmounts(select_list);
    }

    $scope.getInitPrice = function (price, val_clean_price) {
        if (!accountUtils.isEmpty(price)) {
            return price;
        }

        // 协议式回购不需要大于100取100的逻辑
        return Math.floor(val_clean_price);
    };

    $scope.handleVolumnChanged = function (bond) {
        updateSelectMode(bond);
        updateTotal();
    };
    $scope.handleInverseVolumnChanged = function(row) {
        setAmounts($scope.reverseGridOptions.data);
    }
    $scope.handleBondSelected = function(selected) {
        $scope.protocolRepoTrade.bondErr = '';
        if (!selected) return;
        const bklm = selected.originalObject.bond_key_listed_market;
        const bondTrust = getBondTrust(selected.originalObject.bond_id);
        if (!isExchange(bklm)) {
            $scope.protocolRepoTrade.bondErr = '请选择交易所债券！'
            return;
        }
        if (hasPledgeBond($scope.reverseGridOptions.data, bklm)) {
            $scope.$broadcast('angucomplete-alt:clearInput', 'protocolRepoBondSearchBox');
            return;
        }
        bond.get({
            bond_key_listed_market: bklm
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data
                data.use_volume = 0;
                data.price = 0;
                data.enterprise_type = data.issuer_type;
                $scope.reverseGridOptions.data.push(data);
                $scope.$broadcast('angucomplete-alt:clearInput', 'protocolRepoBondSearchBox');
            }
        });
    };
    $scope.handleBondDeleted = function(row) {
        const i = $scope.reverseGridOptions.data.indexOf(row);
        if (i > -1) {
            $scope.reverseGridOptions.data.splice(i, 1);
        }
        setAmounts($scope.reverseGridOptions.data);
    };

    function getPledgeBonds() {
        var select_list = [];
        if ($scope.protocolRepoTrade.direction == 1) {
            select_list = $scope.gridApi ? $scope.gridApi.selection.getSelectedRows() : [];
        } else {
            select_list = $scope.reverseGridOptions.data;
        }

        var pledge_bond_list = new Array();
        $.each(select_list, function (index, row) {
            pledge_bond_list.push({
                bond_key_listed_market: row.bond_key_listed_market,
                pledge_volume: row.use_volume,
                pledge_price: row.price
            });
        });
        return pledge_bond_list;
    }

    function setAmounts(bonds) {
        const amounts = calculRepoBondsAmount(bonds);
        $scope.protocolRepoTrade.repoAmount = amounts.repoAmount;
        $scope.protocolRepoTrade.faceAmount = amounts.faceAmount;
    }

    $scope.$on("init protocol_repo dlg", function () {
        initData();
    });
    $scope.$on("dealInput-confirm", function () {
        if (dealPage.protocol_repo != selectTypes.dealInput) return;
        if (!$scope.checkInput()) return;

        var pledge_bond_list = getPledgeBonds();

        if (!$scope.protocolRepoTrade.isEditMode || ($scope.protocolRepoTrade.isEditMode && winStatus.protocol_repo_continue_flag)) {
            $scope.$emit('deal trade add', {
                type: 'protocol_repo',
                account_id: $scope.protocolRepoTrade.accountId,
                company_id: $scope.getCompanyId($scope.protocolRepoTrade.accountId),
                trade_list: [{
                    rollover_repo_id: winStatus.protocol_repo_continue_flag ? $scope.protocolRepoTrade.repoId : null,
                    term: $scope.protocolRepoTrade.term.toString() + "D",
                    direction: $scope.protocolRepoTrade.direction,
                    repo_rate: $scope.protocolRepoTrade.repoRate / 100,
                    initial_date: $scope.protocolRepoTrade.initial_date,
                    fund: parseFloat($scope.protocolRepoTrade.repoAmount),
                    counter_party_account: $scope.protocolRepoTrade.counterpartyAccount,
                    comment: $scope.protocolRepoTrade.comment,
                    pledge_bond_list: pledge_bond_list,
                    user: user.name,
                    manager: user.id
                }]
            });
        } else {
            $scope.$emit('deal trade update', {
                type: 'protocol_repo',
                account_id: $scope.protocolRepoTrade.accountId,
                trade_id: $scope.protocolRepoTrade.repoId,
                company_id: $scope.getCompanyId($scope.protocolRepoTrade.accountId),
                trade: {
                    term: $scope.protocolRepoTrade.term.toString() + "D",
                    direction: $scope.protocolRepoTrade.direction,
                    repo_rate: $scope.protocolRepoTrade.repoRate / 100,
                    initial_date: $scope.protocolRepoTrade.initial_date,
                    fund: parseFloat($scope.protocolRepoTrade.repoAmount),
                    pledge_bond_list: pledge_bond_list,
                    counter_party_account: $scope.protocolRepoTrade.counterpartyAccount,
                    comment: $scope.protocolRepoTrade.comment,
                    user: user.name,
                    manager: user.id
                }
            });
        }

        winStatus.protocol_repo_continue_flag = false;
        $scope.protocolRepoTrade.isContinue = winStatus.protocol_repo_continue_flag;

        initData();
    });
    $scope.$on("show protocolRepoDlg", function () {
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        selectTypes.dealInput = dealPage.protocol_repo;

        var key_list = [];
        for (var i in bond.pledge_bond_list) {
            key_list.push(bond.pledge_bond_list[i].bond_key_listed_market);
        }
        $scope.protocolRepoTrade.isAlert = false;
        $scope.protocolRepoTrade.alertContent = '';
        $scope.protocolRepoTrade.term = bond.days;//期限
        $scope.protocolRepoTrade.maturity_date = '';
        $scope.protocolRepoTrade.repoRate = bond.repo_rate * 100;
        $scope.protocolRepoTrade.accountId = bond.account_id;
        if (winStatus.protocol_repo_continue_flag) {
            $scope.protocolRepoTrade.initial_date = $filter('date')(new Date(), 'yyyy-MM-dd');
            // $scope.handleDateChanged();
        } else {
            $scope.protocolRepoTrade.initial_date = bond.initial_date;
            $scope.protocolRepoTrade.maturity_date = bond.maturity_date;//到期日
        }

        $scope.protocolRepoTrade.bond_code = bond.bond_code;
        $scope.protocolRepoTrade.short_name = bond.short_name;
        $scope.protocolRepoTrade.isEditMode = true;
        $scope.protocolRepoTrade.isContinue = winStatus.protocol_repo_continue_flag;
        $scope.protocolRepoTrade.direction = bond.direction;//方向
        $scope.protocolRepoTrade.counterpartyAccount = bond.counter_party_account;//对手账户
        $scope.protocolRepoTrade.repoId = bond.id;
        $scope.protocolRepoTrade.settlement_days = 0;
        $scope.singleAccountData.cash_t_0 = hcMarketData.assetMarketData.cash_t_0;
        $scope.singleAccountData.asset_net = hcMarketData.assetMarketData.asset_net;
        $scope.singleAccountData.interbank_repo_to_net = hcMarketData.assetMarketData.interbank_repo_to_net;
        $scope.singleAccountData.exchange_repo_to_net = hcMarketData.assetMarketData.exchange_repo_to_net;
        dealPage.isShowApply = false;//试算

        if (-1 == $scope.protocolRepoTrade.direction) {
            const pledge_list = bond.pledge_bond_list.map(pledge => {
                return {
                    trust: bond.trust,
                    bond_id: pledge.bond_code,
                    short_name: pledge.short_name,
                    bond_key_listed_market: pledge.bond_key_listed_market,
                    use_volume: pledge.pledge_volume,
                    price: pledge.pledge_price,
                    val_clean_price: pledge.val_clean_price,
                    bond_type: pledge.bond_type,
                    enterprise_type: pledge.enterprise_type,
                    issuer_rating_current: pledge.issuer_rating_current,
                    issuer_rating_institution_name: pledge.issuer_rating_institution_name,
                }
            })
            $scope.reverseGridOptions.data = pledge_list;
            $scope.handleDateChanged();
            setAmounts(pledge_list);
            return;
        }
        // 正回购，借钱，券肯定是持仓券
        exchangeBonds.get({
            account_id: filterParam.account_id,
            company_id: $scope.getCompanyId(filterParam.account_id)
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                if (undefined == data || 0 == data.length) {
                    return;
                }

                var data_key_list = [];
                for (var i in data) {
                    data_key_list.push(data[i].bond_key_listed_market);
                }
                // 修改列表数据，把这笔回购的债券加回去
                jQuery.each(bond.pledge_bond_list, function (i, value) {
                    var index = data_key_list.indexOf(value.bond_key_listed_market);
                    if (index > -1) {
                        // 回购没用完，只需修改可用量
                        var old_volume = data[index].pledge_available_volume;
                        if ($scope.protocolRepoTrade.maturity_date >= $filter('date')(new Date(), 'yyyy-MM-dd')) {
                            data[index].pledge_available_volume = old_volume + value.pledge_volume;
                        }
                        data[index].use_volume = value.pledge_volume;
                        data[index].price = value.pledge_price;
                        data[index].enterprise_type = value.enterprise_type;
                        data[index].issuer_rating_current = value.issuer_rating;
                        data[index].issuer_rating_institution_name = value.issuer_rating_institution_name;
                    } else {
                        // 回购用完了，加一条新的
                        var row = {
                            bond_code: value.bond_code,
                            short_name: value.short_name,
                            bond_key_listed_market: value.bond_key_listed_market,
                            pledge_available_volume: value.pledge_volume,
                            use_volume: value.pledge_volume,
                            price: value.pledge_price,
                            pledged_maturity_volume: 0,     // 到期量如果不为0，就不会被过滤掉，没出现的到期量一定是0
                            val_clean_price: value.val_clean_price,
                            bond_type: value.bond_type,
                            enterprise_type: value.enterprise_type,
                            issuer_rating_current: value.issuer_rating_current,
                            issuer_rating_institution_name: value.issuer_rating_institution_name,
                        };
                        data.push(row);
                    }
                });
                $scope.gridOptions.data = angular.copy(data);
                // 这一笔回购的质押券全部选中
                jQuery.each($scope.gridOptions.data, function (i, value) {
                    var index = key_list.indexOf(value.bond_key_listed_market);
                    if (index > -1) {
                        $timeout(function () {
                            if ($scope.gridApi) {
                                $scope.gridApi.selection.selectRow(value);
                            }
                        }, 0);
                    }
                });
                updateTotal();
                $scope.handleDateChanged();
            }
        });
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});