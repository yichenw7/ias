import Quoteboard from './../../helper/Quoteboard';

angular.module('ias.utils')
    .factory('loginInfo', function ($rootScope, $location) {
        return {
            id: null,
            name: null,
            code: null,
            password: null,
            qb_user_id: null,
            path: null,
            init: function () {
                const self = this;
                $rootScope.login_failed = '访问 IAS 失败，请在 QB 中重新打开 IAS!';
                if ($location.search().hasOwnProperty('code')) {
                    return new Promise((resolve, reject) => {
                        this.code = $location.search().code;
                        this.name = $location.search().username;
                        this.path = $location.$$path.substring(1);
                        resolve(true);
                    })
                } else {
                    return Quoteboard.getQBUserInfo().then(res => {
                        self.name = res.UserAccount;
                        self.path = $location.$$path.substring(1);
                        self.password = res.Password;
                        self.qb_user_id = res.UserId;
                        return true;
                    }).catch(err => {
                        $location.path('/login');
                    })
                }
            }
        }
    })
    .factory('user', function () {
        return {
            id: '',
            name: "",
            company_id: '',
            isQB: false,
            role: null,
            roles: [],
            errorMsg: null,
            company_functions: null,
            dashboardConfig: null,
            page_config: null,
            isLogin: false,
        }
    })
    .factory('UserService', function (user, $rootScope, $location, $q, dataCenter, $window,
        loginInfo, QBUserLogin, roleConstant, loadPageData, loadTaskData, systemAdminData, interactWithQB) {
        return {
            initUser: function (data) {
                user.id = data.user_id;
                user.name = data.user_name;
                user.roles = data.roles;
                user.role_list = data.role_list;
                user.company_id = data.company_id;
                user.page_config = data.page_config;
                user.company_functions = data.company_functions;
                user.dashboardConfig = data.dashboard_config;
                dataCenter.user.userRoleMap = data.role_map;
            },
            login: function () {
                const self = this;
                const defer = $q.defer();

                if (PRODUCTION) {
                    if (!Quoteboard.isInQuoteboard()) {
                        failure({
                            message: '非法访问，请使用 QB 登录 IAS ！'
                        });
                    }
                }

                function failure(data) {
                    const msg = data && data.message;
                    user.isLogin = true;
                    $rootScope.login_failed = msg ? msg : '无效访问，请检查 IAS 权限!';
                    $location.path('/login');
                    defer.reject(msg);
                }

                function setAuthorization(data) {
                    if (data.access_token) {
                        sessionStorage.setItem('access_token', data.access_token);
                    }
                    if (data.refresh_token) {
                        sessionStorage.setItem('refresh_token', data.refresh_token);
                    }
                }

                const loginInfoResult = loginInfo.init();

                loginInfoResult.then((res) => {
                    if (!res) {
                        failure()
                    }

                    QBUserLogin.login({
                        code: loginInfo.code,
                        account_name: loginInfo.name,
                        access_page: loginInfo.path,
                        password: loginInfo.password,
                        qb_user_id: loginInfo.qb_user_id
                    }, function success(response) {
                        if (response.code && response.code === '0000') {
                            let data = response.data;
                            if (data.message != 'success') {
                                failure(data.message);
                            }

                            self.initUser(data);

                            if (!self.hasUserRole(loginInfo.path)) {
                                failure();
                            }

                            setAuthorization(data);
                            defer.resolve();
                        }
                    }, failure);
                })

                return defer.promise;
            },
            hasUserRole: function (path) {
                var find = false;
                $.each(user.role_list, function (index, role) {
                    if (role.en_name === path) {
                        find = true;
                        return false;
                    }
                });
                return find;
            },
            hasRole: function (roleName) {
                return user.roles.some(role => role.en_name === roleName);
            },
            load: function () {
                const login = () => user.isLogin = true;
                const routeConfig = {
                    account: {
                        role: roleConstant.ACCOUNT,
                        initFunc: loadPageData.account,
                    },
                    data_manage: {
                        role: roleConstant.DATA_MANAGE,
                        initFunc: login,
                    },
                    admin: {
                        role: roleConstant.ADMIN,
                        initFunc: function () {
                            return loadPageData.QBSystem()
                                .then(() => systemAdminData.load())
                                .then(() => systemAdminData.getAuthorityMap());
                        },
                    },
                    manager: {
                        role: roleConstant.MANAGER,
                        initFunc: function () {
                            // 超级无敌大嵌套
                            loadPageData.market(function () {
                                loadPageData.manager(function () {
                                    loadTaskData.marketBondDeal(function () {
                                        loadTaskData.marketBond();
                                        user.isLogin = true;
                                    });
                                });
                            });
                        },
                    },
                    risk: {
                        role: roleConstant.RISK,
                        initFunc: loadPageData.risk
                    },
                    home: {
                        role: roleConstant.HOME,
                        initFunc: function () {
                            loadPageData.home();
                            user.isLogin = true;
                        },
                    },
                    position: {
                        role: roleConstant.POSITION,
                        initFunc: function () {
                            loadPageData.position();
                            user.isLogin = true;
                        },
                    },
                };
                if (loginInfo.path && routeConfig.hasOwnProperty(loginInfo.path)) {
                    user.role = routeConfig[loginInfo.path].role;
                    $rootScope.title = '-' + user.role;
                    const init = routeConfig[loginInfo.path].initFunc;
                    return interactWithQB.getAuthorityList().then(init);
                } else {
                    user.isLogin = true;
                    $location.path('/login');
                }
            },
            hasFunctionCode: function (function_code) {
                return (user.company_functions && user.company_functions.hasOwnProperty(function_code))
            },
        }
    });
