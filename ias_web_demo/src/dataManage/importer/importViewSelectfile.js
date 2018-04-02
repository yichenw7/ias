import angular from 'angular';

import './template/import_view_selectfile.less';

const initView = Symbol('initView');
const updateModel = Symbol('updateModel');

/**
 *
 */
class importViewSelectfileCtrl {
    /**
     *
     * @param {any} $scope
     * @param {any} FileUploader
     * @param {any} commonService
     * @param {any} componentService
     * @param {any} user
     * @param {any} apiAddress
     */
    constructor($scope, FileUploader, commonService, componentService, user, apiAddress) {
        this.$scope = $scope;

        this.commonService = commonService;
        this.componentService = componentService;

        this.user = user;

        // this.uploader = new FileUploader({
        //    url: apiAddress + '/upload',
        //    autoUpload: false,
        // });

        this[initView]();
    }

    /**
     *
     */
    [initView]() {
        this.selectedFiles = [];

        this.uploadInfo = [];

        // this.uploader.onBeforeUploadItem = function(item) {
        //    item.enctype = 'multipart/form-data';
        //    item.formData = [{
        //        'company_id': this.user.company_id,
        //        'user': this.user.name,
        //        'cmd': 102,
        //        'inc': 'inc',
        //        // 'account_list': [...this.selectedAccounts],
        //        // 'index': `${new Date().getTime()}`,
        //    }];
        // };

        // this.uploader.onSuccessItem = (item, response, status, headers) => {
        //     this[updateModel]({
        //         item: item,
        //         response: response,
        //         status: status,
        //         headers: headers,
        //     });
        // };

        // this.uploader.onErrorItem = (item, response, status, headers) => {
        //     this[updateModel]({
        //         item: item,
        //         response: response,
        //         status: status,
        //         headers: headers,
        //     });
        // };

        // this.uploader.onCancelItem = (item, response, status, headers) => {
        //     this[updateModel]({
        //         item: item,
        //         response: response,
        //         status: status,
        //         headers: headers,
        //     });
        // };

        // this.uploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item, options) {
        //         return this.queue.length < 10;
        //     },
        // });
    }

    /**
     *
     * @param {any} obj
     */
    [updateModel](obj) {
        this.ngModelCtrl.$viewValue = Array.concat([], this.selectedFiles);
        this.ngModelCtrl.$commitViewValue();
    }

    /**
     * @param {any} files
     *
     */
    onSelectedFilesChange(files) {
        if (!files) return;

        let hasDuplicatedFile = false;
        if (Array.isArray(this.selectedFiles)) {
            [...files].forEach((fileA) => {
                if (this.selectedFiles.find((fileB) => fileA.name === fileB.name)) hasDuplicatedFile = true;
            });
        } else {
            hasDuplicatedFile = false;
        }

        if (hasDuplicatedFile) {
            this.componentService.openErrorDialog({ message: '所选文件已在列表中' });
        } else {
            this.selectedFiles.push(...files);

            this.commonService.safeApply(this.$scope);

            console.debug(this.selectedFiles);

            this[updateModel]();
        }

        try {
            angular.element('import-view-selectfile #file-input').val(undefined);
        } catch (e) {
            return;
        }
    }
}

let component = () => {
    return {
        require: {
            ngModelCtrl: '?ngModel',
        },
        template: require('./template/import_view_selectfile.html'),
        bindings: {
            theme: '@mdTheme',
            ngModel: '<',

            selectedAccounts: '<',
        },
        controller: ['$scope', 'FileUploader', 'commonService', 'componentService', 'user', 'apiAddress', importViewSelectfileCtrl],
    };
};

export default component;
