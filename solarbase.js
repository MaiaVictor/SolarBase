module.exports = (function(){
  var sol = require("./../sol/sol.js");
  var stx = require("./../sol/stx.js");
  var jit = require("./../sol/jit.js");
  var db = {};
  var types = {};
  var names = {};
  function show(term, expand){
    return stx.format(term, function(term){
      var val = stx.show(term);
      if (names[val] && names[val] !== expand && expand !== "*")
        return names[val];
    });
  };
  function set(name, source){
    if (db[name])
      for (var i=0, l=db[name].below.length; i<l; ++i)
        delete db[db[name].below[i]].above[name];
    else db[name] = {};
    var entry = stx.parse(source, types);
    db[name].below = entry.deps;
    db[name].above = {};
    for (var i=0, l=db[name].below.length; i<l; ++i)
      db[db[name].below[i]].above[name] = true;
    db[name].term = entry.term;
    update(name);
    if (name[0] !== ".")
      names[stx.show(db[name].norm)] = name;
  };
  function book(book){
    var lines = book.split("\n");
    var defs = [];
    var name = null;
    var code = [];
    function push(){
      if (name !== null && code.length > 0){
        set(name, code.join(" ").replace(/\s\s+/g, ' '));
        code = [];
      };
    };
    for (var i=0, l=lines.length; i<l; ++i){
      var line = lines[i];
      if (/^[ ]*$/.test(line) || /^[ ]*\|/.test(line))
        continue;
      if (line[0] === " ")
        code.push(line);
      else{
        push();
        name = line.replace(/[, ].*$/,"");
      };
    };
    push();
    return defs;
  };
  function update(name){
    var updated = {};
    return (function go(name){
      if (!updated[name]){
        var term = db[name].term;
        for (var i=db[name].below.length-1; i>=0; --i)
          term = sol.App(term, db[db[name].below[i]].norm);
        db[name].type = sol.type(term);
        db[name].norm = sol.norm(term);
        types[name] = db[name].type;
        updated[name] = true;
        for (var above in db[name].above)
          if (name !== above)
            go(above);
      };
    })(name);
  };
  function norm(name, expandAll){
    return show(db[name].norm, expandAll ? "*" : name);
  };
  function type(name, expandAll){
    return show(db[name].type, expandAll ? "*" : name);
  };
  function print(name, expandAll){
    console.log(name);
    console.log("  "+norm(name, expandAll));
    console.log("  "+type(name, expandAll));
  };
  return {
    set: set,
    norm: norm,
    type: type,
    book: book,
    print: print
  };
});
