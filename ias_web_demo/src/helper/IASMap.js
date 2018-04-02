const mapInitConfig = {
    type: 'map',
    zoomOnDoubleClick: false,
    dragMap: false,
    colorSteps: 8,
    areasSettings: {
        unlistedAreasColor: '#FFF5D7',
        color: '#FFD57A', // 颜色下限
        colorSolid: '#C01E4D', // 颜色上限
        balloonText: '[[title]]<br><span style=\'font-size:14px\'><b>[[value]]</b></span>',
        outlineThickness: 0,
    },
    zoomControl: {
        homeButtonEnabled: false,
        zoomControlEnabled: false,
    },
};

export class IASMap {
    constructor() {}

    static drawMap(id, config) {
        const mapConfig = Object.assign({}, mapInitConfig, config);
        AmCharts.makeChart(id, mapConfig);
    }

    static getProvinceId(province) {
        const ID_MAP = {
            '安徽': 'CN-34',
            '北京': 'CN-11',
            '重庆': 'CN-50',
            '福建': 'CN-35',
            '广东': 'CN-44',
            '甘肃': 'CN-62',
            '广西': 'CN-45',
            '贵州': 'CN-52',
            '海南': 'CN-46',
            '河北': 'CN-13',
            '河南': 'CN-41',
            '香港': 'CN-91',
            '黑龙江': 'CN-23',
            '湖南': 'CN-43',
            '湖北': 'CN-42',
            '吉林': 'CN-22',
            '江苏': 'CN-32',
            '江西': 'CN-36',
            '辽宁': 'CN-21',
            '澳门': 'CN-92',
            '内蒙古': 'CN-15',
            '宁夏': 'CN-64',
            '青海': 'CN-63',
            '陕西': 'CN-61',
            '四川': 'CN-51',
            '山东': 'CN-37',
            '上海': 'CN-31',
            '山西': 'CN-14',
            '天津': 'CN-12',
            '台湾': 'CN-71',
            '新疆': 'CN-65',
            '西藏': 'CN-54',
            '云南': 'CN-53',
            '浙江': 'CN-33',
        };
        return ID_MAP[province];
    }
}

