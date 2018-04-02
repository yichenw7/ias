import config from './config';
import dataCheckService from './dataCheckService';
import dataImportService from './dataImportService';

angular.module('ias.dataManage')
    .config(config)
    .service('dataCheckService', dataCheckService)
    .service('dataImportService', dataImportService);
