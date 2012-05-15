var Interface = function (name, methods) {
	
    if (arguments.length != 2) {
        throw new Error("Interface constructor called with " + arguments.length +
        "arguments, but expected exactly 2.");
    }
    this.name = name;
    this.methods = [];
    for (var i = 0, len = methods.length; i < len; i += 1) {
        if (typeof methods[i] !== 'string') {
            throw new Error("Interface constructor expects method names to be passed in as a string.");
        }
        this.methods.push(methods[i]);
    }
};

// Static class method.
Interface.ensureImplements = function (object) {
    var i,
    j,
    obj_interface,
    method;
    if (arguments.length < 2) {
        throw new Error("Function Interface.ensureImplements called with " +
        arguments.length + "arguments, but expected at least 2.");
    }
    for (i = 1; i < arguments.length; i += 1) {
        obj_interface = arguments[i];
        if (obj_interface.constructor !== Interface) {
            throw new Error("Function Interface.ensureImplements expects arguments two and above to be instances of Interface.");
        }
        for (j = 0; j < obj_interface.methods.length; j += 1) {
            method = obj_interface.methods[j];
            if (!object[method] || typeof object[method] !== 'function') {
                throw new Error("Function Interface.ensureImplements: object  does not implement the " + obj_interface.name  + " interface. Method " + method + " was not found.");
            }
        }
    }
};
