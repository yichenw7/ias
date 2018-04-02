import {
    getTreeColumn,
    codeTemplate,
    nameTemplate,
} from '../../helper/UIGrid';

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

const sortClass = {
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

export function overviewAssetColumnDef() {
    var itemsNameTemp = '<div ng-class="grid.appScope.itemsNameFunc(row)"><span style="line-height: 30px;">{{row.entity.items_name}}</span></div>';
    var levelNameTemp = '<div ng-class="grid.appScope.levelNameFunc(row)"><span style="line-height: 30px;">{{row.entity.level_name}}</span><span style="margin-left: 5px;' +
        'color:#7b8082;line-height: 30px;font-weight: normal;font-size:12px;" ng-if="row.entity.level_name != \'\' && row.entity.level_name != null">{{row.entity.total_type_count}}</span></div>';
    var volumeHeaderTemp = '债券、国债期货数量单位为"张"，股票数量单位为"股"，基金数量单位为"份额"';

    return [
        getTreeColumn(),
        { field: 'items_name', displayName: '', width: '135', enableColumnResizing: false, cellTemplate: itemsNameTemp },
        { field: 'level_name', displayName: '资产类型', width: '130', enableColumnResizing: false, cellTemplate: levelNameTemp },
        { field: 'code', displayName: '代码', cellTemplate: codeTemplate },
        { field: 'name', displayName: '名称', cellTemplate: nameTemplate },
        { field: 'proportion', displayName: '比重(%)', cellFilter: 'toYield', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
        { field: 'volume', displayName: '数量', cellFilter: 'thousandthNum', headerTooltip: volumeHeaderTemp, headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
        { field: 'amount', displayName: '当日市值', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' }
    ];
}


export function positionColumnDef() {
    var firstValTemplete = '<div style="height:30px; font-weight:normal;line-height: 30px;white-space: nowrap;">' +
        '<div ng-class ="grid.appScope.getClassFunc(row, \'column1\')"></div>' +
        '{{row.entity.first_val | firstIcon:row.entity.second_val}} </div>'
    var secondValTemplete = '<div style="height:30px;font-weight:normal;line-height: 30px;">' +
        '<div ng-class ="grid.appScope.getClassFunc(row, \'column2\')"></div>' +
        '{{row.entity.second_val | typeTranslate:row.entity}} </div>'
    var codeTemplate = '<div style="float: left;margin-top: 7px;padding-left: 15px"><a href="" ng-class="grid.appScope.setCodeNameStyle(row)" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.bond_code }}</a></div>';

    // header: 证券名称
    var shortNameTemplate = '<div class="ui_grid_colcustemplate" layout="row" layout-align="start center">\
            <a href="" ng-class="grid.appScope.setCodeNameStyle(row)" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.bond_short_name }}</a>\
            <img class="cross-market-icon" style="display:{{row.entity.is_cross_market | isCrossMarket }};">\
            <img class="has-option-icon" style="display:{{row.entity.is_option_embedded | isOptionEmbedded }};">\
            <img class="has-redemption-icon" tooltip data-toggle="tooltip" data-placement="top" title="提前还款" style="display:{{row.entity.early_redemption | earlyRedemption }};">\
        </div>';

    // 比重、持仓量
    var setColorFunc = function (grid, row, col) {
        if (row.entity.second_val != undefined) {
            return 'portfolio-data-2 ias-text-right';
        }
        if (row.entity.first_val != undefined) {
            return 'portfolio-data-1 ias-text-right';
        }
        if (row.entity.bond_key_listed_market == undefined) {
            return 'sum-data ias-text-right';
        }
        return 'tbody-font ias-text-right';
    };
    // 久期、票面、全价市值、市值、净价盈亏、全价盈亏、已实现收益、持有收益、昨日盈亏、昨日收益、占用资金、成本收益率
    var setColorWithHideFunc = function (grid, row, col) {
        if (row.entity.second_val != undefined) {
            return 'portfolio-data-2 ias-text-right';
        }
        if (row.entity.first_val != undefined) {
            return 'portfolio-data-1 ias-text-right';
        }
        if (row.entity.bond_key_listed_market == undefined) {
            return 'sum-data ias-text-right';
        }
        if (row.entity.is_transact_data != undefined) {
            return 'hideColumn ias-text-right';
        }
        return 'tbody-font ias-text-right';
    };

    // header: 持仓
    var pledgeTemplate = '<detail-tip-btn tip-view-id="\'transactBondPage\'" ng-if="row.entity.buy_tip == null && row.entity.trade_list && row.entity.trade_list.length" \
            show-detail-func="grid.appScope.showPositionTradeList(list)" bond-list="row.entity.trade_list" style="float: right" \
            tip-left="400" tip-top="-10" view-height="198">\
        </detail-tip-btn>\
        <detail-tip-btn tip-view-id="\'transactBondPage\'" ng-if="row.entity.buy_tip !=null" \
            show-detail-func="grid.appScope.showPledgeBonds(list)" bond-list="row.entity.buy_tip" style="float: right"\
            tip-left="400" tip-top="85">\
        </detail-tip-btn>\
        <div style="margin-right: 10px;line-height: 30px">{{ row.entity.volume | thousandthNum }}</div>';

    const treeColumn = getTreeColumn();
    treeColumn.pinnedLeft = true;

    return [
        treeColumn,
        { field: 'first_val', displayName: '一级分类', width: '140', visible: false, minWidth: '140', maxWidth: '140', cellTemplate: firstValTemplete, pinnedLeft: true, enableColumnMoving: false, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'second_val', displayName: '二级分类', width: '100', visible: false, minWidth: '100', maxWidth: '100', cellTemplate: secondValTemplete, pinnedLeft: true, enableColumnMoving: false, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'bond_code', displayName: '债券代码', visible: true, _type: '基础信息', width: '100', minWidth: '100', maxWidth: '100', cellTemplate: codeTemplate, pinnedLeft: true, enableColumnMoving: false, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'bond_short_name', displayName: '债券名称', visible: true, _type: '基础信息', width: '180', cellTemplate: shortNameTemplate, pinnedLeft: true, enableColumnMoving: false, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'bond_rating', displayName: '债项评级', visible: false, _type: '评级及久期', width: '80', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'issuer_rating', displayName: '主体评级', visible: true, _type: '评级及久期', width: '80', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'issure_rating_institution', displayName: '主体评级机构', visible: false, _type: '评级及久期', width: '80', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'bond_rating_institution', displayName: '债项评级机构', visible: false, _type: '评级及久期', width: '80', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'duration', displayName: '修正久期', visible: true, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'duration_2e', displayName: '修正久期(行权)', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'duration_2m', displayName: '修正久期(到期)', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'macaulay_duration', displayName: '麦氏久期', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        // { field: 'macaulay_duration_2e', displayName: '麦氏久期(行权)', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        // { field: 'macaulay_duration_2m', displayName: '麦氏久期(到期)', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'pvbp', displayName: 'DV01', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed2 | thousandthNum', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'pvbp_2e', displayName: 'DV01(行权)', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed2 | thousandthNum', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'pvbp_2m', displayName: 'DV01(到期)', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed2 | thousandthNum', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'convexity', displayName: '凸性', visible: false, _type: '评级及久期', width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'coupon_rate', displayName: '票面(%)', visible: true, _type: '基础信息',width: '80', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed2', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'rate_type', displayName: '付息类型', visible: true, _type: '基础信息', width: '80', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'bond_type', displayName: '债券种类', visible: true, width: '100', _type: '基础信息', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'is_municipal', displayName: '是否城投债', visible: false, _type: '基础信息', width: '100', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'market', displayName: '交易市场', visible: false, _type: '基础信息', width: '100', cellFilter: 'typeTranslate', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'is_cross_market', displayName: '是否跨市场', visible: false, _type: '基础信息', width: '100', cellFilter: 'acrossMarketTransfer', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'maturity_date', displayName: '到期日', visible: true, _type: '基础信息', width: '100', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'remaining_years', displayName: '剩余期限', visible: true, _type: '基础信息', width: '80', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed2', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'days_to_next_coupon', displayName: '距离下个付息日', visible: false, _type: '基础信息', cellFilter: 'toNotApplicable', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.daysToNextCouponFunc(a, b, direction) } },
        { field: 'next_coupon_date', displayName: '下次付息日', visible: false, _type: '基础信息', width: '100', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'is_option_embedded', displayName: '含权信息', visible: true, _type: '含权信息', width: '100', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'has_coupon_adjust', displayName: '票息调整权', visible: false, _type: '含权信息', width: '100', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'last_coupon_adjust_date', displayName: '上一次票息调整日', visible: false, _type: '含权信息', width: '150', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'last_coupon_adjust_rate', displayName: '上一次票息调整(bp)', visible: false, _type: '含权信息', width: '150', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'put_date', displayName: '行权日', visible: false, width: '100', _type: '含权信息', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'time_to_next_option', displayName: '行权期限', visible: false, _type: '含权信息', width: '80', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed2', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'issuer_name', displayName: '发行主体', visible: true, _type: '基础信息', width: '250', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'face_to_issue', displayName: '发行规模占比(%)', visible: false, _type: '基础信息', width: '110', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toYield', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'enterprise_type', displayName: '企业性质', visible: false, _type: '基础信息', width: '80', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'sector', displayName: '行业', width: '80', visible: false, _type: '基础信息', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'area', displayName: '地区', width: '60', visible: false, _type: '基础信息', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'city', displayName: '城市', width: '60', visible: false, _type: '基础信息', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
        { field: 'yield_cost', displayName: '成本收益率', visible: true, _type: '市值信息', width: '100', cellFilter: 'toYield', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'yield_2m_cost', displayName: '成本收益率(到期)', visible: true, _type: '市值信息', width: '100', cellFilter: 'toYield', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'yield_2e_cost', displayName: '成本收益率(行权)', visible: true, _type: '市值信息', width: '100', cellFilter: 'toYield', cellClass: setColorWithHideFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'market_yield', displayName: '估值收益率', visible: true, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'cdcAuthority:true:true', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'market_yield_2m', displayName: '估值收益率(到期)', visible: false, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'cdcAuthority:true:true', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'market_yield_2e', displayName: '估值收益率(行权)', visible: false, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'cdcAuthority:true:true', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'volume', displayName: '已交易持仓量(张)', visible: false, _type: '市值信息', width: '140', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum', cellTemplate: pledgeTemplate, sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'face_amount', displayName: '已交易持仓面额(万)', visible: true, _type: '市值信息', width: '140', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'parAmountConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'settled_volume', displayName: '已交割持仓量(张)', visible: false, _type: '市值信息', width: '140', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'settled_amount', displayName: '已交割持仓面额(万)', visible: false, _type: '市值信息', width: '140', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'parAmountConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'available_volume', displayName: '可用数量(张)', visible: false, _type: '市值信息', width: '100', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'available_amount', displayName: '可用面额(万)', visible: true, _type: '市值信息', width: '100', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'parAmountConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'pledged_volume', displayName: '已质押量(张)', visible: false, _type: '市值信息', width: '100', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'pledged_amount', displayName: '已质押面额(万)', visible: true, _type: '市值信息', width: '100', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'parAmountConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'market_clean_price', displayName: '估值净价', visible: false, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'cdcAuthority:true', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'market_dirty_price', displayName: '估值全价', visible: false, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'cdcAuthority:true', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'clean_price', displayName: '成本净价', visible: false, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'dirty_price', displayName: '成本全价', visible: false, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberCategoryFunc },
        {
            field: 'valuation_type', displayName: '估值方式',
            visible: true, _type: '市值信息',
            width: '100',
            headerTooltip: "账户设置中的估值方式，如无法读取则顺延。（缺省值为摊余成本法）",
            sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) }
        },
        {
            field: 'proportion',
            displayName: '比重(%)',
            visible: true, _type: '市值信息',
            width: '100',
            headerTooltip: "该债券市值/账户净资产市值",
            cellClass: setColorFunc,
            headerCellClass: 'ias-text-right', cellFilter: 'toPercentNoSign',
            sortingAlgorithm: sortClass.numberCategoryFunc
        },
        { field: 'market_value_clean', displayName: '净价市值', visible: false, _type: '市值信息', width: '150', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'market_value', displayName: '全价市值', visible: true, _type: '市值信息', width: '150', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'account_valuation_clean_price', displayName: '估值表净价', visible: false, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed4 | columnNullValue', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'account_valuation_full_price', displayName: '估值表全价', visible: false, _type: '市值信息', width: '100', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed4 | columnNullValue', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'account_valuation_clean_value', displayName: '估值表净价市值', visible: false, _type: '市值信息', width: '150', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed2 | thousandthNum | columnZeroValue', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'account_valuation_full_value', displayName: '估值表全价市值', visible: false, _type: '市值信息', width: '150', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed2 | thousandthNum | columnZeroValue', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'account_valuation_yield', displayName: '估值表收益率', visible: false, _type: '市值信息', width: '110', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toYield', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'exchange_pledge_ration', displayName: '交易所质押比', visible: true, _type: '市值信息', width: '110', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'toFixed2', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'coupon', displayName: '票面利息收入', visible: false, _type: '损益', width: '110', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'capital_pnl', displayName: '买卖价差', visible: false, _type: '损益', width: '110', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'floating_pnl', displayName: '浮动盈亏', visible: false, _type: '损益', width: '110', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'realized_pnl', displayName: '已实现损益', visible: false, _type: '损益', width: '110', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberCategoryFunc },
        {
            field: 'total_pnl',
            displayName: '总损益',
            visible: true, _type: '损益',
            width: '110',
            headerTooltip: "账户创建日至当日的总损益",
            cellClass: setColorFunc, headerCellClass: 'ias-text-right',
            cellFilter: 'commafyConvert',
            sortingAlgorithm: sortClass.numberCategoryFunc
        },
        { field: 'valuation_yield_t_minus_2', displayName: '上上日估值收益率', visible: false, _type: '损益', width: '140', cellFilter: 'cdcAuthority:true', cellClass: setColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberCategoryFunc },
        { field: 'valuation_yield_t_minus_1', displayName: '上日估值收益率', visible: false, _type: '损益', width: '140', cellFilter: 'cdcAuthority:true', cellClass: setColorFunc, headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberCategoryFunc },
        {
            field: 'floating_pnl_daily',
            displayName: '昨日浮动盈亏',
            visible: true, _type: '损益',
            width: '110',
            cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert',
            sortingAlgorithm: sortClass.numberCategoryFunc
        },
        {
            field: 'total_pnl_daily',
            displayName: '昨日盈亏',
            visible: false, _type: '损益',
            width: '110',
            headerTooltip: "查看历史日期时，当日一日盈亏,查看今日时，昨日一日盈亏",
            cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert',
            sortingAlgorithm: sortClass.numberCategoryFunc
        },
        {
            field: 'realized_pnl_daily',
            displayName: '昨日已实现损益',
            visible: false, _type: '损益',
            width: '110',
            cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert',
            sortingAlgorithm: sortClass.numberCategoryFunc
        },
        {
            field: 'capital_pnl_daily',
            displayName: '昨日买卖价差',
            visible: false, _type: '损益',
            width: '110',
            cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'commafyConvert',
            sortingAlgorithm: sortClass.numberCategoryFunc
        },
        {
            field: 'yield_daily',
            displayName: '昨日收益(%)',
            visible: false, _type: '损益',
            width: '100',
            headerTooltip: "昨日盈亏/前一日该券全价市值",
            cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter: 'toFixed4',
            sortingAlgorithm: sortClass.numberCategoryFunc
        },
    ];
};

