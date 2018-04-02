angular.module('ias.account').controller('bankLendingInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes,
    dealPage, hcMarketData, dataCenter, Calculator, accountUtils, user) {

    $scope.bank_repos = {
        term: '',
        initial_date: '',
        maturity_date: '',
        repo_rate: 0,
        maturity_settlement_date: '',
        real_rate: 0,
        settlement_days: 0
    };
    $scope.timePickerConfig = datetimePickerConfig;
    $scope.trade = {
        initial_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        counter_party_bank: '',
        direction: 1,
        lending_rate: 0,
        amount: 0,
        term: '',
        maturity_date: '',
        comment: '',
        account_id: filterParam.account_id,
    };
    $scope.directionGroup = [
        { label: '拆入', value: 1 },
        { label: '拆出', value: -1 }
    ];

    $scope.display = function () {
        return selectTypes.dealInput == dealPage.bank_lending;
    };
    $scope.init_data = function () {
        $scope.trade.initial_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.trade.account_id = filterParam.account_id;
        $scope.trade.counter_party_bank = '';
        $scope.trade.direction = 1;
        $scope.trade.lending_rate = '';
        $scope.trade.amount = '';
        $scope.trade.term = "";
        $scope.bank_repos.maturity_date = "";
        $scope.trade.comment = "";
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.trade.day_counter = 'A/360';
    };
    $scope.checkInput = function () {
        $scope.trade.show_alert = true;
        $scope.trade.alert_content = '';
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            $scope.trade.alert_content = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.term)) {
            $scope.trade.alert_content = '请输入期限!';
            return false;
        }
        if ($scope.trade.initial_date > $scope.bank_repos.maturity_date) {
            $scope.trade.alert_content = '到期日不能早于发生日期!';
            return false;
        }
        if ($scope.trade.term > 1000) {
            $scope.trade.alert_content = '期限超出范围!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.lending_rate)) {
            $scope.trade.alert_content = '请输入拆借利率!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.amount)) {
            $scope.trade.alert_content = '请输入金额!';
            return false;
        }
        $scope.trade.show_alert = false;
        return true;
    };
    $scope.maturityDateChanged = function (term, initial_date) {
        term = term ? term : 0;
        if (term > 1000) {
            $scope.trade.show_alert = true;
            $scope.trade.alert_content = '期限超出范围!';
            return;
        }
        // 拆借使用银行间交易日历算到期日
        Calculator.date({
            term: term,
            initialDate: initial_date
        }).then((data) => {
            $scope.bank_repos = data;
            $scope.trade.initial_date = data.initial_date;
            $scope.$apply();
        });
        $scope.trade.show_alert = false;
    };

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.bank_lending != selectTypes.dealInput) {
            return;
        }

        if (!$scope.checkInput()) {
            return;
        }
        var tradeItem = {
            initial_date: $scope.trade.initial_date,
            maturity_date: $scope.bank_repos.maturity_date,
            amount: parseFloat($scope.trade.amount),
            lending_rate: parseFloat($scope.trade.lending_rate) / 100,
            comment: $scope.trade.comment,
            counter_party_company: $scope.trade.counter_party_bank,
            direction: $scope.trade.direction,
            day_counter: $scope.trade.day_counter,    
            user: user.name,
            manager: user.id
        };
        if (hcMarketData.showBtnList) {
            $scope.$emit('deal trade add', {
                type: 'bank_lending',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_list: [tradeItem]
            });
        } else {
            $scope.$emit('deal trade update', {
                type: 'bank_lending',
                account_id: hcMarketData.bond.account_id,
                company_id: $scope.getCompanyId(hcMarketData.bond.account_id),
                trade_id: hcMarketData.bond.id,
                trade: tradeItem
            });
        }
        $scope.init_data();
    });
    $scope.$on("init bank_lending dlg", function () {
        $scope.init_data();
    });
    $scope.$on("show bankLendingDlg", function () {
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        selectTypes.dealInput = dealPage.bank_lending;

        $scope.trade.initial_date = bond.initial_date;//发生时间
        $scope.trade.direction = bond.direction;//方向
        $scope.bank_repos.maturity_date = bond.maturity_date;//到期日
        $scope.trade.amount = bond.amount;
        $scope.trade.counter_party_account = bond.counter_party_account;//对手账户
        var maturityDay = new Date(bond.maturity_date);
        var initialDay = new Date(bond.initial_date);
        $scope.trade.term = parseInt(Math.abs(maturityDay - initialDay) / 1000 / 60 / 60 / 24);//期限
        $scope.trade.lending_rate = parseFloat(bond.lending_rate) * 100;
        $scope.trade.comment = bond.comment;//备注
        $scope.trade.counter_party_bank = bond.counter_party_company;
        $scope.trade.account_id = bond.account_id;
        $scope.trade.day_counter = bond.day_counter;
        dealPage.isShowApply = false;//试算
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    })
});