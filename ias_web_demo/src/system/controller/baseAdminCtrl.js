import angular from 'angular';

// 机构列表
const initView = Symbol('initView');
const initUiGrid = Symbol('initUiGrid');
const tableActionMap = Symbol('tableActionMap');

/**
 * Admin页面基类，包含uigrid基本配置，以及uigrid行级事件托管分发。
 */
export class BaseAdminCtrl {
    /**
     *
     */
    constructor() {
        this[initView]();

        this[initUiGrid]();
    }

    /**
     *
     */
    [initView]() {
        this.INTERNAL_COMPANY = 'sumscope';
    }

    /**
     *
     */
    [initUiGrid]() {
        this.gridOptions = {
            enableColumnMenus: false,
            enableColumnResizing: true,
            enableFiltering: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            exporterOlderExcelCompatibility: true,
        };
    }

    /**
     *
     * @param {any} event
     */
    onClickTable(event) {
        if (!event || !event.target) return;

        let item = angular.element(event.target).scope();
        let row = undefined;

        while (item.$parent && !item.row) item = item.$parent;
        if (item && item.row) {
            row = item.row;
            item = item.row.entity;
        } else return;

        let target = event.target;

        while (target.parentElement && target.nodeName !== 'BUTTON') {
            target = target.parentElement;
        }

        let actionHandler = undefined;

        let actionName = target.getAttribute('tag');

        if (this[tableActionMap].has(actionName)) {
            actionHandler = this[tableActionMap].get(actionName);
        } else {
            actionHandler = this[tableActionMap].get('default');
        }

        if (actionHandler && actionHandler.apply) {
            event.stopPropagation();
            actionHandler.apply(this, [row.entity]);
        } else {
            console.warn(`No handler registed for action "${actionName}"`);
        }
    }

    /**
     *
     * @param {any} key
     * @param {any} handler
     */
    handleTableAction(key, handler) {
        if (!this[tableActionMap]) {
            this[tableActionMap] = new Map();
        }

        if (!this[tableActionMap].has(key)) {
            console.warn(`No action defined for name "${key}"`);
        }

        this[tableActionMap].set(key, handler);
    }
}

/**
 * Decorator
 * @param {any} actionName
 * @return {function}
 */
export function tableAction(actionName) {
    return (target, descriptor) => {
        if (target.hasOwnProperty(descriptor)) {
            target.handleTableAction(actionName, target[descriptor]);
        }
    };
};
