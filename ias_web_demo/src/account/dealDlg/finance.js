angular.module('ias.account').controller('financeInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes,
    dealPage, hcMarketData, dataCenter, accountUtils, user) {
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.finance;
    };

    $scope.directionGroup = [
        { label: '买入', value: -1 }
    ]

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.finance != selectTypes.dealInput) {
            return;
        }

        if (!$scope.checkInput()) {
            return;
        }
        var tradeItem = {
            initial_date: $scope.trade.initial_date,
            maturity_date: $scope.trade.maturity_date,
            amount: parseFloat($scope.trade.amount),
            finance_rate: parseFloat($scope.trade.finance_rate) / 100,
            comment: $scope.trade.comment,
            counter_party_company: $scope.trade.counter_party_bank,
            finance_type: $scope.trade.finance_type,
            day_counter: $scope.trade.day_counter,    
            user: user.name,
            manager: user.id
        };
        if (hcMarketData.showBtnList) {
            $scope.$emit('deal trade add', {
                type: 'finance',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_list: [tradeItem]
            });
        } else {
            $scope.$emit('deal trade update', {
                type: 'finance',
                account_id: hcMarketData.bond.account_id,
                company_id: $scope.getCompanyId(hcMarketData.bond.account_id),
                trade_id: hcMarketData.bond.id,
                trade: tradeItem
            });
        }

        $scope.init_data();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });
    // init data
    $scope.$on("init finance dlg", function () {

        $scope.init_data();
    });

    $scope.init_data = function () {
        $scope.trade.initial_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.trade.account_id = filterParam.account_id;
        $scope.trade.counter_party_bank = '';
        $scope.trade.direction = -1;
        $scope.trade.finance_rate = '';
        $scope.trade.finance_type = 'guaranteed';
        $scope.trade.amount = '';
        $scope.trade.term = "";
        $scope.trade.maturity_date = "";
        $scope.trade.comment = "";
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.trade.day_counter = 'A/365';
    };

    $scope.$on("show financeDlg", function () {
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        selectTypes.dealInput = dealPage.finance;

        $scope.trade.initial_date = bond.initial_date;//发生时间
        $scope.trade.direction = -1;
        $scope.trade.maturity_date = bond.maturity_date;//到期日
        $scope.trade.amount = bond.amount;
        $scope.trade.counter_party_account = bond.counter_party_account;//对手账户
        var maturityDay = new Date(bond.maturity_date);
        var initialDay = new Date(bond.initial_date);
        $scope.trade.term = parseInt(Math.abs(maturityDay - initialDay) / 1000 / 60 / 60 / 24);//期限
        $scope.trade.finance_rate = parseFloat(bond.finance_rate) * 100;
        $scope.trade.finance_type = bond.finance_type;
        $scope.trade.comment = bond.comment;//备注
        $scope.trade.counter_party_bank = bond.counter_party_company;
        $scope.trade.account_id = bond.account_id;
        $scope.trade.day_counter = bond.day_counter;
        dealPage.isShowApply = false;//试算
    });



    $scope.checkInput = function () {
        $scope.trade.show_alert = true;
        $scope.trade.alert_content = '';
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            $scope.trade.alert_content = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.maturity_date)) {
            $scope.trade.alert_content = '请选择到期日!';
            return false;
        }
        if ($scope.trade.initial_date > $scope.trade.maturity_date) {
            $scope.trade.alert_content = '到期日不能早于发生日期!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.finance_rate)) {
            $scope.trade.alert_content = '请输入利率!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.amount)) {
            $scope.trade.alert_content = '请输入金额!';
            return false;
        }
        $scope.trade.show_alert = false;
        return true;
    };

    /*校验日期函数*/
    function validateDate(dateList) {
        var bol = true;
        $.each(dateList, function (index, value) {
            bol = bol && value.toString().indexOf('Invalid') == -1
        })
        return bol;
    }

    $scope.maturityDateChange = function (initial_date, maturity_date) {
        var maturityDay = new Date(maturity_date);
        var initialDay = new Date(initial_date);
        if (!validateDate([maturityDay, initialDay]) ||
            Math.abs(maturityDay) / 1000 / 60 / 60 / 24 < Math.abs(initialDay) / 1000 / 60 / 60 / 24) {
            $scope.trade.term = "";
        } else {
            $scope.trade.term = parseInt(Math.abs(maturityDay - initialDay) / 1000 / 60 / 60 / 24);
        }
    };

    $scope.timePickerConfig = datetimePickerConfig;

    $scope.trade = {
        initial_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        counter_party_bank: '',
        direction: -1,
        finance_rate: 0,
        finance_type: 'guaranteed',
        amount: 0,
        term: '',
        maturity_date: '',
        comment: '',
        account_id: filterParam.account_id,
        day_counter: 'A/365',
    };

    $scope.$on('$destroy', function () {
        $scope = null;
    })
})