angular.module('ias.components')
    .factory("bondFilterVar", function () {
        return {
            showAll: true,
            direction: 0,           // 指令
            account_id: '',         // 账户
            user_id: 0,             // 录入人
            validPrice: true,                                   //有效报价
            bothValidPrice: false,                             //双边报价
            listed_market: 0,                                   //市场
            bond_type: 0,                                        //债券类型
            ttm: 0,                                               //剩余期限
            institution_type: 0,                              //企业类型
            issuer_rating_current: 0,                         //主体评级
            rating_current: 0,                                //债项评级
            municipal: 0,                                      //城投
            guarenteed: 0,                                   //担保
            cdb: 0,                                           //国开
            coupon_rate: 0,                                 //票面利率
            has_option: 0,                                  //含权
            special: 0,                                      //特殊
            issue: 0,                                       //发行
            location_type: 0,                                //所在库
            store_type: 0,                                  // 类型
            valid: {
                validPrice: true,
                bothValidPrice: false
            },

            bid: {
                bidPrice: null,
                bidPriceText: ""
            },
            ofr: {
                ofrPrice: null,
                ofrPriceText: ""
            },

            low: {
                lowDate: null,
                lowDateText: ""
            },

            high: {
                highDate: null,
                highDateText: ""
            }
        }
    })
    .factory('qbBondFilter', function () {
        return {
            brokers: ['1', '2', '3', '4', '5'],
            interBank: ['1', '2', '3', '4', '5'],
            isExchange: false
        }
    })
    .factory("bondClientFilter", function () {
        return {
            validPrice: true,
            bothValidPrice: false,
            bidPrice: null,
            ofrPrice: null,
            company_ids: [],
            location_type: [],
            key_list_markets: null,
            marketType: "interBank",
            searchKey: '',
            direction: [],
            account_filter: null,
            user_filter: null,
            store_type: [],
            details: []              //现金流表中过滤描述字段
        }
    })
    .factory("cashflowClientFilter", function () {
        return {
            startDate: '',
            endDate: '',
            searchKey: '',
            details: [],              //现金流表中过滤描述字段
            reset: function() {
                this.startDate = '';
                this.endDate = '';
                this.searchKey = '';
                this.details = [];
            }
        }
    })
    .factory("stockClientFilter", function () {
        return {
            searchKey: ''
        }
    })
    .factory("fundClientFilter", function () {
        return {
            searchKey: ''
        }
    })
    .factory("bondServerFilter", function () {
        return {
            bond_type: [],
            ttm: [],
            institution_type: [],
            issuer_rating_current: [],
            rating_current: [],
            municipal: [],
            guarenteed: [],
            cdb: [],
            coupon_rate: [],
            has_option: [],
            special: [],
            issue: [],
            sector: [],
            province: [],
        }
    })
    .factory('dealFilterVar', function () {
        return {
            showAll: true,
            listed_market: 0,                                   //市场
            bond_type: 0,                                        //债券类型
            municipal: 0,                                      //城投
            cdb: 0,                                              //国开
            ttm: 0,                                               //剩余期限
            institution_type: 0,                              //企业类型
            issuer_rating_current: 0,                         //主体评级
            rating_current: 0,                                //债项评级
            guarenteed: 0,                                   //担保
            coupon_rate: 0,                                 //票面利率
            has_option: 0,                                  //含权
            special: 0,                                      //特殊
            issue: 0,                                       //发行
            location_type: 0,                                //所在库
            store_type: 0,
            low: {
                lowDate: null,
                lowDateText: ""
            },

            high: {
                highDate: null,
                highDateText: ""
            }
        }
    })
    .factory('dealClientFilter', function () {
        return {
            showAll: true,
            company_ids: [],
            key_list_markets: null,
            location_type: [],
            store_type: [],
            searchKey: '',
            marketType: "interBank"
        }
    })
    .factory('dealServerFilter', function () {
        return {
            bond_type: [],
            municipal: [],
            cdb: [],
            ttm: [],
            institution_type: [],
            issuer_rating_current: [],
            rating_current: [],
            guarenteed: [],
            coupon_rate: [],
            has_option: [],
            special: [],
            issue: []
        }
    })

    .factory('marketFilter', function (cashflowClientFilter, bondClientFilter, bondServerFilter,
                                       selectedTask, bondDealMarket, stockClientFilter,
                                       bondFilterVar, dealClientFilter, dealFilterVar, dealServerFilter, bondConstantKey,
                                       $filter, interactWithQB, dataCenter, fundClientFilter) {
        var store_type_filter = function (position_flag, pool_flag, invest_flag, key) {
            //仓库类型
            var position_visible = false;
            var pool_visible = false;
            var invest_visible = false;
            if (position_flag && dataCenter.account.positionBondMap.hasOwnProperty(key)) {
                position_visible = true
            }
            if (pool_flag && dataCenter.market.bondPoolMap.hasOwnProperty(key)) {
                pool_visible = true
            }
            if (invest_flag && dataCenter.market.investableBondMap.hasOwnProperty(key)) {
                invest_visible = true
            }

            if (!position_visible && !pool_visible && !invest_visible) {
                return true;
            }
            return false;
        }
        return {
            resetBondCondition: function () {
                bondClientFilter.validPrice = true;
                bondClientFilter.bothValidPrice = false;
                bondClientFilter.bidPrice = null;
                bondClientFilter.ofrPrice = null;
                bondClientFilter.company_ids = [];
                bondClientFilter.location_type = [];
                bondClientFilter.key_list_markets = null;
                bondClientFilter.direction = [];
                bondClientFilter.account_name = null;
                bondClientFilter.store_type = [];

                bondServerFilter.bond_type = [];
                bondServerFilter.ttm = [];
                bondServerFilter.institution_type = [];
                bondServerFilter.issuer_rating_current = [];
                bondServerFilter.rating_current = [];
                bondServerFilter.municipal = [];
                bondServerFilter.guarenteed = [];
                bondServerFilter.cdb = [];
                bondServerFilter.coupon_rate = [];
                bondServerFilter.has_option = [];
                bondServerFilter.special = [];
                bondServerFilter.issue = [];
                bondServerFilter.sector = [];
                bondServerFilter.province = [];
                bondClientFilter.account_filter = null;
                bondClientFilter.user_filter = null;
            },
            resetBondFilterVar: function () {
                bondFilterVar.showAll = true;
                bondFilterVar.validPrice = true;                                   //有效报价
                bondFilterVar.bothValidPrice = false;                             //双边报价
                bondFilterVar.listed_market = 0;                                   //市场
                bondFilterVar.bond_type = 0;                                        //债券类型
                bondFilterVar.ttm = 0;                                               //剩余期限
                bondFilterVar.institution_type = 0;                              //企业类型
                bondFilterVar.issuer_rating_current = 0;                         //主体评级
                bondFilterVar.rating_current = 0;                                //债项评级
                bondFilterVar.municipal = 0;                                      //城投
                bondFilterVar.guarenteed = 0;                                   //担保
                bondFilterVar.cdb = 0;                                           //国开
                bondFilterVar.coupon_rate = 0;                                 //票面利率
                bondFilterVar.has_option = 0;                                  //含权
                bondFilterVar.special = 0;                                      //特殊
                bondFilterVar.issue = 0;                                       //发行
                bondFilterVar.location_type = 0;                                //所在库
                bondFilterVar.valid.validPrice = true;
                bondFilterVar.valid.bothValidPrice = false;

                bondFilterVar.bid.bidPrice = null;
                bondFilterVar.bid.bidPriceText = "";

                bondFilterVar.ofr.ofrPrice = null;
                bondFilterVar.ofr.ofrPriceText = "";

                bondFilterVar.low.lowDate = null;
                bondFilterVar.low.lowDateText = "";

                bondFilterVar.high.highDate = null;
                bondFilterVar.high.highDateText = "";
            },
            resetDealCondition: function () {
                dealClientFilter.showAll = true;
                dealClientFilter.company_ids = [];
                dealClientFilter.key_list_markets = null;
                dealClientFilter.location_type = [];
                dealClientFilter.store_type = [];

                dealServerFilter.bond_type = [];
                dealServerFilter.municipal = [];
                dealServerFilter.cdb = [];
                dealServerFilter.ttm = [];
                dealServerFilter.institution_type = [];
                dealServerFilter.issuer_rating_current = [];
                dealServerFilter.rating_current = [];
                dealServerFilter.guarenteed = [];
                dealServerFilter.coupon_rate = [];
                dealServerFilter.has_option = [];
                dealServerFilter.special = [];
                dealServerFilter.issue = [];
            },
            bondFilter: function (renderalbeRows) {
                var length = 0;
                var tempCompany = [];
                if (bondClientFilter.marketType != 'exchange' && bondClientFilter.marketType != 'interBank') {
                    tempCompany = null;
                } else if (bondClientFilter.marketType == 'exchange') {
                    tempCompany.push('e');
                } else if (bondClientFilter.marketType == 'interBank') {
                    if (bondClientFilter.company_ids == null || bondClientFilter.company_ids.length == 0) {
                        tempCompany = tempCompany.concat(bondConstantKey.company_ids);
                    } else {
                        tempCompany = tempCompany.concat(bondClientFilter.company_ids);
                    }
                }
                var position_flag = $.inArray('position', bondClientFilter.store_type) != -1;
                var pool_flag = $.inArray('pool', bondClientFilter.store_type) != -1;
                var invest_flag = $.inArray('invest', bondClientFilter.store_type) != -1;
                var all_flag = position_flag && pool_flag && invest_flag;

                renderalbeRows.forEach(function (row) {
                    /*                    //长度限制100条
                     if (length > filterLength) {
                     row.visible = false;
                     return true;
                     }*/

                    // 相似期限，相同发行人，相同评级筛选
                    if ((selectedTask.bond.similarKey != null && selectedTask.bond.similarKey.length == 0) ||
                        (selectedTask.bond.similarKey != null && selectedTask.bond.similarKey.length != 0 && $.inArray(row.entity.bond_key_listed_market, selectedTask.bond.similarKey) == -1)) {
                        row.visible = false;
                        return true;
                    }
                    //搜索框筛选
                    if (bondClientFilter.searchKey != null && bondClientFilter.searchKey != "") {
                        if (row.entity.bond_id == null || (row.entity.bond_id != null && (row.entity.bond_id).indexOf(bondClientFilter.searchKey) == -1)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //有效报价
                    if (bondClientFilter.validPrice && row.entity.bid_price == "--" && row.entity.ofr_price == "--") {
                        row.visible = false;
                        return true;
                    }
                    //双边有效报价
                    if (bondClientFilter.bothValidPrice && (row.entity.bid_price == "--" || row.entity.ofr_price == "--")) {
                        row.visible = false;
                        return true;
                    }
                    // bid 估值
                    if (bondClientFilter.bidPrice != null && ((!isNaN(Number(row.entity.bid_price)) && Number(row.entity.bid_price) < bondClientFilter.bidPrice) || isNaN(Number(row.entity.bid_price)))) {
                        row.visible = false;
                        return true;
                    }
                    // ofr 估值
                    if (bondClientFilter.ofrPrice != null && ((!isNaN(Number(row.entity.ofr_price)) && Number(row.entity.ofr_price) > bondClientFilter.ofrPrice) || isNaN(Number(row.entity.ofr_price)))) {
                        row.visible = false;
                        return true;
                    }

                    //市场
                    if (tempCompany == null || (tempCompany.length != 0 && $.inArray(row.entity.company_id, tempCompany) == -1)) {
                        row.visible = false;
                        return true;
                    }
                    //库类型
                    if (bondClientFilter.location_type != null && bondClientFilter.location_type.length != 0) {
                        var type = row.entity.invest == null ? null : row.entity.invest.investable;
                        if (type == null || $.inArray(type, bondClientFilter.location_type) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //仓库类型
                    if (bondClientFilter.store_type != null && bondClientFilter.store_type.length != 0 && !all_flag) {
                        var key = row.entity.bond_key_listed_market;
                        if (store_type_filter(position_flag, pool_flag, invest_flag, key)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //server
                    if (bondClientFilter.key_list_markets != null && $.inArray(row.entity.bond_key_listed_market, bondClientFilter.key_list_markets) == -1) {
                        row.visible = false;
                        return true;
                    }

                    length++;
                });
                return renderalbeRows;
            },
            qbBondFilter: function (renderalbeRows) {
                var length = 0;
                var tempCompany = [];
                if (bondClientFilter.marketType != 'exchange' && bondClientFilter.marketType != 'interBank') {
                    tempCompany = null;
                } else if (bondClientFilter.marketType == 'exchange') {
                    tempCompany.push('e');
                } else if (bondClientFilter.marketType == 'interBank') {
                    if (bondClientFilter.company_ids == null || bondClientFilter.company_ids.length == 0) {
                        tempCompany = tempCompany.concat(bondConstantKey.company_ids);
                    } else {
                        tempCompany = tempCompany.concat(bondClientFilter.company_ids);
                    }
                }
                var position_flag = $.inArray('position', bondClientFilter.store_type) != -1;
                var pool_flag = $.inArray('pool', bondClientFilter.store_type) != -1;
                var invest_flag = $.inArray('invest', bondClientFilter.store_type) != -1;
                var all_flag = position_flag && pool_flag && invest_flag;

                renderalbeRows.forEach(function (row) {

                    // 相似期限，相同发行人，相同评级筛选
                    if ((selectedTask.bond.similarKey != null && selectedTask.bond.similarKey.length == 0) ||
                        (selectedTask.bond.similarKey != null && selectedTask.bond.similarKey.length != 0 && $.inArray(row.entity.bond_key_listed_market, selectedTask.bond.similarKey) == -1)) {
                        row.visible = false;
                        return true;
                    }
                    //搜索框筛选
                    if (bondClientFilter.searchKey != null && bondClientFilter.searchKey != "") {
                        if (row.entity.BondCode == null || (row.entity.BondCode != null && (row.entity.BondCode).indexOf(bondClientFilter.searchKey) == -1)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //有效报价
                    if (bondClientFilter.validPrice && row.entity.BuyPrice == "--" && row.entity.SellPrice == "--") {
                        row.visible = false;
                        return true;
                    }
                    //双边有效报价
                    if (bondClientFilter.bothValidPrice && (row.entity.BuyPrice == "--" || row.entity.SellPrice == "--")) {
                        row.visible = false;
                        return true;
                    }
                    // bid 估值
                    if (bondClientFilter.bidPrice != null && ((!isNaN(Number(row.entity.BuyPrice)) && Number(row.entity.BuyPrice) < bondClientFilter.bidPrice) || isNaN(Number(row.entity.BuyPrice)))) {
                        row.visible = false;
                        return true;
                    }
                    // ofr 估值
                    if (bondClientFilter.ofrPrice != null && ((!isNaN(Number(row.entity.SellPrice)) && Number(row.entity.SellPrice) > bondClientFilter.ofrPrice) || isNaN(Number(row.entity.SellPrice)))) {
                        row.visible = false;
                        return true;
                    }

                    //市场
                    if (tempCompany == null || (tempCompany.length != 0 && $.inArray(row.entity.BrokerId, tempCompany) == -1)) {
                        row.visible = false;
                        return true;
                    }

                    //仓库类型
                    if (bondClientFilter.store_type != null && bondClientFilter.store_type.length != 0 && !all_flag) {
                        var key = row.entity.bond_key_listed_market;
                        if (store_type_filter(position_flag, pool_flag, invest_flag, key)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //server
                    if (bondClientFilter.key_list_markets != null && $.inArray(row.entity.bond_key_listed_market, bondClientFilter.key_list_markets) == -1) {
                        row.visible = false;
                        return true;
                    }

                    length++;
                });
                return renderalbeRows;
            },
            // 持仓筛选
            accountBondFilter: function (renderalbeRows) {
                renderalbeRows.forEach(function (row) {
                    // if (row.entity.first_val != undefined || row.entity.second_val != undefined) {
                    //     return true;
                    // }
                    // 最后一行
                    if (!angular.isDefined(row.entity.bond_key_listed_market) && !bondFilterVar.showAll) {
                        row.visible = false;
                        return true;
                    }

                    //搜索框筛选
                    if (bondClientFilter.searchKey != null && bondClientFilter.searchKey != "") {
                        if (row.entity.bond_code == null || (row.entity.bond_code != null && (row.entity.bond_code).indexOf(bondClientFilter.searchKey) == -1)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //server
                    if (bondClientFilter.key_list_markets != null && $.inArray(row.entity.bond_key_listed_market, bondClientFilter.key_list_markets) == -1) {
                        row.visible = false;
                        return true;
                    }
                });
                return renderalbeRows;
            },
            accountStockFilter: function (renderalbeRows) {
                renderalbeRows.forEach(function (row) {
                    //搜索框筛选
                    if (stockClientFilter.searchKey != null && stockClientFilter.searchKey != "") {
                        if (row.entity.stock_code == null || (row.entity.stock_code != null && (row.entity.stock_code).indexOf(stockClientFilter.searchKey) == -1)) {
                            row.visible = false;
                            return true;
                        }
                    }
                });
                return renderalbeRows;
            },
            accountFundFilter: function (renderalbeRows) {
                renderalbeRows.forEach(function (row) {
                    //搜索框筛选
                    if (fundClientFilter.searchKey != null && fundClientFilter.searchKey != "") {
                        if (row.entity.fund_code == null || (row.entity.fund_code != null && (row.entity.fund_code).indexOf(fundClientFilter.searchKey) == -1)) {
                            row.visible = false;
                            return true;
                        }
                    }
                });
                return renderalbeRows;
            },
            accountCashflowFilter: function (renderalbeRows, codeBond) {
                renderalbeRows.forEach(function (row) {
                    //搜索框筛选
                    if (cashflowClientFilter.searchKey != null && cashflowClientFilter.searchKey != "") {
                        if (row.entity.code == null || row.entity.code.indexOf(cashflowClientFilter.searchKey) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }
                    // 筛选描述
                    if (cashflowClientFilter.details.length != 0 && cashflowClientFilter.details[0] != 'all') {
                        var isInDetail = false;
                        angular.forEach(cashflowClientFilter.details, function(detail) {
                            isInDetail = isInDetail || (row.entity.desc.indexOf(detail) !== -1)
                        })
                        if (!isInDetail) {
                            row.visible = false;
                            return true;
                        }
                    }
                    // 日期区间筛选，当字段为 execute_date 时
                    var date = row.entity.execute_date ? row.entity.execute_date : row.entity.date;
                    if (cashflowClientFilter.startDate === '' && cashflowClientFilter.endDate !== '') {
                        if (date > cashflowClientFilter.endDate) {
                            row.visible = false;
                            return true;
                        }
                    }
                    if (cashflowClientFilter.startDate !== '' && cashflowClientFilter.endDate === '') {
                        if (date < cashflowClientFilter.startDate) {
                            row.visible = false;
                            return true;
                        }
                    }
                    if (cashflowClientFilter.startDate !== '' && cashflowClientFilter.endDate !== '') {
                        if (date < cashflowClientFilter.startDate || date > cashflowClientFilter.endDate) {
                            row.visible = false;
                            return true;
                        }
                    }
                    //server
                    if ((bondClientFilter.key_list_markets != null && bondClientFilter.key_list_markets.length == 0) ||
                        (bondClientFilter.key_list_markets != null && bondClientFilter.key_list_markets.length != 0 && $.inArray(row.entity.bond_key_listed_market, bondClientFilter.key_list_markets) == -1)) {
                        row.visible = false;
                        return true;
                    }
                });
                return renderalbeRows;
            },
            bondTradeFilter: function (renderalbeRows, codeBond) {
                renderalbeRows.forEach(function (row) {
                    //搜索框筛选
                    if (bondClientFilter.searchKey != null && bondClientFilter.searchKey != "") {
                        if ($filter('codeBond')(row.entity.bond_key_listed_market).indexOf(bondClientFilter.searchKey) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }
                    // 指令
                    if (bondClientFilter.direction != null && bondClientFilter.direction.length != 0) {
                        if ($.inArray(row.entity.direction, bondClientFilter.direction) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }
                    //账户
                    if (bondClientFilter.account_filter != null) {
                        if (row.entity.account_id != bondClientFilter.account_filter) {
                            row.visible = false;
                            return true;
                        }
                        else {
                            console.log()
                        }
                    }
                    //录入人
                    if (bondClientFilter.user_filter != null) {
                        if (row.entity.manager != bondClientFilter.user_filter) {
                            row.visible = false;
                            return true;
                        }
                        else {
                            console.log()
                        }
                    }
                    // 筛选描述
                    if (bondClientFilter.details.length != 0 && bondClientFilter.details[0] != 'all') {
                        for(var i=0; i<bondClientFilter.details.length; i++){
                            var value = bondClientFilter.details[i];
                            if (row.entity.desc.indexOf(value) != -1){
                                return true;
                            }
                        }
                        row.visible = false;
                        return true;
                    }
                    //server
                    if ((bondClientFilter.key_list_markets != null && bondClientFilter.key_list_markets.length == 0) ||
                        (bondClientFilter.key_list_markets != null && bondClientFilter.key_list_markets.length != 0 && $.inArray(row.entity.bond_key_listed_market, bondClientFilter.key_list_markets) == -1)) {
                        row.visible = false;
                        return true;
                    }
                });
                return renderalbeRows;
            },
            dealFilter: function (renderalbeRows) {
                var length = 0;
                var position_flag = $.inArray('position', dealClientFilter.store_type) != -1;
                var pool_flag = $.inArray('pool', dealClientFilter.store_type) != -1;
                var invest_flag = $.inArray('invest', dealClientFilter.store_type) != -1;
                var all_flag = position_flag && pool_flag && invest_flag;

                renderalbeRows.forEach(function (row) {
                    //长度限制100条
                    /*                    if (length > filterLength) {
                     row.visible = false;
                     return true;
                     }*/
                    //QB 权限控制
                    if (!interactWithQB.hasBrokerAuthority(row.entity.company_id)) {
                        row.visible = false;
                        return true;
                    }
                    //搜索框筛选
                    if (dealClientFilter.searchKey != null && dealClientFilter.searchKey != "") {
                        if (row.entity.bond_id == null || (row.entity.bond_id != null && (row.entity.bond_id).indexOf(dealClientFilter.searchKey) == -1)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //市场
                    if (bondDealMarket.type == 'interBank') {
                        if (dealClientFilter.company_ids.length != 0 && $.inArray(row.entity.company_id, dealClientFilter.company_ids) == -1) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //仓库类型
                    if (dealClientFilter.store_type != null && dealClientFilter.store_type.length != 0 && !all_flag) {
                        var key = row.entity.bond_key_listed_market;
                        if (store_type_filter(position_flag, pool_flag, invest_flag, key)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //server
                    if (dealClientFilter.key_list_markets != null && $.inArray(row.entity.bond_key_listed_market, dealClientFilter.key_list_markets) == -1) {
                        row.visible = false;
                        return true;
                    }

                    length++;
                });
                return renderalbeRows;
            },
            qbDealFilter: function (renderalbeRows) {
                var length = 0;
                var position_flag = $.inArray('position', dealClientFilter.store_type) != -1;
                var pool_flag = $.inArray('pool', dealClientFilter.store_type) != -1;
                var invest_flag = $.inArray('invest', dealClientFilter.store_type) != -1;
                var all_flag = position_flag && pool_flag && invest_flag;

                var tempCompany = [];
                if (bondDealMarket.type != 'exchange' && bondDealMarket.type != 'interBank') {
                    tempCompany = null;
                } else if (bondDealMarket.type == 'exchange') {
                    tempCompany.push('e');
                } else if (bondDealMarket.type == 'interBank') {
                    if (dealClientFilter.company_ids == null || dealClientFilter.company_ids.length == 0) {
                        tempCompany = tempCompany.concat(bondConstantKey.company_ids);
                    } else {
                        tempCompany = tempCompany.concat(dealClientFilter.company_ids);
                    }
                }
                renderalbeRows.forEach(function (row) {
                    //搜索框筛选
                    if (dealClientFilter.searchKey != null && dealClientFilter.searchKey != "") {
                        if (row.entity.code == null || (row.entity.code != null && (row.entity.code).indexOf(dealClientFilter.searchKey) == -1)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //市场
                    if (tempCompany == null || (tempCompany.length != 0 && $.inArray(row.entity.corp, tempCompany) == -1)) {
                        row.visible = false;
                        return true;
                    }

                    //仓库类型
                    if (dealClientFilter.store_type != null && dealClientFilter.store_type.length != 0 && !all_flag) {
                        var key = row.entity.bond_key_listed_market;
                        if (store_type_filter(position_flag, pool_flag, invest_flag, key)) {
                            row.visible = false;
                            return true;
                        }
                    }

                    //server
                    if (dealClientFilter.key_list_markets != null && $.inArray(row.entity.bond_key_listed_market, dealClientFilter.key_list_markets) == -1) {
                        row.visible = false;
                        return true;
                    }

                    length++;
                });
                return renderalbeRows;
            },
        }
    })