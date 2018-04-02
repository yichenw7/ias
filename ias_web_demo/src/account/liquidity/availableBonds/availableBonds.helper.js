import {
    _numberFunc,
    naturalFunc,
} from '../../../helper/UIGrid';

//公用为code和name，此接口为bond_code和short_name，暂时不能用公用的
const codeTemplate = `
<a href="" style="line-height: 30px;padding-left: 10px;" ng-class="{true:'ias-bond-info code-name-color',false:'sum-data'}[row.entity.bond_key_listed_market !== undefined]"
    ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">
    {{row.entity.bond_code}}
</a>
`;

const nameTemplate = `
<a href="" style="line-height: 30px;padding-left: 10px;" ng-class="{true:'ias-bond-info code-name-color',false:'sum-data'}[row.entity.bond_key_listed_market !== undefined]"
    ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">
    {{row.entity.short_name}}
</a>
`;

function numberCategoryFunc(num1, num2, rowA, rowB, direction) {
    if ((typeof (rowA) == "object" && typeof (rowB) == "object") && (rowA.entity.bond_key_listed_market == undefined
        || rowB.entity.bond_key_listed_market == undefined || rowA.entity.bond_code == undefined || rowB.entity.bond_code == undefined)) {
        return 0;
    }

    return _numberFunc(num1, num2, direction);
}

function naturalCategoryFunc(str1, str2, rowA, rowB, direction) {
    if ((typeof (rowA) == "object" && typeof (rowB) == "object") && (rowA.entity.bond_key_listed_market == undefined
        || rowB.entity.bond_key_listed_market == undefined || rowA.entity.bond_code == undefined || rowB.entity.bond_code == undefined)) {
        return 0;
    }
    return naturalFunc(str1, str2, direction);
}


function setColor(grid, row, col) {
    return row.entity.bond_key_listed_market ? 'ias-text-right' : 'sum-data ias-text-right';
}

function setColorCenter(grid, row, col) {
    return row.entity.bond_key_listed_market ? 'ias-text-center' : 'sum-data ias-text-center';
}

export function interbankColumnDef() {
    var pledgeOutTemplate = '<detail-tip-btn tip-view-id="\'pledgeBondDetailPage\'" ng-if="row.entity.pledge_out && row.entity.pledge_out.length > 0" \
    show-detail-func="grid.appScope.showPledgeBondDetail(list)" bond-list="row.entity.pledge_out" style="float: right"\
    tip-left="400" tip-top="85">\
    </detail-tip-btn>\
    <div style="float: right;margin-right: 10px;line-height: 30px" ng-class="{true: \'sum-data\'}[!row.entity.bond_key_listed_market]">{{ row.entity.pledge_out_volume | toWanYuan | thousandthNum }}</div>';

    var buyoutInTemplate = '<detail-tip-btn tip-view-id="\'pledgeBondDetailPage\'" ng-if="row.entity.buyout_in && row.entity.buyout_in.length > 0" \
    show-detail-func="grid.appScope.showPledgeBondDetail(list)" bond-list="row.entity.buyout_in" style="float: right"\
    tip-left="400" tip-top="85">\
    </detail-tip-btn>\
    <div style="float: right;margin-right: 10px;line-height: 30px" ng-class="{true: \'sum-data\'}[!row.entity.bond_key_listed_market]">{{ row.entity.buyout_in_volume | toWanYuan | thousandthNum }}</div>';

    var buyoutOutTemplate = '<detail-tip-btn tip-view-id="\'pledgeBondDetailPage\'" ng-if="row.entity.buyout_out && row.entity.buyout_out.length > 0" \
    show-detail-func="grid.appScope.showPledgeBondDetail(list)" bond-list="row.entity.buyout_out" style="float: right"\
    tip-left="400" tip-top="85">\
    </detail-tip-btn>\
    <div style="float: right;margin-right: 10px;line-height: 30px" ng-class="{true: \'sum-data\'}[!row.entity.bond_key_listed_market]">{{ row.entity.buyout_out_volume | toWanYuan | thousandthNum }}</div>';

    return [
        { 
          field: 'bond_code',
          displayName: '债券代码',
          width: '150', 
          cellTemplate: codeTemplate, 
          sortingAlgorithm: naturalCategoryFunc, 
        },
        { 
          field: 'short_name', 
          displayName: '债券简称', 
          width: '170', 
          cellTemplate: nameTemplate, 
          sortingAlgorithm: naturalCategoryFunc,
        },
        { 
          field: 'val_clean_price', 
          displayName: '中债估值净价', 
          width: '110', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'toFixed2', 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        {
          field: 'next_coupon_date',
          displayName: '下一付息日', 
          width: '200', 
          headerCellClass: 'ias-text-right', 
          cellClass: setColor, 
          sortingAlgorithm: naturalCategoryFunc, 
        },
        { 
          field: 'position_volume', 
          displayName: '持仓(万)', 
          width: '140', 
          headerCellClass: 'ias-text-right',
          cellFilter: 'toWanYuan | thousandthNum', 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'available_volume', 
          displayName: '可用量(万)', 
          width: '140', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'toWanYuan | thousandthNum', 
          cellClass: setColor, sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'buyout_in_volume', 
          displayName: '买断入(万)', 
          width: '140', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'toWanYuan | thousandthNum', 
          cellTemplate: buyoutInTemplate, 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'buyout_out_volume', 
          displayName: '卖断冻结(万)', 
          width: '140', 
          headerCellClass: 'ias-text-right',
          cellFilter: 'toWanYuan | thousandthNum', 
          cellTemplate: buyoutOutTemplate, 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'pledge_out_volume', 
          displayName: '质押出冻结(万)',
          width: '140', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'toWanYuan | thousandthNum', 
          cellTemplate: pledgeOutTemplate, 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'trust', 
          displayName: '托管机构', 
          width: '110', 
          headerCellClass: 'ias-text-right', 
          cellClass: setColor, 
          cellFilter: 'trustTranslate', 
          sortingAlgorithm: naturalCategoryFunc,
        },
        { 
          field: 'issuer_rating_current', 
          displayName: '主体评级', 
          width: '110', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'columnNullValue', 
          cellClass: setColor, 
          sortingAlgorithm: naturalCategoryFunc,
        },
        { 
          field: 'enterprise_type', 
          displayName: '企业性质', 
          width: '110', 
          headerCellClass: 'ias-text-right', 
          cellClass: setColor, 
          sortingAlgorithm: naturalCategoryFunc,
        },
        { 
          field: 'account_name', 
          displayName: '账户名称', 
          minWidth: '200', 
          headerCellClass: 'ias-text-center', 
          cellClass: setColorCenter, 
          sortingAlgorithm: naturalCategoryFunc, 
        },
    ];
}

export function exchangeColumnDef() {
    var protocolPledgeOutVolume = '<detail-tip-btn tip-view-id="\'pledgeBondDetailPage\'" ng-if="row.entity.protocol_pledge_out  && row.entity.protocol_pledge_out.length > 0" \
            show-detail-func="grid.appScope.showPledgeBondDetail(list)" bond-list="row.entity.protocol_pledge_out " style="float: right"\
            tip-left="400" tip-top="85">\
        </detail-tip-btn>\
        <div style="float: right;margin-right: 10px;line-height: 30px" ng-class="{true: \'sum-data\'}[!row.entity.bond_key_listed_market]">{{ row.entity.protocol_pledge_out_volume | thousandthNum }}</div>';

    return [
        { 
          field: 'bond_code', 
          displayName: '债券代码', 
          width: '150', 
          cellTemplate: codeTemplate, 
          sortingAlgorithm: naturalCategoryFunc, 
        },
        { 
          field: 'short_name', 
          displayName: '债券简称', 
          width: '170', 
          cellTemplate: nameTemplate, 
          sortingAlgorithm: naturalCategoryFunc,
        },
        { 
          field: 'position_volume', 
          displayName: '持仓(张)',
          width: '140', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'thousandthNum', 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'available_volume', 
          displayName: '可用量(张)', 
          width: '140', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'thousandthNum', 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'conversion_factor', 
          displayName: '质押比(%)', 
          width: '110', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'columnNullValue', 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'normalized_bond_available_volume', 
          displayName: '可提交标准券(张)',
          width: '140', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'thousandthNum | columnNullValue', 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'normalized_bond_volume', 
          displayName: '已入库标准券(张)', 
          width: '140', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'thousandthNum | columnNullValue', 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'protocol_pledge_out_volume', 
          displayName: '协议式回购质押冻结(张)', 
          width: '180', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'thousandthNum', 
          cellTemplate: protocolPledgeOutVolume, 
          cellClass: setColor, 
          sortingAlgorithm: numberCategoryFunc 
        },
        { 
          field: 'issuer_rating_current', 
          displayName: '主体评级', 
          width: '110', 
          headerCellClass: 'ias-text-right', 
          cellFilter: 'columnNullValue', 
          cellClass: setColor, sortingAlgorithm: naturalCategoryFunc,
        },
        { 
          field: 'enterprise_type', 
          displayName: '企业性质', 
          width: '110', 
          headerCellClass: 'ias-text-right', 
          cellClass: setColor, 
          sortingAlgorithm: naturalCategoryFunc,
        },
        { 
          field: 'market', 
          displayName: '交易场所', 
          width: '110', 
          cellFilter: 'typeTranslate',
          headerCellClass: 'ias-text-right', 
          cellClass: setColor, 
          sortingAlgorithm: naturalCategoryFunc,
        },
        { 
          field: 'account_name', 
          displayName: '账户名称', 
          minWidth: '200', 
          headerCellClass: 'ias-text-center', 
          cellClass: setColorCenter, 
          sortingAlgorithm: naturalCategoryFunc,
        },
    ];
}