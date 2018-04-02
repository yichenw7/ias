const initialConfig = {
    type: 'stock',
    theme: 'iasTheme',
    valueAxesSettings: {
        inside: false,
    },
    categoryAxesSettings: {
        groupToPeriods: ['DD'],
    },
    panelsSettings: {
        marginLeft: 100,
        marginRight: 100,
        fontFamily: 'Microsoft YaHei',
    },
    chartCursorSettings: {
        bulletsEnabled: true,
        valueBalloonsEnabled: true,
        valueLineEnabled: true,
        valueLineBalloonEnabled: true,
        cursorAlpha: 0.1,
        valueLineAlpha: 0.5,
    },
    chartScrollbarSettings: {
        enabled: true,
        autoGridCount: false,
        backgroundAlpha: 1,
        backgroundColor: '#000000',
        selectedBackgroundAlpha: 1,
        selectedBackgroundColor: '#2d2d2d',
        dragIcon: 'dragIconRectBigBlack',
    },
    legendSettings: {
        align: 'left',
        valueWidth: 100,
        marginBottom: 10,
    },
};

export class IASCharts {
    constructor() {}

    static drawChart(id, config) {
        const chartConfig = Object.assign({}, initialConfig, config);
        return AmCharts.makeChart(id, chartConfig);
    }
}

