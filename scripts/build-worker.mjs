import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), assets={};
function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())visit(p);else{const key='/'+path.relative('web',p).split(path.sep).join('/');assets[key]={type:({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png'})[path.extname(p)]||'application/octet-stream',body:fs.readFileSync(p).toString('base64')};}}}
visit('web');fs.mkdirSync('dist/server',{recursive:true});
let worker=fs.readFileSync('worker/index.mjs','utf8').replace("import {PUBLICATIONS_URL,PROJECTS_URL,parseImperialPublications,deduplicate,validateProjectUpdate,mergeProjects} from './content.mjs';",fs.readFileSync('worker/content.mjs','utf8').replaceAll('export ','')+'\n'+fs.readFileSync('worker/manuscript.mjs','utf8')+'\n'+fs.readFileSync('worker/featured.mjs','utf8')+'\n'+fs.readFileSync('worker/selfhost-updates.mjs','utf8'));
worker='const ASSETS='+JSON.stringify(assets)+';\nconst INITIAL='+fs.readFileSync('data/content.json','utf8')+';\n'+worker;
fs.writeFileSync('dist/server/index.js',worker);fs.writeFileSync('dist/server/package.json','{"type":"module"}');
console.log('Built Worker with '+Object.keys(assets).length+' assets.');
