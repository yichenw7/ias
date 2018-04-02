const initView = Symbol('initView');
const getList = Symbol('getList');
const setAgentAuthority = Symbol('setAgentAuthority');
const openAddEditCompanyDialog = Symbol('openAddEditCompanyDialog');

import universalAddEditDialogTemplate from '../component/template/add_panel_dialog.html';

import BaseAddEditDialogCtrl from './baseAddEditDialogCtrl';

import { BaseAdminCtrl, tableAction } from './baseAdminCtrl';

const dataDefine = {
    dialogVmDefine: {
        add: [
            { prop: 'agent_user_id' },
            { prop: 'company_id' },
            { label: 'ias账号', type: 'string', prop: 'agent_account_name', isRequire: true },
            { label: '姓名', type: 'string', prop: 'agent_user_name' },
            { label: '所属机构', type: 'string', prop: 'agent_company_name' },
        ],
        edit: [
            { prop: 'agent_user_id' },
            { prop: 'company_id' },
            { label: 'ias账号', type: 'string', prop: 'agent_account_name', isRequire: true, cannotEdit: true },
            { label: '姓名', type: 'string', prop: 'agent_user_name' },
            { label: '所属机构', type: 'string', prop: 'agent_company_name' },
        ],
    },

    vaildRules: {
        addEdit: [
            { prop: 'agent_account_name', rule: 'required', message: 'ias账号不能为空' },
        ],
    },
};

class agentDialogCtrl extends BaseAddEditDialogCtrl {
    constructor(mdPanelRef, commonService) {
        super(mdPanelRef, commonService);
    }
}

class agentListCtrl extends BaseAdminCtrl {
    constructor($scope, $q, adminTableFactory, selectedObj, socketServer, systemAdminData,
        authorityConstant, gridItemNum, user, messageBox, agentsRequest, systemAdminService, componentService, vaildationService) {
        super();

        this.$scope = $scope;
        this.$q = $q;

        this.selectedObj = selectedObj;
        this.systemAdminData = systemAdminData;
        this.authorityConstant = authorityConstant;

        this.user = user;

        this.systemAdminService = systemAdminService;
        this.componentService = componentService;

        this.vaildationService = vaildationService;

        $scope.gridOptions = Object.assign(this.gridOptions, {
            enablePaginationControls: false,
            paginationPageSize: gridItemNum.gridItemNum,
            columnDefs: adminTableFactory.agentColumnDef(),
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function(renderalbeRows) {
                    renderalbeRows.forEach(function(row) {
                        //搜索框筛选
                        if ($scope.searchKey != null && $scope.searchKey != "") {
                            if (row.entity.agent_user_id !== $scope.searchKey) {
                                row.visible = false;
                                return true;
                            }
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        });

        //搜索框
        $scope.searchKey = '';
        $scope.investorSelectFun = function(selected) {
            if (selected) {
                $scope.searchKey = selected.originalObject.agent_user_id;
            } else {
                $scope.searchKey = '';
            }

            $scope.gridApi.grid.refresh();
        };

        socketServer.on('/user_qb', 'user agent event', function(data) {
            if (data.hasOwnProperty('user_list')) {
                if (Array.isArray($scope.agentList) && Array.isArray(data.user_list)) {
                    $scope.agentList = $scope.agentList.filter((user) => {
                        let found = data.user_list.find((newUser) => newUser.agent_user_id == user.agent_user_id);
                        return !found;
                    });
                }

                if (data.action != 'delete') {
                    if (Array.isArray(data.user_list)) {
                        data.user_list.forEach((newUser) => {
                            this[setAgentAuthority](newUser);
                            $scope.agentList.splice(0, 0, newUser);
                        });
                    }

                } else {
                    if (Array.isArray(data.user_list)) {
                        data.user_list.forEach((user) => {
                            if (user.hasOwnProperty('agent_user_id') &&
                                systemAdminData.userAccountAuthorityMap.hasOwnProperty(user.agent_user_id)) {
                                delete systemAdminData.userAccountAuthorityMap[user.agent_user_id];
                            }
                        });
                    }
                }
            }
        });

        socketServer.on('/account', 'agent authority event', (data) => {
            if (data.hasOwnProperty('user_id') && data.hasOwnProperty('authorities')) {
                var user_id = data.user_id;
                var authorities = data.authorities;

                if (authorities == null || authorities === undefined || authorities.length == 0) {
                    if (systemAdminData.userAccountAuthorityMap != null) {
                        delete systemAdminData.userAccountAuthorityMap[user_id];
                    }
                } else {
                    if (systemAdminData.userAccountAuthorityMap == null) {
                        systemAdminData.userAccountAuthorityMap = {};
                    }
                    systemAdminData.userAccountAuthorityMap[user_id] = authorities;
                }

                if (Array.isArray($scope.agentList)) {
                    $scope.agentList.forEach((agent) => {
                        if (agent.agent_user_id == user_id) {
                            this[setAgentAuthority](agent);
                            return false;
                        }
                    });
                }
            }
        });

        this[initView]();
    }

    [initView]() {
        this[getList]();
    }

    [setAgentAuthority](agent) {
        if (this.systemAdminData.userAccountAuthorityMap.hasOwnProperty(agent.agent_user_id)) {
            let authorities = this.systemAdminData.userAccountAuthorityMap[agent.agent_user_id];

            let readAccounts = [];
            let writeAccounts = [];
            let authorityMap = {};

            if (!Array.isArray(authorities)) return;

            authorities.forEach((authority) => {
                if (authority.hasOwnProperty('account_id') && this.systemAdminData.accountIdMap.hasOwnProperty(authority.account_id)) {
                    let account = this.systemAdminData.accountIdMap[authority.account_id];
                    if (authority.option == this.authorityConstant.ACCOUNT_READ) {
                        readAccounts.push(account.name);
                    } else if (authority.option == this.authorityConstant.ACCOUNT_WRITE) {
                        writeAccounts.push(account.name);
                    }

                    authorityMap[authority.account_id] = authority;
                }
            });

            agent.read_accounts = readAccounts.join(', ');
            agent.write_accounts = writeAccounts.join(', ');
            agent.authorityMap = authorityMap;
        } else {
            agent.read_accounts = '';
            agent.write_accounts = '';
            agent.authorityMap = {};
        }
    }

    [openAddEditCompanyDialog](option) {
        if (!option) option = {};

        let onPanelClosingHandler = (result) => {
            if (!result) return;

            let checkResult = this.vaildationService.vaildViewModel(result, dataDefine.vaildRules.addEdit);

            if (!checkResult.result) {
                this.componentService.openErrorDialog({ message: checkResult.rule.message });
                return this.$q.reject();
            }

            if (result.agent_user_id) {
                // edit
                let dto = {
                    user_id: result.agent_user_id,
                    company_id: result.company_id,
                    agent_user_name: result.agent_user_name,
                    agent_company_name: result.agent_company_name,
                };

                return this.systemAdminService.buildHttpRequestDefer('agentRequestResource.update')(dto).then((data) => {
                    if (data) {
                        this[getList]();
                        return this.$q.resolve();
                    } else {
                        this.componentService.openErrorDialog({ message: `更新失败` });
                        return this.$q.reject();
                    }
                }, (res) => {
                    this.componentService.openErrorDialog({ message: `更新失败: ${res.data.message || ''}` });
                    return this.$q.reject();
                });
            } else {
                // add
                let dto = {
                    company_id: this.user.company_id,
                    agent_account_name: result.agent_account_name,
                    agent_user_name: result.agent_user_name,
                    agent_company_name: result.agent_company_name,
                };

                return this.systemAdminService.buildHttpRequestDefer('agentsRequestResource.add')(dto).then((data) => {
                    if (data.message) this.componentService.openErrorDialog({ message: `${data.message || ''}` });
                    this[getList]();
                    return this.$q.resolve();
                }, (res) => {
                    this.componentService.openErrorDialog({ message: `添加机构失败: ${res.data.message}` });
                    return this.$q.reject();
                });
            }
        };

        option = Object.assign(option, {
            dialogTitle: '投资顾问信息管理',

            dialogCategory: 'agent_list_add_edit',
            controller:  ['mdPanelRef', 'commonService', agentDialogCtrl],

            tempalte: universalAddEditDialogTemplate,

            onPanelClosingHandler: onPanelClosingHandler,

            okButtonLabel: '保存',
        });

        this.systemAdminService.openAddEditDialog(option);
    }

    [getList]() {
        this.systemAdminService.buildHttpRequestDefer('agentsRequestResource.getList')({ company_id: this.user.company_id }).then((data) => {
            this.$scope.agentList = data;

            this.$scope.agentList.forEach((agent) => { this[setAgentAuthority](agent); });

            this.$scope.gridOptions.data = this.$scope.agentList;
        }, () => {
            this.componentService.openErrorDialog({ message: `投顾人员列表获取失败!` });
        });
    }

    $onInit() {}

    onClickAdd(event) {
        this[openAddEditCompanyDialog]({
            viewModelDefine: dataDefine.dialogVmDefine.add,
        });
    }

    @tableAction('edit')
    editAgent(entity) {
        this[openAddEditCompanyDialog]({
            loadingVm: entity,
            viewModelDefine: dataDefine.dialogVmDefine.edit,
        });
    }

    @tableAction('authorityEdit')
    authorityEdit(entity) {
        this.selectedObj.agentAuthority.agent_account_name = entity.agent_account_name;
        this.selectedObj.agentAuthority.agent_user_id = entity.agent_user_id;
        this.selectedObj.agentAuthority.authorityMap = entity.authorityMap;
        $('#agentAuthorityDlg').modal('toggle');
    }

    @tableAction('delete')
    deleteAgent(entity) {
        this.componentService.openConfirmDialog({ message: `确定要删除：${entity.agent_user_name} 吗？` }).then((res) => {
            let dto = {
                user_id: entity.agent_user_id,
                company_id: entity.company_id
            };
            return this.systemAdminService.buildHttpRequestDefer('agentRequestResource.delete')(dto);
        }, (res) => this.$q.reject('cancel'))
            .then((data) => {
                this[getList]();
            }, (res) => {
                if (res === 'cancel') return;
                this.componentService.openErrorDialog({ message: `删除失败!` });
            });
    }


}

let $injector = ['$scope', '$q', 'adminTableFactory', 'selectedObj', 'socketServer', 'systemAdminData',
    'authorityConstant', 'gridItemNum', 'user', 'messageBox', 'agentsRequest', 'systemAdminService', 'componentService', 'vaildationService', agentListCtrl];

export { $injector };


