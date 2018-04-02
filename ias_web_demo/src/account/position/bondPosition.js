import {
    positionColumnDef,
} from './position.helper';
import { getLevelClass } from './../../helper/UIGrid';


angular.module('ias.account').factory('bondPositionFilter', function() {
    return {
        searchKey: '',
        bklms: [],
        type: '',
    }
})
angular.module('ias.account').controller('bondCtrl', function ($scope, accountTable, positionQuery, filterParam, winStatus, dataCenter, user, positionsQuery,
                                                hcMarketData, marketFilter, bondPositionFilter, $timeout, $filter, GridConfigService,
                                                authorityControl, accountConstant) {
    $scope.bondPositionFilter = bondPositionFilter;
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        enableColumnResizing: true,
        exporterSuppressColumns: ['action'],
        exporterOlderExcelCompatibility: true,
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'bond_code') {
                if (value) {
                    return value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
                }
            } else if (col.name == 'days_to_next_coupon'){
                return $filter('toNotApplicable')(value);
            } else {
                return (col.cellFilter) ? $scope.$eval(value + '|' + col.cellFilter) : value;
            }
        },
        showTreeRowHeader: false,
        multiSelect: false,
        rowTemplate: accountTable.getRowTemplate('positionRowTemplate'),
        columnFunc: positionColumnDef,
        columnDefs: positionColumnDef(),
        columnTypes: ['基础信息', '市值信息', '评级及久期', '含权信息', '损益'],
        savePinning: false,
        saveOrder: false,
        saveScroll: false,
        saveFocus: false,
        saveSort: false,
        saveFilter: false,
        saveSelection: false,
        saveGrouping: false,
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(function(renderalbeRows) {
                if (!bondPositionFilter.searchKey && bondPositionFilter.bklms.length === 0) {
                    return renderalbeRows;
                }
                renderalbeRows.forEach(function (row) {
                    // 最后一行
                    if (!angular.isDefined(row.entity.bond_key_listed_market)) {
                        row.visible = false;
                        return true;
                    }

                    //搜索框筛选
                    if (bondPositionFilter.searchKey != null && bondPositionFilter.searchKey != "") {
                        if (row.entity.bond_code == null || (row.entity.bond_code != null && (row.entity.bond_code).indexOf(bondPositionFilter.searchKey) == -1)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //server
                    if (bondPositionFilter.bklms.length > 0 && $.inArray(row.entity.bond_key_listed_market, bondPositionFilter.bklms) == -1) {
                        row.visible = false;
                        return true;
                    }
                });
                return renderalbeRows;
            }, 200);
            $scope.gridApi.grid.registerDataChangeCallback($scope.gridApi.treeBase.expandAllRows, ['row']);
            $scope.gridApi.grid.registerDataChangeCallback(function() {
                GridConfigService.post('position_bond');
            }, ['column']);
            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row,event) {
                // 债券仓位追踪
                if(row.entity.bond_code && row.treeNode.children.length === 0) {
                    $('.traceBond').modal('show');
                    $scope.$broadcast("bondBroadcast", row.entity);
                }
                $scope.gridApi.treeBase.toggleRowTreeState(row);
            });
        }
    };

    $scope.onExportData = function () {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_债券_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };
    $scope.bondSelectFun = function (selected) {
        bondPositionFilter.searchKey = selected ? selected.originalObject.bond_id : '';
    };

    $scope.setCodeNameStyle = function (row) {
        if (row.entity.is_transact_data != undefined) {
            return 'hideColumn';
        }
        return 'code-name-color';
    };

    function callback(firstFilter, secondFilter, positionData) {
        var bond_list = [];
        function _initRowClass() {
            const firstColumn = $scope.gridOptions.columnDefs.find(column => column.field === 'first_val')
            const secondColumn = $scope.gridOptions.columnDefs.find(column => column.field === 'second_val')
            //一二级分类条件都有
            if (firstFilter && secondFilter) {
                firstColumn.visible = true;
                secondColumn.visible = true;
            }
            //只有一级分类条件
            if (firstFilter && !secondFilter) {
                firstColumn.visible = true;
                secondColumn.visible = false;
            }
            if (!firstFilter && !secondFilter) {
                firstColumn.visible = false;
                secondColumn.visible = false;
            }
        }
        $.each(positionData, function (index, row) {
            if (row.hasOwnProperty('first_val') && !row.hasOwnProperty('second_val')) {
                row.$$treeLevel = 0;
            } else if (row.hasOwnProperty('first_val') && row.hasOwnProperty('second_val')) {
                row.$$treeLevel = 1;
            } else if (!row.hasOwnProperty('bond_key_listed_market')) {
                // 最后一行
                row.$$treeLevel = -1;
                return;
            } else {
                // 债券
                if (firstFilter != undefined && secondFilter == undefined) {
                    row.$$treeLevel = 1;
                } else if (firstFilter != undefined && secondFilter != undefined) {
                    row.$$treeLevel = 2;
                }
            }

            var position = {};
            var bond_key_listed_market = row.bond_key_listed_market;
            position['bond_id'] = row.bond_code;
            position['short_name'] = row.bond_short_name;
            position['bond_key_listed_market'] = bond_key_listed_market;
            position['pin_yin'] = angular.isDefined(dataCenter.market.bondDetailMap[bond_key_listed_market]) ? dataCenter.market.bondDetailMap[bond_key_listed_market].pin_yin : null;
            bond_list.push(position);
        });

        $scope.bondList = bond_list;
        _initRowClass();

        $scope.gridOptions.data = positionData;
    }

    const bondTypeFilter = {
        first: undefined,
        second: undefined
    }

    function initData() {
        if (winStatus.cur_account_list.length === 0) return;

        if (winStatus.cur_account_list.length === 1) {
            bondTypeFilter.first = filterParam.first_filter && filterParam.first_filter.val;
            bondTypeFilter.second = filterParam.second_filter && filterParam.second_filter.val;

            positionQuery.get({
                account_id: filterParam.account_id,
                company_id: $scope.getCompanyId(filterParam.account_id),
                first_group_by: bondTypeFilter.first,
                second_group_by: filterParam.second_filter && filterParam.second_filter.val,
                date: $scope.accountSelectedDate,
                include_ref_account: winStatus.refAccount.get()
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    callback(bondTypeFilter.first, bondTypeFilter.second, response.data);
                }
            });
        }
        if (winStatus.cur_account_list.length > 1) {
            bondTypeFilter.first = filterParam.typeOption1 && filterParam.typeOption1.val;
            bondTypeFilter.second = filterParam.typeOption2 && filterParam.typeOption2.val;

            positionsQuery.post({
                account_group_id: accountConstant.group_id,
                company_id: user.company_id,
                first_group_by: bondTypeFilter.first,
                second_group_by: bondTypeFilter.second,
                account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
                show_type: 'combine',
                date: $scope.accountSelectedDate
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    callback(bondTypeFilter.first, bondTypeFilter.second, response.data);
                }
            });
        }
    }
    $scope.getClassFunc = function (row, column) {
        const maxTreeLevel = bondTypeFilter.second ? 2 : 1;
        return getLevelClass(row, column, maxTreeLevel);
    }

    $scope.clearBondFilter = function() {
        bondPositionFilter.type = "";
        bondPositionFilter.bklms = [];
    }

    $scope.$watchCollection(
        function () {
            return bondPositionFilter;
        },
        function (newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            if (winStatus.cur_main_tab == 'position' && winStatus.cur_position_tab == 1) {
                $scope.gridApi.grid.refresh();
            }
        }
    );

    initData();
    GridConfigService.init($scope, 'position_bond');

    $scope.$on('bond tab clicked', function () {
        initData();
    });
});
angular.module('ias.account').controller('portfolioAnalyseCtrl', function ($scope, winStatus, accountConstant, hcMarketData, accountGroupSummary,
    positionsQuery, bondPositionFilter, $filter, portfolioTable, distinguishGroupName, messageBox,
    user, accountService, filterParam, authorityControl, authorityConstant) {

    $scope.bondPositionFilter = bondPositionFilter;
    $scope.curDisplayType = 'proportion';

    $scope.getDisplayType = function (type) {
        $scope.curDisplayType = type;
    };

    $scope.displaySubIcon = function (bond) {
        if (bond.second_val == undefined) {
            return '';
        }
        if (bond.sub_closed) {
            return 'glyphicon glyphicon-plus';
        } else {
            return 'glyphicon glyphicon-minus';
        }
    };
    $scope.displayIcon = function (bond) {
        if (bond.first_val == undefined || bond.second_val != undefined) {
            return '';
        }
        if (bond.closed) {
            return 'glyphicon glyphicon-plus';
        } else {
            return 'glyphicon glyphicon-minus';
        }
    };
    $scope.displayType = 'proportion';
    $scope.displayTypes = [
        { label: '显示比重(%)', value: 'proportion' },
        { label: '显示数量', value: 'volume' },
        { label: '显示占发行比(%)', value: 'issue_rate' },
        { label: '显示可用数量', value: 'available_volume' },
        { label: '显示持仓面额', value: 'face_amount' }
    ];
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFiltering: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterSuppressColumns: [],
        exporterOlderExcelCompatibility: true,
        columnDefs: portfolioTable.transactColumnDef(false),
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };
    $scope.showPledgeBonds = function (data) {
        $scope.gridOptions.data.length = 0;
        for (var i in data) {
            $scope.gridOptions.data.push(data[i]);
        }
    };

    $scope.gridData = {
        rowData: [], //实际数据
        renderData: [], //grid界面渲染数据
        visibleRow: [],
        selectedIndex: null, //选中行序号
        rangeSet: [],// 当前显示的区间集合,
        state: {
            index: 0,
            positionFlags: [],
            style: {
                'height': '',
                'padding-top': '',
            },
            startIndex: 0,
            endIndex: 32
        }
    };
    $scope.summaryData = {
        asset_net: [],
        cash_t_0: [],
        cash_t_1: [],
        bond_to_net: [],
        repo_to_net: [],
        duration: [],
        account_name: [],
        total_to_net: [],
        yield_total: []
    };
    $scope.unitList = [
        { val: 1, name: '元', text: '' },
        { val: 10000, name: '万元', text: '万' },
        {
            val: 100000000, name: '亿元', text: '亿'
        }];

    $scope.displayUnit = { index: $scope.unitList[0] };

    $scope.refresh = function () {
        var num = $scope.gridData.state.endIndex - $scope.gridData.renderData.length > 0 ?
            $scope.gridData.state.endIndex - $scope.gridData.renderData.length : 0;

        $scope.gridData.state.style['padding-top'] = $scope.gridData.state.index * 320 - num * 32 + 'px';
        $scope.gridData.visibleRow.length = 0;
        $.each($scope.gridData.renderData, function (index, value) {
            if (index >= $scope.gridData.state.startIndex - num && index < $scope.gridData.state.endIndex - num) {
                $scope.gridData.visibleRow.push(value);
            }
        });
    };
    $scope.sheetOnScroll = function (target1, target2) {
        $(target2).off('scroll').on('scroll', function (event) {
            $(target1)[0].scrollTop = $(target2)[0].scrollTop;
            if ($scope.gridData.state.index != parseInt($(target2)[0].scrollTop / 320)) {
                $scope.gridData.state.index = parseInt($(target2)[0].scrollTop / 320);
                $scope.gridData.state.startIndex = parseInt($(target2)[0].scrollTop / 320) * 10;
                $scope.gridData.state.endIndex = $scope.gridData.state.startIndex + 30;
                $scope.$apply($scope.refresh);
            }
        });
    };
    $scope.sheetInit = function () {
        $scope.sheetOnScroll('#portfolioLeft', '#portfolioRight');
        $scope.onMousewheel('#portfolioLeft', '#portfolioRight');
        $scope.onMousewheel('#portfolioRight', '#portfolioLeft')
    }

    function init() {
        // 只在多账户加载数据
        if (winStatus.cur_account_list.length < 2) return;
        var _loadingOver = [false, false]; //记录加载进程的参数
        function _hideLoadShade() {
            if (_loadingOver[0] && _loadingOver[1]) {
                $('#loadShadeDiv').modal('hide');
            }
        }

        function _resetSummaryData(marketSumData) {
            $scope.summaryData.asset_net.length = 0;//净资产
            $scope.summaryData.cash_t_0.length = 0;
            $scope.summaryData.cash_t_1.length = 0;
            $scope.summaryData.bond_to_net.length = 0;
            $scope.summaryData.repo_to_net.length = 0;
            $scope.summaryData.duration.length = 0;
            $scope.summaryData.account_name.length = 0;
            $scope.summaryData.total_to_net.length = 0;
            $scope.summaryData.yield_total.length = 0;
            jQuery.each(marketSumData, function (i, v) {
                var tempObj = {};
                tempObj.account_id = v.account_id;
                tempObj.note = v.note;
                tempObj.account_name = v.account_name;
                tempObj.account_note = v.account_note;
                $scope.summaryData.account_name.push(tempObj);
                $scope.summaryData.asset_net.push(v.asset_net);
                $scope.summaryData.cash_t_0.push(v.cash_t_0);
                $scope.summaryData.cash_t_1.push(v.cash_t_1);
                $scope.summaryData.bond_to_net.push(v.bond_to_net);
                $scope.summaryData.repo_to_net.push(v.repo_to_net);
                $scope.summaryData.duration.push(v.duration);
                $scope.summaryData.total_to_net.push(v.total_to_net);
                $scope.summaryData.yield_total.push(v.yield_total);
            });
        }

        function _resetPositionData(positionData) {
            $scope.gridData.state.positionFlags.length = 0;
            $scope.gridData.state.positionFlags.push(-1);
            $scope.gridData.state.positionFlags.push(-1);
            $scope.gridData.rowData.length = 0;
            //赋值
            jQuery.each(positionData, function (i, v) {
                var tempObj = {
                    listData: {
                        volume: [],
                        issue_rate: [],
                        available_volume: [],
                        proportion: [],
                        face_amount: [],
                        buy_list: []
                    }
                };
                if (v.first_val && (!v.second_val)) tempObj.first_val = v.first_val;
                if (v.second_val) tempObj.second_val = v.second_val;
                //非分类相关汇总数据
                if (!v.second_val && !v.first_val) {
                    tempObj.bond_code = v.bond_code;
                    tempObj.bond_short_name = v.short_name;
                    tempObj.val_yield_t_minus_2 = v.val_yield_t_minus_2;
                    tempObj.val_yield_t_minus_1 = v.val_yield_t_minus_1;
                    tempObj.time_to_maturity = v.time_to_maturity;
                    tempObj.maturity_date = v.maturity_date;
                    tempObj.days_to_maturity = v.days_to_maturity;
                    tempObj.bond_rating = v.bond_rating;
                    tempObj.issuer_rating = v.issuer_rating;
                    tempObj.is_option_embedded = v.is_option_embedded;
                    tempObj.has_option = v.has_option;
                    tempObj.valuation_yield = v.valuation_yield;
                    tempObj.val_clean_price = v.val_clean_price;
                    tempObj.volume = v.volume;
                    tempObj.available_volume = v.available_volume;
                }
                jQuery.each(winStatus.cur_account_list, function (index, value) {
                    if (accountService.getAccountById(value)) {
                        tempObj.listData.volume.push(v.volume[value]);
                        tempObj.listData.available_volume.push(v.available_volume[value]);
                        tempObj.listData.proportion.push(v.proportion[value]);
                        tempObj.listData.face_amount.push(v.face_amount[value]);
                        if (v.buy_list) tempObj.listData.buy_list.push(v.buy_list[value]);
                    }
                });
                tempObj.bond_key_listed_market = v.bond_key_listed_market;
                tempObj.listData.volume.unshift(v.volume.total);
                tempObj.listData.available_volume.unshift(v.available_volume.total);
                tempObj.listData.proportion.unshift(v.proportion.total);
                tempObj.listData.face_amount.unshift(v.face_amount.total);
                $.each(tempObj.listData.volume, function (index, value) {
                    var numVal = parseInt(value.replace(/,/g, ""));
                    tempObj.listData.issue_rate.push(v.issue_amount && numVal ? parseFloat(((numVal * 100) / (v.issue_amount * 10000) * 100).toFixed(2)) : null);
                })
                if (v.buy_list) {
                    tempObj.listData.buy_list.unshift(v.buy_list.total);
                }
                $scope.gridData.rowData.push(tempObj);

            });
            $scope.levelClassifyFunc();
            $scope.selectList();
        }

        $('#loadShadeDiv').modal({ backdrop: 'static', keyboard: false });
        $scope.gridData.rangeSet.length = 0;

        accountGroupSummary.post({
            account_group_id: accountConstant.group_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            company_id: user.company_id,
            date: $scope.accountSelectedDate
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                _resetSummaryData(data);
                _loadingOver[0] = true;
                _hideLoadShade();
            }
        }, function error() {
            _loadingOver[0] = true;
            _hideLoadShade();
            messageBox.error('数据加载失败，请重新点击加载！');
        });

        positionsQuery.post({
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            first_group_by: filterParam.typeOption1 && filterParam.typeOption1.val,
            second_group_by: filterParam.typeOption2 && filterParam.typeOption2.val,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            show_type: 'contrast',
            date: $scope.accountSelectedDate
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                if (!$scope) {
                    return;
                }
                _resetPositionData(data);
                _loadingOver[1] = true;
                _hideLoadShade();
            }
        }, function error() {
            _loadingOver[1] = true;
            _hideLoadShade();
            messageBox.error('数据加载失败，请重新点击加载！');
        });
    }

    var optionsValue = [], gridValue = [], exportRenderedData = [];

    function arrayToObject(index, value) {
        var innerObject = {};
        for (var i in value) {
            if (index === 'bond_to_net' || index === 'repo_to_net' || index === 'duration' || index === 'total_to_net' || index === 'yield_total') {
                innerObject['proportion' + (parseInt(i) + 1)] = $filter('commafyConvert')(value[i]);
            } else {
                innerObject['proportion' + (parseInt(i) + 1)] = value[i];
            }
        }
        return innerObject;
    }

    function translateOptionsDataByUnit(index, value) {
        if (index === 'asset_net' || index === 'cash_t_0' || index === 'cash_t_1') {
            for (var i in value) {
                if (value[i] != null) {
                    value[i] = $filter('commafyConvert')(value[i] / $scope.displayUnit.index.val) + $scope.displayUnit.index.name;
                }
            }
        }
        return value;
    }

    function getItemName(type) {
        var item_name = {
            asset_net: '净资产',
            cash_t_0: 'T+0',
            cash_t_1: 'T+1',
            bond_to_net: '债%',
            repo_to_net: '回购%',
            duration: '久期',
            total_to_net: '总资产/净资产',
            yield_total: '收益'
        };
        return item_name[type] ? item_name[type] : '';
    }

    function getOptionData() {
        var oData = {};
        for (var index in $scope.summaryData) {
            oData[index] = arrayToObject(index, $scope.summaryData[index]);
        }
        $.each(oData, function (index, value) {
            optionsValue.push(angular.extend({
                first_val: '',
                item_name: getItemName(index),
                second_val: '',
                bond_code: '',
                bond_short_name: ''
            }, translateOptionsDataByUnit(index, value)));
        });
        optionsValue.splice(5, 2);
        optionsValue.splice(optionsValue.length - 1, 1);
    }

    function formatExportData() {
        optionsValue = [];
        gridValue = [];

        getOptionData();

        $.each($scope.gridData.renderData, function (index, value) {
            gridValue.push(angular.extend({
                first_val: value.first_val,
                item_name: '',
                second_val: value.second_val,
                bond_code: value.bond_code ? value.bond_code + '\t' : '',
                bond_short_name: value.bond_short_name
            }, arrayToObject(index, value.listData[$scope.curDisplayType])));
        });
        exportRenderedData = optionsValue.concat(gridValue);
    }

    init();
    $scope.$on('bond tab clicked', function () {
        init();
    });

    $scope.getCsvHeader = function () {
        var exportCsvHeader = ['', '项目', '', '', '', winStatus.current_name];
        for (var index in $scope.summaryData.account_name) {
            if ($scope.summaryData.account_name[index].account_name != undefined) {
                exportCsvHeader.push($scope.summaryData.account_name[index].account_name + '\t');
            }
        }
        console.log('字段', exportCsvHeader)

        return exportCsvHeader;
    };

    $scope.onExportData = function () {
        formatExportData();
        $scope.fileName = $scope.getFileName('_债券_对比_', $scope.accountSelectedDate);
        console.log('data', exportRenderedData)
        return exportRenderedData;
    };
    //点击某一行
    $scope.rowClick = function (index) {
        $scope.gridData.selectedIndex = index;
    };

    //根据层级区分class
    $scope.showLevelClass = function (bond) {
        if (bond.first_val) return 'portfolio-data-1';
        if (bond.second_val) return 'portfolio-data-2';
        if (!bond.bond_code) return 'sum-data';
    };

    //层级折叠按钮点击事件
    $scope.iconClick = function (bond, index, num) {
        if (index == 1) {
            if (bond.closed) {
                bond.closed = false;
                $scope.gridData.rangeSet[num] = [-1, -1];
            }
            else {
                bond.closed = true;
                $scope.gridData.rangeSet[num] = [bond.start, bond.end];
            }
        }
        else if (index == 2) {
            if (bond.sub_closed) {
                bond.sub_closed = false;
                $scope.gridData.rangeSet[num] = [-1, -1];
            }
            else {
                bond.sub_closed = true;
                $scope.gridData.rangeSet[num] = [bond.start, bond.end];
            }

        }

        $scope.selectList();
    }

    $scope.clearBondFilter = function() {
        bondPositionFilter.type = "";
        bondPositionFilter.bklms = [];
    }

    $scope.$watchCollection(
        function () {
            return bondPositionFilter;
        },
        function (newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            $scope.selectList();
        }
    );

    //筛选出展示在界面上的数据
    $scope.selectList = function () {
        $scope.gridData.renderData.length = 0;
        jQuery.each($scope.gridData.rowData, function (index, value) {
            delete value.isOn;
            if (bondPositionFilter.bklms.length > 0 && bondPositionFilter.bklms.indexOf(value.bond_key_listed_market) < 0
                && !value.first_val && !value.second_val) {
                return true;
            }
            for (var i in $scope.gridData.rangeSet) {
                if (!value.isTotal && (index > $scope.gridData.rangeSet[i][0]) && index < ($scope.gridData.rangeSet[i][1] + 1)) {
                    if (!value.second_val) {
                        $scope.gridData.renderData[$scope.gridData.renderData.length - 1].isOn = true;
                    }
                    return true;
                }
            }
            $scope.gridData.renderData.push(value);

        });
        var length = $scope.gridData.renderData.length;
        for (var i = 0; i < length; i++) {
            if (i > $scope.gridData.renderData.length - 1) break;

            var option_1 = $scope.gridData.renderData[i].first_val && (!$scope.gridData.renderData[i + 1] ||
                $scope.gridData.renderData[i + 1].first_val);

            var option_2 = $scope.gridData.renderData[i].second_val &&
                (!$scope.gridData.renderData[i + 1] || $scope.gridData.renderData[i + 1].second_val ||
                    $scope.gridData.renderData[i + 1].first_val);

            var option_3 = !$scope.gridData.renderData[i].isOn;

            if ((option_1 || option_2) && option_3) {
                $scope.gridData.renderData.splice(i, 1);
                i--;
                if (option_2) i--;
            }

        }
        $scope.gridData.state.style.height = $scope.gridData.renderData.length * 32 + 'px'; //样式重置
        $scope.refresh();
    }

    //是否显示便签编辑按钮
    $scope.showNoteEdit = function (id) {
        var result = authorityControl.getAuthorityAndAgentCompany(id);
        return id && result.option != '1';
    };

    //数据分层函数
    $scope.levelClassifyFunc = function () {
        jQuery.each($scope.gridData.rowData, function (i, v) {
            v.index = i;
            if ($scope.gridData.state.positionFlags[0] > -1) {
                $scope.gridData.rowData[$scope.gridData.state.positionFlags[0]].end = i;
            }
            if ($scope.gridData.state.positionFlags[1] > -1) {
                $scope.gridData.rowData[$scope.gridData.state.positionFlags[1]].end = i;
            }
            if (v.first_val) {
                if ($scope.gridData.state.positionFlags[0] > -1) {
                    $scope.gridData.rowData[$scope.gridData.state.positionFlags[0]].end = i - 1;
                }
                $scope.gridData.state.positionFlags[0] = i;
                v.start = i;
            }
            if (v.second_val) {
                if ($scope.gridData.state.positionFlags[1] > -1) {
                    if ($scope.gridData.state.positionFlags[0] == i - 1) {
                        $scope.gridData.rowData[$scope.gridData.state.positionFlags[1]].end = i - 2;
                    }
                    else $scope.gridData.rowData[$scope.gridData.state.positionFlags[1]].end = i - 1;
                }
                $scope.gridData.state.positionFlags[1] = i;
                v.start = i;
            }
            if (!v.first_val && !v.second_val && !v.bond_short_name) {
                v.isTotal = true;
            }
        });

    }

    $scope.formatSumText = function (value) {
        if (!value) return '';
        var unit, str;
        if (!$scope.displayUnit.index) {
            unit = 1;
            str = '';
        }
        else {
            unit = $scope.displayUnit.index.val;
            str = $scope.displayUnit.index.text;

        }
        value = $filter('commafyConvert')(value / unit);
        if (value != '0') {
            value += str;
        }
        return value;
    };

    $scope.formatText = function (text, option) {
        var unit, str, isInt; //isInt用于记录是否为整数，只有是小数的情况才取二位小数
        if (!text) return text;
        //显示类型为“持仓面额”时由于涉及到单位所以需要做特殊处理
        if (option == 'face_amount') {
            if (!$scope.displayUnit.index) {
                unit = 1;
                str = '';
            }
            else {
                unit = $scope.displayUnit.index.val;
                str = $scope.displayUnit.index.text;
            }

            text = $filter('parseToNumber')(text) / unit;
            if (text == parseInt(text)) {
                isInt = true;
            }
            text = $filter('commafyConvert')(text);
            if (isInt) {
                text = text.slice(0, -3);
            }
            if (text != '0') {
                text += str;
            }
        }
        if (option == 'proportion') {
            text = $filter('toPercentNoSign')(text);
        }
        return text;
    };

    $scope.onAccountClicked = function (bond) {
        winStatus.cur_account = accountService.getAccountById(bond.account_id);
        winStatus.cur_account_id = bond.account_id;
        winStatus.cur_account_list = [bond.account_id];
        winStatus.is_account_now = true;
        winStatus.current_name = bond.account_name;

        winStatus.account_filter_list.length = 0;
        var tempObj = {};
        tempObj.account_id = bond.account_id;
        tempObj.account_name = bond.account_name;
        winStatus.account_filter_list.push(tempObj);
        var result = authorityControl.getAuthorityAndAgentCompany(bond.account_id);
        winStatus.cur_account_authority = result.option;
        winStatus.cur_account_trade_option = result.trade_option;
        winStatus.cur_agent_company_id = result.agent_company_id;

        winStatus.cur_main_tab = 'position';
        winStatus.cur_position_tab = 1;
        distinguishGroupName.isGroupPositionSheet = false;
        $scope.$emit("account updated");
    };

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
