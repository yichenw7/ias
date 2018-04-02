'use strict';


angular.module('ias.utils')
    .factory('accountUtils', function(positionBondQuery, Trades, bond, singleValuation, $timeout, user, $filter,
                                      hcMarketData,account,accountConstant, authorityControl){
        //判断字符串或数字是否为空
        var isEmpty = function(strings){
            if ( !strings || !$.trim(strings)) {
                return true;
            }else{
                return false;
            }
        };

        return {
            //获取company_id
            getCompanyId: function (accountId) {
                return authorityControl.getAuthorityAndAgentCompany(accountId).agent_company_id || user.company_id;
            },
            updateBySelling: function($scope, callBack){
                if($scope.trade.bond_key_listed_market != '' && $scope.trade.account_id){
                    positionBondQuery.get({
                        account_id:$scope.trade.account_id,
                        company_id: this.getCompanyId($scope.trade.account_id),
                        bond_key_listed_market: $scope.trade.bond_key_listed_market
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            callBack && callBack(data);
                        }
                    });
                }
            },
            updateBondAvailableVolume: function($scope,callBack){
                $scope.trade.available_volume = null;
                if($scope.trade.bond_key_listed_market != '' && $scope.trade.account_id) {
                    positionBondQuery.get({
                        date: $scope.trade.trade_date,
                        account_id: $scope.trade.account_id,
                        company_id: this.getCompanyId($scope.trade.account_id),
                        bond_key_listed_market: $scope.trade.bond_key_listed_market
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            if (data == null || data.available_volume == undefined || isNaN(data.available_volume)) {
                                $scope.trade.available_volume = 0;
                            } else {
                                $scope.trade.available_volume = parseInt(data.available_volume);
                            }
                            if (callBack != null) {
                                callBack();
                            }
                        }
                    });
                }
            },
            updateBondInfo: function($scope,callBack){
                $scope.trade.ttm = '--';
                $scope.trade.coupon_rate_current = '--';
                $scope.trade.maturity_dates = '--';
                $scope.trade.interest_start_date = '--';
                $scope.trade.has_option = '--';
                $scope.trade.option_date = '--';
                $scope.trade.issuer_rating_current = '--';
                $scope.trade.val_clean_price = '--';
                $scope.trade.val_yield = '--';
                $scope.trade.val_duration = '--';
                $scope.trade.internal_rating = '--';
                $scope.trade.expiry_date = '--';
                $scope.trade.bond_type = '--';
                bond.get({bond_key_listed_market: $scope.trade.bond_key_listed_market}, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        $scope.trade.ttm = data.ttm || '--';
                        $scope.trade.coupon_rate_current = data.coupon_rate_current == null ? '--' : data.coupon_rate_current;
                        $scope.trade.maturity_dates = data.maturity_date || '--';
                        $scope.trade.has_option = data.has_option || '--';
                        $scope.trade.option_date = data.option_date || '--';
                        $scope.trade.issuer_rating_current = data.issuer_rating_current || '--';
                        $scope.trade.interest_start_date = data.interest_start_date;
                        $scope.trade.bond_type = data.bond_type;
                    }
                });
                singleValuation.get({
                    bond_key_listed_market: $scope.trade.bond_key_listed_market,
                    trade_date: $scope.trade.trade_date
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        //权限控制
                        $scope.trade.val_clean_price = $filter('cdcAuthority')(data.val_clean_price) || '--';
                        $scope.trade.val_yield = $filter('cdcAuthority')(data.val_yield) || '--';
                        $scope.trade.val_duration = data.val_duration || '--';

                        if (callBack != undefined) {
                            $timeout(function () {callBack();}, 500);
                        }
                    }
                });
            },
            updateValuation: function($scope,callBack){
                $scope.trade.val_clean_price = '--';
                $scope.trade.val_yield = '--';
                $scope.trade.val_duration = '--';
                // 取历史中债估值功能由于后台没有准备好，暂时屏蔽
                singleValuation.get({
                    bond_key_listed_market: $scope.trade.bond_key_listed_market,
                    trade_date: $scope.trade.trade_date
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        $scope.trade.val_clean_price = $filter('cdcAuthority')(data.val_clean_price) || '--';
                        $scope.trade.val_yield = $filter('cdcAuthority')(data.val_yield) || '--';
                        $scope.trade.val_duration = data.val_duration || '--';

                        if (callBack != undefined) {
                            $timeout(function () {callBack();}, 500);
                        }
                    }
                });
            },
            updateSettleTypeStatus: function($scope){
                // 交易所一级债有些债没有bond_code
                if($scope.trade.bond_code == null){
                    return;
                }

                // 交易所债券  by yudan.chen  根据客户最新通知：交易所债券有T+0的
                //if($scope.trade.bond_key_listed_market.indexOf('SZE')>0 || $scope.trade.bond_key_listed_market.indexOf('SSE')>0){
                //    $scope.settleTypeGroup = [
                //        {label: 'T+1', value: 1}
                //    ];
                //    $scope.trade.settlement_days = 1;
                //}else{
                //    $scope.settleTypeGroup = [
                //        {label: 'T+0', value: 0},
                //        {label: 'T+1', value: 1}
                //    ];
                //    $scope.trade.settlement_days = 0;
                //}

                // $scope.settleTypeGroup = [
                //     {label: 'T+0', value: 0},
                //     {label: 'T+1', value: 1}
                // ];
                // $scope.trade.settlement_days = 0;
            },
            updateCalcValue: function($scope){
                this.ytmChanged($scope);
                this.ytcpChanged($scope);
                this.cleanPriceChanged($scope);
            },
            ytmChanged: function($scope){
                var _this = this;
                if($scope.trade.current_select == 'ytm') {
                    $scope.trade.ytcp = null;
                    $scope.trade.clean_price = null;
                    $scope.trade.dirty_price = null;
                    $scope.trade.clean_price_deviation = null;
                    $scope.trade.max_available = null;
                    Trades.add({
                        type: 'bond',
                        account_id: accountConstant.group_id,
                        company_id: this.getCompanyId(accountConstant.group_id),
                        trade_calc: {
                            trade_date: $scope.trade.trade_date,
                            bond_key_listed_market: $scope.trade.bond_key_listed_market,
                            direction: $scope.trade.direction,
                            ytm: $scope.trade.ytm / 100.0,
                            settlement_days: $scope.trade.settlement_days,
                            volume: $scope.trade.volume
                      //      yield_type: $scope.trade.current_select
                        }
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            if (undefined != data && data.clean_price != undefined) {
                                $scope.trade.ytcp = data.ytcp != null ? parseFloat((data.ytcp*100).toFixed(4)) : null;
                                $scope.trade.clean_price = parseFloat(data.clean_price.toFixed(4));
                                $scope.trade.dirty_price = data.dirty_price != null ? parseFloat(data.dirty_price.toFixed(4)) : null;
                                $scope.trade.accurate_dirty_price = data.dirty_price;
                                $scope.trade.clean_price_deviation = $filter('toFixed2')(Math.abs($scope.trade.clean_price / $scope.trade.val_clean_price - 1) * 100);
                                _this.updateMaxAvailable($scope);
                            }
                        }
                    });
                }
            },
            ytcpChanged: function($scope){
                var _this = this;
                if($scope.trade.current_select == 'ytcp'){
                    $scope.trade.ytm = null;
                    $scope.trade.clean_price = null;
                    $scope.trade.dirty_price = null;
                    $scope.trade.clean_price_deviation = null;
                    Trades.add({
                        type: 'bond',
                        account_id: accountConstant.group_id,
                        company_id: this.getCompanyId(accountConstant.group_id),
                        trade_calc: {
                            trade_date: $scope.trade.trade_date,
                            bond_key_listed_market: $scope.trade.bond_key_listed_market,
                            direction: $scope.trade.direction,
                            ytcp: $scope.trade.ytcp/100.0,
                            settlement_days: $scope.trade.settlement_days,
                            volume: $scope.trade.volume,
                         //   yield_type: $scope.trade.current_select
                        }
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            if(undefined != data && data.clean_price != undefined){
                                $scope.trade.ytm = data.ytm != null ? parseFloat((data.ytm*100).toFixed(4)) : null;
                                $scope.trade.clean_price = parseFloat(data.clean_price.toFixed(4));
                                $scope.trade.dirty_price = data.dirty_price != null ? parseFloat(data.dirty_price.toFixed(4)) : null;
                                $scope.trade.accurate_dirty_price = data.dirty_price;
                                $scope.trade.clean_price_deviation = $filter('toFixed2')(Math.abs($scope.trade.clean_price/$scope.trade.val_clean_price-1)*100);
                            }
                            _this.updateMaxAvailable($scope);
                        }
                    });
                }
            },
            cleanPriceChanged: function($scope){
                var _this = this;
                if($scope.trade.current_select == 'clean_price') {
                    $scope.trade.ytcp = null;
                    $scope.trade.ytm = null;
                    $scope.trade.dirty_price = null;
                    $scope.trade.clean_price_deviation = null;
                    Trades.add({
                        type: 'bond',
                        account_id: accountConstant.group_id,
                        company_id: this.getCompanyId(accountConstant.group_id),
                        trade_calc: {
                            trade_date: $scope.trade.trade_date,
                            bond_key_listed_market: $scope.trade.bond_key_listed_market,
                            direction: $scope.trade.direction,
                            clean_price: $scope.trade.clean_price,
                            settlement_days: $scope.trade.settlement_days,
                            volume: $scope.trade.volume
                        }
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            $scope.trade.ytm = parseFloat((data.ytm*100).toFixed(4));
                            $scope.trade.ytcp = parseFloat((data.ytcp*100).toFixed(4));
                            $scope.trade.dirty_price = data.dirty_price != null ? parseFloat(data.dirty_price.toFixed(4)) : null;
                            $scope.trade.accurate_dirty_price = data.dirty_price;
                            if ($scope.trade.val_clean_price != 0){
                                $scope.trade.clean_price_deviation = $filter('toFixed2')(Math.abs($scope.trade.clean_price/$scope.trade.val_clean_price-1)*100);
                            }
                            _this.updateMaxAvailable($scope);
                        }
                    });
                }
            },
            dirtyPriceChanged: function($scope){
                var _this = this;
                if($scope.trade.current_select == 'dirty_price') {
                    $scope.trade.ytcp = null;
                    $scope.trade.ytm = null;
                    $scope.trade.clean_price = null;
                    $scope.trade.clean_price_deviation = null;
                    $scope.trade.accurate_dirty_price = $scope.trade.dirty_price;
                    Trades.add({
                        type: 'bond',
                        account_id: accountConstant.group_id,
                        company_id: this.getCompanyId(accountConstant.group_id),
                        trade_calc: {
                            trade_date: $scope.trade.trade_date,
                            bond_key_listed_market: $scope.trade.bond_key_listed_market,
                            direction: $scope.trade.direction,
                            dirty_price: $scope.trade.dirty_price,
                            settlement_days: $scope.trade.settlement_days,
                            volume: $scope.trade.volume
                        }
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            $scope.trade.ytm = parseFloat((data.ytm*100).toFixed(4));
                            $scope.trade.ytcp = parseFloat((data.ytcp*100).toFixed(4));
                            $scope.trade.clean_price = data.clean_price != null ? parseFloat(data.clean_price.toFixed(4)) : null;
                            $scope.trade.clean_price_deviation = $filter('toFixed2')(Math.abs($scope.trade.clean_price/$scope.trade.val_clean_price-1)*100);
                            _this.updateMaxAvailable($scope);
                        }
                    });
                }
            },
            settleTypeChange: function($scope, value){
                this.updateCalcValue($scope);
                if(0 == value){
                    $scope.trade.available_fund = $scope.trade.cash_t_0;
                }else if(1 == value){
                    $scope.trade.available_fund = $scope.trade.cash_t_1;
                }
                this.updateMaxAvailable($scope);
            },
            updateMaxAvailable: function($scope){
                if(1 == $scope.trade.direction){
                    if(!isEmpty($scope.trade.accurate_dirty_price)){
                        if($scope.trade.available_fund<0){
                            $scope.trade.max_available = 0;
                        }else{
                            $scope.trade.max_available = parseInt($scope.trade.available_fund/$scope.trade.accurate_dirty_price);
                        }
                    }else{
                        $scope.trade.max_available = null;
                    }
                }else if(-1 == $scope.trade.direction){
                    $scope.trade.max_available = $scope.trade.available_volume;
                }
            },
            updateAccountInfo: function($scope){
                var _this = this;
                $scope.trade.coupon_rate = null;
                $scope.trade.yield_rate = null;
                $scope.trade.sell_rule = null;
                $scope.trade.cash_t_0 = null;
                $scope.trade.cash_t_1 = null;
                $scope.trade.duration = null;
                $scope.trade.available_fund = null;
                $scope.trade.bank_valuation_method = null;
                $scope.trade.exchange_valuation_method = null;
                account.get({
                    account_id: $scope.trade.account_id,
                    company_id: this.getCompanyId($scope.trade.account_id)
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        $scope.trade.cash_t_0 = data.cash_t_0;
                        $scope.trade.cash_t_1 = data.cash_t_1;
                        $scope.trade.duration = data.duration;
                        $scope.trade.coupon_rate = data.coupon_rate;
                        $scope.trade.yield_rate = data.yield_rate;
                        $scope.trade.sell_rule = data.sell_rule;
                        $scope.trade.bank_valuation_method = data.valuation_method;
                        $scope.trade.exchange_valuation_method = data.valuation_method_exchange;
                        if(0 == $scope.trade.settlement_days){
                            $scope.trade.available_fund = data.cash_t_0;
                        }else if(1 == $scope.trade.settlement_days){
                            $scope.trade.available_fund = data.cash_t_1;
                        }
                        if(-1 == $scope.trade.direction){
                            _this.updateBondAvailableVolume($scope, function(){
                                _this.updateMaxAvailable($scope);
                            })
                        }else if(1 == $scope.trade.direction){
                            _this.updateMaxAvailable($scope);
                        }
                    }
                });
            },
            isEmpty: function(strings) {
                return isEmpty(strings);
            }
        }
    });

