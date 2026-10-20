(function(){var defs={},mods={};
function norm(base,n){if(n[0]!=='.')return n;var p=base.split('/');p.pop();n.split('/').forEach(function(s){if(s==='.'||s==='')return;if(s==='..')p.pop();else p.push(s);});return p.join('/');}
window.define=function(name,deps,fn){defs[name]=[deps,fn];};
function load(name){if(mods[name])return mods[name].exports;var d=defs[name];if(!d)throw new Error('module '+name);var m=mods[name]={exports:{}};
var args=d[0].map(function(x){if(x==='require')return function(ds,ok,fail){if(typeof ds==='string')return load(norm(name,ds));try{ok&&ok.apply(null,ds.map(function(y){return load(norm(name,y));}));}catch(e){if(fail)fail(e);else throw e;}};if(x==='exports')return m.exports;return load(norm(name,x));});d[1].apply(null,args);return m.exports;}
window.require=function(ds,ok,fail){
  if(typeof ds==='string')return load(ds);
  try{
    var res=(Array.isArray(ds)?ds:[ds]).map(function(y){return load(y);});
    if(ok)ok.apply(null,res);
    return res;
  }catch(e){
    if(fail)fail(e);else console.warn(e);
  }
};
window.__boot=function(){load('main');};})();
