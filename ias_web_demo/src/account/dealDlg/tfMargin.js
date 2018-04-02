angular.module('ias.account').controller('tfMarginInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes, account,
    dealPage, hcMarketData, dataCenter, user) {

    $scope.timePickerConfig = datetimePickerConfig;
    $scope.display = () => selectTypes.dealInput == dealPage.treasury_futures_margin;
    $scope.directionGroup = [
        { label: '缴纳', value: 1 },
        { label: '赎回', value: -1 }
    ];


    class TFMargin {
        constructor(oldTrade) {
            if (oldTrade) {
                this.account_id = oldTrade.account_id;
                this.direction = oldTrade.direction;
                this.amount = oldTrade.amount;
                this.trade_date = oldTrade.trade_date;
                this.comment = oldTrade.comment;

                this.trade_id = oldTrade.id;
            } else {
                this.account_id = filterParam.account_id;
                this.init();
            }
        }

        init() {
            this.direction = 1;
            this.amount = '';
            this.trade_date = $filter('date')(new Date(), 'yyyy-MM-dd');
            this.comment = '';
        }

        check() {
            this.show_alert = true;
            this.alert_content = '';

            if (!this.amount) {
                this.alert_content = '请输入有效金额！';
                return false;
            }

            this.show_alert = false;
            this.alert_content = '';
            return true;
        }

        toJson() {
            return {
                direction: this.direction,
                amount: this.amount,
                trade_date: this.trade_date,
                comment: this.comment,
                user: user.name,
                manager: user.id,
            }
        }

        toAddParams() {
            return {
                type: 'tf_margin',
                account_id: this.account_id,
                company_id: $scope.getCompanyId(this.account_id),
                trade_list: [this.toJson()]
            }
        }

        toUpdateParams() {
            return {
                type: 'tf_margin',
                account_id: this.account_id,
                company_id: $scope.getCompanyId(this.account_id),
                trade_id: this.trade_id,
                trade: this.toJson()
            }
        }
    }

    $scope.handleTradeChanged = function() {
    };

    $scope.$on("dealInput-confirm", function () {
        if (!$scope.display() || !$scope.trade.check()) {
            return;
        }

        if (hcMarketData.showBtnList) {
            $scope.$emit('deal trade add', $scope.trade.toAddParams());
        } else {
            $scope.$emit('deal trade update', $scope.trade.toUpdateParams());
        }
        $scope.trade.init();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });

    $scope.$on("init treasury_futures_margin dlg", function () {
        $scope.trade = new TFMargin();
    });

    $scope.$on("show edit trade dealDlg", function (event, data) {
        if (data.type !== 'tf_margin') return;
        const oldTrade = data.trade;
        hcMarketData.showBtnList = false;
        selectTypes.dealInput = dealPage.treasury_futures_margin;
        dealPage.isShowApply = false;//试算

        $scope.trade = new TFMargin(oldTrade);
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
