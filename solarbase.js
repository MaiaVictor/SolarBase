module.exports = (function(persist){
  var sol = require("./../sol/sol.js");
  var stx = require("./../sol/stx.js");
  var jit = require("./../sol/jit.js");
  var db = {};
  var names = {};

  function show(term, expand){
    return stx.format(term, function(term){
      var val = stx.show(term);
      if (names[val] && names[val] !== expand && expand !== "*")
        return names[val];
    });
  };

  function set(name, source){
    // Deletes old entries
    if (db[name])
      for (var i=0, l=db[name].below.length; i<l; ++i)
        delete db[db[name].below[i]].above[name];
    else db[name] = {};

    // Parses the source to get a term and its deps
    var parsed = stx.parse(source);

    // Includes on registry
    db[name].source = source;
    db[name].below = parsed.deps;
    db[name].above = {};
    for (var i=0, l=db[name].below.length; i<l; ++i)
      db[db[name].below[i]].above[name] = true;
    db[name].term = parsed.term;

    // Computes the normal forms
    var updated = {};
    if (!db[name].norm)
      (function refresh(name){
        if (!updated[name]){
          var term = db[name].term;
          for (var i=db[name].below.length-1; i>=0; --i)
            term = sol.Lam(db[db[name].below[i]].type, term);
          for (var i=db[name].below.length-1; i>=0; --i)
            term = sol.App(term, db[db[name].below[i]].norm);
          db[name].type = sol.type(term);
          db[name].norm = sol.norm(term);
          updated[name] = true;
          for (var above in db[name].above)
            if (name !== above)
              refresh(above);
        };
      })(name);

    // Registers aliases
    if (name[0] !== ".")
      names[stx.show(db[name].norm)] = name;
  };

  function norm(name, expandAll){
    return show(db[name].norm, expandAll ? "*" : name);
  };

  function type(name, expandAll){
    return show(db[name].type, expandAll ? "*" : name);
  };

  function exists(name){
    return !!db[name];
  };

  function print(name, expandAll){
    console.log(name);
    console.log("  "+norm(name, expandAll));
    console.log("  "+type(name, expandAll));
  };

  function loadBook(namesAndCodes){
    // Finds dependencies
    var terms = [];
    for (var i=0, l=namesAndCodes.length; i<l; ++i)
      terms.push({
        name: namesAndCodes[i].name,
        code: namesAndCodes[i].code,
        deps: stx.parse(namesAndCodes[i].code).deps});
    // Sorts topologically
    var countedTerm = {};
    while (terms.length > 0){
      var nextTerms = [];
      get: for (var i=0, l=terms.length; i<l; ++i){
        var term = terms[i];
        for (var j=0, m=term.deps.length; j<m; ++j){
          if (!countedTerm[term.deps[j]]){
            nextTerms.push(term);
            continue get;
          };
        };
        countedTerm[term.name] = true;
        set(term.name, term.code);
      };
      terms = nextTerms;
    };
  };
  
  if (persist){
    var fs = require("f"+"s");
    var path = persist;
    var load = function(name){
      return fs.readFileSync(path+"/"+name+".sol", "utf8");
    };
    var save = function(name, code){ 
      fs.writeFileSync(path+"/"+name+".sol", code);
    };
    var files = fs.readdirSync(path);
    var book = [];
    for (var i=0, l=files.length; i<l; ++i)
      if (files[i].slice(-4) === ".sol")
        book.push({
          name: files[i].slice(0,-4),
          code: fs.readFileSync(path+"/"+files[i], "utf8")});
    loadBook(book);
  };

  return {
    set: set,
    norm: norm,
    type: type,
    exists: exists,
    print: print
  };
});
