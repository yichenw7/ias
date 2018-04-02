/**
 * 自定义的 UI-GRID 首列数结构的展开收起
 * 与默认的区别在于，只显示 $$treeLevel === 0 的展开收起图标
 * @see: https://github.com/angular-ui/ui-grid/tree/master/src/features/tree-base/templates
 * @return {Object} 返回树节点模板
 */
export function getTreeColumn() {
    return {
        field: '_',
        displayName: '',
        width: '45',
        cellTemplate: `
            <div class="ui-grid-cell-contents">
                <div class="ui-grid-tree-base-row-header-buttons ui-grid-tree-base-header" ng-class="{'ui-grid-tree-base-header': row.treeLevel > -1 }">
                    <i class="ui-grid-icon-minus-squared"
                        ng-if="row.treeLevel === 0"
                        ng-class="{'ui-grid-icon-minus-squared': row.treeNode.state === 'expanded', 'ui-grid-icon-plus-squared': row.treeNode.state === 'collapsed'}">
                    </i>
                </div>
            </div>
        `,
        headerCellTemplate: `
            <div class="ui-grid-cell-contents">
                <ui-grid-tree-base-expand-all-buttons></ui-grid-tree-base-expand-all-buttons>
            </div>
        `,
        enableColumnMoving: false,
        enableColumnResizing: false,
        exporterSuppressExport: true,
    };
}

export const codeTemplate = `
    <a href="" style="line-height: 30px" class="tbody-special-font"
        ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">
        {{row.entity.code}}
    </a>
`;

export const nameTemplate = `
    <a href="" style="line-height: 30px" class="tbody-special-font"
        ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">
        {{row.entity.name}}
    </a>
`;

/**
 * UIGrid 树结构，树结构根据 row.treeLevel 来判断样式
 * 根节点的 treeLevel === 0
 * 传入 行 和 列 确定此单元格的树结构样式class
 * @param {Object} row ui-grid 行对象
 * @param {String} column 需要确定样式的列，可选值为 column1 | column2。 即第一列或者第二列
 * @param {Number} maxTreeLevel 树结构最大深度，可选值为 1 | 2。即一级树和二级树结构
 * @return {String} 单元格的样式
 */
export function getLevelClass(row, column, maxTreeLevel) {
    if (maxTreeLevel > 2 || maxTreeLevel < 1) return '';
    // 若 row 为根节点，则不需要任何样式
    // 我们的根节点通过插入 getTreeColumn() 作为第 0 列来确定样式
    if (row.treeLevel <= 0) return '';

    // row 在同级节点中是否为最后一列
    const isLast = isLastRow(row);
    // row 的父辈在父辈节点中是否为最后一列
    const isParentLast = isLastRow(row.treeNode.parentRow);

    if (maxTreeLevel === 1) {
        return toggleLastLevelClass(isLast);
    } else {
        if (row.treeLevel === 1 && column === 'column2') return '';
        if (row.treeLevel === 2 && column === 'column1') {
            return isParentLast ? '' : 'view-middle-tree';
        }

        const hasChildren = row.treeNode.children.length > 0;
        return hasChildren ? toggleMidLevelClass(row.treeNode.state, isLast) : toggleLastLevelClass(isLast);
    }
}

/**
 * 判断传入的 row 是否为同级树结构元素的最后一个
 * @param {Object} row ui-grid 行元素
 * @return {Boolean} 返回该行是否是同级兄弟节点的最后一个
 */
export function isLastRow(row) {
    if (!row) return false;
    const treeNode = row.treeNode;
    if (!treeNode.parentRow) return false;
    const brothers = treeNode.parentRow.treeNode.children;
    return brothers.indexOf(treeNode) === brothers.length - 1;
}

/**
 * 切换包含子节点的当前 ui-grid 行的树结构状态
 * @param {String} state ui-grid当前row的收起展开状态，可选值为：expanded | collapsed
 * @param {Boolean} isLast 是否为同级节点的最后一个
 * @return {String} 返回当前节点的树结构样式类名
 */
export function toggleMidLevelClass(state, isLast) {
    if (isLast) {
        return (state === 'expanded') ? 'view-max-tree' : 'view-less-last-tree';
    } else {
        return (state === 'expanded') ? 'view-less-tree' : 'view-all-tree';
    }
}

/**
 * 切换最后一级树结构的 ui-grid 行的树结构状态
 * @param {Boolean} isLast 是否为同级节点的最后一个
 * @return {String} 返回当前节点的树结构样式类名
 */
export function toggleLastLevelClass(isLast) {
    return isLast ? 'view-nonodemax-tree' : 'view-nonode-tree';
}

export function _numberFunc(num1, num2, direction) {
    if (!num1 && !num2) {
        return 0;
    } else if (!num1) {
        return (direction == 'asc') ? 1 : -1;
    } else if (!num2) {
        return (direction == 'asc') ? -1 : 1;
    }
    return num1 - num2;
}

export function naturalFunc(str1, str2, direction) {
    let nulls = handleNulls(str1, str2, direction);
    if (nulls != null) {
        return nulls;
    }

    return str1.localeCompare(str2);
}
function handleNulls(str1, str2, direction) {
    if ((str1 == null || str1.length == 0 || str1 == '--') && (str2 == null || str2.length == 0 || str2 == '--')) {
        return 0;
    } else if (str1 == null || str1.length == 0 || str1 == '--') {
        if (direction == 'asc') { // 升序
            return 1;
        } else { // 降序
            return -1;
        }
    } else if (str2 == null || str2.length == 0 || str2 == '--') {
        if (direction == 'asc') { // 升序
            return -1;
        } else { // 降序
            return 1;
        }
    }
    return null;
}
