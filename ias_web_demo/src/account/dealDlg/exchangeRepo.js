angular.module('ias.account').controller('exchangeRepoInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter,
    selectTypes, repoInfo, account, hcMarketData, Calculator, dealPage, dataCenter, accountUtils, user) {
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.exchange_repo;
    };

    $scope.exchange_repos = {
        // term: '',
        // initial_date: '',
        maturity_date: '',
        // repo_rate: 0,
        // maturity_settlement_date: '',
        real_rate: 0,
        // settlement_days: 0
    };
    $scope.singleAccountData = {
        interbank_repo_to_net: 0,
        exchange_repo_to_net: 0,
        asset_net: "",
        cash_t_1: "",
        normalized_bonds_sse_available: 0,
        normalized_bonds_sze_available: 0
    };
    $scope.timePickerConfig = datetimePickerConfig;

    $scope.repoList = repoInfo.repo_list;
    $scope.trade = {
        repo_id: '',
        repo_code: '',
        repo_name: '',
        term: '',
        direction: 1,
        volume: 0,
        repo_rate: 0,
        initial_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        use_volume: 0,
        amount: 0,
        fund: 0,
        available_volume: '',
        account_id: filterParam.account_id,
        in_edit_mode: false
    };
    $scope.directionGroup = [
        { label: '正', value: 1 },
        { label: '逆', value: -1 }
    ];

    $scope.checkInput = function () {
        $scope.trade.show_alert = true;
        $scope.trade.alert_content = '';
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            $scope.trade.alert_content = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.repo_code)) {
            $scope.trade.alert_content = '请输入回购代码!';
            return false;
        }
        if (!$scope.trade.repo_rate) {
            $scope.trade.alert_content = '请输入回购利率!';
            return false;
        }
        if (1 == $scope.trade.direction && accountUtils.isEmpty($scope.trade.use_volume)) {
            $scope.trade.alert_content = '请输入使用量!';
            return false;
        }
        if (-1 == $scope.trade.direction && accountUtils.isEmpty($scope.trade.fund)) {
            $scope.trade.alert_content = '请输入使用资金!';
            return false;
        }
        if (1 == $scope.trade.direction && 0 != ($scope.trade.amount % 100)) {
            $scope.trade.alert_content = '使用量必须是整数!';
            return false;
        }
        // IAS-1905 回购去除可用量校验
        //当选择流水账户并且发生日期为当日时，使用量不能大于可用量
        // if($scope.singleAccountData.source_type_position === 'trade'
        //     && $scope.trade.initial_date == dateClass.getFormatDate(new Date(), 'yyyy-MM-dd')
        //     && ($scope.trade.use_volume > $scope.trade.available_volume)
        //     && ($scope.trade.direction == 1)){
        //     $scope.trade.alert_content = '使用量不能大于可用量!';
        //     return false;
        // }
        $scope.trade.show_alert = false;
        return true;
    };

    $scope.init_data = function () {
        $scope.$broadcast('angucomplete-alt:clearInput', 'exchangeRepoSearchBox');
        $scope.trade.in_edit_mode = false;
        $scope.trade.initial_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.trade.account_id = filterParam.account_id;
        $scope.trade.direction = 1;
        $scope.exchange_repos.maturity_date = '';
        $scope.trade.term = '';
        $scope.trade.repo_rate = undefined;
        $scope.exchange_repos.real_rate = 0;
        $scope.trade.available_volume = '';
        $scope.trade.use_volume = '';
        $scope.trade.amount = '';
        $scope.total.this_repo_rate = 0;
        $scope.trade.fund = '';
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.accountChanged($scope.trade.account_id);
    };

    $scope.total = {
        this_repo_rate: 0,
        amount: 0
    };

    $scope.maturityDateChanged = function (term, initial_date) {
        // FIX：交易所回购的term均为 '10d' 格式，取整。
        term = parseInt(term);
        Calculator.date({
            term: term,
            initialDate: initial_date,
            settlementDays: 1,
            calendar: 'exchange',
        }).then((data) => {
            $scope.exchange_repos = data;
            // !KEEP: 2017-05-22 交易所利率计算方式发生改变
            $scope.exchange_repos.real_rate = (initial_date >= '2017-05-22')
                ? $scope.trade.repo_rate
                : $scope.trade.repo_rate * term / data.real_days;
            $scope.$apply();
        });
    };

    $scope.accountChanged = function (account_id) {
        account.get({
            account_id: account_id,
            company_id: $scope.getCompanyId(account_id)
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.singleAccountData = response.data;
            }
        });

        /*$scope.isSelectedValuationAccount = accountService.isValuationAccount(account_id);*/
    };

    $scope.repoSelectFun = function (selected) {
        if (selected) {
            $scope.trade.repo_code = selected.originalObject.repo_code;
            $scope.trade.repo_name = selected.originalObject.repo_name;
            $scope.trade.term = selected.originalObject.term;
            $scope.maturityDateChanged($scope.trade.term, $scope.trade.initial_date);
            if (-1 != $scope.trade.repo_name.indexOf('R')) {
                $scope.trade.available_volume = $scope.singleAccountData.normalized_bonds_sze_available;
            } else if (-1 != $scope.trade.repo_name.indexOf('GC')) {
                $scope.trade.available_volume = $scope.singleAccountData.normalized_bonds_sse_available;
            }
        }
    };

    $scope.changeFund = function (fund) {
        $scope.total.this_repo_rate = fund * 100 / $scope.singleAccountData.asset_net;
    };
    $scope.changeVolume = function (volume) {
        $scope.trade.amount = volume * 100;
        $scope.total.this_repo_rate = $scope.trade.amount * 100 / $scope.singleAccountData.asset_net;
    };
    $scope.changeAmount = function (amount) {
        amount = parseFloat(amount);
        $scope.trade.use_volume = amount / 100;
        $scope.total.this_repo_rate = amount * 100 / $scope.singleAccountData.asset_net;
    };

    $scope.$on("init exchange_repo dlg", function () {
        $scope.init_data();
    });

    $scope.$on("show exchangeRepoDlg", function () {
        $scope.trade.in_edit_mode = true;
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        selectTypes.dealInput = dealPage.exchange_repo;

        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.singleAccountData.interbank_repo_to_net = hcMarketData.assetMarketData.interbank_repo_to_net;
        $scope.singleAccountData.exchange_repo_to_net = hcMarketData.assetMarketData.exchange_repo_to_net;
        $scope.singleAccountData.cash_t_1 = hcMarketData.assetMarketData.cash_t_1;
        $scope.singleAccountData.asset_net = hcMarketData.assetMarketData.asset_net;
        $scope.singleAccountData.normalized_bonds_sse_available = hcMarketData.assetMarketData.normalized_bonds_sse_available;
        $scope.singleAccountData.normalized_bonds_sze_available = hcMarketData.assetMarketData.normalized_bonds_sze_available;
        $scope.trade.account_id = bond.account_id;
        $scope.trade.direction = bond.direction;
        $scope.trade.term = bond.term;
        $scope.trade.initial_date = bond.initial_date;
        $scope.trade.maturity_date = bond.maturity_date;
        $scope.exchange_repos.maturity_date = $scope.trade.maturity_date;
        $scope.trade.repo_rate = bond.repo_rate * 100;
        $scope.exchange_repos.real_rate = bond.real_rate;
        $scope.trade.repo_name = bond.repo_name;
        $scope.trade.repo_code = bond.repo_code;
        $scope.trade.repo_id = bond.id;
        if (-1 != $scope.trade.repo_name.indexOf('R')) {
            $scope.trade.available_volume = $scope.singleAccountData.normalized_bonds_sze_available;
        } else if (-1 != $scope.trade.repo_name.indexOf('GC')) {
            $scope.trade.available_volume = $scope.singleAccountData.normalized_bonds_sse_available;
        }
        $scope.trade.use_volume = bond.volume;
        if ($scope.trade.direction == 1) {
            $scope.trade.amount = bond.amount;
        } else if ($scope.trade.direction == -1) {
            $scope.trade.fund = -bond.amount;
        }

        dealPage.isShowApply = false;//试算
    });

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.exchange_repo != selectTypes.dealInput) {
            return;
        }

        if (!$scope.checkInput()) {
            return;
        }

        if (!$scope.trade.in_edit_mode) {
            if (1 == $scope.trade.direction) {
                $scope.$emit('deal trade add', {
                    type: 'exchange_repo',
                    account_id: $scope.trade.account_id,
                    company_id: $scope.getCompanyId($scope.trade.account_id),
                    trade_list: [{
                        repo_code: $scope.trade.repo_code,
                        repo_name: $scope.trade.repo_name,
                        term: $scope.trade.term,
                        direction: $scope.trade.direction,
                        volume: parseInt($scope.trade.use_volume),
                        repo_rate: $scope.trade.repo_rate / 100,
                        initial_date: $scope.trade.initial_date,
                        user: user.name,
                        manager: user.id
                    }]
                });
            } else if (-1 == $scope.trade.direction) {
                $scope.$emit('deal trade add', {
                    type: 'exchange_repo',
                    account_id: $scope.trade.account_id,
                    company_id: $scope.getCompanyId($scope.trade.account_id),
                    trade_list: [{
                        repo_code: $scope.trade.repo_code,
                        repo_name: $scope.trade.repo_name,
                        term: $scope.trade.term,
                        direction: $scope.trade.direction,
                        repo_rate: $scope.trade.repo_rate / 100,
                        initial_date: $scope.trade.initial_date,
                        fund: parseFloat($scope.trade.fund),
                        user: user.name,
                        manager: user.id
                    }]
                });
            }
        } else {
            if (1 == $scope.trade.direction) {
                $scope.$emit('deal trade update', {
                    type: 'exchange_repo',
                    account_id: $scope.trade.account_id,
                    company_id: $scope.getCompanyId($scope.trade.account_id),
                    trade_id: $scope.trade.repo_id,
                    trade: {
                        repo_code: $scope.trade.repo_code,
                        repo_name: $scope.trade.repo_name,
                        term: $scope.trade.term,
                        direction: $scope.trade.direction,
                        volume: parseInt($scope.trade.use_volume),
                        repo_rate: $scope.trade.repo_rate / 100,
                        initial_date: $scope.trade.initial_date,
                        user: user.name,
                        manager: user.id
                    }
                });
            } else if (-1 == $scope.trade.direction) {
                $scope.$emit('deal trade update', {
                    type: 'exchange_repo',
                    account_id: $scope.trade.account_id,
                    company_id: $scope.getCompanyId($scope.trade.account_id),
                    trade_id: $scope.trade.repo_id,
                    trade: {
                        repo_code: $scope.trade.repo_code,
                        repo_name: $scope.trade.repo_name,
                        term: $scope.trade.term,
                        direction: $scope.trade.direction,
                        repo_rate: $scope.trade.repo_rate / 100,
                        initial_date: $scope.trade.initial_date,
                        fund: parseFloat($scope.trade.fund),
                        user: user.name,
                        manager: user.id
                    }
                });
            }
        }

        $scope.init_data();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});