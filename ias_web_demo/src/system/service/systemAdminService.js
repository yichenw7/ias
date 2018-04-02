
/* Services */
// Demonstrate how to register services
// In this case it is a simple value service.

import universalAddEditDialogTemplate from '../component/template/universal_add_edit_dialog.html';

const dataDefine = {
};

/**
 *
 */
class systemAdminService {
    /**
     *
     * @param {any} $q
     * @param {any} $mdPanel
     * @param {any} $resource
     * @param {any} apiAddress
     * @param {any} user
     * @param {any} systemAdminData
     * @param {any} commonService
     */
    constructor($q, $mdPanel, $resource, apiAddress, user, systemAdminData, commonService) {
        this.$q = $q;

        this.$mdPanel = $mdPanel;

        this.commonService = commonService;

        dataDefine.ngResourceDefine = {
            // 投顾权限
            agentsRequestResource: $resource(`${apiAddress}/qb_agent_users`, {}, {
                getList: { method: 'GET', params: {} },
                add: { method: 'POST', params: {} },
            }),
            agentRequestResource: $resource(`${apiAddress}/qb_agent_user/:user_id`, { user_id: '@user_id' }, {
                delete: { method: 'DELETE', params: {} },
                update: { method: 'PUT', params: {} },
            }),

            // 对手表
            rivalCompanyResource: $resource(`${apiAddress}/admin_counterpart`, {}, {
                getList: { method: 'GET', params: {} },
                add: { method: 'POST', params: {} },
                delete: { method: 'DELETE', params: {} },
                update: { method: 'PUT', params: {} },
            }),

            rivalTraderReource: $resource(`${apiAddress}/admin_trader_info`, {}, {
                getList: { method: 'GET', params: {} },
                add: { method: 'POST', params: {} },
                delete: { method: 'DELETE', params: {} },
                update: { method: 'PUT', params: {} },
            }),

            // 资产定义表 资产列表
            assetRefResource: $resource(`${apiAddress}/asset_ref`, {}, {
                getList: { method: 'GET', params: {} },
                add: { method: 'POST', params: {} },
                update: { method: 'PUT', params: {} },
                delete: { method: 'DELETE', params: {} },
            }),
            assetValuationReource: $resource(`${apiAddress}/asset_valuation_other_assets`,
                { company_id: '@company_id' },
                {
                    getList: { method: 'GET', params: {} },
                }
            ),
            assetNstdReource: $resource(`${apiAddress}/asset_nstd`,
                { company_id: '@company_id' },
                {
                    getList: { method: 'GET', params: {} },
                }
            ),

            // 债券自定义
            customBondResource: $resource(`${apiAddress}/sys_admin/custom_bond`,
                { company_id: '@company_id' },
                {
                    getList: { method: 'GET', params: {} },
                    insert: { method: 'POST', params: {} },
                    delete: { method: 'DELETE', params: {} },
                }
            ),
        };

        // Public getter setter
        // 校对表树形控制
        let checkedAssetList = [];
        this.setCheckAssetTreeGraph = (newValue) => {
            if (newValue) checkedAssetList = newValue;

            let checked = [{ checkedType: '已校对', $$treeLevel: 0 }];
            let unchecked = [{ checkedType: '待校对', $$treeLevel: 0 }];

            checkedAssetList.forEach((course) => {
                if (course.hasOwnProperty('id')) {
                    delete course.last_node_children;
                    if (course.asset_id === 'unknown') {
                        unchecked.push(course);
                    } else {
                        checked.push(course);
                    }
                }
            });

            checked[0].levelCount = checked.length - 1;
            unchecked[0].levelCount = unchecked.length - 1;

            checkedAssetList.length = 0;

            // 待校对
            unchecked.forEach((course) => {
                checkedAssetList.push(course);
            });

            checkedAssetList[checkedAssetList.length - 1].last_node_children = true;

            // 已校对
            checked.forEach((course) => {
                checkedAssetList.push(course);
            });

            checkedAssetList[checkedAssetList.length - 1].last_node_children = true;
        };
        this.getCheckAssetTreeGraph = () => checkedAssetList;

        this.redefineAccountName = () => {
            checkedAssetList.forEach((list) => {
                if (!list.hasOwnProperty('extra_info')) return;

                list.extra_info.forEach((info) => {
                    let accountId = info.account_id;
                    let hasAccountId = systemAdminData.accountIdMap.hasOwnProperty(accountId);
                    info.account_name = hasAccountId ? systemAdminData.accountIdMap[accountId].name : '';
                });
            });
        };

        // 现金头寸重置
        this.getTransformObj = (systemAdminData) => {
            return {
                getUserName: function(userId) {
                    let finded = '';
                    $.each(systemAdminData.users, function(index, user) {
                        if (user.hasOwnProperty('id') && user.id === userId) {
                            finded = user.user_name;
                            return false;
                        }
                    });
                    return finded;
                },
                getAccount: function(accountId) {
                    let finded = null;
                    $.each(systemAdminData.accountList, function(index, account) {
                        if (account.hasOwnProperty('id') && account.id === accountId) {
                            finded = account;
                            return false;
                        }
                    });
                    return finded;
                },
                transform: function(cashPosition) {
                    let account = this.getAccount(cashPosition.account_id);
                    if (account) {
                        cashPosition.account_name = account.name;
                        cashPosition.manager_name = this.getUserName(account.manager);
                        cashPosition.operator_name = this.getUserName(cashPosition.operator);
                        return true;
                    }
                    return false;
                },
            };
        };
    }

    /**
     *
     * @param {any} key
     * @return {function}
     */
    buildHttpRequestDefer(key) {
        let resource = this.commonService.getPropertyX(dataDefine.ngResourceDefine, key);

        if (!resource) console.error(`The key: ${key} was not found in dataDefine.ngResourceDefine.`);

        return (dto) => {
            let defer = this.$q.defer();

            resource(dto, (res) => {
                if (res.code && res.code === '0000') {
                    defer.resolve(res.data);
                } else {
                    defer.reject(res);
                }
            }, (res) => {
                defer.reject(res);
            });

            return defer.promise;
        };
    }

    /**
      *
      * @param {any} option
      */
    openAddEditDialog(option) {
        if (!option) option = {};

        if (!option.controller) console.error('componentService.openAddEditDialog: No controller specified in option.');

        let position = this.$mdPanel.newPanelPosition()
            .absolute()
            .center();

        let panelAnimation = this.$mdPanel.newPanelAnimation()
            .withAnimation(this.$mdPanel.animation.SCALE)
            .openFrom({
                top: 0,
                left: document.documentElement.clientWidth / 2 - 250,
            })
            .closeTo({
                top: 0,
                left: document.documentElement.clientWidth / 2 - 250,
            });

        let config = {
            attachTo: angular.element(document.body),
            controller: option.controller,
            controllerAs: '$ctrl',
            panelClass: 'universal-add-edit-dialog',
            locals: {
                dialogTitle: option.dialogTitle || '',
                dialogCategory: option.dialogCategory,

                loadingVm: option.loadingVm,
                viewModelDefine: angular.copy(option.viewModelDefine),

                onClosing: option.onPanelClosingHandler,

                okButtonLabel: option.okButtonLabel || '确定',
                cancelButtonLabel: option.cancelButtonLabel || '取消',
            },
            bindToController: true,

            hasBackdrop: true,
            position: position,
            animation: panelAnimation,
            trapFocus: true,
            clickOutsideToClose: false,
        };

        if (option.template) config.template = option.template;
        else config.template = universalAddEditDialogTemplate;

        this.$mdPanel.open(config);
    }
}

angular.module('ias.system').service('systemAdminService', ['$q', '$mdPanel', '$resource', 'apiAddress', 'user', 'systemAdminData', 'commonService', systemAdminService]);
