
angular.module('ias.account').controller('performanceCtrl', function ($scope, winStatus, accountService, datetimePickerConfig,
                                                                  messageBox, dateClass) {
    if (winStatus.is_account_now) {
        $scope.isValuationInCurTab = function () {
            return winStatus.cur_account.source_type_performance === 'position';
        };
    } else {
        $scope.isValuationInCurTab = function () {
            var isAllAccountsValuation = true;
            winStatus.cur_account_list.forEach(function (accountId) {
                isAllAccountsValuation = isAllAccountsValuation && (accountService.getAccountById(accountId).source_type_position === 'position');
            });
            return isAllAccountsValuation;
        };
    }

    $scope.tabTemplateScope = {};
    $scope.tabTemplateInitFun = function (theScope) {
        $scope.tabTemplateScope = theScope;
    };
    $scope.showDetailParm = {
        ids: [],
        isFilter: false
    };

    var today = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
    var yesterday = dateClass.getFormatDate(dateClass.getLastDay(new Date()), 'yyyy-MM-dd');
    var twoMonthAgo = dateClass.getFormatDate(new Date() - 60 * 24 * 60 * 60 * 1000, 'yyyy-MM-dd');
    $scope.selectedDate = {
        startDate: '',
        endDate: '',
        init: function () {
            if (winStatus.cur_account_list.length === 0) return;
            if ($scope.isValuationInCurTab()) {
                this.startDate = $scope.valuationDates.options[$scope.valuationDates.options.length - 1];
                this.endDate = $scope.valuationDates.options[0];
            } else {
                this.startDate = (winStatus.cur_account_list.length === 1 && accountService.getAccountById(winStatus.cur_account_list[0]).create_date > twoMonthAgo)
                    ? accountService.getAccountById(winStatus.cur_account_list[0]).create_date
                    : twoMonthAgo;
                this.endDate = yesterday;
            }
        },
        onChange: function () {
            if (winStatus.cur_account_list.length === 0) return;

            var start = this.startDate;
            var end = this.endDate;
            if (new Date(start) > new Date(end)) {
                this.startDate = end;
                this.endDate = start;
            }
            var account = accountService.getAccountById(winStatus.cur_account_id);
            if (winStatus.is_account_now && this.startDate < account.create_date && !$scope.isValuationInCurTab()) {
                this.startDate = account.create_date;
                messageBox.warn('日期不能早于账户创建日期,日期已置为账户创建日期');
                if (this.endDate < account.create_date) {
                    this.endDate = account.create_date;
                }
            }
        }
    };

    $scope.endTodayTimePickerConfig = angular.merge({}, datetimePickerConfig, { endDate: today });

    let curPerformanceTab = 'leverage';
    const PERF_TAB_MSG = {
        'leverage': 'performance_leverage tab clicked',
        'allocation': 'performance_table tab clicked',
        'tendency': 'asset_chart tab clicked',
        'details': 'performance_list tab clicked',
    }
    $scope.handlePerformanceTabSelected = function(tabname) {
        curPerformanceTab = tabname;
        const msg = PERF_TAB_MSG[curPerformanceTab];
        if (!msg) return;
        if (tabname === "details") {
            $scope.showDetailParm.isFilter = false;
        }
        $scope.$broadcast(msg);
    }

    $scope.$on('performance tab selected', function () {
        $scope.selectedDate.init();
        $scope.handlePerformanceTabSelected(curPerformanceTab);
    });
})
angular.module('ias.account').controller('allocationCtrl', function ($scope, performanceAttribution,
                                                                       accountConstant, user, winStatus, filterParam,
                                                                       authorityControl, excelExport, messageBox, tabConst, dateClass) {
    $scope.showTypes = [
        {label: '债券', value: 1},
        {label: '全部资产', value: 2}
    ];
    $scope.showType = 1; //默认显示债券

    $scope.showShadow = function () {
        $('#loadShadeDiv').modal({backdrop: 'static', keyboard: false});
    };
    $scope.hideShadow = function () {
        $('#loadShadeDiv').modal('hide');
    }
    var setData = function (data) {
        $scope.issuer_rating = data.issuer_rating;
        $scope.rating = data.rating;
        $scope.market = [].concat(data.listed_market ? data.listed_market : [])
            .concat(data.across_market ? data.across_market : [])
            .concat(data.has_option ? data.has_option : []);
        $scope.bond_type = data.bond_type;
        $scope.t_2m = data.t_2m;
        $scope.t_2e = data.t_2e;
        $scope.is_municipal = data.is_municipal;
        $scope.sector = data.sector;
        $scope.top_ten_bond = data.top_ten_bond;

        $scope.asset_type = data.asset_type;
        $scope.credit_type = data.credit_type;
    };

    $scope.getShowType = function (showType) {
        $scope.showType = showType;
    };

    $scope.exportPerformance = function () {
        var hideLoad = function () {
            $('#loadShadeDiv').modal('hide');
        };

        var namespace = '', parameter = {};
        var file_name = winStatus.current_name + '_业绩归因表_' + dateClass.getFormatDate(new Date(), 'yyyyMMdd');
        namespace = '/export/performances';
        parameter = {
            company_id: user.company_id,
            account_group_id: accountConstant.group_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            start_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate,
            account_or_group_name: winStatus.current_name
        }

        var errorFunc = function () {
            hideLoad();
            messageBox.error('业绩归因表导出失败！')
        };

        $('#loadShadeDiv').modal({backdrop: 'static', keyboard: false});
        excelExport.request('performance', parameter, file_name + '.xls', hideLoad, errorFunc);
    };
    $scope.performanceAttributionDateChange = function () {
        $scope.selectedDate.onChange();
        $scope.getPerformanceAttributionData();
    }
    $scope.getPerformanceAttributionData = function () {
        if(winStatus.cur_account_list.length === 0){
            return;
        }
        performanceAttribution.post({
            // account_group_id: accountConstant.group_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            // company_id: user.company_id,
            start_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                setData(data);
            }
        });
    };

    $scope.showDetail = function (ids) {
        $scope.tabTemplateScope.toggleSelect(tabConst.list);
        if (ids) {
            $scope.showDetailParm.isFilter = true;
            $scope.showDetailParm.ids.length = 0;
            $.each(ids, function (index, id) {
                $scope.showDetailParm.ids.push(id);
            });
        }
    }

    $scope.$on('performance_table tab clicked', function () {
        $scope.getPerformanceAttributionData()
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    })
})
angular.module('ias.account').controller("detailsCtrl", function ($scope, $filter, incomeStatementTable, filterParam, accountService,
                                                               incomeStatementList, accountConstant, authorityControl,
                                                               user, winStatus, messageBox, dateClass, GridConfigService,hcMarketData) {

    if ($scope.winStatus.is_account_now) {
        $scope.isValuationInCurTab = function () {
            return winStatus.cur_account.source_type_performance === 'position';
        };
    }
    /*HACK 组合情况下做特殊处理代码*/
    else {
        $scope.isValuationInCurTab = function () {
            var isAllAccountsValuation = true;
            winStatus.cur_account_list.forEach(function (accountId) {
                isAllAccountsValuation = isAllAccountsValuation && (accountService.getAccountById(accountId).source_type_position === 'position');
            });
            return isAllAccountsValuation;
        };
    }
    $scope.gridOptionsAll = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterCsvFilename: 'myFile.csv',
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1'],
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'start_volume' || col.name == 'end_volume' || col.name == 'unrealized_pnl' || col.name == 'realized_pnl' || col.name == 'total_pnl') {
                value = $filter('commafyConvert')(value);
            } else if (col.name == 'asset_code') {
                if (value) {
                    if (row.entity.bond_key_listed_market != undefined) {
                        value = value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
                    } else {
                        value = '\t' + value;
                    }
                }
            }
            return value;
        },
        columnDefs: incomeStatementTable.allAssetColumnDef(),
        onRegisterApi: function (gridApi) {
            $scope.gridApiAll = gridApi;
            $scope.gridApiAll.grid.registerRowsProcessor(function (renderalbeRows) {
                renderalbeRows.forEach(function (row) {
                    if ($scope.showDetailParm.isFilter) {
                        if ($scope.showDetailParm.ids.indexOf(row.entity.position_id) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }
                });
                return renderalbeRows;
            }, 200);
        }
    };
    $scope.gridOptionsFund = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterCsvFilename: 'myFile.csv',
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1'],
        columnDefs: incomeStatementTable.fundColumnDef(),
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'start_volume' || col.name == 'end_volume' || col.name == 'dividend' || col.name == 'fee' || col.name == 'floating_pnl' || col.name == 'realized_pnl' || col.name == 'total_pnl') {
                value = $filter('commafyConvert')(value);
            } else if (col.name == 'asset_code') {
                if (value) {
                    value = '\t' + value;
                }
            }
            return value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApiFund = gridApi;
            $scope.gridApiFund.grid.registerRowsProcessor(function (renderalbeRows) {
                renderalbeRows.forEach(function (row) {
                    if ($scope.showDetailParm.isFilter) {
                        if ($scope.showDetailParm.ids.indexOf(row.entity.position_id) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }
                });
                return renderalbeRows;
            }, 200);
        }
    };
    $scope.gridOptionsMoney = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterCsvFilename: 'myFile.csv',
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1'],
        columnDefs: incomeStatementTable.moneyColumnDef(),
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'start_interest_accrued' || col.name == 'end_interest_accrued' || col.name == 'period_interest_accrued' || col.name == 'amount' || col.name == 'repo_rate' || col.name == 'interest_total') {
                value = $filter('commafyConvert')(value);
            } else if (col.name == 'asset_code') {
                if (value) {
                    if (row.entity.bond_key_listed_market != undefined) {
                        value = value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
                    } else {
                        value = '\t' + value;
                    }
                }
            }
            return value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApiMoney = gridApi;
            $scope.gridApiMoney.grid.registerRowsProcessor(function (renderalbeRows) {
                renderalbeRows.forEach(function (row) {
                    if ($scope.showDetailParm.isFilter) {
                        if ($scope.showDetailParm.ids.indexOf(row.entity.position_id) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }
                });
                return renderalbeRows;
            }, 200);
        }
    };
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterCsvFilename: 'myFile.csv',
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1'],
        columnFunc: incomeStatementTable.bondAssetColumnDef,
        columnDefs: incomeStatementTable.bondAssetColumnDef(),
        columnTypes: ['持仓信息', '市值信息', '损益信息', '基础信息'],
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'capital_pnl' || col.name == 'coupon_received' || col.name == 'coupon' || col.name == 'capital_pnl' || col.name == 'floating_pnl'|| col.name == 'amortization'|| col.name == 'realized_pnl'|| col.name == 'total_pnl') {
                value = $filter('commafyConvert')(value);
            } else if (col.name == 'asset_code') {
                if (value) {
                    if (row.entity.bond_key_listed_market != undefined) {
                        value = value.split('.')[0] + $filter('bondMarketType')(row.entity.bond_key_listed_market);
                    } else {
                        value = '\t' + value;
                    }
                }
            }else if(col.name == 'start_volume' || col.name == 'end_volume' ){
                value = $filter('parAmountConvert')(value);
            }
            return value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(function (renderalbeRows) {
                renderalbeRows.forEach(function (row) {
                    if ($scope.showDetailParm.isFilter) {
                        if ($scope.showDetailParm.ids.indexOf(row.entity.position_id) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }
                });
                return renderalbeRows;
            }, 200);
            $scope.gridApi.grid.registerDataChangeCallback(function() { GridConfigService.post('performance_statement') }, ['column']);
        }
    };
    GridConfigService.init($scope, 'performance_statement')

    $scope.statementInitialData = {
        statementAssetType:'bond',
        isCostReset: true,
        IsZeroPosition:true,
        secondFilterIsShow : true,
        caculationTypeIsShow : true,
        IsSaveControl:true,
        firstFilter : null,
        secondFilter : null,
        allAssetNumber: 1,
        filterParams : accountConstant.filters,
        assetTypeFilter:[
            {   label:"银行间正回购",
                val:'2',
            },
            {   label:"银行间逆回购",
                val:'3',
            },
            {   label:"交易所正回购",
                val:'4',
            },
            {   label:"交易所逆回购",
                val:'5',
            },
            {   label:"拆借拆入",
                val:'6',
            },
            {   label:"拆借拆出",
                val:'7',
            }
        ]
    }

    $scope.assetTypeSave = "bond";
    $scope.isLoading = false;
    $scope.shangeAseetType = function (value) {
        $scope.isLoading = true;
        var setStatementOption = function (secondFilterIsShow,caculationTypeIsShow,filterParams,IsSaveControl) {
            $scope.statementInitialData.secondFilterIsShow = secondFilterIsShow;
            $scope.statementInitialData.caculationTypeIsShow = caculationTypeIsShow;
            $scope.statementInitialData.filterParams = filterParams;
            $scope.statementInitialData.IsSaveControl = IsSaveControl;
        };
        if(value === 'bond'){
            setStatementOption(true,true,accountConstant.filters,true,incomeStatementTable.bondAssetColumnDef());
            $scope.assetTypeSave ="bond"
        }
        if(value === 'all'){
            setStatementOption(false,true,$scope.statementInitialData.assetTypeFilter,false);
            $scope.assetTypeSave ="all"
        }
        if(value === 'fund'){
            setStatementOption(false,false,$scope.statementInitialData.assetTypeFilter,false)
            $scope.assetTypeSave ="fund"
        }
        if(value === 'money'){
            setStatementOption(false,false,$scope.statementInitialData.assetTypeFilter,false)
            $scope.assetTypeSave ="money"
        }
        $scope.selectedDate.onChange();
        $scope.getIncomeStatementListData();
    };

    function addSumRow(sumColumnArr,sourceData,target) {
        $.each(sumColumnArr,function (index, value) {
            target[value] = 0;
            $.each(sourceData,function (i, v) {
                if(v[value]== undefined){
                    target[value] ="";
                    return
                }
                target[value] += parseFloat(v[value].toFixed(2));
            })
        });
        target.isLastRow = true;
    }//该函数用于在uigrid最后一行添加合计行
    function addAverageRow(averageColumnArr,sourceData,target) {
        $.each(averageColumnArr,function (index, value) {
            target[value] = 0;
            $.each(sourceData,function (i, v) {
                if(v[value]== undefined){
                    target[value] ="";
                    return
                }
                target[value] += parseFloat(v[value].toFixed(2));
            });
            target[value] = target[value]/sourceData.length;
        });
        target.isLastRow = true;
    }//该函数用于在uigrid最后一行添加合计行

    $scope.IncomeStatementListDateChange = function () {
        $scope.selectedDate.onChange();
        $scope.getIncomeStatementListData();
    }
    $scope.getIncomeStatementListData = function () {
        if (winStatus.cur_account_list.length === 0) return;
        incomeStatementList.post({
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            start_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate,
            group_by:$scope.statementInitialData.statementAssetType,
            first_group_by:$scope.statementInitialData.firstFilter && $scope.statementInitialData.firstFilter.val,
            second_group_by:$scope.statementInitialData.secondFilter && $scope.statementInitialData.secondFilter.val,
            cost_type:$scope.statementInitialData.calculationMethod.val,
            cost_reset: Number($scope.statementInitialData.isCostReset)
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                switch ($scope.statementInitialData.statementAssetType){
                    case 'bond':
                        var addColumnData = {};
                        var sumColumnArr = ['redemption_received','start_volume','end_volume','coupon_received','coupon','capital_pnl','maturity_pnl','floating_pnl','amortization','realized_pnl','total_pnl'];//定义需要合计的列
                        addSumRow(sumColumnArr,data,addColumnData);
                        data.push(addColumnData);
                        $scope.gridOptions.data = data;
                        break;
                    case 'all':
                        var addColumnData = {};
                        var sumColumnArr = ['start_volume','end_volume','unrealized_pnl','realized_pnl','total_pnl'];//定义需要合计的列
                        addSumRow(sumColumnArr,data,addColumnData);
                        data.push(addColumnData);
                        $scope.gridOptionsAll.data =data;
                        break;
                    case 'fund':
                        var addColumnData = {};
                        var sumColumnArr = [ 'start_volume','end_volume','dividend','fee','floating_pnl','realized_pnl','total_pnl'];//定义需要合计的列
                        addSumRow(sumColumnArr,data,addColumnData);
                        data.push(addColumnData);
                        $scope.gridOptionsFund.data = data;
                        break;
                    case 'money':
                        var addColumnData = {};
                        var sumColumnArr = [ 'start_interest_accrued','end_interest_accrued','period_interest_accrued','amount','repo_rate','days','real_days','interest_total'];//定义需要合计的列
                        addSumRow(sumColumnArr,data,addColumnData);
                        data.push(addColumnData);
                        $scope.gridOptionsMoney.data = data;
                        break
                }
                $scope.statementInitialData.allAssetNumber = data.length;
            }
            $scope.isLoading = false;
        }, function failure() {
            $scope.isLoading = false;
        });
    }

    $scope.onExportData = function () {
        if ($scope.assetTypeSave == "bond"){
            $scope.gridOptions.exporterCsvFilename =  $scope.getFileName('_损益细项_债券_', $scope.accountSelectedDate);
            $scope.exportExcel($scope.gridApi.exporter);
        }
        if ($scope.assetTypeSave == "all"){
            $scope.gridOptionsAll.exporterCsvFilename =  $scope.getFileName('_损益细项_全部资产_', $scope.accountSelectedDate);
            $scope.exportExcel($scope.gridApiAll.exporter);
        }
        if($scope.assetTypeSave == "fund"){
            $scope.gridOptionsFund.exporterCsvFilename =  $scope.getFileName('_损益细项_基金_', $scope.accountSelectedDate);
            $scope.exportExcel($scope.gridApiFund.exporter);
        }
        if($scope.assetTypeSave == "money"){
            $scope.gridOptionsMoney.exporterCsvFilename =  $scope.getFileName('_损益细项_资金_', $scope.accountSelectedDate);
            $scope.exportExcel($scope.gridApiMoney.exporter);
        }
    };

    $scope.$on('performance_list tab clicked', function () {
        if($scope.winStatus.is_account_now){
            if (hcMarketData.assetMarketData.sell_rule=="average_cost"){
                $scope.statementInitialData.caculationTypes = [{
                    label:"平均成本法",
                    val:"average_cost"
                },
                    {
                        label:"折溢摊分析",
                        val:"amortized_cost"
                    }
                ];

            }else{
                $scope.statementInitialData.caculationTypes = [{
                    label:"先进先出/指定成本",
                    val:"specify"
                }, {
                    label:"折溢摊分析",
                    val:"amortized_cost"
                }];
            }
        }else {
            $scope.statementInitialData.caculationTypes = [{
                label:"平均成本法",
                val:"average_cost"
            },{
                label:"先进先出/指定成本",
                val:"specify"
            }, {
                label:"折溢摊分析",
                val:"amortized_cost"
            }];
        }
        $scope.statementInitialData.calculationMethod = $scope.statementInitialData.caculationTypes[0];
        $scope.getIncomeStatementListData();
    });
});
