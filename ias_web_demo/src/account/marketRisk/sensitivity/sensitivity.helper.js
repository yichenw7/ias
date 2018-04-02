import {
    getTreeColumn,
    codeTemplate,
    nameTemplate,
    _numberFunc,
    naturalFunc,
} from '../../../helper/UIGrid';
import { IASCharts } from '../../../helper/IASCharts';

export const tableTypes = [
    { label: '持仓券面', value: 1 },
    { label: 'DV01', value: 2 },
    { label: '关键期限久期', value: 3 },
];
export const otherTypes = [
    { label: '持仓券面', value: 1 },
    { label: 'DV01', value: 2 },
];

let chartData = [];

export function drawSensitivityChart(id, showType, parChart, pvbpChart) {
    let chartData = showType === 1 ? drawTimeSeries(parChart) : drawTimeSeries(pvbpChart);
    let sensitivityChartConfig = {
        dataSets: [{
            title: '',
            fieldMappings: [{
                fromField: '利率债',
                toField: '利率债',
            }, {
                fromField: '信用债及其他',
                toField: '信用债及其他',
            }, {
                fromField: 'NCD',
                toField: 'NCD',
            }, {
                fromField: '所有品种',
                toField: '所有品种',
            }],
            dataProvider: chartData,
            categoryField: 'date',
        }],
        panels: [{
            valueAxes: [{
                id: 'accYieldAxis',
                zeroGridAlpha: 1,
            }],
            showCategoryAxis: true,
            percentHeight: 50,
            stockGraphs: [{
                title: '所有品种',
                fillAlphas: 0.7,
                useDataSetColors: false,
                lineColor: '#00b8ff',
                type: 'line',
                lineThickness: 2,
                fillColors: ['#00b8ff', 'rgba(81,81,81,0.00)'],
                negativeBase: 0,
                negativeLineColor: '#00b8ff',
                negativeFillColors: ['rgba(81,81,81,0.00)', '#00b8ff'],
                valueField: '所有品种',
                valueAxis: 'accYieldAxis',
            }, {
                title: '利率债',
                fillAlphas: 0.7,
                useDataSetColors: false,
                lineColor: '#ffffff',
                lineThickness: 2,
                fillColors: ['#ffffff', 'rgba(81,81,81,0.00)'],
                negativeBase: 0,
                negativeLineColor: '#ffffff',
                negativeFillColors: ['rgba(81,81,81,0.00)', '#ffffff'],
                type: 'line',
                bulletBorderAlpha: 1,
                balloonText: '<b>[[value]]</b>',
                valueField: '利率债',
                valueAxis: 'accYieldAxis',
            }, {
                title: '信用债及其他',
                fillAlphas: 0.7,
                useDataSetColors: false,
                lineColor: '#eeab1f',
                type: 'line',
                lineThickness: 2,
                fillColors: ['#eeab1f', 'rgba(81,81,81,0.00)'],
                negativeBase: 0,
                negativeLineColor: '#eeab1f',
                negativeFillColors: ['rgba(81,81,81,0.00)', '#eeab1f'],
                valueField: '信用债及其他',
                valueAxis: 'accYieldAxis',
            }, {
                title: 'NCD',
                fillAlphas: 0.7,
                useDataSetColors: false,
                lineColor: '#b63636',
                type: 'line',
                lineThickness: 2,
                fillColors: ['#b63636', 'rgba(81,81,81,0.00)'],
                negativeBase: 0,
                negativeLineColor: '#b63636',
                negativeFillColors: ['rgba(81,81,81,0.00)', '#b63636'],
                valueField: 'NCD',
                valueAxis: 'accYieldAxis',
            }],
            stockLegend: {
                periodValueTextRegular: '[[value]]',
                color: '#878787',
                fontSize: 14,
            },
        }],
    };
    return IASCharts.drawChart(id, sensitivityChartConfig);
}

function drawTimeSeries(data) {
    let cloneChartData = [];
    angular.copy(data, cloneChartData);
    formatSensitivityAndRender(cloneChartData);
    return cloneChartData;
}
function formatSensitivityAndRender(sensitivityListData) {
    sensitivityListData.forEach(function(asset) {
        formatFunc(asset);
        chartData.push(formatSensitivityData(asset));
    });

    function formatFunc(asset) {
        asset.所有品种 = (asset.所有品种).toFixed(2);
        asset.利率债 = (asset.利率债).toFixed(2);
        asset.信用债及其他 = (asset.信用债及其他).toFixed(2);
        asset.NCD = (asset.NCD).toFixed(2);
    }
}
function formatSensitivityData(asset) {
    return {
        date: asset.date,
        所有品种: asset.所有品种,
        利率债: asset.利率债,
        信用债及其他: asset.信用债及其他,
        NCD: asset.NCD,
    };
}
function numberCategoryFunc(num1, num2, rowA, rowB, direction) {
    if ((typeof (rowA) == 'object' && typeof (rowB) == 'object') && (rowA.entity.type === '总计' || rowB.entity.type === '总计')) {
        return 0;
    }

    return _numberFunc(num1, num2, direction);
}

function naturalCategoryFunc(str1, str2, rowA, rowB, direction) {
    if ((typeof (rowA) == 'object' && typeof (rowB) == 'object') && (rowA.entity.type === '总计' || rowB.entity.type === '总计')) {
        return 0;
    }
    return naturalFunc(str1, str2, direction);
}
let rightColorFunc = function(grid, row, col) {
    return row.entity.type === '总计' ? 'sum-data ias-text-right' : 'ias-text-right';
};
let leftColorFunc = function(grid, row, col) {
    return row.entity.type === '总计' ? 'sum-data ias-text-left' : 'ias-text-left';
};
let level1Temp = '<div ng-class="grid.appScope.getLevel1(row)" style="line-height: 30px;">{{row.entity.type}}</div>';

export function sensitivityPars() {
    return [
        getTreeColumn(),
        { field: 'type', displayName: '类型', width: '135', enableColumnResizing: false, cellTemplate: level1Temp, headerCellClass: 'ias-text-left', cellClass: leftColorFunc, sortingAlgorithm: naturalCategoryFunc },
        { field: 'code', displayName: '债券代码', cellTemplate: codeTemplate, sortingAlgorithm: naturalCategoryFunc },
        { field: 'name', displayName: '债券名称', cellTemplate: nameTemplate, sortingAlgorithm: naturalCategoryFunc },
        { field: 'total', displayName: '持仓券面', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc },
        { field: 't1m', displayName: '1个月', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't3m', displayName: '3个月', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't6m', displayName: '6个月', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't1y', displayName: '1年', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't2y', displayName: '2年', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't3y', displayName: '3年', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't4y', displayName: '4年', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't5y', displayName: '5年', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't7y', displayName: '7年', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't10y', displayName: '10年', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't10yplus', displayName: '10年以上', cellFilter: 'thousandthNum | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
    ];
}

export function sensitivityPvbps() {
    return [
        getTreeColumn(),
        { field: 'type', displayName: '类型', width: '135', enableColumnResizing: false, cellTemplate: level1Temp, headerCellClass: 'ias-text-left', cellClass: leftColorFunc, sortingAlgorithm: naturalCategoryFunc },
        { field: 'code', displayName: '债券代码', cellTemplate: codeTemplate, sortingAlgorithm: naturalCategoryFunc },
        { field: 'name', displayName: '债券名称', cellTemplate: nameTemplate, sortingAlgorithm: naturalCategoryFunc },
        { field: 'total', displayName: 'DV01', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't1m', displayName: '1个月', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't3m', displayName: '3个月', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't6m', displayName: '6个月', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't1y', displayName: '1年', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't2y', displayName: '2年', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't3y', displayName: '3年', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't4y', displayName: '4年', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't5y', displayName: '5年', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't7y', displayName: '7年', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't10y', displayName: '10年', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't10yplus', displayName: '10年以上', cellFilter: 'commafyConvert | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
    ];
}

export function sensitivityDurations() {
    return [
        getTreeColumn(),
        { field: 'type', displayName: '类型', width: '135', enableColumnResizing: false, cellTemplate: level1Temp, headerCellClass: 'ias-text-left', cellClass: leftColorFunc, sortingAlgorithm: naturalCategoryFunc },
        { field: 'code', displayName: '债券代码', cellTemplate: codeTemplate, sortingAlgorithm: naturalCategoryFunc },
        { field: 'name', displayName: '债券名称', cellTemplate: nameTemplate, sortingAlgorithm: naturalCategoryFunc },
        { field: 'total', displayName: '久期(到期)', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't1m', displayName: '1个月', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't3m', displayName: '3个月', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't6m', displayName: '6个月', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't1y', displayName: '1年', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't2y', displayName: '2年', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't3y', displayName: '3年', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't4y', displayName: '4年', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't5y', displayName: '5年', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't7y', displayName: '7年', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't10y', displayName: '10年', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
        { field: 't10yplus', displayName: '10年以上', cellFilter: 'toFixed4 | columnNullValue', cellClass: rightColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: numberCategoryFunc},
    ];
}

export function sensitivityParTimeSeries() {
    return [
        { field: 'date', width: '100', displayName: '日期'},
        { field: '所有品种', displayName: '所有品种', cellFilter: 'thousandthNum | columnNullValue', cellClass: 'sum-data ias-text-right', headerCellClass: 'ias-text-right' },
    ];
}
export function sensitivityPvbpTimeSeries() {
    return [
        { field: 'date', width: '100', displayName: '日期'},
        { field: '所有品种', displayName: '所有品种', cellFilter: 'commafyConvert | columnNullValue', cellClass: 'sum-data ias-text-right', headerCellClass: 'ias-text-right' },
    ];
}
/**
 *
 * @param {Array} data
 * @param {Array} column 原先表格(只有日期和所有品种两列)
 * @param {String} filter 表格cellFilter
 * @return {Array} 根据后台数据增加列
 */
export function gridConfig(data, column, filter) {
    let keys = Object.keys(data[0]);
    keys.forEach(function(type) {
        if (type !== 'date' && type !== '所有品种') {
            column.push({ field: type, displayName: type, cellFilter: filter, headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' });
        }
    });
    return column;
}
/**
 *
 * @param {Array} data
 * @return {Array} 在原数据新增一行总计
 */
// export function calcTableSummary(data) {
//     let total = {
//         type: '总计',
//         total: 0,
//         t1m: 0,
//         t3m: 0,
//         t6m: 0,
//         t1y: 0,
//         t2y: 0,
//         t3y: 0,
//         t4y: 0,
//         t5y: 0,
//         t7y: 0,
//         t10y: 0,
//         t10yplus: 0,
//     };
//     data.forEach(function(type) {
//         total.total += (type.total || 0);
//         total.t1m += (type.t1m || 0);
//         total.t3m += (type.t3m || 0);
//         total.t6m += (type.t6m || 0);
//         total.t1y += (type.t1y || 0);
//         total.t2y += (type.t2y || 0);
//         total.t3y += (type.t3y || 0);
//         total.t4y += (type.t4y || 0);
//         total.t5y += (type.t5y || 0);
//         total.t7y += (type.t7y || 0);
//         total.t10y += (type.t10y || 0);
//         total.t10yplus += (type.t10yplus || 0);
//     });
//     data.push(total);
//     return data;
// }

export function toTreeLevel(data) {
    let res = [];
    data.forEach(function(type) {
        type.$$treeLevel = (type.type === '总计') ? -1 : 0;
        res.push(type);
        if (type.hasOwnProperty('bonds')) {
            type.bonds.forEach(function(bond) {
                bond.$$treeLevel = 1;
                res.push(bond);
            });
        }
    });
    return res;
}

export function toggleNoNodeClass(node) {
    if (!node.parentRow) return false;
    let brothers = node.parentRow.treeNode.children;
    return (brothers.indexOf(node) === brothers.length - 1) ? 'view-nonodemax-tree' : 'view-nonode-tree';
}
