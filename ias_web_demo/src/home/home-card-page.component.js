class homeCardPage {
    constructor($scope) {}

    $onChanges(changes) {}
}

let component = () => {
    return {
        transclude: true,
        replace: false,
        bindings: {
            data: '<',
            filter: '<',
        },
        template: `
            <home-card
                ng-repeat="account in $ctrl.data"
                ng-hide="$ctrl.filter !== '' && account.name.indexOf($ctrl.filter) < 0"
                data="account"
            ></home-card>
        `,
        controller: ['$scope', homeCardPage],
    };
};

export default component;
