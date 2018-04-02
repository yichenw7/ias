/**
 * Quoteboard 相关接口
 */
export default class Quoteboard {
    constructor() {}

    static isInQuoteboard() {
        return !!window.cefQuery;
    }

    static request(params) {
        return new Promise((resovle, reject) => {
            if (!window.cefQuery) {
                reject('非法请求！');
            }
            window.cefQuery({
                request: JSON.stringify(params),
                onSuccess: function(response) {
                    resovle(response);
                },
                onFailure: function(code, msg) {
                    reject('与Quoteboard交互失败: ' + code + ': ' + msg);
                },
            });
        });
    }

    static getQBUserInfo() {
        return Quoteboard.request(['req_cache', [{ data: 'UserInfo' }]]).then((response) => JSON.parse(response));
    }

    static openBondDetail(bklm, event) {
        if (!bklm) return;
        if (event && event.stopPropagation) event.stopPropagation();

        const length = bklm.length;
        const params = [
            'open_page',
            [{
                name: 'bond_detail',
                bondkey: bklm.slice(0, length - 3),
                listmarket: bklm.slice(length - 3, length),
            }],
        ];

        Quoteboard.request(params);
    }

    static openBadnews(code, id, event) {
        if (!code || !id) return;
        if (event && event.stopPropagation) event.stopPropagation();

        const params = [
            'open_page',
            [{
                name: 'badnews_withkey',
                issuer_code: code,
                news_id: id,
            }],
        ];

        Quoteboard.request(params);
    }

    /**
     * 通过判断债券代码中是否含有 'X' 来判断此债券为增发债
     * @param {string} code 债券代码
     * @return {boolean} 是否为增发债
     */
    static isAdditionalBond(code) {
        return code ? code.indexOf('X') > -1 : false;
    }
}
