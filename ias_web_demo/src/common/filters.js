angular.module('ias.filters')
    .filter("brokerFilter", function () {                 //经纪商
        return function (obj) {
            if (obj == "1") {
                return "国利";
            } else if (obj == "2") {
                return "国际";
            } else if (obj == "3") {
                return "中诚";
            } else if (obj == "4") {
                return "平安";
            } else if (obj == "5") {
                return "信唐";
            } else if (obj == "e" || obj === '20') {
                return "交易所";
            } else {
                return obj;
            }
        }
    })
    .filter("colorFilter", function () {                      //经纪商颜色，参考经纪商筛选
        return function (obj) {
            if (obj == "1") {
                return '#467295';
            } else if (obj == "2") {
                return '#BE6464';
            } else if (obj == "3") {
                return '#ABBF72';
            } else if (obj == "4") {
                return '#D77F52';
            } else if (obj == "5") {
                return '#8C5AA5';
            } else if (obj == "e" || obj === '20') {
                return '#FF8202';
            } else {
                return '';
            }
        };
    })
    .filter("outlookCurrentBond", function () {                          //展望
        return function (outlook) {
            if (outlook != null) {
                if (outlook == "STB") {
                    return "稳定";
                } else if (outlook == "NEG") {
                    return "负面";
                } else if (outlook == "RWT") {
                    return "列入观察者名单";
                } else if (outlook == "POS") {
                    return "正面";
                } else {
                    return "";
                }
            } else {
                return "";
            }
        }
    })
    .filter("codeBond", function (dataCenter) {                            //债券代码
        return function (obj) {
            if (dataCenter.market.bondDetailMap.hasOwnProperty(obj)) {
                return dataCenter.market.bondDetailMap[obj].bond_id != null ? dataCenter.market.bondDetailMap[obj].bond_id : "";
            }

            return "";
        }
    })
    .filter("shortNameBond", function (dataCenter) {                       //债券简称
        return function (obj) {
            if (dataCenter.market.bondDetailMap.hasOwnProperty(obj)) {
                return dataCenter.market.bondDetailMap[obj].short_name != null ? dataCenter.market.bondDetailMap[obj].short_name : "";
            } else {
                return "";
            }
        }
    })
    .filter("getAccountGroupName", function (distinguishGroupName,dataCenter) {                   //组合名称
        return function (obj) {
            var arr = [];
            var account_group = '';
            $.each(dataCenter.account.accountsData, function (index, value) {
                if (value.id == obj) {
                    arr = value.account_groups;
                    return false;
                }
            });
            for (var i = 0; i < arr.length; i++) {
                account_group += arr[i] + ' ';
            }
            return distinguishGroupName.isNotDefined ? '未定义组合 ' + account_group : account_group;
        }
    })
    .filter("directionBond", function () {                   //方向
        return function (obj , isObj) {
            if (!obj) {
                return "";
            }
            if(isObj){
                if (obj.pay_type == 0) {
                    return "买入/缴款";
                }else if(obj.trade_type == "3" && obj.direction == 1){
                    return "买入/转托管";
                }else if(obj.trade_type == "3" && obj.direction == -1){
                    return "卖出/转托管";
                }else if(obj.trade_type == "4" && obj.direction == 1){
                    return "买入/买断式回购";
                }else if(obj.trade_type == "4" && obj.direction == -1){
                    return "卖出/买断式回购";
                }

                obj = obj.direction;
            }

            return obj == 1 ? "买入" : "卖出";
        }
    })
    .filter("settlementDayBond", function () {               //结算方式
        return function (obj) {
            if (Number(obj) == obj && obj % 1 === 0) {
                return "T+" + obj;
            }
            return '';
        }
    })
    .filter("libTypeBond", function () {                     //所在库
        return function (obj) {
            if (obj != null) {
                return obj.investable != null ? obj.investable == "0" ? "可投(" + obj.rating + ")" : "非可投" : "";
            } else {
                return "";
            }
        }
    })
    .filter("getFilterKey", function () {
        return function (array, num) {
            if (num == 0) {
                return [];
            } else {
                var result = [];
                var valid = 0;
                $.each(array, function (index, data) {
                    valid = num & 1;
                    if (valid) {
                        result.push(data);
                    }
                    num = num >> 1;
                });
                return result;
            }
        }
    })
    .filter("typeTranslate", function () {
        return function (type) {
            if (type == "SSE") {
                return "上交所";
            } else if (type == "SZE") {
                return "深交所";
            } else if (type == "CIB") {
                return "银行间";
            } else if (type == "BCO") {
                return "信用";
            } else if (type == "BNC") {
                return "利率";
            } else {
                return type;
            }
        }
    })
    .filter("trustTranslate", function() {
        return function (type){
            if (type == "cdc") {
                return "中债";
            } else if (type == "sch") {
                return "上清";
            } else {
                return type;
            }
        }
    })
    .filter("acrossMarketTransfer", function () {
        return function (flag) {
            if (flag == 'Y') {
                return "是";
            } else if (flag == 'N') {
                return "否";
            }
            return '';
        }
    })
    .filter("repoDirection", function () {
        return function (val) {
            if (val == 1) {
                return "正回购";
            } else if (val == -1) {
                return "逆回购";
            }
            return '';
        }
    })
    .filter("ftDirection", function () {
        return function (val) {
            if (val === -1) {
                return "空头";
            } else if (val === 1) {
                return "多头";
            }
            return '';
        }
    })
    .filter("repoType", function () {
        return function (val) {
            if (val === 'exchange') {
                return "交易所回购";
            } else if (val === "interbank") {
                return "银行间回购";
            } else if (val === "buyout") {
                return "买断式回购";
            } else if (val === "protocol") {
                return "协议式回购";
            }
            return '';
        }
    })
    .filter("buyoutRepoDirection", function () {
        return function (val) {
            if (val == 1) {
                return "买断式正回购";
            } else if (val == -1) {
                return "买断式逆回购";
            }
            return '';
        }
    })
    .filter("purchaseDirection", function () {
        return function (val) {
            if (val == 1) {
                return "申购";
            } else if (val == -1) {
                return "赎回";
            }
            return '';
        }
    })
    .filter("lendingDirection", function () {
        return function (val) {
            if (val == 1) {
                return "拆入";
            } else if (val == -1) {
                return "拆出";
            }
            return '';
        }
    })
    .filter("depositDirection", function () {
        return function (val) {
            if (val == 1) {
                return "存入";
            } else if (val == -1) {
                return "存出";
            }
            return '';
        }
    })
    .filter("tfMarginDirection", function () {
        return function (v) {
            return v == 1? "缴纳" : (v == -1? "赎回" : '');
        }
    })
    .filter("absoluteAmount", function () {
        return function (val) {
            return Math.abs(val);
        }
    })
    .filter("userRoleList", function () {
        return function (role_list) {
            var result = '';
            if (role_list != null && role_list !== undefined && role_list.length > 0 ) {
                $.each(role_list, function (index, role) {
                    if (role.en_name === 'trader' || role.en_name === 'researcher') {
                        return true;
                    }
                    if (result == '') {
                        result = role.name;
                    } else {
                        result += ',' + role.name;
                    }
                });
            }
            return result;
        }
    })
    .filter('userNameFilter', function (dataCenter) {
        return function (id) {
            if (id == null || !dataCenter.user.userMap.hasOwnProperty(id)) {
                return ''
            }
            return dataCenter.user.userMap[id].user_name;
        }
    })
    .filter("toNotApplicable", function () {
        return function (input) {
            return (input === undefined || input === null) ? '--' : input;
        }
    })
    .filter("toYield", function() {
        return function(number) {
            if (number === null || number === undefined || number === '') {
                return '--';
            } else {
                return (number * 100).toFixed(4);
            }
        }
    })
    .filter("toFixed2", function ($filter) {
        return function (number, modify, thousandsFormat) {
            if (undefined == number || isNaN(number)) {
                return undefined;
            } else if (0 == number) {
                return modify ? '': '0.00';
            } else if ("" == number) {
                return "";
            } else {
                return thousandsFormat ? $filter('thousandthNum')(number.toFixed(2)) : number.toFixed(2);
            }
        }
    })
    .filter("toFixed4", function ($filter) {
        return function (number, modify, thousandsFormat) {
            if (undefined == number || isNaN(number)) {
                return undefined;
            } else if (0 == number) {
                return modify ? '0': '0.0000';
            } else if ("" == number) {
                return "";
            } else {
                return thousandsFormat ? $filter('thousandthNum')(number.toFixed(4)) : number.toFixed(4);
            }
        }
    })
    .filter("toFixedPercent", function() {
        return function (number) {
            if (undefined == number || isNaN(number)) {
                return undefined;
            } else if ("" === number) {
                return "";
            } else {
                var n = number.toFixed(2);
                return number >= 0 ? '+' + n : n;
            }
        }
    })
    .filter('thousandthNum', function () {               //千分位
        return function (num, unit, default_val) {
            if (num == undefined) {
                return '';
            }
            if ((num + "").trim() == "") {
                if (typeof  default_val !== 'undefined') {
                    return default_val
                }
                return "";
            }
            if (isNaN(num)) {
                if (typeof  default_val !== 'undefined') {
                    return default_val
                }
                return "";
            }
            if(unit){
                num = num/unit;
            }

            var result = num + "";
            if (/^.*\..*$/.test(result)) {
                var pointIndex = result.lastIndexOf(".");
                var intPart = result.substring(0, pointIndex);
                var pointPart = result.substring(pointIndex + 1, result.length);
                intPart = intPart + "";
                var re = /(-?\d+)(\d{3})/
                while (re.test(intPart)) {
                    intPart = intPart.replace(re, "$1,$2")
                }
                result = intPart + "." + pointPart;
            } else {
                result = result + "";
                var re = /(-?\d+)(\d{3})/
                while (re.test(result)) {
                    result = result.replace(re, "$1,$2")
                }
            }
            return result;
        }
    })
    .filter('ceilNum', function () {               //天花板函数
        return function (num) {
            return Math.ceil(Number(num));
        }
    })
    .filter('showPoint', function () {               //是否保留小数
        return function (numStr) {
            if (Number(numStr) === parseInt(numStr)){
                return String(parseInt(numStr));
            }
            else {
                return numStr;
            }
        }
    })
    .filter("getAmount", function ($filter) {
        return function (volume, price) {
            return $filter('commafyConvert')(volume * price);
        }
    })
    .filter("toPercent", function () {
        return function (number, noSign) {
            if (undefined == number || isNaN(number) || "" === number) {
                return "";
            } else {
                var sign = noSign ? '' : '%';
                return (number * 100).toFixed(2) + sign;
            }
        }
    })
    .filter("toPercentNoSign", function ($filter) {
        return function (number) {
            if (undefined == number || isNaN(number) || "" === number) {
                return "";
            } else {
                return (number * 100).toFixed(4);
            }
        }
    })
    .filter("firstIcon", function ($filter) {
        return function (first_val, second_val) {
            if ((first_val != undefined) && (second_val == undefined)) {
                return $filter('typeTranslate')(first_val);
            }
            return undefined;
        }
    })
    //oco
    .filter('ocoFilter', function () {
        return function (flag_oco) {
            if (flag_oco == '0' || flag_oco == "" || flag_oco == null) {
                return 'none';
            } else {
                return 'block';
            }
        }
    })
    .filter('isCrossMarket', function () {
        return function (is_cross_mkt) {
            if (is_cross_mkt == null || is_cross_mkt != 'Y') {
                return 'none';
            }
            return 'block';
        }
    })
    .filter('isOptionEmbedded', function () {
        return function (hasOption) {
            if (hasOption == null || hasOption == '') {
                return 'none';
            }
            return 'block';
        }
    })
    .filter('earlyRedemption', function () { //是否提前还款
        return function (earlyRedempt) {
            if ( earlyRedempt == null || earlyRedempt == 'N') {
                return 'none';
            } else {
                return 'block';
            }
        }
    })
    .filter('toYieldType', function() {
        return function(value) {
            if (value === 'ytm') {
                return '到期';
            } else if (value === 'ytcp') {
                return '行权';
            }
            return '';
        }
    })
    .filter('bargainFilter', function () {
        return function (flag_bargain, showValue) {
            if (flag_bargain == showValue.toString()) {
                return 'block';
            } else {
                return 'none';
            }
        }
    })
    //price_desc
    .filter('priceDescFilter', function () {
        return function (price_desc) {
            if (price_desc == null || price_desc == "") {
                return 'none';
            } else {
                return 'block';
            }

        }
    })
    .filter("isTotal", function () {
        return function (val) {
            if ('total' == val) {
                return '总计';
            } else {
                return val;
            }
        }
    })
    .filter("dealTimeFilter", function () {
        return function (time) {
            return time.substr(11, 8);
        }
    })
    .filter("dealDirection", function () {
        var INDICATOR_TYPE_ICON = {
            0: './images/quote_indicator_type_tkn.png',
            1: './images/quote_indicator_type_gvn.png',
            2: './images/quote_indicator_type_trd.png'
        };
        return function (direction) {
            return (direction) ? INDICATOR_TYPE_ICON[direction] : '';
        }
    })
    .filter("dayTimeFilter", function () {
        return function (day) {
            if (day == null || day.length == 0) {
                return ""
            } else {
                return day.slice(day.indexOf(" ") + 1);
            }
        }
    })
    .filter("commafyConvert", function ($filter) {
        return function commafy(num) {
            if (isNaN(num)) {
                return undefined;
            }
            if ((num + "").trim() == "") {
                return undefined;
            }
            num = $filter('toFixed2')(num);
            num = num + "";
            if (/^.*\..*$/.test(num)) {
                var pointIndex = num.lastIndexOf(".");
                var intPart = num.substring(0, pointIndex);
                var pointPart = num.substring(pointIndex + 1, num.length);
                intPart = intPart + "";
                var re = /(-?\d+)(\d{3})/
                while (re.test(intPart)) {
                    intPart = intPart.replace(re, "$1,$2")
                }
                num = intPart + "." + pointPart;
            } else {
                num = num + "";
                var re = /(-?\d+)(\d{3})/
                while (re.test(num)) {
                    num = num.replace(re, "$1,$2")
                }
            }
            if (num == 'undefined') {
                return undefined;
            }
            return num;
        }
    })
    //是否显示tooltip
    .filter('isShowTooltip', function () {
        return function (key_listed_market, limitNum) {
            if (key_listed_market.length > limitNum) {
                return key_listed_market;
            } else {
                return null;
            }
        }
    })
    .filter('cdcAuthority', function (dataCenter, $filter) {
        return function (price, toFix, isYield) {
            if (price === null || price === undefined) {
                return '--';
            }
            if (isYield) {
                price = price * 100; // 后台传过来的数值皆为绝对值
            }
            if (dataCenter.authority.cdc != null) {
                if (dataCenter.authority.cdc === '1') {
                    if(toFix){
                        return $filter('toFixed4')(price);
                    }
                    return price;
                } else {
                    return '--';
                }
            } else {
                return '--';
            }
        }
    })
    .filter('minusTips', function () {
        return function (numStr) {
            if (numStr && (numStr.toString().indexOf('-') > -1)) return 'red';
            else  return '';
        }
    })
    .filter('parseToNumber', function () {
        return function (numStr) {
            return parseFloat(numStr.replace(/,/g, ''));
        }
    })
    .filter('formatAmount', function () {
        return function (num) {
            if (!num) return '0';
            var tempStr = num.toString();
            var index = tempStr.indexOf('.');
            if (index < 5 + tempStr.indexOf('-')) return num;
            else {
                tempStr = tempStr.split('');
                for (var i = 1; i < index - 2 - tempStr.indexOf('-'); i++) {
                    if (i % 4 == 2) {
                        tempStr.splice((index - 1 - i), 0, ',');
                        index++;
                        i += 3;
                    }
                }
                var backStr = tempStr.join('');
                var pos = backStr.indexOf('.');
                if (backStr.replace(/,/g, '') == parseInt(backStr.replace(/,/g, ''))) {
                    backStr = backStr.substr(0, pos);
                }
                return backStr;
            }
        }
    })
    .filter('inquiryFaceAmount', function ($filter) {
        return function (inquiry_volume) {
            if (inquiry_volume != null) {
                return $filter('thousandthNum')(inquiry_volume * 100);
            } else {
                return '';
            }
        }
    })
    .filter('numberDot', function () {
        return function (num, decimalPlaces) {
            if (undefined == num || isNaN(num)) {
                return undefined;
            }
            if(!decimalPlaces) {
                decimalPlaces = 4;
            }

            if(typeof num == 'number') {
                num = Number(num.toFixed(decimalPlaces));
            }

            var str = num.toString();

            var strList = ['', '', '.'];
            var str1 = '';
            if (str.indexOf('-') > -1) {
                str = str.substring(1, str.length);
                str1 = '-';
            }
            var index = str.indexOf('.');
            if (index != -1) {
                str = str.substring(0, index + decimalPlaces + 1);
                strList = str.split('.');
                strList[2] = '.';
                strList[2] += strList[1];
                strList[1] = strList[2];
                str = strList[0];
            }
            var list = str.split('').reverse();
            var i;
            for (i = 0; i < list.length; i++) {
                if (i % 4 == 3) {
                    list.splice(i, 0, ',');
                }
            }
            list = str1 + list.reverse().join('') + strList[1];
            return list;

        }
    })
    .filter('bondPositionTotal', function($filter) {
        return function (postions) {
            if (postions != null && postions.length > 1) {
                return $filter('thousandthNum')(postions[postions.length -1].volume);
            }
        }
    })
    .filter('parAmountConvert', function($filter) {
        return function (data) {
            return $filter('commafyConvert')(data/10000);
        }
    })
    .filter("unitConvert", function ($filter) {
        return function (num, unit) {
            if (isNaN(num) || 0 == num) {
                return 0;
            }

            if(unit == '万元'){
                return $filter('commafyConvert')(num/10000);
            }else if(unit == '亿元'){
                return $filter('commafyConvert')(num/100000000);
            }
            return $filter('commafyConvert')(num);
        }
    })
    .filter('accountEditAuthority', function(dataCenter, authorityConstant) {
        return function (account_id) {
            var authority = authorityConstant.ACCOUNT_WRITE;
            $.each(dataCenter.account.accountsData, function(index, account) {
                if (account.hasOwnProperty('id') && account.id == account_id) {
                    authority = account.option;
                }
            });
            return authority === authorityConstant.ACCOUNT_READ ? false : true;
        }
    })
    .filter('isAccountSrcTypeValuation', function(dataCenter) {
        return function (account_id, src_type) {
            var isValuation = false;
            dataCenter.account.accountsData.forEach(function(account) {
                if (account.hasOwnProperty('id') && account.id == account_id) {
                    isValuation = isValuation || account['source_type_' + src_type] === 'position';
                }
            });
            return isValuation;
        }
    })
    .filter('showAuthority', function(authorityConstant){
        return function (option) {
            switch (option)
            {
                case authorityConstant.ACCOUNT_READ:
                    return '只读';
                case authorityConstant.ACCOUNT_WRITE:
                    return '编辑';
                default:
                    return ''
            }
        }
    })
    .filter("financeType", function () {                 //经纪商
        return function (obj) {
            if (obj == "guaranteed") {
                return "保本保收益";
            } else if (obj == "guaranteed float") {
                return "保本浮动型";
            } else if (obj == "no guaranteed") {
                return "非保本浮动型";
            } else {
                return obj;
            }
        }
    })
    .filter("directionProtocolRepo", function () {
        return function (direction) {
            if (direction == 1) {
                return '协议式正回购'
            } else if (direction == -1) {
                return '协议式逆回购';
            } else {
                return '';
            }
        }
    })
    .filter('columnNullValue', function () {
        return function (value) {
            if (value == null || value == '') {
                return '--';
            }
            return value;
        }
    })
    .filter("columnZeroValue", function () {
         return function (value) {
            if (value == 0) {
                return '--';
            }
            return value;
        }
    })
    .filter("toWan", function () {
        return function (number) {
            return number/10000.0;
        }
    })
    .filter("toWanYuan", function () {
        return function (number) {
            return number/100.0;
        }
    })
    .filter('strLengthLimit', function() {
        return function (str, max_length){
            if (str && str.length > max_length) {
                return str.substr(0, max_length) +　' ....';
            }
            return str;
        }
    })
    .filter('nameFilter', function (dataCenter) {
        return function (bond_key_listed_market) {
            if(angular.isDefined(dataCenter.market.bondDetailMap[bond_key_listed_market])){
                return dataCenter.market.bondDetailMap[bond_key_listed_market].short_name;
            }

            for(var i=0; i<dataCenter.market.stockFundDetailList.length; i++){
                var row = dataCenter.market.stockFundDetailList[i];
                if(bond_key_listed_market == row.code){
                    return row.name;
                }
            }

            for(var i=0; i<dataCenter.market.fundOtcDetailList.length; i++){
                var row = dataCenter.market.fundOtcDetailList[i];
                if(bond_key_listed_market == row.fund_code){
                    return row.fundsname;
                }
            }
        }
    })
    .filter('bondMarketType', function() {
        return function (bond_key_listed_market) {
            if (!bond_key_listed_market) {
                return '';
            }

            var market = bond_key_listed_market.slice(-3);
            switch (market){
                case 'CIB':
                    market = '.IB';
                    break;
                case 'SSE':
                    market = '.SH';
                    break;
                case 'SZE':
                    market = '.SZ';
                    break;
            }
            return  market;
        }
    })
    .filter('performanceFilter', function () {
        return function (value) {
            if (typeof value != 'number') {
                return value;
            }
            else{
                return Number(value.toFixed(4));
            }
        }
    })
    .filter('bondRating', function () {                              //主债评级
        return function (bond) {
            var issuer_rating = (bond && bond.IssuerRating) || '--';
            var rating = (bond && bond.BondRating) || '--';
            if (issuer_rating === rating) {
                return rating;
            } else {
                return issuer_rating + "/" + rating;
            }
        }
    })
    .filter('stopwatch', function() {
        return function (time) {
            if (time < 0 || !time) {
                return '';
            }

            time = parseInt(time, 10);
            var hours   = Math.floor(time / 3600);
            var minutes = Math.floor((time - (hours * 3600)) / 60);
            var seconds = time - (hours * 3600) - (minutes * 60);

            if (hours   < 10) { hours   = "0" + hours; }
            if (minutes < 10) { minutes = "0" + minutes; }
            if (seconds < 10) { seconds = "0" + seconds; }
            return hours + ':' + minutes + ':' + seconds;
        }
    })
    .filter('riskMatchFilter', function () {
        var MATCH_ACTION = {
            '通过': 'pass',
            '提醒': 'alarm',
            '进入审批流程': 'approving',
            '拒绝': 'decline',
            'pass': '通过',
            'alarm': '提醒',
            'approving': '进入审批流程',
            'decline': '拒绝'
        };
        return function (tar) {
            return MATCH_ACTION[tar];
        };
    })
    .filter('riskScenarioFilter', function () {
        var SCENARIO = {
            '交易前': 'before',
            '交易后': 'after',
            'before': '交易前',
            'after': '交易后'
        };
        return function (tar) {
            return SCENARIO[tar];
        };
    })
    .filter('toPinyin', function(){
        return function(a) {
            if (!a && a != 0) {
                return '';
            }
            else {
                return $.toPinyin(a);
            }
        }
    })
    .filter("isRollingTransfer", function () {
        return function (flag) {
            if (flag == '1') {
                return "是";
            } else if (flag == '0') {
                return "否";
            }
            return '';
        }
    })
    .filter('checkAssetInfo', function () {
        return function (info, asset_id) {
            if (asset_id == 'unknown') {
                return '';
            }
            return info;
        }
    })
    .filter('accountingTypeFilter', function () {
        return function (val) {
            if (val === 'hold_to_maturity') {
                return "持有到期";
            } else if (val === "available_for_sale") {
                return "可供出售";
            } else if (val === "hold_for_trading") {
                return "交易出售";
            }
            return '';
        }
    })
    .filter("valType", function() {
        return function (type){
            if (type == "cdc") {
                return "中债估值";
            } else if (type == "csi") {
                return "中证估值";
            } else if (type == "market") {
                return "市价法";
            } else if (type == "cost") {
                return "摊余成本法";
            } else if (type == "fcost") {
                return "成本法";
            } else {
                return type;
            }
        }
    })
    .filter("fundType", function() {
        return function (type){
            if (type == 1) {
                return "股票型";
            } else if (type == 2) {
                return "债券型";
            } else if (type == 3) {
                return "混合型";
            } else if (type == 4) {
                return "货币型";
            } else if (type == 5) {
                return "ETF联接基金";
            } else if (type == 6) {
                return "FOF";
            } else {
                return "其它";
            }
        }
    })