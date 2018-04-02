angular.module('ias.account').controller('feeInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes, dateClass,
    hcMarketData, dealPage, dataCenter, accountUtils) {
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.fee;
    };
    $scope.timePickerConfig = datetimePickerConfig;

    $scope.trade = {
        initial_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        comment: '',
        account_id: filterParam.account_id,
        amount: 0,
        in_edit_mode: false,
        fee_id: '',
        payment_date: dateClass.getEndDayOfYear(new Date())
    };
    $scope.conditionChanged = function () {
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
    };
    $scope.init_data = function () {
        $scope.trade.initial_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.trade.account_id = filterParam.account_id;
        $scope.trade.comment = "";
        $scope.trade.amount = '';
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.trade.in_edit_mode = false;
        $scope.trade.payment_date = dateClass.getEndDayOfYear(new Date());
    };
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
        if ($scope.trade.initial_date > $scope.trade.payment_date) {
            $scope.trade.alert_content = '扣款日期不能早于发生日期!';
            return false;
        }
        if ($scope.trade.initial_date !== $scope.trade.payment_date && $scope.trade.amount < 0){
            $scope.trade.alert_content = '入款当前只支持T+0!';
            $scope.trade.payment_date = $scope.trade.initial_date;
            return false;
        }
        $scope.trade.show_alert = false;
        return true;
    };

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.fee != selectTypes.dealInput) {
            return;
        }

        if (!$scope.checkInput()) {
            return;
        }
        var tradeItem = {
            amount: parseFloat($scope.trade.amount),
            initial_date: $scope.trade.initial_date,
            comment: $scope.trade.comment,
            payment_date: $scope.trade.payment_date
        }
        if ($scope.trade.in_edit_mode) {
            $scope.$emit('deal trade update', {
                type: 'fee',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_id: $scope.trade.fee_id,
                trade: tradeItem
            });
        } else {
            $scope.$emit('deal trade add', {
                type: 'fee',
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
    $scope.$on("init fee dlg", function () {
        $scope.init_data();
    });
    $scope.$on("show feeDlg", function () {
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        $scope.trade.in_edit_mode = true;
        selectTypes.dealInput = dealPage.fee;

        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';

        $scope.trade.fee_id = bond.id;
        $scope.trade.account_id = bond.account_id;
        $scope.trade.initial_date = bond.initial_date;
        $scope.trade.amount = -bond.amount;
        $scope.trade.comment = bond.comment;
        $scope.trade.payment_date = bond.payment_date;

        dealPage.isShowApply = false;//试算
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});