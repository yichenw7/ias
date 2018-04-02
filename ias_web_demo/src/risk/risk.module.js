import {
    riskTable,
} from './risk.helper';

const riskModule = angular.module('ias.risk', []);

riskModule.controller('riskCtrl', function($scope, $filter, $timeout, $interval, $rootScope, user, roleConstant, socketServer, accounts,
    risks, risksError, refreshErrorRules, dataCenter, loadTaskData, UserService, RiskConditionService) {
    function addRiskError(error) {
        classifyRiskError(error);
        error.isNew = true;

        if (error.rule.scenerio === 'after') {
            $scope.risk.newNum.after += 1;

            $scope.risk.error.after.push(error);
        } else if (error.scenerio === 'before') {
            $scope.risk.error.before.push(error);
        }
    }
    function addAccountRule(rules) {
        $.each(rules, function(index, accountRule) {
            classifyRule(accountRule);
            if (accountRule.account_name !== undefined) {
                $scope.risk.accountRules.push(accountRule);
            }
        });
    }
    function updateAccountRule(updateRule) {
        $.each($scope.risk.accountRules, function(index, accountRule) {
            if (accountRule.hasOwnProperty('rule_id') &&
                accountRule.rule_id === updateRule.rule_id &&
                accountRule.account_id === updateRule.account_id) {
                classifyRiskError(updateRule);
                $scope.risk.accountRules.splice(index, 1, updateRule);
                return false;
            }
        });
    }
    function deleteAccountRule(ruleId, accountId) {
        $.each($scope.risk.accountRules, function(index, accountRule) {
            if (accountRule.hasOwnProperty('rule_id') &&
                accountRule.rule_id == ruleId &&
                accountRule.account_id == accountId) {
                $scope.risk.accountRules.splice(index, 1);
                return false;
            }
        });
    }
    function setAccountName(accountRule) {
        // var data = is_group === 1 ? dataCenter.account.accountGroupsData : dataCenter.account.accountsData;
        let data = dataCenter.account.accountGroupsData.concat(dataCenter.account.accountsData);
        $.each(data, function(index, account) {
            if (account.hasOwnProperty('id') && account.id === accountRule.account_id) {
                accountRule.account_name = account.name;
                accountRule.hasValuationDate = account.valuation_dates && account.valuation_dates.length > 0;
                return false;
            }
        });
    }
    function formatValue(accountRule) {
        let value = Number(accountRule.value);
        if (angular.isNumber(value) && !Number.isNaN(value)) {
            accountRule.value = value.toFixed(4);
        }
    }
    function classifyRule(accountRule) {
        formatValue(accountRule);
        setAccountName(accountRule);
        parseRule(accountRule.rule);
    }
    function addPercentSign(indexName, value) {
        if (!indexName) return value;
        const indexMap = RiskConditionService.getIndexMap(indexName);
        const isPercent = indexMap ? indexMap.operand_type === 'percentage' : false;
        return isPercent ? $filter('toPercent')(value): value;
    }
    function classifyRiskError(riskError) {
        classifyRule(riskError);
        const name = riskError.target_name ? ` [异常: ${riskError.target_name}]` : '';
        riskError.msg = RiskConditionService.getIndexName(riskError.index_code, riskError.index_type) + ' : ' + addPercentSign(riskError.index_name, riskError.value) + name;
    }
    function parseConditionParams(condParams) {
        if (condParams == null || condParams == undefined) {
            return '';
        }
        let paramsInfo = `(`;
        let filtersTmp = condParams.filters;
        if (filtersTmp != null && filtersTmp != undefined) {
              for (let i=0; i<filtersTmp.length; i++) {
                let oneFilter = filtersTmp[i];
                if (0 == oneFilter.value.length) {
                  continue;
                }
                let oneFilterName = oneFilter.name_cn || oneFilter.name;
                paramsInfo += oneFilterName +':[' +oneFilter.value.join(',')+'];';
              }
        }

        let otherOptionsTmp = condParams.other_options;
        if (filtersTmp != null && filtersTmp != undefined) {
            for (let i=0; i<otherOptionsTmp.length; i++) {
                let oneOption = otherOptionsTmp[i];
                if (oneOption.value == null || oneOption.value == undefined ||
                      (oneOption instanceof Array && 0 == oneOption.length)) {
                    continue;
                }
                let optionValue = (oneOption.value instanceof Array)
                  ? ':[' +oneOption.value.join(',')+'];'
                  : ':' + oneOption.value + ';';
                let oneOptionName = oneOption.name_cn || oneOption.name;
                paramsInfo += oneOptionName + optionValue;
            }
        }

        paramsInfo += `)`;
        if ('()' == paramsInfo) {
            return '';
        } else {
            return paramsInfo;
        }
    }
    function parseRuleCondition(conditions) {
        return conditions.map((condition) => {
            const indexName = RiskConditionService.getIndexName(condition.index_code, condition.index_type);
            return `${indexName} ${condition.operator} ${addPercentSign(indexName, condition.value)} ${parseConditionParams(condition.option_params)}`;
        });
    }
    function parseRule(rule) {
        rule.valid_period = rule.start + ' 至 ' + (rule.end ? rule.end : '长期');
        rule.name = $filter('userNameFilter')(rule.manager_id);
        rule.condition_tags = parseRuleCondition(rule.conditions);
    }

    function refreshInfo(data) {
        let REFRESH_INTERVAL = 5 * 60 * 1000;
        let leftTime = new Date() - new Date(data.last_refresh_time) + REFRESH_INTERVAL;
        if (leftTime < 0) {
            $scope.ErrorRefreshStatus.setEnabledStatus();
        } else {
            $scope.ErrorRefreshStatus.setDisabledStatus(leftTime);
        }
    }
    $scope.ErrorRefreshStatus = {
        isDisabled: false,
        content: '运行计算',
        leftTime: -1,
        count: function() {
            let self = this;
            return $interval(function() {
                self.leftTime -= 1000;
            }, 1000);
        },
        setDisabledStatus: function(leftTime) {
            this.isDisabled = true;
            this.content = '距离下一次可执行运算剩余：';
            this.leftTime = leftTime;

            let counter = this.count();
            $timeout(function() {
                $interval.cancel(counter);
                $scope.ErrorRefreshStatus.setEnabledStatus();
            }, leftTime);
        },
        setEnabledStatus: function() {
            this.isDisabled = false;
            this.content = '运行计算';
            this.leftTime = '';
        },
        setDoingStatus: function() {
            this.isDisabled = true;
            this.content = '正在计算中...';
            this.leftTime = '';
        },
    };
    $scope.refreshErrorRules = function() {
        // 先DISABLE按钮，然后请求，防止在后台还没有返回结果时候，重复发送
        $scope.ErrorRefreshStatus.setDoingStatus();
        refreshErrorRules.get({
            company_id: user.company_id,
        });
    };

    $scope.risk = {
        accountRules: [],
        error: {
            before: [],
            after: [],
        },
        newNum: {
            after: 0,
            before: 0,
        },
        selectRow: {
            after: null,
            before: null,
        },
    };
    $scope.getAllRules = function() {
        risks.get({
            company_id: user.company_id,
        }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                addAccountRule(data);
                $scope.getUnusualTransaction();
            }
        });
    };

    $scope.accountsData = [];
    $scope.allAccountsGroupList = [];
    function getAllAccountsInCompany() {
        angular.copy(dataCenter.account.accountsData, $scope.accountsData);
    }
    function getAllAccountsGroupList() {
        $scope.allAccountsGroupList = [];
        angular.forEach(dataCenter.account.accountGroupsData, function(accountGroup) {
            $scope.allAccountsGroupList.push({
                id: accountGroup.id,
                label: accountGroup.name,
                isSelected: false,
            });
        });
    }
    $scope.getUnusualTransaction = function() {
        risksError.get({ company_id: user.company_id }, function success(response) {
            if (response.code && response.code === '0000') {
                let data = response.data;
                angular.forEach(data, function(riskError) {
                    classifyRiskError(riskError);

                    if (riskError.rule.scenerio === 'after' && riskError.account_name !== undefined) {
                        $scope.risk.error.after.push(riskError);
                    } else if (riskError.rule.scenerio === 'before' && riskError.account_name !== undefined) {
                        $scope.risk.error.before.push(riskError);
                    }
                });
            }
        });
    };

    $scope.getAllRules();
    getAllAccountsGroupList();
    getAllAccountsInCompany();


    socketServer.registerNotificationSocket(user.company_id, $scope);
    socketServer.join('/risk_manage', user.company_id);
    socketServer.join('/account', user.company_id);
    socketServer.on('/risk_manage', 'risk manage event', function(data) {
        if (data.action === 'refresh_start') {
            $scope.risk.newNum.after = 0;
            $scope.risk.error.after.length = 0;
        }
        if (data.action === 'refresh_complete') {
            refreshInfo({ last_refresh_time: new Date() });
        }
        if (data.data_type === 'risk_error') {
            if (data.action === 'add' && data.hasOwnProperty('error')) {
                data.error.forEach((err) => {
                    addRiskError(err);
                });
            }
        } else {
            if (data.action === 'delete') {
                if (data.hasOwnProperty('rule_id') && data.hasOwnProperty('account_id')) {
                    deleteAccountRule(data.rule_id, data.account_id);
                }
            } else if (data.action === 'add') {
                if (data.hasOwnProperty('rule_list') && data.rule_list) {
                    addAccountRule(data.rule_list);
                }
            } else if (data.action === 'update') {
                if (data.hasOwnProperty('rule') && data.rule) {
                    updateAccountRule(data.rule);
                }
            }
        }
    });
    socketServer.on('/account', 'account event', function(data) {
        if (data.action === 'add') {
            loadTaskData.updateAccountsData(data);
            getAllAccountsInCompany();
        }
    });

    user.isLogin = true;
    // 临时解决方案：只有风控角色能够控制风控规则，投资角色只能查看自己用户下的账户
    $scope.hasPermission = UserService.hasRole('risk');
});
riskModule.controller('transSurveillanceCtrl', function($scope, user) {
    let dealNewMessage = function(tab, row) {
        if ($scope.risk.selectRow[tab] != null && $scope.risk.selectRow[tab].isNew) {
            $scope.risk.selectRow[tab].isNew = false;

            $scope.risk.newNum[tab] -= 1;
        }
        if (row.isSelected) {
            $scope.risk.selectRow[tab] = row.entity;
        } else {
            $scope.risk.selectRow[tab] = null;
        }
    };
    $scope.afterTransGrid = {
        enableSorting: true,
        enableColumnMenus: false,
        multiSelect: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        rowHeight: 40,
        columnDefs: riskTable.surveillanceAfterTransColumnDef(),
        onRegisterApi: function(gridApi) {
            $scope.afterTransGridApi = gridApi;
            $scope.afterTransGridApi.grid.registerRowsProcessor(function(renderalbeRows) {
                renderalbeRows.forEach(function(row) {
                    if (!$scope.hasPermission && row.entity.rule.manager_id !== user.id) {
                        row.visible = false;
                        return true;
                    }
                });
                return renderalbeRows;
            }, 200);
            gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                // 新任务数量处理
                dealNewMessage('after', row);
            });
        },
    };
    $scope.afterTransGrid.data = $scope.risk.error.after;
});
riskModule.controller('riskManagementCtrl', function($scope, user, risk) {
    $scope.accountRulesGrid = {
        enableSorting: true,
        enableRowSelection: true,
        enableColumnMenus: false,
        multiSelect: false,
        enableFullRowSelection: true,
        enableRowHeaderSelection: false,
        rowHeight: 40,
        columnDefs: riskTable.settingTransColumnDef(),
    };
    $scope.accountRulesGrid.data = $scope.risk.accountRules;

    $scope.switchRule = function(rule, $event) {
        $event.stopPropagation();
        rule.enable = Number(!rule.enable);
        // 发送请求，此条状态为关
        risk.update({
            rule_id: rule.rule_id,
            company_id: user.company_id,
            rule: rule,
        });
    };
    $scope.edit = function(rule, $event) {
        $event.stopPropagation();
        // 弹出编辑框
        risk.update({
            rule_id: rule.rule_id,
            company_id: user.company_id,
            manager_id: user.id,
            rule: {
                enable: true,
                scenerio: 'before',
                target_invest_account: ['账户A'],
                start_date: '2015-01-01',
                end_date: '2016-01-01',
                match_action: 'pass',
                dismatch_action: 'pass',
                assets_type: ['deposit'],
                conditions: [
                    { index: 'principal', operator: '<', value: '100000' },
                ],
            },
        });
    };
    $scope.delete = function(rule, $event) {
        $event.stopPropagation();

        risk.delete({
            rule_id: rule.rule_id,
            account_id: rule.account_id,
            company_id: user.company_id,
        });
    };
});
riskModule.controller('riskSettingCtrl', function($scope, $filter, risks, datetimePickerConfig, user, dateClass, RiskConditionService) {
    $scope.timePickerConfig = datetimePickerConfig;

    const ACTIONS_IN_TRANS = {
        '-1': ['提醒', '通过'],
        '1': ['提醒', '通过'],
    };
    const RULE_INDEX_MAP = RiskConditionService.getRuleIndexMaps();

    function Condition() {
        this.ruleIndexMaps = RULE_INDEX_MAP;
        this.init();
        this.resetOperator();
    }
    Condition.prototype.init = function() {
        this.ruleIndexes = [];
        this.ruleIndexMaps.forEach((item) => {
            if (item.scenario === 0 || item.scenario === $scope.riskSetting.direction) {
                this.ruleIndexes.push(item.name);
            }
        });
        this.selected = this.ruleIndexes[0];
    };

    Condition.prototype.resetOperator = function() {
        const ruleIndex = this.selected;
        const ruleIndexMap = this.ruleIndexMaps.find((item) => item.name === ruleIndex);

        this.operandType = ruleIndexMap.operandType;

        this.operator = {};
        this.operator.selected = ruleIndexMap.operators[0];
        this.operator.options = ruleIndexMap.operators;

        this.invsTypeData = {};
        this.invsTypeData.availableOptions = ruleIndexMap.availableOptions;

        this.threshold = {};
        switch (this.operandType) {
            case 'percentage':
                this.threshold.selected = '';
                this.threshold.unit = '%';
                break;
            case 'date':
                this.threshold.selected = $filter('date')(new Date(), 'yyyy-MM-dd');
                break;
            case 'enum_multi':
                this.threshold.options = ruleIndexMap.operandEnums.map((e) => {
                    return {
                        name: e.disp,
                        isSelected: false,
                    };
                });
                break;
            case 'enum_single':
                this.threshold.options = ruleIndexMap.operandEnums.map((e) => e.disp);
                this.threshold.selected = this.threshold.options[0];
                break;
            default:
                this.threshold.selected = '';
        }
    };

    Condition.prototype.toString = function() {
        let threshold = '';
        if (this.conditionThreshold.isSelector) {
            threshold = this.conditionThreshold.selected;
        } else if (this.conditionThreshold.unit === '%' || this.conditionThreshold.unit === '') {
            threshold = this.conditionThreshold.selected + ' ' + this.conditionThreshold.unit;
        } else {
            threshold = this.conditionThreshold.selected + this.conditionThreshold.options[this.conditionThreshold.value].label;
        }
        return this.selected + ' ' + this.operator.selected + ' ' + threshold;
    };

    Condition.prototype.toJson = function() {
        let self = this;
        let res = {};
        const indexMap = RiskConditionService.getIndexMap(self.selected);
        res.index_code = indexMap.index_code;
        res.index_type = indexMap.index_type;
        res.operator = self.operator.selected;
        if (self.operandType === 'percentage') {
            res.value = String(self.threshold.selected * 0.01);
        } else if (self.operandType === 'enum_multi') {
            let value = [];
            self.threshold.options.forEach((option) => {
                if (option.isSelected) {
                    value.push(option.name);
                }
            });
            res.value = value.join(',');
            self.threshold.selected = res.value;
        } else {
            res.value = String(self.threshold.selected);
        }
        if (self.threshold.selected === '' || self.threshold.selected === null || self.threshold.selected === undefined
            || (Array.isArray(res.value) && res.value.length === 0)) {
            $scope.riskSetting.isError = true;
            $scope.riskSetting.errorMsg = '请输入' + self.selected + '的阈值!';
        }

        res.option_params = getSelectedoptionParams();
        res.option_params = {
            filters: getSelectedoptionParams($scope.filters, $scope.filtersSelected),
            other_options: getSelectedoptionParams($scope.other_options, $scope.otherOptionsSelected),
        };
        return res;
    };

    $scope.riskSetting = {};

    $scope.directionGroup = [
        { label: '交易前', value: -1 },
        { label: '交易后', value: 1 },
    ];

    // 根据事前事后决定动作内容的不同
    $scope.setDirection = function() {
        let direct = $scope.riskSetting.direction;
        $scope.riskSetting.matchCondition.selected = ACTIONS_IN_TRANS[direct][0];
        $scope.riskSetting.matchCondition.options = ACTIONS_IN_TRANS[direct];
        $scope.riskSetting.dismatchCondition.selected = ACTIONS_IN_TRANS[direct][0];
        $scope.riskSetting.dismatchCondition.options = ACTIONS_IN_TRANS[direct];
        $scope.riskSetting.conditions = [new Condition()];
    };
    // 选择规则指标时，操作符和阈值选择框内容发生改变
    $scope.selectConditionIndex = function(condition) {
        condition.resetOperator();
        setInvsType(condition);
    };
    $scope.riskDateChange = function() {
        if (!$scope.riskSetting.endDate || $scope.riskSetting.endDate === '') { // 无穷大
            return;
        }

        if (!dateClass.compare($scope.riskSetting.startDate, $scope.riskSetting.endDate)) {
            $scope.riskSetting.endDate = $scope.riskSetting.startDate;
        }
    };
    $scope.addRuleCondition = function() {
        $scope.riskSetting.conditions.push(new Condition());
    };
    $scope.deleteRuleCondition = function(index) {
        if ($scope.riskSetting.conditions.length > 1) {
            $scope.riskSetting.conditions.splice(index, 1);
        }
    };
    function inValidDateRange(endDate) {
        if (!endDate || endDate === '') {
            return false;
        }
        let today = $filter('date')(new Date(), 'yyyy-MM-dd');
        if (!dateClass.compare(today, endDate)) {
            $scope.riskSetting.isError = true;
            $scope.riskSetting.errorMsg = '请选择有效的时间范围!';
            return true;
        }
        return false;
    }
    function riskValidCheck(rule) {
        // 日期范围有效性检查
        if (inValidDateRange(rule.end_date)) {
            return;
        }
    }
    $scope.confirm = function() {
        $scope.riskSetting.isError = false;
        let rule = getUserInput($scope.riskSetting);
        riskValidCheck(rule);
        if ($scope.riskSetting.isError) {
            return;
        } else {
            risks.add({
                company_id: user.company_id,
                manager_id: user.id,
                rule_list: [rule],
            });
        }

        setRiskSetting();
        $scope.dismiss();
    };
    function getSelectedAccounts(list) {
        let res = [];
        angular.forEach(list, function(account) {
            if (account.isSelected) {
                res.push(account.id);
            }
        });
        if (res.length <= 0) {
            $scope.riskSetting.isError = true;
            $scope.riskSetting.errorMsg = '请选择投资账户或组合!';
        }
        return res;
    }

    // 获取全部optionParams
    function getSelectedoptionParams(types, typesSelected) {
        let optionParams = [];
        optionParams.push(...allSelected(types, typesSelected));
        return optionParams;
    }
    function allSelected(lists, listsSelected) {
        let res = [];
        angular.forEach(lists, function(item, index) {
            let values = [];
            if (item.support_multi) {
                for (let v of item.value_list) {
                    if (v.isSelected) {
                        values.push(v.name);
                    }
                }
                let outMultiList = {
                    name: item.name,
                    name_cn: item.name_cn,
                    value: values,
                    // support_in_or_ex: item.support_in_or_ex,
                };
                res.push(outMultiList);
            } else {
                let outList = {
                    name: item.name,
                    name_cn: item.name_cn,
                    value: listsSelected[index].value_list,
                    // support_in_or_ex: item.support_in_or_ex,
                };
                res.push(outList);
            }
        });
        return res;
    }

    function getUserInput(riskSetting) {
        let rule = {};

        rule.enable = true;
        rule.scenerio = (riskSetting.direction === -1) ? 'before' : 'after';
        rule.is_group = (riskSetting.direction === -1) ? 0 : Number(riskSetting.isGroup);
        rule.target_invest_account = getSelectedAccounts($scope.accountsData);
        rule.start_date = riskSetting.startDate;
        rule.end_date = riskSetting.endDate;
        rule.match_action = $filter('riskMatchFilter')(riskSetting.matchCondition.selected);
        rule.dismatch_action = $filter('riskMatchFilter')(riskSetting.dismatchCondition.selected);
        rule.comment = riskSetting.comment;
        rule.conditions = function() {
            let res = [];
            angular.forEach($scope.riskSetting.conditions, function(condition) {
                res.push(condition.toJson());
            });
            return res;
        }();
        return rule;
    }

    function setRiskSetting() {
        $scope.riskSetting.isError = false;
        $scope.riskSetting.errorMsg = '';
        $scope.riskSetting.direction = 1;
        $scope.riskSetting.isGroup = 0;
        $scope.riskSetting.startDate = $filter('date')(new Date(), 'yyyy-MM-dd');
        $scope.riskSetting.endDate = ''; // 终止日期为空，默认为永久有效
        $scope.riskSetting.matchCondition = {};
        $scope.riskSetting.dismatchCondition = {};
        $scope.riskSetting.conditions = [new Condition()];
        $scope.riskSetting.comment = '';
        $scope.setDirection();

        // 设置默认投资类型选中项
        setInvsType($scope.riskSetting.conditions[0]);
    }
    setRiskSetting();

    $scope.dismiss = function() {
        $('#riskSettingDlg').modal('hide');
    };

    function setInvsType(condition) {
        if (condition.invsTypeData.availableOptions) {
            let filters = angular.copy(condition.invsTypeData.availableOptions.filters);
            let otherOptions = angular.copy(condition.invsTypeData.availableOptions.other_options);

            $scope.filters = angular.copy(formatAvailableOptions(filters, true));
            $scope.other_options = angular.copy(formatAvailableOptions(otherOptions, false));
        } else {
            $scope.filters = [];
            $scope.other_options = [];
        }
    }

    function formatAvailableOptions(types, isFilters) {
        let _types = [];
        if (Array.isArray(types) && types.length > 0 ) {
            let valueList = [];

            $scope.filtersSelected = [];
            $scope.otherOptionsSelected = [];
            types.forEach((type, index) => {
                let _type = angular.copy(type);
                if ( Array.isArray(_type.value_list) && _type.value_list.length > 0) {
                    if (_type.support_multi) {
                        valueList = _type.value_list.map((item) => {
                            return {
                                name: item,
                            };
                        });
                    } else {
                        valueList = _type.value_list;
                        isFilters ? $scope.filtersSelected.push({
                            index: index,
                            value_list: [_type.value_list[0]],
                        }) : $scope.otherOptionsSelected.push({
                            index: index,
                            value_list: [_type.value_list[0]],
                        });
                    }
                }
                _type.value_list = valueList;
                _types.push(_type);
            });
        }
        return _types;
    }
});
