import {
    vaRColumnDef,
} from './var.helper';

angular.module('ias.account').controller('vaRCtrl', function($scope, $filter, portfolioVarCte, messageBox,
                                               accountConstant, user, authorityControl, winStatus, sortClass) {
    $scope.VaRQuery = {};
    $scope.VaRQuery.query = function() {
        $('#loadShadeDiv').modal({backdrop: 'static', keyboard: false});
        let accountList = $scope.winStatus.is_account_now
            ? authorityControl.getAccountGroupMember([$scope.winStatus.cur_account_id])
            : authorityControl.getAccountGroupMember(winStatus.cur_account_list);

        portfolioVarCte.get({
            account_group_id: accountConstant.group_id,
            company_id: user.company_id,
            account_list: accountList,
            confidence_level: $scope.confidenceLevel.toQueryString(),
            term: $scope.VaRTerm.toQueryString(),
            period: $scope.historyPeriod.toQueryString(),
            group_by: $scope.analyticsTypes.toQueryString(),
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                $scope.gridOptions.data = toTreeLevel(data);
                redefineColumns();
                $('#loadShadeDiv').modal('hide');
            }
        }, function failure() {
            $('#loadShadeDiv').modal('hide');
        });
    };
    $scope.analyticsTypes = {
        selected: 0,
        options: [
            { label: '账户优先', value: 0, field: 'account' },
            { label: '个券优先', value: 1, field: 'position' },
        ],
        toQueryString: function() {
            return this.options[this.selected].field;
        },
        init: function() {
            if ($scope.winStatus.cur_account_list.length === 1) {
                this.options.length = 1;
            }
        },
    };
    $scope.analyticsTypes.init();
    $scope.confidenceLevel = {
        selected: '99.9%',
        options: ['99.9%', '99%', '95%', '90%'],
        toQueryString: function() {
            let selected = this.selected;
            if (selected) {
                return Number(selected.replace('%', '')) / 100;
            }
        },
    };
    $scope.VaRTerm = {
        selected: '7D',
        options: ['1D', '7D', '1M', '3M', '6M', '1Y'],
        toQueryString: function() {
            let DATE_MAP = {'D': 1, 'M': 30, 'Y': 365};
            let selected = this.selected;
            if (selected) {
                return Number(selected[0] * DATE_MAP[selected[1]]);
            }
        },
    };
    $scope.historyPeriod = {
        selected: '1Y',
        options: ['3M', '6M', '9M', '1Y', '2Y'],
        toQueryString: function() {
            return this.selected;
        },
    };

    function redefineColumns() {
        let found = $scope.gridOptions.columnDefs.find(function(column) {
            return column.field === 'level2';
        });
        found.visible = (maxTreeLevel === 2);
        $scope.gridApi.core.refresh();
    }

    /**
     * maxTreeLevel: 使用全局变量，在每次拿到后台数据进行树结构转化时，更改该变量的值。
     *
     * 背景：单账户和多账户情况下的树层级不一样
     * 例如：单账户下，只有两级：1. 账户名称；2. 债券名称。此时 maxTreeLevel = 1;
     * 例如：多账户下，账户优先选项下，有三级：1. 组合名称；2. 账户名称；3.债券名称。此时 maxTreeLevel = 2;
     *
     * 备注：$$treeLevel从 0 开始计数, level从 1 开始计数
     */
    let maxTreeLevel = 1;
    function toTreeLevel(data) {
        let res = [];
        let level = 0;
        data.$$treeLevel = 0;
        data.level1 = data.account_name;
        res.push(data);
        if (data.hasOwnProperty('accounts')) {
            level = 1;
            data.accounts.forEach(function(account) {
                account.level2 = account.account_name;
                account.$$treeLevel = 1;
                res.push(account);
                if (account.hasOwnProperty('positions')) {
                    level = 2;
                    account.positions.forEach(function(position) {
                        position.$$treeLevel = 2;
                        res.push(position);
                    });
                }
            });
        } else if (data.hasOwnProperty('positions')) {
            data.positions.forEach(function(position) {
                position.$$treeLevel = 1;
                level = 1;
                res.push(position);
            });
        }

        maxTreeLevel = level;
        return res;
    }
    function toggleLevel2Class(state, isLast) {
        if (isLast) {
            return (state === 'expanded') ? 'view-max-tree' : 'view-less-last-tree';
        } else {
            return (state === 'expanded') ? 'view-less-tree' : 'view-all-tree';
        }
    }
    function toggleNoNodeClass(isLast) {
        return isLast ? 'view-nonodemax-tree' : 'view-nonode-tree';
    }
    function getLastNode(node) {
        if (!node.parentRow) return false;
        let brothers = node.parentRow.treeNode.children;
        return brothers.indexOf(node) === brothers.length - 1;
    }

    $scope.getLevel1 = function(row) {
        let parentRow = row.treeNode.parentRow;
        let isLastNode = getLastNode(row.treeNode);
        let isParentLastNode = parentRow ? getLastNode(parentRow.treeNode) : false;
        // 表格树结构**第一列**的样式判断
        switch (row.treeLevel) {
            case 0:
                return '';
            case 1:
                return maxTreeLevel === 1 ? toggleNoNodeClass(isLastNode) : toggleLevel2Class(row.treeNode.state, isLastNode);
            case 2:
                return (maxTreeLevel === 1 || isParentLastNode) ? '' : 'view-middle-tree';
            default:
                return '';
        }
    };

    $scope.getLevel2 = function(row) {
        // 表格树结构**第二列**的样式判断
        let isLastNode = getLastNode(row.treeNode);
        if (row.treeLevel === 2) {
            return toggleNoNodeClass(isLastNode);
        }
    };

    $scope.gridOptions = {
        data: [],
        enableColumnMenus: false,
        enableColumnResizing: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        columnDefs: vaRColumnDef(sortClass),
        showTreeRowHeader: false,
        exporterOlderExcelCompatibility: true,
        exporterFieldCallback: function(grid, row, col, value) {
            return (col.cellFilter) ? $scope.$eval(value + '|' + col.cellFilter) : value;
        },
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerDataChangeCallback(function() {
                $scope.gridApi.treeBase.expandAllRows();
            });
            $scope.gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                $scope.gridApi.treeBase.toggleRowTreeState(row);
            });
        },
    };

    $scope.onExportData = function() {
        $scope.gridOptions.exporterCsvFilename = $scope.getFileName('_组合指标_VaR值_', $scope.accountSelectedDate);
        $scope.exportExcel($scope.gridApi.exporter);
    };

    $scope.$on('vaR tab clicked', function() {
        $scope.VaRQuery.query();
    });
});
