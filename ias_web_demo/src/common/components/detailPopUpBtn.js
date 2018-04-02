'use strict';

angular.module('ias.common').component('detailPopUpBtn', {
    transclude: true,
    templateUrl: 'src/common/components/template/detailPopUpBtn.html',
    bindings: {
        popupTemplateUrl: '@?',
        popDataContext: '<',

        popPanelClass: '@'
    },
    controller: ['$mdPanel', '$scope', function ($mdPanel, $scope) {

        this.$scope = $scope;

        this._mdPanel = $mdPanel;

        // var dataDefine = {
        //     itemSourceType: {
        //         issuerBtn: {
        //             head: ["标题", "机构", "发布时间"]
        //         }
        //     }
        // };        

        var popDataContext;

        this.$onInit = () => {
            if (this.popDataContext) popDataContext = this.popDataContext;
        };

        this.$onChanges = event => {
            if (!event) return;

            if (event.popDataContext.currentValue) {                
                if (this.popDataContext) popDataContext = this.popDataContext;
            }
        };

        this.onClickButton = event => {

            if (event.cancelable) {
                event.stopPropagation();
                window.event.cancelBubble = true
            }

            var panelMenuCtrl = ['mdPanelRef', '$httpParamSerializer', function (mdPanelRef, $httpParamSerializer) {

                angular.merge(this.$scope, popDataContext);

                this._mdPanelRef = mdPanelRef;

                // this.onClickListItem = function (event) {
                //     if (!event || !event.target) return;

                //     var elem = angular.element(event.target);

                //     if (!elem) return;

                //     var dataContext = elem.scope();
                //     while (dataContext && !dataContext.row) dataContext = dataContext.$parent;
                //     dataContext = dataContext.row;

                //     this._mdPanelRef.close();

                //     // http://172.16.66.35:8088/news-qb/goto/qb.negative.index?news_id=h3sujgogzk&issuer_code=T000187    
                //     var param = $httpParamSerializer({ news_id: dataContext.news_id, issuer_code: dataContext.issuer_code });
                //     var url = "http://172.16.66.35:8088/news-qb/goto/qb.negative.index?" + param;

                //     window.open(url, '_blank');
                // };
            }];

            var position = $mdPanel.newPanelPosition()
                .relativeTo('.detailPopUpBtn-' + this.$scope.$id)
                .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.BELOW);

            // var tableData = function (define, itemSource) {
            //     var target = angular.copy(itemSource);
            //     target.unshift(define.head);
            //     return target;
            // }(dataDefine.itemSourceType[this.itemSourceType], this.itemSource);

            var config = {
                attachTo: angular.element(document.body),
                controller: panelMenuCtrl,
                controllerAs: '$ctrl',
                panelClass: this.popPanelClass || 'detail-popup-panel',
                position: position,
                locals: {
                    // headData: this.headData,
                    // itemSource: tableData,
                    // itemSourceType: this.itemSourceType
                },
                openFrom: event,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: true,
                // zIndex: 102
            };

            if (this.popupTemplateUrl) config.templateUrl = this.popupTemplateUrl;
            else config.template = '<div style="border: 8px solid #383B44; width: 170px" class="ss_bg_secondary" role="listbox">\
                    <ul class="ss-list-group ss-back-style" ng-click="$ctrl.onClickListItem($event)">\
                        <li class="ss-list-item" ng-repeat="item in $ctrl.itemSource">{{item}}</li>\
                    </ul>\
                </div>';

            $mdPanel.open(config);
        };

    }]
});