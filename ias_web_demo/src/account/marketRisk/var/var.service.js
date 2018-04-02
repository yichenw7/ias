angular
.module('ias.account')
.factory('portfolioVarCte', function($resource, apiAddress) {
    return $resource( apiAddress + '/account_group/:account_group_id/var_cte', {account_group_id: '@account_group_id'}, {
        get: {method: 'POST', params: {}},
    });
});
