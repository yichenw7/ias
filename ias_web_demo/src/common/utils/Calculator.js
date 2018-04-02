import angular from 'angular'

angular.module('ias.utils').factory('Calculator', function(calculation, messageBox) {
    return {
        date: function(params) {
            params = params || {};
            return new Promise((resolve, reject) => {
                calculation.post({
                    type: "maturity_date",
                    // 不同回购类型，到期日期的计算规则
                    // 交易所回购 calendar = exchange  settlement_days = 1
                    // 协议式回购 calendar = exchange  settlement_days = 0
                    // 银行间回购 calendar = interbank settlement_days = 0
                    // 买断式回购 calendar = interbank settlement_days = 选中
                    data: {
                        term: params.term + 'D',
                        initial_date: params.initialDate,
                        settlement_days: params.settlementDays || 0,
                        calendar: params.calendar || 'interbank'
                    }
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        resolve(response.data);
                    } else {
                        reject(`由发生日期：${params.initialDate} 和回购日期：${params.term} 计算到期日期失败`)
                    }
                });
            }).catch(err => console.warn(err))
        },
        bond: function(params) {
            return new Promise((resolve, reject) => {
                calculation.post({
                    type: 'bond_calc',
                    data: params
                }, function success(response) {
                    if (response.code && response.code === '0000') {
                        resolve(response.data);
                    } else {
                        reject('买断式回购试算错误')
                    }
                });
            }).catch(err => console.warn(err))
        }
    }
});