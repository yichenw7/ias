'use strict';

(function (angular) {
    var iasSystemModule = angular.module('ias.system');

    iasSystemModule.controller('systemAdminqbCtrl', function ($scope, user, UserService, systemAdminData,
        socketServer, messageBox, datetimePickerConfig, functionCodeConstant, roleConstant, $rootScope,
        gridItemNum, dataCenter, adminTableFactory, AssetRef) {
        //日历配置
        $scope.timePickerConfig = datetimePickerConfig;

        $scope.heightTableStyle = {
            height: $(window).height() - 100 + 'px',
            heightVal: $(window).height() - 100,
        };

        gridItemNum.gridItemNum = (($scope.heightTableStyle.heightVal - 10) / 30) - 1;

        $scope.heightLibStyle = {
            height: ($(window).height() - 200) / 2 + 'px',
            heightVal: ($(window).height() - 200) / 2
        };
        gridItemNum.gridInstitutionNum = (($scope.heightLibStyle.heightVal - 10) / 30) - 1;

        $scope.heightTraderStyle = {
            height: $(window).height() - 80 - 110 - ($(window).height() - 200) / 2 + 'px',
            heightVal: $(window).height() - 80 - 110 - ($(window).height() - 200) / 2
        };
        gridItemNum.gridTraderNum = ($scope.heightTraderStyle.heightVal / 30) - 2;

        $scope.selected = {
            user_list_panel: true,
            account_authority_panel: false,
            investor_list_panel: false,
            investor_trade_list_panel: false,
            bond_pool_panel: false,
            invest_bond_panel: false,
            rival_panel: false,
            checked_asset_panel: false,
            defined_asset_panel: false,
            valuation_data_panel: false,
            cash_position_panel: false
        };
        $scope.tabList = [
            { title: '用户管理', homeClass: 'admin-user-icon' },
            { title: '用户列表', panel: 'user_list_panel' },
            { title: '账户管理', homeClass: 'admin-account-icon' },
            { title: '内部权限', panel: 'account_authority_panel' },
            { title: '投顾权限', panel: 'investor_list_panel' },
            { title: '投顾成交权限', panel: 'investor_trade_list_panel' },
            { title: '风控管理', homeClass: 'admin-bond-icon' },
            { title: '债券池', panel: 'bond_pool_panel' },
            { title: '可投库', panel: 'invest_bond_panel' },
            { title: '机构管理', homeClass: 'admin-organization-icon' },
            { title: '对手库', panel: 'rival_panel' },
            { title: '校对表', panel: 'checked_asset_panel' },
            { title: '资产定义表', panel: 'defined_asset_panel' },
            { title: '估值表数据管理', panel: 'valuation_data_panel' },
            { title: '现金头寸重置记录', panel: 'cash_position_panel' },
            // { title: '债券自定义', panel: 'custom_bond_panel' }
        ];
        $scope.getTabClass = function (panel_name) {
            // return panel_name ? $scope.selected[panel_name] ? 'admin-active' : 'admin-default' : 'admin-tags';
            return panel_name ? $scope.selectedPanel === panel_name ? 'admin-active' : 'admin-default' : 'admin-tags';
        }
        $scope.pageChange = function (panel_name) {
            // Updated Wei Lai on 2017/06/14
            // 过滤 无页面应用
            if ($scope.selected.hasOwnProperty(panel_name)) {
                $scope.selectedPanel = panel_name;
            }
        };

        // 资产定义表数据源
        $scope.asset_define_list = [];
        $scope.assetDefineListLoad = function () {
            $scope.asset_define_list.length = 0;
            AssetRef.get({ company_id: user.company_id }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $.each(data, function (index, value) {
                        $scope.asset_define_list.push(value);
                    })
                }
            }, function failed() {
                messageBox.error('获取资产定义表失败！');
            })
        };

        if (!UserService.hasFunctionCode(functionCodeConstant.INVESTMENT)) {
            // 没有投顾权限 去除投顾权限tab，投顾成交权限tab
            $scope.tabList.splice(4, 2);
        }

        $scope.bondBasicList = dataCenter.market.bondDetailList;
        $scope.stockFundList = dataCenter.market.stockFundDetailList;
        $scope.accounts = systemAdminData.accountList;

        socketServer.join('/user_qb', user.company_id);
        socketServer.join('/account', user.company_id);
        socketServer.registerNotificationSocket(user.company_id, $scope);

        user.isLogin = true;

        $scope.pageChange('user_list_panel')
    });

    iasSystemModule.controller('userListCtrl', function ($scope, selectUser, adminTableFactory, socketServer, user, systemAdminData,
        gridItemNum, QBUserRequest, messageBox) {
        $scope.addUser = function () {
            selectUser.user = null;
        };

        $scope.gridOptions = {
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFiltering: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            enablePaginationControls: false,
            paginationPageSize: gridItemNum.gridItemNum,
            columnDefs: adminTableFactory.qbUserColumnDef(),
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows) {
                    renderalbeRows.forEach(function (row) {
                        //搜索框筛选
                        if ($scope.searchKey != null && $scope.searchKey != "") {
                            if ((row.entity.account_name).indexOf($scope.searchKey) == -1) {
                                row.visible = false;
                                return true;
                            }
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };

        function bindUserList() {
            $scope.userList = systemAdminData.users;
            $scope.gridOptions.data = $scope.userList;
            $scope.totalItems = $scope.gridOptions.data.length;
        }

        bindUserList();
        $scope.$watchCollection(
            function() { return systemAdminData.users },
            function(newVal, oldVal) {
                if (newVal === oldVal) return;
                bindUserList();
            }
        );

        //user 推送服务
        socketServer.on('/user_qb', 'user qb event', function (data) {
            if (data.hasOwnProperty('user_list')) {
                $.each(data.user_list, function (index, newUser) {
                    $.each(systemAdminData.users, function (index, user) {
                        if (newUser.id == user.id) {
                            systemAdminData.users.splice(index, 1);
                            return false;
                        }
                    });
                });

                if (data.action != 'delete') {
                    $.each(data.user_list, function (index, newUser) {
                        systemAdminData.users.splice(0, 0, newUser);
                    })
                }
            }
        });

        // 用户搜索框
        $scope.searchKey = '';
        $scope.userSelectFun = function (selected) {
            if (selected) {
                $scope.searchKey = selected.originalObject.account_name;
            } else {
                $scope.searchKey = '';
            }

            $scope.gridApi.grid.refresh();
        };

        $scope.edit = function (user) {
            selectUser.user = user;
            selectUser.isEdit = true;
            $('#userManageDlg').modal('toggle');
        };

        $scope.delete = function (qbuser) {
            $scope.user_id = qbuser.id;
            var confirm = function () {
                QBUserRequest.delete({
                    user_id: qbuser.id,
                    company_id: user.company_id
                }, function success() {

                }, function failed() {
                    messageBox.error('删除用户失败！')
                });
            }
            messageBox.confirm('确定要删除用户：' + qbuser.user_name, null, confirm);
        };

        $scope.addUser = function () {
            selectUser.user = null;
            selectUser.isEdit = false;
            $('#userManageDlg').modal('toggle');
        }
    })
    iasSystemModule.controller('accountAuthorityCtrl', function ($scope, adminTableFactory, systemAdminData, selectAccount, loadTaskData,
        socketServer, user, authorityConstant, gridItemNum, messageBox, roleConstant, QBUserListByRole) {
        var setAuthority = function (account) {
            if (systemAdminData.accountAuthorityMap != null && systemAdminData.accountAuthorityMap.hasOwnProperty(account.id)) {
                var authorities = systemAdminData.accountAuthorityMap[account.id];
                account.read_users = [];
                account.write_users = [];
                var read_users_name = '';
                var write_users_name = '';
                $.each(authorities, function (index, authority) {
                    if (authority.hasOwnProperty('user_id')) {
                        if (authority.option == authorityConstant.ACCOUNT_READ && systemAdminData.managerIdMap.hasOwnProperty(authority.user_id)) {
                            account.read_users.push(authority.user_id);

                            read_users_name += systemAdminData.managerIdMap[authority.user_id].user_name + ', ';
                        } else if (authority.option == authorityConstant.ACCOUNT_WRITE && systemAdminData.managerIdMap.hasOwnProperty(authority.user_id)) {
                            account.write_users.push(authority.user_id);

                            write_users_name += systemAdminData.managerIdMap[authority.user_id].user_name + ', ';
                        }
                    }
                });

                if (read_users_name.length > 0) {
                    read_users_name = read_users_name.substr(0, read_users_name.length - 2);
                }
                account.read_users_name = read_users_name;

                if (write_users_name.length > 0) {
                    write_users_name = write_users_name.substr(0, write_users_name.length - 2);
                }
                account.write_users_name = write_users_name;
            } else {
                account.read_users = [];
                account.write_users = [];
                account.read_users_name = '';
                account.write_users_name = '';
            }
            account.manager_name = systemAdminData.managerIdMap.hasOwnProperty(account.manager) ? systemAdminData.managerIdMap[account.manager].user_name : '';
        };

        var updateAuthority = function (data) {
            if (data.hasOwnProperty('account_id') && data.hasOwnProperty('authorities')) {
                var account_id = data.account_id;
                var authorities = data.authorities;

                if (authorities == null || authorities === undefined || authorities.length == 0) {
                    if (systemAdminData.accountAuthorityMap != null) {
                        delete systemAdminData.accountAuthorityMap[account_id];
                    }
                } else {
                    if (systemAdminData.accountAuthorityMap == null) {
                        systemAdminData.accountAuthorityMap = {};
                    }
                    systemAdminData.accountAuthorityMap[account_id] = authorities;
                }

                $.each(systemAdminData.accountList, function (index, account) {
                    if (account.hasOwnProperty('id') && account.id == account_id) {
                        setAuthority(account);
                        return false;
                    }
                });
            }
        };

        var gridDataBind = function () {
            $.each(systemAdminData.accountList, function (index, account) {
                if (account.hasOwnProperty('id')) {
                    setAuthority(account);
                }
            });

            $scope.gridOptions.data = systemAdminData.accountList;
        };

        $scope.gridOptions = {
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFiltering: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            enablePaginationControls: false,
            paginationPageSize: gridItemNum.gridItemNum,
            columnDefs: adminTableFactory.accountAuthorityColumnDef(),
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows) {
                    renderalbeRows.forEach(function (row) {
                        //搜索框筛选
                        if ($scope.searchKey != null && $scope.searchKey != "") {
                            if (row.entity.manager !== $scope.searchKey) {
                                row.visible = false;
                                return true;
                            }
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };

        // 用户搜索框
        $scope.userList = systemAdminData.users;
        $scope.searchKey = '';
        $scope.managerSelectFun = function (selected) {
            if (selected) {
                $scope.searchKey = selected.originalObject.id;
            } else {
                $scope.searchKey = '';
            }
            $scope.gridApi.grid.refresh();
        };

        this.$onInit = function () {
            QBUserListByRole.get({
                company_id: user.company_id,
                role_name: roleConstant.MANAGER
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    systemAdminData.managerList = data;

                    systemAdminData.managerIdMap = {};
                    $.each(systemAdminData.managerList, function (index, manager) {
                        if (manager.hasOwnProperty('id')) {
                            systemAdminData.managerIdMap[manager.id] = manager;
                        }
                    });

                    gridDataBind();
                }
            }, function failed() {
                messageBox.error('投资经理列表获取失败！');
                gridDataBind();
            });
        };

        //account authority 推送服务
        socketServer.on('/account', 'account authority event', function (data) {
            //console.log('收到 account authority 消息');
            updateAuthority(data);
        });

        $scope.refreshData = function () {
            // loadTaskData.systemAccountAuthority(gridDataBind);
            systemAdminData.load().then(function() {
                return systemAdminData.getAuthorityMap();
            }).then(function() {
                gridDataBind();
                $scope.$apply();
            });
        };

        $scope.authority_edit = function (account) {
            selectAccount.account_id = account.id;
            selectAccount.account_name = account.name;
            selectAccount.read_users = account.read_users;
            selectAccount.write_users = account.write_users;
            selectAccount.manager = account.manager;
            $('#authorityEdit').modal('toggle');
        }
    })


    iasSystemModule.controller('agentTradeCtrl', function ($scope, adminTableFactory, gridItemNum, systemAdminData, agentAccountTrade,
        user, messageBox) {
        $scope.gridOptions = {
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFiltering: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            enablePaginationControls: false,
            paginationPageSize: gridItemNum.gridItemNum,
            columnDefs: adminTableFactory.agentTradeColumns(),
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows) {
                    renderalbeRows.forEach(function (row) {
                        //搜索框筛选
                        if ($scope.searchKey != null && $scope.searchKey != "") {
                            if (row.entity.agent_user_id + row.entity.account_id !== $scope.searchKey) {
                                row.visible = false;
                                return true;
                            }
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };
        //搜索框
        $scope.searchKey = '';
        $scope.investorSelectFun = function (selected) {
            if (selected) {
                $scope.searchKey = selected.originalObject.agent_user_id + selected.originalObject.account_id;
            } else {
                $scope.searchKey = '';
            }

            $scope.gridApi.grid.refresh();
        };

        $scope.disabled_save_btn = true;
        this.$onInit = function () {
            agentAccountTrade.get({ company_id: user.company_id }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $scope.agentAccountTradeOptions = data.filter(function(agentTradeOption) {
                        var hasAccountId = systemAdminData.accountIdMap.hasOwnProperty(agentTradeOption.account_id);
                        agentTradeOption.account_name = hasAccountId ? systemAdminData.accountIdMap[agentTradeOption.account_id].name : "";
                        return hasAccountId;
                    });
                    $scope.gridOptions.data = $scope.agentAccountTradeOptions;
                    $scope.agent_trade_list = $scope.gridOptions.data;
                    $scope.disabled_save_btn = true;
                }
            }, function failed() {
                messageBox.error('投顾账户成交权限获取失败！');
            })

        };

        $scope.change_option = function ($event) {
            if ($scope.disabled_save_btn) {
                $scope.disabled_save_btn = false;
            }
        };

        $scope.update = function () {
            var parameters = [];
            $.each($scope.gridOptions.data, function (index, value) {
                if (value.hasOwnProperty('account_id')) {
                    parameters.push({
                        account_id: value.account_id,
                        agent_user_id: value.agent_user_id,
                        trade_option: value.trade_option
                    })
                }
            });

            agentAccountTrade.update({ company_id: user.company_id, update_list: parameters }, function success(response) {
                if (response.code && response.code === '0000') {
                    var message = response.data;
                    if (message.msg !== 'success') {
                        messageBox.error('更新失败!')
                    } else {
                        $scope.disabled_save_btn = true;
                    }
                }
            }, function failed() {
                messageBox.error('更新失败!')
            });
        }
    });

    iasSystemModule.controller('bondPoolCtrl', function ($scope, user, adminTableFactory, selectedObj, messageBox,
        systemAdminData, bondsRequest, bondRequest, dateClass,
        gridItemNum, $filter) {

        $scope.gridOptions = {
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
            paginationPageSize: gridItemNum.gridItemNum,
            columnDefs: adminTableFactory.bondPoolColumnDef(),
            exporterFieldCallback: function (grid, row, col, value) {
                if (col.name === 'bond_id') {
                    return value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
                }

                return value;
            },
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows) {
                    renderalbeRows.forEach(function (row) {
                        //搜索框筛选
                        if ($scope.searchKey != null && $scope.searchKey != "") {
                            if (row.entity.bond_id !== $scope.searchKey) {
                                row.visible = false;
                                return true;
                            }
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };


        //搜索框
        $scope.searchKey = '';
        $scope.bondSelectFun = function (selected) {
            if (selected) {
                $scope.searchKey = selected.originalObject.bond_id;
            } else {
                $scope.searchKey = '';
            }

            $scope.gridApi.grid.refresh();
        };

        this.$onInit = function () {
            bondsRequest.get({
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    systemAdminData.bondList = data;
                    $scope.gridOptions.data = systemAdminData.bondList;
                }
            }, function failed() {
                messageBox.error('债券池数据获取失败！');
            });
        };
        $scope.exportBondPoolExcel = function () {
            $scope.gridOptions.exporterCsvFilename = 'bond_pool_' + dateClass.getFormatDate(new Date(), 'yyyyMMdd') + '.csv';
            var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
            $scope.gridApi.exporter.csvExport('all', 'all', myElement);
        };

        $scope.bond_delete = function (bond) {
            var confirm = function () {
                bondRequest.delete({
                    company_id: user.company_id,
                    bond_id: bond.bond_id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        if (data && data.length > 0) {
                            $.each(data, function (index, newBond) {
                                $.each(systemAdminData.bondList, function (index, bond) {
                                    if (newBond == bond.bond_id) {
                                        systemAdminData.bondList.splice(index, 1);
                                        return false;
                                    }
                                })
                            })
                        } else {
                            messageBox.error('删除证券失败！');
                        }
                    } else {
                        messageBox.error('删除证券失败！');
                    }
                }, function failed() {
                    messageBox.error('删除证券失败！');
                });
            };
            messageBox.confirm('确定要删除证券：' + bond.bond_id + ' ' + bond.short_name, null, confirm);
        };

        $scope.bond_edit = function (bonds) {
            selectedObj.bondPool.bond.bond_id = bonds.bond_id;
            selectedObj.bondPool.bond.short_name = bonds.short_name;
            selectedObj.bondPool.bond.score = bonds.score;
            selectedObj.bondPool.bond.expire_start_date = bonds.expire_start_date;
            selectedObj.bondPool.bond.expire_end_date = bonds.expire_end_date;
            selectedObj.bondPool.bond.remarks = bonds.remarks;
            selectedObj.bondPool.isEdit = true;

            $('#bondManageDlg').modal('toggle');
        };

        $scope.bond_add = function () {
            selectedObj.bondPool.bond.bond_id = '';
            selectedObj.bondPool.bond.short_name = '';
            selectedObj.bondPool.bond.score = 5;
            selectedObj.bondPool.bond.expire_start_date = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
            selectedObj.bondPool.bond.expire_end_date = '';
            selectedObj.bondPool.bond.remarks = '';
            selectedObj.bondPool.isEdit = false;

            $('#bondManageDlg').modal('toggle');
        };
    })

    iasSystemModule.controller('investBondCtrl', function ($scope, adminTableFactory, user, selectedObj, systemAdminData,
        bondInvestRequest, messageBox, dateClass, gridItemNum, $filter, bondsInvestRequest) {
        $scope.gridOptions = {
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
            paginationPageSize: gridItemNum.gridItemNum,
            columnDefs: adminTableFactory.investDeserveColumnDef(),
            exporterFieldCallback: function (grid, row, col, value) {
                if (col.name === 'bond_id') {
                    return value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
                }

                return value;
            },
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows) {
                    renderalbeRows.forEach(function (row) {
                        //搜索框筛选
                        if ($scope.searchKey != null && $scope.searchKey != "") {
                            if (row.entity.bond_id !== $scope.searchKey) {
                                row.visible = false;
                                return true;
                            }
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };
        $scope.gridOptions.data = [];
        //搜索框
        $scope.searchKey = '';
        $scope.investBondSelectFun = function (selected) {
            if (selected) {
                $scope.searchKey = selected.originalObject.bond_id;
            } else {
                $scope.searchKey = '';
            }

            $scope.gridApi.grid.refresh();
        };

        this.$onInit = function () {
            bondsInvestRequest.get({
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    systemAdminData.investBondList = data;
                    $scope.gridOptions.data = systemAdminData.investBondList;
                }
            }, function failed() {
                messageBox.error('可投库数据获取失败！')
            });
        };

        $scope.exportInvestBondExcel = function () {
            $scope.gridOptions.exporterCsvFilename = 'invest_bond_' + dateClass.getFormatDate(new Date(), 'yyyyMMdd') + '.csv';
            var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
            $scope.gridApi.exporter.csvExport('all', 'all', myElement);
        };
        $scope.invest_bond_delete = function (bond) {
            var confirm = function () {
                bondInvestRequest.delete({
                    company_id: user.company_id,
                    bond_id: bond.bond_id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        if (data && data.length > 0) {
                            $.each(data, function (index, newInvestBond) {
                                $.each(systemAdminData.investBondList, function (index, investBond) {
                                    if (newInvestBond === investBond.bond_id) {
                                        systemAdminData.investBondList.splice(index, 1);
                                        return false;
                                    }
                                })
                            })
                        } else {
                            messageBox.error('删除证券失败！');
                        }
                    } else {
                        messageBox.error('删除证券失败！');
                    }
                }, function failed() {
                    messageBox.error('删除证券失败！');
                }
                );
            };
            messageBox.confirm('确定要删除证券：' + bond.bond_id + ' ' + bond.short_name, null, confirm);
        };

        $scope.invest_bond_edit = function (bonds) {
            selectedObj.investBond.bond.bond_id = bonds.bond_id;
            selectedObj.investBond.bond.short_name = bonds.short_name;
            selectedObj.investBond.bond.score = bonds.score;
            selectedObj.investBond.bond.expire_start_date = bonds.expire_start_date;
            selectedObj.investBond.bond.expire_end_date = bonds.expire_end_date;
            selectedObj.investBond.bond.remarks = bonds.remarks;
            selectedObj.investBond.isEdit = true;
            $('#investBondManageDlg').modal('toggle');
        };

        $scope.invest_bond_add = function () {
            selectedObj.investBond.bond.bond_id = '';
            selectedObj.investBond.bond.short_name = '';
            selectedObj.investBond.bond.score = 5;
            selectedObj.investBond.bond.expire_start_date = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
            selectedObj.investBond.bond.expire_end_date = '';
            selectedObj.investBond.bond.remarks = '';
            selectedObj.investBond.isEdit = false;

            $('#investBondManageDlg').modal('toggle');
        };
    });

    iasSystemModule.controller('valuationManageCtrl', function ($scope, messageBox, systemAdminData, adminTableFactory,
        gridItemNum, asset_valuation_mngm, user, socketServer) {
        $scope.gridOptions = {
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFiltering: false,
            enablePaginationControls: false,
            paginationPageSize: gridItemNum.gridItemNum,
            columnDefs: adminTableFactory.valuationManageColumnDef(),
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows) {
                    renderalbeRows.forEach(function (row) {
                        //搜索框筛选
                        if ($scope.accountKey) {
                            if (row.entity.account_name !== $scope.accountKey) {
                                row.visible = false;
                            }
                            if ($scope.searchKey) {
                                if (row.entity.asset_date !== $scope.searchKey) {
                                    row.visible = false;
                                }
                            }
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };
        $scope.valuationFilter = function () {
            var valuationAccounts = [];
            $.each(systemAdminData.accountList, function (index, value) {
                if (value.valuation_dates.length > 0) {
                    valuationAccounts.push(value);
                }
            });
            return valuationAccounts;
        }
        $scope.accounts = $scope.valuationFilter();
        $scope.accountKey = '';
        $scope.searchKey = '';
        $scope.valuation_dates = [];

        this.$onInit = function () {
            asset_valuation_mngm.get({
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    $scope.gridOptions.data = response.data.data;
                }
            });
        };
        $scope.accountSelectedFunc = function (selected) {
            $scope.valuation_dates.length = 0;
            if (selected) {
                $scope.accountKey = selected.originalObject.name;
                var account = selected.originalObject;
                $.each(account.valuation_dates, function (index, value) {
                    var obj = {
                        date: value,
                        account_name: account.name,
                        account_id: account.id
                    };
                    $scope.valuation_dates.push(obj);
                });
            } else {
                $scope.accountKey = '';
            }
            $scope.$broadcast('angucomplete-alt:clearInput', 'valuation_date_input');
        };
        $scope.dateSelectedFunc = function (selected) {
            if (selected) {
                $scope.searchKey = selected.originalObject.date;
            }
            else {
                $scope.searchKey = '';
            }
            $scope.gridApi.grid.refresh();
        };
        function delete_func() {
            var selected_list = $scope.gridApi.selection.getSelectedRows();
            var id_list = [];
            $.each(selected_list, function (index, value) {
                id_list.push(value.id);
            })
            asset_valuation_mngm.delete({
                company_id: user.company_id,
                data: id_list,
            }, function success(data) {
                var alertStr = '删除成功，系统已经帮您重新生成成交记录！';
                messageBox.success(alertStr);
            });
        }
        $scope.valuation_data_delete = function () {
            var str;
            var selected_list = $scope.gridApi.selection.getSelectedRows();
            if (selected_list.length == 0) {
                str = "请选中要删除的数据";
                return false;
            }
            else {
                str = "您正在删除:\n";
                var obj = {};
                $.each(selected_list, function (num, row) {
                    if (obj[row.account_name]) {
                        obj[row.account_name].push(row.asset_date);
                    }
                    else {
                        obj[row.account_name] = [row.asset_date];
                    }
                });
                $.each(obj, function (index, value) {
                    str += index + '(' + value.toString() + ')的估值表\n';
                })
                str += "删除后这些账户对应日期的估值表数据会清空，确认删除吗？"
            }
            messageBox.confirm(str, null, delete_func);
        }
        socketServer.on('/account', 'account event', function (data) {
            //删除估值表日期
            if (data.action == 'valuationDelete') {
                $.each(data.data, function (index, value) {
                    if (value.status == 'success') {
                        //gird数据删除
                        $.each($scope.gridOptions.data, function (num, row) {
                            if (row.id == value.id) {
                                $scope.gridOptions.data.splice(num, 1);
                                return false;
                            }
                        });
                        //account的valuation_dates数组里的相关日期删除
                        $.each($scope.accounts, function (num, account) {
                            if (account.id == value.account_id) {
                                $.each(account.valuation_dates, function (index, date) {
                                    if (date == value.date) {
                                        account.valuation_dates.splice(index, 1);
                                        return false;
                                    }
                                });
                                return false;
                            }
                        })
                    }
                });

            }

        });
    });

    iasSystemModule.controller('cashPositionResetCtrl', function ($scope, messageBox, systemAdminData, adminTableFactory,
        gridItemNum, cashRegulateReq, selectedObj, user, systemAdminService) {
        $scope.gridOptions = {
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFiltering: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            data: systemAdminData.cashPositionLog,
            enablePaginationControls: false,
            paginationPageSize: gridItemNum.gridItemNum,
            columnDefs: adminTableFactory.cashPositionColumnDef(),
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows) {
                    renderalbeRows.forEach(function (row) {
                        //搜索框筛选
                        if ($scope.accountKey) {
                            if (row.entity.hasOwnProperty('account_id') && row.entity.account_id !== $scope.accountKey) {
                                row.visible = false;
                                return true;
                            }
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };
        // 搜索框
        $scope.accountKey = null;
        $scope.accountSelectedFunc = function (selected) {
            if (selected) {
                $scope.accountKey = selected.originalObject.id;
            } else {
                $scope.accountKey = null;
            }

            $scope.gridApi.grid.refresh();
        };

        this.$onInit = function () {
            $scope.gridOptions.data.length = 0;
            cashRegulateReq.get({ company_id: user.company_id }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    if (data) {
                        for (var index = 0; index < data.length; index++) {
                            if (systemAdminService.getTransformObj(systemAdminData).transform(data[index])) {
                                $scope.gridOptions.data.push(data[index]);
                            }
                        }
                    }
                    const accounts = {};
                    $scope.gridOptions.data.forEach(item => {
                        accounts[item.account_id] = {
                            id: item.account_id,
                            name: item.account_name,
                        }
                    });
                    $scope.accounts = Object.keys(accounts).map(key => accounts[key]);
                }
            }, function failed() {
                messageBox.warn('获取重置记录失败！');
            });
        };

        $scope.add = function () {
            selectedObj.cashRegulateObj.isEdit = false;
            selectedObj.cashRegulateObj.account_id = '';
            selectedObj.cashRegulateObj.account_name = '';
            selectedObj.cashRegulateObj.manager_name = '';
            selectedObj.cashRegulateObj.reset_date = '';
            selectedObj.cashRegulateObj.daily_amount = '';
            $('#cashRegulateDlg').modal('show');
        };

        $scope.edit = function (row, $event) {
            selectedObj.cashRegulateObj.isEdit = true;
            selectedObj.cashRegulateObj.id = row.id;
            selectedObj.cashRegulateObj.account_id = row.account_id;
            selectedObj.cashRegulateObj.account_name = row.account_name;
            selectedObj.cashRegulateObj.manager_name = row.manager_name;
            selectedObj.cashRegulateObj.reset_date = row.reset_date;
            selectedObj.cashRegulateObj.daily_amount = row.value;
            $('#cashRegulateDlg').modal('show');
            $event.stopPropagation();
        };

        $scope.delete = function (row, $event) {
            messageBox.confirm('确定要删除该条记录吗？', '提示', function () {
                cashRegulateReq.delete({
                    company_id: user.company_id,
                    id: row.id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        if (data.success) {
                            if (data.hasOwnProperty('id')) {
                                $.each($scope.gridOptions.data, function (index, cashPosition) {
                                    if (cashPosition.hasOwnProperty('id') && cashPosition.id === data.id) {
                                        $scope.gridOptions.data.splice(index, 1);
                                        return false;
                                    }
                                });
                            }
                        } else {
                            messageBox.error('删除记录失败: ' + data.msg);
                        }
                    } else {
                        messageBox.error('删除记录失败: ' + data.msg);
                    }
                }, function failed() {
                    messageBox.error('删除记录失败！');
                })

            })
            $event.stopPropagation();
        };
    });


    // Jira IAS IAS-2370
    // remove addAssetDefineCtrl to assetDefineCtrl.js
    // By Wei Lai on 2017/07/20
    // 下面都是 dialog ctrl
    iasSystemModule.controller('importLibTemplateCtrl', function ($scope) {
        $scope.templates = [
            {
                template_id: 1,
                template_title: '模板',
                template_imgs: [
                    { name: '交易明细', url: './images/admin_2.png' }
                ],
                template_url: 'static/template/admin_counterpart.xlsx',
                is_view: false,
                is_transform: true
            }
        ];

        $scope.view_image = false;
        $scope.big_img_url = [];
        $scope.selectedRow = 0;
        $scope.curAcitve = false;
        $scope.temp_url = $scope.templates[0].template_url;

        $scope.viewTemplateImg = function (temp, tempUrl) {
            $scope.big_img_url = temp;
            $scope.view_image_url = $scope.big_img_url[0].url;
            $scope.view_image = true;
            $scope.temp_url = tempUrl;
        };

        $scope.showImg = function (img, row) {
            $scope.view_image_url = img.url;
            $scope.selectedRow = row;
        };

        $scope.closeShowImg = function (temp) {
            $scope.view_image = false;
        };

        $scope.dismissImport = function () {
            $('#importLibTemplateDlg').modal('hide');
        };

        $scope.importTemplate = function () {
            $scope.dismissImport();
        };

        $scope.closeSelf = function () {
            $scope.closeShowImg();
        };
    });
    iasSystemModule.controller('userManageqbCtrl', function ($scope, selectUser, QBUserList, QBUserRequest, sortClass,
        user, dataCenter, messageBox) {
        $scope.roleType = [];
        $.each(dataCenter.user.userRoleMap, function (key, value) {
            $scope.roleType.push(value);
        });
        $scope.roleType.sort(function (a, b) {
            return sortClass.userRoleFunc(a, b);
        });

        $scope.user = {
            id: '',
            account_name: '',
            user_name: '',
            roles: []
        };

        $scope.initUser = function () {
            if (selectUser.user != null) {
                $scope.user.id = selectUser.user.id;
                $scope.user.account_name = selectUser.user.account_name;
                $scope.user.user_name = selectUser.user.user_name;
                $scope.user.roles = [];
                $.each(selectUser.user.role_list, function (index, role) {
                    if (role.en_name === 'trader' || role.en_name === 'researcher') {
                        return true;
                    }
                    if (dataCenter.user.userRoleMap.hasOwnProperty(role.id)) {
                        $scope.user.roles.push({ id: role.id });
                    }
                });
            } else {
                $scope.user.id = '';
                $scope.user.account_name = '';
                $scope.user.user_name = '';
                $scope.user.roles = [];
            }
            $scope.isEdit = selectUser.isEdit;
        };

        $scope.initUser();
        $scope.$watchCollection(
            function () { return selectUser.user },
            function (newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                $scope.initUser();
            }
        );

        $scope.addRole = function () {
            if ($scope.user.roles.length == $scope.roleType.length) {
                return;
            }
            $scope.user.roles.push({ id: $scope.roleType[0].id });
        };

        $scope.removeRole = function (index) {
            $scope.user.roles.splice(index, 1);
        };

        $scope.confirmBtnClick = function () {
            if ($scope.user.roles.length == 0) {
                messageBox.warn('用户角色不能为空！');
                return;
            }

            if ($scope.user.account_name.length == 0) {
                messageBox.warn('账号不能为空！');
                return;
            }

            //去除重复角色
            var rolesMap = {};
            $.each($scope.user.roles, function (index, role) {
                if (!rolesMap.hasOwnProperty(role.id)) {
                    rolesMap[role.id] = index;
                }
            });

            if (!$scope.isEdit) {                  //添加用户
                var roles = [];
                $.each(rolesMap, function (key, role) {
                    if (key !== undefined && key != null) {
                        roles.push(key);
                    }
                });

                QBUserList.addUser({
                    account_name: $scope.user.account_name,
                    company_id: user.company_id,
                    user_name: $scope.user.user_name,
                    roles: roles
                });
            }
            else {                                        //编辑用户
                var addList = [];
                var deleteList = [];
                $.each(rolesMap, function (key, value) {   //添加角色
                    var find = false;
                    if (key !== undefined && key != null) {
                        $.each(selectUser.user.role_list, function (i, oldRole) {
                            if (key == oldRole.id) {
                                find = true;
                                return false;
                            }
                        });
                        if (!find) {
                            addList.push(key);
                        }
                    }
                });

                $.each(selectUser.user.role_list, function (i, oldRole) {         //删除角色
                    if (oldRole.en_name === 'trader' || oldRole.en_name === 'researcher') {
                        return true;
                    }
                    if (!rolesMap.hasOwnProperty(oldRole.id)) {
                        deleteList.push(oldRole.id);
                    }
                });

                QBUserRequest.update({
                    user_id: $scope.user.id,
                    user: {
                        user_name: $scope.user.user_name,
                        add_roles: addList,
                        delete_roles: deleteList
                    },
                    company_id: user.company_id
                });
            }
        };

        $scope.closeBeforeFunc = function () {
            selectUser.user = null;
            selectUser.isEdit = false;
        }
    })
    iasSystemModule.controller('accountAuthorityEditCtrl', function(
        $scope, systemAdminData, selectAccount, user, adminTableFactory, accountAuthorityRequest, authorityConstant) {
        $scope.gridOptions = {
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFiltering: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: adminTableFactory.setAccountAuthorityColumnDef(),
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function(renderalbeRows) {
                    renderalbeRows.forEach(function(row) {
                        //自己的账户不显示
                        if (row.entity.id === selectAccount.manager) {
                            row.visible = false;
                        } else {
                            row.visible = true;
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };

        $scope.gridOptions.data = [];

        $scope.accountAuthority = {
            account_id: null,
            account_name: ''
        };

        var initAuthority = function() {
            $scope.gridOptions.data = systemAdminData.managerList;
            $.each($scope.gridOptions.data, function(index, authority) {
                if ($.inArray(authority.id, selectAccount.write_users) != -1) {
                    authority.option = authorityConstant.ACCOUNT_WRITE;
                } else if ($.inArray(authority.id, selectAccount.read_users) != -1) {
                    authority.option = authorityConstant.ACCOUNT_READ;
                } else {
                    authority.option = authorityConstant.ACCOUNT_NO_ENTRY;
                }
            });
            $scope.gridApi.grid.refresh();
        };

        $scope.$watch(
            function() { return selectAccount.account_id; },
            function() {
                if (selectAccount.account_id == null) {
                    return;
                }

                $scope.accountAuthority.account_id = selectAccount.account_id;
                $scope.accountAuthority.account_name = selectAccount.account_name;
                initAuthority();
                //重置
                selectAccount.account_id = null;
            }
        );

        $scope.confirmFunc = function() {
            var addList = [];
            var deleteList = [];
            var updateList = [];

            $.each($scope.gridOptions.data, function(index, authority) {
                if (authority.option != authorityConstant.ACCOUNT_NO_ENTRY) {
                    if ($.inArray(authority.id, selectAccount.read_users) == -1 &&
                        $.inArray(authority.id, selectAccount.write_users) == -1) {
                        addList.push({
                            user_id: authority.id,
                            option: authority.option
                        });
                    } else if ($.inArray(authority.id, selectAccount.read_users) != -1 &&
                        authority.option == authorityConstant.ACCOUNT_WRITE) {
                        updateList.push({
                            user_id: authority.id,
                            option: authority.option
                        });
                    } else if ($.inArray(authority.id, selectAccount.write_users) != -1 &&
                        authority.option == authorityConstant.ACCOUNT_READ) {
                        updateList.push({
                            user_id: authority.id,
                            option: authority.option
                        });
                    }
                } else {
                    if ($.inArray(authority.id, selectAccount.read_users) != -1 ||
                        $.inArray(authority.id, selectAccount.write_users) != -1) {
                        deleteList.push({
                            user_id: authority.id
                        });
                    }
                }
            });

            if (addList.length > 0 || deleteList.length > 0 || updateList.length > 0) {
                accountAuthorityRequest.update({
                    account_id: $scope.accountAuthority.account_id,
                    add_list: addList,
                    delete_list: deleteList,
                    update_list: updateList,
                    company_id: user.company_id
                });
            }
        }
    });
    iasSystemModule.controller('agentAuthorityEditCtrl', function($scope, adminTableFactory, selectedObj, systemAdminData, authorityConstant,
        agentAuthorityRequest, user) {
        $scope.gridOptions = {
            data: [],
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFiltering: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: adminTableFactory.agentAuthorityColumnDef(),
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.grid.registerRowsProcessor(function(renderalbeRows) {
                    renderalbeRows.forEach(function(row) {
                        //搜索框筛选
                        if ($scope.search.filter && (row.entity.name.indexOf($scope.search.filter) < 0)) {
                            row.visible = false;
                            return true;
                        }
                    });
                    return renderalbeRows;
                }, 200);
            }
        };

        $scope.search = {
            filter: '',
            handleChange: function() {
                $scope.gridApi.grid.scrollToIfNecessary(0, 0);
                $scope.gridApi.grid.refresh();
            },
        }

        $scope.init_investor_authority = function() {
            if ($scope.gridOptions.data.length == 0) {
                $scope.gridOptions.data = angular.copy(systemAdminData.accountList);
            }

            $.each($scope.gridOptions.data, function(index, account) {
                if ($scope.authorityMap != null && $scope.authorityMap.hasOwnProperty(account.id)) {
                    account.option = $scope.authorityMap[account.id].option;
                } else {
                    account.option = authorityConstant.ACCOUNT_NO_ENTRY;
                }
                account.manager_name = systemAdminData.managerIdMap.hasOwnProperty(account.manager) ? systemAdminData.managerIdMap[account.manager].user_name : '';
            });
        };

        $scope.$watchCollection(
            function() { return systemAdminData.accountList },
            function(newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                if (newVal == null) {
                    return;
                }

                $scope.gridOptions.data = angular.copy(systemAdminData.accountList);
                $scope.init_investor_authority();
            }
        );

        $scope.$watch(
            function() { return selectedObj.agentAuthority.agent_user_id },
            function(newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                if (newVal == null) {
                    return;
                }

                $scope.agent_account_name = selectedObj.agentAuthority.agent_account_name;
                $scope.authorityMap = selectedObj.agentAuthority.authorityMap;
                $scope.agent_user_id = selectedObj.agentAuthority.agent_user_id;
                $scope.init_investor_authority();
                selectedObj.agentAuthority.agent_user_id = null;
            }
        );

        $scope.confirmFunc = function() {
            var addList = [];
            var deleteList = [];
            var updateList = [];

            $.each($scope.gridOptions.data, function(index, account) {
                if (account.option != authorityConstant.ACCOUNT_NO_ENTRY) {
                    if ($scope.authorityMap != null && $scope.authorityMap.hasOwnProperty(account.id)) {
                        if (account.option != $scope.authorityMap[account.id].option) {
                            updateList.push({
                                account_id: account.id,
                                option: account.option
                            })
                        }
                    } else {
                        addList.push({
                            account_id: account.id,
                            option: account.option
                        });
                    }
                } else {
                    if ($scope.authorityMap != null && $scope.authorityMap.hasOwnProperty(account.id)) {
                        deleteList.push({
                            account_id: account.id,
                            option: account.option
                        });
                    }
                }
            });

            if (addList.length > 0 || deleteList.length > 0 || updateList.length > 0) {
                agentAuthorityRequest.update({
                    user_id: $scope.agent_user_id,
                    add_list: addList,
                    delete_list: deleteList,
                    update_list: updateList,
                    company_id: user.company_id
                });
            }

            $scope.search.filter = '';
        }
    });
    //添加编辑债券池证券
    iasSystemModule.controller('bondPoolManageCtrl', function ($scope, selectedObj, bondRequest, bondsRequest, user, messageBox, systemAdminData) {

        $scope.titleName = "添加证券";
        $scope.bond = selectedObj.bondPool.bond;
        $scope.bond.score = selectedObj.bondPool.bond.score
        $scope.isEdit = selectedObj.bondPool.isEdit;
        $scope.isSearch = selectedObj.bondPool.isSearch;
        $scope.marketScores = [1, 2, 3, 4, 5]
        $scope.$watch(
            function () { return selectedObj.bondPool.isEdit },
            function (newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                $scope.isEdit = selectedObj.bondPool.isEdit;
            }
        );
        $scope.$watch(
            function () { return selectedObj.bondPool.isSearch },
            function (newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                $scope.isSearch = selectedObj.bondPool.isSearch;
            }
        );

        $scope.bondSelectFun = function (selected) {
            if (selected) {
                $scope.bond.bond_id = selected.originalObject.bond_id;
                $scope.bond.short_name = selected.originalObject.short_name;
            } else {
                $scope.bond.bond_id = '';
                $scope.bond.short_name = '';
            }
        };
        $scope.checkDateOrder = function () {
            var start = $scope.bond.expire_start_date;
            var end = $scope.bond.expire_end_date;
            if (new Date(start) > new Date(end)) {
                $scope.bond.expire_start_date = end;
                $scope.bond.expire_end_date = start;
            }
        };

        $scope.confirmBtnClick = function () {
            if ($scope.isEdit) {//编辑
                bondRequest.update({
                    company_id: user.company_id,
                    short_name: $scope.bond.short_name,
                    bond_id: $scope.bond.bond_id,
                    score: $scope.bond.score,
                    remarks: $scope.bond.remarks,
                    expire_start_date: $scope.bond.expire_start_date,
                    expire_end_date: $scope.bond.expire_end_date,

                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        if (data && data.length > 0) {
                            $.each(data, function (index, newBond) {
                                $.each(systemAdminData.bondList, function (index, bond) {
                                    if (newBond.bond_id === bond.bond_id) {
                                        systemAdminData.bondList.splice(index, 1, newBond);
                                        return false;
                                    }
                                })
                            })
                        } else {
                            messageBox.error('编辑证券失败！');
                        }
                    } else {
                        messageBox.error('编辑证券失败！');
                    }
                }, function failed() {
                    messageBox.error('编辑证券失败！')
                })
            } else {

                if ($scope.bond.short_name == '' || $scope.bond.bond_id == '' || $scope.bond.expire_start_date == '') {
                    messageBox.warn('代码、简称、市场名称和开始日期不能为空！')
                    return false;
                }
                bondsRequest.add({//添加
                    company_id: user.company_id,
                    content: [{
                        short_name: $scope.bond.short_name,
                        bond_id: $scope.bond.bond_id,
                        score: $scope.bond.score,
                        remarks: $scope.bond.remarks,
                        expire_start_date: $scope.bond.expire_start_date,
                        expire_end_date: $scope.bond.expire_end_date,
                    }]
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        if (data && data.length > 0) {
                            $.each(data, function (index, bond) {
                                if (bond.bond_id !== '') {
                                    systemAdminData.bondList.splice(0, 0, bond);
                                }
                            })
                        } else {
                            messageBox.error('添加证券失败！');
                        }
                    } else {
                        messageBox.error('添加证券失败！');
                    }
                }, function failed() {
                    messageBox.error('添加证券失败！')
                })
            }
        }
    })
    //添加编辑可投库证券
    iasSystemModule.controller('investBondManageCtrl', function ($scope, user, selectedObj, bondInvestRequest, systemAdminData, bondsInvestRequest, messageBox) {

        $scope.titleName = "添加或编辑证券";

        $scope.investBond = selectedObj.investBond.bond;
        $scope.isEdit = selectedObj.investBond.isEdit;
        $scope.marketScores = [1, 2, 3, 4, 5];
        $scope.$watch(function () {
            return selectedObj.investBond.isEdit;
        }, function (newVal, OldVal) {
            if (newVal === OldVal) {
                return;
            } else {
                $scope.isEdit = selectedObj.investBond.isEdit;
            }
        })
        $scope.investBondSelectFun = function (selected) {
            if (selected) {
                $scope.investBond.bond_id = selected.originalObject.bond_id;
                $scope.investBond.short_name = selected.originalObject.short_name;
            } else {
                $scope.investBond.bond_id = '';
                $scope.investBond.short_name = '';
            }
        };

        $scope.confirmBtnClick = function () {
            //判断日期大小
            if ($scope.investBond.expire_end_date != '') {
                var start_date = $scope.investBond.expire_start_date.replace(/-/g, "");
                var end_date = $scope.investBond.expire_end_date.replace(/-/g, "");
                if (end_date <= start_date) {
                    messageBox.warn('有效截止日期不能早于开始日期');
                    return false;
                };
            }

            if ($scope.isEdit) {//编辑
                console.log($scope.isEdit);
                bondInvestRequest.update({
                    company_id: user.company_id,
                    short_name: $scope.investBond.short_name,
                    bond_id: $scope.investBond.bond_id,
                    score: $scope.investBond.score,
                    remarks: $scope.investBond.remarks,
                    expire_start_date: $scope.investBond.expire_start_date,
                    expire_end_date: $scope.investBond.expire_end_date
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        if (data && data.length > 0) {
                            $.each(data, function (index, newInvestBond) {
                                $.each(systemAdminData.investBondList, function (index, investBond) {
                                    if (newInvestBond.bond_id == investBond.bond_id) {
                                        systemAdminData.investBondList.splice(index, 1, newInvestBond);
                                        return false;
                                    }
                                })
                            })
                        } else {
                            messageBox.error('编辑证券失败！');
                        }
                    } else {
                        messageBox.error('编辑证券失败！');
                    }
                }, function failed() {
                    messageBox.error('编辑证券失败！')
                });
            } else {
                if ($scope.investBond.short_name == '' || $scope.investBond.bond_id == '' || $scope.investBond.expire_start_date == '' || $scope.investBond.expire_end_date == '') {
                    messageBox.warn('代码、简称、市场名称和日期不能为空！')
                    return false;
                }
                bondsInvestRequest.add({//添加
                    company_id: user.company_id,
                    content: [{
                        short_name: $scope.investBond.short_name,
                        bond_id: $scope.investBond.bond_id,
                        score: $scope.investBond.score,
                        remarks: $scope.investBond.remarks,
                        expire_start_date: $scope.investBond.expire_start_date,
                        expire_end_date: $scope.investBond.expire_end_date
                    }]
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        if (data && data.length > 0) {
                            $.each(data, function (index, investBond) {
                                if (investBond.bond_id !== '') {
                                    systemAdminData.investBondList.splice(0, 0, investBond);

                                } else {
                                    messageBox.error('添加证券失败！');
                                }
                            })
                        } else {
                            messageBox.error('添加证券失败！');
                        }
                    } else {
                        messageBox.error('添加证券失败！');
                    }
                }, function failed() {
                    messageBox.error('添加证券失败！');
                })
            }
        }
    })

    //添加编辑可投库机构
    // Jira IAS IAS-2476
    // remove to rivalCtrl.js
    // By Wei Lai on 2017/08/13

    // 添加和编辑校对表 Dialog
    iasSystemModule.controller('checkedAssetManageCtrl', function ($scope, selectedObj, checkAssetReq, messageBox, user, systemAdminService) {
        $scope.assetTypeGroup = [
            { label: '债券', value: '债券' },
            { label: '股票', value: '股票' }
        ];

        $scope.checked_asset = selectedObj.checked_asset;

        $scope.setCheckedBond = function (selected) {
            if (selected) {
                $scope.checked_asset.checkedObj.asset_code = selected.originalObject.bond_id;
                $scope.checked_asset.checkedObj.asset_name = selected.originalObject.short_name;
                $scope.checked_asset.checkedObj.asset_id = selected.originalObject.bond_key_listed_market;
                $scope.checked_asset.checkedType = '2'; //手工校对
            } else {
                $scope.checked_asset.checkedObj = {};
            }
        };

        $scope.setCheckedStock = function (selected) {
            if (selected) {
                $scope.checked_asset.checkedObj.asset_code = selected.originalObject.code;
                $scope.checked_asset.checkedObj.asset_name = selected.originalObject.name;
                $scope.checked_asset.checkedObj.asset_id = selected.originalObject.code;
                $scope.checked_asset.checkedType = '2'; //手工校对
            } else {
                $scope.checked_asset.checkedObj = {};
            }
        };

        $scope.typeChanged = function () {
            if ($scope.checked_asset.checkedType === '0') {
                $scope.checked_asset.checkedObj.asset_code = $scope.checked_asset.byCode.code;
                $scope.checked_asset.checkedObj.asset_name = $scope.checked_asset.byCode.name;
                $scope.checked_asset.checkedObj.asset_id = $scope.checked_asset.byCode.bond_key_listed_market;
            } else if ($scope.checked_asset.checkedType === '1') {
                $scope.checked_asset.checkedObj.asset_code = $scope.checked_asset.byName.code;
                $scope.checked_asset.checkedObj.asset_name = $scope.checked_asset.byName.name;
                $scope.checked_asset.checkedObj.asset_id = $scope.checked_asset.byName.bond_key_listed_market;
            }
        };

        $scope.confirm_checked = function () {
            if (!$scope.checked_asset.checkedObj.asset_id) {
                messageBox.warn('资产代码或名称不能为空！');
                return;
            }

            var checked = {
                course_code: $scope.checked_asset.course_code,
                course_name: $scope.checked_asset.course_name,
                asset_type: $scope.checked_asset.asset_type,
                asset_code: $scope.checked_asset.checkedObj.asset_code,
                asset_name: $scope.checked_asset.checkedObj.asset_name,
                asset_id: $scope.checked_asset.checkedObj.asset_id
            };

            checkAssetReq.update({
                company_id: user.company_id,
                content: [checked]
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $scope.checked_asset_list = systemAdminService.getCheckAssetTreeGraph();

                    $.each(data, function (index, item) {
                        if (item && item.hasOwnProperty('id')) {
                            $.each($scope.checked_asset_list, function (index, check_asset) {
                                if (check_asset.id === item.id) {
                                    $scope.checked_asset_list.splice(index, 1, item);
                                    return false;
                                }
                            });
                        }
                    });

                    $.each($scope.checked_asset.extra_info, function (index, info) {
                        checkAssetReq.add({
                            company_id: user.company_id,
                            user_id: info.user_id,
                            params: [{
                                account_id: info.account_id,
                                user_id: info.user_id,
                                file_info: {
                                    '1': [{
                                        valuation_date: info.date
                                    }]
                                }
                            }]
                        });
                    });

                    systemAdminService.setCheckAssetTreeGraph($scope.checked_asset_list);
                    $scope.checked_asset_list = systemAdminService.getCheckAssetTreeGraph();
                }
            }, function failed() {
                messageBox.error('更新校对信息失败！');
            })
            $scope.dismiss();
        };

        $scope.dismiss = function () {
            $scope.$broadcast('angucomplete-alt:clearInput');
            $('#checkAssetDlg').modal('hide');
        }
    });

    iasSystemModule.controller('importBondTemplateCtrl', function ($scope) {
        $scope.templates = [
            {
                template_id: 1,
                template_title: '模板',
                template_imgs: [
                    { name: '交易明细', url: './images/admin_1.png' }
                ],
                template_url: 'static/template/admin_bond_pool.xlsx',
                is_view: false,
                is_transform: true
            }
        ];

        $scope.view_image = false;
        $scope.big_img_url = [];
        $scope.selectedRow = 0;
        $scope.curAcitve = false;
        $scope.temp_url = $scope.templates[0].template_url;

        $scope.viewTemplateImg = function (temp, tempUrl) {
            $scope.big_img_url = temp;
            $scope.view_image_url = $scope.big_img_url[0].url;
            $scope.view_image = true;
            $scope.temp_url = tempUrl;
        };

        $scope.showImg = function (img, row) {
            $scope.view_image_url = img.url;
            $scope.selectedRow = row;
        };

        $scope.closeShowImg = function (temp) {
            $scope.view_image = false;
        };

        $scope.dismissImport = function () {
            $('#importBondTemplateDlg').modal('hide');
        };

        $scope.importTemplate = function () {
            $scope.dismissImport();
        };

        $scope.closeSelf = function () {
            $scope.closeShowImg();
        };
    });
    iasSystemModule.controller('importInvestBondTemplateCtrl', function ($scope) {
        $scope.templates = [
            {
                template_id: 1,
                template_title: '模板',
                template_imgs: [
                    { name: '交易明细', url: './images/admin_1.png' }
                ],
                template_url: 'static/template/admin_invest_bond.xlsx',
                is_view: false,
                is_transform: true
            }
        ];

        $scope.view_image = false;
        $scope.big_img_url = [];
        $scope.selectedRow = 0;
        $scope.curAcitve = false;
        $scope.temp_url = $scope.templates[0].template_url;

        $scope.viewTemplateImg = function (temp, tempUrl) {
            $scope.big_img_url = temp;
            $scope.view_image_url = $scope.big_img_url[0].url;
            $scope.view_image = true;
            $scope.temp_url = tempUrl;
        };

        $scope.showImg = function (img, row) {
            $scope.view_image_url = img.url;
            $scope.selectedRow = row;
        };

        $scope.closeShowImg = function (temp) {
            $scope.view_image = false;
        };

        $scope.dismissImport = function () {
            $('#importInvestBondTemplateDlg').modal('hide');
        };

        $scope.importTemplate = function () {
            $scope.dismissImport();
        };

        $scope.closeSelf = function () {
            $scope.closeShowImg();
        };
    })
    iasSystemModule.controller('importLibTemplateCtrl', function ($scope) {
        $scope.templates = [
            {
                template_id: 1,
                template_title: '模板',
                template_imgs: [
                    { name: '交易明细', url: './images/admin_2.png' }
                ],
                template_url: 'static/template/admin_counterpart.xlsx',
                is_view: false,
                is_transform: true
            }
        ];

        $scope.view_image = false;
        $scope.big_img_url = [];
        $scope.selectedRow = 0;
        $scope.curAcitve = false;
        $scope.temp_url = $scope.templates[0].template_url;

        $scope.viewTemplateImg = function (temp, tempUrl) {
            $scope.big_img_url = temp;
            $scope.view_image_url = $scope.big_img_url[0].url;
            $scope.view_image = true;
            $scope.temp_url = tempUrl;
        };

        $scope.showImg = function (img, row) {
            $scope.view_image_url = img.url;
            $scope.selectedRow = row;
        };

        $scope.closeShowImg = function (temp) {
            $scope.view_image = false;
        };

        $scope.dismissImport = function () {
            $('#importLibTemplateDlg').modal('hide');
        };

        $scope.importTemplate = function () {
            $scope.dismissImport();
        };

        $scope.closeSelf = function () {
            $scope.closeShowImg();
        };
    })
    iasSystemModule.controller('cashPositionManageCtrl', function ($scope, selectedObj, messageBox, cashRegulateReq,
        systemAdminData, user, systemAdminService) {
        $scope.cashRegulateObj = selectedObj.cashRegulateObj;

        $scope.accountSelect = function (selected) {
            if (selected) {
                $scope.cashRegulateObj.account_id = selected.originalObject.id;
                $scope.cashRegulateObj.manager_name = systemAdminService.getTransformObj(systemAdminData).getUserName(selected.originalObject.manager);
                $scope.cashRegulateObj.reset_date = selected.originalObject.create_time ? selected.originalObject.create_time.split(' ')[0] : '';
            } else {
                $scope.cashRegulateObj.account_id = null;
                $scope.cashRegulateObj.manager_name = null;
                $scope.cashRegulateObj.reset_date = '';
            }
        };

        $('#cashRegulateDlg').on('hidden.bs.modal', function () {
            $scope.$broadcast('angucomplete-alt:clearInput');
        });

        $scope.inputCheck = function () {
            if (!$scope.cashRegulateObj.account_id || $scope.cashRegulateObj.account_id === '') {
                messageBox.warn('账户选择不能为空');
                return false;
            }
            if (!$scope.cashRegulateObj.reset_date || $scope.cashRegulateObj.reset_date === '') {
                messageBox.warn('重置日期不能为空');
                return false;
            }
            if (!$scope.cashRegulateObj.daily_amount || $scope.cashRegulateObj.daily_amount === '') {
                messageBox.warn('头寸金额不能为空');
                return false;
            }
            return true;
        }

        $scope.confirm = function () {
            if (!$scope.inputCheck()) {
                return;
            }
            if ($scope.cashRegulateObj.isEdit) {
                cashRegulateReq.update({
                    company_id: user.company_id,
                    id: $scope.cashRegulateObj.id,
                    reset_date: $scope.cashRegulateObj.reset_date,
                    value: $scope.cashRegulateObj.daily_amount,
                    operator: user.id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var result = response.data;
                        if (result.success && result.msg) {
                            $.each(systemAdminData.cashPositionLog, function (index, cashPosition) {
                                if (cashPosition.id === result.msg.id) {
                                    if (systemAdminService.getTransformObj(systemAdminData).transform(result.msg)) {
                                        systemAdminData.cashPositionLog.splice(index, 1, result.msg);
                                    }
                                    return false;
                                }
                            });

                        } else {
                            messageBox.warn(result.msg);
                        }
                    } else {
                        messageBox.warn(result.msg);
                    }

                }, function failed() {
                    messageBox.error('更新失败！')
                })

            } else {
                cashRegulateReq.add({
                    company_id: user.company_id,
                    content: {
                        account_id: $scope.cashRegulateObj.account_id,
                        reset_date: $scope.cashRegulateObj.reset_date,
                        value: $scope.cashRegulateObj.daily_amount,
                        operator: user.id
                    }
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var result = response.data;
                        if (result.success && result.msg) {
                            if (systemAdminService.getTransformObj(systemAdminData).transform(result.msg)) {
                                systemAdminData.cashPositionLog.push(result.msg);
                            }
                        } else {
                            messageBox.warn(result.msg);
                        }
                    } else {
                        messageBox.warn(result.msg);
                    }
                }, function failed() {
                    messageBox.error('添加失败！');
                })
            }
            $scope.dismiss();
        };

        $scope.dismiss = function () {
            $('#cashRegulateDlg').modal('hide');
        }
    });
})(window.angular);



