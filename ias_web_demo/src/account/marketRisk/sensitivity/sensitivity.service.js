angular.module('ias.account').factory('sensitivityPositions', function($resource, apiAddress) {
    return $resource( apiAddress + '/sensitivity', {}, {
        post: {method: 'POST', params: {}},
    });
});
