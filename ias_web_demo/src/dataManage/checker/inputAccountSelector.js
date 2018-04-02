import angular from 'angular';

import './template/input_account_selector.less';

const initView = Symbol('initView');

class inputAccountSelectorCtrl {
    constructor($scope, $timeout, $q, user, dataCheckService) {
        this.$timeout = $timeout;
        this.$q = $q;

        this.user = user;
        this.dataCheckService = dataCheckService;

        console.debug('inputAccountSelectorCtrl initView');

        this[initView]();
    }

    [initView]() {
        this.valuationAccountIcon = require('../../images/valuation_account.png');

        this.vm = {};

        if (!this.user || !this.user.id) {
            console.warn('inputAccountSelectorCtrl: 获取登录信息失败');
            return;
        }

        // http://192.168.1.212/api/accounts?company_id=ce08b84edc9411e6aef40050568c5fd9&manager_id=10b4d4b2dd7511e68720382c4a61272c
        this.getAccountListPromise = this.dataCheckService.getAccountList().then((res) => {
            if (Array.isArray(res)) {
                res.forEach((account) => {
                    account.isMirrorAccount = this.user.id !== account.manager;
                });
            }
            if (this.valuation) {
                this.accountList = res.filter((account) => {
                    return account.valuation_dates && account.valuation_dates.length > 0;
                });
            } else {
                this.accountList = res;
            }

            return this.$q.resolve(res);
        }, (res) => this.$q.reject(res));

        this.accountListFilter = (item, index, sourceArray) => {
            if (!item || !typeof item.name === 'string') return true;
            if (!this.accountSearchText || this.accountSearchText.length === 0) return true;
            return item.name.toUpperCase().indexOf(this.accountSearchText.toUpperCase()) > -1;
        };
    }

    querySearchAccount(searchText) {
        this.$timeout(() => {
            try {
                angular.element('.dc-valuation-searchcriteria-accountselector > md-select-menu > md-content').scrollTop(0);
            } catch (e) {
                return;
            }
        }, 200);

        return this.getAccountListPromise;
    }

    getDisplayNameForSelectedAccount(array) {
        if (!angular.isArray(array)) return '没有选择账户';
        return array.map((e) => e.name).join(', ');
    }

    /**
     *  // The md-select directive eats keydown events for some quick select
     *  // logic. Since we have a search input here, we don't need that logic.
     *  // https://material.angularjs.org/latest/demo/select
     * @param {any} event
     */
    onSearchAccountKeydowm(event) {
        if (event) event.stopPropagation();
    }

    onClearSearchTerm() {
        this.accountSearchText = '';
    }

    onSelectChange() {
        this.ngModelCtrl.$viewValue = Array.isArray(this.vm.selectedAccount) ? this.vm.selectedAccount : [this.vm.selectedAccount];
        this.ngModelCtrl.$commitViewValue();
    }
}

let component = () => {
    return {
        require: {
            ngModelCtrl: '?ngModel',
        },
        transclude: true,
        template: require('./template/input_account_selector.html'),
        bindings: {
            theme: '@mdTheme',
            ngModel: '<',
            multiple: '<',
            valuation: '<',
        },
        controller: ['$scope', '$timeout', '$q', 'user', 'dataCheckService', inputAccountSelectorCtrl],
    };
};

export default component;
