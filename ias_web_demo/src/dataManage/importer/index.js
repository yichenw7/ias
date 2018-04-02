import angular from 'angular';

import importHomePage from './importHomePage';
import importViewSelectaccount from './importViewSelectaccount';
import importViewSelectfile from './importViewSelectfile';
import importViewUpload from './importViewUpload';
import importViewTasklist from './importViewTasklist';

angular.module('ias.dataManage')
    .component('importHomePage', importHomePage())
    .component('importViewSelectaccount', importViewSelectaccount())
    .component('importViewSelectfile', importViewSelectfile())
    .component('importViewUpload', importViewUpload())
    .component('importViewTasklist', importViewTasklist());
