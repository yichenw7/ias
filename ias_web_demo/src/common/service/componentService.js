(function (angular) {

    class componentService {
        constructor($mdDialog, $mdPanel, commonService) {
            this.$mdDialog = $mdDialog;
            this.$mdPanel = $mdPanel;

            this.commonService = commonService;
        };


        setDisplayNameForItems(source, displayPath) {
            if (!source) return;

            if (source && source instanceof Array) {
                source.forEach((item, index) => {
                    item.$displayName = displayPath ? this.commonService.getPropertyX(item, displayPath) : item.displayName
                });
            }
        };

        closeDialog() {
            this.$mdDialog.hide();
        };

        openErrorDialog(params) {
            this.$mdDialog.show(
                this.$mdDialog.alert()
                    .title(params && params.title ? params.title : '')
                    .theme(params && params.theme ? params.theme : 'ssAvalonUi')
                    .htmlContent(params && params.message ? params.message : '')
                    .ok("确定")
            );
        };

        openConfirmDialog(params) {
            return this.$mdDialog.show(
                this.$mdDialog.confirm()
                    .title(params && params.title ? params.title : '')
                    .theme(params && params.theme ? params.theme : 'ssAvalonUi')
                    .htmlContent(params && params.message ? params.message : '')
                    .ok("确定")
                    .cancel("取消")
            );
        };

        openAddEditDialog(option) {
            if (!option) option = {};

            var position = this.$mdPanel.newPanelPosition()
                .absolute()
                .center();

            var panelAnimation = this.$mdPanel.newPanelAnimation()
                .withAnimation(this.$mdPanel.animation.SCALE)
                .openFrom({
                    top: 0,
                    left: document.documentElement.clientWidth / 2 - 250
                })
                .closeTo({
                    top: 0,
                    left: document.documentElement.clientWidth / 2 - 250
                });

            var config = {
                attachTo: angular.element(document.body),
                controller: option.controller,
                controllerAs: '$ctrl',
                panelClass: 'universal-add-edit-dialog',
                locals: {

                    dialogTitle: option.dialogTitle || '',
                    dialogCategory: option.dialogCategory,

                    loadingVm: option.loadingVm,
                    viewModelDefine: angular.copy(option.viewModelDefine),

                    onClosing: option.onPanelClosingHandler,

                    okButtonLabel: option.okButtonLabel || "确定",
                    cancelButtonLabel: option.cancelButtonLabel || "取消",
                },
                bindToController: true,
                templateUrl: option.template || 'src/common/components/template/universal_add_edit_dialog.html',
                hasBackdrop: true,
                position: position,
                animation: panelAnimation,
                trapFocus: true,
                clickOutsideToClose: false,
                // escapeToClose: true,
                // focusOnOpen: true
            };

            this.$mdPanel.open(config);
        };

        getBaseAddEditDialogCtrl() {

            var buildViewModelDefine = Symbol('buildViewModelDefine'),
                buildViewModel = Symbol('buildViewModel'),
                loadViewModel = Symbol('loadViewModel');

            class baseAddEditDialogCtrl {
                constructor(mdPanelRef, commonService) {
                    this.mdPanelRef = mdPanelRef;

                    this.commonService = commonService;

                    this.labelFlex = 40;
                    this.inputFlex = 60;

                    this.isOkButtonDisabled = false;

                    this.viewModelDefine = this[buildViewModelDefine](this.viewModelDefine);

                    if (this.loadingVm) {
                        this[loadViewModel](this.loadingVm);
                    }


                };

                [loadViewModel](loadingVm) {
                    if (!angular.isArray(this.viewModelDefine)) return;

                    this.viewModelDefine.forEach(viewModel => {
                        this.commonService.setPropertyX(viewModel, 'ngModel', this.commonService.getPropertyX(loadingVm, viewModel.prop));
                    });
                };

                [buildViewModelDefine](defineList) {

                    if (!angular.isArray(defineList)) {
                        return defineList;
                    }

                    defineList.forEach(define => {
                        switch (define.type) {
                            case 'select':
                                if (!angular.isArray(define.itemSource)) break;
                                define.itemSource = define.itemSource.map(item => angular.isString(item) ? { value: item, displayName: item } : item);
                                break;
                            default: break;
                        };
                    });

                    return defineList;
                };

                [buildViewModel](defineList) {
                    var viewModel = {};

                    if (!defineList) return viewModel;

                    if (!angular.isArray(defineList)) return viewModel;

                    defineList.forEach(define => {
                        if (define.prop) {
                            this.commonService.setPropertyX(viewModel, define.prop, this.commonService.getPropertyX(define, 'ngModel'));
                        }
                    });

                    return viewModel;
                };

                $onClickOk(event) {

                    var dialogResult = this[buildViewModel](this.viewModelDefine);

                    this.isOkButtonDisabled = true;

                    if (this.onClosing) {
                        var promise = this.onClosing(dialogResult);

                        // 返回false不关闭，返回的promise被reject不关闭
                        if (promise && promise.then) {
                            promise.then(res => {
                                this.mdPanelRef.close();
                                this.isOkButtonDisabled = false;
                            }, res => {
                                this.isOkButtonDisabled = false;
                            });
                        } else {
                            this.isOkButtonDisabled = false;

                            if (promise === true) {
                                this.mdPanelRef.close();
                            }
                        }
                    }
                };

                $onClickCancel(event) {

                    this.mdPanelRef.close();

                };
            };

            return baseAddEditDialogCtrl;
        };

        buildMdListTreeView(data, option) {

            if (!angular.isArray(data)) return [];

            if (!option.groupBy) return data;

            let target = [];

            let map = new Map();

            data.forEach(item => {
                let key = item[option.groupBy];

                if (map.has(key)) {
                    map.get(key).push(item);
                } else {
                    map.set(key, [item]);
                }
            });

            [...map].forEach(([key, value]) => {

                let parent = { $$treeLevel: 0, $$childNodes: [] };
                parent[option.groupBy] = key;

                value.forEach(item => {
                    let itemCopy = angular.copy(item);

                    if (option.delGroupByProp) delete itemCopy[option.groupBy];

                    itemCopy.$$treeLevel = parent.$$treeLevel + 1;
                    parent.$$childNodes.push(itemCopy);
                });

                target.push(parent);
            });

            return target;
        };

        treeViewCollapseAll(treeData) {
            if (!angular.isArray(treeData)) return;

            treeData.forEach(item => {
                item.$$isCollapse = true;
            });
        };

        treeViewExpandAll(treeData) {
            if (!angular.isArray(treeData)) return;

            treeData.forEach(item => {
                item.$$isCollapse = false;
            });
        };
    };

    angular.module('ias.common').service('componentService', ['$mdDialog', '$mdPanel', 'commonService', componentService]);

})(window.angular);


