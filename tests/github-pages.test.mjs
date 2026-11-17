import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {fileBucket} from '../scripts/file-bucket.mjs';
test('file content storage retains state and rejects stale writes',async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'endian-test-'));try{const b=fileBucket(dir);assert.equal(await b.get('lab-content/v1.json'),null);assert.ok(await b.put('lab-content/v1.json','{"n":1}',{onlyIf:{etagDoesNotMatch:'*'}}));const first=await b.get('lab-content/v1.json');assert.deepEqual(await first.json(),{n:1});assert.ok(await b.put('lab-content/v1.json','{"n":2}',{onlyIf:{etagMatches:first.etag}}));assert.equal(await b.put('lab-content/v1.json','{"n":3}',{onlyIf:{etagMatches:first.etag}}),null);assert.deepEqual(await (await b.get('lab-content/v1.json')).json(),{n:2});await assert.rejects(()=>b.get('../escape'));}finally{fs.rmSync(dir,{recursive:true});}});
test('Pages output uses relative data URLs and contains only public files',()=>{const js=fs.readFileSync('site/app.js','utf8');assert.ok(js.includes("fetch('data/content.json'"));assert.ok(!js.includes('/api/content'));assert.ok(!js.includes('/api/latest-manuscript/figure'));assert.ok(fs.existsSync('site/data/content.json'));for(const p of ['worker','scripts','.github','.env','dist'])assert.ok(!fs.existsSync('site/'+p));assert.ok(!JSON.stringify(JSON.parse(fs.readFileSync('site/data/content.json'))).includes('OPENAI_API_KEY'));});
test('research navigation and editorial preferences survive the export',()=>{const html=fs.readFileSync('site/index.html','utf8');for(const id of ['earth-observation','oceans-climate','biogeochemistry','resource-systems']){assert.ok(html.includes('href="#'+id+'"'));assert.ok(html.includes('id="'+id+'"'));}assert.ok(!html.includes('Topical example'));assert.ok(!html.includes('manuscript-evidence'));assert.ok(html.indexOf('<h4>Weather data for resilience')<html.indexOf('<h4>Bio+Mine'));assert.ok(html.indexOf('01 / LATEST MANUSCRIPT')<html.indexOf('02 / RESEARCH'));});

test('saved updater errors and private queues cannot enter the static export',async()=>{
 const {execFileSync}=await import('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'endian-export-regression-'));
 try{
  fs.mkdirSync(path.join(dir,'web'));fs.mkdirSync(path.join(dir,'data'));
  fs.copyFileSync('web/app.js',path.join(dir,'web/app.js'));
  fs.copyFileSync('web/archive.js',path.join(dir,'web/archive.js'));
  const state=JSON.parse(fs.readFileSync('data/content.json','utf8'));
  for(const key of ['projects','latestManuscript','featuredProjects'])state[key].error='Set OPENAI_API_KEY and OPENAI_MODEL for automatic extraction and summaries.';
  state.latestManuscript.candidate={privateMarker:'private-manuscript-candidate'};
  state.latestManuscript.item.figure=null;
  state.featuredProjects.candidates=[{privateMarker:'private-featured-candidate'}];
  state.featuredProjects.failures=[{error:'OPENAI_API_KEY missing'}];
  const source=JSON.stringify(state);fs.writeFileSync(path.join(dir,'data/content.json'),source);
  execFileSync(process.execPath,[path.resolve('scripts/build-pages.mjs')],{cwd:dir});
  const raw=fs.readFileSync(path.join(dir,'site/data/content.json'),'utf8'),out=JSON.parse(raw);
  for(const marker of ['OPENAI_API_KEY','private-manuscript-candidate','private-featured-candidate'])assert.ok(!raw.includes(marker),marker);
  assert.deepEqual(out.projects.items,state.projects.items);
  assert.deepEqual(out.latestManuscript.item,state.latestManuscript.item);
  assert.deepEqual(out.featuredProjects.items,state.featuredProjects.items);
  assert.deepEqual(out.featuredProjects.archive,state.featuredProjects.archive);
  assert.equal(fs.readFileSync(path.join(dir,'data/content.json'),'utf8'),source);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
