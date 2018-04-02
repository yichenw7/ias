import angular from 'angular';

import DateUtils from 'Common/utils/DateUtils'

import '../component/template/universal_add_edit_dialog.less';

const buildViewModelDefine = Symbol('buildViewModelDefine');
const buildViewModel = Symbol('buildViewModel');
const loadViewModel = Symbol('loadViewModel');

/**
 * 
 */
class baseAddEditDialogCtrl {
    /**
     * 
     * @param {any} mdPanelRef
     * @param {any} commonService
     */
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
    }

    /**
     * 作为编辑对话框时，加载旧数据
     * @param {any} loadingVm
     */
    [loadViewModel](loadingVm) {
        if (!angular.isArray(this.viewModelDefine)) return;

        this.viewModelDefine.forEach((viewModel) => {
            if (viewModel.type === 'date') {
                let value = this.commonService.getPropertyX(loadingVm, viewModel.prop);
                if (value && typeof value === 'string') {
                    try {
                        value = new Date(value);
                    } catch (e) {
                        value = undefined;
                    }
                }
                this.commonService.setPropertyX(viewModel, 'ngModel', value);
            } else {
                this.commonService.setPropertyX(viewModel, 'ngModel', this.commonService.getPropertyX(loadingVm, viewModel.prop));
            }

            if (viewModel.cannotEdit) {
                this.commonService.setPropertyX(viewModel, 'disabled', true);
            }
        });
    }

    /**
     * 
     * @param {any} defineList
     * @return {defineList}
     */
    [buildViewModelDefine](defineList) {
        if (!angular.isArray(defineList)) {
            return defineList;
        }

        defineList.forEach((define) => {
            switch (define.type) {
                case 'select':
                    if (!angular.isArray(define.itemSource)) break;
                    define.itemSource = define.itemSource.map((item) => angular.isString(item) ? {
                        value: item,
                        displayName: item,
                    } : item);
                    break;
                default: break;
            }
        });

        return defineList;
    }

    /**
     * 
     * @param {any} defineList
     * @return {viewModel}
     */
    [buildViewModel](defineList) {
        let viewModel = {};

        if (!defineList) return viewModel;

        if (!angular.isArray(defineList)) return viewModel;

        defineList.forEach((define) => {
            if (define.prop) {
                if (define.type === 'date') {
                    let value = this.commonService.getPropertyX(define, 'ngModel');
                    this.commonService.setPropertyX(viewModel, define.prop, DateUtils.formatDate(this.configConsts.DATE_FORMAT));
                } else {
                    this.commonService.setPropertyX(viewModel, define.prop, this.commonService.getPropertyX(define, 'ngModel'));
                }
            }
        });

        return viewModel;
    }

    /**
     * 
     * @param {any} event
     */
    $onClickOk(event) {
        let dialogResult = this[buildViewModel](this.viewModelDefine);

        this.isOkButtonDisabled = true;

        if (this.onClosing) {
            let promise = this.onClosing(dialogResult);

            // 返回false不关闭，返回的promise被reject不关闭
            if (promise && promise.then) {
                promise.then((res) => {
                    this.mdPanelRef.close();
                    this.isOkButtonDisabled = false;
                }, (res) => {
                    this.isOkButtonDisabled = false;
                });
            } else {
                this.isOkButtonDisabled = false;

                if (promise === true) {
                    this.mdPanelRef.close();
                }
            }
        } else {
            console.warn(`The controller(class) extends from baseAddEditDialogCtrl does not implement the function 'onClosing(dialogResult)'.`);
        }
    }

    /**
     * 
     * @param {any} event
     */
    $onClickCancel(event) {
        this.mdPanelRef.close();
    }
}

export default baseAddEditDialogCtrl;


