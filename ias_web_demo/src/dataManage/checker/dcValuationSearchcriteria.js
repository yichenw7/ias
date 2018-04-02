import angular from 'angular';

const initView = Symbol('initView');

class dcValuationSearchcriteriaCtrl {
    constructor($scope, $q, $timeout, $element, user, dataCheckService) {
        this.$scope = $scope;
        this.$q = $q;
        this.$timeout = $timeout;

        this.user = user;
        this.dataCheckService = dataCheckService;

        this[initView]();
    }

    [initView]() {
        this.vm = {};
    }

    onClickSearch(event) {
        this.ngModelCtrl.$viewValue = angular.copy(this.vm);
        this.ngModelCtrl.$commitViewValue();
    }
}

let dcValuationSearchcriteria = () => {
    return {
        require: {
            ngModelCtrl: '?ngModel',
        },
        template: require('./template/dc_valuation_searchcriteria.html'),
        bindings: {
            theme: '@mdTheme',
            ngModel: '<',
        },
        controller: ['$scope', '$q', '$timeout', '$element', 'user', 'dataCheckService', dcValuationSearchcriteriaCtrl],
    };
};

export default dcValuationSearchcriteria;
