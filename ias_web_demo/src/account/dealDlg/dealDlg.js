angular.module('ias.account').controller('dealInputCtrl', function($scope, $filter, selectTypes, dealPage, hcMarketData,dataCenter,
    authorityConstant, authorityControl, user, priorRiskCheck, messageBox, Trade, Trades) {
    $scope.inputGroup = [
        {label: '现券', value: dealPage.cash, isHide: false, msgStr: 'init cash dlg'},
        {label: '一级成交', value: dealPage.primary_deal, isHide: false, msgStr: 'init primary_deal dlg'},
        {label: '存款', value: dealPage.deposit, isHide: false, msgStr: 'init deposit dlg'},
        {label: '拆借', value: dealPage.bank_lending, isHide: false, msgStr: 'init bank_lending dlg'},
        {label: '理财', value: dealPage.finance, isHide: false, msgStr: 'init finance dlg'},
        {label: '银行间回购', value: dealPage.bank_repo, isHide: false, msgStr: 'init bank_repo dlg'},
        {label: '买断式回购', value: dealPage.buyout_repo, isHide: false, msgStr: 'init buyout_repo dlg'},
        {label: '交易所回购', value: dealPage.exchange_repo, isHide: false, msgStr: 'init exchange_repo dlg'},
        {label: '协议式回购', value: dealPage.protocol_repo, isHide: false, msgStr: 'init protocol_repo dlg'},
        {label: '交易所质押', value: dealPage.exchange_pledge, isHide: false, msgStr: 'init exchange_pledge dlg'},
        {label: '股票/交易所基金', value: dealPage.stock_fund, isHide: false, msgStr: 'init stock_fund dlg'},
        {label: '场外基金', value: dealPage.fund_otc, isHide: false, msgStr: 'init fund_otc dlg'},
        {label: '国债期货', value: dealPage.treasury_futures, isHide: false, msgStr: 'init treasury_futures dlg'},
        {label: '国债期货保证金', value: dealPage.treasury_futures_margin, isHide: false, msgStr: 'init treasury_futures_margin dlg'},
        {label: '申购/赎回', value: dealPage.purchase_redemption, isHide: false, msgStr: 'init purchase_redemption dlg'},
        {label: '产品分红', value: dealPage.dividend, isHide: false, msgStr: 'init dividend dlg'},
        {label: '备付金', value: dealPage.exess_reserve, isHide: false, msgStr: 'init exess_reserve dlg'},
        {label: '转托管', value: dealPage.custody_transfer, isHide: false, msgStr: 'init custody_transfer dlg'},
        {label: '费用', value: dealPage.fee, isHide: false, msgStr: 'init fee dlg'},
    ];
    $scope.dealPage = dealPage;
    $scope.showBtnList = hcMarketData.showBtnList;
    $scope.myAccounts = dataCenter.account.accountsData;

    $scope.$watchCollection(
        function () { return dataCenter.account.accountsData; },
        function () {
            $scope.myAccounts = dataCenter.account.accountsData;
        }
    );
    $scope.$watch(
        function(){ return hcMarketData.showBtnList},
        function(newValue, oldValue){
            if (newValue === oldValue) {
                return ;
            }
            $scope.showBtnList = hcMarketData.showBtnList;
        }
    );
    $scope.trade = {
        tabType: dealPage.cash
    };
    $scope.dayCounterGroup = [
        { label: 'A/365', value: 'A/365' },
        { label: 'A/360', value: 'A/360' },
        { label: 'A/A', value: 'A/A' },
        { label: '30/360', value: '30/360' }
    ];
    $scope.changeBtn = function(value){
        selectTypes.dealInput = value;
        if(dealPage.cash == value||dealPage.primary_deal == value){
            dealPage.isShowApply = true;
        }
        else{
            dealPage.isShowApply = false;
        }
        $.each($scope.inputGroup, function(index, val){
            if (selectTypes.dealInput == val.value){
                $scope.$broadcast(val.msgStr);
            }
        });
    };

    $scope.priorRiskCheck = function (trade, callback) {
        priorRiskCheck.add(
            trade,
            function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    if (data.success || data === null) {
                        callback();
                    } else {
                        if ($.isNumeric(data.risk_info.current_value)) {
                            data.risk_info.current_value = Number(data.risk_info.current_value).toFixed(4);
                        }
                        var errMsg = '拒绝交易！\n当前交易单触发风控规则：' +
                            $filter('riskConditionFilter')(data.risk_info.index_name) + data.risk_info.operator + data.risk_info.cond_value + '\n' +
                            '当前交易单：' + data.risk_info.current_value;
                        messageBox.warn(errMsg);
                    }
                } else {
                    messageBox.warn("风控检查失败，继续录入该笔交易");
                    callback();
                }
            },
            function failure() {
                messageBox.warn("风控检查失败，继续录入该笔交易");
                callback();
            }
        );
    };

    //账户选项过滤
    $scope.getEditAccount = function (account) {
        return (account.option == authorityConstant.ACCOUNT_WRITE);
    };
    //获取company_id
    $scope.getCompanyId = function (accountId){
        return authorityControl.getAuthorityAndAgentCompany(accountId).agent_company_id || user.company_id;
    };

    // $("#dealInputWin").on('hidden.bs.modal', function() {
    //     hcMarketData.showBtnList = true;
    // });

    $scope.dismiss = function(){
        $("#dealInputWin").modal('hide');
    };
    $scope.confirm = function() {
        dealPage.confirm_continue = false;
        $scope.$broadcast('dealInput-confirm');
    };
    $scope.apply = function() {
        $scope.$broadcast('dealInput-apply');
    };
    $scope.confirmContinue = function() {
        dealPage.confirm_continue = true;
        $scope.$broadcast('dealInput-confirm');
    };

    function tradeSuccess(response) {
        dealPage.isTrading = false;
        dealPage.isTradeSuccess = (response.code && response.code === '0000');
        dealPage.err = response.code;

        if (!dealPage.isTradeSuccess) {
            messageBox.error('该笔成交录入失败！')
        } else if (!dealPage.confirm_continue) {
            $scope.dismiss();
        } else {
            $scope.$broadcast("trade add success " + dealPage.tradeType);
        }
    }
    function tradeFailure() {
        dealPage.isTrading = false;
        dealPage.isTradeSuccess = false;
        dealPage.err = '错误：网络错误';
        messageBox.error('该笔成交录入失败！')
    }

    $scope.$on('deal trade add', function(event, data) {
        dealPage.isTrading = true;
        dealPage.tradeType = data.type
        Trades.add(data, tradeSuccess, tradeFailure)
    })

    $scope.$on('deal trade update', function(event, data) {
        dealPage.isTrading = true;
        Trade.update(data, tradeSuccess, tradeFailure)
    })

    $scope.$on("show DealInputDlg", function(){
        $.each($scope.inputGroup, function(index, btn) {
            btn.isHide = false;
        });
        dealPage.isShowApply = true;
        $scope.trade.tabType = dealPage.cash;
        $scope.changeBtn(dealPage.cash);
    });

    $scope.$on('$destroy', function() {
        $scope = null;
    })
});
