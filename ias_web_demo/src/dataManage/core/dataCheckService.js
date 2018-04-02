import angular from 'angular';

import baseService from './baseService';

const initService = Symbol('initService');

const dataDefine = {
};

/**
 *
 */
class dataCheckService extends baseService {
    /**
     *
     * @param {any} $q
     * @param {any} $filter
     * @param {any} $resource
     * @param {any} user
     * @param {any} accounts
     * @param {any} apiAddress
     */
    constructor($q, $filter, $resource, user, accounts, apiAddress) {
        super($q, accounts);

        this.$q = $q;
        this.$filter = $filter;
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
            valListResource: this.$resource(`${this.apiAddress}/import_check_summary`,
                {}, {
                    getList: { method: 'POST', params: {} },
                }
            ),
            valDetailReource: this.$resource(`${this.apiAddress}/import_check_detail`,
                {
                    company_id: '@company_id',
                    valuation_id: '@valuation_id',
                    date: '@date',
                }, {
                    getList: { method: 'GET', params: {} },
                }
            ),
        };
    }

    /**
     *
     * @param {any} param
     * @return {promise}
     */
    getValList(param) {
        let dto = {
            company_id: this.user.company_id,
            account_ids: param.account_id,
            begin_date: param.start_date,
            end_date: param.end_date,
            only_different: param.only_different ? 1 : 0,
        };

        let getDateString = (date) => {
            if (angular.isString(date)) return date;
            if (angular.isDate(date)) return this.$filter('date')(date, 'yyyy-MM-dd');
            return '';
        };

        if (dto.start_date) dto.start_date = getDateString(dto.start_date);
        if (dto.end_date) dto.end_date = getDateString(dto.end_date);

        return this.dataAccessFactory(dataDefine.ngResourceDefine.valListResource, 'getList')(dto);
    }

    /**
     *
     * @param {any} param
     * @return {promise}
     */
    getValDetail(param) {
        let dto = {
            company_id: this.user.company_id,
            asset_val_id: param.asset_val_id,
        };

        return this.dataAccessFactory(dataDefine.ngResourceDefine.valDetailReource, 'getList')(dto);
    }
}

export default ['$q', '$filter', '$resource', 'user', 'accounts', 'apiAddress', dataCheckService];
