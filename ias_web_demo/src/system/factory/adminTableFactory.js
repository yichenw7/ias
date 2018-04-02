import {
    getTreeColumn,
} from '../../helper/UIGrid';

angular.module('ias.system').factory('adminTableFactory', function(sortClass, uiGridConstants) {

    function buildActionButton(option) {
        if (!option) return '';

        if (!angular.isArray(option.buttons)) {
            return '';
        }

        return option.buttons.map((item) =>
            `<button class="${item.class} admin-grid-btn" tag="${item.type}">
                <span class="glyphicon glyphicon-${item.icon}"></span>
             </button>`
        ).join('');
    };

    return {
        qbUserColumnDef: function() {
            var actionTemplate =
                '<button class="  admin-grid-btn" ng-click="grid.appScope.edit(row.entity)">' +
                '<span class="glyphicon glyphicon-pencil"></span>' +
                '</button>' +
                '<button class="ias-delete-btn admin-grid-btn" ng-click="grid.appScope.delete(row.entity)">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
                '</button>';
            return [
                { field: 'account_name', displayName: '账号', width: '25%' },
                { field: 'user_name', displayName: '姓名', width: '15%' },
                { field: 'role_list', displayName: '角色', width: '30%', cellFilter: 'userRoleList' },
                { field: 'action', displayName: '操作', minWidth: '200', cellTemplate: actionTemplate }
            ];
        },
        accountAuthorityColumnDef: function() {
            var actionTemplate = '<button class="  admin-grid-btn" ng-click="grid.appScope.authority_edit(row.entity)">' +
                '<span class="glyphicon glyphicon-pencil"></span>' +
                '</button>';
            return [
                { field: 'name', displayName: '账户名称', width: '320' },
                {
                    field: 'manager_name', displayName: '投资经理', width: '110',
                    sortingAlgorithm: function(a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) }, sort: { direction: uiGridConstants.ASC }
                },
                { field: 'read_users_name', displayName: '查看权限', minWidth: '100' },
                { field: 'write_users_name', displayName: '编辑权限', minWidth: '100' },
                { field: 'action', displayName: '操作', width: '70', cellTemplate: actionTemplate }
            ];
        },
        setAccountAuthorityColumnDef: function() {
            var authorityTemplate =
                '<label class="ias-info-label radio-normal" style="line-height: 30px"' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.option == \'0\']">' +
                '<input type="radio" value=\'0\' ng-model="row.entity.option" style="width: initial">禁止' +
                '</label>' +
                '<label class="ias-info-label radio-normal" style="line-height: 30px"' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.option == \'1\']">' +
                '<input type="radio" value=\'1\' ng-model="row.entity.option" style="width: initial">只读' +
                '</label>' +
                '<label class="ias-info-label radio-normal" style="line-height: 30px"' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.option == \'2\']">' +
                '<input type="radio" value=\'2\' ng-model="row.entity.option" style="width: initial">编辑' +
                '</label>';
            return [
                {
                    field: 'user_name', displayName: '投资经理', width: '120',
                    sortingAlgorithm: function(a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) }, sort: { direction: uiGridConstants.ASC }
                },
                { field: 'authority', displayName: '权限控制', width: '180', cellTemplate: authorityTemplate }
            ];
        },
        agentColumnDef: function() {
            let actionTemplate = buildActionButton({
                buttons: [
                    { type: 'edit', icon: 'pencil' },
                    { type: 'authorityEdit', icon: 'cog'},
                    { type: 'delete', icon: 'trash', class: 'ias-delete-btn'},
                ]
            });
            return [
                { field: 'agent_account_name', displayName: 'ias账号', width: '150' },
                { field: 'agent_user_name', displayName: '姓名', width: '140' },
                { field: 'agent_company_name', displayName: '所属机构', width: '220' },
                { field: 'read_accounts', displayName: '可查看账户', minWidth: '100' },
                //{field: 'write_accounts', displayName: '可编辑账户', minWidth: '100'},
                { field: 'action', displayName: '操作', width: '120', cellTemplate: actionTemplate }
            ];
        },
        agentTradeColumns: function() {
            var authorityTemplate =
                '<label class="ias-info-label radio-normal" style="line-height: 30px"' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.trade_option != \'1\']">' +
                '<input type="radio" value=\'0\' ng-model="row.entity.trade_option"  ng-click="grid.appScope.change_option()" style="width: initial">禁止' +
                '</label>' +
                '<label class="ias-info-label radio-normal" style="line-height: 30px"' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.trade_option == \'1\']">' +
                '<input type="radio" value=\'1\' ng-model="row.entity.trade_option" ng-click="grid.appScope.change_option()" style="width: initial">查看' +
                '</label>';
            return [
                { field: 'account_name', displayName: '账户', minWidth: '100' },
                { field: 'agent_account_name', displayName: 'ias账号', minWidth: '150' },
                { field: 'agent_user_name', displayName: '姓名', width: '140' },
                { field: 'agent_company_name', displayName: '所属机构', minWidth: '220' },
                { field: 'action', displayName: '成交权限', width: '120', cellTemplate: authorityTemplate }
            ];
        },
        agentAuthorityColumnDef: function() {
            var authorityTemplate =
                '<label class="ias-info-label radio-normal" style="line-height: 30px"' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.option == \'0\']">' +
                '<input type="radio" value=\'0\' ng-model="row.entity.option" style="width: initial">禁止' +
                '</label>' +
                '<label class="ias-info-label radio-normal" style="line-height: 30px"' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.option == \'1\']">' +
                '<input type="radio" value=\'1\' ng-model="row.entity.option" style="width: initial">只读' +
                '</label>';
            return [
                { field: 'name', displayName: '账户名称', width: '210' },
                {
                    field: 'manager_name', displayName: '投资经理', width: '95',
                    sortingAlgorithm: function(a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) }, sort: { direction: uiGridConstants.ASC }
                },
                { field: 'authority', displayName: '权限控制', width: '120', cellTemplate: authorityTemplate }
            ];
        },
        bondPoolColumnDef: function() {
            var actionTemplate =
                '<button class="  admin-grid-btn" ng-click="grid.appScope.bond_edit(row.entity)"> ' +
                '<span class="glyphicon glyphicon-pencil"></span>' +
                '</button>' +
                '<button class="ias-delete-btn admin-grid-btn" ng-click="grid.appScope.bond_delete(row.entity)">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
                '</button>';
            return [
                { field: 'bond_id', displayName: '代码', width: '140' },
                { field: 'short_name', displayName: '简称', width: '250' },
                { field: 'score', displayName: '评分', width: '220' },
                { field: 'expire_start_date', displayName: '有效开始日期', minWidth: '100' },
                { field: 'expire_end_date', displayName: '有效截止日期', minWidth: '100' },
                { field: 'remarks', displayName: '备注', minWidth: '100' },
                // {field: 'write_accounts', displayName: '可编辑账户', minWidth: '100'},
                { field: 'action', displayName: '操作', width: '120', cellTemplate: actionTemplate }
            ];
        },
        investDeserveColumnDef: function() {
            var actionTemplate =
                '<button class="  admin-grid-btn" ng-click="grid.appScope.invest_bond_edit(row.entity)"> ' +
                '<span class="glyphicon glyphicon-pencil"></span>' +
                '</button>' +
                '<button class="ias-delete-btn admin-grid-btn" ng-click="grid.appScope.invest_bond_delete(row.entity)">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
                '</button>';
            return [
                { field: 'bond_id', displayName: '代码', width: '140' },
                { field: 'short_name', displayName: '简称', width: '250' },
                { field: 'score', displayName: '评分', width: '220' },
                { field: 'expire_start_date', displayName: '有效开始日期', minWidth: '100' },
                { field: 'expire_end_date', displayName: '有效截止日期', minWidth: '100' },
                { field: 'remarks', displayName: '备注', minWidth: '100' },
                //{field: 'write_accounts', displayName: '可编辑账户', minWidth: '100'},
                { field: 'action', displayName: '操作', width: '120', cellTemplate: actionTemplate }
            ];
        },
        libColumnDef: function() {
            let actionTemplate = buildActionButton({
                buttons: [
                    { type: 'edit', icon: 'pencil' },
                    { type: 'delete', icon: 'trash', class: 'ias-delete-btn' },
                ]
            });

            return [
                { field: 'name', displayName: '机构', width: '300' },
                { field: 'type', displayName: '类型名称', width: '100' },
                { field: 'remarks', displayName: '备注', minWidth: '200' },
                //{field: 'write_accounts', displayName: '可编辑账户', minWidth: '100'},
                { field: 'action', displayName: '操作', width: '120', cellTemplate: actionTemplate }
            ];
        },
        libTraderColumnDef: function() {
            let actionTemplate = buildActionButton({
                buttons: [
                    { type: 'edit', icon: 'pencil' },
                    { type: 'delete', icon: 'trash', class: 'ias-delete-btn' },
                ]
            });

            return [
                { field: 'name', displayName: '交易员', width: '300' },
                { field: 'tel', displayName: '电话', width: '200' },
                { field: 'position', displayName: '职务', minWidth: '100' },
                //{field: 'write_accounts', displayName: '可编辑账户', minWidth: '100'},
                { field: 'action', displayName: '操作', width: '120', cellTemplate: actionTemplate }
            ];
        },
        checkedAssetColumnDef: function() {
            var actionTemplate =
                '<button class="admin-grid-btn" ng-click="grid.appScope.edit_checked_asset(row.entity)" ng-if="row.entity.id" ng-disabled="!(row.entity.extra_info && row.entity.extra_info.length !==0)">' +
                '<span class="glyphicon glyphicon-pencil"></span>' +
                '</button>' +
                '<button class="ias-delete-btn admin-grid-btn" ng-click="grid.appScope.delete_asset(row.entity)" ng-if="row.entity.id">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
                '</button>';
            var levelNameTemp = '<div ng-class="grid.appScope.levelNameFunc(row)"><span style="line-height: 30px;">{{row.entity.checkedType}}</span><span style="margin-left: 5px;' +
                'color:#7b8082;line-height: 30px;font-weight: normal;font-size:12px;" ng-if="row.entity.$$treeLevel == 0">{{row.entity.levelCount}}</span></div>';

            var infoTemplate =
                '<div class="panel-height-inherit tag-icon-column" layout="row" layout-align="start center">\
                    <detail-pop-up-btn ng-if="row.entity.extra_info && row.entity.extra_info.length !==0" pop-data-context="row.entity" \
                                        pop-panel-class="checked-asset-extra-info" \
                                        popup-template-url="src/system/component/template/checked_asset_extra_info_popup_template.html" \
                                        layout="row" layout="start center">\
                        <span class="ias-icon list-view-normal"></span>\
                    </detail-pop-up-btn>\
                    <div ng-if="row.entity.id && (!row.entity.extra_info || row.entity.extra_info.length ===0)" >\
                        <span class="glyphicon glyphicon-warning-sign" style="color: yellow;" \
                        tooltip data-toggle="tooltip" data-placement="right" data-original-title="缺少账户信息，请到账户页面去校对！"> </span>\
                    </div>\
                </div>';

            return [
                getTreeColumn(),
                { field: 'checkedType', displayName: '', width: '130', cellTemplate: levelNameTemp },
                { field: 'course_code', displayName: '科目代码', minWidth: '80' },
                { field: 'course_name', displayName: '科目名称', minWidth: '80' },
                { field: 'extra_info', displayName: '账户信息', width: '120', cellTemplate: infoTemplate },
                { field: 'asset_code', displayName: '资产代码', minWidth: '80', cellFilter: 'checkAssetInfo: row.entity.asset_id' },
                { field: 'asset_name', displayName: '资产名称', minWidth: '80', cellFilter: 'checkAssetInfo: row.entity.asset_id' },
                { field: 'update_time', displayName: '更新时间', width: '160' },
                { field: 'action', displayName: '', width: '80', cellTemplate: actionTemplate }
            ];
        },
        assetDefineColumnDef: function() {
            var actionTemplate =
                '<button class="  admin-grid-btn" ng-click="grid.appScope.edit_asset_define(row.entity)"> ' +
                '<span class="glyphicon glyphicon-cog"></span>' +
                '</button>' +
                '<button class="ias-delete-btn admin-grid-btn" ng-click="grid.appScope.delete_asset_define(row.entity)">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
                '</button>';
            var containTemplate = '<p class="ui-grid-cell-contents" title="{{row.entity.contain_accounts}}">{{row.entity.contain_accounts}}</p>'
            return [
                { field: 'course_name', displayName: '资产名称', minWidth: '100' },
                { field: 'contain_accounts', displayName: '包含该基金的账户', minWidth: '300', cellTemplate: containTemplate },
                { field: 'ref_account_name', displayName: '匹配账户', minWidth: '100' },
                // { field: 'ref_asset_name', displayName: '非标资产', minWidth: '100' },
                { field: 'update_time', displayName: '更新时间', minWidth: '100', sort: { direction: uiGridConstants.DESC } },
                { field: 'action', displayName: '操作', width: '100', cellTemplate: actionTemplate }
            ];
        },
        addAssetDefineColumnDef: function() {
            var radioTemplete = '<label class="ias-info-label " style="width:30px; height:30px;" ' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.name == grid.appScope.assetDefineFactory.theEditRowEntity.course_name]" ' +
                'ng-click="grid.appScope.chooseRow(row.entity) ">' +
                '</label>'
            return [
                { field: 'name', displayName: '资产名称', minWidth: '100' },
                { field: 'action', displayName: '资产选择', cellTemplate: radioTemplete, minWidth: '100' }
            ]
        },
        matchingAccountColumnDef: function() {
            var radioTemplete = '<label class="ias-info-label " style="width:30px; height:30px;" ' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.id == grid.appScope.assetDefineFactory.matchingAccountEntity.ref_account_id]" ' +
                'ng-click="grid.appScope.chooseAccountRow(row.entity) ">' +
                '</label>'
            return [
                { field: 'name', displayName: '账户名称', minWidth: '100' },
                { field: 'action', displayName: '账户选择', cellTemplate: radioTemplete, minWidth: '100' }
            ];
        },
        matchingAssetColumnDef: function() {
            var radioTemplete = '<label class="ias-info-label " style="width:30px; height:30px;" ' +
                'ng-class="{true:\'radio-select\',false:\'radio-normal\'}[row.entity.name == grid.appScope.assetDefineFactory.matchingAccountEntity.ref_asset_name]" ' +
                'ng-click="grid.appScope.chooseAssetRow(row.entity) ">' +
                '</label>'
            return [
                { field: 'name', displayName: '非标资产', minWidth: '100' },
                { field: 'action', displayName: '资产选择', cellTemplate: radioTemplete, minWidth: '100' }
            ];
        },
        // assetInfoColumnDef: function () {
        //     return [
        //         { field: 'user_name', displayName: '投资经理', width: '120', },
        //         { field: 'account_name', displayName: '账户名称', width: '150' },
        //         { field: 'date', displayName: '估值日期', width: '100' }
        //     ]
        //     return columns;
        // },
        valuationManageColumnDef: function() {
            return [
                { field: 'asset_date', displayName: '估值表日期', minWidth: '100' },
                { field: 'account_name', displayName: '账户名称', minWidth: '100' },
                { field: 'update_time', displayName: '最近更新时间', minWidth: '100' }
            ];
        },
        cashPositionColumnDef: function() {
            var actionTemplate =
                '<button class="  admin-grid-btn" ng-click="grid.appScope.edit(row.entity, $event)"> ' +
                '<span class="glyphicon glyphicon-pencil"></span>' +
                '</button>' +
                '<button class="ias-delete-btn admin-grid-btn" ng-click="grid.appScope.delete(row.entity, $event)">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
                '</button>';

            return [
                { field: 'account_name', displayName: '账户', minWidth: '100' },
                { field: 'manager_name', displayName: '投资经理', minWidth: '100' },
                { field: 'reset_date', displayName: '重置日期', minWidth: '100' },
                { field: 'value', displayName: '日终金额(元)', minWidth: '120', cellFilter: 'thousandthNum' },
                { field: 'operator_name', displayName: '操作人', minWidth: '100' },
                { field: 'update_time', displayName: '更新时间', minWidth: '140' },
                { field: 'action', displayName: '操作', width: '100', cellTemplate: actionTemplate }
            ];
        }
    }
})
