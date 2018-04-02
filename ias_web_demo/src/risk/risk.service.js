import angular from 'angular';

angular.module('ias.risk')
    .factory('risks', function($resource, apiAddress) {
        return $resource(apiAddress + '/riskmanages', {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}},
        });
    })
    .factory('refreshErrorRules', function($resource, apiAddress) {
        return $resource(apiAddress + '/riskmanage/refresh_error_rules', {}, {
            get: {method: 'GET', params: {}},
        });
    })
    .factory('risk', function($resource, apiAddress) {
        return $resource(apiAddress + '/riskmanage/:rule_id', {rule_id: '@rule_id'}, {
            delete: {method: 'DELETE'},
            update: {method: 'PUT', params: {}},
        });
    })
    .factory('RiskConditions', function($resource, apiAddress) {
        return $resource(apiAddress + '/riskmanage/cond_index', {}, {
            get: {method: 'GET'},
        });
    })
    .factory('risksError', function($resource, apiAddress) {
        return $resource(apiAddress + '/riskmanage/error_rules', {}, {
            get: {method: 'GET', params: {}},
        });
    })
    .factory('RiskConditionService', function() {
        return {
            data: [],
            getIndexMap: function(indexName) {
                return this.data.find((item) => item.index_name === indexName);
            },
            getIndexName: function(indexCode, indexType) {
                let self = this;
                let found = self.data.find((item) => item.index_code === indexCode && item.index_type === indexType);
                return found ? found.index_name : '--';
            },
            getIndexCode: function(indexName) {
                let self = this;
                let found = self.data.find((item) => item.index_name === indexName);
                return found ? found.index_code : '';
            },
            getRuleIndexMaps: function() {
                let self = this;
                return self.data.map((item) => {
                    return {
                        name: item.index_name,
                        scenario: item.scenario,
                        operators: item.operators,
                        operandType: item.operand_type,
                        operandEnums: item.operand_enums,
                        availableOptions: item.available_options,
                    };
                });
            },
        };
    });
