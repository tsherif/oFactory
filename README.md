oFactory
========

A simple, experimental JavaScript library for creating factories.

Concepts and API heavily inspired by Eric Elliot's [stampit](https://github.com/dilvie/stampit) library. 

Essentially this is just an attempt to implement similar functionality using a simpler API and conceptual model. This
library is thoroughly **untested**. Use at your own risk!

oFactory uses two basic concepts for object creation: **mixin** properties and **shared** properties. **mixin** properties
are added directly to a created object, while **shared** properties are added to the prototype of all objects created
by a given factory.

The oFactory library consists of one function that returns a factory: 
```JavaScript
  oFactory()
```

If the the **oFactory()** function is passed an object as argument, that object will become the prototype for all objects
created by the returned factory.
```JavaScript
 var proto = { hello: "hello" };
 var factory = oFactory(proto);
 
 var obj = factory();
 proto.isPrototypeOf(obj);
 => true
```

Factories created by oFactory can use five methods to describe the objects they create. The **mixin()** and **share()**
methods define properties that created objects will have. The **init()** method describes any further initialization
that is required after all properties of a created object are set. The **seal()** and **freeze()** methods direct a 
factory to create 
[sealed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) or 
[frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) 
objects, respectively.

The **mixin()** method defines properties to be added directly to a created object 
(meaning they won't be shared between separate objects created by the factory):
```JavaScript
  var factory = oFactory().mixin({ hello: "hello" });
  var obj1 = factory();
  var obj2 = factory();
  
  obj1.hello = "good bye";
  obj2.hello  // No shared mixin state.
  => "hello"
```  

The **share()** method defines properties to be added to the prototype of created objects 
(meaning they **will** be shared among all objects created by the factory). This is generally more useful
for defining methods:
```JavaScript
  var factory = oFactory().share({
    getNum: function() { return 5; }
  });
  var obj = factory();
  
  obj.getNum(); 
  => 5
```  
Both methods can also take as argument a function to which the appropriate object (either the created object
or the prototype) will be passed as the sole argument. This is useful for creating closures to hide private data or
when property values need to be computed at creation time:
```JavaScript
  var factory = oFactory().share(function(proto) {
    var x = "x";
    
    proto.getX = function() {
      return x;
    };
  }).mixin(function(self) {
    self.created_at = Date.now();
  });
  var obj = factory();
  
  obj.getX();
  => "x"
  obj.created_at;
  => 1380279181489
```

Both methods can take several objects or functions as arguments and will apply them in the order they are given
(i.e. arguments given later will have priority). This can be useful if mixins or 
shared properties are defined beforehand:
```JavaScript
  var hello_mixin = { hello: "hello" };
  var goodbye_mixin = function(self) { self.goodbye = "good bye"; };
  var factory = oFactory().mixin(hello_mixin, goodbye_mixin);
  var obj = factory();
  
  obj.hello; 
  => "hello"
  obj.goodbye
  => "good bye"
```  

Properties defined when a factory is created are essentially defaults that can
be overridden in two ways when the factory is actually used. The first is to 
simply pass an object with properties to be added or overridden in the new object: 
```JavaScript
  var factory = oFactory().mixin({ a: "a" });
  var obj = factory({ a: "b"});
  
  obj.a;
  => "b"
```

The second is to pass a function to which the created object will be passed as sole argument:
```JavaScript
  var factory = oFactory().mixin({ a: "a" });
  var obj = factory(function(self) {
    self.a = "world";
    self.b = "hello, " + self.a;
  });
  
  obj.a;
  => "world"
  obj.b;
  => "hello, world"
```

Note that there is a slight difference in the behaviour of object arguments passed to **.mixin()** versus
those passed to **.share()** or a factory function. Object arguments passed to **.share()** or
a factory function will have the values of their properties copied directly into the
appropriate object (prototype or created object). On the other hand, the values in objects passed
to **.mixin()** will potentially be used in many objects, so to avoid shared state, the values in 
created objects will be deep copies of the originals:
```JavaScript
  var obj_arg = { a: {b: "c"} };

  var factory1 = oFactory().mixin(obj_arg);
  var obj1 = factory1();
  obj1.a === obj_arg.a;
  => false
  
  var factory2 = oFactory().share(obj_arg);
  var obj2 = factory2();
  obj2.a === obj_arg.a;
  => true
  
  var factory3 = oFactory();
  var obj3 = factory3(obj_arg);
  obj3.a === obj_arg.a;
  => true
```


The **init()** method can be used when further initialization is required after all of the created object's 
properties have been set (including those set during the actual call to the factory function). Its sole 
argument is a function to which the created object is passed as sole argument:
```JavaScript
  var factory = oFactory().init(function(self) {
    self.sum = self.x + self.y;
  });
  var obj = factory({
    x: 4,
    y: 3
  });
  
  obj.sum;
  => 7
```

The methods **seal()** and **freeze()** take no arguments and simply direct the factory to seal or freeze, respectively,
the objects it creates: 
```JavaScript
  var factory = oFactory().seal();
  var obj = factory();
  
  Object.isSealed(obj);
  => true
  
  var factory = oFactory().freeze();
  var obj = factory();
  
  Object.isFrozen(obj);
  => true
```

Factory definition methods can be chained together as a shorthand to create more complex factories:
```JavaScript
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
  
  obj.x;
  => 5
  obj.getX();
  => 5
  obj.getY();
  => 7
  obj.sum;
  => 12
  obj.getSum();
  => 12
  Object.isFrozen(obj);
  => true
```

When a function is passed as argument to a property definition method or a factory function call, 
**this** is bound to the appropriate object, either the created object or the prototype, 
as another way to refer to it. So the following two factories and factory function
calls are equivalent: 
```JavaScript
  var factory1 = oFactory().share(function(proto) {
    proto.getX = function() { return 5 ; }
  }).mixin(function(self) {
    var y = 7;
    
    self.getY = function() {
      return y;
    };
  }).init(function(self) {
    self.sum = self.getX() + self.getY();
  });
  var obj1 = factory1(function(self) {
    self.x = 5;
  });
  
  var factory2 = oFactory().share(function() {
    this.getX = function() { return 5 ; }
  }).mixin(function() {
    var y = 7;
    
    this.getY = function() {
      return y;
    };
  }).init(function() {
    this.sum = this.getX() + this.getY();
  });
  var obj2 = factory2(function() {
    this.x = 5;
  });
```
Choosing between the two formats is simply a matter of style, but note that in the latter format, 
the meaning of **this** is different in the **share()** callback (where it refers to the prototype) and
the **init()**, **mixin()** and factory function callbacks (where it refers to the created object).


Finally, factories can be composed using **oFactory.compose()** with any number of 
factories as arguments:
```JavaScript
  var f1 = oFactory().mixin({ a: "a" });
  var f2 = oFactory().share({ getA: function() { return this.a; } });
  
  var comp = oFactory.compose(f1, f2);
  var obj = comp();
  
  obj.a;
  => "a"
  obj.getA();
  => "a"
```

Note that the effects of **seal()** and **freeze()** are not passed to a composed factory
by its components. To freeze or seal a composed factory, simply call the appropriate method
after its creation:

```JavaScript
  var f1 = oFactory().mixin({ a: "a" });
  var f2 = oFactory().share({ getA: function() { return this.a; } });
  
  var comp = oFactory.compose(f1, f2).seal();
  var obj = comp();
  
  Object.isSealed(obj);
  => true
```

There is also an instance method version of composition:
```JavaScript
  var f1 = oFactory().mixin({ a: "a" });
  var f2 = oFactory().share({ getA: function() { return this.a; } });
  
  var comp = f1.compose(f2);
```
