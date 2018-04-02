import { getBondTrust, isInterbank } from '../../helper/Bond'
import {
    calculRepoBondsAmount,
    hasPledgeBond
} from './helper'

angular.module('ias.account').controller('bankRepoInputCtrl', function ($scope, $timeout, $filter, datetimePickerConfig, filterParam, accountConstant, selectTypes, authorityControl,
    account, dataCenter, hcMarketData, Calculator, dealPage, accountTable, interBankPledgedBonds, accountUtils, bond, user, pledgedBonds) {
    $scope.pledgedBonds = pledgedBonds;
    $scope.timePickerConfig = datetimePickerConfig;
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.bank_repo;
    };
    $scope.directionGroup = [
        { label: '正', value: 1 },
        { label: '逆', value: -1 }
    ];
    $scope.settleType = [
        { label: 'T+0', value: 0 },
        // { label: 'T+1', value: 1 }
    ];
    $scope.sourceGroup = [
        { label: '上清', value: 0, num: 0, sum: 0 },
        { label: '中债', value: 1, num: 0, sum: 0 },
    ];

    $scope.schGridOptions = {
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
            $scope.schGridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.sourceGroup[0].num = $scope.schGridApi.selection.getSelectedRows().length;
                updateTotal();
            });
            gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                $scope.sourceGroup[0].num = $scope.schGridApi.selection.getSelectedRows().length;
                updateTotal();
            });
        }
    };

    $scope.cdcGridOptions = {
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
            $scope.cdcGridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.sourceGroup[1].num = $scope.cdcGridApi.selection.getSelectedRows().length;
                updateTotal();
            });
            gridApi.selection.on.rowSelectionChangedBatch($scope, function (row) {
                $scope.sourceGroup[1].num = $scope.cdcGridApi.selection.getSelectedRows().length;
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
        columnDefs: accountTable.reverseInterBankRepoColumnDef(true),
        onRegisterApi: function (gridApi) {
            $scope.reverseGridApi = gridApi;
        }
    };

    $scope.trade = {};
    $scope.trade.init = function () {
        this.account_id = filterParam.account_id;
        this.initial_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        this.direction = 1;
        this.counter_party_account = '';
        this.counter_party_trader = '';
        this.term = undefined;
        this.repo_rate = undefined;
        this.trader = '';
        this.repo_amount = '';
        this.fund = '';
        this.comment = '';
        this.pledge_bond_list = [];
        this.in_edit_mode = false;
        this.data_source = 0;
        this.show_alert = false;
        this.alert_content = '';
        this.disable_direction = false;
        this.settlement_days = 0;
    };
    $scope.trade.checkInput = function () {
        this.show_alert = true;
        this.alert_content = '';
        if (accountUtils.isEmpty(this.account_id)) {
            this.alert_content = '请选择账户!';
            return false;
        }
        if (!this.term) {
            this.alert_content = '请输入期限!';
            return false;
        }
        if (this.term > 1000) {
            this.alert_content = '期限超出范围!';
            return false;
        }
        if (!this.repo_rate) {
            this.alert_content = '请输入回购利率!';
            return false;
        }
        if (accountUtils.isEmpty(this.repo_amount)) {
            this.alert_content = '请选择需要回购的债券!';
            return false;
        }
        if (this.direction == -1 && $scope.reverseGridOptions.data.length === 0) {
            this.alert_content = '请选择需要逆回购的债券!';
            return false;
        }
        this.show_alert = false;
        return true;
    };

    $scope.bank_repos = {};
    $scope.bank_repos.init = function () {
        this.maturity_date = '';
        this.initial_date = '';
        this.real_days = '';
        this.initial_settlement_date = '';
        this.maturity_settlement_date = '';
    };
    $scope.bank_repos.update = function () {
        var self = this;
        Calculator.date({
            term: $scope.trade.term,
            initialDate: $scope.trade.initial_date,
            settlementDays: $scope.trade.settlement_days,
        }).then((data) => {
            self.maturity_date = data.maturity_date;
            self.initial_date = data.initial_date;
            self.real_days = data.real_days;
            self.initial_settlement_date = data.initial_settlement_date;
            self.maturity_settlement_date = data.maturity_settlement_date;
            $scope.$apply();
        });
    };

    $scope.singleAccountData = {};
    $scope.singleAccountData.init = function () {
        this.interbank_repo_to_net = 0;
        this.exchange_repo_to_net = 0;
        this.asset_net = "";
        this.cash_t_0 = "";
    };
    $scope.singleAccountData.getDataByAccountId = function (id) {
        var self = this;
        self.init();
        account.get({
            account_id: id,
            company_id: $scope.getCompanyId(id)
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                self.interbank_repo_to_net = data.interbank_repo_to_net;
                self.exchange_repo_to_net = data.exchange_repo_to_net;
                self.asset_net = data.asset_net;
                self.cash_t_0 = data.cash_t_0;
            }
        });
    };

    function updateTotal() {
        var select_list = new Array();
        if (0 == $scope.trade.data_source) {
            select_list = $scope.schGridApi.selection.getSelectedRows();
        } else if (1 == $scope.trade.data_source) {
            select_list = $scope.cdcGridApi.selection.getSelectedRows();
        }
        const amounts = calculRepoBondsAmount(select_list);
        $scope.trade.repo_amount = amounts.repoAmount;
        $scope.trade.face_amount = amounts.faceAmount;
    }

    function isSameTrust(pledges, bondTrust) {
        if (pledges.length === 0) return true;
        return pledges[0].trust === bondTrust;
    }

    function updateSelectMode(bond) {
        var amount = bond.use_volume * bond.price;
        if (0 == amount) {
            if (0 == $scope.trade.data_source) {
                $scope.schGridApi.selection.unSelectRow(bond);
            } else if (1 == $scope.trade.data_source) {
                $scope.cdcGridApi.selection.unSelectRow(bond);
            }
        } else {
            if (0 == $scope.trade.data_source) {
                $scope.schGridApi.selection.selectRow(bond);
            } else if (1 == $scope.trade.data_source) {
                $scope.cdcGridApi.selection.selectRow(bond);
            }
        }
    }
    $scope.getUseVolume = function (use_volume, pledge_available_volume) {
        if (!accountUtils.isEmpty(use_volume)) {
            return use_volume;
        }
        return pledge_available_volume;
    };

    $scope.changeDataSource = function (value) {
        if (0 == value) {
            // 当前是上清，清除中债
            $scope.sourceGroup[1].num = 0;
            $scope.cdcGridApi.selection.clearSelectedRows();
            $scope.trade.repo_amount = 0;
            $scope.trade.face_amount = 0;
        } else if (1 == value) {
            $scope.sourceGroup[0].num = 0;
            $scope.schGridApi.selection.clearSelectedRows();
            $scope.trade.repo_amount = 0;
            $scope.trade.face_amount = 0;
        }
    };

    $scope.getInitPrice = function (price, val_clean_price) {
        if (!accountUtils.isEmpty(price)) {
            return price;
        }
        if (val_clean_price > 100) {
            return 100;
        } else {
            return Math.floor(val_clean_price);
        }
    };

    $scope.updateDataByAccountId = function (account_id) {
        $scope.trade.disable_direction = true;
        if (account_id) {
            $scope.schGridOptions.data = [];
            $scope.cdcGridOptions.data = [];
            interBankPledgedBonds.post({
                account_group_id: accountConstant.group_id,
                company_id: $scope.getCompanyId(filterParam.account_id),
                account_list: authorityControl.getAccountGroupMember([account_id]),
                date: $scope.trade.initial_date
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var bonds = response.data;
                    if (undefined != bonds.sch) {
                        $scope.schGridOptions.data = angular.copy(bonds.sch);
                        $scope.sourceGroup[0].sum = $scope.schGridOptions.data.length;
                    }
                    if (undefined != bonds.cdc) {
                        $scope.cdcGridOptions.data = angular.copy(bonds.cdc);
                        $scope.sourceGroup[1].sum = $scope.cdcGridOptions.data.length;
                    }
                    $scope.trade.disable_direction = false;
                }
            }, function failed() {
                $scope.trade.disable_direction = false;
            });
        }
        $scope.sourceGroup[0].num = 0;
        $scope.sourceGroup[1].num = 0;
        if ($scope.schGridApi) {
            $scope.schGridApi.selection.clearSelectedRows();
        }
        if ($scope.cdcGridApi) {
            $scope.cdcGridApi.selection.clearSelectedRows();
        }
    };


    $scope.handleInverseVolumnChanged = function(row) {
        const rows = $scope.reverseGridOptions.data;
        const amounts = calculRepoBondsAmount(rows);
        $scope.trade.repo_amount = amounts.repoAmount;
        $scope.trade.face_amount = amounts.faceAmount;
    }
    $scope.handleVolumnChanged = function (bond) {
        updateSelectMode(bond);
        updateTotal();
    };
    $scope.handleBondDeleted = function(row) {
        const i = $scope.reverseGridOptions.data.indexOf(row);
        if (i > -1) {
            $scope.reverseGridOptions.data.splice(i, 1);
        }
        const amounts = calculRepoBondsAmount($scope.reverseGridOptions.data);
        $scope.trade.repo_amount = amounts.repoAmount;
        $scope.trade.face_amount = amounts.faceAmount;
    };
    $scope.handleDirectionChanged = function () {
        if ($scope.trade.in_edit_mode) {
            return;
        }
        $scope.trade.repo_amount = 0;
        $scope.trade.face_amount = 0;
        $scope.schGridApi.selection.clearSelectedRows();
        $scope.cdcGridApi.selection.clearSelectedRows();
        $scope.schGridOptions.data = [];
        $scope.cdcGridOptions.data = [];
        $scope.reverseGridOptions.data = [];
        $scope.sourceGroup[0].num = 0;
        $scope.sourceGroup[1].num = 0;
        if (1 == $scope.trade.direction) {
            $scope.updateDataByAccountId($scope.trade.account_id);
            if ($scope.schGridOptions.columnDefs.length < 11) {
                var freezeTemplate = '<button ng-if="0 != row.entity.pledged_maturity_volume" class="btn-sm btn-bg-color action-btn" style="height:20px; margin-top:5px" type="button">解冻</button>';
                $scope.schGridOptions.columnDefs.splice(3, 0, { field: 'pledged_maturity_volume', displayName: '今日到期量', width: '80', cellClass: 'tbody-font' });
                $scope.cdcGridOptions.columnDefs.splice(3, 0, { field: 'pledged_maturity_volume', displayName: '今日到期量', width: '80', cellClass: 'tbody-font' });
            }
        }
    };
    $scope.handleAccountChange = function (account_id) {
        if ($scope.trade.direction == 1) {
            $scope.sourceGroup[0].num = 0;
            $scope.sourceGroup[1].num = 0;
            $scope.updateDataByAccountId(account_id);
            $scope.singleAccountData.getDataByAccountId(account_id);
        }
    };
    $scope.handleInitDateChange = function (term, initial_date) {
        if ($scope.trade.direction == 1) {
            $scope.updateDataByAccountId($scope.trade.account_id);
        }
        $scope.handleDateChanged(term, initial_date);
    };
    $scope.handleBondSelected = function(selected) {
        $scope.trade.bondErr = '';
        if (!selected) return;
        const bklm = selected.originalObject.bond_key_listed_market;
        const bondTrust = getBondTrust(selected.originalObject.bond_id);
        if (!isInterbank(bklm)) {
            $scope.trade.bondErr = '请选择银行间债券！'
            return;
        }
        if (!isSameTrust($scope.reverseGridOptions.data, bondTrust)) {
            $scope.trade.bondErr = '与已选择的债券托管机构不同！'
            return;
        }
        if (hasPledgeBond($scope.reverseGridOptions.data, bklm)) {
            $scope.$broadcast('angucomplete-alt:clearInput', 'bankRepoBondSearchBox');
            return;
        }
        bond.get({
            bond_key_listed_market: bklm,
            date: $scope.trade.initial_date,
            valuation: true,
        }, function success(response) {
            if (response.code && response.code === '0000') {
                response.data.trust = getBondTrust(response.data.bond_id);
                response.data.price = 0;
                response.data.use_volume = 0
                response.data.enterprise_type = response.data.issuer_type;
                $scope.reverseGridOptions.data.push(response.data);
                $scope.$broadcast('angucomplete-alt:clearInput', 'bankRepoBondSearchBox');
            }
        });
    };
    $scope.handleDateChanged = function () {
        if ($scope.trade.term == null) {
            $scope.bank_repos.init();
            return;
        }

        $scope.bank_repos.update();
        $scope.trade.show_alert = false;
    };

    function init_data() {
        pledgedBonds.fromFilter = false;

        $scope.trade.init();
        $scope.bank_repos.init();

        $scope.updateDataByAccountId(filterParam.account_id);

        $scope.singleAccountData.cash_t_0 = hcMarketData.assetMarketData.cash_t_0;
        $scope.singleAccountData.asset_net = hcMarketData.assetMarketData.asset_net;
        $scope.singleAccountData.interbank_repo_to_net = hcMarketData.assetMarketData.interbank_repo_to_net;
        $scope.singleAccountData.exchange_repo_to_net = hcMarketData.assetMarketData.exchange_repo_to_net;
    }

    function getPledgeBonds() {
        var select_list = [];
        if ($scope.trade.direction == 1) {
            if (0 == $scope.trade.data_source) {
                select_list = $scope.schGridApi ? $scope.schGridApi.selection.getSelectedRows() : [];
            } else if (1 == $scope.trade.data_source) {
                select_list = $scope.cdcGridApi ? $scope.cdcGridApi.selection.getSelectedRows() : [];
            }
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

    function getDataSource() {
        if ($scope.trade.direction == 1) {
            return $scope.trade.data_source == 0 ? 'sch': 'cdc';
        } else {
            return $scope.reverseGridOptions.data[0].trust;
        }
    }

    function updateDataFromBondsFilter(data) {
        var api, dataSrc;
        if ($scope.trade.data_source === 0) {
            dataSrc = $scope.schGridOptions.data;
            api = $scope.schGridApi;
        } else {
            dataSrc = $scope.cdcGridOptions.data;
            api = $scope.cdcGridApi;
        }

        dataSrc.forEach(itemSrc => {
            var found = data.find(item => item.bond_key_listed_market === itemSrc.bond_key_listed_market)
            if (found && found.auto_complete_info.pledge_volume > 0) {
                itemSrc.use_volume = found.auto_complete_info.pledge_volume;
                itemSrc.price = found.auto_complete_info.pledge_price;
                api.selection.selectRow(itemSrc);
            }
        })

        $timeout(function() {
            updateTotal();
            $scope.bank_repos.update();
        });
    }

    $scope.$watch(
        function () { return pledgedBonds.fromFilter; },
        function (newValue, oldValue) {
            if (newValue === oldValue) return;
            if (pledgedBonds.data.length === 0) return;
            if (pledgedBonds.fromFilter) {
                if ($scope.trade.initial_date !== pledgedBonds.params.date
                    || $scope.trade.account_id !== pledgedBonds.params.account_list[0].account_id) {
                    $scope.trade.account_id = pledgedBonds.params.account_list[0].account_id;
                    $scope.trade.initial_date = pledgedBonds.params.date;
                    $scope.handleInitDateChange();
                }
                $scope.trade.data_source = pledgedBonds.params.auto_complete_rule.filter_params.trust.value === 'sch' ? 0 : 1;
                $scope.changeDataSource($scope.trade.data_source);
                updateDataFromBondsFilter(pledgedBonds.data);
            }
        }
    );

    $scope.clearFilter = function() {
        pledgedBonds.fromFilter = false;
        $scope.updateDataByAccountId($scope.trade.account_id);
    };

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.bank_repo != selectTypes.dealInput)  return;
        if (!$scope.trade.checkInput()) return;

        var params = {
            term: $scope.trade.term.toString() + "D",
            direction: $scope.trade.direction,
            repo_rate: parseFloat($scope.trade.repo_rate) / 100,
            initial_date: $scope.trade.initial_date,
            fund: parseFloat($scope.trade.repo_amount),
            counter_party_account: $scope.trade.counter_party_account,
            counter_party_trader: $scope.trade.counter_party_trader,
            comment: $scope.trade.comment,
            trader: $scope.trade.trader,
            pledge_bond_list: getPledgeBonds(),
            trust: getDataSource(),
            user: user.name,
            manager: user.id
        }
        if (hcMarketData.showBtnList) {
            $scope.$emit('deal trade add', {
                type: 'interbank_repo',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_list: [params]
            });
        } else {
            $scope.$emit('deal trade update', {
                type: 'interbank_repo',
                account_id: $scope.trade.account_id,
                trade_id: $scope.trade.repo_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade: params
            });
        }

        init_data();
    });
    $scope.$on("show bankRepoDlg", function () {
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        selectTypes.dealInput = dealPage.bank_repo;

        var key_list = [];
        for (var i in bond.pledge_bond_list) {
            key_list.push(bond.pledge_bond_list[i].bond_key_listed_market);
        }

        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.trade.settlement_days = 0;
        $scope.trade.initial_date = bond.initial_date;//发生时间
        $scope.trade.account_id = bond.account_id;
        $scope.trade.in_edit_mode = true;
        $scope.trade.direction = bond.direction;//方向
        $scope.bank_repos.maturity_date = bond.maturity_date;//到期日
        $scope.trade.counter_party_account = bond.counter_party_account;//对手账户
        $scope.trade.counter_party_trader = bond.counter_party_trader;
        $scope.trade.trader = bond.trader;
        $scope.trade.term = bond.days;//期限
        $scope.trade.repo_rate = bond.repo_rate * 100;
        $scope.trade.repo_id = bond.id;
        $scope.singleAccountData.cash_t_0 = hcMarketData.assetMarketData.cash_t_0;
        $scope.singleAccountData.asset_net = hcMarketData.assetMarketData.asset_net;
        $scope.trade.fund = bond['amount'] ? bond.amount : null;
        $scope.singleAccountData.interbank_repo_to_net = hcMarketData.assetMarketData.interbank_repo_to_net;
        $scope.singleAccountData.exchange_repo_to_net = hcMarketData.assetMarketData.exchange_repo_to_net;
        $scope.trade.comment = bond.comment;//备注
        dealPage.isShowApply = false;//试算
        if (-1 == $scope.trade.direction) {
            var pledge_list = bond.pledge_bond_list.map(pledge => {
                return {
                    trust: bond.trust,
                    bond_id: pledge.bond_code,
                    short_name: pledge.short_name,
                    bond_key_listed_market: pledge.bond_key_listed_market,
                    // pledge_available_volume: pledge.pledge_volume,
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
            const amounts = calculRepoBondsAmount(pledge_list);
            $scope.trade.repo_amount = amounts.repoAmount;
            $scope.trade.face_amount = amounts.faceAmount;
            return;
        }

        if (bond.trust == 'sch') {
            $scope.trade.data_source = 0;
        } else if (bond.trust == 'cdc') {
            $scope.trade.data_source = 1;
        }
        // 正回购，借钱，券肯定是持仓券
        $scope.sourceGroup[0].num = 0;
        $scope.sourceGroup[1].num = 0;
        $scope.schGridOptions.data = [];
        $scope.cdcGridOptions.data = [];
        interBankPledgedBonds.post({
            account_group_id: accountConstant.group_id,
            company_id: $scope.getCompanyId(filterParam.account_id),
            account_list: authorityControl.getAccountGroupMember([bond.account_id]),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                if (null == data || 0 == data.length) {
                    return;
                }
                $scope.schGridOptions.data = data.sch;
                $scope.sourceGroup[0].sum = $scope.schGridOptions.data.length;
                $scope.cdcGridOptions.data = data.cdc;
                $scope.sourceGroup[1].sum = $scope.cdcGridOptions.data.length;
                var edit_data = [];
                if (bond.trust == 'sch') {
                    edit_data = data.sch;
                } else if (bond.trust == 'cdc') {
                    edit_data = data.cdc;
                }

                var data_key_list = [];
                for (var i in edit_data) {
                    data_key_list.push(edit_data[i].bond_key_listed_market);
                }
                // 修改列表数据，把这笔回购的债券加回去
                jQuery.each(bond.pledge_bond_list, function (i, value) {
                    var index = data_key_list.indexOf(value.bond_key_listed_market);
                    if (index > -1) {
                        // 回购没用完，只需修改可用量
                        var old_volume = edit_data[index].pledge_available_volume;
                        if ($scope.bank_repos.maturity_date >= $filter('date')(new Date(), 'yyyy-MM-dd')) {
                            edit_data[index].pledge_available_volume = old_volume + value.pledge_volume;
                        }
                        edit_data[index].use_volume = value.pledge_volume;
                        edit_data[index].price = value.pledge_price;
                    } else {
                        edit_data.push({
                            bond_code: value.bond_code,
                            short_name: value.short_name,
                            bond_key_listed_market: value.bond_key_listed_market,
                            pledge_available_volume: value.pledge_volume,
                            use_volume: value.pledge_volume,
                            price: value.pledge_price,
                            enterprise_type: value.enterprise_type,
                            bond_type: value.bond_type,
                            issuer_rating_current: value.issuer_rating_current,
                            issuer_rating_institution_name: value.issuer_rating_institution_name,
                            pledged_maturity_volume: 0     // 到期量如果不为0，就不会被过滤掉，没出现的到期量一定是0
                        });
                    }
                });

                var need_select_list = []
                for (var i in bond.pledge_bond_list) {
                    need_select_list.push(bond.pledge_bond_list[i].bond_key_listed_market)
                }
                if (bond.trust == 'sch') {
                    $scope.schGridOptions.data = angular.copy(edit_data);
                    $scope.sourceGroup[0].sum = $scope.schGridOptions.data.length;
                    jQuery.each($scope.schGridOptions.data, function (i, value) {
                        var index = need_select_list.indexOf(value.bond_key_listed_market);
                        if (index > -1) {
                            $timeout(function () {
                                $scope.schGridApi.selection.selectRow(value);
                            }, 0);
                        }
                    });
                } else if (bond.trust == 'cdc') {
                    $scope.cdcGridOptions.data = angular.copy(edit_data);
                    $scope.sourceGroup[1].sum = $scope.cdcGridOptions.data.length;
                    jQuery.each($scope.cdcGridOptions.data, function (i, value) {
                        var index = need_select_list.indexOf(value.bond_key_listed_market);
                        if (index > -1) {
                            $timeout(function () {
                                $scope.cdcGridApi.selection.selectRow(value);
                            }, 0);
                        }
                    });
                }

                updateTotal();
                $scope.bank_repos.update();
            }
        });
    });
    $scope.$on("init bank_repo dlg", function () {
        init_data();
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
