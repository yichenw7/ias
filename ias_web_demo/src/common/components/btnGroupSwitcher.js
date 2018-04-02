angular.module('ias.common').component('btnGroupSwitcher', {
    templateUrl: 'src/common/components/template/btnGroupSwitcher.html',
    require: {
        ngModelCtrl: '?ngModel',
    },
    bindings: {
        itemSource: '<',
        ngModel: '<'
    },
    controller: [function () {
        this.onClickButton = (event, button) => {
            this.ngModelCtrl.$viewValue = button.value;
            this.ngModelCtrl.$commitViewValue();
        };
    }]
});

