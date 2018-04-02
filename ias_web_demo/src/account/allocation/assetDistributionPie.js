angular.module('ias.account').factory('AssetDistributionPie', function() {
    var baseConfig = {
        type: "pie",
        theme: "iasTheme",
        startRadius: "50%",
        startEffect: "easeInSine",
        startDuration: 1,
        labelRadius: 15,
        innerRadius: "0%",
        balloonText: "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
        angle: 0,
        outlineThickness: 0,
        fontSize: 14,
        valueField: "asset",
        titleField: "type",
        precision: 2,
    }
    return {
        account: {
            issuerRating: null,
            rating: null,
            listedMarket: null,
            bondType: null,
            cashEquivalents: null,
            isMunicipal: null,
            sector: null
        },
        draw: function(page, scope, valueField) {
            var self = this;
            var pagePies = this[page];
            if (!pagePies) return;
            angular.forEach(pagePies, function(pie, pieName) {
                var pieId = page + '_' + pieName;
                var pieData = scope[pieName];
                pagePies[pieName] = self._drawPie(pieId, pieData, valueField, pie);
            });
        },
        _drawPie: function(id, data, valueField, pie) {
            data = data ? data : [];
            data = data.filter(function(item) { return (item.type !== 'total') });
            if (pie) {
                pie.valueField = valueField;
                pie.dataProvider = data;
                // **统计口径**为债券市值时：所描述的比重应该与后台统计的比重(percentage)一致，因为 比重之和 !== 100%
                pie.labelText = (valueField === 'asset') ? '[[title]]: [[percentage]]%' : '[[title]]: [[percents]]%';
                pie.balloonText = (valueField === 'asset')
                    ? "[[title]]<br><span style='font-size:14px'><b>[[value]]</b></span>"
                    : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                pie.validateData();
                return pie;
            } else {
                return AmCharts.makeChart(id, angular.merge({}, baseConfig, {
                    labelText : (valueField === 'asset') ? '[[title]]: [[percentage]]%' : '[[title]]: [[percents]]%',
                    balloonText : (valueField === 'asset')
                        ? "[[title]]<br><span style='font-size:14px'><b>[[value]]</b></span>"
                        : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
                    valueField: valueField,
                    dataProvider: data,
                }));
            }
        },
        clear: function(page) {
            var pagePies = this[page];
            if (!pagePies) return;
            angular.forEach(pagePies, function(pie, pieName) {
                if (!pie) return;
                pie.clear();
            });
        }
    }
})
