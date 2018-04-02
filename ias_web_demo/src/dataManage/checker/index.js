import angular from 'angular';

import checkHomePage from './checkHomePage';
import dcValuationSearchcriteria from './dcValuationSearchcriteria';
import dcValuationSelector from './dcValuationSelector';
import dcValuationDatatreeview from './dcValuationDatatreeview';
import inputAccountSelector from './inputAccountSelector';

angular.module('ias.dataManage')
    .component('checkHomePage', checkHomePage())
    .component('dcValuationSearchcriteria', dcValuationSearchcriteria())
    .component('dcValuationSelector', dcValuationSelector())
    .component('dcValuationDatatreeview', dcValuationDatatreeview())
    .component('inputAccountSelector', inputAccountSelector());
