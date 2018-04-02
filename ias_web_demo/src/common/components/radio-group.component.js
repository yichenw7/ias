angular.module('ias.common').component('radioGroup', {
    template: `
        <ul class="radio-group">
            <li ng-repeat="item in $ctrl.items"
                ng-class="{true:'active',false:'default'}[$ctrl.ngModel === item.value]">
                <a href="" ng-click="$ctrl.toggle(item)">{{::item.label}}</a>
            </li>
        </ul>
    `,
    require: {
        ngModelCtrl: '?ngModel',
    },
    bindings: {
        items: '<',
        ngModel: '<',
        onChange: '&'
    },
    controller: function () {
        this.toggle = (item) => {
            if (this.ngModelCtrl.$viewValue === item.value) return;

            this.ngModelCtrl.$viewValue = item.value;
            this.ngModelCtrl.$commitViewValue();
            this.onChange();
        };
    }
});

