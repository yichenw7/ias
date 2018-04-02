import { IASCharts } from '../../helper/IASCharts';

angular.module('ias.account').controller('combinationIndexCtrl', function ($scope, accountService, returnIndices, winStatus) {
    function clickTab() {
        angular.forEach($scope.indicatorPageTabs, function (tab) {
            tab.isSelected = false;
        });
        var self = this;
        returnIndices.cur_index = $scope.indicatorPageTabs.indexOf(self);
        this.isSelected = true;
        $scope.$broadcast(this.clickMsg);
    }

    $scope.returnIndicesTab = { label: '风险收益指标', isSelected: true, clickHandler: clickTab, clickMsg: 'returnIndices tab clicked' };
    $scope.indicatorPageTabs = [$scope.returnIndicesTab];

    $scope.showIndicatorsBaseSettingDlg = function () {
        $('#indicatorsBaseSetting').modal('show');
    };
    $scope.showBenchmarkIndicesSettingDlg = function () {
        $('#benchmarkIndicesSetting').modal('show');
    };
    $scope.showFundsIndicesSettingDlg = function () {
        $('#fundsIndicesSetting').modal('show');
    };

    $scope.indicators = returnIndices.cur;

    function getCurrentAccounts() {
        var curAccounts = $scope.winStatus.is_account_now ? [$scope.winStatus.cur_account_id] : $scope.winStatus.cur_account_list;
        $scope.accounts = accountService.getAccountsByIds(curAccounts);
    }

    $scope.$on('indices tab selected', function () {
        $scope.indicatorPageTabs[returnIndices.cur_index].clickHandler();
        getCurrentAccounts();
    });
});
angular.module('ias.account').controller('returnIndicesCtrl', function ($scope, datetimePickerConfig, benchmarkIndices, portfolioRiskReturnIndices, returnIndices, $filter,
                                                         fundsIndices, messageBox, accountConstant, user, authorityControl, winStatus, dateClass) {
    function drawUnitAssetContrastChart(data) {
        angular.forEach(data, function(dayData) {
            angular.forEach(dayData, function(value, key) {
                if (key !== 'date') {
                    dayData[key] = value * 100
                }
            })
        });
        var _stockGraphs = [];
        var _fieldMappings = [];
        var _addFieldMappings = function(items) {
            angular.forEach(items, function(item) {
                _fieldMappings.push({
                    fromField: item.id,
                    toField: item.id
                });
                _stockGraphs.push({
                    title: item.name,
                    balloonText: "<b>" + item.name + ": [[value]]%</b>",
                    useDataSetColors: false,
                    lineThickness: 2,
                    type: "line",
                    valueField: item.id
                });
            });
        };

        _addFieldMappings($scope.accounts);
        _addFieldMappings($scope.funds);

        var benchmarkTitle = function() {
            var res = '';
            $.each(benchmarkIndices.cur.rows, function (index, row) {
                if (row.weight !== 0) {
                    $.each(benchmarkIndices.map, function (index, benchmarkIndex) {
                        if (benchmarkIndex.name === row.index.selected) {
                            res += row.weight + '%' + benchmarkIndex.name;
                            res += row.bp !== 0 ? "(" + row.bp + "bp) + " : ' + ';
                            return false;
                        }
                    })
                }
            });
            return res.slice(0, res.length - 3);
        }();

        _fieldMappings.push({
            fromField: 'benchmark',
            toField: 'benchmark',
        });
        _stockGraphs.push({
            title: benchmarkTitle,
            precision: 4,
            balloonText: "<b>" + benchmarkTitle + ": [[value]]%</b>",
            useDataSetColors: false,
            lineColor: "#00b8ff",
            lineThickness: 2,
            type: "line",
            valueField: 'benchmark',
        });

        var indicesChartConfig = {
            dataSets: [{
                dataProvider: data,
                categoryField: 'date',
                fieldMappings: _fieldMappings,
            }],
            panels: [{
                precision: 4,
                stockGraphs: _stockGraphs,
                stockLegend: {
                    valueTextRegular: '[[value]]%',
                    periodValueTextRegular: "[[value]]",
                    color: "#878787",
                    fontSize: 14,
                },
            }],
        };
        return IASCharts.drawChart("unitAssetsContrastChart", indicesChartConfig);
    }

    var today = dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
    $scope.funds = fundsIndices.cur;
    $scope.isShowChart = true;
    $scope.datetimePickerConfig = angular.merge({}, datetimePickerConfig, { endDate: today });
    $scope.indicatorQuery = {
        startDate: (today.slice(0, 4) - 1) + today.slice(4),
        endDate: today,
        rfRate: 1.5,
        accountsData: {},
        fundsData: {},
        getFunds: function() {
            var res = [];
            angular.forEach(fundsIndices.cur, function(fund) {
                res.push(fund.id);
            });
            return res;
        },
        getBenchmarkIndices: function () {
            var res = [];
            $.each(benchmarkIndices.cur.rows, function (index, row) {
                if (row.bp === '' || row.bp === undefined || row.bp === null) {
                    row.bp = 0;
                }
                if (row.weight !== 0) {
                    $.each(benchmarkIndices.map, function (index, benchmarkIndex) {
                        if (benchmarkIndex.name === row.index.selected) {
                            res.push({
                                code: benchmarkIndex.code,
                                weight: row.weight / 100,
                                offset_bps: row.bp
                            });
                            return false;
                        }
                    })
                }
            });

            return res;
        },
        query: function () {
            if (benchmarkIndices.cur.weight !== 100) {
                messageBox.warn('基准指数权重应为:100%(当前' + (benchmarkIndices.cur.weight ? benchmarkIndices.cur.weight : 0) + '%)!');
                return;
            }

            var indicatorQuery = $scope.indicatorQuery;
            var accountList = $scope.winStatus.is_account_now ? authorityControl.getAccountGroupMember([$scope.winStatus.cur_account_id])
                : authorityControl.getAccountGroupMember(winStatus.cur_account_list);

            portfolioRiskReturnIndices.get({
                account_group_id: accountConstant.group_id,
                benchmark_indices: indicatorQuery.getBenchmarkIndices(),
                funds: indicatorQuery.getFunds(),
                company_id: user.company_id,
                account_list: accountList,
                start_date: indicatorQuery.startDate,
                end_date: indicatorQuery.endDate,
                rf_rate: indicatorQuery.rfRate / 100
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    var errorMsg = '';
                    indicatorQuery.accountsData = data.account;
                    indicatorQuery.fundsData = data.fund;

                    angular.forEach(data.account, function (value) {
                        if (value && value.error_msg) {
                            errorMsg += value.error_msg + '\n';
                        }
                    });
                    angular.forEach(data.fund, function (value) {
                        if (value && value.error_msg) {
                            errorMsg += value.error_msg + '\n';
                        }
                    });

                    if (errorMsg !== '') {
                        messageBox.warn(errorMsg);
                    }
                    drawUnitAssetContrastChart(data.yields);
                }
            });
        }
    };

    $scope.getRiskReturnIndices = function () {
        if ($scope.indicatorQuery.startDate === '' || $scope.indicatorQuery.endDate === '') {
            messageBox.warn('请输入日期！');
            return;
        }
        if ($scope.indicatorQuery.rfRate === '') {
            messageBox.warn('请输入无风险利率！');
            return;
        }
        if (new Date($scope.indicatorQuery.endDate) < new Date($scope.indicatorQuery.startDate)) {
            var t = $scope.indicatorQuery.startDate;
            $scope.indicatorQuery.startDate = $scope.indicatorQuery.endDate;
            $scope.indicatorQuery.endDate = t;
        }

        $scope.indicatorQuery.query();
    };

    $scope.$on('returnIndices tab clicked', function() {
        $scope.getRiskReturnIndices();
    });
    var indicaseObject = {
        alpha:'Alpha',
        annualized_average_return:'年化平均回报',
        annualized_std:'年化组合标准差',
        beta:'Beta',
        correlation:'相关系数',
        daily_win_rate_positive:'日胜率(日收益为正)',
        daily_win_rate_relative:'日胜率(与基准比较)',
        days:'交易日天数',
        downside_risk:'下行风险',
        excess_annualized_average_return:'年化平均超额回报',
        information_ratio:'Information Ratio',
        m2:'M^2',
        maximum_drawdown:'最大跌幅',
        maximum_drawdown_duration:'最大跌幅天数',
        maximum_gain:'最大涨幅',
        maximum_gain_duration:'最大涨幅天数',
        period_return_after_cost_simple:'年化收益率(单利)',
        period_return_after_cost_compounded:'年化收益率(复利)',
        period_return:'期间收益率',
        r2:'R^2',
        relative_period_return:'期间相对总回报',
        relative_total_return:'年化相对总回报',
        sharpe_ratio:'Sharpe Ratio',
        sortino_ratio:'Sortino Ratio',
        tracking_error:'年化跟踪误差',
        treynor_ratio:'Treynor Ratio',
        al_indicate:'绩效分析指标'
        //maximum_gain_recovery_days:'',
        //maximum_drawdown_recovery_days:'',
        //annualized_semi_std:'',
        //benchmark_annualized_average_return:'',
        //benchmark_annualized_period_return:'',
        //benchmark_annualized_std:'',
        //benchmark_period_return:'',
        //capm:''
    };

    function transformFundsIndices(index) {
        var name = '';
        $.each(fundsIndices.cur, function (i, v) {
            if (index === v.id) {
                name = v.name;
            }
        });
        return name;
    }

    function getAccountName(accountId) {
        var name = '';
        $.each($scope.accounts, function (i, v) {
            if (accountId === v.id) {
                name = v.name + '\t';
            }
        });
        return name;
    }

    function getRender(data) {
        var tempObj = {al_indicate: data.al_indicate};
        for (var index in returnIndices.cur) {
            if (returnIndices.cur[index].isChecked) {
                if (returnIndices.cur[index].isNotPercent) {
                    tempObj[returnIndices.cur[index].field] = $filter('commafyConvert')(data[returnIndices.cur[index].field]);
                } else {
                    tempObj[returnIndices.cur[index].field] = $filter('toPercent')(data[returnIndices.cur[index].field]);
                }
            }
        }
        return tempObj;
    }

    $scope.onExportData = function () {
        $scope.csvData = [];
        var accountObject = {};
        $.each($scope.indicatorQuery.accountsData, function (index, value) {
            if (Object.prototype.toString.call(value) === '[object Object]') {
                accountObject = getRender(value);
                if (winStatus.is_account_now) {
                    accountObject['al_indicate'] = winStatus.current_name + '\t';
                } else {
                    accountObject['al_indicate'] = getAccountName(index);
                }
                $scope.csvData.push(accountObject);
            }
        });
        $.each($scope.indicatorQuery.fundsData, function (outerIndex, outerValue) {
            if (outerValue != null) {
                outerValue['al_indicate'] = transformFundsIndices(outerIndex);
                $scope.csvData.push(getRender(outerValue));
            }
        });
        $scope.fileName = $scope.getFileName('_组合指标_风险收益指标_', $scope.accountSelectedDate);
        return $scope.csvData;
    };

    $scope.getCsvHeader = function () {
        var csvHeader = [];
        if ($scope.csvData.length !== 0) {
            $.each($scope.csvData[0], function (index) {
                csvHeader.push(indicaseObject[index]);
            });
        }
        return csvHeader;
    };
});
angular.module('ias.account').controller('indicatorsBaseSettingCtrl', function ($scope, user, returnIndices, returnIndicesLib) {
    $scope.isSelectedAllIndicators = true;
    $scope.filterIndicatorText = '';
    $scope.returnIndices = returnIndices;

    $scope.toggleIndicator = function () {
        $scope.isSelectedAllIndicators = isAllSelected();
    };
    $scope.toggleAllIndicators = function () {
        angular.forEach(returnIndices.type1.concat(returnIndices.type2, returnIndices.type3), function (indicator) {
            indicator.isChecked = $scope.isSelectedAllIndicators;
        });
    };


    function updateReturnIndicatorsSetting() {
        returnIndicesLib.update({
            user_id: user.id,
            company_id: user.company_id,
            index_list: returnIndices.type1.concat(returnIndices.type2, returnIndices.type3)
        });
    }

    function isAllSelected() {
        var isAll = true;
        $.each(returnIndices.type1.concat(returnIndices.type2, returnIndices.type3), function (index, indicator) {
            if (!indicator.isChecked) {
                isAll = false;
                return false;
            }
        });
        return isAll;
    }

    $scope.save = function () {
        updateReturnIndicatorsSetting();
        angular.copy(returnIndices.type1.concat(returnIndices.type2, returnIndices.type3), returnIndices.cur);
        $scope.getRiskReturnIndices();
        $scope.close();
    };
    $scope.close = function () {
        $("#indicatorsBaseSetting").modal('hide');
    };

    $("#indicatorsBaseSetting").on('show.bs.modal', function () {
        angular.forEach(returnIndices.type1.concat(returnIndices.type2, returnIndices.type3), function(returnIndex, index) {
            $.each(returnIndices.cur, function(index, curReturnIndex) {
                if (curReturnIndex.field === returnIndex.field) {
                    returnIndex.isChecked = curReturnIndex.isChecked;
                    return false;
                }
            });
        });
        $scope.isSelectedAllIndicators = isAllSelected();
    });
});
angular.module('ias.account').controller('benchmarkIndicesSettingCtrl', function ($scope, benchmarkIndices) {
    var BENCHMARK_INDEX_OPTIONS = [];
    angular.forEach(benchmarkIndices.map, function (benchmarkIndex) {
        BENCHMARK_INDEX_OPTIONS.push(benchmarkIndex.name)
    });
    function BenchmarkIndexRow() {
        this.index = {
            options: BENCHMARK_INDEX_OPTIONS,
            selected: BENCHMARK_INDEX_OPTIONS[0]
        };
        this.bp = 0;
        this.weight = 0;
    }

    $scope.benchmarkIndicesQuery = {};
    $scope.addNewBenchmarkIndex = function() {
        $scope.benchmarkIndicesQuery.rows.push(new BenchmarkIndexRow());
    };

    $scope.deleteBenchmarkIndex = function(i) {
        $scope.benchmarkIndicesQuery.rows.splice(i, 1);
        $scope.calculateBenchmarkIndicesWeight();
    };
    $scope.calculateBenchmarkIndicesWeight = function() {
        var sum = 0;
        angular.forEach($scope.benchmarkIndicesQuery.rows, function(row) {
            sum += row.weight;
        });
        $scope.benchmarkIndicesQuery.weight = sum;
        $scope.benchmarkIndicesQuery.errMsg = $scope.benchmarkIndicesQuery.weight !== 100 ? '权重合计应为100%' : '';
    };

    $("#benchmarkIndicesSetting").on('show.bs.modal', function () {
        angular.copy(benchmarkIndices.cur, $scope.benchmarkIndicesQuery);
    });
    $scope.saveBenchmarkIndices = function () {
        angular.copy($scope.benchmarkIndicesQuery, benchmarkIndices.cur);
        $scope.getRiskReturnIndices();
        $scope.close();
    };
    $scope.close = function () {
        $('#benchmarkIndicesSetting').modal('hide');
    };
});
angular.module('ias.account').controller('fundsIndicesSettingCtrl', function ($scope, fundsIndices) {
    $scope.fundList = $scope.fundOtcList.concat($scope.fundExchangeList);
    $scope.funds = fundsIndices.tmp;
    $scope.selectFund = function(selected) {
        if (selected) {
            $scope.funds.push({
                id: selected.originalObject.fund_code,
                name: selected.originalObject.fundsname
            })
        }
    };

    $scope.deleteFund = function(index) {
        $scope.funds.splice(index, 1);
    };

    $("#fundsIndicesSetting").on('show.bs.modal', function () {
        $scope.$broadcast('angucomplete-alt:clearInput', 'fundSearchBox');
        angular.copy(fundsIndices.cur, $scope.funds);
    });

    $scope.save = function () {
        angular.copy($scope.funds, fundsIndices.cur);
        $scope.getRiskReturnIndices();
        $scope.close();
    };
    $scope.close = function () {
        $('#fundsIndicesSetting').modal('hide');
    };
});
angular.module('ias.account').factory('returnIndices', function () {
    return {
        cur: [],
        isUpdate: false,
        type1: [{
            field: 'days',
            name: '交易日天数',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'period_return',
            name: '期间收益率',
            isChecked: true
        }, {
            field: 'period_return_after_cost_simple',
            name: '年化收益率(单利)',
            isChecked: true
        }, {
            field: 'period_return_after_cost_compounded',
            name: '年化收益率(复利)',
            isChecked: true
        }, {
            field: 'relative_period_return',
            name: '期间相对总回报',
            isChecked: true
        }, {
            field: 'relative_total_return',
            name: '年化相对总回报',
            isChecked: true
        }, {
            field: 'annualized_average_return',
            name: '年化平均回报',
            isChecked: true
        }, {
            field: 'maximum_gain',
            name: '最大涨幅',
            isChecked: true
        }, {
            field: 'maximum_gain_duration',
            name: '最大涨幅天数',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'daily_win_rate_relative',
            name: '日胜率(与基准比较)',
            isChecked: true
        }, {
            field: 'daily_win_rate_positive',
            name: '日胜率(日收益为正)',
            isChecked: true
        }, {
            field: 'excess_annualized_average_return',
            name: '年化平均超额回报',
            isChecked: true
        }],
        type2: [{
            field: 'maximum_drawdown',
            name: '最大跌幅',
            isChecked: true
        }, {
            field: 'maximum_drawdown_duration',
            name: '最大跌幅天数',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'annualized_std',
            name: '年化组合标准差',
            isChecked: true
        }, {
            field: 'downside_risk',
            name: '下行风险',
            isChecked: true
        }, {
            field: 'tracking_error',
            name: '年化跟踪误差',
            isChecked: true
        }],
        type3: [{
            field: 'alpha',
            name: 'Alpha',
            isChecked: true
        }, {
            field: 'sharpe_ratio',
            name: 'Sharpe Ratio',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'treynor_ratio',
            name: 'Treynor Ratio',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'sortino_ratio',
            name: 'Sortino Ratio',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'information_ratio',
            name: 'Information Ratio',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'm2',
            name: 'M^2',
            isChecked: true
        }, {
            field: 'beta',
            name: 'Beta',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'r2',
            name: 'R^2',
            isNotPercent: true,
            isChecked: true
        }, {
            field: 'correlation',
            name: '相关系数',
            isNotPercent: true,
            isChecked: true
        }],
        curIndicaseData: null,
        cur_index: 0
    };
});
angular.module('ias.account').factory('benchmarkIndices', function () {
    var BENCHMARK_MAP = [{
        code: '000001',
        name: '上证指数'
    }, {
        code: '000300',
        name: '沪深300'
    }, {
        code: '000903',
        name: '中证100'
    }, {
        code: '000905',
        name: '中证500'
    }, {
        code: '000852',
        name: '中证1000'
    }, {
        code: 'CIC001',
        name: '信用债指数'
    }, {
        code: 'H11001',
        name: '中证全债指数'
    }, {
        code: 'H11009',
        name: '中证综合债券指数'
    }, {
        code: 'H11073',
        name: '中证信用债指数'
    }, {
        code: '000832',
        name: '中证可转换债券指数'
    // }, {
    //     code: 'DEPO1Y',
    //     name: '1Y定期存款利率曲线'
    // }, {
    //     code: 'DEPO2Y',
    //     name: '2Y定期存款利率曲线'
    // }, {
    //     code: 'DEPO3Y',
    //     name: '3Y定期存款利率曲线'
    // }, {
    //     code: 'DEPO4Y',
    //     name: '4Y定期存款利率曲线'
    // }, {
    //     code: 'DEPO5Y',
    //     name: '5Y定期存款利率曲线'
    }];

    return {
        cur: {
            rows: [{
                index: {
                    options: (function() {
                        var res = [];
                        angular.forEach(BENCHMARK_MAP, function (benchmarkIndex) {
                            res.push(benchmarkIndex.name);
                        });
                        return res;
                    })(),
                    selected: '中证全债指数'
                },
                bp: 0,
                weight: 100
            }],
            weight: 100,
            errMsg: ''
        },
        map: BENCHMARK_MAP
    };
});
angular.module('ias.account').factory('fundsIndices', function () {
    return {
        cur: [],
        tmp: []
    }
});
