angular.module('ias.account').controller('dividendInputCtrl', function($scope, datetimePickerConfig, filterParam, $filter, selectTypes,
                                                        hcMarketData, dealPage, dataCenter, accountUtils, MarketCalendar) {

    $scope.timePickerConfig = datetimePickerConfig;
    $scope.typeGroup = [
        {label:'现金分红',value:1},
        // {label:'红利再投资',value:-1}
    ];
    $scope.trade = {
        init: function () {
            this.start_date = $filter('date')(new Date(), 'yyyy-MM-dd');
            this.direction = 1;
            this.settlement_days = '0';
            this.comment = '';
            this.account_id = filterParam.account_id;
            this.amount = '';
            this.in_edit_mode = false;
            this.id = '';
            this.settlement_date = '';
            this.customer = '';
        },
        set: function(oldData) {
            this.in_edit_mode = true;
            this.show_alert = false;
            this.alert_content = '';

            this.direction = oldData.type === 'cash_dividend' ? 1 : -1;
            this.start_date = oldData.type === 'cash_dividend' ? oldData.dividend_date : oldData.trade_date;
            this.id = oldData.id;
            this.settlement_days = oldData.settlement_days.toString();
            this.account_id = oldData.account_id;
            this.amount = oldData.amount;
            this.comment = oldData.comment;
            this.settlement_date = oldData.settlement_date;
            this.customer = oldData.customer;
        },
        check: function () {
            this.show_alert = true;
            this.alert_content = '';
            if (accountUtils.isEmpty(this.account_id)) {
                this.alert_content = '请选择账户!';
                return false;
            }
            if (accountUtils.isEmpty(this.amount)) {
                this.alert_content = '请输入金额!';
                return false;
            }
            this.show_alert = false;
            return true;
        }
    };

    $scope.display = function() {
        return selectTypes.dealInput == dealPage.dividend;
    };
    $scope.updateCashDividend = function(){
        $scope.$emit('deal trade update', {
            type: 'cash_dividend',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_id: $scope.trade.id,
            trade: {
                amount: parseFloat($scope.trade.amount),
                dividend_date: $scope.trade.start_date,
                settlement_days: parseInt($scope.trade.settlement_days),
                settlement_date: $scope.trade.settlement_date,
                comment: $scope.trade.comment,
                customer: $scope.trade.customer
            }
        });
    };
    $scope.addCashDividend = function(){
        $scope.$emit('deal trade add', {
            type: 'cash_dividend',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_list: [{
                amount: parseFloat($scope.trade.amount),
                dividend_date: $scope.trade.start_date,
                settlement_days: parseInt($scope.trade.settlement_days),
                settlement_date: $scope.trade.settlement_date,
                customer: $scope.trade.customer,
                comment: $scope.trade.comment
            }]
        });
    };
    $scope.updateDividendReinvestment = function(){
        $scope.$emit('deal trade update', {
            type: 'dividend_reinvestment',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_id: $scope.trade.id,
            trade: {
                amount: parseFloat($scope.trade.amount),
                trade_date: $scope.trade.start_date,
                settlement_days: parseInt($scope.trade.settlement_days),
                settlement_date: $scope.trade.settlement_date,
                comment: $scope.trade.comment,
                customer: $scope.trade.customer
            }
        });
    };
    $scope.addDividendReinvestment = function(){
        $scope.$emit('deal trade add', {
            type: 'dividend_reinvestment',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_list: [{
                amount: parseFloat($scope.trade.amount),
                trade_date: $scope.trade.start_date,
                settlement_days: parseInt($scope.trade.settlement_days),
                settlement_date: $scope.trade.settlement_date,
                customer: $scope.trade.customer,
                comment: $scope.trade.comment
            }]
        });
    };
    $scope.getSettlementDate = function(){
        if(accountUtils.isEmpty($scope.trade.account_id)){
            return ;
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
            }
        });

    };
    $scope.init_data = function(){
        $scope.trade.init();
        $scope.getSettlementDate();
    };
    $scope.init_data();
    $scope.$on("init dividend dlg",function(){
        $scope.init_data();
    });
    $scope.$on("show dividendDlg",function(event, data){
        selectTypes.dealInput = dealPage.dividend;
        hcMarketData.showBtnList = false;
        dealPage.isShowApply = false;

        $scope.trade.set(data)
    });
    $scope.$on("dealInput-confirm", function(){
        if(dealPage.dividend != selectTypes.dealInput){
            return;
        }
        if(!$scope.trade.check()){
            return;
        }
        if($scope.trade.in_edit_mode){
            if($scope.trade.direction == 1) {
                $scope.updateCashDividend();
            } else {
                $scope.updateDividendReinvestment();
            }
        } else {
            if($scope.trade.direction == 1) {
                $scope.addCashDividend();
            } else {
                $scope.addDividendReinvestment();
            }
        }
        $scope.init_data();
        if(!dealPage.confirm_continue){
            $scope.dismiss();
        }
    });
    $scope.$on('$destroy', function() {
        $scope = null;
    });
});