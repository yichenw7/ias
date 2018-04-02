angular.module('ias.account').controller('treasuryFuturesInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes, account,
    dealPage, hcMarketData, dataCenter, user, accountUtils, stockQuotation, stockPosition, TFPositions, authorityControl,
    $timeout, fundExchangePosition, fundExchangeQuotation, dateClass) {

    $scope.timePickerConfig = datetimePickerConfig;
    $scope.display = () => selectTypes.dealInput == dealPage.treasury_futures;
    $scope.directionGroup = [
        { label: '买入', value: 1 },
        { label: '卖出', value: -1 }
    ];
    $scope.offsetGroup = [
        { label: '开仓', value: 0 },
        { label: '平仓', value: 1 }
    ];

    function getTFPosition() {
        TFPositions.post({
            account_list: authorityControl.getAccountGroupMember([$scope.trade.account_id]),
            date: $scope.trade.trade_date,
            tf_id: $scope.trade.getTFId(),
        }, function (response) {
            if (response.code && response.code === '0000') {
                const data = response.data;
                $scope.position = {
                    short: 0,
                    long: 0,
                    info: {},
                };
                const map = { '1': 'long', '-1': 'short' };
                data.forEach(item => $scope.position[map[item.posi_direction]] = item.position);
                $scope.position.info = data.length && data[0];
            }
        })
    }

    class TFTrade {
        constructor(oldTrade) {
            if (oldTrade) {
                this.account_id = oldTrade.account_id;
                this.direction = oldTrade.direction;
                this.offset = oldTrade.offset;
                this.price = oldTrade.price;
                this.volume = oldTrade.volume;
                this.trade_date = oldTrade.trade_date;
                this.tfType = oldTrade.tf_id.length === 6 ? 'TF' : 'T';
                this.tfYear = oldTrade.tf_id.substring(oldTrade.tf_id.length - 4, oldTrade.tf_id.length - 2);
                this.tfMonth = oldTrade.tf_id.substring(oldTrade.tf_id.length - 2);
                this.comment = oldTrade.comment;

                this.trade_id = oldTrade.id;
            } else {
                this.account_id = filterParam.account_id;
                this.init();
            }
        }

        init() {
            this.direction = 1;
            this.offset = 0;
            this.price = '';
            this.volume = '';
            this.trade_date = $filter('date')(new Date(), 'yyyy-MM-dd');
            this.tfType = 'TF';
            this.comment = '';

            var ref_date = new Date();
            ref_date.setMonth(ref_date.getMonth() + 3);
            this.tfYear = '' + ref_date.getYear() % 100;
            var m = ref_date.getMonth();
            if(m >= 8) {
                this.tfMonth = '12';
            } else {
                this.tfMonth = '0' + (m + 4 - (m + 1) % 3);
            }
        }

        getTFId() {
            return `${this.tfType}${this.tfYear}${this.tfMonth}`
        }

        check() {
            this.show_alert = true;
            this.alert_content = '';
            if (this.tfYear < 13 || this.tfYear > 99) {
                this.alert_content = '错误：期货年份超出范围！';
                return false;
            }

            if (!this.price) {
                this.alert_content = '请输入有效价格！';
                return false;
            }

            if (!this.volume) {
                this.alert_content = '请输入有效数量！';
                return false;
            }

            if(this.offset == 1 && ((this.direction == -1 &&  $scope.position.long < this.volume) ||
                (this.direction == 1 && $scope.position.short < this.volume))) {
                this.alert_content = '可平仓量不足！'
                return false;
            }

            this.show_alert = false;
            this.alert_content = '';
            return true;
        }

        toJson() {
            return {
                tf_id: this.getTFId(),
                offset: this.offset,
                direction: this.direction,
                volume: this.volume,
                price: this.price,
                trade_date: this.trade_date,
                comment: this.comment,
                user: user.name,
                manager: user.id,
            }
        }

        toAddParams() {
            return {
                type: 'tf',
                account_id: this.account_id,
                company_id: $scope.getCompanyId(this.account_id),
                trade_list: [this.toJson()]
            }
        }

        toUpdateParams() {
            return {
                type: 'tf',
                account_id: this.account_id,
                company_id: $scope.getCompanyId(this.account_id),
                trade_id: this.trade_id,
                trade: this.toJson()
            }
        }

    }

    $scope.handleTradeChanged = function() {
        getTFPosition();
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

    $scope.$on("trade add success tf", function(){
        getTFPosition();
    });


    $scope.$on("init treasury_futures dlg", function () {
        $scope.trade = new TFTrade();
        getTFPosition();
    });

    $scope.$on("show edit trade dealDlg", function (event, data) {
        if (data.type !== 'tf') return;
        const oldTrade = data.trade;
        hcMarketData.showBtnList = false;
        selectTypes.dealInput = dealPage.treasury_futures;
        dealPage.isShowApply = false;//试算

        $scope.trade = new TFTrade(oldTrade);
        getTFPosition();
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
