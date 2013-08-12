oFactory
========

A simple JavaScript library for creating factories.

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

Factories created by oFactory have two methods defined on them. The **mixin()** method will define properties to be 
added directly to a created object (meaning they won't be shared between separate objects created by the factory):
```JavaScript
  var factory = oFactory().mixin({ hello: "hello" });
  var obj1 = factory();
  var obj2 = factory();
  
  obj1.hello = "good bye"
  obj2.hello  // No shared mixin state.
  => "hello"
```  

The **shared()** method will define properties to be added directly to prototype of created objects 
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

Both methods can take several objects as arguments and will apply them from left to right. This can 
be useful if mixins are defined separately:
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

Methods can be chained together as a shorthand to create more complex factories:
```JavaScript
  var factory = oFactory().mixin({a: "a"}).shared({
    getA: function() { return this.a; }
  }).mixin(function() {
    var b = "b";
    
    this.getB = function() {
      return b;
    };
  });
  var obj = factory();
  
  obj.a;
  => "a"
  obj.getA();
  => "a"
  obj.getB();
  => "b"
```

Finally, factories can be composed using **oFactory.compose()** with any number of 
factories as arguments:
```JavaScript
  var f1 = oFactory().mixin({a: "a"});
  var f2 = oFactory().shared({getA: function() { return this.a; }});
  
  var comp = oFactory.compose(f1, f2);
  var obj = comp();
  
  obj.a;
  => "a"
  obj.getA();
  => "a"
```

There is also an instance method version of composition:
```JavaScript
  var f1 = oFactory().mixin({a: "a"});
  var f2 = oFactory().shared({getA: function() { return this.a; }});
  
  var comp = f1.compose(f2);
```
