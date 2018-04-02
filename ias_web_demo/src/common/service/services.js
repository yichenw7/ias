angular.module('ias.services')
    .factory('bondDetail', function ($resource, apiAddress) {
        return $resource( apiAddress + "/bonds", {}, {
            getDetail: {method: 'GET', params: {}}
        });
    })
    .factory('stockFundDetail', function ($resource, apiAddress) {
        return $resource( apiAddress + "/stock_funds", {}, {
            getDetail: {method: 'GET', params: {}}
        });
    })
    .factory('fundOtcDetail', function ($resource, apiAddress) {
        return $resource( apiAddress + "/funds_otc", {}, {
            getDetail: {method: 'GET', params: {}}
        });
    })
    .factory('fundExchangeDetail', function ($resource, apiAddress) {
        return $resource( apiAddress + "/funds", {}, {
            getDetail: {method: 'GET', params: {}}
        });
    })
    .factory('bond', function ($resource, apiAddress) {
        return $resource( apiAddress + "/bond/:bond_key_listed_market", {}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('investableBond', function ($resource, apiAddress) {
        return $resource( apiAddress + "/investable_bond/:bond_key_listed_market", {}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('bondMarket', function ($resource, apiAddress) {
        return $resource(apiAddress + "/quotes", {}, {
            getAllData: {method: 'POST', params: {}},
            getMap:{method: 'GET', params: {}}
        });
    })
    .factory('bondKeys', function ($resource, apiAddress) {
        return $resource( apiAddress + "/bondkeys", {}, {
            getKeys: {method: 'POST', params: {}}
        });
    })
    .factory('acrossMktBonds', function ($resource, apiAddress) {
        return $resource( apiAddress + "/across_mkt_bonds", {}, {
            getBonds: {method: 'POST', params: {}}
        });
    })
    .factory('calculation', function ($resource, apiAddress) {
        return $resource( apiAddress + "/calculation", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('dealMarket', function ($resource, apiAddress) {
        return $resource(apiAddress + "/deals", {}, {
            getAllData: {method: 'POST', params: {}},
        });
    })
    .factory('exchangeDealMarket', function($resource, apiAddress) {
        return $resource(apiAddress + "/exchange_deals", {}, {
            get: {method: 'POST', params: {}}
        });
    })
    .factory('investableBondR', function ($resource, apiAddress) {
        return $resource( apiAddress + "/investable_bonds", {}, {
            getAllData: {method: 'GET', params: {}},
        });
    })
    .factory('QBUserLogin', function($resource, apiAddress) {
        return $resource(apiAddress + '/qb_login', {} , {
            login: {method: 'POST', params: {} }
        })
    })
    .factory('QBUserList', function ($resource, apiAddress) {
        return $resource(apiAddress + "/qb_users", {}, {
            getAllData: {method: 'GET', params: {}},
            addUser: {method: 'POST', params: {}}
        });
    })
    .factory('QBUserListByRole', function ($resource, apiAddress) {
        return $resource(apiAddress + "/qb_user_roles/:role_name", {role_name: '@role_name'}, {
            get:{method: 'GET', params:{}}
        });
    })
    .factory('QBUserRequest', function ($resource, apiAddress) {
        return $resource(apiAddress + "/qb_user/:user_id", {user_id: '@user_id'}, {
            delete: {method: 'DELETE'},
            update: {method: 'PUT', params: {}}
        });
    })
    .factory('accountAuthorityRequest', function($resource, apiAddress) {
        return $resource(apiAddress + "/account_authorities", {}, {
            get: {method: 'GET', params: {}},
            update: {method: 'POST', params: {}}
        });
    })
    .factory('agentAuthorityRequest', function ($resource, apiAddress) {
        return $resource(apiAddress + "/agent_authorities", {}, {
            update: {method: 'POST', params: {}}
        });
    })
    .factory('agentAccountTrade', function($resource, apiAddress) {
        return $resource(apiAddress + "/agent_account_trade", {}, {
            get: {method: 'GET', params: {}},
            update: {method: 'POST', params: {}}
        });
    })
    .factory('agentsRequest', function ($resource, apiAddress) {
        return $resource(apiAddress + "/qb_agent_users", {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}}
        });
    })
    .factory('agentRequest', function ($resource, apiAddress) {
        return $resource(apiAddress + "/qb_agent_user/:user_id", {user_id: '@user_id'}, {
            delete: {method: 'DELETE', params: {}},
            update: {method: 'PUT', params: {}}
        });
    })
    .factory('bondsRequest', function ($resource, apiAddress) {
        return $resource(apiAddress + "/qb_bonds", {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}}
        });
    })
    .factory('bondRequest', function ($resource, apiAddress) {
        return $resource(apiAddress + "/qb_bonds",{}, {
            delete: {method: 'DELETE', params: {}},
            update: {method: 'PUT', params: {}}
        });
    })
    .factory('bondInvestRequest', function ($resource, apiAddress) {
        return $resource(apiAddress + "/admin_invest_bonds", {}, {
            delete: {method: 'DELETE', params: {}},
            update: {method: 'PUT', params: {}}
        });
    })
    .factory('bondsInvestRequest', function ($resource, apiAddress) {
        return $resource(apiAddress + "/admin_invest_bonds", {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}}
        });
    })
    .factory('AssetRef', function ($resource, apiAddress) {
        return $resource(apiAddress + "/asset_ref", {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}},
            update: {method: 'PUT', params: {}},
            delete: {method: 'DELETE', params: {}}
        });
    })
    /*估值表数据管理*/
    .factory('asset_valuation_mngm', function ($resource, apiAddress) {
        return $resource(apiAddress + "/asset_valuation_mngm", {}, {
            get: {method: 'GET', params: {}},
            delete: {method: 'DELETE', params: {}}
        });
    })
    .factory('singleValuation', function ($resource, apiAddress) {
        return $resource( apiAddress + "/cdc_data/:bond_key_listed_market/:trade_date", {
            bond_key_listed_market: '@bond_key_listed_market',
            trade_date: '@trade_date'
        }, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('AccountsBondPositions', function ($resource, apiAddress) {
        return $resource( apiAddress + "/accounts_position_bonds", {}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('positionQuery', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/positions", {account_id: '@account_id'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('gridConfigQuery', function ($resource, apiAddress) {
        return $resource(apiAddress+'/user/:user_id/setting/column', {user_id: '@user_id'}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}}
        });
    })
    .factory('TFPositions', function ($resource, apiAddress) {
        return $resource( apiAddress + "/position/tf_positions", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('positionsQuery', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/positions", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('positionBondQuery', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/position/:bond_key_listed_market", {account_id: '@account_id',bond_key_listed_market: '@bond_key_listed_market'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('accounts', function ($resource, apiAddress) {
        return $resource( apiAddress + "/accounts", {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}}
        });
    })
    .factory('latestVisitableAccount', function ($resource, apiAddress) {
        return $resource( apiAddress + "/latest_visitable_account", {}, {
            get: {method: 'GET', params: {}},
        });
    })
    .factory('account', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/basic", {
            account_id: '@account_id'
        }, {
            get: {method: 'GET', params: {}},
            delete: {method: 'DELETE'},
            update: {method: 'PUT',params: {}}
        });
    })
    .factory('accountGroups', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_groups", {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}}
        });
    })
    .factory('accountGroup', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id", {
            account_group_id: '@account_group_id'
        }, {
            delete: {method: 'DELETE'},
            update: {method: 'PUT',params: {}},
            notify_import: {method: 'POST', params: {}}
        });
    })
    .factory('accountGroupSummary', function($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/summary", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('assetAllocation', function ($resource, apiAddress) { // 资产分布
        return $resource( apiAddress + "/account_group/:account_group_id/assets_alloc", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('purchaseAnalysisByDate', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/purchase_analysis_by_date", {},{
            get: {method: 'GET', params: {}}
        });
    })
    .factory('purchaseAnalysis', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/purchase_analysis", {},{
            get: {method: 'GET', params: {}}
        });
    })
    .factory('normalizedBondsPos', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/normalized_bonds", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('exchangeBonds', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/exchange_bonds", {account_id: '@account_id'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('exchangePledgedBonds', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/exchange_pledge_bonds", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('interBankPledgedBonds', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/interbank_pledge_bonds", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    // TODO NEW IAS-2462
    .factory('Trades', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/trades", {account_id: '@account_id'}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}}
        });
    })
    .factory('Trade', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/trade/:trade_id", {
            account_id: '@account_id',
            trade_id: '@trade_id'
        }, {
            delete: {method: 'DELETE'},
            update: {method: 'PUT',params: {}}
        });
    })
    .factory('TradesGroup', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/trades", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('MarketCalendar', function ($resource, apiAddress) {
        return $resource( apiAddress + "/calendar", {}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('RepoFreeze', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/account_repo/:trade_id", {
            account_id: '@account_id',
            trade_id: '@trade_id'
        }, {
            unfreeze: {method: 'PUT',params: {}}
        });
    })
    .factory('overviewTrade', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/trades_overview", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('chartDurations', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/durations", {account_id: '@account_id'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('cashPositions', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/cash_positions", {account_id: '@account_id'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('messageSet', function ($resource, apiAddress) {
        return $resource(apiAddress + "/message/:manager_id/setting", {manager_id: '@manager_id'}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}},
            update: {method: 'PUT', params: {}},
            delete: {method: 'DELETE', params: {}}
        });
    })
    .factory('messageList', function ($resource, apiAddress) {
        return $resource(apiAddress + "/message/:manager_id/list", {manager_id: '@manager_id'}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}},
            update: {method: 'PUT', params: {}},
            delete: {method: 'DELETE', params: {}}
        });
    })
    .factory('messageSetQb', function ($resource, apiAddress) {
        return $resource(apiAddress + "/message/:manager_id/setting_qb", {manager_id: '@manager_id'}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}},
            update: {method: 'PUT', params: {}},
            delete: {method: 'DELETE', params: {}}
        });
    })
    .factory('performanceAttribution', function ($resource, apiAddress) {
        return $resource( apiAddress + "/statistics/performance", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('performanceLeverage', function ($resource, apiAddress) {
        return $resource( apiAddress + "/leverage_indices", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('stockPositionsPos', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/stock_positions", {account_group_id: '@account_group_id'}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('stockPosition', function ($resource, apiAddress) {
        return $resource(apiAddress + "/account/:account_id/stock_position/:stock_code", {account_id: '@account_id', stock_code: '@stock_code'}, {
            get: {method: 'GET', params: {}}
        })
    })
    .factory('stockQuotation', function ($resource, apiAddress) {
        return $resource( apiAddress + "/stock_quotation/:stock_code/:trade_date", {stock_code: '@stock_code', trade_date: '@trade_date'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('excelExport', function($http, apiAddress) {
        return {
            request: function (namespace, parameters, fileName, successFunc, errorFunc) {
                $http({
                    url: apiAddress + '/export/'+  namespace,
                    method: 'POST',
                    responseType: 'arraybuffer',
                    data: {params: JSON.stringify(parameters)}, //this is your json data string
                    headers: {
                        'Content-type': 'application/json',
                        'Accept': 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }
                }).then(
                    function success(data) {
                        if (data != null) {
                            var blob = new Blob([data.data], {type: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                            saveAs(blob, fileName);

                            if (successFunc) {
                                successFunc();
                            }
                        } else {
                            if (errorFunc) {
                                errorFunc();
                            }
                        }
                    }, function error() {
                        if (errorFunc) {
                            errorFunc();
                        }
                    }
                );
            }
        }
    })
    .factory('fundOtcPosition', function ($resource, apiAddress) {
        return $resource(apiAddress + "/account/:account_id/fund_otc_position/:fund_code", {account_id: '@account_id', fund_code: '@fund_code'}, {
            get: {method: 'GET', params: {}}
        })
    })
    .factory('fundOtcQuotation', function ($resource, apiAddress) {
        return $resource( apiAddress + "/fund_otc_quotation/:fund_code/:trade_date", {fund_code: '@fund_code', trade_date: '@trade_date'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('fundPositionsPos', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/fund_positions", {account_group_id: '@account_group_id'}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('fundExchangeQuotation', function ($resource, apiAddress) {
        return $resource( apiAddress + "/fund_exchange_quotation/:fund_code/:trade_date", {fund_code: '@fund_code', trade_date: '@trade_date'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('fundExchangePosition', function ($resource, apiAddress) {
        return $resource(apiAddress + "/account/:account_id/fund_exchange_position/:fund_code", {account_id: '@account_id', fund_code: '@fund_code'}, {
            get: {method: 'GET', params: {}}
        })
    })
    .factory('positionsOverview', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/positions_overview", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('fundQuery', function ($resource, apiAddress) {
        return $resource( apiAddress + "/fund/:fund_code", {fund_code: '@fund_code'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('fundMnyIncm', function ($resource, apiAddress) {
        return $resource( apiAddress + "/fund_mny_incm/:fund_code/:trade_date", {fund_code: '@fund_code', trade_date: '@trade_date'}, {
            get: {method: 'GET', params: {}}
        });
    })
    .factory('group_positions', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/group_positions", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('checkAssetReq', function ($resource, apiAddress) {
        return $resource( apiAddress + "/asset_adjust", {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}},
            update: {method: 'PUT', params: {}},
            delete: {method: 'DELETE', params:{}}
        });
    })
    .factory('groupAvailableBondPositions', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account_group/:account_group_id/available_bonds_positions", {
            account_group_id: '@account_group_id'
        }, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('incomeStatementList', function ($resource, apiAddress) {
        return $resource(apiAddress + "/statistics/performances_detail", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('errorLog', function($resource, apiAddress) {
        return $resource(apiAddress + '/error_logs', {}, {
            add: {method: 'POST', params: {}}
        })
    })
    .factory('generateTrades', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:account_id/generate_trades", {account_id: '@account_id'}, {
            generate: {method: 'POST', params: {}}
        });
    })
    .factory('priorRiskCheck', function($resource, apiAddress){
        return $resource(apiAddress + "/riskmanage/:account_id/prior_risk_check", {account_id: '@account_id'}, {
            add: {method: 'POST', params: {}}
        });
    })
    .factory('assetsDistribution', function ($resource, apiAddress) {
        return $resource( apiAddress + "/statistics/assets_distribution_changes", {}, {
            post: {method: 'POST', params: {}}
        });
    })
    .factory('portfolioRiskReturnIndices', function ($resource, apiAddress) {
        return $resource( apiAddress  + "/statistics/risk_return_indices", {}, {
            get: {method: 'POST', params: {}}
        });
    })
    .factory('returnIndicesLib', function ($resource, apiAddress) {
        return $resource( apiAddress + "/account/:user_id/index_library", {user_id: '@user_id'}, {
            update: {method: 'POST', params: {}},
            get:{method: 'GET', params: {}}
        });
    })
    .factory('cashRegulateReq', function ($resource, apiAddress) {
        return $resource(apiAddress + '/admin_cash_correction', {}, {
            get: {method: 'GET', params: {}},
            add: {method: 'POST', params: {}},
            delete: {method: 'DELETE', params: {}},
            update: {method: 'PUT', params: {}}
        })
    })
    .factory('dashboardReq', function($resource, apiAddress) {
        return $resource(apiAddress + '/dashboard', {}, {
            get: { method: 'GET', params: {} },
        });
    });
