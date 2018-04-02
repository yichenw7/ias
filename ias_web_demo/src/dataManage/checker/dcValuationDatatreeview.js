import angular from 'angular';

const initView = Symbol('initView');
const loadValuationDetail = Symbol('loadValuationDetail');

const dataDefine = {
    uigrid: {
        column: [
            { minWidth: '100', field: 'father_course_code', displayName: '估值大类' },
            { minWidth: '100', field: 'course_code', type: 'string', displayName: '科目代码' },
            { minWidth: '100', field: 'course_name', displayName: '科目名称' },
            { minWidth: '100', field: 'val_value', displayName: '估值数据' },
            { minWidth: '100', field: 'pos_code', type: 'string', displayName: '持仓代码' },
            { minWidth: '100', field: 'pos_name', displayName: '持仓名称' },
            { minWidth: '100', field: 'pos_value', displayName: '持仓数据' },
            { minWidth: '100', field: 'value_diff', displayName: '差异' },
        ],
    },
};

class dcValuationDatatreeviewCtrl {
    constructor($scope, dataCheckService, uiGridService, componentService) {
        this.$scope = $scope;

        this.dataCheckService = dataCheckService;

        this.uiGridService = uiGridService;
        this.componentService = componentService;

        this[initView]();
    }

    [initView]() {
        if (this.valuation) {
            this[loadValuationDetail](this.valuation);
        }
    }

    [loadValuationDetail](valuation) {
        let dto = {
            asset_val_id: valuation.asset_val_id,
        };

        this.dataCheckService.getValDetail(dto).then((res) => {
            if (!angular.isArray(res)) {
                this.componentService.openErrorDialog({ message: '没有数据' });
                return;
            }

            this.valuationDetail = angular.copy(res);

            this.issueDataCount = this.valuationDetail.reduce((count, item) => {
                if ((+item.value_diff) !== 0) count++;
                return count;
            }, 0);

            this.valuationDetailTreeView = this.componentService.buildMdListTreeView(this.valuationDetail, { groupBy: 'father_course_code' }).map((node) => {
                // 字段求和
                // ['val_value', 'pos_value', 'value_diff'].forEach(prop => {
                //    node[prop] = node.$$childNodes.reduce((sum, value) => sum + ((+value[prop]) ? (+value[prop]) : sum), 0);
                // });

                if (angular.isArray(node.$$childNodes)) {
                    let fatherNode = node.$$childNodes.find((child) => child.course_code === node.father_course_code && child.pos_code === node.father_course_code);

                    if (fatherNode) {
                        node.$$childNodes = node.$$childNodes.filter((child) => child.course_code !== node.father_course_code || child.pos_code !== node.father_course_code);
                        node = Object.assign(node, fatherNode);
                    }
                }

                return node;
            });
        }, (res) => {
            this.componentService.openErrorDialog({ message: '没有数据' });
        });
    }

    $onChanges(changesObj) {
        if (!changesObj) return;

        if (changesObj.valuation && changesObj.valuation.currentValue) {
            if (!this.valuation.date) {
                this.dateOfSelectedDatas = '';
                this.valuationDetailTreeView = [];
                return;
            }

            this.dateOfSelectedDatas = this.valuation.date;
            this[loadValuationDetail](this.valuation);
        }
    }

    onClickTable(event) {
        if (!event) return;

        let target = event.target;

        if (!target) return;

        let scope = angular.element(target).scope();

        if (!scope) return;

        if (scope.hasOwnProperty('parentNode')) {
            scope.parentNode.$$isCollapse = scope.parentNode.$$isCollapse ? false : true;
        } else if (scope.hasOwnProperty('child')) {
            this.selectedValuationDetail = scope.child;
        }
    }

    onExportData() {
        // if (!angular.isArray(this.valuationDetail)) return [];

        // return this.valuationDetail.map(item => dataDefine.uigrid.column.map(column => item[column.field]));

        if (!angular.isArray(this.valuationDetailTreeView)) return [];

        let list = this.valuationDetailTreeView.reduce((result, node) => result.concat(node).concat(node.$$childNodes), []);
        list.forEach((item) => {
            if (!item.$$childNodes) delete item['father_course_code'];
        });

        return list.map((item) => dataDefine.uigrid.column.map((column) => item[column.field]));
    }

    getCsvHeader() {
        return dataDefine.uigrid.column.map((item) => item.displayName);
    }

    onClickTreeViewCollapseAll(treeData) {
        this.componentService.treeViewCollapseAll(treeData);
    }

    onClickTreeViewExpandAll(treeData) {
        this.componentService.treeViewExpandAll(treeData);
    }
}

let dcValuationDatatreeview = () => {
    return {
        template: require('./template/dc_valuation_datatreeview.html'),
        bindings: {
            theme: '@mdTheme',
            valuation: '<',
        },
        controller: ['$scope', 'dataCheckService', 'uiGridService', 'componentService', dcValuationDatatreeviewCtrl],
    };
};

export default dcValuationDatatreeview;
