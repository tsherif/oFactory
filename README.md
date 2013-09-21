oFactory
========

A simple, experimental JavaScript library for creating factories.

Concepts and API heavily inspired by Eric Elliot's stampit library: https://github.com/dilvie/stampit

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

Factories created by oFactory use three methods to define the objects they create. The **mixin()** and **shared()**
methods define properties that created objects will have, while the **init()** method describes any further preparation 
that is required after all properties of a created object are set. 

The **mixin()** method defines properties to be added directly to a created object 
(meaning they won't be shared between separate objects created by the factory):
```JavaScript
  var factory = oFactory().mixin({ hello: "hello" });
  var obj1 = factory();
  var obj2 = factory();
  
  obj1.hello = "good bye"
  obj2.hello  // No shared mixin state.
  => "hello"
```  

The **shared()** method defines properties to be added to the prototype of created objects 
(meaning they **will** be shared among all objects created by the factory). This is generally more useful
for defining methods:
```JavaScript
  var factory = oFactory().shared({
    getNum: function() { return 5; }
  });
  var obj = factory();
  
  obj.getNum(); 
  => 5
```  

Both methods can take several objects as arguments and will apply them in the order they are given
(i.e. objects later in the argument list will be given priority). This can be useful if mixins or 
shared properties are defined beforehand:
```JavaScript
  var hello_mixin = { hello: "hello" };
  var goodbye_mixin = { goodbye: "good bye" };
  var factory = oFactory().mixin(hello_mixin, goodbye_mixin);
  var obj = factory();
  
  obj.hello; 
  => "hello"
  obj.goodbye
  => "good bye"
```  

Both methods can also take as sole argument a function in which the appropriate object (either the created object
or the prototype) will be bound to **this**. This can be useful for creating closures to hide private data:
```JavaScript
  var factory = oFactory().mixin(function() {
    var x = "x";
    
    this.getX = function() {
      return x;
    };
  });
  var obj = factory();
  
  obj.getX();
  => "x"
```

Properties defined when a factory is created are essentially defaults that can
be overridden in two ways when the factory is actually used. The first is to 
simply pass an object with properties to be added or oroverridden in the new object: 
```JavaScript
  var factory = oFactory().mixin({ a: "a" });
  var obj = factory({ a: "b"});
  
  obj.a;
  => "b"
```

The second is to pass a function that will have **this** bound to the created object:
```JavaScript
  var factory = oFactory().mixin({ a: "a" });
  var obj = factory(function() {
    this.a = "world";
    this.b = "hello, " + this.a;
  });
  
  obj.a;
  => "world"
  obj.b;
  => "hello, world"
```

The **init()** can be used when further initialization is required after all of the created object's 
properties have been set (including those set during the actual call to the factory function). Its sole 
argument will be a function in which **this** is bound to the created object:
```JavaScript
  var factory = oFactory().init(function() {
    this.sum = this.x + this.y;
  });
  var obj = factory({
    x: 4,
    y: 3
  });
  
  obj.sum;
  => 7
```

Factory definition methods can be chained together as a shorthand to create more complex factories:
```JavaScript
  var factory = oFactory({
    getX: function() { return this.x; }
  }).mixin(function() {
    var y = 7;
    
    this.getY = function() {
      return y;
    };
  }).init(function() {
    this.sum = this.getX() + this.getY();
  }).shared({
    getSum: function() { return this.sum; }
  });
  var obj = factory({ x: 5 });
  
  obj.a;
  => 5
  obj.getX();
  => 5
  obj.getY();
  => 7
  obj.sum;
  => 12
  obj.getSum();
  => 12
```

Finally, factories can be composed using **oFactory.compose()** with any number of 
factories as arguments:
```JavaScript
  var f1 = oFactory().mixin({ a: "a" });
  var f2 = oFactory().shared({ getA: function() { return this.a; } });
  
  var comp = oFactory.compose(f1, f2);
  var obj = comp();
  
  obj.a;
  => "a"
  obj.getA();
  => "a"
```

There is also an instance method version of composition:
```JavaScript
  var f1 = oFactory().mixin({ a: "a" });
  var f2 = oFactory().shared({ getA: function() { return this.a; } });
  
  var comp = f1.compose(f2);
```
