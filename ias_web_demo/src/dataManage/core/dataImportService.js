// import angular from 'angular';

import baseService from './baseService';

const initService = Symbol('initService');

const dataDefine = {
};

/**
 *
 */
class dataImportService extends baseService {
    /**
     *
     * @param {any} $q
     * @param {any} $resource
     * @param {any} accounts
     * @param {any} user
     * @param {any} apiAddress
     */
    constructor($q, $resource, accounts, user, apiAddress) {
        super($q, accounts);

        this.$resource = $resource;

        this.user = user;

        this.apiAddress = apiAddress;

        this[initService]();
    }

    /**
     *
     */
    [initService]() {
        dataDefine.ngResourceDefine = {
            // Url
            valuationBatchImportListResource: this.$resource(`${this.apiAddress}/valuation_batch_import/status`,
                {
                    company_id: '@company_id',
                    user_id: '@user_id',
                    page_size: '@page_size',
                }, {
                    getList: { method: 'GET', params: {} },
                    update: { method: 'POST', params: {} },
                }
            ),
            valuationBatchImportAddTaskReource: this.$resource(`${this.apiAddress}/valuation_batch_import`,
                {}, {
                    add: { method: 'POST', params: {} },
                }
            ),
        };
    }

    /**
     *
     * @return {promise}
     */
    getTaskList() {
        let dto = {
            company_id: this.user.company_id,
            user_id: this.user.id,
            page_size: 100,
        };

        return this.dataAccessFactory(dataDefine.ngResourceDefine.valuationBatchImportListResource, 'getList')(dto);
    }

    /**
     *
     * @param {any} param
     * @return {promise}
     */
    addTask(param) {
        if (!param || !param.fileName) {
            console.warn(`dataImportService.addTask: file name is not specified.`);
            return;
        }

        let dto = {
            account_list: param.accountList,
            company_id: this.user.company_id,
            user_id: this.user.id,
            action: 'trades_import',
            file_name: param.fileName,
            cover_mode: param.coverMode || 'cover',
            index: `${new Date().getTime()}_0`,
            progress_percent: 10,
        };

        return this.dataAccessFactory(dataDefine.ngResourceDefine.valuationBatchImportAddTaskReource, 'add')(dto);
    }

    /**
     *
     * @param {any} param
     * @return {promise}
     */
    updateTask(param) {
        let dto = {
            company_id: this.user.company_id,
            user_id: this.user.id,
            rearrange_type: param.rearrange_type,
            task_id: param.task_id,
        };

        if (param.hasOwnProperty('jump_to')) dto.jump_to = param.jump_to;

        return this.dataAccessFactory(dataDefine.ngResourceDefine.valuationBatchImportListResource, 'update')(dto);
    }
}

export default ['$q', '$resource', 'accounts', 'user', 'apiAddress', dataImportService];
