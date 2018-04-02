import './comparison.css';

class ComparisonHeaderCtrl {
    constructor() {
        this.showDataTypes = [
            { label: '全部', value: 'all' },
            { label: '差异', value: 'only_diff' },
            { label: '匹配', value: 'only_same' },
        ];
        this.valuationDates = [];
        this.init();
    }

    init() {
        this.vm = {
            showType: 'all',
            valuationDate: '',
            valuationAccounts: [],
            tradeAccounts: [],
        };
    }

    handleValuationAccountChanged() {
        const account = this.vm.valuationAccounts[0];
        this.valuationDates = [];
        if (!account) return;

        this.valuationDates = account.valuation_dates;
    }

    handleChanged() {
        this.ngModelCtrl.$viewValue = angular.copy(this.vm);
        this.ngModelCtrl.$commitViewValue();
        this.onQuery();
    }
}

export default function() {
    return {
        require: {
            ngModelCtrl: '?ngModel',
        },
        bindings: {
            onQuery: '&',
            diff: '<',
        },
        template: `
            <div class="comparison-header">
                <div>
                    <label>显示部分：</label>
                    <radio-group
                        ng-model="$ctrl.vm.showType"
                        items="$ctrl.showDataTypes"
                        on-change="$ctrl.handleChanged()">
                    </radio-group>
                </div>
                <div class="accounts">
                    <label>估值账户：</label>
                    <input-account-selector style="width: 200px;"
                        valuation="true"
                        ng-model="$ctrl.vm.valuationAccounts"
                        ng-change="$ctrl.handleValuationAccountChanged()">
                    </input-account-selector>
                    <label class="ias-control-label">估值表日期：</label>
                    <ias-select
                        options="$ctrl.valuationDates"
                        ng-model="$ctrl.vm.valuationDate"
                        change-handle="$ctrl.handleChanged()"
                        width="120px">
                    </ias-select>
                </div>
                <div class="accounts">
                    <label>流水账户：</label>
                    <input-account-selector style="width: 200px;"
                        ng-model="$ctrl.vm.tradeAccounts"
                        ng-change="$ctrl.handleChanged()">
                    </input-account-selector>
                </div>
                <div class="notify-bar">
                    <div ng-show="!$ctrl.diff" layout="row" layout-align="start center">
                        <i class="ss-icon ss-icon-dialog-success" />
                        <span class="normal">正常</span>
                    </div>
                    <div ng-show="$ctrl.diff > 0" layout="row" layout-align="start center">
                        <i class="ss-icon ss-icon-dialog-error" />
                        <span class="error">存在 {{$ctrl.diff}} 条异常</span>
                    </div>
                </div>
            </div>
        `,
        controller: ComparisonHeaderCtrl,
    };
}
