import './home.css';

class accountOverview {
    constructor($scope, dashboardReq, user) {
        this.dashboardReq = dashboardReq;
        this.user = user;
        this.accountNameFilter = '';
        this.accounts = [];
        this.type = 'table';
    }

    $onInit() {
        const self = this;
        this.dashboardReq.get({
            company_id: self.user.company_id,
            user_id: self.user.id,
            type: 1,
        }, function success(response) {
            if (response.code && response.code === '0000') {
                self.accounts = response.data;
            } else {
                self.accounts = [];
            }
        });
    }
}

let component = () => {
    return {
        transclude: true,
        bindings: {
            account: '<',
        },
        template: `
            <div class="account-overview">
                <div style="margin: 10px;">
                    <input style="width: 200px" ng-model="$ctrl.accountNameFilter" type="text" placeholder="请输入账户名"/>
                    <div class="home-show-type">
                        <span class="list-icon" ng-click="$ctrl.type='table'" ng-class="{true: 'type-active'}[$ctrl.type === 'table']"></span>
                        <span class="card-icon" ng-click="$ctrl.type='card'" ng-class="{true: 'type-active'}[$ctrl.type === 'card']"></span>
                    </div>
                </div>
                <home-card-page ng-show="$ctrl.type === 'card'" data="$ctrl.accounts" filter="$ctrl.accountNameFilter"></home-card-page>
                <home-table-page ng-show="$ctrl.type === 'table'"  data="$ctrl.accounts" filter="$ctrl.accountNameFilter"></home-table-page>
            </div>
        `,
        controller: ['$scope', 'dashboardReq', 'user', accountOverview],
    };
};

export default component;
