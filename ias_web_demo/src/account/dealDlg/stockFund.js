angular.module('ias.account').controller('stockFundInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes, account,
    dealPage, hcMarketData, dataCenter, user, accountUtils, stockQuotation, stockPosition,
    $timeout, fundExchangePosition, fundExchangeQuotation, dateClass) {
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.stock_fund;
    };
    $scope.directionGroup = [
        { label: '买入', value: 1 },
        { label: '卖出', value: -1 }
    ];

    $scope.timePickerConfig = datetimePickerConfig;

    $scope.trade = {
        _getAddParams: function () {
            return {
                type: this.is_stock ? 'stock' : 'fund_exchange',
                account_id: this.account_id,
                company_id: $scope.getCompanyId(this.account_id),
                trade_list: [this._getTradeParams()]
            }
        },
        _getUpdateParams: function () {
            return {
                type: this.is_stock ? 'stock' : 'fund_exchange',
                account_id: hcMarketData.bond.account_id,
                company_id: $scope.getCompanyId(hcMarketData.bond.account_id),
                trade_id: hcMarketData.bond.id,
                trade: this._getTradeParams()
            }
        },
        _getTradeParams: function () {
            var params = {
                trade_date: this.trade_date,
                direction: this.direction,
                volume: this.volume,
                price: parseFloat(this.price),
                manager: user.id
            };
            params[this.is_stock ? 'stock_code' : 'fund_code'] = this.code;
            params[this.is_stock ? 'stock_name' : 'fund_name'] = this.name;
            return params;
        }
    };
    $scope.trade.init = function () {
        this.trade_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        this.code = '';
        this.name = '';
        this.direction = 1;
        this.volume = '';
        this.price = '';
        this.amount = null;
        this.comment = '';
        this.account_id = filterParam.account_id;
        this.show_alert = false;
        this.alert_content = '';
        this.is_edit_mode = false;
        this.is_stock = false;
    };
    $scope.trade.add = function () {
        var params = this._getAddParams();
        $scope.$emit('deal trade add', params);
    };
    $scope.trade.update = function () {
        var params = this._getUpdateParams();
        $scope.$emit('deal trade update', params);
    };
    $scope.trade.check = function () {
        this.show_alert = true;
        this.alert_content = '';
        if (accountUtils.isEmpty(this.code)) {
            this.alert_content = '请选择标的!';
            return false;
        }
        if (accountUtils.isEmpty(this.account_id)) {
            this.alert_content = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty(this.trade_date)) {
            this.alert_content = '请选择交易日!';
            return false;
        }
        if (accountUtils.isEmpty(this.price)) {
            this.alert_content = '请输入价格!';
            return false;
        }
        if (accountUtils.isEmpty(this.volume)) {
            this.alert_content = '请输入量!';
            return false;
        }
        this.show_alert = false;
        return true;
    };

    function updateStockAvailableVolume(callBack) {
        $scope.trade.available_volume = null;
        if (!$scope.trade.account_id) {
            return;
        }
        stockPosition.get({
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            stock_code: $scope.trade.code,
            date: $scope.trade.trade_date,
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                if (data == null || data.volume == undefined || isNaN(data.volume)) {
                    $scope.trade.available_volume = 0;
                } else {
                    $scope.trade.available_volume = parseInt(data.volume);
                }
                if (callBack != null) {
                    callBack();
                }
            }
        });
    }
    function updateStockMaxAvailable() {
        if (1 == $scope.trade.direction) {
            if (!accountUtils.isEmpty($scope.trade.price)) {
                if ($scope.trade.available_fund < 0) {
                    $scope.trade.max_available = 0;
                } else {
                    $scope.trade.max_available = parseInt($scope.trade.available_fund / $scope.trade.price);
                }
            } else {
                $scope.trade.max_available = null;
            }
        } else if (-1 == $scope.trade.direction) {
            $scope.trade.max_available = $scope.trade.available_volume;
        }
    }
    function updateFundExchangeAvailableVolume(callBack) {
        $scope.trade.available_volume = null;
        if (!$scope.trade.account_id) {
            return;
        }
        fundExchangePosition.get({
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            fund_code: $scope.trade.code,
            date: $scope.trade.trade_date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                if (data == null || data.volume == undefined || isNaN(data.volume)) {
                    $scope.trade.available_volume = 0;
                } else {
                    $scope.trade.available_volume = parseInt(data.volume);
                }
                if (callBack != null) {
                    callBack();
                }
            }
        });
    }
    function updateFundExchangeMaxAvailable() {
        if (1 == $scope.trade.direction) {
            if (!accountUtils.isEmpty($scope.trade.price)) {
                if ($scope.trade.available_fund < 0) {
                    $scope.trade.max_available = 0;
                } else {
                    $scope.trade.max_available = parseInt($scope.trade.available_fund / $scope.trade.price);
                }
            } else {
                $scope.trade.max_available = null;
            }
        } else if (-1 == $scope.trade.direction) {
            $scope.trade.max_available = $scope.trade.available_volume;
        }
    }

    $scope.handleTradeDateChanged = function () {
        var trade_date = ($scope.trade.trade_date).replace(/[-]/g, '');
        if ($scope.trade.is_stock) {
            stockQuotation.get({
                stock_code: $scope.trade.code,
                trade_date: trade_date
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $timeout(function () {
                        $scope.trade.price = data.tclose;
                    }, 0);
                    updateStockAvailableVolume(updateStockMaxAvailable);
                }
            });
        } else {
            fundExchangeQuotation.get({
                fund_code: $scope.trade.code,
                trade_date: trade_date
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $timeout(function () {
                        $scope.trade.price = data.tclose;
                    }, 0);
                    updateFundExchangeAvailableVolume(updateFundExchangeMaxAvailable);
                }
            });
        }
    };
    $scope.handleStockFundSelected = function (selected) {
        if (selected) {
            $scope.trade.code = selected.originalObject.code;
            $scope.trade.name = selected.originalObject.name;
            $scope.trade.is_stock = (selected.originalObject.flag == 0);
            $scope.handleTradeDateChanged();
        }
    };

    $scope.volumeChanged = function () {
        if ($scope.trade.trade_date != dateClass.getFormatDate(new Date(), 'yyyy-MM-dd')) {
            return;
        }
        if ($scope.trade.volume > $scope.trade.max_available) {
            $scope.trade.volume = $scope.trade.max_available;
        }
    };
    $scope.directionChanged = function (value) {
        if ($scope.trade.is_stock) {
            updateStockMaxAvailable();
        } else {
            updateFundExchangeMaxAvailable();
        }
    };
    $scope.accountChanged = function (account_id) {
        if (!account_id || account_id === '') {
            return;
        }

        account.get({ account_id: account_id, company_id: $scope.getCompanyId(account_id) }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.trade.available_fund = data.cash_t_0;

                if (accountUtils.isEmpty($scope.trade.code)) {
                    return;
                }
                if ($scope.trade.is_stock) {
                    updateStockAvailableVolume(updateStockMaxAvailable);
                } else {
                    updateFundExchangeAvailableVolume(updateFundExchangeMaxAvailable);
                }
            }
        });
    };

    $scope.trade.init();

    function dealStockFund() {
        if (!$scope.trade.is_edit_mode) {
            $scope.trade.add();
        } else {
            $scope.trade.update();
        }
        $scope.trade.init();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    }

    $scope.$on("dealInput-confirm", function () {
        if (!$scope.display() || !$scope.trade.check()) {
            return;
        }

        $scope.priorRiskCheck({
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            type: $scope.trade.is_stock ? 'stock' : 'fund',
            trade_trial: {
                fund_type: $scope.trade.is_stock ? null : 'exchange',
                code: $scope.trade.code,
                name: $scope.trade.name,
                direction: $scope.trade.direction,
                price: parseFloat($scope.trade.price),
                volume: $scope.trade.volume
            }
        }, dealStockFund);
    });

    $scope.$on("init stock_fund dlg", function () {
        $scope.trade.init();
        $scope.accountChanged($scope.trade.account_id);
    });

    $scope.$on("show stockDlg", function () {
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        selectTypes.dealInput = dealPage.stock_fund;
        $scope.trade.is_edit_mode = true;

        $scope.trade.trade_date = bond.trade_date;//发生时间
        $scope.trade.direction = bond.direction;//方向
        $scope.trade.code = bond.stock_code;
        $scope.trade.name = bond.stock_name;
        $timeout(function () {
            $scope.trade.volume = bond.volume;
            $scope.trade.price = bond.price;
        }, 0);
        $scope.trade.account_id = bond.account_id;
        $scope.trade.is_stock = true;
        dealPage.isShowApply = false;//试算
    });

    $scope.$on("show fundExchangeDlg", function () {
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        selectTypes.dealInput = dealPage.stock_fund;
        $scope.trade.is_edit_mode = true;

        $scope.trade.trade_date = bond.trade_date;//发生时间
        $scope.trade.direction = bond.direction;//方向
        $scope.trade.code = bond.fund_code;
        $scope.trade.name = bond.fund_name;
        $timeout(function () {
            $scope.trade.volume = bond.volume;
            $scope.trade.price = bond.price;
        }, 0);
        $scope.trade.account_id = bond.account_id;
        $scope.trade.is_stock = (bond.market == 'stock');
        dealPage.isShowApply = false;//试算
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
