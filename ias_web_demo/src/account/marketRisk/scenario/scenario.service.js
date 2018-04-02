angular
    .module('ias.account')
    .factory('ScenarioAnalysis', function($resource, apiAddress) {
        return $resource(apiAddress + '/scenario', {}, {
            post: { method: 'POST', params: {} },
        });
    })
    .factory('yieldCurveShifts', function() {
        return {
            type: 'all', // all | keyTerm
            value: 0,
            list: [
                { name: '0天', field: '0D', value: 0 }, { name: '3年', field: '3Y', value: 0 },
                { name: '1月', field: '1M', value: 0 }, { name: '4年', field: '4Y', value: 0 },
                { name: '2月', field: '2M', value: 0 }, { name: '5年', field: '5Y', value: 0 },
                { name: '3月', field: '3M', value: 0 }, { name: '6年', field: '6Y', value: 0 },
                { name: '6月', field: '6M', value: 0 }, { name: '7年', field: '7Y', value: 0 },
                { name: '9月', field: '9M', value: 0 }, { name: '8年', field: '8Y', value: 0 },
                { name: '1年', field: '1Y', value: 0 }, { name: '9年', field: '9Y', value: 0 },
                { name: '2年', field: '2Y', value: 0 }, { name: '10年', field: '10Y', value: 0 },
            ],
            toJson: function() {
                const res = {};
                if (this.type === 'all') {
                    res.all = this.value;
                }

                if (this.type === 'keyTerm') {
                    this.list.forEach((item) => {
                        res[item.field] = item.value;
                    });
                }
                return res;
            },
        };
    });
