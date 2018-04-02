class checkHomePageCtrl {
    constructor($scope, $location) {
        this.$location = $location;
    }
}

let component = () => {
    return {
        transclude: true,
        template: `
            <dc-valuation-searchcriteria layout="row" ng-model="$ctrl.searchcriteria" />

            <div flex layout="row" class="layout-no-padding" layout-padding>
                <div flex=30 layout="column" style="padding-right: 0;">
                    <dc-valuation-selector searchcriteria="$ctrl.searchcriteria" layout="column" flex ng-model="$ctrl.selectedValuation" />
                </div>

                <div flex=70 layout="column">
                    <dc-valuation-datatreeview layout="column" flex valuation="$ctrl.selectedValuation" />
                </div>
            </div>
        `,
        bindings: {
            theme: '@mdTheme',
        },
        controller: ['$scope', '$location', checkHomePageCtrl],
    };
};

export default component;
