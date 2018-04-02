import './template/input_account_selector.less';

const initView = Symbol('initView');
const getList = Symbol('getList');

const REFRESH_TIME = 10 * 1000;

/**
 *
 */
class importViewSelectaccountCtrl {
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
        let count = 0;
        this.timerPromise = this.$interval((ctrl) => {
            count++;

            if (count >= 59) {
                count = 0;
                this[getList]();
            }

            ctrl.timerValue = parseInt(count / 60 * 100);
        }, REFRESH_TIME / 60, 0, true, this);
    }

    /**
     *
     */
    [getList]() {
        this.dataImportService.getTaskList().then((res) => {
            if (!res || !res.data) {
                this.message = `获取导入任务列表失败`;
                return;
            }

            this.taskList = ['done', 'processing', 'waiting'].map((prop) => {
                if (res.data.hasOwnProperty(prop)) {
                    return [...res.data[prop]].map((task) => {
                        task.status = prop;
                        return task;
                    });
                } else {
                    return [];
                }
            }).reduce((arr, item) => {
                if (item.length > 0) arr = arr.concat(item);
                return arr;
            }, []);

            if (this.taskList.length === 0) {
                this.message = `当前用户没有数据导入任务`;
                return;
            }
        }, (res) => {
            this.message = `获取导入任务列表失败`;
        });
    }

    /**
     *
     */
    onSelectedAccountChange() {
        if (!Array.isArray(this.selectedAccount) || !this.selectedAccount[0]) {
            return;
        }

        this.ngModelCtrl.$viewValue = this.selectedAccount[0];
        this.ngModelCtrl.$commitViewValue();

        this[getList]();
    }

    /**
      *
      */
    $onDestroy() {
        this.$interval.cancel(this.timerPromise);
    }
}

let component = () => {
    return {
        require: {
            ngModelCtrl: '?ngModel',
        },
        template: require('./template/import_view_selectaccount.html'),
        bindings: {
            theme: '@mdTheme',
            ngModel: '<',
        },
        controller: ['$scope', '$interval', 'dataImportService', 'componentService', importViewSelectaccountCtrl],
    };
};

export default component;
