angular.module('ias.account').controller('scenarioDialogCtrl', function($scope, yieldCurveShifts) {
    $scope.yieldCurveShifts = angular.copy(yieldCurveShifts);

    $scope.handleTypeChanged = () => {
        if ($scope.yieldCurveShifts.type === 'all') {
            $scope.yieldCurveShifts.list.forEach((item) => item.value = 0);
        }
        if ($scope.yieldCurveShifts.type === 'keyTerm') {
            $scope.yieldCurveShifts.value = 0;
        }
    };

    $scope.save = () => {
        if ($scope.yieldCurveShifts.type === 'all') {
            yieldCurveShifts.type = 'all';
            yieldCurveShifts.value = $scope.yieldCurveShifts.value;
        }

        if ($scope.yieldCurveShifts.type === 'keyTerm') {
            yieldCurveShifts.type = 'keyTerm';
            yieldCurveShifts.list = angular.copy($scope.yieldCurveShifts.list);
        }
        $('#scenarioDialog').modal('hide');
    };

    $scope.close = () => {
        $('#scenarioDialog').modal('hide');
    };

    $('#scenarioDialog').on('show.bs.modal', function() {
        $scope.yieldCurveShifts = angular.copy(yieldCurveShifts);
        $scope.handleTypeChanged();
    });
});
