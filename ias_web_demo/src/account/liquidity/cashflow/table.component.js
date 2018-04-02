import Quoteboard from './../../../helper/Quoteboard';
import { getLevelClass } from './../../../helper/UIGrid';
import {
    cashflowFilter,
    updateTotal,
    getCashflowTypes,
    getColumnDefs,
    getExportFilename,
} from './cashflow.helper';

angular
    .module('ias.account')
    .component('cashflowTable', {
        templateUrl: 'src/account/liquidity/cashflow/table.template.html',
        bindings: {
            accountLists: '<'
        },
        controller: function($scope, datetimePickerConfig, winStatus, Cashflow, user, accountConstant, authorityControl, uiGridExporterConstants) {
            const ctrl = this;
            ctrl.datetimePickerConfig = datetimePickerConfig;
            ctrl.data = [];

            // 日期区间
            ctrl.dateRange = {
                start: '',
                end: '',
                clear: function() {
                    this.start = '';
                    this.end = '';
                    this.handleChanged();
                },
                handleChanged: function() {
                    const start = this.start;
                    const end = this.end;
                    if (end && start > end) {
                        this.start = end;
                        this.end = start;
                    }
                    toGridData();
                }
            };

            // 频率
            ctrl.period = {
                groups: [
                    { label: '笔', value: 0 },
                    { label: '日', value: 1 },
                    { label: '月', value: 2 },
                ],
                selected: 0,
                handleChanged: function() {
                    toGridData();
                }
            };

            // 类型
            ctrl.desc = {
                types: [],
                selected: '全部资产',
                handleChanged: () => {
                    toGridData();
                }
            };

            ctrl.code = {
                lists: [],
                selected: '',
                handleChanged: (selected) => {
                    ctrl.code.selected = selected ? selected.originalObject.code : '';
                    toGridData();
                }
            }

            // 统计
            ctrl.total = {
                count: 0,
                piaoxi: 0,
                huanben: 0,
                out: 0,
                in: 0,
            };

            ctrl.onExport = () => {
                ctrl.gridOptions.exporterCsvFilename = `${winStatus.current_name}_现金表_.csv`;
                // $scope.exportExcel($scope.gridApi.exporter);
                $scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE)
            };

            ctrl.gridOptions = {
                data: [],
                enableColumnMenus: false,
                enableColumnResizing: true,
                enableFullRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                exporterOlderExcelCompatibility: true,
                showTreeRowHeader: false,
                columnDefs: getColumnDefs(),
                onRegisterApi: (gridApi) => {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.registerDataChangeCallback(function () {
                        $scope.gridApi.treeBase.collapseAllRows();
                    });
                    $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        $scope.gridApi.treeBase.toggleRowTreeState(row);
                    });
                }
            };

            $scope.OpenBondDetailPage = Quoteboard.openBondDetail;
            $scope.getLevelClass = (row, column) => {
                return getLevelClass(row, column, ctrl.period.selected)
            }

            function calcuDaily(data, level) {
                const dailyCache = {};
                data.forEach(item => {
                    let daily = item.execute_date;
                    dailyCache[daily] = dailyCache[daily] || {
                        in: 0,
                        out: 0,
                        amount: 0,
                        execute_date: daily,
                        $$treeLevel: level - 1,
                    };
                    dailyCache[daily].in += item.in;
                    dailyCache[daily].out += item.out;
                    dailyCache[daily].amount += item.amount;
                });
                return dailyCache;
            }

            function calcuMonth(dailyData, level) {
                const monthCache = {};
                Object.keys(dailyData).forEach(date => {
                    // 截取 '2017-01-01' 为 '2017-01';
                    let month = date.substring(0, 7);
                    monthCache[month] = monthCache[month] || {
                        in: 0,
                        out: 0,
                        amount: 0,
                        month: month,
                        $$treeLevel: level - 2,
                    };
                    monthCache[month].in += dailyData[date].in;
                    monthCache[month].out += dailyData[date].out;
                    monthCache[month].amount += dailyData[date].amount;
                });
                return monthCache;
            }

            function toTreeData(data, level) {
                if (!data) return;
                if (level === 0) return data;

                const dailyCache = calcuDaily(data, level);
                const monthCache = (level === 2) ? calcuMonth(dailyCache, level) : {};

                const res = [];
                for (let i = 0; i < data.length; i++) {
                    const item = angular.copy(data[i]);
                    // HACK：需要情况原有的 execute_date 字段
                    item.daily = item.execute_date;
                    item.execute_date = null;
                    item.$$treeLevel = level;

                    if (level === 2) {
                        if (i === 0 || item.daily.substring(0, 7) !== res[res.length - 1].daily.substring(0, 7)) {
                            res.push(monthCache[item.daily.substring(0, 7)]);
                        }
                    }

                    if (i === 0 || item.daily !== res[res.length - 1].daily) {
                        res.push(dailyCache[item.daily]);
                    }
                    res.push(item);
                }
                return res;
            }

            function toGridData() {
                let data = cashflowFilter(ctrl.data, ctrl.dateRange.start, ctrl.dateRange.end, ctrl.desc.selected, ctrl.code.selected);
                ctrl.total = updateTotal(data);
                ctrl.gridOptions.data = toTreeData(data, ctrl.period.selected);
                ctrl.gridOptions.columnDefs[1].visible = (ctrl.period.selected === 2);
            }

            function post() {
                if (winStatus.cur_account_list.length === 0) return;

                Cashflow.post({
                    account_group_id: accountConstant.group_id,
                    company_id: user.company_id,
                    account_list: authorityControl.getAccountGroupMember(ctrl.accountLists)
                }, function success(response) {
                    if (response.code === '0000') {
                        ctrl.data = response.data;
                        const cashflowInfo = getCashflowTypes(ctrl.data);
                        ctrl.desc.types = ['全部资产'].concat(cashflowInfo.desc);
                        ctrl.code.lists = cashflowInfo.code;
                        toGridData();
                    } else {
                        console.warn("现金流获取失败！");
                    }
                }, function failure() {
                    console.warn("现金流获取失败！");
                });
            }

            ctrl.$onChanges = (changes) => {
                if (changes.accountLists) {
                    post();
                }
            }
        }
    });
