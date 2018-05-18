'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('phoneList').
  component('phoneList', {
    templateUrl: 'phone-list/phone-list.template.html',
    controller: ['Phone',
      function PhoneListController(Phone) {
      console.log(Phone, '-----------------------Phone');
        this.phones = Phone.query();
        this.orderProp = 'age';
          console.log(this.phones, '-----------------------Phone query');
          console.log(this.orderProp, '-----------------------Phone age');

      }
    ]
  });
