export function formatData(data) {
    let keys = Object.keys(data);
    keys.forEach(function(type) {
        if (type == 'duration' || type == 'duration_2m' || type == 'duration_2e' || type == 'duration_leverage' || type == 'duration_2m_leverage'
            || type == 'duration_2e_leverage' || type == 'yield_cost_ratio' || type == 'yield_2e_cost_ratio' || type == 'yield_ratio' || type == 'yield_2m_ratio'
            || type == 'yield_2e_ratio' || type == 'duration_ratio' || type == 'duration_2m_ratio' || type == 'duration_2e_ratio') {
                data[type] = data[type].toFixed(4);
        }
        else if (type == 'yield_cost' || type == 'yield_2e_cost' || type == 'yield' || type == 'yield_2m' || type == 'yield_2e'
            || type == 'yield_cost_leverage' || type == 'yield_2e_cost_leverage' || type == 'yield_leverage' || type == 'yield_2m_leverage' || type == 'yield_2e_leverage'
            || type == 'coupon_yield' || type == 'amortizing_yield' || type == 'leverage_yield' || type == 'capital_yield' || type == 'annualized_acc_yield') {
                data[type] = (data[type] * 100).toFixed(4);
        }
    });
    return data;
}

const initialConfig = {
    type: 'serial',
    theme: 'iasTheme',
    startDuration: 0,
}

export function drawSerialChart(id, config){
    const chartConfig = Object.assign({}, initialConfig, config);
    return AmCharts.makeChart(id, chartConfig);
}