import {
    formatData,
    drawSerialChart,
} from './leverage.helper';

angular.module('ias.account').controller('leverageCtrl', function ($scope, performanceLeverage, winStatus, accountService, dateClass, authorityControl, messageBox) {
    function getLeverageData() {
        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        performanceLeverage.post({
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            begin_date: $scope.selectedDate.startDate,
            end_date: $scope.selectedDate.endDate
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.leverageData = response.data;
                $scope.leverageData = formatData($scope.leverageData);
                drawYieldChart($scope.leverageData);
                drawDurationChart($scope.leverageData);
                // drawAnnualizedIncomeChart($scope.leverageData);
            } else {
                $scope.leverageData = null;
            }
        });
    };
    function drawYieldChart(data) {
        let yieldData = [
            { type: '成本收益率(%)', value: data.yield_cost, leverage: data.yield_cost_leverage },
            { type: '成本收益率-行权(%)', value: data.yield_2e_cost, leverage: data.yield_2e_cost_leverage },
            { type: '估值收益率(%)', value: data.yield, leverage: data.yield_leverage },
            { type: '估值收益率-到期(%)', value: data.yield_2m, leverage: data.yield_2m_leverage },
            { type: '估值收益率-行权(%)', value: data.yield_2e, leverage: data.yield_2e_leverage },
        ];
        let yieldConfig = {
            dataProvider: yieldData,
            categoryField: "type",
            valueAxes: [{
                id: "yieldAxis",
                position: 'left',
            }],
            graphs: [{
                valueField: "value",//纵坐标名字  
                balloonText: "[[category]](杠杆前): <b>[[value]]</b>",//气球  
                type: "column",//表示是一个柱状图  
                lineAlpha: 0.9,
                fillAlphas: 0.8,
                negativeFillAlphas: 1,
                columnWidth: 0.7,
                lineColor: "#00b8ff",
                valueAxis: "yieldAixs",
            }, {
                valueField: "leverage",//纵坐标名字  
                balloonText: "[[category]](杠杆后): <b>[[value]]</b>",//气球  
                type: "column",//表示是一个柱状图  
                lineAlpha: 0.9,
                fillAlphas: 1,
                negativeFillAlphas: 1,
                columnWidth: 0.7,
                lineColor: "#ff7d00",
                valueAxis: "yieldAxis",
            }],
            chartCursor: {
                cursorAlpha: 0,
                zoomable: false,
                categoryBalloonEnabled: false,
            },
        }
        drawSerialChart("yieldChart", yieldConfig);
    };
    function drawDurationChart(data) {
        let durationData = [
            { type: '修正久期', value: data.duration, leverage: data.duration_leverage },
            { type: '修正久期(到期)', value: data.duration_2m, leverage: data.duration_2m_leverage },
            { type: '修正久期(行权)', value: data.duration_2e, leverage: data.duration_2e_leverage },
        ];
        let durationConfig = {
            dataProvider: durationData,
            categoryField: "type",
            valueAxes: [{
                id: "durationAxis",
                position: 'left',
            }],
            graphs: [{
                valueField: "value",//纵坐标名字  
                balloonText: "[[category]](杠杆前): <b>[[value]]</b>",//气球  
                type: "column",//表示是一个柱状图  
                lineAlpha: 0.9,
                fillAlphas: 0.8,
                negativeFillAlphas: 1,
                columnWidth: 0.7,
                lineColor: "#00b8ff",
                valueAxis: "durationAixs",
            }, {
                valueField: "leverage",//纵坐标名字  
                balloonText: "[[category]](杠杆后): <b>[[value]]</b>",//气球  
                type: "column",//表示是一个柱状图  
                lineAlpha: 0.9,
                fillAlphas: 1,
                negativeFillAlphas: 1,
                columnWidth: 0.7,
                lineColor: "#ff7d00",
                valueAxis: "durationAxis",
            }],
            chartCursor: {
                cursorAlpha: 0,
                zoomable: false,
                categoryBalloonEnabled: false,
            },
        };
        drawSerialChart("durationChart",durationConfig);
    };
    // function drawAnnualizedIncomeChart(data) {
    //     let chartData = [
    //         { type: '票息收益', value: data.coupon_yield, color: '#b63636'},
    //         { type: '收敛收益', value: data.amortizing_yield, color: '#449e5d'},
    //         { type: '杠杆收益', value: data.leverage_yield, color: '#eeab1f'},
    //         { type: '资本利得', value: data.capital_yield, color: '#ff7d00'},
    //         { type: '总收益', value: data.annualized_acc_yield, color: '#00b8ff'},
    //     ];
    //     let annualizedIncomeConfig = {
    //         dataProvider: chartData,
    //         categoryField: "type",
    //         valueAxes: [{
    //             id: "axis",
    //             position: 'left',
    //             zeroGridAlpha: 5,
    //         }],
    //         graphs: [{
    //             valueField: "value",//纵坐标名字  
    //             balloonText: "[[category]]: <b>[[value]]</b>",//气球  
    //             type: "column",//表示是一个柱状图  
    //             lineAlpha: 0.9,
    //             fillAlphas: 0.8,
    //             lineColor: "color",
    //             colorField: "color",
    //             valueAxis: "axis",
    //         }],
    //         chartCursor: {
    //             cursorAlpha: 0,
    //             zoomable: false,
    //             categoryBalloonEnabled: false,
    //         },
    //     };
    //     drawSerialChart("annualizedIncomeChart",annualizedIncomeConfig);
    // }
    $scope.LeverageDateChange = function() {
        $scope.selectedDate.onChange();
        getLeverageData();
    }
    $scope.$on('performance_leverage tab clicked', function () {
        getLeverageData();
    });

    $scope.$on('$destroy', function () {
        $scope = null;
    })
})