const FEATURE_THEMES=['remote','ocean','chemistry','resource'];
function articleRecords(records){return deduplicate(records).filter(x=>/^journal article$/i.test(x.type||'')&&!/^(?:retraction|corrigendum|erratum|correction)\b/i.test(x.title));}
function mergeFeatured(state,item){
 const active=state.items.filter(x=>x.doi!==item.doi),archive=state.archive.filter(x=>x.doi!==item.doi);active.push(item);
 const theme=active.filter(x=>x.theme===item.theme).sort((a,b)=>(b.onlineDate||b.date||'').localeCompare(a.onlineDate||a.date||''));
 const keep=new Set(theme.slice(0,2).map(x=>x.id));
 const removed=active.filter(x=>x.theme===item.theme&&!keep.has(x.id));
 return {...state,items:active.filter(x=>x.theme!==item.theme||keep.has(x.id)),archive:[...archive,...removed.map(x=>({...x,archivedAt:new Date().toISOString()}))],processedDois:[...new Set([...state.processedDois,item.doi])],candidates:state.candidates.filter(x=>x.doi!==item.doi),failures:(state.failures||[]).filter(x=>x.doi!==item.doi)};
}
async function checkFeaturedProjects(env){try{
 const r=await fetch(ORCID_WORKS_URL,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('ORCID returned HTTP '+r.status);
 const text=await r.text();if(text.length>3000000)throw Error('ORCID response too large.');const records=articleRecords(parseOrcidWorks(JSON.parse(text)));
 const now=new Date().toISOString();const state=await changeState(env,d=>{const f=d.featuredProjects;return {...d,featuredProjects:{...f,candidates:records.filter(x=>!f.processedDois.includes(x.doi)),lastAttempt:now,lastSuccess:now,status:'ok',error:null}}});
 return {ok:true,candidates:state.featuredProjects.candidates,activeCounts:Object.fromEntries(FEATURE_THEMES.map(t=>[t,state.featuredProjects.items.filter(x=>x.theme===t).length])),archivedCount:state.featuredProjects.archive.length,lastSuccess:now};
 }catch(e){await recordFeaturedFailure(env,{reason:String(e.message).slice(0,400)});return {ok:false,error:String(e.message),retainedPreviousFeatures:true};}}
async function recordFeaturedFailure(env,args){if(typeof args.reason!=='string'||!args.reason.trim()||args.reason.length>400)throw Error('A short failure reason is required.');await changeState(env,d=>({...d,featuredProjects:{...d.featuredProjects,lastAttempt:new Date().toISOString(),status:'needs_review',error:args.reason,failures:[...(d.featuredProjects.failures||[]).filter(x=>x.doi!==args.doi),{doi:args.doi||null,reason:args.reason,date:new Date().toISOString()}].slice(-100)}}));return {ok:true,retainedPreviousFeatures:true};}
function validateFeatured(args,candidate){
 if(!candidate||args.doi?.toLowerCase()!==candidate.doi)throw Error('Check ORCID first; DOI must match a pending journal article.');
 if(!FEATURE_THEMES.includes(args.theme))throw Error('Unknown research theme.');
 if(typeof args.reason!=='string'||args.reason.trim().length<30||args.reason.length>700)throw Error('Explain theme choice using the paper content.');
 if(typeof args.confidence!=='number'||args.confidence<0.75||args.confidence>1)throw Error('Ambiguous classification requires review; retain existing features.');
 const summary=args.description?.trim(),n=summary?.split(/\s+/).length;if(!n||n<30||n>100)throw Error('Featured description must contain 30–100 words.');
 if(typeof args.source_text!=='string'||args.source_text.trim().length<200||args.source_text.length>80000)throw Error('Supply the actual primary abstract/full-text excerpt used for analysis.');
 const v=validateManuscriptUpdate({doi:args.doi,summary:Array(50).fill('evidence').join(' '),evidence_urls:args.evidence_urls,online_date:args.online_date},candidate);
 return {id:'doi:'+candidate.doi,doi:candidate.doi,theme:args.theme,title:candidate.title,description:summary,url:'https://doi.org/'+candidate.doi,meta:[candidate.journal,candidate.year].filter(Boolean).join(' · '),date:candidate.date,onlineDate:v.onlineDate,reason:args.reason,confidence:args.confidence,evidenceUrls:v.evidenceUrls,updatedAt:new Date().toISOString()};
}
async function publishFeaturedProject(env,args){const state=await changeState(env,d=>{const candidate=d.featuredProjects.candidates.find(x=>x.doi===args.doi?.toLowerCase());const item=validateFeatured(args,candidate);return {...d,featuredProjects:{...mergeFeatured(d.featuredProjects,item),status:mergeFeatured(d.featuredProjects,item).failures.length?'needs_review':'ok',error:null,lastPublished:new Date().toISOString()}}});return {ok:true,doi:args.doi,active:state.featuredProjects.items.some(x=>x.doi===args.doi),activeCounts:Object.fromEntries(FEATURE_THEMES.map(t=>[t,state.featuredProjects.items.filter(x=>x.theme===t).length])),archivedCount:state.featuredProjects.archive.length};}
function publicFeatured(f){if(!f)return null;const clean=({sourceText,...item})=>item;return {...f,items:f.items.map(clean),archive:f.archive.map(clean),candidates:undefined,processedDois:undefined,failures:undefined};}
const featuredTools=[
{name:'check_featured_projects',description:'Check all public ORCID journal articles against the installation baseline and processed DOIs. Returns every pending paper, not only the latest. Analyse each actual abstract/full text before classification; failures preserve features.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
{name:'publish_featured_project',description:'Create one featured study from a checked pending ORCID article after reading primary paper content. Choose its primary scientific theme with reason and confidence >=0.75. Keep two newest studies by online/publication date in that theme, archive overflow, and deduplicate DOI atomically.',inputSchema:{type:'object',properties:{doi:{type:'string'},theme:{enum:FEATURE_THEMES},description:{type:'string',maxLength:2200},reason:{type:'string',maxLength:700},confidence:{type:'number',minimum:0.75,maximum:1},source_text:{type:'string',maxLength:80000},evidence_urls:{type:'array',minItems:1,maxItems:5,items:{type:'string'}},online_date:{type:'string'}},required:['doi','theme','description','reason','confidence','source_text','evidence_urls'],additionalProperties:false}},
{name:'record_featured_project_failure',description:'Record source, analysis or ambiguous classification failure. Preserve all current features; pending DOI will be retried on the next check.',inputSchema:{type:'object',properties:{doi:{type:'string'},reason:{type:'string',maxLength:400}},required:['reason'],additionalProperties:false}}
];
