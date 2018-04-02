angular.module('ias.account').controller('purchaseRedemptionInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes, 
    MarketCalendar, hcMarketData, dealPage, dataCenter, accountUtils, accountService, Calculator, dateClass) {

    $scope.timePickerConfig = datetimePickerConfig;

    $scope.trade = {
        start_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        direction: 1,
        init: false,
        settlement_days: '0',
        comment: '',
        account_id: filterParam.account_id,
        amount: 0,
        in_edit_mode: false,
        purchase_id: '',
        maturity_date: '',
        target_cost: '',
        value_date: '',
        issuer_term: '',
        customer: '',
        settlement_date: '',
        custom_type: '',
        channel: '',
        release_end_date: '',
        is_rolling: '0'
    };
    function init_data() {
        $scope.trade.start_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.trade.account_id = filterParam.account_id;
        $scope.trade.account = accountService.getAccountById(filterParam.account_id);
        $scope.trade.direction = 1;
        $scope.trade.comment = "";
        $scope.trade.amount = null;
        $scope.trade.settlement_days = "0";
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.trade.in_edit_mode = false;
        $scope.trade.maturity_date = null;
        $scope.trade.exit_date = null;
        $scope.trade.target_cost = null;
        $scope.trade.value_date = null;
        $scope.trade.issuer_term = null;
        $scope.trade.custom_type = '';
        $scope.trade.channel = '';
        $scope.trade.release_end_date = null;
        $scope.trade.is_rolling = '0';
        $scope.trade.customer = '';
        $scope.trade.interestChangeByServer = false;
        $scope.trade.unit_asset_net = 1.0000;
        $scope.trade.shares = '';
        $scope.trade.expiry_amount = '';

        $scope.getSettlementDate();
    }
    $scope.typeGroup = [
        {label: '申购', value: 1},
        {label: '赎回', value: -1}
    ];
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.purchase_redemption;
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
        $scope.trade.show_alert = false;
        return true;
    };

    function calculateDate() {
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            return;
        }

        if (!$scope.trade.issuer_term && !$scope.trade.maturity_date) {
            return;
        }

        if ($scope.trade.issuer_term && $scope.trade.maturity_date && $scope.trade.value_date) {
            return;
        }

        if($scope.trade.value_date != null) {
            var shfited = dateClass.dateShit($scope.trade.value_date, $scope.trade.maturity_date, $scope.trade.issuer_term, -1); 
            $scope.trade.maturity_date = shfited.date2;
            $scope.trade.issuer_term = shfited.days;
        }

        Calculator.date({
            term: 0,
            initialDate: $scope.trade.maturity_date,
            settlementDays: 0,
        }).then(data => {
            $scope.trade.exit_date = data.maturity_date;
            calculateAmount();
            $scope.$apply();
        });

    }
    function calculateAmount() {
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            return;
        }

        if (!$scope.trade.amount || !$scope.trade.target_cost || !$scope.trade.issuer_term) {
            $scope.expiry_amount = null;
            return;
        }

        var amount = parseFloat($scope.trade.amount);
        if($scope.trade.issuer_term != null && $scope.trade.target_cost != null && !isNaN(amount)) {
            var expiry_amount = amount + amount * $scope.trade.target_cost * 0.01 * $scope.trade.issuer_term / 365;
            $scope.expiry_amount = $filter('commafyConvert')(expiry_amount);
        }
    }
    function resetNetValue() {
        $scope.trade.unit_asset_net = 1.0000;
        $scope.trade.shares = '';
    }

    $scope.handleSharesChanged = function() {
        if ($scope.trade.direction === -1) {
            $scope.trade.amount = $scope.trade.unit_asset_net * $scope.trade.shares;
        }
    };
    $scope.handleUnitNetChanged = function() {
        if ($scope.trade.direction === 1) {
            $scope.trade.shares = $scope.trade.amount / $scope.trade.unit_asset_net;
        } else {
            $scope.trade.amount = $scope.trade.unit_asset_net * $scope.trade.shares;
        }
    };
    $scope.maturityDateChanged = function () {
        if ($scope.trade.value_date > $scope.trade.maturity_date) {
            $scope.trade.maturity_date = $scope.trade.value_date;
        }
        $scope.trade.issuer_term = null;
        calculateDate();
    };
    $scope.accountChange = function () {
        $scope.trade.account = accountService.getAccountById($scope.trade.account_id);
        $scope.getSettlementDate();
        calculateDate();
        calculateAmount();
    };
    //起息日计息天数联动赎回日期
    $scope.interestDaysChanged = function () {
        $scope.trade.maturity_date = null;
        calculateDate();
    };
    //发生日期清算速度联动结算日期
    $scope.getSettlementDate = function () {
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            return;
        }
        MarketCalendar.get({
            method: 'advance',
            market: 'exchange',
            date: $scope.trade.start_date,
            days: Number($scope.trade.settlement_days),
        }, function success(response) {
            if (response.date != null) {
                $scope.trade.settlement_date = response.date ;
                $scope.trade.value_date = response.date ;
                $scope.interestDaysChanged();
            }
        });

    };
    $scope.valueChange = function () {
        $scope.expiry_amount = null;
        $scope.handleUnitNetChanged();
        calculateAmount();
    };
    $scope.dateCompare = function (tempDate) {
        if (tempDate === 'purchaseStart') {
            if ($scope.trade.start_date > $scope.trade.value_date) {
                $scope.trade.start_date = $scope.trade.value_date;
            }
            $scope.getSettlementDate();
        } else if (tempDate === 'interestStart') {
            if ($scope.trade.start_date > $scope.trade.value_date) {
                $scope.trade.start_date = $scope.trade.value_date;
            }
            $scope.trade.maturity_date = null;
            calculateDate();
        }
    };
    $scope.changeBtn = function (value) {
        resetNetValue();
    };

    $scope.$on("init purchase_redemption dlg", function () {
        $scope.trade.init = true;
        init_data();
    });
    $scope.$on("dealInput-confirm", function () {
        if (dealPage.purchase_redemption != selectTypes.dealInput || !$scope.checkInput()) {
            return;
        }

        var tradeParams = {
            direction: $scope.trade.direction,
            amount: parseFloat($scope.trade.amount),
            purchase_date: $scope.trade.start_date,
            settlement_days: parseInt($scope.trade.settlement_days),
            comment: $scope.trade.comment,
            maturity_date: $scope.trade.maturity_date,
            target_cost: $scope.trade.target_cost,   //暂时把 / 100 删去
            value_date: $scope.trade.value_date,
            issuer_term: $scope.trade.issuer_term,
            custom_type: $scope.trade.custom_type,
            channel: $scope.trade.channel,
            release_end_date: $scope.trade.release_end_date,
            is_rolling: $scope.trade.is_rolling,
            customer: $scope.trade.customer,

            unit_asset_net: $scope.trade.account.yield_calculation === 'share' ? $scope.trade.unit_asset_net : 1,
            shares: $scope.trade.account.yield_calculation === 'share' ? $scope.trade.shares : parseFloat($scope.trade.amount)
        }
        if ($scope.trade.in_edit_mode) {
            $scope.$emit('deal trade update', {
                type: 'fund_purchase',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_id: $scope.trade.purchase_id,
                trade: tradeParams
            });
        } else {
            $scope.$emit('deal trade add', {
                type: 'fund_purchase',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_list: [tradeParams]
            });
        }

        init_data();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });
    $scope.$on("show purchaseDlg", function () {
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        $scope.trade.in_edit_mode = true;
        $scope.trade.direction = 1;
        selectTypes.dealInput = dealPage.purchase_redemption;
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.trade.purchase_id = bond.id;
        $scope.trade.direction = bond.direction;
        $scope.trade.settlement_days = bond.settlement_days.toString();
        $scope.trade.account_id = bond.account_id;
        $scope.trade.account = accountService.getAccountById(bond.account_id);
        $scope.trade.start_date = bond.purchase_date;
        $scope.trade.amount = bond.amount * bond.direction;
        $scope.trade.comment = bond.comment;
        $scope.trade.maturity_date = bond.maturity_date;
        $scope.trade.target_cost = bond.target_cost;   //暂时把 * 100 删去
        $scope.trade.is_rolling = bond.is_rolling;
        $scope.trade.release_end_date = bond.release_end_date;
        $scope.trade.channel = bond.channel;
        $scope.trade.custom_type = bond.custom_type;
        $scope.trade.customer = bond.customer;
        $scope.trade.value_date = bond.value_date;
        $scope.trade.issuer_term = bond.issuer_term;
        $scope.trade.settlement_date = bond.settlement_date;
        $scope.trade.exit_date = bond.exit_date;
        $scope.trade.unit_asset_net = bond.unit_asset_net;
        $scope.trade.shares = bond.shares;

        dealPage.isShowApply = false;//试算
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});