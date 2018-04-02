angular.module('ias.dataCenter')
    .factory('socketData', function ($filter, positionQuery, dataCenter, account, updateData,
                                     user, marketDataClass, authorityControl) {
        var bondMarketFunc = function (bond, key) {
            if (bond.company_id == 'e') {
                bond.deal = marketDataClass.getBondDealByMap(key, true);
            } else {
                bond.deal = marketDataClass.getBondDealByMap(key, false);
            }
            if (dataCenter.account.positionBondMap.hasOwnProperty(key)) {
                bond.positions = dataCenter.account.positionBondMap[key];
            }

            $.each(dataCenter.market.bond, function (i, quoteData) {
                if (quoteData.uid == bond.uid) {
                    if (bond.company_id != 'e') {                //银行间
                        dataCenter.market.bond.splice(i, 1);
                    } else {                                    //交易所
                        bond.isUpdate = true;
                        dataCenter.market.bond.splice(i, 1, bond);
                    }
                    return false;
                }
            });
            if (bond.company_id != 'e') {//银行间走马灯
                dataCenter.market.bond.splice(0, 0, bond);
            }
        };
        var dealFunc = function (deal, action) {
            $.each(dataCenter.market.deal, function (i, contract) {
                if (contract.deal_id == deal.deal_id) {
                    dataCenter.market.deal.splice(i, 1);
                    return false;
                }
            });

            if (action != 'delete') {
                dataCenter.market.dealMarketMap[deal.bond_key_listed_market] = deal;
                if (dataCenter.account.positionBondMap.hasOwnProperty(deal.bond_key_listed_market)) {
                    deal.positions = dataCenter.account.positionBondMap[deal.bond_key_listed_market];
                }

                dataCenter.market.deal.splice(0, 0, deal);
            } else {
                delete dataCenter.market.dealMarketMap[deal.bond_key_listed_market];
            }
            marketDataClass.updateMarketDealProperty(deal, false);
        };
        var exchangeDealFunc = function (deal, key, action) {
            if (action != 'delete') {
                dataCenter.market.exchangeDealMarketMap[key] = deal;
            } else {
                delete dataCenter.market.exchangeDealMarketMap[key];
            }

            if (action == 'add') {
                if (dataCenter.account.positionBondMap.hasOwnProperty(key)) {
                    deal.positions = dataCenter.account.positionBondMap[key];
                }
                dataCenter.market.exchangeDeal.splice(0, 0, deal);
            } else {
                $.each(dataCenter.market.exchangeDeal, function (i, contract) {
                    if (contract.bond_key_listed_market == key) {
                        if (action == 'delete') {
                            dataCenter.market.exchangeDeal.splice(i, 1);
                        } else if (action == 'update') {
                            if (dataCenter.account.positionBondMap.hasOwnProperty(key)) {
                                deal.positions = dataCenter.account.positionBondMap[key];
                            }
                            dataCenter.market.exchangeDeal.splice(i, 1, deal);
                        }
                        return false;
                    }
                });
            }
            marketDataClass.updateMarketDealProperty(deal, true);
        };
        var deleteAccountPosition = function (row, activeTab) {
            var deleteList = [];
            var bondMap = dataCenter.account.accountPositionMap[row.id];
            if (bondMap) {
                $.each(bondMap, function (index, key) {
                    if (dataCenter.account.positionBondMap[key].length == 2) {
                        deleteList.push(key);
                        delete dataCenter.account.positionBondMap[key];
                    } else {
                        $.each(dataCenter.account.positionBondMap[key], function (i, position) {
                            if (position.account_id == row.id) {
                                var last = dataCenter.account.positionBondMap[key].length - 1;
                                dataCenter.account.positionBondMap[key][last].volume = dataCenter.account.positionBondMap[key][last].volume - dataCenter.account.positionBondMap[key][i].volume;
                                dataCenter.account.positionBondMap[key].splice(i, 1);
                                return false;
                            }
                        });
                    }
                });
            }

            delete dataCenter.account.accountPositionMap[row.id];

            if (deleteList.length > 0) {
                updateBondDealMarket('delete', deleteList, activeTab);
            }
        };
        var addAccountPosition = function(row, company_id, activeTab) {
            var addList = [];
            var valuation_date = null;
            if (row.valuation_dates && row.valuation_dates.length > 0) {
                valuation_date = row.valuation_dates[0];
            }
            positionQuery.get({
                account_id: row.id,
                company_id: company_id,
                date: valuation_date
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var dataList = response.data;
                    var bondMap = [];
                    $.each(dataList, function (i, bond) {
                        var key = bond.bond_key_listed_market;
                        if (key !== undefined) {
                            var volume = bond.volume;
                            if (!dataCenter.account.positionBondMap.hasOwnProperty(key)) {
                                dataCenter.account.positionBondMap[key] = [];
                                dataCenter.account.positionBondMap[key].push({
                                    account_id: '',
                                    account_name: '总计：',
                                    volume: 0
                                });
                                addList.push(key);
                            }
                            var last = dataCenter.account.positionBondMap[key].length - 1;
                            dataCenter.account.positionBondMap[key][last].volume = dataCenter.account.positionBondMap[key][last].volume + volume;
                            dataCenter.account.positionBondMap[key].splice(last, 0, {
                                account_id: row.id,
                                account_name: bond.account_name,
                                volume: bond.volume
                            });
                            bondMap.push(key);
                        }
                    });
                    dataCenter.account.accountPositionMap[row.id] = bondMap;

                    if (addList.length > 0) {
                        var last_add_list = marketDataClass.updateBondPositionProperty(addList);
                        if (last_add_list.length > 0) {
                            updateBondDealMarket('add', last_add_list, activeTab);
                        }
                    }
                }
            });
        };
        var updateAccountPosition = function(account_id, company_id, valuation_date, activeTab) {
            positionQuery.get({
                account_id: account_id,
                company_id: company_id,
                date:valuation_date
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    var addList = [];
                    var deleteList = [];

                    var bondMap = [];
                    var oldMap = dataCenter.account.accountPositionMap[account_id];
                    $.each(dataList, function (index, bond) {
                        var key = bond.bond_key_listed_market;
                        if (key !== undefined) {
                            var volume = bond.volume;
                            if (oldMap && $.inArray(key, oldMap) != -1) {
                                //老券更新量
                                var len = dataCenter.account.positionBondMap[key].length - 1;
                                $.each(dataCenter.account.positionBondMap[key], function (i, position) {
                                    if (position.account_id == account_id) {
                                        var oldVolume = position.volume;
                                        dataCenter.account.positionBondMap[key].splice(i, 1, {
                                            account_id: account_id,
                                            account_name: bond.account_name,
                                            volume: bond.volume
                                        });
                                        dataCenter.account.positionBondMap[key][len].volume = dataCenter.account.positionBondMap[key][len].volume + volume - oldVolume;
                                        return false;
                                    }
                                })
                            } else {
                                //新券
                                if (!dataCenter.account.positionBondMap.hasOwnProperty(key)) {
                                    addList.push(key);
                                    dataCenter.account.positionBondMap[key] = [];
                                    dataCenter.account.positionBondMap[key].push({
                                        account_id: '',
                                        account_name: '总计：',
                                        volume: 0
                                    });
                                }
                                var last = dataCenter.account.positionBondMap[key].length - 1;
                                dataCenter.account.positionBondMap[key][last].volume = dataCenter.account.positionBondMap[key][last].volume + volume;
                                dataCenter.account.positionBondMap[key].splice(last, 0, {
                                    account_id: account_id,
                                    account_name: bond.account_name,
                                    volume: bond.volume
                                });
                            }

                            bondMap.push(key);
                        }
                    });
                    if (oldMap) {
                        $.each(oldMap, function (index, key) {
                            if ($.inArray(key, bondMap) == -1) {
                                //删除券
                                if (dataCenter.account.positionBondMap[key]) {
                                    if (dataCenter.account.positionBondMap[key].length == 2) {
                                        deleteList.push(key);
                                        delete dataCenter.account.positionBondMap[key];
                                    } else {
                                        var last = dataCenter.account.positionBondMap[key].length - 1;
                                        $.each(dataCenter.account.positionBondMap[key], function (i, position) {
                                            if (position.account_id == account_id) {
                                                dataCenter.account.positionBondMap[key][last].volume -= position.volume;
                                                dataCenter.account.positionBondMap[key].splice(i, 1);
                                                return false;
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }

                    dataCenter.account.accountPositionMap[account_id] = bondMap;

                    if (deleteList.length > 0) {
                        updateBondDealMarket('delete', deleteList, activeTab);
                    }

                    if (addList.length > 0) {
                        var last_list = marketDataClass.updateBondPositionProperty(addList);
                        if (last_list.length > 0) {
                            updateBondDealMarket('add', last_list, activeTab);
                        }
                    }
                }
            });
        };
        var updateBondDealMarket = function (action, actionList, activeTab) {
            var exchangeCallback = function () {
                updateData.bondMarket(action, actionList, activeTab);
            }
            var IBCallback = function () {
                if (dataCenter.authority.hasExchange) {
                    updateData.exchangeDealMarket(action, actionList).then(exchangeCallback,exchangeCallback);
                } else {
                    updateData.bondMarket(action, actionList, activeTab)
                }
            };
            updateData.IBDealMarket(action, actionList, activeTab).then(IBCallback, IBCallback);
        };
        return {
            bondMarket: function (data, realtime) {
                $.each(data, function (index, bond) {
                    var key = bond.bond_key_listed_market;
                    if (!realtime) {
                        bondMarketFunc(bond, key);
                    } else if (dataCenter.market.marketBondMap.hasOwnProperty(key)) {
                        bondMarketFunc(bond, key);
                    }
                });
            },
            dealMarket: function (data, realTime) {
                if (realTime) {
                    $.each(data.deal_list, function (index, deal) {
                        if (dataCenter.market.marketBondMap.hasOwnProperty(deal.bond_key_listed_market)) {
                            dealFunc(deal, data.action);
                        }
                    });
                } else {
                    $.each(data, function (index, deal) {
                        dealFunc(deal, deal.action);
                    });
                }
            },
            exchangeDealMarket: function (data, realTime) {
                if (realTime) {
                    $.each(data.deal_list, function (index, deal) {
                        var key = deal.bond_key_listed_market;
                        if (dataCenter.market.marketBondMap.hasOwnProperty(key)) {
                            exchangeDealFunc(deal, key, data.action);
                        }
                    });
                } else {
                    $.each(data, function (index, deal) {
                        exchangeDealFunc(deal, deal.bond_key_listed_market, deal.action);
                    });
                }
            },
            accountPosition: function (data, activeTab) {
                if (data.action === 'delete') {
                    $.each(data.account_list, function (index, row) {
                        if (!authorityControl.hasAccountAuthority(row)) { //不是自己的账户并且没有权限读取该账户
                            return true;
                        }
                        deleteAccountPosition(row, activeTab);
                    });
                } else if (data.action === 'add') {
                    $.each(data.account_list, function (index, row) {
                        if (!authorityControl.hasAccountAuthority(row)) { //不是自己的账户并且没有权限读取该账户
                            return true;
                        }
                        addAccountPosition(row, user.company_id, activeTab);
                    });
                } else if (data.action === 'update') {
                    $.each(data.account_list, function (index, row) {
                        if (!authorityControl.hasAccountAuthority(row)) { //不是自己的账户并且没有权限读取该账户
                            return true;
                        }
                        var valuation_date = null;
                        if (row.valuation_dates && row.valuation_dates.length > 0) {
                            valuation_date = row.valuation_dates[0];
                        }

                        updateAccountPosition(row.id, user.company_id, valuation_date, activeTab);
                    });
                } else if (data.action === 'import' && data.user === user.id) {
                    var valuation_dates = data.valuation_dates || {};
                    $.each(data.account_list, function (index, account_id) {
                        //账户导入页面逻辑没有加 权限判断逻辑， 因此该位置也没有加

                        var valuation_date = null;
                        if (valuation_dates.hasOwnProperty(account_id) && valuation_dates[account_id]) {
                            valuation_date = valuation_dates[account_id][0];
                        }
                        updateAccountPosition(account_id, user.company_id, valuation_date, activeTab);
                    });
                }
            },
            accountAuthority: function (data, activeTab) {
                if (data.hasOwnProperty('add_list') && data.add_list != null && data.add_list.length > 0) {
                    $.each(data.add_list, function(index, authority) {
                        if (authority.hasOwnProperty('user_id') && authority.user_id == user.id && authority.hasOwnProperty('account_id')) {
                            dataCenter.account.accountAuthorityMap[authority.account_id] = authority;

                            account.get({account_id: authority.account_id, company_id: user.company_id}, function success(response) {
                                if (response.code && response.code === '0000') {
                                    var data = response.data;
                                    data.option = dataCenter.account.accountAuthorityMap[data.id].option;
                                    dataCenter.account.accountsData.push(data);
                                    addAccountPosition(data, user.company_id, activeTab);
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
                                    deleteAccountPosition(oldAccount, activeTab);
                                    return false;
                                }
                            });
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
                        }
                    });
                }
            },
            agentAccountAuthority: function (data, activeTab) {
                if (data.hasOwnProperty('add_list') && data.add_list != null && data.add_list.length > 0) {
                    $.each(data.add_list, function(index, authority) {
                        if (authority.hasOwnProperty('account_id')) {
                            dataCenter.account.accountAuthorityMap[authority.account_id] = authority;

                            account.get({account_id: authority.account_id, company_id: authority.company_id}, function success(response) {
                                if (response.code && response.code === '0000') {
                                    var result = response.data;
                                    result.option = dataCenter.account.accountAuthorityMap[result.id].option;
                                    result.agent_company_id = dataCenter.account.accountAuthorityMap[result.id].company_id;
                                    dataCenter.account.accountsData.push(result);

                                    addAccountPosition(result, result.agent_company_id, activeTab);
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
                                    deleteAccountPosition(oldAccount, activeTab);
                                    return false;
                                }
                            });
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
                                    oldAccount.agent_company_id = authority.company_id;
                                    return false;
                                }
                            });
                        }
                    });
                }
            }
        }
    });
