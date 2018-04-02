angular.module('ias.dataCenter')
    .factory('marketDataClass', function (bondMarket, $filter, dataCenter) {
        var inferPrimary = function (bond_key_listed_market) {
            var isInterestRateBond = dataCenter.market.interestRateBondTypes.some(function (bondType) {
                return bond_key_listed_market.indexOf(bondType) > 0;
            });
            var lastDigit = bond_key_listed_market.substr(-4, 1);
            var key = bond_key_listed_market.slice(0, -5) + bond_key_listed_market.substr(-3);
            if (isInterestRateBond && 0 <= lastDigit && lastDigit <= 9) { // 增发券 e.g. 'G0001242016FINPBB0517CIB'
                return dataCenter.market.bondDetailMap[key];
            }
        };

        return {
            createBondPoolMap: function(data) {
                $.each(data, function(index, bond) {
                    if (bond.hasOwnProperty('bond_key_listed_market')) {
                        var key = bond.bond_key_listed_market;
                        dataCenter.market.bondPoolMap[key] = index;
                        dataCenter.market.marketBondMap[key] = index;
                    }
                })
            },
            updateBondPositionProperty: function(keyList) {
                var last_list = [];
                $.each(keyList, function (index, key) {
                    var add_flag = false;
                    if (!dataCenter.market.investableBondMap.hasOwnProperty(key) && !dataCenter.market.bondPoolMap.hasOwnProperty(key)) {
                        add_flag = true;
                        dataCenter.market.marketBondMap[key] = index;
                    }

                    if (add_flag) {
                        last_list.push(key);
                    } else {
                        $.each(dataCenter.market.deal, function(i, deal) {
                            if (deal.bond_key_listed_market === key) {
                                deal.positions = dataCenter.account.positionBondMap[key];
                            }
                        });

                        $.each(dataCenter.market.exchangeDeal, function(i, deal) {
                            if (deal.bond_key_listed_market === key) {
                                deal.positions = dataCenter.account.positionBondMap[key];
                            }
                        });

                        $.each(dataCenter.market.bond, function(i, bond) {
                            if (bond.bond_key_listed_market === key) {
                                bond.positions = dataCenter.account.positionBondMap[key];
                            }
                        });
                    }
                })
                return last_list;
            },
            getBondDealByMap: function (key, isExchange) {
                var deal = {};
                if (isExchange) {
                    if (key !== undefined && key != null && dataCenter.market.exchangeDealMarketMap.hasOwnProperty(key)) {
                        deal.clean_price = dataCenter.market.exchangeDealMarketMap[key].clean_price;
                        deal.volume = dataCenter.market.exchangeDealMarketMap[key].volume;
                        deal.clean_price_change = dataCenter.market.exchangeDealMarketMap[key].clean_price_change;
                        deal.ytm_yield = dataCenter.market.exchangeDealMarketMap[key].ytm;
                        deal.ytcp_yield = dataCenter.market.exchangeDealMarketMap[key].ytcp;
                        deal.yield_change = dataCenter.market.exchangeDealMarketMap[key].yield_change;
                    }
                } else {
                    if (key !== undefined && key != null && dataCenter.market.dealMarketMap.hasOwnProperty(key)) {
                        deal.clean_price = dataCenter.market.dealMarketMap[key].clean_price;
                        deal.volume = dataCenter.market.dealMarketMap[key].volume;
                        deal.clean_price_change = dataCenter.market.dealMarketMap[key].clean_price_change;
                        deal.yield = dataCenter.market.dealMarketMap[key].yield;
                        deal.yield_change = dataCenter.market.dealMarketMap[key].yield_change;
                    }
                }
                return deal;
            },
            updateMarketDealProperty: function (deal, isExchange) {
                var key = deal.bond_key_listed_market;
                $.each(dataCenter.market.bond, function (index, bond) {
                    if (bond.hasOwnProperty('bond_key_listed_market') && bond.bond_key_listed_market == key) {
                        if (isExchange && bond.company_id == 'e') {
                            bond.deal.clean_price = deal.clean_price;
                            bond.deal.volume = deal.volume;
                            bond.deal.clean_price_change = deal.clean_price_change;
                            bond.deal.ytm_yield = deal.ytm;
                            bond.deal.ytcp_yield = deal.ytcp;
                            bond.deal.yield_change = deal.yield_change;
                        } else if (!isExchange && bond.company_id != 'e') {
                            bond.deal.clean_price = deal.clean_price;
                            bond.deal.volume = deal.volume;
                            bond.deal.clean_price_change = deal.clean_price_change;
                            bond.deal.yield = deal.yield;
                            bond.deal.yield_change = deal.yield_change;
                        }
                    }
                });
            },
            updateCurrentDealMap: function (data, marketType) {
                var result = [];

                $.each(data.deal_list, function (index, deal) {
                    var key = deal.bond_key_listed_market;
                    if (dataCenter.account.positionBondMap.hasOwnProperty(key)) {
                        if (dataCenter.market.currentDealMap.hasOwnProperty(key)) {
                            if (dataCenter.market.currentDealMap[key].update_time < deal.update_time) {
                                deal.marketType = marketType;
                                dataCenter.market.currentDealMap[key] = deal;
                                result.push(deal);
                            }
                        } else {
                            deal.marketType = marketType;
                            dataCenter.market.currentDealMap[key] = deal;
                            result.push(deal);
                        }
                    }
                });

                return result;
            },
            updateDealProperty: function (data, marketData) {
                $.each(data, function (key, deal) {
                    $.each(marketData, function (index, bond) {
                        if (bond.bond_key_listed_market == key) {
                            bond.deal.curr_yield = deal.hasOwnProperty('yield') ? deal.yield : deal.ytm;
                            bond.deal.curr_clean_price = deal.clean_price;
                            bond.deal.marketType = deal.marketType;
                            return false;
                        }
                    })
                })
            },
            getPositionBonds: function () {
                var result = [];
                $.each(dataCenter.market.marketBondMap, function(key, value) {
                    result.push(key);
                });
                return result;
            },
        }
    })
    .factory('updateData', ['dealMarket', 'dataCenter', 'messageBox', 'bondMarket', 'marketDataClass', '$q', 'exchangeDealMarket',
        function (dealMarket, dataCenter, messageBox, bondMarket, marketDataClass, $q, exchangeDealMarket) {
        var deleteBondMarketData = function (keyList) {
            $.each(keyList, function (index, key) {
                for(var i = 0; i < dataCenter.market.bond.length; i++) {
                    if (dataCenter.market.bond[i].bond_key_listed_market == key) {
                        if (!dataCenter.market.investableBondMap.hasOwnProperty(key) &&
                            !dataCenter.market.bondPoolMap.hasOwnProperty(key)) {
                            dataCenter.market.bond.splice(i, 1);
                            i = i-1;
                        } else {
                            delete dataCenter.market.bond[i].positions;
                        }
                    }
                }
            });
        };
        var deleteBondDealMarketData = function (list) {
            $.each(list, function(index, key) {
                var delete_flag = false;
                if (!dataCenter.market.investableBondMap.hasOwnProperty(key) &&
                    !dataCenter.market.bondPoolMap.hasOwnProperty(key)) {
                    delete dataCenter.market.marketBondMap[key];
                    delete_flag = true;
                }
                for (var i = 0; i < dataCenter.market.deal.length; i++) {
                    if (dataCenter.market.deal[i].bond_key_listed_market == key) {
                        if (delete_flag) {
                            dataCenter.market.deal.splice(i, 1);
                            i = i -1;
                        } else {
                            delete dataCenter.market.deal[i].positions;
                        }
                    }
                }
            });
        }
        return {
            IBDealMarket: function (action, list, activeTab) {
                var defer = $q.defer();
                if (action == 'add') {
                    dealMarket.getAllData({
                        bond_key_listed_markets: list,
                        BrokerQuote: dataCenter.authority.broker
                    }, function success(dealMap) {
                        $.each(list, function (index, key) {
                            if (key != null && key != '' && dealMap.hasOwnProperty(key)) {
                                var dealList = dealMap[key];
                                $.each(dealList, function (i, deal) {
                                    if (deal.hasOwnProperty('bond_key_listed_market') && deal.bond_key_listed_market == key) {
                                        deal.positions = dataCenter.account.positionBondMap[key];
                                        dataCenter.market.deal.splice(0, 0, deal);
                                    }
                                });

                                if (dealList.length > 0) {
                                    dataCenter.market.dealMarketMap[key] = dealList[0];
                                    dealList[0].marketType = 'interBank';
                                    dataCenter.market.currentDealMap[key] = dealList[0];
                                }
                            }
                        });

                        defer.resolve();
                    }, function failed() {
                        messageBox.error('银行间成交获取失败！');
                        defer.reject()
                    });
                } else {
                    deleteBondDealMarketData(list);
                    defer.resolve();
                }

                return defer.promise;
            },
            exchangeDealMarket: function (action, list, activeTab) {
                var defer = $q.defer();
                if (action == 'add') {
                    exchangeDealMarket.get({bond_key_listed_markets: list}, function success(response) {
                        if (response.code && response.code === '0000') {
                            var dealMap = response.data;
                            $.each(list, function (i, key) {
                                if (key != null && key != '' && dealMap.hasOwnProperty(key)) {
                                    var deal = dealMap[key];
                                    deal.positions = dataCenter.account.positionBondMap[key];
                                    dataCenter.market.exchangeDeal.splice(0, 0, deal);

                                    dataCenter.market.exchangeDealMarketMap[key] = deal;

                                    if (dataCenter.market.currentDealMap.hasOwnProperty(key)) {
                                        if (dataCenter.market.currentDealMap[key].update_time < deal.update_time) {
                                            deal.marketType = 'exchange';
                                            dataCenter.market.currentDealMap[key] = deal;
                                        }
                                    } else {
                                        deal.marketType = 'exchange';
                                        dataCenter.market.currentDealMap[key] = deal;
                                    }
                                }
                            });
                        }
                        defer.resolve();
                    }, function failed() {
                        messageBox.error('交易所成交获取失败！');
                        defer.reject();
                    });
                } else {
                    $.each(list, function(index, key) {
                        var delete_flag = false;
                        if (!dataCenter.market.investableBondMap.hasOwnProperty(key) &&
                            !dataCenter.market.bondPoolMap.hasOwnProperty(key)) {
                            delete_flag = true;
                        }
                        for (var i = 0; i < dataCenter.market.exchangeDeal.length; i++) {
                            if (dataCenter.market.exchangeDeal[i].bond_key_listed_market = key) {
                                if (delete_flag) {
                                    dataCenter.market.exchangeDeal.splice(i, 1);
                                    i = i -1;
                                } else {
                                    delete dataCenter.market.exchangeDeal[i].positions;
                                }
                            }
                        }
                    });
                    defer.resolve();
                }
                return defer.promise;
            },
            bondMarket: function (action, keyList, activeTab) {
                var defer = $q.defer();
                if (action == 'add') {
                    bondMarket.getMap({
                        bond_key_listed_markets: keyList,
                        BrokerQuote: dataCenter.authority.broker
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var quoteMap = response.data;
                            $.each(keyList, function (index, key) {
                                if (quoteMap.hasOwnProperty(key)) {
                                    var quoteList = quoteMap[key];
                                    var exchangeDeal = marketDataClass.getBondDealByMap(key, true);
                                    var interBankDeal = marketDataClass.getBondDealByMap(key, false);
                                    $.each(quoteList, function (i, quote) {
                                        if (quote.hasOwnProperty('bond_key_listed_market') && quote.bond_key_listed_market == key) {
                                            if (quote.company_id == 'e') {
                                                quote.deal = exchangeDeal;
                                            } else {
                                                quote.deal = interBankDeal;
                                            }
                                            quote.positions = dataCenter.account.positionBondMap[key];
                                            dataCenter.market.bond.push(quote);
                                        }
                                    });
                                }
                            });
                        }
                        defer.resolve();
                    }, function failed() {
                        messageBox.error('二级行情获取失败！');
                        defer.reject();
                    });
                } else {
                    deleteBondMarketData(keyList);
                    defer.resolve();
                }
                return defer.promise;
            }
        }
    }])
    .factory('authorityControl', function(dataCenter, authorityConstant, user, account) {
        var getAccountTradeOption = function(account_id) {
            var trade_option = authorityConstant.ACCOUNT_TRADE_VIEW;
            $.each(dataCenter.account.accountsData, function(index, account) {
                if (account.hasOwnProperty('id') && account.id == account_id) {
                    trade_option = account.trade_option;
                    return false;
                }
            });
            return trade_option;
        }

        return {
            getAuthorityAndAgentCompany: function(account_id) {
                var result = {
                    option: authorityConstant.ACCOUNT_WRITE,
                    agent_company_id: null,
                    trade_option: authorityConstant.ACCOUNT_TRADE_VIEW
                };

                $.each(dataCenter.account.accountsData, function(index, account) {
                    if (account.hasOwnProperty('id') && account.id == account_id ) {
                        if (account.hasOwnProperty('option')) {
                            result.option = account.option;
                            result.agent_company_id = account.agent_company_id || null;
                            result.trade_option = account.trade_option;
                        }
                        return false;
                    }
                });
                return result;
            },
            getDefaultAccountAuthority: function() {
                return authorityConstant.ACCOUNT_WRITE;
            },
            getAccountGroupAuthority: function(account_ids) {
                var result = {
                    option: authorityConstant.ACCOUNT_WRITE,
                    trade_option: authorityConstant.ACCOUNT_TRADE_VIEW
                };
                $.each(account_ids ,function(index, account_id) {
                    $.each(dataCenter.account.accountsData, function(index, account) {
                        if (account.hasOwnProperty('id') && account.id == account_id) {
                            if (account.agent_company_id) {     //委外
                                result.trade_option = result.trade_option && account.trade_option;
                            }
                        }
                    });
                });
                return result;
            },
            hasAccountAuthority: function(account) {
                if (account.manager === user.id) { //自己创建的账户
                    return true;
                } else if (dataCenter.account.accountAuthorityMap != null &&
                    dataCenter.account.accountAuthorityMap.hasOwnProperty(account.id)) { //拥有他人账户的权限

                    var result = false;
                    //排除其他公司的账户与本公司的账户 id 相同的情况。
                    $.each(dataCenter.account.accountsData, function(index, old) {
                        if (old.id === account.id  && old.manager === account.manager) {
                            result = true;
                            return false;
                        }
                    });
                    return result;
                }

                return false;
            },
            notSelfAccount: function(account_id) {
                var result = false;
                var find = false;
                $.each(dataCenter.account.accountsData, function(index, account) {
                    if (account.hasOwnProperty('id') && account.id == account_id) {
                        if (account.manager != user.id) {
                            result = true;
                        }
                        find = true;
                        return false;
                    }
                });
                if (!find) {
                    result = true;
                }
                return result;
            },
            getAccountGroupMember: function(account_ids) {
                var result = [];
                $.each(account_ids ,function(index, account_id) {
                    $.each(dataCenter.account.accountsData, function(index, account) {
                        if (account.hasOwnProperty('id') && account.id == account_id) {
                            result.push({
                                account_id: account_id,
                                company_id: account.agent_company_id || user.company_id
                            })
                        }
                    });
                });
                return result;
            },
            updateAccountAndAuthority: function(data, callBack) {
                if (data.hasOwnProperty('add_list') && data.add_list != null && data.add_list.length > 0) {
                    $.each(data.add_list, function(index, authority) {
                        if (authority.hasOwnProperty('user_id') && authority.user_id == user.id && authority.hasOwnProperty('account_id')) {
                            dataCenter.account.accountAuthorityMap[authority.account_id] = authority;

                            account.get({account_id: authority.account_id, company_id: user.company_id}, function success(response) {
                                if (response.code && response.code === '0000') {
                                    var data = response.data;
                                    data.option = dataCenter.account.accountAuthorityMap[data.id].option;
                                    dataCenter.account.accountsData.push(data);
                                    if (callBack){
                                        callBack();
                                    }
                                }
                            });
                        }
                    });
                }

                if (data.hasOwnProperty('delete_list') && data.delete_list != null && data.delete_list.length > 0) {
                    $.each(data.delete_list, function(index, authority) {
                        if (authority.hasOwnProperty('user_id') && authority.user_id == user.id && authority.hasOwnProperty('account_id')) {
                            delete dataCenter.account.accountAuthorityMap[authority.account_id];

                            $.each(dataCenter.account.accountsData, function(i, oldAccount) {
                                if (oldAccount.hasOwnProperty('id') && oldAccount.id == authority.account_id) {
                                    dataCenter.account.accountsData.splice(i, 1);
                                    return false;
                                }
                            });
                            if (callBack){
                                callBack();
                            }
                        }
                    });
                }

                if (data.hasOwnProperty('update_list') && data.update_list != null && data.update_list.length > 0) {
                    $.each(data.update_list, function(index, authority) {
                        if (authority.hasOwnProperty('user_id') && authority.user_id == user.id && authority.hasOwnProperty('account_id')) {
                            dataCenter.account.accountAuthorityMap[authority.account_id] = authority;

                            $.each(dataCenter.account.accountsData, function(i, oldAccount) {
                                if (oldAccount.hasOwnProperty('id') && oldAccount.id == authority.account_id) {
                                    oldAccount.option = authority.option;
                                    return false;
                                }
                            });
                            if (callBack){
                                callBack();
                            }
                        }
                    });
                }
            },
            updateAgentAccountAuthority: function(data, callBack) {
                if (data.hasOwnProperty('add_list') && data.add_list != null && data.add_list.length > 0) {
                    $.each(data.add_list, function(index, authority) {
                        if (authority.hasOwnProperty('account_id')) {
                            dataCenter.account.accountAuthorityMap[authority.account_id] = authority;
                            dataCenter.account.accountAuthorityMap[authority.account_id].agent_company_name = data.agent_company_name;

                            account.get({account_id: authority.account_id, company_id: authority.company_id}, function success(response) {
                                if (response.code && response.code === '0000') {
                                    var resule = response.data;
                                    result.option = dataCenter.account.accountAuthorityMap[result.id].option;
                                    result.agent_company_id = dataCenter.account.accountAuthorityMap[result.id].company_id;
                                    result.agent_company_name = dataCenter.account.accountAuthorityMap[result.id].agent_company_name;
                                    dataCenter.account.accountsData.push(result);
                                    if (callBack){
                                        callBack();
                                    }
                                }
                            });
                        }
                    });
                }

                if (data.hasOwnProperty('delete_list') && data.delete_list != null && data.delete_list.length > 0) {
                    $.each(data.delete_list, function(index, authority) {
                        if (authority.hasOwnProperty('account_id')) {
                            delete dataCenter.account.accountAuthorityMap[authority.account_id];

                            $.each(dataCenter.account.accountsData, function(i, oldAccount) {
                                if (oldAccount.hasOwnProperty('id') && oldAccount.id == authority.account_id) {
                                    dataCenter.account.accountsData.splice(i, 1);
                                    return false;
                                }
                            });
                            if (callBack){
                                callBack();
                            }
                        }
                    });
                }

                if (data.hasOwnProperty('update_list') && data.update_list != null && data.update_list.length > 0) {
                    $.each(data.update_list, function(index, authority) {
                        if (authority.hasOwnProperty('user_id') && authority.user_id == user.id && authority.hasOwnProperty('account_id')) {
                            dataCenter.account.accountAuthorityMap[authority.account_id] = authority;

                            $.each(dataCenter.account.accountsData, function(i, oldAccount) {
                                if (oldAccount.hasOwnProperty('id') && oldAccount.id == authority.account_id &&
                                    oldAccount.agent_company_id == authority.company_id) {
                                    oldAccount.option = authority.option;
                                    oldAccount.agent_company_id = authority.company_id;
                                    return false;
                                }
                            });
                            if (callBack){
                                callBack();
                            }
                        }
                    });
                }
            },
            filterByTradeOption: function(datas) {
                var splice_list = [];
                $.each(datas, function(index, data) {
                    if(data.hasOwnProperty('account_id')) {
                        var trade_option = getAccountTradeOption(data.account_id);
                        if (trade_option !== authorityConstant.ACCOUNT_TRADE_VIEW) {
                            splice_list.push(index);
                        }
                    }
                });

                $.each(splice_list, function(index,value) {
                    datas.splice(value, 1);
                })
            },
            updateAgentAccountTradeOption: function(data) {
                if (data.hasOwnProperty('authority') && data.authority != null) {
                    $.each(dataCenter.account.accountsData, function(i, account) {
                        if (account.hasOwnProperty('id') && account.id == data.authority.account_id &&
                            account.agent_company_id == data.authority.company_id) {
                            account.trade_option = data.authority.trade_option;
                            return false;
                        }
                    })
                }
            }
        }
    });