import angular from 'angular';

import './template/import_view_tasklist.less';

import { taskStatus } from './const';

const initView = Symbol('initView');
const getList = Symbol('getList');
const buildTaskList = Symbol('buildTaskList');
const applyFilter = Symbol('applyFilter');
const updateTask = Symbol('updateTask');

const REFRESH_TIME = 10 * 1000;

const dataDefine = {
    taskStatus: taskStatus,

    mockData: {
        processing: [
            { 'import_result_status': 'warn', 'user_id': '407bd9dc924411e7bbc0382c4a61272c', 'request_time': '2017-09-20 11:19:42', 'file_name': '0929 \u8bc1\u5238\u6295\u8d44\u57fa\u91d1\u4f30\u503c\u8868_\u5929\u5f18-\u4e1c\u5434\u5229\u6cfd3\u53f7\u8d44\u4ea7\u7ba1\u7406\u8ba1\u5212.20161026141829806196.20170920111942842941.xls', 'company_id': 'ce08b84edc9411e6aef40050568c5fd9', 'account_ids': ['1917851c924911e7bea8382c4a61272c'], 'id': '001', 'import_time': '2017-09-20 11:19:45' },
            { 'import_result_status': 'warn', 'user_id': '407bd9dc924411e7bbc0382c4a61272c', 'request_time': '2017-09-20 11:19:43', 'file_name': '1031 67B650\u59d4\u6258\u8d44\u4ea7\u8d44\u4ea7\u4f30\u503c\u8868 (\u671f\u8d27 \u80a1\u7968).20170920111942884050.xls', 'company_id': 'ce08b84edc9411e6aef40050568c5fd9', 'account_ids': ['1917851c924911e7bea8382c4a61272c'], 'id': '002', 'import_time': '2017-09-20 11:19:48' },
            { 'import_result_status': 'warn', 'user_id': '407bd9dc924411e7bbc0382c4a61272c', 'request_time': '2017-09-20 11:52:57', 'file_name': '0929 \u8bc1\u5238\u6295\u8d44\u57fa\u91d1\u4f30\u503c\u8868_\u5929\u5f18-\u4e1c\u5434\u5229\u6cfd3\u53f7\u8d44\u4ea7\u7ba1\u7406\u8ba1\u5212.20161026141829806196.20170920115257648283.xls', 'company_id': 'ce08b84edc9411e6aef40050568c5fd9', 'account_ids': ['1917851c924911e7bea8382c4a61272c'], 'id': '003', 'import_time': '2017-09-20 11:53:02' },
        ],
        waiting: [
            { 'import_result_status': 'warn', 'user_id': '407bd9dc924411e7bbc0382c4a61272c', 'request_time': '2017-09-20 11:19:42', 'file_name': '0929 \u8bc1\u5238\u6295\u8d44\u57fa\u91d1\u4f30\u503c\u8868_\u5929\u5f18-\u4e1c\u5434\u5229\u6cfd3\u53f7\u8d44\u4ea7\u7ba1\u7406\u8ba1\u5212.20161026141829806196.20170920111942842941.xls', 'company_id': 'ce08b84edc9411e6aef40050568c5fd9', 'account_ids': ['1917851c924911e7bea8382c4a61272c'], 'id': '004', 'import_time': '2017-09-20 11:19:45' },
            { 'import_result_status': 'warn', 'user_id': '407bd9dc924411e7bbc0382c4a61272c', 'request_time': '2017-09-20 11:19:43', 'file_name': '1031 67B650\u59d4\u6258\u8d44\u4ea7\u8d44\u4ea7\u4f30\u503c\u8868 (\u671f\u8d27 \u80a1\u7968).20170920111942884050.xls', 'company_id': 'ce08b84edc9411e6aef40050568c5fd9', 'account_ids': ['1917851c924911e7bea8382c4a61272c'], 'id': '005', 'import_time': '2017-09-20 11:19:48' },
            { 'import_result_status': 'warn', 'user_id': '407bd9dc924411e7bbc0382c4a61272c', 'request_time': '2017-09-20 11:52:57', 'file_name': '0929 \u8bc1\u5238\u6295\u8d44\u57fa\u91d1\u4f30\u503c\u8868_\u5929\u5f18-\u4e1c\u5434\u5229\u6cfd3\u53f7\u8d44\u4ea7\u7ba1\u7406\u8ba1\u5212.20161026141829806196.20170920115257648283.xls', 'company_id': 'ce08b84edc9411e6aef40050568c5fd9', 'account_ids': ['1917851c924911e7bea8382c4a61272c'], 'id': '006', 'import_time': '2017-09-20 11:53:02' },
        ],
    },
};

/**
 *
 */
class importViewTasklistCtrl {
    /**
     *
     * @param {any} $scope
     * @param {any} $interval
     * @param {any} dataImportService
     * @param {any} componentService
     */
    constructor($scope, $interval, dataImportService, componentService) {
        this.$interval = $interval;

        this.dataImportService = dataImportService;

        this.componentService = componentService;

        this[initView]();
    }

    /**
     *
     */
    [initView]() {
        console.debug('importViewTasklistCtrl initView');

        this.vm = {
            statusItemsource: dataDefine.taskStatus,
            isAutoRefresh: true,
        };

        let count = 0;
        this.timerPromise = this.$interval((ctrl) => {
            count++;

            if (count >= 59) {
                count = 0;
                if (this.vm.isAutoRefresh) this[getList]();
            }

            ctrl.timerValue = parseInt(count / 60 * 100);
        }, REFRESH_TIME / 60, 0, true, this);
        this[getList]();
    }

    /**
     *
     * @param {any} defineMap
     * @param {any} data
     * @return {array}
     */
    [buildTaskList](defineMap, data) {
        if (!data || !defineMap) return [];

        return [...defineMap].map(([key, value]) => {
            if (data.hasOwnProperty(key)) {
                let source = ['done', 'waiting'].indexOf(key) < 0 ? [...data[key]] : [...data[key].data];
                return source.map((task) => {
                    if (task.import_result_status === 'warn') {
                        task.status = dataDefine.taskStatus.WARN;
                    } else {
                        task.status = value;
                    }

                    return task;
                });
            } else {
                return [];
            }
        }).reduce((arr, item) => {
            if (item.length > 0) arr = arr.concat(item);
            return arr;
        }, []);
    }

    /**
     *
     * @param {any} taskList
     * @return {array}
     */
    [applyFilter](taskList) {
        if (!this.vm || !Array.isArray(taskList)) return taskList;

        if (Array.isArray(this.vm.account) && this.vm.account.length > 0) {
            taskList = taskList.filter((task) => task.account_ids.some((accountIdA) => this.vm.account.find((accountB) => accountIdA === accountB.id)));
        }

        if (this.vm.status && this.vm.status !== undefined) {
            taskList = taskList.filter((task) => task.status.value === this.vm.status.value);
        }

        if (typeof this.vm.accountSearchText === 'string' && this.vm.accountSearchText.length > 0) {
            taskList = taskList.filter((task) => task.file_name.indexOf(this.vm.accountSearchText) > -1);
        }

        return taskList;
    }

    /**
     *
     * @param {any} dto
     * @param {any} task
     */
    [updateTask](dto, task) {
        task.$isBusy = true;

        this.dataImportService.updateTask(dto).then((res) => {
            task.$isBusy = false;
            [getList]();
        }, (res) => {
            task.$isBusy = false;
        });
    }

    /**
     *
     */
    [getList]() {
        this.dataImportService.getTaskList().then((res) => {
            if (!res || !res.data) {
                this.taskListMessage = `获取导入任务列表失败`;
                this.completedListMessage = `获取导入任务列表失败`;
                return;
            }

            this.taskList = this[buildTaskList](new Map([
                ['processing', dataDefine.taskStatus.UPLOAD_SUCCEED],
            ]), res.data);

            let completedList = this[buildTaskList](new Map([
                ['waiting', dataDefine.taskStatus.WAITING],
                ['done', dataDefine.taskStatus.IMPORT_SUCCEED],
            ]), res.data);

            this.completedList = this[applyFilter](completedList);

            this.taskListMessage = this.taskList.length === 0 ? `当前用户没有数据导入任务` : undefined;
            this.completedListMessage = completedList.length === 0 ? `当前用户没有已完成的导入任务` : undefined;
        }, (res) => {
            this.taskListMessage = `获取导入任务列表失败`;
            this.completedListMessage = `获取导入任务列表失败`;
        });
    }

    /**
      *
      */
    $onDestroy() {
        if (this.timerPromise) this.$interval.cancel(this.timerPromise);
    }

    /**
     *
     * @param {any} event
     */
    onClickSearch(event) {
        this[getList]();
    }

    /**
     *
     * @param {any} event
     */
    onClickTable(event) {
        if (!event || !event.target) return;

        let scope = angular.element(event.target).scope();

        if (!scope) return;

        let target = event.target;

        while (target.parentElement && target.nodeName !== 'BUTTON') target = target.parentElement;

        switch (target.getAttribute('tag')) {
            case 'jump_queue_top': {
                this[updateTask]({
                    rearrange_type: 'jump_queue',
                    task_id: scope.task.id,
                    jump_to: 0,
                }, scope.task);
                break;
            }
            case 'remove': {
                this[updateTask]({
                    rearrange_type: 'remove',
                    task_id: scope.task.id,
                }, scope.task);
                break;
            }
            default: break;
        }
    }
}

let component = () => {
    return {
        transclude: true,
        template: require('./template/import_view_tasklist.html'),
        bindings: {
            theme: '@mdTheme',

            selectedAccount: '<',
        },
        controller: ['$scope', '$interval', 'dataImportService', 'componentService', importViewTasklistCtrl],
    };
};

export default component;
