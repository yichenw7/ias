import angular from 'angular';

/**
     *
     */
class commonAdminPageCtrl {
    /**
     *
     * @param {any} $sce
     * @param {any} $element
     * @param {any} $compile
     * @param {any} $scope
     * @param {any} $templateRequest
     * @param {any} moduleConfig
     */
    constructor($sce, $element, $compile, $scope, $templateRequest, moduleConfig) {
        let dataDefine = {
            templateBuildMap: new Map([
                // ['{{option.gridPaginationTemplateUrl}}', 'src/system/gridPagination.html'],
                ['{{option.matchResultLength}}', this.matchResultLength],
                ['{{option.searchPlaceholder}}', this.searchPlaceholder],
                ['{{option.uiGridOptions}}', this.uiGridOptions],
            ]),

            templateUrl: 'src/system/component/template/common_admin_page_inner_template.html',
        };

        this.$onInit = () => {
            this.htmlTemplate = `<span>No controller</span>`;
        };

        this.$onChanges = (event) => {
            if (!event) return;

            if (event.ctrlName.currentValue) {
                if (!angular.isString(this.ctrlName) || this.ctrlName.indexOf('<') > -1 || this.ctrlName.indexOf('>') > -1 || this.ctrlName.indexOf(`'`) > -1 || this.ctrlName.indexOf('"') > -1) return;

                $templateRequest(dataDefine.templateUrl).then((content) => {
                    if (!content || !angular.isString(content)) return;

                    this.htmlTemplate = content.replace('ng-controller', `ng-controller="${this.ctrlName}" ng-init="ctrlName='${this.ctrlName}'"`);

                    [...dataDefine.templateBuildMap].forEach(([key, value]) => {
                        if (!value) value = '';
                        this.htmlTemplate = this.htmlTemplate.replace(key, value);
                    });

                    let compiledElement = $compile(this.htmlTemplate)($scope, (clonedElement, scope) => { });

                    $element.append(compiledElement);

                    if (compiledElement) {
                        let innerCtrl = compiledElement.controller();

                        // bind to controller
                        innerCtrl.option = {
                            // matchResultLength: this.matchResultLength
                        };

                        let innerScope = compiledElement.scope();

                        // controllerAs $ctrl
                        innerScope.$ctrl = innerCtrl;
                    }
                }, (error) => { });
            }
        };
    }
}

let commonAdminPage = () => {
    return {
        transclude: true,
        template: '',
        bindings: {
            ctrlName: '@',

            matchResultLength: '@',
            searchPlaceholder: '@',

            uiGridOptions: '@',
        },
        bindToController: true,
        controller: ['$sce', '$element', '$compile', '$scope', '$templateRequest', 'ias.system.config', commonAdminPageCtrl],
    };
};

angular.module('ias.system').component('commonAdminPage', commonAdminPage());
