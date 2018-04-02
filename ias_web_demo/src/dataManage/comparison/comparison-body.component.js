import {
    getTreeColumn,
    getLevelClass,
} from '../../helper/UIGrid';

const level0Template = `<div class="ui-grid-cell-contents" ng-class="grid.appScope.getLevelClass(row, 'column1')">{{row.entity.level0}}</div>`;
const level1Template = `<div class="ui-grid-cell-contents" ng-class="grid.appScope.getLevelClass(row, 'column2')">{{row.entity.level1}}</div>`;

const tradeAmountTemplate = `
    <div style="height: 30px; padding: 4px; float: right;font-weight: normal;line-height: 22px; display: inline-flex;">
        <span style="margin-right: 5px;">{{ row.entity.trade_part.amt | commafyConvert }}</span>
        <detail-pop-up-btn
            ng-if="row.entity.trade_part.buy_list.length > 0"
            pop-data-context="row.entity.trade_part"
            popup-template-url="src/dataManage/comparison/comparison-popup.html"
            layout="row" layout="start center">
            <span class="ias-icon list-view-normal"></span>
        </detail-pop-up-btn>
    </div>
`;
const posAmountTemplate = `
    <div style="height: 30px; padding: 4px; float: right;font-weight: normal;line-height: 22px; display: inline-flex;">
        <span style="margin-right: 5px;">{{ row.entity.pos_part.amt | commafyConvert }}</span>
        <detail-pop-up-btn
            ng-if="row.entity.pos_part.buy_list.length > 0"
            pop-data-context="row.entity.pos_part"
            popup-template-url="src/dataManage/comparison/comparison-popup.html"
            layout="row" layout="start center">
            <span class="ias-icon list-view-normal"></span>
        </detail-pop-up-btn>
    </div>
`;

const getBadGoodClass = function(grid, row, col) {
    const data = parseFloat(row.entity[col.name]);
    if (data === 0) {
        return '';
    }
    return data < 0 ? 'bad-price-color' : 'good-price-color';
};

const comparisonColumns = [
    getTreeColumn(),
    { field: 'level0', displayName: ' ', width: '135', cellTemplate: level0Template },
    { field: 'level1', displayName: '资产类型', cellTemplate: level1Template },
    { field: 'pos_part.code', displayName: '代码', cellClass: 'ias-bond-info' },
    { field: 'pos_part.name', displayName: '简称', cellClass: 'ias-bond-info' },
    {
        field: 'pos_part.amt',
        displayName: '数量',
        cellClass: 'ias-text-right',
        headerCellClass: 'ias-text-right',
        cellTemplate: posAmountTemplate,
    },
    {
        field: 'pos_part.cost_price',
        displayName: '成本价',
        cellFilter: 'toFixed2',
        cellClass: 'ias-text-right',
        headerCellClass: 'ias-text-right',
    },
    {
        field: 'pos_part.market_price',
        displayName: '市价',
        cellFilter: 'toFixed2',
        cellClass: 'grid-boundary ias-text-right',
        headerCellClass: 'ias-text-right',
    },
    { field: 'trade_part.code', displayName: '代码', cellClass: 'ias-bond-info' },
    { field: 'trade_part.name', displayName: '简称', cellClass: 'ias-bond-info' },
    {
        field: 'trade_part.amt',
        displayName: '数量',
        cellClass: 'ias-text-right',
        headerCellClass: 'ias-text-right',
        cellTemplate: tradeAmountTemplate,
    },
    {
        field: 'trade_part.trade_price',
        displayName: '交易价格',
        cellFilter: 'toFixed2',
        cellClass: 'grid-boundary ias-text-right',
        headerCellClass: 'ias-text-right',
    },
    { field: 'amt_diff', displayName: '数量', cellClass: getBadGoodClass, cellFilter: 'commafyConvert' },
    { field: 'cost_price_diff', displayName: '成本价-交易价', cellFilter: 'toFixed2' },
];

const NAME_MAP = {
    'asset': '资产',
    'liability': '负债',
    'bond': '债券',
    'stock': '股票',
    'fund': '基金',
    'exchange_collateral': '交易所质押式回购',
    'exchange_protocol': '交易所协议式回购',
    'interbank_buyout': '银行间买断式回购',
    'interbank_collateral': '银行间质押式回购',
};

function toTreeData(data) {
    if (!data) return;

    const treeData = [];
    ['asset', 'liability'].forEach((direction) => {
        if (!data[direction]) return;

        treeData.push({
            $$treeLevel: 0,
            level0: NAME_MAP[direction],
        });

        Object.keys(data[direction]).forEach((typeName) => {
            if (data[direction][typeName].length === 0) return;

            treeData.push({
                $$treeLevel: 1,
                level1: NAME_MAP[typeName],
            });
            data[direction][typeName].forEach((item) => {
                treeData.push({
                    $$treeLevel: 2,
                    pos_part: item.pos_part,
                    trade_part: item.trade_part,
                    amt_diff: item.amt_diff,
                    cost_price_diff: item.cost_price_diff,
                });
            });
        });
    });

    return treeData;
}

class ComparisonBodyCtrl {
    constructor($scope, compare) {
        this.compare = compare;
        this.gridOptions = {
            data: [],
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            exporterOlderExcelCompatibility: true,
            showTreeRowHeader: false,
            columnDefs: comparisonColumns,
            onRegisterApi: (gridApi) => {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerDataChangeCallback(function() {
                    $scope.gridApi.treeBase.collapseAllRows();
                });
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function(row, event) {
                    $scope.gridApi.treeBase.toggleRowTreeState(row);
                });
            },
        };

        $scope.getLevelClass = (row, column) => {
            return getLevelClass(row, column, 2);
        };
    }

    $onChanges(changes) {
        if (!changes) return;

        if (changes.data) {
            const data = changes.data.currentValue;
            if (!data) return;

            this.gridOptions.data = toTreeData(data);
        }
    }
}

export default function() {
    return {
        bindings: {
            data: '<',
        },
        template: `
            <div class="ias-ui-grid comparison-body"
                ui-grid="$ctrl.gridOptions"
                ui-grid-resize-columns
                ui-grid-auto-resize
                ui-grid-selection
                ui-grid-exporter
                ui-grid-tree-view>
            </div>
        `,
        controller: ['$scope', 'compare', ComparisonBodyCtrl],
    };
}
