angular.module('ias.common').component('multiSelect', {
    template: `
        <div class="ias-multi-select" ng-style="{ width: $ctrl.width }">
            <ul class="selector-container clearfix"
                ng-class="{'true':'focus', 'false':''}[$ctrl.isShowDrop]"
                ng-click="$ctrl.toggle()">
                <li class="search-choice" ng-show="$ctrl.isAllSelect">
                    全选
                    <span class="close-icon" ng-click="$ctrl.isAllSelect = false; $ctrl.selectAll(); $event.stopPropagation()"></span>
                </li>
                <li class="search-choice" ng-repeat="option in $ctrl.options" ng-show="!$ctrl.isAllSelect && option.isSelected">
                    {{ option.name }}
                    <span class="close-icon" ng-click="$ctrl.deleteSelectedOption(option);$event.stopPropagation()"></span>
                </li>
            </ul>
            <ul class="selector-drop" ng-show="$ctrl.isShowDrop" click-outside="$ctrl.handleClickOutside()">
                <li>
                    <ias-checkbox
                        name="'全选'"
                        ng-model="$ctrl.isAllSelect"
                        ng-change="$ctrl.selectAll()"
                    ></ias-checkbox>
                </li>
                <li>
                    <ias-search ng-model="$ctrl.filterName" width="100%"></ias-search>
                </li>
                <li>
                    <ul>
                        <li ng-repeat="option in $ctrl.options | filter: { name: $ctrl.filterName }">
                            <ias-checkbox name="option.name" ng-model="option.isSelected" ng-change="$ctrl.select()"></ias-checkbox>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    `,
    require: {
        ngModelCtrl: '?ngModel',
    },
    bindings: {
        ngModel: '<',
        options: '<',
        width: '<?',
    },
    controller: function () {
        this.filterName = '';
        this.isShowDrop = false;
        this.isAllSelect = false;

        this.$onChanges = (event) => {
            if (!event) return;
            if (event.ngModel.currentValue) {
                this.ngModel = event.ngModel.currentValue;
                this.isAllSelect = this.ngModel.length === this.options.length;
                this.options.forEach(option => option.isSelected = (this.ngModel.indexOf(option.name) > -1))
            }
        }

        this.handleClickOutside = function() {
            this.isShowDrop = false;
        }

        this.toggle = function () {
            this.isShowDrop = !this.isShowDrop;
        }

        this.deleteSelectedOption = function (option) {
            option.isSelected = false;

            this.select();
        }

        this.select = () => {
            this.isAllSelect = this.options.every(option => option.isSelected);

            const res = [];
            this.options.forEach(option => option.isSelected && res.push(option.name));

            this.ngModelCtrl.$viewValue = res;
            this.ngModelCtrl.$commitViewValue();
        }

        this.selectAll = function () {
            this.options.forEach(option => option.isSelected = this.isAllSelect)

            this.ngModelCtrl.$viewValue = this.isAllSelect ? this.options.map(option => option.name) : [];
            this.ngModelCtrl.$commitViewValue();
        }
    }
});

