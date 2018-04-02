angular.module('ias.account').controller('exchangePledgeInputCtrl', function ($scope, datetimePickerConfig, filterParam, $filter, selectTypes, dataCenter,
    dealPage, exchangePledgedBonds, accountUtils, accountConstant, authorityControl) {
    $scope.display = function () {
        return selectTypes.dealInput == dealPage.exchange_pledge;
    };

    $scope.accountChanged = function (account_id) {
        $scope.getExchangePledgeBonds(account_id);
    };
    $scope.getExchangePledgeBonds = function (id) {
        if (id && id !== '') {
            exchangePledgedBonds.post({
                account_group_id: accountConstant.group_id,
                company_id: $scope.getCompanyId(id),
                account_list: authorityControl.getAccountGroupMember([id]),
                date: $scope.trade.pledge_date
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    $scope.exchangePledgeBonds = response.data;
                }
            });
        }
    };

    $scope.timePickerConfig = datetimePickerConfig;


    $scope.trade = {};
    $scope.trade.init = function () {
        this.bond_key_listed_market = '';
        this.bond_code = '';
        this.short_name = '';
        this.pledge_date = $filter('date')(new Date(), 'yyyy-MM-dd');
        this.account_id = filterParam.account_id;
        this.direction = 1;
        this.conversion_factor = 0;
        this.pledge_available_volume = '';
        this.pledged_volume = '';
        this.pledge_volume = '';
        this.select = null;
        this.show_alert = false;
        this.alert_content = '';
    };
    $scope.trade.check = function() {
        this.show_alert = true;
        this.alert_content = '';
        if (accountUtils.isEmpty(this.account_id)) {
            this.alert_content = '请选择账户!';
            return false;
        }
        if (accountUtils.isEmpty(this.bond_key_listed_market)) {
            this.alert_content = '请选择标的!';
            return false;
        }
        if (accountUtils.isEmpty(this.pledge_volume)) {
            this.alert_content = '请输入质押量!';
            return false;
        }
        this.show_alert = false;
        return true;
    };
    $scope.trade.useAllPledgeVolume = function () {
        if (1 == this.direction) {
            this.pledge_volume = this.pledge_available_volume > 0 ? this.pledge_available_volume : 0;
        } else if (-1 == this.direction) {
            this.pledge_volume = this.pledged_volume > 0 ? this.pledged_volume : 0;
        }
    };
    $scope.trade.directionChanged = function () {
        this.pledge_volume = '';
    };
    $scope.trade.bondChanged = function () {
        var bond = this.select || {};
        this.bond_code = bond.bond_code;
        this.short_name = bond.short_name;
        this.bond_key_listed_market = bond.bond_key_listed_market;
        this.conversion_factor = bond.conversion_factor;
        this.pledge_available_volume = bond.pledge_available_volume;
        this.pledged_volume = bond.pledged_volume;
        this.pledge_volume = null;
    };

    $scope.directionGroup = [
        { label: '提交质押', value: 1 },
        { label: '解除质押', value: -1 }
    ];

    function addExchangePledge() {
        $scope.$emit('deal trade add', {
            type: 'exchange_pledge',
            account_id: $scope.trade.account_id,
            company_id: $scope.getCompanyId($scope.trade.account_id),
            trade_list: [{
                pledge_date: $scope.trade.pledge_date,
                pledge_volume: parseInt($scope.trade.pledge_volume),
                direction: $scope.trade.direction,
                bond_key_listed_market: $scope.trade.bond_key_listed_market,
                account_id: $scope.trade.account_id,
            }]
        });
    }

    $scope.$on("dealInput-confirm", function () {
        if (dealPage.exchange_pledge != selectTypes.dealInput || !$scope.trade.check()) {
            return;
        }

        addExchangePledge();
        $scope.trade.init();
        $scope.getExchangePledgeBonds(filterParam.account_id);

        if (!dealPage.confirm_continue) {
            $scope.dismiss();
        }
    });

    $scope.$on("init exchange_pledge dlg", function () {
        $scope.trade.init();
        $scope.getExchangePledgeBonds(filterParam.account_id);
    });
});