angular.module('ias.account').controller('positionSheetCtrl', function ($scope, $filter, datetimePickerConfig, distinguishGroupName,
    cashPositions, filterParam, excelExport, messageBox, winStatus, dateClass, accountService) {
    $scope.isT0InClosed = true;
    $scope.isT0OutClosed = true;
    $scope.isAdjustClosed = true;
    distinguishGroupName.isGroupPositionSheet = false;

    function getCashPositionSheet() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        cashPositions.get({
            account_id: filterParam.account_id,
            company_id: $scope.getCompanyId(filterParam.account_id),
            date: $scope.positionDate.date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.trade.date = data.date;
                $scope.trade.t_0_start = data.t_0_start;
                $scope.trade.t_0_in = data.t_0_in;
                $scope.trade.t_0_out = data.t_0_out;
                $scope.trade.t_0_end = data.t_0_end;
                // 昨日t+0
                $scope.trade.t_0_last = data.t_0_last;

                //// 入账
                $scope.trade.t_0_new_play_back = createEmptyList(data.date);      // T+0打新回款
                $scope.trade.t_0_income_sell_bonds = data.t_0_in_detail.interbank_trade_sell_t_0; // T+0银行间卖券收入
                $scope.trade.t_0_bank_borrow_money = data.t_0_in_detail.interbank_repo_init; // T+0银行T+0借款
                $scope.trade.t_0_bank_sell_bonds = data.t_0_in_detail.interbank_trade_sell_t_0;   // T+0银行间T+0卖券
                $scope.trade.t_0_other_income = data.t_0_in_detail.other_in_t_0;      // T+0其他收入
                $scope.trade.t_0_account_purchase = data.t_0_in_detail.fund_purchase_t_0;  // T+0账户申购到账
                $scope.trade.bank_lending_in_init = data.t_0_in_detail.bank_lending_in_init; // 拆入初始
                $scope.trade.protocol_repo_init = data.t_0_in_detail.protocol_repo_init; // T+0协议式回购
                $scope.trade.buyout_repo_init = data.t_0_in_detail.buyout_repo_init;    // 买断式回购
                $scope.trade.deposit_in_init = data.t_0_in_detail.deposit_in_init; // 存入
                $scope.trade.tf_margin_in = data.t_0_in_detail.tf_margin_in;  // 国债期货保证金赎回
                // 出账
                $scope.trade.interbank_reverse_repo_init = data.t_0_out_detail.interbank_reverse_repo_init;
                $scope.trade.t_0_t0_bank_buy_bonds = data.t_0_out_detail.interbank_trade_buy_t_0;    // T+0银行间T+0买券
                $scope.trade.deposit_out_init = data.t_0_out_detail.deposit_out_init;
                $scope.trade.t_0_finance_init = data.t_0_out_detail.finance_init;  // T+0理财
                $scope.trade.t_0_fund_redeem_t_0 = data.t_0_out_detail.fund_redeem_t_0;  // 账户赎回T+0
                $scope.trade.t_0_other_t0_pay = data.t_0_out_detail.other_out_t_0;         // 其他T+0支出
                $scope.trade.bank_lending_out_init = data.t_0_out_detail.bank_lending_out_init; // 拆出初始
                $scope.trade.protocol_reverse_repo_init = data.t_0_out_detail.protocol_reverse_repo_init;
                $scope.trade.out_fee = data.t_0_out_detail.out_fee;
                $scope.trade.buyout_reverse_repo_init = data.t_0_out_detail.buyout_reverse_repo_init; //  买断式逆回购首期
                $scope.trade.tf_margin_out = data.t_0_out_detail.tf_margin_out;  // 国债期货保证金缴纳
                // 汇总
                $scope.trade.t_0_bank_available_bonds = createEmptyList(data.date);  // 银行间剩余T+0可用券
                $scope.trade.t_0_account_lowest_gap = createEmptyList(data.date);   // 账户最低缺口

                // 调整科目
                $scope.trade.t_0_settlement = data.t_0_settlement;
                $scope.trade.coupon = data.t_0_settlement_detail.coupon;
                $scope.trade.redemption = data.t_0_settlement_detail.redemption;
                $scope.trade.interbank_repo_maturity = data.t_0_settlement_detail.interbank_repo_maturity;
                $scope.trade.interbank_reverse_repo_maturity = data.t_0_settlement_detail.interbank_reverse_repo_maturity;
                $scope.trade.exchange_repo_maturity = data.t_0_settlement_detail.exchange_repo_maturity;
                $scope.trade.exchange_reverse_repo_maturity = data.t_0_settlement_detail.exchange_reverse_repo_maturity;
                $scope.trade.interbank_trade_buy_t_1 = data.t_0_settlement_detail.interbank_trade_buy_t_1;
                $scope.trade.interbank_trade_sell_t_1 = data.t_0_settlement_detail.interbank_trade_sell_t_1;
                $scope.trade.exchange_trade_buy = data.t_0_settlement_detail.exchange_trade_buy;
                $scope.trade.exchange_trade_sell = data.t_0_settlement_detail.exchange_trade_sell;
                $scope.trade.exchange_repo_init = data.t_0_settlement_detail.exchange_repo_init;
                $scope.trade.exchange_reverse_repo_init = data.t_0_settlement_detail.exchange_reverse_repo_init;
                $scope.trade.fund_purchase_t_1 = data.t_0_settlement_detail.fund_purchase_t_1;
                $scope.trade.fund_redeem_t_1 = data.t_0_settlement_detail.fund_redeem_t_1;
                $scope.trade.other_t_1 = data.t_0_settlement_detail.other_t_1;
                $scope.trade.deposit_in_maturity = data.t_0_settlement_detail.deposit_in_maturity;
                $scope.trade.deposit_out_maturity = data.t_0_settlement_detail.deposit_out_maturity;
                $scope.trade.finance_maturity = data.t_0_settlement_detail.finance_maturity;
                $scope.trade.bank_lending_in_maturity = data.t_0_settlement_detail.bank_lending_in_maturity;
                $scope.trade.bank_lending_out_maturity = data.t_0_settlement_detail.bank_lending_out_maturity;
                $scope.trade.protocol_repo_maturity = data.t_0_settlement_detail.protocol_repo_maturity;
                $scope.trade.protocol_reverse_repo_maturity = data.t_0_settlement_detail.protocol_reverse_repo_maturity;
                $scope.trade.stock_buy = data.t_0_settlement_detail.stock_buy;
                $scope.trade.stock_sell = data.t_0_settlement_detail.stock_sell;
                $scope.trade.fee = data.t_0_settlement_detail.fee;
                $scope.trade.fund_otc_buy = data.t_0_settlement_detail.fund_otc_buy;
                $scope.trade.fund_otc_sell = data.t_0_settlement_detail.fund_otc_sell;
                $scope.trade.fund_exchange_buy = data.t_0_settlement_detail.fund_exchange_buy;
                $scope.trade.fund_exchange_sell = data.t_0_settlement_detail.fund_exchange_sell;
                $scope.trade.buyout_repo_maturity = data.t_0_settlement_detail.buyout_repo_maturity;
                $scope.trade.buyout_reverse_repo_maturity = data.t_0_settlement_detail.buyout_reverse_repo_maturity;
            }
        })
    }

    $scope.datetimePickerConfig = angular.merge({}, datetimePickerConfig, {
        startDate: accountService.getCreateDate(filterParam.account_id),
        endDate: dateClass.getFormatDate(new Date(new Date().getTime() + 364 * 24 * 3600 * 1000), 'yyyy-MM-dd')
    });

    $scope.positionDate = {
        date: $filter('date')(new Date(), 'yyyy-MM-dd'),
        onChange: function() {
            getCashPositionSheet();
        }
    };
    $scope.trade = {
        date: [],
        t_0_start: [],
        t_1_start: [],
        t_0_in: [],   // T+0总入账
        t_1_in: [],
        t_0_out: [],  // T+0总出账
        t_1_out: [],
        t_0_end: [],  // T+0 汇总 银行间T+1
        t_1_end: [],
        //  入账
        t_1_exchange_repo: [],      // T+1交易所回购
        t_1_new_play_back: [],      // T+1打新回款
        t_1_income_sell_bonds: [], // T+1卖券收入
        t_1_bank_borrow_money: [], // T+1银行T+0借款
        t_1_bank_sell_bonds: [],   // T+1银行间T+0卖券
        t_1_paydate_income: [],   // T+1付息日收入
        t_1_other_income: [],      // T+1其他收入
        t_1_tt_asset_add: [],      // T+1其他T+T资产增加
        t_1_account_purchase: [],  // T+1账户申购到账
        // 出账
        t_1_t0_bank_buy_bonds: [],    // T+1银行间T+0买券
        t_1_t1_bank_buy_bonds: [],    // T+1银行间T+1买券
        t_1_exchange_money_out: [],  // T+1交易所出钱
        t_1_purchase_bonds: [],       // 新债申购
        t_1_new_play_money_out: [],  // 打新出钱
        t_1_account_redemption: [],  // 账户赎回
        t_1_other_t0_pay: [],         // 其他T+0支出
        t_1_other_t1_pay: [],         // 其他T+1支出
        t_1_other_tt_asset_less: [], // 其他T+T资产减少
        t_0_deposit_init: [],         // 协议存款初始
        t_0_finance_init: [],         // 初始理财
        // 汇总
        t_1_bank_expiration: [],      // T+1净正银行间到期
        t_1_account_lowest_gap: [],   // 账户T+1最低缺口
        // 入账
        t_0_new_play_back: [],      // T+0打新回款
        t_0_income_sell_bonds: [], // T+0卖券收入
        t_0_bank_borrow_money: [], // T+0银行T+0借款
        t_0_bank_sell_bonds: [],   // T+0银行间T+0卖券
        t_0_other_income: [],      // T+0其他收入
        t_0_account_purchase: [],  // T+0账户申购到账
        buyout_repo_init: [],    // 买断式回购
        // 出账
        t_0_t0_bank_buy_bonds: [],    // T+0银行间T+0买券
        t_0_other_t0_pay: [],         // 其他T+0支出
        buyout_reverse_repo_init: [], //买断式逆回购首期
        // 汇总
        t_0_bank_available_bonds: [],  // 银行间剩余T+0可用券
        t_0_account_lowest_gap: [],   // 账户最低缺口
        coupon: [],  // 债券票息收入
        redemption: [], // 债券提前还本收入
        interbank_repo_maturity: [], //银行间回购到期
        interbank_reverse_repo_maturity: [], // 银行间逆回购到期
        exchange_repo_maturity: [], // 交易所回购到期
        exchange_reverse_repo_maturity: [], // 交易所逆回购到期
        interbank_trade_buy_t_1: [], //银行间T+1买券
        interbank_trade_sell_t_1: [], //银行间T+1卖券
        exchange_trade_buy: [], //交易所T+1买券
        exchange_trade_sell: [], // 交易所T+1卖券
        exchange_repo_init: [], // 交易所回购初始
        exchange_reverse_repo_init: [], // 交易所逆回购初始
        fund_purchase_t_1: [], // 账户T+1申购
        fund_redeem_t_1: [],   // 账户T+1赎回
        other_t_1: [],  // 其他T+1收入支出
        interbank_reverse_repo_init: [],  // 银行间逆回购
        deposit_maturity: [],   // 协议存款到期
        finance_maturity: [],  // 理财到期
        buyout_repo_maturity:  [], //买断式正回购到期
        buyout_reverse_repo_maturity: [] // 买断式逆回购到期
    };
    var createEmptyList = function (data) {
        var list = [];
        angular.forEach(data, function (value) {
            list.push('');
        });
        return list;
    };

    $scope.onExportData = function () {
        if (!$scope.winStatus.is_account_now) { // => is account group
            return;
        }

        var date = $scope.positionDate.date
        var param = {
            account_id: filterParam.account_id,
            company_id: $scope.getCompanyId(filterParam.account_id),
            date: date,
        };

        var hideLoad = function () {
            $('#loadShadeDiv').modal('hide');
        };
        var errorFunc = function () {
            hideLoad();
            messageBox.error('头寸表导出失败！')
        };

        $('#loadShadeDiv').modal({ backdrop: 'static', keyboard: false });

        var file_name = winStatus.current_name + '_头寸表_' + date.replace(/-/g, '');
        excelExport.request('cash_positions', param, file_name + '.xls', hideLoad, errorFunc);
    };

    jQuery('#positionSheetRightPane').scroll(function () {
        jQuery('#positionSheetTitlePane').css('left', jQuery('#positionSheetRightPane').scrollLeft() + 'px');
    });


    $scope.$on("refresh account", function () {
        $scope.datetimePickerConfig.startDate = accountService.getCreateDate(filterParam.account_id);
        getCashPositionSheet();
    });

    this.$onInit = function() {
        $scope.datetimePickerConfig.startDate = accountService.getCreateDate(filterParam.account_id);
        getCashPositionSheet();
    };
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});