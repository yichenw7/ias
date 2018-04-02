angular.module('ias.account').controller('exessReserveInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes,
                                                             hcMarketData, dealPage, dataCenter, accountUtils) {
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.exess_reserve;
    };
    $scope.dateType = "到账日期";
    $scope.timePickerConfig = datetimePickerConfig;


    $scope.trade = {
        reserve_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        direction: 1,
        settlement_days: "0",
        comment: '',
        amount: 0,
        account_id: filterParam.account_id
    };

    $scope.directionGroup = [
        {label: '增加', value: 1},
        {label: '减少', value: -1}
    ];
    $scope.settlementDaysGroup = [
        {label: 'T+0', value: 0},
        {label: 'T+1', value: 1},
        {label: 'T+2', value: 2}
    ];

    $scope.checkInput = function () {
        $scope.trade.show_alert = true;
        $scope.trade.alert_content = '';
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            $scope.trade.alert_content = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.amount)) {
            $scope.trade.alert_content = '请输入金额!';
            return false;
        }
        $scope.trade.show_alert = false;
        return true;
    };
    $scope.init_data = function () {
        $scope.trade.in_edit_mode = false;
        $scope.trade.reserve_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.trade.account_id = filterParam.account_id;
        $scope.trade.direction = 1;
        $scope.trade.comment = "";
        $scope.trade.amount = null;
        $scope.dateType = "到账日期";
        $scope.trade.settlement_days = $scope.settlementDaysGroup[0].value;
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
    };
    // init data
    $scope.$on("init exess_reserve dlg", function () {
        $scope.init_data();
    });
    $scope.$on("show fundReservesDlg", function () {
        hcMarketData.showBtnList = false;
        $scope.trade.in_edit_mode = true;
        selectTypes.dealInput = dealPage.exess_reserve;
        var bond = hcMarketData.bond;
        $scope.trade.fund_reserves_id = bond.id;
        $scope.trade.reserve_date = bond.reserve_date;
        $scope.trade.account_id = bond.account_id;
        $scope.trade.direction = bond.direction;
        $scope.trade.comment = bond.comment;
        $scope.trade.amount = bond.amount;
        if (bond.direction == 1) {
            $scope.dateType = "到账日期";
        }
        else {
            $scope.dateType = "出账日期";
        }

        $scope.trade.settlement_days = bond.settlement_days;
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';

    });
    $scope.$on("dealInput-confirm", function () {
        if (dealPage.exess_reserve != selectTypes.dealInput) {
            return;
        }
        if (!$scope.checkInput()) {
            return;
        }
        var tradeItem = {
            direction: $scope.trade.direction,
            amount: $scope.trade.amount,
            reserve_date: $scope.trade.reserve_date,
            settlement_days: $scope.trade.settlement_days,
            comment: $scope.trade.comment
        };
        if ($scope.trade.in_edit_mode){
            $scope.$emit('deal trade update', {
                type: 'fund_reserve',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_id: $scope.trade.fund_reserves_id,
                trade: tradeItem
            });
        } else {
            $scope.$emit('deal trade add', {
                type: 'fund_reserve',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_list: [tradeItem]
            });
        }

        $scope.init_data();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });

    $scope.changeBtn = function (value) {
        if (1 == value) {
            $scope.dateType = "到账日期";
        } else if (-1 == value) {
            $scope.dateType = "出账日期";
        }
    };

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});