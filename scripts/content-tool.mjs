// Local maintenance only; no admin/API server is published on GitHub Pages.
import fs from 'node:fs';import crypto from 'node:crypto';import worker from '../dist/server/index.js';import {fileBucket} from './file-bucket.mjs';
const name=process.argv[2],args=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):{};
if(!name)throw Error('Usage: node scripts/content-tool.mjs TOOL_NAME [arguments.json]');
const token=crypto.randomBytes(32).toString('hex');
const r=await worker.fetch(new Request('https://local-maintenance.invalid/api/content-tools',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})}),{BUCKET:fileBucket(),ADMIN_TOKEN:token});
const result=await r.json();console.log(JSON.stringify(result,null,2));if(result.error||result.result?.isError)process.exitCode=1;
