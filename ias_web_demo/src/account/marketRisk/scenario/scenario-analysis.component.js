import { toTree } from './scenario.helper';

class ScenarioAnalysisCtrl {
    constructor($scope, winStatus, ScenarioAnalysis, authorityControl, yieldCurveShifts) {
        const self = this;
        this.winStatus = winStatus;
        this.ScenarioAnalysis = ScenarioAnalysis;
        this.authorityControl = authorityControl;
        this.yieldCurveShifts = yieldCurveShifts;
        this.type = 'default';
        this.types = [
            { label: '默认', value: 'default' },
            { label: '主体评级', value: 'issuer_rating_current' },
            { label: '剩余期限', value: 'ttm_type' },
        ];
        this.cacheData = [];
        this.data = [];
        this.optionValuationGroup = [
            // { label: '中债推荐久期', value: 'recommend' },
            { label: '行权久期', value: 'option' },
            { label: '到期久期', value: 'maturity' },
        ];
        this.optionValuation = this.optionValuationGroup[0].value;

        $scope.$watchCollection(
            function() {
                return yieldCurveShifts;
            },
            function(newValue, oldValue) {
                if (newValue === oldValue) return;
                self.post();
            }
        );
    }

    handleTypeChanged() {
        this.data = toTree(angular.copy(this.cacheData), this.type);
    }

    post() {
        if (this.winStatus.cur_account_list.length === 0) return;
        const self = this;
        this.ScenarioAnalysis.post({
            account_list: this.authorityControl.getAccountGroupMember(this.accounts),
            yield_curve_shifts: this.yieldCurveShifts.toJson(),
            option_valuation: this.optionValuation,
        }, function(response) {
            if (response.code === '0000') {
                self.cacheData = response.data;
                self.data = toTree(angular.copy(self.cacheData), self.type);
            }
        }, function() {
            console.log('获取数据失败！');
        });
    }

    showDlg() {
        $('#scenarioDialog').modal('show');
    }

    $onChanges(changes) {
        if (changes.accounts) {
            this.post();
        }
    }
}

export default function() {
    return {
        bindings: {
            accounts: '<',
        },
        template: `
            <div style="position:absolute;left:350px;top:45px;">
                <label>预定义：</label>
                <button ng-click="$ctrl.showDlg()">曲线变动设置</button>

                <label style="margin-left: 50px;">分类方式：</label>
                <radio-group
                    ng-model="$ctrl.type"
                    items="$ctrl.types"
                    on-change="$ctrl.handleTypeChanged()">
                </radio-group>

                <label style="margin-left: 50px;">含权债计算规则：</label>
                <select
                    ng-model="$ctrl.optionValuation"
                    ng-change="$ctrl.post()"
                    ng-options="optionValuation.value as optionValuation.label for optionValuation in $ctrl.optionValuationGroup">
                </select>
            </div>
            <scenario-table data="$ctrl.data" type="$ctrl.type"></scenario-table>
            <div ng-include="'src/account/marketRisk/scenario/scenario.dialog.html'"></div>
        `,
        controller: ['$scope', 'winStatus', 'ScenarioAnalysis', 'authorityControl', 'yieldCurveShifts', ScenarioAnalysisCtrl],
    };
}
