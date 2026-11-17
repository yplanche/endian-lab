import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {wordcloudSVG} from '../web/wordcloud-layout.mjs';
const context=vm.createContext({});vm.runInContext(fs.readFileSync('worker/wordcloud.mjs','utf8'),context);
const work=(title,type='journal-article',doi='')=>({'work-summary':[{title:{title:{value:title}},type,'external-ids':{'external-id':doi?[{'external-id-type':'doi','external-id-value':doi}]:[]}}]});
test('wordcloud deduplicates versions, excludes notices, and counts distinct papers',()=>{
 const cloud=context.computeWordcloud({group:[work('Ocean ocean carbon'),work('Ocean ocean carbon','preprint'),work('Ocean water'),work('Correction to ocean water'),work('Retracted study'),work('Obsolete sand article','journal-article','10.3390/resources11040038')]});
 assert.equal(cloud.paperCount,2);assert.equal(cloud.terms.find(t=>t.term==='ocean').count,2);assert.equal(cloud.terms.find(t=>t.term==='carbon').count,1);
 const next=context.computeWordcloud({group:[work('Ocean ocean carbon'),work('Ocean water'),work('Ocean salinity')]});assert.equal(next.paperCount,3);assert.equal(next.terms.find(t=>t.term==='ocean').count,3);
 assert.throws(()=>context.computeWordcloud({group:[]}));assert.throws(()=>context.computeWordcloud({'orcid-identifier':{path:'wrong'},group:[work('Ocean')]}));
});
test('wordcloud SVG is deterministic, escapes terms and has accessible description',()=>{
 const terms=[{term:'ocean',count:5},{term:'carbon',count:3},{term:'<script>',count:1}];const svg=wordcloudSVG(terms);assert.equal(svg,wordcloudSVG(terms));assert.ok(svg.includes('aria-labelledby'));assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));
});
test('static wordcloud exports no internal failures and keeps source counts',()=>{
 const source=JSON.parse(fs.readFileSync('data/wordcloud.json')),out=JSON.parse(fs.readFileSync('site/data/wordcloud.json'));
 assert.equal(out.paperCount,source.paperCount);assert.deepEqual(out.terms,source.terms);assert.ok(!('error' in out));assert.ok(!('papers' in out));assert.ok(fs.existsSync('site/assets/research-wordcloud.svg'));
});
