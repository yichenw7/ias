angular.module('ias.account').controller('depositInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes,
                                                        dealPage, hcMarketData, dataCenter, accountUtils, user) {
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.deposit;
    };

    $scope.timePickerConfig = datetimePickerConfig;
    $scope.directionGroup = [
        { label: '存入', value: 1 },
        { label: '存出', value: -1 }
    ];

    $scope.trade = {
        init: function () {
            this._resetAlert();
            this.initial_date = $filter('date')(new Date(), 'yyyy-MM-dd');
            this.account_id = filterParam.account_id;
            this.counter_party_bank = '';
            this.direction = $scope.directionGroup[0].value;
            this.deposit_rate = '';
            this.amount = '';
            this.term = '';
            this.maturity_date = '';
            this.comment = '';
            this.day_counter = 'A/360';
            this.user = user.name,
            this.manager = user.id
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
            if (accountUtils.isEmpty(this.maturity_date)) {
                this.alert_content = '请选择到期日!';
                return false;
            }
            if (this.initial_date > this.maturity_date) {
                this.alert_content = '到期日不能早于发生日期!';
                return false;
            }
            if (accountUtils.isEmpty(this.deposit_rate)) {
                this.alert_content = '请输入存款利率!';
                return false;
            }
            if (accountUtils.isEmpty(this.amount)) {
                this.alert_content = '请输入金额!';
                return false;
            }
            this.show_alert = false;
            return true;
        },
        set: function (tradeData) {
            this._resetAlert();
            this.direction = tradeData.direction;
            this.id = tradeData.id;
            this.account_id = tradeData.account_id;
            this.initial_date = tradeData.initial_date;
            this.maturity_date = tradeData.maturity_date;
            this.amount = tradeData.amount;
            this.counter_party_account = tradeData.counter_party_account;
            this.term = getTerm(tradeData.initial_date, tradeData.maturity_date);
            this.day_counter = tradeData.day_counter;

            this.deposit_rate = parseFloat(tradeData.deposit_rate) * 100;
            this.comment = tradeData.comment;
            this.counter_party_bank = tradeData.counter_party_company;
        },
        _getQueryParams: function () {
            return {
                initial_date: this.initial_date,
                maturity_date: this.maturity_date,
                direction: this.direction,
                amount: parseFloat(this.amount),
                deposit_rate: parseFloat(this.deposit_rate) / 100,
                comment: this.comment,
                counter_party_company: this.counter_party_bank,
                day_counter: this.day_counter,
                user: user.name,
                manager: user.id
            }
        },
        add: function () {
            $scope.$emit('deal trade add', {
                type: 'deposit',
                account_id: this.account_id,
                company_id: $scope.getCompanyId(this.account_id),
                trade_list: [this._getQueryParams()]
            });
        },
        update: function () {
            $scope.$emit('deal trade update', {
                type: 'deposit',
                account_id: this.account_id,
                company_id: $scope.getCompanyId(this.account_id),
                trade_id: this.id,
                trade: this._getQueryParams()
            });
        }
    };

    function getTerm(initial, maturity) {
        var term = '';
        if (initial && maturity) {
            term = (new Date(maturity) - new Date(initial)) / 1000 / 60 / 60 / 24;
            term = term >= 0 ? parseInt(term) : '';
        }
        return term;
    }

    $scope.handleMaturityDateChange = function (initial, maturity) {
        $scope.trade.term = getTerm(initial, maturity);
    };

    $scope.$on("dealInput-confirm", function () {
        if (!$scope.display() || !$scope.trade.check()) {
            return;
        }

        if (hcMarketData.showBtnList) {
            $scope.trade.add();
        } else {
            $scope.trade.update();
        }

        $scope.trade.init();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });

    $scope.$on("show depositDlg", function (event, depositTrade) {
        selectTypes.dealInput = dealPage.deposit;
        dealPage.isShowApply = false;
        hcMarketData.showBtnList = false;

        $scope.trade.set(depositTrade);
    });

    $scope.$on("init deposit dlg", function () {
        $scope.trade.init();
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});