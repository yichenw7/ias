angular.module('ias.account').controller('fundOtcInputCtrl', function($scope, datetimePickerConfig, filterParam, $filter, selectTypes, fundQuery,
                                                       fundOtcPosition, dealPage, hcMarketData, dataCenter, user, accountUtils, fundOtcQuotation, $timeout, fundMnyIncm) {
    $scope.display = function() {
        return selectTypes.dealInput == dealPage.fund_otc;
    };


    $scope.timePickerConfig = datetimePickerConfig;
    $scope.directionGroup = [
        {label: '申购', value: 1},
        {label: '赎回', value: -1}
    ];
    $scope.trade = {
        _getOtcParams: function () {
            $scope.trade.setVolume();
            return {
                trade_date: this.trade_date,
                fund_code: this.fund_code,
                fund_name: this.fund_name,
                direction: this.direction,
                volume: this.volume,
                price: parseFloat(this.price),
                amount: this.amount,
                fee_type: this.fee_type,
                fee_value: this.fee_type == 'rate' ? this.fee_value * 0.01 : this.fee_value,
                manager: user.id,
            }
        },
        _getMnyParams: function () {
            return {
                trade_date: this.trade_date,
                fund_code: this.fund_code,
                fund_name: this.fund_name,
                direction: this.direction,
                amount: this.direction === 1 ? this.amount : this.volume,
                settlement_days: parseInt(this.settlement_days),
                manager: user.id,
                fund_type: 'money_funds',
            }
        },
    };

    $scope.trade.init = function () {
        this.show_alert = false;
        this.alert_content = '';
        this.is_edit_mode = false;
        this.trade_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        this.account_id = filterParam.account_id;

        this.direction = 1;
        this.fund_code = '';
        this.fund_name = '';
        this.isMoneyFund = false;

        this.unit_net = '';
        this.available_volume = '';
        this.price = '';
        this.volume = '';
        this.amount = '';
        this.fee_type = 'rate';
        this.fee_rate = '';
        this.fee_value = '';
        this.tenthou_unit_incm = '';
        this.settlement_days = "0";
    };
    $scope.trade.check = function () {
        this.show_alert = true;
        this.alert_content = '';
        if (accountUtils.isEmpty(this.fund_code)) {
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
        if (accountUtils.isEmpty(this.price) && !this.isMoneyFund) {
            this.alert_content = '请输入净值!';
            return false;
        }
        if (1 == this.direction && accountUtils.isEmpty(this.amount)) {
            this.alert_content = '请输入购买金额!';
            return false;
        }
        if (-1 == this.direction && accountUtils.isEmpty(this.volume)) {
            this.alert_content = '请输入赎回份额!';
            return false;
        }
        if (1 == this.direction && this.fee_value === '' && !this.isMoneyFund) {
            this.alert_content = '请输入购买费率!';
            return false;
        }
        if (-1 == this.direction && this.fee_value === '' && !this.isMoneyFund) {
            this.alert_content = '请输入赎回费率!';
            return false;
        }
        this.show_alert = false;
        return true;
    };
    $scope.trade.setVolume = function () {
        if ((-1 == this.direction) || accountUtils.isEmpty(this.amount)
            || this.fee_value === '' || accountUtils.isEmpty(this.price)) {
            return;
        }
        // 基金份额： 金额 / (1 + 费率) / 单位净值
        if (this.fee_type == 'rate') {
            this.volume = parseFloat(this.amount) / (1 + this.fee_value * 0.01) / this.price;
        } else {
            this.volume = (this.amount - this.fee_value) / this.price;
        }
    };
    $scope.trade.add = function() {
        $scope.$emit('deal trade add', {
            type: 'fund_otc',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_list: [this.isMoneyFund ? this._getMnyParams() : this._getOtcParams()]
        });
    }
    $scope.trade.update = function () {
        $scope.$emit('deal trade update', {
            type: 'fund_otc',
            account_id: hcMarketData.bond.account_id,
            company_id: $scope.getCompanyId(hcMarketData.bond.account_id),
            trade_id: hcMarketData.bond.id,
            trade: this.isMoneyFund ? this._getMnyParams() : this._getOtcParams()
        });
    }
    $scope.trade.getFeeRate = function(){
        // 由费用算费率： amount/(amount-fee)  - 1
        if((1 == $scope.trade.direction && accountUtils.isEmpty($scope.trade.amount))
            || (-1 == $scope.trade.direction && accountUtils.isEmpty($scope.trade.volume))
            || accountUtils.isEmpty($scope.trade.fee_value)){
            return;
        }
        if(-1 == $scope.trade.direction){
            $scope.trade.amount = $scope.trade.price * $scope.trade.volume;
        }
    };
    $scope.trade.getFundInfo = function () {
        var self = this;
        if (this.isMoneyFund) {
            this.tenthou_unit_incm = '';
            fundMnyIncm.get({
                fund_code: this.fund_code,
                trade_date: this.trade_date
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    self.tenthou_unit_incm = data.tenthou_unit_incm;
                }
            });
        } else {
            this.unit_net = '';
            this.price = '';
            fundOtcQuotation.get({
                fund_code: this.fund_code,
                trade_date: this.trade_date.replace(/[-]/g, '')
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    self.unit_net = data.unit_net;
                    self.price = data.unit_net;
                }
            });
        }
    };
    $scope.trade.getPositionVolume = function () {
        if (!this.account_id) {
            return;
        }
        var self = this
        this.available_volume = null;
        fundOtcPosition.get({
            account_id: this.account_id,
            company_id: $scope.getCompanyId(this.account_id),
            fund_code: this.fund_code,
            date: this.trade_date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                self.available_volume = data.volume ? data.volume : 0;
            }
        });
    };

    $scope.handleVolumeChanged = function(){
        var today = $filter('date')(new Date(), 'yyyy-MM-dd');
        if($scope.trade.trade_date == today && $scope.trade.volume > $scope.trade.max_available){
            $scope.trade.volume = $scope.trade.max_available;
        }
    };
    $scope.handleAmountChanged = function(){
        $scope.trade.getFeeRate();
        $scope.trade.setVolume();
    };
    $scope.handlePriceChanged = function(){
        $scope.trade.setVolume();
    };
    $scope.handleFeeChanged = function(){
        $scope.trade.getFeeRate();
        $scope.trade.setVolume();
    };
    $scope.handleFundOtcSelected = function (selected) {
        if (selected) {
            $scope.trade.fund_code = selected.originalObject.fund_code;
            $scope.trade.fund_name = selected.originalObject.fundsname;
            $scope.trade.isMoneyFund = selected.originalObject.type === 4;
            $scope.trade.getFundInfo();
            $scope.trade.getPositionVolume();
        } else {
            $scope.trade.fund_code = '';
            $scope.trade.fund_name = '';
            $scope.trade.isMoneyFund = false;
            $scope.trade.unit_net = '';
            $scope.trade.price = '';
            $scope.trade.tenthou_unit_incm = '';
        }
    };
    $scope.handleTradeDateChanged = function () {
        if ($scope.trade.fund_code) {
            $scope.trade.getFundInfo();
            $scope.trade.getPositionVolume();
        }
    };
    $scope.handleAccountChanged = function () {
        if ($scope.trade.fund_code) {
            $scope.trade.getPositionVolume();
        }
    };

    function dealFundOtc() {
        if (!$scope.trade.is_edit_mode) {
            $scope.trade.add();
        } else {
            $scope.trade.update();
        }
        $scope.trade.init();
        $scope.$broadcast('angucomplete-alt:clearInput', 'fundSearchBox');
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    }

    $scope.$on("init fund_otc dlg",function(){
        $scope.trade.init();
    });

    $scope.$on("dealInput-confirm", function(){
        if(!$scope.display() || !$scope.trade.check()){
            return;
        }

        $scope.priorRiskCheck({
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            type: 'fund',
            trade_trial: {
                fund_type: 'otc',
                code: $scope.trade.fund_code,
                name: $scope.trade.fund_name,
                direction: $scope.trade.direction,
                // 这里的逻辑很奇怪，不改页面改不了。
                // 货币基金的申购赎回针对的都是 金额 = amount，其他基金都是 份额 = volume
                volume: ($scope.trade.direction === -1) ? $scope.trade.volume : ($scope.trade.isMoneyFund ? $scope.trade.amount : $scope.trade.volume),
                price: $scope.trade.isMoneyFund ? 1 : parseFloat($scope.trade.price),
                fee_type: $scope.trade.fee_type,
                fee_value: $scope.trade.fee_type == 'rate' ? $scope.trade.fee_value*0.01 : $scope.trade.fee_value
            }
        }, dealFundOtc);
    });

    $scope.$on("show fundOtcDlg",function(){
        var bond = hcMarketData.bond;
        hcMarketData.showBtnList = false;
        $scope.trade.show_alert = false;
        $scope.trade.alert_content = '';
        selectTypes.dealInput = dealPage.fund_otc;
        $scope.trade.is_edit_mode = true;

        $scope.trade.trade_date = bond.trade_date;//发生时间
        $scope.trade.direction = bond.direction;//方向
        $scope.trade.fund_code = bond.fund_code;
        $scope.trade.fund_name = bond.fund_name;
        if (bond.fund_type === 'money_funds') {
            $scope.trade.settlement_days = bond.settlement_days.toString();
        }

        fundQuery.get({fund_code: $scope.trade.fund_code}, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.trade.isMoneyFund = data.type === 4;
                $scope.trade.getFundInfo()

                // if ($scope.trade.isMoneyFund) {
                //     fundMnyIncm.get({
                //         fund_code: $scope.trade.fund_code,
                //         trade_date: $scope.trade.trade_date
                //     }, function success(response) {
                //         if (response.code && response.code === '0000') {
                //             var data = response.data;
                //             $scope.trade.tenthou_unit_incm = data.tenthou_unit_incm;
                //         }
                //     });
                // }
            }
        });

        $timeout(function(){
            $scope.trade.volume = bond.volume;
            $scope.trade.price = bond.price;
            $scope.trade.amount = Math.abs(bond.amount);
        },0);
        $scope.trade.fee_type = bond.fee_type;
        if (bond.fee_type == 'rate'){
            $scope.trade.fee_value = bond.fee_value*100;
        }else{
            $scope.trade.fee_value = bond.fee_value;
        }

        $scope.trade.account_id = bond.account_id;
        $scope.trade.getPositionVolume();
        dealPage.isShowApply=false;//试算
    });

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
