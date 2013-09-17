/////////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)
// 
// Copyright (c) 2013 Tarek Sherif
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
/////////////////////////////////////////////////////////////////////////////////////

var oFactory = (function() {

  var objectExtend = function(obj, extension) {    
    Object.getOwnPropertyNames(extension).forEach(function(key) {
      obj[key] = copyValue(extension[key]);
    });
  };
  
  var moduleExtend = function(obj, extensions) {
    extensions.forEach(function (extension) {
      extension.call(obj);
    });
  };
  
  var extend = function(props, mods, extensions) {
    extensions.forEach(function (extension) {
      if (typeof extension === "function") {
        mods.push(extension);
      } else if (typeof extension === "object"){
        objectExtend(props, extension);
      }
    });
  };
  
  var copyValue = function copyValue(val) {
    var result;
    
    if (Array.isArray(val)) {
      result = [];
      val.forEach(function(elem) {
        result.push(copyValue(elem));
      });
    } else if (typeof val === "object") {
      result = {};
      Object.keys(val).forEach(function(key) {
        result[key] = copyValue(val[key]);
      });
    } else {
      result = val;
    }
    
    return result;
  };

  var oFactory = function(proto) {    
    var factory = function(props) {
      var obj;
      var specs = factory.specs;
      props = props || {};
      
      obj = Object.create(specs.proto);
     
      objectExtend(obj, specs.instance_properties);
      moduleExtend(obj, specs.instance_modules);
      objectExtend(obj, props);    
      
      return obj;
    };
    
    factory.specs = {
      proto: proto || {},
      instance_modules: [],
      instance_properties: {}
    };
    
    factory.mixin = function() {
      extend(this.specs.instance_properties, this.specs.instance_modules, Array.prototype.slice.call(arguments));
      
      return this;
    };
    
    factory.shared = function() {
      var extensions = Array.prototype.slice.call(arguments);
      var i, count;
      var mods = [];
      
      for(i = 0, count = extensions.length; i < count; i++) {
        extension = extensions[i];
        if (typeof extension === "function") {
          mods.push(extension);
        } else if (typeof extension === "object"){
          objectExtend(this.specs.proto, extension);
        }
      }
      
      moduleExtend(this.specs.proto, mods);
      
      return this;
    };
    
    factory.compose = function() {
      var factories = [this].concat(Array.prototype.slice.call(arguments));
      
      return oFactory.compose.apply(oFactory, factories)
    }
    
    return factory;
  };
  
  oFactory.compose = function() {
    var comp = oFactory();
    comp.specs = {
      proto: {},
      instance_modules: [],
      instance_properties: {}
    }
    
    Array.prototype.slice.call(arguments).forEach(function(f) {
      objectExtend(comp.specs.proto, f.specs.proto);
      objectExtend(comp.specs.instance_properties, f.specs.instance_properties)
      Array.prototype.push.apply(comp.specs.instance_modules, f.specs.instance_modules);
    });
        
    return comp;
  };
  
  return oFactory;
})();



