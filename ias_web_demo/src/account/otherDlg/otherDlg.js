angular.module('ias.account').factory('createPage', function () {
    return {
        valuation_type: '0'
    }
});
angular.module('ias.account').factory('importExcel', function () {
    return {
        view_image: false
    }
});
angular.module('ias.account').controller('exportExcelCtrl', function ($scope, winStatus, dataCenter, accountConstant, $timeout,
    messageBox, excelExport, user, datetimePickerConfig, dateClass, $filter, accountService, authorityControl) {
    $scope.timePickerConfig = angular.merge({}, datetimePickerConfig, { endDate: dateClass.getFormatDate(dateClass.getLastDay(new Date())) });
    var getLastDay = function (year, month) {
        var cur_month = new Date(year, month - 1, 1);
        var next_month = new Date(year, month, 1);
        return (next_month - cur_month) / (1000 * 60 * 60 * 24)
    };

    $scope.initDate = function () {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var lastDay = getLastDay(year, month);
        if ($scope.export_term.type == '0') {                               //上一期
            today.setMonth(today.getMonth() - 1);
            year = today.getFullYear();
            month = today.getMonth() + 1;
            lastDay = getLastDay(year, month)
        }
        var str_month = ('0' + month).slice(-2);
        $scope.export_term.start_date = year + '-' + str_month + '-01';
        $scope.export_term.end_date = year + '-' + str_month + '-' + lastDay;
    };

    $scope.exportType = 0;
    $scope.settleTypeGroup = [
        { label: '账户信息统计', value: 0 },
        { label: '周报', value: 1 }
    ];

    $scope.valuation_date = '';
    $scope.selected_accounts = [];
    $scope.selected_account_clears = [];

    $scope.export_term = {
        type: '1',
        start_date: '',
        end_date: ''
    };
    $scope.initDate();
    $scope.termTypeChanged = function () {
        $scope.initDate();
    };

    $scope.weekReport = {
        startDate: $filter('date')(dateClass.getLastDay(new Date()), 'yyyy-MM-dd'),
        endDate: $filter('date')(dateClass.getLastDay(new Date()), 'yyyy-MM-dd'),
        handleDateChange: function() {
            const start = this.startDate;
            const end = this.endDate;
            if (end && start > end) {
                this.startDate = end;
                this.endDate = start;
            }
        },
        accounts: [],
    }

    $('#exportExcelDlg').on('shown.bs.modal', function (e) {
        $scope.selected_account_clears = [];
        $scope.weekReport.accounts = [];
        $scope.exportType = 0;

        $scope.valuation_date = $filter('date')(dateClass.getLastDay(new Date()), 'yyyy-MM-dd') || $scope.valuationDates.selected;
        $scope.$apply();
    });

    var getErrorFunc = function (error_msg) {
        var errorFunc = function () {
            hideLoad();
            messageBox.error(error_msg);
        };
        return errorFunc
    };

    var showLoad = function () {
        $('#loadShadeDiv').modal({ backdrop: 'static', keyboard: false });
    };

    var hideLoad = function () {
        $('#loadShadeDiv').modal('hide');
    };

    $scope.exportClick = function () {
        if ($scope.exportType === 0) {
            if ($scope.selected_accounts && $scope.selected_accounts.length > 0) {
                var accounts = accountService.getAccountsByIds($scope.selected_accounts);
                var account_ids = accounts.map(function(account, index) {
                    return account.id;
                });
                var dateStr = $scope.valuation_date.split('-').join('');
                var params = {
                    date: dateStr,
                    company_id: user.company_id,
                    accounts: account_ids,
                    valuation_method: winStatus.cur_valuation_method
                };
                excelExport.request('account_statistics', params, '账户信息统计表_' + dateStr + '.xls', hideLoad, getErrorFunc('账户信息统计表导出失败！'));
            }
        } else if ($scope.exportType === 1) {
            excelExport.request('report', {
                company_id: user.company_id,
                account_group_id: accountConstant.group_id,
                account_list: authorityControl.getAccountGroupMember($scope.weekReport.accounts),
                start_date: $scope.weekReport.startDate,
                end_date: $scope.weekReport.endDate,
                account_or_group_name: "",
            }, `周报_${$scope.weekReport.startDate}_${$scope.weekReport.endDate}.xls`, hideLoad, getErrorFunc('周报导出失败！'));
        }
        $scope.dismissClick();
    };

    $scope.dismissClick = function () {
        $('#exportExcelDlg').modal('hide');
        $scope.selected_account_clears = [];
        $scope.weekReport.accounts = [];
    };
});
// Deprecated. move to dataManage
angular.module('ias.account').controller('importTemplateCtrl', function ($scope, importExcel) {
    $scope.templateTabs = [
        { label: '交易流水', value: 0 },
        { label: '申赎分红', value: 1 },
        { label: '资产持仓', value: 2 }
    ];
    $scope.selectedTab = 0;
    $scope.templates = [
        [{
            template_title: '定制现券交易流水',
            template_imgs: [ { name: '交易明细', url: './images/template_1.png' } ],
            template_url: 'static/template/定制现券交易流水模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '定制模板，支持债券交易流水导入'
        }, {
            template_title: '定制成交记录流水',
            template_imgs: [ { name: '现券买卖', url: './images/template_2_1.jpg' } ],
            template_url: 'static/template/定制成交记录流水模板.xlsx',
            is_view: false,
            is_transform: true,
            template_desc: '定制模板，支持成交记录流水导入'
        }, {
            template_title: '定制成交记录流水（二）',
            template_imgs: [ { name: '定制成交记录流水（二）', url: './images/template_2_2.png' } ],
            template_url: 'static/template/定制成交记录流水模板2.xls',
            is_view: false,
            is_transform: true,
            template_desc: '定制模板，支持成交记录流水导入'
        }, {
            template_title: '恒生成交回报',
            template_imgs: [ { name: '综合信息查询_成交回报', url: './images/template_3_1.png' } ],
            template_url: 'static/template/恒生成交回报模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '恒生模板，应用于恒生成交回报导入'
        }, {
            template_title: '恒生银行间成交回报',
            template_imgs: [ { name: '综合信息查询_银行间成交回报', url: './images/template_4_1.png' } ],
            template_url: 'static/template/恒生银行间成交回报模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '恒生模板，应用于恒生成交回报导入'
        }, {
            template_title: 'CFETS现券交易流水',
            template_imgs: [ { name: 'CFETS现券买卖', url: './images/CFETS_bond_trade.png' } ],
            template_url: 'static/template/CFETS现券交易流水模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '应用于CFETS交易流水导入'
        }, {
            template_title: 'CFETS质押式回购交易流水',
            template_imgs: [ { name: 'CFETS质押式回购', url: './images/CFETS_pledge_repo.png' } ],
            template_url: 'static/template/CFETS质押式回购交易流水模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '应用于CFETS交易流水导入'
        }, {
            template_title: 'CFETS买断式回购交易流水',
            template_imgs: [ { name: 'CFETS买断式回购', url: './images/CFETS_buyout_repo.png' } ],
            template_url: 'static/template/CFETS买断式回购交易流水模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '应用于CFETS交易流水导入'
        }, {
            template_title: 'xIR 衡泰利率资产业务流水',
            template_imgs: [ { name: 'xIR 衡泰利率资产业务流水', url: './images/template_Hengtai.png' } ],
            template_url: 'static/template/衡泰利率资产业务流水.xls',
            is_view: false,
            is_transform: true,
            template_desc: '应用于衡泰利率资产业务流水导入'
        }, {
            template_title: '衡泰流水银行版 (现券)',
            template_imgs: [ { name: '衡泰流水银行版 (现券)', url: './images/template_Hengtai_bank.png' } ],
            template_url: 'static/template/衡泰流水银行版.xls',
            is_view: false,
            is_transform: true,
            template_desc: '应用于衡泰流水银行版业务流水导入'
        }, {
            template_title: 'Murex交易流水',
            template_imgs: [ { name: 'Murex交易流水', url: './images/template_Murex.png' } ],
            template_url: 'static/template/Murex交易流水模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: 'Murex模板，应用于Murex交易流水导入'
        }], 
        [{
            template_title: '申购赎回',
            template_imgs: [ { name: '申购赎回', url: './images/purchase_redeem.png' } ],
            template_url: 'static/template/申购赎回模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '定制模板，支持批量申购赎回流水导入'
        }, {
            template_title: '现金分红',
            template_imgs: [ { name: '现金分红', url: './images/template_dividend.png' } ],
            template_url: 'static/template/现金分红模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '现金分红导入'
        }], 
        [{
            template_title: '估值表',
            template_imgs: [ { name: '估值表', url: './images/template_valuation.png' } ],
            template_url: 'static/template/估值表模板.xls',
            is_view: false,
            is_transform: true,
            template_desc: '应用于市场10余种估值表格式导入'
        }],
    ];

    $scope.$watch(
        function () {
            return importExcel.view_image
        },
        function () {
            $scope.view_image = importExcel.view_image;
        }
    );

    $scope.big_img_url = [];
    $scope.selectedRow = 0;
    $scope.curAcitve = false;
    $scope.temp_url = $scope.templates[0].template_url;

    $scope.viewTemplateImg = function (temp, tempUrl) {
        $scope.big_img_url = temp;
        $scope.view_image_url = $scope.big_img_url[0].url;
        $scope.view_image = !$scope.view_image;
        importExcel.view_image = $scope.view_image;
        $scope.temp_url = tempUrl;
    };

    $scope.showImg = function (img, row) {
        $scope.view_image_url = img.url;
        $scope.selectedRow = row;
    };

    $scope.closeShowImg = function (temp) {
        $scope.view_image = false;
        importExcel.view_image = $scope.view_image;
    };

    $scope.dismissImport = function () {
        $('#importTemplateDlg').modal('hide');
    };

    $scope.importTemplate = function () {
        $scope.dismissImport();
    };

    $scope.closeSelf = function () {
        $scope.closeShowImg();
    };
});
angular.module('ias.account').controller('checkFailedPositionCtrl', function ($scope, checkAssetReq, messageBox, winStatus, user) {
    $scope.typeChanged = function () {
        if ($scope.check_position.checkedType === '0') {
            $scope.check_position.checkedObj = {}
            $scope.check_position.checkedObj.asset_code = $scope.check_position.byCode.code;
            $scope.check_position.checkedObj.asset_name = $scope.check_position.byCode.name;
            $scope.check_position.checkedObj.asset_id = $scope.check_position.byCode.bond_key_listed_market;
        }  else if ($scope.check_position.checkedType === '1') {
            $scope.check_position.checkedObj = {}
            $scope.check_position.checkedObj.asset_code = $scope.check_position.byName.code;
            $scope.check_position.checkedObj.asset_name = $scope.check_position.byName.name;
            $scope.check_position.checkedObj.asset_id = $scope.check_position.byName.bond_key_listed_market;
        }
    };

    $scope.apply_checked_position = function () {
        if (!$scope.check_position.checkedObj.asset_id) {
            messageBox.warn('资产代码或名称不能为空！');
            return;
        }

        var checked = {
            course_code: $scope.check_position.course_code,
            course_name: $scope.check_position.course_name,
            asset_type: $scope.check_position.asset_type,
            asset_code: $scope.check_position.checkedObj.asset_code,
            asset_name: $scope.check_position.checkedObj.asset_name,
            asset_id: $scope.check_position.checkedObj.asset_id
        };


        checkAssetReq.update({
            company_id: user.company_id,
            content: [checked]
        }, function success(response) {
            if (response.code && response.code === '0000') {
                checkAssetReq.add({
                    company_id: user.company_id,
                    user_id: user.id,
                    params: [{
                        account_id: winStatus.cur_account_id
                    }]
                })
            } else {
                messageBox.error('添加校对信息失败！');
            }
        }, function failed() {
            messageBox.error('添加校对信息失败！');
        });

        $scope.close_checked_Dlg();
    }

    $scope.close_checked_Dlg = function () {
        $('#checkPositionDlg').modal('hide');
    }

    $('#checkPositionDlg').on('hidden.bs.modal', function () {
        $scope.$broadcast('angucomplete-alt:clearInput', 'checkBondSearchBox');
        $scope.$broadcast('angucomplete-alt:clearInput', 'checkStockSearchBox');
    })
});
