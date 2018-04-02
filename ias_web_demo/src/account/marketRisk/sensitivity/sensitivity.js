import {
    sensitivityPars,
    sensitivityPvbps,
    sensitivityParTimeSeries,
    sensitivityPvbpTimeSeries,
    gridConfig,
    // calcTableSummary,
    toTreeLevel,
    toggleNoNodeClass,
    tableTypes,
    otherTypes,
    sensitivityDurations,
    drawSensitivityChart,
} from './sensitivity.helper';

angular.module('ias.account').controller('sensitivityCtrl', function($scope, winStatus, tabConst, accountService, datetimePickerConfig, excelExport,
                                             filterParam, messageBox, dateClass, sensitivityPositions, accountConstant, user, authorityControl) {
    if ($scope.winStatus.cur_account_list.length === 1) {
        $scope.isValuationInCurTab = function() {
            return winStatus.cur_account.source_type_performance === 'position';
        };
    } else {
        $scope.isValuationInCurTab = function() {
            let isAllAccountsValuation = true;
            winStatus.cur_account_list.forEach(function(accountId) {
                isAllAccountsValuation = isAllAccountsValuation && (accountService.getAccountById(accountId).source_type_position === 'position');
            });
            return isAllAccountsValuation;
        };
    }

    function switchGrid(data) {
        if ($scope.cur_sensitivity_tab == tabConst.table) {
            switch ($scope.showType) {
                case 1: $scope.gridTableOptions.columnDefs = sensitivityPars();
                    break;
                case 2: $scope.gridTableOptions.columnDefs = sensitivityPvbps();
                    break;
                case 3: $scope.gridTableOptions.columnDefs = sensitivityDurations();
                    break;
            }
            $scope.gridTableOptions.data = toTreeLevel(data);
        } else if ($scope.cur_sensitivity_tab == tabConst.list) {
            if ($scope.showType === 1) {
                let parTimeSeriesColumn = sensitivityParTimeSeries();
                $scope.gridListOptions.columnDefs = gridConfig(data, parTimeSeriesColumn, 'thousandthNum | columnNullValue');
            } else {
                let pvbpTimeSeriesColumn = sensitivityPvbpTimeSeries();
                $scope.gridListOptions.columnDefs = gridConfig(data, pvbpTimeSeriesColumn, 'commafyConvert | columnNullValue');
            }
            $scope.gridListOptions.data = data;
        }
    }
    function showData(data) {
        if (data == null) {
            $scope.gridTableOptions.data = [];
            $scope.gridListOptions.data = [];
            return;
        }
        if ($scope.cur_sensitivity_tab == tabConst.table) {
            let cloneData = [];
            switch ($scope.showType) {
                case 1: angular.copy(data.pars, cloneData);
                    break;
                case 2: angular.copy(data.pvbps, cloneData);
                    break;
                case 3: angular.copy(data.durations, cloneData);
                    break;
            }
            // calcTableSummary(cloneData);
            switchGrid(cloneData);
        }
        if ($scope.cur_sensitivity_tab == tabConst.chart) {
            drawSensitivityChart('sensitivityChart', $scope.showType, data.par_chart, data.pvbp_chart);
        }
        if ($scope.cur_sensitivity_tab == tabConst.list) {
            let cloneTimeSeries = [];
            angular.copy($scope.showType === 1 ? data.par_time_series : data.pvbp_time_series, cloneTimeSeries);
            switchGrid(cloneTimeSeries);
        }
    }

    function getSensitivityData() {
        if (winStatus.cur_account_list.length === 0) return;

        sensitivityPositions.post({
            // account_group_id: accountConstant.group_id,
            // company_id: user.company_id,
            start_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                $scope.allSensitivityData = data;
                showData($scope.allSensitivityData);
            }
        });
    }

    $scope.getLevel1 = function(row) {
        // 表格树结构**第一列**的样式判断
        switch (row.treeLevel) {
            case 0:
                return '';
            case 1:
                return toggleNoNodeClass(row.treeNode);
            default:
                return '';
        }
    };

    $scope.gridTableOptions = {
        data: [],
        columnDefs: sensitivityPars(),
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        showTreeRowHeader: false,
        onRegisterApi: function(gridApi) {
            $scope.gridTableApi = gridApi;
            $scope.gridTableApi.grid.registerDataChangeCallback(function() {
                $scope.gridTableApi.treeBase.collapseAllRows();
            });
            $scope.gridTableApi.selection.on.rowSelectionChanged($scope, function(row) {
                $scope.gridTableApi.treeBase.toggleRowTreeState(row);
            });
        },
    };
    $scope.gridListOptions = {
        data: [],
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        onRegisterApi: function(gridApi) {
            $scope.gridListApi = gridApi;
        },
    };

    let today = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
    let twoMonthAgo = dateClass.getFormatDate(new Date() - 60 * 24 * 60 * 60 * 1000, 'yyyy-MM-dd');
    $scope.endTodayTimePickerConfig = angular.merge({}, datetimePickerConfig, { endDate: today });
    $scope.selectedDate = {
        startDate: '',
        endDate: '',
        init: function() {
            this.startDate = (winStatus.cur_account_list.length === 1 && accountService.getAccountById(winStatus.cur_account_list[0]).create_date > twoMonthAgo)
                ? accountService.getAccountById(winStatus.cur_account_list[0]).create_date
                : twoMonthAgo;
            this.endDate = today;
        },
        onChange: function() {
            let start = this.startDate;
            let end = this.endDate;
            if (new Date(start) > new Date(end)) {
                this.startDate = end;
                this.endDate = start;
            }
            let account = accountService.getAccountById(winStatus.cur_account_id);
            if (winStatus.is_account_now && this.startDate < account.create_date && !$scope.isValuationInCurTab()) {
                this.startDate = account.create_date;
                messageBox.warn('日期不能早于账户创建日期,日期已置为账户创建日期');
                if (this.endDate < account.create_date) {
                    this.endDate = account.create_date;
                }
            }
        },
    };

    $scope.showType = 1; // 默认显示债券
    $scope.getShowType = function(showType) {
        $scope.showType = showType;
        showData($scope.allSensitivityData);
    };

    $scope.exportSensitivity = function() {
        if (winStatus.cur_account_list.length === 0) return;

        let hideLoad = function() {
            $('#loadShadeDiv').modal('hide');
        };

        let parameter = {};
        let fileName = winStatus.current_name + '_敏感度分析_' + dateClass.getFormatDate(new Date(), 'yyyyMMdd');
        parameter = {
            company_id: user.company_id,
            account_group_id: accountConstant.group_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            start_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate,
            account_or_group_name: winStatus.current_name,
        };

        let errorFunc = function() {
            hideLoad();
            messageBox.error('敏感度分析导出失败！');
        };

        $('#loadShadeDiv').modal({backdrop: 'static', keyboard: false});
        excelExport.request('sensitivity', parameter, fileName + '.xls', hideLoad, errorFunc);
    };
    $scope.sensitivityDateChange = function() {
        $scope.selectedDate.onChange();
        getSensitivityData();
    };

    $scope.tableSelect = function() {
        $scope.showTypes = tableTypes;
        $scope.gridTableOptions.data = [];
        $scope.gridListOptions.data = [];
        $scope.cur_sensitivity_tab = tabConst.table;
        showData($scope.allSensitivityData);
    };

    $scope.chartSelect = function() {
        $scope.showTypes = otherTypes;
        if ($scope.showType === 3) $scope.showType = 1;
        $scope.gridTableOptions.data = [];
        $scope.gridListOptions.data = [];
        $scope.cur_sensitivity_tab = tabConst.chart;
        showData($scope.allSensitivityData);
    };

    $scope.listSelect = function() {
        $scope.showTypes = otherTypes;
        if ($scope.showType === 3) $scope.showType = 1;
        $scope.gridTableOptions.data = [];
        $scope.gridListOptions.data = [];
        $scope.cur_sensitivity_tab = tabConst.list;
        showData($scope.allSensitivityData);
    };

    $scope.$on('sensitivity tab clicked', function() {
        $scope.selectedDate.init();
        getSensitivityData();
    });
});
