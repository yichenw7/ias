import angular from 'angular';

const initView = Symbol('initView');
const getValuationList = Symbol('getValuationList');

class dcValuationSelectorCtrl {
    constructor($scope, $q, dataCheckService, componentService, user) {
        this.$scope = $scope;
        this.$q = $q;

        this.dataCheckService = dataCheckService;
        this.componentService = componentService;

        this.user = user;

        this[initView]();
    }

    [initView]() {
    }

    [getValuationList](searchcriteria) {
        if (!searchcriteria.selectedAccount || searchcriteria.selectedAccount.length < 1) {
            this.componentService.openErrorDialog({ message: '请选择账户' });
            return;
        }

        let dto = {
            account_id: searchcriteria.selectedAccount.map((item) => item.id),
            start_date: searchcriteria.startDate,
            end_date: searchcriteria.endDate,
            only_different: searchcriteria.filterIssueData,
        };

        this.dataCheckService.getValList(dto).then((res) => {
            if (!angular.isArray(res)) {
                this.componentService.openErrorDialog({ message: '没有数据' });
                return;
            }

            this.valuationList = res;

            this.issueDataCount = this.valuationList.reduce((count, item) => {
                if ((+item.value_diff) !== 0) count++;
                return count;
            }, 0);

            this.valuationTreeView = this.componentService.buildMdListTreeView(this.valuationList, { groupBy: 'account_name' });
        }, (res) => {
            this.componentService.openErrorDialog({ message: '没有数据' });
        });
    }

    $onChanges(changesObj) {
        if (!changesObj) return;

        if (changesObj.searchcriteria && changesObj.searchcriteria.currentValue) {
            this[getValuationList](this.searchcriteria);
            this.ngModelCtrl.$viewValue = {};
            this.ngModelCtrl.$commitViewValue();
        }
    }

    onClickTable(event) {
        if (!event) return;

        let target = event.target;

        if (!target) return;

        let scope = angular.element(target).scope();

        if (!scope) return;

        if (scope.hasOwnProperty('parentNode')) {
            scope.parentNode.$$isCollapse = scope.parentNode.$$isCollapse ? false : true;
        } else if (scope.hasOwnProperty('child')) {
            this.ngModelCtrl.$viewValue = scope.child;
            this.ngModelCtrl.$commitViewValue();
        }
    }
}

let dcValuationSelector = () => {
    return {
        require: {
            ngModelCtrl: '?ngModel',
        },
        template: require('./template/dc_valuation_selector.html'),
        bindings: {
            theme: '@mdTheme',

            searchcriteria: '<',
            ngModel: '<',
        },
        controller: ['$scope', '$q', 'dataCheckService', 'componentService', 'user', dcValuationSelectorCtrl],
    };
};

export default dcValuationSelector;
