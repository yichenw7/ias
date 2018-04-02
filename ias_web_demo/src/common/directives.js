angular.module('ias.directives')
    .directive('iasTabs', function() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                styleName: '@',
                panes: '=?',
                isDisabled: '=?',
                userDefinedFun : '&?'
            },
            controller: ['$scope', function($scope) {
                var panes = $scope.panes = [];

                $scope.select = function(pane) {
                    if (!$scope.isDisabled) {
                        angular.forEach(panes, function(pane) {
                            pane.selected = false;
                        });
                        pane.selected = true;
                        pane.onSelect();
                    }
                };

                //执行用户自定义函数
                if ($scope.userDefinedFun) {
                    $scope.userDefinedFun({theScope:$scope});
                };

                this.addPane = function(pane) {
                    if (panes.length === 0) {
                        $scope.select(pane);
                    }
                    panes.push(pane);
                };
            }],
            templateUrl: 'src/templates/ias-tabs.html'
        };
    })
    .directive('iasCheckbox', function() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            require: 'ngModel',
            scope: {
                ngModel: '=',
                ngChange: '&?',
                width: '@?',
                name: '=?'
            },
            link: function($scope, element, attrs, ngModelCtrl) {
                $scope.onChange = function() {
                    ngModelCtrl.$viewValue = $scope.ngModel;
                    ngModelCtrl.$commitViewValue();
                    $scope.ngChange && $scope.ngChange();
                }
            },
            templateUrl: 'src/templates/ias-checkbox.html'
        };
    })
    .directive('iasSearch', function() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                ngModel: '=',
                width: '@?'
            },
            link: function($scope, $element) {
                $scope.clear = function() {
                    $scope.ngModel = '';
                    $element.children()[1].focus();
                };
            },
            templateUrl: 'src/templates/ias-search.html'
        };
    })
    .directive('iasPane', function() {
        return {
            require: '^^iasTabs',
            restrict: 'E',
            transclude: true,
            scope: {
                tabTitle: '@',
                newNum: '=?',
                onSelect: '&onSelect',
                isHide: '=?',
            },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            template: '<div class="tab-pane" ng-show="selected" ng-transclude></div>'
        };
    })
    .directive('iasPaneComponent', function() {
        return {
            require: '^^iasTabs',
            restrict: 'E',
            transclude: true,
            scope: {
                tabTitle: '@',
                newNum: '=?',
                onSelect: '&onSelect',
                isHide: '=?',
            },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            template: '<div class="tab-pane" ng-if="selected" ng-transclude></div>'
        };
    })
    .directive('iasSelect', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                ngModel: '=',
                options: '=',
                width: '@',
                changeHandle: '&changeHandle'
            },
            controller: function($scope, $timeout, $element, $document) {
                $scope.changeStatus = function() {
                    $scope.isShowSelect = !$scope.isShowSelect;
                };

                $scope.select = function(option) {
                    $scope.ngModel = option;
                    $timeout(function() {
                        $scope.changeHandle();
                    }, 0);
                };

                $scope.handleClickOutside = function() {
                    $scope.isShowSelect = false;
                };

                // 不能够在全局拦截事件 by weilai
                // $document.on('click', function() {
                //     $timeout(function () {
                //         $scope.isShowSelect = false;
                //     });
                // });
            },
            templateUrl: 'src/templates/ias-select.html'
        };
    })
    .directive('iasMultiSelect', function() {
        return {
            restrict: 'E',
            scope: {
                options: '=?',
                width: '@?',
                canSelectAll: '=?'
            },
            controller: function ($scope, $element, $document, $timeout) {
                $scope.filterName = '';
                $scope.isShowDrop = false;
                $scope.isAllSelect = false;

                $scope.handleClickOutside = function() {
                    $scope.isShowDrop = false;
                };

                // 不能够在全局拦截事件 by weilai
                // $document.on('click', function () {
                //     $scope.isShowDrop = false;
                // });

                $scope.toggle = function () {
                    $scope.isShowDrop = !$scope.isShowDrop;
                };

                $scope.deleteSelectedOption = function (option) {
                    option.isSelected = false;
                };

                $scope.selectAll = function () {
                    $timeout(function() {
                        angular.forEach($scope.options, function (option) {
                            option.isSelected = $scope.isAllSelect;
                        });
                    })
                };
            },
            templateUrl: 'src/templates/ias-multi-select.html'
        }
    })
    .directive('tabTemplate', function (bondClientFilter, marketSocketSwitch, dealClientFilter,dateClass,
                                        bondDealMarket, dataCenter, qbBondFilter, selectTab) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                searchBoxIndexs: '=?',
                registToggle: '=?registToggleClick',
                filterBtnClick: '&filterBtnClick',
                expanded: '=?filterExpanded',
                showIndex: '=?',
                showFilterBtn: '=?',
                autoFlush: '=?',
                bondList: '=?',
                isAccountBond: '=?',
                activeTabName: '=?',
                groups: '=?',
                isAccountTab: '=?',
                userDefinedFun : '&?'
            },
            controller: function ($scope) {
                $scope.flushLabelName = "自动刷新";
                $scope.selectTab = selectTab;
                $scope.onClickFunc = function( ) {
                    $scope.filterBtnClick();
                };
                $scope.paneIndex = 0;
                $scope.isShowSearchBox = function(param) {
                    if ($.inArray(param , $scope.searchBoxIndexs) != -1) {
                        return true;
                    }
                    return false;
                };
                $scope.isShowCheckbox = function(param) {
                    if ($.inArray(param , $scope.showIndex) != -1) {
                        return true;
                    }
                    return false;
                };

                $scope.resetSearchText = function() {
                    if ($scope.activeTabName == 'bond') {
                        bondClientFilter.searchKey = '';
                    } else if ($scope.activeTabName == 'deal') {
                        dealClientFilter.searchKey = '';
                    }
                };
                $scope.resetMarketType = function(index) {
                    if (index == 1) {
                        $scope.marketType.value = bondClientFilter.marketType;
                    } else if (index == 3) {
                        $scope.marketType.value = bondDealMarket.type;
                    }
                };

                var panes = $scope.panes = [];

                $scope.init =function (index){
                    $scope.showCheckbox = $scope.isShowCheckbox(index);
                    $scope.showSearchBox = $scope.isShowSearchBox(index);
                    $scope.showAutoFlush = $scope.autoFlush;
                    $scope.resetSearchText();
                    $scope.resetMarketType(index);
                }

                $scope.select = function (pane) {
                    if (pane.selected != true) {
                        angular.forEach(panes, function (pane) {
                            pane.selected = false;
                        });
                        pane.selected = true;
                        $scope.init(pane.index);
                        pane.selectedFunc();
                    }
                };

                if ($scope.registToggle) {
                    $scope.$on("toggleClick", function (event, index) {
                            $scope.toggleSelect(index);
                    });
                }
                $scope.toggleSelect = function (index) {
                    if (index > 0 && index <= panes.length) {
                        $scope.init(index);
                        angular.forEach(panes, function (pane) {
                            if (pane.index == index) {
                                pane.selected = true;
                                pane.selectedFunc();
                            } else {
                                pane.selected = false;
                            }
                        });
                    }
                };

                this.addPane = function (pane) {
                    pane.selected = false;
                    pane.index = ++$scope.paneIndex;
                    if (panes.length == 0) {
                        pane.selected = true;
                    }
                    panes.push(pane);
                };
                $scope.showCheckbox = $scope.isShowCheckbox(1);

                if(!$scope.isAccountBond){
                    $scope.bondList = dataCenter.market.bondDetailList;
                }

                $scope.bondSelectFun = function(selected) {
                    if (selected) {
                        if ($scope.activeTabName == 'bond') {
                            bondClientFilter.searchKey = selected.originalObject.bond_id;
                        } else if ($scope.activeTabName == 'deal') {
                            dealClientFilter.searchKey = selected.originalObject.bond_id;
                        }
                    } else {
                        $scope.resetSearchText();
                    }
                };

                $scope.marketType = {
                    value:"interBank"
                };

                $scope.newMarketType = function(isExchange) {
                    if ($scope.activeTabName == 'bond') {
                        bondClientFilter.marketType = $scope.marketType.value;

                        //qb 筛选
                        qbBondFilter.isExchange = isExchange;
                        qbBondFilter.brokers =  qbBondFilter.isExchange ? ['e'] : qbBondFilter.interBank;
                    } else if ($scope.activeTabName == 'deal') {
                        bondDealMarket.type = $scope.marketType.value;
                    }
                };

                $scope.switchOn = function() {
                    marketSocketSwitch.on = document.getElementById("onOff").checked;
                    $scope.flushLabelName = (marketSocketSwitch.on) ? "自动刷新" : "停止刷新";
                };
                //执行用户自定义函数
                if ($scope.userDefinedFun) {
                    $scope.userDefinedFun({theScope:$scope});
                }

                $scope.init(1);

                $scope.$on('$destroy', function() {
                    $scope = null;
                });
            },
            templateUrl: 'src/templates/tab-template.html'
        };
    })
    .directive('panelTemplate', function () {
        return {
            require: '^tabTemplate',
            restrict: 'E',
            transclude: true,
            scope: {
                name: '=?tabName',
                selectedFunc: '&selectedFunc',
                updateTaskNum: '=?',
                isShowValuationIcon: '=?',
                isShowValuationPlusIcon: '=?'
            },
            link: function (scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
                scope.$on('$destroy', function() {
                    scope = null;
                })
            },
            template: '<div class="tab-pane" ng-show="selected" ng-transclude></div>'
        };
    })
    .directive('panelTemplateComponent', function () {
        return {
            require: '^tabTemplate',
            restrict: 'E',
            transclude: true,
            scope: {
                name: '=?tabName',
                selectedFunc: '&selectedFunc',
                updateTaskNum: '=?',
                isShowValuationIcon: '=?',
                isShowValuationPlusIcon: '=?'
            },
            link: function (scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
                scope.$on('$destroy', function() {
                    scope = null;
                })
            },
            template: '<div class="tab-pane" ng-if="selected" ng-transclude></div>'
        };
    })
    .directive('draggable', function($document) {
        var startX = 0, startY = 0, x = 0, y = 0;
        // 定义不移动的标签：INPUT, BUTTON, A等等
        var NOT_MOVED_ELEMENTS = ['INPUT' , 'BUTTON' , 'A' , 'LABEL' , 'SELECT' , 'TEXTAREA'];
        return function(scope, element, attr) {
            element.css({
                position: 'relative',
                cursor: 'pointer'
            });

            element.bind('mousedown', function(event) {
                // 当点击元素名不为NOT_MOVED_ELEMENTS时才触发事件，解决按住<input><a><button>也能拖曳的问题
                if ( NOT_MOVED_ELEMENTS.indexOf(event.target.tagName) < 0 ) {
                    x = this.offsetLeft;
                    y = this.offsetTop;
                    startX = event.screenX - x;
                    startY = event.screenY - y;
                    $document.bind('mousemove', mousemove);
                    $document.bind('mouseup', mouseup);
                }
            });

            function mousemove(event) {
                y = event.screenY - startY;
                x = event.screenX - startX;
                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        }
    })
    .directive('modalDialog', function () {
        return {
            require: '^draggable',
            restrict: 'E',
            transclude: true,
            scope: {
                title: '=?titleName',
                idName: '=?idName',
                size: '=?modalSize',
                width: '=?widthClass',
                conBtnName: '=?confirmBtnName',
                confirmHandler: '&confirmHandler',
                hiddenFunc: '&hiddenFunc'
            },
            controller: function ($scope) {
                $scope.dismiss = function() {
                    $scope.hiddenFunc();
                    $("#"+$scope.idName).modal('hide');
                };

                $scope.confirm = function() {
                    if($scope.confirmHandler()){
                        return;
                    }
                    $scope.dismiss();
                };
                $scope.$on('$destroy', function() {
                    $scope = null;
                })
            },
            templateUrl: 'src/templates/modal-dialog.html'
        }
    })
    .directive('btnLiGroup', function($timeout) {
        return {
            restrict: 'E',
            scope:{
                modelObj: '=ngModel',
                btnGroup: '=?',
                changeBtn: '&changeBtn',
                isDisabled: '=?'
            },
            transclude: true,
            controller: function ($scope){
                $scope.$on('$destroy', function() {
                    $scope = null;
                });

                $scope.init = function() {
                    if ($scope.modelObj > $scope.btnGroup.length){
                        $scope.modelObj = $scope.btnGroup[0].value;
                    }
                };
            },
            link: function($scope, element, attrs) {
                $scope.selectBtn = function (btn) {
                    if (!$scope.isDisabled) {
                        $scope.modelObj = btn.value;
                        $timeout(function(){
                            $scope.changeBtn({value: $scope.modelObj});
                        },0)
                    }
                }
                $scope.$watch(
                    function() { return $scope.btnGroup; },
                    function(newValue, oldValue) {
                        if (newValue === oldValue) {
                            return;
                        }
                        $scope.init(); // 当$scope.btnGroup发生变化时，重新初始化
                    }
                )
            },
            templateUrl: 'src/templates/btn-li-group.html'
        }
    })
    .directive('tabTipGroup', function() {
        return {
            restrict: 'E',
            require:'?ngModel',
            transclude: true,
            scope:{
                btnGroup: '=?',
                hasNumber: '=?',
                hasSum: '=?',
                changeBtn: '&changeBtn',
                navTabStyle: '=?' // 'sub-tab-wrap', 'sup-tab-wrap', 'left-tab-wrap'
            },
            controller: function ($scope){
                $scope.$on('$destroy', function() {
                    $scope = null;
                });

                $scope.select = {
                    index: null,
                    value: null
                };

                $scope.init = function() {
                    var find = false;
                    $.each($scope.btnGroup, function(index, btn){
                        btn.index = index;
                        if ($scope.select.value == null && index == 0) {
                            find =true;
                            $scope.select.index = btn.index;
                            $scope.select.value = btn.value;
                        } else if ($scope.select.value != null && btn.value == $scope.select.value){
                            find =true;
                            $scope.select.index = btn.index;
                            $scope.select.value = btn.value;
                        }
                    });

                    if (!find) {
                        $scope.select.index = 0;
                        $scope.select.value = $scope.btnGroup[0].value;
                    }
                };

                $scope.toggleSelect = function (value) {
                    $.each($scope.btnGroup, function(index, btn){
                        if (value == btn.value) {
                            $scope.select.index = btn.index;
                            return false;
                        }
                    });
                };

                $scope.selectBtn = function(button) {
                    $scope.select.index = button.index;
                    $scope.select.value = button.value;
                };

                $scope.init();
            },
            link: function($scope, element, attrs, ngModelCtrl) {
                if (!ngModelCtrl) {
                    return;
                }
                $scope.$watch(
                    function() {return $scope.select.value;},
                    function(newValue, oldValue) {
                        if (newValue === oldValue) {
                            return;
                        }
                        ngModelCtrl.$setViewValue($scope.select.value);
                        $scope.changeBtn({value: $scope.select.value});
                    }
                );

                $scope.$watch(
                    function() {return ngModelCtrl.$modelValue;},
                    function() {
                        if ($scope.select.value != ngModelCtrl.$modelValue) {
                            $scope.select.value = ngModelCtrl.$modelValue;
                            $scope.toggleSelect(ngModelCtrl.$modelValue);
                        }
                    }
                );

                $scope.$watch(
                    function() { return $scope.btnGroup; },
                    function(newValue, oldValue) {
                        if (newValue === oldValue) {
                            return;
                        }
                        $scope.init(); // 当$scope.btnGroup发生变化时，重新初始化
                    }
                )
            },
            templateUrl: 'src/templates/tab-tip-group.html'
        }
    })
    .directive('datetimepicker', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                config: '=?',
                changeDateHandler: '&?'
            },
            link: function($scope, element, attrs, ngModelCtrl) {
                element.datepicker($scope.config).on("hide", function(){
                    ngModelCtrl.$setViewValue(element.val());
                });
                element.on("click", function(e){
                    element.datepicker('update');
                });
                if ($scope.changeDateHandler) {
                    element.on("change", function(){
                        $scope.changeDateHandler({date:element.val()})
                    });
                }

                $scope.$watch(
                    function() { return $scope.config.startDate; },
                    function(newValue, oldValue) {
                        if (newValue === oldValue) {
                            return;
                        }
                        if (element.val() < newValue) {
                            element.datepicker('setDate', newValue);
                        }
                        element.datepicker('setStartDate', newValue);
                    }
                )

                $scope.$on('$destroy', function() {
                    element.datepicker("remove");
                    $scope = null;
                });
            }
        }
    })
    .directive('tooltip', function() {
        return  {
            restrict: 'A',
            link: function($scope, element, attrs) {
                element.hover(function(){
                    element.tooltip('show');
                }, function(){
                    element.tooltip('hide');
                });
                $(document).click(function(e){
                    element.tooltip('hide');
                });
                $(element).tooltip({html: false, container: 'body'});
                $scope.$on('$destroy', function() {
                    $scope = null;
                })
            }
        }
    })
    .directive('rightContextMenu', function(GridConfigService) {
        function showMenu(event, id) {
            $('#' + id).css({
                left: event.clientX + 'px',
                top: event.clientY + 'px',
                display: 'block',
                position: 'fixed'
            });
        }

        function hideMenu(id) {
            $('#' + id).css({
                display: 'none'
            });
        }

        return {
            restrict: 'A',
            scope: '@&',
            link: function ($scope, element, attr) {
                var id = attr.rightContextMenu;

                element.bind('contextmenu', function (event) {
                    GridConfigService.gridName = attr.gridName;
                    event.preventDefault();
                    showMenu(event, id);
                });

                $(document).click(function (e) {
                    hideMenu(id);
                });

                $scope.$on('$destroy', function () {
                    $scope = null;
                });
            }
        }
    })
    .directive('uiGridRow', function ($animate, $timeout) {
        return {
            priority: -1,
            link: function ($scope, $elm, $attrs) {
                $scope.$watch('row.entity.isUpdate', function (newValue,oldValue) {
                    if (newValue === oldValue) {
                        return ;
                    }
                    if ($scope.row.entity.isUpdate) {
                        $elm.children(".showBorder").addClass("only-border");
                        $elm.children(".showLeftBorder").addClass("only-left-border");
                        $elm.children(".showRightBorder").addClass("only-right-border");

                        $timeout(function () {
                            $animate.removeClass($elm.children(".showBorder"), 'only-border');
                            $animate.removeClass($elm.children(".showLeftBorder"), 'only-left-border');
                            $animate.removeClass($elm.children(".showRightBorder"), 'only-right-border');
                        },1000);
                        $scope.row.entity.isUpdate= false;
                    }
                });
            }
        };
    })
    .directive('detailTipBtn', function($timeout){
        var isolate_scope = {};
        var tipViewIds = [];
        var expandedSets = [];
        function hideMenu (event) {
            if (isolate_scope.theScope) {
                isolate_scope.theScope.expandedObj.is=true;
                $timeout(function(){
                    isolate_scope.theScope.$apply();
                },10);
            }
            jQuery.each( tipViewIds, function (i,v){
                $('#' + v).css({
                    display: 'none'
                });
            });
            event.stopPropagation();
        };
        function showMenu (event, scope) {
            var tipView = $('#' + isolate_scope.tipViewId);

            tipView.css({
                left: event.clientX -isolate_scope.theScope.tipLeft + 'px',
                top: event.clientY - isolate_scope.theScope.tipTop + 'px',
                bottom: '',
                display: 'block',
                position: 'fixed'
            });

            if (scope.viewHeight && scope.viewHeight + event.clientY - isolate_scope.theScope.tipTop > $(window).height()) {
                tipView.css({
                    top: event.clientY - scope.viewHeight - 10 + 'px'
                });
            }

            if (scope.viewHeight > event.clientY) {
                tipView.css({
                    top: event.clientY + 10 + 'px'
                });
            }

            if(tipView.height() + event.clientY > $(window).height()){
                tipView.css({
                    top: '',
                    bottom: '0px',
                });
            }

            if(tipView.width() + event.clientX - isolate_scope.theScope.tipLeft > $(window).width()){
                tipView.css({
                    left:  event.clientX - tipView.width() -10 + 'px'
                });
            }

            event.preventDefault();
            event.stopPropagation();
        };
        function clickFn (e){
            if (e.target.id == 'exportTxt') {
                hideMenu(e);
                return ;
            }

            if ( !$('#' + isolate_scope.tipViewId).position()) {
                return ;
            }

            var left =$('#' + isolate_scope.tipViewId).position().left;
            var top = $('#' + isolate_scope.tipViewId).position().top;

            if (e.clientX > left && e.clientX < left + isolate_scope.theScope.tipLeft*2 ) {
                if (e.clientY > top && e.clientY < top + isolate_scope.theScope.tipTop + 10) {
                    return;
                }
            }

            jQuery.each(expandedSets,function(i,v){
                v.is=true;
            });
            hideMenu(e);
        }
        function showTip (e, scope) {
            isolate_scope.theScope.expandedObj.is = true;
            isolate_scope.theScope = scope;
            isolate_scope.tipViewId = scope.tipViewId;
            scope.expandedObj.is = false;
            if (scope.showDetailFunc != null) {
                scope.showDetailFunc({list:scope.bondList});
            }

            showMenu(e, scope);
            scope.positionLeft = $('#' + isolate_scope.tipViewId).position().left;
            scope.positionTop = $('#' + isolate_scope.tipViewId).position().top;
        }
        function hideTip (e, scope) {
            isolate_scope.theScope = scope;
            isolate_scope.tipViewId = scope.tipViewId;
            scope.expandedObj.is = true;
            hideMenu(e);
        }
        return {
            restrict: 'E',
            transclude: true,
            scope:{
                tipViewId:'=?',
                bondList:'=?',
                showDetailFunc: '&?',
                tipLeft:'=?',
                tipTop:'=?',
                viewHeight: '=?',
            },
            link: function($scope, element, attr) {
                isolate_scope = {tipViewId : $scope.tipViewId};
                isolate_scope.theScope = $scope;
                if(!angular.isDefined($scope.tipLeft)){
                    $scope.tipLeft = 490;
                }
                if(!angular.isDefined($scope.tipTop)){
                    $scope.tipTop = 240;
                }

                $scope.expandedObj = {
                    is: true
                };
                expandedSets.push($scope.expandedObj);

                if( tipViewIds.indexOf($scope.tipViewId) == -1) {
                    tipViewIds.push($scope.tipViewId);
                }

                $scope.showTip = function($event) {
                    showTip($event, $scope);
                };

                $scope.hideTip = function($event) {
                    hideTip($event, $scope);
                };

                $scope.$on('$destroy', function() {
                    $scope = null;
                });

                $(document).unbind('click',clickFn).bind('click',clickFn);
            },
            templateUrl: 'src/templates/detailTipBtn.html'
        }
    })
    .directive('limitFormatNumber', function ($filter,$timeout) {                      //如果想要得到输入的数字，可通过outputNumber属性来获取
        function  format(value){
            return $filter('numberDot')(value)
        }
        var currentScope = {
            id : null,
        }
        return {
            scope: {
                regexpStr: "@",  //自定义正则
                outputNumber: "=?",
                changeValue: "&",
                numberPoint: "@", //小数点位数
                canNegative: "=?"
            },
            restrict: 'A',
            link: function (scope, element, attrs, ctr) {
                //记录指令状态参数
                scope.status = {
                    hasDot: false, //记录是否包含小数点，默认为false
                    once: true, //记录指令是否第一次加载

                };
                // 默认限制四位小数
                var numberPoint = scope.numberPoint ? scope.numberPoint : 4;
                var regexpStr = "^(-)?[1-9]\\d*(\\.\\d{0,"+ numberPoint + "})?|^(-)?0(\\.\\d{0," + numberPoint + "})?";
                scope.regexpStr = scope.regexpStr ? scope.regexpStr : regexpStr ;
                var regexp = new RegExp(scope.regexpStr);
                scope.$watch(function(){
                    return scope.outputNumber;
                },function(newValue, oldValue){
                    if (newValue === oldValue && !scope.status.once) {
                        return;
                    }
                    scope.status.once = false;
                    var selectionIndex = element[0].selectionStart; // 记录光标位置的参数
                    var inputValue;
                    if(scope.outputNumber < 0){
                        inputValue = '-' + format(scope.outputNumber * -1);
                    }
                    else {
                        inputValue = format(scope.outputNumber);
                    }
                    if (scope.status.hasDot) {
                        inputValue += '.';
                    }
                    element.val(inputValue);
                    //判断该input是否正在输入中
                    if (currentScope.id == scope.$id) {
                        element[0].setSelectionRange(selectionIndex, selectionIndex);
                    }
                });
                element.bind('input  propertychange',function (event) {
                    currentScope.id = scope.$id;
                    var selectionIndex = element[0].selectionStart; //记录光标位置的参数
                    var number = element.val().replace(/,/g, "").replace(/^-+/, "-");
                    var inputText = '', value = '';
                    if (regexp.exec(number)) {
                        var value = regexp.exec(number)[0];
                    } else {
                        var value = number === '-' ? '-' : '';
                    }
                    //判断输入是否包含小数点
                    scope.status.hasDot = value.substr(-1) === '.';
                    //判断输入是否为负数
                    if (value.indexOf('-') > -1 && !scope.canNegative) {
                        inputText = format(value.slice(1));
                    } else {
                        inputText = (number === '-') ? '-' : format(value);
                    }
                    //判断格式化后光标的位置
                    for (var i = 0; i <= inputText.length ; i++) {
                        if (inputText.substr(0, i).replace(/,/g, "").length ==
                            element.val().substr(0, selectionIndex).replace(/,/g, "").length) {
                            selectionIndex = i;
                            break;
                        }
                    }
                    element.val(inputText);
                    element[0].setSelectionRange(selectionIndex,selectionIndex);
                    scope.$apply(function(){
                        scope.outputNumber = (parseInt(value) === 0) || (value && Number(value)) ? Number(value) : undefined;
                        $timeout(function () {
                            scope.changeValue();
                        }, 0);
                    });
                });
                scope.$on('$destroy', function () {
                    scope = null;
                })
            }
        }
    })
    .directive('dealInputWidget', function(dataCenter) {
        return {
            restrict: 'E',
            require:'?ngModel',
            transclude: true,
            scope:{
                isShowSearch: '=?'
            },
            controller: function ($scope,hcMarketData, selectTypes,dealPage, bondClientFilter) {
                $scope.$on('$destroy', function () {
                    $scope = null;
                });

                $scope.initInputData = function () {
                    hcMarketData.showBtnList = true;
                    selectTypes.dealInput = dealPage.cash;
                    $scope.$emit("open DealInputDlg");
                };

                $scope.bondList = dataCenter.market.bondDetailList;

                $scope.bondSelectFun = function(selected) {
                    if (selected) {
                        bondClientFilter.searchKey = selected.originalObject.bond_id;
                    } else {
                        $scope.resetSearchText();
                    }
                };

                $scope.resetSearchText = function() {
                    bondClientFilter.searchKey = '';
                };
            },

            link: function($scope, element, attrs, ngModelCtrl) {
                if (!ngModelCtrl) {
                    return;
                }
            },
            templateUrl: 'src/templates/dealInputWidget.html'
        }
    })
    .directive('clickOutside', function ($document) {
        return {
            restrict: 'A',
            scope: {
                clickOutside: '&'
            },
            link: function (scope, element, attr) {
                function onClick(event) {
                    // 性能优化，已经隐藏的内容不再触发
                    if (angular.element(element).hasClass("ng-hide")) return;
                    if (element === event.target || element[0].contains(event.target)) return;

                    scope.$apply(function () {
                        scope.clickOutside();
                    });
                }

                $document.on('click', onClick);

                scope.$on("$destroy", () => {
                    $document.off("click", onClick);
                });
            }
        }
    })
    .directive('sideTabs', function($timeout) {
        return {
            restrict: 'E',
            scope: {
                tabs: '=?'
            },
            link: function (scope, element, attrs, ctr) {
                scope.isOut = true;

                element.on('click', function(event) {
                    if (['UL', 'DIV', 'SPAN'].indexOf(event.target.nodeName) > -1) {
                        scope.$apply(function(){
                            scope.isOut = !scope.isOut;
                        });
                    }
                });

                scope.handleClickOutside = function() {
                    scope.isOut = false;
                };

                scope.changeSelectTab = function($event, tab) {
                    if (tab.clickHandler) {
                        tab.clickHandler();
                    }
                };
            },
            templateUrl: 'src/templates/side-tabs.html'
        }
    })
    .directive('bondImportDlg', function(apiAddress, FileUploader, filterParam,dataCenter, hcMarketData, accountUtils,
                                       user,$window,accountGroup,accountConstant, messageBox, systemAdminData,bondsRequest) {
        return {
            restrict: 'E',
            transclude: true,
            scope:{
                idName: '=idName'
            },
            controller: function($scope) {
                $scope.accounts = dataCenter.account.accountsData;
                $scope.trade = {
                    multi_loading: false,
                    multi_message: '',
                    multi_file_name: 'import_temp.xls',
                    multi_detail: '',
                    account_list: [],
                    account_clears: [],
                    cover_mode: 'inc'
                };

                $scope.onStopMultiClicked = function(){
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = '';
                    $scope.trade.multi_detail = '';
                    $scope.trade.account_list = [];
                    $scope.trade.account_clears = [];
                };

                $scope.onCoverClicked = function(){
                    messageBox.warn('完全替换会把原来数据全部覆盖！');
                };

                var multi_uploader = $scope.multi_uploader = new FileUploader({
                    url: apiAddress + '/upload',
                    autoUpload: true
                });

                multi_uploader.filters.push({
                    name: 'customFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        return this.queue.length < 10;
                    }
                });
                multi_uploader.onBeforeUploadItem = function (item) {
                    item.enctype = "multipart/form-data";
                    item.formData = [{
                        'company_id':user.company_id,
                        'user': user.name,
                        'cmd':100,
                        'inc':$scope.trade.cover_mode
                    }];
                    $scope.trade.multi_loading = true;
                    $scope.trade.multi_message = '';
                    $scope.trade.multi_detail = '';

                };
                multi_uploader.onSuccessItem  = function(item, response, status, headers) {
                    console.info('onSuccessItem: response: %s, status: %d, header: %s.', response, status, headers);
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = response;
                    $scope.trade.multi_detail = response
                };
                multi_uploader.onErrorItem  = function(item, response, status, headers) {
                    console.info('onErrorItem: response: %s, status: %d, header: %s.', response, status, headers);
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = response;
                    $scope.trade.multi_detail = response
                };
                multi_uploader.onCancelItem  = function() {
                    console.info('onCancelItem');
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = '导入失败!';
                    $scope.trade.multi_detail = '前端导入失败!'
                };

                $scope.isEmpty = accountUtils.isEmpty;

                $scope.dismiss = function() {
                    $("#"+$scope.idName).modal('hide');
                    bondsRequest.get({
                        company_id: user.company_id
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            var data = response.data;
                            systemAdminData.bondList = data;
                        }
                    }, function failed () {

                    });
                };

                $scope.confirm = function() {
                    $scope.dismiss();
                };

                $scope.$on('$destroy', function() {
                    $scope = null;
                });
            },
            templateUrl: 'src/system/dialog/importDlg/importBondDlg.html'
        }
    })
    .directive('investBondImportDlg', function(apiAddress, FileUploader, filterParam,dataCenter, hcMarketData,
                                               user,$window ,accountGroup,accountConstant, messageBox,
                                               bondsInvestRequest,systemAdminData, accountUtils) {

        return {
            restrict: 'E',
            transclude: true,
            scope:{
                idName: '=idName'
            },
            controller: function($scope) {
                $scope.accounts = dataCenter.account.accountsData;
                $scope.trade = {
                    multi_loading: false,
                    multi_message: '',
                    multi_file_name: 'import_temp.xls',
                    multi_detail: '',
                    account_list: [],
                    account_clears: [],
                    cover_mode: 'inc'
                };

                $scope.onStopMultiClicked = function(){
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = '';
                    $scope.trade.multi_detail = '';
                    $scope.trade.account_list = [];
                    $scope.trade.account_clears = [];
                };

                $scope.onCoverClicked = function(){
                    messageBox.warn('完全替换会把原来数据全部覆盖！');
                };

                var multi_uploader = $scope.multi_uploader = new FileUploader({
                    url: apiAddress + '/upload',
                    autoUpload: true
                });

                multi_uploader.filters.push({
                    name: 'customFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        return this.queue.length < 10;
                    }
                });
                multi_uploader.onBeforeUploadItem = function (item) {
                    item.enctype = "multipart/form-data";
                    item.formData = [{
                        'company_id':user.company_id,
                        'user': user.name,
                        'cmd':101,
                        'inc':$scope.trade.cover_mode
                    }];
                    $scope.trade.multi_loading = true;
                    $scope.trade.multi_message = '';
                    $scope.trade.multi_detail = '';
                };
                multi_uploader.onSuccessItem  = function(item, response, status, headers) {
                    console.info('onSuccessItem: response: %s, status: %d, header: %s.', response, status, headers);
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = response;
                    $scope.trade.multi_detail = response
                };
                multi_uploader.onErrorItem  = function(item, response, status, headers) {
                    console.info('onErrorItem: response: %s, status: %d, header: %s.', response, status, headers);
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = response;
                    $scope.trade.multi_detail = response
                };
                multi_uploader.onCancelItem  = function() {
                    console.info('onCancelItem');
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = '导入失败!';
                    $scope.trade.multi_detail = '前端导入失败!'
                };

                $scope.isEmpty = accountUtils.isEmpty;

                $scope.dismiss = function() {
                    $("#"+$scope.idName).modal('hide');
                    bondsInvestRequest.get({
                        company_id: user.company_id
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            // IAS-2917 值与引用的坑。
                            systemAdminData.investBondList.length = 0;
                            response.data.forEach(item => systemAdminData.investBondList.push(item));
                        }
                    }, function failed () {

                    });
                };

                $scope.confirm = function() {
                    $scope.dismiss();
                };

                $scope.$on('$destroy', function() {
                    $scope = null;
                });
            },
            templateUrl: 'src/system/dialog/importDlg/importInvestBondDlg.html'
        }
    })
    .directive('performanceAttributionTable', function() {
        return {
            restrict: 'E',
            scope: {
                title: '=?',
                data: '=?',
                showDetail: "&"
            },
            templateUrl: 'src/templates/performance-attribution-table.html'
        }
    })
    .directive('homePageBoard', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                boardTitle: '=?',
                unComplete: '=?'
            },
            templateUrl: 'src/home/home-page-board.html'
        }
    })
