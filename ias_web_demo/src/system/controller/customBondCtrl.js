(function (angular) {

    var dialogCtrl = ['$scope', 'mdPanelRef', 'datetimePickerConfig', 'commonService', function ($scope, mdPanelRef, datetimePickerConfig, commonService) {

        var oninit = () => {
            $scope.timePickerConfig = angular.copy(datetimePickerConfig);
            if (this.loadingVm) {
                let vm = angular.copy(this.loadingVm);
                if (vm && vm.bond_code && vm.bond_code.startsWith("IAS-")) {
                    vm.bond_code = vm.bond_code.replace("IAS-", "");
                }
                $scope.vm = angular.copy(vm);
            }
        };
        oninit();

        // Public functions
        this.$onClickOk = event => {

            var viewModel = angular.copy($scope.vm);
            if (viewModel.bond_code && !viewModel.bond_code.startsWith("IAS-")) viewModel.bond_code = `IAS-${viewModel.bond_code}`;

            if (this.onClosing) {
                var returnValue = this.onClosing(viewModel);

                if (returnValue === false) return;

                if (returnValue && returnValue.then) {
                    returnValue.then(res => {
                        mdPanelRef.close();
                        return;
                    }, res => {
                        if (res) console.error(res);
                        return;
                    })

                    return;
                }
            }

            mdPanelRef.close();
        };

        this.$onClickCancel = event => {
            mdPanelRef && mdPanelRef.close().then(() => {
                mdPanelRef.destroy();
            });
        };
    }];

    angular.module('ias.system').controller('customBondCtrl', [
        '$scope', '$mdPanel', '$q', 'systemAdminService', 'messageBox', 'uiGridService', 'user', 'commonService', 'vaildationService', 'ias.system.config',
        function ($scope, $mdPanel, $q, systemAdminService, messageBox, uiGridService, user, commonService, vaildationService, moduleConfig) {

            const dataDefine = {
                addDialogTemplateUrl: 'src/system/component/template/add_panel_dialog.html',

                uiGrid: {
                    columnDef: [
                        { field: 'bond_code', displayName: '代码', width: '10%' },
                        { field: 'short_name', displayName: '简称', width: '10%' },
                        { field: 'coupon_rate', displayName: '票面利率', width: '10%' },
                        { field: 'interest_start_date', displayName: '起息日', width: '10%' },
                        { field: 'maturity_date', displayName: '到期日', width: '10%' },
                        { field: 'first_coupon_date', displayName: '首次付息日', width: '10%' },
                        { field: 'coupon_frequency.displayName', displayName: '付息频率', width: '10%' },
                        { field: 'comment', displayName: '备注', width: '20%' },
                        { field: 'update_time', displayName: '最后更新时间', width: '10%' },
                        { field: 'modify_user_name', displayName: '更新人', width: '10%' },
                        { field: 'action', displayName: '操作', minWidth: '200', cellTemplate: uiGridService.actionTemplateBuilder(['edit', 'delete']) }
                    ]
                },

                bondCouponFrequency: [
                    { value: 'A', displayName: '年度' },
                    { value: 'S', displayName: '半年度' },
                    { value: 'Q', displayName: '季度' },
                    { value: 'M', displayName: '月度' },
                    { value: 'N', displayName: '无' }
                ],

                // viewModel.property vaild -> viewModel vaild
                vaildRules: [
                    { prop: 'bond_code', rule: 'required', message: '债券代码不能为空' },
                    { prop: 'short_name', rule: 'required', message: '债券简称不能为空' },
                    { prop: 'coupon_rate', rule: 'required', message: '票面利率不能为空' },
                    { prop: 'interest_start_date', rule: 'required', message: '起息日不能为空' },
                    { prop: 'maturity_date', rule: 'required', message: '到期日不能为空' },
                ]
            };

            // private functions
            var onPanelClosingHandler = result => {
                if (result && !result.last_modified_by) {
                    result.last_modified_by = user.id;
                }

                function insertOrUpdateAsync(result) {
                    var viewModel = result

                    var checkResult = vaildationService.vaildViewModel(viewModel, dataDefine.vaildRules);

                    if (checkResult.result) {

                        if (viewModel.coupon_frequency) viewModel.coupon_frequency = viewModel.coupon_frequency.value;

                        return systemAdminService.buildHttpRequestDefer('customBondResource.insert')({
                            company_id: user.company_id,
                            custom_bonds: [viewModel]
                        }).then(res => {
                            getList();
                        }, res => $q.reject(res));
                    } else {
                        return $q.reject(checkResult.rule.message)
                    }
                };

                if (result && result.id) {
                    return insertOrUpdateAsync(result);
                } else {
                    let dto = {
                        company_id: user.company_id,
                        bond_codes: [result.bond_code]
                    };

                    return systemAdminService.buildHttpRequestDefer('customBondResource.getList')(dto).then(res => {
                        if (!res || !angular.isArray(res.data) || res.data.length < 1) {
                            return insertOrUpdateAsync(result);
                        } else {
                            return $q.reject('已有同名自定义券存在！');
                        }
                    }, res => $q.reject(res)).then(res => {
                        getList();
                        return $q.resolve();
                    }, res => {
                        if (res) {
                            messageBox.error(res);
                        } else {
                            messageBox.error('添加失败！');
                        }

                        return $q.reject(res);
                    });
                }
            };

            var openDeleteConfirmDialog = item => {
                messageBox.confirm('确定要删除该条记录吗？', '提示', function () {
                    systemAdminService.buildHttpRequestDefer('customBondResource.delete')({
                        company_id: user.company_id,
                        ids: [item.id]
                    }).then(res => {
                        getList();
                    }, res => {
                        messageBox.error('删除记录失败！');
                    });
                });
            };

            var initUiGridOptions = () => {
                $scope.gridOptions = {
                    enableColumnMenus: false,
                    enableColumnResizing: true,
                    enableFiltering: false,
                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    multiSelect: false,
                    enablePaginationControls: false,
                    columnDefs: dataDefine.uiGrid.columnDef,
                    onRegisterApi: function (gridApi) {
                        this.gridApi = gridApi;
                    },
                    data: []
                };
            };

            var getList = () => {
                let dto = { company_id: user.company_id };

                systemAdminService.buildHttpRequestDefer('customBondResource.getList')(dto).then(res => {
                    if (!res || !angular.isArray(res.data)) return;

                    var viewModel = res.data;
                    var coupon_frequencyItemSource = angular.copy(dataDefine.bondCouponFrequency);
                    viewModel.forEach(item => {
                        item.coupon_frequencyItemSource = coupon_frequencyItemSource;
                        item.coupon_frequency = coupon_frequencyItemSource.find(e => e.value === item.coupon_frequency);
                    });

                    this.originData = angular.copy(viewModel);
                    $scope.gridOptions.data = angular.copy(viewModel);
                }, res => {
                    messageBox.error('列表获取失败！');
                });
            };

            // Public functions
            this.$onInit = () => {
                $scope.input = {};

                initUiGridOptions();

                getList();
            };

            $scope.onClickAdd = event => {
                this.systemAdminService.openAddEditDialog(undefined, { coupon_frequencyItemSource: angular.copy(dataDefine.bondCouponFrequency) });
            };

            $scope.onClickTable = event => {

                if (!event || !event.target) return;

                let item = angular.element(event.target).scope();

                while (item.$parent && !item.row) item = item.$parent;
                if (item.row) item = item.row.entity;
                else return;

                let target = event.target;

                while (target.parentElement && target.nodeName !== "BUTTON") target = target.parentElement;

                switch (target.getAttribute('tag')) {
                    case "edit":
                        this.systemAdminService.openAddEditDialog(undefined, item);
                        break;
                    case "delete":
                    case "del":
                        openDeleteConfirmDialog(item);
                        break;
                    default: break;
                };
            };

            $scope.onSearchTextChanged = () => {
                if (!$scope || !$scope.gridOptions || !$scope.gridOptions.data || !angular.isArray($scope.gridOptions.data) || !angular.isArray(this.originData)) return;

                $scope.gridOptions.data = this.originData.filter(item => {
                    let searchText = commonService.getPropertyX($scope, "input.searchText");
                    return angular.isString(item.bond_code) && item.bond_code.indexOf(searchText) > -1;
                });

                if (commonService.getPropertyX(this, "gridApi.grid.refresh")) this.gridApi.grid.refresh();
            };

        }]);

})(window.angular);