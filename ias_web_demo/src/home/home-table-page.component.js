import { BondAllocationMap } from '../helper/Bond';

class homeTablePage {
    constructor($scope, accountService, assetsDistribution, authorityControl, uiGridConstants, sortClass) {
        const nameTemplate = `
            <div style="display:inline-flex; align-items:center;height:100%;" class="showEllipsis">
                <a href="" class="ias-bond-info" style="padding-left:10px;">{{ row.entity.name }}</a>
                <img class="valuation-account-image" ng-show="grid.appScope.isValuationAccount(row.entity.id)" style="top:0;">
                <label class="readonly-account" ng-show="row.entity.option == '1'">只读</label>
            </div>
        `;

        const self = this;

        this.authorityControl = authorityControl;
        this.assetsDistribution = assetsDistribution;
        this.uiGridConstants = uiGridConstants;
        this.$scope = $scope;
        this.$scope.isValuationAccount = accountService.isValuationAccount;

        this.curSelectedAccount = {
            company_id: '',
            id: '',
            date: '',
            reset: function() {
                this.company_id = '';
                this.id = '';
                this.date = '';
            },
            set: function(selection) {
                this.id = selection.id;
                this.date = selection.date;

                self.getAssetsDistribution();
            },
        };

        this.gridOptions = {
            data: [],
            enableSorting: true,
            enableRowSelection: true,
            enableColumnMenus: false,
            multiSelect: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            rowHeight: 30,
            columnDefs: [
                { field: 'name', displayName: '账户名称', width: '200', cellTemplate: nameTemplate },
                { field: 'fund_cost', displayName: '本金(万)', width: '100', cellFilter: 'toWan | commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'shares', displayName: '份额(万)', width: '100', cellFilter: 'toWan | commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'target_cost', displayName: '目标收益(%)', width: '100', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'unit_asset_net', displayName: '单位净值', width: '100', cellFilter: 'toFixed4', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'date', displayName: '日期', width: '100' },
                { field: 'daily_rate', displayName: '日增长率(%)', width: '100', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'create_rate', displayName: '成立以来(%)', width: '100', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
            ],
            onRegisterApi: function(gridApi) {
                self.gridApi = gridApi;
                self.gridApi.grid.registerRowsProcessor(function(renderalbeRows) {
                    renderalbeRows.forEach(function(row) {
                        if (self.filter != null && self.filter != '' && (row.entity.name.indexOf(self.filter) < 0)) {
                            row.visible = false;
                        }
                    });
                    return renderalbeRows;
                }, 200);
                self.gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                    if (row.isSelected) {
                        self.curSelectedAccount.set(row.entity);
                    } else {
                        self.curSelectedAccount.reset();
                    }
                });
            },
        };

        this.pie = null;
        this.chart = null;
    }

    _drawPie(dataProvider) {
        if (this.pie) {
            this.pie.dataProvider = dataProvider;
            this.pie.validateData();
        } else {
            this.pie = AmCharts.makeChart('assetsDistribution', {
                type: 'pie',
                theme: 'iasTheme',
                startDuration: 0,
                addClassNames: true,
                legend: {
                    position: 'right',
                    autoMargins: true,
                    valueWidth: 100,
                },
                outlineThickness: 0,
                precision: 2,
                innerRadius: '70%',
                valueField: 'assetValue',
                titleField: 'assetType',
                dataProvider: dataProvider,
            });
        }
    }

    _drawChart(dataProvider) {
        if (this.chart) {
            this.chart.dataProvider = dataProvider;
            this.chart.validateData();
        } else {
            this.chart = AmCharts.makeChart('assetsChange', {
                type: 'serial',
                theme: 'iasTheme',
                startDuration: 0,
                categoryField: 'category',
                rotate: true,
                categoryAxis: {
                    'gridPosition': 'start',
                },
                graphs: [
                    {
                        balloonText: '[[category]]:[[value]]%',
                        fillAlphas: 1,
                        fillColors: '#b63636',
                        lineColor: '#b63636',
                        labelText: '[[value]]',
                        type: 'column',
                        valueField: 'value',
                        negativeBase: 0,
                        negativeFillAlphas: 1,
                        negativeFillColors: '#449e5d',
                        negativeLineColor: '#449e5d',
                    },
                ],
                dataProvider: dataProvider,
            });
        }
    }

    draw(data) {
        const pieDataProvider = [];
        const chartDataProvider = [];

        BondAllocationMap.forEach((map) => {
            const field = map.assetAllocation;
            const changeField = map.assetTotalField;
            const label = map.label;
            pieDataProvider.push({
                assetValue: data[field] ? data[field].toFixed(2) : 0,
                assetType: label,
            });

            chartDataProvider.push({
                value: data[changeField] ? data[changeField].toFixed(2) : 0,
                category: label,
            });
        });

        this._drawPie(pieDataProvider);
        this._drawChart(chartDataProvider);
    }

    getAssetsDistribution() {
        const self = this;
        this.assetsDistribution.post({
            account_list: self.authorityControl.getAccountGroupMember([self.curSelectedAccount.id]),
            date: self.curSelectedAccount.date,
        }, function success(response) {
            if (response.code && response.code === '0000') {
                self.draw(response.data);
            }
        }, function failed() {
            console.error('账户资产变动获取失败！');
        });
    }


    $onChanges(changes) {
        if (!changes) return;

        if (changes.data) {
            const data = changes.data.currentValue;
            this.gridOptions.data = data;
        }

        if (changes.filter) {
            this.filter = changes.filter.currentValue;
            this.gridApi && this.gridApi.core.notifyDataChange(this.uiGridConstants.dataChange.COLUMN);
        }
    }
}

let component = () => {
    return {
        transclude: true,
        bindings: {
            data: '<',
            filter: '<',
        },
        template: `
            <div class="ias-ui-grid" ui-grid="$ctrl.gridOptions" ui-grid-selection ui-grid-resize-columns></div>
            <div id="assetsDistribution"></div>
            <div id="assetsChange"></div>
        `,
        controller: ['$scope', 'accountService', 'assetsDistribution', 'authorityControl', 'uiGridConstants', 'sortClass', homeTablePage],
    };
};

export default component;
