
const conditions = `<span class="risk-condition" ng-repeat="tag in row.entity.rule.condition_tags track by $index">{{ tag }}</span>`;

const switchOnOff = '<div class="onoffswitch" style="margin: 8px 20px;">' +
    '<input type="checkbox" class="onoffswitch-checkbox" ng-model="row.entity.enable" ng-true-value="1" ng-false-value="0">' +
    '<label class="onoffswitch-label" for="onOff" ng-click="grid.appScope.switchRule(row.entity, $event)">' +
    '<div class="onoffswitch-inner"></div>' +
    '<div class="onoffswitch-switch"></div>' +
    '</label>' +
    '</div>';

const action = '<div style="margin-top: 8px;">' +
    '<button class="ias-delete-btn" ng-click="grid.appScope.delete(row.entity, $event)">删除</button>' +
    '</div>';
const newTagTemplate = '<a disabled style="margin-top: 5px;margin-left: 5px">' +
    '<span class="glyphicon glyphicon-envelope" ng-if="row.entity.isNew" style="color: red;padding-top: 13px">' +
    '</span>' +
    '</a>';

const accountName = '<span style="line-height: 40px;">{{ row.entity.account_name }}</span>' +
    '<span ng-show="row.entity.hasValuationDate" class="valuation-icon">估</span>' +
    '<span ng-show="row.entity.is_group==1" class="account-group-icon">组</span>';

export const riskTable = {
    surveillanceAfterTransColumnDef: function() {
        return [
            { field: 'new_tag', displayName: '', width: '25', enableSorting: false, cellTemplate: newTagTemplate },
            { field: 'account_name', displayName: '应用账户', width: '12%', cellTemplate: accountName },
            { field: 'rule.conditions', displayName: '风控条件', enableSorting: false, cellTemplate: conditions },
            { field: 'msg', displayName: '异常信息', enableSorting: false },
            { field: 'update_time', width: '10%', displayName: '上次监控时间' },
            { field: 'rule.valid_period', width: '10%', displayName: '条件有效期' },
        ];
    },
    settingTransColumnDef: function() {
        return [
            { field: 'enable', displayName: ' ', minWidth: 100, width: '5%', enableSorting: false, cellTemplate: switchOnOff },
            { field: 'rule.scenerio', displayName: '场景', width: '5%', cellFilter: 'riskScenarioFilter', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
            { field: 'account_name', displayName: '应用账户', width: '12%', cellTemplate: accountName },
            { field: 'rule.condition_tags', displayName: '风控条件', cellTemplate: conditions, enableSorting: false, width: '30%' },
            { field: 'rule.start', displayName: '生效日期(含)', width: '11%' },
            { field: 'rule.end', displayName: '失效日期(含)', width: '11%' },
            { field: 'rule.match_action', displayName: '条件符合时动作', width: '8%', cellFilter: 'riskMatchFilter', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
            { field: 'comment', displayName: '备注', width: '9%' },
            { field: 'h', displayName: '操作', width: '8%', minWidth: 100, cellTemplate: action, enableSorting: false, headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
        ];
    },
};
