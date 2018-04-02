export default ['$resource', 'apiAddress', function compare($resource, apiAddress) {
    return $resource(apiAddress + '/positions_compare', {}, {
        query: {
            method: 'POST',
            params: {},
        },
    });
}];
