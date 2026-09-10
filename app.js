const $=id=>document.getElementById(id);
let devices=JSON.parse(localStorage.getItem('cameraDevices')||'[]');
let deferredPrompt=null;
let activeDevice=null;
let activeLayout=1;
function save(){localStorage.setItem('cameraDevices',JSON.stringify(devices));render();}
function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
function statusLabel(d){return d.status==='online'?'Online':d.status==='offline'?'Offline':'Não testado';}
function filtered(){
 const q=($('search').value||'').toLowerCase().trim();
 const sort=$('sort').value;
 let list=devices.filter(d=>!q||`${d.name} ${d.host} ${d.type}`.toLowerCase().includes(q));
 list.sort((a,b)=>String(a[sort]||'').localeCompare(String(b[sort]||''),'pt-BR'));
 return list;
}
function render(){
 $('count').textContent=devices.length;
 $('onlineCount').textContent=devices.filter(d=>d.status==='online').length;
 $('offlineCount').textContent=devices.filter(d=>d.status==='offline').length;
 $('viewingCount').textContent=activeDevice?1:0;
 const box=$('devices'); const list=filtered();
 if(!list.length){box.innerHTML='<p class="empty">'+(devices.length?'Nenhum dispositivo encontrado.':'Nenhum dispositivo cadastrado.')+'</p>';return;}
 box.innerHTML=list.map(d=>{
   const i=devices.indexOf(d); const st=d.status||'unknown';
   return `<article class="device ${st}"><div class="deviceIcon">📹</div><div class="deviceData"><strong>${esc(d.name)}</strong><span>${esc(d.type)} • ${esc(d.host)}:${esc(d.port)}</span><small>Usuário: ${esc(d.user||'não informado')}</small></div><span class="badge ${st}"><i></i>${statusLabel(d)}</span><div class="deviceActions"><button class="test" data-i="${i}">Testar</button><button class="open" data-i="${i}">Ao vivo</button><button class="delete" data-i="${i}">Excluir</button></div></article>`;
 }).join('');
 box.querySelectorAll('.open').forEach(b=>b.onclick=()=>openDevice(devices[+b.dataset.i]));
 box.querySelectorAll('.delete').forEach(b=>b.onclick=()=>{if(confirm('Excluir este dispositivo?')){if(activeDevice===devices[+b.dataset.i])closeViewer();devices.splice(+b.dataset.i,1);save();}});
 box.querySelectorAll('.test').forEach(b=>b.onclick=()=>testDevice(devices[+b.dataset.i],b));
}
async function testDevice(d,btn){
 btn.disabled=true;btn.textContent='Testando…';d.status='testing';render();
 try{
   const base=localStorage.getItem('cameraCompanion')||'http://127.0.0.1:8787';
   const r=await fetch(base.replace(/\/$/,'')+'/api/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({host:d.host,port:d.port})});
   if(!r.ok)throw Error('Serviço local indisponível');
   const data=await r.json();d.status=data.open?'online':'offline';d.lastTest=new Date().toISOString();
 }catch(e){d.status='offline';d.lastTest=new Date().toISOString();alert('Não foi possível testar pelo serviço local.\n\nInstale/inicie o Camera Monitor Companion no PC para o teste de rede.');}
 save();
}
function openDevice(d){
 activeDevice=d;$('viewerTitle').textContent='Ao vivo — '+d.name;$('closeBtn').hidden=false;$('viewerInfo').textContent=`${d.type} • ${d.host}:${d.port} • ${statusLabel(d)}`;
 const screen=$('screen');screen.className='screen grid'+activeLayout;
 screen.innerHTML='';
 for(let n=0;n<activeLayout;n++){
   const cell=document.createElement('div');cell.className='cameraCell';
   if(n===0){cell.innerHTML=`<div class="emptyViewer"><div class="bigCam">📹</div><b>${esc(d.name)}</b><span>Pronto para HLS/WebRTC.</span><small>O Companion fará a ponte ONVIF/RTSP.</small></div>`;}
   else cell.innerHTML='<div class="emptyViewer"><div class="bigCam">＋</div><span>Adicionar câmera</span></div>';
   screen.appendChild(cell);
 }
 render();document.querySelector('.viewer').scrollIntoView({behavior:'smooth'});
}
function closeViewer(){activeDevice=null;$('viewerTitle').textContent='Visualização ao vivo';$('closeBtn').hidden=true;$('viewerInfo').textContent='';$('screen').className='screen grid1';$('screen').innerHTML='<div class="emptyViewer"><div class="bigCam">📹</div><b>Selecione uma câmera</b><span>O painel está pronto para vídeo HLS/WebRTC.</span></div>';render();}
$('closeBtn').onclick=closeViewer;
$('addBtn').onclick=()=>{
 const d={id:crypto.randomUUID(),name:$('name').value.trim()||'Dispositivo',host:$('host').value.trim(),port:Math.min(65535,Math.max(1,+$('port').value||80)),type:$('type').value,user:$('user').value.trim(),status:'unknown'};
 if(!d.host){alert('Informe o IP ou domínio do dispositivo.');return;}
 if(devices.some(x=>x.host===d.host&&+x.port===d.port)){alert('Este IP e porta já estão cadastrados.');return;}
 devices.push(d);save();['name','host','user','pass'].forEach(id=>$(id).value='');
};
$('search').oninput=render;$('sort').onchange=render;
$('layout').onchange=e=>{activeLayout=+e.target.value;if(activeDevice)openDevice(activeDevice);};
$('fullscreenBtn').onclick=async()=>{const el=$('.viewer');if(!document.fullscreenElement)await el.requestFullscreen?.();else await document.exitFullscreen?.();};
$('settingsBtn').onclick=()=>{const current=localStorage.getItem('cameraCompanion')||'http://127.0.0.1:8787';const value=prompt('Endereço do Camera Monitor Companion:',current);if(value!==null&&value.trim())localStorage.setItem('cameraCompanion',value.trim().replace(/\/$/,''));};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false;});
$('installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true;};
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
render();