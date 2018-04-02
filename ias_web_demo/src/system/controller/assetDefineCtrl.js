(function(angular) {
    let addDialogCtrl = ['$scope', '$q', 'mdPanelRef', 'adminTableFactory', 'assetDefineFactory', 'user', 'messageBox', 'systemAdminData', 'systemAdminService',
        function($scope, $q, mdPanelRef, adminTableFactory, assetDefineFactory, user, messageBox, systemAdminData, systemAdminService) {
            let getList = () => {
                let dto = {
                    company_id: user.company_id,
                };

                let [defer1, defer2] = [$q.defer(), $q.defer()];

                systemAdminService.buildHttpRequestDefer('assetValuationReource.getList')(dto).then((res) => {
                    $scope.assetDefineList = res;
                    defer1.resolve(res);
                }, (res) => {
                    messageBox.error('asset valuation 获取失败！');
                    defer1.reject();
                });

                systemAdminService.buildHttpRequestDefer('assetNstdReource.getList')(dto).then((res) => {
                    $scope.nstdList = res;
                    defer2.resolve(res);
                }, (res) => {
                    messageBox.error('Nstd 获取失败！');
                    defer2.reject();
                });

                return $q.all([defer1.promise, defer2.promise]);
            };

            let oninit = () => {
                $scope.vm = {
                    selectedMatchType: 1,
                };

                $scope.selectGroup = [
                    { label: '匹配账户', value: 1 },
                    // { label: '匹配资产', value: 2 },
                ];

                getList().then((res) => {
                    if (this.loadingVm) {
                        $scope.vm.selectedAssetDefine = $scope.assetDefineList.find((item) => item === this.loadingVm.course_name);

                        if (this.loadingVm.ref_account_name) {
                            // $scope.vm.selectedMatchType = 1;
                            $scope.vm.selectedMatch = $scope.matchList.find((item) => item.id === this.loadingVm.ref_account_id);
                        } else if (this.loadingVm.ref_asset_name) {
                            $scope.vm.selectedMatchType = 2;
                            $scope.vm.selectedMatch = $scope.matchList.find((item) => item === this.loadingVm.ref_asset_name);
                        } else {
                            console.warn(`所选资产定义的 匹配账户和非标资产 同时为空`);
                        }

                        $scope.vm.originVm = this.loadingVm;
                    }
                }, (res) => { });

                $scope.accountList = angular.copy(systemAdminData.accountList);

                $scope.matchList = $scope.accountList;
            };
            oninit();

            this.onSelectedMatchTypeChanged = () => {
                switch ($scope.vm.selectedMatchType) {
                    case 1:
                        $scope.matchList = $scope.accountList;
                        break;
                    case 2:
                        $scope.matchList = $scope.nstdList;
                        break;
                    default: break;
                }

                $scope.vm.selectedMatch = undefined;
            };

            this.$onClickOk = (event) => {
                let viewModel = angular.copy($scope.vm);

                if (this.onClosing) {
                    let returnValue = this.onClosing(viewModel);

                    if (returnValue === false) return;

                    if (returnValue && returnValue.then) {
                        returnValue.then((res) => {
                            mdPanelRef.close();
                            return;
                        }, (res) => {
                            if (res) console.error(res);
                            return;
                        });

                        return;
                    }
                }

                mdPanelRef.close();
            };

            this.$onClickCancel = (event) => {
                mdPanelRef && mdPanelRef.close().then(() => {
                    mdPanelRef.destroy();
                });
            };

            this.matchListFilter = (value, index, array) => {
                if (!$scope.vm || !$scope.vm.searchTextMatch) return true;

                if (value.name) {
                    return value.name.indexOf($scope.vm.searchTextMatch) > -1;
                } else if (angular.isString(value)) {
                    return value.indexOf($scope.vm.searchTextMatch) > -1;
                } else {
                    return true;
                }
            };
        }];

    // （资产）定义表
    angular.module('ias.system').controller('assetDefineCtrl', ['$scope', '$q', 'adminTableFactory', 'gridItemNum',
        'user', 'assetDefineFactory', 'systemAdminData', 'systemAdminService', 'componentService', function($scope, $q, adminTableFactory, gridItemNum,
            user, assetDefineFactory, systemAdminData, systemAdminService, componentService) {

            this.$q = $q;
            this.systemAdminService = systemAdminService;
            this.componentService = componentService;

            this.user = user;

            const dataDefine = {
                addDialogTitle: '添加资产定义',
                addDialogCategory: 'assetDefine_add',
            };

            let initUiGridOptions = assetDefineList => {
                $scope.gridOptions = {
                    enableColumnMenus: false,
                    enableColumnResizing: true,
                    enableFiltering: false,
                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    multiSelect: false,
                    enablePaginationControls: false,
                    paginationPageSize: gridItemNum.gridItemNum,
                    columnDefs: adminTableFactory.assetDefineColumnDef(),
                    onRegisterApi: function(gridApi) {
                        $scope.gridApi = gridApi;
                        $scope.gridApi.grid.registerRowsProcessor(function(renderalbeRows) {
                            renderalbeRows.forEach(function(row) {
                                //搜索框筛选
                                if ($scope.searchKey != null && $scope.searchKey != "") {
                                    if ((row.entity.course_name).indexOf($scope.searchKey) == -1) {
                                        row.visible = false;
                                        return true;
                                    }
                                }
                            });
                            return renderalbeRows;
                        }, 200);
                    },
                    data: assetDefineList,
                };
            };

            // 获取列表
            let getList = () => {
                if (!this.user || !this.user.company_id || this.user.company_id === '') return this.$q.reject({ message: '获取登录信息失败！' });

                return this.systemAdminService.buildHttpRequestDefer('assetRefResource.getList')({
                    company_id: this.user.company_id
                }).then(data => {
                    if (angular.isArray(data)) {
                        $scope.gridOptions.data = data;
                    }
                    return this.$q.resolve(data);
                }, res => this.$q.reject({ message: '获取资产定义表失败！' }));

            };

            let onPanelClosingHandler = result => {
                let insertOrUpdateAsync = result => {
                    let viewModel = result;

                    if (!viewModel.selectedMatch) {
                        return this.$q.reject('匹配账户和非标资产不能同时为空');
                    }

                    let dto = {
                        ref_company_id: '',
                        ref_account_id: viewModel.selectedMatchType === 1 ? viewModel.selectedMatch.id : null,
                        course_name: viewModel.selectedAssetDefine,
                        ref_asset_name: viewModel.selectedMatchType === 1 ? null : viewModel.selectedMatch
                    };

                    if (viewModel.originVm && viewModel.originVm.id) {
                        dto.id = viewModel.originVm.id;

                        return this.systemAdminService.buildHttpRequestDefer('assetRefResource.update')({
                            company_id: user.company_id,
                            content: dto
                        }).then(() => this.$q.resolve(), res => this.$q.reject({ message: '更新失败！', reason: res }));

                    } else {
                        return this.systemAdminService.buildHttpRequestDefer('assetRefResource.add')({
                            company_id: user.company_id,
                            content: dto
                        }).then(() => this.$q.resolve(), res => this.$q.reject({ message: '添加失败！', reason: res }));
                    }
                };

                return insertOrUpdateAsync(result).then(res => {
                    getList();
                    return $q.resolve();
                }, res => {
                    if (res) {
                        if (angular.isString(res)) this.componentService.openErrorDialog({ message: res, reason: res });
                        else this.componentService.openErrorDialog({ message: res.message, reason: res })

                    } else {
                        this.componentService.openErrorDialog({ message: '添加失败！', reason: res })
                    }

                    return $q.reject(res);
                });
            };

            $scope.searchKey = '';
            this.$onInit = function() {
                initUiGridOptions();

                getList().then(res => { }, res => {
                    if (res) this.componentService.openErrorDialog(res);
                });
            };

            $scope.filterFunc = function(selected) {
                if (selected) {
                    $scope.searchKey = selected.originalObject.course_name;
                } else {
                    $scope.searchKey = '';
                }

                $scope.gridApi.grid.refresh();
            };

            // 资产定义表 添加
            $scope.add_asset_define = function() {
                systemAdminService.openAddEditDialog({
                    dialogTitle: dataDefine.addDialogTitle,
                    controller: addDialogCtrl,
                    dialogCategory: dataDefine.addDialogCategory,
                    onPanelClosingHandler: onPanelClosingHandler,
                    template: require('../component/template/add_panel_dialog.html')
                });

            };

            // 资产定义表 编辑
            $scope.edit_asset_define = function(entity) {
                systemAdminService.openAddEditDialog({
                    dialogTitle: dataDefine.addDialogTitle,
                    controller: addDialogCtrl,
                    loadingVm: entity,
                    dialogCategory: dataDefine.addDialogCategory,
                    onPanelClosingHandler: onPanelClosingHandler,
                    template: require('../component/template/add_panel_dialog.html')
                });
            };

            $scope.delete_asset_define = row => {
                this.componentService.openConfirmDialog({
                    message: '确定要删除这条配置?'
                }).then(res => {
                    return this.systemAdminService.buildHttpRequestDefer('assetRefResource.delete')({
                        company_id: user.company_id,
                        course_name: row.course_name
                    });
                }, res => this.$q.reject('cancel'))
                    .then(data => getList(), res => {
                        this.componentService.openErrorDialog({ title: '错误', message: '删除获取资产定义！' });
                    });
            };
        }]);

})(window.angular);
