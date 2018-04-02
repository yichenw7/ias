angular.module('ias.components')
    .directive('accountMultiSelect', function (dataCenter, authorityConstant) {
        return {
            restrict: 'E',
            require: '?ngModel',
            transclude: true,
            scope: {
                selectedVal: '=?',
                disabledInput: '=?',
                hasValuationDate: '=?'
            },
            controller: function ($scope, $timeout, $document, $element) {
                $scope.$on('$destroy', function () {
                    $scope = null;
                });

                $scope.traders = $scope.traders = angular.copy(dataCenter.account.accountsData);
                $scope.updateSelectedTraders = function (trader) {
                    trader.ichecked = !trader.ichecked;  // checked改为ichecked，因账户选择dlg会去修改dataCenter.account.accountsData，里面取名也叫checked，会影响到，故这里改名
                    $scope.selectAllCheck = false;
                    var tradersTxt = '';
                    var tradersVal = [];
                    $scope.traders.forEach(function (trader) {
                        if (trader.ichecked) {
                            tradersTxt = tradersTxt + trader.name + ';';
                            tradersVal.push(trader.id);
                        }
                    });
                    $scope.selectedTxt = tradersTxt;
                    $scope.selectedVal = angular.copy(tradersVal);
                };

                $scope.getEditAccount = function (account) {
                    if ($scope.hasValuationDate) {
                        return account.valuation_dates && account.valuation_dates.length > 0;
                    }
                    return (account.option == authorityConstant.ACCOUNT_WRITE);
                };

                $scope.initTraders = function (idList) {
                    if (idList == null || idList.length == 0) {
                        $scope.selectAllCheck = false;
                        $scope.traders.forEach(function (trader) {
                            if (trader.ichecked) {
                                trader.ichecked = false;
                            }
                        });
                        $scope.selectedTxt = '';
                        $scope.selectedVal = [];
                    } else {
                        var tradersTxt = '';
                        var tradersVal = [];
                        $.each($scope.traders, function (index, trader) {
                            trader.ichecked = false;
                            $.each(idList, function (idex, id) {
                                if (trader.id == id) {
                                    tradersTxt = tradersTxt + trader.name + ';';
                                    tradersVal.push(trader.id);
                                    trader.ichecked = true;
                                    return false;
                                }
                            })
                        });

                        $scope.selectedTxt = tradersTxt;
                        $scope.selectedVal = angular.copy(tradersVal);
                        if ($scope.selectedVal.length == $scope.traders.length) {
                            $scope.selectAllCheck = true;
                        }
                    }
                };

                $scope.handleClickOutside = function() {
                    $scope.dropdown = false;
                };

                $scope.selectAll = function () {
                    $scope.selectAllCheck = !$scope.selectAllCheck;
                    if (!$scope.selectAllCheck) {
                        $scope.initTraders([]);
                        return;
                    }

                    var tradersTxt = '';
                    var tradersVal = [];
                    $scope.traders.forEach(function (trader, index) {
                        if (!$scope.getEditAccount(trader)) return;
                        if (!trader.ichecked) {
                            trader.ichecked = true;
                        }
                        tradersTxt = tradersTxt + trader.name + ';';
                        tradersVal.push(trader.id);
                    });
                    $scope.selectedTxt = tradersTxt;
                    $scope.selectedVal = angular.copy(tradersVal);
                };
            },
            link: function ($scope, element, attrs, ngModelCtrl) {
                if (!ngModelCtrl) {
                    return;
                }
                $scope.$watch(
                    function () { return ngModelCtrl.$modelValue; },
                    function () {
                        $scope.initTraders(ngModelCtrl.$modelValue);
                    }
                )

                $scope.$watchCollection(
                    function () { return dataCenter.account.accountsData; },
                    function () {
                        $scope.traders = angular.copy(dataCenter.account.accountsData);
                    }
                );
            },
            templateUrl: 'src/common/components/multiSelect/account-multi-select.html'
        }
    });