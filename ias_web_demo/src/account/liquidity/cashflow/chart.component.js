import { IASCharts } from '../../../helper/IASCharts';

angular.module('ias.account').controller('cashflowCtrl', function ($scope, accountTable, filterParam, marketFilter, messageBox,
    winStatus, $timeout, $filter, uiGridExporterConstants, dateClass, datetimePickerConfig, CashflowWithType,
    accountConstant, authorityControl, user) {

    var cashflowChart = null;
    var cashflowData = {
        chart: {
            daily: []
        }
    }

    // 现金流-图: 可选申购赎回，默认为全部
    $scope.chartType = {
        groups: [
            { label: '全部', value: 'all' },
            { label: '申购/赎回', value: 'fund_purchase' },
        ],
        selected: 'all',
        handleChanged: function() {
            getDailyCashflowData(this.selected, dailyChartCallback);
        }
    };
    // 现金流-图: 区间日期间隔，默认区间间隔为：日
    $scope.period = {
        groups: [
            { label: '日', value: 'DD' },
            { label: '周', value: 'WW' },
            { label: '月', value: 'MM' },
        ],
        selected: 'DD',
        handleChanged: function() {
            if (cashflowChart) {
                cashflowChart.categoryAxesSettings.groupToPeriods = [this.selected];
                cashflowChart.validateData();
            }
        }
    };
    $scope.periodSelect = 'DD';
    $scope.selectPeriod = function (period) {
        $scope.periodSelect = period;
    };

    function drawDailyCashFlowChart(data) {
        var cashFlowChartConfig = {
            categoryAxesSettings: {
                groupToPeriods: [$scope.period.selected],
            },
            dataSets: [{
                title: "",
                fieldMappings: [{
                    fromField: "amount",
                    toField: "amount",
                }],
                dataProvider: data,
                categoryField: "date",
            }],
            panels: [{
                valueAxes: [{
                    id: "yieldAxis",
                    position: "left",
                }],
                showCategoryAxis: true,
                stockGraphs: [{
                    periodValue: "Sum",
                    title: "现金",
                    precision: 2,
                    valueField: "amount",
                    valueAxis: "amount",
                    type: "column",
                    useDataSetColors: false,
                    fillAlphas: 1,
                    fillColors: "#b63636",
                    lineColor: "#b63636",
                    negativeBase: 0,
                    negativeFillAlphas: 1,
                    negativeFillColors: "#449e5d",
                    negativeLineColor: "#449e5d",
                    balloonText: "<b>[[value]]</b>",
                }],
                stockLegend: {
                    periodValueTextRegular: "[[value]]",
                    color: "#878787",
                    marginRight: 100,
                    fontSize: 14,
                },
            }],
        };
        return IASCharts.drawChart('cashflowChart', cashFlowChartConfig);
    }
    function formatDailyCashflowChartData(data) {
        angular.forEach(data, function (value) {
            value.amount = value.amount;
        });
        return data;
    }
    function dailyChartCallback(data) {
        cashflowData.chart.daily = formatDailyCashflowChartData(data);
        cashflowChart = drawDailyCashFlowChart(cashflowData.chart.daily);
    }
    function getDailyCashflowData(type, callback) {
        if ($scope.winStatus.is_account_now && winStatus.cur_account_list.length === 0) {
            return;
        }

        CashflowWithType.post({
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            type: type
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                callback(data);
            }
        });
    }

    function getExportedChartData(data) {
        var formatedData = []
        angular.forEach(data, function (value) {
            formatedData.push({
                date: value.date,
                amount: $filter('commafyConvert')(value.amount)
            })
        });
        return formatedData;
    }
    $scope.onExportData = function (type) {
        if (type === 'chart') {
            $scope.fileName = $scope.getFileName('_现金表_图_' + ($scope.chartType.selected === 'fund_purchase' ? '申购赎回' : ''));
            return getExportedChartData(cashflowData.chart.daily);
        } else {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_现金表_');
            $scope.exportExcel($scope.gridApi.exporter);
        }
    };
    $scope.getCsvHeader = function () {
        return ['日期', '现金(万)'];
    };

    $scope.$on("refresh account", function () {
        getDailyCashflowData($scope.chartType.selected, dailyChartCallback);
    });

    this.$onInit = function () {
        getDailyCashflowData($scope.chartType.selected, dailyChartCallback);
    };

    $scope.$on('$destroy', function () {
        cashflowChart && cashflowChart.clear();
        $scope = null;
    });
});