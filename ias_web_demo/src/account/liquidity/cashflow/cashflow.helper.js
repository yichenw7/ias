import {
    getTreeColumn,
    codeTemplate,
    nameTemplate,
} from '../../../helper/UIGrid';

/**
 * 利用字符串的大小进行比较
 * ```javascript
 * console.log('2017-02-01' > '2017-01-01'); // true
 * console.log('2017-02-01' > ''); // true
 * console.log('2017-02-01' > '2017-03-01'); // false
 * ```
 * @param {String} executeDate 格式为 '2017-01-01' 的日期, 可为 ''
 * @param {String} startDate 格式为 '2017-01-01' 的日期, 可为 ''
 * @param {String} endDate 格式为 '2017-01-01' 的日期, 可为 ''
 * @returns {Boolean} 是否匹配日期
 */
export function matchDate(executeDate, startDate, endDate) {
    if (endDate) {
        return executeDate >= startDate && executeDate <= endDate;
    } else {
        return executeDate >= startDate;
    }
}

/**
 * 过滤现金流的条件
 * @param {String} srcDesc 该笔现金流的描述
 * @param {String} tarDesc 过滤的条件
 * @return {Boolean} 是否满足描述的筛选条件
 */
export function matchDesc(srcDesc, tarDesc) {
    if (tarDesc === '全部资产' || tarDesc === '') return true;
    return srcDesc === tarDesc;
}

/**
 * 过滤债券代码
 * @param {String} srcCode 该笔现金流的债券code
 * @param {String} tarCode 债券的过滤条件
 * @return {Boolean} 是否满足债券的筛选条件
 */
export function matchSear(srcCode, tarCode) {
    if (!tarCode) return true;
    return srcCode === tarCode;
}

/**
 * data 的结构为
 * ```
 * [
 *     {"status": "1", "code": "512310", "account_id": "f74c270ab57811e788d1382c4a61272c", "execute_time": "2017-10-23", "id": "1783ceb0b59211e7bb53382c4a61272c", "desc": "\u4ea4\u6613\u6240\u57fa\u91d1\u5356\u51fa", "name": "\u4e2d\u8bc1500\u5de5\u4e1a\u6307\u6570ETF", "bond_key_listed_market": "512310", "account_name": "\u57fa\u91d1", "amount": 6738.25, "init_amount": 99979868.67, "type": "fund_exchange_sell"},
 *     {"status": "1", "code": "000877", "account_id": "f74c270ab57811e788d1382c4a61272c", "execute_time": "2017-07-26", "id": "b5c4861ab59611e7b9e5382c4a61272c", "desc": "\u573a\u5916\u57fa\u91d1\u5356\u51fa", "name": "\u534e\u6cf0\u67cf\u745e\u91cf\u5316\u4f18\u9009\u7075\u6d3b\u914d\u7f6e\u6df7\u5408", "bond_key_listed_market": "000877", "account_name": "\u57fa\u91d1", "amount": -1518.3, "init_amount": 99970170.94, "type": "fund_otc_sell"},
 *     {"status": "1", "code": "000877", "account_id": "f74c270ab57811e788d1382c4a61272c", "execute_time": "2017-05-18", "id": "921dc4eab59311e7a58f382c4a61272c", "desc": "\u573a\u5916\u57fa\u91d1\u4e70\u5165", "name": "\u534e\u6cf0\u67cf\u745e\u91cf\u5316\u4f18\u9009\u7075\u6d3b\u914d\u7f6e\u6df7\u5408", "bond_key_listed_market": "000877", "account_name": "\u57fa\u91d1", "amount": -2000.0, "init_amount": 99990009.7, "type": "fund_otc_buy"},
 *     {"status": "1", "code": "512310", "account_id": "f74c270ab57811e788d1382c4a61272c", "execute_time": "2017-03-21", "id": "4ccf1da8b59311e78692382c4a61272c", "desc": "\u4ea4\u6613\u6240\u57fa\u91d1\u4e70\u5165", "name": "\u4e2d\u8bc1500\u5de5\u4e1a\u6307\u6570ETF", "bond_key_listed_market": "512310", "account_name": "\u57fa\u91d1", "amount": -7255.0, "init_amount": 99988819.0, "type": "fund_exchange_buy"},
 *     {"status": "1", "code": "110017", "account_id": "f74c270ab57811e788d1382c4a61272c", "execute_time": "2017-01-13", "id": "33122c4eb59711e78477382c4a61272c", "desc": "\u573a\u5916\u57fa\u91d1\u5206\u7ea2", "name": "\u6613\u65b9\u8fbe\u589e\u5f3a\u56de\u62a5\u503a\u5238A", "bond_key_listed_market": "110017", "account_name": "\u57fa\u91d1", "amount": 75.53, "init_amount": 99979793.14, "type": "fund_otc_division"},
 *     {"status": "1", "code": "110017", "account_id": "f74c270ab57811e788d1382c4a61272c", "execute_time": "2016-12-13", "id": "33121cc2b59711e78477382c4a61272c", "desc": "\u573a\u5916\u57fa\u91d1\u5206\u7ea2", "name": "\u6613\u65b9\u8fbe\u589e\u5f3a\u56de\u62a5\u503a\u5238A", "bond_key_listed_market": "110017", "account_name": "\u57fa\u91d1", "amount": 566.44, "init_amount": 99979226.7, "type": "fund_otc_division"},
 *     {"status": "1", "code": "110017", "account_id": "f74c270ab57811e788d1382c4a61272c", "execute_time": "2016-10-19", "id": "330e8dc8b59711e78477382c4a61272c", "desc": "\u573a\u5916\u57fa\u91d1\u4e70\u5165", "name": "\u6613\u65b9\u8fbe\u589e\u5f3a\u56de\u62a5\u503a\u5238A", "bond_key_listed_market": "110017", "account_name": "\u57fa\u91d1", "amount": -10000.0, "init_amount": 99989226.7, "type": "fund_otc_buy"}
 * ]
 * ```
 *
 * @param {Array} data 现金流数据结构
 * @param {String} startDate 格式为 '2017-01-01' 的日期, 可为 ''
 * @param {String} endDate 格式为 '2017-01-01' 的日期, 可为 ''
 * @param {String} desc 单笔现金流的类型筛选条件
 * @param {String} desc 单笔现金流的债券筛选条件
 * @return {Array} 过滤的结果
 */
export function cashflowFilter(data, startDate, endDate, desc, code) {
    let isDateMatch = false;
    let isDescMatch = false;
    let isSearMatch = false;
    return data.filter(item => {
        isDateMatch = matchDate(item.execute_date, startDate, endDate);
        isDescMatch = matchDesc(item.desc, desc);
        isSearMatch = matchSear(item.code, code);
        return isDateMatch && isDescMatch && isSearMatch;
    });
}

/**
 * 对现金流进行数据的统计
 * 注意： 此处更改了后台的数据结构
 * @param {Array} data 现金流数据
 * @return {Object} 统计的结果
 */
export function updateTotal(data) {
    const total = {
        count: data.length,
        piaoxi: 0,
        huanben: 0,

        in: 0,
        out: 0,
    }
    data.forEach(item => {
        item.in = item.amount >= 0 ? item.amount : null;
        item.out = item.amount < 0 ? item.amount : null;

        total.in += item.in;
        total.out += item.out;

        if (item.desc === '票息') total.piaoxi++;
        if (item.desc === '还本') total.huanben++;
    })

    return total;
}

export function getCashflowTypes(data) {
    const descCache = {};
    const codeCache = {};
    data.forEach(item => {
        if (item.desc) {
            descCache[item.desc] = true;
        }
        if (item.code) {
            codeCache[item.code] = {
                code: item.code,
                name: item.name
            }
        }
    });
    return {
        desc: Object.keys(descCache),
        code: Object.keys(codeCache).map(code => codeCache[code])
    };
}


/**
 * 生成现金流中 UI-GRID 的列选项
 * @returns {Array} 定义的列选项
 */
export function getColumnDefs() {
    const monthTemplate = `<div class="ui-grid-cell-contents" ng-class="grid.appScope.getLevelClass(row, 'column1')">{{row.entity.month}}</div>`;
    const dateTemplate = `<div class="ui-grid-cell-contents" ng-class="grid.appScope.getLevelClass(row, 'column2')">{{row.entity.execute_date}}</div>`;

    return [
        getTreeColumn(),
        { field: 'month', displayName: '月份', width: '160', visible: false, cellTemplate: monthTemplate },
        { field: 'execute_date', displayName: '日期', width: '160', cellTemplate: dateTemplate },
        { field: 'code', displayName: '代码', cellTemplate: codeTemplate },
        { field: 'name', displayName: '简称', cellTemplate: nameTemplate },
        { field: 'amount', displayName: '金额', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right' },
        { field: 'in', displayName: '流入', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right' },
        { field: 'out', displayName: '流出', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right' },
        { field: 'desc', displayName: '描述' },
        { field: 'account_name', displayName: '账户' }
    ];
}
