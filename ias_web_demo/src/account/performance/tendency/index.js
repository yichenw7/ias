import angular from 'angular';
import { IASCharts } from '../../../helper/IASCharts';
import { BondAllocationMap } from '../../../helper/Bond';

angular.module('ias.account')
    .factory('StatisticsProfits', function ($resource, apiAddress) {
        return $resource(apiAddress + "/statistics/profits", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('StatisticsAssets', function ($resource, apiAddress) {
        return $resource(apiAddress + "/statistics/assets", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('StatisticsUnitAssets', function ($resource, apiAddress) {
        return $resource(apiAddress + "/statistics/unit_assets", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('StatisticsProfitAttribution', function ($resource, apiAddress) {
        return $resource( apiAddress + "/statistics/profit_attribution", {}, {
            post: {method: 'POST', params: {}}
        });
    })
angular.module('ias.account').controller('tendencyCtrl', function ($scope, $filter, chartDurations, winStatus,
    StatisticsProfitAttribution, filterParam, user, accountConstant,StatisticsAssets, StatisticsUnitAssets, StatisticsProfits, assetsDistribution, authorityControl) {
    $scope.unitAssetsData = [];

    function formatPerformAndRender(performanceData) {
        angular.forEach(performanceData, function (asset) {
            // asset.capital_gains = $filter('toYield')(asset.acc_yield - asset.acc_cost_yield);
            // asset.convergence_yield = $filter('toYield')(asset.acc_cost_yield - asset.acc_ai_yield);

            asset.acc_yield = $filter('toYield')(asset.acc_yield);
            asset.acc_ai_yield = $filter('toYield')(asset.acc_ai_yield);
            asset.acc_capital_yield = $filter('toYield')(asset.acc_capital_yield);
            asset.acc_maturity_yield = $filter('toYield')(asset.acc_maturity_yield);
            asset.acc_amortization_yield = $filter('toYield')(asset.acc_amortization_yield);
            asset.acc_floating_yield = $filter('toYield')(asset.acc_floating_yield);
        });
    }

    function formatUnitAndRender(data) {
        angular.forEach(data, function (asset) {
            asset.asset_total_change = (asset.asset_total_change != null ? (asset.asset_total_change / 10000) : 0).toFixed(2);
            asset.unit_asset_net = (asset.unit_asset_net != null ? asset.unit_asset_net : 0).toFixed(4);
            if (asset.ias_unit_asset_net === null) {
                delete asset.ias_unit_asset_net;
            }
        });
        if(data.length > 0) drawUnitAssetNet(data);
    }

    function getProfits() {
        if (winStatus.cur_account_list.length === 0) return;

        StatisticsProfits.post({
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                const data = response.data;
                angular.forEach(data, function (asset) {
                    asset.yield = $filter('toYield')(asset.yield);
                    asset.acc_yield = $filter('toYield')(asset.acc_yield);
                    asset.acc_yield_cost = $filter('toYield')(asset.acc_yield_cost);
                    asset.asset_net = (asset.asset_net != null ? (asset.asset_net / 10000) : 0).toFixed(2);
                    // 加权资金成本由于后台历史逻辑，这里不需要乘以100。
                    asset.target_cost = (asset.target_cost.toFixed(4));
                });
                drawProfitChart(data, $scope.profitTooltip);
            }
        });
    }
    function getAssets() {
        if (winStatus.cur_account_list.length === 0) return;

        StatisticsAssets.post({
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                const assetData = response.data;
                angular.forEach(assetData, function (asset) {
                    asset.asset_bond = (asset.asset_bond != null ? (asset.asset_bond / 10000) : 0).toFixed(2);
                    asset.asset_cash = (asset.asset_cash != null ? (asset.asset_cash / 10000) : 0 ).toFixed(2);
                    asset.asset_total = (asset.asset_total != null ? (asset.asset_total / 10000) : 0).toFixed(2);
                    asset.asset_net = (asset.asset_net != null ? (asset.asset_net / 10000) : 0).toFixed(2);
                    asset.capital_gains = (asset.acc_yield - asset.acc_cost_yield).toFixed(4);
                    asset.convergence_yield = (asset.acc_cost_yield - asset.acc_ai_yield).toFixed(4);
                });
                drawAssetChart(assetData, $scope.assetTooltip);
            }
        });
    }
    function getChartDuration() {
        chartDurations.get({
            account_id: filterParam.account_id,
            company_id: winStatus.cur_agent_company_id || user.company_id
        }, function success(response) {
            if (response.code && response.code === '0000') {
                drawDurationsChart(response.data);
            }
        });
    }
    function getUnitChart() {
        if (winStatus.cur_account_list.length === 0) return;

        StatisticsUnitAssets.post({
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                $scope.unitAssetsData = data;
                formatUnitAndRender($scope.unitAssetsData);
            }
        })
    }
    function getPerformance() {
        if (winStatus.cur_account_list.length === 0) return;

        StatisticsProfitAttribution.post({
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                var data = response.data;
                formatPerformAndRender(data);
                drawPerformanceAttributionChart(data, 'performanceChart');
            }
        });
    }

    /* 区间选择 S */
    var clearGuideLine = function (chart) {
        angular.forEach(chart.panels, function (panel) {
            panel.categoryAxis.guides = [];
        });
    };
    var generateMarkHandler = function (chart, data, tooltip) {
        return function () {
            tooltip.isShowGuideLine = !tooltip.isShowGuideLine;
            if (tooltip.isShowGuideLine) {
                angular.forEach(chart.panels, function (panel) {
                    var guide = new AmCharts.Guide();
                    guide.date = data[tooltip.startIndex].date;
                    guide.lineAlpha = 1;
                    guide.lineThickness = 2;
                    guide.lineColor = "#79ff4d";
                    panel.categoryAxis.guides = [guide];
                });
            } else {
                clearGuideLine(chart)
            }
            chart.validateData();
            tooltip.isShow = tooltip.isShowGuideLine;
            $scope.$apply();
        }
    };
    var zoomedHandler = function (tooltip, chart) {
        return function () {
            tooltip.isShowGuideLine = false;
            clearGuideLine(chart);
            chart.validateData();
            $scope.$apply();
        }
    };
    var movedHandler = function (data, tooltip) {
        return function (event) {
            if (tooltip.isShow) {
                tooltip.endIndex = event.index;
                tooltip.setContent(data);
                $scope.$apply();
            }
        }
    };
    var zoomStartedHandler = function (data, tooltip) {
        return function (event) {
            tooltip.isShow = true;
            tooltip.startIndex = event.index;
            $scope.$apply();
        }
    };
    var initEveryDivHandler = function (data, tooltip) {
        return function (event) {
            var chart = event.chart;
            angular.forEach(chart.panels, function (panel) {
                panel.chartCursor.addListener("zoomStarted", zoomStartedHandler(data, tooltip));
                panel.chartCursor.addListener("changed", movedHandler(data, tooltip));
                panel.chartCursor.addListener("zoomed", zoomedHandler(tooltip, chart));
                panel.chartDiv.onclick = generateMarkHandler(chart, data, tooltip);
            });
        }
    };

    function getAssetsDistribution(date) {
        assetsDistribution.post({
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: date,
        }, function success(response) {
            if (response.code === '0000') {
                $scope.unitAssetsPairs.data = response.data;
                $scope.unitAssetsPairs.date = response.date;
            }
        });
    }

    var initClickDivHandler = function() {
        return function (event) {
            var chart = event.chart;
            angular.forEach(chart.panels, function (panel) {
                panel.chartCursor.addListener("changed", function (e) {
                    chart.lastCursorPosition = e.index;
                });
                panel.chartDiv.addEventListener("click", function () {
                    if (chart.lastCursorPosition !== undefined) {
                        var guide = new AmCharts.Guide();
                        guide.date = panel.dataProvider[chart.lastCursorPosition][panel.categoryField];
                        guide.lineAlpha = 1;
                        guide.lineColor = "#79ff4d";
                        for (var i = 0; i < chart.panels.length; i++) {
                            chart.panels[i].categoryAxis.guides = [guide];
                        }
                        getAssetsDistribution($filter('date')(guide.date, 'yyyy-MM-dd'));
                        chart.validateData();
                        $scope.$apply();
                    }
                });
            });
        }
    };

    /* 区间选择 E */
    function drawPerformanceAttributionChart(data, id) {
        if (tendencyCharts.performance.chart) {
            tendencyCharts.performance.chart.dataSets[0].dataProvider = data;
            tendencyCharts.performance.chart.validateData();
        } else {
            tendencyCharts.performance.chart = IASCharts.drawChart(id, {
                dataSets: [{
                    title: "",
                    fieldMappings: [{
                        fromField: "acc_yield",
                        toField: "acc_yield",
                    }, {
                        fromField: "acc_ai_yield",
                        toField: "acc_ai_yield",
                    }, {
                        fromField: "acc_capital_yield",
                        toField: "acc_capital_yield",
                    }, {
                        fromField: "acc_maturity_yield",
                        toField: "acc_maturity_yield",
                    }, {
                        fromField: "acc_amortization_yield",
                        toField: "acc_amortization_yield",
                    }, {
                        fromField: "acc_floating_yield",
                        toField: "acc_floating_yield",
                    }],
                    dataProvider: data,
                    categoryField: "date"
                }],
                panels: [{
                    valueAxes: [{
                        id: "accYieldAxis",
                        zeroGridAlpha: 1,
                    }],
                    showCategoryAxis: true,
                    percentHeight: 50,
                    stockGraphs: [{
                        title: "累计收益(%)",
                        useDataSetColors: false,
                        lineColor: "#00b8ff",
                        type: "line",
                        lineThickness: 2,
                        precision: 4,
                        valueField: "acc_yield",
                        valueAxis: "accYieldAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "利息收益(%)",
                        useDataSetColors: false,
                        lineColor: "#b63636",
                        hidden: true,
                        type: "line",
                        lineThickness: 2,
                        precision: 4,
                        valueField: "acc_ai_yield",
                        valueAxis: "accYieldAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "买卖价差(%)",
                        fillAlphas: 0.7,
                        useDataSetColors: false,
                        lineColor: "#ffffff",
                        lineThickness: 2,
                        precision: 4,
                        fillColors: ["#00A0AF", "rgba(81,81,81,0.00)"],
                        negativeBase: 0,
                        negativeLineColor: "#ffffff",
                        negativeFillColors: ["rgba(81,81,81,0.00)", "#ff805c"],
                        type: "line",
                        bulletBorderAlpha: 1,
                        balloonText: "[[title]]：<b>[[value]]</b>",
                        valueField: "acc_capital_yield",
                        valueAxis: "accYieldAxis",
                    }, {
                        title: "持有到期收益(%)",
                        useDataSetColors: false,
                        lineColor: "#eeab1f",
                        type: "line",
                        lineThickness: 2,
                        precision: 4,
                        valueField: "acc_maturity_yield",
                        valueAxis: "accYieldAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "摊销收益(%)",
                        useDataSetColors: false,
                        lineColor: "#c74fa1",
                        hidden: true,
                        type: "line",
                        lineThickness: 2,
                        precision: 4,
                        valueField: "acc_amortization_yield",
                        valueAxis: "accYieldAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "浮动盈亏(%)",
                        // useDataSetColors: false,
                        // lineColor: "#0D4FB8",
                        hidden: true,
                        type: "line",
                        lineThickness: 2,
                        precision: 4,
                        valueField: "acc_floating_yield",
                        valueAxis: "accYieldAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }],
                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }]
            });
        }
    }
    function drawProfitChart(data, tooltip) {
        if (tendencyCharts.profit.chart) {
            tendencyCharts.profit.chart.dataSets[0].dataProvider = data;
            tendencyCharts.profit.chart.validateData();
        } else {
            tendencyCharts.profit.chart = IASCharts.drawChart("profitChart", {
                dataSets: [{
                    title: "",
                    fieldMappings: [{
                        fromField: "yield",
                        toField: "yield",
                    }, {
                        fromField: "acc_yield",
                        toField: "acc_yield",
                    }, {
                        fromField: "acc_yield_cost",
                        toField: "acc_yield_cost",
                    }, {
                        fromField: "asset_net",
                        toField: "asset_net",
                    }, {
                        fromField: "target_cost",
                        toField: "target_cost",
                    }],
                    dataProvider: data,
                    categoryField: "date",
                }],
                panels: [{
                    valueAxes: [{
                        id: "accYieldAxis",
                        zeroGridAlpha: 1,
                    }, {
                        id: "assetAxis",
                        position: "right",
                        minMaxMultiplier: 3,
                        gridAlpha: 0,
                    }],
                    showCategoryAxis: true,
                    percentHeight: 70,
                    stockGraphs: [{
                        title: "累计收益率(%)",
                        fillAlphas: 0.7,
                        useDataSetColors: false,
                        lineColor: "#ffffff",
                        lineThickness: 2,
                        fillColors: ["#00A0AF", "rgba(81,81,81,0.00)"],
                        negativeBase: 0,
                        negativeLineColor: "#ffffff",
                        negativeFillColors: ["rgba(81,81,81,0.00)", "#ff805c"],
                        type: "line",
                        bulletBorderAlpha: 1,
                        balloonText: "[[title]]：<b>[[value]]</b>",
                        valueField: "acc_yield",
                        valueAxis: "accYieldAxis"
                    }, {
                        title: "累计收益率(摊余成本法)(%)",
                        useDataSetColors: false,
                        precision: 4,
                        lineThickness: 2,
                        type: "line",
                        valueField: "acc_yield_cost",
                        valueAxis: "accYieldAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "净资产(万)",
                        useDataSetColors: false,
                        lineColor: "#00b8ff",
                        lineThickness: 2,
                        type: "line",
                        valueField: "asset_net",
                        valueAxis: "assetAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "加权资金成本",
                        useDataSetColors: false,
                        lineColor: "#eeab1f",
                        lineThickness: 2,
                        type: "line",
                        valueField: "target_cost",
                        valueAxis: "accYieldAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }],
                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }, {
                    valueAxes: [{
                        id: "yieldAxis",
                        position: "left",
                    }],
                    showCategoryAxis: true,
                    percentHeight: 30,
                    stockGraphs: [{
                        title: "每日收益率(%)",
                        valueField: "yield",
                        valueAxis: "yieldAxis",
                        type: "column",
                        precision: 4,
                        useDataSetColors: false,
                        fillAlphas: 1,
                        fillColors: "#b63636",
                        lineColor: "#b63636",
                        negativeBase: 0,
                        negativeFillAlphas: 1,
                        negativeFillColors: "#449e5d",
                        negativeLineColor: "#449e5d",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }],
                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        marginRight: 100,
                        fontSize: 14,
                    },
                }],
                listeners: [{
                    event: "init",
                    method: initEveryDivHandler(data, tooltip),
                }],
            });
        }
    }
    function drawAssetChart(data, tooltip) {
        if (tendencyCharts.asset.chart) {
            tendencyCharts.asset.chart.dataSets[0].dataProvider = data;
            tendencyCharts.asset.chart.validateData();
        } else {
            tendencyCharts.asset.chart = IASCharts.drawChart("assetChart", {
                // categoryAxesSettings: {
                //     groupToPeriods: ["DD", "WW", "MM", "YYYY"],
                //     maxSeries: 90,
                // },
                dataSets: [{
                    title: "",
                    fieldMappings: [{
                        fromField: "asset_total",
                        toField: "asset_total",
                    }, {
                        fromField: "total_to_net",
                        toField: "total_to_net",
                    }, {
                        fromField: "asset_cash",
                        toField: "asset_cash",
                    }, {
                        fromField: "asset_bond",
                        toField: "asset_bond",
                    }],
                    dataProvider: data,
                    categoryField: "date",
                }],
                panels: [{
                    valueAxes: [{
                        id: "assetAxis",
                        gridAlpha: 0,
                    }],
                    showCategoryAxis: true,
                    percentHeight: 70,
                    stockGraphs: [{
                        title: "总资产(万)",
                        useDataSetColors: false,
                        lineAlpha: 0,
                        type: "line",
                        fillColors: '#123f9e',
                        fillAlphas: 0.8,
                        valueField: "asset_total",
                        valueAxis: "assetAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "债券(万)",
                        useDataSetColors: false,
                        lineAlpha: 0,
                        type: "line",
                        fillColors: '#009fff',
                        fillAlphas: 0.8,
                        valueField: "asset_bond",
                        valueAxis: "assetAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "现金(万)",
                        useDataSetColors: false,
                        lineAlpha: 0,
                        type: "line",
                        fillColors: '#4ae3be',
                        fillAlphas: 0.8,
                        valueField: "asset_cash",
                        valueAxis: "assetAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }],
                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }, {
                    valueAxes: [{
                        id: "ratioAxis",
                        zeroGridAlpha: 1,
                    }],
                    showCategoryAxis: true,
                    percentHeight: 30,
                    stockGraphs: [{
                        title: "杠杆率(%)",
                        useDataSetColors: false,
                        lineColor: "#FF9200",
                        lineThickness: 2,
                        type: "line",
                        valueField: "total_to_net",
                        valueAxis: "ratioAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }],
                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }],
                listeners: [{
                    event: "init",
                    method: initEveryDivHandler(data, tooltip),
                }],
            });
        }
    }
    function drawDurationsChart(data) {
        if (tendencyCharts.dv01.chart) {
            tendencyCharts.dv01.chart.dataSets[0].dataProvider = data;
            tendencyCharts.dv01.chart.validateData();
        } else {
            tendencyCharts.dv01.chart = IASCharts.drawChart("dv01Chart", {
                categoryAxesSettings: {
                    groupToPeriods: ["DD", "WW", "MM", "YYYY"],
                    maxSeries: 90,
                },
                dataSets: [{
                    title: "",
                    fieldMappings: [{
                        fromField: "duration",
                        toField: "duration",
                    }, {
                        fromField: "pvbp",
                        toField: "pvbp",
                    }],
                    dataProvider: data,
                    categoryField: "date",
                }],
                panels: [{
                    valueAxes: [{
                        id: "leftAxis",
                        zeroGridAlpha: 1,
                    }, {
                        id: "rightAxis",
                        position: "right",
                        gridAlpha: 0,
                    }],
                    showCategoryAxis: true,
                    stockGraphs: [{
                        title: "DV01",
                        useDataSetColors: false,
                        valueField: "pvbp",
                        valueAxis: "rightAxis",
                        type: "column",
                        precision: 2,
                        fillAlphas: 1,
                        fillColors: "#ff7d00",
                        lineColor: "#ff7d00",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "久期",
                        useDataSetColors: false,
                        lineColor: "#00b8ff",
                        lineThickness: 2,
                        precision: 4,
                        type: "line",
                        valueField: "duration",
                        valueAxis: "leftAxis",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }],
                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }],
            });
        }
    }
    function drawUnitAssetNet(data) {
        if (tendencyCharts.netValue.chart) {
            tendencyCharts.netValue.chart.dataSets[0].dataProvider = data;
            tendencyCharts.netValue.chart.validateData();
        } else {
            tendencyCharts.netValue.chart = IASCharts.drawChart("netValueChart", {
                panelsSettings: {
                    marginLeft: 100,
                    marginRight: 50,
                },
                dataSets: [{
                    fieldMappings: [{
                        fromField: "unit_asset_net",
                        toField: "unit_asset_net",
                    }, {
                        fromField: "unit_asset_net_cost",
                        toField: "unit_asset_net_cost",
                    }, {
                        fromField: "ias_unit_asset_net",
                        toField: "ias_unit_asset_net",
                    }, {
                        fromField: "acc_unit_asset_net",
                        toField: "acc_unit_asset_net",
                    }, {
                        fromField: "acc_unit_asset_net_cost",
                        toField: "acc_unit_asset_net_cost",
                    }, {
                        fromField: "asset_total_change",
                        toField: "asset_total_change",
                    }],
                    dataProvider: data,
                    categoryField: "date",
                }],
                panels: [{
                    percentHeight: 70,
                    stockGraphs: [{
                        title: "单位净值",
                        useDataSetColors: false,
                        precision: 4,
                        lineColor: "#00b8ff",
                        lineThickness: 2,
                        type: "line",
                        valueField: "unit_asset_net",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "单位净值(摊余成本法)",
                        useDataSetColors: false,
                        precision: 4,
                        lineThickness: 2,
                        type: "line",
                        valueField: "unit_asset_net_cost",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "IAS单位净值",
                        useDataSetColors: false,
                        lineThickness: 2,
                        precision: 4,
                        type: "line",
                        valueField: "ias_unit_asset_net",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "累计单位净值",
                        useDataSetColors: false,
                        precision: 4,
                        lineThickness: 2,
                        type: "line",
                        valueField: "acc_unit_asset_net",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }, {
                        title: "累计单位净值(摊余成本法)",
                        useDataSetColors: false,
                        precision: 4,
                        lineThickness: 2,
                        type: "line",
                        valueField: "acc_unit_asset_net_cost",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }],
                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }, {
                    percentHeight: 30,
                    stockGraphs: [{
                        title: "总资产变动(万)",
                        valueField: "asset_total_change",
                        type: "column",
                        useDataSetColors: false,
                        fillAlphas: 1,
                        hidded: true,
                        fillColors: "#b63636",
                        lineColor: "#b63636",
                        negativeBase: 0,
                        negativeFillAlphas: 1,
                        negativeFillColors: "#449e5d",
                        negativeLineColor: "#449e5d",
                        balloonText: "[[title]]：<b>[[value]]</b>",
                    }],
                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }],
                listeners: [{
                    event: "init",
                    method: initClickDivHandler(),
                }],
            });
        }
    }

    $scope.profitTooltip = {
        isShow: false,
        isShowGuideLine: false,
        startIndex: '',
        endIndex: '',
        leftIndex: '',
        rightIndex: '',
        duration: '',                   // 持续时间
        accYield: '',                   // 收益率差值
        volatility: '',                 // 收益率波动
        drawdown: '',                   // 最大回撤率
        setContent: function (data) {
            var isLeftToRight = this.startIndex < this.endIndex;
            this.leftIndex = isLeftToRight ? this.startIndex : this.endIndex;
            this.rightIndex = isLeftToRight ? this.endIndex : this.startIndex;

            if (this.leftIndex && this.rightIndex) {
                this.setDuration();
                this.setAsset(data);
                this.setVolatility(data);
                this.setDrawdown(data);
            }
        },
        setDuration: function () {
            this.duration = this.rightIndex - this.leftIndex + 1;
        },
        setAsset: function (data) {
            this.leftAsset = data[this.leftIndex].asset_net;
            this.rightAsset = data[this.rightIndex].asset_net;
            this.deltaAsset = this.rightAsset - this.leftAsset;
        },
        setVolatility: function (data) {
            var leftAccYield = parseFloat(data[this.leftIndex].acc_yield);
            var rightAccYield = parseFloat(data[this.rightIndex].acc_yield);

            var duration = this.duration;

            // 计算均值
            var i, sum = 0, variance = 0;
            for (i = 0; i < duration; i++) {
                sum += data[this.leftIndex + i].acc_yield;
            }
            var mean = sum / duration;

            // 计算方差
            for (i = 0; i < duration; i++) {
                variance += Math.pow(data[this.leftIndex + i].acc_yield - mean, 2);
            }
            var volatility = Math.sqrt(variance / duration);

            this.accYield = rightAccYield - leftAccYield;
            this.volatility = volatility * 100;           // 百分号显示，故将计算值乘以100
        },
        setDrawdown: function (data) {
            var intervalYields = [];  // 存储每日收益率的差值
            var i, len;
            for (i = this.leftIndex, len = this.rightIndex; i <= len; i++) {
                intervalYields.push(parseFloat(data[i].yield));
            }

            var maxGap = 0, tmpGap = 0;
            for (i = 0, len = intervalYields.length; i < len; i++) {
                if (intervalYields[i] >= 0) {
                    tmpGap = 0;
                } else {
                    tmpGap += intervalYields[i];
                }
                maxGap = Math.min(tmpGap, maxGap);
            }
            this.drawdown = maxGap === 0 ? '--' : maxGap.toFixed(4) + '%';
        }
    };
    $scope.assetTooltip = {
        isShow: false,
        isShowGuideLine: false,
        startIndex: '',
        endIndex: '',
        leftIndex: '',
        rightIndex: '',
        duration: '',                   // 持续时间
        leftAsset: '',
        rightAsset: '',
        deltaAsset: '',
        leftBond: '',
        rightBond: '',
        deltaBond: '',
        leftCash: '',
        rightCash: '',
        deltaCash: '',
        leftAssetTotal: '',
        rightAssetTotal: '',
        deltaAssetTotal: '',
        setContent: function (data) {
            var isLeftToRight = this.startIndex < this.endIndex;
            this.leftIndex = isLeftToRight ? this.startIndex : this.endIndex;
            this.rightIndex = isLeftToRight ? this.endIndex : this.startIndex;

            if (this.leftIndex && this.rightIndex) {
                this.setDuration();
                this.setAsset(data);
                this.setBond(data);
                this.setCash(data);
                this.setAssetTotal(data);
            }
        },
        setDuration: function () {
            this.duration = this.rightIndex - this.leftIndex + 1;
        },
        setAsset: function (data) {
            this.leftAsset = data[this.leftIndex].asset_net;
            this.rightAsset = data[this.rightIndex].asset_net;
            this.deltaAsset = this.rightAsset - this.leftAsset;
        },
        setBond: function (data) {
            this.leftBond = data[this.leftIndex].asset_bond;
            this.rightBond = data[this.rightIndex].asset_bond;
            this.deltaBond = this.rightBond - this.leftBond;
        },
        setCash: function (data) {
            this.leftCash = data[this.leftIndex].asset_cash;
            this.rightCash = data[this.rightIndex].asset_cash;
            this.deltaCash = this.rightCash - this.leftCash;
        },
        setAssetTotal: function (data) {
            this.leftAssetTotal = data[this.leftIndex].asset_total;
            this.rightAssetTotal = data[this.rightIndex].asset_total;
            this.deltaAssetTotal = this.rightAssetTotal - this.leftAssetTotal;
        }
    };
    $scope.unitAssetsPairs = {
        data: [],
        pairs: BondAllocationMap
    };

    let tendencyChartName = 'profit';
    // 缓存 amcharts 绘制的结果，防止重复绘制导致内存泄漏
    const tendencyCharts = {
        performance: {
            name: '收益分解图',
            handler: getPerformance,
            chart: null
        },
        profit: {
            name: '收益图',
            handler: getProfits,
            chart: null
        },
        asset: {
            name: '资产图',
            handler: getAssets,
            chart: null
        },
        dv01: {
            name: '敞口图',
            handler: getChartDuration,
            chart: null
        },
        netValue: {
            name: '净值图',
            handler: getUnitChart,
            chart: null
        },
    }
    $scope.hanldeTendencySelected = function(chart) {
        tendencyChartName = chart;
        const handler = tendencyCharts[chart].handler;
        if (!handler) return;
        handler();
    }

    $scope.$on('asset_chart tab clicked', function () {
        $scope.hanldeTendencySelected(tendencyChartName);
    });

    $scope.onExportData = function(){
        $scope.fileName = `${winStatus.current_name}_业绩趋势_${tendencyCharts[tendencyChartName].name}.csv`;
        const chart = tendencyCharts[tendencyChartName].chart;
        const data = chart ? chart.dataSets[0].dataProvider : [];
        return data;
    };

    /**
     * 从Amchart中读取字段的中文名
     * @param {Amchart} chart amchart对象
     * @param {String} field  待查询字段名
     */
    function getFieldName(chart, field) {
        if (field === 'date') return '日期';

        let name = '';
        const panels = chart.panels;
        panels.forEach(panel => {
            panel.stockGraphs.forEach(graph => {
                if (graph.valueField === field) {
                    name = graph.title;
                }
            })
        })
        return name
    }

    function getCurColumnsMap() {
        const chart = tendencyCharts[tendencyChartName].chart
        const data = chart ? chart.dataSets[0].dataProvider[0] : {};

        const columnsMap = [];

        Object.keys(data).forEach(key => {
            const field = getFieldName(chart, key);
            if (field) {
                columnsMap.push({
                    key: key,
                    field: field,
                });
            }
        })

        return columnsMap;
    }

    $scope.getCsvColumnOrder = function() {
        return getCurColumnsMap().map(item => item.key);
    }

    $scope.getCsvHeader = function() {
        return getCurColumnsMap().map(item => item.field);
    }
});
