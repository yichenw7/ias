angular.module('ias.account').factory('checkAsset', function() {
    return {
        map: {},
        list: [],
        import_assets: {},
        account_list: [],
        file_info: {},
        errorDetail: ''
    }
});
angular.module('ias.account').directive('hcImportDlg', function(apiAddress, FileUploader, filterParam,dataCenter, hcMarketData, socketServer,
                                       user,$window,accountGroup,accountConstant, messageBox,winStatus,accountService,$timeout,
                                        importExcel, checkAsset, authorityConstant, authorityControl, bondInfo) {
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
                    multi_file_name: 'import_temp.xls',
                    account_list: [],
                    account_clears: [],
                    cover_mode: 'inc'
                };

                $scope.closeImportDlg = function(){
                    importExcel.view_image = false;
                };

                $scope.onCoverClicked = function(){
                    messageBox.warn('完全替换会把原来数据全部覆盖！');
                };

                var multi_uploader = $scope.multi_uploader = new FileUploader({
                    url: apiAddress + '/upload'
                    // autoUpload: true
                });

                multi_uploader.filters.push({
                    name: 'customFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        return this.queue.length < 20;
                    }
                });

                multi_uploader.filters.push({
                    name: 'accountFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        if($scope.trade.account_list.length==0) {
                            messageBox.warn('请选择账户！');
                            return false;
                        }else{
                            return true;
                        }
                    }
                });

                multi_uploader.onAfterAddingAll = function (addedItems) {
                    $.each(addedItems, function (index, item) {
                        item.index = new Date().getTime() + '_' + index;
                    })
                };

                multi_uploader.onBeforeUploadItem = function (item) {
                    item.enctype = "multipart/form-data";
                    item.formData = [{
                        'company_id':user.company_id,
                        'user': user.name,
                        index: item.index
                    }];
                    $scope.trade.multi_loading = true;
                };
                multi_uploader.onSuccessItem  = function(item, response, status, headers) {
                    if ($scope.trade.account_list.length == 0) {
                        return;
                    }
                    $scope.trade.multi_file_name = response;
                    accountGroup.notify_import({
                        account_group_id: accountConstant.group_id,
                        account_list: $scope.trade.account_list,
                        company_id: user.company_id,
                        user_id: user.id,
                        action: 'trades_import',
                        file_name: response,
                        cover_mode: $scope.trade.cover_mode,
                        index: item.formData[0].index,
                        progress_percent: 10, // 文件上传成功，导入进度 10%
                    });
                };

                multi_uploader.onErrorItem  = function() {
                    $scope.trade.multi_loading = false;
                };
                multi_uploader.onCancelItem  = function() {
                    $scope.trade.multi_loading = false;
                };

                //延迟刷新
                multi_uploader.enableRefresh = true;

                $scope.table_style = {
                    height:  '0px',
                    width: '828px'
                };
                $scope.dlg_height = {
                    height: '220px'
                };
                $scope.$watch(
                    function() {return multi_uploader.queue.length;},
                    function() {
                        var  height = 30 *  multi_uploader.queue.length;
                        if (height > 300) {
                            height = 300;
                            $scope.table_style.width = '835px';
                        } else {
                            $scope.table_style.width = '828px';
                        }
                        $scope.dlg_height.height = 220 + height + 'px';
                        $scope.table_style.height = height + 3 + 'px';
                    }
                );

                $scope.$watch(
                    function(){ return hcMarketData.importDlgEvent},
                    function(newValue, oldValue) {
                        if (newValue == oldValue) {
                            return;
                        }
                        if(!$scope.trade.multi_loading){
                            $scope.trade.cover_mode = 'inc';
                            $scope.trade.account_list = [];
                            $scope.trade.account_clears = [];
                            $scope.need_check = null;
                            checkAsset.map = {};
                            checkAsset.list.length = 0;
                            checkAsset.file_info = {};
                            checkAsset.account_list = [];
                            checkAsset.import_assets = {};
                            multi_uploader.clearQueue();
                            multi_uploader.enableRefresh = true;

                        }
                    }
                );

                var updateAccountsValuation = function(data){
                    if (data.valuation_dates) {
                        $.each(data.valuation_dates, function (key, value) {
                            $.each(dataCenter.account.accountsData,function(index,account_data){
                                if(account_data.id == key) {
                                    account_data.valuation_dates = value;
                                    return;
                                }
                            });
                        });
                    }
                };

                var set_message = function(file_index, progress_percent, message, style, error) {
                    var all_done = true;
                    $.each($scope.multi_uploader.queue, function(index, item) {
                        if (item.formData[0].index === file_index) {
                            item.progress_percent = progress_percent; // do not overwrite item.progress
                            item.message = message;
                            item.error = error;
                            item.msg_style = {color: style};
                            // return false;
                        }
                        if(all_done && item.progress_percent < 100) {
                            all_done = false;
                        }
                    });

                    $scope.trade.multi_loading = !all_done;
                };

                var setImportList = function (data) {
                    if (data.import_list && data.import_list.constructor === Object) {
                        Object.assign(checkAsset.import_assets, data.import_list);
                    }
                };

                var set_check_list = function(data) {
                    if (!data.check_list || !Array.isArray(data.check_list)) {
                        return
                    }

                    $.each(data.check_list, function(index, check_bond) {
                        if (!checkAsset.map.hasOwnProperty(check_bond.course_code)) {
                            check_bond.byCode = bondInfo.getBondBasic(check_bond.asset_code);
                            check_bond.byName = bondInfo.getBondBasic(check_bond.asset_name);
                            check_bond.checkedType = '2';
                            checkAsset.map[check_bond.course_code] = true;
                            checkAsset.list.push(check_bond);
                        }
                    });

                    if (checkAsset.file_info.hasOwnProperty(data.file_name)) {
                        checkAsset.file_info[data.file_name].push({valuation_date: data.date, index: data.index});
                    } else {
                        checkAsset.file_info[data.file_name] = [{valuation_date: data.date, index: data.index}];
                    }

                    checkAsset.account_list = $scope.trade.account_list;
                    if (!$scope.need_check) {
                        $scope.need_check = true;
                    }
                };

                // TODO[SPRINT28]: 由于批量导入产生的刷新BUG。
                var refresh_account = function(data) {
                    updateAccountsValuation(data);
                    if($.inArray(winStatus.cur_account_id, data.account_list) != -1){
                        // if(winStatus.is_account_now){
                            winStatus.cur_account_authority = authorityControl.getAuthorityAndAgentCompany(winStatus.cur_account_id).option;

                            if (data.valuation_dates) {
                                if (multi_uploader.enableRefresh) { // 1.5s 刷新一次
                                    $timeout(function() {
                                        $scope.$emit("account import", data.date);
                                        multi_uploader.enableRefresh = true;
                                    }, 1500);
                                    multi_uploader.enableRefresh = false;
                                }
                            } else {
                                $scope.$emit("account updated");
                            }
                        // }
                        // else{
                        //     $scope.$emit("portfolio updated");
                        // }
                    }
                }

                function importCallback(data) {
                    //估值表导入
                    var results = accountService.getAccountsByIds(data.account_list);
                    if (data.action == 'import' && results.length > 0){
                        if(data.status.substring(0, 9) == 'progress_' && data.user == user.id) { // e.g. progress_30
                            var progress_percent = data.status.substring(9);
                            set_message(data.index, progress_percent, data.message, '#009999');
                        } else if(data.status == 'succeed'){
                            refresh_account(data);
                            if (data.user == user.id) {
                                set_message(data.index, 100, '导入成功!', 'green');
                                setImportList(data);
                            }
                        }else if(data.status == 'info'){
                            refresh_account(data);
                            if (data.user == user.id) {
                                set_message(data.index, 100, '待校对!', 'yellow', data.message);
                                setImportList(data);
                            }
                        }else if(data.status == 'failed' && data.user == user.id){
                            set_message(data.index, 100, '导入失败!', 'red', data.message);
                            setImportList(data);
                        }else if (data.status == 'warn') {
                            refresh_account(data);
                            if (data.user == user.id) {
                                set_message(data.index, 100, '待校对', 'yellow', data.message);
                                set_check_list(data);
                                setImportList(data);
                            }
                        } else if(!data.status){
                          //  messageBox.error(data.message);
                        }
                    }
                    //估值表删除
                    if (data.action == 'valuationDelete'){
                        $.each(data.data, function(index, value){
                            $.each(dataCenter.account.accountsData,function(index,account){
                                if (value.account_id == account.id){
                                    $.each(account.valuation_dates, function(index, date){
                                        if (value.date == date){
                                            account.valuation_dates.splice(index, 1);
                                            return false;
                                        }
                                    })
                                }
                            })
                        });
                    }
                }
                socketServer.on('/account', 'account event', importCallback);

                $scope.checkedBond = null;
                $scope.showCheckDlg = function() {
                    $('#checkBondsDlg').modal('show');
                };

                $scope.showErrorDetail = function (error) {
                    if (error) {
                        checkAsset.errorDetail = error;
                        $('#errorDetailDlg').modal('show');
                    }
                }

                $scope.$on('$destroy', function() {
                    $scope = null;
                });
            },
            templateUrl: 'src/account/otherDlg/importDlg.html'
        }
    })
angular.module('ias.account').controller('bondCheckCtrl', function($scope, checkAsset, checkAssetReq, messageBox, user) {
    var getPageItems = function() {
        var start_index = ($scope.pagination.pageIndex - 1) * $scope.pagination.pageSize;
        var end_index = start_index + $scope.pagination.pageSize > $scope.pagination.size ?
            $scope.pagination.size : start_index + $scope.pagination.pageSize;

        $scope.pagination.pageItems = $scope.checkList.slice(start_index, end_index);
    };

    $scope.pagination = {
        pageIndex: 1,
        pageSize: 6,
        maxPage: 1,
        pageItems: [],
        size: 0
    };

    $scope.checkList = checkAsset.list;
    $('#checkBondsDlg').on('show.bs.modal', function() {
        $scope.pagination.size = $scope.checkList.length;
        $scope.pagination.maxPage = Math.ceil($scope.checkList.length / 6);
        $scope.pagination.pageIndex = 1;
        getPageItems();
    });

    $scope.nextPagination = function() {
        if ($scope.pagination.pageIndex === $scope.pagination.maxPage) {
            return ;
        }
        $scope.pagination.pageIndex += 1;
        getPageItems();
    };

    $scope.beforePagination = function() {
        if ($scope.pagination.pageIndex === 1) {
            return ;
        }
        $scope.pagination.pageIndex -= 1;
        getPageItems();
    };

    var isValid = function (name) {
        return checkAsset.import_assets && checkAsset.import_assets.hasOwnProperty(name)
    }
    var setCheckedAsset = function(course, checkedObj) {
        course.checkedObj = {};
        if(course.type !== '股票') {
            course.checkedObj.asset_id = checkedObj.bond_key_listed_market;
            course.checkedObj.asset_code = checkedObj.bond_id;
            course.checkedObj.asset_name = checkedObj.short_name;
            course.checkedType = '2';
        } else if (course.type === '股票') {
            course.checkedObj.asset_id = checkedObj.code;
            course.checkedObj.asset_code = checkedObj.code;
            course.checkedObj.asset_name = checkedObj.name;
            course.checkedType = '2';
        }

        course.checkedObj.invalid = isValid(course.checkedObj.asset_name);
    };

    $scope.selectedCallback = function(selectedObj, course) {
        if (selectedObj) {
            setCheckedAsset(course, selectedObj.originalObject);
        } else {
            course.checkedObj = null;
        }
    };

    $scope.typeChanged = function (course) {
        if (course.checkedType === '0') {
            course.checkedObj = {};
            course.checkedObj.asset_code = course.byCode.code;
            course.checkedObj.asset_name = course.byCode.name;
            course.checkedObj.asset_id = course.byCode.bond_key_listed_market;
            course.checkedObj.invalid = false;
        }  else if (course.checkedType === '1') {
            course.checkedObj = {};
            course.checkedObj.asset_code = course.byName.code;
            course.checkedObj.asset_name = course.byName.name;
            course.checkedObj.asset_id = course.byName.bond_key_listed_market;
            course.checkedObj.invalid = false;
        }
    };

    $scope.confirm_checked = function () {
        var checked = [];
        var reImportFile = function () {
            var params = [];

            $.each(checkAsset.account_list, function(index, account_id) {
                params.push({
                    account_id: account_id,
                    file_info: checkAsset.file_info
                });
            });
            return params;
        };

        $.each($scope.checkList, function(index, course) {
            if (course.checkedObj && !course.checkedObj.invalid) {
                var checkedObj = {
                    course_name: course.course_name,
                    course_code: course.course_code,
                    asset_type: course.type,
                    asset_code: course.checkedObj.asset_code,
                    asset_name: course.checkedObj.asset_name,
                    asset_id: course.checkedObj.asset_id
                };

                checked.push(checkedObj);
            }
        });

        if(checked.length > 0){
            checkAssetReq.update({
                company_id: user.company_id,
                content: checked
            }, function success(response) {
                if (response.code && response.code === '0000') {
                    checkAssetReq.add({
                        company_id: user.company_id,
                        user_id: user.id,
                        params: reImportFile()
                    })
                } else {
                    messageBox.error('添加校对信息失败！');
                }
            }, function failed () {
                messageBox.error('添加校对信息失败！');
            })
        }

        $scope.dismiss();
    };

    $scope.dismiss = function () {
        $('#checkBondsDlg').modal('hide');
    }
});
