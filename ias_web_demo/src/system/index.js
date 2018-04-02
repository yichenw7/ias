import './system.module';

import './component/commonAdminPage';
import './component/gridPagination';
import './controller/assetDefineCtrl';
import './controller/checkedAssetCtrl';
import './controller/customBondCtrl';
import './controller/importRivalCtrl';
import './controller/rivalCtrl';
import './controller/systemControllers';
import './factory/adminTableFactory';
import './factory/systemFactorys';
import './service/systemAdminService';

import './component/template/add_panel_dialog.less';
import './component/template/commonAdminPage.less';

angular.module('ias.system').constant('ias.system.config', {
    module_base_path: 'src/system'
});

let controllerMap = new Map([
    ['agentListCtrl', require('./controller/agentListCtrl')],
]);

const systemModule = angular.module('ias.system');

[...controllerMap].forEach(([key, value]) => {
    systemModule.controller(key, value.$injector);
});
