'use strict';


angular.module('ias.utils')
    .factory('accountService', function (dataCenter) {
        return {
            getAccountNameById: function (account_id) {
                var accountName = '';
                $.each(dataCenter.account.accountsData, function (index, account) {
                    if (account.id == account_id) {
                        accountName = account.name;
                        return false;
                    }
                });
                return accountName;
            },
            getAccountById: function (account_id) {
                var result = null;
                $.each(dataCenter.account.accountsData, function (index, account) {
                    if (account.id == account_id) {
                        result = account;
                        return false;
                    }
                });
                return result;
            },
            getAccountsByIds: function(ids) {
                var result = [];
                $.each(dataCenter.account.accountsData, function(index, account) {
                    if (account.hasOwnProperty('id') && $.inArray(account.id, ids) != -1) {
                        result.push(account);
                    }
                });
                return result;
            },
            getCreateDate: function(id) {
                var account = this.getAccountById(id);
                return account ? account.create_date : '';
            },
            isValuationAccount: function(account_id) {
                var result = false;
                $.each(dataCenter.account.accountsData, function(index, account) {
                    if (account.hasOwnProperty('id') && account.id == account_id ) {
                        if (account.valuation_dates && account.valuation_dates.length > 0) {
                            result = true;
                        }
                        return false;
                    }
                });
                return result;
            }
        }
    })
    .factory('dateClass', function ($filter) {
        return {
            getTomorrow: function (current) {
                current.setDate(current.getDate() + 1);
                return current;
            },
            getLastDay: function (current) {
                current.setDate(current.getDate() - 1);
                return current;
            },
            getFirstDayOfYear: function(date) {
                var nowYear = date.getFullYear();
                return nowYear + "-01-01";
            },
            getEndDayOfYear: function(date) {
                var nowYear = date.getFullYear();
                return nowYear + "-12-31";
            },
            getFormatDate: function (date, formatStr) {
                formatStr = formatStr || 'yyyy-MM-dd';
                return $filter('date')(date, formatStr);
            },
            yearsOfTerm: function (term) {
                if (term == null && term == "") {
                    return -1;
                } else {
                    if (term.indexOf("+") != -1) {
                        term = term.slice(0, term.indexOf("+"));
                    }
                    var length = term.length;

                    var yearNum = 0;
                    if (term.toUpperCase().charAt(length - 1) == "Y") {
                        yearNum = term.slice(0, length - 1);
                    } else if (term.toUpperCase().charAt(length - 1) == "D") {
                        yearNum = (Number(term.slice(0, length - 1)) / 365).toFixed(4);
                    } else if (term.toUpperCase().charAt(length - 1) == "M") {
                        yearNum = (Number(term.slice(0, length - 1)) * 30 / 365).toFixed(4);
                    } else if (term == "隔夜") {
                        yearNum = (1 / 365).toFixed(4);
                    }
                    return Number(yearNum);
                }
            },
            compare: function(left, right) {
                left = left.replace(/-/g, '');
                right = right.replace(/-/g, '');
                return Number(left) <= Number(right);
            },
            /**
             * 当 date1, days, date2 三个参数中有两个不是 null 时，推断第三个
             * @param {string} date1: 日期1, 格式 xxxx-xx-xx
             * @param {string} deltaDays: (日期2 - 日期1) 的天数, int
             * @param {string} date2: 日期2, 格式 xxxx-xx-xx
             */
            dateShit: function(date1, date2, days, adjustedDays) {
                if(date1 != null) {
                    date1 = new Date(date1);
                }
                if(date2 != null) {
                    date2 = new Date(date2);
                }
                if(adjustedDays == null) {
                    adjustedDays = 0;
                }
        
                if(date1 != null) {
                    if (days != null && date2 == null) {
                        date2 = new Date();
                        date2.setDate(date1.getDate() + days + adjustedDays);
                    } else if (days == null && date2 != null) {
                        days = Math.round((date2 - date1)/86400000) - adjustedDays;
                    }
                } else if (days != null && date2 != null) {
                    date1 = new Date();
                    date1.setDate(date2.getDate() - days - adjustedDays)
                }
        
                if(date1 != null) {
                    date1 = date1.toJSON().substring(0, 10);
                }
                if(date2 != null) {
                    date2 = date2.toJSON().substring(0, 10);
                }
                return {
                    date1: date1,
                    days: days,
                    date2: date2,
                }
            },
        }
    })
    .factory('scheduleTask', function ($interval, dateClass) {
        return {
            dailyTask: function (hour, minute, second, taskFunc, callback) {
                var tomorrow = dateClass.getTomorrow(new Date());
                tomorrow.setHours(hour, minute, second);

                var checkTime = function () {
                    var currentTime = new Date();
                    if (currentTime > tomorrow) {
                        tomorrow = dateClass.getTomorrow(currentTime);
                        tomorrow.setHours(hour, minute, second);
                        taskFunc(callback);
                        console.error('daily task running');
                    }
                    console.error('daily task now: ' + currentTime + ', tomorrow:  ' + tomorrow);
                };
                return $interval(checkTime, 1000 * 60 * 60);
            }
        }
    })
    .factory('interactWithQB', function ($window, dataCenter, messageBox) {
        return {
            getAuthorityList: function () {
                if ($window.hasOwnProperty('cefQuery')) {
                    var request = ['quote_query_privilege', ["BrokerQuote", "PrimaryAuth_All", "CDCPrice"]];
                    return new Promise((resolve, reject) => {
                        $window.cefQuery({
                            request: JSON.stringify(request),
                            onSuccess: function (response) {
                                var authority = eval(response)[0];
                                if (authority.hasOwnProperty('BrokerQuote')) {
                                    dataCenter.authority.broker = authority['BrokerQuote'];

                                    $.each(dataCenter.authority.broker, function(index, broker) {
                                        if (broker === 'e') {
                                            dataCenter.authority.hasExchange = true;
                                            return false;
                                        }
                                    })
                                }
                                if (authority.hasOwnProperty('PrimaryAuth_All')) {
                                    dataCenter.authority.primary = authority['PrimaryAuth_All'];
                                }
                                if (authority.hasOwnProperty('CDCPrice')) {
                                    dataCenter.authority.cdc = authority['CDCPrice'].length > 0 ? authority['CDCPrice'][0] : null;
                                }

                                resolve();
                            },
                            onFailure: function (error_code, error_message) {
                                messageBox.error('获取权限失败: ' + error_code + ': ' + error_message);
                                reject(error_message);
                            }
                        })
                    })
                } else {
                    return Promise.resolve();
                }
            },
            hasBrokerAuthority: function (broker_id) {
                if (dataCenter.authority.broker != null) {
                    return $.inArray(broker_id, dataCenter.authority.broker) == -1 ? false : true;
                } else {
                    return true;
                }
            },
        }
    })
    .factory('bondInfo', function (dataCenter) {
        return {
            getBondBasic: function (bond_key_listed_market) {
                if (!bond_key_listed_market) {
                    return null;
                }
                var obj = dataCenter.market.bondDetailMap[bond_key_listed_market];
                if (obj) {
                    return {
                        code: obj.bond_id,
                        name: obj.short_name,
                        bond_key_listed_market: obj.bond_key_listed_market
                    }
                }
                return null;
            }
        }
    })
