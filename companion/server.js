const http=require('http');
const net=require('net');
const fs=require('fs');
const path=require('path');
const os=require('os');
const {spawn,execFile}=require('child_process');
const crypto=require('crypto');

const PORT=8787;
const HOST='127.0.0.1';
const ROOT=path.join(os.tmpdir(),'camera-monitor-streams');
const APP_DIR=process.pkg ? path.dirname(process.execPath) : __dirname;
const FFMPEG_PATH=process.platform==='win32' ? path.join(APP_DIR,'ffmpeg.exe') : 'ffmpeg';
const streams=new Map();
fs.mkdirSync(ROOT,{recursive:true});

function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');}
function json(res,status,data){cors(res);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function testPort(host,port,timeout=2500){return new Promise(resolve=>{const s=new net.Socket();let done=false;const finish=open=>{if(done)return;done=true;try{s.destroy()}catch{};resolve(open)};s.setTimeout(timeout);s.once('connect',()=>finish(true));s.once('timeout',()=>finish(false));s.once('error',()=>finish(false));try{s.connect(port,host)}catch{finish(false)}})}
function body(req){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>100000)req.destroy();});req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch(e){reject(e)}});req.on('error',reject);});}
function validRtsp(url){try{const u=new URL(String(url||''));return ['rtsp:','rtsps:'].includes(u.protocol)&&!!u.hostname;}catch{return false;}}
function ffmpegAvailable(){return new Promise(resolve=>execFile(FFMPEG_PATH,['-version'],{windowsHide:true},e=>resolve(!e)));}
function safeId(){return crypto.randomBytes(8).toString('hex');}
function cleanStream(id){const s=streams.get(id);if(!s)return;try{s.proc?.kill('SIGKILL')}catch{};streams.delete(id);try{fs.rmSync(s.dir,{recursive:true,force:true})}catch{}}

function startStream(rtsp){
 return new Promise(async(resolve,reject)=>{
  if(!validRtsp(rtsp))return reject(new Error('URL RTSP inválida'));
  if(!(await ffmpegAvailable()))return reject(new Error('FFmpeg não encontrado no Companion'));
  const id=safeId();const dir=path.join(ROOT,id);fs.mkdirSync(dir,{recursive:true});
  const playlist=path.join(dir,'index.m3u8');
  const args=['-hide_banner','-loglevel','warning','-rtsp_transport','tcp','-i',rtsp,'-analyzeduration','1000000','-probesize','1000000','-c:v','copy','-an','-f','hls','-hls_time','1','-hls_list_size','5','-hls_flags','delete_segments+append_list',playlist];
  const proc=spawn(FFMPEG_PATH,args,{windowsHide:true});
  const stream={id,dir,proc,playlist,startedAt:new Date().toISOString(),error:''};streams.set(id,stream);
  let settled=false;
  const timer=setTimeout(()=>{if(!settled){settled=true;resolve({id,url:`http://${HOST}:${PORT}/streams/${id}/index.m3u8`})}},7000);
  proc.stderr.on('data',d=>{stream.error=String(d).slice(-4000)});
  proc.on('error',e=>{clearTimeout(timer);if(!settled){settled=true;cleanStream(id);reject(new Error('Não foi possível iniciar FFmpeg: '+e.message));}});
  proc.on('exit',()=>{if(!settled){clearTimeout(timer);settled=true;cleanStream(id);reject(new Error(stream.error||'FFmpeg encerrou antes de gerar o vídeo'));}});
 });
}

const server=http.createServer(async(req,res)=>{
 cors(res);
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
 if(req.method==='GET'&&req.url==='/api/health')return json(res,200,{ok:true,service:'Camera Monitor Companion',port:PORT,ffmpeg:await ffmpegAvailable()});
 if(req.method==='POST'&&req.url==='/api/test'){
  try{const d=await body(req);const host=String(d.host||'').trim();const port=Number(d.port||80);if(!host||!Number.isInteger(port)||port<1||port>65535)return json(res,400,{ok:false,error:'host/port inválidos'});const open=await testPort(host,port);return json(res,200,{ok:true,open,host,port,checkedAt:new Date().toISOString()});}catch{return json(res,400,{ok:false,error:'JSON inválido'});}
 }
 if(req.method==='POST'&&req.url==='/api/stream/start'){
  try{const d=await body(req);const result=await startStream(d.rtsp);return json(res,200,{ok:true,...result});}catch(e){return json(res,400,{ok:false,error:e.message});}
 }
 if(req.method==='POST'&&req.url==='/api/stream/stop'){
  try{const d=await body(req);if(d.id)cleanStream(String(d.id));return json(res,200,{ok:true});}catch{return json(res,400,{ok:false,error:'JSON inválido'});}
 }
 if(req.method==='GET'&&req.url.startsWith('/streams/')){
  const rel=req.url.slice('/streams/'.length).split('?')[0];
  const parts=rel.split('/').filter(Boolean);if(parts.length!==2)return json(res,404,{ok:false,error:'Stream não encontrado'});
  const [id,file]=parts;const s=streams.get(id);if(!s||file!=='index.m3u8'&&!file.endsWith('.ts'))return json(res,404,{ok:false,error:'Stream não encontrado'});
  const target=path.join(s.dir,file);if(!target.startsWith(s.dir)||!fs.existsSync(target))return json(res,404,{ok:false,error:'Arquivo ainda não disponível'});
  const type=file.endsWith('.m3u8')?'application/vnd.apple.mpegurl':'video/mp2t';res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache','Access-Control-Allow-Origin':'*'});return fs.createReadStream(target).pipe(res);
 }
 json(res,404,{ok:false,error:'Rota não encontrada'});
});

server.listen(PORT,HOST,()=>console.log(`Camera Monitor Companion: http://${HOST}:${PORT}`));
process.on('SIGINT',()=>{for(const id of streams.keys())cleanStream(id);process.exit(0)});
process.on('SIGTERM',()=>{for(const id of streams.keys())cleanStream(id);process.exit(0)});
