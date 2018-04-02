
'use strict';

angular.module('ias.common').service('vaildationService', ['commonService', function (commonService) {

    /**
     * 根据rule定义对viewModel中指定属性进行校验
     * rule ∈ {'required'}
     */
    this.vaildViewModel = (viewModel, rules) => {

        if (!angular.isArray(rules)) return { result: false, rule: undefined };

        var result = undefined;

        rules.forEach(rule => {

            if (result) return;

            if (!rule.prop) return;

            var value = commonService.getPropertyX(viewModel, rule.prop);

            if (!rule.rule) return;

            switch (rule.rule) {
                case 'required':
                    if (!value) result = { result: false, rule: rule };
                    if (angular.isString(value) && value.trim().length < 1) result = { result: false, rule: rule };
                    break;
                default: break;
            }

        });

        return result ? result : { result: true, rule: undefined };
    };

}]);