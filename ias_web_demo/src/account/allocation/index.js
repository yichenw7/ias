import angular from 'angular';
import './assetDistributionPie';
import { IASMap } from '../../helper/IASMap';
import {
    getTreeColumn,
} from '../../helper/UIGrid';

angular.module('ias.account').controller('assetTableCtrl', function($scope, $filter, filterParam, assetAllocation, bondServerFilter,bondConstantKey,bondKeys,
                                           bondPositionFilter, marketFilter, bondFilterVar,accountCommon, user, winStatus,
                                           datetimePickerConfig, excelExport, authorityControl, accountConstant, messageBox,dateClass,
                                           hcMarketData, purchaseAnalysisByDate, purchaseAnalysis, AssetDistributionPie) {
    $scope.timePickerConfig = angular.merge({}, datetimePickerConfig, { endDate: dateClass.getFormatDate(new Date()) });
    $scope.displayTotal = function (type) {
        if (type == 'total') {
            return 'total-asset';
        }
    };
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        enableColumnResizing: true,
        multiSelect: false,
        showTreeRowHeader: false,
        columnDefs: [
            getTreeColumn(),
            { field: 'group_key', displayName: '', width: '100', enableSorting: false },
            { field: 'date', displayName: '日期' },
            { field: 'accum_amount_in', displayName: '累计已发规模(万)', cellFilter: 'commafyConvert' },
            { field: 'accum_amount_out', displayName: '累计已到期规模(万)', cellFilter: 'commafyConvert' },
            { field: 'amount', displayName: '存量资金(万)', cellFilter: 'commafyConvert' },
            { field: 'target_cost', displayName: '资金成本(%)', cellFilter: 'toFixed4' },
            { field: 'avg_ytm', displayName: '平均剩余期限(天)', cellFilter: 'ceilNum' }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows, codeBond) {
                renderalbeRows.forEach(function (row) {
                    if (row.entity.group_by) {
                        if($scope.dateOptions.model == row.entity.group_by) {
                            row.entity.$$treeLevel = 0;
                            row.visible = true;
                        } else {
                            // 必须把这两个属性删掉才可以正常隐藏
                            delete row.entity.$$treeLevel;
                            delete row.treeLevel;
                            row.visible = false;
                        }
                    } else if ($scope.query.isKeyDate) {
                        row.visible = Boolean(row.entity.is_key_date);
                    }
                });
                return renderalbeRows;
            }, 50);
            $scope.gridApi.grid.registerDataChangeCallback(function () {
                gridApi.treeBase.expandAllRows();
            });
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                gridApi.treeBase.toggleRowTreeState(row);
            });
        }
    };
    $scope.tableOptionGroup = [
        { label: '债券市值', value: 0, pieField: 'asset' },
        { label: '债券面值', value: 1, pieField: 'face_amount' },
    ];
    $scope.tableOption = {
        col: 0,
        handleChange: function() {
            var valueField = $scope.tableOptionGroup[$scope.tableOption.col].pieField
            AssetDistributionPie.draw('account', $scope, valueField);
            drawMap();
        }
    };

    function formatGridData(data){
        $.each(data, function(index, row){
            // if(row.group_by){
            //     row.$$treeLevel = 0;
            // }
            row.accum_amount_in && (row.accum_amount_in = row.accum_amount_in/10000);
            row.accum_amount_out && (row.accum_amount_out = row.accum_amount_out/10000);
            row.amount_in && (row.amount_in = row.amount_in/10000);
            row.amount_out && (row.amount_out = row.amount_out/10000);
            row.amount && (row.amount = row.amount/10000);
        });
        return data;
    }
    function formatData(data) {
        if (!data) return [];
        data.forEach(function(item) {
            item.percentage = $filter('toFixed2')(item.percentage);
            item.type = $filter('typeTranslate')(item.type);
        });
        return data;
    }
    function purchaseAnalysisByDateQuery(){
        purchaseAnalysisByDate.get({
            account_id: winStatus.cur_account_list[0],
            company_id: winStatus.cur_agent_company_id || user.company_id,
            start_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate,
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.purchaseFundData.term = data.term;
                $scope.purchaseFundData.ytm = data.ytm;
                $scope.purchaseFundData.customer = data.customer;
                $scope.purchaseFundData.channel = data.channel;
                $scope.purchaseFundData.week = data.week;
                $scope.purchaseFundData.month = data.month;
            }
        });
    }

    function drawMap() {
        var mapConfig = {
            dataProvider: {
                mapVar: AmCharts.maps.chinaLow,
                areas: [],
            },
        };
        $scope.province.forEach(function (province) {
            if (province.type !== '其他' && province.type !== 'total') {
                var area = {
                    id: IASMap.getProvinceId(province.type),
                    title: province.type,
                    value: $filter('toFixed2')($scope.tableOption.col === 0 ? province.asset : province.face_amount)
                }
                mapConfig.dataProvider.areas.push(area);
            }
        });
        IASMap.drawMap('allocationMap', mapConfig);
    }

    $scope.purchaseAnalysisQuery = function(){
        purchaseAnalysis.get({
            account_id: winStatus.cur_account_list[0],
            company_id: winStatus.cur_agent_company_id || user.company_id,
            start_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate,
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = formatGridData(response.data);
            }
        })
    }
    $scope.purchaseQuery = function () {
        purchaseAnalysisByDateQuery();
        $scope.purchaseAnalysisQuery();
    }

    $scope.query = {
        isKeyDate: false,
        change: function() {
            $scope.gridApi.grid.scrollToIfNecessary(0, 0);
            $scope.gridApi.grid.refresh();
        }
    };
    $scope.dateOptions = {
        list: [
            {label: '周', value: 'week'},
            {label: '月份', value: 'month'},
            {label: '季度', value: 'quarter'},
            {label: '年份', value: 'year'},
        ],
        model: 'month',
    };
    $scope.purchaseFundData = {term:[], ytm: [], customer: [], channel: []};
    $scope.selectedDate = {
        startDate: '',
        endDate: '',
        validate: function(){
            if(this.startDate >= this.endDate){
                var tempDate = this.startDate;
                this.startDate = this.endDate;
                this.endDate = tempDate;
            }
        },
        init: (function(){
            var firstDay = dateClass.getFormatDate(dateClass.getFirstDayOfYear(new Date()), 'yyyy-MM-dd');
            var today = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
            return function(){
                this.startDate = firstDay;
                this.endDate = today;
            }
        })(),
    };
    $scope.selectedDate.init();

    $scope.toPositionFilter = function(row) {
        bondPositionFilter.bklms = row.bklms;
        bondPositionFilter.type = row.type;

        winStatus.cur_main_tab = 'position';
        winStatus.cur_position_tab = 1;
        $scope.$emit("refresh account");
    };

    let curSubTabName = 'bond';
    $scope.handleBondSelected = function() {
        curSubTabName = 'bond';

        if (winStatus.cur_account_list.length === 0) return;

        assetAllocation.post({
            account_group_id: accountConstant.group_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            company_id: user.company_id,
            date: $scope.accountSelectedDate,
            include_ref_account: winStatus.refAccount.get() //TODO
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var assetData = response.data;
                $scope.assets = formatData(assetData.asset);
                $scope.bondType = formatData(assetData.bond_type);
                $scope.issuerRating = formatData(assetData.issuer_rating);
                $scope.isMunicipal = formatData(assetData.is_municipal);
                $scope.listedMarket = formatData(assetData.listed_market);
                $scope.cashEquivalents = formatData(assetData.ttm);
                $scope.acrossMarket = formatData(assetData.across_market);
                $scope.hasOption = formatData(assetData.has_option);
                $scope.sector = formatData(assetData.sector);
                $scope.rating = formatData(assetData.rating);
                $scope.province = formatData(assetData.province);
                AssetDistributionPie.draw('account', $scope, $scope.tableOptionGroup[$scope.tableOption.col].pieField);
                drawMap();
            }
        });
    };
    $scope.handlePurchaseSelected = function() {
        curSubTabName = 'purchase';

        $scope.purchaseQuery();
    };

    $scope.$on('allocation tab selected', function () {
        if (winStatus.cur_account_list.length === 0) return;
        $scope.selectedDate.init();

        switch(curSubTabName) {
            case 'bond':
                $scope.handleBondSelected();
                break;
            case 'purchase':
                $scope.handlePurchaseSelected();
                break;
            default:
                break;
        }
    });

    $scope.exportBondAllocation = function(){
        var date = $scope.accountSelectedDate || dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
        var hideLoad = function () {
            $('#loadShadeDiv').modal('hide');
        };
        var param = {
            company_id: user.company_id,
            account_group_id: accountConstant.group_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            account_or_group_name: winStatus.current_name,
            date: date,
            option: {
                hidden_cols: $scope.tableOption.col === 0 ? ['face_amount', 'face_percentage'] : ['asset', 'percentage'],
                asset_bond: hcMarketData.assetMarketData.asset_bond,
                asset_stock: hcMarketData.assetMarketData.asset_stock,
                agent_company_name: winStatus.cur_account.agent_company_name? winStatus.cur_account.agent_company_name : '',
            }
        };
        var errorFunc = function () {
            hideLoad();
            messageBox.error('资产分布导出失败！')
        };

        $('#loadShadeDiv').modal({backdrop: 'static', keyboard: false});
        var file_name = winStatus.current_name + '_资产分布表_' +  date.replace(/-/g,'') + '.xls';
        excelExport.request('asset_allocation', param, file_name, hideLoad, errorFunc);
    }

    $scope.exportPurchaseAllocation = function(){
        var param = {
            account_id: winStatus.cur_account_list[0],
            company_id: winStatus.cur_agent_company_id || user.company_id,
            account_or_group_name: winStatus.current_name,
            from_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate,
            group_by: $scope.dateOptions.model,
            is_key_date: Number($scope.query.isKeyDate)
        };
        var name = '申购存量分析' + $scope.selectedDate.startDate + '到' + $scope.selectedDate.endDate;
        var errorFunc = function () {
            messageBox.error('申购存量分析表导出失败！')
        };
        excelExport.request('purchase_analysis', param,  name + '.xls', null, errorFunc);
    };


    $scope.$on('$destroy', function () {
        AssetDistributionPie.clear('account');
        $scope = null;
    });
})
