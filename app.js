const $=id=>document.getElementById(id);
let devices=JSON.parse(localStorage.getItem('cameraDevices')||'[]');
let deferredPrompt=null;
function save(){localStorage.setItem('cameraDevices',JSON.stringify(devices));render();}
function esc(v){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
function render(){
 $('count').textContent=devices.length;
 const box=$('devices');
 if(!devices.length){box.innerHTML='<p class="empty">Nenhum dispositivo cadastrado.</p>';return;}
 box.innerHTML=devices.map((d,i)=>`<article class="device"><div class="deviceIcon">📹</div><div class="deviceData"><strong>${esc(d.name)}</strong><span>${esc(d.type)} • ${esc(d.host)}:${esc(d.port)}</span><small>Usuário: ${esc(d.user||'não informado')}</small></div><div class="deviceActions"><button class="open" data-i="${i}">Ao vivo</button><button class="delete" data-i="${i}">Excluir</button></div></article>`).join('');
 box.querySelectorAll('.open').forEach(b=>b.onclick=()=>openDevice(devices[+b.dataset.i]));
 box.querySelectorAll('.delete').forEach(b=>b.onclick=()=>{if(confirm('Excluir este dispositivo?')){devices.splice(+b.dataset.i,1);save();}});
}
function openDevice(d){
 $('viewerTitle').textContent='Ao vivo — '+d.name;
 $('closeBtn').hidden=false;
 $('viewerInfo').textContent=`${d.type} • ${d.host}:${d.port}`;
 $('screen').innerHTML='<div class="offline"><b>Preparado para transmissão</b><span>O dispositivo foi selecionado. Para vídeo real, conecte o serviço local ONVIF/RTSP.</span></div>';
 document.querySelector('.viewer').scrollIntoView({behavior:'smooth'});
}
$('closeBtn').onclick=()=>{ $('viewerTitle').textContent='Visualização ao vivo'; $('closeBtn').hidden=true; $('viewerInfo').textContent=''; $('screen').innerHTML='<div>Selecione um dispositivo para iniciar a visualização.</div>'; };
$('addBtn').onclick=()=>{
 const d={name:$('name').value.trim()||'Dispositivo',host:$('host').value.trim(),port:+$('port').value||80,type:$('type').value,user:$('user').value.trim()};
 if(!d.host){alert('Informe o IP ou domínio do dispositivo.');return;}
 devices.push(d);save();['name','host','user','pass'].forEach(id=>$(id).value='');
};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false;});
$('installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true;};
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
render();