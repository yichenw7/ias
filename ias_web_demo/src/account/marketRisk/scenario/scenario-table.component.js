import {
    getColumnDefs,
} from './scenario.helper';
import {
    getLevelClass,
} from '../../../helper/UIGrid';

class ScenarioTableCtrl {
    constructor($scope, uiGridExporterConstants, winStatus) {
        let ctrl = this;
        this.uiGridExporterConstants = uiGridExporterConstants;
        this.winStatus = winStatus;
        this.gridOptions = {
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            showTreeRowHeader: false,
            exporterCsvFilename: '情景分析.csv',
            exporterOlderExcelCompatibility: true,
            exporterFieldCallback: function(grid, row, col, value) {
                return (col.cellFilter) ? $scope.$eval(value + '|' + col.cellFilter) : value;
            },
            columnDefs: getColumnDefs(),
            data: [],
            onRegisterApi: function(gridApi) {
                ctrl.gridApi = gridApi;
                ctrl.gridApi.selection.on.rowSelectionChanged($scope, function(row, event) {
                    ctrl.gridApi.treeBase.toggleRowTreeState(row);
                });
            },
        };

        $scope.getLevelClass = (row, column) => {
            return getLevelClass(row, column, 1);
        };
    }

    $onChanges(changes) {
        if (changes.data && Array.isArray(changes.data.currentValue)) {
            this.gridOptions.data = changes.data.currentValue;
        }
        if (changes.type && changes.type.currentValue) {
            this.gridOptions.columnDefs[1].visible = changes.type.currentValue !== 'default';
        }
    }

    onExport() {
        this.gridOptions.exporterCsvFilename = `${this.winStatus.current_name}_情景分析.csv`;
        this.gridApi.exporter.csvExport(this.uiGridExporterConstants.VISIBLE, this.uiGridExporterConstants.VISIBLE);
    }
}

export default function() {
    return {
        bindings: {
            data: '<',
            type: '<',
        },
        template: `
            <button ng-click="$ctrl.onExport()" style="float:right;margin-right: 10px;margin-top: -30px;">导出</button>
            <div class="grid ias-ui-grid indicator-absolute-page"
                ui-grid="$ctrl.gridOptions"
                ui-grid-resize-columns
                ui-grid-auto-resize
                ui-grid-selection
                ui-grid-tree-view
                ui-grid-exporter>
            </div>
        `,
        controller: ['$scope', 'uiGridExporterConstants', 'winStatus', ScenarioTableCtrl],
    };
}
