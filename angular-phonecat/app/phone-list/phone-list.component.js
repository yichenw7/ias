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

          // 测试 对输入的任意参数求和
          function sum(...rest) {
              var sum = 0;
              for (let n of rest) {
                  sum += n;
              }
              return sum;
          }

          this.sum = sum(1,2);

      }

    ]
  });
