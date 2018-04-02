angular.module('ias.components')
    .directive('bondFilterWidget', function (bondConstantKey, bondKeys, bondClientFilter, bondServerFilter, bondFilterVar,
        marketFilter, $filter, filterParam, user, winStatus, dataCenter, qbBondFilter, marketDataClass) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                isShowPosition: '=',
                isAccountFilter: '=',           // 账户筛选
                isAccountCash: '=',             // 账户现金表
                isAccountReturn: '=',           // 账户成交记录
                winStatus: '=',                 //建议以后保存状态值只用一个参数
            },
            controller: function ($scope) {
                /*                $scope.$on('$destroy', function() {
                                    $scope = null;
                                })*/
                $scope.assignment = function () {
                    bondFilterVar.showAll = $scope.showAll;
                    bondFilterVar.direction = $scope.direction;
                    bondFilterVar.account_id = $scope.account_id;
                    bondFilterVar.user_id = $scope.user_id;
                    bondFilterVar.valid.validPrice = $scope.validPrice;
                    bondFilterVar.valid.bothValidPrice = $scope.bothValidPrice;
                    bondFilterVar.listed_market = $scope.listed_market;
                    bondFilterVar.bond_type = $scope.bond_type;
                    bondFilterVar.ttm = $scope.ttm;
                    bondFilterVar.institution_type = $scope.institution_type;
                    bondFilterVar.issuer_rating_current = $scope.issuer_rating_current;
                    bondFilterVar.rating_current = $scope.rating_current;
                    bondFilterVar.municipal = $scope.municipal;
                    bondFilterVar.guarenteed = $scope.guarenteed;
                    bondFilterVar.cdb = $scope.cdb;
                    bondFilterVar.coupon_rate = $scope.coupon_rate;
                    bondFilterVar.has_option = $scope.has_option;
                    bondFilterVar.special = $scope.special;
                    bondFilterVar.issue = $scope.issue;
                    bondFilterVar.location_type = $scope.location_type;
                    bondFilterVar.store_type = $scope.store_type;

                    bondFilterVar.bid = $scope.bid;
                    bondFilterVar.ofr = $scope.ofr;

                    bondFilterVar.low = $scope.low;

                    bondFilterVar.high = $scope.high;
                };

                $scope.initCondition = function () {
                    $scope.showAll = bondFilterVar.showAll;
                    $scope.direction = bondFilterVar.direction;
                    $scope.trade = {
                        account_id: bondFilterVar.account_id,
                        user_id: bondFilterVar.user_id
                    };
                    $scope.listed_market = bondFilterVar.listed_market;
                    $scope.bond_type = bondFilterVar.bond_type;
                    $scope.ttm = bondFilterVar.ttm;
                    $scope.institution_type = bondFilterVar.institution_type;
                    $scope.issuer_rating_current = bondFilterVar.issuer_rating_current;
                    $scope.rating_current = bondFilterVar.rating_current;
                    $scope.municipal = bondFilterVar.municipal;
                    $scope.guarenteed = bondFilterVar.guarenteed;
                    $scope.cdb = bondFilterVar.cdb;
                    $scope.coupon_rate = bondFilterVar.coupon_rate;
                    $scope.has_option = bondFilterVar.has_option;
                    $scope.special = bondFilterVar.special;
                    $scope.issue = bondFilterVar.issue;
                    $scope.location_type = bondFilterVar.location_type;
                    $scope.store_type = bondFilterVar.store_type;

                    $scope.valid = {};
                    $scope.valid.validPrice = bondFilterVar.valid.validPrice;
                    $scope.valid.bothValidPrice = bondFilterVar.valid.bothValidPrice;

                    $scope.bid = bondFilterVar.bid;
                    $scope.ofr = bondFilterVar.ofr;

                    $scope.low = bondFilterVar.low;

                    $scope.high = bondFilterVar.high;
                };
                $scope.initCondition();

                $scope.resetCondition = function () {
                    $scope.showAll = true;
                    $scope.direction = 0;    // 指令
                    $scope.trade = {
                        account_id: null,       //账户
                        user_id: null
                    };
                    $scope.listed_market = 0;                                   //市场
                    $scope.bond_type = 0;                                        //债券类型
                    $scope.ttm = 0;                                               //剩余期限
                    $scope.institution_type = 0;                              //企业类型
                    $scope.issuer_rating_current = 0;                         //主体评级
                    $scope.rating_current = 0;                                //债项评级
                    $scope.municipal = 0;                                      //城投
                    $scope.guarenteed = 0;                                   //担保
                    $scope.cdb = 0;                                           //国开
                    $scope.coupon_rate = 0;                                 //票面利率
                    $scope.has_option = 0;                                  //含权
                    $scope.special = 0;                                      //特殊
                    $scope.issue = 0;                                       //发行
                    $scope.location_type = 0;                                //所在库
                    $scope.store_type = 0,                                  // 类型

                        $scope.valid = {
                            validPrice: true,
                            bothValidPrice: false
                        };

                    $scope.bid = {
                        bidPrice: null,
                        bidPriceText: ""
                    };
                    $scope.ofr = {
                        ofrPrice: null,
                        ofrPriceText: ""
                    };

                    $scope.low = {
                        lowDate: null,
                        lowDateText: ""
                    };

                    $scope.high = {
                        highDate: null,
                        highDateText: ""
                    };
                };

                $scope.isShowAllActive = function () {
                    // 只要有一个可选按钮被选中不为全部(对应的值为1)，即代表showAll值为false
                    $scope.showAll = !($scope.trade.account_id || $scope.trade.user_id || $scope.direction || $scope.listed_market || $scope.bond_type || $scope.ttm
                        || $scope.institution_type || $scope.issuer_rating_current || $scope.rating_current
                        || $scope.municipal || $scope.guarenteed || $scope.cdb || $scope.coupon_rate
                        || $scope.has_option || $scope.special || $scope.location_type || $scope.issue || $scope.store_type
                        || !$scope.valid.validPrice || $scope.valid.bothValidPrice || $scope.bid.bidPrice != null
                        || $scope.ofr.ofrPrice != null || $scope.low.lowDate != null || $scope.high.highDate != null);
                    bondFilterVar.showAll = $scope.showAll;
                };

                $scope.showAllClick = function () {
                    if ($scope.showAll) {
                        return;
                    }
                    $scope.showAll = true;
                    $scope.resetCondition();
                    marketFilter.resetBondCondition();
                    $scope.assignment();
                };

                $scope.account_list = winStatus.account_filter_list;
                $scope.user_list = dataCenter.user.users;

                $scope.validClick = function () {
                    bondClientFilter.validPrice = $scope.valid.validPrice;
                    bondFilterVar.valid.validPrice = $scope.valid.validPrice;
                    $scope.isShowAllActive();
                };

                $scope.bothValidClick = function () {
                    bondClientFilter.bothValidPrice = $scope.valid.bothValidPrice;
                    bondFilterVar.valid.bothValidPrice = $scope.valid.bothValidPrice;
                    $scope.isShowAllActive();
                };

                $scope.bidPriceClick = function () {
                    $scope.bid.bidPrice = $scope.bid.bidPriceText == "" ? null : Number($scope.bid.bidPriceText);
                    bondClientFilter.bidPrice = $scope.bid.bidPrice;
                    bondFilterVar.bid.bidPrice = $scope.bid.bidPrice;
                    $scope.isShowAllActive();
                };

                $scope.ofrPriceClick = function () {
                    $scope.ofr.ofrPrice = $scope.ofr.ofrPriceText == "" ? null : Number($scope.ofr.ofrPriceText);
                    bondClientFilter.ofrPrice = $scope.ofr.ofrPrice;
                    bondFilterVar.ofr.ofrPrice = $scope.ofr.ofrPrice;
                    $scope.isShowAllActive();
                };

                $scope.setStoreType = function (param) {
                    $scope.store_type = $scope.updataValue($scope.store_type, param);
                    bondFilterVar.store_type = $scope.store_type;
                    bondClientFilter.store_type = $filter('getFilterKey')(bondConstantKey.store_type, $scope.store_type);
                    $scope.isShowAllActive();
                };

                $scope.setListedMarket = function (param) {
                    $scope.listed_market = $scope.updataValue($scope.listed_market, param);
                    bondFilterVar.listed_market = $scope.listed_market;
                    bondClientFilter.company_ids = $filter('getFilterKey')(bondConstantKey.company_ids, $scope.listed_market);
                    //qb 筛选
                    qbBondFilter.interBank = $scope.listed_market === 0 ? bondConstantKey.company_ids : bondClientFilter.company_ids;
                    if (!qbBondFilter.isExchange) {
                        qbBondFilter.brokers = qbBondFilter.interBank;
                    }

                    $scope.isShowAllActive();
                };

                $scope.setLocationType = function (param) {
                    $scope.location_type = $scope.updataValue($scope.location_type, param);
                    bondClientFilter.location_type = $filter('getFilterKey')(bondConstantKey.location_type, $scope.location_type);
                    bondFilterVar.location_type = $scope.location_type;
                    $scope.isShowAllActive();
                };

                $scope.setBondType = function (param) {
                    if (param == 15) {
                        $scope.bond_type = $scope.specialControl($scope.bond_type, param, 524272);
                    } else if (param == 524272) {
                        $scope.bond_type = $scope.specialCValue($scope.bond_type, param);
                    } else {
                        $scope.bond_type = $scope.updataValue($scope.bond_type, param);
                    }
                    bondFilterVar.bond_type = $scope.bond_type;
                    bondServerFilter.bond_type = $filter('getFilterKey')(bondConstantKey.bond_type, $scope.bond_type);
                    $scope.updateFilterParam();
                };

                $scope.setTTM = function (param) {
                    if ($scope.ttm === 512) {
                        $scope.ttm = param;
                    } else {
                        $scope.ttm = $scope.updataValue($scope.ttm, param);

                    }
                    bondServerFilter.ttm = $filter('getFilterKey')(bondConstantKey.ttm, $scope.ttm);

                    bondFilterVar.ttm = $scope.ttm;

                    $scope.low.lowDate = null;
                    $scope.low.lowDateText = "";
                    bondFilterVar.low = $scope.low;

                    $scope.high.highDate = null;
                    $scope.high.highDateText = "";
                    bondFilterVar.high = $scope.high;

                    $scope.updateFilterParam();
                };

                $scope.dateFilterClick = function () {
                    $scope.low.lowDate = $scope.formateStr($scope.low.lowDateText);
                    $scope.high.highDate = $scope.formateStr($scope.high.highDateText);
                    if ($scope.low.lowDate != null && $scope.high.highDate != null) {
                        $scope.ttm = 512;
                        bondServerFilter.ttm = [[$scope.low.lowDate, $scope.high.highDate]];
                    } else {
                        $scope.low.lowDateText = '';
                        $scope.high.highDateText = '';
                        $scope.low.lowDate = null;
                        $scope.high.highDate = null;
                        bondServerFilter.ttm = [];
                        $scope.ttm = 0;
                    }
                    bondFilterVar.ttm = $scope.ttm;
                    bondFilterVar.low = $scope.low;
                    bondFilterVar.high = $scope.high;

                    $scope.updateFilterParam();
                };

                bondFilterVar.low.lowDate = $scope.low.lowDate;
                bondFilterVar.high.highDate = $scope.high.highDate;

                $scope.formateStr = function (str) {
                    if (str == null || str.length == 0) {
                        return null;
                    }
                    if (isNaN(Number(str))) {
                        var strPart = Number(str.slice(0, str.length - 1));
                        if (!isNaN(strPart) && str.toLocaleLowerCase().charAt(str.length - 1) == "d") {
                            return Number((strPart / 365).toFixed(4));
                        } else if (!isNaN(strPart) && str.toLocaleLowerCase().charAt(str.length - 1) == "y") {
                            return strPart;
                        }
                        return null;
                    }
                    return Number(str);
                };

                $scope.setInstitutionType = function (param) {
                    $scope.institution_type = $scope.updataValue($scope.institution_type, param);
                    bondServerFilter.institution_type = $filter('getFilterKey')(bondConstantKey.institution_type, $scope.institution_type);
                    bondFilterVar.institution_type = $scope.institution_type;
                    $scope.updateFilterParam();
                };

                $scope.setIssuerRatingCurrent = function (param) {
                    $scope.issuer_rating_current = $scope.updataValue($scope.issuer_rating_current, param);
                    bondServerFilter.issuer_rating_current = $filter('getFilterKey')(bondConstantKey.issuer_rating_current, $scope.issuer_rating_current);
                    bondFilterVar.issuer_rating_current = $scope.issuer_rating_current;
                    $scope.updateFilterParam();
                };

                $scope.setRatingCurrent = function (param) {
                    $scope.rating_current = $scope.updataValue($scope.rating_current, param);
                    bondServerFilter.rating_current = $filter('getFilterKey')(bondConstantKey.rating_current, $scope.rating_current);
                    bondFilterVar.rating_current = $scope.rating_current;
                    $scope.updateFilterParam();
                };

                $scope.setMunicipal = function (param) {
                    $scope.municipal = $scope.updataValue($scope.municipal, param);
                    bondServerFilter.municipal = $filter('getFilterKey')(bondConstantKey.municipal, $scope.municipal);
                    bondFilterVar.municipal = $scope.municipal;
                    $scope.updateFilterParam();
                };

                $scope.setGuarenteed = function (param) {
                    $scope.guarenteed = $scope.updataValue($scope.guarenteed, param);
                    bondServerFilter.guarenteed = $filter('getFilterKey')(bondConstantKey.guarenteed, $scope.guarenteed);
                    bondFilterVar.guarenteed = $scope.guarenteed;
                    $scope.updateFilterParam();
                };

                $scope.setCdb = function (param) {
                    $scope.cdb = $scope.updataValue($scope.cdb, param);
                    bondServerFilter.cdb = $filter('getFilterKey')(bondConstantKey.cdb, $scope.cdb);
                    bondFilterVar.cdb = $scope.cdb;
                    $scope.updateFilterParam();
                };

                $scope.setCouponRate = function (param) {
                    $scope.coupon_rate = $scope.updataValue($scope.coupon_rate, param);
                    bondServerFilter.coupon_rate = $filter('getFilterKey')(bondConstantKey.coupon_rate, $scope.coupon_rate);
                    bondFilterVar.coupon_rate = $scope.coupon_rate;
                    $scope.updateFilterParam();
                };

                $scope.setHasOption = function (param) {
                    $scope.has_option = $scope.updataValue($scope.has_option, param);
                    bondServerFilter.has_option = $filter('getFilterKey')(bondConstantKey.has_option, $scope.has_option);
                    bondFilterVar.has_option = $scope.has_option;
                    $scope.updateFilterParam();
                };

                $scope.setSpecial = function (param) {
                    $scope.special = $scope.updataValue($scope.special, param);
                    bondServerFilter.special = $filter('getFilterKey')(bondConstantKey.special, $scope.special);
                    bondFilterVar.special = $scope.special;
                    $scope.updateFilterParam();
                };

                $scope.setIssue = function (param) {
                    $scope.issue = $scope.updataValue($scope.issue, param);
                    bondServerFilter.issue = $filter('getFilterKey')(bondConstantKey.issue, $scope.issue);
                    bondFilterVar.issue = $scope.issue;
                    $scope.updateFilterParam();
                };

                //账户过滤
                $scope.setAccount = function (param) {
                    bondClientFilter.account_filter = param;
                    bondFilterVar.account_id = $scope.trade.account_id;
                    $scope.isShowAllActive();
                };

                //录入人过滤
                $scope.setUser = function (param) {
                    bondClientFilter.user_filter = param;
                    bondFilterVar.user_id = $scope.trade.user_id;
                    $scope.isShowAllActive();
                };

                $scope.setDirection = function (param) {
                    $scope.direction = $scope.updataValue($scope.direction, param);
                    bondClientFilter.direction = $filter('getFilterKey')(bondConstantKey.direction, $scope.direction);
                    bondFilterVar.direction = $scope.direction;
                    $scope.isShowAllActive();
                };

                $scope.updateFilterParam = function () {
                    $scope.isShowAllActive();
                    if ($scope.showAll) {
                        bondClientFilter.key_list_markets = null;
                        return;
                    }
                    var filter_params = {};
                    //产品
                    if (bondServerFilter.bond_type.length > 0) {
                        filter_params.bond_type = {
                            type: "in",
                            value: bondServerFilter.bond_type
                        };
                    }
                    //剩余期限
                    if (bondServerFilter.ttm.length > 0) {
                        filter_params.ttm = {
                            type: "range in",
                            value: bondServerFilter.ttm
                        };
                    }

                    //主体评级
                    if (bondServerFilter.issuer_rating_current.length > 0) {
                        if ($.inArray("not in", bondServerFilter.issuer_rating_current) != -1) {
                            var value = $scope.getFilterKeyNegate(bondConstantKey.issuer_rating_current, $scope.issuer_rating_current);
                            filter_params.issuer_rating_current = {
                                type: "not in",
                                value: value
                            };
                        } else {
                            filter_params.issuer_rating_current = {
                                type: "in",
                                value: bondServerFilter.issuer_rating_current
                            };
                        }
                    }

                    //债项评级
                    if (bondServerFilter.rating_current.length > 0) {
                        if ($.inArray("not in", bondServerFilter.rating_current) != -1) {
                            var valueNegae = $scope.getFilterKeyNegate(bondConstantKey.rating_current, $scope.rating_current);
                            filter_params.rating_current = {
                                type: "not in",
                                value: valueNegae
                            };
                        } else {
                            filter_params.rating_current = {
                                type: "in",
                                value: bondServerFilter.rating_current
                            };
                        }

                    }
                    //企业
                    if (bondServerFilter.institution_type.length > 0) {
                        filter_params.issuer_type = {
                            type: "in",
                            value: bondServerFilter.institution_type
                        };
                    }
                    //金融
                    if (bondServerFilter.cdb.length > 0) {
                        filter_params.financial_bond = {
                            type: "in",
                            value: bondServerFilter.cdb
                        };
                    }

                    //城投债
                    if (bondServerFilter.municipal.length > 0) {
                        filter_params.is_municipal = {
                            type: "in",
                            value: bondServerFilter.municipal
                        };
                    }
                    //票面
                    if (bondServerFilter.coupon_rate.length > 0) {
                        filter_params.rate_type = {
                            type: "in",
                            value: bondServerFilter.coupon_rate
                        };
                    }
                    //担保
                    if (bondServerFilter.guarenteed.length > 0) {
                        filter_params.rating_augment = {
                            type: "in",
                            value: bondServerFilter.guarenteed
                        };
                    }
                    //含权
                    if (bondServerFilter.has_option.length > 0) {
                        filter_params.has_option = {
                            type: "in",
                            value: bondServerFilter.has_option
                        };
                    }
                    //新上市
                    if ($.inArray("on_the_run", bondServerFilter.special) != -1) {
                        filter_params.on_the_run = {
                            value: true
                        };
                    }
                    //跨市场
                    if ($.inArray("is_cross_mkt", bondServerFilter.special) != -1) {
                        filter_params.is_cross_mkt = {
                            value: 'Y'
                        };
                    }
                    //可质押
                    if ($.inArray("is_mortgage", bondServerFilter.special) != -1) {
                        filter_params.is_mortgage = {
                            value: 'Y'
                        };
                    }
                    //发行
                    if (bondServerFilter.issue.length > 0) {
                        filter_params.listed_market = {
                            type: "in",
                            value: bondServerFilter.issue
                        };
                    }

                    
                    var bonds = marketDataClass.getPositionBonds();
                    //针对'新上市'，‘跨市场’，‘可质押’三个条件的特殊处理(在后台代码不改的情况下前台只能发送多次进行拼接)
                    if (filter_params.is_cross_mkt || filter_params.is_mortgage || filter_params.on_the_run) {
                        var filterParams;
                        bondClientFilter.key_list_markets = [];
                        if (filter_params.is_cross_mkt) {
                            filterParams = angular.copy(filter_params);
                            filterParams.is_mortgage = undefined;
                            filterParams.on_the_run = undefined;
                            bondKeys.getKeys({ filter_params: filterParams, bonds: bonds }, function success(response) {
                                if (response.code && response.code === '0000') {
                                    var result = response.data;
                                    bondClientFilter.key_list_markets = bondClientFilter.key_list_markets.concat(result);
                                }
                            })
                        }
                        if (filter_params.is_mortgage) {
                            filterParams = angular.copy(filter_params);
                            filterParams.is_cross_mkt = undefined;
                            filterParams.on_the_run = undefined;
                            bondKeys.getKeys({ filter_params: filterParams, bonds: bonds }, function success(response) {
                                if (response.code && response.code === '0000') {
                                    var result = response.data;
                                    bondClientFilter.key_list_markets = bondClientFilter.key_list_markets.concat(result);
                                }
                            })
                        }
                        if (filter_params.on_the_run) {
                            filterParams = angular.copy(filter_params);
                            filterParams.is_cross_mkt = undefined;
                            filterParams.is_mortgage = undefined;
                            bondKeys.getKeys({ filter_params: filterParams, bonds: bonds }, function success(response) {
                                if (response.code && response.code === '0000') {
                                    var result = response.data;
                                    bondClientFilter.key_list_markets = bondClientFilter.key_list_markets.concat(result);
                                }
                            })
                        }
                    }
                    else {
                        //若判断条件为空，为了节省网络资源，不发送请求,将key_list_markets设为null
                        if ($.isEmptyObject(filter_params)) {
                            bondClientFilter.filter_params = filter_params;
                            bondClientFilter.key_list_markets = null;
                            return;
                        }
                        bondKeys.getKeys({ filter_params: filter_params, bonds: bonds }, function success(response) {
                            if (response.code && response.code === '0000') {
                                var result = response.data;
                                bondClientFilter.filter_params = filter_params;
                                bondClientFilter.key_list_markets = result;
                            }
                        });

                    }

                };

                $scope.specialControl = function (watchValue, param, highNum) {
                    if (watchValue > param) {
                        return (watchValue & highNum) + ((watchValue & param) == param ? 0 : param);
                    } else if (watchValue == param) {
                        return 0;
                    } else {
                        return param;
                    }
                };

                $scope.specialCValue = function (watchValue, param) {
                    if (watchValue > param) {
                        return watchValue ^ param;
                    } else if (watchValue == param) {
                        return 0;
                    } else {
                        return param + (watchValue & 15);
                    }
                };

                $scope.updataValue = function (watchValue, param) {
                    if (param == 0) {
                        return param;
                    } else {
                        return watchValue ^ param;
                    }
                };

                $scope.setClass = function (watchValue, param) {
                    if ((watchValue & param) >= param) {
                        return "filter-active-btn";
                    } else {
                        return "filter-default-btn";
                    }
                };

                $scope.getFilterKeyNegate = function (array, num) {
                    if (num == 0) {
                        return [];
                    } else {
                        var result = [];
                        var valid = 0;
                        $.each(array, function (index, data) {
                            valid = num & 1;
                            if (!valid) {
                                result.push(data);
                            }
                            num = num >> 1;
                        });
                        return result;
                    }
                };
            },
            templateUrl: 'src/common/components/marketFilter/templates/bond-filter-widget.html'
        }
    })
    .directive('dealFilterWidget', function (dealFilterVar, dealClientFilter, dealServerFilter, bondConstantKey, bondKeys, marketFilter, $filter) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                isShowPosition: '='
            },
            controller: function ($scope) {
                /*$scope.$on('$destroy', function() {
                    $scope = null;
                })*/
                $scope.assignment = function () {
                    dealFilterVar.showAll = $scope.showAll;
                    dealFilterVar.listed_market = $scope.listed_market;
                    dealFilterVar.bond_type = $scope.bond_type;
                    dealFilterVar.municipal = $scope.municipal;
                    dealFilterVar.cdb = $scope.cdb;

                    dealFilterVar.ttm = $scope.ttm;
                    dealFilterVar.institution_type = $scope.institution_type;
                    dealFilterVar.issuer_rating_current = $scope.issuer_rating_current;
                    dealFilterVar.rating_current = $scope.rating_current;
                    dealFilterVar.guarenteed = $scope.guarenteed;
                    dealFilterVar.coupon_rate = $scope.coupon_rate;
                    dealFilterVar.has_option = $scope.has_option;
                    dealFilterVar.special = $scope.special;
                    dealFilterVar.issue = $scope.issue;
                    dealFilterVar.location_type = $scope.location_type;
                    dealFilterVar.store_type = $scope.store_type;

                    dealFilterVar.low = $scope.low;

                    dealFilterVar.high = $scope.high;
                };

                $scope.initCondition = function () {
                    $scope.showAll = dealFilterVar.showAll;
                    $scope.listed_market = dealFilterVar.listed_market;
                    $scope.bond_type = dealFilterVar.bond_type;
                    $scope.municipal = dealFilterVar.municipal;
                    $scope.cdb = dealFilterVar.cdb;

                    $scope.ttm = dealFilterVar.ttm;
                    $scope.institution_type = dealFilterVar.institution_type;
                    $scope.issuer_rating_current = dealFilterVar.issuer_rating_current;
                    $scope.rating_current = dealFilterVar.rating_current;
                    $scope.guarenteed = dealFilterVar.guarenteed;
                    $scope.coupon_rate = dealFilterVar.coupon_rate;
                    $scope.has_option = dealFilterVar.has_option;
                    $scope.special = dealFilterVar.special;
                    $scope.issue = dealFilterVar.issue;
                    $scope.location_type = dealFilterVar.location_type;
                    $scope.store_type = dealFilterVar.store_type;

                    $scope.low = dealFilterVar.low;

                    $scope.high = dealFilterVar.high;
                };
                $scope.initCondition();

                $scope.resetCondition = function () {
                    $scope.showAll = true;
                    $scope.listed_market = 0;                                   //市场
                    $scope.bond_type = 0;                                        //债券类型
                    $scope.municipal = 0;                                      //城投
                    $scope.cdb = 0;                                           //国开

                    $scope.ttm = 0;                                               //剩余期限
                    $scope.institution_type = 0;                              //企业类型
                    $scope.issuer_rating_current = 0;                         //主体评级
                    $scope.rating_current = 0;                                //债项评级
                    $scope.guarenteed = 0;                                   //担保
                    $scope.coupon_rate = 0;                                 //票面利率
                    $scope.has_option = 0;                                  //含权
                    $scope.special = 0;                                      //特殊
                    $scope.issue = 0;                                       //发行
                    $scope.location_type = 0;                                //所在库
                    $scope.store_type = 0;

                    $scope.low = {
                        lowDate: null,
                        lowDateText: ""
                    };

                    $scope.high = {
                        highDate: null,
                        highDateText: ""
                    };
                };

                $scope.isShowAllActive = function () {
                    $scope.showAll = !($scope.listed_market || $scope.bond_type || $scope.municipal
                        || $scope.cdb || $scope.ttm || $scope.institution_type || $scope.issuer_rating_current
                        || $scope.rating_current || $scope.guarenteed || $scope.coupon_rate || $scope.has_option
                        || $scope.special || $scope.location_type || $scope.issue || $scope.store_type
                        || $scope.low.lowDate != null || $scope.high.highDate != null);
                    dealFilterVar.showAll = $scope.showAll;
                    dealClientFilter.showAll = $scope.showAll;
                };

                $scope.showAllClick = function () {
                    if ($scope.showAll) {
                        return;
                    }
                    $scope.showAll = true;
                    $scope.resetCondition();
                    marketFilter.resetDealCondition();
                    $scope.assignment();
                };

                $scope.bidPriceClick = function () {
                    $scope.bid.bidPrice = $scope.bid.bidPriceText == "" ? null : Number($scope.bid.bidPriceText);
                    dealClientFilter.bidPrice = $scope.bid.bidPrice;
                    dealFilterVar.bid.bidPrice = $scope.bid.bidPrice;
                    $scope.isShowAllActive();
                };

                $scope.ofrPriceClick = function () {
                    $scope.ofr.ofrPrice = $scope.ofr.ofrPriceText == "" ? null : Number($scope.ofr.ofrPriceText);
                    dealClientFilter.ofrPrice = $scope.ofr.ofrPrice;
                    dealFilterVar.ofr.ofrPrice = $scope.ofr.ofrPrice;
                    $scope.isShowAllActive();
                };

                $scope.setStoreType = function (param) {
                    $scope.store_type = $scope.updataValue($scope.store_type, param);
                    dealFilterVar.store_type = $scope.store_type;
                    dealClientFilter.store_type = $filter('getFilterKey')(bondConstantKey.store_type, $scope.store_type);
                    $scope.isShowAllActive();
                };


                $scope.setListedMarket = function (param) {
                    if (param == 31) {
                        $scope.listed_market = $scope.specialControl($scope.listed_market, param, 32);
                    } else {
                        $scope.listed_market = $scope.updataValue($scope.listed_market, param);
                    }
                    dealFilterVar.listed_market = $scope.listed_market;
                    dealClientFilter.company_ids = $filter('getFilterKey')(bondConstantKey.company_ids, $scope.listed_market);
                    $scope.isShowAllActive();
                };

                $scope.setBondType = function (param) {
                    if (param == 15) {
                        $scope.bond_type = $scope.specialControl($scope.bond_type, param, 524272);
                    } else if (param == 524272) {
                        $scope.bond_type = $scope.specialCValue($scope.bond_type, param);
                    } else {
                        $scope.bond_type = $scope.updataValue($scope.bond_type, param);
                    }
                    dealFilterVar.bond_type = $scope.bond_type;
                    dealServerFilter.bond_type = $filter('getFilterKey')(bondConstantKey.bond_type, $scope.bond_type);
                    $scope.updateFilterParam();
                };

                $scope.setMunicipal = function (param) {
                    $scope.municipal = $scope.updataValue($scope.municipal, param);
                    dealServerFilter.municipal = $filter('getFilterKey')(bondConstantKey.municipal, $scope.municipal);
                    dealFilterVar.municipal = $scope.municipal;
                    $scope.updateFilterParam();
                };

                $scope.setCdb = function (param) {
                    $scope.cdb = $scope.updataValue($scope.cdb, param);
                    dealServerFilter.cdb = $filter('getFilterKey')(bondConstantKey.cdb, $scope.cdb);
                    dealFilterVar.cdb = $scope.cdb;
                    $scope.updateFilterParam();
                };
                //添加的部分
                $scope.setLocationType = function (param) {
                    $scope.location_type = $scope.updataValue($scope.location_type, param);
                    dealClientFilter.location_type = $filter('getFilterKey')(bondConstantKey.location_type, $scope.location_type);
                    dealFilterVar.location_type = $scope.location_type;
                    $scope.isShowAllActive();
                };
                $scope.setTTM = function (param) {
                    if ($scope.ttm === 512) {
                        $scope.ttm = param;
                    } else {
                        $scope.ttm = $scope.updataValue($scope.ttm, param);
                    }
                    dealServerFilter.ttm = $filter('getFilterKey')(bondConstantKey.ttm, $scope.ttm);

                    dealFilterVar.ttm = $scope.ttm;

                    $scope.low.lowDate = null;
                    $scope.low.lowDateText = "";
                    dealFilterVar.low = $scope.low;

                    $scope.high.highDate = null;
                    $scope.high.highDateText = "";
                    dealFilterVar.high = $scope.high;

                    $scope.updateFilterParam();
                };
                $scope.dateFilterClick = function () {
                    $scope.low.lowDate = $scope.formateStr($scope.low.lowDateText);
                    $scope.high.highDate = $scope.formateStr($scope.high.highDateText);
                    if ($scope.low.lowDate != null && $scope.high.highDate != null) {
                        $scope.ttm = 512;
                        dealServerFilter.ttm = [[$scope.low.lowDate, $scope.high.highDate]];
                    } else {
                        $scope.low.lowDateText = '';
                        $scope.high.highDateText = '';
                        $scope.low.lowDate = null;
                        $scope.high.highDate = null;
                        dealServerFilter.ttm = [];
                        $scope.ttm = 0;
                    }
                    dealFilterVar.ttm = $scope.ttm;
                    dealFilterVar.low = $scope.low;
                    dealFilterVar.high = $scope.high;

                    $scope.updateFilterParam();
                };
                dealFilterVar.low.lowDate = $scope.low.lowDate;
                dealFilterVar.high.highDate = $scope.high.highDate;

                $scope.formateStr = function (str) {
                    if (str == null || str.length == 0) {
                        return null;
                    }
                    if (isNaN(Number(str))) {
                        var strPart = Number(str.slice(0, str.length - 1));
                        if (!isNaN(strPart) && str.toLocaleLowerCase().charAt(str.length - 1) == "d") {
                            return Number((strPart / 365).toFixed(4));
                        } else if (!isNaN(strPart) && str.toLocaleLowerCase().charAt(str.length - 1) == "y") {
                            return strPart;
                        }
                        return null;
                    }
                    return Number(str);
                };
                $scope.setInstitutionType = function (param) {
                    $scope.institution_type = $scope.updataValue($scope.institution_type, param);
                    dealServerFilter.institution_type = $filter('getFilterKey')(bondConstantKey.institution_type, $scope.institution_type);
                    dealFilterVar.institution_type = $scope.institution_type;
                    $scope.updateFilterParam();
                };

                $scope.setIssuerRatingCurrent = function (param) {
                    $scope.issuer_rating_current = $scope.updataValue($scope.issuer_rating_current, param);
                    dealServerFilter.issuer_rating_current = $filter('getFilterKey')(bondConstantKey.issuer_rating_current, $scope.issuer_rating_current);
                    dealFilterVar.issuer_rating_current = $scope.issuer_rating_current;
                    $scope.updateFilterParam();
                };

                $scope.setRatingCurrent = function (param) {
                    $scope.rating_current = $scope.updataValue($scope.rating_current, param);
                    dealServerFilter.rating_current = $filter('getFilterKey')(bondConstantKey.rating_current, $scope.rating_current);
                    dealFilterVar.rating_current = $scope.rating_current;
                    $scope.updateFilterParam();
                };
                $scope.setGuarenteed = function (param) {
                    $scope.guarenteed = $scope.updataValue($scope.guarenteed, param);
                    dealServerFilter.guarenteed = $filter('getFilterKey')(bondConstantKey.guarenteed, $scope.guarenteed);
                    dealFilterVar.guarenteed = $scope.guarenteed;
                    $scope.updateFilterParam();
                };
                $scope.setCouponRate = function (param) {
                    $scope.coupon_rate = $scope.updataValue($scope.coupon_rate, param);
                    dealServerFilter.coupon_rate = $filter('getFilterKey')(bondConstantKey.coupon_rate, $scope.coupon_rate);
                    dealFilterVar.coupon_rate = $scope.coupon_rate;
                    $scope.updateFilterParam();
                };

                $scope.setHasOption = function (param) {
                    $scope.has_option = $scope.updataValue($scope.has_option, param);
                    dealServerFilter.has_option = $filter('getFilterKey')(bondConstantKey.has_option, $scope.has_option);
                    dealFilterVar.has_option = $scope.has_option;
                    $scope.updateFilterParam();
                };
                $scope.setSpecial = function (param) {
                    $scope.special = $scope.updataValue($scope.special, param);
                    dealServerFilter.special = $filter('getFilterKey')(bondConstantKey.special, $scope.special);
                    dealFilterVar.special = $scope.special;
                    $scope.updateFilterParam();
                };

                $scope.setIssue = function (param) {
                    $scope.issue = $scope.updataValue($scope.issue, param);
                    dealServerFilter.issue = $filter('getFilterKey')(bondConstantKey.issue, $scope.issue);
                    dealFilterVar.issue = $scope.issue;
                    $scope.updateFilterParam();
                };

                $scope.specialControl = function (watchValue, param, highNum) {
                    if (watchValue > param) {
                        return (watchValue & highNum) + ((watchValue & param) == param ? 0 : param);
                    } else if (watchValue == param) {
                        return 0;
                    } else {
                        return param;
                    }
                };

                $scope.specialCValue = function (watchValue, param) {
                    if (watchValue > param) {
                        return watchValue ^ param;
                    } else if (watchValue == param) {
                        return 0;
                    } else {
                        return param + (watchValue & 15);
                    }
                };

                $scope.updataValue = function (watchValue, param) {
                    if (param == 0) {
                        return param;
                    } else {
                        return watchValue ^ param;
                    }
                };

                $scope.setClass = function (watchValue, param) {
                    if ((watchValue & param) >= param) {
                        return "filter-active-btn";
                    } else {
                        return "filter-default-btn";
                    }
                };

                $scope.updateFilterParam = function () {
                    $scope.isShowAllActive();
                    if ($scope.showAll) {
                        dealClientFilter.key_list_markets = null;
                        return;
                    }
                    var filter_params = {};
                    //产品
                    if (dealServerFilter.bond_type.length > 0) {
                        filter_params.bond_type = {
                            type: "in",
                            value: dealServerFilter.bond_type
                        };
                    }

                    //金融
                    if (dealServerFilter.cdb.length > 0) {
                        filter_params.financial_bond = {
                            type: "in",
                            value: dealServerFilter.cdb
                        };
                    }

                    //城投债
                    if (dealServerFilter.municipal.length > 0) {
                        filter_params.is_municipal = {
                            type: "in",
                            value: dealServerFilter.municipal
                        };
                    }
                    //剩余期限
                    if (dealServerFilter.ttm.length > 0) {
                        filter_params.ttm = {
                            type: "range in",
                            value: dealServerFilter.ttm
                        };
                    }
                    //主体评级
                    if (dealServerFilter.issuer_rating_current.length > 0) {
                        if ($.inArray("not in", dealServerFilter.issuer_rating_current) != -1) {
                            var value = $scope.getFilterKeyNegate(bondConstantKey.issuer_rating_current, $scope.issuer_rating_current);
                            filter_params.issuer_rating_current = {
                                type: "not in",
                                value: value
                            };
                        } else {
                            filter_params.issuer_rating_current = {
                                type: "in",
                                value: dealServerFilter.issuer_rating_current
                            };
                        }
                    }

                    //债项评级
                    if (dealServerFilter.rating_current.length > 0) {
                        if ($.inArray("not in", dealServerFilter.rating_current) != -1) {
                            var valueNegae = $scope.getFilterKeyNegate(bondConstantKey.rating_current, $scope.rating_current);
                            filter_params.rating_current = {
                                type: "not in",
                                value: valueNegae
                            };
                        } else {
                            filter_params.rating_current = {
                                type: "in",
                                value: dealServerFilter.rating_current
                            };
                        }

                    }
                    //企业
                    if (dealServerFilter.institution_type.length > 0) {
                        filter_params.issuer_type = {
                            type: "in",
                            value: dealServerFilter.institution_type
                        };
                    }
                    //票面
                    if (dealServerFilter.coupon_rate.length > 0) {
                        filter_params.rate_type = {
                            type: "in",
                            value: dealServerFilter.coupon_rate
                        };
                    }
                    //担保
                    if (dealServerFilter.guarenteed.length > 0) {
                        filter_params.rating_augment = {
                            type: "in",
                            value: dealServerFilter.guarenteed
                        };
                    }
                    //含权
                    if (dealServerFilter.has_option.length > 0) {
                        filter_params.has_option = {
                            type: "in",
                            value: dealServerFilter.has_option
                        };
                    }
                    //新上市
                    if ($.inArray("on_the_run", dealServerFilter.special) != -1) {
                        filter_params.on_the_run = {
                            value: true
                        };
                    }
                    //跨市场
                    if ($.inArray("is_cross_mkt", dealServerFilter.special) != -1) {
                        filter_params.is_cross_mkt = {
                            value: 'Y'
                        };
                    }
                    //可质押
                    if ($.inArray("is_mortgage", dealServerFilter.special) != -1) {
                        filter_params.is_mortgage = {
                            value: 'Y'
                        };
                    }
                    //发行
                    if (dealServerFilter.issue.length > 0) {
                        filter_params.listed_market = {
                            type: "in",
                            value: dealServerFilter.issue
                        };
                    }

                    var bonds = marketDataClass.getPositionBonds();
                    bondKeys.getKeys({ filter_params: filter_params, bonds: bonds }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var result = response.data;
                            dealClientFilter.key_list_markets = result;
                        }
                    });
                };

                $scope.getFilterKeyNegate = function (array, num) {
                    if (num == 0) {
                        return [];
                    } else {
                        var result = [];
                        var valid = 0;
                        $.each(array, function (index, data) {
                            valid = num & 1;
                            if (!valid) {
                                result.push(data);
                            }
                            num = num >> 1;
                        });
                        return result;
                    }
                };
            },
            templateUrl: 'src/common/components/marketFilter/templates/deal-filter-widget.html'
        }
    });
