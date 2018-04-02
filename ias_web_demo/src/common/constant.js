angular.module('ias.constant')
    .constant('bondConstantKey', {
        company_ids: ['1', '2', '3', '4', '5'],
        bond_type: ['国债', '央票', '金融债', '地方债', '短融', '中票', '企业债', 'NCD', '公司债', '可转债',
            'PPN', '交易所私募债', 'ABS', '二级资本债', '熊猫债', '金融公司债', '金融次级债', '其他金融债', '其他'],
        ttm: [[0, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 1], [1, 3], [3, 5], [5, 7], [7, 10], [10, 1000]],
        institution_type: ['央企', '国企', '民企', '其他'],
        issuer_rating_current: ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'not in'],
        rating_current: ['AAA', 'A-1', 'AA+', 'AA', 'AA-', 'A+', 'not in'],
        municipal: ['城投', '非城投', '平台债'],
        guarenteed: ['有担保', '无担保'],
        cdb: ['国开', '非国开'],
        coupon_rate: ['SHIBOR', 'DEPO', '固息'],
        has_option: ['含权', '不含权', '永续'],
        special: ['on_the_run', 'is_cross_mkt', 'is_mortgage', 'CIB', 'SZE', 'SSE'],
        issue: ['CIB', 'SSE', 'SZE'],
        location_type: ["3", "1", "0", "2"],    //0可投， 1非可投， 2池， 3持仓
        store_type: ['position', 'pool', 'invest'],             //0 持仓， 1债券池， 2可投库
        direction: [1, -1]
    })
    .constant('accountConstant', {
        group_id: 'ffffffffffffffffffffffffffffffff',
        accountFilters: (function() {
            const types = [
                { label: '市场', val: 'listed_market', },
                { label: '信用/利率', val: 'bond_category' },
                { label: '主体评级', val: 'issuer_rating_current' },
                { label: '债项评级', val: 'rating_current', },
                { label: '归属', val: 'issuer_type' },
                { label: '债券种类', val: 'bond_type' },
                { label: '发行人', val: 'issuer_name' },
                { label: '地区', val: 'province' },
                { label: '行业', val: 'sector' },
            ];

            return types.map(firstType => {
                firstType.contents = types.filter(secondType => (secondType.val !== firstType.val))
                return firstType;
            })
        })(),
        accountGroupFilters: (function() {
            const types = [
                { label: '市场', val: 'listed_market', },
                { label: '信用/利率', val: 'bond_category' },
                { label: '主体评级', val: 'issuer_rating_current' },
                { label: '债项评级', val: 'rating_current', },
                { label: '归属', val: 'issuer_type' },
                { label: '债券种类', val: 'bond_type' },
                { label: '发行人', val: 'issuer_name' },
                { label: '地区', val: 'province' },
                { label: '行业', val: 'sector' },
                { label: '账户', val: 'account' }
            ];

            return types.map(firstType => {
                firstType.contents = types.filter(secondType => (secondType.val !== firstType.val))
                return firstType;
            })
        })(),
    })
    .constant('repoInfo', {
        repo_list: [
            { repo_name: 'R-001', term: '1D', repo_code: '131810' },
            { repo_name: 'R-002', term: '2D', repo_code: '131811' },
            { repo_name: 'R-003', term: '3D', repo_code: '131800' },
            { repo_name: 'R-004', term: '4D', repo_code: '131809' },
            { repo_name: 'R-007', term: '7D', repo_code: '131801' },
            { repo_name: 'R-014', term: '14D', repo_code: '131802' },
            { repo_name: 'GC-001', term: '1D', repo_code: '204001' },
            { repo_name: 'GC-002', term: '2D', repo_code: '204002' },
            { repo_name: 'GC-003', term: '3D', repo_code: '204003' },
            { repo_name: 'GC-004', term: '4D', repo_code: '204004' },
            { repo_name: 'GC-007', term: '7D', repo_code: '204007' },
            { repo_name: 'GC-014', term: '14D', repo_code: '204014' }
        ]
    })
    .constant('authorityConstant', {
        ACCOUNT_NO_ENTRY: '0',    //禁止
        ACCOUNT_READ: '1',        //只读
        ACCOUNT_WRITE: '2',        //编辑
        ACCOUNT_TRADE_VIEW: '1'  //查看
    })
    .constant("roleConstant", {
        TRADER: "交易",
        RESEARCHER: "研究",
        MANAGER: "投资",
        ADMIN: "系统管理",
        ACCOUNT: '账户',
        RISK: '风控',
        HOME: '仪表盘',
        DATA_MANAGE: '数据管理',
    })
    .constant("datetimePickerConfig", {
        autoclose: true,
        format: 'yyyy-mm-dd',
        todayBtn: true,
        language: 'zh-CN',
        todayHighlight: true,
        forceParse: false
    })
    .constant('functionCodeConstant', {
        INVESTMENT: 'user.invest',        //投顾列表
    })
