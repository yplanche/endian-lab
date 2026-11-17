export const PUBLICATIONS_URL='https://orcid.org/0000-0002-3624-0757';
export const ORCID_WORKS_URL='https://pub.orcid.org/v3.0/0000-0002-3624-0757/works';
export const PROJECTS_URL='https://www.imperial.ac.uk/earth-science/prosp-students/phd-opportunities/project-topics/all-projects/';
export function topicFor(title){
 if(/lidar|remote sensing|satellite|earth observation|point cloud|vegetation classification|multimodal|ecosystem intelligence|illegal.*(?:resource|mining|gold)|bio\s*\+?\s*mine/i.test(title))return 'remote';
 if(/ocean|antarctic|water mass|neodymium|tsunami|coast|island|salinity minimum|supergyre/i.test(title))return 'ocean';
 if(/resource|material stock|metal cycle|industrial ecolog|sand and gravel/i.test(title)&&!/mine|rehabilitation/i.test(title))return 'resource';
 return 'chemistry';
}
export function parseImperialPublications(html){
 const found=[];
 function walk(v){if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach(walk);return;}if(typeof v.title==='string'&&v.objectTypeDisplayName&&(v.doi||v.objectId)){found.push(v);return;}Object.values(v).forEach(walk);}
 for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
  const js=match[1];if(!js.includes('self.__next_f.push'))continue;
  try{const args=JSON.parse(js.slice(js.indexOf('['),js.lastIndexOf(']')+1));if(typeof args[1]!=='string')continue;for(const line of args[1].split('\n')){const i=line.indexOf(':');if(i<0)continue;try{walk(JSON.parse(line.slice(i+1)))}catch{}}}catch{}
 }
 const records=found.filter(x=>x.doi&&x.authors?.some(a=>/plancherel/i.test(a.fullName||a.nameShortFormat||''))).map(x=>({
  title:x.title.trim(),doi:x.doi.trim().toLowerCase(),year:x.publicationDate?.year||x.date1?.year,
  date:x.publicationDate?.dateTime?.slice(0,10)||x.date1?.dateTime?.slice(0,10),type:x.objectTypeDisplayName,
  authors:x.authors.map(a=>a.nameShortFormat||a.fullName).join(', '),journal:x.journal||x.parentTitle||x.publisher||'',topic:topicFor(x.title),source:PUBLICATIONS_URL
 })).filter(x=>Number.isInteger(x.year)&&x.year>=1900&&x.year<=new Date().getFullYear()+3&&/^10\.\d{4,9}\//.test(x.doi));
 if(records.length<3)throw Error('Imperial publication format could not be validated; previous records retained.');
 return deduplicate(records);
}
function titleKey(s){return s.toLowerCase().replace(/[^a-z0-9]/g,'');}
function doiKey(s){return s.toLowerCase().replace(/\/v\d+$/,'');}
export function deduplicate(records){
 const result=[];
 for(const p of [...records].sort((a,b)=>(b.date||`${b.year}-01-01`).localeCompare(a.date||`${a.year}-01-01`))){
  const index=result.findIndex(x=>doiKey(x.doi)===doiKey(p.doi)||titleKey(x.title)===titleKey(p.title));
  if(index<0)result.push(p);else if(/preprint/i.test(result[index].type||'')&&!/preprint/i.test(p.type||''))result[index]=p;
 }
 return result.sort((a,b)=>(b.date||`${b.year}-01-01`).localeCompare(a.date||`${a.year}-01-01`));
}
export function validateProjectUpdate(args){
 if(args.source_url!==PROJECTS_URL)throw Error('Use the official Imperial project listing.');
 if(!['direct','indexed'].includes(args.retrieval_mode))throw Error('retrieval_mode must be direct or indexed.');
 if(!Array.isArray(args.projects)||args.projects.length<1||args.projects.length>30)throw Error('A non-empty, bounded project list is required; an empty retrieval cannot clear projects.');
 if(typeof args.evidence!=='string'||args.evidence.length>60000||!/plancherel/i.test(args.evidence))throw Error('Include source evidence naming Plancherel.');
 const evidence=titleKey(args.evidence);
 return args.projects.map(p=>{
  if(typeof p.title!=='string'||p.title.length<20||p.title.length>500||!evidence.includes(titleKey(p.title)))throw Error('Every project title must occur in the supplied Imperial evidence.');
  if(typeof p.supervisors!=='string'||!/plancherel/i.test(p.supervisors)||p.supervisors.length>500)throw Error('A Plancherel supervisor entry is required.');
  if(!evidence.includes(titleKey(p.supervisors)))throw Error('Supervisor entry must match supplied evidence.');
  const url=p.url||PROJECTS_URL;const u=new URL(url);if(u.protocol!=='https:'||u.hostname!=='www.imperial.ac.uk')throw Error('Project links must stay on Imperial.');
  return {title:p.title.trim(),supervisors:p.supervisors.trim(),url,topic:topicFor(p.title),availability:'listed'};
 });
}
export function mergeProjects(previous,observed,complete=false){
 const keys=new Set(observed.map(x=>titleKey(x.title)));
 return [...observed,...previous.filter(x=>!keys.has(titleKey(x.title))).map(x=>({...x,...(complete?{availability:'confirm'}:{})}))];
}
export function selectLatestArticle(records){const eligible=deduplicate(records).filter(x=>/^journal article$/i.test(x.type||'')&&!/^(?:retraction|corrigendum|erratum|correction)\b/i.test(x.title));if(!eligible.length)throw Error('No verified journal article found in the ORCID record.');return eligible[0];}
export function publicSourceUrl(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hostname==='localhost'||u.hostname.endsWith('.local')||u.hostname.endsWith('.internal')||/^[\d.]+$/.test(u.hostname)||u.hostname.includes(':')||u.hostname.includes('['))throw Error('Use a public HTTPS source URL.');return u.href;}
export function validateManuscriptUpdate(args,candidate){
 if(!candidate||typeof args.doi!=='string'||args.doi.toLowerCase()!==candidate.doi.toLowerCase())throw Error('Check the latest ORCID journal article first; the DOI must match that candidate.');
 if(typeof args.summary!=='string')throw Error('A summary is required.');const summary=args.summary.trim();const words=summary.split(/\s+/).filter(Boolean).length;if(words<50||words>100)throw Error('The summary must contain 50–100 words.');
 if(!Array.isArray(args.evidence_urls)||args.evidence_urls.length<1||args.evidence_urls.length>5)throw Error('Provide primary abstract or full-text evidence.');const evidenceUrls=args.evidence_urls.map(publicSourceUrl);
 const onlineDate=args.online_date||null;if(onlineDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(onlineDate)||!Number.isFinite(Date.parse(onlineDate))||onlineDate>new Date().toISOString().slice(0,10)))throw Error('The online publication date must be a valid date, not in the future.');
 if(candidate.date>new Date().toISOString().slice(0,10)&&!onlineDate)throw Error('A future issue date requires evidence of an already-published online date.');
 if(args.figure){const f=args.figure;for(const k of ['caption','alt','credit','license'])if(typeof f[k]!=='string'||!f[k].trim()||f[k].length>700)throw Error('Figure '+k+' is required and must be concise.');publicSourceUrl(f.source_url);if(!!f.image_url===!!f.data_base64)throw Error('Provide either an image URL or image bytes, not both.');if(f.image_url)publicSourceUrl(f.image_url);if(f.data_base64&&f.data_base64.length>4200000)throw Error('Figure exceeds size limit.');}
 return {summary,wordCount:words,evidenceUrls,onlineDate};
}

export function parseOrcidWorks(data){
 if(!Array.isArray(data?.group)||!data.path?.startsWith('/0000-0002-3624-0757/'))throw Error('Unexpected ORCID works response; previous feature retained.');
 const records=data.group.flatMap(g=>(g['work-summary']||[]).map(w=>{
 const ids=w['external-ids']?.['external-id']||[];
 const id=ids.find(x=>x['external-id-type']==='doi'&&x['external-id-relationship']==='self');
 const doi=(id?.['external-id-value']||'').replace(/^https?:\/\/(?:dx\.)?doi.org\//i,'').trim().toLowerCase();
 const d=w['publication-date'],year=Number(d?.year?.value),month=Number(d?.month?.value||1),day=Number(d?.day?.value||1);
 return {title:w.title?.title?.value?.trim(),doi,year,date:`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,type:w.type==='journal-article'?'Journal article':w.type,authors:'',journal:w['journal-title']?.value||'',topic:topicFor(w.title?.title?.value||''),source:PUBLICATIONS_URL};
 })).filter(x=>x.title&&/^10\.\d{4,9}\//.test(x.doi)&&Number.isInteger(x.year)&&x.year>=1900&&x.year<=new Date().getFullYear()+3);
 if(!records.length)throw Error('No dated DOI-bearing works found in public ORCID record.');
 return deduplicate(records);
}
