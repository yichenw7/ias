import angular from 'angular';
import Quoteboard from './helper/Quoteboard';

const IASRootModule = angular.module('ias');

IASRootModule.controller('appCtrl', function($scope, user, $window, $location, loginInfo, UserService, socketServer, dataCenter, apiAddress) {
    // Hack-fix: control the loading state.
    // bad result: loading animation was blocked by angular digest.
    $scope.user = user;

    $scope.OpenBondDetailPage = Quoteboard.openBondDetail;
    $window.qbBondBasicCallBack = function(response) {
        if (response.bonds && Array.isArray(response.bonds)) {
            response.bonds.forEach((bond, index) => {
                if (bond && bond.constructor === Array) {
                    let bondKeyListedMarket = '';
                    let bondId = bond[0];
                    if (bond[2]) {
                        let listedMarket = bond[2].split('.')[1];
                        bondKeyListedMarket = bond[2].split('.')[0] + listedMarket;

                        if (listedMarket === 'SSE') {
                            bondId = bond[0] + '.SH';
                        } else if (listedMarket === 'SZE') {
                            bondId = bond[0] + '.SZ';
                        }
                    }

                    let bondBasic = {
                        bond_id: bondId,
                        short_name: bond[1],
                        bond_key_listed_market: bondKeyListedMarket,
                        pin_yin: bond[3],
                        pin_yin_full: bond[4],
                    };

                    // 去除债券数据源的增发债
                    if (Quoteboard.isAdditionalBond(bondId)) return;

                    dataCenter.market.bondDetailList.push(bondBasic);
                    dataCenter.market.bondDetailMap[bondKeyListedMarket] = bondBasic;
                }
            });
        }
    };
    $window.onbeforeunload = function() {
        // 有效登录
        if (user.role && user.role !== '') {
            let data = new FormData();
            data.append('account_name', loginInfo.name);
            data.append('access_page', loginInfo.path);
            $window.navigator.sendBeacon(apiAddress + '/logoff', data);
        }

        socketServer.close();
    };

    // Hack-fix: remove for `modal-backdrop` in modal.
    // TODO: Not the best solution. Need refactor.
    $('body').on('shown.bs.modal', function() {
        let backdrop = $('.modal-backdrop');
        $('#dataSection').append(backdrop);
    });
    $('body').on('hidden.bs.modal', function(e) {
        let backdrop = $('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    });

    // TODO: 逐步将数据加载过程移入 resolve 中. By Weilai
    // Hack-Fix: 由于老的controller并不是component路由，因此是在controller内部进行登录认证
    const UN_REFACTOR_ROUTERS = ['manager'];
    const loginRouter = $location.$$path.substring(1);
    if (UN_REFACTOR_ROUTERS.indexOf(loginRouter) > -1) {
        UserService.login().then(UserService.load);
    }
});

IASRootModule.config(function($routeProvider, $httpProvider, apiAddress) {
    $httpProvider.interceptors.push('httpInterceptor');

    // TODO: ALL to use Router to catch the login promise
    let loginOperation = ['UserService', (UserService) => {
        return UserService.login().then(UserService.load);
    }];

    $routeProvider.when('/', {
        // TODO: Now, this is used for login err.
        templateUrl: 'src/templates/login.html',
    }).when('/manager', {
        // TODO: Now, this is used for Market, not manage
        controller: 'manageCtrl',
        templateUrl: 'src/manager/manager.html',
    }).when('/admin', {
        // TODO: Now, this is User's management, not admin
        templateUrl: 'src/system/system.html',
        controller: 'systemAdminqbCtrl',
        resolve: {
            login: loginOperation,
        },
    }).when('/data_manage', {
        template: require('./dataManage/index.html'),
        controller: ['login', (login) => {
            console.log(`login: ${login}`);
        }],
        resolve: {
            login: loginOperation,
        },
    }).when('/account', {
        templateUrl: 'src/account/index.html',
        controller: 'accountAnalyticsCtrl',
        resolve: {
            login: loginOperation,
        },
    }).when('/test', {
        templateUrl: 'src/position/index.html',
    }).when('/risk', {
        templateUrl: 'src/risk/index.html',
        controller: 'riskCtrl',
        resolve: {
            login: loginOperation,
        },
    }).when('/home', {
        templateUrl: 'src/home/index.html',
        resolve: {
            login: loginOperation,
        },
    }).when('/about', {
        redirectTo: function() {
            window.location = apiAddress.replace('/api', '/about');
        },
    }).when('/demo', {
        templateUrl:'src/demo/index.html',
        controller:'demoCtrl',
    }).otherwise({
        redirectTo: '/',
    });
});
