import Quoteboard from '../../helper/Quoteboard'

angular.module('ias.dataCenter')
    .factory('loadTaskData', function ($window, bondMarket, accounts, user,
                                       bondDetail, dealMarket, exchangeDealMarket, marketDataClass, $q, dataCenter, accountAuthorityRequest, authorityControl, authorityConstant,
                                       messageBox, errorLog, loginInfo) {
        var getBondField = function() {
            return [
                "BondCode",
                "ShortName",
                "RemainDate",
                "TknCleanPrice",
                "CleanPriceDiv",
                "TknYield",
                "MaturityYield",
                "ExerciseYield",
                "YieldDiv",
                "BuyVolume",
                "BuyPrice",
                "SellPrice",
                "SellVolume",
                "CouponRate",
                "CdcValuation",
                "CdcNetPrice",
                "Duration",
                "IssuerRating",
                "BondRating",
                "Outlook",
                "CsiValuation",
                "CsiNetPrice",
                "OptionType",
                "OptionDate",
                "Csi_Cdc",
                "CrossMarket",
                "Industry",
                "RatingAgency",
                "ModifyTime",
                "Bid_Cdc",
                "Cdc_Ofr",
                "Bid_CsiVal",
                "Csi_Ofr",
                "BrokerId",
                "BidOCO",
                "BidBargain",
                "BidMoreBargain",
                "BidDescription",
                "OfrOCO",
                "OfrBargain",
                "OfrMoreBargain",
                "OfrDescription",
                "VocationDays"
            ];
        };
        var clearArray = function (array) {
            array.splice(0, array.length);
        };
        var getReqParams = function (bonds) {
            if (!bonds) {
                bonds =  marketDataClass.getPositionBonds();
            }
            if (bonds == null || bonds.length == 0) {
                return null;
            }

            var filters =  {
                "bonds": bonds,
                "fields": getBondField(),
                "brokers": dataCenter.authority.broker
            };
            return filters;
        };
        var getDealReqParams = function(bonds, isPush) {
            if (!bonds) {
                bonds =  marketDataClass.getPositionBonds();
            }
            if (bonds == null || bonds.length ==0 ) {
                return null;
            }
            var bondList = [];
            $.each(bonds, function(index, bond) {
                bondList.push({
                    "combkey":bond
                });
            });
            if (isPush) {
                var params = {
                    "type":"tds.push.bond.deal",
                    "cond" : {
                        "list":bondList
                    }
                };
            } else {
                var params = {
                    "type":"tds.req.bond.deal",
                    "cond" : {
                        "list":bondList
                    }
                };
            }

            return params;
        };
        return {
            marketBond: function (callback) {
                dataCenter.market.bond.length = 0;
                var result = marketDataClass.getPositionBonds();
                if (result == null || result.length == 0) {
                    if (callback != null) {
                        callback();
                    }

                    return;
                }

                bondMarket.getAllData({bonds: result, BrokerQuote: dataCenter.authority.broker}, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        var index = 0;
                        for (index; index < data.length; index++) {
                            var key = data[index].bond_key_listed_market;
                            if (data[index].company_id == 'e') {
                                data[index].deal = marketDataClass.getBondDealByMap(key, true);
                                console.log(data[index]);
                            } else {
                                data[index].deal = marketDataClass.getBondDealByMap(key, false);
                            }

                            if (dataCenter.account.positionBondMap.hasOwnProperty(key)) {
                                data[index].positions = dataCenter.account.positionBondMap[key];
                            }
                            dataCenter.market.bond.push(data[index]);
                        }

                        if (callback != null) {
                            callback();
                        }
                    }
                }, function failed() {
                    messageBox.error('二级行情获取失败！');
                    if (callback != null) {
                        callback();
                    }
                });
            },
            marketBondDetail: function (errorHandle) {
                var defer = $q.defer();
                 bondDetail.getDetail({}, function success(response) {
                     if (response.code && response.code === '0000') {
                         var data = response.data;
                         dataCenter.market.bondDetailMap = data;
                         $.each(dataCenter.market.bondDetailMap, function (key, value) {
                             if (Quoteboard.isAdditionalBond(value.bond_id)) return;
                             dataCenter.market.bondDetailList.push(value);
                         });
                         defer.resolve();
                     } else {
                         if (errorHandle) {
                             errorHandle('get bond basic info failed from ias server');
                         }
                         defer.reject();
                     }
                }, function failed() {
                    if (errorHandle) {
                        errorHandle('get bond basic info failed from ias server');
                    }

                    defer.reject();
                });
                return defer.promise;
            },
            marketBondDeal: function (callback) {
                dataCenter.market.deal.length = 0;
                dataCenter.market.exchangeDeal.length = 0;
                dataCenter.market.currentDealMap = {};
                dataCenter.market.dealMarketMap = {};
                dataCenter.market.exchangeDealMarketMap = {};

                var error = '';
                var bonds = marketDataClass.getPositionBonds();
                if (bonds == null || bonds.length == 0) {
                    if (callback != null) {
                        callback();
                    }
                    return;
                }

                var exchangeDeal = function (callback) {
                    exchangeDealMarket.get({bond_key_listed_markets: bonds}, function success(response) {
                        if (response.code && response.code === '0000') {
                            var dataMap = response.data;
                            $.each(dataMap, function (key, deal) {
                                if (deal != null && deal.hasOwnProperty('bond_key_listed_market')) {
                                    if (dataCenter.account.positionBondMap.hasOwnProperty(deal.bond_key_listed_market)) {
                                        deal.positions = dataCenter.account.positionBondMap[deal.bond_key_listed_market];
                                    }
                                    dataCenter.market.exchangeDeal.push(deal);

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

                            if (callback != null) {
                                callback();
                            }
                        }
                    }, function failed() {
                        messageBox.error('交易所成交行情获取失败！');
                        if (callback != null) {
                            callback();
                        }
                    });
                };

                dealMarket.getAllData({bond_key_listed_markets: bonds, BrokerQuote: dataCenter.authority.broker}, function success(response) {
                    if (response.code && response.code === '0000') {
                        var dataMap = response.data;
                        $.each(dataMap, function (key, value) {
                            if (value != null && value.length > 0 && typeof value[0] !== 'undefined') {
                                $.each(value, function (index, deal) {
                                    if (dataCenter.account.positionBondMap.hasOwnProperty(deal.bond_key_listed_market)) {
                                        deal.positions = dataCenter.account.positionBondMap[deal.bond_key_listed_market];
                                    }
                                    dataCenter.market.deal.push(deal);
                                });
                                dataCenter.market.dealMarketMap[key] = value[0];

                                value[0].marketType = 'interBank';
                                dataCenter.market.currentDealMap[key] = value[0];
                            }
                        });

                        if (dataCenter.authority.hasExchange) {
                            exchangeDeal(callback);
                        } else {
                            if (callback != null) {
                                callback();
                            }
                        }
                    }
                }, function failed() {
                    error += '银行间成交行情获取失败！' + '\n';
                    if (dataCenter.authority.hasExchange) {
                        exchangeDeal(callback);
                    } else {
                        if (callback != null) {
                            callback();
                        }
                    }
                });
            },
            updateAccountsData: function (data) {
                $.each(data.account_list, function (index, newAccount) {
                    if (newAccount.hasOwnProperty('id') && authorityControl.hasAccountAuthority(newAccount)) {
                        if (data.action == 'add') {
                            newAccount.option = authorityConstant.ACCOUNT_WRITE;
                            dataCenter.account.accountsData.push(newAccount);
                        } else {
                            $.each(dataCenter.account.accountsData, function (i, oldAccount) {
                                if (oldAccount.hasOwnProperty('id')) {
                                    if (newAccount.id == oldAccount.id) {
                                        if (data.action == 'delete') {
                                            dataCenter.account.accountsData.splice(i, 1);
                                        } else if (data.action == 'update') {
                                            newAccount.option = oldAccount.option;
                                            newAccount.agent_company_id = oldAccount.agent_company_id;
                                            dataCenter.account.accountsData.splice(i, 1, newAccount);
                                        }
                                        return false;
                                    }
                                }
                            });
                        }
                    }
                });
            },
            registerBondMarketData: function (join) {
                var filters = getReqParams();
                if (filters) {
                    var params = '["subscribe", [{"data":"QB.Base.Bonds","add":' + join + ',"filters":"' + btoa(JSON.stringify(filters)) + '","recv":"socketBondMarketDataCallback"}]]';
                    $window.cefQuery({
                        request: params,
                        onSuccess: function(response){
                            console.log('regist qb bond market: ' + response);
                        },
                        onFailure: function(error_code, error_message) {
                            console.log('regist qb bond market error: ' + error_message);
                        }
                    });
                }
            },
            reqQBBondBasicInfo: function(errorHandle) {
                var defer = $q.defer();
                var params ='["req_cache", [{"data":"BondSearchInfo","callback":"qbBondBasicCallBack"}]]';
                $window.cefQuery({
                    request: params,
                    onSuccess: function(response){
                        response = JSON.parse(response);
                        if (!response || response.status !== 'success') {
                            errorLog.add({
                                account_name: loginInfo.name,
                                page: loginInfo.path,
                                error_type: 'http',
                                error: {msg: 'get bond basic info failed from qb, switch channel to ias server!'}
                            });
                            defer.reject();
                        } else {
                          defer.resolve();
                        }
                    },
                    onFailure: function(error_code, error_message) {
                        errorLog.add({
                            account_name: loginInfo.name,
                            page: loginInfo.path,
                            error_type: 'http',
                            error: {msg: 'get bond basic info failed from qb, switch channel to ias server!'}
                        });
                        defer.reject();
                    }
                });
                return defer.promise;
            }
        }
    })
    .factory('loadPageData', function (investableBondR, stockFundDetail, accountFactory, returnIndicesLib, returnIndices,
                                       accounts, accountGroups, QBUserList, user, loadTaskData, $window,fundOtcDetail, fundExchangeDetail,
                                       marketDataClass, dataCenter, systemAdminData, accountAuthorityRequest,
                                       bondsRequest, $timeout, AccountsBondPositions, RiskConditions, RiskConditionService) {
        var setErrorMsg = function (message) {
            if (user.errorMsg != null) {
                user.errorMsg +=  '\n' + message;
            } else {
                user.errorMsg = message;
            }
        };
        var getPositionBonds = function (callbackFunc) {
            AccountsBondPositions.get({company_id: user.company_id, manager_id: user.id}, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    if (data && data.bonds && data.accounts) {
                        $.each(data.bonds, function (bondKey, positions) {
                            if (positions && positions.constructor === Array) {
                                var total_volume = 0;
                                $.each(positions, function (index, position) {
                                    total_volume += position.volume;
                                });
                                positions.push({
                                    account_id: null,
                                    account_name: '总计：',
                                    volume: total_volume
                                });

                                dataCenter.market.marketBondMap[bondKey] = 0;
                                dataCenter.account.positionBondMap[bondKey] = positions;
                            }
                        });
                        dataCenter.account.accountPositionMap = data.accounts;
                    }

                    getBondPool(callbackFunc);
                }
            }, function failed () {
                setErrorMsg( '账户持仓信息获取失败！');

                getBondPool(callbackFunc);
            })
        };
        var managerAccount = function (callbackFunc) {
            dataCenter.account.positionBondMap = {};
            dataCenter.account.accountPositionMap = {};
            accounts.get({
                manager_id: user.id,
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    dataCenter.account.accountsData = data;

                    getPositionBonds(callbackFunc);
                }
            }, function failed() {
                if (callbackFunc) {
                    callbackFunc();
                }
                setErrorMsg('账户获取失败！');
            });
        };
        var getBondPool = function(callbackFuc) {
            bondsRequest.get({
                company_id: user.company_id,
                valid: 1
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    marketDataClass.createBondPoolMap(data);
                    if (callbackFuc) {
                        callbackFuc();
                    }
                }
            }, function failed (data) {
                if (callbackFuc) {
                    callbackFuc();
                }
            });
        };

        function getBondInfo(callbackFunc) {
            var rejectCallback = function () {
                loadTaskData.marketBondDetail(setErrorMsg).then(callbackFunc, callbackFunc);
            };

            if ($window.cefQuery) {
                return loadTaskData.reqQBBondBasicInfo(setErrorMsg).then(callbackFunc, rejectCallback).catch(err => console.warn(err))
            } else {
                return loadTaskData.marketBondDetail(setErrorMsg).then(callbackFunc, callbackFunc).catch(err => console.warn(err))
            }
        }
        function getAccounts() {
            return new Promise((resolve, reject) => {
                accounts.get({
                    manager_id: user.id,
                    company_id: user.company_id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        dataCenter.account.accountsData = response.data;
                        accountFactory.accountSet = dataCenter.account.accountsData; // FIX old code;
                        resolve();
                    } else {
                        reject('账户获取失败！');
                    }
                }, function failed() {
                    reject('账户获取失败！');
                });
            }).catch(err => console.warn(err))
        }
        function getAccounGroup() {
            return new Promise((resolve, reject) => {
                accountGroups.get({
                    manager_id: user.id,
                    company_id: user.company_id,
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        accountFactory.groupSet = response.data; // FIX old code;
                        resolve();
                    } else {
                        reject('账户组合获取失败！');
                    }
                }, function failed() {
                    reject('账户组合获取失败！');
                });
            }).catch(err => console.warn(err))
        }
        function getFundExchangeDetail() {
            return new Promise((resolve, reject) => {
                fundExchangeDetail.getDetail({}, function success(response) {
                    if (response.code && response.code === '0000') {
                        dataCenter.market.fundExchangeDetailList = response.data;
                        resolve();
                    } else {
                        reject('交易所基金详情获取失败！');
                    }
                }, function failed() {
                    reject('交易所基金详情获取失败！');
                });
            }).catch(err => console.warn(err))
        }
        function allUser() {
            return new Promise((resolve, reject) => {
                QBUserList.getAllData({
                    company_id: user.company_id,
                    from_admin: false
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var usersTemp = response.data;
                        dataCenter.user.userMap = {};
                        $.each(usersTemp, function (index, user) {
                            dataCenter.user.userMap[user.id] = user;
                        });
                        dataCenter.user.users = usersTemp;
                        resolve();
                    } else {
                        reject('获取用户列表失败！');
                    }
                }, function failed() {
                    reject('获取用户列表失败！');
                });
            }).catch(err => console.warn(err))
        }
        function accountStockFundDetail() {
            return new Promise((resolve, reject) => {
                stockFundDetail.getDetail({}, function success(response) {
                    if (response.code && response.code === '0000') {
                        dataCenter.market.stockFundDetailList = response.data;
                        resolve();
                    } else {
                        reject('股票、交易所基金详情获取失败！');
                    }
                }, function failed() {
                    reject('股票、交易所基金详情获取失败！');
                });
            }).catch(err => console.warn(err))
        }
        function accountFundOtcDetail() {
            return new Promise((resolve, reject) => {
                fundOtcDetail.getDetail({}, function success(response) {
                    if (response.code && response.code === '0000') {
                        dataCenter.market.fundOtcDetailList= response.data;
                        resolve();
                    } else {
                        reject('场外基金详情获取失败！');
                    }
                }, function failed() {
                    reject('场外基金详情获取失败！');
                });
            }).catch(err => console.warn(err))
        }
        function accountAuthority() {
            return new Promise((resolve, reject) => {
                accountAuthorityRequest.get({company_id: user.company_id, user_id: user.id}, function success(response) {
                    if (response.code && response.code === '0000') {
                        var dataMap = response.data;
                        dataCenter.account.accountAuthorityMap = dataMap;
                        resolve();
                    } else {
                        reject('账户权限获取失败！');
                    }
                }, function failed() {
                    reject('账户权限获取失败！');
                });
            }).catch(err => console.warn(err))
        }
        function getUserReturnIndicesSetting() {
            return returnIndicesLib.get({
                user_id: user.id,
                company_id: user.company_id
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    var data = response.data;
                    angular.copy(returnIndices.type1.concat(returnIndices.type2, returnIndices.type3), returnIndices.cur);
                    if (data) {
                        $.each(data, function (index, item) {
                            $.each(returnIndices.cur, function (i, indice) {
                                if (item.field === indice.field) {
                                    indice.isChecked = item.is_check;
                                    return false;
                                }
                            })
                        })
                    }
                }
            }, function () {
                angular.copy(returnIndices.type1.concat(returnIndices.type2, returnIndices.type3), returnIndices.cur);
            });
        }
        function getQBUsers() {
            return new Promise((resolve, reject) => {
                QBUserList.getAllData({
                    company_id: user.company_id,
                    from_admin: true
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        systemAdminData.users = response.data;
                        resolve();
                    }
                }, function failed() {
                    user.errorMsg += '用户获取失败！';
                    reject('用户获取失败！')
                });
            })
        }
        function getRiskConditions() {
            return new Promise((resolve, reject) => {
                RiskConditions.get({
                    company_id: user.company_id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        RiskConditionService.data = response.data;
                        resolve();
                    }
                }, function failed() {
                    user.errorMsg += '获取风控指标库失败！';
                    reject('获取风控指标库失败！')
                });
            })
        }
        return {
            account: function () {
                return Promise.all([
                    getAccounts(),
                    getAccounGroup(),
                    getFundExchangeDetail(),
                    getBondInfo(),
                    allUser(),
                    accountStockFundDetail(),
                    accountFundOtcDetail(),
                    accountAuthority(),
                    getUserReturnIndicesSetting(),
                    getRiskConditions(),
                ]);
            },
            QBSystem: function () {
                return Promise.all([
                    getBondInfo(),
                    accountStockFundDetail(),
                    getQBUsers(),
                ]);
            },
            risk: function() {
                function getCompanyAccounts() {
                    return new Promise((resolve, reject) => {
                        accounts.get({
                            company_id: user.company_id
                        }, function success(response) {
                            if (response.code && response.code === '0000') {
                                dataCenter.account.accountsData = response.data;
                                resolve();
                            } else {
                                reject('机构账户获取失败！');
                            }
                        }, function failed() {
                            reject('机构账户获取失败！');
                        });
                    })
                }

                function getCompanyAccountGroups() {
                    return new Promise((resolve, reject) => {
                        accountGroups.get({
                            company_id: user.company_id,
                        }, function success(response) {
                            if (response.code && response.code === '0000') {
                                dataCenter.account.accountGroupsData = response.data;
                                resolve();
                            } else {
                                reject('机构账户组合获取失败！');
                            }
                        }, function failed() {
                            reject('机构账户组合获取失败！');
                        });
                    })
                }
                return Promise.all([
                    getCompanyAccounts(),
                    getCompanyAccountGroups(),
                    allUser(),
                    getRiskConditions(),
                ]);
            },
            home: function() {
                accounts.get({
                    company_id: user.company_id,
                    manager_id: user.id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        dataCenter.account.accountsData = data;
                    }
                }, function failed() {
                    setErrorMsg('账户获取失败！');
                })
            },
            position: function() {
                accounts.get({
                    company_id: user.company_id,
                    manager_id: user.id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        var data = response.data;
                        dataCenter.account.accountsData = data;
                    }
                }, function failed() {
                    setErrorMsg('账户获取失败！');
                })
            },
            manager: function (callbackFunc) {
                allUser();
                accountAuthority();
                managerAccount(callbackFunc);
            },
            market: function (callbackFunc) {
                //加载行情数据
                investableBondR.getAllData({
                    company_id: user.company_id
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        dataCenter.market.investableBondMap = response.data;
                        $.each(dataCenter.market.investableBondMap, function(key, value) {
                            if (dataCenter.market.investableBondMap.hasOwnProperty(key) && key !== '$promise' && key !== '$resolved'){
                                dataCenter.market.marketBondMap[key] = 1;
                            }
                        })
                    }
                }, function failed() {
                    setErrorMsg('可投库获取失败！');
                });

                getBondInfo(callbackFunc);
            },
            refreshMarket: function (callback) {
                var bond = function () {
                    loadTaskData.marketBond();
                };
                loadTaskData.marketBondDeal(bond);
            }
        }
    });
