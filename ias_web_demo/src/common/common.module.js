import angular from 'angular';

angular.module('ias.common', [
    'ias.components',
    'ias.filters',
    'ias.constant',
    'ias.directives',
    'ias.utils',
    'ias.services',
    'ias.uiGrid',
    'ias.dataCenter',
]);

angular.module('ias.constant', []);
angular.module('ias.utils', []);
angular.module('ias.directives', []);
angular.module('ias.filters', []);
angular.module('ias.dataCenter', []);
angular.module('ias.components', [
    'angucomplete-alt',
    'angularFileUpload',
    'angular-clipboard',
]);
angular.module('ias.services', [
    'ngResource'
]);
angular.module('ias.uiGrid', [
    'ui.grid',
    'ui.grid.autoResize',
    'ui.grid.selection',
    'ui.grid.treeView',
    'ui.grid.moveColumns',
    'ui.grid.pinning',
    'ui.grid.resizeColumns',
    'ui.grid.exporter',
    'ui.grid.pagination',
    'ui.grid.saveState',
    'ui.grid.cellNav',
    'ui.grid.grouping',
]);