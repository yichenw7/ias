import {
    interbankColumnDef,
    exchangeColumnDef,
} from './availableBonds.helper';

angular.module('ias.account').controller('availableBondsPositionCtrl', function ($scope, accountTable, authorityControl,
                                                                  filterParam, winStatus, user, $filter, accountConstant, dateClass,
                                                                  datetimePickerConfig, groupAvailableBondPositions,
                                                                  normalizedBondsPos, marketFilter, bondClientFilter) {
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        rowTemplate: accountTable.getRowTemplate('positionRowTemplate'),
        exporterFieldCallback: function (grid, row, col, value) {
            if ($scope.interbankIsSelected) {
                if (col.name == 'account_name') {
                    return value + '\t';
                } else if (col.name == 'bond_code') {
                    if (value) {
                        return value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
                    }
                } else if (col.name == 'position_volume' || col.name == 'available_volume' || col.name == 'buyout_in_volume'
                           || col.name == 'buyout_out_volume' || col.name == 'pledge_out_volume') {
                    return $filter('thousandthNum')($filter('toWanYuan')(value));
                } else {
                    return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
                }
            } else {
                if (col.name == 'normalized_bond_available_volume' || col.name == 'normalized_bond_volume') {
                    return $filter('columnNullValue')($filter('thousandthNum')(value));
                } else if (col.name == 'account_name') {
                    return value + '\t';
                } else {
                    return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
                }
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(marketFilter.accountBondFilter, 200);
        }
    };

    $scope.timePickerConfig = datetimePickerConfig;
    $scope.getAccountDate = function () {
        $scope.inquiry_date = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
    };

    function calcSummary(data) {
        var total = {
            bond_code: '库存总计',
            short_name: '共 ' + data.length + ' 只债券',
            available_volume: 0,
            self_volume: 0,
            other_volume: 0,
            position_volume: 0,
            buyout_out_volume: 0,
            buyout_in_volume: 0,
            pledge_out_volume: 0,
            pledge_in_volume: 0,
            normalized_bond_available_volume: 0,
            normalized_bond_volume: 0,
            protocol_pledge_out_volume: 0,
            exchange_pledge_out_volume: 0,
            conversion_factor: '\t',
            account_name: '\t',
            issuer_rating_current: '\t',
        };
        data.forEach(function (availableBond) {
            total.available_volume += (availableBond.available_volume || 0);
            total.self_volume += (availableBond.self_volume || 0);
            total.other_volume += (availableBond.other_volume || 0);
            total.position_volume += (availableBond.position_volume || 0);
            total.buyout_out_volume += (availableBond.buyout_out_volume || 0);
            total.buyout_in_volume += (availableBond.buyout_in_volume || 0);
            total.pledge_out_volume += (availableBond.pledge_out_volume || 0);
            total.pledge_in_volume += (availableBond.pledge_in_volume || 0);
            total.exchange_pledge_out_volume += (availableBond.exchange_pledge_out_volume || 0);
            total.normalized_bond_available_volume += (availableBond.normalized_bond_available_volume || 0);
            total.normalized_bond_volume += (availableBond.normalized_bond_volume || 0);
            total.protocol_pledge_out_volume += (availableBond.protocol_pledge_out_volume || 0);
            availableBond.bond_code = $filter('codeBond')(availableBond.bond_key_listed_market);
            availableBond.short_name = $filter('shortNameBond')(availableBond.bond_key_listed_market);
        });
        data.unshift(total);
        $scope.total_available_volume = total.available_volume ;
        $scope.total_normalized_bond_available_volume = total.normalized_bond_available_volume;
        $scope.total_normalized_bond_volume = total.normalized_bond_volume;
        return data;
    }
    function filterTrust(data) {
        for (var i = 0; i < data.length; i++) {
            var isInterBankTrust = $scope.interbankIsSelected && data[i].trust !== $scope.interbankMarket;
            var isExchangeTrust = !$scope.interbankIsSelected && data[i].trust !== $scope.exchangeMarket;
            if (isInterBankTrust || isExchangeTrust) {
                data.splice(i, 1);
                i--;
            }
        }
    }

    $scope.handleBondSelected = function(selected) {
        bondClientFilter.searchKey = selected ? selected.originalObject.bond_id : '';
        $scope.gridApi.grid.refresh();
    };
    function initial(loco) {
        if (winStatus.cur_account_list.length === 0) return;

        if (!$scope.inquiry_date) return;
        groupAvailableBondPositions.post({
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            mkt: loco,
            date: $scope.inquiry_date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.allMarketData = data;
                $scope.toColumn($scope.allMarketData);
            }
        }, function failed() {
            $scope.gridOptions.data = [];
        })

        if (!$scope.interbankIsSelected) {
            normalizedBondsPos.post({
                account_group_id: accountConstant.group_id,
                company_id: user.company_id,
                account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
                date: $scope.inquiry_date
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    $scope.allNormalizedBondsData = data;
                    $scope.formate($scope.allNormalizedBondsData);
                }
            });
        }
    }
    $scope.toColumn = function (allMarketData) {
        var cloneMarketData = allMarketData.slice(0);
        var isInterbankMarket = $scope.interbankIsSelected && $scope.interbankMarket !== 'all';
        var isExchangeMarket = !$scope.interbankIsSelected && $scope.exchangeMarket !== 'all';
        if (isInterbankMarket || isExchangeMarket) {
            filterTrust(cloneMarketData);
        }
        calcSummary(cloneMarketData);
        $scope.gridOptions.data = cloneMarketData;
    }
    $scope.formate = function (data) {
        var mkt = $scope.exchangeMarket.toUpperCase();
        $scope.volume_available = data[mkt].volume_available;
        $scope.volume = data[mkt].volume;
        $scope.volume_occupied = data[mkt].volume_occupied;
        $scope.occupiedData = data[mkt].occupied;
    }

    $scope.init = function () {
        $scope.gridOptions.data = [];
        $scope.gridOptions.columnDefs = $scope.interbankIsSelected ? interbankColumnDef() : exchangeColumnDef();
        initial($scope.interbankIsSelected ? 'interbank' : 'exchange');
    };

    $scope.interbankSelect = function () {
        $scope.interbankIsSelected = true;
        $scope.init();
    };
    $scope.exchangeSelect = function () {
        $scope.interbankIsSelected = false;
        $scope.init();
    };

    $scope.onExportData = function () {
        if ($scope.interbankIsSelected) {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_银行间_可用券_', $scope.inquiry_date);
        } else {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_交易所_可用券_', $scope.inquiry_date);
        }
        $scope.exportExcel($scope.gridApi.exporter);
    };

    // function getInterbank() {
    //     $scope.gridOptions.data = [];
    //     $scope.gridOptions.columnDefs = interbankColumnDef();
    //     initial('interbank');
    // }

    // function getExchange() {
    //     $scope.gridOptions.data = [];
    //     $scope.gridOptions.columnDefs = exchangeColumnDef();
    //     initial('exchange');
    // }

    // $scope.$on("dealInput-confirm", function () {
    //     if (dealPage.fee != selectTypes.dealInput) {
    //         return;
    //     }

    //     if (!$scope.checkInput()) {
    //         return;
    //     }
    //     $scope.init();
    // });

    this.$onInit = function() {
        $scope.interbankIsSelected = true;
        $scope.init();
    };

    $scope.$on("refresh account", function () {
        $scope.init();
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    });
});