'use strict';

(function (angular) {
    var iasSystemModule = angular.module('ias.system');

    iasSystemModule.factory('selectUser', function () {
        return {
            user: null,
            isEdit: false
        }
    });
    iasSystemModule.factory('gridItemNum', function () {
        return {
            gridItemNum: null,
            gridInstitutionNum: null,
        };
    });
    iasSystemModule.factory('selectAccount', function () {
        return {
            account_id: null,
            account_name: null,
            manager: null,
            read_users: [],
            write_users: []
        }
    });
    iasSystemModule.factory('assetDefineFactory', function () {
        return {
            theEditRowEntity: {},
            matchingAccountEntity: {},
            isNew: false,
            selectType: 1
        }
    });
    iasSystemModule.factory('selectedObj', function () {
        return {
            agent: {
                user: null,
                isEdit: false
            },
            bondPool: {
                bond: {
                    short_name: '',
                    bond_id: '',
                    score: '',
                    expire_start_date: '',
                    expire_end_date: '',
                    remarks: ''
                },
                isEdit: false,
                isSearch: false
            },
            investBond: {
                bond: {
                    short_name: '',
                    bond_id: '',
                    score: '',
                    expire_start_date: '',
                    expire_end_date: '',
                    remarks: ''
                },
                isEdit: false
            },
            lib: {
                organization: {
                    name: '',
                    type: '',
                    remarks: '',
                    isEdit: false,
                },

                trader: {
                    name: '',
                    tel: '',
                    position: '',
                    isEdit: false,
                },
                institution: ''
            },
            trader: {
                row: null
            },
            delete: {
                user: null,
                iaAgent: true,
                bond: null,
                isBond: true,
                investBond: null,
                lib: null,
                isTrader: false,
                trader: null
            },
            agentAuthority: {
                agent_account_name: '',
                agent_user_id: null,
                authorityMap: null
            },
            checked_asset: {
                checkedObj: {},
                course_name: '',
                course_code: '',
                asset_code: '',
                asset_name: '',
                asset_id: '',
                dlg_title: '添加校对信息'
            },
            cashRegulateObj: {
            }
        }
    });
})(window.angular);

