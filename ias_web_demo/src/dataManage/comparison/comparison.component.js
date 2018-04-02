class ComparisonCtrl {
    constructor(user, compare) {
        this.user = user;
        this.compare = compare;
        this.comparisonParams = {};
        this.data = {};
    }

    query() {
        const valuationAccount = this.comparisonParams.valuationAccounts[0];
        const tradeAccount = this.comparisonParams.tradeAccounts[0];
        const valuationDate = this.comparisonParams.valuationDate;
        const showType = this.comparisonParams.showType;

        if (!valuationAccount || !tradeAccount || !valuationDate) return;
        const self = this;
        this.compare.query({
            company_id: this.user.company_id,
            account_id: valuationAccount.id,
            trade_account_id: tradeAccount.id,
            pos_date: valuationDate,
            compare_data_type: showType,
        }, function(res) {
            if (res.code === '0000') {
                self.data = res.data;
            }
        }, function(res) {
            console.log(res);
        });
    }
}

export default function() {
    return {
        template: `
            <div class="data-manage-home">
                <comparison-header
                    ng-model="$ctrl.comparisonParams"
                    on-query="$ctrl.query()"
                    diff="$ctrl.data.total_diff_amt"
                ></comparison-header>
                <comparison-body data="$ctrl.data"></comparison-body>
            </div>
        `,
        controller: ['user', 'compare', ComparisonCtrl],
    };
}
