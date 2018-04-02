(function (angular) {

    // （资产）校对表
    angular.module('ias.system').controller('checkedAssetCtrl', [
        '$scope', 'adminTableFactory', 'gridItemNum', 'selectedObj', 'checkAssetReq',
        'messageBox', 'user', 'bondInfo', 'systemAdminService',
        function ($scope, adminTableFactory, gridItemNum, selectedObj, checkAssetReq,
            messageBox, user, bondInfo, systemAdminService) {

            $scope.gridOptions = {
                enableColumnMenus: false,
                enableColumnResizing: true,
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                enablePaginationControls: false,
                showTreeRowHeader: false,
                showTreeExpandNoChildren: true,
                paginationPageSize: gridItemNum.gridItemNum,
                columnDefs: adminTableFactory.checkedAssetColumnDef(),
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.registerDataChangeCallback(function () {
                        $scope.gridApi.treeBase.expandAllRows();
                    });
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.gridApi.treeBase.toggleRowTreeState(row);
                    });
                }
            };

            this.$onInit = function () {
                $scope.checked_asset_list = [];

                // apiAddress + "/asset_adjust"
                checkAssetReq.get({ company_id: user.company_id }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        if (angular.isArray(data)) {
                            systemAdminService.setCheckAssetTreeGraph(data);
                            systemAdminService.redefineAccountName();
                            $scope.checked_asset_list = systemAdminService.getCheckAssetTreeGraph();
                        }

                        $scope.gridOptions.data = $scope.checked_asset_list;
                    }
                }, function failed() {
                    messageBox.error('获取校对表失败！');
                });
            };

            $scope.levelNameFunc = function (row) {
                if (row.entity.hasOwnProperty('id')) {
                    if (row.entity.last_node_children) {
                        return 'view-nonodemax-tree';
                    }
                    return 'view-nonode-tree';
                }
            };

            $scope.add_checked_asset = function () {
                selectedObj.checked_asset.isEdit = false;
                selectedObj.checked_asset.asset_type = '债券';
                selectedObj.checked_asset.course_code = '';
                selectedObj.checked_asset.course_name = '';
                selectedObj.checked_asset.dlg_title = '添加校对信息';
                $('#checkAssetDlg').modal('show');
            };

            $scope.edit_checked_asset = function (row) {
                selectedObj.checked_asset.isEdit = true;
                selectedObj.checked_asset.extra_info = row.extra_info;
                selectedObj.checked_asset.asset_type = row.asset_type ? row.asset_type : '债券';
                selectedObj.checked_asset.course_code = row.course_code;
                selectedObj.checked_asset.course_name = row.course_name;
                selectedObj.checked_asset.dlg_title = '编辑校对信息';
                selectedObj.checked_asset.unchecked = row.asset_id === 'unknown' ? true : false;

                if (selectedObj.checked_asset.unchecked) {
                    selectedObj.checked_asset.byCode = bondInfo.getBondBasic(row.asset_code);
                    selectedObj.checked_asset.byName = bondInfo.getBondBasic(row.asset_name);
                    selectedObj.checked_asset.checkedType = '2';
                } else {
                    selectedObj.checked_asset.byCode = null;
                    selectedObj.checked_asset.byName = null;
                    selectedObj.checked_asset.checkedType = '2';
                    selectedObj.checked_asset.checkedObj.asset_code = row.asset_code;
                    selectedObj.checked_asset.checkedObj.asset_name = row.asset_name;
                    selectedObj.checked_asset.checkedObj.asset_id = row.asset_id;
                }

                $('#checkAssetDlg').modal('show');
            };

            $scope.delete_asset = function (row) {
                var delete_func = function () {
                    checkAssetReq.delete({
                        company_id: user.company_id,
                        course_code: row.course_code,
                        course_name: row.course_name
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            if (data) {
                                $.each($scope.checked_asset_list, function (index, checked_asset) {
                                    if (checked_asset.id == data.id) {
                                        $scope.checked_asset_list.splice(index, 1);
                                        return false;
                                    }
                                });
                            }

                            systemAdminService.setCheckAssetTreeGraph($scope.checked_asset_list);
                            $scope.checked_asset_list = systemAdminService.getCheckAssetTreeGraph();
                        }
                    }, function failed() {
                        messageBox.error('删除校对资产失败！');
                    });
                };

                messageBox.confirm('确定要删除该科目校对信息：' + row.course_code + ' ' + row.course_name, null, delete_func);
            }
        }]);
})(window.angular);