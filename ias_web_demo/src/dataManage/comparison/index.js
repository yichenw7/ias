import angular from 'angular';

import comparison from './comparison.component';
import comparisonHeader from './comparison-header.component';
import comparisonBody from './comparison-body.component';
import compare from './comparison.service';

angular.module('ias.dataManage')
    .factory('compare', compare)
    .component('comparison', comparison())
    .component('comparisonHeader', comparisonHeader())
    .component('comparisonBody', comparisonBody());
