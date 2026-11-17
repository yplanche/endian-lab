import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
const file='data/wordcloud.json',previous=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null;
try{
 const r=await fetch('https://pub.orcid.org/v3.0/0000-0002-3624-0757/works',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('ORCID returned HTTP '+r.status);
 const text=await r.text();if(text.length>3000000)throw Error('ORCID response too large');
 const context=vm.createContext({});vm.runInContext(fs.readFileSync('worker/wordcloud.mjs','utf8'),context);
 const cloud=context.computeWordcloud(JSON.parse(text));
 cloud.digest=crypto.createHash('sha256').update(JSON.stringify(cloud.papers)).digest('hex');
 const now=new Date().toISOString(),changed=previous?.digest!==cloud.digest||previous?.version!==cloud.version;
 const result={...(changed?cloud:previous),status:'ok',lastAttempt:now,lastSuccess:now,error:null,generatedAt:changed?now:previous.generatedAt};
 fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');console.log(`Word cloud: ${result.paperCount} papers; ${changed?'recomputed':'unchanged'}; no OpenAI usage.`);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`\n- wordcloud: ok; ${result.paperCount} papers; ${changed?'recomputed':'unchanged'}; no OpenAI usage.\n`);
}catch(e){
 console.warn('::warning::Word cloud: '+e.message+'; previous cloud retained.');
 if(previous)fs.writeFileSync(file,JSON.stringify({...previous,status:'source_unavailable',lastAttempt:new Date().toISOString(),error:e.message},null,2)+'\n');
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'\n- wordcloud: source unavailable; previous cloud retained.\n');
 if(!previous)process.exitCode=1;
}
