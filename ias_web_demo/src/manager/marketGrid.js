angular.module('ias.manager').factory('marketTable', function (sortClass, uiGridConstants) {
    var getBadGoodClass = function (data) {
        if (data == null || data == '' || data == '--') {
            return 'tbody-font';
        }
        if (typeof data === 'string') {
            if (data.indexOf('-') != -1) {
                return 'bad-price-color';
            } else {
                return 'good-price-color';
            }
        } else if (typeof data === 'number') {
            if (data < 0) {
                return 'bad-price-color';
            } else if (data > 0) {
                return 'good-price-color';
            }
        }
        return 'tbody-font';
    };
    return {
        bondColumnDef: function (isManager) {
            var ttmTemplate = '<div class="ttm-wrap">{{ row.entity.ttm }}' +
                '<img ng-if="row.entity.maturity_holiday && row.entity.maturity_holiday!=\'0\'" ng-src="./images/holiday/holiday_sml_{{row.entity.maturity_holiday}}.png">' +
                '</div>';

            var codeTemplate = '<a href="" class="ias-bond-info" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.bond_id }}</a>';

            var shortNameTemplate = '<div class="short-name-wrap">' +
                '<a href="" class="ias-bond-info" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.short_name }}</a>' +
                '<img ng-if="row.entity.is_cross_mkt && row.entity.is_cross_mkt==\'Y\'" class="cross-market-icon">' +
                '<img ng-if="row.entity.has_option && row.entity.has_option==\'含权\'" class="has-option-icon"' +
                '</div>';

            var positionTemplate = '<div style="float: left;margin-top: 7px;padding-left: 5px">{{ row.entity.positions | bondPositionTotal }}</div>' +
                '<div ng-if="row.entity.positions != undefined && row.entity.positions != null"><detail-tip-btn tip-view-id="\'positionBondPage\'" ' +
                'show-detail-func="grid.appScope.showPositionBonds(list)" ' +
                'bond-list="row.entity.positions" style="float: right;"' +
                'tip-left="200" view-height= "140" tip-top="150">' +
                '</detail-tip-btn></div>';

            var bidVolumeTemplate = '<div class="showEllipsis" style="margin-top: 7px;padding-left: 5px;" tooltip data-toggle="tooltip" data-placement="top" data-original-title="{{row.entity.bid_volume|isShowTooltip:7}}">{{ row.entity.bid_volume}}</div>';

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

            var companyTemplate = '<p style="border-radius:3px;padding:2px;margin: 4px;background-color:{{ row.entity.company_id |colorFilter }};text-align: center">{{ row.entity.company_id | brokerFilter }}</p>';

            var basicBondColumn = [
                { field: 'ttm', displayName: '剩余期限', width: '100', pinnedLeft: true, cellTemplate: ttmTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.termFunc(a, b, direction); } },
                { field: 'bond_id', displayName: '代码', width: '100', pinnedLeft: true, cellTemplate: codeTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.bondCodeFunc(a, b, direction) } },
                { field: 'short_name', displayName: '简称', width: '160', pinnedLeft: true, cellTemplate: shortNameTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                { field: 'positions', displayName: '持仓信息', width: '120', cellTemplate: positionTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.positionFunc(a, b, direction) } },
                /*{field: 'invest', displayName: '所在库', width: '6%', cellFilter: 'libTypeBond',  sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.investFunc(a,b, direction)}},*/
                {field: 'deal.clean_price', displayName: '成交净价', width: '80', sortingAlgorithm:sortClass.numberFunc},
                {field: 'deal.clean_price_change', displayName: '净价偏离度', width: '95', cellFilter: 'cdcAuthority',
                    cellClass: function(grid, row, col) {return getBadGoodClass(row.entity.deal.clean_price_change)}, headerTooltip: '成交净价/中债净价-1',
                    sortingAlgorithm:function(a, b, rowA, rowB, direction){return sortClass.rateFunc(a, b, direction)}},
                {field: 'deal.yield', displayName: '成交收益率', visible: true, width: '95', sortingAlgorithm:sortClass.numberFunc},
                {field: 'deal.ytm_yield', displayName: '到期成交收益率', visible: false, width: '120', sortingAlgorithm:sortClass.numberFunc},
                {field: 'deal.ytcp_yield', displayName: '行权成交收益率', visible: false, width: '120', sortingAlgorithm:sortClass.numberFunc},
                {field: 'deal.yield_change', displayName: '收益率偏离度', width: '105', cellFilter: 'cdcAuthority',
                    cellClass:function(grid, row, col) {return getBadGoodClass(row.entity.deal.yield_change)}, headerTooltip: '中债估值-成交收益率',
                    sortingAlgorithm:sortClass.numberFunc},
                {field: 'bid_volume', displayName: '委买量', width: '85', cellClass: 'showLeftBorder', cellTemplate:bidVolumeTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.volumeFunc(a,b, direction)}},
                {field: 'bid_price', displayName: 'Bid', width: '85', cellClass:'bid-info showBorder', cellTemplate:bidPriceTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.priceFunc(a,b, direction)}},
                {field: 'deal.volume', displayName: '成交量', width: '85', visible: false, cellClass: 'showBorder',sortingAlgorithm:sortClass.numberFunc},
                {field: 'ofr_price', displayName: 'Ofr', width: '85', cellClass: 'ofr-info showBorder', cellTemplate: ofrPriceTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.priceFunc(a,b, direction)}},
                {field: 'ofr_volume', displayName: '委卖量', width: '80', cellClass: 'showRightBorder', cellTemplate:ofrVolumeTemplate, sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.volumeFunc(a,b, direction)}},
                {field: 'coupon_rate', displayName: '票面利率', width: '80', sortingAlgorithm: sortClass.numberFunc },
                {field: 'cdc_val_yield', displayName: '中债估值', width: '80', cellFilter: 'cdcAuthority', sortingAlgorithm: sortClass.numberFunc },
                {field: 'cdc_val_clean_price', displayName: '中债净价', width: '80', cellFilter: 'cdcAuthority', sortingAlgorithm: sortClass.numberFunc },
                {field: 'cdc_val_duration', displayName: '久期', width: '80',  sortingAlgorithm: sortClass.numberFunc },
                {field: 'rating', displayName: '主/债', width: '80',  sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.ratingFunc(a,b, direction)}},
                {field: 'issuer_outlook_current', displayName: '展望', width: '60', cellFilter: 'outlookCurrentBond',  sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.outLookFunc(a,b, direction)}},
                {field: 'csi_val_yield', displayName: '中证估值',width: '80', sortingAlgorithm: sortClass.numberFunc },
                {field: 'csi_val_clean_price', displayName: '中证净价',width: '80', sortingAlgorithm: sortClass.numberFunc },
                {field: 'option_client', displayName: '含权类型',width: '80',  sortingAlgorithm:function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'option_date', displayName: '行权日', width: '100',  sortingAlgorithm:function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'csi_val_minus_cdc_val', displayName: '中证-中债',width: '85', cellFilter: 'cdcAuthority', sortingAlgorithm: sortClass.numberFunc },
                {field: 'is_cross_mkt', displayName: '跨市场',width: '60',  sortingAlgorithm:function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'sector', displayName: '行业', width: '90',  sortingAlgorithm:function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'issuer_rating_institution_name', displayName: '评级机构',width: '80',  sortingAlgorithm:function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'update_time', displayName: '最后更新',width: '90',  sort: { direction: uiGridConstants.DESC}},
                {field: 'bid_minus_cdc_val', displayName: 'bid-中债', width: '85', cellFilter: 'cdcAuthority', sortingAlgorithm: sortClass.numberFunc },
                {field: 'cdc_val_minus_ofr', displayName: '中债-ofr', width: '85', cellFilter: 'cdcAuthority', sortingAlgorithm: sortClass.numberFunc },
                {field: 'bid_minus_csi_val', displayName: 'bid-中证',width: '85', sortingAlgorithm: sortClass.numberFunc },
                {field: 'csi_val_minus_ofr', displayName: '中证-ofr',width: '85', sortingAlgorithm: sortClass.numberFunc },
                {field: 'company_id', displayName: '经纪商', width: '80',  cellTemplate: companyTemplate}
            ];

            if (!isManager) {
                basicBondColumn.splice(0, 1);
                basicBondColumn.splice(3, 1);
            }
            return basicBondColumn;
        },
        dealColumnDef: function (isManager) {
            var ttmTemplate = '<div class="ttm-wrap">{{ row.entity.ttm }}' +
                '<img ng-if="row.entity.maturity_holiday && row.entity.maturity_holiday!=\'0\'" ng-src="./images/holiday/holiday_sml_{{row.entity.maturity_holiday}}.png">' +
                '</div>';

            var codeTemplate = '<a href="" class="ias-bond-info" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.bond_id }}</a>';
            var shortNameTemplate = '<div class="short-name-wrap">' +
                '<a href="" class="ias-bond-info" ng-click="grid.appScope.OpenBondDetailPage(row.entity.bond_key_listed_market, $event)">{{ row.entity.short_name }}</a>' +
                '<img ng-if="row.entity.is_cross_mkt && row.entity.is_cross_mkt==\'Y\'" class="cross-market-icon">' +
                '<img ng-if="row.entity.has_option && row.entity.has_option==\'含权\'" class="has-option-icon">' +
                '</div>';
            var directionTemplate = '<img ng-src="{{row.entity.direction | dealDirection}}" style="margin-top: 9px; margin-left: 4px">';
            var companyTemplate = '<p style="border-radius:3px;padding:2px;margin: 4px;background-color:{{row.entity.company_id |colorFilter }};text-align: center">{{ row.entity.company_id | brokerFilter }}</p>';
            var positionTemplate = '<div  style="float: left;margin-top: 7px;padding-left: 5px">{{ row.entity.positions | bondPositionTotal }}</div>' +
                '<div ng-if="row.entity.positions != undefined && row.entity.positions != null"><detail-tip-btn tip-view-id="\'positionBondPage\'" ' +
                ' show-detail-func="grid.appScope.showPositionBonds(list)" ' +
                'bond-list="row.entity.positions" style="float: right;"' +
                'tip-left="200" view-height= "140" tip-top="150"></detail-tip-btn></div>';
            var basicBondColumn = [
                { field: 'direction', displayName: '方向', width: '50', pinnedLeft: true, cellTemplate: directionTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.directionFunc(a, b, direction); } },
                { field: 'ttm', displayName: '剩余期限', width: '100', pinnedLeft: true, cellTemplate: ttmTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.termFunc(a, b, direction); } },
                { field: 'bond_id', displayName: '代码', width: '100', pinnedLeft: true, cellTemplate: codeTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.bondCodeFunc(a, b, direction) } },
                { field: 'short_name', displayName: '简称', width: '130', pinnedLeft: true, cellTemplate: shortNameTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.naturalFunc(a, b, direction) } },
                { field: 'positions', displayName: '持仓信息', width: '120', cellTemplate: positionTemplate, sortingAlgorithm: function (a, b, rowA, rowB, direction) { return sortClass.positionFunc(a, b, direction) } },
                //{field: 'invest', displayName: '所在库', width: '5%', cellFilter: 'libTypeBond',  sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.investFunc(a,b, direction)}},
                {field: 'clean_price_change', displayName: '净价偏离度',width: '95', cellFilter: 'cdcAuthority',
                    cellClass:function(grid, row, col) {return getBadGoodClass(row.entity.clean_price_change)},  headerTooltip: '成交净价/中债净价-1',
                    sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.rateFunc(a,b, direction)}},
                {field: 'yield', displayName: '成交收益率', visible: true, width: '95', sortingAlgorithm: sortClass.numberFunc },
                {field: 'ytm', displayName: '到期成交收益率', visible: false, width: '120',  sortingAlgorithm:sortClass.numberFunc},
                {field: 'ytcp', displayName: '行权成交收益率', visible: false, width: '120',  sortingAlgorithm:sortClass.numberFunc},
                {field: 'yield_change', displayName: '收益率偏离度',width: '105', cellFilter: 'cdcAuthority',
                    cellClass:function(grid, row, col) {return getBadGoodClass(row.entity.yield_change)},  headerTooltip: '中债估值-成交收益率',
                    sortingAlgorithm:sortClass.numberFunc},
                {field: 'clean_price', displayName: '成交净价',width: '80', sortingAlgorithm: sortClass.numberFunc },
                {field: 'coupon_rate', displayName: '票面利率', width: '80', sortingAlgorithm: sortClass.numberFunc },
                {field: 'cdc_val_yield', displayName: '中债估值', width: '80', cellFilter: 'cdcAuthority', sortingAlgorithm: sortClass.numberFunc },
                {field: 'cdc_val_clean_price', displayName: '中债净价',width: '80', cellFilter: 'cdcAuthority', sortingAlgorithm: sortClass.numberFunc },
                {field: 'cdc_val_duration', displayName: '久期', width: '80', sortingAlgorithm: sortClass.numberFunc },
                {field: 'rating', displayName: '主/债', width: '80', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.ratingFunc(a,b, direction)}},
                {field: 'issuer_outlook_current', displayName: '展望', width: '60', cellFilter: 'outlookCurrentBond',  sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.outLookFunc(a,b, direction)}},
                {field: 'csi_val_yield', displayName: '中证估值',width: '80', sortingAlgorithm: sortClass.numberFunc },
                {field: 'csi_val_clean_price', displayName: '中证净价',width: '80',  sortingAlgorithm: sortClass.numberFunc },
                {field: 'option_client', displayName: '含权类型',width: '80', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'option_date', displayName: '行权日',width: '100', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'is_cross_mkt', displayName: '跨市场',width: '60', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'sector', displayName: '行业',width: '90', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'issuer_rating_institution_name', displayName: '评级机构',width: '80', sortingAlgorithm: function(a, b, rowA, rowB, direction){return sortClass.naturalFunc(a,b, direction)}},
                {field: 'company_id', displayName: '经纪商', width: '80',  cellTemplate: companyTemplate},
                {field: 'update_time', displayName: '最后更新', width: '90',cellFilter: 'dayTimeFilter',  sort: { direction: uiGridConstants.DESC}}
            ];

            if (!isManager) {
                basicBondColumn.splice(4, 1);
            }
            return basicBondColumn;
        }
    }
})