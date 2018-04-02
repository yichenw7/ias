import angular from 'angular';
import { isInterbank } from '../../helper/Bond';

angular.module('ias.account').controller('buyoutRepoInputCtrl', function ($scope, selectTypes, dealPage, datetimePickerConfig, dataCenter, filterParam,
    bond, $filter, accountConstant, user, account, Trades, hcMarketData, accountUtils, Calculator, positionBondQuery, singleValuation) {
    $scope.timePickerConfig = datetimePickerConfig;
    $scope.directionGroup = [
        { label: '正', value: 1 },
        { label: '逆', value: -1 }
    ];
    $scope.settleType = [
        { label: 'T+0', value: 0 },
        { label: 'T+1', value: 1 }
    ];
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.buyout_repo;
    };

    class BondInfo {
        constructor(data) {
            this.update(data)
            this.setCDCValue(data)

            // TODO: 内部可投库字段，目前缺失
            this.internal_rating = '--';
            this.expiry_date = '--';
        }

        update(data) {
            data = data || {};
            this.ttm = data.ttm || '--';
            this.bond_id = data.bond_id || '--';
            this.short_name = data.short_name;
            this.coupon_rate_current = data.coupon_rate_current == null ? '--' : data.coupon_rate_current;
            this.maturity_date = data.maturity_date || '--';
            this.has_option = data.has_option || '--';
            this.option_date = data.option_date || '--';
            this.issuer_rating_current = data.issuer_rating_current || '--';
            this.interest_start_date = data.interest_start_date;
            this.bond_type = data.bond_type;
            this.rating_current = data.rating_current || '--';
        }


        getReleaseInfo(tradeDate) {
            if (this.maturity_date === '--') return '';
            if (new Date(this.maturity_date) < new Date(tradeDate)) return '债券已到期';
            if (new Date(tradeDate) < new Date(this.interest_start_date)) return '债券未发行';
            return '';
        }

        setCDCValue(data) {
            data = data || {};
            this.val_clean_price = $filter('cdcAuthority')(data.val_clean_price) || '--';
            this.val_yield = $filter('cdcAuthority')(data.val_yield) || '--';
            this.val_duration = data.val_duration || '--';
        }
    }

    class BuyoutTrade {
        constructor(oldTrade) {
            oldTrade = oldTrade || {};

            this.is_edit_mode = false;
            this.show_alert = false;
            this.alert_content = '';
            this.lastModified = '';

            this.set(oldTrade);
        }

        set(oldTrade) {
            this.direction = oldTrade.direction || 1;
            this.bond_key_listed_market = oldTrade.bond_key_listed_market || '';

            this.account_id = oldTrade.account_id || filterParam.account_id;
            this.counter_party_account = oldTrade.counter_party_account || '';
            this.counter_party_trader = oldTrade.counter_party_trader || '';

            this.repo_rate = oldTrade.repo_rate * 100 || '';
            this.amount = oldTrade.volume ? oldTrade.volume / 100 : '';
            this.profit = Math.abs(oldTrade.profit) || '';
            this.max_available = 0;

            if (oldTrade.initial_date && oldTrade.maturity_date) {
                this.term = (new Date(oldTrade.maturity_date) - new Date(oldTrade.initial_date)) / 1000 / 3600 / 24;
            } else {
                this.term = '';
            }
            this.repo_id = oldTrade.id;
            this.settlement_days = oldTrade.settlement_days || 0;

            this.initial_date = oldTrade.initial_date || $filter('date')(new Date(), 'yyyy-MM-dd');
            this.initial_ytm = oldTrade.initial_ytm || '';
            this.initial_ytcp = oldTrade.initial_ytcp || '';
            this.initial_clean_price = oldTrade.initial_clean_price || '';
            this.initial_dirty_price = oldTrade.initial_dirty_price || '';
            this.initial_amount = Math.abs(oldTrade.amount) || '';

            this.maturity_date = oldTrade.maturity_date || $filter('date')(new Date(), 'yyyy-MM-dd');
            this.maturity_ytm = oldTrade.maturity_ytm || '';
            this.maturity_ytcp = oldTrade.maturity_ytcp || '';
            this.maturity_clean_price = oldTrade.maturity_clean_price || '';
            this.maturity_dirty_price = oldTrade.maturity_dirty_price || '';
            this.maturity_amount = Math.abs(oldTrade.return_amount) || '';

            this.comment = oldTrade.comment || '';
        }

        checkInput() {
            this.show_alert = true;
            this.alert_content = '';
            if (!this.bond_key_listed_market) {
                this.alert_content = '请输入回购标的!';
                return false;
            }
            if (!this.account_id) {
                this.alert_content = '请选择本方账户!';
                return false;
            }
            if (!this.term) {
                this.alert_content = '请输入回购期限!';
                return false;
            }
            if (!this.repo_rate) {
                this.alert_content = '请输入回购利率!';
                return false;
            }
            if (!this.maturity_amount || !this.initial_amount) {
                this.alert_content = '请输入净价或者到期收益率!';
                return false;
            }
            if (this.trade_date_1 >= this.trade_date_2) {
                this.alert_content = '期末日期必须大于期初日期!';
                return false;
            }
            this.show_alert = false;
            return true;
        }

        clearPrices() {
            this.profit = '';

            this.initial_ytm = '';
            this.initial_ytcp = '';
            this.initial_clean_price = '';
            this.initial_dirty_price = '';
            this.initial_amount = '';

            this.maturity_ytm = '';
            this.maturity_ytcp = '';
            this.maturity_clean_price = '';
            this.maturity_dirty_price = '';
            this.maturity_amount = '';
        }

        calcuMaturityDate() {
            const self = this;
            if (!self.term) {
                self.maturity_date = self.initial_date;
                return Promise.resolve();
            }
            return Calculator.date({
                term: self.term,
                initialDate: self.initial_date,
                settlementDays: self.settlement_days,
            }).then(data => {
                self.initial_date = data.initial_date;
                self.maturity_date = data.maturity_date;
                self.initial_settlement_date = data.initial_settlement_date;
                self.maturity_settlement_date = data.maturity_settlement_date;
                self.real_days = data.real_days;
                $scope.$apply();
            });
        }

        updateDirtyPriceFrom(type) {
            const typePrefix = type.match(/initial_|maturity_/)[0];
            const anotherTypePrefix = typePrefix === 'initial_' ? 'maturity_' : 'initial_';
            const volume = this.amount * 100;  // 页面上金额单位为：万元
            const rate = this.repo_rate / 100; // 页面上回购利率单位为：%

            // 结算金额 = 全价 * 数量(张)
            this[typePrefix + 'amount'] = this[typePrefix + 'dirty_price'] * volume;
            // 正方向的结算金额 = 反方向的结算金额 * (1 + 回购利率 * 交易天数 / 365)
            if (typePrefix === 'initial_') {
                this.maturity_amount = this.initial_amount * (1 + rate * this.real_days / 365);
            } else if (typePrefix === 'maturity_') {
                this.initial_amount = this.maturity_amount / (1 + rate * this.real_days / 365);
            }
            this.profit = Math.abs(this.maturity_amount - this.initial_amount);
            this[anotherTypePrefix + 'dirty_price'] = this[anotherTypePrefix + 'amount'] / volume;
        }

        trial(type) {
            const self = this;
            const cacheValue = self[type];

            const typePrefix = type.match(/initial_|maturity_/)[0];
            const params = {
                trade_date: self[typePrefix + 'date'],
                bond_key_listed_market: self.bond_key_listed_market,
                settlement_days: self.settlement_days,
            };

            const prices = ['clean_price', 'dirty_price'];
            const yields = ['ytm', 'ytcp']
            // !KEEP: 最后一个参数四选一：
            // 优先级：高 -> (clean_price | dirty_price | ytm | ytcp) <- 低
            const key = type.replace(typePrefix, '');
            const value = (yields.indexOf(key) > -1) ? self[type] / 100 : self[type];
            params[key] = value;

            return Calculator.bond(params).then(data => {
                if (!data) {
                    self.clearPrices();
                    return;
                }
                prices.concat(yields).forEach(key => {
                    let typeKey = typePrefix + key;
                    if (type === typeKey) return; // 当前输入的价格不作赋值操作
                    self[typeKey] = data[key]
                    // 要将收益率类型乘以 100
                    if (yields.indexOf(key) > -1) {
                        self[typeKey] *= 100;
                    }
                })
            });
        }
    }

    function updateMaxAvailable() {
        if ($scope.trade.direction == 1) {
            $scope.trade.max_available = $scope.trade.available_volume;
        } else if ($scope.trade.direction == -1) {
            $scope.trade.max_available = parseInt($scope.trade.available_fund / $scope.trade.initial_dirty_price);
        }
    }
    function setTradeBond(bklm) {
        if (!isInterbank(bklm)) {
            $scope.trade.bondErr = '请选择银行间标的券';
            return;
        }
        $scope.curBond = new BondInfo();
        $scope.trade.bond_key_listed_market = bklm;
        $scope.trade.bondErr = '';
        $scope.curBond.bond_key_listed_market = bklm;
    }
    function updateBondAvailableVolume(callBack){
        $scope.trade.available_volume = null;
        if($scope.trade.bond_key_listed_market != '' && $scope.trade.account_id) {
            positionBondQuery.get({
                date: $scope.trade.trade_date,
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
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
    }
    function updateBondInfo(callBack) {
        bond.get({
            bond_key_listed_market: $scope.curBond.bond_key_listed_market
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.curBond.update(response.data);
                $scope.trade.bondMsg = $scope.curBond.getReleaseInfo($scope.trade.initial_date);
            }
        });

        singleValuation.get({
            bond_key_listed_market: $scope.curBond.bond_key_listed_market,
            trade_date: $scope.trade.initial_date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.curBond.setCDCValue(response.data);

                if (callBack) {
                    callBack();
                }
            }
        });
    }
    function initData() {
        $scope.$broadcast('angucomplete-alt:clearInput', 'bondSearchBox');
        $scope.accountChanged();
        $scope.singleAccountData = {
            interbank_repo_to_net: hcMarketData.assetMarketData.interbank_repo_to_net,
            exchange_repo_to_net: hcMarketData.assetMarketData.exchange_repo_to_net,
            total_to_net: hcMarketData.assetMarketData.total_to_net,
            asset_net: hcMarketData.assetMarketData.asset_net
        };

        $scope.trade = new BuyoutTrade();
        $scope.curBond = new BondInfo();
    }

    $scope.accountChanged = function () {
        if (!$scope.trade.account_id || $scope.trade.account_id === '') {
            return;
        }

        $scope.trade.available_fund = null;
        account.get({
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id)
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;

                // 可用资金只看期初的
                if ($scope.trade.settlement_days === 0) {
                    $scope.trade.available_fund = data.cash_t_0;
                } else {
                    $scope.trade.available_fund = data.cash_t_1;
                }

                // 收钱时，可卖为持仓量
                if (1 == $scope.trade.direction) {
                    updateBondAvailableVolume(function () {
                        updateMaxAvailable();
                    });
                } else if (-1 == $scope.trade.direction) {
                    updateMaxAvailable();
                }
            }
        });
    };
    $scope.choiceBtn = function (value) {
        updateMaxAvailable();
    };

    $scope.handleBondSelected = function(selected) {
        if (!selected) {
            $scope.trade.bond_key_listed_market = '';
            $scope.curBond = new BondInfo();
            $scope.trade.bondMsg = $scope.curBond.getReleaseInfo($scope.trade.initial_date);
        } else {
            setTradeBond(selected.originalObject.bond_key_listed_market);
            updateBondInfo(function () {
                updateBondAvailableVolume(function () {
                    updateMaxAvailable()
                });
            });
        }
        $scope.trade.clearPrices();
    };
    $scope.handlePriceChanged = function(type) {
        if (!$scope.trade.bond_key_listed_market) return;
        if (!$scope.trade[type]) return;

        const typePrefix = type.match(/initial_|maturity_/)[0];
        const anotherTypePrefix = typePrefix === 'initial_' ? 'maturity_' : 'initial_';
        // 1. 根据更改的内容，向后台请求试算当前方向的债券净价，全价等
        // 2. 拿到当前方向的全价之后，再去计算另一个方向的全价
        // 3. 根据另一个方向的全价，向后台请求试算这个方向的净价，全价
        $scope.trade.trial(type)
            .then(() => {
                $scope.trade.updateDirtyPriceFrom(typePrefix + 'dirty_price');
                $scope.trade.trial(anotherTypePrefix + 'dirty_price').then(() => $scope.$apply())
            })
    }
    $scope.handleDateChanged = function() {
        $scope.trade.calcuMaturityDate().then(() => {
            $scope.trade.bondMsg = $scope.curBond.getReleaseInfo($scope.trade.initial_date);
            const type = $scope.trade.lastModified;
            if (type) {
                $scope.handlePriceChanged(type);
            }
            $scope.$apply();
        });
    };

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.buyout_repo != selectTypes.dealInput) return;
        if (!$scope.trade.checkInput()) return;

        const params = {
            bond_key_listed_market: $scope.trade.bond_key_listed_market,
            direction: $scope.trade.direction,

            amount: $scope.trade.initial_amount,
            volume: $scope.trade.amount * 100,
            settlement_days: $scope.trade.settlement_days,
            repo_rate: $scope.trade.repo_rate / 100,

            initial_date: $scope.trade.initial_date,
            initial_ytm: $scope.trade.initial_ytm,
            initial_ytcp: $scope.trade.initial_ytcp,
            initial_clean_price: $scope.trade.initial_clean_price,
            initial_dirty_price: $scope.trade.initial_dirty_price,

            maturity_date: $scope.trade.maturity_date,
            maturity_ytm: $scope.trade.maturity_ytm,
            maturity_ytcp: $scope.trade.maturity_ytcp,
            maturity_clean_price: $scope.trade.maturity_clean_price,
            maturity_dirty_price: $scope.trade.maturity_dirty_price,

            counter_party_account: $scope.trade.counter_party_account,
            counter_party_trader: $scope.trade.counter_party_trader,
            comment: $scope.trade.comment,
            user: user.name,
            manager: user.id
        };

        if (!$scope.trade.is_edit_mode) {
            $scope.$emit('deal trade add', {
                type: 'buyout_repo',
                account_id: $scope.trade.account_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade_list: [params]
            });
        } else {
            $scope.$emit('deal trade update', {
                type: 'buyout_repo',
                account_id: $scope.trade.account_id,
                trade_id: $scope.trade.repo_id,
                company_id: $scope.getCompanyId($scope.trade.account_id),
                trade: params
            });
        }

        initData();
        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });
    $scope.$on("init buyout_repo dlg", function () {
        initData();
    });
    $scope.$on("show buyoutRepoDlg", function () {
        hcMarketData.showBtnList = false;
        selectTypes.dealInput = dealPage.buyout_repo;

        $scope.trade = new BuyoutTrade(hcMarketData.bond);
        $scope.trade.calcuMaturityDate();
        $scope.trade.is_edit_mode = true;
        $scope.trade.lastModified = 'initial_clean_price';
        setTradeBond(hcMarketData.bond.bond_key_listed_market);

        updateBondInfo(function () {
            $scope.accountChanged();
        });

        $scope.singleAccountData = {
            interbank_repo_to_net: hcMarketData.assetMarketData.interbank_repo_to_net,
            exchange_repo_to_net: hcMarketData.assetMarketData.exchange_repo_to_net,
            total_to_net: hcMarketData.assetMarketData.total_to_net,
            asset_net: hcMarketData.assetMarketData.asset_net
        };
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
