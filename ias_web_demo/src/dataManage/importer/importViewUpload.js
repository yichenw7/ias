import './template/import_view_upload.less';

import { $injector as importTemplateCtrl, Template as dialogTemplate } from '../dialog/importTemplateCtrl';

import { taskStatus } from './const';

import angular from 'angular';

const initView = Symbol('initView');
const initUploader = Symbol('initUploader');
const buildUploader = Symbol('buildUploader');

const dataDefine = {
    taskStatus: taskStatus,

    coverMode: [
        { displayName: '完全替换', value: 'cover'},
        { displayName: '增量更新', value: 'inc' },
    ],
};

class importViewUploadCtrl {
    constructor($scope, $mdPanel, dataImportService, commonService, componentService, FileUploader, apiAddress, user) {
        this.$scope = $scope;

        this.user = user;

        this.$mdPanel = $mdPanel;

        this.dataImportService = dataImportService;

        this.commonService = commonService;

        this.componentService = componentService;


        this.uploader = new FileUploader({
            url: apiAddress + '/upload',
            autoUpload: false,
        });

        this[initView]();
    }

    [initView]() {
        this.coverModeItemSource = dataDefine.coverMode;

        this.selectCoverMode = 'cover';

        this[initUploader]();

        this.$viewBusy = false;
    }

    [initUploader]() {
        let ctrl = this;

        this.uploader.onBeforeUploadItem = (item) => {
            item.enctype = 'multipart/form-data';
            item.formData = [{
                'company_id': this.user.company_id,
                'user': this.user.name,
                'index': item.index,
            }];
        };

        this.uploader.onSuccessItem = (item, response, status, headers) => {
            let task = ctrl.uploadTask.find((task) => task.file.name === item.file.name);
            if (task) task.status = dataDefine.taskStatus.UPLOAD_SUCCEED;

            console.debug('importHomePageCtrl.uploader.onSuccessItem');

            let dto = {
                accountList: ctrl.selectedAccount.map((item) => item.id),
                coverMode: ctrl.selectCoverMode,
                fileName: response,
            };

            ctrl.dataImportService.addTask(dto).then((res) => {
                if (res && res.msg === 'OK') {
                    if (task) task.status = dataDefine.taskStatus.ADDTASK_SUCCEED;
                    ctrl.uploadTask = ctrl.uploadTask.filter((task) => task.file.name !== item.file.name);
                } else {
                    if (task) task.status = dataDefine.taskStatus.ADDTASK_FAILED;
                }

                if (ctrl.uploadTask.every((task) => Math.abs(task.status.value) >= dataDefine.taskStatus.ADDTASK_SUCCEED.value)) {
                    this.$viewBusy = false;
                    this.uploader.clearQueue();
                }
            }, (res) => {
                if (task) task.status = dataDefine.taskStatus.ADDTASK_FAILED;

                if (ctrl.uploadTask.every((task) => Math.abs(task.status.value) >= dataDefine.taskStatus.ADDTASK_SUCCEED.value)) {
                    this.$viewBusy = false;
                    this.uploader.clearQueue();
                }
            });
        };

        this.uploader.onErrorItem = (item, response, status, headers) => {
            let task = ctrl.uploadTask.find((task) => task.file.name === item.file.name);
            if (task) task.status = dataDefine.taskStatus.UPLOAD_FAILED;

            console.debug('importHomePageCtrl.uploader.onErrorItem');
        };

        this.uploader.onCancelItem = (item, response, status, headers) => {
            console.debug('importHomePageCtrl.uploader.onErrorItem');
        };

        this.uploader.onCompleteItem = (fileItem, response, status, headers) => {
            console.info('importHomePageCtrl.uploader.onCompleteItem', fileItem, response, status, headers);
        };

        this.uploader.onCompleteAll = () => {
            console.info('importHomePageCtrl.uploader.onCompleteAll');
        };
    }

    [buildUploader](selectedFiles) {
        if (!selectedFiles || selectedFiles.length === 0) {
            return;
        }

        return selectedFiles.map((file) => {
            return {
                file: file,
                account: this.selectedAccount,
                status: dataDefine.taskStatus.PADDING,
            };
        });
    }

    $onDestroy() {
        this.uploader.destroy();
    }

    onSelectedFilesChange(files) {
        if (!files) return;

        let selectedFiles = [];

        let hasDuplicatedFile = false;
        if (Array.isArray(this.uploadTask)) {
            selectedFiles = [...files].map((fileA) => {
                hasDuplicatedFile = this.uploadTask.some((task) => task.file.name === fileA.name);
                return hasDuplicatedFile ? undefined : fileA;
            }).filter((file) => file);
        } else {
            this.uploadTask = [];
            selectedFiles = [...files];
            hasDuplicatedFile = false;
        }

        if (hasDuplicatedFile) {
            this.componentService.openErrorDialog({ message: '所选文件已在列表中' });
        } else {
            console.debug(selectedFiles);
            this.uploadTask = Array.concat(this.uploadTask, this[buildUploader](selectedFiles));
        }

        this.commonService.safeApply(this.$scope);

        try {
            angular.element('import-view-upload #file-input').val(undefined);
        } catch (e) {
            return;
        }
    }

    onSelectedAccountChange() {
        if (!Array.isArray(this.selectedAccount) || !this.selectedAccount[0]) {
            return;
        }

        this.ngModelCtrl.$viewValue = Array.concat([], this.selectedAccount);
        this.ngModelCtrl.$commitViewValue();
    }

    doUpload($event) {
        this.uploader.clearQueue();
        if (!this.selectedAccount || !Array.isArray(this.uploadTask) || this.uploadTask.length === 0) return;

        this.uploadTask.forEach((task) => {
            this.uploader.addToQueue(task.file);
        });

        this.$viewBusy = true;


        this.uploader.uploadAll();
    }

    onClickTable(event) {
        if (!event || !event.target) return;

        let scope = angular.element(event.target).scope();

        if (!scope) return;

        let target = event.target;

        while (target.parentElement && target.nodeName !== 'BUTTON') target = target.parentElement;

        switch (target.getAttribute('tag')) {
            case 'jump_queue_top': {
                let task = scope.task;
                this.uploadTask = [task].concat(this.uploadTask.filter((item) => item != task));
                break;
            }
            case 'remove': {
                let task = scope.task;
                this.uploadTask = this.uploadTask.filter((item) => item != task);
                break;
            }
            default: break;
        }
    }

    openTemplateDialog(event) {
        let position = this.$mdPanel.newPanelPosition()
            .absolute()
            .center();

        let panelAnimation = this.$mdPanel.newPanelAnimation()
            .withAnimation(this.$mdPanel.animation.SCALE)
            .openFrom(event.target)
            .closeTo(event.target);

        let config = {
            attachTo: angular.element(document.body),
            targetEvent: event,
            controller: importTemplateCtrl,
            controllerAs: '$ctrl',
            panelClass: 'download-import-template-dialog',
            locals: {
                dialogTitle: '',
            },
            bindToController: true,
            template: dialogTemplate,
            hasBackdrop: true,
            position: position,
            animation: panelAnimation,
            trapFocus: true,
            clickOutsideToClose: true,
        };

        this.$mdPanel.open(config);
    }

    enableImport() {
        return !this.$viewBusy && this.selectedAccount && this.selectedAccount.length > 0 && Array.isArray(this.uploadTask) && this.uploadTask.length > 0;
    }
}

let component = () => {
    return {
        require: {
            ngModelCtrl: '?ngModel',
        },
        transclude: true,
        template: require('./template/import_view_upload.html'),
        bindings: {
            theme: '@mdTheme',
            ngModel: '<',
        },
        controller: ['$scope', '$mdPanel', 'dataImportService', 'commonService', 'componentService', 'FileUploader', 'apiAddress', 'user', importViewUploadCtrl],
    };
};

export default component;
