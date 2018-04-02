import angular from 'angular';

import accountOverview from './account-overview.component';
import homeCardPage from './home-card-page.component';
import homeTablePage from './home-table-page.component';
import homeCard from './home-card.component';

angular.module('ias.dataManage')
    .component('accountOverview', accountOverview())
    .component('homeCard', homeCard())
    .component('homeTablePage', homeTablePage())
    .component('homeCardPage', homeCardPage());
