/**
 *
 */
class baseService {
    /**
     *
     * @param {any} $q
     * @param {any} accounts
     */
    constructor($q, accounts) {
        this.$q = $q;

        this.accounts = accounts;
    }

    /**
    *
    * @param {any} resource
    * @param {any} funcName
    * @return {promise}
    */
    dataAccessFactory(resource, funcName) {
        return (dto) => {
            let defer = this.$q.defer();

            resource[funcName](dto, (res) => {
                if (!res || res.code !== '0000') defer.reject(res);

                defer.resolve(res.data);
            }, (res) => {
                defer.reject(res);
            });

            return defer.promise;
        };
    }

    /**
     *
     * @param {any} param
     * @return {promise}
     */
    getAccountList(param) {
        let dto = {
            manager_id: this.user.id,
            company_id: this.user.company_id,
        };

        return this.dataAccessFactory(this.accounts, 'get')(dto);
    }
}

export default baseService;
