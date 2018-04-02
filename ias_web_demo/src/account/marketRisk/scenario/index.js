import angular from 'angular';

import './scenario.service';
import './scenario.dialog';

import scenarioAnalysis from './scenario-analysis.component';
import scenarioTable from './scenario-table.component';
// import scenarioChart from './scenario-chart.component';

angular.module('ias.account')
    .component('scenarioAnalysis', scenarioAnalysis())
    .component('scenarioTable', scenarioTable());
    // .component('scenarioChart', scenarioChart());
