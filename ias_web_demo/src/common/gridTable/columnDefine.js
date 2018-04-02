angular.module('ias.uiGrid')
    .factory('pleImportTable', function () {
        return {
            pleImportInColumnDef: function () {
                var pledgeVolumeTemplate =
                    '<input ng-init="row.entity.pledge_volume=row.entity.pledge_volume?row.entity.pledge_volume:row.entity.available_volume"' +
                    ' ng-change="grid.appScope.useVolumeChanged(row.entity)"' +
                    ' type="number" ng-model="row.entity.pledge_volume"  class="modal-input" style="width:100px;margin-top:8px">';
                var pledgePriceTemplate =
                    '<input  ng-change="grid.appScope.useVolumeChanged(row.entity)" type="number" ng-init="row.entity.pledge_price=grid.appScope.initPrice(row.entity)"' +
                    'ng-model="row.entity.pledge_price" class="modal-input" style="width:100px;margin-top:8px">';

                var basicColumn = [
                    { field: 'bond_code', displayName: '代码', width: '100', cellClass: 'tbody-special-font' },
                    { field: 'short_name', displayName: '简称', width: '100', cellClass: 'tbody-special-font' },
                    { field: 'inquiry_volume', displayName: '询价量', width: '100', cellFilter: 'commafyConvert: row.entity.pledge_available_volume', },
                    { field: 'available_volume', displayName: '可用量', width: '100', cellFilter: 'commafyConvert: row.entity.available_volume', },
                    { field: 'action', displayName: '使用量', width: '100', cellTemplate: pledgeVolumeTemplate },
                    { field: 'realized_gain', displayName: '对手', width: '100' },
                    { field: 'pledge_volume', displayName: '金额', width: '100', cellFilter: 'getAmount: row.entity.pledge_price' },
                    { field: 'val_clean_price', displayName: '净价', width: '100', cellFilter: 'cdcAuthority' },
                    { field: 'action', displayName: '质押价格', width: '100', cellTemplate: pledgePriceTemplate },
                    { field: 'issuer_rating', displayName: '主体评级', width: '100' },
                    { field: 'asset', displayName: '所在库', width: '100' },
                    { field: 'enterprise_type', displayName: '企业类型', width: '100' },
                    { field: 'rating_institution', displayName: '评级机构', width: '100' },
                    { field: 'asset', displayName: '到期日', width: '100' },
                    { field: 'asset', displayName: '展望', width: '100' }
                ];
                return basicColumn;
            },
            pleImportOutColumnDef: function () {
                var pledgeVolumeTemplate =
                    '<input limit-format-number regexp-str="\\d*" output-number="row.entity.pledge_volume" change-value="grid.appScope.useVolumeChanged(row.entity)"' +
                    'style="margin-top:4px">';
                var pledgePriceTemplate =
                    '<input limit-format-number number-point="4" output-number="row.entity.pledge_price" change-value="grid.appScope.useVolumeChanged(row.entity)" ng-init="row.entity.pledge_price=grid.appScope.initPrice(row.entity)"' +
                    'style="margin-top:4px">';

                var basicColumn = [
                    { field: 'bond_code', displayName: '代码', width: '100', cellClass: 'tbody-special-font' },
                    { field: 'short_name', displayName: '简称', width: '100', cellClass: 'tbody-special-font' },
                    { field: 'pledge_available_volume', displayName: '可用量', width: '100', cellFilter: 'commafyConvert: row.entity.pledge_available_volume', },
                    { field: 'action', displayName: '使用量', width: '100', cellTemplate: pledgeVolumeTemplate },
                    { field: 'realized_gain', displayName: '对手', width: '100' },
                    { field: 'pledge_volume', displayName: '金额(万元)', width: '100', cellFilter: 'getAmount: (row.entity.pledge_price/10000)', },
                    { field: 'val_clean_price', displayName: '净价', width: '100', cellFilter: 'cdcAuthority' },
                    { field: 'action', displayName: '质押价格', width: '100', cellTemplate: pledgePriceTemplate },
                    { field: 'issuer_rating', displayName: '主体评级', width: '100' },
                    { field: 'asset', displayName: '所在库', width: '100' },
                    { field: 'enterprise_type', displayName: '企业类型', width: '100' },
                    { field: 'rating_institution', displayName: '评级机构', width: '100' },
                    { field: 'asset', displayName: '到期日', width: '100' },
                    { field: 'asset', displayName: '展望', width: '100' }
                ];
                return basicColumn;
            }
        }
    })
    .factory('accountTable', function (sortClass, uiGridConstants, $filter) {
        var commentTemplate =
            '<span ng-show="!grid.appScope.isEmpty(row.entity.comment)" class="btn btn-xs">' +
            '<img src="./images/comment.png" tooltip data-toggle="tooltip" data-placement="top" data-original-title="{{row.entity.comment}}">' +
            '</span>';
        return {
            getRowTemplate: function (key) {
                // TODO: 这里的跟默认模板只多了 setRowStatus 这个属性。
                var positionRowTemplate = `
                    <div
                        ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid"
                        ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
                        class="ui-grid-cell"
                        ng-style="grid.appScope.setRowStatus(row.entity)"
                        ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }"
                        role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}"
                        ui-grid-cell>
                    </div>
                `
                var rowTemlateMap = {
                    positionRowTemplate: positionRowTemplate,
                }
                return rowTemlateMap[key];
            },
            inquiryInterBankColumnDef: function () {
                var useVolumeTemplate =
                    '<input limit-format-number  regexp-str="\\d*" class="modal-input" style="width:70px; margin-top:7px" ng-init="row.entity.use_volume = grid.appScope.getUseVolume(row.entity.use_volume, row.entity.pledge_available_volume)" output-number="row.entity.use_volume" change-value="grid.appScope.volumeChanged(row.entity)">';
                var freezeTemplate =
                    '<button ng-if="0 != row.entity.pledged_maturity_volume" class="btn-sm btn-bg-color font-color action-btn" style="height:20px; margin-top:5px" type="button">解冻</button>';
                var priceTemplate =
                    '<input type="number" class="modal-input" style="width:60px; margin-top:7px" ng-init="row.entity.price = grid.appScope.getInitPrice(row.entity.price, row.entity.val_clean_price)" ng-model="row.entity.price" ng-change="grid.appScope.updateSelect()"/>';
                var basicColumn = [
                    { field: 'bond_code', displayName: '代码', width: '90', cellClass: 'tbody-special-font' },
                    { field: 'short_name', displayName: '简称', width: '110', cellClass: 'tbody-special-font' },
                    { field: 'pledge_available_volume', displayName: '可用量', width: '80' },
                    { field: 'pledged_maturity_volume', displayName: '今日到期量', width: '90' },
                    { field: 'use_volume', displayName: '询价量', width: '80', cellTemplate: useVolumeTemplate },
                    //{field: 'action',displayName: '解冻', width:'60', cellTemplate: freezeTemplate},
                    { field: 'action', displayName: '到期对手', width: '80' },
                    { field: 'use_volume', displayName: '金额', width: '90', cellFilter: 'getAmount: row.entity.price' },
                    { field: 'val_clean_price', displayName: '净价', cellFilter: 'cdcAuthority', width: '80' },
                    { field: 'price', displayName: '质押价格', width: '100', cellTemplate: priceTemplate },
                    { field: 'issuer_rating', displayName: '主体评级', width: '60' },
                    { field: 'enterprise_type', displayName: '企业类型', width: '80' },
                    { field: 'rating_institution', displayName: '评级机构', width: '80' }
                ];
                return basicColumn;
            },
            inputInterBankRepoColumnDef: function () {
                var useVolumeTemplate =
                    '<div style="padding: 4px;"><input limit-format-number regexp-str="\\d*" ng-init="row.entity.use_volume = grid.appScope.getUseVolume(row.entity.use_volume, row.entity.pledge_available_volume)" output-number="row.entity.use_volume" change-value="grid.appScope.handleVolumnChanged(row.entity)"/></div>';
                var priceTemplate =
                    '<div style="padding: 4px;"><input limit-format-number ng-init="row.entity.price = grid.appScope.getInitPrice(row.entity.price, row.entity.val_clean_price)" output-number="row.entity.price" change-value="grid.appScope.handleVolumnChanged(row.entity)"/></div>';
                return [
                    { field: 'bond_code', displayName: '代码', width: '95', cellClass: 'tbody-special-font' },
                    { field: 'short_name', displayName: '简称', width: '110', cellClass: 'tbody-special-font' },
                    { field: 'pledge_available_volume', displayName: '可用量', cellFilter: 'thousandthNum', width: '80' },
                    { field: 'pledged_maturity_volume', displayName: '当日到期量', width: '92' },
                    { field: 'val_clean_price', displayName: '净价', width: '82', cellFilter: 'cdcAuthority:true', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'use_volume', displayName: '使用量', width: '100', cellTemplate: useVolumeTemplate },
                    { field: 'price', displayName: '折算率(%)', width: '100', cellTemplate: priceTemplate },
                    { field: 'use_volume', displayName: '折后金额', width: '120', cellFilter: 'getAmount: row.entity.price', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'bond_type', displayName: '债券类型', width: '100' },
                    { field: 'enterprise_type', displayName: '企业类型', width: '80' },
                    { field: 'issuer_rating_current', displayName: '主体评级', width: '80' },
                    { field: 'issuer_rating_institution_name', displayName: '评级机构', width: '90' }
                ];
            },
            reverseInterBankRepoColumnDef: function (hasTrust) {
                var deleteTemplate =
                    '<div><button class="ias-delete-btn" style="margin: 3px;" ng-click="grid.appScope.handleBondDeleted(row.entity)">删除</button></div>';
                var useVolumeTemplate =
                    '<div style="padding: 4px;"><input limit-format-number regexp-str="\\d*" output-number="row.entity.use_volume" change-value="grid.appScope.handleInverseVolumnChanged(row.entity)"/></div>';
                var priceTemplate =
                    '<div style="padding: 4px;"><input limit-format-number output-number="row.entity.price" change-value="grid.appScope.handleInverseVolumnChanged(row.entity)"/></div>';
                var trustTemplate =
                    `<div style="display: flex;justify-content: center;align-content: center;"><span ng-class="{sch:'bond-sch',cdc:'bond-cdc'}[row.entity.trust]">{{ row.entity.trust === "sch" ? "上清" : "中债" }}</span></div>`

                return [
                    { field: 'action', displayName: '操作', width: '54', cellTemplate: deleteTemplate },
                    { field: 'trust', displayName: '托管机构', visible: hasTrust, width: '80', cellTemplate: trustTemplate },
                    { field: 'bond_id', displayName: '代码', width: '90', cellClass: 'tbody-special-font' },
                    { field: 'short_name', displayName: '简称', width: '110', cellClass: 'tbody-special-font' },
                    { field: 'val_clean_price', displayName: '净价', width: '82', cellFilter: 'cdcAuthority:true', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'use_volume', displayName: '使用量', width: '100', cellTemplate: useVolumeTemplate },
                    { field: 'price', displayName: '折算率(%)', width: '100', cellTemplate: priceTemplate },
                    { field: 'use_volume', displayName: '折后金额', width: '120', cellFilter: 'getAmount: row.entity.price', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'bond_type', displayName: '债券类型', width: '100' },
                    { field: 'enterprise_type', displayName: '企业类型', width: '80' },
                    { field: 'issuer_rating_current', displayName: '主体评级', width: '80' },
                    { field: 'issuer_rating_institution_name', displayName: '评级机构', width: '90' },
                ];
            },
            dealColumnDef: function () {
                var directionTemplate =
                    '<img ng-src="{{row.entity.direction | dealDirection}}" style="padding-top:9px;padding-left:6px">';
                var basicColumn = [
                    { field: 'direction', displayName: '方向', width: '110', cellTemplate: directionTemplate },
                    { field: 'price', displayName: '价格', width: '110' },
                    { field: 'update_time', displayName: '时间', width: '110', cellFilter: 'dealTimeFilter' }
                ];
                return basicColumn;
            },
            quoteColumnDef: function () {
                var bidVolumeTemplate = '<div class="showEllipsis" style="margin-top: 7px;padding-left: 5px;" tooltip data-toggle="tooltip" data-placement="top" data-original-title="{{row.entity.bid_volume|isShowTooltip:7}}">{{ row.entity.bid_volume}}</div>'
                var bidPriceTemplate = '<div style="float: left;margin-top: 7px;padding-left: 5px">{{ row.entity.bid_price }}</div>' +
                    '<div style="float: left;margin-top: 7px">' +
                    '<img src="./images/quote_note.png" tooltip data-toggle="tooltip" data-placement="top" data-original-title="{{row.entity.bid_price_desc}}" style="display:{{row.entity.bid_price_desc | priceDescFilter}};height: 9px">' +
                    '<img src="./images/quote_note_oco.png" tooltip data-toggle="tooltip" data-placement="top" title="oco" style="display:{{row.entity.bid_flag_oco |ocoFilter}};">' +
                    '</div>' +
                    '<div style="float: left;margin-top: 9px;height: 10px">' +
                    '<img src="./images/quote_note_negotiable.png" tooltip data-toggle="tooltip" data-placement="top" title="可议价" style="display:{{row.entity.bid_flag_bargain |bargainFilter: 1 }};height: 10px">' +
                    '</div>' +
                    '<div style="float: left;margin-top: 7px">' +
                    '<img src="./images/quote_note_negotiable_more.png" tooltip data-toggle="tooltip" data-placement="top" title="更可议价" style="display:{{row.entity.bid_flag_bargain | bargainFilter: 2}};">' +
                    '</div>';
                var ofrVolumeTemplate = '<div class="showEllipsis" style="margin-top: 7px;padding-left: 5px" tooltip data-toggle="tooltip" data-placement="top" data-original-title="{{row.entity.ofr_volume|isShowTooltip:7}}">{{ row.entity.ofr_volume}}</div>'
                var ofrPriceTemplate = '<div style="float: left;margin-top: 7px;padding-left: 5px">{{ row.entity.ofr_price }}</div>' +
                    '<div style="float: left;margin-top: 7px">' +
                    '<img src="./images/quote_note.png" tooltip data-toggle="tooltip" data-placement="top" data-original-title="{{row.entity.ofr_price_desc}}" style="display:{{row.entity.ofr_price_desc | priceDescFilter}};height: 9px">' +
                    '<img src="./images/quote_note_oco.png" tooltip data-toggle="tooltip" data-placement="top" title="oco" style="display:{{row.entity.ofr_flag_oco |ocoFilter}};">' +
                    '</div>' +
                    '<div style="float: left;margin-top: 9px;height: 10px">' +
                    '<img src="./images/quote_note_negotiable.png" tooltip data-toggle="tooltip" data-placement="top" title="可议价" style="display:{{row.entity.ofr_flag_bargain |bargainFilter: 1 }};height: 10px">' +
                    '</div>' +
                    '<div style="float: left;margin-top: 7px">' +
                    '<img src="./images/quote_note_negotiable_more.png" tooltip data-toggle="tooltip" data-placement="top" title="更可议价" style="display:{{row.entity.ofr_flag_bargain | bargainFilter: 2 }};">' +
                    '</div>';
                var companyTemplate = '<p style="border-radius:3px;padding:2px;margin: 4px;background-color:{{ row.entity.company_id |colorFilter }};text-align: center">{{ row.entity.company_id | brokerFilter }}</p>'
                var basicColumn = [
                    { field: 'bid_volume', displayName: 'Vol.bid', width: '90', cellClass: 'tbody-font showLeftBorder', cellTemplate: bidVolumeTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.volumeFunc(a, b, direction) } },
                    { field: 'bid_price', displayName: 'Bid', width: '75', cellClass: 'bid-info showBorder', cellTemplate: bidPriceTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.priceFunc(a, b, direction) } },
                    { field: 'ofr_price', displayName: 'Ofr', width: '75', cellClass: 'ofr-info showBorder', cellTemplate: ofrPriceTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.priceFunc(a, b, direction) } },
                    { field: 'ofr_volume', displayName: 'Vol.ofr', width: '90', cellClass: 'tbody-font showRightBorder', cellTemplate: ofrVolumeTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.volumeFunc(a, b, direction) } },
                    //{field: 'company_id', displayName: '来源', width: '60', cellTemplate:companyTemplate}
                ];
                return basicColumn;
            },
            stockPositionColumnDef: function () {
                var basicBondColumn = [
                    { field: 'stock_code', displayName: '代码', width: '8%', cellClass: 'tbody-special-font'},
                    { field: 'stock_name', displayName: '证券名称', width: '10%', cellClass: 'tbody-special-font' },
                    { field: 'proportion', displayName: '比重(%)', width: '8%', cellFilter: 'toPercentNoSign', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'new', displayName: '最新价', width: '8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'toFixed2', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'cost_price', displayName: '成本价', width: '8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'toFixed2', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'chng', displayName: '涨跌', width: '8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'chng_pct', displayName: '涨跌幅', width: '10%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'volume', displayName: '持仓量', width: '10%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'thousandthNum', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'market_value', displayName: '持仓市值', width: '10%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'pnl_daily', displayName: '当日盈亏', width: '10%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'total_profit_and_loss', displayName: '累计盈亏', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', width: '10%', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                ];
                return basicBondColumn;
            },
            fundPositionColumnDef: function () {
                var fundCodeTemplate = '<div class="ui-grid-cell-contents ng-binding ng-scope" style="cursor: pointer">{{ row.entity.fund_code}}</div>';
                var fundNameTemplate = '<div class="ui-grid-cell-contents ng-binding ng-scope" style="cursor: pointer">{{ row.entity.fund_name}}</div>';

                var basicBondColumn = [
                    { field: 'fund_code', displayName: '代码', width: '6%', cellClass: 'tbody-special-font' ,cellTemplate: fundCodeTemplate},
                    { field: 'fund_name', displayName: '基金名称', width: '15%', cellClass: 'tbody-special-font' ,cellTemplate: fundNameTemplate},
                    { field: 'type',displayName: '类型',width:'6%', cellFilter:'fundType'},
                    { field: 'mkt',displayName: '交易场所',width:'6%'},
                    { field: 'proportion', displayName: '比重(%)', width: '6%', cellFilter: 'toPercentNoSign', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'volume', displayName: '持仓量', width: '10%', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'market_value', displayName: '持仓市值', width: '10%', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'val_date', displayName: '市值更新日', width:'6%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'unit_net', displayName: '最新净值', width: '6%', cellFilter: 'toFixed4 | thousandthNum', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'accum_net', displayName: '累计净值', width: '6%', cellFilter: 'toFixed4 | columnNullValue', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'tenthou_unit_incm', displayName: '万份基金收益', width: '6%', headerCellClass: 'ias-text-right', cellFilter: 'columnNullValue', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'year_yld', displayName: '七日年化(%)', width: '6%', headerCellClass: 'ias-text-right', cellFilter: 'columnNullValue', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'pnl_daily', displayName: '当日盈亏', width: '10%', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'total_pnl', displayName: '累计盈亏', width: '10%', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'average_price', displayName: '成本价', width: '6%', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'total_cost', displayName: '已申购金额(元)', width: '10%', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                 ];
                return basicBondColumn;
            },
            depositColumnDef: function() {
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn"' +
                    'ng-click="grid.appScope.editDeposit(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ' +
                    'ng-click="grid.appScope.delDepositBtnClicked(row.entity)"></button> ' +
                    '</div>';

                return [
                    { field: 'action', displayName: '编辑', width: '100', cellTemplate: editTemplate },
                    { field: 'initial_date', displayName: '存款日期', width:'8%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'name', displayName: '存款产品名称', width:'8%', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                    { field: 'direction', displayName: '存款方向', width:'8%', cellFilter: 'depositDirection', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'initial_amount', displayName: '金额', width:'8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'absoluteAmount | commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'asset', displayName: '市值', width:'8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'absoluteAmount | commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'initial_amount', displayName: '净资金额', width:'8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'return_amount', displayName: '返回金额', width:'8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'deposit_rate', displayName: '平均利率(%)', width:'8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'toYield', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'profit', displayName: '利润', width:'8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'maturity_date', displayName: '到期日', width:'8%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'coupon', displayName: '总应计利息', width:'8%', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'counter_party_company', displayName: '对手行', width:'8%',  },
                    { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                    { field: 'update_time', displayName: '编辑时间', width: '180' },
                    { field: 'comment', displayName: '备注', width:'8%', cellTemplate: commentTemplate },
                    { field: 'day_counter',displayName: '计息基准', width:'8%' }
                ];
            },
            bankLendingColumnDef: function () {
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn" ' +
                    'ng-click="grid.appScope.editBankLending(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ' +
                    'ng-click="grid.appScope.delBankLendingBtnClicked(row.entity)"></button> ' +
                    '</div>';
                var accountGroupName = '<span class="btn btn-xs ">' +
                    '<img class="group-name-icon" tooltip data-original-title="{{row.entity.account_id | getAccountGroupName}}">' +
                    '</span>';
                var basicColumn = [
                    {field: 'action',displayName: '编辑', width: '100', cellTemplate: editTemplate},
                    {field: 'initial_date', displayName: '拆借日期', width:'8%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center'},
                    {field: 'account_name', displayName: '基金名称',width:'8%', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'account_id',displayName: '所在组合',width:'6%',  cellTemplate: accountGroupName, cellFilter:'getAccountGroupName'},
                    {field: 'direction',displayName: '拆借方向',width:'6%',  cellFilter: 'lendingDirection'},
                    {field: 'initial_amount',displayName: '净资金额',width:'7%', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'return_amount',displayName: '返回金额',width:'7%', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'lending_rate',displayName: '平均利率(%)',width:'7%', cellFilter:'toYield', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'profit',displayName: '利润',width:'7%', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'maturity_date',displayName: '到期日',width:'7%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center'},
                    {field: 'coupon',displayName: '总应计利息',width:'7%', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'counter_party_company',displayName: '对手',width:'8%'},
                    { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                    { field: 'update_time', displayName: '编辑时间', width: '180' },
                    {field: 'comment',displayName: '备注',width:'8%', cellTemplate: commentTemplate},
                    {field: 'day_counter',displayName: '计息基准', width:'7%'}
                ];
                return basicColumn;
            },
            financeColumnDef: function () {
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn" ' +
                    'ng-click="grid.appScope.editFinance(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ' +
                    'ng-click="grid.appScope.delFinanceBtnClicked(row.entity)"></button> ' +
                    '</div>';
                var accountGroupName = '<span class="btn btn-xs ">' +
                    '<img class="group-name-icon" tooltip data-original-title="{{row.entity.account_id | getAccountGroupName}}">' +
                    '</span>';
                return [
                    {field: 'action', displayName: '编辑', width: '100', cellTemplate: editTemplate},
                    {field: 'initial_date', displayName: '理财日期', width:'8%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center'},
                    {field: 'account_name', displayName: '账户名称',width:'8%', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'account_id',displayName: '所在组合',width:'6%', cellTemplate: accountGroupName, cellFilter:'getAccountGroupName'},
                    {field: 'finance_type',displayName: '收益类型',width:'7%', cellFilter:'financeType'},
                    {field: 'initial_amount',displayName: '金额', width:'7%',  cellFilter:'absoluteAmount | commafyConvert',headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'initial_amount',displayName: '净资金额', width:'7%', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'return_amount',displayName: '返回金额', width:'7%', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'finance_rate',displayName: '平均利率(%)', width:'7%', cellFilter:'toYield', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'profit',displayName: '利润', width:'7%', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'maturity_date',displayName: '到期日', width:'7%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center'},
                    {field: 'coupon',displayName: '总应计利息', width:'7%', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'counter_party_company',displayName: '对手',width:'8%'},
                    { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                    { field: 'update_time', displayName: '编辑时间', width: '180' },
                    {field: 'comment',displayName: '备注',width:'6%', cellTemplate: commentTemplate},
                    {field: 'day_counter',displayName: '计息基准', width:'7%'}
                ];
            },
            interbankColumnDef: function () {
                var codeTemplate = '<a href="" class="ias-bond-info code-name-color" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.bond_code }}</a>';
                var shortNameTemplate = '<a href="" class="ias-bond-info code-name-color" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.short_name }}</a>';
                var pledgeOutTemplate = '<detail-tip-btn tip-view-id="\'pledgeBondDetailPage\'" ng-if="row.entity.pledge_out && row.entity.pledge_out.length > 0" \
                        show-detail-func="grid.appScope.showPledgeBondDetail(list)" bond-list="row.entity.pledge_out" style="float: right"\
                        tip-left="400" tip-top="85">\
                    </detail-tip-btn>\
                    <div style="float: right;margin-right: 10px;line-height: 30px" ng-class="{true: \'sum-data\'}[!row.entity.bond_key_listed_market]">{{ row.entity.pledge_out_volume | toWanYuan | thousandthNum }}</div>';

                var buyoutInTemplate = '<detail-tip-btn tip-view-id="\'pledgeBondDetailPage\'" ng-if="row.entity.buyout_in && row.entity.buyout_in.length > 0" \
                        show-detail-func="grid.appScope.showPledgeBondDetail(list)" bond-list="row.entity.buyout_in" style="float: right"\
                        tip-left="400" tip-top="85">\
                    </detail-tip-btn>\
                    <div style="float: right;margin-right: 10px;line-height: 30px" ng-class="{true: \'sum-data\'}[!row.entity.bond_key_listed_market]">{{ row.entity.buyout_in_volume | toWanYuan | thousandthNum }}</div>';

                var buyoutOutTemplate = '<detail-tip-btn tip-view-id="\'pledgeBondDetailPage\'" ng-if="row.entity.buyout_out && row.entity.buyout_out.length > 0" \
                        show-detail-func="grid.appScope.showPledgeBondDetail(list)" bond-list="row.entity.buyout_out" style="float: right"\
                        tip-left="400" tip-top="85">\
                    </detail-tip-btn>\
                    <div style="float: right;margin-right: 10px;line-height: 30px" ng-class="{true: \'sum-data\'}[!row.entity.bond_key_listed_market]">{{ row.entity.buyout_out_volume | toWanYuan | thousandthNum }}</div>';

                function setColor(grid, row, col) {
                    return row.entity.bond_key_listed_market ? 'ias-text-right' : 'sum-data ias-text-right';
                }

                function setColorCenter(grid, row, col) {
                    return row.entity.bond_key_listed_market ? 'ias-text-center' : 'sum-data ias-text-center';
                }

                return [
                    { field: 'bond_code', displayName: '债券代码', width: '150', cellTemplate: codeTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'short_name', displayName: '债券简称', width: '170', cellTemplate: shortNameTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'val_clean_price', displayName: '中债估值净价', width: '110', headerCellClass: 'ias-text-right', cellFilter: 'toFixed2', cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'next_coupon_date', displayName: '下一付息日', width: '200', headerCellClass: 'ias-text-right', cellClass: setColor, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'position_volume', displayName: '持仓(万)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'toWanYuan | thousandthNum', cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'available_volume', displayName: '可用量(万)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'toWanYuan | thousandthNum', cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'buyout_in_volume', displayName: '买断入(万)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'toWanYuan | thousandthNum', cellTemplate: buyoutInTemplate, cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'buyout_out_volume', displayName: '卖断冻结(万)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'toWanYuan | thousandthNum', cellTemplate: buyoutOutTemplate, cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'pledge_out_volume', displayName: '质押出冻结(万)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'toWanYuan | thousandthNum', cellTemplate: pledgeOutTemplate, cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'trust', displayName: '托管机构', headerCellClass: 'ias-text-center', cellClass: setColorCenter, cellFilter: 'trustTranslate', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'issuer_rating_current', displayName: '主体评级', headerCellClass: 'ias-text-center', cellFilter: 'columnNullValue', cellClass: setColorCenter, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'enterprise_type', displayName: '企业性质', headerCellClass: 'ias-text-center', cellClass: setColorCenter, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'account_name', displayName: '账户名称', minWidth: '200', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                ];
            },
            exchangeColumnDef: function () {
                var codeTemplate = '<a href="" class="ias-bond-info code-name-color" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.bond_code }}</a>';
                var shortNameTemplate = '<a href="" class="ias-bond-info code-name-color" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.short_name }}</a>';
                var protocolPledgeOutVolume = '<detail-tip-btn tip-view-id="\'pledgeBondDetailPage\'" ng-if="row.entity.protocol_pledge_out  && row.entity.protocol_pledge_out.length > 0" \
                        show-detail-func="grid.appScope.showPledgeBondDetail(list)" bond-list="row.entity.protocol_pledge_out " style="float: right"\
                        tip-left="400" tip-top="85">\
                    </detail-tip-btn>\
                    <div style="float: right;margin-right: 10px;line-height: 30px" ng-class="{true: \'sum-data\'}[!row.entity.bond_key_listed_market]">{{ row.entity.protocol_pledge_out_volume | thousandthNum }}</div>';

                function setColor(grid, row, col) {
                    return row.entity.bond_key_listed_market ? 'ias-text-right' : 'sum-data ias-text-right';
                }

                function setColorCenter(grid, row, col) {
                    return row.entity.bond_key_listed_market ? 'ias-text-center' : 'sum-data ias-text-center';
                }

                return [
                    { field: 'bond_code', displayName: '债券代码', width: '150', cellTemplate: codeTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'short_name', displayName: '债券简称', width: '170', cellTemplate: shortNameTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'position_volume', displayName: '持仓(张)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum', cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'available_volume', displayName: '可用量(张)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum', cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'conversion_factor', displayName: '质押比(%)', width: '110', headerCellClass: 'ias-text-right', cellFilter: 'columnNullValue', cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'normalized_bond_available_volume', displayName: '可提交标准券(张)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum | columnNullValue', cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'normalized_bond_volume', displayName: '已入库标准券(张)', width: '140', headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum | columnNullValue', cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'protocol_pledge_out_volume', displayName: '协议式回购质押冻结(张)', width: '180', headerCellClass: 'ias-text-right', cellFilter: 'thousandthNum', cellTemplate: protocolPledgeOutVolume, cellClass: setColor, sortingAlgorithm: sortClass.numberCategoryFunc },
                    { field: 'issuer_rating_current', displayName: '主体评级', headerCellClass: 'ias-text-center', cellFilter: 'columnNullValue', cellClass: setColorCenter, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'enterprise_type', displayName: '企业性质', headerCellClass: 'ias-text-center', cellClass: setColorCenter, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'market', displayName: '交易场所', cellFilter: 'typeTranslate', headerCellClass: 'ias-text-center', cellClass: setColorCenter, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                    { field: 'account_name', displayName: '账户名称', minWidth: '200', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalCategoryFunc(a, b, rowA, rowB, direction) } },
                ];
            },
            purchaseColumnDef: function () {
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>';
                var accountGroupName = '<span class="btn btn-xs ">' +
                    '<img class="group-name-icon" tooltip data-original-title="{{row.entity.account_id | getAccountGroupName}}">' +
                    '</span>';
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn" ' +
                    'ng-click="grid.appScope.editPurchase(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delPurchaseBtnClicked(row.entity)"></button>' +
                    '</div>';
                var setRollingFunc = function (grid, row, col) {
                    return row.entity.is_rolling === '1' ? '是' : '否';
                };
                var basicColumn = [
                    {field: 'action',displayName: '编辑', width: '100', cellTemplate: editTemplate},
                    {field: 'action1', displayName: '序号', width: '5%',cellTemplate:sequenceTemplate},
                    {field: 'direction',displayName: '申购/赎回方向',width:'8%', cellFilter: 'purchaseDirection'},
                    {field: 'purchase_date',displayName: '申购/赎回日期',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'settlement_days',displayName: '清算速度',width:'6%', cellFilter: 'settlementDayBond'},
                    {field: 'settlement_date', displayName: '结算日期', width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'value_date',displayName: '起息日',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'issuer_term',displayName: '发行期限',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'maturity_date',displayName: '到期日期',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'target_cost',displayName: '目标收益',width:'7%', cellFilter:'toFixed4 | thousandthNum', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'exit_date',displayName: '退出日期',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'account_name', displayName: '账户名称',width:'8%'},
                    {field: 'amount',displayName: '金额',width:'10%', cellFilter:'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'exit_amount',displayName: '退出金额',width:'10%', cellFilter:'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'interest',displayName: '利息',width:'10%', cellFilter:'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'shares',displayName: '申购/赎回份额',width:'10%', cellFilter:'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'unit_asset_net',displayName: '申购/赎回净值',width:'10%', cellFilter:'toFixed4', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'customer',displayName: '客户',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'custom_type',displayName: '类别',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'channel',displayName: '发行渠道',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'release_end_date',displayName: '发行结束日',width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'is_rolling',displayName: '是否滚存', cellFilter:'isRollingTransfer', width:'8%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'account_id',displayName: '所在组合',width:'8%', cellTemplate: accountGroupName},
                    {field: 'comment',displayName: '备注',width:'8%',  cellTemplate: commentTemplate}
                ];
                return basicColumn;
            },
            dividendColumnDef: function() {
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>';
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn" ' +
                    'ng-click="grid.appScope.editDividend(row.entity)">编辑</button>'+
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delDividendBtnClicked(row.entity)"></button>' +
                    '</div>';
                var basicColumn = [
                    {field: 'action',displayName: '编辑', width: '100', cellTemplate: editTemplate},
                    {field: 'action1', displayName: '序号', width: '5%',cellTemplate:sequenceTemplate},
                    {field: 'trade_date',displayName: '发生日期',width:'12%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'settlement_days',displayName: '清算速度',width:'8%', cellFilter: 'settlementDayBond'},
                    {field: 'settlement_date', displayName: '结算日期', width:'12%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'account_name', displayName: '账户名称' },
                    {field: 'amount',displayName: '金额', cellFilter:'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right'},
                    {field: 'customer',displayName: '客户', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'comment',displayName: '备注' }
                ];
                return basicColumn;
            },
            fundReservesColumnDef: function() {
                var directionTemplate = '<div class="ui-grid-cell-contents">{{grid.appScope.showDirection(row.entity.direction)}}</div>';
                var settlementDaysTemplate = '<div class="ui-grid-cell-contents">T+{{row.entity.settlement_days}}</div>'
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn" ' +
                    'ng-click="grid.appScope.editFn(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.deleteFn(row.entity)"></button>' +
                    '</div>';
                var basicColumn = [
                    {field: 'action',displayName: '编辑', width: '100', cellTemplate: editTemplate},
                    {field: 'direction', displayName: '方向', minWidth: '100',cellTemplate: directionTemplate, cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'settlement_days',displayName: '到账日期/出账日期',minWidth:'300',cellTemplate: settlementDaysTemplate, cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'account_name',displayName: '本方账户',minWidth:'300', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'reserve_date', displayName: '发生日期', minWidth:'300', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'amount', displayName: '金额(元)',minWidth:'300', cellFilter:'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right'},
                    {field: 'comment',displayName: '备注',minWidth:'250', cellTemplate: commentTemplate,cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'}
                ];
                return basicColumn;
            },
            overviewTradeColumnDef: function(){
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>';
                var basicColumn = [
                    { field: 'action1', displayName: '序号', width: '4%', cellTemplate: sequenceTemplate },
                    { field: 'asset_type', displayName: '资产类型', width: '5%' },
                    { field: 'trade_date', displayName: '交易日期', width: '8%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'code', displayName: '代码', width: '5%', cellClass: 'tbody-special-font' },
                    { field: 'name', displayName: '资产名称', width: '8%', cellClass: 'tbody-special-font' },
                    { field: 'direction', displayName: '交易方向', width: '5%' },
                    { field: 'price', displayName: '交易价格', width: '5%', cellFilter: 'toFixed4:null:true', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'amount', displayName: '券面金额(万)', width: '8%', cellFilter: 'toFixed4:null:true', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'settlement_days', displayName: '清算速度', width: '5%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'settlement_date', displayName: '清算日期', width: '8%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'maturity_date', displayName: '到期日', width: '8%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'maturity_settlement_days', displayName: '到期清算速度', width: '8%', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'term', displayName: '回购期限', width: '5%', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.termFunc(a, b, direction); }},
                    { field: 'counter_party_account', displayName: '交易对手', width: '5%' },
                    { field: 'pledge_bonds', displayName: '质押券信息', width: '12%' },
                    { field: 'day_counter', displayName: '计息基准', width: '5%' },
                    { field: 'external_sn', displayName: '外部交易编号', width: '8%' },
                    { field: 'manager', displayName: '录入人', width: '8%', cellFilter: 'userNameFilter' },
                    { field: 'update_time', displayName: '编辑时间', width: '9%' },
                    { field: 'comment', displayName: '备注', width: '5%', cellTemplate: commentTemplate },
                ];
                return basicColumn;
            },
            bondTradesColumnDef: function () {
                var editTemplate = '<div ng-if="row.entity.trade_type != \'4\' && (row.entity.account_id | accountEditAuthority)"> ' +
                    '<button class="  quote-btn"' +
                    'ng-click="grid.appScope.editTrades(row.entity)">编辑</button>' +
                    '<button ng-hide="(row.entity.account_id | isAccountSrcTypeValuation:\'trade\')" class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delTrades(row.entity)"></button>' +
                    '</div>';
                var directionTemplate = '<div class="ui-grid-cell-contents">{{row.entity|directionBond:true}}</div> ';
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>';
                var codeTemplate = '<a href="" class="ias-bond-info" style="line-height: 30px;" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.bond_key_listed_market | codeBond}}</a>';
                var shortNameTemplate = '<a href="" class="ias-bond-info" style="line-height: 30px;" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.bond_key_listed_market | shortNameBond}}</a>';
                var basicColumn = [
                    { field: 'action2', displayName: '编辑', width: '100', cellTemplate: editTemplate },
                    { field: 'action1', displayName: '序号', width: '80', cellTemplate: sequenceTemplate },
                    { field: 'trade_date', displayName: '日期', width: '100', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'settlement_date', displayName: '结算日期', width: '120', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'bond_code', displayName: '代码', width: '140', cellTemplate: codeTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                    { field: 'short_name', displayName: '简称', width: '140', cellTemplate: shortNameTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                    { field: 'volume', displayName: '数量(张)', width: '100', cellFilter: 'thousandthNum', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'direction', displayName: '指令', width: '100', cellTemplate: directionTemplate, sortingAlgorithm: sortClass.numberPayTypeFunc },
                    { field: 'clean_price', displayName: '净价', width: '100', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'dirty_price', displayName: '全价', width: '100', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'ytm', displayName: '收益率(%)', width: '100', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'cost_on_dirty_price', displayName: '结算金额', width: '150', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'cost_on_clean_price', displayName: '净价结算金额', width: '150', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'cost_yield_type', displayName: '计算方式', width: '150', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center', cellFilter: 'toYieldType', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                    { field: 'settlement_days', displayName: '结算方式', width: '80', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center', cellFilter: 'settlementDayBond' },
                    { field: 'account_name', displayName: '账户', width: '120' },
                    { field: 'counter_party_account', displayName: '对手账户', width: '140' },
                    { field: 'counter_party_trader', displayName: '对手交易员', width: '140' },
                    { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                    { field: 'update_time', displayName: '编辑时间', width: '180' },
                    { field: 'comment', displayName: '备注', width: '140', cellTemplate: commentTemplate },
                    { field: 'accounting_type', displayName: '标识', width: '140', cellFilter: 'accountingTypeFilter' }
                ];
                return basicColumn;
            },
            stockTradesColumnDef: function () {
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn" ' +
                    'ng-click="grid.appScope.editTrades(row.entity)">编辑</button>' +
                    '<button ng-hide="(row.entity.account_id | isAccountSrcTypeValuation:\'trade\')" class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delTrades(row.entity)"></button>' +
                    '</div>';
                var directionTemplate = '<div class="ui-grid-cell-contents">{{row.entity|directionBond:true}}</div> ';
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>';
                var basicColumn = [
                    {field: 'action2',displayName: '编辑', width:'100', cellTemplate: editTemplate},
                    {field: 'action1', displayName: '序号', cellTemplate:sequenceTemplate},
                    {field: 'trade_date', displayName: '日期', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    {field: 'direction', displayName: '方向', cellFilter: 'directionBond' },
                    {field: 'stock_code', displayName: '代码', cellClass: 'tbody-special-font',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'stock_name',displayName: '简称', cellClass: 'tbody-special-font', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'volume',displayName: '数量', cellFilter:'thousandthNum', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right',sortingAlgorithm: sortClass.numberFunc },
                    {field: 'amount',displayName: '金额', cellFilter:'absoluteAmount | commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right',sortingAlgorithm: sortClass.numberFunc },
                    {field: 'account_name',displayName: '账户', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'manager',displayName: '录入人', cellFilter:'userNameFilter',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    { field: 'update_time', displayName: '编辑时间', width: '180' }
                ];
                return basicColumn;
            },
            fundTradesColumnDef: function () {
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn" ' +
                    'ng-click="grid.appScope.editTrades(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delTrades(row.entity)"></button>' +
                    '</div>';
                var directionTemplate = '<div class="ui-grid-cell-contents">{{row.entity|directionBond:true}}</div> ';
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>';
                var basicColumn = [
                    {field: 'action2',displayName: '编辑', width:'100', cellTemplate: editTemplate},
                    {field: 'action1', displayName: '序号', cellTemplate:sequenceTemplate},
                    {field: 'trade_date', displayName: '日期', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center'},
                    {field: 'direction', displayName: '方向', cellFilter: 'directionBond' },
                    {field: 'fund_code', displayName: '代码', cellClass: 'tbody-special-font'},
                    {field: 'fund_name',displayName: '简称', cellClass: 'tbody-special-font'},
                    {field: 'price', displayName: '单位净值', cellFilter: 'toFixed4', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'volume',displayName: '份额', cellFilter:'commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    {field: 'amount',displayName: '金额', cellFilter:'absoluteAmount | commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right',sortingAlgorithm: sortClass.numberFunc },
                    {field: 'cost_on_price',displayName: '确认金额', cellFilter:'absoluteAmount | commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right',sortingAlgorithm: sortClass.numberFunc },
                    {field: 'fee',displayName: '费用', cellFilter:'absoluteAmount | commafyConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right',sortingAlgorithm: sortClass.numberFunc },
                    {field: 'account_name',displayName: '账户', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'manager',displayName: '录入人', cellFilter:'userNameFilter',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    { field: 'update_time', displayName: '编辑时间', width: '180' }
                ];
                return basicColumn;
            },
            feeColumnDef: function () {
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>';
                var accountGroupName = '<span class="btn btn-xs ">' +
                    '<img class="group-name-icon" tooltip data-original-title="{{row.entity.account_id | getAccountGroupName}}">' +
                    '</span>';
                var editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="  quote-btn" ' +
                    'ng-click="grid.appScope.editFee(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delBtnClicked(row.entity)"></button>' +
                    '</div>';
                var basicColumn = [
                    {field: 'action',displayName: '编辑', width: '100', cellTemplate: editTemplate},
                    {field: 'action1', displayName: '序号', width: '9%',cellTemplate:sequenceTemplate},
                    {field: 'initial_date',displayName: '发生日期',width:'14%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'payment_date',displayName: '扣款日期',width:'14%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'},
                    {field: 'account_name', displayName: '账户',width:'14%'},
                    {field: 'account_id',displayName: '所在组合',width:'10%',  cellTemplate: accountGroupName},
                    {field: 'amount',displayName: '金额',width:'20%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: sortClass.numberFunc },
                    {field: 'comment',displayName: '备注',width:'10%', cellTemplate: commentTemplate, cellClass: 'ias-text-center', headerCellClass: 'ias-text-center'}
                ];
                return basicColumn;
            },
            cashTableColumnDef: function () {
                var codeTemplate = '<a href="" style="line-height: 30px" class="tbody-special-font" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.code}}</a>';
                var nameTemplate = '<a href="" style="line-height: 30px" class="tbody-special-font" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.name}}</a>';
                var setTreeLevelClass = function (grid, row, col) {
                    if (row.entity.first_val != undefined) {
                        return 'tree-level-view';
                    }
                    return 'tree-level-view';
                };
                return [
                    { field: 'execute_date', displayName: '日期', cellClass: setTreeLevelClass, width: '20%', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                    { field: 'code', displayName: '代码', width: '20%', cellTemplate: codeTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                    { field: 'name', displayName: '简称', width: '20%', cellTemplate: nameTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                    { field: 'amount', displayName: '金额', width: '10%', cellClass: 'ias-text-right', cellFilter: 'commafyConvert', headerCellClass: 'ias-text-right', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'desc', displayName: '描述', width: '15%' },
                    { field: 'account_name', displayName: '账户', width: '10%' }
                ];
            },
            bySellingColumnDef: function () {
                var volumeTemplate =
                    '<input limit-format-number  class="modal-input" style="width:90px; margin-top:7px" output-number="row.entity.sell_volume" change-value="grid.appScope.specifyVolumeChanged(row.entity)">';
                return [
                    { field: 'trade_date', displayName: '交易日', sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                    { field: 'volume', displayName: '持仓量', cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'action', displayName: '卖出量', cellTemplate: volumeTemplate, sortingAlgorithm: sortClass.numberFunc },
                    { field: 'clean_price', displayName: '成本净价', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'dirty_price', displayName: '成本全价', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'ytm', displayName: '到期收益率(%)', cellFilter: 'toFixed2', sortingAlgorithm: sortClass.numberFunc },
                    { field: 'ytcp', displayName: '行权收益率(%)', cellFilter: 'toFixed2', sortingAlgorithm: sortClass.numberFunc },
                    // {field: 'realized_gain',displayName: '已实现收益', cellFilter: 'toFixed4',width:'100',cellFilter:'commafyConvert',sortingAlgorithm: sortClass.numberFunc},
                    // {field: 'unrealized_gain',displayName: '未实现收益', cellFilter: 'toFixed4', width:'100',cellFilter:'commafyConvert',sortingAlgorithm: sortClass.numberFunc}
                ];
            },
            otherAssetColumnDef: function () {
                var columns = [
                    { field: 'name', displayName: '资产名称', width: '350' },
                    {
                        field: 'proportion', displayName: '比重(%)', width: '180', cellFilter: 'toPercentNoSign',
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue() | toFixed4:true:true }}</div>'},
                    {field: 'duration',displayName: '久期',width:'180', cellFilter: 'toFixed4', sortingAlgorithm: sortClass.numberFunc},
                    {field: 'dv01',displayName: 'dv01',width:'180',cellFilter: 'commafyConvert', sortingAlgorithm: sortClass.numberFunc},
                    {field: 'asset',displayName: '资产市值',width:'200', cellFilter: 'toFixed2:null:true',
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue() | toFixed2:true:true }}</div>'
                    }
                ];
                return columns;
            },
            futures_ColumnDef: function () {
                var columns = [
                    { field: 'direction', displayName: '方向', width: '100' },
                    { field: 'code', displayName: '期货合约', width: '180' },
                    {
                        field: 'proportion', displayName: '比重(%)', width: '200', cellFilter: 'toPercentNoSign'/*,
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue() | number:4 }}</div>'*/},
                    {
                        field: 'volume', displayName: '数量', width: '200', cellFilter: 'thousandthNum'/*,
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}}</div>'*/},
                    { field: 'market_price', displayName: '期货价格', width: '150' },
                    {
                        field: 'contract_value', displayName: '初始合约价值', width: '200', cellFilter: 'thousandthNum'/*,
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}}</div>'*/},
                    {
                        field: 'offset', displayName: '冲抵合约价值', width: '150', cellFilter: 'thousandthNum'/*,
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue() | number: 2}}</div>'*/},
                    {
                        field: 'fair_value', displayName: '公允价值', width: '150', cellFilter: 'thousandthNum'/*,
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue() | number: 2}}</div>'*/}
                ];
                return columns;
            },
            failedColumnDef: function () {
                var actionTemplate =
                    '<button class="  admin-grid-btn" ng-if="row.entity.course_code != null" ng-click="grid.appScope.checkPosition(row.entity)"> 校对' +
                    '</button>';

                var columns = [
                    {field: 'asset_type', displayName: '资产类型', width: '100'},
                    {field: 'course_code', displayName: '科目代码', minWidth: '100'},
                    {field: 'course_name', displayName: '科目名称', minWidth: '100'},
                    {field: 'action', displayName: '', width: '100', cellTemplate: actionTemplate}
                ];
                return columns;
            },
            bondTradeListColumnDef: function () {
                var directionTemplate = '<div class="ui-grid-cell-contents">{{row.entity|directionBond:true}}</div> ';
                var columns = [
                    { field: 'direction', displayName: '指令', width: '60', cellTemplate: directionTemplate },
                    { field: 'trade_date', displayName: '交易日期', width: '100', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'settlement_date', displayName: '结算日期', width: '100', headerCellClass: 'ias-text-center', cellClass: 'ias-text-center' },
                    { field: 'face_amount', displayName: '面额(万)', width: '100', cellFilter: 'parAmountConvert', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'clean_price', displayName: '净价', width: '100', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'dirty_price', displayName: '全价', width: '100', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'ytm', displayName: '收益率(%)', width: '90', cellFilter: 'toFixed4', headerCellClass: 'ias-text-right', cellClass: 'ias-text-right' },
                    { field: 'counter_party_account', displayName: '交易对手', width: '90' }
                ];
                return columns;
            },
            tfColumnDef: function (){
                let editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="quote-btn" ng-click="grid.appScope.editTrade(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delTrade(row.entity)"></button> ' +
                    '</div>';
                var columns = [
                    { field: 'action', displayName: '编辑', width: '100', cellTemplate: editTemplate },
                    { field: 'trade_date', displayName: '交易日期', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                    { field: 'tf_id', displayName: '代码' },
                    { field: 'trade_type', displayName: '交易方向' },
                    { field: 'price', displayName: '交易价格', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
                    { field: 'amount', displayName: '交易金额(万)', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
                    { field: 'volume', displayName: '持仓量(张)', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
                    { field: 'account_name', displayName: '账户' },
                    { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                    { field: 'update_time', displayName: '编辑时间', width: '180' },
                    { field: 'comment', displayName: '备注' }
                ];
                return columns;
            },
            tfMarginColumnDef: function (){
                let editTemplate = '<div ng-if="row.entity.account_id | accountEditAuthority"> ' +
                    '<button class="quote-btn" ng-click="grid.appScope.editTrade(row.entity)">编辑</button>' +
                    '<button class="ias-delete-btn ias-delete-icon ias-round-btn quote-delete-btn" ng-click="grid.appScope.delTrade(row.entity)"></button> ' +
                    '</div>';
                var columns = [
                    { field: 'action', displayName: '编辑', width: '100', cellTemplate: editTemplate },
                    { field: 'trade_date', displayName: '发生日期', cellClass: 'ias-text-center', headerCellClass: 'ias-text-center' },
                    { field: 'direction', displayName: '方向', width:'6%',  cellFilter: 'tfMarginDirection'},
                    { field: 'amount', displayName: '金额(元)', cellFilter: 'commafyConvert', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right' },
                    { field: 'account_name', displayName: '账户' },
                    { field: 'manager', displayName: '录入人', width: '140', cellFilter: 'userNameFilter' },
                    { field: 'update_time', displayName: '编辑时间', width: '180' },
                    { field: 'comment', displayName: '备注' }
                ];
                return columns;
            },

        }
    })
    .factory('portfolioTable', function () {
        return {
            transactColumnDef: function () {
                return [
                    { field: 'trade_date', displayName: '交易日', width: '100' },
                    { field: 'clean_price', displayName: '成本净价', width: '100' },
                    { field: 'dirty_price', displayName: '成本全价', width: '100' },
                    { field: 'ytm', displayName: '成本收益率', width: '100', cellFilter: 'toFixed4' }
                ];
            },
        }
    })
    .factory('incomeStatementTable', function(sortClass){
        var setColorFunc = function(grid, row, col) {
            if(row.entity.isLastRow == true){
                return 'sum-data ias-text-right';
            }
            return 'ias-text-right';
        };
        return {
            bondAssetColumnDef: function(){
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{! row.entity.isLastRow ? grid.renderContainers.body.visibleRowCache.indexOf(row)+1:"合计"}}</div>';
                var codeTemplate = '<div style="float: left;margin-top: 7px;"><a href="" class="code-name-color" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.asset_code }}</a></div>';
                var shortNameTemplate = '<div style="float: left;margin-top: 7px;padding-left: 5px"><a href="" class="code-name-color" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.asset_name }}</a></div>' +
                    '<div style="float: left;margin-top: 9px;height: 13px;margin-left: 3px">' +
                    '<img class="cross-market-icon" style="display:{{row.entity.is_cross_market | isCrossMarket }};height: 13px">' +
                    '</div>' +
                    '<div style="float: left;margin-top: 9px;height: 13px;margin-left: 3px">' +
                    '<img class="has-option-icon" style="display:{{row.entity.is_option_embedded | isOptionEmbedded }};height: 13px">' +
                    '</div>' +
                    '<div style="float: left;margin-top: 9px;height: 13px;margin-left: 3px;cursor:pointer;">' +
                    '<img class="has-redemption-icon" tooltip data-toggle="tooltip" data-placement="top" title="提前还款" style="display:{{row.entity.early_redemption | earlyRedemption }};height:16px;">' +
                    '</div>';

                var basicColumn = [
                    {field: 'action1', displayName: '序号', visible: true, width: '4%',cellClass: setColorFunc,cellTemplate:sequenceTemplate},
                    {field: 'asset_type', displayName: '资产类型', visible: true, _type: '持仓信息', width:'6%'},
                    {field: 'asset_name', displayName: '资产名称', visible: true, _type: '持仓信息', width: '8%', cellTemplate:shortNameTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'asset_code', displayName: '资产代码', visible: true, _type: '持仓信息', width: '8%', cellTemplate: codeTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'start_volume', displayName: '期初持仓(万)', visible: true, _type: '持仓信息',width:'10%', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'parAmountConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'end_volume', displayName: '期末持仓(万)', visible: true, _type: '持仓信息',width:'10%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'parAmountConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'val_type', displayName: '估值方式', visible: true, _type: '市值信息', width: '8%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter: 'valType', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'val_date',displayName: '估值日期', visible: true, _type: '市值信息', width:'7%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'val_clean_price', displayName: '估值净价', visible: true, _type: '市值信息', width:'8%', cellClass: setColorFunc,headerCellClass: 'ias-text-right',cellFilter:'toFixed4',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    // {field: 'end_pnl', displayName: '卖出/期末应计利息(元)',width:'10%', cellClass:npm -text-right', headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: sortClass.numberFunc },
                    //{field: 'origin_term', displayName: '原始期限',width:'8%'},
                    {field: 'coupon_received',displayName: '已收利息(元)', visible: true, _type: '持仓信息', width:'10%',cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'redemption_received',displayName: '已偿还本金(元)', visible: true, _type: '持仓信息', width:'10%',cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    // {field: 'capital_pnl',displayName: '资本利得(元)',width:'10%',cellClass: 'ias-text-right', headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: sortClass.numberFunc },
                  //  {field: 'realized_gain',displayName: '已实现损益(元)', width:'10%', cellFilter:'commafyConvert',sortingAlgorithm: sortClass.numberFunc },
                  //  {field: 'unrealized_pnl',displayName: '浮动收益(元)', width:'9%', cellFilter:'commafyConvert',sortingAlgorithm: sortClass.numberFunc },
                    {field: 'coupon',displayName: '票面利息收入(元)', visible: true, _type: '损益信息', width:'12%', cellClass: setColorFunc,headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'capital_pnl',displayName: '买卖价差(元)', visible: true, _type: '损益信息', width:'8%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'maturity_pnl',displayName: '持有到期收益(元)', visible: true, _type: '损益信息', width:'8%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'floating_pnl',displayName: '浮动盈亏(元)', visible: true, _type: '损益信息', width:'8%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'amortization',displayName: '折溢摊损益(元)', visible: true, _type: '损益信息', width:'8%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'realized_pnl',displayName: '已实现损益(元)', visible: true, _type: '损益信息', width:'8%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    // {field: 'uncomplete_statement',displayName: '未实现损益(元)', width:'10%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: sortClass.numberFunc },
                    {field: 'total_pnl',displayName: '总损益(元)', visible: true, _type: '损益信息', width:'7%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'interest_start_date',displayName: '起息日', visible: true, _type: '基础信息', width:'7%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'maturity_date',displayName: '到期日', visible: true, _type: '基础信息', width:'7%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    // {field: 'portfolio_contribution',displayName: '组合收益率贡献', width:'10%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    // {field: 'reference_contribution',displayName: '基准收益率贡献', width:'10%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}}
                ];

                return basicColumn;
            },

            fundColumnDef: function(){
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{! row.entity.isLastRow ? grid.renderContainers.body.visibleRowCache.indexOf(row)+1:"合计"}}</div>';
                var codeTemplate = '<div style="float: left;margin-top: 7px;" class="code-name-color">{{ row.entity.asset_code }}</div>';
                var shortNameTemplate = '<div style="float: left;margin-top: 7px;padding-left: 5px" class="code-name-color">{{ row.entity.asset_name }}</div>';

                var basicColumn = [
                    {field: 'action1', displayName: '序号', width: '4%',cellClass: setColorFunc,cellTemplate:sequenceTemplate},
                    {field: 'asset_type', displayName: '资产类型',width:'6%'},
                    {field: 'asset_code', displayName: '资产代码', width: '6%', cellTemplate: codeTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'asset_name', displayName: '资产名称', width: '8%', cellTemplate:shortNameTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'start_volume', displayName: '期初持仓面额',width:'12%', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'end_volume', displayName: '期末持仓面额',width:'12%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'dividend',displayName: '分红金额(元)', width:'8%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'fee',displayName: '费用(元)', width:'8%',cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'floating_pnl',displayName: '市值变动(元)', width:'12%',cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'realized_pnl',displayName: '已实现损益(元)', width:'12%',cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'total_pnl',displayName: '总损益(元)', width:'12%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},

                ];

                return basicColumn;
            },

            moneyColumnDef: function(){
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{! row.entity.isLastRow ? grid.renderContainers.body.visibleRowCache.indexOf(row)+1:"合计"}}</div>';
                var codeTemplate = '<div style="float: left;margin-top: 7px;" class="code-name-color">{{ row.entity.asset_code }}</div>';
                var shortNameTemplate = '<div style="float: left;margin-top: 7px;padding-left: 5px" class="code-name-color">{{ row.entity.asset_name }}</div>';

                var basicColumn = [
                    {field: 'action1', displayName: '序号', width: '4%',cellClass: setColorFunc,cellTemplate:sequenceTemplate},
                    {field: 'asset_type', displayName: '资产类型',width:'6%'},
                    {field: 'asset_code', displayName: '资产代码', width: '6%', cellTemplate: codeTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'asset_name', displayName: '资产名称', width: '7%', cellTemplate:shortNameTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'start_interest_accrued',displayName: '期初已计利息', width:'8%',cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'end_interest_accrued',displayName: '期末已计利息', width:'8%',cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'period_interest_accrued',displayName: '区间利息收入', width:'8%',cellClass:setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'amount',displayName: '本金(元)', width:'7%', cellClass:setColorFunc, cellFilter:'commafyConvert',headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'repo_rate',displayName: '利率(%)', width:'7%', cellClass: setColorFunc, cellFilter:'commafyConvert',headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'days',displayName: '天数', width:'7%', cellClass:setColorFunc, headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'real_days',displayName: '实际占款天数', width:'7%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'interest_total',displayName: '到期利息总计', width:'7%', cellClass: setColorFunc,cellFilter:'commafyConvert', headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'initial_settlement_date',displayName: '起息日', width:'7%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'maturity_settlement_date',displayName: '到期日', width:'8%', cellClass: 'ias-text-right', headerCellClass: 'ias-text-right',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}}

                ];

                return basicColumn;
            },
            allAssetColumnDef: function(){
                var sequenceTemplate = '<div class="ui-grid-cell-contents">{{! row.entity.isLastRow ? grid.renderContainers.body.visibleRowCache.indexOf(row)+1:"合计"}}</div>';
                var codeTemplate = '<div style="float: left;margin-top: 7px;"><a href="" class="code-name-color" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.asset_code }}</a></div>';
                var shortNameTemplate = '<div style="float: left;margin-top: 7px;padding-left: 5px"><a href="" class="code-name-color" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.asset_name }}</a></div>' +
                    '<div style="float: left;margin-top: 9px;height: 13px;margin-left: 3px">' +
                    '<img class="cross-market-icon" style="display:{{row.entity.is_cross_market | isCrossMarket }};height: 13px">' +
                    '</div>' +
                    '<div style="float: left;margin-top: 9px;height: 13px;margin-left: 3px">' +
                    '<img class="has-option-icon" style="display:{{row.entity.is_option_embedded | isOptionEmbedded }};height: 13px">' +
                    '</div>' +
                    '<div style="float: left;margin-top: 9px;height: 13px;margin-left: 3px;cursor:pointer;">' +
                    '<img class="has-redemption-icon" tooltip data-toggle="tooltip" data-placement="top" title="提前还款" style="display:{{row.entity.early_redemption | earlyRedemption }};height:16px;">' +
                    '</div>';

                var basicColumn = [
                    {field: 'action1', displayName: '序号', width: '6%',cellClass: setColorFunc,cellTemplate:sequenceTemplate},
                    {field: 'asset_type', displayName: '资产类型',width:'8%'},
                    {field: 'asset_code', displayName: '资产代码', width: '13%', cellTemplate: codeTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'asset_name', displayName: '资产名称', width: '9%', cellTemplate:shortNameTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                    {field: 'start_volume', displayName: '期初持仓面额',width:'12%', cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'end_volume', displayName: '期末持仓面额',width:'13%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'unrealized_pnl',displayName: '未实现损益(元)', width:'12%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'realized_pnl',displayName: '已实现损益(元)', width:'12%',cellClass: setColorFunc, headerCellClass: 'ias-text-right', cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                    {field: 'total_pnl',displayName: '总损益(元)', width:'12%', cellClass: setColorFunc, headerCellClass: 'ias-text-right',cellFilter:'commafyConvert',sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.numberBottomFunc(a, b, rowA, rowB, direction)}},
                ];

                return basicColumn;
            }
        }
    })
