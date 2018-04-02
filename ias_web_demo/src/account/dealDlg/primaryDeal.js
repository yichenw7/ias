angular.module('ias.account').controller('primaryDealInputCtrl', function ($scope, datetimePickerConfig, filterParam, hcMarketData, $filter, selectTypes, dataCenter,
    dealPage, investableBondR, investableBond, account, accountUtils, Trades, user, bond, messageBox) {

    $scope.timePickerConfig = datetimePickerConfig;

    /*$scope.bondList = [];
    $.each(dataCenter.market.bondDetailMap, function(key, value) {
        $scope.bondList.push(value);
    });*/
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.primary_deal
    };
    $scope.directionGroup = [
        { label: '缴款', value: '0' },
        { label: '上市', value: '1' }
    ];
    $scope.valuationTypeGroup = [
        { label: '中债估值', value: 'cdc' },
        { label: '成本法', value: 'cost' },
        { label: '中证估值', value: 'csi' },
        //{label: '上清估值', value: 'sch'},
        //{label: '市价', value: 'market'},
    ];
    $scope.settleTypeGroup = [
        { label: 'T+0', value: 0 },
        { label: 'T+1', value: 1 }
    ];
    $scope.accountingTypeGroup = [
        { label: '持有到期', value: 'hold_to_maturity' },
        { label: '可供出售', value: 'available_for_sale' },
        { label: '交易出售', value: 'hold_for_trading' }
    ];

    $scope.bondSelectFun = function (selected) {
        if (selected) {
            $scope.trade.bond_key_listed_market = selected.originalObject.bond_key_listed_market;
            $scope.trade.bond_code = selected.originalObject.bond_id;
            $scope.trade.short_name = selected.originalObject.short_name;

            investableBond.get({ bond_key_listed_market: $scope.trade.bond_key_listed_market }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $scope.trade.rating = data.rating || '--';
                    $scope.trade.validTerm = data.expiration_date || '--';
                }
            });

            bond.get({ bond_key_listed_market: selected.originalObject.bond_key_listed_market }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $scope.trade.coupon_rate_current = data.coupon_rate_current;
                    $scope.trade.listed_date = data.listed_date ? data.listed_date : '';
                    $scope.trade.interest_start_date = data.interest_start_date ? data.interest_start_date : '';

                    $scope.trade.pay_date = data.payment_date ? data.payment_date : '';
                    $scope.trade.settlement_date = data.listed_date ? data.listed_date : '';
                    $scope.trade.maturity_dates = data.maturity_date;
                }
            });
        }

    };

    $scope.accountChanged = function (account_id) {
        account.get({
            account_id: account_id,
            company_id: $scope.getCompanyId(account_id)
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var account_data = response.data;
                $scope.trade.coupon_rate = account_data.coupon_rate;
                $scope.trade.duration = account_data.duration;
                $scope.trade.yield_rate = account_data.yield_rate;
            }
        });
    };

    dataCenter.market.investableBondMap = investableBondR.getAllData({}, function success() {    //任务数据(可投库)
    }, function failed() {
        messageBox.error('可投库获取失败！');
    });

    $scope.checkInput = function () {
        $scope.trade.show_alert = true;
        $scope.trade.alert_content = '';
        if (accountUtils.isEmpty($scope.trade.bond_key_listed_market)) {
            $scope.trade.alert_content = '请选择标的!';
            return false;
        }
        if ($scope.trade.coupon_rate_current != 0 && !$scope.trade.coupon_rate_current) {
            $scope.trade.alert_content = '该债券没有票面利率，不支持一级成交录入';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.pay_date) && $scope.trade.pay_type == '0') {
            $scope.trade.alert_content = '请选择缴款日期!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.settlement_date) && $scope.trade.pay_type == '1') {
            $scope.trade.alert_content = '请选择上市日期!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.account_id)) {
            $scope.trade.alert_content = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.price)) {
            $scope.trade.alert_content = '请输入价格!';
            return false;
        }
        if (accountUtils.isEmpty($scope.trade.volume)) {
            $scope.trade.alert_content = '请输入量!';
            return false;
        }
        if ($scope.trade.pay_type == '1') {
            if ($scope.trade.listed_date == '' && $scope.trade.interest_start_date == '') {
                $scope.trade.alert_content = '该债券不能以“上市”方式录入';
                return false;
            }
            if ($scope.trade.settlement_date < $scope.trade.listed_date || $scope.trade.settlement_date < $scope.trade.interest_start_date) {
                $scope.trade.alert_content = "不合法输入(上市日期应不早于该债券上市日期)";
                return false;
            }
        }
        if ($scope.trade.pay_date > $scope.trade.maturity_dates) {
            $scope.trade.alert_content = '缴款日期录入晚于到期日!';
            return false;
        }
        // if ($scope.trade.pay_date > $scope.trade.interest_start_date) {
        //     $scope.trade.alert_content = '缴款日期录入晚于起息日!';
        //     return false;
        // }
        $scope.trade.show_alert = false;
        return true;
    };
    $scope.init = function () {
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        $scope.trade.bond_code = '';
        $scope.trade.short_name = '';
        $scope.trade.bond_key_listed_market = '';
        $scope.trade.pay_type = '0';
        $scope.trade.pay_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.trade.settlement_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.trade.settlement_days = 0;
        $scope.trade.account_id = filterParam.account_id;
        $scope.trade.valuation_method = 'cdc';
        $scope.trade.rating = '';
        $scope.trade.validTerm = '';
        $scope.trade.counter_party_account = '';
        $scope.trade.counter_party_trader = '';
        $scope.trade.price = null;
        $scope.trade.volume = null;
        $scope.trade.amount = null;
        $scope.trade.comment = '';
        $scope.trade.accounting_type = '';
        $scope.trade.duration = hcMarketData.assetMarketData.duration;
        $scope.trade.yield_rate = hcMarketData.assetMarketData.yield_rate;
        $scope.trade.coupon_rate = hcMarketData.assetMarketData.coupon_rate;
        $scope.trade.new_coupon_rate = undefined;
        $scope.trade.new_duration = undefined;
        $scope.trade.new_yield_rate = undefined;
        $scope.trade.maturity_dates = '';
    };

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.primary_deal != selectTypes.dealInput) return;
        if (!$scope.checkInput()) return;

        var tradeItem = {
            account_id: $scope.trade.account_id,
            trade_date: $scope.trade.settlement_date,
            bond_key_listed_market: $scope.trade.bond_key_listed_market,
            direction: 0,
            pay_type: $scope.trade.pay_type,
            pay_date: $scope.trade.pay_date,
            settlement_days: $scope.trade.settlement_days,
            price: parseFloat($scope.trade.price),
            volume: parseInt($scope.trade.volume),
            amount: parseFloat($scope.trade.price * $scope.trade.volume),
            counter_party_account: $scope.trade.counter_party_account,
            counter_party_trader: $scope.trade.counter_party_trader,
            comment: $scope.trade.comment,
            accounting_type: $scope.trade.accounting_type,
            valuation_method: $scope.trade.valuation_method,
            user: user.name,
            manager: user.id
        };
        if (hcMarketData.showBtnList) {
            $scope.$emit('deal trade add', {
                type: 'primary',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_list: [tradeItem]
            });
        } else {
            $scope.$emit('deal trade update', {
                type: 'primary',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_id: $scope.trade.trade_id,
                trade: tradeItem
            });
        }

        $scope.init();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });
    $scope.$on("dealInput-apply", function () {
        if (dealPage.primary_deal != selectTypes.dealInput) {
            return;
        }
        var trade_date = '';
        var settlement_days = '';
        if ($scope.trade.pay_type == '0') {
            trade_date = $scope.trade.pay_date;
            settlement_days = 0;
        }
        else {
            trade_date = $scope.trade.settlement_date;
            settlement_days = $scope.trade.settlement_days;
        }
        Trades.add({
            type: 'bond',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_trial: {
                trade_date: trade_date,
                bond_key_listed_market: $scope.trade.bond_key_listed_market,
                direction: 0,
                clean_price: parseFloat($scope.trade.price),
                settlement_days: settlement_days,
                volume: parseInt($scope.trade.volume),
                valuation_method: $scope.trade.valuation_method
            }
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.trade.new_coupon_rate = data.coupon_rate;
                $scope.trade.new_duration = data.duration;
                $scope.trade.new_yield_rate = data.yield_rate;
            }
        });
    });

    $scope.$on("init primary_deal dlg", function () {
        $scope.init();
    });

    $scope.$on("show primaryDealDlg", function () {
        $scope.$broadcast('angucomplete-alt:clearInput', 'primarySearchBox');
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        var theBond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        selectTypes.dealInput = dealPage.primary_deal;

        $scope.trade.account_id = theBond.account_id;
        $scope.trade.bond_key_listed_market = theBond.bond_key_listed_market;
        $scope.trade.bond_code = $filter('codeBond')(theBond.bond_key_listed_market);
        $scope.trade.short_name = $filter('shortNameBond')(theBond.bond_key_listed_market);
        $scope.trade.pay_type = theBond.pay_type;
        $scope.trade.valuation_method = theBond.valuation_method;
        $scope.trade.counter_party_account = theBond.counter_party_account;
        $scope.trade.counter_party_trader = theBond.counter_party_trader;
        $scope.trade.settlement_days = theBond.settlement_days;

        investableBond.get({ bond_key_listed_market: theBond.bond_key_listed_market }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.trade.rating = data.rating || '--';
                $scope.trade.validTerm = data.expiration_date || '--';
            }
        });

        bond.get({ bond_key_listed_market: theBond.bond_key_listed_market }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.trade.coupon_rate_current = data.coupon_rate_current;
                $scope.trade.listed_date = data.listed_date ? data.listed_date : '';
                $scope.trade.interest_start_date = data.interest_start_date ? data.interest_start_date : '';
                $scope.trade.pay_date = data.payment_date ? data.payment_date : '';
                $scope.trade.settlement_date = data.listed_date ? data.listed_date : '';
                $scope.trade.maturity_dates = data.maturity_date;
            }
        });


        if (theBond.pay_type == '0') {
            $scope.trade.pay_date = theBond.trade_date;
        }

        if (theBond.pay_type == '1') {
            $scope.trade.settlement_date = theBond.trade_date;
        }

        $scope.trade.trade_id = theBond.id;
        $scope.trade.volume = theBond.volume;//持仓量
        $scope.trade.price = theBond.clean_price;
        $scope.trade.comment = theBond.comment;
        $scope.trade.accounting_type = theBond.accounting_type;

    });

    $scope.trade = {
        account_id: filterParam.account_id,
        bond_key_listed_market: '',
        pay_type: '1',
        valuation_method: '',
        pay_target: '',
        pay_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        settlement_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        settlement_days: 0,
        counter_party_trader: '',
        counter_party_account: '',
        rating: '',
        validTerm: '',
        price: null,
        volume: null,
        amount: null,
        duration: hcMarketData.assetMarketData.duration,
        yield_rate: hcMarketData.assetMarketData.yield_rate,
        coupon_rate: hcMarketData.assetMarketData.coupon_rate,
        new_duration: '',
        new_yield_rate: '',
        new_coupon_rate: '',
        comment: '',
        accounting_type: ''
    };
})