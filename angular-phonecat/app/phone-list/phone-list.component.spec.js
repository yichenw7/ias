'use strict';

// toBe()：判断两个变量是否全等，类似于“===”；
// toNotBe()：与上一个相反，判断两个变量是否不全等，类似于“!==”；
// toBeDefined()：检查变量或属性是否已声明且赋值；
// toBeUndefined()：与上一个相反；
// toBeNull()：判断变量是否为null；
// toBeTruthy()：判断变量如果转换为布尔值，是否为true；
// toBeFalsy()：与上一个相反；
// toBeLessThan()：与数值比较，是否小于；
// toBeGreaterThan()：与数值比较，是否大于；
// toEqual()：判断变量是否相等，相当于“==”；
// toContain()：判断一个数组中是否包含元素（值）。只能用于数组，不能用于对象；
// toBeCloseTo()：数值比较时定义精度，先四舍五入后再比较；
// toMatch()：按正则表达式匹配；
// toNotMatch()：与上一个相反；
// toThrow()：检验一个函数是否会抛出一个错误。

describe('phoneList', function() {

  // Load the module that contains the `phoneList` component before each test
  beforeEach(module('phoneList'));

  // Test the controller
  describe('PhoneListController', function() {
    var $httpBackend, ctrl;

    beforeEach(inject(function($componentController, _$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/phones.json')
                  .respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);

      ctrl = $componentController('phoneList');
    }));

    it('should create a `phones` property with 2 phones fetched with `$http`', function() {
      jasmine.addCustomEqualityTester(angular.equals);

      expect(ctrl.phones).toEqual([]);

      $httpBackend.flush();
      expect(ctrl.phones).toEqual([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);
    });

    it('should set a default value for the `orderProp` property', function() {
      expect(ctrl.orderProp).toBe('age');
    });

  });

});
