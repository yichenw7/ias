import {
    getTreeColumn,
    codeTemplate,
    nameTemplate,
} from '../../../helper/UIGrid';

let level1Temp = '<div ng-class="grid.appScope.getLevel1(row)" style="line-height: 30px;">{{row.entity.level1}}</div>';
let level2Temp = '<div ng-class="grid.appScope.getLevel2(row)" style="line-height: 30px;">{{row.entity.level2}}</div>';
function setStyle(grid, row, col) {
    if (row.entity.level1) {
        return 'portfolio-data-1 ias-text-right';
    } else if (row.entity.level2) {
        return 'portfolio-data-2 ias-text-right';
    }
    return 'ias-text-right';
}
export function vaRColumnDef(sortClass) {
    return [
        getTreeColumn(),
        { field: 'level1', displayName: '', width: '135', enableColumnResizing: false, cellTemplate: level1Temp },
        { field: 'level2', displayName: '', width: '135', enableColumnResizing: false, cellTemplate: level2Temp },
        { field: 'code', displayName: '债券代码', cellTemplate: codeTemplate },
        { field: 'name', displayName: '债券名称', cellTemplate: nameTemplate },
        { field: 'std', displayName: '波动率(%)', cellFilter: 'toYield', headerCellClass: 'ias-text-right', cellClass: setStyle, sortingAlgorithm: sortClass.numberFunc },
        { field: 'var', displayName: '参数VaR', cellFilter: 'commafyConvert | toNotApplicable', headerCellClass: 'ias-text-right', cellClass: setStyle, sortingAlgorithm: sortClass.numberFunc },
        { field: 'cte', displayName: '参数CTE', cellFilter: 'commafyConvert | toNotApplicable', headerCellClass: 'ias-text-right', cellClass: setStyle, sortingAlgorithm: sortClass.numberFunc },
        { field: 'var_to_net', displayName: 'VaR/当日净资产', cellFilter: 'toFixed4 | toNotApplicable', headerCellClass: 'ias-text-right', cellClass: setStyle, sortingAlgorithm: sortClass.numberFunc },
        { field: 'cte_to_net', displayName: 'CTE/当日净资产', cellFilter: 'toFixed4 | toNotApplicable', headerCellClass: 'ias-text-right', cellClass: setStyle, sortingAlgorithm: sortClass.numberFunc },
        { field: 'market_value', displayName: '持仓市值(万)', cellFilter: 'parAmountConvert | toNotApplicable', headerCellClass: 'ias-text-right', cellClass: setStyle, sortingAlgorithm: sortClass.numberFunc },
    ];
}
