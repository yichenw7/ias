angular.module('ias.uiGrid')
    .factory('gridColumn', function (bondClientFilter, selectedTask) {
        return {
            setYieldVisible: function (marketType, columns) {
                if (marketType == 'interBank') {
                    $.each(columns, function (index, column) {
                        if (column.displayName == '到期成交收益率' || column.displayName == '行权成交收益率' || column.displayName == '成交量') {
                            if (column.visible || column.visible === undefined) {
                                column.visible = false;
                            }
                        } else if (column.displayName == '成交收益率') {
                            column.visible = true;
                        }
                    })
                } else if (marketType == 'exchange') {
                    $.each(columns, function (index, column) {
                        if (column.displayName == '到期成交收益率' || column.displayName == '行权成交收益率' || column.displayName == '成交量') {
                            column.visible = true;
                        } else if (column.displayName == '成交收益率') {
                            if (column.visible || column.visible === undefined) {
                                column.visible = false;
                            }
                        }
                    })
                }
            },
            setCompanyVisible: function (columns) {
                if (bondClientFilter.searchKey != null && bondClientFilter.searchKey != '') {
                    $.each(columns, function (index, column) {
                        if (column.displayName === '经纪商') {
                            if (column.visible || column.visible === undefined) {
                                column.visible = false;
                            }
                            return false;
                        }
                    });
                } else if (selectedTask.bond.bond_key_listed_market != null) {
                    $.each(columns, function (index, column) {
                        if (column.displayName === '经纪商') {
                            if (column.visible || column.visible === undefined) {
                                column.visible = false;
                            }
                            return false;
                        }
                    });
                } else {
                    $.each(columns, function (index, column) {
                        if (column.displayName === '经纪商') {
                            column.visible = true;
                        }
                    });
                }
            }
        }
    })
    .factory('sortClass', function (dateClass, $filter) {
        function _numberFunc(num1, num2, direction) {
            if (!num1 && !num2) {
                return 0;
            } else if (!num1) {
                return (direction == 'asc') ? 1 : -1;
            } else if (!num2) {
                return (direction == 'asc') ? -1 : 1;
            }
            return num1 - num2;
        }
        return {
            bondCodeFunc: function (code1, code2, direction) {
                var nulls = this.handleNulls(code1, code2, direction);
                if (nulls != null) {
                    return nulls;
                }

                var result = this.lengthFunc(code1, code2);
                if (result == 0) {
                    return code1.localeCompare(code2);
                }
                return result;
            },
            positionFunc: function (position1, position2, direction) {
                var nulls = this.handleNulls(position1, position2, direction);
                if (nulls != null) {
                    return nulls;
                }

                var volume1 = position1[position1.length - 1].volume;
                var volume2 = position2[position2.length - 1].volume;
                return _numberFunc(volume1, volume2, direction);
            },
            rateFunc: function (rate1, rate2, direction) {
                var nulls = this.handleNulls(rate1, rate2, direction);
                if (nulls != null) {
                    return nulls;
                }
                var rate1 = rate1.substring(0, rate1.length - 1); //去除 %
                var rate2 = rate2.substring(0, rate2.length - 1);
                return _numberFunc(rate1, rate2, direction);
            },
            volumeFunc: function (volume1, volume2, direction) {
                var nulls = this.handleNulls(volume1, volume2, direction);
                if (nulls != null) {
                    return nulls;
                }

                var volGroup1 = volume1.split("+");
                var volGroup2 = volume2.split("+");
                var toVol1 = 0;
                $.each(volGroup1, function (index, vol) {
                    if (isNaN(Number(vol.replace(" ", "")))) {
                        toVol1 += 0;
                    } else {
                        toVol1 += Number(vol.replace(" ", ""));
                    }
                });
                var toVol2 = 0;
                $.each(volGroup2, function (index, vol) {
                    if (isNaN(Number(vol.replace(" ", "")))) {
                        toVol2 += 0;
                    } else {
                        toVol2 += Number(vol.replace(" ", ""));
                    }
                });
                if (toVol1 == 0 && toVol2 == 0) {
                    return 0;
                } else if (toVol1 == 0) {
                    if (direction == 'asc') {       //升序
                        return 1;
                    } else {                        //降序
                        return -1;
                    }
                } else if (toVol2 == 0) {
                    if (direction == 'asc') {       //升序
                        return -1;
                    } else {                        //降序
                        return 1;
                    }
                }
                return toVol1 > toVol2 ? 1 : toVol1 == toVol2 ? 0 : -1;
            },
            priceFunc: function (str1, str2, direction) {
                var nulls = this.handleNulls(str1, str2, direction);
                if (nulls != null) {
                    return nulls;
                }

                if ((str1.toUpperCase() == 'BID' || str1.toUpperCase() == "OFR") && (str2.toUpperCase() == 'BID' || str2.toUpperCase() == "OFR")) {
                    return 0;
                } else if (str1.toUpperCase() == 'BID' || str1.toUpperCase() == "OFR") {
                    if (direction == 'asc') {       //升序
                        return 1;
                    } else {                        //降序
                        return -1;
                    }
                } else if (str2.toUpperCase() == 'BID' || str2.toUpperCase() == "OFR") {
                    if (direction == 'asc') {       //升序
                        return -1;
                    } else {                        //降序
                        return 1;
                    }
                }
                return _numberFunc(str1, str2, direction);
            },
            outLookFunc: function (outLook1, outLook2, direction) {
                var nulls = this.handleNulls(outLook1, outLook2, direction);
                if (nulls != null) {
                    return nulls;
                }

                var result = this.equalCharFunc(outLook1, outLook2, 'STB');
                if (result != null) {
                    return result;
                }
                result = this.equalCharFunc(outLook1, outLook2, 'POS');
                if (result != null) {
                    return result;
                }
                result = this.equalCharFunc(outLook1, outLook2, 'RWT');
                if (result != null) {
                    return result;
                }

                result = this.equalCharFunc(outLook1, outLook2, 'NEG');
                if (result != null) {
                    return outLook1.localeCompare(outLook2);
                }
            },
            investFunc: function (invest1, invest2, direction) {
                var nulls = this.handleNulls(invest1, invest2, direction);
                if (nulls != null) {
                    return nulls
                }

                var libType = invest1.investable != null ? invest1.investable == "0" ? invest1.rating : 0 : -1;
                var libType2 = invest2.investable != null ? invest2.investable == "0" ? invest2.rating : 0 : -1;

                return libType - libType2;
            },
            countDown: function (time1, time2, direction) {
                var nulls = this.handleNulls(time1, time2, direction);
                if (nulls != null) {
                    return nulls
                }
                if (time1.indexOf("-") != -1 && time2.indexOf("-") == -1) {
                    return -1;
                } else if (time1.indexOf("-") == -1 && time2.indexOf("-") != -1) {
                    return 1;
                }
                return time1.localeCompare(time2);
            },
            directionFunc: function (direction1, direction2, direction) {
                var nulls = this.handleNulls(direction1, direction2, direction);
                if (nulls != null) {
                    return nulls
                }
                return direction1.localeCompare(direction2);
            },
            bondRatingFunc: function (bond1, bond2, direction) {
                var rating1 = $filter('bondRating')(bond1);
                var rating2 = $filter('bondRating')(bond2);
                var that = this;
                return that.ratingFunc(rating1, rating2, direction);
            },
            ratingFunc: function (rating1, rating2, direction) {
                var nulls = this.handleNulls(rating1, rating2, direction);
                if (nulls != null) {
                    return nulls
                }

                if (rating1 == '--/--' && rating2 == '--/--') {
                    return 0;
                } else if (rating1 == '--/--') {
                    if (direction == 'asc') {       //升序
                        return 1;
                    } else {                        //降序
                        return -1;
                    }
                } else if (rating2 == '--/--') {
                    if (direction == 'asc') {       //升序
                        return -1;
                    } else {                        //降序
                        return 1;
                    }
                }
                rating1 = rating1.replace(/A/g, "5");
                rating1 = rating1.replace(/B/g, "4");
                rating1 = rating1.replace(/C/g, "3");
                rating1 = rating1.replace(/\+/g, "2");
                rating1 = rating1.replace(/-/g, "1");

                rating2 = rating2.replace(/A/g, "5");
                rating2 = rating2.replace(/B/g, "4");
                rating2 = rating2.replace(/C/g, "3");
                rating2 = rating2.replace(/\+/g, "2");
                rating2 = rating2.replace(/-/g, "1");

                var ratingGroup = rating1.split("/");
                var ratingGroup2 = rating2.split("/");

                var result = this.naturalFunc(ratingGroup[0], ratingGroup2[0], direction);
                if (result == 0) {
                    if (ratingGroup.length == 1 && ratingGroup2.length == 1) {
                        return result;
                    }
                    if (ratingGroup.length == 1) {
                        ratingGroup.push(ratingGroup[0]);
                    }
                    if (ratingGroup2.length == 1) {
                        ratingGroup2.push(ratingGroup2[0]);
                    }
                    return this.naturalFunc(ratingGroup[1], ratingGroup2[1], direction);
                }
                return result;
            },
            directionFundsFunc: function (direction1, direction2, direction) {
                var nulls = this.handleNulls(direction1, direction2, direction);
                if (nulls != null) {
                    return nulls;
                }
                return direction1.localeCompare(direction2);
            },
            equalCharFunc: function (str1, str2, pattern) {
                if (str1 == pattern && str2 == pattern) {
                    return 0;
                } else if (str1 == pattern) {
                    return 1;
                } else if (str2 == pattern) {
                    return -1;
                }
                return null;
            },
            termFunc: function (term1, term2, direction) {
                var nulls = this.handleNulls(term1, term2, direction);
                if (nulls != null) {
                    return nulls;
                }

                var years1 = dateClass.yearsOfTerm(term1);
                var years2 = dateClass.yearsOfTerm(term2);

                if (years1 == -1) {
                    return -1;
                } else if (years2 == -1) {
                    return 1;
                }
                return years1 > years2 ? 1 : years1 == years2 ? 0 : -1;
            },
            primarySalingFunc: function (sale1, sale2, direction) {
                if (sale1) {
                    return -1;
                } else if (sale2) {
                    return 2;
                }
                return 0;
            },
            naturalFunc: function (str1, str2, direction) {
                var nulls = this.handleNulls(str1, str2, direction);
                if (nulls != null) {
                    return nulls;
                }

                return str1.localeCompare(str2);
            },
            naturalCategoryFunc: function (str1, str2, rowA, rowB, direction) {
                if ((typeof (rowA) == "object" && typeof (rowB) == "object") && (rowA.entity.bond_key_listed_market == undefined
                    || rowB.entity.bond_key_listed_market == undefined || rowA.entity.bond_code == undefined || rowB.entity.bond_code == undefined)) {
                    return 0;
                }
                return this.naturalFunc(str1, str2, direction);
            },
            numberFunc: function(num1, num2, rowA, rowB, direction) {
                return _numberFunc(num1, num2, direction);
            },
            numberPayTypeFunc: function (num1, num2, rowA, rowB, direction) {
                if ((typeof (rowA) == "object" && typeof (rowB) == "object") && (rowA.entity.pay_type == 0
                    || rowB.entity.pay_type == 0)) {
                    return 0;
                }

                return _numberFunc(num1, num2, direction);
            },
            numberCategoryFunc: function (num1, num2, rowA, rowB, direction) {
                if ((typeof (rowA) == "object" && typeof (rowB) == "object") && (rowA.entity.bond_key_listed_market == undefined
                    || rowB.entity.bond_key_listed_market == undefined || rowA.entity.bond_code == undefined || rowB.entity.bond_code == undefined)) {
                    return 0;
                }

                return _numberFunc(num1, num2, direction);
            },
            numberBottomFunc: function (num1, num2, rowA, rowB, direction) {
                if ((typeof (rowA) == "object" && typeof (rowB) == "object") && (rowA.entity.isLastRow || rowB.entity.isLastRow)) {
                    return 0;
                }
                return _numberFunc(num1, num2, direction);
            },
            userRoleFunc: function (a, b) {
                if (a.code < b.code) {
                    return -1;
                } else if (a.code > b.code) {
                    return 1;
                } else {
                    return 0;
                }
            },
            handleNulls: function (str1, str2, direction) {
                if ((str1 == null || str1.length == 0 || str1 == "--") && (str2 == null || str2.length == 0 || str2 == "--")) {
                    return 0;
                } else if (str1 == null || str1.length == 0 || str1 == "--") {
                    if (direction == 'asc') {       //升序
                        return 1;
                    } else {                        //降序
                        return -1;
                    }
                } else if (str2 == null || str2.length == 0 || str2 == "--") {
                    if (direction == 'asc') {       //升序
                        return -1;
                    } else {                        //降序
                        return 1;
                    }
                }
                return null;
            },
            lengthFunc: function (str1, str2) {
                if (str1.length < str2.length) {
                    return -1;
                } else if (str1.length > str2.length) {
                    return 2;
                } else {
                    return 0;
                }
            },
            daysToNextCouponFunc: function (str1, str2, direction) {
                var nulls = this.handleNulls(str1, str2, direction);
                if (nulls != null) {
                    return nulls;
                }
                var day1 = parseInt(str1.substring(0, str1.length));
                var day2 = parseInt(str2.substring(0, str2.length));
                return day1 - day2;
            },
            treeLevelFunc: function (a, b, rowA, rowB, direction) {
                if (rowA.entity.$$treeLevel != undefined || rowB.entity.$$treeLevel != undefined) {
                    return 0;
                }
                return String(a).localeCompare(String(b));
            }
        }
    })
    .factory('gridService', function () {
        function chooseColumnFunc(columns, columnNameList) {
            var columnList = [];
            $.each(columns, function (index, value) {
                if (columnNameList.indexOf(value.displayName) > -1) {
                    columnList.push(value);
                }
            });
            return columnList;
        }
        return {
            chooseColumeFunc: chooseColumnFunc,
        }
    });