import './manager.module';

import './marketGrid';
import './manager';

angular.module('ias.manager').factory('selectTab', function() {
    return {
        index: 1,
        expanded: false,
    };
});
angular.module('ias.manager').controller('manageCtrl', function($rootScope, $scope,
    user, managerTaskTable, $filter, messageBox, dataCenter, socketServer, socketData, selectTab,
    marketSocketSwitch, loadTaskData, authorityControl, scheduleTask, loadPageData, marketDataClass, managerTaskData) {
    $scope.activeTabName = 'bond';

    // 右侧筛选页面控制
    // TODO: remove next.
    $scope.selectTab = selectTab;
    $scope.filterSetting = function() {
        if (selectTab.expanded) {
            $('#panelStyle').text('#setSection {width:0%!important}' +
                '#setSectionDiv {display:none!important}' +
                '#dataSection {}' +
                '.filter-btn-adapt {}'); // filter-btn-adapt 代表随着筛选按钮自适应的class
        } else {
            $('#panelStyle').text('#setSection {width:20%!important}' +
                '#setSectionDiv {display:block!important}' +
                '#dataSection {width:80%!important}');
        }
        selectTab.expanded = !selectTab.expanded;
    };

    $scope.marketTabSelect = function(index, tabName) {
        if (selectTab.expanded) {
            selectTab.expanded = tabName === 'repo';
            $scope.filterSetting();
        }

        selectTab.index = index;
        $scope.activeTabName = tabName;
    };

    if (user.errorMsg != null) {
        messageBox.error(user.errorMsg);
    }

    // 每天早上06:00 清理行情数据
    scheduleTask.dailyTask(6, 0, 0, loadPageData.refreshMarket, function() {
        $scope.$broadcast('refresh market data');
    });

    let bondTempData = [];
    let dealTempData = [];
    // 行情开关
    $scope.$watch(
        function() {
            return marketSocketSwitch.on;
        },
        function(newValue, oldValue) {
            if (newValue) {
                socketData.bondMarket(bondTempData, false);
                socketData.dealMarket(dealTempData, false);

                bondTempData = [];
                dealTempData = [];
            }
        }
    );

    $.each(dataCenter.authority.broker, function(index, broker) {
        if (broker != null) {
            // 二级行情全量
            socketServer.joinBrokerRoom('/best_quote', broker);
            // 成交行情
            socketServer.joinBrokerRoom('/single_deal', broker);
        }
    });

    // 二级：行情全量
    socketServer.on('/best_quote', 'best quote event', function(data) {
        if (marketSocketSwitch.on) {
            socketData.bondMarket(data, true);
        } else {
            $.each(data, function(index, bond) {
                if (dataCenter.market.marketBondMap.hasOwnProperty(bond.bond_key_listed_market)) {
                    bondTempData.push(bond);
                }
            });
        }
    });

    // 二级成交：银行间行情
    socketServer.on('/single_deal', 'single deal event', function(data) {
        if (marketSocketSwitch.on) {
            socketData.dealMarket(data, true);
        } else {
            $.each(data.deal_list, function(index, deal) {
                if (dataCenter.market.marketBondMap.hasOwnProperty(deal.bond_key_listed_market)) {
                    deal.action = data.action;
                    dealTempData.push(deal);
                }
            });
        }

        let updateList = marketDataClass.updateCurrentDealMap(data, 'interBank');
        marketDataClass.updateDealProperty(updateList, managerTaskData.bond);
        marketDataClass.updateDealProperty(updateList, managerTaskData.study);
    });

    // 二级成交：交易所行情
    socketServer.on('/exchange_deal', 'exchange deal event', function(data) {
        if (marketSocketSwitch.on) {
            socketData.exchangeDealMarket(data, true);
        } else {
            $.each(data.deal_list, function(index, deal) {
                if (dataCenter.market.marketBondMap.hasOwnProperty(deal.bond_key_listed_market)) {
                    deal.action = data.action;
                }
            });
        }

        let updateList = marketDataClass.updateCurrentDealMap(data, 'exchange');
        marketDataClass.updateDealProperty(updateList, managerTaskData.bond);
        marketDataClass.updateDealProperty(updateList, managerTaskData.study);
    });

    // 持仓
    socketServer.join('/account', user.company_id);
    socketServer.joinAgentCompany();

    socketServer.on('/account', 'account event', function(data) {
        socketData.accountPosition(data, $scope.activeTabName);
        loadTaskData.updateAccountsData(data);
    });

    socketServer.on('/account', 'user account authority event', function(data) {
        if (data.hasOwnProperty('account_id') && authorityControl.notSelfAccount(data.account_id)) {
            socketData.accountAuthority(data, $scope.activeTabName);
        }
    });

    socketServer.on('/account', 'agent account authority event', function(data) {
        if (data.hasOwnProperty('user_id') && data.user_id == user.id) {
            socketData.agentAccountAuthority(data, $scope.activeTabName);
        }
    });

    $scope.searchBoxIndexs = [1, 2];
    $scope.interBankExchangeIndex = [1, 2];

    // 质押券
    $scope.gridOptions = {
        selectionRowHeaderWidth: 25,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        showTreeExpandNoChildren: true,
        columnDefs: managerTaskTable.pledgeBondColumnDef(),
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;

            $scope.gridApi.grid.registerDataChangeCallback(function() {
                $scope.gridApi.selection.selectAllRows();
            });
        },
    };
    $scope.gridOptions.data = [];

    // 成交质押
    $scope.dealGridOptions = {
        selectionRowHeaderWidth: 25,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        showTreeExpandNoChildren: true,
        columnDefs: managerTaskTable.pledgeBondColumnDef(true),
        onRegisterApi: function(gridApi) {
            $scope.dealGridApi = gridApi;

            $scope.dealGridApi.grid.registerDataChangeCallback(function() {
                $scope.dealGridApi.selection.selectAllRows();
            });
        },
    };
    $scope.dealGridOptions.data = [];

    $scope.$watchCollection(
        function() {
            return dataCenter.pledgeBondList;
        },
        function() {
            $scope.gridOptions.data = dataCenter.pledgeBondList;
            $scope.dealGridOptions.data = dataCenter.pledgeBondList;
        }
    );

    // 持仓信息
    $scope.positionGridOptions = {
        selectionRowHeaderWidth: 25,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        showTreeExpandNoChildren: true,
        columnDefs: managerTaskTable.positionBondColumnDef(),
        onRegisterApi: function(gridApi) {
            $scope.positionGridApi = gridApi;
        },
    };
    $scope.positionGridOptions.data = [];
    // 显示持仓列表
    $scope.showPositionBonds = function(list) {
        $scope.positionGridOptions.data = list;
    };

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
