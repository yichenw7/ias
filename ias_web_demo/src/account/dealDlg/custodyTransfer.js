angular.module('ias.account').controller('custodyTransferCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes,
    dealPage, dataCenter, user, accountUtils, acrossMktBonds) {
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.custody_transfer;
    };

    $scope.timePickerConfig = datetimePickerConfig;
    $scope.trade = {
        init: function () {
            this._resetAlert();
            this.trade_date = $filter('date')(new Date(), 'yyyy-MM-dd');
            this.account_id = filterParam.account_id;
            this.across_mkt_stat = 0;
            this.bond_key_listed_market = '';
            this.convert_bond_key_listed_market = '';
            this.across_mkt_bonds = [];
            this.volume = null;
            this.price = null;
            this.bond_code = '';
            this.short_name = '';
            this.ttm = '';
            this.issuer_rating_current = '';
            this.val_yield = '';
            this.val_clean_price = '';
            this.val_duration = '';
            this.internal_rating = '';
            this.expiry_date = '';
            this.option_date = '';
            this.coupon_rate_current = '';
            this.available_volume = '';
        },
        _resetAlert: function () {
            this.show_alert = false;
            this.alert_content = '';
        },
        check: function () {
            this.show_alert = true;
            this.alert_content = '';
            if (accountUtils.isEmpty(this.account_id)) {
                this.alert_content = '请选择账户!';
                return false;
            }
            if (accountUtils.isEmpty(this.bond_key_listed_market)) {
                this.alert_content = '请选择债券!';
                return false;
            }
            if (this.across_mkt_stat == 1 && accountUtils.isEmpty(this.convert_bond_key_listed_market)) {
                this.alert_content = '请选择跨市场债券!';
                return false;
            }
            if (this.across_mkt_stat == 2) {
                this.alert_content = '不是跨市场券不能做转托管!';
                return false;
            }
            if (accountUtils.isEmpty(this.volume)) {
                this.alert_content = '请输入转出量!';
                return false;
            }
            if (accountUtils.isEmpty(this.price)) {
                this.alert_content = '请输入转出价格!';
                return false;
            }
            this.show_alert = false;
            return true;
        },
        add: function () {
            $scope.$emit('deal trade add', {
                type: 'custody_transfer',
                account_id: this.account_id,
                company_id: $scope.getCompanyId(this.account_id),
                trade_list: [{
                    trade_date: this.trade_date,
                    sell_bond_key_listed_market: this.bond_key_listed_market,
                    buy_bond_key_listed_market: this.convert_bond_key_listed_market,
                    clean_price: parseFloat(this.price),
                    settlement_days: 0,
                    volume: parseInt(this.volume),
                    user: user.name,
                    manager: user.id
                }]
            })
        }
    };

    $scope.onSelectBond = function (bond_key_listed_market) {
        $scope.trade.convert_bond_key_listed_market = bond_key_listed_market;
    };

    $scope.tradeDateChanged = function () {
        accountUtils.updateValuation($scope);
        accountUtils.updateBondAvailableVolume($scope);
    }

    $scope.bondSelectFun = function (selected) {
        if (selected) {
            $scope.trade.bond_code = selected.originalObject.bond_id;
            $scope.trade.short_name = selected.originalObject.short_name;
            $scope.trade.bond_key_listed_market = selected.originalObject.bond_key_listed_market;

            accountUtils.updateBondAvailableVolume($scope);
            var bond_key = $scope.trade.bond_key_listed_market.slice(0, $scope.trade.bond_key_listed_market.length - 3);
            accountUtils.updateBondInfo($scope);
            $scope.trade.across_mkt_bonds = [];
            $scope.trade.selected = '';
            acrossMktBonds.getBonds({ filter_params: { bond_key: bond_key } }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    if (data.length == 1) {
                        $scope.trade.across_mkt_stat = 2;
                        return;
                    }
                    $scope.trade.across_mkt_stat = 1;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].bond_key_listed_market != $scope.trade.bond_key_listed_market) {
                            $scope.trade.across_mkt_bonds.push(data[i]);
                        }
                    }
                }
            });
        }
    };

    $scope.volumeChanged = function () {
        if ($scope.trade.volume > $scope.trade.available_volume) {
            $scope.trade.volume = $scope.trade.available_volume;
        }
    };


    $scope.$on("dealInput-confirm", function () {
        if (!$scope.display() || !$scope.trade.check()) {
            return;
        }
        $scope.trade.add();
        $scope.trade.init();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });

    $scope.$on("init custody_transfer dlg", function () {
        $scope.trade.init();
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});