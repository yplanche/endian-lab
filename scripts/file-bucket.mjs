import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
export function fileBucket(root='data'){
 const base=path.resolve(root);fs.mkdirSync(base,{recursive:true});
 const resolveKey=key=>{if(key==='lab-content/v1.json')return path.join(base,'content.json');const p=path.resolve(base,'objects',key);if(!p.startsWith(path.join(base,'objects')+path.sep))throw Error('Invalid object key');return p;};
 const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
 return {
 async get(key){const p=resolveKey(key);if(!fs.existsSync(p))return null;const bytes=fs.readFileSync(p);return {etag:hash(bytes),body:bytes,json:async()=>JSON.parse(bytes.toString('utf8'))};},
 async put(key,body,options){const p=resolveKey(key),exists=fs.existsSync(p);if(options?.onlyIf?.etagMatches&&(!exists||hash(fs.readFileSync(p))!==options.onlyIf.etagMatches))return null;if(options?.onlyIf?.etagDoesNotMatch==='*'&&exists)return null;const bytes=typeof body==='string'?Buffer.from(body):Buffer.from(body);fs.mkdirSync(path.dirname(p),{recursive:true});const tmp=p+'.tmp';fs.writeFileSync(tmp,bytes);fs.renameSync(tmp,p);return {etag:hash(bytes)};}
 };
}
