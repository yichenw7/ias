angular.module('ias.utils').factory('GridConfigService', function (user, gridConfigQuery, loginInfo, uiGridConstants) {
    function isAllVisible(columns) {
        return columns.every(function (element) {
            if (['first_val', 'second_val'].indexOf(element.field) > -1) return true;
            return !!element.visible
        });
    }

    function getGridFieldsLayout(columns, types) {
        var layouts = [];
        columns.forEach(function (column, index) {
            var p = types.indexOf(column._type);
            if (p === -1) {
                return;
            }
            if (!layouts[p]) {
                layouts[p] = {
                    name: types[p],
                    fields: []
                }
            }
            layouts[p].fields.push(column);
        });
        return layouts;
    }

    function resetFrom(curColumns, defaultColumns) {
        var newColumns = []
        curColumns.forEach(function (curColumn) {
            var found = defaultColumns.find(function (defColumn) {
                return defColumn.field === curColumn.field;
            });
            if (found) {
                curColumn.visible = found.visible;
            }
            // if (['first_val', 'second_val'].indexOf(curColumn.field) > -1) {
            //     curColumn.visible = true;
            // }
            newColumns.push(curColumn);
        });
        return newColumns;
    }

    return {
        theScope: {},
        gridName: '',
        types: [],
        columns: [],
        layouts: [],
        isSelectAll: false,
        tableMap: {},
        init: function ($scope, gridName) {
            this.tableMap[gridName] = $scope;
            this.restore(gridName);
        },
        initDialog: function(gridName) {
            if (!this.tableMap[gridName]) return;
            this.theScope = this.tableMap[gridName];
            this.gridName = gridName;
            this._initColumnOptions();
        },
        _initColumnOptions: function() {
            this.types = this.theScope.gridOptions.columnTypes;
            this.columns = angular.copy(this.theScope.gridOptions.columnDefs);
            this.layouts = getGridFieldsLayout(this.columns, this.types);
            this.isSelectAll = isAllVisible(this.columns);
        },
        select: function() {
            this.isSelectAll = isAllVisible(this.columns);
        },
        selectAll: function() {
            var isSelectAll = this.isSelectAll;
            this.columns.forEach(function(column) {
                if (['first_val', 'second_val'].indexOf(column.field) > -1) return;
                column.visible = isSelectAll;
            });
        },
        resetSetting: function() {
            var defaultColumns = this.theScope.gridOptions.columnFunc();
            this.columns = resetFrom(this.columns, defaultColumns);
            this.isSelectAll = false;
        },
        reset: function(gridName) {
            if (!this.tableMap[gridName]) return;
            var theScope = this.tableMap[gridName]
            theScope.gridOptions.columnDefs = theScope.gridOptions.columnFunc();
            theScope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        },
        save: function () {
            var theScope = this.theScope;
            theScope.gridOptions.columnDefs = resetFrom(theScope.gridOptions.columnDefs, this.columns);
            theScope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        },
        restore: function (gridName) {
            if (!user.page_config || !user.page_config.config[gridName]) return;

            var theScope = this.tableMap[gridName];
            if (!theScope) return;

            var userColumns = user.page_config.config[gridName].columns;
            var defaultColumns = theScope.gridOptions.columnFunc();
            var result = [];

            userColumns.forEach(function(userColumn) {
                var found = defaultColumns.find(function (defaultColumn) {
                    return userColumn.name === defaultColumn.field;
                });
                if (found) {
                    found.width = userColumn.width;
                    found.visible = userColumn.visible;
                    result.push(found);
                }
            });
            defaultColumns.forEach(function(defaultColumn) {
                var found = result.find(function (column) {
                    return column.field === defaultColumn.field;
                });
                if (!found) {
                    defaultColumn.visible = false;
                    result.push(defaultColumn);
                }
            });
            theScope.gridOptions.columnDefs = result;
        },
        post: function (gridName) {
            if (!this.tableMap[gridName]) return;
            var state = this.tableMap[gridName].gridApi.saveState.save();
            gridConfigQuery.add({
                user_id: user.id,
                page_type: loginInfo.path,
                table_name: gridName,
                config: state,
            }, function success() {
                user.page_config.config[gridName] = state;
            });
        }
    }
});
