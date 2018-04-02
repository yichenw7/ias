let config = ['$mdDateLocaleProvider', ($mdDateLocaleProvider) => {
    /**
     *
     * @param {any} date
     * @param {any} fmt
     * @return {string}
     */
    function formatDateFun(date, fmt) {
        let o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
            'H+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds(), // 毫秒
        };
        // var week = {
        //     "0" : "/u65e5",
        //     "1" : "/u4e00",
        //     "2" : "/u4e8c",
        //     "3" : "/u4e09",
        //     "4" : "/u56db",
        //     "5" : "/u4e94",
        //     "6" : "/u516d"
        // };
        let week = {
            '0': '日',
            '1': '一',
            '2': '二',
            '3': '三',
            '4': '四',
            '5': '五',
            '6': '六',
        };

        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            // fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[date.getDay() + '']);
        }
        for (let k in o) {
            if (o.hasOwnProperty(k) && new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    }

    $mdDateLocaleProvider.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一', '十二'];
    $mdDateLocaleProvider.shortMonths = $mdDateLocaleProvider.months;
    $mdDateLocaleProvider.days = ['日', '一', '二', '三', '四', '五', '六'];
    $mdDateLocaleProvider.shortDays = $mdDateLocaleProvider.days;

    $mdDateLocaleProvider.formatDate = function(date) {
        if (date) return formatDateFun(date, 'yyyy/MM/dd');
        else return '';
    };
}];


export default config;
