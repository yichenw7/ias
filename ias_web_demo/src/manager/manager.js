let bondMarketGridScope = null;
window.repoMarketGridScope = null;
window.bondDealMarketGridScope = null;
window.reqQBBondMarketDataCallback = function(response) {
    if (!bondMarketGridScope) {
        bondMarketGridScope = angular.element($('#bondMarketGrid')).scope();
    }
    bondMarketGridScope.addGridData(response.bonds);
};

window.socketBondMarketDataCallback = function(response) {
    console.log('receive a bond quote message from qb');
    bondMarketGridScope.pushDataToGrid(response.bonds);
};
window.reqQBBondDealMarketDataCallback = function(response) {
    window.bondDealMarketGridScope.addGridData(response.list);
};
window.socketBondDealMarketDataCallback = function(response) {
    console.log('receive a bond deal message from qb');
    window.bondDealMarketGridScope.pushDataToGrid(response.list);
};

angular.module('ias.manager').factory('selectBondTask', function() {
    return {
        bond_key_listed_market: '',
        shortName: '',
        code: '',
    };
});
angular.module('ias.manager').factory('managerTaskTable', function(sortClass) {
    return {
        positionBondColumnDef: function() {
            let basicBondColumn = [
                { field: 'account_name', displayName: '账户名', width: '240' },
                { field: 'volume', displayName: '持仓量', minWidth: '120', cellFilter: 'thousandthNum' },
            ];
            return basicBondColumn;
        },
        pledgeBondColumnDef: function(isDeal) {
            let basicBondColumn = [
                { field: 'bond_code', displayName: '代码', width: '90', cellClass: 'tbody-special-font' },
                { field: 'short_name', displayName: '简称', width: '110', cellClass: 'tbody-special-font' },
                { field: 'issuer_rating', displayName: '评级', width: '70' },
                { field: 'rating_institution', displayName: '评级机构', width: '75' },
                { field: 'is_municipal', displayName: '是否城投', width: '75' },
                { field: 'enterprise_type', displayName: '企业类型', width: '75' },
                { field: 'val_clean_price', cellFilter: 'cdcAuthority', displayName: '中债净价', width: '75' },
                { field: 'bond_type', displayName: '类型', width: '70' },
            ];

            if (isDeal) {
                basicBondColumn.splice(2, 0, { field: 'pledge_volume', displayName: '质押量', width: '70', cellFilter: 'thousandthNum' });
                basicBondColumn.splice(3, 0, { field: 'pledge_price', displayName: '质押价格', width: '75' });
                basicBondColumn.splice(4, 0, { field: 'pledge_amount', displayName: '质押金额', width: '75', cellFilter: 'thousandthNum' });
                basicBondColumn.splice(5, 0, { field: 'pledge_face_amount', displayName: '质押面额', width: '75', cellFilter: 'thousandthNum' });
            } else {
                basicBondColumn.splice(2, 0, { field: 'inquiry_volume', displayName: '询价量', width: '75', cellFilter: 'thousandthNum' });
                basicBondColumn.splice(3, 0, { field: 'inquiry_volume', displayName: '询价面额', width: '75', cellFilter: 'inquiryFaceAmount' });
            }
            return basicBondColumn;
        },
    };
});
angular.module('ias.manager').controller('marketCtrl', function($scope, dataCenter, $filter) {
    // format qb bond market data
    let formatBond = function(bond, key) {
        bond.uid = key;
        let bklm = key.split('.')[0] + key.split('.')[1].substr(0, 3);
        bond.bond_key_listed_market = bklm;

        if (bond.BrokerId === '20') {
            console.log('get exchange market data: ' + bond);
        }
        // 收益率
        if (bond.TknCleanPrice && bond.TknCleanPrice < 50) {
            delete bond.TknCleanPrice;
        }
        // 量
        if (!bond.BuyVolume || bond.BuyVolume == 0) {
            bond.BuyVolume = '--';
        }
        if (!bond.SellVolume || bond.SellVolume == 0) {
            bond.SellVolume = '--';
        }
        // 评级
        bond.rating = $filter('bondRating')(bond);

        // 持仓
        if (dataCenter.account.positionBondMap.hasOwnProperty(bklm)) {
            bond.positions = dataCenter.account.positionBondMap[bklm];
        }
    };
    $scope.addMarketData = function(marketData) {
        $.each(marketData, function(key, bondPrice) {
            if (bondPrice.hasOwnProperty('BondCode')) {
                formatBond(bondPrice, key);
                dataCenter.market.bond.push(bondPrice);
            }
        });
    };

    $scope.replaceMarketData = function(marketData) {
        $.each(marketData, function(key, bond) {
            let find = false;
            $.each(dataCenter.market.bond, function(index, bondPrice) {
                if (bondPrice.uid === key) {
                    formatBond(bond, key);
                    dataCenter.market.bond.splice(index, 1, bond);
                    find = true;
                    return false;
                }
            });
            if (!find) {
                formatBond(bond, key);
                dataCenter.market.bond.push(bond);
            }
        });
    };

    $scope.addDealMarketData = function(marketData) {
        $.each(marketData, function(index, deal) {
            if (deal.hasOwnProperty('combkey')) {
                let key = deal.combkey;
                let bklm = key.split('.')[0] + key.split('.')[1].substr(0, 3);
                deal.bond_key_listed_market = bklm;
                deal.update = $filter('date')(new Date(deal.update * 1000), 'HH:mm:ss');

                // 持仓
                if (dataCenter.account.positionBondMap.hasOwnProperty(bklm)) {
                    deal.positions = dataCenter.account.positionBondMap[bklm];
                }
                dataCenter.market.deal.push(deal);
            }
        });
    };

    $scope.$on('changeTab', function(event, index) {
        $scope.$broadcast('toggleClick', index);
    });
    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.manager').controller('bondDataCtrl', function($scope, bondClientFilter, marketTable, uiGridConstants, dataCenter,
                                          selectBondTask, marketFilter, selectedTask, $filter, gridColumn, loadTaskData) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFiltering: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        columnDefs: marketTable.bondColumnDef(true),
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(marketFilter.bondFilter, 200);
        },
    };
    $scope.gridOptions.data = dataCenter.market.bond;

    // 新增债券
    $scope.addGridData = function(marketData) {
        if (marketData) {
            $scope.addMarketData(marketData);
            $scope.gridApi.grid.refresh();

            // 建立二级推送连接,最新全量
            loadTaskData.registerBondMarketData(true);
        }
    };
    // 行情推送
    $scope.pushDataToGrid = function(marketData) {
        if (marketData) {
            $scope.replaceMarketData(marketData);
            $scope.gridApi.grid.refresh();
        }
    };

    $scope.$on('refresh market data', function() {
        $scope.gridOptions.data = dataCenter.market.bond;
    });

    // 银行间显示收益率，交易所显示到期、行权收益率
    $scope.$watch(
        function() {
            return bondClientFilter.marketType;
        },
        function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }

            gridColumn.setYieldVisible(bondClientFilter.marketType, $scope.gridOptions.columnDefs);
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        }
    );

    // 搜索债券后经纪商不显示
    $scope.$watch(
        function() {
            return bondClientFilter.searchKey;
        },
        function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }

            gridColumn.setCompanyVisible($scope.gridOptions.columnDefs);
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        }
    );
    // 右侧筛选页面
    $scope.$watchCollection(
        function() {
            return bondClientFilter;
        },
        function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            $scope.gridApi.grid.refresh();
        }
    );

    // task筛选
    $scope.$watch(
        function() {
            return selectedTask.bond.bond_key_listed_market;
        },
        function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            gridColumn.setCompanyVisible($scope.gridOptions.columnDefs);
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            $scope.gridApi.grid.refresh();
        }
    );

    $scope.addTaskInBondMarket = function(key, $event) {
        selectBondTask.bond_key_listed_market = key;
        selectBondTask.code = $filter('codeBond')(key);
        selectBondTask.shortName = $filter('shortNameBond')(key);
        $('#pushTaskTypeWin').modal('toggle');
        $event.stopPropagation();
    };

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
angular.module('ias.manager').controller('dealDataCtrl', function($scope, marketTable, dealClientFilter, marketFilter, bondDealMarket,
                                          gridColumn, uiGridConstants, marketDataClass, dataCenter) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFiltering: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        columnDefs: marketTable.dealColumnDef(true),
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(marketFilter.dealFilter, 200);
        },
    };
    $scope.setDataSource = function() {
        if (bondDealMarket.type == 'interBank') {
            $scope.gridOptions.data = dataCenter.market.deal;
        } else if (bondDealMarket.type == 'exchange') {
            $scope.gridOptions.data = dataCenter.market.exchangeDeal;
        }
    };
    $scope.gridOptions.data = dataCenter.market.deal;

    $scope.$on('refresh market data', function() {
        $scope.setDataSource();
    });

    // 市场type
    $scope.$watch(
        function() {
            return bondDealMarket.type;
        },
        function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            gridColumn.setYieldVisible(bondDealMarket.type, $scope.gridOptions.columnDefs);
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            $scope.setDataSource();
            $scope.gridApi.grid.refresh();
        }
    );

    // 右侧筛选页面
    $scope.$watchCollection(
        function() {
            return dealClientFilter;
        },
        function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            $scope.gridApi.grid.refresh();
        }
    );

    $scope.$on('$destroy', function() {
        $scope = null;
    });
});
