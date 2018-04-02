class homeCard {
    constructor($scope, accountService) {
        this.accountService = accountService;
    }
}

let component = () => {
    return {
        bindings: {
            data: '<',
        },
        template: `
            <div>
                <span class="home-card-account">{{ $ctrl.data.name }}</span>
                <span class="valuation-account" ng-show="$ctrl.accountService.isValuationAccount($ctrl.data.id)">估</span>
                <span class="readonly-account" ng-show="$ctrl.data.option == '1'">只读</span>
            </div>
            <div class="home-card-profit">
                <span class="unit-asset-net">{{ $ctrl.data.unit_asset_net | toFixed4 }}</span>
                <span class="create-rate" ng-class="{true: 'up', false: 'down'}[$ctrl.data.daily_rate >= 0]">{{ $ctrl.data.daily_rate | toYield }}</span>
            </div>
            <div class="home-card-info">
                <label>成立以来(%)<span class="showEllipsis" ng-attr-title="{{$ctrl.data.create_rate | toYield}}">{{ $ctrl.data.create_rate | toYield }}</span></label>
                <label>杠杆率(%)<span class="showEllipsis" ng-attr-title="{{$ctrl.data.leverage | toYield}}">{{ $ctrl.data.leverage | toYield }}</span></label>
                <label>净资产(万)<span class="showEllipsis" ng-attr-title="{{$ctrl.data.asset_net | toWan | commafyConvert}}">{{ $ctrl.data.asset_net | toWan | commafyConvert }}</span></label>
                <label>份额(万)<span class="showEllipsis" ng-attr-title="{{$ctrl.data.shares | toWan | commafyConvert}}">{{ $ctrl.data.shares | toWan | commafyConvert }}</span></label>
                <label>本金(万)<span class="showEllipsis" ng-attr-title="{{$ctrl.data.fund_cost | toWan | commafyConvert}}">{{ $ctrl.data.fund_cost | toWan | commafyConvert }}</span></label>
                <label>目标收益(%)<span class="showEllipsis" ng-attr-title="{{$ctrl.data.target_cost | toYield}}">{{ $ctrl.data.target_cost | toYield }}</span></label>
            </div>
        `,
        controller: ['$scope', 'accountService', homeCard],
    };
};

export default component;
