angular.module('ias.account').controller('marketRiskCtrl', function($scope, winStatus) {
    let isActive = 'sensitivity';

    const TAB_MAP = {
        sensitivity: 'sensitivity tab clicked',
        vaR: 'vaR tab clicked',
    };
    $scope.handleMarketRiskTabSelected = function(tabname) {
        isActive = tabname;

        if (winStatus.cur_account_list.length === 0) return;
        const msg = TAB_MAP[tabname];
        if (!msg) return;
        $scope.$broadcast(msg);
    };

    $scope.$on('market tab selected', function() {
        $scope.handleMarketRiskTabSelected(isActive);
    });
});
