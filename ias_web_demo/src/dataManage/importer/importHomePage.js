const initView = Symbol('initView');

class importHomePageCtrl {
    constructor($scope, dataImportService, FileUploader, apiAddress) {
        this.dataImportService = dataImportService;

        this[initView]();
    }

    [initView]() {
        this.currentNavItem = 'upload';
    }
}

let component = () => {
    return {
        transclude: true,
        template: `
            <import-view-upload ng-model="$ctrl.vm.selectedAccount"></import-view-upload>
            <import-view-tasklist selected-account="$ctrl.vm.selectedAccount" style="flex:1"></import-view-tasklist>
        `,
        bindings: {
            theme: '@mdTheme',
        },
        controller: ['$scope', 'dataImportService', 'FileUploader', 'apiAddress', importHomePageCtrl],
    };
};

export default component;
