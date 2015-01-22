/*globals __dirname */

var fs = require('fs');
var pathlib = require('path');
var util = require('util');

var basepath = __dirname + '/lib';
//var ret = fs.readFileSync(pathlib.join(__dirname,'additionals.scss')).toString();
var ret = "";

var isComment = function(line){
  var index = line.trim().indexOf("//");
  if(index > -1 && index < 2) return true;
};

var isImport = function(line){
  var index = line.trim().indexOf("@import");
  if(index > -1 && index < 2) return true;
};

var filenameFromImport = function(l){
  var indexOne = l.indexOf('"');
  var indexTwo = l.lastIndexOf('"');
  // import is always a dir, so instead of dirname we return filename
  var name = l.substring(indexOne+1,indexTwo);
  var lastslash = name.lastIndexOf('/');
  var path = name.substring(0,lastslash+1);
  var file = name.substring(lastslash+1);
  if(lastslash > -1){
    return path + "_" + file + ".scss";
  }
  else {
    return "_" + name + ".scss";
  }
};

var readFile = function(path){
  var newpath;
  var c = fs.readFileSync(path,'utf8');
  var lines = c.split("\n");
  lines.forEach(function(l){
    //util.log('parsing line: '+ l);
    if(isComment(l)) ret += l + "\n";
    else if(isImport(l)){
      
      newpath = pathlib.join(pathlib.dirname(path), filenameFromImport(l));
      if(!fs.existsSync(newpath)){
        newpath = pathlib.join(basepath,filenameFromImport(l));        
      }
      //util.log('trying to import: ' + newpath);
      readFile(newpath);
    }
    else {
      var unquoted_progid = /[\s]progid[\s\S]*?;/;
      var m = unquoted_progid.exec(l);
      if(m){
        var line = 'unquote("' + m[0].substr(0,m[0].length-1) + '");';
        l = l.replace(unquoted_progid,line);
      }
      else ret += l + "\n";
    }
  });
};

readFile(pathlib.join(basepath, '_compass.scss'));
readFile(pathlib.join(basepath, '_lemonade.scss'));
readFile(pathlib.join(basepath, 'animation/_core.scss'));
readFile(pathlib.join(basepath, 'animation/_animate.scss'));

//console.log(ret);
exports.compass = ret;

