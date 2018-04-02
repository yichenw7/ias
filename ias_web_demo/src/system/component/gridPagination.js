import angular from 'angular';

/**
 *
 */
class gridPaginationCtrl {
    /**
     *
     * @param {any} $scope
     */
    constructor($scope) {
        $scope.gridOptions = this.gridOptions;
        $scope.gridApi = this.gridApi;
    }
}

let gridPagination = () => {
    return {
        templateUrl: 'src/system/gridPagination.html',
        bindings: {
            gridOptions: '<adminGridOptions',
            gridApi: '<adminGridApi',
        },
        bindToController: true,
        controller: ['$scope', gridPaginationCtrl],
    };
};

angular.module('ias.system').component('gridPagination', gridPagination());
