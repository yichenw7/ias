
'use strict';

angular.module('ias.common').service('uiGridService', ['commonService', function (commonService) {
    var dataDefine = {
        template: {
            actions: {
                edit: '<button class="admin-grid-btn" tag="edit">\
                    <span class="glyphicon glyphicon-pencil"></span>\
                </button>',
                delete: '<button class="ias-delete-btn admin-grid-btn" tag="delete">\
                    <span class="glyphicon glyphicon-trash"></span>\
                </button>'
            }
        }
    };

    this.actionTemplateBuilder = actions => {

        if (!angular.isArray(actions)) return;

        let template = [];

        actions.forEach(action => {
            if (!dataDefine.template.actions[action]) return;

            template.push(dataDefine.template.actions[action]);
        });

        return template.join("");
    };

    this.buildTreeView = (data, option) => {

        if (!angular.isArray(data)) return data;

        if (!option.groupBy) return;

        let target = [];

        let map = new Map();

        data.forEach(item => {
            let key = item[option.groupBy];

            if (map.has(key)) {
                map.get(key).push(item);
            } else {
                map.set(key, [item]);
            }
        });

        [...map].forEach(([key, value]) => {

            let parent = { $$treeLevel: 0 };
            parent[option.groupBy] = key;

            target.push(parent);

            value.forEach(item => {
                let itemCopy = angular.copy(item);

                if (option.delGroupByProp) delete itemCopy[option.groupBy];

                itemCopy.$$treeLevel = parent.$$treeLevel + 1;
                target.push(itemCopy);
            });
        });

        return target;

    };
}]);