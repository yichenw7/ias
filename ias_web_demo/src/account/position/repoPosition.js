angular.module('ias.account').factory('RepoGrid', function (sortClass, uiGridConstants) {
    var commentTemplate = '<span ng-show="!grid.appScope.isEmpty(row.entity.comment)" class="btn btn-xs">' +
        '<img src="./images/comment.png" tooltip data-toggle="tooltip" data-placement="top" data-original-title="{{row.entity.comment}}">' +
        '</span>';
    var pledgeTemplate = '<detail-tip-btn tip-view-id="\'bankRepoPledgeBonds\'" ' +
        'ng-if="row.entity.pledge_bond_list.length>0" show-detail-func="grid.appScope.showRepoPledgeBonds(list)" ' +
        'bond-list="row.entity.pledge_bond_list" ' +
        'tip-left="200" tip-top="-15"></detail-tip-btn>';
    var accountGroupName = '<span class="btn btn-xs ">' +
        '<img class="group-name-icon" tooltip data-original-title="{{row.entity.account_id | getAccountGroupName}}">' +
        '</span>';
    var sequenceTemplate = '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>';
    var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
        '<button class="  quote-btn"' +
        'ng-click="grid.appScope.editRepo(row.entity)">编辑</button>' +
        '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delBtnClicked(row.entity)"></button>' +
        '</div>';
    var continueTemplate = '<div ng-if="(row.entity.account_id | accountEditAuthority) && grid.appScope.isMaturityToday(row.entity.maturity_date) && row.entity.continued != \'1\'"> ' +
        '<button class="  quote-btn" ' +
        'ng-click="grid.appScope.continueRepo(row.entity)">续做</button>' +
        '</div>';
    var freezeTemplate = '<button ng-if="grid.appScope.showFreeze(row.entity.maturity_settlement_date, row.entity.direction,row.entity.status)"' +
        'style="height: 22px;margin-top: 4px" ng-click="grid.appScope.unfreeze(row.entity)">解冻</button>' +
        '<label ng-if="1==row.entity.direction && \'9\'==row.entity.status"' +
        'class="btn-sm btn-bg-color action-btn" type="label"' +
        'style="height: 22px;margin-top: 4px;background-color: #01926b;">已解冻</label>';

    return {
        getRowTemplate: function (key) {
            var positionRowTemplate = "<div ng-style=\"grid.appScope.setRowStatus(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.uid\" ui-grid-one-bind-id-grid=\"rowRenderIndex + '-' + col.uid + '-cell'\" " +
                "class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" role=\"{{col.isRowHeader ? 'rowheader' : 'gridcell'}}\" ui-grid-cell></div>"
            var rowTemlateMap = {
                positionRowTemplate: positionRowTemplate,
            }
            return rowTemlateMap[key];
        },
        bankRepoColumnDef: function () {
            return [
                { field: 'action4', displayName: '编辑', width: '100', cellTemplate: editTemplate },
                { field: 'action3', displayName: '解冻', width: '60', cellTemplate: freezeTemplate },
                { field: 'action1', displayName: '序号', width: '60', cellTemplate: sequenceTemplate },
                { field: 'initial_date', displayName: '回购日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'account_name', displayName: '基金名称', width: '90' },
                { field: 'account_group', displayName: '所在组合', width: '80', cellTemplate: accountGroupName },
                { field: 'repo_code', displayName: '回购代码', width: '80', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                { field: 'direction', displayName: '委托方向', width: '80', cellFilter: 'repoDirection' },
                { field: 'amount', displayName: '净资金额', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'return_amount', displayName: '返回金额', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'repo_rate', displayName: '平均利率(%)', width: '100', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'profit', displayName: '利润', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'settlement_days', displayName: '清算速度', width: '80', cellFilter: 'settlementDayBond' },
                { field: 'maturity_date', displayName: '法定购回日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'maturity_date', displayName: '实际购回日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'maturity_settlement_date', displayName: '购回交割日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'counter_party_account', displayName: '对手账户', width: '90' },
                { field: 'counter_party_trader', displayName: '对手交易员', width: '90' },
                { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                { field: 'update_time', displayName: '编辑时间', width: '180' },
                { field: 'coupon', displayName: '总应计利息', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'action2', displayName: '质押券', width: '60', cellTemplate: pledgeTemplate },
                { field: 'comment', displayName: '备注', width: '50', cellTemplate: commentTemplate }
            ];
        },
        buyoutRepoColumnDef: function () {
            return [
                { field: 'action4', displayName: '编辑', width: '100', cellTemplate: editTemplate },
                { field: 'action3', displayName: '解冻', width: '60', cellTemplate: freezeTemplate },
                { field: 'action1', displayName: '序号', width: '60', cellTemplate: sequenceTemplate },
                { field: 'initial_date', displayName: '回购日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'account_name', displayName: '基金名称', width: '90' },
                { field: 'account_group', displayName: '所在组合', width: '80', cellTemplate: accountGroupName },
                { field: 'short_name', displayName: '回购债券', width: '120' },
                { field: 'direction', displayName: '委托方向', width: '120', cellFilter: 'buyoutRepoDirection' },
                { field: 'amount', displayName: '净资金额', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'return_amount', displayName: '返回金额', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'repo_rate', displayName: '平均利率(%)', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', width: '100', sortingAlgorithm: sortClass.numberFunc },
                { field: 'profit', displayName: '利润', width: '100', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'initial_clean_price', displayName: '期初净价', width: '100', cellFilter: 'toFixed4', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'maturity_clean_price', displayName: '期末净价', width: '100', cellFilter: 'toFixed4', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'settlement_days', displayName: '清算速度', width: '80', cellFilter: 'settlementDayBond' },
                { field: 'maturity_date', displayName: '法定购回日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'maturity_date', displayName: '实际购回日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'maturity_settlement_date', displayName: '购回交割日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                // { field: 'trader', displayName: '本方交易员', width: '90' },
                { field: 'counter_party_account', displayName: '对手账户', width: '90' },
                { field: 'counter_party_trader', displayName: '对手交易员', width: '90' },
                { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                { field: 'update_time', displayName: '编辑时间', width: '180' },
                { field: 'coupon', displayName: '总应计利息', width: '90', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'comment', displayName: '备注', width: '50', cellTemplate: commentTemplate }
            ];
        },
        exchangeRepoColumnDef: function () {
            return [
                { field: 'action', displayName: '编辑', width: '100', cellTemplate: editTemplate },
                { field: 'initial_date', displayName: '回购日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'account_name', displayName: '基金名称', width: '100' },
                { field: 'account_group', displayName: '所在组合', width: '80', cellTemplate: accountGroupName },
                { field: 'repo_code', displayName: '回购代码', width: '80' },
                { field: 'direction', displayName: '委托方向', width: '80', cellFilter: 'repoDirection' },
                { field: 'amount', displayName: '净资金额', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'return_amount', displayName: '返回金额', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'repo_rate', displayName: '平均利率(%)', width: '100', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'profit', displayName: '利润', width: '100', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'settlement_days', displayName: '清算速度', width: '80', cellFilter: 'settlementDayBond' },
                { field: 'maturity_date', displayName: '法定购回日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'maturity_date', displayName: '实际购回日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'maturity_settlement_date', displayName: '购回交割日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'daily_coupon', displayName: '计提利息', width: '80', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'real_days', displayName: '实际占款天数', width: '110', cellFilter: 'thousandthNum', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'real_rate', displayName: '实际利率(%)', width: '100', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'repo_name', displayName: '证券名称', width: '100' },
                { field: 'market', displayName: '交易市场', width: '80', cellFilter: 'typeTranslate' },
                { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                { field: 'update_time', displayName: '编辑时间', width: '180' }
            ];
        },
        protocolRepoColumnDef: function () {
            return [
                { field: 'action4', displayName: '编辑', width: '100', cellTemplate: editTemplate },
                { field: 'action3', displayName: '解冻', width: '60', cellTemplate: freezeTemplate },
                { field: 'action5', displayName: '续做', minWidth: '50', cellTemplate: continueTemplate },
                { field: 'action1', displayName: '序号', width: '60', cellTemplate: sequenceTemplate },
                { field: 'initial_date', displayName: '回购日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'account_name', displayName: '基金名称', width: '100' },
                { field: 'account_group', displayName: '所在组合', width: '80', cellTemplate: accountGroupName },
                { field: 'repo_code', displayName: '回购代码', width: '80' },
                { field: 'direction', displayName: '委托方向', width: '110', cellFilter: 'directionProtocolRepo' },
                { field: 'amount', displayName: '净资金额', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'return_amount', displayName: '返回金额', width: '120', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'repo_rate', displayName: '平均利率(%)', width: '100', cellFilter: 'toYield', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'profit', displayName: '利润', width: '100', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'settlement_days', displayName: '清算速度', width: '80', cellFilter: 'settlementDayBond' },
                { field: 'maturity_date', displayName: '法定购回日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'maturity_date', displayName: '实际购回日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'maturity_settlement_date', displayName: '购回交割日期', width: '120', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                { field: 'counter_party_account', displayName: '对手账户', width: '90' },
                { field: 'counter_party_trader', displayName: '对手交易员', width: '90' },
                { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                { field: 'update_time', displayName: '编辑时间', width: '180' },
                { field: 'coupon', displayName: '总应计利息', width: '90', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                { field: 'action2', displayName: '质押券', width: '70', cellTemplate: pledgeTemplate }
            ];
        },
        repoAssetColumnDef: function () {
            return [
                { field: 'market', displayName: '交易市场', width: '150', cellFilter: 'typeTranslate' },
                { field: 'repo_type', displayName: '回购类型', width: '150' },
                { field: 'direction', displayName: '回购方向', width: '150', cellFilter: 'repoDirection' },
                { field: 'repo_code', displayName: '回购代码', width: '250' },
                { field: 'repo_name', displayName: '回购名称', width: '250' },
                {
                    field: 'amount', displayName: '持仓金额', width: '200', cellFilter: 'toFixed2:null:true',
                    aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                    footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue() | toFixed2:true:true}}</div>'
                },
                {
                    field: 'proportion', displayName: '比重(%)', width: '200', cellFilter: 'toPercentNoSign',
                    aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                    footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue() | toPercentNoSign}}</div>'
                }
            ];
        },
    }
});
angular.module('ias.account').controller('bankRepoCtrl', function ($scope, RepoGrid, filterParam, hcMarketData, user, RepoFreeze,authorityControl,accountConstant,
                                                    Trades, TradesGroup, winStatus, $filter, messageBox, Trade, dateClass, gridService) {
    if ($scope.STATUS.IS_POSITION) {
        var columnNames = ['序号', '回购日期', '基金名称', '所在组合', '回购代码', '委托方向', '净资金额', '返回金额','平均利率(%)', '利润', '清算速度',
            '法定购回日期', '实际购回日期', '购回交割日期', '对手账户', '对手交易员', '总应计利息', '质押券', '备注'];
    } else {
        var columnNames = ['序号', '回购日期', '基金名称', '所在组合', '回购代码', '委托方向', '净资金额', '返回金额','平均利率(%)', '利润', '清算速度',
            '法定购回日期', '实际购回日期', '购回交割日期', '对手账户', '对手交易员', '录入人', '编辑时间', '总应计利息', '质押券', '解冻', '备注', '编辑'];
    }
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1', 'action3', 'action4', 'account_group'],
        rowTemplate: RepoGrid.getRowTemplate('positionRowTemplate'),
        columnDefs: gridService.chooseColumeFunc(RepoGrid.bankRepoColumnDef(), columnNames),
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'repo_rate') {
                return $filter('thousandthNum')($filter('toFixed4')(value));
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
    $scope.showFreeze = function (maturity_settlement_date, direction, status) {
        if (dateClass.getFormatDate(new Date(), 'yyyy-MM-dd') == maturity_settlement_date && direction == 1 && status != '9') {
            return true;
        } else {
            return false;
        }
    };

    $scope.unfreeze = function (bond) {
        RepoFreeze.unfreeze({
            repo_type: 'interbank',
            account_id: bond.account_id,
            trade_id: bond.id,
            company_id: $scope.getCompanyId(bond.account_id),
            unfreeze: true
        });
    };

    $scope.delBtnClicked = function (bond) {
        function confirmFun() {
            Trade.delete({
                type: 'interbank_repo',
                account_id: bond.account_id,
                trade_id: bond.id,
                company_id: $scope.getCompanyId(bond.account_id)
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.editRepo = function (bond) {
        hcMarketData.bond = bond;
        $scope.$emit("edit bankRepo Event");
    };

    $scope.onExportData = function (isTrade) {
        if (isTrade) {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_银行间回购_');
        } else {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_银行间回购_', $scope.accountSelectedDate);
        }
        $scope.exportExcel($scope.gridApi.exporter);
    };
    $scope.init = function () {

        if (winStatus.cur_account_list.length === 0) return;

        var date = null;
        if ($scope.STATUS.IS_POSITION) {
            date = $scope.accountSelectedDate || $filter('date')(new Date(), 'yyyy-MM-dd');
        }
        TradesGroup.post({
            type: 'interbank_repo',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    }
    $scope.$on('bank_repo tab clicked', function () {
        $scope.init();
    });

    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
angular.module('ias.account').controller('buyoutRepoCtrl', function ($scope, RepoGrid, filterParam, hcMarketData, user, Trade, TradesGroup, accountConstant,authorityControl,
                                                      Trades, winStatus, $filter, RepoFreeze, dateClass, messageBox, gridService) {
    if ($scope.STATUS.IS_POSITION) {
        var columnNames = ['序号', '回购日期', '基金名称', '所在组合', '回购债券', '委托方向', '净资金额', '返回金额', '平均利率(%)', '利润', '期初净价',
            '期末净价', '清算速度', '法定购回日期', '实际购回日期', '购回交割日期', '对手账户', '对手交易员', '总应计利息', '备注'];
    } else {
        var columnNames = ['序号', '回购日期', '基金名称', '所在组合', '回购债券', '委托方向', '净资金额', '返回金额', '平均利率(%)', '利润', '期初净价',
            '期末净价', '清算速度', '法定购回日期', '实际购回日期', '购回交割日期', '对手账户', '对手交易员', '录入人', '编辑时间', '总应计利息', '解冻', '备注', '编辑'];
    }
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        rowTemplate: RepoGrid.getRowTemplate('positionRowTemplate'),
        columnDefs: gridService.chooseColumeFunc(RepoGrid.buyoutRepoColumnDef(), columnNames),
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1', 'action3', 'action4', 'account_group'],
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'repo_rate') {
                return $filter('thousandthNum')($filter('toFixed4')(value));
            } else {
                return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
            }
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
    $scope.delBtnClicked = function (bond) {
        function confirmFun() {
            Trade.delete({
                type: 'buyout_repo',
                account_id: bond.account_id,
                trade_id: bond.id,
                company_id: $scope.getCompanyId(bond.account_id)
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.showFreeze = function (maturity_settlement_date, direction, status) {
        if (dateClass.getFormatDate(new Date(), 'yyyy-MM-dd') == maturity_settlement_date && direction == 1 && status != '9') {
            return true;
        } else {
            return false;
        }
    };

    $scope.unfreeze = function (bond) {
        RepoFreeze.unfreeze({
            repo_type: 'buyout',
            account_id: bond.account_id,
            trade_id: bond.id,
            company_id: $scope.getCompanyId(bond.account_id),
            unfreeze: true
        });
    };
    $scope.editRepo = function (bond) {
        hcMarketData.bond = bond;
        $scope.$emit("edit buyoutRepo Event");
    };

    $scope.onExportData  = function(isTrade){
        if (isTrade) {
            $scope.gridOptions.exporterCsvFilename =   $scope.getFileName('_成交记录_买断式回购_');
        } else {
            $scope.gridOptions.exporterCsvFilename =   $scope.getFileName('_买断式回购_', $scope.accountSelectedDate);
        }

        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.init = function () {

        if (winStatus.cur_account_list.length === 0) {
            return ;
        }
        var date = null;
        if ($scope.STATUS.IS_POSITION) {
            date = $scope.accountSelectedDate || $filter('date')(new Date(), 'yyyy-MM-dd');
        }
        TradesGroup.post({
            type: 'buyout_repo',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    }
    $scope.$on('buyout_repo tab clicked', function () {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
angular.module('ias.account').controller('exchangeRepoCtrl', function ($scope, RepoGrid, filterParam, hcMarketData, user, Trades,TradesGroup,accountConstant,authorityControl,
                                                        Trade, winStatus, $filter, messageBox, gridService) {
    if ($scope.STATUS.IS_POSITION) {
        var columnNames = ['回购日期', '基金名称', '所在组合', '回购代码', '委托方向', '净资金额', '返回金额', '平均利率(%)', '利润', '清算速度', '法定购回日期',
            '实际购回日期', '购回交割日期', '计提利息', '实际占款天数', '实际利率(%)', '证券名称', '交易市场'];
    } else {
        var columnNames = ['回购日期', '基金名称', '所在组合', '回购代码', '委托方向', '净资金额', '返回金额', '平均利率(%)', '利润', '清算速度', '法定购回日期',
            '实际购回日期', '购回交割日期', '计提利息', '实际占款天数', '实际利率(%)', '证券名称', '交易市场', '录入人', '编辑时间', '编辑'];
    }
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        rowTemplate: RepoGrid.getRowTemplate('positionRowTemplate'),
        columnDefs: gridService.chooseColumeFunc(RepoGrid.exchangeRepoColumnDef(), columnNames),
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action', 'account_group'],
        exporterFieldCallback: function (grid, row, col, value) {
            return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
    $scope.delBtnClicked = function (bond) {
        function confirmFun() {
            Trade.delete({
                type: 'exchange_repo',
                account_id: bond.account_id,
                company_id: $scope.getCompanyId(bond.account_id),
                trade_id: bond.id
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };

    $scope.onExportData = function (isTrade) {
        if (isTrade) {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_交易所回购_');
        } else {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_交易所回购_', $scope.accountSelectedDate);
        }
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.editRepo = function (bond) {
        hcMarketData.bond = bond;
        $scope.$emit("edit exchangeRepo Event");
    };

    $scope.init = function () {

        if (winStatus.cur_account_list.length === 0) {
            return ;
        }
        var date = null;
        if ($scope.STATUS.IS_POSITION) {
            date = $scope.accountSelectedDate || $filter('date')(new Date(), 'yyyy-MM-dd');
        }
        TradesGroup.post({
            type: 'exchange_repo',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    }
    $scope.$on('exchange_repo tab clicked', function () {
        $scope.init();
    });
    $scope.init();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
angular.module('ias.account').controller('protocolRepoCtrl', function ($scope, RepoGrid, filterParam, hcMarketData, user, Trade,TradesGroup,accountConstant,authorityControl,
                                                        Trades, winStatus, $filter, messageBox, RepoFreeze, dateClass, gridService) {
    if ($scope.STATUS.IS_POSITION) {
        var columnNames = ['序号', '回购日期', '基金名称', '所在组合', '回购代码', '委托方向', '净资金额', '返回金额', '平均利率(%)', '利润', '清算速度', '法定购回日期',
            '实际购回日期', '购回交割日期', '对手账户', '对手交易员', '总应计利息', '质押券'];
    } else {
        var columnNames = ['序号', '回购日期', '基金名称', '所在组合', '回购代码', '委托方向', '净资金额', '返回金额', '平均利率(%)', '利润', '清算速度', '法定购回日期',
            '实际购回日期', '购回交割日期', '对手账户', '对手交易员', '录入人', '编辑时间', '总应计利息', '质押券', '解冻', '续做', '编辑'];
    }
    $scope.gridOptions = {
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        rowTemplate: RepoGrid.getRowTemplate('positionRowTemplate'),
        columnDefs: gridService.chooseColumeFunc(RepoGrid.protocolRepoColumnDef(), columnNames),
        multiSelect: false,
        exporterOlderExcelCompatibility: true,
        exporterSuppressColumns: ['action1', 'action3', 'action4', 'action5', 'account_group'],
        exporterFieldCallback: function (grid, row, col, value) {
            return (col.cellFilter) ? $filter(col.cellFilter)(value) : value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };
    $scope.isMaturityToday = function (maturity_date) {
        return maturity_date == dateClass.getFormatDate(new Date(), 'yyyy-MM-dd');
    };
    $scope.delBtnClicked = function (bond) {
        function confirmFun() {
            Trade.delete({
                type: 'protocol_repo',
                account_id: bond.account_id,
                trade_id: bond.id,
                company_id: $scope.getCompanyId(bond.account_id)
            });
        }

        messageBox.confirm('确定删除该条记录吗？', null, confirmFun);
    };
    $scope.showFreeze = function (maturity_settlement_date, direction, status) {
        if (dateClass.getFormatDate(new Date(), 'yyyy-MM-dd') == maturity_settlement_date && direction == 1 && status != '9') {
            return true;
        } else {
            return false;
        }
    };
    $scope.unfreeze = function (bond) {
        RepoFreeze.unfreeze({
            repo_type: 'protocol',
            account_id: bond.account_id,
            trade_id: bond.id,
            company_id: $scope.getCompanyId(bond.account_id),
            unfreeze: true
        });
    };
    $scope.editRepo = function (bond) {
        hcMarketData.bond = bond;
        winStatus.protocol_repo_continue_flag = false;
        $scope.$emit("edit protocolRepo Event");
    };
    $scope.continueRepo = function (bond) {
        hcMarketData.bond = bond;
        winStatus.protocol_repo_continue_flag = true;
        $scope.$emit("edit protocolRepo Event");
    };
    $scope.onExportData = function (isTrade) {
        if (isTrade) {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_成交记录_协议式回购_');
        } else {
            $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_协议式回购_', $scope.accountSelectedDate);
        }

        $scope.exportExcel($scope.gridApi.exporter);
    };
    $scope.init = function () {

        if (winStatus.cur_account_list.length === 0) {
            return;
        }
        var date = null;
        if ($scope.STATUS.IS_POSITION) {
            date = $scope.accountSelectedDate || $filter('date')(new Date(), 'yyyy-MM-dd');
        }
        TradesGroup.post({
            type: 'protocol_repo',
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: date
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        });
    };
    $scope.init();
    $scope.$on('protocol_repo tab clicked', function () {
        $scope.init();
    });
    $scope.$on('$destroy', function () {
        $scope = null;
    });
});
angular.module('ias.account').controller('repoAssetCtrl', function($scope, RepoGrid, group_positions, filterParam, winStatus,
                                                    user, $filter, accountConstant, authorityControl) {
    var filterFunc = function (renderalbeRows) {
        renderalbeRows.forEach(function (row) {
            if ($.inArray(row.entity.market, $scope.condition.market) == -1) {
                row.visible = false;
                return true;
            }
            if ($.inArray(row.entity.repo_type, $scope.condition.type) == -1) {
                row.visible = false;
                return true;
            }
            if ($.inArray(row.entity.direction, $scope.condition.direction) == -1) {
                row.visible = false;
                return true;
            }
        });
        return renderalbeRows;
    };

    $scope.gridOptions = {
        showColumnFooter: true,
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        exporterSuppressColumns: [],
        exporterOlderExcelCompatibility: true,
        columnDefs: RepoGrid.repoAssetColumnDef(),
        exporterFieldCallback: function (grid, row, col, value) {
            if (col.name == 'direction') {
                value = $filter('repoDirection')(value);
            }else if(col.name == 'amount'){
                value = $filter('thousandthNum')($filter('toFixed2')(value));
            }else if(col.name == 'proportion'){
                value = $filter('thousandthNum')($filter('toFixed4')(value));
            }
            return value;
        },
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor(filterFunc, 200);
        }
    };

    $scope.repoFilter = {
        sse_market: true,
        sze_market: true,
        cib_market: true,
        buy_out: true,
        pledge: true,
        protocol: true,
        pos_direction: true,
        nag_direction: true
    };

    $scope.condition = {
        market:['银行间', '上交所', '深交所'],
        type:['质押式回购', '买断式回购', '协议式回购'],
        direction:[1, -1]
    };

    $scope.repoMarketChange = function() {
        $scope.condition.market.length = 0;
        if ($scope.repoFilter.cib_market) {
            $scope.condition.market.push('银行间');
        }
        if ($scope.repoFilter.sse_market) {
            $scope.condition.market.push('上交所');
        }
        if ($scope.repoFilter.sze_market) {
            $scope.condition.market.push('深交所');
        }

        $scope.gridApi.grid.refresh();
    };
    $scope.repoTypeChange = function() {
        $scope.condition.type.length = 0;
        if ($scope.repoFilter.buy_out) {
            $scope.condition.type.push('买断式回购');
        }
        if ($scope.repoFilter.pledge) {
            $scope.condition.type.push('质押式回购');
        }
        if ($scope.repoFilter.protocol) {
            $scope.condition.type.push('协议式回购');
        }

        $scope.gridApi.grid.refresh();
    };

    $scope.repoDirectionChange = function() {
        $scope.condition.direction.length = 0;

        if ($scope.repoFilter.pos_direction) {
            $scope.condition.direction.push(1);
        }
        if ($scope.repoFilter.nag_direction) {
            $scope.condition.direction.push(-1);
        }

        $scope.gridApi.grid.refresh();
    };

    $scope.onExportData = function(){
        $scope.gridOptions.exporterCsvFilename =   $scope.getFileName('_回购_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.initData = function(){

        if (winStatus.cur_account_list.length === 0) return;
        group_positions.post({
            account_group_id: accountConstant.group_id,
            asset_type: "repo",
            company_id: user.company_id,
            account_list: authorityControl.getAccountGroupMember(winStatus.cur_account_list),
            date: $scope.accountSelectedDate,
            include_ref_account: winStatus.refAccount.get()
        }, function success(response) {
            if (response.code && response.code === '0000') {
                $scope.gridOptions.data = response.data;
            }
        })
    };

    $scope.$on('repo asset tab clicked', function () {
        $scope.initData();
    });

    $scope.initData();

    $scope.$on('$destroy', function () {
        $scope = null;
    })
});
