import {IASCharts} from '../../helper/IASCharts';
import moment from 'moment';

angular.module('ias.account')
    .factory('bondInformation', function ($resource, $q, apiAddress) {
        return {
            getData: function (params) {
                let defer = $q.defer();
                $resource(apiAddress + `/bond/${params.bondKey}`, {}, {
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

    .factory('bondLatestValuation', function ($resource, $q, apiAddress) {
        return {
            getData: function (params) {
                let defer = $q.defer();
                $resource(apiAddress + `/bond_latest_valuation/${params.bondKey}`, {}, {
                    get: {method: 'GET', params: {}}
                }).get({}, function (response) {
                        defer.resolve(response);

                    }, (data) => {
                        defer.reject(data);
                    }
                );
                return defer.promise;
            }
        }
    })

    .factory('bondTrades', function ($resource, $q, apiAddress) {
        return {
            getData: function (params) {
                let defer = $q.defer();
                $resource(apiAddress + "/account_group/ffffffffffffffffffffffffffffffff/trades", {}, {
                        post: {
                            method: 'POST', params: {}
                        }
                    }
                ).post(params, function (data, headers) {
                    defer.resolve(data);
                }, function (data, headers) {
                    defer.reject(data);
                });
                return defer.promise
            }
        }
    })

    .factory('bondComprehensive', function ($resource, $q, apiAddress) {
        return {
            getData: function (params) {
                let defer = $q.defer();
                $resource(apiAddress + "/bond_comprehensive_hist_quotats", {}, {
                    get: {method: 'POST', params: {}}
                }).get(params, function (data, headers) {
                    defer.resolve(data);
                }, function (data, headers) {
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

angular.module('ias.account').controller('traceBondCtrl', function ($scope, $q, user,authorityControl,dataCenter,winStatus, bondInformation, bondLatestValuation, bondTrades, bondComprehensive, workdays) {
    $scope.listeddate = [
        {label: '全部', value: 0},
        {label: '1年', value: 1},
    ];
    $scope.bondHistoryState = {
        historyData: null,
        hisVal: null,
    };

    let company_id;
    let account_list;
    let bondTradesParams;
    let earliestTradedate;
    let latest_workday_before_today;
    let today;
    let bondComprehensiveParams;
    let bondBasicParams;
    let workdaysParams;
    let isCdc = dataCenter.authority.cdc ? true : false;
    let isBroker = dataCenter.authority.broker.length > 0 ? true : false;

    $scope.$on("bondBroadcast", function (event, msg) {

        // 初始化图标
        drawHistory([], []);
        $scope.bondName = `${msg.bond_short_name}   ${msg.bond_code}`;
        $scope.issuerName = msg.issuer_name;
        $scope.bondExchange = (msg.market === 'SSE' || msg.market === 'SZE') ? true : false;
        let bondKey = msg.bond_key_listed_market;
        let bond_id = msg.bond_code.slice(0, 6);
        company_id = user.company_id;
        account_list = authorityControl.getAccountGroupMember(winStatus.cur_account_list);
        bondTradesParams = {
            type: "bond",
            bklm: bondKey,
            account_group_id: "ffffffffffffffffffffffffffffffff",
            company_id: company_id,
            account_list: account_list,
            intraday_average: true
        }
         bondComprehensiveParams = {
            deal_data_source: $scope.bondExchange ? 'exchange' : 'broker',
            bklm: bondKey,
            bond_id: bond_id,
        };
        bondBasicParams = {
            bondKey: bondKey
        }
        //获取工作日时间
        workdaysParams = {
            market: $scope.bondExchange ? 'exchange' : 'interbank',
            from_date: moment().add(-1, 'year').format('YYYY-MM-DD'),
            to_date: moment().format('YYYY-MM-DD')
        }
        // 获取债券基本信息
        getBondBasic(bondBasicParams);
        setChart();
    });

    async function setChart() {
        let workdaysResult = await workdays.getData(workdaysParams);
        latest_workday_before_today = workdaysResult.data.latest_workday_before_today;
        today = workdaysResult.data.today;
        let bondTresult = await bondTrades.getData(bondTradesParams);

        if (bondTresult.data && Array.isArray(bondTresult.data) && bondTresult.data.length > 0) {
            earliestTradedate = bondTresult.data[bondTresult.data.length - 1].trade_date;
        }

        if (earliestTradedate) {
            bondComprehensiveParams.from_date = earliestTradedate;
        } else {
            bondComprehensiveParams.from_date = moment(latest_workday_before_today).add(-2,'year').format('YYYY-MM-DD');
        }
        bondComprehensiveParams.to_date = latest_workday_before_today;

        let bondCresult = await bondComprehensive.getData(bondComprehensiveParams);

        formatHistoryRender(bondCresult, bondTresult);
    }



    function getBondBasic(params) {

        bondInformation.getData(params).then(response => {
            let data;
            if (response.code && response.code === '0000') {
                data = response.data;
            }
            $scope.bondInformation = {
                ttm: data.ttm,                                                      // 剩余期限
                issuer_rating_current: data.issuer_rating_current,                  // 主体评级
                rating_current: data.rating_current,                                // 债项评级
                coupon_rate_current: data.coupon_rate_current,                      // 票面利率
            }
        });

        bondLatestValuation.getData(params).then((response) => {
            let data;
            if (response.code && response.code === '0000') {
                data = response.data;
            }
            $scope.bondInformation['csiYield'] = data.csi.yield;
            $scope.bondInformation['cdcYield'] = data.cdc.yield;
        })
        $scope.bondInformation = bondInformation.getData(params);
    }

    // 成交统计数据
    function formatHistoryRender(_vArrCom, _arrTrades) {
        let stockEvents = [];
        let data = [];
        let lastDataMap = new Map();
        if (Array.isArray(_vArrCom.data) && _vArrCom.data.length > 0) {
            data = _vArrCom.data.map((val) => {
                let _lastData = {
                    deal_quotat: val.deal_quotat,
                    csi: val.csi,
                    cdc: val.cdc,
                }
                for (let key in val) {
                    let value = val[key];
                    if (val[key] !== null) {
                        lastDataMap.set(key, value);
                    } else {
                        _lastData[key] = lastDataMap.get(key);
                    }
                }
                return {
                    date: new Date(val.date),
                    volume: val.volume,
                    deal_quotat: _lastData.deal_quotat,
                    csi: _lastData.csi,
                    cdc: _lastData.cdc,
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
                        ${$scope.bondExchange ? '成交量' : '成交笔数'} ${val.volume / 1000}K
                        价格 ${val.clean_price} 
                        成本收益率 ${val.ytm}`
                }
                stockEvents.push(stockEvent);
            })
        }
        drawHistory(data, stockEvents);
    };

    function drawHistory(data, stockEvents) {
        let stockGraphs = [
                {
                    id: "g1",
                    title: "中证估值",
                    useDataSetColors: false,
                    precision: 4,
                    lineColor: "#00b8ff",
                    lineThickness: 2,
                    type: "line",
                    valueField: "csi",
                    balloonText: "[[title]]：<b>[[value]]</b>",
                }
            ]

        if (isCdc) {

            stockGraphs.unshift({
                title: "中债估值",
                useDataSetColors: false,
                precision: 4,
                lineColor: "#FFC96C",
                lineThickness: 2,
                type: "line",
                valueField: "cdc",
                balloonText: "[[title]]：<b>[[value]]</b>",
            });
        }
        if ($scope.bondExchange) {
            stockGraphs.unshift({
                title:  '收盘价' ,
                useDataSetColors: false,
                precision: 4,
                lineColor: "#DC4444",
                lineThickness: 2,
                type: "line",
                valueField: "deal_quotat",
                balloonText: "[[title]]：<b>[[value]]</b>",
            });
        } else {
            if (isBroker) {
                stockGraphs.unshift({
                    title: 'broker平均成交',
                    useDataSetColors: false,
                    precision: 4,
                    lineColor: "#DC4444",
                    lineThickness: 2,
                    type: "line",
                    valueField: "deal_quotat",
                    balloonText: "[[title]]：<b>[[value]]</b>",
                });
            }
        }
        IASCharts.drawChart("BondHistoryChart", {
            panelsSettings: {
                marginLeft: 100,
                marginRight: 50,
            },
            dataSets: [{
                fieldMappings: [{
                    fromField: "deal_quotat",
                    toField: "deal_quotat",
                }, {
                    fromField: "csi",
                    toField: "csi",
                }, {
                    fromField: "cdc",
                    toField: "cdc",
                },{
                    fromField: "volume",
                    toField: "volume",
                }],
                dataProvider: data,
                // EVENTS
                stockEvents: stockEvents,
                categoryField: "date",
                dataDateFormat:"YYYY-MM-DD",
                balloonDateFormat: "YYYY-MM-DD",

            }],
            panels: [{
                percentHeight: 70,
                stockGraphs: stockGraphs,

                stockLegend: {
                    periodValueTextRegular: "[[value]]",
                    color: "#878787",
                    fontSize: 14,
                },
            }, {
                percentHeight: 30,
                stockGraphs: [{
                    title: $scope.bondExchange  ? '成交量' : '成交笔数',
                    valueField: "volume",
                    type: "column",
                    useDataSetColors: false,
                    fillAlphas: 1,
                    // hidded: true,
                    fillColors: "#0D4FB8",
                    lineColor: "#0D4FB8",
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
                fromText:'日期：',
                toText:' - ',
                periodsText:'',
                position: "bottom",
                dateFormat:'YYYY-MM-DD',
                periods: [ {
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
                } ]
            },
        });
    }
})
