import {IASCharts} from '../../helper/IASCharts';
import moment from 'moment';

angular.module('ias.account')
    .factory('fundInformation', function ($resource, $q, apiAddress) {
        return {
            getData: function (params) {
                let defer = $q.defer();
                $resource(apiAddress + `/fund/${params.fund_code}`, {}, {
                    get: {method: 'GET', params: {}}
                }).get({}, function (response) {
                    defer.resolve(response);
                }, function (data) {
                    defer.reject(data);
                });
                return defer.promise;
            }
        }
    })

    .factory('fundQuotation', function ($resource, $q, apiAddress) {
        return {
            getData: (params) => {
                let defer = $q.defer();
                $resource(apiAddress + "/fund_quotation_series", {}, {
                    get: {method: 'POST', params: {}}
                }).get(params, (data, headers) => {
                    defer.resolve(data);
                }, (data, headers) => {
                    defer.reject(data);
                });
                return defer.promise
            }
        }
    })

    .factory('fundTrades', function ($resource, $q, apiAddress) {
        return {
            getData: params => {
                let defer = $q.defer();
                $resource(apiAddress + "/account_group/ffffffffffffffffffffffffffffffff/trades", {}, {
                        post: {
                            method: 'POST', params: {}
                        }
                    }
                ).post(params, (data, headers) => {
                    defer.resolve(data);
                }, (data, headers) => {
                    defer.reject(data);
                });
                return defer.promise
            }
        }
    })

    .factory('workdays', ($resource, $q, apiAddress) => {
        return {
            getData: (params) => {
                let defer = $q.defer();
                $resource(apiAddress + '/workday_info', {}, {
                    get: {method: 'GET', params: {}}
                }).get(params, (data) => {
                    defer.resolve(data);

                }, (data) => {
                    defer.reject(data);
                });
                return defer.promise;
            }
        }
    })

angular.module('ias.account').controller('traceFundCtrl', ($scope, $q, user, authorityControl, winStatus, fundInformation, fundQuotation, fundTrades, workdays) => {

    let id;
    let fundQuotationParams;
    let fundTradesParams;
    let company_id;
    let account_list;
    let earliestTradedate;
    let latest_workday_before_today;
    let today;
    let workdaysParams;
    let fund_type;
    let fundBasicParams;

    // 导出
    $scope.getCsvHeader = function () {
        let exportCsvHeader = setExportHeader();
        return exportCsvHeader;
    };

    $scope.onExportData = function () {
        let exportRenderedData;
        $scope.fileName = $scope.getFileName('_基金_历史数据_', $scope.accountSelectedDate);
        exportRenderedData = setExportData();
        return exportRenderedData;
    };

    function setExportHeader() {
        let header;
        if (fund_type === 'otc_fund') {
            header = [
                '日期',
                '单位净值',
                '累计净值',
                '涨跌幅(%)'];

        } else if (fund_type === 'exchange_fund') {
            header = [
                '日期',
                '单位净值',
                '分红',
                '涨跌幅(%)'];
        } else if (fund_type === 'money_fund') {
            header = [
                '日期',
                '万份收益',
                '年化收益'];
        }

        return  header;
    }

    function setExportData() {
        let data = [];


        for (let item of $scope.quotationData) {
            let _item;
            if (fund_type === 'otc_fund') {
                 _item = {
                    date: item.date,
                    accum_net: item.accum_net,
                    unit_net: item.unit_net,
                    chng_pct: item.chng_pct,
                }
            } else if (fund_type === 'exchange_fund') {
                 _item = {
                     date: item.date,
                     tclose: item.tclose,
                     div: item.div,
                     chng_pct: item.chng_pct,
                }
            } else if (fund_type === 'money_fund') {
                 _item = {
                     date: item.date,
                     tenthou_unit_incm: item.tenthou_unit_incm,
                     year_yld: item.year_yld,
                }
            }
            data.push(_item);
        }
        return  data;
    }

    $scope.$on('fundBroadcast', (event, msg) => {
        company_id = user.company_id;
        account_list = authorityControl.getAccountGroupMember(winStatus.cur_account_list);

        let fund_code = msg.fund_code;
        let fund_name = msg.fund_name;
        $scope.fund_code = fund_code;
        $scope.fund_name = fund_name;

        fundQuotationParams = {
            fund_code: fund_code,
        };
        fundTradesParams = {
            type: "fund",
            fund_code: fund_code,
            account_group_id: "ffffffffffffffffffffffffffffffff",
            company_id: company_id,
            account_list: account_list,
            intraday_average: true
        };

        //获取工作日时间
        workdaysParams = {
            market: $scope.bondExchange ? 'exchange' : 'interbank',
            from_date: moment().add(-1, 'year').format('YYYY-MM-DD'),
            to_date: moment().format('YYYY-MM-DD')
        };

        fundBasicParams = {
            fund_code: fund_code
        }

        getfundBasic(fundBasicParams);
        setChart();

    });

    async function setChart() {
        let workdaysResult = await workdays.getData(workdaysParams);
        latest_workday_before_today = workdaysResult.data.latest_workday_before_today;
        today = workdaysResult.data.today;
        let fundTresult = await fundTrades.getData(fundTradesParams);


        if (fundTresult.data && Array.isArray(fundTresult.data) && fundTresult.data.length > 0) {
            earliestTradedate = fundTresult.data[fundTresult.data.length - 1].trade_date;
        }
        if (earliestTradedate) {
            fundQuotationParams.from_date = earliestTradedate;
        } else {
            fundQuotationParams.from_date = moment(latest_workday_before_today).add(-2, 'year').format('YYYY-MM-DD');
        }
        fundQuotationParams.to_date = latest_workday_before_today;
        let fundQresult = await fundQuotation.getData(fundQuotationParams);

        // 基金类型
        fund_type = fundQresult.data.fund_type;
        if (fund_type === 'otc_fund') {
            id = 'FundHistoryChart';
            $('#traceFund').modal('show');

        } else if (fund_type === 'exchange_fund') {
            id = 'exchangeFundHistoryChart';
            $('#traceExchangeFund').modal('show');
        } else if (fund_type === 'money_fund') {
            id = 'moneyFundHistoryChart';
            $('#traceMoneyFund').modal('show');
        }

        formatHistoryRender(fundQresult, fundTresult);
    }

    function getfundBasic(params) {

        fundInformation.getData(params).then(response => {
            let data;
            if (response.code && response.code === '0000') {
                data = response.data;
            }
            let fundtype;
            switch (data.type) {
                case 0:
                    fundtype = '其他';
                    break;
                case 1:
                    fundtype = '股票型';
                    break;
                case 2:
                    fundtype = '债券型';
                    break;
                case 3:
                    fundtype = '混合型';
                    break;
                case 4:
                    fundtype = '货币型';
                    break;
                case 5:
                    fundtype = 'EIF联接基金';
                    break;
                case 6:
                    fundtype = 'FOF';
                    break;
            }
            $scope.fundInformation = {
                fundtype: fundtype,                                                      // 剩余期限
            }
        });
    }

    function formatHistoryRender(_vArrCom, _arrTrades) {
        let stockEvents = [];
        let data = [];
        let lastDataMap = new Map();
        if (Array.isArray(_vArrCom.data.quotation_series) && _vArrCom.data.quotation_series.length > 0) {
            $scope.quotationData = [];
            for (let item of _vArrCom.data.quotation_series) {
                let _item = Object.assign([], item)
                _item.date = _item.date.substring(2, _item.date.length);
                $scope.quotationData.push(_item);
            }
            $scope.quotationData.reverse();

            if (fund_type === 'otc_fund') {
                // 设置基本信息单位净值、累计单位净值字段
                $scope.fundInformation.unit_net = _vArrCom.data.quotation_series[_vArrCom.data.quotation_series.length - 1].unit_net;
                $scope.fundInformation.accum_net = _vArrCom.data.quotation_series[_vArrCom.data.quotation_series.length - 1].accum_net;

            } else if (fund_type === 'exchange_fund') {
                $scope.fundInformation.tclose = _vArrCom.data.quotation_series[_vArrCom.data.quotation_series.length - 1].tclose;

            } else if (fund_type === 'money_fund') {
                $scope.fundInformation.tenthou_unit_incm = _vArrCom.data.quotation_series[_vArrCom.data.quotation_series.length - 1].tenthou_unit_incm;
                $scope.fundInformation.year_yld = _vArrCom.data.quotation_series[_vArrCom.data.quotation_series.length - 1].year_yld;

            }
            $scope.$apply();

          data = _vArrCom.data.quotation_series.map((val, index) => {

                let _lastData;
                if (fund_type === 'otc_fund') {
                    _lastData = {
                        unit_net: val.unit_net,
                        chng_pct: val.chng_pct,
                        div: val.div


                    }
                } else if (fund_type === 'exchange_fund') {
                    _lastData = {
                        tclose: val.tclose,
                        chng_pct: val.chng_pct,

                    }
                } else if (fund_type === 'money_fund') {
                    _lastData = {
                        tenthou_unit_incm: val.tenthou_unit_incm,
                    }
                }

                for (let key in val) {
                    let value = val[key];
                    if (val[key] !== null) {
                        lastDataMap.set(key, value);
                    } else {
                        _lastData[key] = lastDataMap.get(key);
                    }
                }

                if (fund_type === 'otc_fund') {
                    return {
                        date: new Date(val.date),
                        chng_pct: _lastData.chng_pct,
                        unit_net: _lastData.unit_net,
                        accum_net: _lastData.accum_net,
                        div: val.div

                    }
                } else if (fund_type === 'exchange_fund') {
                    return {
                        date: new Date(val.date),
                        chng_pct: _lastData.chng_pct,
                        tclose: _lastData.tclose,
                        div: val.div

                    }
                } else if (fund_type === 'money_fund') {
                    return {
                        date: new Date(val.date),
                        tenthou_unit_incm: _lastData.tenthou_unit_incm,
                        div: val.div
                    }
                }
            });

        }
        if ($scope.cur_account_trade_option === $scope.ACCOUNT_TRADE_VIEW && Array.isArray(_arrTrades.data) && _arrTrades.data.length > 0) {
            _arrTrades.data.forEach((val) => {
                let stockEvent = {
                    date: new Date(val.trade_date),
                    type: "sign",
                    backgroundColor: val.direction === 1 ? "#037ac9" : "#e07500",
                    graph: "g1",
                    text: val.direction === 1 ? "B" : "S",
                    description: `日期 ${val.trade_date}
                        成交量 ${val.volume / 1000}K
                        价格 ${val.price ? val.price : '--' }`
                }
                stockEvents.push(stockEvent);
            })
        }
        drawHistory(data, stockEvents, id);
    }

    function drawHistory(data, stockEvents, id) {

        if (fund_type === 'otc_fund') {

            IASCharts.drawChart(id, {
                panelsSettings: {
                    marginLeft: 100,
                    marginRight: 50,
                },
                dataSets: [{
                    fieldMappings: [{
                        fromField: "unit_net",
                        toField: "unit_net",
                    }, {
                        fromField: "accum_net",
                        toField: "accum_net",
                    },{
                        fromField:'chng_pct',
                        toField:'chng_pct',
                    }, {
                        fromField: "div",
                        toField: "div",
                    }],
                    dataProvider: data,
                    // EVENTS
                    stockEvents: stockEvents,
                    categoryField: "date",
                }],
                panels: [{

                    valueAxes: [{
                        id: "unit_netId",
                        zeroGridAlpha: 1,
                    }, {
                        id: "chng_pctId",
                        position: "right",
                        minMaxMultiplier: 3,
                        gridAlpha: 0,
                    }],
                    percentHeight: 70,
                    stockGraphs: [
                        {
                            id: "g1",
                            title: '单位净值',
                            useDataSetColors: false,
                            precision: 4,
                            lineColor: "#DC4444",
                            lineThickness: 2,
                            type: "line",
                            valueField: "unit_net",
                            valueAxis: "unit_netId",
                            balloonText: "[[title]]：<b>[[value]]</b>",
                        },
                        {
                            title: "涨跌幅",
                            useDataSetColors: false,
                            precision: 4,
                            lineColor: "#FFC96C",
                            lineThickness: 2,
                            type: "line",
                            valueField: "chng_pct",
                            valueAxis: "chng_pctId",
                            balloonText: "[[title]]：<b>[[value]]</b>",
                        }
                    ],

                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }, {
                    percentHeight: 30,
                    stockGraphs: [{
                        title: "分红",
                        valueField: "div",
                        type: "column",
                        useDataSetColors: false,
                        fillAlphas: 1,
                        // hidded: true,
                        lineColor: "#548a3e",
                        fillColors: "#548a3e",
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
                // panelsSettings: {
                //     usePrefixes: true
                // },
                periodSelector: {
                    fromText: '日期：',
                    toText: ' - ',
                    periodsText: '',
                    position: "bottom",
                    dateFormat: 'YYYY-MM-DD',
                    periods: [{
                        period: "MM",
                        count: 1,
                        label: "近1月"
                    }, {
                        period: "YYYY",
                        count: 1,
                        label: "近1年"
                    }, {
                        period: "YTD",
                        label: "今年"
                    }, {
                        period: "MAX",
                        selected: true,
                        label: "全部"
                    }]
                },
            });
        } else if (fund_type === 'exchange_fund') {
            IASCharts.drawChart(id, {
                panelsSettings: {
                    marginLeft: 100,
                    marginRight: 50,
                },
                dataSets: [{
                    fieldMappings: [{
                        fromField: "tclose",
                        toField: "tclose",
                    }, {
                        fromField: "chng_pct",
                        toField: "chng_pct",
                    }, {
                        fromField: "div",
                        toField: "div",
                    }],
                    dataProvider: data,
                    // EVENTS
                    stockEvents: stockEvents,
                    categoryField: "date",
                }],
                panels: [{
                    valueAxes: [{
                        id: "tcloseId",
                        zeroGridAlpha: 1,
                    }, {
                        id: "chng_pctId",
                        position: "right",
                        minMaxMultiplier: 3,
                        gridAlpha: 0,
                    }],
                    percentHeight: 70,
                    stockGraphs: [
                        {
                            id: "g1",
                            title: '单位净值',
                            useDataSetColors: false,
                            precision: 4,
                            lineColor: "#DC4444",
                            lineThickness: 2,
                            type: "line",
                            valueField: "tclose",
                            valueAxis: "tcloseId",
                            balloonText: "[[title]]：<b>[[value]]</b>",
                        },
                        {
                            title: "涨跌幅",
                            useDataSetColors: false,
                            precision: 4,
                            lineColor: "#FFC96C",
                            lineThickness: 2,
                            type: "line",
                            valueField: "chng_pct",
                            valueAxis: "chng_pctId",
                            balloonText: "[[title]]：<b>[[value]]</b>",
                        }
                    ],

                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }, {
                    percentHeight: 30,
                    stockGraphs: [{
                        title: "分红",
                        valueField: "div",
                        type: "column",
                        useDataSetColors: false,
                        fillAlphas: 1,
                        // hidded: true,
                        fillColors: "#548a3e",
                        lineColor: "#548a3e",
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
                // panelsSettings: {
                //     usePrefixes: true
                // },
                periodSelector: {
                    fromText: '日期：',
                    toText: ' - ',
                    periodsText: '',
                    position: "bottom",
                    dateFormat: 'YYYY-MM-DD',
                    periods: [{
                        period: "MM",
                        count: 1,
                        label: "近1月"
                    }, {
                        period: "YYYY",
                        count: 1,
                        label: "近1年"
                    }, {
                        period: "YTD",
                        label: "今年"
                    }, {
                        period: "MAX",
                        selected: true,
                        label: "全部"
                    }]
                },
            });
        } else if (fund_type === 'money_fund') {
            IASCharts.drawChart(id, {
                panelsSettings: {
                    marginLeft: 100,
                    marginRight: 50,
                },
                dataSets: [{
                    fieldMappings: [{
                        fromField: "tenthou_unit_incm",
                        toField: "tenthou_unit_incm",
                    }, {
                        fromField: "chng_pct",
                        toField: "chng_pct",
                    }, {
                        fromField: "div",
                        toField: "div",
                    }],
                    dataProvider: data,
                    // EVENTS
                    stockEvents: stockEvents,
                    categoryField: "date",
                }],
                panels: [{
                    percentHeight: 70,
                    stockGraphs: [
                        {
                            id: "g1",
                            title: '万份收益',
                            useDataSetColors: false,
                            precision: 4,
                            lineColor: "#DC4444",
                            lineThickness: 2,
                            type: "line",
                            valueField: "tenthou_unit_incm",
                            balloonText: "[[title]]：<b>[[value]]</b>",
                        },
                        {
                            title: "七日年化收益",
                            useDataSetColors: false,
                            precision: 4,
                            lineColor: "#FFC96C",
                            lineThickness: 2,
                            type: "line",
                            valueField: "year_yld",
                            balloonText: "[[title]]：<b>[[value]]</b>",
                        }
                    ],

                    stockLegend: {
                        periodValueTextRegular: "[[value]]",
                        color: "#878787",
                        fontSize: 14,
                    },
                }, {
                    percentHeight: 30,
                    stockGraphs: [{
                        title: "分红",
                        valueField: "div",
                        type: "column",
                        useDataSetColors: false,
                        fillAlphas: 1,
                        // hidded: true,
                        lineColor: "#548a3e",
                        fillColors: "#548a3e",
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
                // panelsSettings: {
                //     usePrefixes: true
                // },
                periodSelector: {
                    fromText: '日期：',
                    toText: ' - ',
                    periodsText: '',
                    position: "bottom",
                    dateFormat: 'YYYY-MM-DD',
                    periods: [{
                        period: "MM",
                        count: 1,
                        label: "近1月"
                    }, {
                        period: "YYYY",
                        count: 1,
                        label: "近1年"
                    }, {
                        period: "YTD",
                        label: "今年"
                    }, {
                        period: "MAX",
                        selected: true,
                        label: "全部"
                    }]
                },
            });
        }

    }
})
