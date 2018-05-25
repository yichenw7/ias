'use strict';

// Matchers
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

// describe
// it
// expect
// fail



// this值
// 在在每一个it的生命周期的开始，都将有一个空的this对象（在开始下一个it周期时，this会被重置为空对象）

// 嵌套describe it

describe('这是phoneList', function() {

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
      console.log($httpBackend, '---------------------------------------$httpBackend');
      console.log(ctrl, '---------------------------------------ctrl');
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

      it('sum() should return 3', function() {
          expect(ctrl.sum).toEqual(3);
      });

  });

});


// BDD 行为驱动开发框架 Jasmine
describe('这是测试框架demo', function () {
    // 自定义Matchers

    var customMatchers = {
        toBeGoofy: function(util, customEqualityTesters) {
            return {
                compare: function(actual, expected) {
                    if (expected === undefined) {
                        expected = '';
                    }
                    var result = {};
                    result.pass = util.equals(actual.hyuk, "gawrsh" + expected, customEqualityTesters);
                    if (result.pass) {
                        result.message = "Expected " + actual + " not to be quite so goofy";
                    } else {
                        result.message = "Expected " + actual + " to be goofy, but it was not very goofy";
                    }
                    return result;
                }
            };
        }
    };

// 调用自定义Matchers
    describe("Custom matcher: 'toBeGoofy'", function() {
        beforeEach(function() {
            jasmine.addMatchers(customMatchers);
        });

        it("can take an 'expected' parameter", function() {
            expect({
                hyuk: 'gawrsh is fun'
            }).toBeGoofy(' is fun');
        });
    });

    // Spy
// toHaveBeenCalled 可以检查function是否被调用过，
// toHaveBeenCalledWith 可以检查传入参数是否被作为参数调用过。
    describe("A spy", function() {
        var foo, bar = null;

        beforeEach(function() {
            foo = {
                setBar: function(value) {
                    bar = value;
                },
                getBar: function() {
                    return bar;
                }

            };

            spyOn(foo, 'setBar');

            foo.setBar(123);
            foo.setBar(456, 'another param');

        });

        it("tracks that the spy was called", function() {
            expect(foo.setBar).toHaveBeenCalled();
        });

        it("tracks all the arguments of its calls", function() {
            expect(foo.setBar).toHaveBeenCalledWith(123);
            expect(foo.setBar).toHaveBeenCalledWith(456, 'another param');
        });

        it("stops all execution on a function", function() {
            // Spy的调用并不会影响真实的值，所以bar仍然是null。
            expect(bar).toBeNull();
        });
    });

    // spyOn(foo, 'getBar').and.callThrough(); 调用and.callThrough()后,Spy返回的值就是函数调用后实际的值
    // spyOn(foo, 'setBar').and.callThrough();
    // foo.setBar.and.stub();  调用and.stub()后，之后调用foo.setBar将不会影响bar的值





    describe("jasmine.any", function() {
        it("matches any value", function() {
            expect({}).toEqual(jasmine.any(Object));
            expect(12).toEqual(jasmine.any(Number));
        });

        describe("when used with a spy", function() {
            it("is useful for comparing arguments", function() {
                var foo = jasmine.createSpy('foo');
                foo(12, function() {
                    return true;
                });

                expect(foo).toHaveBeenCalledWith(jasmine.any(Number), jasmine.any(Function));
            });
        });
    });

// 检测是否非空
    it("matches anything", function() {
        expect(1).toEqual(jasmine.anything());
    });

// 检测实际Array值中是否存在特定值。
    let foo;

    beforeEach(function() {
        foo = [1, 2, 3, 4];
    });

    it("matches arrays with some of the values", function() {
        expect(foo).toEqual(jasmine.arrayContaining([3, 1]));
        expect(foo).not.toEqual(jasmine.arrayContaining([6]));
    });

// --------------------------------
// Jasmine Clock
// var timerCallback;
//
// beforeEach(function() {
//     timerCallback = jasmine.createSpy("timerCallback");
//     jasmine.clock().install();
// });
// afterEach(function() {
//     jasmine.clock().uninstall();
// });
// // --------------------------------
//
// // Mocking Timeout
// it("causes an interval to be called synchronously", function() {
//     setInterval(function() {
//         timerCallback();
//     }, 100);
//
//     expect(timerCallback).not.toHaveBeenCalled();
//
//     jasmine.clock().tick(101);
//     expect(timerCallback.calls.count()).toEqual(1);
//
//     jasmine.clock().tick(50);
//     expect(timerCallback.calls.count()).toEqual(1);
//     //tick设置的时间，累计到此201ms，因此会触发setInterval中的毁掉函数被调用2次。
//     jasmine.clock().tick(50);
//     expect(timerCallback.calls.count()).toEqual(2);
// });
// Asynchronous

    var value;

// setTimeout代表一个异步操作。
    beforeEach(function(done) {
        setTimeout(function() {
            value = 0;
            // 调用done表示回调成功，否则超时。
            done();
        }, 1);
    });

// 如果在beforeEach中的setTimeout的回调中没有调用done，最终导致下面的it因超时而失败。
    it("should support async execution of test preparation and expectations", function(done) {
        value++;
        expect(value).toBeGreaterThan(0);
        done();
    });

})
