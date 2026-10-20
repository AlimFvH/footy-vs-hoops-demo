(function(){function show(m){var f=document.getElementById('fatal');if(!f)return;f.hidden=false;f.textContent='FOOTY vs HOOPS could not start: '+m;}
window.addEventListener('error',function(e){show(e.message||'error');});window.addEventListener('unhandledrejection',function(e){show(String(e.reason&&e.reason.message||e.reason));});})();
