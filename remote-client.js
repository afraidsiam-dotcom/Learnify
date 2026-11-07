/* StudyBuddy BD – রিমোট কন্ট্রোল ক্লায়েন্ট
   অ্যাপের index.html এর </body> এর আগে বসাবে:  <script src="remote-client.js"></script>  */
(function(){
  const PROJECT_ID='studybuddy-bd-71be6', API_KEY='এখানে-apiKey', APP_VERSION='1.0.0';
  const B='https://firestore.googleapis.com/v1/projects/'+PROJECT_ID+'/databases/(default)/documents';
  const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k)||'';localStorage.setItem(k,v)}catch(e){return ''}};
  let id=LS('sb_uid');
  if(!id){id=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);LS('sb_uid',id)}
  const S=x=>({stringValue:String(x)}), val=f=>f?(f.stringValue!==undefined?f.stringValue:f.booleanValue):'';
  const num=v=>String(v||'0').split('.').map(n=>parseInt(n)||0);
  const lt=(a,b)=>{a=num(a);b=num(b);for(let i=0;i<3;i++){if((a[i]||0)!==(b[i]||0))return(a[i]||0)<(b[i]||0)}return false};
  function overlay(html,closable){
    const d=document.createElement('div');
    d.style.cssText='position:fixed;inset:0;z-index:99999;background:#071725;color:#f3efff;display:flex;align-items:center;justify-content:center;text-align:center;padding:28px;font:16px system-ui,sans-serif';
    d.innerHTML='<div style="max-width:420px">'+html+(closable?'<br><button id="sbx" style="margin-top:16px;padding:10px 18px;border:0;border-radius:10px">পরে</button>':'')+'</div>';
    document.body.appendChild(d);if(closable)d.querySelector('#sbx').onclick=()=>d.remove();
  }
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function getName(){try{return(JSON.parse(localStorage.getItem('studybuddy_bd_ultimate_ui_v2')||'{}').profile||{}).name||''}catch(e){return ''}}
  async function run(){
    try{
      const now=new Date().toISOString();
      const f={last:S(now),ver:S(APP_VERSION),device:S(navigator.userAgent.slice(0,60)),name:S(getName())};
      let mask='updateMask.fieldPaths=last&updateMask.fieldPaths=ver&updateMask.fieldPaths=device&updateMask.fieldPaths=name';
      if(!LS('sb_first')){f.first=S(now);mask+='&updateMask.fieldPaths=first';LS('sb_first',now)}
      fetch(B+'/users/'+id+'?'+mask+'&key='+API_KEY,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:f})}).catch(()=>{});
      const [c,u]=await Promise.all([
        fetch(B+'/config/app?key='+API_KEY).then(r=>r.json()),
        fetch(B+'/users/'+id+'?key='+API_KEY).then(r=>r.json())]);
      if(u.fields&&u.fields.blocked&&u.fields.blocked.booleanValue)return overlay('<h2>🚫 অ্যাক্সেস বন্ধ</h2><p>আপনার অ্যাকাউন্ট বন্ধ করা হয়েছে।</p>');
      const g=c.fields||{};
      if(val(g.maintenance)===true)return overlay('<h2>🛠️ মেইনটেন্যান্স চলছে</h2><p>'+esc(val(g.maintenanceMsg)||'একটু পরে আবার চেষ্টা করুন।')+'</p>');
      const url=val(g.updateUrl),link=url?'<br><a href="'+esc(url)+'" style="color:#6b9cff">আপডেট করুন</a>':'';
      if(val(g.minVersion)&&lt(APP_VERSION,val(g.minVersion)))return overlay('<h2>⬆️ আপডেট প্রয়োজন</h2><p>চালিয়ে যেতে অ্যাপ আপডেট করুন।</p>'+link);
      if(val(g.latestVersion)&&lt(APP_VERSION,val(g.latestVersion)))overlay('<h2>🆕 নতুন ভার্সন এসেছে</h2>'+link,true);
      if(val(g.announceOn)===true&&val(g.announcement)){
        const k='sb_ann_'+val(g.announcement).length+val(g.announcement).slice(0,10);
        if(!LS(k)){LS(k,'1');overlay('<h2>📢 ঘোষণা</h2><p>'+esc(val(g.announcement))+'</p>',true)}
      }
    }catch(e){/* অফলাইনে অ্যাপ স্বাভাবিক চলবে */}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
