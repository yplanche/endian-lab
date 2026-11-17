import fs from 'node:fs';import worker from '../dist/server/index.js';import {fileBucket} from './file-bucket.mjs';
const waits=[];
await worker.scheduled({}, {BUCKET:fileBucket(),OPENAI_API_KEY:process.env.OPENAI_API_KEY,OPENAI_MODEL:process.env.OPENAI_MODEL}, {waitUntil:p=>waits.push(p)});
await Promise.all(waits);
const state=JSON.parse(fs.readFileSync('data/content.json','utf8'));
const lines=['## ENDIAN content checks',...['projects','latestManuscript','featuredProjects'].map(k=>`- ${k}: ${state[k].status}; last successful source check: ${state[k].lastSuccess||'not yet checked'}`)];
for(const k of ['projects','latestManuscript','featuredProjects'])if(state[k].status!=='ok'){console.warn('::warning::'+k+': '+(state[k].error||state[k].status));lines.push('- '+k+' needs attention: '+(state[k].error||state[k].status)+'. The previous verified content has been retained.');}
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
console.log(lines.join('\n'));
