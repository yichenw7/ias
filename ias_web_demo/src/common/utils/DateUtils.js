class DateUtils {
    /**
    * 符合ISO 8601的日期格式化
    * @param {Date} 日期
    * @param {string} 日期格式
    * @return {string}
    */
    static formatDate(date, fmt) {
        let o = {
            // 月份
            'M+': date.getMonth() + 1,
            // 日
            'd+': date.getDate(),
            // 小时  
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
            // 小时
            'H+': date.getHours(),
            // 分
            'm+': date.getMinutes(),
            // 秒
            's+': date.getSeconds(),
            // 季度
            'q+': Math.floor((date.getMonth() + 3) / 3),
            // 毫秒
            'S': date.getMilliseconds(),
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
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[`${date.getDay()}`]);
        }
        for (let k in o) {
            if (o.hasOwnProperty(k) && new RegExp(`(${k})`).test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    }

    /**
     * 获得时间差,时间格式为 年-月-日 小时:分钟:秒 或者 年/月/日 小时：分钟：秒
     * 其中，年月日为全格式，例如 ： 2010-10-12 01:00:00
     * 返回精度为：秒，分，小时，天
     * @param {any} startTime
     * @param {any} endTime
     * @param {any} diffType: second, minute, hour, day
     */
    static getDateDiff(startTime, endTime, diffType) {
        try {
            //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
            if (startTime && Object.prototype.toString.call(startTime) === '[object Date]') {
                startTime = startTime.replace(/\-/g, "/");
            }

            if (endTime && Object.prototype.toString.call(endTime) === '[object Date]') {
                endTime = endTime.replace(/\-/g, "/");
            }

            //将计算间隔类性字符转换为小写
            diffType = diffType.toLowerCase();

            var sTime = Object.prototype.toString.call(startTime) === '[object Date]' ? startTime : new Date(startTime); //开始时间
            var eTime = Object.prototype.toString.call(endTime) === '[object Date]' ? endTime : new Date(endTime); //结束时间
            //作为除数的数字
            var divNum = 1;
            switch (diffType) {
                case "second":
                    divNum = 1000;
                    break;
                case "minute":
                    divNum = 1000 * 60;
                    break;
                case "hour":
                    divNum = 1000 * 3600;
                    break;
                case "day":
                    divNum = 1000 * 3600 * 24;
                    break;
                default:
                    break;
            }

            return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
        } catch (ex) {
            return "--";
        }
    };
}

export default DateUtils;
