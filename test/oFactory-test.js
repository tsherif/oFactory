test("Prototype argument", function() {
  var proto = { hello: "hello" };
  var factory = oFactory(proto);
  
  var obj = factory();
  ok(proto.isPrototypeOf(obj), "Passed argument is prototype");
});

test("mixin() with object argument", function() {
  var factory = oFactory().mixin({ hello: "hello" });
  var obj = factory();
  
  ok(obj.hasOwnProperty("hello"), "Property defined on object");
  deepEqual(obj.hello, "hello", "Properties assigned to object");
});

test("mixin() with function argument", function() {
  var factory = oFactory().mixin(function(self) { 
    self.hello = "hello"; 
  });
  var obj = factory();
  
  ok(obj.hasOwnProperty("hello"), "Property defined on object");
  deepEqual(obj.hello, "hello", "Function modifies object");
});

test("mixin() with multiple arguments", function() {
  var hello_mixin = { hello: "hello" };
  var goodbye_mixin = function(self) { self.goodbye = "good bye"; };
  var factory = oFactory().mixin(hello_mixin, goodbye_mixin);
  var obj = factory();
  
  ok(obj.hasOwnProperty("hello"), "Property defined on object");
  deepEqual(obj.hello, "hello", "Function modifies object");
  ok(obj.hasOwnProperty("goodbye"), "Property defined on object");
  deepEqual(obj.goodbye, "good bye", "Function modifies object");
});

test("share() with object argument", function() {
  var factory = oFactory().share({ hello: "hello" });
  var obj = factory();
  
  ok(Object.getPrototypeOf(obj).hasOwnProperty("hello"), "Property defined on prototype");
  deepEqual(obj.hello, "hello", "Properties assigned to prototype");
});

test("share() with function argument", function() {
  var factory = oFactory().share(function(proto) { 
    proto.hello = "hello"; 
  });
  var obj = factory();
  
  ok(Object.getPrototypeOf(obj).hasOwnProperty("hello"), "Property defined on prototype");
  deepEqual(obj.hello, "hello", "Function modifies prototype");
});

test("share() with multiple arguments", function() {
  var hello_shared = { hello: "hello" };
  var goodbye_shared = function(proto) { proto.goodbye = "good bye"; };
  var factory = oFactory().share(hello_shared, goodbye_shared);
  var obj = factory();
  
  ok(Object.getPrototypeOf(obj).hasOwnProperty("hello"), "Property defined on prototype");
  deepEqual(obj.hello, "hello", "Function modifies prototype");
  ok(Object.getPrototypeOf(obj).hasOwnProperty("goodbye"), "Property defined on prototype");
  deepEqual(obj.goodbye, "good bye", "Function modifies prototype");
});

test("init()", function() {
  var factory = oFactory().init(function(self) {
    self.sum = self.x + self.y;
  });
  var obj = factory({
    x: 4,
    y: 3
  });
  
  deepEqual(obj.sum, 7, "Property calculated after creation");
});

test("seal()", function() {
  var factory = oFactory().seal();
  var obj = factory();
  
  ok(Object.isSealed(obj), "Object is sealed");
});

test("freeze()", function() {
  var factory = oFactory().freeze();
  var obj = factory();
  
  ok(Object.isFrozen(obj), "Object is frozen");
});

test("Passing object argument to factory function", function() {
  var factory = oFactory().mixin({ a: "a" });
  var obj = factory({ a: "b", b: "c"});
  
  deepEqual(obj.a, "b", "Property overriden");
  deepEqual(obj.b, "c", "Property created");
});

test("Chaining", function() {
  var factory = oFactory({
    getX: function() { return this.x; }
  }).mixin(function(self) {
    var y = 7;
    
    self.getY = function() {
      return y;
    };
  }).init(function(self) {
    self.sum = self.getX() + self.getY();
  }).share({
    getSum: function() { return this.sum; }
  }).freeze();
  var obj = factory({ x: 5 });
  
  ok(obj.hasOwnProperty("x"), "'x' property defined on object");
  deepEqual(obj.x, 5, "Factory function argument works");
  ok(Object.getPrototypeOf(obj).hasOwnProperty("getX"), "getX method defined on prototype");
  deepEqual(obj.getX(), 5, "Prototype method works");
  ok(obj.hasOwnProperty("getY"), "getY method defined on object");
  deepEqual(obj.getY(), 7, "mixin() property works");
  ok(obj.hasOwnProperty("sum"), "'sum' property defined on object");
  deepEqual(obj.sum, 12, "init() property works");
  ok(Object.getPrototypeOf(obj).hasOwnProperty("getSum"), "getSum method defined on prototype");
  deepEqual(obj.getSum(), 12, "share() property works");
  ok(Object.isFrozen(obj), "Object is frozen");
});

test("Using 'this' with function arguments", function() {
  var factory = oFactory().share(function() {
    this.getX = function() { return 5 ; }
  }).mixin(function() {
    var y = 7;
    
    this.getY = function() {
      return y;
    };
  }).init(function() {
    this.sum = this.getX() + this.getY();
  });
  var obj = factory(function() {
    this.x = 5;
  });
  
  ok(Object.getPrototypeOf(obj).hasOwnProperty("getX"), "getX method defined on prototype");
  deepEqual(obj.getX(), 5, "share() property works");
  ok(obj.hasOwnProperty("getY"), "getY method defined on object");
  deepEqual(obj.getY(), 7, "mixin() property works");
  ok(obj.hasOwnProperty("sum"), "'sum' property defined on object");
  deepEqual(obj.sum, 12, "init() property works");
});

test("oFactory.compose()", function() {
  var f1 = oFactory().mixin({ a: "a" });
  var f2 = oFactory().share({ getA: function() { return this.a; } });
  var f3 = oFactory().init(function(self) { self.b = "b"; });
  
  var comp = oFactory.compose(f1, f2, f3);
  var obj = comp();
  
  ok(obj.hasOwnProperty("a"), "'a' property defined on object");
  deepEqual(obj.a, "a", "mixin() property works");
  ok(Object.getPrototypeOf(obj).hasOwnProperty("getA"), "getA method defined on prototype");
  deepEqual(obj.getA(), "a", "share() property works");
  ok(obj.hasOwnProperty("b"), "'b' property defined on object");
  deepEqual(obj.b, "b", "init() property works");
});

test("Instance method compose()", function() {
  var f1 = oFactory().mixin({ a: "a" });
  var f2 = oFactory().share({ getA: function() { return this.a; } });
  var f3 = oFactory().init(function(self) { self.b = "b"; });
  
  var comp = f1.compose(f2, f3);
  var obj = comp();
  
  ok(obj.hasOwnProperty("a"), "'a' property defined on object");
  deepEqual(obj.a, "a", "mixin() property works");
  ok(Object.getPrototypeOf(obj).hasOwnProperty("getA"), "getA method defined on prototype");
  deepEqual(obj.getA(), "a", "share() property works");
  ok(obj.hasOwnProperty("b"), "'b' property defined on object");
  deepEqual(obj.b, "b", "init() property works");
});
