const http=require('http'), fs=require('fs'), path=require('path');
const root=process.cwd();
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
http.createServer((req,res)=>{let p=req.url.split('?')[0]; if(p==='/') p='/index.html'; const file=path.join(root,p); if(!file.startsWith(root)||!fs.existsSync(file)){res.writeHead(404);return res.end('Not found')} res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain'}); fs.createReadStream(file).pipe(res)}).listen(4173,'127.0.0.1',()=>console.log('preview ready'));
