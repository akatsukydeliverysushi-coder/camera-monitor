const http=require('http');
const net=require('net');
const PORT=8787;
const HOST='127.0.0.1';
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});res.end(JSON.stringify(data));}
function testPort(host,port,timeout=2500){return new Promise(resolve=>{const s=new net.Socket();let done=false;const finish=open=>{if(done)return;done=true;try{s.destroy()}catch{};resolve(open)};s.setTimeout(timeout);s.once('connect',()=>finish(true));s.once('timeout',()=>finish(false));s.once('error',()=>finish(false));try{s.connect(port,host)}catch{finish(false)}})}
const server=http.createServer((req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
 if(req.method==='GET'&&req.url==='/api/health')return json(res,200,{ok:true,service:'Camera Monitor Companion',port:PORT});
 if(req.method==='POST'&&req.url==='/api/test'){
   let body='';req.on('data',c=>{body+=c;if(body.length>10000)req.destroy()});
   req.on('end',async()=>{try{const d=JSON.parse(body||'{}');const host=String(d.host||'').trim();const port=Number(d.port||80);if(!host||!Number.isInteger(port)||port<1||port>65535)return json(res,400,{ok:false,error:'host/port inválidos'});const open=await testPort(host,port);return json(res,200,{ok:true,open,host,port,checkedAt:new Date().toISOString()})}catch{return json(res,400,{ok:false,error:'JSON inválido'})}});return;
 }
 json(res,404,{ok:false,error:'Rota não encontrada'});
});
server.listen(PORT,HOST,()=>console.log(`Camera Monitor Companion: http://${HOST}:${PORT}`));
