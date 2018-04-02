import BaseAddEditDialogCtrl from './baseAddEditDialogCtrl';

(function(angular) {

    // Symbol用于创建私有函数
    const getRivalCompanyList = Symbol('getRivalCompanyList'),
        getRivalTraderList = Symbol('getRivalCompanyList'),
        openAddEditRivalCompanyDialog = Symbol('openAddEditRivalCompanyDialog'),
        openAddEditRivalTraderDialog = Symbol('openAddEditRivalTraderDialog'),
        openDeleteRivalCompanyDialog = Symbol('openDeleteRivalCompanyDialog'),
        openDeleteRivalTraderDialog = Symbol('openDeleteRivalTraderDialog'),
        initCtrl = Symbol('initCtrl');

    const dataDefine = {
        addEditCompanyDialogVmDefine: [
            // id 是判断　添加／编辑　的唯一依据
            { prop: "id" },
            { label: "机构", type: "string", prop: "name" },
            { label: "类型名称", type: "select", prop: "type", itemSource: ['A类', 'B类', 'C类', 'D类', 'E类', 'F类', '一类', '二类', '三类', '四类', '五类', '六类',] },
            { label: "备注（可选）", type: "string", prop: "remarks" }
        ],
        addEditTraderDialogVmDefine: [
            { prop: "id" },
            { label: "机构", type: "readonlystring", prop: "institution" },
            { label: "交易员", type: "string", prop: "name" },
            { label: "电话", type: "string", prop: "tel" },
            { label: "职务", type: "string", prop: "position" }
        ]
    };

    class rivalCtrl {
        constructor($scope, $q, systemAdminService, componentService, gridItemNum, adminTableFactory, user, dateClass) {
            this.$scope = $scope;
            this.$q = $q;

            this.systemAdminService = systemAdminService;
            this.componentService = componentService;

            this.gridItemNum = gridItemNum;
            this.adminTableFactory = adminTableFactory;
            this.user = user;
            this.dateClass = dateClass;

            this[initCtrl]();
        };

        [initCtrl]() {
            this.gridRivalCompanyOptions = {
                enableColumnMenus: false,
                enableColumnResizing: true,
                enableFiltering: false,
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                exporterCsvFilename: 'myFile.csv',
                exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                exporterOlderExcelCompatibility: true,
                exporterSuppressColumns: ['action'],
                enablePaginationControls: false,
                paginationPageSize: this.gridItemNum.gridInstitutionNum,
                columnDefs: this.adminTableFactory.libColumnDef(),
                exporterFieldCallback: (grid, row, col, value) => {
                    return value;
                },
                onRegisterApi: gridApi => {

                    this.$scope.companyGridApi = gridApi;
                }
            };

            this.gridRivalTraderOptions = {
                enableColumnMenus: false,
                enableColumnResizing: true,
                enableFiltering: false,
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: this.adminTableFactory.libTraderColumnDef(),
                onRegisterApi: gridApi => {
                    this.$scope.traderGridApi = gridApi;
                }
            };
        };

        [getRivalCompanyList]() {

            if (!this.user || !this.user.company_id || this.user.company_id === '') return this.$q.reject({ message: '获取登录信息失败！' });

            return this.systemAdminService.buildHttpRequestDefer('rivalCompanyResource.getList')({
                company_id: this.user.company_id
            }).then(data => {
                this.rivalCompanyList = data;
                this.gridRivalCompanyOptions.data = data;
                this.$scope.companyGridApi.grid.refresh();

                this.$scope.companyGridApi.pagination.seek(1);
                this.gridRivalTraderOptions.data = [];

                return this.$q.resolve(data);
            }, res => {
                // this.componentService.openErrorDialog({ message: '对手库数据获取失败！' });
                return this.$q.resolve({ message: '对手库数据获取失败！' });
            });
        };

        [getRivalTraderList](selectedCompany) {

            let dto = {
                company_id: this.user.company_id
            };

            if (selectedCompany) {
                if (selectedCompany.name) {
                    dto.institution = selectedCompany.name;

                    this.systemAdminService.buildHttpRequestDefer('rivalTraderReource.getList')(dto).then(data => {
                        this.gridRivalTraderOptions.data = data;
                        this.$scope.traderGridApi.grid.refresh();
                    }, res => {

                    });
                }
            };
        };

        [openAddEditRivalCompanyDialog](option, rivalCompany) {

            class rivalCompanyDialogCtrl extends BaseAddEditDialogCtrl {
                constructor(mdPanelRef, commonService) {
                    super(mdPanelRef, commonService);
                };
            };

            var onDialogClosingHandler = viewModel => {

                if (viewModel.name == '' || viewModel.type == '') {
                    this.componentService.openErrorDialog({ title: '错误', message: '机构名称和类型不能为空！' });
                    return this.$q.reject();
                } else if (viewModel.name.length > 128) {
                    this.componentService.openErrorDialog({ title: '错误', message: '机构名称不能超过64个字！' });
                    return this.$q.reject();
                }

                let dto = {
                    name: viewModel.name,
                    type: viewModel.type,
                    remarks: viewModel.remarks
                };

                let buildSucceedResolver = errorMessage => {

                    return data => {
                        if (data && data.length > 0) {
                            this[getRivalCompanyList]();
                            return this.$q.resolve();
                        } else {
                            this.componentService.openErrorDialog({ title: '错误', message: errorMessage });
                            return this.$q.reject();
                        }
                    };
                }

                if (viewModel.id) {
                    dto.company_id = this.user.company_id;

                    //编辑
                    return this.systemAdminService.buildHttpRequestDefer('rivalCompanyResource.update')(dto).then(buildSucceedResolver('编辑对手失败！'), res => {
                        this.componentService.openErrorDialog({ title: '错误', message: '编辑对手失败！' });
                        return this.$q.reject();
                    });
                } else {
                    if (angular.isArray(this.gridRivalCompanyOptions.data)) {
                        var findResult = this.gridRivalCompanyOptions.data.find(item => item.name === viewModel.name);

                        if (findResult) {
                            this.componentService.openErrorDialog({ title: '错误', message: '不能添加重复的机构！' });
                            return this.$q.reject();
                        }
                    }

                    //添加
                    if (!dto.remarks) {
                        dto.remarks = '';
                    }
                    return this.systemAdminService.buildHttpRequestDefer('rivalCompanyResource.add')({
                        company_id: this.user.company_id,
                        content: [dto],
                        method: "add"
                    }).then(buildSucceedResolver('添加对手失败！'), res => {
                        this.componentService.openErrorDialog({ title: '错误', message: '添加对手失败！' });
                        return this.$q.reject();
                    });
                }
            };

            if (!option) option = {};

            if (rivalCompany) option.loadingVm = rivalCompany;

            option = Object.assign(option, {
                dialogCategory: 'rival_add_edit',
                controller: ['mdPanelRef', 'commonService', rivalCompanyDialogCtrl],
                viewModelDefine: dataDefine.addEditCompanyDialogVmDefine,

                onPanelClosingHandler: onDialogClosingHandler,

                okButtonLabel: "保存"
            });

            this.systemAdminService.openAddEditDialog(option);
        };

        [openAddEditRivalTraderDialog](option, rivalTrader) {

            class rivalTraderDialogCtrl extends BaseAddEditDialogCtrl {
                constructor(mdPanelRef, commonService) {
                    super(mdPanelRef, commonService);
                };
            };

            var onDialogClosingHandler = viewModel => {

                if (viewModel.name == '' || viewModel.institution == '') {
                    this.componentService.openErrorDialog({ title: '错误', message: '请填写交易员姓名！' });
                    return this.$q.reject();
                }

                let dto = {
                    institution: viewModel.institution,
                    name: viewModel.name,
                    tel: viewModel.tel,
                    position: viewModel.position
                };

                let buildSucceedResolver = errorMessage => {

                    return data => {
                        if (data && data.length > 0) {

                            if (this.selectedRivalCompany) {
                                this[getRivalTraderList](this.selectedRivalCompany);
                            }

                            return this.$q.resolve();
                        } else {
                            this.componentService.openErrorDialog({ title: '错误', message: errorMessage });
                            return this.$q.reject();
                        }
                    };
                }

                if (viewModel.id) {
                    Object.assign(dto, {
                        id: viewModel.id,
                        company_id: this.user.company_id
                    });

                    //编辑
                    return this.systemAdminService.buildHttpRequestDefer('rivalTraderReource.update')(dto).then(buildSucceedResolver('编辑交易员失败！'), res => {
                        this.componentService.openErrorDialog({ title: '错误', message: '编辑交易员失败！' });
                        return this.$q.reject();
                    });

                } else {
                    //添加
                    return this.systemAdminService.buildHttpRequestDefer('rivalTraderReource.add')({
                        company_id: this.user.company_id,
                        content: [dto]
                    }).then(buildSucceedResolver('添加交易员失败！'), res => {
                        this.componentService.openErrorDialog({ title: '错误', message: '添加交易员失败！' });
                        return this.$q.reject();
                    });
                }
            };

            if (!option) option = {};

            if (rivalTrader) option.loadingVm = rivalTrader;
            else {
                if (this.selectedRivalCompany) {
                    option.loadingVm = { institution: this.selectedRivalCompany.name };
                } else {
                    this.componentService.openErrorDialog({ title: '错误', message: '请选择机构后添加交易员！' });
                    return;
                }
            }

            option = Object.assign(option, {
                dialogCategory: 'rival_add_edit',
                controller: ['mdPanelRef', 'commonService', rivalTraderDialogCtrl],
                viewModelDefine: dataDefine.addEditTraderDialogVmDefine,

                onPanelClosingHandler: onDialogClosingHandler,

                okButtonLabel: "保存"
            });

            this.systemAdminService.openAddEditDialog(option);
        };

        /**
         * 删除对手机构
         * @param {any} rivalCompany
         */
        [openDeleteRivalCompanyDialog](rivalCompany) {
            this.componentService.openConfirmDialog({
                message: `确定要删除对手：${rivalCompany.name}?`
            }).then(res => {
                let dto = {
                    company_id: this.user.company_id,
                    institution: rivalCompany.name
                };
                return this.systemAdminService.buildHttpRequestDefer('rivalTraderReource.getList')(dto);
            }, res => this.$q.reject('cancel'))
                .then(data => {

                    if (data && data.length > 0) {
                        return this.$q.reject({ title: '错误', message: '请先清空交易员列表！' });
                    }

                    let dto = {
                        company_id: this.user.company_id,
                        method: "delete",
                        content: [rivalCompany.name]
                    };
                    return this.systemAdminService.buildHttpRequestDefer('rivalCompanyResource.add')(dto);
                }).then(data => {
                    if (data && data.length > 0) {
                        this[getRivalCompanyList]();
                    } else {
                        this.componentService.openErrorDialog({ title: '错误', message: '删除对手失败！' });
                    }
                }, res => {
                    if (res) {
                        if (res !== 'cancel') this.componentService.openErrorDialog(res);
                    } else {
                        this.componentService.openErrorDialog({ title: '错误', message: '删除对手失败！' });
                    }
                });
        };

        /**
         * 删除交易员
         * @param {any} rivalTrader
         */
        [openDeleteRivalTraderDialog](rivalTrader) {
            this.componentService.openConfirmDialog({
                message: `确定要删除交易员：${rivalTrader.name}?`
            }).then(res => {
                let dto = { company_id: this.user.company_id, id: rivalTrader.id };
                return this.systemAdminService.buildHttpRequestDefer('rivalTraderReource.delete')(dto);
            }, res => this.$q.reject('cancel'))
                .then(data => {
                    if (data && data.length > 0) {
                        this[getRivalTraderList](this.selectedRivalCompany);
                    } else {
                        this.componentService.openErrorDialog({ title: '错误', message: '删除交易员失败！' });
                    }
                }, res => {
                    if (res) {
                        if (res !== 'cancel') this.componentService.openErrorDialog(res);
                    } else {
                        this.componentService.openErrorDialog({ title: '错误', message: '删除交易员失败！' });
                    }
                });
        };

        $onInit() {
            this[getRivalCompanyList]().then(res => { }, res => {
                if (res) this.componentService.openErrorDialog(res);
                else this.componentService.openErrorDialog({ message: '对手库数据获取失败！' });
            });
        };

        onChangedSearchKey(searchKey) {

            if (angular.isArray(this.rivalCompanyList)) {
                this.gridRivalCompanyOptions.data = this.rivalCompanyList.filter(item => {
                    if (!searchKey || searchKey === "") return true;

                    if (item && angular.isString(item.name)) {
                        return item.name.indexOf(searchKey) > -1;
                    } else {
                        return false;
                    }
                });
                this.$scope.companyGridApi.grid.refresh();
            }
        };

        onClickExportRivalExcel(event) {
            this.gridRivalCompanyOptions.exporterCsvFilename = `counterpart_${this.dateClass.getFormatDate(new Date(), 'yyyyMMdd')}.csv`;
            var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
            this.$scope.companyGridApi.exporter.csvExport('all', 'all', myElement);
        };

        onClickAddRivalCompany(event) {
            let option = { dialogTitle: '添加对手' };

            this[openAddEditRivalCompanyDialog](option);
        };

        onClickAddRivalTrader(event) {
            let option = { dialogTitle: '添加交易员' };

            this[openAddEditRivalTraderDialog](option);
        };

        onClickTable(event) {
            if (!event || !event.target) return;

            let item = angular.element(event.target).scope();
            let row = undefined;

            while (item.$parent && !item.row) item = item.$parent;
            if (item && item.row) {
                row = item.row;
                item = item.row.entity;
            }
            else return;

            let target = event.target;

            while (target.parentElement && target.nodeName !== "BUTTON") target = target.parentElement;

            switch (target.getAttribute('tag')) {
                case "edit":
                    if (item.institution) {
                        this[openAddEditRivalTraderDialog]({ dialogTitle: '修改交易员' }, item);
                    } else {
                        if (!item.id) item.id = item.$$hashKey;
                        this[openAddEditRivalCompanyDialog]({ dialogTitle: '修改对手' }, item);
                    }
                    break;
                case "delete":
                case "del":
                    if (item.institution) {
                        this[openDeleteRivalTraderDialog](item);
                    } else {
                        this[openDeleteRivalCompanyDialog](item);
                    }
                    break;
                default:
                    //点击后表明以查看
                    if (row && row.isSelected) {
                        if (row.entity.institution) {
                        } else {
                            this.selectedRivalCompany = row.entity;
                            this[getRivalTraderList](row.entity);
                        }
                    } else {//不选中
                        this.gridRivalTraderOptions.data = [];
                    }
                    break;
            };
        };
    };

    angular.module('ias.system').controller('rivalCtrl', ['$scope', '$q', 'systemAdminService', 'componentService', 'gridItemNum', 'adminTableFactory', 'user', 'dateClass', rivalCtrl]);

})(window.angular);