angular.module('ias.account').factory('pledgeBondsAutoCompletion', function($resource, apiAddress) {
    return $resource(apiAddress + '/account_group/ffffffffffffffffffffffffffffffff/pledge_bonds_auto_completion', {}, {
        post: {method: 'POST', params: {}},
    });
})
angular.module('ias.account').factory('pledgedBonds', function() {
    return {
        data: [],
        params: {},
        fromFilter: false,
    }
})
angular.module('ias.account').controller('pledgedBondsFilterCtrl', function($scope, $filter, dataCenter, winStatus, pledgeBondsAutoCompletion,
    authorityConstant, authorityControl, user, datetimePickerConfig, bondConstantKey, pledgedBonds) {
    class PledgedBondsFilter {
        constructor() {
            this.account_id = winStatus.cur_account_list.length === 1 ? winStatus.cur_account_list[0] : '';
            this.amount = '100';
            this.date = $filter('date')(new Date(), 'yyyy-MM-dd');
            this.trust = $scope.trustTypeGroups[0].value;
            this.sort_by = 'gap_small_first';

            this.price_type = 'cdc';
            this.price_operator = '*';
            this.price_val = 100;

            this.issuer_rating_current = 'AA';
            this.rating_current = 'all';
            this.bond_type = angular.copy(bondConstantKey.bond_type);
            this.enterprise_type = ['央企', '国企', '民企', '其他'];
        }

        toParam() {
            return {
                company_id: user.company_id,
                account_list: authorityControl.getAccountGroupMember([this.account_id]),
                plan_pledge_money_amt: parseFloat(this.amount) * 10000,
                auto_complete_rule:{
                    filter_params:{
                        trust: {
                            type: 'eq',
                            value: this.trust,
                        },
                        issuer_rating_current: {
                            type: 'greater eq',
                            value: this.issuer_rating_current === 'all' ? '' : this.issuer_rating_current,
                        },
                        rating_current: {
                            type: 'greater eq',
                            value: this.rating_current === 'all' ? '' : this.rating_current,
                        },
                        bond_type: {
                            type: 'in',
                            value: this.bond_type,
                        },
                        enterprise_type: {
                            type: 'in',
                            value: this.enterprise_type,
                        }
                    },
                    sort_by: this.sort_by,
                    pledge_price_param: {
                        price_type: this.price_type,
                        price_operator: this.price_operator,
                        price_val: (this.price_type === 'cdc' && this.price_operator === '*' ) ? parseFloat(this.price_val) / 100 : parseFloat(this.price_val)
                    }
                },
                date: this.date
            }
        }
    }

    $scope.pledgedBondsGridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFiltering: false,
        selectionRowHeaderWidth: 35,
        exporterOlderExcelCompatibility: true,
        exporterFieldCallback: function(grid, row, col, value) {
            return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
        },
        columnDefs: [
            { field: 'bond_code', displayName: '代码', width: '95', cellClass: 'tbody-special-font' },
            { field: 'short_name', displayName: '简称', width: '110', cellClass: 'tbody-special-font' },
            { field: 'pledge_available_volume', displayName: '可用量', cellFilter: 'thousandthNum', width: '80' },
            { field: 'auto_complete_info.pledge_volume', displayName: '使用量', cellFilter: 'thousandthNum', width: '100', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
            { field: 'auto_complete_info.pledge_price', displayName: '折算率(%)', cellFilter: 'toFixed4', width: '100', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
            { field: 'auto_complete_info.pledge_money_amt', displayName: '折后金额', cellFilter: 'commafyConvert', width: '120', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
            { field: 'bond_type', displayName: '债券类型', width: '100' },
            { field: 'enterprise_type', displayName: '企业类型', width: '80' },
            { field: 'rating_current', displayName: '债项评级', width: '80' },
            { field: 'issuer_rating_current', displayName: '主体评级', width: '80' },
            { field: 'issuer_rating_institution_name', displayName: '评级机构', width: '90' }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
    $scope.getEditAccount = function (account) {
        return (account.option == authorityConstant.ACCOUNT_WRITE);
    };
    $scope.timePickerConfig = datetimePickerConfig;
    $scope.myAccounts = dataCenter.account.accountsData;
    $scope.$watchCollection(
        function () { return dataCenter.account.accountsData; },
        function () {
            $scope.myAccounts = dataCenter.account.accountsData;
        }
    );

    $scope.bondTypes = bondConstantKey.bond_type.map(type => {
        return { name: type }
    });

    $scope.enterpriseTypes = [
        { name: '央企' },
        { name: '国企' },
        { name: '民企' },
        { name: '其他' },
    ];

    $scope.priceTypes = [
        { label: '中债估值', value: 'cdc' },
        { label: '自定义', value: 'custom' },
    ];

    $scope.priceOperators = [
        { label: '*', value: '*' },
        { label: '+', value: '+' },
        { label: '-', value: '-' },
    ];

    $scope.trustTypeGroups = [
        { label: '上清', value: 'sch' },
        { label: '中债', value: 'cdc' },
    ];

    $scope.ratings = [
        { label: '>=AAA', value: 'AAA' },
        { label: '>=AA+', value: 'AA+' },
        { label: '>=AA', value: 'AA' },
        { label: '>=A+', value: 'A+' },
        { label: '>=A', value: 'A' },
        { label: '不限', value: 'all' },
    ];

    $scope.autoFilter = function() {
        const params = $scope.filter.toParam()
        pledgeBondsAutoCompletion.post(
            params,
            function success(res) {
                $scope.pledgedBondsGridOptions.data = res.code === '0000' ? res.data : [];
                pledgedBonds.data = $scope.pledgedBondsGridOptions.data;
                pledgedBonds.params = params;
            }
        );
    }

    $scope.confirm = function() {
        pledgedBonds.fromFilter = true;
        $scope.dismiss();
    };

    $scope.dismiss = function() {
        $('#pledgedBondsFilterDlg').modal('hide');
    };

    $scope.exportPledgedBonds = function() {
        $scope.pledgedBondsGridOptions.exporterCsvFilename = `质押券_${$scope.filter.date}.csv`;
        $scope.exportExcel($scope.gridApi.exporter);
    }

    $('#pledgedBondsFilterDlg').on('show.bs.modal', function () {
        $scope.filter = new PledgedBondsFilter();
        $scope.pledgedBondsGridOptions.data = [];
    });
});