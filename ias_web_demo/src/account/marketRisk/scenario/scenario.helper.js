import {
    _numberFunc,
    naturalFunc,
    getTreeColumn,
} from '../../../helper/UIGrid';

function numberCategoryFunc(num1, num2, rowA, rowB, direction) {
    if ((typeof (rowA) == 'object' && typeof (rowB) == 'object') && (rowA.entity.name === '合计' || rowB.entity.name === '合计')) {
        return 0;
    }

    return _numberFunc(num1, num2, direction);
}

function naturalCategoryFunc(str1, str2, rowA, rowB, direction) {
    if ((typeof (rowA) == 'object' && typeof (rowB) == 'object') && (rowA.entity.name === '合计' || rowB.entity.name === '合计')) {
        return 0;
    }
    return naturalFunc(str1, str2, direction);
}

function setColorClass(grid, row, col) {
    if (row.entity.name === '合计') {
        return 'sum-data ias-text-right';
    }
    return 'ias-text-right';
}

export function toTree(data, type) {
    if (type === 'default') return data;
    let res = [];
    let cache = {};
    let total = null;
    data.forEach((item) => {
        if (item.name === '合计') {
            total = item;
            total.$$treeLevel = -1;
            return;
        }
        const field = item[type];
        if (!cache[field]) {
            cache[field] = [{
                $$treeLevel: 0,
                type: field ? field : '暂无',
            }];
        }
        item.$$treeLevel = 1;
        cache[field].push(item);
    });

    Object.keys(cache).forEach((key) => {
        let _total = null;
        cache[key].forEach((item) => {
            if (item.$$treeLevel === 0) {
                item.par = 0;
                item.pvbp = 0;
                item.init_proportion = 0;
                item.init_asset = 0;
                item.pnl = 0;
                item.yield_weight = 0;
                item.duration_weight = 0;
                _total = item;
                res.push(item);
                return;
            }
            res.push(item);
            _total.par += item.par;
            _total.pvbp += item.pvbp;
            _total.init_proportion += item.init_proportion;
            _total.init_asset += item.init_asset;
            _total.pnl += item.pnl;
            _total.yield_weight += item.par * item.yield;
            _total.duration_weight += item.par * item.duration;
        });
        _total.yield = _total.yield_weight / _total.par;
        _total.duration = _total.duration_weight / _total.par;
    });

    res.push(total);
    return res;
}

export function getColumnDefs() {
    const level1Temp = `<div ng-class="grid.appScope.getLevelClass(row, 'column1')" style="line-height: 30px;">{{row.entity.type}}</div>`;
    return [
        getTreeColumn(),
        { field: 'type', displayName: '分类', cellTemplate: level1Temp },
        { field: 'code', displayName: '代码', cellClass: 'ias-bond-info', sortingAlgorithm: naturalCategoryFunc },
        { field: 'name', displayName: '简称', cellClass: 'ias-bond-info', sortingAlgorithm: naturalCategoryFunc },
        { field: 'issuer_rating_current', width: '100', displayName: '主体评级' },
        {
            field: 'ttm',
            displayName: '剩余期限',
            cellFilter: 'toFixed2',
            headerCellClass: 'ias-text-right',
            cellClass: 'ias-text-right',
            sortingAlgorithm: numberCategoryFunc,
        },
        {
            field: 'val_type',
            displayName: '估值方式',
            sortingAlgorithm: numberCategoryFunc,
        },
        {
            field: 'par',
            displayName: '面额(元)',
            cellFilter: 'commafyConvert',
            headerCellClass: 'ias-text-right',
            cellClass: setColorClass,
            sortingAlgorithm: numberCategoryFunc,
        },
        {
            field: 'duration',
            displayName: '修正久期',
            cellFilter: 'toFixed4',
            headerCellClass: 'ias-text-right',
            cellClass: setColorClass,
            sortingAlgorithm: numberCategoryFunc,
        },
        {
            field: 'pvbp',
            displayName: 'DV01',
            cellFilter: 'commafyConvert',
            headerCellClass: 'ias-text-right',
            cellClass: setColorClass,
            sortingAlgorithm: numberCategoryFunc,
        },
        {
            field: 'init_dirty_price',
            displayName: '当前全价',
            cellFilter: 'toFixed4',
            headerCellClass: 'ias-text-right',
            cellClass: setColorClass,
            sortingAlgorithm: numberCategoryFunc,
        },
        {
            field: 'init_proportion',
            displayName: '占比(%)',
            cellFilter: 'toYield',
            headerCellClass: 'ias-text-right',
            cellClass: setColorClass,
            sortingAlgorithm: numberCategoryFunc,
        },
        {
            field: 'init_asset',
            displayName: '当前全价市值(元)',
            cellFilter: 'commafyConvert',
            headerCellClass: 'ias-text-right',
            cellClass: setColorClass,
            sortingAlgorithm: numberCategoryFunc,
        },
        { field: 'pnl', displayName: '预期浮动盈亏', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: setColorClass, sortingAlgorithm: numberCategoryFunc },
        { field: 'yield', displayName: '收益(%)', cellFilter: 'toYield', headerCellClass: 'ias-text-right', cellClass: setColorClass, sortingAlgorithm: numberCategoryFunc },
        // { field: 'z_spread', displayName: '零波动价差(%)', cellFilter: 'toYield', headerCellClass: 'ias-text-right', cellClass: setColorClass, sortingAlgorithm: numberCategoryFunc },
    ];
}
