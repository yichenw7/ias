import angular from 'angular';

import './template/dialog_import_template.less';
import Template from './template/dialog_import_template.html';
import imageDialogTemplate from './template/dialog_image.html';

const initView = Symbol('initView');

const dataDefine = {
    category: [
        { label: '交易流水', value: 1 },
        { label: '资产持仓', value: 2 },
    ],

    tempList: [
        {
            template_title: '定制现券交易流水',
            template_imgs: [
                { name: '交易明细', url: './images/template_1.png' },
            ],
            category: 1,
            template_url: 'static/template/定制现券交易流水模板.xls',
            is_transform: true,
            template_desc: '定制模板，支持债券交易流水导入',
        },
        {
            template_title: '定制成交记录流水',
            template_imgs: [
                { name: '现券买卖', url: './images/template_2_1.jpg' },
            ],
            category: 1,
            template_url: 'static/template/定制成交记录流水模板.xlsx',
            is_transform: true,
            template_desc: '定制模板，支持成交记录流水导入',
        },
        {
            template_title: '恒生成交回报',
            template_imgs: [
                { name: '综合信息查询_成交回报', url: './images/template_3_1.png' },
            ],
            category: 1,
            template_url: 'static/template/恒生成交回报模板.xls',
            is_transform: true,
            template_desc: '恒生模板，应用于恒生成交回报导入',
        },
        {
            template_title: '恒生银行间成交回报',
            template_imgs: [
                { name: '综合信息查询_银行间成交回报', url: './images/template_4_1.png' },
            ],
            category: 1,
            template_url: 'static/template/恒生银行间成交回报模板.xls',
            is_transform: true,
            template_desc: '恒生模板，应用于恒生成交回报导入',
        },
        {
            template_title: 'CFETS现券交易流水',
            template_imgs: [
                { name: 'CFETS现券买卖', url: './images/CFETS_bond_trade.png' },
            ],
            category: 1,
            template_url: 'static/template/CFETS现券交易流水模板.xls',
            is_transform: true,
            template_desc: '应用于CFETS交易流水导入',
        },
        {
            template_title: 'CFETS质押式回购交易流水',
            template_imgs: [
                { name: 'CFETS质押式回购', url: './images/CFETS_pledge_repo.png' },
            ],
            category: 1,
            template_url: 'static/template/CFETS质押式回购交易流水模板.xls',
            is_transform: true,
            template_desc: '应用于CFETS交易流水导入',
        },
        {
            template_title: 'CFETS买断式回购交易流水',
            template_imgs: [
                { name: 'CFETS买断式回购', url: './images/CFETS_buyout_repo.png' },
            ],
            category: 1,
            template_url: 'static/template/CFETS买断式回购交易流水模板.xls',
            is_transform: true,
            template_desc: '应用于CFETS交易流水导入',
        },
        // {
        //     template_title: '衡泰交易流水',
        //     template_imgs: [
        //         { name: '衡泰交易流水', url: './images/template_Hengtai.png' },
        //     ],
        //     category: 1,
        //     template_url: 'static/template/衡泰交易流水模板.xls',
        //     is_transform: true,
        //     template_desc: '衡泰模板，应用于衡泰交易流水导入',
        // },
        // {
        //     template_title: 'Murex交易流水',
        //     template_imgs: [
        //         { name: 'Murex交易流水', url: './images/template_Murex.png' },
        //     ],
        //     category: 1,
        //     template_url: 'static/template/Murex交易流水模板.xls',
        //     is_transform: true,
        //     template_desc: 'Murex模板，应用于Murex交易流水导入',
        // },
        {
            template_title: '申购赎回',
            template_imgs: [
                { name: '申购赎回', url: './images/purchase_redeem.png' },
            ],
            category: 1,
            template_url: 'static/template/申购赎回模板.xls',
            is_transform: true,
            template_desc: '定制模板，支持批量申购赎回流水导入',
        },
        // {
        //     template_title: '现金分红',
        //     template_imgs: [
        //         { name: '现金分红', url: './images/template_dividend.png' },
        //     ],
        //     category: 1,
        //     template_url: 'static/template/现金分红模板.xls',
        //     is_transform: true,
        //     // template_desc: '支持现金分红和红利再投资导入'
        //     template_desc: '现金分红导入',
        // },
        // {
        //     template_title: '估值表',
        //     template_imgs: [
        //         { name: '估值表', url: './images/template_valuation.png' },
        //     ],
        //     template_url: 'static/template/估值表模板.xls',
        //     is_transform: true,
        //     template_desc: '应用于市场10余种估值表格式导入',
        // },
        {
            template_title: '恒生现券持仓',
            template_imgs: [
                { name: '综合信息查询_组合证券', url: './images/template_5_1.png' },
            ],
            category: 2,
            template_url: 'static/template/恒生现券持仓模板.xls',
            is_transform: false,
            template_desc: '恒生模板，支持债券持仓信息导入',
        },
        {
            template_title: '恒生银行间回购持仓',
            template_imgs: [
                { name: '综合信息查询_银行间回购', url: './images/template_6_1.png' },
            ],
            category: 2,
            template_url: 'static/template/恒生银行间回购持仓模板.xls',
            is_transform: true,
            template_desc: '恒生模板，支持银行间回购持仓信息导入',
        },
        {
            template_title: '恒生交易所回购持仓',
            template_imgs: [
                { name: '综合信息查询_交易所回购', url: './images/template_7_1.png' },
            ],
            category: 2,
            template_url: 'static/template/恒生交易所回购持仓模板.xls',
            is_transform: true,
            template_desc: '恒生模板，支持交易所回购持仓信息导入',
        },
        {
            template_title: '恒生账户信息',
            template_imgs: [
                { name: '综合信息查询_基金资产', url: './images/template_8_1.png' },
            ],
            category: 2,
            template_url: 'static/template/恒生账户信息模板.xls',
            is_transform: true,
            template_desc: '恒生模板，支持账户信息维护',
        },
        // {
        //     template_title: '非标资产',
        //     template_imgs: [
        //         { name: '非标资产', url: './images/nstd_asset.png' }
        //     ],
        //     template_url: 'static/template/非标资产模板.xls',
        //     is_transform: true,
        //     template_desc: '支持批量非标资产导入'
        // }
    ],
};

/**
 *
 */
class importTemplateCtrl {
    /**
     *
     * @param {any} mdPanelRef
     * @param {any} $mdDialog
     */
    constructor(mdPanelRef, $mdDialog) {
        this.mdPanelRef = mdPanelRef;

        this.$mdDialog = $mdDialog;

        this[initView]();
    }

    /**
     *
     */
    [initView]() {
        this.tempList = dataDefine.tempList;

        this.category = dataDefine.category;

        this.selectedTab = 1;
    }

    /**
     *
     * @param {any} event
     */
    $onClickOk(event) {
        this.mdPanelRef.close();
    }

    /**
     *
     * @param {any} event
     */
    $onClickCancel(event) {
        this.mdPanelRef.close();
    }

    /**
     *
     * @param {any} event
     */
    openImgDialog(event) {
        if (!event || !event.target) return;
        let scope = angular.element(event.target).scope();
        if (!scope || !scope.temp) return;

        this.$mdDialog.show({
            template: imageDialogTemplate,
            openFrom: event.target,
            closeTo: event.target,
            targetEvent: event,
            controller: ['$scope', '$mdDialog', ($scope, $mdDialog) => {
                $scope.$ctrl.$onClickCancel = (event) => {
                    $mdDialog.hide();
                };
            }],
            controllerAs: '$ctrl',
            locals: {
                image: scope.temp.template_imgs,
            },
            bindToController: true,
            clickOutsideToClose: true,
        }).then((answer) => {
        }, () => { });
    }
}

let $injector = ['mdPanelRef', '$mdDialog', importTemplateCtrl];

export default $injector;

export { $injector, Template };
