(function(angular) {

    // TODO 导入成功文字改为绿色

    angular.module('ias.system').directive('libImportDlg', function (apiAddress, FileUploader, filterParam, dataCenter, hcMarketData,
        user, $window, accountGroup, accountConstant, messageBox,
        systemAdminData, accountUtils, systemAdminService) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                idName: '=idName'
            },
            controller: function ($scope) {
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

                $scope.onStopMultiClicked = function () {
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = '';
                    $scope.trade.multi_detail = '';
                    $scope.trade.account_list = [];
                    $scope.trade.account_clears = [];
                };

                $scope.onCoverClicked = function () {
                    messageBox.warn('完全替换会把原来数据全部覆盖！');
                };

                var multi_uploader = $scope.multi_uploader = new FileUploader({
                    url: apiAddress + '/upload',
                    autoUpload: true
                });

                multi_uploader.filters.push({
                    name: 'customFilter',
                    fn: function (item /*{File|FileLikeObject}*/, options) {
                        return this.queue.length < 10;
                    }
                });
                multi_uploader.onBeforeUploadItem = function (item) {
                    item.enctype = "multipart/form-data";
                    item.formData = [{
                        'company_id': user.company_id,
                        'user': user.name,
                        'cmd': 102,
                        'inc': $scope.trade.cover_mode
                    }];
                    $scope.trade.multi_loading = true;
                    $scope.trade.multi_message = '';
                    $scope.trade.multi_detail = ''
                };
                multi_uploader.onSuccessItem = function (item, response, status, headers) {
                    console.info('onSuccessItem: response: %s, status: %d, header: %s.', response, status, headers);
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = response;
                    $scope.trade.multi_detail = response
                };
                multi_uploader.onErrorItem = function (item, response, status, headers) {
                    console.info('onErrorItem: response: %s, status: %d, header: %s.', response, status, headers);
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = response;
                    $scope.trade.multi_detail = response
                };
                multi_uploader.onCancelItem = function () {
                    console.info('onCancelItem');
                    $scope.trade.multi_loading = false;
                    $scope.trade.multi_message = '导入失败!';
                    $scope.trade.multi_detail = '前端导入失败!'
                };

                $scope.isEmpty = accountUtils.isEmpty;

                $scope.dismiss = function () {
                    $("#" + $scope.idName).modal('hide');

                    systemAdminService.buildHttpRequestDefer('rivalCompanyResource.getList')({
                        company_id: user.company_id
                    }).then(data => {
                        systemAdminData.libList = data;
                    }, res => { });
                };

                $scope.confirm = function () {
                    $scope.dismiss();
                };

                $scope.$on('$destroy', function () {
                    $scope = null;
                });
            },
            templateUrl: 'src/system/dialog/importDlg/importLibDlg.html'
        }
    })

})(window.angular);