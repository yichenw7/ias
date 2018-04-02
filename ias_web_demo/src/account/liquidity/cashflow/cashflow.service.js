angular
    .module('ias.account')
    .factory('Cashflow', function ($resource, apiAddress) {
        return $resource(
            apiAddress + "/account/cash_flows",
            {},
            { post: { method: 'POST', params: {} } }
        );
    })
    .factory('CashflowWithType', function ($resource, apiAddress) {
        return $resource(
            apiAddress + "/account/daily_cash_flows",
            {},
            { post: {method: 'POST', params: {} }}
        );
    })

